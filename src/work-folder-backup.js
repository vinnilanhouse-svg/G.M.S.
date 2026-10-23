import { validateWorkFolderData, workFolderCollections } from './work-folder.js';

export const workFolderBackupFormat = 'arquivo-gms-pasta-de-trabalho';
export const maxWorkFolderBackupBytes = 20 * 1024 * 1024;
const byteLength = text => new TextEncoder().encode(text).length;

export function selectWorkFolderData(state, missionFilter = '') {
  const selected = { version: 1, missionId: missionFilter ? missionFilter === 'avulsas' ? '' : missionFilter : state.missionId };
  for (const key of workFolderCollections) selected[key] = (state[key] || []).filter(entry => !missionFilter || (missionFilter === 'avulsas' ? !entry.missionId : entry.missionId === missionFilter));
  return { version: 1, ...validateWorkFolderData(selected) };
}

export function serializeWorkFolderBackup(state, { missionFilter = '', exportedAt = new Date().toISOString() } = {}) {
  const text = JSON.stringify({ format: workFolderBackupFormat, version: 1, exportedAt, scope: missionFilter ? 'missao' : 'completa', data: selectWorkFolderData(state, missionFilter) }, null, 2);
  if (byteLength(text) > maxWorkFolderBackupBytes) throw new Error('A pasta ultrapassa 20 MB. Exporte os registros de uma missão por vez.');
  return text;
}

export function parseWorkFolderBackup(text) {
  if (typeof text !== 'string' || byteLength(text) > maxWorkFolderBackupBytes) throw new Error('Escolha uma cópia da pasta em JSON com até 20 MB.');
  let backup;
  try { backup = JSON.parse(text.replace(/^\uFEFF/, '')); }
  catch { throw new Error('Não foi possível ler este arquivo. Escolha a cópia em JSON gerada por “Exportar pasta”.'); }
  if (backup?.format !== workFolderBackupFormat || backup.version !== 1) throw new Error('Este arquivo não é uma cópia compatível da pasta de trabalho G.M.S.');
  return validateWorkFolderData(backup.data);
}

export function workFolderCounts(data) {
  const kinds = [['notes', 'anotação', 'anotações'], ['documents', 'documento', 'documentos'], ['people', 'pessoa de interesse', 'pessoas de interesse'], ['localities', 'localidade', 'localidades']];
  if (data.progress?.length) kinds.push(['progress', 'acompanhamento', 'acompanhamentos']);
  return kinds.map(([key, one, many]) => `${data[key].length} ${data[key].length === 1 ? one : many}`).join(' · ');
}

export function workFolderReadableText(state, records, { missionFilter = '', exportedAt = new Date().toISOString(), baseUrl = 'https://globalmonstersecurity.vercel.app/' } = {}) {
  const data = selectWorkFolderData(state, missionFilter);
  const known = new Map(records.filter(record => !record.unlisted).map(record => [record.id, record]));
  const missionLabel = id => !id ? 'Sem missão vinculada' : known.has(id) ? `${known.get(id).code} · ${known.get(id).title}` : 'Missão indisponível neste terminal';
  const recordLabel = id => known.has(id) ? `${known.get(id).code} · ${known.get(id).title}` : 'Arquivo indisponível neste terminal';
  const recordLink = id => known.has(id) ? `${baseUrl.replace(/\/$/, '')}/#/arquivo/${encodeURIComponent(id)}` : '';
  const lines = ['ARQUIVO GMS — PASTA DE TRABALHO', `Exportado em: ${new Date(exportedAt).toLocaleString('pt-BR')}`, `Conteúdo: ${missionFilter ? missionLabel(missionFilter === 'avulsas' ? '' : missionFilter) : 'Pasta completa'}`, `Missão em acompanhamento: ${missionLabel(data.missionId)}`, workFolderCounts(data), '', 'Registros pessoais. Os documentos abaixo mantêm vínculos com o acervo.', ''];
  for (const [key, title] of [['notes', 'ANOTAÇÕES'], ['documents', 'DOCUMENTOS'], ['people', 'PESSOAS DE INTERESSE'], ['localities', 'LOCALIDADES']]) {
    lines.push(title, '='.repeat(title.length));
    if (!data[key].length) lines.push('Nenhum registro.', '');
    for (const entry of data[key]) {
      lines.push(key === 'documents' ? recordLabel(entry.recordId) : key === 'notes' ? entry.title.trim() || 'Anotação sem título' : entry.name.trim() || (key === 'people' ? 'Pessoa sem nome' : 'Localidade sem nome'));
      lines.push(`Missão: ${missionLabel(entry.missionId)}`);
      if (entry.role) lines.push(`Relação com a investigação: ${entry.role}`);
      if (entry.reference) lines.push(`Referência / coordenadas: ${entry.reference}`);
      if (entry.recordId && key !== 'documents') lines.push(`Ficha vinculada: ${recordLabel(entry.recordId)}`);
      if (entry.recordId && recordLink(entry.recordId)) lines.push(`Consultar: ${recordLink(entry.recordId)}`);
      lines.push(`Criado em: ${new Date(entry.createdAt).toLocaleString('pt-BR')}`, `Atualizado em: ${new Date(entry.updatedAt).toLocaleString('pt-BR')}`, '', entry.body || 'Sem observações.', '', '—', '');
    }
  }
  if (data.progress.length) {
    lines.push('ANDAMENTO PESSOAL', '=================');
    for (const entry of data.progress) lines.push(`Missão: ${missionLabel(entry.missionId)}`, `Etapa pessoal: ${entry.stage}`, `Atualizado em: ${new Date(entry.updatedAt).toLocaleString('pt-BR')}`, '', 'OBJETIVOS', ...entry.objectives.map(item => `[${item.done ? 'x' : ' '}] ${item.text}`), '', 'PENDÊNCIAS', entry.pending || 'Nenhuma pendência registrada.', '', 'RELATÓRIO DE RETORNO — RASCUNHO PESSOAL', entry.returnReport || 'Nenhum rascunho registrado.', '', '—', '');
  }
  return lines.join('\n');
}
