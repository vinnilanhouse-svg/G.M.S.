import { specialtyAbilities } from './specialties.js';
import { agentSheetSkills } from './agent-sheet-schema.js';
import speciesCatalog from './ability-catalog.json' with { type: 'json' };
const catalog=[...speciesCatalog,...specialtyAbilities];
export { catalog as abilityCatalog };
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stages = {initial:'Inicial',acquired:'Adicional',apex:'Ápice da espécie'};
export function diceExpressions(text) {
 return [...new Set((String(text).match(/\b\d+[dD]\d+(?:\s*[+-]\s*[\p{L}\d]+)*/gu)||[]).map(value=>value.replace(/\s/g,'').toUpperCase()))];
}
export function parseAbilityDice(expression) {
 const match = /^(\d+)D(4|6|8|10|12|20|100)([+-]\d+)?$/i.exec(expression);
 if(!match || +match[1]<1 || +match[1]>30)throw Error('Esta expressão exige interpretação da descrição; use os dados e modificadores indicados pelo manual.');
 return {count:+match[1],sides:+match[2],modifier:Number(match[3]||0)};
}
export function abilityPicker(index) {
 return `<button type="button" class="op-text-button" data-open-ability-picker="${index}" aria-label="Escolher habilidade ${index}" aria-haspopup="dialog">Trocar</button>`;
}
export function abilityActions(index,fields) {
 const text=fields[`habilidade_${index}_descricao`]||'';
 const dice=diceExpressions(text);
 const tests=[['Corpo','corpo'],['Agilidade','agilidade'],['Mente','mente'],['Coração','coracao'],['Alma','alma']].map(([label,id])=>[label,'attr_'+id]).concat(agentSheetSkills.map(skill=>[skill.label.replace(/^\*/,''),skill.id])).filter(([label])=>new RegExp(`Teste (?:de |em )?${label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:\\b|$)`,'i').test(text));
 return `<div class="ability-roll-actions">${dice.map(expression=>{try{parseAbilityDice(expression);return `<button type="button" class="op-button" data-ability-dice="${esc(expression)}" data-ability-row="${index}">Rolar ${esc(expression)}</button>`;}catch{return `<small>${esc(expression)} · veja a descrição</small>`;}}).join('')}${tests.map(([label,id])=>`<button type="button" class="op-button" data-sheet-check="${id}">Teste de ${label}</button>`).join('')}</div>`;
}
