import { createAdminShortcut } from './admin-shortcut.js';
import { localEditsKey } from './local-edits.js';
import { createAdminPanel } from './admin-panel.js';
import { createSiteService } from './site-service.js';
import { createOperationalPanel } from './operational-panel.js';
import { createAgentSheet } from './agent-sheet.js';
import { createPersonalCredential } from './personal-credential.js';
import { createDocumentHighlights } from './document-highlights.js';
import { createAgentProfile, profileNavigation } from './agent-profile.js';
import { createPersonalBackup } from './personal-backup.js';
import { readPersonalBackupData } from './personal-backup-model.js';
import { readAgentProfileSettings, updateAgentProfile } from './agent-profile-model.js';
import { readTerminalSound } from './terminal-sound.js';
import './workspace-experience.css';
import { agentSheetKey } from './agent-sheet-model.js';
import { createTerminalInterface } from './terminal-interface.js';
import { archiveTrace } from './archive-trace.js';
import { codexAnnotation } from './codex-annotations.js';
import { createCodexChat } from './codex-chat.js';
import './codex-annotations.css';
import { workFolderKey } from './work-folder.js';
import { applyContentOverrides } from './content-editing.js';
import { readAgentName, requestAgentIdentification } from './agent-identity.js';
import { showEntryScreen } from './entry-screen.js';
import { showAccessDeniedEffect } from './access-denied.js';
import { showLostPage } from './lost-page.js';
import { createTerminalTheme, terminalThemeKey } from './terminal-theme.js';
import { isArchivePath, resolveRoute, shouldShowEntryDetour } from './routing.js';
import gmsLogo from './assets/gms-logo.png';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './style.css';
import './species-typography.css';
import './readability.css';
import './agent-identity.css';
import './access-denied.css';
import './lost-page.css';
import './admin-panel.css';
import './operational-panel.css';
import './mission-progress.css';
import './terminal-interface.css';
import './agent-sheet.css';
import './theme-palettes.css';
import './server-workspace.css';
import './physical-folders.css';
import { records as originalRecords, categories } from './data.js';
let allRecords=originalRecords;
const terminalTheme=createTerminalTheme();
import { credentials, accessStorageKey, findCredential, readActiveCredentials, visibleRecords, listedRecords } from './permissions.js';

const paths = { inicio: 'Painel inicial', conhecimento: 'Base de conhecimento', documentos: 'Documentos internos', favoritos: 'Arquivos salvos', 'meu-agente': 'Meu agente', 'minha-missao': 'Minha missão', 'salvar-meus-dados': 'Salvar meus dados', 'minha-ficha': 'Minha ficha de agente', 'minha-credencial': 'Minha credencial', 'pasta-de-trabalho': 'Pasta de trabalho', busca: 'Busca no arquivo', agentes: 'Agentes', missoes: 'Missões', 'missoes/relatorios': 'Relatórios de missão', alvos: 'Alvos de interesse', credenciais: 'Credenciais de acesso', reservado: 'Arquivo reservado', administracao: 'Administração' };
const kinds = { verbete: 'Base de conhecimento', documento: 'Documento interno', agente: 'Agente', missao: 'Missão', relatorio: 'Relatório de missão', alvo: 'Alvo de interesse' };
const recordIcons = { verbete:'book', documento:'file', agente:'users', missao:'flag', relatorio:'clipboard', alvo:'target' };
const recordSections = { verbete:'conhecimento', documento:'documentos', agente:'agentes', missao:'missoes', relatorio:'missoes/relatorios', alvo:'alvos' };
const sectionForRecord = record => record?.collection === 'reservado' ? 'reservado' : recordSections[record?.kind];
const pageKey = () => current.page === 'missoes' && current.id ? `missoes/${current.id}` : current.page;
const icons = {
 connections:'<circle cx="5" cy="6" r="3"/><circle cx="19" cy="7" r="3"/><circle cx="12" cy="19" r="3"/><path d="m8 6 8 1M6 9l5 7m7-6-5 6"/>',
 expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
 key:'<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-5-5 3-3m-1 5 3-3"/>',
 users:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/>',
 flag:'<path d="M5 22V3m0 1c5-4 9 4 14 0v11c-5 4-9-4-14 0"/>',
 target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/>',
 clipboard:'<path d="M9 4H5v18h14V4h-4M8 11h8M8 16h6"/><rect x="9" y="2" width="6" height="5" rx="1"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 folder:'<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M3 10h18"/>',
 book:'<path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1v15"/>',
 file:'<path d="M14 2H5a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
 search:'<circle cx="10.8" cy="10.8" r="7.3"/><path d="m16 16 5 5"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 chevron:'<path d="m9 5 7 7-7 7"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
 globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
 bookmark:'<path d="M6 3h12v19l-6-4-6 4Z"/>',
 menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 filter:'<path d="M4 7h16M7 12h10M10 17h4"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 external:'<path d="M14 3h7v7M21 3l-9 9M10 3H3v18h18v-7"/>',
};
const icon=(name, cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.file}</svg>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const date=s=>new Date(`${s}T12:00:00`).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}).replaceAll('.','');
let personalStorage; try { personalStorage=localStorage; } catch {}
let agentName='';
try { agentName=readAgentName(localStorage); } catch {}
let saved;
try { saved = new Set(JSON.parse(localStorage.getItem('gms-saved')||'[]')); } catch { saved = new Set(); }
let activeCredentials;
try { activeCredentials = readActiveCredentials(localStorage.getItem(accessStorageKey)); } catch { activeCredentials = new Set(); }
let records=visibleRecords(allRecords,activeCredentials);
let catalog=listedRecords(records);
let pendingNotice='';
let pendingPrivateEntry=null;
let openPrivateEntry=null;
let toastTimer;
let current={};
let filters={q:'',status:'',category:'',access:'',missionId:''};
let previousPage='';
let mobileOpen=false;
let clearAccessEffect=null;
let codexChat;

