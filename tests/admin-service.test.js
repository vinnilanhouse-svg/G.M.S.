import test from 'node:test';
import assert from 'node:assert/strict';
import {records} from '../src/data.js';
import {createGmsHandler,CONTENT_KEY} from '../server/gms-handler.js';
import {createRedis} from '../server/redis.js';

class MemoryRedis {
  values=new Map();
  async pipeline(commands){const results=[];for(const command of commands)results.push(await this.command(...command));return results;}
  async command(command,...args){
    if(command==='GET')return this.values.get(args[0])??null;
    if(command==='SET'){this.values.set(args[0],args[1]);return 'OK';}
    if(command==='DEL')return Number(this.values.delete(args[0]));
    if(command==='INCR'){const value=Number(this.values.get(args[0])||0)+1;this.values.set(args[0],value);return value;}
    if(command==='EXPIRE')return 1;
    if(command==='MGET')return args.map(key=>this.values.get(key)??null);
    if(command==='EVAL'){
      const [, ,key,revision,id,action,patch,date]=args;
      const document=JSON.parse(this.values.get(key)||'{"revision":0,"overrides":{}}');
      if(document.revision!==revision)return [0,JSON.stringify(document)];
      if(action==='reset')delete document.overrides[id];else document.overrides[id]=JSON.parse(patch);
      document.revision++;document.updatedAt=date;this.values.set(key,JSON.stringify(document));
      return [1,JSON.stringify(document)];
    }
    throw new Error(`Comando desconhecido: ${command}`);
  }
}
const password='senha-administrativa-de-teste';
function fixture(options={}){
  const store=options.store===undefined?new MemoryRedis():options.store;
  let clock=1_800_000_000_000;
  const handler=createGmsHandler({records,store,password,now:()=>clock,...options});
  async function request({method='GET',scope='',body,cookie,origin='https://gms.example',ip='127.0.0.1'}={}){
    const headers={host:'gms.example',origin,'x-forwarded-proto':'https','x-forwarded-for':ip,...(cookie?{cookie}:{})};
    const req={method,url:'/api/gms'+(scope?`?scope=${scope}`:''),headers,body};
    const res={headers:{},setHeader(key,value){this.headers[key.toLowerCase()]=value;},end(value){this.body=JSON.parse(value);}};
    await handler(req,res);return {status:res.statusCode,headers:res.headers,body:res.body};
  }
  async function login(){const result=await request({method:'POST',body:{action:'login',password}});assert.equal(result.status,200);return result.headers['set-cookie'].split(';')[0];}
  return {store,request,login,advance:ms=>clock+=ms};
}

test('sem banco configurado a API não autoriza publicação compartilhada',async()=>{
  const {request}=fixture({store:null});
  const result=await request();
  assert.equal(result.body.configured,false);assert.equal(result.body.presenceEnabled,undefined);
  assert.equal(result.body.onlineCount,undefined);
  assert.equal((await request({method:'PUT',body:{}})).status,503);
});

test('sessão administrativa exige senha, é HttpOnly, não usa credenciais narrativas e é revogada ao sair',async()=>{
  const {request,login}=fixture();
  assert.equal((await request({scope:'admin'})).status,401);
  assert.equal((await request({method:'POST',body:{action:'login',password:'NATHALISM0'}})).status,401);
  const result=await request({method:'POST',body:{action:'login',password}});
  assert.match(result.headers['set-cookie'],/HttpOnly/);assert.match(result.headers['set-cookie'],/SameSite=Strict/);assert.match(result.headers['set-cookie'],/Secure/);
  assert.ok(!JSON.stringify(result.body).includes(password));
  const cookie=await login();assert.equal((await request({scope:'admin',cookie})).status,200);
  assert.equal((await request({method:'POST',cookie,body:{action:'logout'}})).status,200);
  assert.equal((await request({scope:'admin',cookie})).status,401);
});

test('a API recusa alterações sem sessão ou de outra origem e limita tentativas de login',async()=>{
  const {request,login}=fixture();const cookie=await login();
  const body={recordId:records[0].id,revision:0,patch:{title:'Título'}};
  assert.equal((await request({method:'PUT',body})).status,401);
  assert.equal((await request({method:'PUT',body,cookie,origin:'https://outro.example'})).status,403);
  for(let index=0;index<8;index++)assert.equal((await request({method:'POST',ip:'127.0.0.2',body:{action:'login',password:'errada'}})).status,401);
  assert.equal((await request({method:'POST',ip:'127.0.0.2',body:{action:'login',password}})).status,429);
});

test('a API administrativa oferece apenas conteúdo e não registra nem lista visitantes',async()=>{
  const {request,login,store}=fixture();const cookie=await login();
  const result=await request({scope:'admin',cookie});
  assert.equal(result.status,200);assert.equal(result.body.visitors,undefined);assert.equal(result.body.onlineCount,undefined);
  assert.equal((await request({method:'POST',cookie,body:{action:'presence',name:'Agente'}})).status,400);
  assert.ok([...store.values.keys()].every(key=>!key.startsWith('gms:visitor')));
});

test('publicações são compartilhadas, não alteram permissões e uma revisão antiga não sobrescreve outra edição',async()=>{
  const {request,login,store}=fixture();const cookie=await login();
  const record=records.find(record=>record.id==='agente-wanderley');
  assert.equal((await request({method:'PUT',cookie,body:{recordId:record.id,revision:0,patch:{unlisted:false}}})).status,400);
  let result=await request({method:'PUT',cookie,body:{recordId:record.id,revision:0,patch:{summary:'Novo texto <literal>.'}}});
  assert.equal(result.status,200);assert.equal(result.body.revision,1);
  result=await request({method:'PUT',cookie,body:{recordId:record.id,revision:0,patch:{summary:'Sobrescrita incorreta'}}});
  assert.equal(result.status,409);
  assert.equal((await request()).body.overrides[record.id].summary,'Novo texto <literal>.');
  assert.equal(record.unlisted,true);assert.equal(record.requiredGrant,'wanderley');
  result=await request({method:'DELETE',cookie,body:{recordId:record.id,revision:1}});
  assert.equal(result.status,200);assert.equal(result.body.revision,2);
  assert.equal(JSON.parse(store.values.get(CONTENT_KEY)).overrides[record.id],undefined);
});

test('sessões expiram e trocar a senha invalida sessões existentes',async()=>{
  const {request,login,advance,store}=fixture();const cookie=await login();
  const changed=fixture({store,password:'outra-senha-administrativa'});
  assert.equal((await changed.request({scope:'admin',cookie})).status,401);
  advance(8*60*60*1000+1);
  assert.equal((await request({scope:'admin',cookie})).status,401);
});

test('o adaptador Redis mantém o token no servidor e envia comandos e pipelines pela API REST',async()=>{
  const calls=[];
  const store=createRedis({url:'https://redis.example/',token:'token-apenas-de-teste'},async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.endsWith('/pipeline')?[{result:1},{result:2}]:{result:'OK'}};});
  assert.equal(await store.command('SET','key','value'),'OK');
  assert.deepEqual(await store.pipeline([['INCR','a'],['INCR','b']]),[1,2]);
  assert.equal(calls[0].options.headers.Authorization,'Bearer token-apenas-de-teste');
  assert.equal(calls[0].url,'https://redis.example');assert.equal(calls[1].url,'https://redis.example/pipeline');
});
