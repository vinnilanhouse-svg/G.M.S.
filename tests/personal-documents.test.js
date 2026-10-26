import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
import { createPersonalRecords } from '../src/personal-records.js';
import { appendReportSources, fieldReportsKey, newFieldReport, parseFieldReport, reportSources, serializeFieldReport, validateFieldReport } from '../src/field-report-model.js';
import { createFieldReportPdf, readFieldReportPdf, reportTextLines } from '../src/field-report-pdf.js';
import { documentHighlightsKey, highlightRangesOverlap, resolveDocumentHighlight, validateDocumentHighlight } from '../src/document-highlights-model.js';
import { newPersonalCredential, validatePersonalCredential } from '../src/personal-credential-model.js';

const memory = () => { const data = new Map(); return { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) }; };
const mission = { id: 'missao-ultimo-sinal', code: 'MIS-568', title: 'Último Sinal' };

test('relatórios preservam alterações independentes de outra aba e recusam sobrescrever o mesmo campo', () => {
  const storage = memory(); const a = createPersonalRecords(fieldReportsKey, validateFieldReport, storage); const b = createPersonalRecords(fieldReportsKey, validateFieldReport, storage);
  const item = a.add(newFieldReport({ mission, author: 'Agente de campo' }));
  b.update(item.id, { findings: 'Vestígios verificados.' }, { findings: '' });
  a.update(item.id, { account: 'Retorno registrado.' }, { account: '' });
  assert.equal(a.items[0].findings, 'Vestígios verificados.');
  assert.throws(() => b.update(item.id, { account: 'Texto antigo.' }, { account: '' }), /outra aba/);
  const exported = serializeFieldReport(a.items[0]); assert.deepEqual(parseFieldReport(exported), a.items[0]);
  const changed = a.update(item.id, { title: 'Outra versão' }); assert.throws(() => b.remove(item.id, item), /outra aba/);
  assert.equal(b.reload()[0].title, changed.title);
  const blocked = createPersonalRecords(fieldReportsKey, validateFieldReport, { getItem() { throw new Error(); }, setItem() { throw new Error(); } });
  blocked.add(item); blocked.update(item.id, { conclusion: 'Cópia na sessão.' }); blocked.reload();
  assert.equal(blocked.persisted, false); assert.equal(blocked.items[0].conclusion, 'Cópia na sessão.');
});

test('o montador copia apenas os registros selecionados da missão e não expõe fichas ocultas ou lixeira', () => {
  const publicRecord = { id: 'ordem', title: 'Ordem de missão', code: 'MIS-568' }; const hidden = { id: 'oculto', title: 'Nome sigiloso', code: 'AGT-RES-090', unlisted: true };
  const state = { notes: [{ id: 'n1', missionId: mission.id, title: 'Vestígio', body: 'Relato completo.', illustrations: ['planeta-terra'] }, { id: 'n2', missionId: 'outra', title: 'Outra missão' }], documents: [{ id: 'd1', missionId: mission.id, recordId: 'ordem', body: 'Observação.' }, { id: 'd2', missionId: mission.id, recordId: 'oculto', body: 'Não expor.' }], people: [{ id: 'p1', missionId: mission.id, name: 'Contato', recordId: 'oculto', body: 'Observação pessoal.' }], localities: [], trash: [{ note: { title: 'Excluída' } }] };
  const sources = reportSources(state, [publicRecord, hidden], mission.id);
  assert.equal(sources.length, 3); assert.match(sources[0].text, /Relato completo/); assert.match(sources[0].text, /Planeta Terra/);
  const text = appendReportSources('Texto existente.', sources);
  assert.match(text, /^Texto existente\.\n\n/); assert.match(text, /MIS-568/); assert.doesNotMatch(text, /Nome sigiloso|AGT-RES|Outra missão|Excluída|Não expor/);
  assert.throws(() => appendReportSources('x'.repeat(19999), sources), /20.000/);
});

