import { agentSheetFields, agentSheetSkills } from './agent-sheet-schema.js';

export const agentSheetKey = 'gms-agent-sheet-v1';
export const agentSheetBackupFormat = 'arquivo-gms-ficha-de-agente';
export const maxAgentSheetBytes = 20 * 1024 * 1024;
export const agentSheetAttributes = ['corpo', 'agilidade', 'mente', 'coracao', 'alma'];
export const editableAgentSheetFields = Object.keys(agentSheetFields).filter(name => !agentSheetFields[name].readOnly);
const defaults = () => Object.fromEntries(editableAgentSheetFields.map(name => [name, agentSheetFields[name].defaultValue]));
const nextExperience = [0, 0, 7, 10, 12, 15, 17, 20, 22, 25, 27, 30, 32, 35, 37, 40, 42, 45, 47, 50, 0];
const bytes = value => new TextEncoder().encode(value).length;

export function validateAgentSheetValue(name, value) {
  const field = Object.hasOwn(agentSheetFields, name) ? agentSheetFields[name] : null;
  if (!field || field.readOnly || typeof value !== 'string') throw new Error('Este campo não pode ser alterado.');
  if (field.options && !field.options.includes(value)) throw new Error(`Selecione uma opção válida para ${field.label}.`);
  if (!field.numeric) return value;
  const rule = field.numeric;
  const text = value.trim();
  if (!text && rule.allowBlank) return value;
  const number = Number(text.replace(',', '.'));
  if (!text || !Number.isFinite(number) || (rule.min !== null && number < rule.min) || (rule.max !== null && number > rule.max) || (rule.integer && Math.floor(number) !== number)) {
    const range = rule.min !== null && rule.max !== null ? `de ${rule.min} a ${rule.max}` : rule.min !== null ? `maior ou igual a ${rule.min}` : 'válido';
    throw new Error(`${field.label}: informe um número ${rule.integer ? 'inteiro ' : ''}${range}.`);
  }
  return String(number);
}

export function calculateAgentSheet(fields) {
  const values = Object.fromEntries(Object.entries(agentSheetFields).map(([name, field]) => [name, field.defaultValue]));
  for (const name of editableAgentSheetFields) if (Object.hasOwn(fields, name)) values[name] = fields[name];
  const n = name => { const value = Number(String(values[name] ?? '').replace(',', '.')); return Number.isFinite(value) ? value : 0; };
  const set = (name, value) => { values[name] = String(value); };
  set('pe_proximo', nextExperience[n('nivel')] || 0);
  set('vida_max', 20 + 2 * n('attr_corpo') + n('nivel'));
  const metal = values.especie === 'Constructo de Metal';
  set('recurso_nome', metal ? 'Pontos de Energia' : 'Pontos de Essência');
  set('essencia_max', metal ? 2 * n('nivel') + n('attr_coracao') : 2 * n('attr_alma') + n('nivel'));
  for (const skill of agentSheetSkills) {
    if (skill.attribute) set(`${skill.id}_base`, n(skill.attribute));
    if (skill.id === 'per_g30') set(`${skill.id}_bonus`, values.especie === 'Leprechaun' ? 5 : 0);
    set(`${skill.id}_total`, n(`${skill.id}_base`) + n(`${skill.id}_bonus`));
  }
  set('peso_max', 2 * n('attr_corpo'));
  let weight = 0;
  for (let index = 1; index <= 26; index++) weight += n(`item_${index}_peso`);
  set('peso_total', Math.round(weight * 1000000) / 1000000);
  for (const name of agentSheetAttributes) set(`grafico_${name}`, Math.max(0, Math.min(20, Math.round(n(`attr_${name}`)))));
  const resourceSegments = (current, maximum, segments) => Math.round(Math.max(0, Math.min(1, n(maximum) > 0 ? n(current) / n(maximum) : 0)) * segments);
  set('grafico_vida', 'v' + resourceSegments('vida_atual', 'vida_max', 15));
  set('grafico_essencia', (metal ? 'p' : 'e') + resourceSegments('essencia_atual', 'essencia_max', 16));
  const species = agentSheetFields.especie.options.indexOf(values.especie);
  set('icone_especie', species >= 0 && species < 22 ? `s${species + 1}` : 'empty');
  return values;
}

function validateFields(fields) {
  if (!fields || typeof fields !== 'object' || Array.isArray(fields) || Object.keys(fields).length !== editableAgentSheetFields.length || Object.keys(fields).some(name => !editableAgentSheetFields.includes(name))) throw new Error('A ficha está incompleta ou contém campos incompatíveis.');
  return Object.fromEntries(editableAgentSheetFields.map(name => [name, validateAgentSheetValue(name, fields[name])]));
}

export function readAgentSheet(storage) {
  try {
    const value = JSON.parse(storage.getItem(agentSheetKey));
    if (value?.version === 1 && Number.isSafeInteger(value.revision) && value.revision >= 0) return { version: 1, revision: value.revision, fields: validateFields(value.fields), updatedAt: typeof value.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt)) ? value.updatedAt : '' };
  } catch {}
  return { version: 1, revision: 0, fields: defaults(), updatedAt: '' };
}

export function createAgentSheetStore(storage) {
  let state = readAgentSheet(storage);
  let persisted = true;
  function save(fields, current) {
    state = { version: 1, revision: current.revision + 1, fields, updatedAt: new Date().toISOString() };
    try { storage.setItem(agentSheetKey, JSON.stringify(state)); persisted = true; } catch { persisted = false; }
    return { state, persisted };
  }
  return {
    get state() { return state; },
    get persisted() { return persisted; },
    reload() { if (persisted) state = readAgentSheet(storage); return state; },
    updateField(name, value) {
      const valid = validateAgentSheetValue(name, value);
      const current = persisted ? readAgentSheet(storage) : state;
      return save({ ...current.fields, [name]: valid }, current);
    },
    replace(fields, revision) {
      const validated = validateFields(fields);
      const current = persisted ? readAgentSheet(storage) : state;
      if (current.revision !== revision) throw new Error('Sua ficha foi alterada em outra aba. Abra a importação novamente para conferir a versão atual.');
      return save(validated, current);
    },
  };
}

export function serializeAgentSheet(state) {
  const text = JSON.stringify({ format: agentSheetBackupFormat, version: 1, exportedAt: new Date().toISOString(), fields: validateFields(state.fields) }, null, 2);
  if (bytes(text) > maxAgentSheetBytes) throw new Error('A ficha ultrapassa 20 MB. Reduza os textos antes de exportar.');
  return text;
}
export function parseAgentSheet(text) {
  if (typeof text !== 'string' || bytes(text) > maxAgentSheetBytes) throw new Error('Selecione uma ficha em JSON com até 20 MB.');
  let value;
  try { value = JSON.parse(text.replace(/^\uFEFF/, '')); } catch { throw new Error('Não foi possível ler o arquivo. Selecione uma ficha em JSON exportada pelo site.'); }
  if (value?.format !== agentSheetBackupFormat || value.version !== 1) throw new Error('Este arquivo não é uma ficha de agente compatível.');
  return validateFields(value.fields);
}
