import { agentNameStorageKey, normalizeAgentName, readAgentName } from './agent-identity.js';
import { agentSheetBackupFormat, agentSheetKey, parseAgentSheet, readAgentSheet } from './agent-sheet-model.js';
import { personalCredentialKey, readPersonalCredential, validatePersonalCredential } from './personal-credential-model.js';
import { createWorkFolder, readWorkFolder, validateWorkFolderData, workFolderKey } from './work-folder.js';
import { fieldReportsKey, validateFieldReport } from './field-report-model.js';
import { documentHighlightsKey, validateDocumentHighlight } from './document-highlights-model.js';
import { personalId, validPersonalId } from './personal-records.js';
import { agentProfileKey, readAgentProfileSettings } from './agent-profile-model.js';
import { readTerminalTheme, terminalThemeKey, terminalThemes } from './terminal-theme.js';
import { commitPersonalStorage } from './personal-storage.js';

export const personalBackupFormat = 'arquivo-gms-dados-pessoais';
export const maxPersonalBackupBytes = 32 * 1024 * 1024;
export const personalBackupKeys = [agentNameStorageKey, agentSheetKey, personalCredentialKey, workFolderKey, fieldReportsKey, documentHighlightsKey, agentProfileKey, 'gms-saved', terminalThemeKey, 'gms-terminal-sound-v1'];
const bytes = text => new TextEncoder().encode(text).length;
const fieldsOf = fields => parseAgentSheet(JSON.stringify({ format: agentSheetBackupFormat, version: 1, fields }));
const parseItems = (storage, key) => { try { return JSON.parse(storage.getItem(key))?.items || []; } catch { return []; } };
function validateItems(items, validate) {
  if (!Array.isArray(items) || items.length > 10000) throw new Error('A cópia contém uma lista de registros incompatível.');
  const result = items.map(validate);
  if (new Set(result.map(item => item.id)).size !== result.length) throw new Error('A cópia contém identificadores repetidos.');
  return result;
}
export function validatePersonalBackupData(data) {
  if (!data || typeof data.name !== 'string' || data.name !== normalizeAgentName(data.name) || typeof data.profile?.syncName !== 'boolean' ||
    !Array.isArray(data.saved) || data.saved.length > 10000 || data.saved.some(id => !validPersonalId(id)) ||
    typeof data.theme !== 'string' || (data.theme && !terminalThemes.some(theme => theme.id === data.theme)) || !['on', 'off'].includes(data.sound)) throw new Error('A cópia contém identificação ou preferências inválidas.');
  return { name: data.name, profile: { version: 1, syncName: data.profile.syncName }, sheet: fieldsOf(data.sheet), credential: data.credential === null ? null : validatePersonalCredential(data.credential),
    folder: { version: 1, ...validateWorkFolderData(data.folder) }, reports: validateItems(data.reports, validateFieldReport), highlights: validateItems(data.highlights, validateDocumentHighlight),
    saved: [...new Set(data.saved)], theme: data.theme, sound: data.sound };
}
export function readPersonalBackupData(storage, overrides = {}) {
  let saved = [], sound = 'off'; try { saved = JSON.parse(storage.getItem('gms-saved') || '[]'); } catch {}
  try { if (storage.getItem('gms-terminal-sound-v1') === 'on') sound = 'on'; } catch {}
  return validatePersonalBackupData({ name: readAgentName(storage), profile: readAgentProfileSettings(storage), sheet: readAgentSheet(storage).fields, credential: readPersonalCredential(storage),
    folder: { version: 1, ...readWorkFolder(storage) }, reports: parseItems(storage, fieldReportsKey), highlights: parseItems(storage, documentHighlightsKey), saved: Array.isArray(saved) ? saved.filter(validPersonalId) : [], theme: readTerminalTheme(storage), sound, ...overrides });
}
export function serializePersonalBackup(data) {
  const text = JSON.stringify({ format: personalBackupFormat, version: 1, exportedAt: new Date().toISOString(), data: validatePersonalBackupData(data) }, null, 2);
  if (bytes(text) > maxPersonalBackupBytes) throw new Error('O backup ultrapassa 32 MB. Use as exportações individuais para dividir seus registros.');
  return text;
}
export function parsePersonalBackup(text) {
  if (typeof text !== 'string' || bytes(text) > maxPersonalBackupBytes) throw new Error('Selecione um backup completo em JSON com até 32 MB.');
  let backup; try { backup = JSON.parse(text.replace(/^\uFEFF/, '')); } catch { throw new Error('Não foi possível ler o backup em JSON.'); }
  if (backup?.format !== personalBackupFormat || backup.version !== 1) throw new Error('Este arquivo não é um backup completo do Arquivo GMS. Para fichas, relatórios ou pastas individuais, use a importação da respectiva seção.');
  return validatePersonalBackupData(backup.data);
}
const signature = item => JSON.stringify(Object.keys(item).filter(key => key !== 'id').sort().map(key => [key, item[key]]));
function mergeItems(current, incoming) {
  const result = structuredClone(current), ids = new Set(result.map(item => item.id)), content = new Set(result.map(signature));
  for (const item of incoming) {
    if (content.has(signature(item))) continue;
    let id = item.id; while (ids.has(id)) id = personalId();
    result.push({ ...item, id }); ids.add(id); content.add(signature(item));
  }
  return result;
}
export function mergePersonalBackup(currentInput, incomingInput, { restoreIdentity = false } = {}) {
  const current = validatePersonalBackupData(currentInput), incoming = validatePersonalBackupData(incomingInput);
  const data = new Map([[workFolderKey, JSON.stringify(current.folder)]]);
  const memory = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  const folder = createWorkFolder(memory); folder.importData(incoming.folder);
  const blank = readAgentSheet().fields;
  const emptySheet = JSON.stringify(fieldsOf(current.sheet)) === JSON.stringify(fieldsOf(blank));
  return validatePersonalBackupData({ ...current,
    name: restoreIdentity || !current.name ? incoming.name : current.name,
    profile: restoreIdentity ? incoming.profile : current.profile,
    sheet: restoreIdentity || emptySheet ? incoming.sheet : current.sheet,
    credential: restoreIdentity || !current.credential ? incoming.credential : current.credential,
    folder: { version: 1, ...folder.state }, reports: mergeItems(current.reports, incoming.reports), highlights: mergeItems(current.highlights, incoming.highlights),
    saved: [...new Set([...current.saved, ...incoming.saved])], theme: restoreIdentity ? incoming.theme : current.theme, sound: restoreIdentity ? incoming.sound : current.sound,
  });
}
export function snapshotPersonalStorage(storage) {
  return Object.fromEntries(personalBackupKeys.map(key => [key, storage.getItem(key)]));
}
function encodedPersonalData(data, revision) {
  return {
    [agentNameStorageKey]: data.name, [agentProfileKey]: JSON.stringify(data.profile),
    [agentSheetKey]: JSON.stringify({ version: 1, revision, fields: data.sheet, updatedAt: new Date().toISOString() }),
    [personalCredentialKey]: data.credential ? JSON.stringify({ version: 1, items: [data.credential] }) : null,
    [workFolderKey]: JSON.stringify(data.folder), [fieldReportsKey]: JSON.stringify({ version: 1, items: data.reports }),
    [documentHighlightsKey]: JSON.stringify({ version: 1, items: data.highlights }), 'gms-saved': JSON.stringify(data.saved),
    [terminalThemeKey]: data.theme || null, 'gms-terminal-sound-v1': data.sound,
  };
}
export function importPersonalBackup(storage, incoming, { expected, restoreIdentity = false, current: draft } = {}) {
  const stored = readPersonalBackupData(storage), current = validatePersonalBackupData(draft || stored);
  const merged = mergePersonalBackup(current, incoming, { restoreIdentity });
  const revision = readAgentSheet(storage).revision + 1;
  const changes = encodedPersonalData(merged, revision);
  const transaction = commitPersonalStorage(storage, changes, expected);
  // Um rascunho em memória também pertence ao estado anterior. Desfazer não
  // descarta esse texto caso o armazenamento tenha voltado a funcionar.
  const memory = encodedPersonalData(current, revision + 1);
  const components = { name: agentNameStorageKey, profile: agentProfileKey, sheet: agentSheetKey, credential: personalCredentialKey, folder: workFolderKey, reports: fieldReportsKey, highlights: documentHighlightsKey, saved: 'gms-saved', theme: terminalThemeKey, sound: 'gms-terminal-sound-v1' };
  for (const [component, key] of Object.entries(components)) if (JSON.stringify(current[component]) !== JSON.stringify(stored[component])) transaction.before[key] = memory[key];
  return { ...transaction, data: merged };
}
