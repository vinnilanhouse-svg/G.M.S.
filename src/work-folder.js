export const workFolderKey = 'gms-work-folder-v1';
const emptyFolder = () => ({ missionId: '', notes: [], documents: [], people: [], localities: [] });
const validId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const validDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
const optionalId = value => value === '' || validId(value);
const newId = () => globalThis.crypto?.randomUUID?.() || `entry-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
const validText = (value, max) => typeof value === 'string' && value.length <= max;

function readEntries(value, kind) {
  const seen = new Set();
  return (Array.isArray(value) ? value : []).filter(entry => {
    if (!entry || !validId(entry.id) || seen.has(entry.id) || !optionalId(entry.missionId) ||
      !validText(entry.body, 20000) || !validDate(entry.createdAt) || !validDate(entry.updatedAt) ||
      !(kind === 'documents' ? validId(entry.recordId) : optionalId(entry.recordId) && validText(entry.name, 120) &&
        (kind === 'people' ? validText(entry.role, 160) : validText(entry.reference, 240)))) return false;
    seen.add(entry.id);
    return true;
  }).map(({ id, recordId, missionId, body, name, role, reference, createdAt, updatedAt }) => ({ id, recordId, missionId, body, ...(kind === 'people' ? { name, role } : kind === 'localities' ? { name, reference } : {}), createdAt, updatedAt }));
}

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
    return { missionId: validId(value.missionId) ? value.missionId : '', notes, documents: readEntries(value.documents, 'documents'), people: readEntries(value.people, 'people'), localities: readEntries(value.localities, 'localities') };
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
  function updateEntry(kind, id, field, value) {
    const fields = kind === 'documents' ? ['body', 'missionId'] : ['name', kind === 'people' ? 'role' : 'reference', 'body', 'missionId', 'recordId'];
    if (!fields.includes(field) || !validText(value, field === 'body' ? 20000 : field === 'role' ? 160 : field === 'reference' ? 240 : field === 'name' ? 120 : 100) ||
      (['missionId', 'recordId'].includes(field) && !optionalId(value))) throw new Error('Confira os limites e o preenchimento dos campos deste registro.');
    return change(current => {
      if (!current[kind].some(entry => entry.id === id)) throw new Error('Este registro foi removido em outra aba. Copie suas observações antes de atualizar a pasta.');
      return { ...current, [kind]: current[kind].map(entry => entry.id === id ? { ...entry, [field]: value, updatedAt: new Date().toISOString() } : entry) };
    });
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
      const id = newId();
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
    addDocument(recordId, missionId = '') {
      if (!validId(recordId) || !optionalId(missionId)) throw new Error('Selecione um documento válido.');
      let id = newId();
      const now = new Date().toISOString();
      change(current => {
        const existing = current.documents.find(entry => entry.recordId === recordId && entry.missionId === missionId);
        if (existing) { id = existing.id; return current; }
        return { ...current, documents: [{ id, recordId, missionId, body: '', createdAt: now, updatedAt: now }, ...current.documents] };
      });
      return id;
    },
    addPerson({ name, role = '', recordId = '', missionId = '' }) {
      if (!validText(name, 120) || !name.trim() || !validText(role, 160) || !optionalId(recordId) || !optionalId(missionId)) throw new Error('Preencha o nome da pessoa e confira os campos.');
      const id = newId();
      const now = new Date().toISOString();
      change(current => ({ ...current, people: [{ id, name: name.trim(), role, recordId, missionId, body: '', createdAt: now, updatedAt: now }, ...current.people] }));
      return id;
    },
    addLocality({ name, reference = '', recordId = '', missionId = '' }) {
      if (!validText(name, 120) || !name.trim() || !validText(reference, 240) || !optionalId(recordId) || !optionalId(missionId)) throw new Error('Preencha o nome da localidade e confira os campos.');
      const id = newId();
      const now = new Date().toISOString();
      change(current => ({ ...current, localities: [{ id, name: name.trim(), reference, recordId, missionId, body: '', createdAt: now, updatedAt: now }, ...current.localities] }));
      return id;
    },
    updateDocument(id, field, value) { return updateEntry('documents', id, field, value); },
    updatePerson(id, field, value) { return updateEntry('people', id, field, value); },
    updateLocality(id, field, value) { return updateEntry('localities', id, field, value); },
    removeDocument(id) { return change(current => ({ ...current, documents: current.documents.filter(entry => entry.id !== id) })); },
    removePerson(id) { return change(current => ({ ...current, people: current.people.filter(entry => entry.id !== id) })); },
    removeLocality(id) { return change(current => ({ ...current, localities: current.localities.filter(entry => entry.id !== id) })); },
  };
}

export function operationalMissions(records) {
  const missions = records.filter(record => record.kind === 'missao' && !record.unlisted);
  const isClosed = record => /^(encerrad[ao]|concluíd[ao]|cancelad[ao]|arquivad[ao])$/i.test(record.status);
  const active = missions.filter(record => !isClosed(record));
  active.sort((a, b) => Number(b.status === 'Contato perdido') - Number(a.status === 'Contato perdido') || b.date.localeCompare(a.date));
  return { missions, active, closed: missions.filter(isClosed) };
}
