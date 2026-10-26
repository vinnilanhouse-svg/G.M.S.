import { validPersonalDate, validPersonalId, personalId } from './personal-records.js';
import { getEvidenceIllustration } from './evidence-illustrations.js';

export const fieldReportsKey = 'gms-field-reports-v1';
export const fieldReportFormat = 'arquivo-gms-relatorio-de-campo';
export const reportSections = [
  ['summary', 'Objeto e objetivos'], ['account', 'Relato de campo'],
  ['findings', 'Constatações e evidências'], ['hypotheses', 'Hipóteses e questões pendentes'],
  ['conclusion', 'Conclusão e encaminhamentos'], ['references', 'Referências documentais'],
];
export const reportFields = {
  code: ['Código do relatório', 40], title: ['Título', 160], author: ['Agente responsável', 120],
  registry: ['Matrícula', 40], date: ['Data do registro', 10], department: ['Departamento', 120],
  access: ['Classificação', 20], status: ['Situação do documento', 20],
  missionId: ['Missão vinculada', 100], mission: ['Identificação da missão', 200],
  team: ['Equipe / participantes', 600], location: ['Local / coordenadas', 600],
  ...Object.fromEntries(reportSections.map(([key, label]) => [key, [label, 20000]])),
  signature: ['Assinatura / identificação do responsável', 160],
};
export function validateFieldReport(value) {
  if (!value || !validPersonalId(value.id) || !validPersonalDate(value.createdAt) || !validPersonalDate(value.updatedAt)) throw new Error('Relatório incompatível ou incompleto.');
  const clean = { id: value.id, createdAt: value.createdAt, updatedAt: value.updatedAt };
  for (const [key, [label, max]] of Object.entries(reportFields)) {
    if (typeof value[key] !== 'string' || value[key].length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(value[key])) throw new Error(`Confira o campo ${label} do relatório.`);
    clean[key] = value[key];
  }
  if (!['Público', 'Restrito', 'Censurado'].includes(clean.access) || !['Rascunho', 'Concluído'].includes(clean.status) || (clean.missionId && !validPersonalId(clean.missionId)) || !/^\d{4}-\d{2}-\d{2}$/.test(clean.date) || !Number.isFinite(Date.parse(clean.date))) throw new Error('Confira a data, a missão e a classificação do relatório.');
  return clean;
}
export function newFieldReport({ mission, author = '', registry = '' } = {}) {
  const now = new Date().toISOString();
  const number = new Uint32Array(1); crypto.getRandomValues(number);
  const missionNumber = mission?.code?.match(/\d+/)?.[0] || 'AVULSO';
  const date = new Date().toLocaleDateString('sv-SE');
  return validateFieldReport({ ...Object.fromEntries(Object.keys(reportFields).map(key => [key, ''])),
    id: personalId(), createdAt: now, updatedAt: now, code: `REL-${missionNumber}-${String(100 + number[0] % 900)}`,
    title: 'Relatório de campo', author, registry, signature: author, date, department: 'Operações de Campo', access: 'Restrito', status: 'Rascunho',
    missionId: mission?.id || '', mission: mission ? `${mission.code} · ${mission.title}` : '',
  });
}
export function serializeFieldReport(report) {
  return JSON.stringify({ format: fieldReportFormat, version: 1, report: validateFieldReport(report) }, null, 2);
}
export function parseFieldReport(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > 2 * 1024 * 1024) throw new Error('Selecione um relatório em JSON com até 2 MB.');
  let data;
  try { data = JSON.parse(text.replace(/^\uFEFF/, '')); } catch { throw new Error('Não foi possível ler o relatório em JSON.'); }
  if (data?.format !== fieldReportFormat || data.version !== 1) throw new Error('Selecione um relatório exportado pelo Arquivo GMS.');
  return validateFieldReport(data.report);
}

// Um recorte explícito da pasta, sem documentos excluídos ou metadados de fichas
// reservadas. O texto copiado continua pessoal; não altera a missão do acervo.
export function reportSources(state, records, missionId = '') {
  const available = records.filter(record => !record.unlisted);
  const sources = [];
  for (const kind of ['notes', 'documents', 'people', 'localities']) {
    for (const entry of state[kind] || []) {
      if (missionId && (missionId === 'avulsas' ? Boolean(entry.missionId) : entry.missionId !== missionId)) continue;
      const record = available.find(record => record.id === entry.recordId);
      if (kind === 'documents' && !record) continue;
      const label = { notes: 'Anotação', documents: 'Documento', people: 'Pessoa de interesse', localities: 'Localidade' }[kind];
      const title = kind === 'notes' ? entry.title || 'Anotação sem título' : kind === 'documents' ? `${record.code} · ${record.title}` : entry.name || 'Registro sem nome';
      const details = [entry.role, entry.reference, entry.body, ...(entry.illustrations || []).map(id => getEvidenceIllustration(id)?.label).filter(Boolean)];
      if (kind !== 'documents' && record) details.push(`Referência: ${record.code} · ${record.title}`);
      sources.push({ id: `${kind}:${entry.id}`, label, title, text: `[${label}: ${title}]\n${details.filter(Boolean).join('\n')}` });
    }
  }
  const progress = (state.progress || []).find(item => item.missionId === missionId);
  if (progress) sources.push({ id: `progress:${progress.id}`, label: 'Andamento pessoal', title: 'Objetivos e retorno de campo', text: [`[Andamento pessoal: ${progress.stage}]`, ...progress.objectives.map(item => `${item.done ? '[x]' : '[ ]'} ${item.text}`), progress.pending, progress.returnReport].filter(Boolean).join('\n') });
  return sources;
}
export function appendReportSources(current, sources) {
  const next = [current.trimEnd(), ...sources.map(source => source.text)].filter(Boolean).join('\n\n');
  if (next.length > 20000) throw new Error('Os registros ultrapassam o limite de 20.000 caracteres desta seção. Selecione menos itens.');
  return next;
}
