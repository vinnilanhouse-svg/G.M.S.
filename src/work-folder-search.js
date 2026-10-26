import { evidenceConnections } from './evidence-board-model.js';
import { getEvidenceIllustration, noteIllustrations } from './evidence-illustrations.js';

export const folderTagKinds = ['notes', 'documents', 'people', 'localities', 'progress'];
export const folderSearchKinds = { notes: 'Anotações', documents: 'Documentos', people: 'Pessoas de interesse', localities: 'Localidades', progress: 'Andamento pessoal', connections: 'Ligações de evidências' };
export const normalizeFolderText = value => String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR');
const tidy = value => value.trim().replace(/\s+/g, ' ');
export const validFolderTags = value => Array.isArray(value) && value.length <= 8 && value.every(tag => typeof tag === 'string' && tidy(tag).length > 0 && tag.length <= 32 && !tag.includes(',')) && new Set(value.map(tag => normalizeFolderText(tidy(tag)))).size === value.length;
export function cleanFolderTags(value) {
  const tags = []; const seen = new Set();
  for (const valueTag of Array.isArray(value) ? value : []) {
    if (typeof valueTag !== 'string') continue;
    const tag = tidy(valueTag); const key = normalizeFolderText(tag);
    if (!tag || tag.length > 32 || tag.includes(',') || seen.has(key)) continue;
    seen.add(key); tags.push(tag); if (tags.length === 8) break;
  }
  return tags;
}
export function folderTagData(entry) { const tags = cleanFolderTags(entry.tags); return tags.length ? { tags } : {}; }
export function parseFolderTags(text) {
  const tags = String(text).split(',').map(tidy).filter(Boolean);
  if (tags.some(tag => tag.length > 32)) throw new Error('Cada etiqueta pode ter até 32 caracteres.');
  const unique = [...new Map(tags.map(tag => [normalizeFolderText(tag), tag])).values()];
  if (unique.length > 8) throw new Error('Use até 8 etiquetas, separadas por vírgulas.');
  return unique;
}
const scoped = (entry, missionId) => !missionId || (missionId === 'avulsas' ? !entry.missionId : entry.missionId === missionId);
export function folderSearchUrl({ query = '', missionId = '', tag = '', kind = '' } = {}) {
  const params = new URLSearchParams({ aba: 'busca' });
  if (query) params.set('q', query.slice(0, 200));
  if (missionId) params.set('missao', missionId);
  if (tag) params.set('etiqueta', tag);
  if (kind) params.set('tipo', kind);
  return `#/pasta-de-trabalho?${params}`;
}
export function folderEntryUrl(kind, entry) {
  const tabs = { notes: 'anotacoes', documents: 'documentos', people: 'pessoas', localities: 'localidades', progress: 'andamento', connections: 'evidencias' };
  const params = new URLSearchParams({ aba: tabs[kind], ...(entry.missionId ? { missao: entry.missionId } : {}) });
  params.set(kind === 'notes' ? 'nota' : kind === 'connections' ? 'ligacao' : 'registro', entry.id);
  return `#/pasta-de-trabalho?${params}`;
}
export function folderTagOptions(state, missionId = '') {
  const tags = folderTagKinds.flatMap(kind => (state[kind] || []).filter(entry => scoped(entry, missionId)).flatMap(entry => cleanFolderTags(entry.tags)));
  return [...new Map(tags.map(tag => [normalizeFolderText(tag), tag])).values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export function searchWorkFolder(state, records, { query = '', missionId = '', tag = '', kind = '' } = {}) {
  const known = new Map(records.filter(record => !record.unlisted).map(record => [record.id, record]));
  const tokens = normalizeFolderText(query.slice(0, 200)).trim().split(/\s+/).filter(Boolean);
  const tagKey = normalizeFolderText(tag);
  const indexed = folderTagKinds.flatMap(collection => (state[collection] || []).filter(entry => scoped(entry, missionId)).map(entry => {
    const record = known.get(entry.recordId); const mission = known.get(entry.missionId);
    const title = collection === 'documents' ? record?.title || 'Documento indisponível' : collection === 'progress' ? `Andamento · ${mission?.title || 'Missão indisponível'}` : entry.title?.trim() || entry.name?.trim() || (collection === 'notes' ? 'Anotação sem título' : 'Registro sem nome');
    const body = collection === 'progress' ? [entry.pending, entry.returnReport, ...entry.objectives.map(item => item.text)].filter(Boolean).join('\n') : entry.body;
    const tags = cleanFolderTags(entry.tags);
    const subtitle = [record?.code, entry.role, entry.reference, entry.stage, mission?.code, mission?.title].filter(Boolean).join(' · ');
    const images = collection === 'notes' ? noteIllustrations(entry).map(id => getEvidenceIllustration(id).label).join(' ') : '';
    return { kind: collection, id: entry.id, title, body, subtitle, tags, missionId: entry.missionId, updatedAt: entry.updatedAt, url: folderEntryUrl(collection, entry), text: normalizeFolderText([title, subtitle, body, tags.join(' '), images].join(' ')) };
  }));
  const titles = new Map(indexed.map(entry => [`${entry.kind}:${entry.id}`, entry.title]));
  for (const link of evidenceConnections(state, missionId)) {
    const subtitle = `${titles.get(link.from)} → ${titles.get(link.to)}`;
    indexed.push({ kind: 'connections', id: link.id, title: link.label, body: link.body, subtitle, tags: [], missionId: link.missionId, updatedAt: link.updatedAt, url: folderEntryUrl('connections', link), text: normalizeFolderText([link.label, link.body, subtitle, link.status === 'hipotese' ? 'hipótese' : 'confirmada'].join(' ')) });
  }
  return indexed.filter(entry => (!kind || entry.kind === kind) && (!tagKey || entry.tags.some(label => normalizeFolderText(label) === tagKey)) && tokens.every(token => entry.text.includes(token))).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.title.localeCompare(b.title, 'pt-BR'));
}

export function folderSearchExcerpt(body, query, limit = 300) {
  const text = String(body || ''); if (text.length <= limit) return text;
  const normalized = normalizeFolderText(text);
  const matches = normalizeFolderText(query).trim().split(/\s+/).filter(Boolean).map(token => normalized.indexOf(token)).filter(index => index >= 0);
  const start = matches.length ? Math.max(0, Math.min(...matches) - 90) : 0;
  return `${start ? '…' : ''}${text.slice(start, start + limit)}${start + limit < text.length ? '…' : ''}`;
}
