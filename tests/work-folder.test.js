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
  assert.deepEqual(readWorkFolder(disk), { missionId: '', notes: [], documents: [], people: [], localities: [], progress: [] });
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

test('a pasta anterior ganha as novas coleções sem perder suas notas e sua missão', () => {
  const disk = storage();
  const original = createWorkFolder(disk);
  original.selectMission('missao-ultimo-sinal');
  const id = original.addNote('missao-ultimo-sinal');
  original.updateNote(id, 'body', 'Preservar o caderno antigo.');
  const old = JSON.parse(disk.getItem(workFolderKey));
  delete old.documents; delete old.people; delete old.localities;
  disk.setItem(workFolderKey, JSON.stringify(old));
  const restored = createWorkFolder(disk);
  assert.equal(restored.state.missionId, 'missao-ultimo-sinal');
  assert.equal(restored.state.notes[0].body, 'Preservar o caderno antigo.');
  assert.deepEqual(restored.state.documents, []);
  assert.deepEqual(restored.state.people, []);
  assert.deepEqual(restored.state.localities, []);
  restored.addDocument('relatorio-bashir-sol-velado');
  assert.equal(readWorkFolder(disk).notes[0].id, id);
});

test('documentos, pessoas e localidades persistem por missão e preservam as demais coleções', () => {
  const disk = storage();
  const folder = createWorkFolder(disk);
  const note = folder.addNote();
  const document = folder.addDocument('relatorio-bashir-sol-velado', 'missao-ultimo-sinal');
  folder.updateDocument(document, 'body', 'Conferir as últimas coordenadas.');
  assert.equal(folder.addDocument('relatorio-bashir-sol-velado', 'missao-ultimo-sinal'), document, 'não duplica o mesmo vínculo na mesma missão');
  const person = folder.addPerson({ name: 'Contato do porto', role: 'Testemunha', missionId: 'missao-ultimo-sinal' });
  folder.updatePerson(person, 'body', 'Confirmar quando a equipe partiu.');
  const locality = folder.addLocality({ name: 'Ilha da Queimada Grande', reference: '24°29′10″S, 46°40′30″W', missionId: 'missao-ultimo-sinal' });
  folder.updateLocality(locality, 'body', 'Última localização registrada.');
  const restored = createWorkFolder(disk);
  assert.equal(restored.state.documents[0].body, 'Conferir as últimas coordenadas.');
  assert.equal(restored.state.people[0].role, 'Testemunha');
  assert.equal(restored.state.localities[0].reference, '24°29′10″S, 46°40′30″W');
  restored.removePerson(person);
  restored.removeDocument(document);
  restored.removeLocality(locality);
  assert.equal(readWorkFolder(disk).notes[0].id, note);
  assert.equal(readWorkFolder(disk).documents.length, 0);
  assert.equal(readWorkFolder(disk).people.length, 0);
  assert.equal(readWorkFolder(disk).localities.length, 0);
});

test('novas coleções validam campos, respeitam outras abas e preservam rascunhos sem armazenamento', () => {
  const disk = storage();
  const first = createWorkFolder(disk);
  const person = first.addPerson({ name: 'Agente Bashir', recordId: 'agente-bashir' });
  const second = createWorkFolder(disk);
  const document = second.addDocument('relatorio-bashir-sol-velado');
  first.updatePerson(person, 'body', 'Estabelecer contato.');
  assert.equal(readWorkFolder(disk).documents[0].id, document);
  assert.throws(() => first.updatePerson(person, 'name', 'a'.repeat(121)), /Confira/);
  assert.throws(() => first.updatePerson(person, 'access', 'Público'), /Confira/);
  first.updatePerson(person, 'name', '');
  assert.equal(readWorkFolder(disk).people[0].id, person, 'limpar um campo ao digitar não apaga o registro');
  second.removePerson(person);
  assert.throws(() => first.updatePerson(person, 'body', 'Aba antiga'), /removido em outra aba/);
  assert.throws(() => first.addLocality({ name: ' ', reference: '' }), /nome da localidade/);
  const blocked = createWorkFolder();
  const locality = blocked.addLocality({ name: 'Ponto de encontro' });
  blocked.updateLocality(locality, 'body', 'Rascunho pessoal.');
  blocked.reload();
  assert.equal(blocked.persisted, false);
  assert.equal(blocked.state.localities[0].body, 'Rascunho pessoal.');
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
