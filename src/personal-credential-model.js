import { validPersonalDate } from './personal-records.js';
export const personalCredentialKey = 'gms-personal-credential-v1';
export const credentialFields = {
  name: ['Nome do agente', 100], codename: ['Codinome', 60], species: ['Espécie', 80], registry: ['Matrícula', 40],
  role: ['Cargo / função', 100], department: ['Departamento', 100], issued: ['Data de emissão', 10], photo: ['Retrato', 600000],
};
export function readPersonalCredential(storage) {
  try { const data = JSON.parse(storage.getItem(personalCredentialKey)); return data?.version === 1 && data.items?.[0] ? validatePersonalCredential(data.items[0]) : null; } catch { return null; }
}
export function validatePersonalCredential(value) {
  if (!value || value.id !== 'personal-agent' || !validPersonalDate(value.createdAt) || !validPersonalDate(value.updatedAt)) throw new Error('Credencial pessoal incompatível.');
  const item = { id: 'personal-agent', createdAt: value.createdAt, updatedAt: value.updatedAt };
  for (const [key, [label, max]] of Object.entries(credentialFields)) {
    if (typeof value[key] !== 'string' || value[key].length > max || (key !== 'photo' && /[\u0000-\u001F]/u.test(value[key]))) throw new Error(`Confira o campo ${label}.`);
    item[key] = value[key];
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.issued) || !Number.isFinite(Date.parse(item.issued))) throw new Error('Informe uma data de emissão válida.');
  if (item.photo && !/^data:image\/jpeg;base64,[a-zA-Z0-9+/]+=*$/u.test(item.photo)) throw new Error('O retrato deve ser uma imagem compatível.');
  return item;
}
export function newPersonalCredential(fields = {}, name = '') {
  const number = new Uint32Array(1); crypto.getRandomValues(number);
  const now = new Date().toISOString();
  return validatePersonalCredential({ id: 'personal-agent', createdAt: now, updatedAt: now,
    name: (fields.nome || name).slice(0, 100), codename: '', species: fields.especie === '-' ? '' : (fields.especie || ''),
    registry: `AGT-${1000 + number[0] % 9000}`, role: (fields.cargo || 'Agente de Campo').slice(0, 100), department: 'Operações de Campo', issued: new Date().toLocaleDateString('sv-SE'), photo: '',
  });
}
