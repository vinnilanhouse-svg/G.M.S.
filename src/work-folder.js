import { cleanEvidenceConnections, evidenceKinds, evidenceNodes, evidencePosition, evidenceRef, validEvidencePosition } from './evidence-board-model.js';
import { noteIllustrationData, validNoteIllustrations } from './evidence-illustrations.js';
import { folderTagData, folderTagKinds, validFolderTags } from './work-folder-search.js';
import { createWorkFolderHistory } from './work-folder-history.js';

export const workFolderKey = 'gms-work-folder-v1';
export const workFolderCollections = ['notes', 'documents', 'people', 'localities', 'progress', 'connections', 'trash'];
export const personalMissionStages = ['Preparação', 'Em campo', 'Aguardando apoio', 'Em retirada', 'Retorno concluído'];
const emptyFolder = () => ({ missionId: '', notes: [], documents: [], people: [], localities: [], progress: [], connections: [], trash: [] });
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
  }).map(entry => {
    const { id, recordId, missionId, body, name, role, reference, createdAt, updatedAt } = entry;
    return { id, recordId, missionId, body, ...(kind === 'people' ? { name, role } : kind === 'localities' ? { name, reference } : {}), createdAt, updatedAt, ...evidencePosition(entry), ...folderTagData(entry) };
  });
}

function readProgress(value) {
  const seen = new Set();
  return (Array.isArray(value) ? value : []).filter(entry => {
    if (!entry || !validId(entry.id) || seen.has(entry.id) || !validId(entry.missionId) || !personalMissionStages.includes(entry.stage) ||
      !validText(entry.pending, 10000) || !validText(entry.returnReport, 20000) || !validDate(entry.createdAt) || !validDate(entry.updatedAt) ||
      !Array.isArray(entry.objectives) || entry.objectives.length > 100 || new Set(entry.objectives.map(item => item?.id)).size !== entry.objectives.length ||
      !entry.objectives.every(item => item && validId(item.id) && validText(item.text, 2000) && item.text.trim() && typeof item.done === 'boolean')) return false;
    seen.add(entry.id); return true;
  }).map(entry => {
    const { id, missionId, stage, pending, returnReport, objectives, createdAt, updatedAt } = entry;
    return { id, missionId, stage, pending, returnReport, objectives: objectives.map(({ id, text, done }) => ({ id, text, done })), createdAt, updatedAt, ...folderTagData(entry) };
  });
}

function readNotes(value) {
  const seen = new Set();
  return (Array.isArray(value) ? value : []).filter(note => {
    if (!note || !validId(note.id) || seen.has(note.id) || !validText(note.title, 120) || !validText(note.body, 20000) ||
      !optionalId(note.missionId) || !validDate(note.createdAt) || !validDate(note.updatedAt)) return false;
    seen.add(note.id); return true;
  }).map(entry => {
    const { id, title, body, missionId, createdAt, updatedAt } = entry;
    return { id, title, body, missionId, createdAt, updatedAt, ...evidencePosition(entry), ...noteIllustrationData(entry), ...folderTagData(entry) };
  });
}

function archivedConnections(value, note) {
  const state = { notes: [note], documents: [], people: [], localities: [] };
  const links = (Array.isArray(value) ? value : []).filter(link => link && (link.from === `notes:${note.id}` || link.to === `notes:${note.id}`));
  for (const link of links) for (const ref of [link.from, link.to]) {
    const match = typeof ref === 'string' && /^(notes|documents|people|localities):([a-zA-Z0-9_-]{1,100})$/.exec(ref);
    if (match && !state[match[1]].some(entry => entry.id === match[2])) state[match[1]].push({ id: match[2], missionId: '' });
  }
  return cleanEvidenceConnections(links, state);
}

