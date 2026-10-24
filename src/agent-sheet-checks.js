import { agentSheetFields, agentSheetSkills } from './agent-sheet-schema.js';
import { agentSheetAttributes, calculateAgentSheet } from './agent-sheet-model.js';

const combatSkills = new Set(['per_g20', 'per_g21', 'per_g26']);

// Manual Monstrão: 3.1 (perícias), 5 (testes) e 6.2 (ataques).
// O 20 natural é falha crítica nos ataques; o capítulo 5 não dá essa
// exceção aos testes gerais de atributo, inclusive quando o valor é 20.
export function describeAgentCheck(fields, id) {
  const values = calculateAgentSheet(fields);
  if (agentSheetAttributes.some(attribute => id === `attr_${attribute}`)) {
    const label = agentSheetFields[id].label.split(' (')[0];
    return { id, kind: 'attribute', label, target: Number(values[id]), breakdown: `${label}: ${values[id] || '0'}`, combat: false, blocked: '' };
  }
  const skill = agentSheetSkills.find(item => item.id === id);
  if (!skill) throw new Error('Este campo não possui um teste disponível.');
  const base = Number(values[`${id}_base`]);
  const bonus = Number(values[`${id}_bonus`]);
  const label = skill.label.replace(/^\*/, '');
  return { id, kind: 'skill', label, target: Number(values[`${id}_total`]), breakdown: `Base ${base} ${bonus < 0 ? '−' : '+'} Bônus ${Math.abs(bonus)} = Total ${values[`${id}_total`]}`, combat: combatSkills.has(id), blocked: skill.label.startsWith('*') && bonus <= 0 ? `${label} exige treinamento. Registre o ponto de treinamento na coluna Bônus da ficha antes de fazer o teste.` : '' };
}

export function resolveAgentCheck(check, result) {
  if (check.blocked) throw new Error(check.blocked);
  if (!Number.isFinite(check.target) || !Number.isInteger(result) || result < 1 || result > 20) throw new Error('Não foi possível avaliar este teste.');
  if (check.combat && result === 20) return { outcome: 'critical-failure', success: false, verdict: 'Falha crítica', comparison: '20 natural em um teste de ataque.' };
  if (result === check.target) return { outcome: 'critical-success', success: true, verdict: 'Sucesso crítico', comparison: `${result} = ${check.target} · resultado igual ao valor do teste.` };
  if (result < check.target) return { outcome: 'success', success: true, verdict: 'Sucesso', comparison: `${result} < ${check.target} · resultado menor que o valor do teste.` };
  return { outcome: 'failure', success: false, verdict: 'Falha', comparison: `${result} > ${check.target} · resultado maior que o valor do teste.` };
}
