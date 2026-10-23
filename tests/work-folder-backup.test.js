import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkFolder, workFolderCollections, workFolderKey } from '../src/work-folder.js';
import { parseWorkFolderBackup, selectWorkFolderData, serializeWorkFolderBackup, workFolderReadableText } from '../src/work-folder-backup.js';

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
function fixture() {
  const disk = storage();
  const folder = createWorkFolder(disk);
  folder.selectMission('missao-ultimo-sinal');
  const note = folder.addNote('missao-ultimo-sinal');
  folder.updateNote(note, 'title', 'Pistas da Vigília');
  folder.updateNote(note, 'body', 'Conferir as coordenadas.\n“Último sinal” — atenção a Rá.');
  const document = folder.addDocument('relatorio-bashir-sol-velado', 'missao-ultimo-sinal');
  folder.updateDocument(document, 'body', 'Comparar os horários.');
  const person = folder.addPerson({ name: 'Bashir', role: 'Responsável pela Vigília', recordId: 'agente-bashir', missionId: 'missao-sol-velado' });
  folder.updatePerson(person, 'body', 'Último contato durante a travessia.');
  const locality = folder.addLocality({ name: 'Ilha da Queimada Grande', reference: '24°29′10″S, 46°40′30″W' });
  folder.updateLocality(locality, 'body', 'Conferir o ponto de desembarque.');
  return { disk, folder, note };
}

test('a cópia completa recupera as quatro coleções, os textos e as datas em outro navegador', () => {
  const { disk, folder } = fixture();
  disk.setItem('gms-agent-name-v1', 'Nome privado');
  disk.setItem('gms-active-credentials-v1', 'NATHALISM0');
  const backup = serializeWorkFolderBackup(folder.state);
  assert.doesNotMatch(backup, /Nome privado|NATHALISM0/);
  const restored = createWorkFolder(storage());
  const result = restored.importData(parseWorkFolderBackup(backup));
  assert.equal(result.added, 4);
  assert.equal(result.persisted, true);
  assert.deepEqual(restored.state, folder.state);
  assert.match(restored.state.notes[0].body, /\n“Último sinal”/);
  assert.deepEqual(parseWorkFolderBackup('\uFEFF' + backup), parseWorkFolderBackup(backup));
});

test('exportar uma missão ou registros avulsos aplica o mesmo filtro nas quatro abas', () => {
  const { folder } = fixture();
  const one = parseWorkFolderBackup(serializeWorkFolderBackup(folder.state, { missionFilter: 'missao-ultimo-sinal' }));
  assert.equal(one.missionId, 'missao-ultimo-sinal');
  assert.equal(one.notes.length, 1);
  assert.equal(one.documents.length, 1);
  assert.equal(one.people.length, 0);
  assert.equal(one.localities.length, 0);
  const avulsas = selectWorkFolderData(folder.state, 'avulsas');
  assert.equal(avulsas.missionId, '');
  assert.equal(avulsas.localities.length, 1);
  for (const key of workFolderCollections) assert.ok(avulsas[key].every(entry => entry.missionId === ''));
  assert.equal(folder.state.people.length, 1, 'exportar não remove registros da pasta');
});

test('a importação conserva versões diferentes, ignora repetições e mantém a missão local', () => {
  const { folder, note } = fixture();
  const incoming = parseWorkFolderBackup(serializeWorkFolderBackup(folder.state));
  folder.updateNote(note, 'body', 'Versão local mais recente.');
  folder.selectMission('missao-sol-velado');
  const result = folder.importData(incoming);
  assert.equal(result.added, 1);
  assert.equal(result.copied, 1);
  assert.equal(result.skipped, 3);
  assert.equal(folder.state.notes.find(entry => entry.id === note).body, 'Versão local mais recente.');
  assert.ok(folder.state.notes.some(entry => entry.id !== note && entry.body === incoming.notes[0].body));
  assert.equal(folder.state.missionId, 'missao-sol-velado');
  assert.equal(folder.importData(incoming).added, 0);
  assert.equal(folder.state.notes.length, 2);
});

test('arquivos malformados e registros inválidos são recusados sem importação parcial', () => {
  const { folder } = fixture();
  const before = structuredClone(folder.state);
  const backup = JSON.parse(serializeWorkFolderBackup(folder.state));
  assert.throws(() => parseWorkFolderBackup('{quebrado'), /Não foi possível ler/);
  assert.throws(() => parseWorkFolderBackup(JSON.stringify({ ...backup, version: 99 })), /compatível/);
  backup.data.localities[0].reference = 'x'.repeat(241);
  assert.throws(() => parseWorkFolderBackup(JSON.stringify(backup)), /inválidos/);
  assert.throws(() => folder.importData(backup.data), /inválidos/);
  assert.deepEqual(folder.state, before);
  const duplicate = JSON.parse(serializeWorkFolderBackup(folder.state));
  duplicate.data.notes.push(duplicate.data.notes[0]);
  assert.throws(() => parseWorkFolderBackup(JSON.stringify(duplicate)), /repetidos/);
});

test('a versão para leitura inclui vínculos e observações, respeitando os arquivos disponíveis', () => {
  const { folder } = fixture();
  folder.addDocument('arquivo-oculto');
  const records = [
    { id: 'missao-ultimo-sinal', code: 'MIS-568', title: 'Operação Último Sinal' },
    { id: 'missao-sol-velado', code: 'MIS-561', title: 'Operação Sol Velado' },
    { id: 'agente-bashir', code: 'AGT-684', title: 'Bashir' },
    { id: 'relatorio-bashir-sol-velado', code: 'REL-561-001', title: 'Relatório de Bashir', report: ['Texto oficial que não pertence ao caderno pessoal.'] },
    { id: 'arquivo-oculto', title: 'Título reservado invisível', unlisted: true },
  ];
  const text = workFolderReadableText(folder.state, records);
  for (const label of ['ANOTAÇÕES', 'DOCUMENTOS', 'PESSOAS DE INTERESSE', 'LOCALIDADES']) assert.ok(text.includes(label));
  assert.match(text, /REL-561-001 · Relatório de Bashir/);
  assert.match(text, /https:\/\/globalmonstersecurity.vercel.app\/#\/arquivo\/agente-bashir/);
  assert.match(text, /Comparar os horários/);
  assert.match(text, /24°29′10″S/);
  assert.match(text, /Arquivo indisponível neste terminal/);
  assert.doesNotMatch(text, /Título reservado invisível|Texto oficial que não pertence/);
});

test('rascunhos sem armazenamento continuam exportáveis e importações repetidas não os duplicam', () => {
  const blocked = createWorkFolder();
  const person = blocked.addPerson({ name: 'Contato do porto', role: 'Testemunha' });
  blocked.updatePerson(person, 'body', 'Rascunho para preservar.');
  const backup = serializeWorkFolderBackup(blocked.state);
  const result = blocked.importData(parseWorkFolderBackup(backup));
  assert.equal(result.added, 0);
  assert.equal(result.persisted, false);
  assert.equal(blocked.state.people.length, 1);
  const recovered = createWorkFolder(storage());
  recovered.importData(parseWorkFolderBackup(backup));
  assert.equal(recovered.state.people[0].body, 'Rascunho para preservar.');
  assert.ok(recovered.persisted);
});
