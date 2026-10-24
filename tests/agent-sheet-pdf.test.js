import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { PDFArray, PDFDocument, PDFName, PDFNumber } from 'pdf-lib';
import { agentSheetFields, agentSheetSource } from '../src/agent-sheet-schema.js';
import { calculateAgentSheet, createAgentSheetStore } from '../src/agent-sheet-model.js';
import { fillAgentSheetPdf, importAgentSheetPdf } from '../src/agent-sheet-pdf.js';

const originalBytes = await readFile(new URL('../public/agent-sheet/Ficha_Monstrao_Automatica_Editavel.pdf', import.meta.url));
const original = await PDFDocument.load(originalBytes, { updateMetadata: false });
const originalForm = original.getForm();
function pageContents(document) {
  return document.getPages().map(page => {
    const contents = page.node.Contents();
    return (contents instanceof PDFArray ? contents.asArray() : [contents]).map(value => Buffer.from(document.context.lookup(value).getContents()).toString('base64'));
  });
}
function graphicAppearances(document, name) {
  return document.getForm().getField(name).acroField.getWidgets().map(widget => {
    const appearances = widget.getNormalAppearance();
    return appearances.entries().map(([state, stream]) => [state.toString(), Buffer.from(document.context.lookup(stream).getContents()).toString('base64')]);
  });
}
function actions(document, field) {
  const value = document.getForm().getField(field).acroField.dict.lookup(PDFName.of('AA'));
  return value?.entries().map(([key, ref]) => [key.toString(), document.context.lookup(ref).lookup(PDFName.of('JS')).decodeText()]);
}

test('o modelo publicado é exatamente o arquivo fornecido, identificado pelo SHA-256', () => {
  assert.equal(createHash('sha256').update(originalBytes).digest('hex'), agentSheetSource.sha256);
  assert.equal(original.getPageCount(), 3);
  assert.equal(originalForm.getFields().length, 286);
});

test('exportar e importar o PDF mantém páginas, arte, campos, scripts e valores do personagem', async () => {
  const fields = createAgentSheetStore().state.fields;
  Object.assign(fields, { nome: 'Zé Teixeira', jogador: 'Vinícius', especie: 'Constructo de Metal', especialidade: 'Investigador', nivel: '7', attr_corpo: '9', attr_coracao: '6', habilidade_11_nome: 'Última habilidade', habilidade_11_descricao: 'Descrição com ação.\nSegunda linha.', ataque_11_dano: '2d6 + Corpo', item_26_nome: 'Relíquia', item_26_peso: '2.5', historia: 'História do personagem.\nÚltimo parágrafo.' });
  const exported = await fillAgentSheetPdf(originalBytes, fields);
  const imported = await importAgentSheetPdf(exported);
  assert.deepEqual(imported, fields);
  const document = await PDFDocument.load(exported, { updateMetadata: false });
  const form = document.getForm();
  assert.equal(document.getPageCount(), 3);
  assert.deepEqual(pageContents(document), pageContents(original), 'o conteúdo gráfico das páginas originais não é reconstruído');
  assert.equal(form.getFields().length, 286);
  assert.equal(form.acroForm.dict.lookup(PDFName.of('CO')).size(), 63);
  const calculated = calculateAgentSheet(fields);
  for (const [name, spec] of Object.entries(agentSheetFields)) {
    const field = form.getField(name);
    const value = spec.type === 'graphic' ? field.getSelected() : spec.type === 'choice' ? field.getSelected()[0] : field.getText() ?? '';
    assert.equal(value, calculated[name], name);
    assert.equal(field.acroField.getFlags(), originalForm.getField(name).acroField.getFlags(), name);
    assert.deepEqual(actions(document, name), actions(original, name), name);
    if (spec.type === 'graphic') assert.deepEqual(graphicAppearances(document, name), graphicAppearances(original, name), `${name}: desenhos preservados`);
  }
  const attrAppearance = form.getTextField('attr_corpo').acroField.getWidgets()[0].getDefaultAppearance();
  assert.match(attrAppearance, /TiBo 18 Tf/);
  assert.match(attrAppearance, /\.788235 \.294118 \.27451 rg/);
});

test('a importação lê entradas preenchidas fora do site e recalcula totais em cache', async () => {
  const external = await PDFDocument.load(originalBytes, { updateMetadata: false });
  const form = external.getForm();
  form.getTextField('nome').setText('Agente de arquivo externo');
  form.getDropdown('especie').select('Leprechaun');
  form.getTextField('nivel').acroField.dict.set(PDFName.of('V'), PDFNumber.of(4));
  form.getTextField('attr_corpo').setText('5');
  form.getTextField('per_g30_base').setText('7');
  const imported = await importAgentSheetPdf(await external.save({ updateFieldAppearances: false }));
  const computed = calculateAgentSheet(imported);
  assert.equal(imported.nome, 'Agente de arquivo externo');
  assert.equal(imported.nivel, '4');
  assert.equal(computed.vida_max, '34');
  assert.equal(computed.per_g30_total, '12');
});

test('textos Unicode são preservados e o importador recusa PDFs sem o formulário original', async () => {
  const fields = createAgentSheetStore().state.fields;
  fields.nome = 'Ирина';
  const exported = await fillAgentSheetPdf(originalBytes, fields, { getFallbackFont: () => readFile(new URL('../public/agent-sheet/DejaVuSerif.ttf', import.meta.url)) });
  assert.equal((await importAgentSheetPdf(exported)).nome, 'Ирина');
  const incompatible = await PDFDocument.create(); for (let index = 0; index < 3; index++) incompatible.addPage();
  await assert.rejects(importAgentSheetPdf(await incompatible.save()), /campos editáveis/);
});
