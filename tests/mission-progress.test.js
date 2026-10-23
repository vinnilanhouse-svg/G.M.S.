import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkFolder, readWorkFolder, workFolderKey } from '../src/work-folder.js';
import { missionObjectives } from '../src/mission-progress.js';
import { operationalRecords } from '../src/operations.js';
import { parseWorkFolderBackup, serializeWorkFolderBackup, workFolderReadableText } from '../src/work-folder-backup.js';
import { archiveTrace } from '../src/archive-trace.js';

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
const mission = operationalRecords.find(record => record.id === 'missao-ultimo-sinal');

test('objetivos pessoais, etapa, pendências e retorno persistem sem alterar a missão oficial', () => {
  const disk = storage();
  const folder = createWorkFolder(disk);
  const official = structuredClone(mission);
  const objectives = missionObjectives(mission);
  assert.equal(objectives.length, 5);
  const id = folder.startProgress(mission.id, objectives);
  folder.toggleObjective(id, 'objetivo-1', true);
  folder.updateProgress(id, 'stage', 'Em campo');
  folder.updateProgress(id, 'pending', 'Confirmar as condições de retirada.');
  folder.updateProgress(id, 'returnReport', 'Reconhecimento iniciado.\nAguardamos novo contato.');
  folder.addObjective(id, 'Conferir o rádio da equipe.');
  const restored = createWorkFolder(disk);
  assert.equal(restored.state.progress[0].stage, 'Em campo');
  assert.equal(restored.state.progress[0].objectives.length, 6);
  assert.equal(restored.state.progress[0].objectives[0].done, true);
  assert.match(restored.state.progress[0].returnReport, /\nAguardamos/);
  assert.equal(restored.startProgress(mission.id, ['Não substituir os objetivos']), id);
  assert.equal(restored.state.progress[0].objectives.length, 6);
  assert.deepEqual(mission, official);
});

test('missões distintas e outras abas conservam os dados do caderno', () => {
  const disk = storage();
  const first = createWorkFolder(disk);
  const id = first.startProgress(mission.id, missionObjectives(mission));
  const second = createWorkFolder(disk);
  const other = second.startProgress('missao-sol-velado');
  second.updateProgress(other, 'pending', 'Outro acompanhamento.');
  first.toggleObjective(id, 'objetivo-1', true);
  first.addNote();
  const state = readWorkFolder(disk);
  assert.equal(state.progress.length, 2);
  assert.equal(state.notes.length, 1);
  assert.equal(state.progress.find(entry => entry.id === other).pending, 'Outro acompanhamento.');
  assert.throws(() => first.updateProgress(id, 'stage', 'Encerrada oficialmente'), /Confira/);
  assert.throws(() => first.updateProgress(id, 'access', 'Público'), /Confira/);
  first.removeObjective(id, 'objetivo-1');
  assert.throws(() => first.toggleObjective(id, 'objetivo-1', true), /removido/);
});

test('cópias antigas continuam importáveis e o acompanhamento entra no JSON e no TXT', () => {
  const disk = storage();
  const folder = createWorkFolder(disk);
  const note = folder.addNote();
  const old = JSON.parse(serializeWorkFolderBackup(folder.state));
  delete old.data.progress;
  const parsed = parseWorkFolderBackup(JSON.stringify(old));
  assert.deepEqual(parsed.progress, []);
  assert.equal(parsed.notes[0].id, note);
  const id = folder.startProgress(mission.id, missionObjectives(mission));
  folder.updateProgress(id, 'returnReport', 'Rascunho pessoal a preservar.');
  const copy = parseWorkFolderBackup(serializeWorkFolderBackup(folder.state, { missionFilter: mission.id }));
  assert.equal(copy.progress.length, 1);
  assert.equal(copy.notes.length, 0);
  const other = createWorkFolder(storage());
  other.importData(copy);
  assert.equal(other.state.progress[0].returnReport, 'Rascunho pessoal a preservar.');
  assert.match(workFolderReadableText(folder.state, operationalRecords), /ANDAMENTO PESSOAL[\s\S]*Rascunho pessoal a preservar/);
  folder.updateProgress(id, 'returnReport', 'Versão local diferente.');
  assert.equal(folder.importData(copy).copied, 1);
  assert.equal(folder.state.progress.length, 2);
  assert.equal(folder.importData(copy).added, 0);
});

test('o acompanhamento resiste a armazenamento bloqueado e recusa dados inválidos na cópia', () => {
  const folder = createWorkFolder();
  const id = folder.startProgress(mission.id);
  folder.updateProgress(id, 'pending', 'Rascunho em memória.');
  folder.reload();
  assert.equal(folder.persisted, false);
  assert.equal(folder.state.progress[0].pending, 'Rascunho em memória.');
  const bad = JSON.parse(serializeWorkFolderBackup(folder.state));
  bad.data.progress[0].objectives = [{ id: 'objetivo-1', text: 'Teste', done: 'true' }];
  assert.throws(() => parseWorkFolderBackup(JSON.stringify(bad)), /inválidos/);
  const disk = storage(); disk.setItem(workFolderKey, JSON.stringify({ ...bad.data, progress: undefined }));
  assert.deepEqual(readWorkFolder(disk).progress, []);
});

test('rastros refletem autoria, custódia, consulta e revisão sem inserir marcação do usuário', () => {
  const html = archiveTrace({ ...mission, author: '<img src=x>', department: 'Unidade <script>' }, { agentName: '<svg onload=alert(1)>', localRevision: true, queriedAt: '2026-10-23T15:00:00Z' });
  assert.match(html, /C\.O\.D\.E\.X/);
  assert.match(html, /Texto revisado neste terminal/);
  assert.match(html, /&lt;img src=x&gt;/);
  assert.match(html, /&lt;svg onload/);
  assert.doesNotMatch(html, /<img src=x>|<svg onload/);
  assert.match(archiveTrace(mission), /Texto de incorporação/);
  assert.match(archiveTrace(mission, { publishedRevision: true }), /Versão publicada em consulta/);
});
