import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fieldReportFormat, parseFieldReport, reportFields, reportSections, validateFieldReport } from './field-report-model.js';

const paper = rgb(.965, .957, .922), ink = rgb(.12, .15, .12), olive = rgb(.30, .35, .26);
const fontUrl = '/agent-sheet/DejaVuSerif.ttf';
async function fetchBytes(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Não foi possível carregar os elementos do documento. Tente novamente.');
  return new Uint8Array(await response.arrayBuffer());
}

// A divisão guarda os próprios trechos do texto, incluindo espaços e quebras.
// Assim, reunir os campos do PDF restaura o conteúdo completo, sem resumos.
export function reportTextLines(text, measure, width) {
  const result = []; let start = 0;
  while (start < text.length) {
    let end = start, lastSpace = -1;
    while (end < text.length && text[end] !== '\n') {
      const point = text.codePointAt(end); const next = end + (point > 0xffff ? 2 : 1);
      if (measure(text.slice(start, next)) > width && end > start) break;
      if (/\s/u.test(text.slice(end, next))) lastSpace = next;
      end = next;
    }
    if (text[end] === '\n') end++;
    else if (end < text.length && lastSpace > start) end = lastSpace;
    if (end <= start) end = start + 1;
    result.push(text.slice(start, end)); start = end;
  }
  return result.length ? result : [''];
}

export async function createFieldReportPdf(input, { getFont = () => fetchBytes(fontUrl), getLogo } = {}) {
  const report = validateFieldReport(input);
  const document = await PDFDocument.create(); document.registerFontkit(fontkit);
  // A fonte completa permite continuar preenchendo o documento em outro leitor.
  const font = await document.embedFont(await getFont(), { subset: false });
  const mono = await document.embedFont(StandardFonts.Courier);
  const logo = getLogo ? await document.embedPng(await getLogo()) : null;
  const supported = new Set(font.getCharacterSet());
  if (Object.values(report).some(value => typeof value === 'string' && [...value].some(char => !['\n', '\r', '\t'].includes(char) && !supported.has(char.codePointAt(0))))) throw new Error('O relatório contém um símbolo que a fonte do documento não representa. Remova emojis ou guarde uma cópia em JSON.');
  const form = document.getForm(); const mapping = {};
  let page, y; const pages = []; const left = 46, width = 503;
  function nextPage() {
    page = document.addPage([595.28, 841.89]); pages.push(page);
    page.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: paper });
    page.drawRectangle({ x: 27, y: 30, width: 541.28, height: 781.89, borderColor: olive, borderWidth: .6 });
    if (logo) page.drawImage(logo, { x: left, y: 739, width: 64, height: 64 });
    else { page.drawRectangle({ x: left, y: 748, width: 60, height: 48, borderColor: olive, borderWidth: 1 }); page.drawText('GMS', { x: left + 10, y: 766, font: mono, size: 20, color: ink }); }
    page.drawText('G.M.S.', { x: 124, y: 782, font, size: 20, color: ink });
    page.drawText('GLOBAL MONSTER SECURITY', { x: 124, y: 765, font: mono, size: 9, color: olive });
    page.drawText('DEPARTAMENTO DE DOCUMENTACAO E MEMORIA', { x: 124, y: 750, font: mono, size: 7, color: olive });
    page.drawLine({ start: { x: left, y: 729 }, end: { x: 549, y: 729 }, color: olive, thickness: 1.3 });
    page.drawText('RELATORIO DE CAMPO / REGISTRO OPERACIONAL', { x: left, y: 713, font: mono, size: 8, color: ink });
    y = 689;
  }
  nextPage();
  function chunkField(key, value, x, top, fieldWidth, lines, index, size = 11) {
    const name = `gms_${key}_${index}`;
    const field = form.createTextField(name); field.enableMultiline(); field.setText(value);
    field.addToPage(page, { x, y: top - lines * 16 - 7, width: fieldWidth, height: lines * 16 + 9, borderWidth: 0, backgroundColor: paper, textColor: ink, font });
    field.setFontSize(size); field.updateAppearances(font);
    (mapping[key] ||= []).push(name);
  }
  function flowing(key) {
    const label = reportFields[key][0]; const lines = reportTextLines(report[key], text => font.widthOfTextAtSize(text.replace(/[\n\r\t]/g, ''), 11), width - 12);
    let offset = 0, index = 0;
    do {
      if (y < 130) nextPage();
      page.drawText(`${label}${index ? ' (continuação)' : ''}`, { x: left, y, font, size: 10, color: olive });
      page.drawLine({ start: { x: left, y: y - 7 }, end: { x: 549, y: y - 7 }, color: olive, thickness: .35 });
      y -= 21;
      const count = Math.max(1, Math.min(lines.length - offset, Math.floor((y - 86) / 16)));
      chunkField(key, lines.slice(offset, offset + count).join(''), left, y, width, count, index++);
      y -= count * 16 + 29; offset += count;
    } while (offset < lines.length);
  }
  // Todos estes campos continuam editáveis no leitor de PDF. A matrícula e a
  // assinatura são identificações narrativas, sem assinatura digital simulada.
  for (const key of ['code', 'title']) flowing(key);
  const pairs = [['author', 'registry'], ['date', 'access'], ['department', 'status']];
  for (const pair of pairs) {
    const lineSets = pair.map(key => reportTextLines(report[key], text => font.widthOfTextAtSize(text.replace(/[\n\r\t]/g, ''), 11), 231));
    const count = Math.max(...lineSets.map(lines => lines.length));
    if (y - count * 16 - 40 < 85) nextPage();
    pair.forEach((key, index) => {
      const x = left + index * 260;
      page.drawText(reportFields[key][0], { x, y, font, size: 9, color: olive });
      chunkField(key, report[key], x, y - 20, 243, count, 0);
    });
    y -= 16 * count + 48;
  }
  for (const key of ['mission', 'team', 'location', ...reportSections.map(([key]) => key), 'signature']) flowing(key);
  const meta = form.createTextField('GMS_REPORT_META');
  meta.setText(JSON.stringify({ format: fieldReportFormat, version: 1, report, mapping })); meta.enableReadOnly();
  pages.forEach((item, index) => {
    item.drawLine({ start: { x: left, y: 61 }, end: { x: 549, y: 61 }, color: olive, thickness: .4 });
    item.drawText('GMS / ARQUIVO CENTRAL / REGISTRO PESSOAL', { x: left, y: 47, font: mono, size: 7, color: olive });
    item.drawText(`${String(index + 1).padStart(2, '0')} / ${String(pages.length).padStart(2, '0')}`, { x: 503, y: 47, font: mono, size: 8, color: ink });
  });
  document.setTitle(report.title); document.setAuthor(report.author); document.setSubject('Relatório institucional da G.M.S.'); document.setCreator('Arquivo GMS');
  return document.save();
}

