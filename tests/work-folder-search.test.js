import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkFolder } from '../src/work-folder.js';
import { cleanFolderTags, folderSearchExcerpt, folderTagOptions, parseFolderTags, searchWorkFolder } from '../src/work-folder-search.js';
import { parseWorkFolderBackup, serializeWorkFolderBackup, workFolderReadableText } from '../src/work-folder-backup.js';
import { clampEvidenceZoom, evidenceViewBounds, fitEvidenceZoom } from '../src/evidence-viewport.js';
const disk = () => { const data = new Map(); return { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value) }; };
const records = [
  { id: 'missao-561', title: 'Operação Sol Velado', code: 'MIS-561' },
  { id: 'relatorio-561', title: 'Relatório da Vigília', code: 'REL-561-001' },
  { id: 'secreto', title: 'Nome que deve permanecer invisível', code: 'RES-989', unlisted: true },
];
function fixture() {
  const storage = disk(); const folder = createWorkFolder(storage);
  const note = folder.addNote('missao-561', ['pais-egito']); folder.updateNote(note, 'title', 'Estudar o fenômeno solar'); folder.updateNote(note, 'body', 'Bashir registrou alterações em Rá.'); folder.setEntryTags('notes', note, ['Vigília', 'Rá']);
  const doc = folder.addDocument('relatorio-561', 'missao-561'); folder.updateDocument(doc, 'body', 'Comparar as transmissões de rádio.');
  const person = folder.addPerson({ name: 'Contato do porto', role: 'Testemunha', missionId: 'missao-561' }); folder.setEntryTags('people', person, ['Vigília']);
  const place = folder.addLocality({ name: 'Ilha da Queimada Grande', reference: '24°29′10″S, 46°40′30″W' });
  const progress = folder.startProgress('missao-561', ['Preparar a retirada']); folder.updateProgress(progress, 'pending', 'Conferir a embarcação'); folder.updateProgress(progress, 'returnReport', 'A equipe retornou em segurança.');
  const link = folder.saveConnection({ from: `notes:${note}`, to: `people:${person}`, label: 'Informação fornecida no porto', body: 'Comparar o depoimento.' });
  return { folder, storage, note, doc, person, place, progress, link };
}

test('busca ignora acentos/maiúsculas e combina termos entre títulos, textos, códigos e etiquetas', () => {
  const { folder, note, doc } = fixture();
  assert.ok(searchWorkFolder(folder.state, records, { query: 'RA fenomeno VIGILIA' }).some(entry => entry.id === note));
  assert.deepEqual(searchWorkFolder(folder.state, records, { query: 'REL-561-001 radio' }).map(entry => entry.id), [doc]);
  assert.equal(searchWorkFolder(folder.state, records, { query: 'não existe neste caderno' }).length, 0);
  assert.ok(searchWorkFolder(folder.state, records, { query: 'egito' }).some(entry => entry.id === note));
});

test('busca inclui pessoas, coordenadas, andamento e ligações, com URLs para os registros corretos', () => {
  const { folder, person, place, progress, link } = fixture();
  assert.ok(searchWorkFolder(folder.state, records, { query: 'testemunha' }).some(entry => entry.id === person));
  assert.ok(searchWorkFolder(folder.state, records, { query: '24°29' }).some(entry => entry.id === place));
  for (const query of ['retirada', 'embarcacao', 'retornou']) assert.ok(searchWorkFolder(folder.state, records, { query }).some(entry => entry.id === progress));
  const relation = searchWorkFolder(folder.state, records, { query: 'depoimento', kind: 'connections' })[0];
  assert.equal(relation.id, link); assert.match(relation.url, /ligacao=/);
  assert.match(searchWorkFolder(folder.state, records, { kind: 'progress' })[0].url, /aba=andamento.*registro=/);
});

test('filtros por missão, tipo e etiqueta funcionam juntos sem revelar registros reservados', () => {
  const { folder, note } = fixture(); folder.addDocument('secreto');
  assert.deepEqual(searchWorkFolder(folder.state, records, { missionId: 'missao-561', kind: 'notes', tag: 'ra' }).map(entry => entry.id), [note]);
  assert.equal(searchWorkFolder(folder.state, records, { missionId: 'avulsas' }).length, 2);
  assert.equal(searchWorkFolder(folder.state, records, { query: 'invisível' }).length, 0);
  assert.equal(searchWorkFolder(folder.state, records, { query: 'RES-989' }).length, 0);
  assert.ok(searchWorkFolder(folder.state, records).some(entry => entry.title === 'Documento indisponível'));
  assert.deepEqual(folderTagOptions(folder.state), ['Rá', 'Vigília']);
});

