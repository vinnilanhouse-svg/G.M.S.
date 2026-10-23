import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkFolder, readWorkFolder, workFolderKey, operationalMissions } from '../src/work-folder.js';
import { operationalRecords } from '../src/operations.js';

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('missão pessoal e anotações persistem sem alterar a ordem oficial', () => {
  const disk = storage();
  const folder = createWorkFolder(disk);
  const original = structuredClone(operationalRecords);
  folder.selectMission('missao-ultimo-sinal');
  const id = folder.addNote('missao-ultimo-sinal');
  folder.updateNote(id, 'title', 'Pistas da Vigília');
  folder.updateNote(id, 'body', 'Conferir o último relatório.\nOuvir a equipe de busca.');
  const restored = createWorkFolder(disk);
  assert.equal(restored.state.missionId, 'missao-ultimo-sinal');
  assert.equal(restored.state.notes[0].title, 'Pistas da Vigília');
  assert.match(restored.state.notes[0].body, /\nOuvir/);
  assert.deepEqual(operationalRecords, original);
  restored.selectMission('');
  assert.equal(restored.state.notes.length, 1, 'remover acompanhamento preserva o caderno');
  assert.equal(restored.state.notes[0].missionId, 'missao-ultimo-sinal');
});

test('abas preservam outras notas e alterações em campos distintos', () => {
  const disk = storage();
  const first = createWorkFolder(disk);
  const id = first.addNote();
  const second = createWorkFolder(disk);
  second.updateNote(id, 'body', 'Texto da segunda aba');
  first.updateNote(id, 'title', 'Título da primeira aba');
  const secondId = second.addNote();
  first.selectMission('missao-sol-velado');
  assert.equal(readWorkFolder(disk).notes.length, 2);
  assert.equal(readWorkFolder(disk).notes.find(note => note.id === id).body, 'Texto da segunda aba');
  assert.equal(readWorkFolder(disk).notes.find(note => note.id === id).title, 'Título da primeira aba');
  second.deleteNote(secondId);
  first.reload();
  assert.equal(first.state.notes.length, 1);
  assert.equal(first.state.missionId, 'missao-sol-velado');
  second.deleteNote(id);
  assert.throws(() => first.updateNote(id, 'body', 'Não ressuscitar nota excluída'), /excluída em outra aba/);
});

test('armazenamento bloqueado mantém o rascunho na sessão e informa a falha', () => {
  const folder = createWorkFolder({ getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('sem espaço'); } });
  const id = folder.addNote();
  assert.equal(folder.persisted, false);
  folder.updateNote(id, 'body', 'Rascunho para baixar');
  folder.reload();
  assert.equal(folder.state.notes[0].body, 'Rascunho para baixar');
  assert.equal(folder.selectMission('missao-ultimo-sinal').persisted, false);
  assert.equal(folder.state.notes[0].body, 'Rascunho para baixar');
});

test('dados corrompidos e campos indevidos não entram no caderno', () => {
  const disk = storage();
  disk.setItem(workFolderKey, '{quebrado');
  assert.deepEqual(readWorkFolder(disk), { missionId: '', notes: [] });
  const folder = createWorkFolder(disk);
  const id = folder.addNote();
  assert.throws(() => folder.updateNote(id, 'access', 'Público'), /inválida/);
  assert.throws(() => folder.updateNote(id, 'body', 'a'.repeat(20001)), /inválida/);
  const value = JSON.parse(disk.getItem(workFolderKey));
  value.notes.push({ ...value.notes[0] }, { id: '<script>', title: 'ruim', body: '' });
  value.notes[0].access = 'Público';
  value.missionId = '<img onerror=alert(1)>';
  disk.setItem(workFolderKey, JSON.stringify(value));
  const recovered = readWorkFolder(disk);
  assert.equal(recovered.notes.length, 1);
  assert.equal(recovered.missionId, '');
  assert.equal(recovered.notes[0].access, undefined);
});

test('notas podem mudar de missão e a exclusão não apaga as demais', () => {
  const disk = storage();
  const folder = createWorkFolder(disk);
  const first = folder.addNote('missao-ultimo-sinal');
  const second = folder.addNote();
  folder.updateNote(first, 'missionId', 'missao-sol-velado');
  folder.deleteNote(second);
  assert.equal(readWorkFolder(disk).notes.length, 1);
  assert.equal(readWorkFolder(disk).notes[0].missionId, 'missao-sol-velado');
  assert.equal(createWorkFolder(storage()).state.notes.length, 0, 'outro navegador não recebe as notas');
});

test('painel distingue encerradas e contato perdido e exclui fichas fora do índice', () => {
  const { active, closed, missions } = operationalMissions([...operationalRecords, { id: 'privada', kind: 'missao', unlisted: true, status: 'Em andamento' }]);
  assert.equal(active.length, 2);
  assert.equal(closed.length, 3);
  assert.equal(active[0].id, 'missao-sol-velado');
  assert.equal(missions.length, 5);
  assert.ok(active.some(mission => mission.id === 'missao-ultimo-sinal'));
});
