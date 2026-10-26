import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkFolder } from '../src/work-folder.js';
import { parseWorkFolderBackup, serializeWorkFolderBackup, workFolderReadableText } from '../src/work-folder-backup.js';
const disk = () => { const data = new Map(); return { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value) }; };
function fixture(storage = disk()) {
  const folder = createWorkFolder(storage); const note = folder.addNote('missao-ultimo-sinal', ['pais-egito']);
  folder.updateNote(note, 'title', 'Pistas da Vigília'); folder.updateNote(note, 'body', 'Preservar este depoimento.'); folder.setEntryTags('notes', note, ['Vigília']);
  const person = folder.addPerson({ name: 'Bashir', missionId: 'missao-ultimo-sinal' });
  const link = folder.saveConnection({ from: `notes:${note}`, to: `people:${person}`, label: 'Depoimento recebido' });
  return { storage, folder, note, person, link };
}

test('desfazer/refazer posições e ligações preserva textos modificados em outra aba', () => {
  const { folder, storage, note, link } = fixture();
  folder.moveEvidence(`notes:${note}`, { x: 400, y: 300 });
  const other = createWorkFolder(storage); other.updateNote(note, 'body', 'Nova informação da outra aba.');
  assert.equal(folder.undoLabel, 'Mover cartão'); folder.undo();
  assert.equal(folder.state.notes[0].position, undefined); assert.equal(folder.state.notes[0].body, 'Nova informação da outra aba.');
  folder.redo(); assert.deepEqual(folder.state.notes[0].position, { x: 400, y: 300 });
  folder.removeConnection(link); assert.equal(folder.state.connections.length, 0); folder.undo(); assert.equal(folder.state.connections[0].id, link);
  folder.redo(); assert.equal(folder.state.connections.length, 0);
});

test('conflitos no mesmo campo impedem desfazer sem apagar o trabalho atual', () => {
  const { folder, storage, note } = fixture(); folder.moveEvidence(`notes:${note}`, { x: 400, y: 300 });
  createWorkFolder(storage).moveEvidence(`notes:${note}`, { x: 600, y: 500 });
  assert.throws(() => folder.undo(), /mudou/);
  assert.deepEqual(createWorkFolder(storage).state.notes[0].position, { x: 600, y: 500 });
  assert.equal(folder.undoLabel, 'Mover cartão');
});

test('uma evidência completa é uma ação atômica e admite desfazer/refazer mesmo após releitura', () => {
  const folder = createWorkFolder(disk());
  const person = folder.transaction('Adicionar evidência', () => { const id = folder.addPerson({ name: 'Contato', role: 'Testemunha' }); folder.updatePerson(id, 'body', 'Observações de campo.'); folder.setEntryTags('people', id, ['Vigília']); return id; });
  folder.reload(); folder.undo(); assert.equal(folder.state.people.length, 0); folder.redo(); assert.equal(folder.state.people[0].id, person); assert.deepEqual(folder.state.people[0].tags, ['Vigília']);
  const before = structuredClone(folder.state);
  assert.throws(() => folder.transaction('Falha', () => { folder.addNote(); throw new Error('Falha prevista'); }), /prevista/);
  assert.deepEqual(folder.state, before); assert.deepEqual(createWorkFolder({ getItem: () => JSON.stringify({ version: 1, ...folder.state }) }).state, before);
});

test('lixeira persiste texto, imagens, etiquetas, posição e vínculos, permitindo restauração completa', () => {
  const { folder, storage, note, link } = fixture(); folder.moveEvidence(`notes:${note}`, { x: 350, y: 220 }); folder.deleteNote(note);
  assert.equal(folder.state.notes.length, 0); assert.equal(folder.state.connections.length, 0); assert.equal(folder.state.trash.length, 1);
  const restored = createWorkFolder(storage); const result = restored.restoreNote(restored.state.trash[0].id);
  assert.equal(result.id, note); assert.equal(result.restoredLinks, 1); assert.equal(restored.state.trash.length, 0); assert.equal(restored.state.connections[0].id, link);
  assert.deepEqual(restored.state.notes[0].illustrations, ['pais-egito']); assert.deepEqual(restored.state.notes[0].tags, ['Vigília']); assert.deepEqual(restored.state.notes[0].position, { x: 350, y: 220 });
});