test('etiquetas persistem e respeitam alterações em outras abas, limites e cópias antigas', () => {
  const { folder, storage, note } = fixture(); const second = createWorkFolder(storage);
  second.updateNote(note, 'body', 'Texto da outra aba.');
  folder.setEntryTags('notes', note, parseFolderTags('Rá, ra, Vigília,  Vigília  '));
  assert.equal(folder.state.notes[0].body, 'Texto da outra aba.'); assert.equal(folder.state.notes[0].tags.length, 2);
  const recovered = createWorkFolder(disk()); recovered.importData(parseWorkFolderBackup(serializeWorkFolderBackup(folder.state)));
  assert.deepEqual(recovered.state.notes[0].tags, folder.state.notes[0].tags);
  assert.match(workFolderReadableText(folder.state, records), /Etiquetas: ra, Vigília/);
  const old = JSON.parse(serializeWorkFolderBackup(folder.state)); delete old.data.notes[0].tags;
  assert.equal(parseWorkFolderBackup(JSON.stringify(old)).notes[0].tags, undefined);
  const bad = JSON.parse(serializeWorkFolderBackup(folder.state)); bad.data.notes[0].tags = ['x'.repeat(33)];
  assert.throws(() => parseWorkFolderBackup(JSON.stringify(bad)), /etiquetas inválidas/);
  assert.throws(() => parseFolderTags(Array.from({ length: 9 }, (_, i) => `etiqueta${i}`).join(',')), /até 8/);
  assert.throws(() => folder.setEntryTags('notes', note, ['ra', 'Rá']), /diferentes/);
  assert.throws(() => folder.setEntryTags('notes', note, ['uma,outra']), /diferentes/);
  assert.deepEqual(cleanFolderTags(['Vigília', null, 'vigilia', '  Rá  ']), ['Vigília', 'Rá']);
  folder.setEntryTags('notes', note, []); assert.equal(folder.state.notes[0].tags, undefined);
});

test('etiquetas continuam pesquisáveis e exportáveis com armazenamento bloqueado', () => {
  const folder = createWorkFolder(); const id = folder.addNote(); folder.setEntryTags('notes', id, ['Rascunho']);
  folder.reload(); assert.equal(folder.persisted, false);
  assert.equal(searchWorkFolder(folder.state, [], { tag: 'rascunho' })[0].id, id);
  const restored = createWorkFolder(disk()); restored.importData(parseWorkFolderBackup(serializeWorkFolderBackup(folder.state)));
  assert.deepEqual(restored.state.notes[0].tags, ['Rascunho']);
});

test('resultados de notas longas exibem o trecho encontrado em vez de apenas o início', () => {
  const body = 'Observação anterior. '.repeat(100) + 'O rádio confirmou a posição da Vigília. ' + 'Mais informações. '.repeat(100);
  const excerpt = folderSearchExcerpt(body, 'radio');
  assert.match(excerpt, /rádio confirmou/); assert.ok(excerpt.length <= 302); assert.ok(excerpt.startsWith('…'));
  assert.equal(folderSearchExcerpt('Texto curto.', 'curto'), 'Texto curto.');
});

test('enquadramento calcula os limites reais dos cartões, cabe em telas pequenas e mantém zoom seguro', () => {
  const bounds = evidenceViewBounds(new Map([['a', { x: 30, y: 50 }], ['b', { x: 6000, y: 6000 }]]));
  assert.deepEqual(bounds, { x: 30, y: 50, width: 6220, height: 6130 });
  const zoom = fitEvidenceZoom(bounds, 280, 440);
  assert.ok(bounds.width * zoom <= 220.01); assert.ok(bounds.height * zoom <= 380.01);
  assert.equal(clampEvidenceZoom(-1), .02); assert.equal(clampEvidenceZoom(900), 2); assert.equal(clampEvidenceZoom(NaN), 1);
  assert.equal(fitEvidenceZoom({ width: 250, height: 180 }, 1000, 600), 1);
});
