export const evidenceKinds = ['people', 'documents', 'notes', 'localities'];
export const evidenceStatuses = { hipotese: 'Hipótese', confirmado: 'Confirmada pelo agente' };
export const evidenceRef = (kind, id) => `${kind}:${id}`;
export const validEvidencePosition = value => value && ['x', 'y'].every(key => Number.isFinite(value[key]) && value[key] >= 0 && value[key] <= 6000);
export const evidencePosition = entry => validEvidencePosition(entry.position) ? { position: { x: entry.position.x, y: entry.position.y } } : {};
const inScope = (entry, filter) => !filter || (filter === 'avulsas' ? !entry.missionId : entry.missionId === filter);

export function evidenceNodes(state, filter = '') {
  return evidenceKinds.flatMap(kind => (state[kind] || []).filter(entry => inScope(entry, filter)).map(entry => ({ ref: evidenceRef(kind, entry.id), kind, entry })));
}

export function evidenceConnections(state, filter = '') {
  const refs = new Set(evidenceNodes(state, filter).map(node => node.ref));
  return (state.connections || []).filter(link => refs.has(link.from) && refs.has(link.to));
}

// As duas pontas são registros pessoais existentes. Nenhum vínculo dá acesso
// a arquivos reservados ou modifica as relações oficiais do acervo.
export function cleanEvidenceConnections(value, state) {
  const nodes = new Map(evidenceNodes(state).map(node => [node.ref, node.entry]));
  const seen = new Set();
  const validDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
  return (Array.isArray(value) ? value : []).filter(link => {
    if (!link || typeof link.id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(link.id) || seen.has(link.id) ||
      !nodes.has(link.from) || !nodes.has(link.to) || link.from === link.to ||
      typeof link.label !== 'string' || !link.label.trim() || link.label.length > 120 ||
      !Object.hasOwn(evidenceStatuses, link.status) || typeof link.body !== 'string' || link.body.length > 4000 ||
      !validDate(link.createdAt) || !validDate(link.updatedAt)) return false;
    seen.add(link.id); return true;
  }).map(({ id, from, to, label, status, body, createdAt, updatedAt }) => ({
    id, from, to, label, status, body, createdAt, updatedAt,
    missionId: nodes.get(from).missionId === nodes.get(to).missionId ? nodes.get(from).missionId : '',
  }));
}

export function defaultEvidencePositions(nodes) {
  const rows = [0, 0, 0];
  const occupied = nodes.filter(node => validEvidencePosition(node.entry.position)).map(node => node.entry.position);
  return new Map(nodes.map(node => {
    if (validEvidencePosition(node.entry.position)) return [node.ref, node.entry.position];
    const column = node.kind === 'people' ? 0 : node.kind === 'localities' ? 2 : 1;
    let position;
    do { position = { x: 44 + column * 350, y: 74 + rows[column]++ * 224 }; }
    while (occupied.some(other => Math.abs(other.x - position.x) < 270 && Math.abs(other.y - position.y) < 200));
    occupied.push(position);
    return [node.ref, position];
  }));
}