function accessBadge(access) { return `<span class="access ${access==='Público'?'public':access==='Censurado'?'redacted':'restricted'}">${icon(access==='Público'?'globe':'lock')}${esc(access)}</span>`; }
function statusBadge(status) { return `<span class="status ${status==='Em andamento'?'active':status==='Encerrado'?'closed':''}"><i></i>${esc(status)}</span>`; }
function recordLink(id, label) {const r=records.find(x=>x.id===id); return r?`<a class="inline-link" href="#/arquivo/${r.id}">${esc(label||r.title)} ${icon('external')}</a>`:'';}
function credentialForm(placement) {
 const id=`credential-code-${placement}`;
 return `<section class="credential-panel ${placement==='main'?'credential-panel-main':''}" aria-label="Validação de credencial"><div class="credential-panel-heading"><a href="#/credenciais">${icon('key')}Credenciais de acesso</a><span>${activeCredentials.size.toString().padStart(2,'0')}</span></div>${placement==='main'?'<h2>Validar credencial</h2><p>Insira o código recebido para habilitar uma consulta ou personalizar este terminal.</p>':''}<form data-credential-form novalidate><label for="${id}" class="${placement==='sidebar'?'sr-only':''}">Código de autorização</label><div class="credential-input-row"><input id="${id}" name="code" type="text" placeholder="Insira seu código" maxlength="64" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-describedby="credential-feedback-${placement}"><button type="submit" aria-label="Validar código de autorização">${placement==='main'?'Validar':''}${icon('arrow')}</button></div><div class="credential-feedback" id="credential-feedback-${placement}" aria-live="polite"></div></form>${placement==='sidebar'?'<a href="#/credenciais" class="credential-manage">Consultar credenciais '+icon('chevron')+'</a>':''}</section>`;
}
function showToast(message) {
 const toast=document.querySelector('#toast');
 if(!toast)return;
 clearTimeout(toastTimer);
 toast.textContent=message;
 toast.classList.add('visible');
 toastTimer=setTimeout(()=>toast.classList.remove('visible'),4500);
}
function persistCredentials() {
 try { localStorage.setItem(accessStorageKey,JSON.stringify([...activeCredentials])); return true; } catch { return false; }
}
function redeemCredential(form) {
 const input=form.elements.namedItem('code');
 const feedback=form.querySelector('.credential-feedback');
 const code=input.value.trim();
 const credential=findCredential(code);
 feedback.className='credential-feedback';
 if(!code||!credential){
  feedback.textContent=code?'Código não reconhecido. Confira e tente novamente.':'Digite um código de autorização.';
  feedback.classList.add('error');
  input.setAttribute('aria-invalid','true');input.focus();return;
 }
 input.removeAttribute('aria-invalid');
 if(credential.effect==='change-theme'){
  const persisted=terminalTheme.select(credential.theme);
  input.value='';
  updateTerminalThemePanel();
  feedback.textContent=persisted?`Paleta ${terminalTheme.label.toLowerCase()} aplicada e salva neste navegador.`:`Paleta ${terminalTheme.label.toLowerCase()} aplicada nesta sessão. O navegador não permitiu salvar a preferência.`;
  return;
 }
 if(credential.effect==='rename-agent'){
  input.value='';
  setNavigationOpen(false);
  document.querySelectorAll('.overlay').forEach(overlay=>overlay.remove());
  changeAgentName();
  return;
 }
 if(credential.effect==='access-denied'){
  clearAccessEffect?.();
  setNavigationOpen(false);
  document.querySelectorAll('.overlay').forEach(overlay=>overlay.remove());
  clearAccessEffect=showAccessDeniedEffect({onComplete:()=>{
   clearAccessEffect=null;
   history.replaceState(null,'','#/inicio');
   render();
   const title=document.querySelector('main h1');
   if(title){title.tabIndex=-1;title.focus({preventScroll:true});}
  }});
  return;
 }
 if(credential.entryOnly){
  pendingPrivateEntry=credential;
  if(location.hash===credential.route)render();else location.hash=credential.route;
  return;
 }
 if(activeCredentials.has(credential.id)){
  feedback.innerHTML=`Esta credencial já está ativa. <a href="${esc(credential.route)}">Consultar acesso ${icon('arrow')}</a>`;
  return;
 }
 activeCredentials.add(credential.id);
 const persisted=persistCredentials();
 pendingNotice=persisted?`Credencial validada. ${credential.label} liberado.`:'Credencial validada para esta sessão. Não foi possível guardar a autorização neste terminal.';
 if(location.hash===credential.route)render();else location.hash=credential.route;
}
function credentialPage() {
 const active=credentials.filter(c=>activeCredentials.has(c.id));
 shell(`${heading('AUTORIZAÇÃO DE CONSULTA','Credenciais de acesso','Valide credenciais de consulta e personalize a aparência deste terminal.',`<div class="result-total"><strong>${active.length.toString().padStart(2,'0')}</strong><span>ACESSOS<br>ATIVOS</span></div>`)}<div class="credentials-layout"><div>${credentialForm('main')}${terminalThemePanel()}</div><section class="active-credentials"><div class="section-heading"><h2>${icon('lock')}Autorizações deste terminal</h2></div>${active.length?active.map(c=>`<article class="active-credential"><div class="active-credential-heading">${icon('key')}<h3>${esc(c.label)}</h3><span class="status active"><i></i>Ativa</span></div><p>${esc(c.description)}</p><div class="active-credential-actions"><a href="${esc(c.route)}">Consultar acesso ${icon('arrow')}</a><button type="button" data-revoke-credential="${esc(c.id)}">Remover deste terminal</button></div></article>`).join(''):`<div class="credentials-empty">${icon('lock')}<h3>Nenhuma credencial ativa</h3><p>Os acessos liberados aparecerão aqui após a validação de um código.</p></div>`}</section></div>`);
}
function terminalThemePanel() {
 return `<section class="terminal-theme-panel" aria-labelledby="terminal-theme-title"><h3 id="terminal-theme-title">Aparência deste terminal</h3><div class="terminal-theme-current"><i aria-hidden="true"></i><span>Paleta atual: <strong data-terminal-theme-name>${esc(terminalTheme.label)}</strong></span></div><p>A escolha fica salva neste navegador. Informe outra credencial de cor para trocar a paleta.</p><button type="button" class="op-text-button" data-reset-terminal-theme ${terminalTheme.id?'':'disabled'}>Restaurar paleta original</button></section>`;
}
function updateTerminalThemePanel() {
 document.querySelectorAll('[data-terminal-theme-name]').forEach(element=>{element.textContent=terminalTheme.label;});
 document.querySelectorAll('[data-reset-terminal-theme]').forEach(button=>{button.disabled=!terminalTheme.id;});
}
function credentialRequired() {
 shell(`${heading('CONSULTA CONDICIONADA','Credencial necessária','Este conteúdo exige uma autorização adicional vinculada ao terminal.')}<div class="locked-content"><div class="locked-content-symbol">${icon('lock')}</div>${credentialForm('main')}<a class="inline-link" href="#/credenciais">Consultar minhas credenciais ${icon('arrow')}</a></div>`);
}
function recordFigure(record) {
 if(!record.image)return '';
 const image=record.image;
 return `<figure class="species-figure"><button type="button" class="species-image-button" data-view-image="${esc(record.id)}" aria-label="Ampliar imagem de ${esc(record.title)}"><img src="${esc(image.src)}" alt="${esc(image.alt)}" width="${image.width}" height="${image.height}" decoding="async"><span class="species-image-action">${icon('expand')}Ampliar imagem</span></button><figcaption><span>REGISTRO VISUAL / ${esc(record.code)}</span><span>${esc(image.caption||'Manual de referência · edição 1.7')}</span></figcaption></figure>`;
}
function nav() {
 const activePath=current.page==='arquivo'?sectionForRecord(records.find(r=>r.id===current.id)):pageKey();
 const selected=path=>activePath===path||(path==='missoes'&&activePath==='missoes/relatorios');
 const link=(path,ic,label,isSelected=selected(path),url=`#/${path}`)=>`<a href="${url}" class="nav-link ${isSelected?'selected':''}" ${isSelected?'aria-current="page"':''}>${icon(ic)}<span>${label}</span></a>`;
 const consultation=[['conhecimento','book','Base de conhecimento','verbete'],['agentes','users','Agentes','agente'],['missoes','flag','Missões','missao'],['alvos','target','Alvos de interesse','alvo'],['documentos','file','Documentos internos','documento']];
 const regular=consultation.filter(([, , ,kind])=>catalog.some(record=>record.kind===kind));
 const empty=consultation.filter(([, , ,kind])=>!catalog.some(record=>record.kind===kind));
 const name=agentName||'Meu agente';const initials=name.split(/\s+/).slice(0,2).map(part=>[...part][0]).join('').toUpperCase();
 return `<aside class="sidebar ${mobileOpen?'is-open':''}" aria-label="Navegação principal"><a href="#/inicio" class="brand" aria-label="Arquivo GMS, painel inicial"><img src="${gmsLogo}" class="gms-mark brand-logo" alt="" width="138" height="138"><div>ARQUIVO <b>GMS</b><small>SISTEMA DE DOCUMENTAÇÃO</small></div></a><nav class="nav-home">${link('inicio','grid','Painel inicial')}</nav><section class="navigation-group" aria-labelledby="nav-consultation"><h2 id="nav-consultation" class="nav-caption">CONSULTAR</h2><nav>${regular.map(([path,ic,label])=>link(path,ic,label)+(path==='missoes'&&selected(path)?`<a href="#/missoes/relatorios" class="nav-sublink ${activePath==='missoes/relatorios'?'selected':''}">${icon('clipboard')}Relatórios do acervo</a>`:'')).join('')}${activeCredentials.has('arquivo-reservado')?link('reservado','key','Arquivo reservado'):''}${empty.length?`<details class="navigation-extra" ${empty.some(([path])=>selected(path))?'open':''}><summary>Outros arquivos</summary>${empty.map(([path,ic,label])=>link(path,ic,label)).join('')}</details>`:''}</nav></section><section class="navigation-group" aria-labelledby="nav-agent"><h2 id="nav-agent" class="nav-caption">MEU AGENTE</h2><nav>${link('meu-agente','users','Perfil de agente',['meu-agente','minha-credencial'].includes(current.page)||(current.page==='minha-ficha'&&!location.hash.includes('aba=campo')))}${link('minha-ficha','target','Ficha em campo',current.page==='minha-ficha'&&location.hash.includes('aba=campo'),'#/minha-ficha?aba=campo')}</nav></section><section class="navigation-group" aria-labelledby="nav-work"><h2 id="nav-work" class="nav-caption">MEU TRABALHO</h2><nav>${link('minha-missao','flag','Continuar missão')}${link('pasta-de-trabalho','folder','Pasta de trabalho',current.page==='pasta-de-trabalho',operationalPanel.folderLink())}${link('favoritos','bookmark','Arquivos salvos')}${link('salvar-meus-dados','external','Salvar meus dados')}</nav></section><div class="sidebar-bottom">${credentialForm('sidebar')}<a href="#/meu-agente" class="profile"><div class="avatar">${esc(initials)}</div><div>${esc(name)}<small>PERFIL DE AGENTE</small></div>${icon('chevron')}</a><div class="sidebar-version"><span>GMS / ARQUIVO CENTRAL</span><span>v.01</span></div></div></aside>`;
}