function readTrash(value) {
  const seen = new Set();
  return (Array.isArray(value) ? value : []).flatMap(entry => {
    const note = readNotes([entry?.note])[0];
    if (!entry || !validId(entry.id) || seen.has(entry.id) || !note || !validDate(entry.deletedAt) || !validDate(entry.createdAt) || !validDate(entry.updatedAt) || !Array.isArray(entry.connections)) return [];
    seen.add(entry.id);
    return [{ id: entry.id, missionId: note.missionId, note, connections: archivedConnections(entry.connections, note), deletedAt: entry.deletedAt, createdAt: entry.createdAt, updatedAt: entry.updatedAt }];
  });
}

export function readWorkFolder(storage) {
  try {
    const value = JSON.parse(storage.getItem(workFolderKey));
    if (value?.version !== 1 || !Array.isArray(value.notes)) return emptyFolder();
    const notes = readNotes(value.notes);
    const state = { missionId: validId(value.missionId) ? value.missionId : '', notes, documents: readEntries(value.documents, 'documents'), people: readEntries(value.people, 'people'), localities: readEntries(value.localities, 'localities'), progress: readProgress(value.progress) };
    return { ...state, connections: cleanEvidenceConnections(value.connections, state), trash: readTrash(value.trash) };
  } catch { return emptyFolder(); }
}

// A importação rejeita o arquivo inteiro se algum registro for inválido.
// A leitura cotidiana continua tolerante a dados antigos do navegador.
export function validateWorkFolderData(value) {
  if (value && value.progress === undefined) value = { ...value, progress: [] };
  if (value && value.connections === undefined) value = { ...value, connections: [] };
  if (value && value.trash === undefined) value = { ...value, trash: [] };
  if (!value || value.version !== 1 || !optionalId(value.missionId) || workFolderCollections.some(key => !Array.isArray(value[key]))) throw new Error('A cópia da pasta está incompleta ou usa uma versão incompatível.');
  const clean = readWorkFolder({ getItem: () => JSON.stringify(value) });
  if (workFolderCollections.some(key => clean[key].length !== value[key].length)) throw new Error('A cópia contém registros inválidos ou repetidos. Nenhum registro foi importado.');
  if (evidenceKinds.some(kind => value[kind].some(entry => entry.position !== undefined && !validEvidencePosition(entry.position)))) throw new Error('A cópia contém posições inválidas no quadro de evidências.');
  const allNotes = [...value.notes, ...value.trash.map(entry => entry.note)];
  if (allNotes.some(entry => entry.position !== undefined && !validEvidencePosition(entry.position))) throw new Error('A cópia contém posições inválidas na lixeira.');
  if (allNotes.some(entry => entry.illustrations !== undefined && !validNoteIllustrations(entry.illustrations))) throw new Error('A cópia contém imagens de anotação inválidas. Escolha até quatro imagens do catálogo.');
  if (value.trash.some((entry, index) => entry.connections.length !== clean.trash[index].connections.length || (entry.note.tags !== undefined && !validFolderTags(entry.note.tags)))) throw new Error('A cópia contém registros inválidos na lixeira.');
  if (folderTagKinds.some(kind => value[kind].some(entry => entry.tags !== undefined && !validFolderTags(entry.tags)))) throw new Error('A cópia contém etiquetas inválidas. Use até 8 etiquetas diferentes de 32 caracteres.');
  return clean;
}