// Só campos de texto são lidos; ações, links e JavaScript do arquivo não são executados.
export async function readFieldReportPdf(bytes) {
  if (bytes.byteLength > 12 * 1024 * 1024) throw new Error('Selecione um PDF de relatório com até 12 MB.');
  let document;
  try { document = await PDFDocument.load(bytes, { updateMetadata: false }); } catch { throw new Error('Não foi possível abrir o PDF. Use um relatório editável da GMS, sem senha.'); }
  const form = document.getForm(); let meta;
  try { const raw = form.getTextField('GMS_REPORT_META').getText(); if (raw.length > 2 * 1024 * 1024) throw new Error(); meta = JSON.parse(raw); } catch { throw new Error('Este PDF não é um relatório editável exportado pelo Arquivo GMS. PDFs digitalizados ou achatados não podem ser importados.'); }
  const report = parseFieldReport(JSON.stringify(meta));
  const keys = Object.keys(reportFields).filter(key => key !== 'missionId');
  if (!meta.mapping || Object.keys(meta.mapping).length !== keys.length) throw new Error('O PDF está incompleto: faltam campos do relatório.');
  for (const key of keys) {
    const names = meta.mapping[key];
    if (!Array.isArray(names) || !names.length || names.length > 1000 || names.some((name, index) => name !== `gms_${key}_${index}`)) throw new Error('O PDF contém campos incompatíveis.');
    try { report[key] = names.map(name => form.getTextField(name).getText() || '').join('').replace(/\r\n?/g, '\n'); } catch { throw new Error('O PDF está incompleto: restaure os campos editáveis antes de importar.'); }
  }
  return validateFieldReport(report);
}
