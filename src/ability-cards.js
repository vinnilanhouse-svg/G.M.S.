import {abilityPicker} from './ability-picker.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const parts=['nome','descricao','acao','custo'];
export const filledAbility=(fields,index)=>parts.some(part=>String(fields[`habilidade_${index}_${part}`]||'').trim());
export function abilityCards(count,fields,field){
 return `<div class="ability-library-toolbar"><p><span data-ability-count></span> <span data-ability-count-label>habilidades</span> na ficha</p><div><button type="button" class="op-button" data-add-ability aria-haspopup="dialog">+ Adicionar habilidade</button><button type="button" class="op-text-button" data-manual-ability>Escrever uma habilidade</button></div></div><div class="ability-library-empty" data-empty-abilities><h3>Quais são suas habilidades?</h3><p>Adicione uma habilidade para consultar e rolar por aqui.</p></div><div class="ability-library">${Array.from({length:count},(_,i)=>{
 const index=i+1;
 return `<article class="ability-card" data-ability-card="${index}" ${filledAbility(fields,index)?'':'hidden'}><header><div><span class="ability-card-number">${String(index).padStart(2,'0')}</span><h3 data-ability-name></h3></div>${abilityPicker(index)}</header><div class="ability-card-facts" data-ability-facts></div><div data-ability-actions="${index}"></div><details class="ability-card-description"><summary>O que faz</summary><p data-ability-description></p></details><details class="ability-card-edit"><summary>Editar habilidade</summary><div>${parts.map(part=>field(`habilidade_${index}_${part}`,{label:({nome:'Nome da habilidade',descricao:'Descrição completa',acao:'Ação',custo:'Custo'})[part],area:part==='descricao'})).join('')}</div></details></article>`;
 }).join('')}</div><details class="ability-library-help"><summary>Sobre as rolagens</summary><p>Os botões rolam os dados indicados no texto. Confira se representam dano, cura ou bônus. Testes usam os valores do seu agente; os alvos fazem seus próprios testes. Custos e efeitos são aplicados por você.</p></details>`;
}
export function refreshAbilityCards(root,fields){
 const cards=[...root.querySelectorAll('[data-ability-card]')];if(!cards.length)return;
 const count=cards.filter(card=>filledAbility(fields,Number(card.dataset.abilityCard))).length;
 root.querySelector('[data-ability-count]').textContent=count;
 root.querySelector('[data-ability-count-label]').textContent=count===1?'habilidade':'habilidades';
 root.querySelector('[data-empty-abilities]').hidden=count>0||cards.some(card=>card.dataset.manualOpen==='true');
 root.querySelectorAll('[data-add-ability],[data-manual-ability]').forEach(button=>button.disabled=count>=cards.length);
 for(const card of cards){
  const index=Number(card.dataset.abilityCard),name=String(fields[`habilidade_${index}_nome`]||'').trim()||'Nova habilidade';
  card.hidden=!filledAbility(fields,index)&&card.dataset.manualOpen!=='true'&&!card.contains(document.activeElement);
  card.querySelector('[data-ability-name]').textContent=name;
  card.querySelector('[data-open-ability-picker]').setAttribute('aria-label',`Trocar ${name}`);
  card.querySelector('[data-ability-description]').textContent=fields[`habilidade_${index}_descricao`]||'A descrição ainda não foi preenchida.';
  const facts=['acao','custo'].filter(part=>{const value=fields[`habilidade_${index}_${part}`];return value&& !/^consulte a descri/i.test(value);});
  card.querySelector('[data-ability-facts]').innerHTML=facts.map(part=>`<span title="${esc(fields[`habilidade_${index}_${part}`])}"><small>${part==='acao'?(/^aç/i.test(fields[`habilidade_${index}_${part}`])?'':'Uso'):'Custo'}</small>${esc(fields[`habilidade_${index}_${part}`])}</span>`).join('');
 }
}
export function bindAbilityCards(root,getFields){
 const cards=[...root.querySelectorAll('[data-ability-card]')];if(!cards.length)return;
 root.querySelector('[data-add-ability]').addEventListener('click',()=>{
  const fields=getFields();const card=cards.find(card=>!filledAbility(fields,Number(card.dataset.abilityCard)));
  card?.querySelector('[data-open-ability-picker]').click();
 });
 root.querySelector('[data-manual-ability]').addEventListener('click',()=>{
  const fields=getFields();const card=cards.find(card=>!filledAbility(fields,Number(card.dataset.abilityCard)));if(!card)return;
  card.dataset.manualOpen='true';refreshAbilityCards(root,fields);
  card.querySelector('.ability-card-edit').open=true;
  card.scrollIntoView({block:'center',behavior:'instant'});card.querySelector('[data-sheet-field]').focus({preventScroll:true});
 });
}
export function refreshAttackCards(root,fields){
 const cards=[...root.querySelectorAll('[data-attack-card]')];
 const filled=card=>['nome','dano','atributo','tipo'].some(part=>fields[`ataque_${card.dataset.attackCard}_${part}`]);
 const empty=cards.find(card=>!filled(card));
 for(const card of cards){
  const index=card.dataset.attackCard;
  card.hidden=!filled(card)&&card!==empty&&!card.open;
  card.querySelector('[data-attack-name]').textContent=fields[`ataque_${index}_nome`]||(filled(card)?'Ataque sem nome':'+ Adicionar ataque');
  card.querySelector('[data-attack-damage]').textContent=fields[`ataque_${index}_dano`];
 }
}
