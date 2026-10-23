import {apiRequest} from './site-service.js';
import {documentSections,flattenSections,validateRecordPatch} from './content-editing.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const labels={title:'Título',summary:'Resumo',status:'Situação',author:'Autoria',department:'Departamento',date:'Data de atualização',note:'Anotação de arquivo'};
const kinds={verbete:'Conhecimento',agente:'Agentes',missao:'Missões',relatorio:'Relatórios',documento:'Documentos',alvo:'Alvos'};

export function createAdminPanel({getRecords,getCurrentRecord,service}) {
  const dialog=document.createElement('dialog');
  dialog.className='admin-dialog';
  dialog.setAttribute('aria-labelledby','admin-title');
  document.body.append(dialog);
  let authenticated=false;
  let configured=false;
  let sessionKnown=false;
  let enabled=false;
  let checking=null;
  let busy=false;
  let error='';
  let selected='';
  let draft=null;
  let editorRevision=0;
  let dirty=false;
  let recordQuery='';
  const localMode=()=>!configured;
  const canEdit=()=>sessionKnown&&(localMode()||authenticated);
  const availableRecords=()=>getRecords(authenticated);
  const message=(text='',isError=false)=>{const target=dialog.querySelector('[data-admin-feedback]');if(target){target.textContent=text;target.classList.toggle('is-error',isError);}};

  function field(label,path,value,{area=false,type='text'}={}) {
    return `<label class="admin-field"><span>${esc(label)}</span>${area?`<textarea data-editor-path="${esc(path)}" rows="${path.includes('paragraphs')?'8':'3'}">${esc(value)}</textarea>`:`<input type="${type}" data-editor-path="${esc(path)}" value="${esc(value)}"${path==='title'?' maxlength="180" required':''}>`}</label>`;
  }
  function recordOptions() {
    const query=recordQuery.toLocaleLowerCase('pt-BR');
    return availableRecords().filter(record=>!query||`${record.title} ${record.code} ${kinds[record.kind]}`.toLocaleLowerCase('pt-BR').includes(query)).map(record=>`<button type="button" data-edit-record="${esc(record.id)}" class="${selected===record.id?'selected':''}" aria-pressed="${selected===record.id}"><small>${esc(record.code)} · ${record.unlisted?'Reservado':esc(kinds[record.kind])}</small><strong>${esc(record.title)}</strong></button>`).join('')||'<p class="admin-muted">Nenhum arquivo encontrado.</p>';
  }
  function chooseRecord(id) {
    const record=availableRecords().find(record=>record.id===id);
    if(!record)return;
    selected=id;dirty=false;editorRevision=localMode()?service.localContent.revision:service.content.revision;
    draft=structuredClone(Object.fromEntries(Object.keys(labels).map(key=>[key,record[key]||''])));
    draft.sections=documentSections(record).map(section=>({...section,paragraphs:section.paragraphs.join('\n\n')}));
    for(const key of ['abilities','profile','timeline','people','locations','evidence'])if(record[key])draft[key]=structuredClone(record[key]);
  }
  function confirmDiscard() {return !dirty||confirm('Há alterações que ainda não foram salvas. Deseja descartá-las?');}
  function editor() {
    if(!selected||!availableRecords().some(record=>record.id===selected))chooseRecord(getCurrentRecord(authenticated)?.id||availableRecords()[0]?.id);
    const record=availableRecords().find(record=>record.id===selected);
    if(!record)return '<p>Nenhum arquivo disponível.</p>';
    if(!draft)chooseRecord(selected);
    return `<div class="admin-editor-layout"><aside class="admin-records"><label class="admin-field"><span>Encontrar arquivo</span><input type="search" data-record-search value="${esc(recordQuery)}" placeholder="Nome, código ou seção"></label><div class="admin-record-options">${recordOptions()}</div></aside><form class="admin-editor" data-editor-form>
      <div class="admin-editor-heading"><div><small>${esc(record.code)} / ${esc(kinds[record.kind])}${record.unlisted?' / FICHA RESERVADA':''}</small><h2>Editar documento</h2></div><a href="#/arquivo/${esc(record.id)}" data-view-record>Ver página</a></div>
      <div class="admin-field-grid">${Object.entries(labels).map(([key,label])=>field(label,key,draft[key],{area:['summary','note','quote'].includes(key),type:key==='date'?'date':'text'})).join('')}</div>
      <h3>Texto do documento</h3><p class="admin-muted">Separe os parágrafos com uma linha em branco. ${localMode()?'As mudanças serão salvas apenas neste navegador.':'O texto será publicado para todos os visitantes.'}</p>
      ${draft.sections.map((section,index)=>`<section class="admin-edit-section">${record.reportSections?.length?field('Título da seção',`sections.${index}.title`,section.title):''}${field(section.list?'Itens da lista':'Parágrafos',`sections.${index}.paragraphs`,section.paragraphs,{area:true})}</section>`).join('')}
      ${draft.abilities?`<details class="admin-edit-group"><summary>Natureza da espécie · ${draft.abilities.length} capacidades</summary>${draft.abilities.map((ability,index)=>`<section class="admin-edit-section"><small>${esc(({initial:'HABILIDADE INICIAL',acquired:'HABILIDADE ADQUIRIDA',apex:'ÁPICE DA ESPÉCIE'})[ability.stage])}${ability.variant?` / ${esc(ability.variant)}`:''}</small>${field('Nome da habilidade',`abilities.${index}.title`,ability.title)}${field('Descrição',`abilities.${index}.text`,ability.text,{area:true})}${(ability.details||[]).map((detail,detailIndex)=>`${field('Título do desdobramento',`abilities.${index}.details.${detailIndex}.title`,detail.title)}${field('Descrição',`abilities.${index}.details.${detailIndex}.text`,detail.text,{area:true})}`).join('')}</section>`).join('')}</details>`:''}
      ${draft.profile?`<details class="admin-edit-group"><summary>Dados de identificação</summary>${draft.profile.map((item,index)=>`<div class="admin-field-grid">${field('Campo',`profile.${index}.label`,item.label)}${field('Informação',`profile.${index}.value`,item.value)}</div>`).join('')}</details>`:''}
      ${draft.timeline?`<details class="admin-edit-group"><summary>Cronologia</summary>${draft.timeline.map((item,index)=>`<section class="admin-edit-section">${field('Referência de tempo',`timeline.${index}.date`,item.date)}${field('Acontecimento',`timeline.${index}.text`,item.text,{area:true})}</section>`).join('')}</details>`:''}
      ${['people','locations','evidence'].filter(key=>draft[key]).map(key=>`<details class="admin-edit-group"><summary>${({people:'Pessoas envolvidas',locations:'Locais',evidence:'Evidências'})[key]}</summary>${draft[key].map((item,index)=>field('Registro',`${key}.${index}`,item,{area:true})).join('')}</details>`).join('')}
      <div class="admin-editor-actions"><button class="admin-primary" type="submit" ${busy?'disabled':''}>${busy?'Salvando…':localMode()?'Salvar neste navegador':'Publicar alterações'}</button><button type="button" data-reset-record ${busy?'disabled':''}>${localMode()?'Restaurar versão do site':'Restaurar texto original'}</button><span data-dirty-state>${dirty?'Alterações não salvas':'Documento carregado'}</span></div>
      <p class="admin-feedback" role="status" data-admin-feedback>${esc(error)}</p>
    </form></div>`;
  }
  function loginView() {
    if(!sessionKnown)return '<div class="admin-login"><h2>Abrindo o editor…</h2></div>';
    return `<section class="admin-login"><span class="admin-kicker">PUBLICAÇÃO NO SITE</span><h2>Entrar na administração</h2><p>A senha administrativa autoriza a publicação dos textos para todos os visitantes.</p><form data-admin-login><label class="admin-field"><span>Senha administrativa</span><input name="password" type="password" required autocomplete="current-password" maxlength="256"></label><button class="admin-primary" type="submit" ${busy?'disabled':''}>${busy?'Verificando…':'Entrar'}</button><p role="status" class="admin-feedback is-error" data-admin-feedback>${esc(error)}</p></form></section>`;
  }
  function render() {
    dialog.innerHTML=`<header class="admin-header"><div><span class="admin-kicker">GMS / CONTROLE DO ARQUIVO</span><h1 id="admin-title">Administração dos textos</h1></div><div class="admin-header-actions">${canEdit()?'<button type="button" data-admin-refresh>Atualizar</button><button type="button" data-admin-exit>Sair da edição</button>':''}<button type="button" data-admin-close aria-label="Fechar painel administrativo">Fechar ×</button></div></header><div class="admin-body">${canEdit()?`<div class="admin-edit-notice ${localMode()?'is-local':''}"><strong>${localMode()?'Edição neste navegador':'Publicação no site'}</strong><p>${localMode()?'Você já pode editar e salvar os textos aqui. Essas mudanças ficam somente neste navegador. Publicar para todos requer configurar o banco e a senha no Vercel.':'As alterações publicadas ficam disponíveis para todos os visitantes.'}</p></div>${editor()}`:loginView()}</div><footer class="admin-footer"><span>${canEdit()?(localMode()?'EDIÇÕES LOCAIS · SOMENTE NESTE NAVEGADOR':'SESSÃO ADMINISTRATIVA · PUBLICAÇÃO COMPARTILHADA'):'ÁREA ADMINISTRATIVA'}</span><span>EDITOR DE DOCUMENTOS GMS</span></footer>`;
    bind();
  }
  function updateBar() {
    document.querySelector('#admin-mode-bar')?.remove();
    const hasLocal=Object.keys(service.localContent.overrides).length>0;
    const active=enabled&&canEdit();
    document.body.classList.toggle('admin-mode-active',active||hasLocal);
    if(!active&&!hasLocal)return;
    const bar=document.createElement('div');bar.id='admin-mode-bar';
    bar.innerHTML=`<span><i></i>${active?(localMode()?'Edição local':'Administração ativa'):'Prévia local'}</span>${active?`<div><button type="button" data-admin-open>Editar textos</button><button type="button" data-admin-edit-current ${getCurrentRecord(authenticated)?'':'disabled'}>Editar esta página</button><button type="button" data-admin-exit>Sair</button></div>`:'<span class="admin-local-caption">Alterações salvas só neste navegador</span>'}`;
    document.body.append(bar);
    bar.querySelector('[data-admin-open]')?.addEventListener('click',()=>open());
    bar.querySelector('[data-admin-edit-current]')?.addEventListener('click',()=>open(getCurrentRecord(authenticated)?.id));
    bar.querySelector('[data-admin-exit]')?.addEventListener('click',()=>{void exit();});
  }
  async function refresh() {
    const next=await apiRequest('admin');
    service.adopt(next);
  }
  async function checkSession() {
    if(checking)return checking;
    checking=(async()=>{
      if(location.protocol==='file:'){configured=false;authenticated=false;sessionKnown=true;updateBar();if(dialog.open)render();return;}
      try {
        const session=await apiRequest('session');
        if(busy)return;
        configured=session.configured;authenticated=session.authenticated;
        if(authenticated){await refresh();enabled=true;}
      } catch {configured=false;authenticated=false;}
      sessionKnown=true;
      if(dialog.open&&canEdit())enabled=true;
      updateBar();
      if(dialog.open&&!dirty)render();
    })();
    try {await checking;}finally {checking=null;}
  }
  async function login(form) {
    if(busy)return;busy=true;error='';
    const password=new FormData(form).get('password');
    const submit=form.querySelector('button');submit.disabled=true;submit.textContent='Verificando…';
    try {await apiRequest('',{method:'POST',body:{action:'login',password}});await refresh();authenticated=true;enabled=true;busy=false;updateBar();render();}
    catch(err){error=err.message;message(error,true);submit.disabled=false;submit.textContent='Entrar';}
    finally {busy=false;}
  }
  async function exit() {
    if(!confirmDiscard())return;
    try {
      if(authenticated)await apiRequest('',{method:'POST',body:{action:'logout'}});
      authenticated=false;enabled=false;draft=null;dirty=false;updateBar();dialog.close();
    } catch(err){error=err.message;if(dialog.open)message(error,true);else alert(error);}
  }
  async function save(reset=false) {
    if(busy)return;
    if(reset&&!confirm(localMode()?'Restaurar a versão do site neste navegador?':'Restaurar o texto original deste arquivo para todos os visitantes?'))return;
    busy=true;message(reset?'Restaurando…':'Salvando…');
    dialog.querySelectorAll('.admin-editor-actions button').forEach(button=>button.disabled=true);
    try {
      const base=availableRecords().find(record=>record.id===selected);
      if(!base)throw new Error('Este arquivo exige uma credencial de acesso.');
      let patch;
      if(!reset){
        patch=structuredClone(draft);
        const sections=patch.sections.map(section=>({...section,paragraphs:section.paragraphs.split(/\n\s*\n/)}));
        delete patch.sections;
        Object.assign(patch,flattenSections(sections,Boolean(base.reportSections?.length)));
        validateRecordPatch(base,patch);
      }
      let warning='';
      if(localMode())service.saveLocal(base,patch,{revision:editorRevision,reset});
      else {
        const result=await apiRequest('',{method:reset?'DELETE':'PUT',body:{recordId:selected,revision:editorRevision,...(reset?{}:{patch})}});
        if(!service.clearLocal(base))warning=' A versão foi publicada, mas o navegador não permitiu remover a cópia local armazenada.';
        service.adopt(result);
      }
      chooseRecord(selected);error='';busy=false;render();updateBar();
      message((reset?(localMode()?'Versão do site restaurada neste navegador.':'Texto original restaurado para todos.'):(localMode()?'Alterações salvas apenas neste navegador.':'Alterações publicadas para todos os visitantes.'))+warning);
    } catch(err){error=err.message;message(error,true);if(err.status===401){authenticated=false;updateBar();render();}}
    finally {busy=false;dialog.querySelectorAll('.admin-editor-actions button').forEach(button=>button.disabled=false);}
  }
  function bind() {
    dialog.querySelector('[data-admin-close]').onclick=()=>{if(confirmDiscard()){dirty=false;draft=null;dialog.close();}};
    dialog.querySelector('[data-admin-login]')?.addEventListener('submit',event=>{event.preventDefault();void login(event.currentTarget);});
    dialog.querySelector('[data-admin-exit]')?.addEventListener('click',()=>{void exit();});
    dialog.querySelector('[data-admin-refresh]')?.addEventListener('click',async()=>{
      if(!confirmDiscard())return;
      try {if(authenticated)await refresh();else await service.sync();draft=null;dirty=false;error='';await checkSession();if(dialog.open)render();}
      catch(err){message(err.message,true);}
    });
    dialog.querySelector('[data-record-search]')?.addEventListener('input',event=>{recordQuery=event.target.value;dialog.querySelector('.admin-record-options').innerHTML=recordOptions();});
    dialog.querySelector('.admin-record-options')?.addEventListener('click',event=>{const button=event.target.closest('[data-edit-record]');if(button&&confirmDiscard()){chooseRecord(button.dataset.editRecord);render();}});
    dialog.querySelector('[data-view-record]')?.addEventListener('click',event=>{if(!confirmDiscard()){event.preventDefault();return;}dirty=false;draft=null;dialog.close();});
    dialog.querySelectorAll('[data-editor-path]').forEach(input=>input.addEventListener('input',()=>{
      const path=input.dataset.editorPath.split('.');let target=draft;
      for(const key of path.slice(0,-1))target=target[key];
      target[path.at(-1)]=input.value;dirty=true;
      dialog.querySelector('[data-dirty-state]').textContent='Alterações não salvas';
    }));
    dialog.querySelector('[data-editor-form]')?.addEventListener('submit',event=>{event.preventDefault();void save();});
    dialog.querySelector('[data-reset-record]')?.addEventListener('click',()=>{void save(true);});
  }
  function open(recordId) {
    if(recordId&&canEdit()){if(!confirmDiscard())return;chooseRecord(recordId);}
    enabled=true;render();updateBar();
    if(!dialog.open)dialog.showModal();
    document.body.classList.add('admin-panel-open');
    if(!sessionKnown)void checkSession();
  }
  dialog.addEventListener('cancel',event=>{if(!confirmDiscard())event.preventDefault();else {dirty=false;draft=null;}});
  dialog.addEventListener('close',()=>{document.body.classList.remove('admin-panel-open');});
  addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
  return {open,updateBar,init:checkSession,get authenticated(){return authenticated;},dispose(){dialog.remove();document.querySelector('#admin-mode-bar')?.remove();document.body.classList.remove('admin-mode-active','admin-panel-open');}};
}
