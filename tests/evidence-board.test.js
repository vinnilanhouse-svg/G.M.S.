import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkFolder, readWorkFolder, workFolderKey } from '../src/work-folder.js';
import { defaultEvidencePositions, evidenceConnections, evidenceNodes } from '../src/evidence-board-model.js';
import { parseWorkFolderBackup, selectWorkFolderData, serializeWorkFolderBackup, workFolderReadableText } from '../src/work-folder-backup.js';

function disk() {
  const data = new Map();
  return { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value) };
}
function fixture(storage = disk()) {
  const folder = createWorkFolder(storage);
  const missionId = 'missao-ultimo-sinal';
  const person = folder.addPerson({ name: 'Bashir', recordId: 'agente-bashir', missionId });
  const place = folder.addLocality({ name: 'Ilha da Queimada Grande', missionId });
  const doc = folder.addDocument('relatorio-bashir-sol-velado', missionId);
  const note = folder.addNote(); folder.updateNote(note, 'title', 'Comparar comunicações');
  const from = `people:${person}`; const to = `localities:${place}`;
  const id = folder.saveConnection({ from, to, label: 'Último local conhecido', body: 'Conforme o último contato por rádio.' });
  return { storage, folder, id, from, to, person, place, doc, note, missionId };
}

test('ligações e posições persistem com os registros da pasta sem alterar o acervo', () => {
  const { storage, folder, id, from, to, missionId } = fixture();
  folder.moveEvidence(from, { x: 610, y: 300 });
  folder.saveConnection({ id, from, to, label: 'Último local conhecido', status: 'confirmado', body: 'Confirmado pela ordem de busca.' });
  const restored = createWorkFolder(storage);
  assert.equal(restored.state.connections[0].status, 'confirmado');
  assert.equal(restored.state.connections[0].missionId, missionId);
  assert.deepEqual(restored.state.people[0].position, { x: 610, y: 300 });
  assert.equal(evidenceNodes(restored.state).length, 4);
  assert.equal(evidenceNodes(restored.state, missionId).length, 3);
  assert.equal(evidenceConnections(restored.state, missionId).length, 1);
  folder.organizeEvidence([from]);
  assert.equal(folder.state.people[0].position, undefined);
  assert.equal(folder.state.connections[0].id, id);
});

test('mover registros entre missões recalcula o escopo e remover uma ponta remove apenas suas ligações', () => {
  const { folder, person, from, to, missionId } = fixture();
  const another = folder.addPerson({ name: 'Contato', missionId });
  folder.saveConnection({ from: `people:${another}`, to, label: 'Observou o local' });
  folder.updatePerson(person, 'missionId', 'missao-sol-velado');
  assert.equal(evidenceConnections(folder.state).length, 2);
  assert.equal(evidenceConnections(folder.state, missionId).length, 1);
  assert.equal(evidenceConnections(folder.state, 'avulsas').length, 0);
  folder.removePerson(person);
  assert.equal(folder.state.connections.length, 1);
  assert.equal(folder.state.documents.length, 1);
  assert.equal(folder.state.notes.length, 1);
  assert.equal(folder.state.localities.length, 1);
  assert.throws(() => folder.moveEvidence(from, { x: 10, y: 10 }), /removido/);
});

test('a exportação inclui o quadro; filtros nunca geram ligações sem suas duas evidências', () => {
  const { folder, from, note, missionId } = fixture();
  folder.saveConnection({ from, to: `notes:${note}`, label: 'Conferir a comunicação' });
  const selected = selectWorkFolderData(folder.state, missionId);
  assert.equal(selected.connections.length, 1);
  const avulsas = selectWorkFolderData(folder.state, 'avulsas');
  assert.equal(avulsas.notes.length, 1); assert.equal(avulsas.connections.length, 0);
  const other = createWorkFolder(disk());
  const result = other.importData(parseWorkFolderBackup(serializeWorkFolderBackup(folder.state)));
  assert.equal(result.added, 6); assert.deepEqual(other.state, folder.state);
  assert.match(workFolderReadableText(folder.state, []), /QUADRO DE EVIDÊNCIAS[\s\S]*Bashir → Ilha da Queimada Grande[\s\S]*Hipótese/);
});

