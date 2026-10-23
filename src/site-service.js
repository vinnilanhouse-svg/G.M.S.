const endpoint='/api/gms';
function newId(){
  if(globalThis.crypto.randomUUID)return crypto.randomUUID();
  const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const hex=[...bytes].map(value=>value.toString(16).padStart(2,'0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
export async function apiRequest(scope='',{method='GET',body,signal}={}) {
  const response=await fetch(endpoint+(scope?`?scope=${encodeURIComponent(scope)}`:''),{method,credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:signal||AbortSignal.timeout(12000)});
  if(!response.headers.get('content-type')?.includes('application/json'))throw new Error('O serviço de administração não está disponível nesta versão do site.');
  const data=await response.json();
  if(!response.ok)throw Object.assign(new Error(data.error||'Não foi possível concluir a solicitação.'),{status:response.status});
  return data;
}

export function createSiteService({getName,getPage,onContent,onStatus}) {
  let contentState={revision:0,overrides:{}};
  let configured=false;
  let healthy=false;
  let timer;
  let syncing=false;
  let inFlight=false;
  let visitorId;
  const sessionId=newId();
  try {
    visitorId=localStorage.getItem('gms-visitor-id-v1');
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitorId||'')){visitorId=newId();localStorage.setItem('gms-visitor-id-v1',visitorId);}
  } catch {visitorId=newId();}
  const status=()=>({configured,healthy,revision:contentState.revision});
  function adopt(next) {
    if(!Number.isInteger(next.revision)||next.revision<contentState.revision)return;
    const changed=next.revision!==contentState.revision;
    contentState={revision:next.revision||0,overrides:next.overrides||{}};
    if(changed)onContent(contentState.overrides);
  }
  async function sync() {
    if(syncing||location.protocol==='file:')return;
    syncing=true;
    try {
      const next=await apiRequest();
      configured=next.configured===true;
      healthy=true;
      adopt(next);
      onStatus?.(status());
      await heartbeat();
    } catch {healthy=false;onStatus?.(status());}
    finally {syncing=false;}
  }
  async function heartbeat() {
    if(!configured||inFlight||!getName()||documentHidden())return;
    inFlight=true;
    try {await apiRequest('',{method:'POST',body:{action:'presence',visitorId,sessionId,name:getName(),page:getPage()}});}
    catch {healthy=false;onStatus?.(status());}
    finally {inFlight=false;}
  }
  function documentHidden(){return globalThis.document.visibilityState==='hidden';}
  function leave() {
    if(!configured||!getName())return;
    const body=JSON.stringify({action:'leave',visitorId,sessionId});
    try {navigator.sendBeacon(endpoint,new Blob([body],{type:'application/json'}));}catch{}
  }
  function visibility() {if(documentHidden())leave();else {void sync();}}
  function start() {
    void sync();
    timer=setInterval(()=>{if(!documentHidden())void sync();},25000);
    globalThis.document.addEventListener('visibilitychange',visibility);
    addEventListener('pagehide',leave);
    addEventListener('pageshow',()=>{if(documentHidden())return;void heartbeat();});
    addEventListener('online',()=>{void sync();});
  }
  function stop(){clearInterval(timer);leave();globalThis.document.removeEventListener('visibilitychange',visibility);removeEventListener('pagehide',leave);}
  return {start,stop,sync,heartbeat,adopt,get status(){return status();},get content(){return contentState;}};
}
