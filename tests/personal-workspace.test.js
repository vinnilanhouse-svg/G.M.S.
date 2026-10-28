import test from 'node:test';
import assert from 'node:assert/strict';
import { agentSheetKey, createAgentSheetStore } from '../src/agent-sheet-model.js';
import { agentNameStorageKey } from '../src/agent-identity.js';
import { agentProfileKey, updateAgentProfile } from '../src/agent-profile-model.js';
import { newPersonalCredential, personalCredentialKey } from '../src/personal-credential-model.js';
import { createWorkFolder, workFolderKey } from '../src/work-folder.js';
import { fieldReportsKey, newFieldReport } from '../src/field-report-model.js';
import { documentHighlightsKey } from '../src/document-highlights-model.js';
import { commitPersonalStorage } from '../src/personal-storage.js';
import { importPersonalBackup, mergePersonalBackup, parsePersonalBackup, readPersonalBackupData, serializePersonalBackup, snapshotPersonalStorage } from '../src/personal-backup-model.js';

function disk() {
  const data = new Map();
  return { data, getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
}
function populated() {
  const storage = disk(), sheet = createAgentSheetStore(storage);
  sheet.updateField('nome', 'Agente Nilo'); sheet.updateField('especie', 'Abissais'); sheet.updateField('attr_corpo', '8'); sheet.updateField('historia', 'História pessoal completa.');
  storage.setItem(agentNameStorageKey, 'Operador');
  const credential = newPersonalCredential(sheet.state.fields); credential.codename = 'Sentinela'; credential.photo = 'data:image/jpeg;base64,/9j/2Q==';
  storage.setItem(personalCredentialKey, JSON.stringify({ version: 1, items: [credential] }));
  const folder = createWorkFolder(storage); folder.selectMission('missao-ultimo-sinal');
  const note = folder.addNote('missao-ultimo-sinal', ['planeta-terra']); folder.updateNote(note, 'title', 'Vestígios'); folder.updateNote(note, 'body', 'Rádio sem comunicação.');
  const person = folder.addPerson({ name: 'Contato', role: 'Testemunha', recordId: '', missionId: 'missao-ultimo-sinal' });
  folder.moveEvidence(`notes:${note}`, { x: 418, y: 271 }); folder.saveConnection({ from: `notes:${note}`, to: `people:${person}`, label: 'Conferir horário' });
  const report = newFieldReport({ author: 'Agente Nilo' }); report.account = 'Relato completo.';
  storage.setItem(fieldReportsKey, JSON.stringify({ version: 1, items: [report] }));
  const now = new Date().toISOString();
  storage.setItem(documentHighlightsKey, JSON.stringify({ version: 1, items: [{ id: 'highlight-one', recordId: 'relatorio-bashir-sol-velado', block: 'relatorio:0', quote: 'registro', start: 0, end: 8, prefix: '', suffix: '', comment: 'Conferir a data.', tone: 'duvida', createdAt: now, updatedAt: now }] }));
  storage.setItem('gms-saved', JSON.stringify(['org-gms'])); storage.setItem('gms-terminal-theme-v1', 'roxo'); storage.setItem('gms-terminal-sound-v1', 'on');
  storage.setItem('gms-access', 'SEGREDO'); storage.setItem('gms-local-edits-v1', 'EDIÇÃO ADMINISTRATIVA');
  return { storage, folder, sheet, note, person };
}

test('backup completo preserva ficha, retrato, pasta, ligações, posição, relatórios, grifos e preferências', () => {
  const { storage } = populated(); const original = readPersonalBackupData(storage);
  const text = serializePersonalBackup(original); const parsed = parsePersonalBackup(text);
  assert.deepEqual(parsed, original); assert.doesNotMatch(text, /SEGREDO|EDIÇÃO ADMINISTRATIVA|gms-access|gms-local-edits/);
  const destination = disk(); importPersonalBackup(destination, parsed, { restoreIdentity: true });
  assert.deepEqual(readPersonalBackupData(destination), original);
  assert.deepEqual(parsed.folder.notes[0].position, { x: 418, y: 271 });
  assert.equal(parsed.highlights[0].comment, 'Conferir a data.'); assert.match(parsed.credential.photo, /^data:image\/jpeg/);
});

test('mesclagem copia versões conflitantes, remapeia ligações e continua idempotente', () => {
  const { storage, folder, note } = populated(); const incoming = readPersonalBackupData(storage);
  folder.updateNote(note, 'body', 'Versão atual da observação.');
  const current = readPersonalBackupData(storage); current.sheet.nome = 'Nome atual';
  const merged = mergePersonalBackup(current, incoming);
  assert.equal(merged.sheet.nome, 'Nome atual'); assert.equal(merged.folder.notes.length, 2); assert.equal(merged.folder.connections.length, 2);
  const copied = merged.folder.notes.find(item => item.body === 'Rádio sem comunicação.');
  assert.notEqual(copied.id, note); assert.ok(merged.folder.connections.some(link => link.from === `notes:${copied.id}`));
  const again = mergePersonalBackup(merged, incoming); assert.deepEqual(again, merged);
  assert.equal(mergePersonalBackup(current, incoming, { restoreIdentity: true }).sheet.nome, 'Agente Nilo');
});

test('importação valida tudo antes de gravar e detecta edição depois da conferência', () => {
  const { storage } = populated(); const backup = readPersonalBackupData(storage); const baseline = snapshotPersonalStorage(storage);
  const invalid = JSON.parse(serializePersonalBackup(backup)); invalid.data.reports[0].account = 99;
  assert.throws(() => parsePersonalBackup(JSON.stringify(invalid)), /relatório/);
  assert.throws(() => parsePersonalBackup('{"format":"arquivo-gms-ficha-de-agente","version":1}'), /respectiva seção/);
  storage.setItem(agentNameStorageKey, 'Outro acesso'); const before = new Map(storage.data);
  assert.throws(() => importPersonalBackup(storage, backup, { expected: baseline, restoreIdentity: true }), /outra aba/);
  assert.deepEqual(storage.data, before);
});

test('falha de armazenamento reverte as partes já gravadas e a importação concluída pode ser desfeita', () => {
  const source = populated().storage, backup = readPersonalBackupData(source), target = disk();
  target.setItem(agentNameStorageKey, 'Identificação anterior'); const before = new Map(target.data); let writes = 0;
  const failing = { ...target, setItem(key, value) { if (++writes === 4) throw new Error('QuotaExceeded'); target.setItem(key, value); } };
  assert.throws(() => importPersonalBackup(failing, backup, { restoreIdentity: true }), /anteriores foram preservados/);
  assert.deepEqual(target.data, before);
  const transaction = importPersonalBackup(target, backup, { restoreIdentity: true });
  commitPersonalStorage(target, transaction.before, transaction.after); assert.deepEqual(target.data, before);
});

test('perfil sincroniza somente os nomes e respeita a opção de manter identidades independentes', () => {
  const { storage } = populated(); const fields = createAgentSheetStore(storage).state.fields;
  const before = snapshotPersonalStorage(storage); updateAgentProfile(storage, '  Agente   Aurora ', { syncName: true, expected: before });
  const after = readPersonalBackupData(storage);
  assert.equal(after.name, 'Agente Aurora'); assert.equal(after.sheet.nome, 'Agente Aurora'); assert.equal(after.credential.name, 'Agente Aurora');
  assert.deepEqual({ ...after.sheet, nome: fields.nome }, fields); assert.equal(after.credential.codename, 'Sentinela'); assert.match(after.credential.photo, /^data:image/);
  assert.equal(after.profile.syncName, true); assert.equal(storage.getItem('gms-access'), 'SEGREDO');
  updateAgentProfile(storage, 'Operadora', { syncName: false });
  const independent = readPersonalBackupData(storage); assert.equal(independent.name, 'Operadora'); assert.equal(independent.sheet.nome, 'Agente Aurora');
  assert.throws(() => updateAgentProfile(storage, 'x'.repeat(61), { syncName: true }), /60 caracteres/);
});

test('exportação usa também rascunhos de memória quando o navegador recusa armazenamento', () => {
  const { storage } = populated(); const data = readPersonalBackupData(storage);
  const blocked = { getItem() { throw new Error('Bloqueado'); } };
  assert.deepEqual(parsePersonalBackup(serializePersonalBackup(readPersonalBackupData(blocked, data))), data);
  const sheet = createAgentSheetStore(storage).state; sheet.fields.historia = 'Rascunho em memória.';
  updateAgentProfile(storage, 'Agente Aurora', { syncName: true, sheet });
  assert.equal(readPersonalBackupData(storage).sheet.historia, 'Rascunho em memória.');
  assert.ok(JSON.parse(storage.getItem(agentProfileKey)).syncName);
  const current = readPersonalBackupData(storage); current.folder.notes[0].body = 'Anotação ainda em memória.';
  const transaction = importPersonalBackup(storage, data, { current });
  commitPersonalStorage(storage, transaction.before, transaction.after);
  assert.equal(readPersonalBackupData(storage).folder.notes[0].body, 'Anotação ainda em memória.');
});
