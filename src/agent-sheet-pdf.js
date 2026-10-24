import { PDFDocument, PDFName, PDFBool, PDFNumber, PDFDict, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { agentSheetFields } from './agent-sheet-schema.js';
import { agentSheetBackupFormat, calculateAgentSheet, editableAgentSheetFields, parseAgentSheet } from './agent-sheet-model.js';

export const maxAgentSheetPdfBytes = 64 * 1024 * 1024;
const templateUrl = '/agent-sheet/Ficha_Monstrao_Automatica_Editavel.pdf';
const fallbackFontUrl = '/agent-sheet/DejaVuSerif.ttf';
let template;
let fallback;

async function fetchBytes(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Não foi possível carregar o modelo original da ficha. Tente novamente.');
  return new Uint8Array(await response.arrayBuffer());
}
function templateBytes() {
  template ||= fetchBytes(templateUrl).catch(error => { template = null; throw error; });
  return template;
}
function fontBytes() {
  fallback ||= fetchBytes(fallbackFontUrl).catch(error => { fallback = null; throw error; });
  return fallback;
}
function normalizedFields(fields) {
  return parseAgentSheet(JSON.stringify({ format: agentSheetBackupFormat, version: 1, fields }));
}
function checkForm(document, form) {
  if (document.getPageCount() !== 3 || editableAgentSheetFields.some(name => !form.getFieldMaybe(name))) throw new Error('Este PDF não contém todos os campos editáveis da ficha Monstrão fornecida. Importe o PDF editável, sem transformar as páginas em imagens.');
}

// Apenas os valores dos campos são lidos. JavaScript do PDF importado não é executado.
export async function importAgentSheetPdf(bytes) {
  if (bytes.byteLength > maxAgentSheetPdfBytes) throw new Error('Selecione um PDF de ficha com até 64 MB.');
  let document;
  try { document = await PDFDocument.load(bytes, { updateMetadata: false }); }
  catch { throw new Error('Não foi possível abrir este PDF. Use uma ficha editável sem senha.'); }
  const form = document.getForm(); checkForm(document, form);
  const fields = {};
  for (const name of editableAgentSheetFields) {
    const spec = agentSheetFields[name];
    const field = form.getField(name);
    if (spec.type === 'choice') fields[name] = field.getSelected?.()[0] ?? spec.defaultValue;
    else {
      const raw = document.context.lookup(field.acroField.dict.get(PDFName.of('V')));
      fields[name] = raw instanceof PDFNumber ? String(raw.asNumber()) : field.getText?.() ?? spec.defaultValue;
    }
  }
  return normalizedFields(fields);
}

// O próprio arquivo enviado é o modelo. As páginas, desenhos, scripts e campos
// permanecem no PDF; os gráficos trocam só de estado, sem redesenhar os ícones.
export async function fillAgentSheetPdf(originalBytes, input, { getFallbackFont = fontBytes } = {}) {
  const fields = normalizedFields(input);
  const values = calculateAgentSheet(fields);
  const document = await PDFDocument.load(originalBytes, { updateMetadata: false });
  const form = document.getForm(); checkForm(document, form);
  const regular = await document.embedFont(StandardFonts.TimesRoman);
  const bold = await document.embedFont(StandardFonts.TimesRomanBold);
  let unicode;
  async function fontFor(text, field) {
    let appearance = '';
    const appearances = [];
    // O modelo grava /DA com escapes octais. Decodifique antes de atualizar
    // a aparência para manter tamanho, cor e fonte originais de cada campo.
    for (const widget of field.acroField.getWidgets()) {
      const raw = widget.dict.lookup(PDFName.of('DA'));
      if (raw?.decodeText) { const decoded = raw.decodeText(); widget.setDefaultAppearance(decoded); appearances.push([widget, decoded]); appearance ||= decoded; }
      if (!field.acroField.dict.has(PDFName.of('Q')) && widget.dict.has(PDFName.of('Q'))) field.acroField.dict.set(PDFName.of('Q'), widget.dict.get(PDFName.of('Q')));
    }
    const selected = /\/(TiBo|Times-Bold)\s/.test(appearance) ? bold : regular;
    try { selected.encodeText(text.replace(/[\n\r\t]/g, '')); return { font: selected, appearances }; } catch {}
    if (!unicode) { document.registerFontkit(fontkit); unicode = await document.embedFont(await getFallbackFont(), { subset: true }); }
    const supported = new Set(unicode.getCharacterSet());
    if ([...text].some(char => !['\n', '\r', '\t'].includes(char) && !supported.has(char.codePointAt(0)))) throw new Error('A ficha contém um caractere que a fonte do PDF não representa. Confira símbolos e emojis nos textos ou guarde uma cópia em JSON.');
    const resources = form.acroForm.dict.lookup(PDFName.of('DR'), PDFDict).lookup(PDFName.of('Font'), PDFDict);
    resources.set(PDFName.of(unicode.name), unicode.ref);
    return { font: unicode, appearances: [] };
  }
  async function updateAppearance(field, text) {
    const { font, appearances } = await fontFor(text, field);
    field.updateAppearances(font);
    // Mantém /Time e /TiBo para futuras edições no leitor, usando os recursos
    // originais do AcroForm; o fluxo de aparência atual já referencia sua fonte.
    for (const [widget, appearance] of appearances) widget.setDefaultAppearance(appearance);
  }
  for (const [name, spec] of Object.entries(agentSheetFields)) {
    const field = form.getField(name);
    const value = values[name];
    if (spec.type === 'graphic') {
      field.acroField.setValue(PDFName.of(value));
    } else if (spec.type === 'choice') {
      if (field.getSelected()[0] !== value) { field.select(value); await updateAppearance(field, value); }
    } else if ((field.getText() ?? '') !== value) {
      field.setText(value); await updateAppearance(field, value);
    }
  }
  form.acroForm.dict.set(PDFName.of('NeedAppearances'), PDFBool.False);
  return document.save({ useObjectStreams: false, updateFieldAppearances: false, addDefaultPage: false });
}

export async function exportAgentSheetPdf(fields, onStatus = () => {}) {
  onStatus('Carregando o PDF original da ficha…');
  const source = await templateBytes();
  onStatus('Preenchendo os campos e os gráficos do PDF original…');
  return fillAgentSheetPdf(source, fields);
}
