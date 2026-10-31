import {abilityCatalog} from './ability-picker.js';
import {speciesIcons,constructIcons} from './species-icons.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const keys={'Abissais':'abissais','Anjo':'anjo','Caipora':'caipora','Capelobo':'capelobo','Centauro':'centauro','Constructos':'constructo','Corpo Seco e Bradador':'corpo-seco','Curupira':'curupira','Demônio':'demonio','Fada':'fada','Górgona':'gorgona','Humano':'humano','Leprechaun':'leprechaun','Lobisomem':'lobisomem','Múmia':'mumia','Ogro':'ogro','Poltergeist':'poltergeist','Saci':'saci','Salamandra':'salamandra','Vampiro':'vampiro'};
const stageLabel=ability=>ability.specialty?`Nível ${ability.level}${ability.level===1?' · Passiva':''}`:({initial:'Inicial · nível 1',acquired:'Adicional · níveis 5, 10 e 15',apex:'Ápice da espécie · nível 20'})[ability.stage];
export function bindAbilityWizard(root,{icon,onChoose}){
 if(!root.querySelector('[data-open-ability-picker]'))return;
 const dialog=document.createElement('dialog');dialog.className='ability-wizard';dialog.setAttribute('aria-labelledby','ability-wizard-title');
 dialog.innerHTML='<div class="ability-wizard-chrome"><header><div><span data-wizard-step></span><h2 id="ability-wizard-title" tabindex="-1"></h2></div><button type="button" class="op-text-button" data-wizard-close>Fechar ×</button></header><nav aria-label="Etapas da escolha"><button type="button" class="op-text-button" data-wizard-back>← Voltar</button><span data-wizard-trail></span></nav></div><div class="ability-wizard-content"></div><p class="ability-wizard-feedback" role="status"></p>';
 root.append(dialog);
 let step=0,type='',group='',row=0,opener=null;
 const content=dialog.querySelector('.ability-wizard-content');
 function render(){
  dialog.querySelector('[data-wizard-step]').textContent=`HABILIDADE ${String(row).padStart(2,'0')} · ETAPA ${step+1} DE 3`;
  const title=dialog.querySelector('h2');title.textContent=step===0?'De onde vem a habilidade?':step===1?(type==='species'?'Escolha a espécie':'Escolha a especialidade'):`Habilidades · ${group}`;
  dialog.querySelector('[data-wizard-back]').hidden=step===0;
  dialog.querySelector('[data-wizard-trail]').textContent=step===0?'':`${type==='species'?'Espécie':'Especialidade'}${step===2?' / '+group:''}`;
  dialog.querySelector('.ability-wizard-feedback').textContent='';
  if(step===0){
   content.innerHTML=`<div class="ability-wizard-origins"><button type="button" data-wizard-type="species">${icon('book')}<strong>Espécie</strong><span>Capacidades da natureza do personagem.</span></button><button type="button" data-wizard-type="specialty">${icon('clipboard')}<strong>Especialidade</strong><span>Técnicas aprendidas com sua formação.</span></button></div>`;
  }else if(step===1){
   const groups=[...new Set(abilityCatalog.filter(a=>Boolean(a.specialty)===(type==='specialty')).map(a=>a.species))];
   content.innerHTML=`<div class="ability-wizard-groups">${groups.map(name=>{
    const images=type==='species'?(name==='Constructos'?Object.values(constructIcons):[speciesIcons['especie-'+keys[name]]]):[];
    return `<button type="button" data-wizard-group="${esc(name)}"><span class="ability-wizard-symbols">${images.length?images.map(image=>`<img src="${esc(image.src)}" alt="" width="48" height="48">`).join(''):icon('clipboard')}</span><strong>${esc(name)}</strong></button>`;
   }).join('')}</div>`;
  }else{
   const abilities=abilityCatalog.filter(a=>a.species===group&&Boolean(a.specialty)===(type==='specialty'));
   content.innerHTML=`<p class="ability-wizard-help">Escolha uma habilidade para preencher este espaço da ficha. Confira o nível e as condições na descrição.</p><div class="ability-wizard-abilities">${abilities.map(ability=>`<article><span class="ability-wizard-stage">${esc(stageLabel(ability))}${ability.variant?' · '+esc(ability.variant):''}</span><h3>${esc(ability.name)}</h3><dl><div><dt>Ação</dt><dd>${esc(ability.action)}</dd></div><div><dt>Custo</dt><dd>${esc(ability.cost)}</dd></div></dl><details><summary>Ver descrição</summary><p>${esc(ability.description)}</p></details><button type="button" class="op-button" data-wizard-choose="${ability.id}" aria-label="Usar ${esc(ability.name)}${ability.variant?' · '+esc(ability.variant):''}">Usar habilidade</button></article>`).join('')}</div>`;
  }
  dialog.scrollTop=0;title.focus({preventScroll:true});
 }
 root.querySelectorAll('[data-open-ability-picker]').forEach(button=>button.addEventListener('click',()=>{
  opener=button;row=Number(button.dataset.openAbilityPicker);step=0;type='';group='';render();dialog.showModal();dialog.querySelector('[data-wizard-type]')?.focus();
 }));
 dialog.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-wizard-close')){dialog.close();return;}
  if(button.hasAttribute('data-wizard-back')){if(step>0){step--;render();}return;}
  if(button.dataset.wizardType){type=button.dataset.wizardType;step=1;render();return;}
  if(button.dataset.wizardGroup){group=button.dataset.wizardGroup;step=2;render();return;}
  if(button.dataset.wizardChoose){
   const ability=abilityCatalog.find(a=>a.id===button.dataset.wizardChoose&&a.species===group);
   if(!ability)return;
   try{if(onChoose(row,ability)!==false)dialog.close();}
   catch(error){dialog.querySelector('.ability-wizard-feedback').textContent=error.message||'Não foi possível preencher a habilidade.';}
  }
 });
 dialog.addEventListener('close',()=>{if(opener?.isConnected&&opener.getClientRects().length){opener.focus({preventScroll:true});opener.closest('[data-ability-card]')?.scrollIntoView({block:'nearest',behavior:'instant'});}else root.querySelector('[data-add-ability]')?.focus({preventScroll:true});});
}
