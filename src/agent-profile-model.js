import { agentNameStorageKey, normalizeAgentName, readAgentName } from './agent-identity.js';
import { agentSheetKey, readAgentSheet } from './agent-sheet-model.js';
import { newPersonalCredential, personalCredentialKey, readPersonalCredential } from './personal-credential-model.js';
import { commitPersonalStorage } from './personal-storage.js';

export const agentProfileKey = 'gms-agent-profile-v1';
export function readAgentProfileSettings(storage) {
  try { const data = JSON.parse(storage.getItem(agentProfileKey)); return { version: 1, syncName: data?.version === 1 && data.syncName === true }; } catch { return { version: 1, syncName: false }; }
}
export function updateAgentProfile(storage, input, { syncName = readAgentProfileSettings(storage).syncName, expected = {}, sheet: draftSheet, credential: draftCredential } = {}) {
  if (typeof input !== 'string' || !input.trim() || input.normalize('NFC').replace(/\s+/gu, ' ').trim().length > 60) throw new Error('Informe um nome com até 60 caracteres para a identificação do agente.');
  const name = normalizeAgentName(input);
  let baseline; try { baseline = Object.fromEntries([agentNameStorageKey, agentProfileKey, agentSheetKey, personalCredentialKey].map(key => [key, storage.getItem(key)])); } catch { throw new Error('O navegador não permitiu acessar o armazenamento. Exporte uma cópia dos seus dados e tente novamente.'); }
  const changes = { [agentNameStorageKey]: name, [agentProfileKey]: JSON.stringify({ version: 1, syncName: Boolean(syncName) }) };
  if (syncName) {
    const sheet = draftSheet || readAgentSheet(storage); const now = new Date().toISOString();
    const credential = draftCredential || readPersonalCredential(storage) || newPersonalCredential(sheet.fields, name);
    changes[agentSheetKey] = JSON.stringify({ ...sheet, revision: sheet.revision + 1, fields: { ...sheet.fields, nome: name }, updatedAt: now });
    changes[personalCredentialKey] = JSON.stringify({ version: 1, items: [{ ...credential, name, updatedAt: now }] });
  }
  commitPersonalStorage(storage, changes, { ...baseline, ...expected });
  return { name, syncName: Boolean(syncName) };
}
export function profileNames(storage, fallbackName = '') {
  return { access: readAgentName(storage) || fallbackName, sheet: readAgentSheet(storage).fields.nome, credential: readPersonalCredential(storage)?.name || '' };
}
