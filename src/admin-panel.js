import {apiRequest} from './site-service.js';
import {documentSections,flattenSections,validateRecordPatch} from './content-editing.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const time=value=>value?new Date(value).toLocaleString('pt-BR'):'—';
const labels={title:'Título',summary:'Resumo',status:'Situação',author:'Autoria',department:'Departamento',date:'Data de atualização',note:'Anotação de arquivo'};
const kinds={verbete:'Conhecimento',agente:'Agentes',missao:'Missões',relatorio:'Relatórios',documento:'Documentos',alvo:'Alvos'};

export function createAdminPanel({getRecords,getCurrentRecord,getDiagnostics,service,onModeChange}) {
  const dialog=document.createElement('dialog');
  dialog.className='admin-dialog';
  dialog.setAttribute('aria-labelledby','admin-title');
  document.body.append(dialog);
  let authenticated=false;
  let configured=false;
  let setup={};
  let data=null;
  let tab='overview';
  let busy=false;
  let error='';
  let selected='';
  let draft=null;
  let editorRevision=0;
  let dirty=false;
  let recordQuery='';
  let visitorQuery='';
  let onlineOnly=false;
  let refreshTimer;
  const message=(text='',isError=false)=>{const target=dialog.querySelector('[data-admin-feedback]');if(target){target.textContent=text;target.classList.toggle('is-error',isError);}};

  function field(label,path,value,{area=false,type='text'}={}) {
    return `<label class="admin-field"><span>${esc(label)}</span>${area?`<textarea data-editor-path="${esc(path)}" rows="${path.includes('paragraphs')?'8':'3'}">${esc(value)}</textarea>`:`<input type="${type}" data-editor-path="${esc(path)}" value="${esc(value)}"${path==='title'?' maxlength="180" required':''}>`}</label>`;
  }
  function recordOptions() {
    const query=recordQuery.toLocaleLowerCase('pt-BR');
    return getRecords().filter(record=>!query||`${record.title} ${record.code} ${kinds[record.kind]}`.toLocaleLowerCase('pt-BR').includes(query)).map(record=>`<button type="button" data-edit-record="${esc(record.id)}" class="${selected===record.id?'selected':''}" aria-pressed="${selected===record.id}"><small>${esc(record.code)} · ${record.unlisted?'Reservado':esc(kinds[record.kind])}</small><strong>${esc(record.title)}</strong></button>`).join('')||'<p class="admin-muted">Nenhum arquivo encontrado.</p>';
  }
  function chooseRecord(id) {
    const record=getRecords().find(record=>record.id===id);
    if(!record)return;
    selected=id;dirty=false;editorRevision=service.content.revision;
    draft=structuredClone(Object.fromEntries(Object.keys(labels).map(key=>[key,record[key]||''])));
    draft.sections=documentSections(record).map(section=>({...section,paragraphs:section.paragraphs.join('\n\n')}));
    for(const key of ['abilities','profile','timeline','people','locations','evidence'])if(record[key])draft[key]=structuredClone(record[key]);
  }
  function confirmDiscard() {return !dirty||confirm('Há alterações que ainda não foram publicadas. Deseja descartá-las?');}
  function editor() {
    if(!selected||!getRecords().some(record=>record.id===selected))chooseRecord(getCurrentRecord()?.id||getRecords()[0]?.id);
    const record=getRecords().find(record=>record.id===selected);
    if(!record)return '<p>Nenhum arquivo disponível.</p>';
    if(!draft)chooseRecord(selected);
    return `<div class="admin-editor-layout"><aside class="admin-records"><label class="admin-field"><span>Encontrar arquivo</span><input type="search" data-record-search value="${esc(recordQuery)}" placeholder="Nome, código ou seção"></label><div class="admin-record-options">${recordOptions()}</div></aside><form class="admin-editor" data-editor-form>
      <div class="admin-editor-heading"><div><small>${esc(record.code)} / ${esc(kinds[record.kind])}${record.unlisted?' / FICHA RESERVADA':''}</small><h2>Editar documento</h2></div><a href="#/arquivo/${esc(record.id)}" data-view-record>Ver página</a></div>
      <div class="admin-field-grid">${Object.entries(labels).map(([key,label])=>field(label,key,draft[key],{area:['summary','note','quote'].includes(key),type:key==='date'?'date':'text'})).join('')}</div>
      <h3>Texto do documento</h3><p class="admin-muted">Separe os parágrafos com uma linha em branco. O texto será publicado para todos os visitantes.</p>
      ${draft.sections.map((section,index)=>`<section class="admin-edit-section">${record.reportSections?.length?field('Título da seção',`sections.${index}.title`,section.title):''}${field(section.list?'Itens da lista':'Parágrafos',`sections.${index}.paragraphs`,section.paragraphs,{area:true})}</section>`).join('')}
      ${draft.abilities?`<details class="admin-edit-group"><summary>Natureza da espécie · ${draft.abilities.length} capacidades</summary>${draft.abilities.map((ability,index)=>`<section class="admin-edit-section"><small>${esc(({initial:'HABILIDADE INICIAL',acquired:'HABILIDADE ADQUIRIDA',apex:'ÁPICE DA ESPÉCIE'})[ability.stage])}${ability.variant?` / ${esc(ability.variant)}`:''}</small>${field('Nome da habilidade',`abilities.${index}.title`,ability.title)}${field('Descrição',`abilities.${index}.text`,ability.text,{area:true})}${(ability.details||[]).map((detail,detailIndex)=>`${field('Título do desdobramento',`abilities.${index}.details.${detailIndex}.title`,detail.title)}${field('Descrição',`abilities.${index}.details.${detailIndex}.text`,detail.text,{area:true})}`).join('')}</section>`).join('')}</details>`:''}
      ${draft.profile?`<details class="admin-edit-group"><summary>Dados de identificação</summary>${draft.profile.map((item,index)=>`<div class="admin-field-grid">${field('Campo',`profile.${index}.label`,item.label)}${field('Informação',`profile.${index}.value`,item.value)}</div>`).join('')}</details>`:''}
      ${draft.timeline?`<details class="admin-edit-group"><summary>Cronologia</summary>${draft.timeline.map((item,index)=>`<section class="admin-edit-section">${field('Referência de tempo',`timeline.${index}.date`,item.date)}${field('Acontecimento',`timeline.${index}.text`,item.text,{area:true})}</section>`).join('')}</details>`:''}
      ${['people','locations','evidence'].filter(key=>draft[key]).map(key=>`<details class="admin-edit-group"><summary>${({people:'Pessoas envolvidas',locations:'Locais',evidence:'Evidências'})[key]}</summary>${draft[key].map((item,index)=>field('Registro',`${key}.${index}`,item,{area:true})).join('')}</details>`).join('')}
      <div class="admin-editor-actions"><button class="admin-primary" type="submit" ${busy?'disabled':''}>${busy?'Publicando…':'Publicar alterações'}</button><button type="button" data-reset-record ${busy?'disabled':''}>Restaurar texto original</button><span data-dirty-state>${dirty?'Alterações não publicadas':'Documento carregado'}</span></div>
      <p class="admin-feedback" role="status" data-admin-feedback>${esc(error)}</p>
    </form></div>`;
  }
  function visitorRows() {
    const query=visitorQuery.toLocaleLowerCase('pt-BR');
    const list=(data?.visitors||[]).filter(visitor=>(!onlineOnly||visitor.online)&&(!query||visitor.names.join(' ').toLocaleLowerCase('pt-BR').includes(query)));
    return list.length?`<div class="admin-table-scroll"><table class="admin-visitors"><thead><tr><th>Nome de agente informado</th><th>Situação</th><th>Último acesso</th><th>Primeiro acesso</th><th>Página</th></tr></thead><tbody>${list.map(visitor=>`<tr><td><strong>${esc(visitor.name)}</strong>${visitor.names.length>1?`<small>Outros nomes: ${visitor.names.filter(name=>name!==visitor.name).map(esc).join(', ')}</small>`:''}</td><td><span class="admin-visitor-status ${visitor.online?'online':''}"><i></i>${visitor.online?'Online':'Offline'}</span></td><td>${time(visitor.lastSeen)}</td><td>${time(visitor.firstSeen)}</td><td class="admin-mono">${esc(visitor.page)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="admin-empty">Nenhum visitante encontrado neste filtro.</div>';
  }
  function overview() {
    return `<div class="admin-metrics"><article><span>Online agora</span><strong>${data?.onlineCount??'—'}</strong><small>Navegadores com sessão ativa</small></article><article><span>Visitantes registrados</span><strong>${data?.knownCount??'—'}</strong><small>Últimos 90 dias</small></article><article><span>Arquivos com edição</span><strong>${Object.keys(data?.overrides||{}).length}</strong><small>Revisão publicada ${data?.revision??0}</small></article></div><section class="admin-info"><h2>Acompanhamento do arquivo</h2><p>O painel atualiza os acessos a cada 10 segundos. Uma sessão sem sinal por 75 segundos passa a offline. Abas do mesmo navegador contam como um visitante; outro navegador ou dispositivo pode contar separadamente.</p><p>Os nomes são informados pelos próprios visitantes. O registro começa quando o serviço é ativado; acessos anteriores não podem ser recuperados.</p><button type="button" data-admin-tab="visitors">Consultar visitantes</button><button type="button" data-admin-tab="content">Editar os documentos</button></section>`;
  }
  function diagnostics() {
    const values={...getDiagnostics(),'Conexão com o serviço':service.status.healthy?'Disponível':'Indisponível','Revisão do conteúdo':service.content.revision,'Atualização do painel':time(data?.serverTime),'Sessão administrativa':'Autenticada no servidor'};
    return `<div class="admin-info"><h2>Diagnóstico do terminal</h2><dl class="admin-diagnostics">${Object.entries(values).map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><p>As credenciais narrativas e a identificação de agente não concedem acesso administrativo. A administração usa uma sessão própria.</p></div>`;
  }
  function loginView() {
    return configured?`<section class="admin-login"><span class="admin-kicker">ACESSO ADMINISTRATIVO</span><h2>Identifique a administração</h2><p>A senha administrativa permite consultar os acessos e publicar textos no arquivo.</p><form data-admin-login><label class="admin-field"><span>Senha administrativa</span><input name="password" type="password" required autocomplete="current-password" maxlength="256"></label><button class="admin-primary" type="submit" ${busy?'disabled':''}>${busy?'Verificando…':'Entrar na administração'}</button><p role="status" class="admin-feedback is-error" data-admin-feedback>${esc(error)}</p></form></section>`:`<section class="admin-login admin-setup"><span class="admin-kicker">CONEXÃO PENDENTE</span><h2>Administração preparada</h2><p>O serviço compartilhado precisa ser ativado no Vercel para exibir os visitantes e publicar alterações para todos.</p><p>Conecte um banco <strong>Upstash Redis</strong> ao projeto e configure estas variáveis de ambiente no servidor:</p><ul><li><code>UPSTASH_REDIS_REST_URL</code></li><li><code>UPSTASH_REDIS_REST_TOKEN</code></li><li><code>GMS_ADMIN_PASSWORD</code> — senha exclusiva com pelo menos 16 caracteres.</li></ul><p>A integração também aceita as variáveis <code>KV_REST_API_URL</code> e <code>KV_REST_API_TOKEN</code>. Depois de salvar, faça um novo deploy.</p><div class="admin-setup-checks"><span>${setup.storage?'✓':'○'} Armazenamento conectado</span><span>${setup.password?'✓':'○'} Senha configurada</span></div><p>Os números de acessos ficam indisponíveis até a conexão ser ativada.</p><button type="button" data-admin-retry>Verificar conexão</button><p role="status" class="admin-feedback is-error" data-admin-feedback>${esc(error)}</p></section>`;
  }
  function render() {
    dialog.innerHTML=`<header class="admin-header"><div><span class="admin-kicker">GMS / CONTROLE DO ARQUIVO</span><h1 id="admin-title">Depuração e administração</h1></div><div class="admin-header-actions">${authenticated?'<button type="button" data-admin-refresh>Atualizar</button><button type="button" data-admin-logout>Sair da administração</button>':''}<button type="button" data-admin-close aria-label="Fechar painel administrativo">Fechar ×</button></div></header>${authenticated?`<nav class="admin-tabs" aria-label="Áreas administrativas">${[['overview','Visão geral'],['visitors','Visitantes'],['content','Conteúdo'],['diagnostics','Diagnóstico']].map(([key,label])=>`<button type="button" data-admin-tab="${key}" class="${tab===key?'selected':''}" aria-current="${tab===key?'page':'false'}">${label}</button>`).join('')}</nav>`:''}<div class="admin-body">${authenticated?(tab==='content'?editor():tab==='visitors'?`<div class="admin-visitor-heading"><div><h2>Visitantes do arquivo</h2><p>${data?.onlineCount??'—'} online · ${data?.knownCount??'—'} registrados · últimas 500 identificações, além das sessões online</p></div><span>Atualizado ${data?.serverTime?new Date(data.serverTime).toLocaleTimeString('pt-BR'):'—'}</span></div><div class="admin-visitor-filters"><label class="admin-field"><span>Buscar nome de agente</span><input type="search" data-visitor-search value="${esc(visitorQuery)}" placeholder="Nome atual ou anterior"></label><label><input type="checkbox" data-online-only ${onlineOnly?'checked':''}> Somente online</label></div><div data-visitor-results>${visitorRows()}</div>`:tab==='diagnostics'?diagnostics():overview()):loginView()}</div><footer class="admin-footer"><span>${authenticated?'SESSÃO ADMINISTRATIVA · ALTERAÇÕES COMPARTILHADAS':'ÁREA ADMINISTRATIVA · ACESSO RESTRITO'}</span><span>${busy?'Aguarde…':authenticated?'Consulta de acessos a cada 10 s':'O atalho abre o painel; a senha autoriza a administração.'}</span></footer>`;
    bind();
  }
  function updateBar() {
    document.querySelector('#admin-mode-bar')?.remove();
    document.body.classList.toggle('admin-mode-active',authenticated);
    if(!authenticated){onModeChange?.(false);return;}
    const bar=document.createElement('div');bar.id='admin-mode-bar';
    bar.innerHTML=`<span><i></i>Administração ativa</span><div><button type="button" data-admin-open>Administrar</button><button type="button" data-admin-edit-current ${getCurrentRecord()?'':'disabled'}>Editar esta página</button><button type="button" data-admin-exit>Sair</button></div>`;
    document.body.append(bar);
    bar.querySelector('[data-admin-open]').onclick=()=>open();
    bar.querySelector('[data-admin-edit-current]').onclick=()=>open(getCurrentRecord()?.id);
    bar.querySelector('[data-admin-exit]').onclick=()=>{void logout();};
    onModeChange?.(true);
  }
  async function refresh({renderView=true}={}) {
    try {
      const next=await apiRequest('admin');data=next;error='';
      service.adopt(next);
      if(renderView&&dialog.open&&tab!=='content'&&!dialog.querySelector('input:focus'))render();
    } catch(err) {
      error=err.message;
      if(err.status===401){authenticated=false;updateBar();if(dialog.open)render();}
      else if(dialog.open){message(error,true);const footer=dialog.querySelector('.admin-footer > span:last-child');if(footer)footer.textContent='Falha na atualização. Tente novamente.';}
    }
  }
  async function checkSession() {
    if(location.protocol==='file:'){error='A administração compartilhada está disponível no site; esta é uma prévia offline.';if(dialog.open)render();return;}
    const previous=`${configured}:${authenticated}:${error}`;
    try {const session=await apiRequest('session');if(busy)return;configured=session.configured;authenticated=session.authenticated;setup=session.setup||{};error='';if(authenticated)await refresh({renderView:false});}
    catch(err){configured=false;authenticated=false;error=err.message;}
    updateBar();if(dialog.open&&previous!==`${configured}:${authenticated}:${error}`)render();
  }
  async function login(form) {
    if(busy)return;busy=true;error='';
    const password=new FormData(form).get('password');
    const submit=form.querySelector('button');submit.disabled=true;submit.textContent='Verificando…';
    try {await apiRequest('',{method:'POST',body:{action:'login',password}});authenticated=true;await refresh({renderView:false});busy=false;updateBar();render();}
    catch(err){error=err.message;message(error,true);submit.disabled=false;submit.textContent='Entrar na administração';}
    finally{busy=false;}
  }
  async function logout() {
    if(!confirmDiscard())return;
    try {await apiRequest('',{method:'POST',body:{action:'logout'}});authenticated=false;data=null;draft=null;dirty=false;updateBar();if(dialog.open)render();}
    catch(err){error=err.message;if(dialog.open)message(error,true);else alert(error);}
  }
  async function save(reset=false) {
    if(busy)return;
    if(reset&&!confirm('Restaurar o texto original deste arquivo para todos os visitantes?'))return;
    busy=true;message(reset?'Restaurando…':'Publicando…');
    dialog.querySelectorAll('.admin-editor-actions button').forEach(button=>button.disabled=true);
    try {
      let patch;
      if(!reset){
        const base=getRecords().find(record=>record.id===selected);
        patch=structuredClone(draft);
        const sections=patch.sections.map(section=>({...section,paragraphs:section.paragraphs.split(/\n\s*\n/)}));
        delete patch.sections;
        Object.assign(patch,flattenSections(sections,Boolean(base.reportSections?.length)));
        validateRecordPatch(base,patch);
      }
      const result=await apiRequest('',{method:reset?'DELETE':'PUT',body:{recordId:selected,revision:editorRevision,...(reset?{}:{patch})}});
      service.adopt(result);data={...data,...result};chooseRecord(selected);error='';busy=false;render();message(reset?'Texto original restaurado.':'Alterações publicadas para todos os visitantes.');
    } catch(err){error=err.message;message(error,true);if(err.status===401){authenticated=false;updateBar();render();}}
    finally{busy=false;dialog.querySelectorAll('.admin-editor-actions button').forEach(button=>button.disabled=false);}
  }
  function bind() {
    dialog.querySelector('[data-admin-close]').onclick=()=>{if(confirmDiscard()){dirty=false;draft=null;dialog.close();}};
    dialog.querySelector('[data-admin-login]')?.addEventListener('submit',event=>{event.preventDefault();void login(event.currentTarget);});
    dialog.querySelector('[data-admin-retry]')?.addEventListener('click',()=>{void checkSession();});
    dialog.querySelector('[data-admin-logout]')?.addEventListener('click',()=>{void logout();});
    dialog.querySelector('[data-admin-refresh]')?.addEventListener('click',()=>{
      if(tab==='content'&&dirty&&!confirmDiscard())return;
      if(tab==='content'){draft=null;dirty=false;}
      void refresh({renderView:false}).then(()=>{if(dialog.open)render();});
    });
    dialog.querySelectorAll('[data-admin-tab]').forEach(button=>button.addEventListener('click',()=>{tab=button.dataset.adminTab;render();}));
    dialog.querySelector('[data-record-search]')?.addEventListener('input',event=>{recordQuery=event.target.value;dialog.querySelector('.admin-record-options').innerHTML=recordOptions();});
    dialog.querySelector('.admin-record-options')?.addEventListener('click',event=>{const button=event.target.closest('[data-edit-record]');if(button&&confirmDiscard()){chooseRecord(button.dataset.editRecord);render();}});
    dialog.querySelector('[data-view-record]')?.addEventListener('click',event=>{if(!confirmDiscard()){event.preventDefault();return;}dirty=false;draft=null;dialog.close();});
    dialog.querySelectorAll('[data-editor-path]').forEach(input=>input.addEventListener('input',()=>{
      const path=input.dataset.editorPath.split('.');let target=draft;
      for(const key of path.slice(0,-1))target=target[key];
      target[path.at(-1)]=input.value;dirty=true;
      dialog.querySelector('[data-dirty-state]').textContent='Alterações não publicadas';
    }));
    dialog.querySelector('[data-editor-form]')?.addEventListener('submit',event=>{event.preventDefault();void save();});
    dialog.querySelector('[data-reset-record]')?.addEventListener('click',()=>{void save(true);});
    dialog.querySelector('[data-visitor-search]')?.addEventListener('input',event=>{visitorQuery=event.target.value;dialog.querySelector('[data-visitor-results]').innerHTML=visitorRows();});
    dialog.querySelector('[data-online-only]')?.addEventListener('change',event=>{onlineOnly=event.target.checked;dialog.querySelector('[data-visitor-results]').innerHTML=visitorRows();});
  }
  function open(recordId) {
    if(recordId&&authenticated){if(!confirmDiscard())return;tab='content';chooseRecord(recordId);}
    render();
    if(!dialog.open)dialog.showModal();
    document.body.classList.add('admin-panel-open');
    if(!recordId)void checkSession();
    if(!refreshTimer)refreshTimer=setInterval(()=>{if(authenticated&&dialog.open&&document.visibilityState==='visible'&&!busy)void refresh();},10000);
  }
  dialog.addEventListener('cancel',event=>{if(!confirmDiscard())event.preventDefault();else {dirty=false;draft=null;}});
  dialog.addEventListener('close',()=>{document.body.classList.remove('admin-panel-open');clearInterval(refreshTimer);refreshTimer=null;});
  addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
  return {open,updateBar,init:checkSession,get authenticated(){return authenticated;},dispose(){clearInterval(refreshTimer);dialog.remove();document.querySelector('#admin-mode-bar')?.remove();document.body.classList.remove('admin-mode-active','admin-panel-open');}};
}