test('importar versões conflitantes remapeia as ligações para as cópias corretas e permanece idempotente', () => {
  const { folder, person, place, id, from } = fixture();
  folder.moveEvidence(from, { x: 123, y: 456 });
  const copy = parseWorkFolderBackup(serializeWorkFolderBackup(folder.state));
  folder.updatePerson(person, 'body', 'Versão local alterada.');
  folder.updateLocality(place, 'body', 'Versão local do local.');
  const result = folder.importData(copy);
  assert.equal(result.added, 3); assert.equal(result.copied, 3);
  const copiedPerson = folder.state.people.find(entry => entry.id !== person);
  const copiedPlace = folder.state.localities.find(entry => entry.id !== place);
  const copiedLink = folder.state.connections.find(link => link.id !== id);
  assert.equal(copiedLink.from, `people:${copiedPerson.id}`);
  assert.equal(copiedLink.to, `localities:${copiedPlace.id}`);
  assert.deepEqual(copiedPerson.position, { x: 123, y: 456 });
  assert.equal(folder.importData(copy).added, 0);
  assert.equal(folder.state.connections.length, 2);
});

test('cópias antigas, armazenamento bloqueado e alterações em outras abas preservam o quadro', () => {
  const { storage, folder, from, to } = fixture();
  const old = JSON.parse(serializeWorkFolderBackup(folder.state)); delete old.data.connections;
  assert.deepEqual(parseWorkFolderBackup(JSON.stringify(old)).connections, []);
  const second = createWorkFolder(storage);
  second.updateLocality(second.state.localities[0].id, 'body', 'Informação da outra aba.');
  folder.moveEvidence(from, { x: 200, y: 220 });
  assert.equal(readWorkFolder(storage).localities[0].body, 'Informação da outra aba.');
  const blocked = createWorkFolder(); blocked.importData(folder.state);
  blocked.saveConnection({ from, to, label: 'Rascunho sem armazenamento' });
  blocked.reload(); assert.equal(blocked.persisted, false); assert.equal(blocked.state.connections.length, 2);
  const recovered = createWorkFolder(disk()); recovered.importData(parseWorkFolderBackup(serializeWorkFolderBackup(blocked.state)));
  assert.equal(recovered.state.connections.length, 2);
});

test('evidências idênticas que já usam outros IDs recebem as ligações sem duplicar cartões', () => {
  const { folder } = fixture();
  const incoming = parseWorkFolderBackup(serializeWorkFolderBackup(folder.state));
  const existing = structuredClone(incoming);
  const refs = new Map();
  for (const kind of ['people', 'documents', 'localities', 'notes']) for (const entry of existing[kind]) {
    const id = `local-${kind}`; refs.set(`${kind}:${entry.id}`, `${kind}:${id}`); entry.id = id;
  }
  existing.connections[0].id = 'ligacao-local';
  existing.connections[0].from = refs.get(existing.connections[0].from);
  existing.connections[0].to = refs.get(existing.connections[0].to);
  const restored = createWorkFolder(disk()); restored.importData(existing);
  const result = restored.importData(incoming);
  assert.equal(result.added, 0); assert.equal(result.skipped, 5);
  assert.equal(evidenceNodes(restored.state).length, 4);
  assert.equal(restored.state.connections.length, 1);
});

test('ligações inválidas, reflexivas, penduradas e posições inválidas são recusadas sem importação parcial', () => {
  const { folder, from, to, storage } = fixture();
  assert.throws(() => folder.saveConnection({ from, to: from, label: 'Inválida' }), /duas evidências/);
  assert.throws(() => folder.saveConnection({ from, to: 'notes:inexistente', label: 'Inválida' }), /duas evidências/);
  assert.throws(() => folder.saveConnection({ from, to, label: 'Inválida', status: 'oficial' }), /duas evidências/);
  assert.throws(() => folder.moveEvidence(from, { x: -10, y: 0 }), /Posição inválida/);
  const bad = JSON.parse(serializeWorkFolderBackup(folder.state)); bad.data.connections[0].to = 'people:apagada';
  const before = structuredClone(folder.state);
  assert.throws(() => folder.importData(bad.data), /inválidos/); assert.deepEqual(folder.state, before);
  const invalidPosition = JSON.parse(serializeWorkFolderBackup(folder.state)); invalidPosition.data.people[0].position = { x: '20', y: 0 };
  assert.throws(() => parseWorkFolderBackup(JSON.stringify(invalidPosition)), /posições inválidas/);
  storage.setItem(workFolderKey, JSON.stringify({ ...bad.data, version: 1 }));
  assert.equal(readWorkFolder(storage).connections.length, 0, 'a leitura cotidiana remove ligações órfãs');
});

test('a organização automática conserva posições salvas e evita sobreposição com novos cartões', () => {
  const { folder, from } = fixture();
  folder.moveEvidence(from, { x: 44, y: 74 });
  folder.addPerson({ name: 'Novo contato' });
  const nodes = evidenceNodes(folder.state);
  const positions = defaultEvidencePositions(nodes);
  assert.deepEqual(positions.get(from), { x: 44, y: 74 });
  const other = nodes.find(node => node.kind === 'people' && node.ref !== from);
  assert.ok(Math.abs(positions.get(other.ref).y - positions.get(from).y) >= 200);
});