test('PDF institucional mantém texto longo e Unicode, aceita edições externas e recusa modelos incompatíveis', async () => {
  const report = newFieldReport({ mission, author: 'Ирина — Agente' });
  report.account = ('Uma observação detalhada sobre o retorno da equipe.\nSegunda linha: evidência nº 7.\n\n').repeat(90);
  report.findings = 'TermoSemEspaços'.repeat(80); report.conclusion = 'Sem confirmação. Aguardando investigação.';
  const bytes = await createFieldReportPdf(report, { getFont: () => readFile(new URL('../public/agent-sheet/DejaVuSerif.ttf', import.meta.url)), getLogo: () => readFile(new URL('../src/assets/gms-logo.png', import.meta.url)) });
  assert.deepEqual(await readFieldReportPdf(bytes), report);
  const document = await PDFDocument.load(bytes); assert.ok(document.getPageCount() > 3);
  const form = document.getForm(); form.getTextField('gms_author_0').setText('Agente editado no leitor');
  const next = await readFieldReportPdf(await document.save({ updateFieldAppearances: false }));
  assert.equal(next.author, 'Agente editado no leitor'); assert.equal(next.account, report.account);
  form.removeField(form.getTextField('gms_conclusion_0'));
  const incomplete = await document.save({ updateFieldAppearances: false });
  await assert.rejects(() => readFieldReportPdf(incomplete), /PDF/);
  const incompatible = await PDFDocument.create(); incompatible.addPage();
  const incompatibleBytes = await incompatible.save();
  await assert.rejects(() => readFieldReportPdf(incompatibleBytes), /PDF/);
  assert.equal(reportTextLines(report.account, text => text.length, 45).join(''), report.account);
});

test('grifos mantêm referência exata, recuperam deslocamento inequívoco e preservam trechos sem correspondência', () => {
  const now = new Date().toISOString(); const text = 'Antes do registro, a equipe partiu. Depois, silêncio.';
  const quote = 'a equipe partiu'; const start = text.indexOf(quote);
  const item = validateDocumentHighlight({ id: 'h1', recordId: 'arquivo', createdAt: now, updatedAt: now, block: 'relatorio:0', quote, start, end: start + quote.length, prefix: text.slice(0, start), suffix: text.slice(start + quote.length), comment: 'Conferir horário.', tone: 'duvida' });
  assert.deepEqual(resolveDocumentHighlight(text, item), { start, end: start + quote.length });
  assert.deepEqual(resolveDocumentHighlight('Introdução. ' + text, item), { start: start + 12, end: start + 12 + quote.length });
  assert.equal(resolveDocumentHighlight('O texto foi completamente reescrito.', item), null);
  assert.equal(resolveDocumentHighlight('a equipe partiu. a equipe partiu.', { ...item, start: 200, end: 215, prefix: '', suffix: '' }), null);
  assert.equal(highlightRangesOverlap({ start: 0, end: 5 }, { start: 5, end: 10 }), false);
  const storage = memory(); const store = createPersonalRecords(documentHighlightsKey, validateDocumentHighlight, storage); store.add(item); store.reload(); assert.equal(store.items[0].comment, 'Conferir horário.');
});

test('credencial usa identidade da ficha sem alterar a ficha ou conceder acesso e valida o retrato', () => {
  const item = newPersonalCredential({ nome: 'Agente Nilo', especie: 'Abissal', cargo: 'Investigador' }, 'Outro nome');
  assert.equal(item.name, 'Agente Nilo'); assert.equal(item.species, 'Abissal'); assert.match(item.registry, /^AGT-\d{4}$/);
  assert.equal(Object.hasOwn(item, 'access'), false); assert.equal(Object.hasOwn(item, 'credentials'), false);
  assert.throws(() => validatePersonalCredential({ ...item, photo: 'https://example.com/retrato.svg' }), /imagem/);
  assert.throws(() => validatePersonalCredential({ ...item, photo: 'data:image/svg+xml,<svg></svg>' }), /imagem/);
});