// Releitura antes de cada alteração preserva as outras anotações de abas abertas.
// Se o armazenamento falhar, o rascunho continua disponível durante a sessão.
export function createWorkFolder(storage) {
  let state = readWorkFolder(storage);
  let persisted = true;
  let batching = false;
  const history = createWorkFolderHistory(workFolderCollections, update => change(current => {
    const next = update(current);
    if (cleanEvidenceConnections(next.connections, next).length !== next.connections.length) throw new Error('Uma evidência desta ação não está mais disponível. As alterações atuais foram preservadas.');
    return next;
  }));
  function persist() {
    try { storage.setItem(workFolderKey, JSON.stringify({ version: 1, ...state })); persisted = true; }
    catch { persisted = false; }
  }
  function change(update, label = '') {
    if (persisted && !batching) state = readWorkFolder(storage);
    const before = state;
    const next = update(state);
    next.connections = cleanEvidenceConnections(next.connections, next);
    state = next;
    if (!batching) { persist(); if (label) history.record(before, next, label); }
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
  function changeProgress(id, update) {
    return change(current => {
      if (!current.progress.some(entry => entry.id === id)) throw new Error('Este acompanhamento não está mais disponível. Copie seu texto antes de atualizar a pasta.');
      return { ...current, progress: current.progress.map(entry => entry.id === id ? { ...update(entry), updatedAt: new Date().toISOString() } : entry) };
    });
  }
  return {
    get state() { return state; },
    get persisted() { return persisted; },
    get undoLabel() { return history.undoLabel; }, get redoLabel() { return history.redoLabel; },
    undo: history.undo, redo: history.redo,
    transaction(label, action) {
      if (batching) return action();
      if (persisted) state = readWorkFolder(storage);
      const before = structuredClone(state); batching = true;
      try { const result = action(); batching = false; persist(); history.record(before, state, label); return result; }
      catch (error) { state = before; batching = false; throw error; }
    },
    reload(force = false) { if (force) { persisted = true; history.clear(); } if (persisted) state = readWorkFolder(storage); return state; },
    setEntryTags(kind, id, tags) {
      if (!folderTagKinds.includes(kind) || !validFolderTags(tags)) throw new Error('Use até 8 etiquetas diferentes de 32 caracteres.');
      return change(current => {
        if (!current[kind].some(entry => entry.id === id)) throw new Error('Este registro foi removido em outra aba. Atualize a pasta.');
        return { ...current, [kind]: current[kind].map(entry => {
          if (entry.id !== id) return entry;
          const { tags: previous, ...rest } = entry;
          return { ...rest, ...folderTagData({ tags }), updatedAt: new Date().toISOString() };
        }) };
      });
    },
    selectMission(missionId) {
      if (missionId !== '' && !validId(missionId)) throw new Error('Missão inválida.');
      return change(current => ({ ...current, missionId }));
    },
    addNote(missionId = '', illustrations = []) {
      if (missionId !== '' && !validId(missionId)) throw new Error('Missão inválida.');
      if (!validNoteIllustrations(illustrations)) throw new Error('Escolha até quatro imagens diferentes do catálogo.');
      const now = new Date().toISOString();
      const id = newId();
      change(current => ({ ...current, notes: [{ id, title: '', body: '', missionId, createdAt: now, updatedAt: now, ...noteIllustrationData({ illustrations }) }, ...current.notes] }));
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
    deleteNote(id) {
      return change(current => {
        const note = current.notes.find(note => note.id === id); if (!note) throw new Error('Esta anotação já foi removida.');
        const now = new Date().toISOString();
        const archived = { id: newId(), missionId: note.missionId, note: structuredClone(note), connections: archivedConnections(current.connections, note), deletedAt: now, createdAt: now, updatedAt: now };
        return { ...current, notes: current.notes.filter(note => note.id !== id), trash: [archived, ...current.trash] };
      }, 'Enviar anotação para a lixeira');
    },
    restoreNote(trashId) {
      let restoredId; let restoredLinks = 0; let unavailableLinks = 0;
      change(current => {
        const item = current.trash.find(entry => entry.id === trashId); if (!item) throw new Error('Esta anotação não está mais na lixeira.');
        restoredId = current.notes.some(note => note.id === item.note.id) ? newId() : item.note.id;
        const note = { ...item.note, id: restoredId, updatedAt: new Date().toISOString() };
        const next = { ...current, notes: [note, ...current.notes], connections: [...current.connections], trash: current.trash.filter(entry => entry.id !== trashId).map(entry => ({ ...entry, connections: [...entry.connections] })) };
        for (const original of item.connections) {
          const remap = ref => ref === `notes:${item.note.id}` ? `notes:${restoredId}` : ref;
          const link = { ...original, from: remap(original.from), to: remap(original.to) };
          if (cleanEvidenceConnections([link], next).length) {
            if (!next.connections.some(existing => ['from', 'to', 'label', 'status', 'body'].every(key => existing[key] === link[key]))) {
              if (next.connections.some(existing => existing.id === link.id)) link.id = newId();
              next.connections.push(link); restoredLinks++;
            }
          } else {
            const pending = next.trash.find(entry => link.from === `notes:${entry.note.id}` || link.to === `notes:${entry.note.id}`);
            if (pending) { if (!pending.connections.some(existing => existing.id === link.id)) pending.connections.push(link); }
            else unavailableLinks++;
          }
        }
        return next;
      }, 'Restaurar anotação');
      return { id: restoredId, restoredLinks, unavailableLinks, persisted };
    },
    permanentlyDeleteNote(trashId) {
      let removed;
      const result = change(current => { removed = current.trash.find(item => item.id === trashId); return { ...current, trash: current.trash.filter(item => item.id !== trashId) }; });
      if (removed) history.forget({ notes: new Set([removed.note.id]), trash: new Set([removed.id]), connections: new Set(removed.connections.map(link => link.id)) });
      return result;
    },
    setNoteIllustrations(id, illustrations) {
      if (!validNoteIllustrations(illustrations)) throw new Error('Escolha até quatro imagens diferentes do catálogo.');
      return change(current => {
        if (!current.notes.some(note => note.id === id)) throw new Error('Esta anotação foi excluída em outra aba. Atualize a pasta.');
        return { ...current, notes: current.notes.map(note => {
          if (note.id !== id) return note;
          const { illustrations: previous, ...rest } = note;
          return { ...rest, ...noteIllustrationData({ illustrations }), updatedAt: new Date().toISOString() };
        }) };
      });
    },
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
    moveEvidence(ref, position) {
      if (!validEvidencePosition(position)) throw new Error('Posição inválida no quadro de evidências.');
      return change(current => {
        const node = evidenceNodes(current).find(node => node.ref === ref);
        if (!node) throw new Error('Este registro foi removido em outra aba. Atualize o quadro.');
        return { ...current, [node.kind]: current[node.kind].map(entry => entry.id === node.entry.id ? { ...entry, ...evidencePosition({ position }) } : entry) };
      }, 'Mover cartão');
    },
    organizeEvidence(refs) {
      return change(current => {
        const selected = new Set(refs);
        const next = { ...current };
        for (const kind of evidenceKinds) next[kind] = current[kind].map(entry => {
          if (!selected.has(evidenceRef(kind, entry.id))) return entry;
          const { position, ...rest } = entry; return rest;
        });
        return next;
      }, 'Organizar cartões');
    },
    saveConnection({ id = '', from, to, label, status = 'hipotese', body = '' }) {
      const now = new Date().toISOString();
      const nextId = id || newId();
      change(current => {
        if (id && !current.connections.some(link => link.id === id)) throw new Error('Esta ligação foi removida em outra aba. Atualize o quadro.');
        const existing = current.connections.find(link => link.id === id);
        const candidate = { id: nextId, from, to, label: typeof label === 'string' ? label.trim() : label, status, body, createdAt: existing?.createdAt || now, updatedAt: now };
        if (!cleanEvidenceConnections([candidate], current).length) throw new Error('Escolha duas evidências diferentes, descreva a ligação e confira os limites dos campos.');
        return { ...current, connections: [candidate, ...current.connections.filter(link => link.id !== id)] };
      }, id ? 'Editar ligação' : 'Criar ligação');
      return nextId;
    },
    removeConnection(id) { return change(current => ({ ...current, connections: current.connections.filter(link => link.id !== id) }), 'Remover ligação'); },
    startProgress(missionId, objectives = []) {
      if (!validId(missionId) || !Array.isArray(objectives) || objectives.length > 100 || !objectives.every(text => validText(text, 2000) && text.trim())) throw new Error('Confira a missão e os objetivos do acompanhamento.');
      let id = newId();
      const now = new Date().toISOString();
      change(current => {
        const existing = current.progress.find(entry => entry.missionId === missionId);
        if (existing) { id = existing.id; return current; }
        return { ...current, progress: [{ id, missionId, stage: 'Preparação', pending: '', returnReport: '', objectives: objectives.map((text, index) => ({ id: `objetivo-${index + 1}`, text, done: false })), createdAt: now, updatedAt: now }, ...current.progress] };
      });
      return id;
    },
    updateProgress(id, field, value) {
      if (!['stage', 'pending', 'returnReport'].includes(field) || typeof value !== 'string' || (field === 'stage' ? !personalMissionStages.includes(value) : value.length > (field === 'pending' ? 10000 : 20000))) throw new Error('Confira os campos do andamento pessoal.');
      return changeProgress(id, entry => ({ ...entry, [field]: value }));
    },
    toggleObjective(id, objectiveId, done) {
      if (typeof done !== 'boolean') throw new Error('Objetivo inválido.');
      return changeProgress(id, entry => {
        if (!entry.objectives.some(item => item.id === objectiveId)) throw new Error('Este objetivo foi removido em outra aba.');
        return { ...entry, objectives: entry.objectives.map(item => item.id === objectiveId ? { ...item, done } : item) };
      });
    },
    addObjective(id, text) {
      if (!validText(text, 2000) || !text.trim()) throw new Error('Escreva um objetivo com até 2.000 caracteres.');
      return changeProgress(id, entry => {
        if (entry.objectives.length >= 100) throw new Error('Este acompanhamento já tem 100 objetivos.');
        return { ...entry, objectives: [...entry.objectives, { id: newId(), text: text.trim(), done: false }] };
      });
    },
    removeObjective(id, objectiveId) { return changeProgress(id, entry => ({ ...entry, objectives: entry.objectives.filter(item => item.id !== objectiveId) })); },
    importData(data) {
      const incoming = validateWorkFolderData({ ...data, version: 1 });
      const counts = { added: 0, copied: 0, skipped: 0 };
      const result = change(current => {
        const next = { ...current, missionId: current.missionId || incoming.missionId };
        const references = new Map();
        for (const key of workFolderCollections) {
          const content = entry => JSON.stringify(Object.keys(entry).filter(field => field !== 'id').sort().map(field => [field, entry[field]]));
          const knownContent = new Map(current[key].map(entry => [content(entry), entry.id]));
          const ids = new Set(current[key].map(entry => entry.id));
          const added = [];
          for (const original of incoming[key]) {
            const entry = key === 'connections' ? { ...original, from: references.get(original.from), to: references.get(original.to) } : key === 'trash' ? { ...original, connections: original.connections.map(link => {
              const remap = ref => ref === `notes:${original.note.id}` ? ref : references.get(ref) || ref;
              return { ...link, from: remap(link.from), to: remap(link.to) };
            }) } : original;
            const signature = content(entry);
            if (knownContent.has(signature)) {
              if (evidenceKinds.includes(key)) references.set(evidenceRef(key, original.id), evidenceRef(key, knownContent.get(signature)));
              counts.skipped++; continue;
            }
            let id = entry.id;
            if (ids.has(id)) { do { id = newId(); } while (ids.has(id)); counts.copied++; }
            added.push({ ...entry, id }); ids.add(id); knownContent.set(signature, id); counts.added++;
            if (evidenceKinds.includes(key)) references.set(evidenceRef(key, original.id), evidenceRef(key, id));
          }
          next[key] = [...added, ...current[key]];
        }
        return next;
      });
      return { ...result, ...counts };
    },
  };
}

export function operationalMissions(records) {
  const missions = records.filter(record => record.kind === 'missao' && !record.unlisted);
  const isClosed = record => /^(encerrad[ao]|concluíd[ao]|cancelad[ao]|arquivad[ao])$/i.test(record.status);
  const active = missions.filter(record => !isClosed(record));
  active.sort((a, b) => Number(b.status === 'Contato perdido') - Number(a.status === 'Contato perdido') || b.date.localeCompare(a.date));
  return { missions, active, closed: missions.filter(isClosed) };
}