test('exclusão para a lixeira também pode ser desfeita e refeita com suas ligações', () => {
  const { folder, note } = fixture(); folder.deleteNote(note); folder.reload(); folder.undo();
  assert.equal(folder.state.notes[0].id, note); assert.equal(folder.state.trash.length, 0); assert.equal(folder.state.connections.length, 1);
  folder.redo(); assert.equal(folder.state.notes.length, 0); assert.equal(folder.state.trash.length, 1); assert.equal(folder.state.connections.length, 0);
});

test('restaurar notas ligadas em qualquer ordem recupera a ligação após a segunda restauração', () => {
  const { folder, note } = fixture(); const second = folder.addNote(); folder.saveConnection({ from: `notes:${note}`, to: `notes:${second}`, label: 'Leitura cruzada' });
  folder.deleteNote(note); folder.deleteNote(second); folder.restoreNote(folder.state.trash.find(item => item.note.id === note).id); folder.reload();
  folder.restoreNote(folder.state.trash[0].id);
  assert.equal(folder.state.notes.length, 2); assert.ok(folder.state.connections.some(link => link.label === 'Leitura cruzada'));
});

test('restauração em conflito cria uma cópia e exclusão definitiva não é recuperável pelo histórico', () => {
  const { folder, note } = fixture(); const original = structuredClone(folder.state.notes[0]); folder.deleteNote(note);
  folder.importData({ version: 1, missionId: '', notes: [{ ...original, body: 'Versão ativa diferente.' }], documents: [], people: [], localities: [], progress: [], connections: [] });
  const result = folder.restoreNote(folder.state.trash[0].id); assert.notEqual(result.id, note); assert.equal(folder.state.notes.find(item => item.id === note).body, 'Versão ativa diferente.');
  folder.deleteNote(result.id); const trashId = folder.state.trash[0].id; folder.permanentlyDeleteNote(trashId);
  assert.equal(folder.state.trash.length, 0); assert.ok(!folder.undoLabel.includes('Restaurar')); assert.ok(!folder.state.notes.some(item => item.id === result.id));
});

test('cópia JSON preserva lixeira; TXT e busca de ativos não incluem notas removidas', () => {
  const { folder, note } = fixture(); folder.deleteNote(note);
  const backup = serializeWorkFolderBackup(folder.state); const copy = createWorkFolder(disk()); copy.importData(parseWorkFolderBackup(backup));
  assert.equal(copy.state.trash[0].note.body, 'Preservar este depoimento.'); assert.doesNotMatch(workFolderReadableText(folder.state, []), /Preservar este depoimento/);
  const old = JSON.parse(backup); delete old.data.trash; assert.deepEqual(parseWorkFolderBackup(JSON.stringify(old)).trash, []);
  const bad = JSON.parse(backup); bad.data.trash[0].note.illustrations = ['inexistente']; assert.throws(() => parseWorkFolderBackup(JSON.stringify(bad)), /imagens/);
});

test('lixeira e histórico funcionam sem armazenamento e novas ações limpam a ramificação de refazer', () => {
  const { folder, note } = fixture(undefined); folder.deleteNote(note); folder.undo(); folder.moveEvidence(`notes:${note}`, { x: 10, y: 20 }); assert.equal(folder.redoLabel, '');
  const noDisk = createWorkFolder(); const id = noDisk.addNote(); noDisk.deleteNote(id); noDisk.undo(); assert.equal(noDisk.persisted, false); assert.equal(noDisk.state.notes[0].id, id);
});
