export const workFolderKey = 'gms-work-folder-v1';
const emptyFolder = () => ({ missionId: '', notes: [] });
const validId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const validDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value));

export function readWorkFolder(storage) {
  try {
    const value = JSON.parse(storage.getItem(workFolderKey));
    if (value?.version !== 1 || !Array.isArray(value.notes)) return emptyFolder();
    const seen = new Set();
    const notes = value.notes.filter(note => {
      if (!note || !validId(note.id) || seen.has(note.id) || typeof note.title !== 'string' ||
        note.title.length > 120 || typeof note.body !== 'string' || note.body.length > 20000 ||
        (note.missionId !== '' && !validId(note.missionId)) || !validDate(note.createdAt) || !validDate(note.updatedAt)) return false;
      seen.add(note.id);
      return true;
    }).map(({ id, title, body, missionId, createdAt, updatedAt }) => ({ id, title, body, missionId, createdAt, updatedAt }));
    return { missionId: validId(value.missionId) ? value.missionId : '', notes };
  } catch { return emptyFolder(); }
}

// Releitura antes de cada alteração preserva as outras anotações de abas abertas.
// Se o armazenamento falhar, o rascunho continua disponível durante a sessão.
export function createWorkFolder(storage) {
  let state = readWorkFolder(storage);
  let persisted = true;
  function change(update) {
    if (persisted) state = readWorkFolder(storage);
    const next = update(state);
    state = next;
    try { storage.setItem(workFolderKey, JSON.stringify({ version: 1, ...next })); persisted = true; }
    catch { persisted = false; }
    return { state, persisted };
  }
  return {
    get state() { return state; },
    get persisted() { return persisted; },
    reload() { if (persisted) state = readWorkFolder(storage); return state; },
    selectMission(missionId) {
      if (missionId !== '' && !validId(missionId)) throw new Error('Missão inválida.');
      return change(current => ({ ...current, missionId }));
    },
    addNote(missionId = '') {
      if (missionId !== '' && !validId(missionId)) throw new Error('Missão inválida.');
      const now = new Date().toISOString();
      const id = globalThis.crypto?.randomUUID?.() || `note-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      change(current => ({ ...current, notes: [{ id, title: '', body: '', missionId, createdAt: now, updatedAt: now }, ...current.notes] }));
      return id;
    },
    updateNote(id, field, value) {
      if (!['title', 'body', 'missionId'].includes(field) || typeof value !== 'string' ||
        value.length > (field === 'body' ? 20000 : field === 'title' ? 120 : 100) ||
        (field === 'missionId' && value !== '' && !validId(value))) throw new Error('Anotação inválida.');
      return change(current => {
        if (!current.notes.some(note => note.id === id)) throw new Error('Esta anotação foi excluída em outra aba. Copie seu texto antes de atualizar a pasta.');
        return { ...current, notes: current.notes.map(note => note.id === id ? { ...note, [field]: value, updatedAt: new Date().toISOString() } : note) };
      });
    },
    deleteNote(id) { return change(current => ({ ...current, notes: current.notes.filter(note => note.id !== id) })); },
  };
}

export function operationalMissions(records) {
  const missions = records.filter(record => record.kind === 'missao' && !record.unlisted);
  const isClosed = record => /^(encerrad[ao]|concluíd[ao]|cancelad[ao]|arquivad[ao])$/i.test(record.status);
  const active = missions.filter(record => !isClosed(record));
  active.sort((a, b) => Number(b.status === 'Contato perdido') - Number(a.status === 'Contato perdido') || b.date.localeCompare(a.date));
  return { missions, active, closed: missions.filter(isClosed) };
}