function folderSection() {
 return current.page==='arquivo'?sectionForRecord(records.find(record=>record.id===current.id)):pageKey();
}
function revealFolderTab() {
 const tabs=document.querySelector('.archive-folder-tabs'),selected=tabs?.querySelector('[aria-current="page"]');
 if(selected)tabs.scrollLeft=Math.max(0,selected.offsetLeft-tabs.clientWidth/2+selected.clientWidth/2);
}
function folderNavigation() {
 const section=folderSection();
 const tabs=[['inicio','grid','Arquivo central'],['conhecimento','book','Conhecimento'],['agentes','users','Agentes'],['missoes','flag','Missões'],['missoes/relatorios','clipboard','Relatórios'],['pasta-de-trabalho','folder','Pasta de trabalho']];
 const personal=['meu-agente','minha-ficha','minha-credencial'].includes(section);
 if(personal)tabs.push([section,'users','Meu agente']);
 else if(section&&!tabs.some(([id])=>id===section)&&section!=='minha-missao')tabs.push([section,section==='credenciais'?'key':'file',paths[section]||'Consulta']);
 const active=section==='minha-missao'?'missoes':section;
 return `<nav class="archive-folder-tabs" aria-label="Pastas do arquivo">${tabs.map(([id,symbol,label])=>`<a href="#/${id}" class="archive-folder-tab ${id===active?'selected':''}" ${id===active?'aria-current="page"':''}>${icon(symbol)}<span>${esc(label)}</span></a>`).join('')}</nav>`;
}
function serverDock() {
 const section=folderSection();
 const links=[['#/inicio','folder','Arquivo',['inicio','conhecimento','agentes','documentos','alvos','busca','favoritos','reservado'].includes(section)],['#/missoes','flag','Missões',['missoes','missoes/relatorios','minha-missao'].includes(section)],['#/minha-ficha?aba=campo','users','Minha ficha',['meu-agente','minha-ficha','minha-credencial'].includes(section)],[operationalPanel.folderLink(),'clipboard','Pasta',section==='pasta-de-trabalho'],['#/credenciais','key','Credenciais',section==='credenciais']];
 return `<nav class="server-dock" aria-label="Barra de aplicativos"><a class="dock-home" href="#/inicio" aria-label="Arquivo GMS, início"><img src="${gmsLogo}" class="gms-mark" alt="" width="32" height="32"><span>GMS<small>ARQUIVO CENTRAL</small></span></a><div class="server-dock-apps">${links.map(([url,symbol,label,active])=>`<a href="${url}" ${active?'aria-current="page" class="selected"':''}>${icon(symbol)}<span>${label}</span></a>`).join('')}<button type="button" data-open-codex aria-label="Conversar com C.O.D.E.X" aria-haspopup="dialog" aria-controls="codex-chat-dialog">${icon('book')}<span>C.O.D.E.X</span></button></div><span class="dock-session"><i></i>SESSÃO LOCAL</span></nav>`;
}
function setNavigationOpen(open) {
 mobileOpen=open;
 const sidebar=document.querySelector('.sidebar');if(!sidebar)return;
 sidebar.classList.toggle('is-open',open);sidebar.inert=!open;sidebar.setAttribute('aria-hidden',String(!open));
 const workspace=document.querySelector('.workspace');if(workspace)workspace.inert=open;
 document.body.classList.toggle('navigation-open',open);
 document.querySelector('[data-menu]')?.setAttribute('aria-expanded',String(open));
 document.querySelectorAll('.overlay').forEach(element=>element.remove());
 if(open){const overlay=document.createElement('div');overlay.className='overlay';overlay.addEventListener('click',()=>setNavigationOpen(false));document.body.append(overlay);sidebar.querySelector('[data-close-menu]')?.focus();}
 else document.querySelector('[data-menu]')?.focus({preventScroll:true});
}

