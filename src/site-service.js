import {readLocalEdits,saveLocalEdit} from './local-edits.js';
const endpoint='/api/gms';
export async function apiRequest(scope='',{method='GET',body,signal}={}) {
  const response=await fetch(endpoint+(scope?`?scope=${encodeURIComponent(scope)}`:''),{method,credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:signal||AbortSignal.timeout(12000)});
  if(!response.headers.get('content-type')?.includes('application/json'))throw new Error('O serviço de administração não está disponível nesta versão do site.');
  const data=await response.json();
  if(!response.ok)throw Object.assign(new Error(data.error||'Não foi possível concluir a solicitação.'),{status:response.status});
  return data;
}

export function createSiteService({onContent,onStatus,storage}) {
  if(!storage)try{storage=globalThis.localStorage;}catch{}
  let contentState={revision:0,overrides:{}};
  let localContent=readLocalEdits(storage);
  let configured=false;
  let healthy=false;
  let timer;
  let syncing=false;
  const status=()=>({configured,healthy,revision:contentState.revision});
  const notify=()=>onContent({...contentState.overrides,...localContent.overrides});
  function adopt(next) {
    if(!Number.isInteger(next.revision)||next.revision<contentState.revision)return;
    const changed=next.revision!==contentState.revision;
    contentState={revision:next.revision,overrides:next.overrides||{}};
    if(changed)notify();
  }
  function reloadLocal() {localContent=readLocalEdits(storage);notify();}
  function saveLocal(record,patch,options) {localContent=saveLocalEdit(storage,record,patch,options);notify();return localContent;}
  function clearLocal(record) {
    const current=readLocalEdits(storage);
    if(!Object.hasOwn(current.overrides,record.id))return true;
    try {localContent=saveLocalEdit(storage,record,null,{revision:current.revision,reset:true});}
    catch {
      const overrides={...current.overrides};delete overrides[record.id];
      localContent={...current,overrides};notify();return false;
    }
    notify();
    return true;
  }
  async function sync() {
    if(syncing||location.protocol==='file:')return;
    syncing=true;
    try {
      const next=await apiRequest();
      configured=next.configured===true;healthy=true;adopt(next);onStatus?.(status());
    } catch {healthy=false;onStatus?.(status());}
    finally {syncing=false;}
  }
  function visibility(){if(document.visibilityState!=='hidden')void sync();}
  function online(){void sync();}
  function start() {
    notify();void sync();
    timer=setInterval(()=>{if(document.visibilityState!=='hidden')void sync();},25000);
    document.addEventListener('visibilitychange',visibility);addEventListener('online',online);
  }
  function stop(){clearInterval(timer);document.removeEventListener('visibilitychange',visibility);removeEventListener('online',online);}
  return {start,stop,sync,adopt,saveLocal,clearLocal,reloadLocal,get status(){return status();},get content(){return contentState;},get localContent(){return localContent;}};
}
