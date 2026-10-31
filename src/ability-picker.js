import { agentSheetSkills } from './agent-sheet-schema.js';
import catalog from './ability-catalog.json' with { type: 'json' };
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
 return `<div class="ability-select"><label for="ability-select-${index}">Escolher habilidade do manual</label><select id="ability-select-${index}" data-ability-select="${index}"><option value="">Selecione para preencher esta habilidade</option>${[...new Set(catalog.map(a=>a.species))].map(species=>`<optgroup label="${esc(species)}">${catalog.filter(a=>a.species===species).map(a=>`<option value="${a.id}">${esc(a.name)} · ${stages[a.stage]}${a.variant?' · '+a.variant:''}</option>`).join('')}</optgroup>`).join('')}</select><small>Selecione uma por vez. Os campos continuam editáveis. Adicionais: níveis 5, 10 e 15; ápice: nível 20. Confira condições e composição da espécie no texto.</small></div><div data-ability-actions="${index}"></div>`;
}
export function abilityActions(index,fields) {
 const text=fields[`habilidade_${index}_descricao`]||'';
 const dice=diceExpressions(text);
 const tests=[['Corpo','corpo'],['Agilidade','agilidade'],['Mente','mente'],['Coração','coracao'],['Alma','alma']].map(([label,id])=>[label,'attr_'+id]).concat(agentSheetSkills.map(skill=>[skill.label.replace(/^\*/,''),skill.id])).filter(([label])=>new RegExp(`Teste (?:de |em )?${label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:\\b|$)`,'i').test(text));
 return `${!dice.length&&text?'<p class="ability-damage"><strong>Dano / efeito:</strong> consulte a descrição integral abaixo; o manual não informa uma expressão simples de dados.</p>':''}${dice.length?`<p class="ability-damage"><strong>Dano e outros dados do efeito:</strong> ${dice.map(esc).join(' · ')}<br><small>Veja a descrição para saber a função de cada expressão e as condições de uso.</small></p>`:''}<div class="ability-roll-actions">${dice.map(expression=>{try{parseAbilityDice(expression);return `<button type="button" class="op-button" data-ability-dice="${esc(expression)}" data-ability-row="${index}">Rolar ${esc(expression)}</button>`;}catch{return `<small>${esc(expression)}: aplique os modificadores conforme o manual.</small>`;}}).join('')}${tests.map(([label,id])=>`<button type="button" class="op-button" data-sheet-check="${id}">Meu teste de ${label} · d20</button>`).join('')}</div>${tests.length?'<p class="op-local-note">Os testes usam os valores da sua ficha. Use apenas quando o teste for do seu agente; os alvos fazem seus próprios testes.</p>':''}${!dice.length&&!tests.length&&text?'<p class="op-local-note">Nenhum dado ou teste de atributo explícito identificado. Consulte as condições da descrição; habilidades sem rolagem não recebem um teste inventado.</p>':''}`;
}
