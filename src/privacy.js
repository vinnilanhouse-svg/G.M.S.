import { inject, pageview } from '@vercel/analytics';
import { privacyKey, readConsent, analyticsPath, filterAnalytics } from './privacy-model.js';
import './privacy.css';
export function privacyPolicy() {
 return `<article class="privacy-policy"><div class="eyebrow">TRANSPARÊNCIA · ATUALIZADO EM 30/10/2026</div><h1>Privacidade e armazenamento</h1>
 <p>Este aviso explica o tratamento de dados no Arquivo GMS. Responsável: <strong>Elemental Corp.</strong> Contato: <a href="mailto:coradi.maddaloni@gmail.com">coradi.maddaloni@gmail.com</a>.</p>
 <h2>Seus registros neste dispositivo</h2><p>Nome de acesso, ficha, credencial pessoal, anotações, quadro, relatórios, grifos, favoritos e preferências são guardados no armazenamento local do navegador para oferecer as funções que você solicita. Não são enviados ao Analytics. Use um nome de personagem ou pseudônimo; evite dados pessoais de terceiros ou informações sensíveis nos campos livres. O assistente C.O.D.E.X. funciona localmente, sem enviar conversas a uma inteligência artificial externa.</p>
 <p>Esses registros permanecem até você os excluir ou limpar os dados do site no navegador. Em dispositivo compartilhado, outras pessoas com acesso ao mesmo perfil do navegador podem vê-los. A troca do nome de agente não apaga os registros anteriores. Exporte uma cópia em <a href="#/salvar-meus-dados">Salvar meus dados</a> antes de limpar o armazenamento, se quiser preservá-los.</p>
 <h2>Métricas opcionais</h2><p>Somente após sua autorização, utilizamos Vercel Web Analytics para compreender o uso do site por estatísticas agregadas de visitas e visualizações, com informações técnicas como navegador, dispositivo e localização aproximada derivada da conexão. Essa finalidade opcional usa seu consentimento, que pode ser recusado ou retirado a qualquer momento, sem perder acesso ao site.</p>
 <p>A integração envia apenas categorias gerais de navegação. Não enviamos nomes digitados, códigos de acesso, conteúdo de fichas, termos de busca, textos de anotações ou identificadores de arquivos reservados. A primeira chamada de inicialização é descartada para não transmitir a página de origem da visita. Não usamos identificação nominal, gravação de sessão ou eventos personalizados.</p>
 <h2>Cookies e escolhas</h2><p>Não instalamos cookies de publicidade. O Web Analytics utilizado aqui dispensa cookies de rastreamento; os recursos pessoais usam armazenamento local, que também é uma tecnologia de armazenamento no dispositivo. Sua escolha sobre métricas é lembrada por até 180 dias. Se o navegador não permitir gravá-la, ela vale apenas nesta sessão. O sinal Global Privacy Control, quando presente, mantém as métricas desativadas.</p>
 <p>O armazenamento funcional atende aos recursos solicitados pelo usuário; a preferência de privacidade permite respeitar sua escolha. Nenhuma caixa de aceite é exigida para usar o arquivo. Você pode recusar as métricas e continuar normalmente.</p>
 <h2>Hospedagem, compartilhamento e retenção</h2><p>A Vercel hospeda o site e processa as métricas autorizadas. Requisições de hospedagem podem envolver dados técnicos da conexão, como endereço IP, necessários à entrega e segurança do serviço, mesmo com métricas recusadas. O provedor pode processar dados fora do Brasil. Os períodos de retenção das métricas e dos registros técnicos dependem do serviço e do plano utilizado; não se confundem com os 180 dias da preferência local. Consulte a <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer">documentação de privacidade do Vercel Analytics</a> e a <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">política de privacidade da Vercel</a>.</p>
 <p>O site não vende dados pessoais. Arquivos exportados ficam sob seu controle; ao compartilhá-los, considere as informações incluídas. Caso a administração compartilhada seja configurada, textos publicados por administradores serão enviados ao serviço de armazenamento do projeto; os registros pessoais continuam locais.</p>
 <h2>Seus direitos (LGPD) e contato</h2><p>Você pode solicitar informações sobre o tratamento, confirmação e acesso, correção, anonimização, bloqueio ou eliminação quando cabível, portabilidade nos termos aplicáveis e revogação do consentimento. Envie o pedido para <a href="mailto:coradi.maddaloni@gmail.com">coradi.maddaloni@gmail.com</a>. Dados que existem somente no seu navegador precisam ser consultados, exportados ou excluídos no próprio dispositivo; a administração não recebe uma cópia deles. Também é possível recorrer à Autoridade Nacional de Proteção de Dados (ANPD).</p>
 <p>As medidas de segurança e o armazenamento local não eliminam todos os riscos. Não use o arquivo para guardar documentos pessoais reais ou segredos que exijam controle de acesso de segurança: as credenciais narrativas fazem parte da experiência do RPG.</p>
 <button type="button" class="op-button" data-open-privacy>Rever preferências de privacidade</button></article>`;
}
export function createPrivacy() {
 let storage; try { storage = localStorage; } catch {}
 let choice = readConsent(storage), initialized = false, memoryOnly = false, trackingActive = false;
 const gpc = navigator.globalPrivacyControl === true;
 const production = location.protocol === 'https:' && ['globalmonstersecurity.vercel.app','gms-rho-lemon.vercel.app'].includes(location.hostname);
 const allowed = () => !gpc && readCurrent()?.analytics === true;
 function readCurrent() { if (!memoryOnly) choice = readConsent(storage); return choice; }
 function send() { if (initialized && allowed()) pageview({ path: analyticsPath(location.hash), route: analyticsPath(location.hash) }); }
 function start() {
  if (!production || !allowed()) { trackingActive = false; return; }
  const resumed = !trackingActive; trackingActive = true;
  if (!initialized) {
   initialized = true;
   inject({ mode:'production', debug:false, disableAutoTrack:true,
    beforeSend: event => filterAnalytics(event,{consent:allowed(),origin:location.origin,hash:location.hash}) });
   // The SDK's first manual view carries document.referrer. Drop it before sending anything.
   pageview({path:'/analytics-initialization',route:'/analytics-initialization'});
  }
  if (resumed) send();
 }
 const root = document.createElement('div'); root.id='gms-privacy'; document.body.append(root);
 const dialog = document.createElement('dialog'); dialog.className='privacy-dialog'; dialog.setAttribute('aria-labelledby','privacy-title');
 dialog.innerHTML=`<header><h2 id="privacy-title">Suas escolhas de privacidade</h2><button type="button" class="op-button" data-privacy-close>Fechar</button></header><p>O armazenamento funcional mantém seus registros neste navegador. Métricas de uso são opcionais e não incluem seus textos ou nome de agente.</p><p data-privacy-status role="status"></p><div class="privacy-actions"><button type="button" class="op-button" data-privacy-choice="false">Recusar métricas</button><button type="button" class="op-button" data-privacy-choice="true">Aceitar métricas</button></div><details><summary>Ler aviso de privacidade completo</summary>${privacyPolicy()}</details>`;
 document.body.append(dialog);
 function paint() {
  readCurrent(); root.innerHTML=choice?'':`<section class="privacy-banner" aria-label="Preferências de privacidade"><strong>Privacidade no Arquivo GMS</strong><p>Seus registros ficam neste navegador. Podemos usar métricas opcionais, sem cookies de rastreamento, para entender o uso do site?</p><div class="privacy-actions"><button type="button" class="op-button" data-privacy-choice="false">Recusar métricas</button><button type="button" class="op-button" data-privacy-choice="true">Aceitar métricas</button><button type="button" class="op-text-button" data-open-privacy>Entender e escolher</button></div></section>`;
  dialog.querySelector('[data-privacy-status]').textContent=gpc?'Métricas desativadas pelo sinal Global Privacy Control do seu navegador.':`${choice?.analytics?'Métricas autorizadas.':'Métricas desativadas.'}${memoryOnly?' A escolha vale apenas nesta sessão; não foi possível salvá-la.':''}`;
  document.querySelectorAll('[data-privacy-choice="true"]').forEach(button=>button.disabled=gpc);
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-open-privacy],[data-privacy-choice],[data-privacy-close]'); if(!button)return;
  if(button.hasAttribute('data-open-privacy')) { if(!dialog.open){paint();dialog.showModal();} return; }
  if(button.hasAttribute('data-privacy-close')){dialog.close();return;}
  choice={version:1,analytics:button.dataset.privacyChoice==='true'&&!gpc,at:Date.now()};
  try { storage.setItem(privacyKey,JSON.stringify(choice)); memoryOnly=false; } catch { memoryOnly=true; }
  trackingActive = false; paint(); start(); if(dialog.open)dialog.close();
 });
 addEventListener('hashchange',send);
 addEventListener('storage',event=>{if(event.key===privacyKey||event.key===null){memoryOnly=false;paint();start();}});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){paint();start();}});
 // No timers are necessary: the transmission gate rechecks expiration for every event.
 paint();start();
 return {open:()=>{paint();dialog.showModal();}};
}