function shell(content) {
 document.body.classList.remove('image-viewer-open','navigation-open');
 document.querySelector('#app').innerHTML=`${mobileOpen?'<div class="overlay" data-close-menu></div>':''}${nav()}<div class="workspace"><header class="topbar"><div class="breadcrumb"><button class="icon-button mobile-menu" aria-label="Abrir navegação" data-menu>${icon('menu')}</button><span>GMS</span><span class="slash">/</span><span>${esc(paths[pageKey()]||'Consulta de arquivo')}</span></div><div class="topbar-right"><span class="system-online"><i></i>SISTEMA OPERACIONAL</span><span class="topbar-divider"></span><span class="mono topbar-code">TERMINAL 001</span></div></header>${terminal.markup()}${operationalPanel.contextBar(current.page)}<main id="main-content">${content}</main><footer class="footer"><span>GMS <span class="footer-slash">/</span> DEPARTAMENTO DE DOCUMENTAÇÃO E MEMÓRIA</span><span><a href="#/credenciais" class="footer-credentials">${icon('key')}Credenciais de acesso</a><i></i> EDIÇÃO 1.7 <i></i> ACESSOS DEMONSTRATIVOS</span></footer></div><div id="toast" role="status"></div><dialog id="record-image-viewer" class="image-viewer" aria-labelledby="image-viewer-title"><div class="image-viewer-bar"><h2 id="image-viewer-title"></h2><button type="button" class="icon-button" data-close-image-viewer aria-label="Fechar imagem">${icon('close')}</button></div><div class="image-viewer-body"></div><p class="image-viewer-caption">REGISTRO VISUAL · DOCUMENTO DE REFERÊNCIA GMS · EDIÇÃO 1.7</p></dialog>`;
 bind();
 const workspace=document.querySelector('.workspace');
 const topbar=workspace.querySelector('.topbar');
 topbar.querySelector('.breadcrumb').insertAdjacentHTML('afterbegin',`<a class="server-brand" href="#/inicio"><img src="${gmsLogo}" class="gms-mark" alt="GMS" width="42" height="42"><span>ARQUIVO GMS<small>SERVIDOR DE DOCUMENTOS</small></span></a>`);
 topbar.querySelector('[data-menu]').setAttribute('aria-expanded','false');
 topbar.querySelector('.topbar-right').insertAdjacentHTML('afterbegin',`<a class="server-agent" href="#/meu-agente" title="${esc(agentName)}">${icon('users')}<span>${esc(agentName||'Meu agente')}</span></a>`);
 const main=workspace.querySelector('main');const folder=document.createElement('section');folder.className='archive-folder';folder.setAttribute('aria-label','Pasta em consulta');
 main.before(folder);folder.innerHTML=folderNavigation();folder.append(main);
 const dossier=main.querySelector('.dossier');
 const openRecord=current.page==='arquivo'?records.find(record=>record.id===current.id):null;
 if(dossier&&openRecord){
  const reading=document.createElement('div');reading.className='folio-reading-layout';dossier.before(reading);
  const index=document.createElement('nav');index.className='folio-file-index';index.setAttribute('aria-label','Arquivos desta pasta');
  const siblings=catalog.filter(record=>record.kind===openRecord.kind&&(record.kind!=='verbete'||record.category===openRecord.category));
  index.innerHTML=`<div class="folio-index-heading">${icon('folder')}<span>${esc(kinds[openRecord.kind]||'Arquivo')}<small>REGISTROS NA PASTA</small></span></div>${siblings.map(record=>`<a href="#/arquivo/${esc(record.id)}" ${record.id===openRecord.id?'aria-current="page" class="selected"':''}><small>${esc(record.code)}</small><span>${esc(record.title)}</span></a>`).join('')}`;
  const stack=document.createElement('div');stack.className='folio-paper-stack';
  dossier.style.setProperty('--folio-seal',`url("${gmsLogo}")`);
  const tab=document.createElement('div');tab.className='folio-document-tab';tab.textContent=`${openRecord.code} · ${openRecord.title}`;
  reading.append(index,stack);stack.append(tab,dossier);
  const pockets=document.createElement('nav');pockets.className='folio-pockets';pockets.setAttribute('aria-label','Divisórias da pasta');
  const missionId=openRecord.kind==='missao'?openRecord.id:openRecord.missionId;
  const destination=tab=>missionId?`#/pasta-de-trabalho?${new URLSearchParams({aba:tab,missao:missionId})}`:operationalPanel.folderLink(tab);
  pockets.innerHTML=`${main.querySelector('#relacionados')?`<a href="#relacionados" data-folio-related>${icon('file')}<span>Documentos vinculados</span></a>`:''}${[['anotacoes','clipboard','Anotações'],['pessoas','users','Pessoas de interesse'],['localidades','globe','Localidades']].map(([tab,symbol,label])=>`<a href="${destination(tab)}">${icon(symbol)}<span>${label}</span></a>`).join('')}`;
  pockets.querySelector('[data-folio-related]')?.addEventListener('click',event=>{event.preventDefault();main.querySelector('#relacionados').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
  dossier.querySelector('.dossier-aside')?.prepend(pockets);
 }
 workspace.insertAdjacentHTML('beforeend',serverDock());
 workspace.querySelector('[data-open-codex]').addEventListener('click',()=>codexChat?.open());
 const sidebar=document.querySelector('.sidebar');sidebar.inert=true;sidebar.setAttribute('aria-hidden','true');
 sidebar.insertAdjacentHTML('afterbegin',`<button type="button" class="drawer-close" data-close-menu aria-label="Fechar navegação">${icon('close')}<span>Fechar menu</span></button>`);
 sidebar.querySelector('.drawer-close').addEventListener('click',()=>setNavigationOpen(false));
 sidebar.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const controls=[...sidebar.querySelectorAll('a[href],button,input,summary')].filter(element=>element.getClientRects().length&&!element.disabled);
  const first=controls[0],last=controls.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
 });
 revealFolderTab();
 adminPanel?.updateBar();
 const record=current.page==='arquivo'?records.find(item=>item.id===current.id):null;
 terminal.attach({route:location.hash,page:current.page,record,locked:(current.page==='arquivo'&&!record)||(current.page==='reservado'&&!activeCredentials.has('arquivo-reservado'))});
}
function heading(kicker,title,description,extra='') {return `<div class="page-heading"><div><div class="eyebrow"><span></span>${kicker}</div><h1>${title}</h1><p>${description}</p></div>${extra}</div>`;}
function searchForm(value='',compact=false) {return `<form class="search-form ${compact?'compact':''}" role="search" data-search><label class="sr-only" for="global-search">Buscar em todo o arquivo</label>${icon('search')}<input id="global-search" name="q" type="search" placeholder="Busque por uma espécie, agente ou arquivo..." value="${esc(value)}" autocomplete="off"><button type="submit">Buscar no arquivo ${icon('arrow')}</button></form>`;}
function recordVisual(record) {
 const isGms=record.id==='org-gms';
 const species=record.category==='Espécies'?record:records.find(r=>r.category==='Espécies'&&r.notableMembers?.includes(record.id));
 const image=isGms?{src:gmsLogo,alt:'Logo da G.M.S.',width:128,height:128}:record.icon||species?.icon;
 if(!image)return `<span class="record-icon">${icon(recordIcons[record.kind])}</span>`;
 const label=image.alt||(record.kind==='agente'?`Espécie de referência: ${species?.title||record.title}`:record.title);
 return `<span class="record-icon record-icon--species" title="${esc(label)}"><img${isGms?' class="gms-mark"':''} src="${esc(image.thumbnail||image.src)}" alt="${esc(label)}" width="${image.thumbnailWidth||image.width}" height="${image.thumbnailHeight||image.height}" loading="lazy" decoding="async"></span>`;
}
function recentTable(list,full=false) {
 return `<div class="table-wrap"><table class="record-table"><thead><tr><th>IDENTIFICAÇÃO / ARQUIVO</th>${full?'<th>SITUAÇÃO</th>':''}<th>ACESSO</th><th>ATUALIZAÇÃO</th><th><span class="sr-only">Abrir</span></th></tr></thead><tbody>${list.map(r=>`<tr><td><a href="#/arquivo/${r.id}" class="record-name">${recordVisual(r)}<span><small>${r.code}</small><strong>${esc(r.title)}</strong>${!full?`<em>${kinds[r.kind]} · ${date(r.date)}</em>`:''}</span></a></td>${full?`<td>${statusBadge(r.status)}</td>`:''}<td>${accessBadge(r.access)}</td><td class="date-cell">${date(r.date)}</td><td><a href="#/arquivo/${r.id}" class="row-arrow" aria-label="Abrir ${esc(r.title)}">${icon('arrow')}</a></td></tr>`).join('')}</tbody></table></div>`;
}
function dashboard() {
 const priority=['org-gms','especie-abissais','especie-gorgona','especie-vampiro'];
 const recent=[...catalog].sort((a,b)=>b.date.localeCompare(a.date)||(priority.indexOf(a.id)<0?99:priority.indexOf(a.id))-(priority.indexOf(b.id)<0?99:priority.indexOf(b.id))).slice(0,5);
 const count=kind=>catalog.filter(r=>r.kind===kind).length.toString().padStart(2,'0');
 shell(`${heading('SISTEMA INTERNO DE DOCUMENTAÇÃO','Arquivo central<span class="title-dot">.</span>','Conhecimento preservado. Ocorrências documentadas. Memória sob custódia.',`<div class="heading-stamp"><span>REGISTRO INSTITUCIONAL</span><b>GMS — AC / 001</b><span>CONSULTA AUTORIZADA</span></div>`)}
 ${agentName?`<div class="agent-access-summary">${icon('users')}<p>Acesso de agente: <strong>${esc(agentName)}</strong></p></div>`:''}
 <section class="search-section" aria-label="Busca no arquivo"><div class="search-label"><span>O QUE VOCÊ PROCURA?</span><span>CONSULTE. RELACIONE. INVESTIGUE.</span></div>${searchForm()}</section>
 ${operationalPanel.dashboard()}
 <section class="operations-strip" aria-label="Central de operações">${[['agentes','users','agente','Agentes','Equipe e histórico funcional'],['missoes','flag','missao','Missões','Ordens de missão e relatórios'],['alvos','target','alvo','Alvos de interesse','Indivíduos e grupos sob apuração']].filter(([, ,kind])=>catalog.some(record=>record.kind===kind)).map(([path,ic,kind,label,description])=>`<a href="#/${path}"><span class="operation-icon">${icon(ic)}</span><span><strong>${label}</strong><small>${description}</small></span><span class="operation-count">${count(kind)}</span>${icon('arrow')}</a>`).join('')}</section>
 <section class="category-section" aria-label="Seções principais"><a class="category-card" href="#/conhecimento"><div class="card-top">${icon('book')}<span>01 / CONHECIMENTO</span>${icon('arrow')}</div><h2>Base de conhecimento</h2><p>Espécies, suas origens e modos de existir.</p><div class="card-bottom"><span><b>${count('verbete')}</b> ENTRADAS · ${catalog.filter(r=>r.category==='Espécies').length} ESPÉCIES</span></div></a>${catalog.some(record=>record.kind==='documento')?`<a class="category-card" href="#/documentos"><div class="card-top">${icon('file')}<span>02 / DOCUMENTAÇÃO</span>${icon('arrow')}</div><h2>Documentos internos</h2><p>Memória, diretrizes e registros institucionais.</p><div class="card-bottom"><span><b>${count('documento')}</b> DOCUMENTOS ARQUIVADOS</span></div></a>`:''}</section>
 <section class="recent-section"><div class="section-heading"><h2>${icon('clock')}Atualizações recentes</h2><a href="#/busca">Ver todo o arquivo ${icon('arrow')}</a></div>${recentTable(recent)}<div class="table-foot"><i></i>EXIBINDO OS 5 ÚLTIMOS REGISTROS ATUALIZADOS<span>ACERVO / ${catalog.length.toString().padStart(3,'0')}</span></div></section>
 <section class="archive-note"><img src="${gmsLogo}" class="gms-mark archive-note-logo" alt="" width="100" height="100"><div><span class="eyebrow">DIRETRIZ DO ARQUIVO</span><p>Proteger a convivência.<br>Compreender as diferenças.</p></div><div class="archive-note-right"><span>GLOBAL MONSTER SECURITY.</span><span>DEPARTAMENTO DE DOCUMENTAÇÃO / GMS</span></div></section>`);
}
function missionTabs() {
 return `<nav class="mission-tabs" aria-label="Seções de missões"><a href="#/missoes" class="${pageKey()==='missoes'?'selected':''}" ${pageKey()==='missoes'?'aria-current="page"':''}>${icon('flag')}Missões</a><a href="#/missoes/relatorios" class="${pageKey()==='missoes/relatorios'?'selected':''}" ${pageKey()==='missoes/relatorios'?'aria-current="page"':''}>${icon('clipboard')}Relatórios<span>${records.filter(r=>r.kind==='relatorio').length.toString().padStart(2,'0')}</span></a></nav>`;
}
function listPage() {
 const page=pageKey();
 const selectedKind={conhecimento:'verbete',documentos:'documento',agentes:'agente',missoes:'missao','missoes/relatorios':'relatorio',alvos:'alvo'}[page];
 const all=catalog.filter(r=>page==='favoritos'?saved.has(r.id):page==='reservado'?r.collection==='reservado':!selectedKind||r.kind===selectedKind);
 const meta={
  conhecimento:['ÍNDICE DE REFERÊNCIA','Base de conhecimento','Espécies, origens e capacidades naturais. Conhecimento para compreender a convivência.'],
  documentos:['CIRCULAÇÃO INSTITUCIONAL','Documentos internos','Memorandos, referências e registros preservados em seu contexto original.'],
  agentes:['DIRETÓRIO INSTITUCIONAL','Agentes','Identificação, lotação e histórico de atuação dos integrantes da GMS.'],
  missoes:['COORDENAÇÃO DE OPERAÇÕES','Missões','Consulte objetivos, equipes designadas e o acompanhamento de cada operação.'],
  'missoes/relatorios':['DOCUMENTAÇÃO OPERACIONAL','Relatórios de missão','Registros de preparação, observações e conclusões vinculados às missões da GMS.'],
  reservado:['CIRCULAÇÃO AUTORIZADA','Arquivo reservado','Documentos adicionais disponibilizados pelas credenciais ativas neste terminal.'],
  alvos:['INTELIGÊNCIA E APURAÇÃO','Alvos de interesse','Indivíduos e grupos sob investigação. O interesse investigativo não constitui confirmação de culpa.'],
  favoritos:['SEU ÍNDICE DE CONSULTA','Arquivos salvos','Registros marcados neste navegador para consulta rápida.'],
  busca:['CONSULTA INTEGRADA','Busca no arquivo','Conhecimento, agentes, missões e documentos. Todas as conexões em um único lugar.'],
 }[page];
 const options=(values,value)=>values.map(s=>`<option value="${esc(s)}" ${value===s?'selected':''}>${esc(s)}</option>`).join('');
 shell(`${heading(...meta,`<div class="result-total"><strong>${all.length.toString().padStart(2,'0')}</strong><span>REGISTROS<br>NO ACERVO</span></div>`)}${page.startsWith('missoes')?missionTabs():''}${pageKey()==='missoes/relatorios'?'<p><a class="op-link" href="#/pasta-de-trabalho?aba=relatorios">Montar meu relatório de campo →</a></p>':''}${page==='busca'?searchForm(filters.q,true):''}${page==='conhecimento'?`<div class="wiki-categories"><button class="wiki-chip ${!filters.category?'chosen':''}" data-category="">Todas as entradas</button>${categories.map(c=>`<button class="wiki-chip ${filters.category===c?'chosen':''}" data-category="${c}">${c}</button>`).join('')}</div>`:''}
 <section class="listing"><div class="filter-bar"><div class="local-search">${icon('search')}<label class="sr-only" for="local-query">Filtrar registros</label><input id="local-query" type="search" placeholder="Filtrar por título, código ou conteúdo" value="${esc(filters.q)}"></div><div class="filter-controls">${icon('filter')}<label><span class="sr-only">Situação</span><select data-filter="status"><option value="">Todas as situações</option>${options([...new Set(all.map(r=>r.status))],filters.status)}</select></label><label><span class="sr-only">Categoria</span><select data-filter="category"><option value="">Todas as categorias</option>${options([...new Set(all.map(r=>r.category))],filters.category)}</select></label><label><span class="sr-only">Classificação de acesso</span><select data-filter="access"><option value="">Todos os acessos</option>${options(['Público','Restrito','Censurado'],filters.access)}</select></label>${page==='missoes/relatorios'?`<label class="mission-filter"><span class="sr-only">Missão vinculada</span><select data-filter="missionId"><option value="">Todas as missões</option>${records.filter(r=>r.kind==='missao').map(m=>`<option value="${esc(m.id)}" ${filters.missionId===m.id?'selected':''}>${esc(m.code)} · ${esc(m.title)}</option>`).join('')}</select></label>`:''}</div></div><div id="list-results" aria-live="polite"></div></section>
 <div class="access-explanation">${icon('lock')}<p>As classificações identificam o contexto de circulação de cada registro. <span>Acervo de demonstração: todos os níveis estão disponíveis para consulta.</span></p></div>`);
 current.all=all;
 updateResults();
}
function updateResults() {
 const emptyMessages={documentos:'Ainda não há documentos internos neste acervo.',missoes:'Ainda não há missões cadastradas neste acervo.','missoes/relatorios':'Ainda não há relatórios de missão neste acervo.',alvos:'Ainda não há alvos de interesse cadastrados neste acervo.'};
 const list=current.all.filter(r=>(!filters.status||r.status===filters.status)&&(!filters.category||r.category===filters.category)&&(!filters.access||r.access===filters.access)&&(!filters.missionId||r.missionId===filters.missionId)&&(!filters.q||norm([r.code,r.title,r.summary,r.category,...r.report,...(r.abilities||[]).map(a=>[a.title,a.text,a.variant,...(a.details||[]).map(d=>d.title+' '+d.text)].join(' '))].join(' ')).includes(norm(filters.q))));
 document.querySelector('#list-results').innerHTML=`<div class="results-meta"><span>${list.length} ${list.length===1?'registro encontrado':'registros encontrados'}</span><button class="text-button" data-reset>Limpar filtros ${icon('close')}</button></div>${list.length?(current.page==='conhecimento'?`<div class="wiki-grid">${list.map(r=>`<a class="wiki-card" href="#/arquivo/${r.id}">${r.icon?`<div class="wiki-card-visual wiki-card-symbol"><img src="${esc(r.icon.src)}" alt="Símbolo da espécie: ${esc(r.title)}" width="${r.icon.width}" height="${r.icon.height}" loading="lazy" decoding="async"></div>`:''}<div class="wiki-card-top"><span>${r.code} / ${r.category}</span>${icon('arrow')}</div><h2${r.category==='Espécies'?` class="species-title" data-species="${esc(r.id)}"`:""}>${esc(r.title)}</h2><p>${esc(r.summary)}</p><div class="wiki-card-bottom">${accessBadge(r.access)}</div></a>`).join('')}</div>`:recentTable(list,['agentes','missoes','alvos'].includes(current.page))):`<div class="empty-state">${icon('search')}<h2>Nenhum registro encontrado</h2><p>${!current.all.length&&emptyMessages[pageKey()]?emptyMessages[pageKey()]:current.page==='favoritos'&&!saved.size?'Abra um arquivo e selecione “Salvar arquivo” para adicioná-lo aqui.':'Tente outro termo ou remova os filtros para ampliar a consulta.'}</p></div>`}<div class="table-foot"><i></i>FIM DOS RESULTADOS<span>GMS / CONSULTA INTEGRADA</span></div>`;
 document.querySelector('[data-reset]').onclick=()=>{filters={q:'',status:'',category:'',access:'',missionId:''};listPage();};
}
function speciesAbilityGroups(abilities) {
 const groups=[
  ['initial','01','Habilidades iniciais','Traços presentes na natureza da espécie.'],
  ['acquired','02','Habilidades adquiridas','Manifestações desenvolvidas com experiência e domínio da própria natureza.'],
  ['apex','03','Ápice da espécie','A expressão máxima de suas capacidades, com seus próprios limites e consequências.'],
 ];
 return groups.map(([stage,number,title,description])=>{
  const list=abilities.filter(a=>a.stage===stage);
  if(!list.length)return '';
  return `<section class="ability-group ability-group--${stage}" aria-labelledby="ability-group-${stage}"><header class="ability-group-heading"><span class="ability-stage-code">${number} / ${stage==='apex'?'MANIFESTAÇÃO MÁXIMA':stage==='acquired'?'DESENVOLVIMENTO':'NATUREZA INATA'}</span><h3 id="ability-group-${stage}">${title}</h3><p>${description}</p></header><div class="abilities-list">${list.map(a=>`<div class="ability">${a.variant?`<span class="ability-variant">COMPOSIÇÃO / ${esc(a.variant)}</span>`:''}<h4>${esc(a.title)}</h4><p>${esc(a.text)}</p>${a.details?.length?`<dl class="ability-details">${a.details.map(d=>`<div><dt>${esc(d.title)}</dt><dd>${esc(d.text)}</dd></div>`).join('')}</dl>`:''}</div>`).join('')}</div></section>`;
 }).join('');
}
function reportContent(record) {
 const text=value=>esc(value).replace(/█+/g,match=>`<span class="redaction" aria-label="Trecho censurado">${match}</span>`);
 const paragraphs=items=>items.map(p=>`<p>${text(p)}</p>`).join('');
 if(!record.reportSections?.length)return paragraphs(record.report);
 return record.reportSections.map((section,index)=>{
  const items=record.report.slice(section.start,record.reportSections[index+1]?.start);
  return `<h3 class="report-heading">${esc(section.title)}</h3>${section.list?`<ul class="report-list">${items.map(item=>`<li>${text(item)}</li>`).join('')}</ul>`:paragraphs(items)}`;
 }).join('');
}
function detail(id) {
 const r=records.find(x=>x.id===id);
 if(!r&&allRecords.some(x=>x.id===id&&x.requiredGrant)){credentialRequired();return;}
 if(!r) {lostPage();return;}
 document.title=`${r.title} — Arquivo GMS`;
 const parent=sectionForRecord(r);
 const isSpecies=r.category==='Espécies';
 const notableMembers=(r.notableMembers||[]).map(id=>records.find(record=>record.id===id)).filter(Boolean);
 const reportTitle={verbete:'Descrição e observações',agente:'Registro do agente',missao:'Ordem de missão',relatorio:'Relatório de missão',alvo:'Síntese de inteligência'}[r.kind]||(r.category==='Depoimentos'?'Transcrição do depoimento':'Relatório');
 const missionReports=records.filter(x=>x.kind==='relatorio'&&x.missionId===r.id);
 shell(`<div class="detail-top"><a class="back-link" href="#/${parent}">${icon('arrow')} ${paths[parent]}</a>${!r.unlisted?`<button class="save-button ${saved.has(r.id)?'is-saved':''}" data-save="${r.id}">${icon('bookmark')}<span>${saved.has(r.id)?'Arquivo salvo':'Salvar arquivo'}</span></button>`:''}</div><article class="dossier ${r.image?'dossier-with-image':''} ${r.image&&r.kind==='agente'?'dossier-with-portrait':''}"><header class="dossier-header">${r.demo?'<div class="demo-banner">REGISTRO ILUSTRATIVO · NÃO CANÔNICO — exemplo de navegação, sem vínculo com acontecimentos da lore.</div>':''}<div class="dossier-meta"><span>${r.code} <span class="separator">/</span> ${kinds[r.kind].toUpperCase()}</span>${accessBadge(r.access)}</div><h1${r.category==='Espécies'?` class="species-title" data-species="${esc(r.id)}"`:""}>${esc(r.title)}</h1><p class="dossier-summary">${esc(r.summary)}</p><div class="dossier-info"><div><span>AUTORIA</span><strong>${esc(r.author)}</strong></div><div><span>DEPARTAMENTO</span><strong>${esc(r.department)}</strong></div><div><span>ATUALIZAÇÃO</span><strong>${date(r.date)}</strong></div><div${r.kind==='agente'&&r.status==='Desaparecido'?' class="dossier-situation-highlight"':''}><span>SITUAÇÃO</span>${statusBadge(r.status)}</div></div></header>
 ${r.kind==='missao'?operationalPanel.missionTools(r):''}
 <div class="dossier-layout"><div class="dossier-body"><nav class="document-index" aria-label="Seções deste arquivo"><a href="#relatorio" data-section="relatorio">01 / ${r.kind==='verbete'?'Descrição':r.kind==='agente'?'Perfil':r.kind==='missao'?'Ordem de missão':r.kind==='alvo'?'Síntese':'Relatório'}</a>${r.abilities?'<a href="#capacidades" data-section="capacidades">02 / Capacidades naturais</a>':''}${r.timeline?`<a href="#cronologia" data-section="cronologia">${r.abilities?'03':'02'} / Cronologia</a>`:''}${isSpecies?'<a href="#membros-notaveis" data-section="membros-notaveis">03 / Membros notáveis</a>':'<a href="#relacionados" data-section="relacionados">↗ / Vínculos</a>'}${!r.unlisted?'<a href="#grifos" data-section="grifos">✎ / Grifos pessoais</a>':''}<a href="#circulacao" data-section="circulacao">↳ / Circulação</a></nav><section id="relatorio" class="document-section"><div class="eyebrow">01 / ${r.kind==='verbete'?'REGISTRO DESCRITIVO':'DOCUMENTO INTEGRAL'}</div><h2>${reportTitle}</h2>${reportContent(r)}${r.note?`<aside class="employee-note"><span>ANOTAÇÃO DE ARQUIVO</span><p>${esc(r.note)}</p></aside>`:''}${codexAnnotation(r,records)}</section>
 ${r.abilities?`<section id="capacidades" class="document-section"><div class="eyebrow">NATUREZA DA ESPÉCIE</div><h2>Capacidades e particularidades</h2><p class="section-intro">Manifestações próprias da espécie, suas condições e seus limites.</p>${speciesAbilityGroups(r.abilities)}</section>`:''}

 ${r.timeline?`<section id="cronologia" class="document-section"><div class="eyebrow">${r.abilities?'03':'02'} / SEQUÊNCIA DE EVENTOS</div><h2>Cronologia</h2><ol class="timeline">${r.timeline.map(t=>`<li><time>${esc(t.date)}</time><p>${esc(t.text)}</p></li>`).join('')}</ol></section>`:''}
 ${r.kind==='missao'?`<section class="document-section mission-reports"><div class="section-heading"><h2>${icon('clipboard')}Relatórios desta missão</h2><a href="#/missoes/relatorios?missao=${encodeURIComponent(r.id)}">Consultar relatórios ${icon('arrow')}</a></div>${missionReports.length?`<div class="related-list">${missionReports.map(x=>`<a href="#/arquivo/${x.id}"><div>${icon('clipboard')}<span><small>${esc(x.code)} · ${esc(x.status)}</small><strong>${esc(x.title)}</strong></span></div>${icon('arrow')}</a>`).join('')}</div>`:'<p>Nenhum relatório vinculado a esta missão.</p>'}</section>`:''}
 ${isSpecies?`<section id="membros-notaveis" class="document-section"><div class="eyebrow">03 / REGISTROS INDIVIDUAIS</div><h2>Membros notáveis</h2>${notableMembers.length?`<div class="notable-members-list">${notableMembers.map(member=>`<p>${recordLink(member.id)}</p>`).join('')}</div>`:'<p>Ainda não é de conhecimento nenhum membro notável dessa espécie.</p>'}</section>`:`<section id="relacionados" class="document-section"><div class="eyebrow">VÍNCULOS DOCUMENTAIS</div><h2>Arquivos relacionados</h2><div class="related-list">${r.related.map(id=>{const x=records.find(v=>v.id===id);return x?`<a href="#/arquivo/${x.id}"><div>${icon(recordIcons[x.kind])}<span><small>${x.code} · ${kinds[x.kind]}</small><strong>${esc(x.title)}</strong></span></div>${icon('arrow')}</a>`:'';}).join('')}</div></section>`}${documentHighlights.markup(r)}${archiveTrace(r,{agentName,localRevision:Object.hasOwn(siteService.localContent.overrides,r.id),publishedRevision:Object.hasOwn(siteService.content.overrides,r.id)})}${r.source?`<div class="source-reference"><span>REFERÊNCIA DOCUMENTAL</span><p>Manual de referência · edição 1.7 / ${esc(r.sourceSection)}</p><a href="${esc(r.sourceUrl)}" target="_blank" rel="noopener noreferrer">Consultar documento de origem ${icon('external')}</a><small>Descrição adaptada para consulta narrativa. Códigos, departamentos e classificações de circulação são editoriais.</small></div>`:''}<div class="document-end">FIM DO REGISTRO <span>${r.code} / GMS</span></div></div>
 <aside class="dossier-aside">${r.image?recordFigure(r):`<div class="file-stamp"><img src="${gmsLogo}" class="gms-mark stamp-logo" alt="Emblema da Global Monster Security" width="138" height="138"><span>ARQUIVO CENTRAL</span><b>${r.code}</b><small>CÓPIA DE CONSULTA</small></div>`}<div class="aside-block"><h3>IDENTIFICAÇÃO</h3><dl><dt>Categoria</dt><dd>${r.category}</dd><dt>Classificação</dt><dd>${r.access}</dd><dt>Registro</dt><dd class="mono">${r.code}</dd></dl></div>${r.profile?`<div class="aside-block"><h3>${r.kind==='alvo'?'DADOS DE APURAÇÃO':r.kind==='missao'?'DADOS OPERACIONAIS':'DADOS FUNCIONAIS'}</h3><dl>${r.profile.map(f=>`<dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd>`).join('')}</dl></div>`:''}${r.missionId?`<div class="aside-block"><h3>MISSÃO VINCULADA</h3><p>${recordLink(r.missionId)}</p></div>`:''}${r.agentIds?.length?`<div class="aside-block"><h3>EQUIPE DESIGNADA</h3>${r.agentIds.map(id=>`<p>${recordLink(id)}</p>`).join('')}</div>`:''}${r.targetIds?.length?`<div class="aside-block"><h3>ALVOS DE INTERESSE</h3>${r.targetIds.map(id=>`<p>${recordLink(id)}</p>`).join('')}</div>`:''}${r.people?`<div class="aside-block"><h3>PESSOAS ENVOLVIDAS</h3>${r.people.map(p=>`<p>${esc(p)}</p>`).join('')}</div>`:''}${r.locations?`<div class="aside-block"><h3>LOCAIS</h3>${r.locations.map(p=>`<p>${esc(p)}</p>`).join('')}</div>`:''}${r.evidence?`<div class="aside-block"><h3>EVIDÊNCIAS</h3>${r.evidence.map(p=>`<p>${esc(p)}</p>`).join('')}</div>`:''}<div class="aside-disclaimer">${icon('lock')}<p>Classificação demonstrativa.<br>${r.demo?'Exemplo não canônico.':esc(r.sourceNote||'Referência narrativa · edição 1.7.')}</p></div></aside></div></article>`);
}
function bind() {
 agentSheet.bind();
 agentProfile.bind();
 personalBackup.bind();
 personalCredential.bind();
 operationalPanel.bind();
 documentHighlights.bind(current.page==='arquivo'?records.find(record=>record.id===current.id):null);
 document.querySelector('[data-open-admin]')?.addEventListener('click',openAdministration);
 const imageViewer=document.querySelector('#record-image-viewer');
 document.querySelectorAll('[data-view-image]').forEach(button=>button.addEventListener('click',()=>{
  const record=records.find(r=>r.id===button.dataset.viewImage);
  if(!record?.image)return;
  imageViewer.querySelector('#image-viewer-title').textContent=record.title;
  imageViewer.querySelector('.image-viewer-caption').textContent=record.kind==='agente'?'REGISTRO VISUAL · ARQUIVO DE PESSOAL · G.M.S.':'REGISTRO VISUAL · DOCUMENTO DE REFERÊNCIA GMS · EDIÇÃO 1.7';
  const image=record.image;
  imageViewer.querySelector('.image-viewer-body').innerHTML=`<img src="${esc(image.src)}" alt="${esc(image.alt)}" width="${image.width}" height="${image.height}">`;
  imageViewer.showModal();document.body.classList.add('image-viewer-open');
 }));
 imageViewer?.querySelector('[data-close-image-viewer]').addEventListener('click',()=>imageViewer.close());
 imageViewer?.addEventListener('click',event=>{if(event.target===imageViewer)imageViewer.close();});
 imageViewer?.addEventListener('close',()=>document.body.classList.remove('image-viewer-open'));
 document.querySelectorAll('[data-credential-form]').forEach(form=>{
  form.addEventListener('submit',event=>{event.preventDefault();redeemCredential(form);});
  form.elements.namedItem('code').addEventListener('input',()=>{form.elements.namedItem('code').removeAttribute('aria-invalid');const feedback=form.querySelector('.credential-feedback');feedback.textContent='';feedback.className='credential-feedback';});
 });
 document.querySelector('[data-reset-terminal-theme]')?.addEventListener('click',()=>{
  const persisted=terminalTheme.select('');
  updateTerminalThemePanel();
  showToast(persisted?'Paleta original restaurada.':'Paleta original restaurada nesta sessão. O navegador não permitiu salvar a preferência.');
 });
 document.querySelectorAll('[data-revoke-credential]').forEach(button=>button.addEventListener('click',()=>{
  activeCredentials.delete(button.dataset.revokeCredential);
  const persisted=persistCredentials();
  render();
  showToast(persisted?'Autorização removida deste terminal.':'Autorização removida nesta sessão. Não foi possível atualizar o registro deste terminal.');
 }));
 document.querySelector('[data-menu]')?.addEventListener('click',()=>setNavigationOpen(!mobileOpen));
 document.querySelector('[data-close-menu]')?.addEventListener('click',()=>{mobileOpen=false;render();});
 document.querySelectorAll('[data-search]').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const q=new FormData(f).get('q').trim();const next=`#/busca?q=${encodeURIComponent(q)}`;if(location.hash===next){filters.q=q;listPage();}else location.hash=next;}));
 document.querySelector('#local-query')?.addEventListener('input',e=>{filters.q=e.target.value;updateResults();});
 document.querySelectorAll('[data-filter]').forEach(s=>s.addEventListener('change',()=>{filters[s.dataset.filter]=s.value;updateResults();document.querySelectorAll('[data-category]').forEach(b=>b.classList.toggle('chosen',b.dataset.category===filters.category));}));
 document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{filters.category=b.dataset.category;listPage();}));
 document.querySelectorAll('[data-section]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.getElementById(a.dataset.section).scrollIntoView({behavior:'smooth',block:'start'});}));
 document.querySelector('[data-save]')?.addEventListener('click',e=>{const id=e.currentTarget.dataset.save;if(saved.has(id))saved.delete(id);else saved.add(id);try{localStorage.setItem('gms-saved',JSON.stringify([...saved]));}catch{}const y=scrollY;detail(id);scrollTo(0,y);showToast(saved.has(id)?'Arquivo adicionado aos salvos.':'Arquivo removido dos salvos.');});
}
function returnHome() {
 history.replaceState(null,'',location.protocol==='file:'?'#/inicio':'/#/inicio');
 render();
 const title=document.querySelector('main h1');
 if(title){title.tabIndex=-1;title.focus({preventScroll:true});}
}
function lostPage() {
 document.body.classList.remove('navigation-open');
 codexChat?.close(false);
 terminal.cancel();
 clearAccessEffect?.();
 clearAccessEffect=null;
 document.querySelectorAll('body > .overlay').forEach(overlay=>overlay.remove());
 current={page:'perdido'};
 mobileOpen=false;
 showLostPage({logo:gmsLogo,onReturnHome:returnHome});
 scrollTo(0,0);
}
function render() {
 try {renderPage();}
 catch(error){console.error('Não foi possível abrir esta página.',error);lostPage();}
 finally {codexChat?.refresh();}
}
function renderPage() {
 if(/^#\/depuracao(?:$|\?)/.test(location.hash))history.replaceState(null,'',location.hash.replace('#/depuracao','#/administracao'));
 clearAccessEffect?.();
 clearAccessEffect=null;
 document.querySelectorAll('body > .overlay').forEach(x=>x.remove());
 const {query:qs,...route}=resolveRoute(location.hash,paths);
 current=route;mobileOpen=false;
 if(!isArchivePath(location)){lostPage();return;}
 if(openPrivateEntry&&location.hash!==openPrivateEntry.route)openPrivateEntry=null;
 if(pendingPrivateEntry){
  if(location.hash===pendingPrivateEntry.route)openPrivateEntry=pendingPrivateEntry;
  pendingPrivateEntry=null;
 }
 const viewCredentials=new Set(activeCredentials);
 if(openPrivateEntry)viewCredentials.add(openPrivateEntry.id);
 records=visibleRecords(allRecords,viewCredentials);
 catalog=listedRecords(records);
 if(pageKey()!==previousPage){filters={q:'',status:'',category:'',access:'',missionId:''};previousPage=pageKey();}
 if(pageKey()==='missoes/relatorios')filters.missionId=new URLSearchParams(qs).get('missao')||'';
 if(current.page==='busca')filters.q=new URLSearchParams(qs).get('q')||'';
 document.title=`${paths[pageKey()]||'Consulta'} — Arquivo GMS`;
 if(current.page==='inicio')dashboard();else if(current.page==='meu-agente')shell(agentProfile.page());else if(current.page==='minha-missao')shell(operationalPanel.missionPage(qs));else if(current.page==='salvar-meus-dados')shell(personalBackup.page());else if(current.page==='minha-ficha')shell(profileNavigation(new URLSearchParams(qs).get('aba')==='campo'?'campo':'ficha')+agentSheet.page(qs));else if(current.page==='minha-credencial')shell(profileNavigation('credencial')+personalCredential.page());else if(current.page==='pasta-de-trabalho')shell(operationalPanel.page(qs));else if(current.page==='administracao')shell(`<section class="admin-launch"><div class="eyebrow">CONTROLE DO ARQUIVO</div><h1>Administração</h1><p>Abra o editor para alterar os textos do arquivo. Sem conexão com o banco, as edições ficam salvas apenas neste navegador.</p><button type="button" data-open-admin>Abrir painel administrativo</button></section>`);else if(current.page==='credenciais')credentialPage();else if(current.page==='reservado'&&!activeCredentials.has('arquivo-reservado'))credentialRequired();else if(current.page==='arquivo')detail(current.id);else if(Object.hasOwn(paths,pageKey()))listPage();else lostPage();
 scrollTo(0,0);
 if(pendingNotice){showToast(pendingNotice);pendingNotice='';}
}
function changeAgentName() {
 if(document.querySelector('.agent-identification[open]'))return;
 requestAgentIdentification(gmsLogo,({name,persisted})=>{
  agentName=name;
  const syncWarning=synchronizeAgentName(name);
  render();
  if(syncWarning){showToast(syncWarning);return;}
  showToast(persisted?'Identificação de agente atualizada.':'Nome atualizado nesta sessão. O navegador não permitiu salvar para a próxima visita.');
 },{initialName:agentName,canCancel:true});
}
function openAdministration() {
 setNavigationOpen(false);
 document.querySelectorAll('body > .overlay').forEach(overlay=>overlay.remove());
 adminPanel.open();
}
const terminal=createTerminalInterface();
const siteService=createSiteService({
 onContent:overrides=>{allRecords=applyContentOverrides(originalRecords,overrides);render();},
});
const adminPanel=createAdminPanel({
 service:siteService,
 getRecords:includeReserved=>includeReserved?allRecords:records,
 getCurrentRecord:includeReserved=>current.page==='arquivo'?(includeReserved?allRecords:records).find(record=>record.id===current.id):null,
});
const adminShortcut=createAdminShortcut({
 isEnabled:()=>current.page==='inicio'&&Boolean(agentName)&&!mobileOpen&&!document.querySelector('dialog[open]'),
 onMatch:openAdministration,
});
const personalCredential=createPersonalCredential({getAgentName:()=>agentName,icon,onNameChange:synchronizeAgentName});
const documentHighlights=createDocumentHighlights({icon});
const operationalPanel=createOperationalPanel({
 getRecords:()=>catalog,
 icon,
 onNotice:showToast,
 onChange:()=>{const y=scrollY;render();scrollTo(0,y);},
});
const agentSheet=createAgentSheet({
 icon,
 sound:terminal.sound,
 onNameChange:synchronizeAgentName,
 onNotice:showToast,
 onChange:()=>{const y=scrollY;render();scrollTo(0,y);},
});
function getPersonalData() {
 return readPersonalBackupData(personalStorage,{name:agentName,profile:readAgentProfileSettings(personalStorage),sheet:agentSheet.snapshot().fields,credential:personalCredential.snapshot(),...operationalPanel.snapshot(),highlights:documentHighlights.snapshot(),saved:[...saved],theme:terminalTheme.id,sound:terminal.sound.enabled?'on':'off'});
}
function reloadPersonalData(message) {
 agentName=readAgentName(personalStorage);try{saved=new Set(JSON.parse(personalStorage.getItem('gms-saved')||'[]'));}catch{}
 agentSheet.reload(true);personalCredential.reload(true);documentHighlights.reload(true);operationalPanel.reload(true);terminalTheme.reload();terminal.sound.setEnabled(readTerminalSound(personalStorage),false);
 render();if(message)showToast(message);
}
function synchronizeAgentName(name) {
 if(!readAgentProfileSettings(personalStorage).syncName)return '';
 try {const result=updateAgentProfile(personalStorage,name,{syncName:true,sheet:agentSheet.snapshot(),credential:personalCredential.snapshot()});agentName=result.name;agentSheet.reload(true);personalCredential.reload(true);return '';}
 catch(error){return `Nome salvo neste registro. A sincronização aguarda correção: ${error.message}`;}
}
const agentProfile=createAgentProfile({storage:personalStorage,getData:getPersonalData,onSave:(name,syncName,expected)=>{updateAgentProfile(personalStorage,name,{syncName,expected,sheet:agentSheet.snapshot(),credential:personalCredential.snapshot()});reloadPersonalData(syncName?'Identificação sincronizada no acesso, na ficha e na credencial.':'Identificação de acesso salva.');}});
const personalBackup=createPersonalBackup({storage:personalStorage,getData:getPersonalData,onRestore:reloadPersonalData});
codexChat=createCodexChat({getRecords:()=>catalog,getAgentName:()=>agentName,isAvailable:()=>Boolean(agentName)&&!['perdido','administracao'].includes(current.page)});
addEventListener('hashchange',()=>{adminShortcut.reset();render();});
addEventListener('resize',revealFolderTab);
addEventListener('blur',adminShortcut.reset);
addEventListener('keydown',adminShortcut.handleKeydown);
addEventListener('error',event=>{if(event.error)lostPage();});
addEventListener('unhandledrejection',()=>lostPage());
addEventListener('keydown',e=>{if(e.key==='Escape'&&mobileOpen)setNavigationOpen(false);if(e.key==='/'&&!document.querySelector('dialog[open]')&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();document.querySelector('#global-search, #local-query')?.focus();}});
if(shouldShowEntryDetour())history.replaceState(null,'','#/perdido');
render();
if(agentName)showEntryScreen(gmsLogo);
else requestAgentIdentification(gmsLogo,({name,persisted})=>{
 agentName=name;
 render();
 showEntryScreen(gmsLogo);
 if(!persisted)showToast('Nome registrado nesta sessão. O navegador não permitiu salvar para a próxima visita.');
});

siteService.start();
void adminPanel.init();
addEventListener('storage',event=>{
 if(event.key===terminalThemeKey||event.key===null){terminalTheme.reload();updateTerminalThemePanel();}
 if(event.key===agentSheetKey)agentSheet.reload();
 if(event.key===localEditsKey)siteService.reloadLocal();
 if(event.key===workFolderKey){
  operationalPanel.reload();
  if(current.page==='inicio'||(current.page==='minha-missao'&&!document.activeElement?.closest('form,dialog[open]'))||(current.page==='pasta-de-trabalho'&&!document.activeElement?.closest('.note-editor,.folder-entry-editor,.folder-add-form,.mission-progress-editor,dialog[open],.folder-search-form,.evidence-drag,.field-report-editor,.personal-credential-editor,.highlight-note'))){const y=scrollY;render();scrollTo(0,y);}
 }
 if(event.key==='gms-agent-name-v1'){
  try{agentName=readAgentName(localStorage);}catch{}
  if(current.page==='inicio')render();
 }
});
