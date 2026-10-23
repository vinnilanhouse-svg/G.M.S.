import {validateRecordPatch} from '../src/content-editing.js';
import {hash,newToken,passwordMatches,readSessionToken,sameOrigin,sessionCookie,SESSION_SECONDS} from './auth.js';

export const CONTENT_KEY='gms:content:v1';
export const contentScript=`
local raw=redis.call('GET',KEYS[1])
local doc=raw and cjson.decode(raw) or {revision=0,overrides={}}
if doc.revision~=tonumber(ARGV[1]) then return {0,raw or cjson.encode(doc)} end
if ARGV[3]=='reset' then doc.overrides[ARGV[2]]=nil else doc.overrides[ARGV[2]]=cjson.decode(ARGV[4]) end
doc.revision=doc.revision+1
doc.updatedAt=ARGV[5]
redis.call('SET',KEYS[1],cjson.encode(doc))
return {1,cjson.encode(doc)}
`;
const parse=(value,fallback)=>{try{return typeof value==='string'?JSON.parse(value):value||fallback;}catch{return fallback;}};
const fault=(status,message)=>Object.assign(new Error(message),{status});

export function createGmsHandler({records,store,password,now=Date.now}) {
  const configured=Boolean(store&&password?.length>=16);
  function send(res,status,data) {res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.end(JSON.stringify(data));}
  async function readBody(req) {
    if(Number(req.headers['content-length']||0)>260000)throw fault(413,'O envio ultrapassa o tamanho permitido.');
    if(req.body!==undefined) {
      const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body);
      if(raw.length>260000)throw fault(413,'O envio ultrapassa o tamanho permitido.');
      try{return JSON.parse(raw);}catch{throw fault(400,'Envie um JSON válido.');}
    }
    let raw='';
    for await(const chunk of req){raw+=chunk;if(raw.length>260000)throw fault(413,'O envio ultrapassa o tamanho permitido.');}
    try{return JSON.parse(raw);}catch{throw fault(400,'Envie um JSON válido.');}
  }
  async function authenticated(req) {
    const token=readSessionToken(req);
    if(!configured||!token)return false;
    const session=parse(await store.command('GET',`gms:admin:${hash(token)}`),null);
    return session?.passwordHash===hash(password)&&session.expiresAt>now();
  }
  async function requireAdmin(req) {if(!await authenticated(req))throw fault(401,'Entre com a senha administrativa para continuar.');}
  async function rateLimit(req,kind,limit,seconds) {
    const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
    const key=`gms:rate:${kind}:${hash(ip)}`;
    const [count]=await store.pipeline([['INCR',key],['EXPIRE',key,seconds,'NX']]);
    if(count>limit)throw fault(429,'Muitas tentativas. Aguarde alguns minutos e tente novamente.');
  }
  async function content() {return parse(await store.command('GET',CONTENT_KEY),{revision:0,overrides:{}});}
  return async function handler(req,res) {
    try {
      if(req.method==='GET') {
        const scope=new URL(req.url,'http://localhost').searchParams.get('scope')||'content';
        if(scope==='session')return send(res,200,{configured,authenticated:await authenticated(req),setup:{storage:Boolean(store),password:Boolean(password?.length>=16)}});
        if(scope==='admin') {
          await requireAdmin(req);
          return send(res,200,{configured:true,authenticated:true,...await content()});
        }
        if(scope!=='content')throw fault(404,'Consulta não encontrada.');
        const document=store?await content():{revision:0,overrides:{}};
        return send(res,200,{...document,configured});
      }
      if(!['POST','PUT','DELETE'].includes(req.method)){res.setHeader('Allow','GET, POST, PUT, DELETE');throw fault(405,'Método não permitido.');}
      if(!sameOrigin(req))throw fault(403,'A solicitação precisa partir deste site.');
      if(!configured)throw fault(503,'A administração aguarda a configuração do armazenamento e da senha no servidor.');
      const body=await readBody(req);
      if(!body||typeof body!=='object'||Array.isArray(body))throw fault(400,'Solicitação inválida.');
      if(req.method==='POST'&&body.action==='login') {
        await rateLimit(req,'login',8,300);
        if(!passwordMatches(body.password,password))throw fault(401,'Senha administrativa incorreta.');
        const token=newToken();
        await store.command('SET',`gms:admin:${hash(token)}`,JSON.stringify({expiresAt:now()+SESSION_SECONDS*1000,passwordHash:hash(password)}),'EX',SESSION_SECONDS);
        res.setHeader('Set-Cookie',sessionCookie(req,token));
        return send(res,200,{authenticated:true});
      }
      if(req.method==='POST'&&body.action==='logout') {
        const token=readSessionToken(req);
        if(token)await store.command('DEL',`gms:admin:${hash(token)}`);
        res.setHeader('Set-Cookie',sessionCookie(req,'',0));
        return send(res,200,{authenticated:false});
      }
      await requireAdmin(req);
      if(!['PUT','DELETE'].includes(req.method))throw fault(400,'Ação não encontrada.');
      const record=records.find(record=>record.id===body.recordId);
      if(!record)throw fault(404,'Arquivo não encontrado.');
      if(!Number.isInteger(body.revision)||body.revision<0)throw fault(400,'A revisão do arquivo é inválida.');
      if(req.method==='PUT') {
        try{validateRecordPatch(record,body.patch);}catch(error){throw fault(400,error.message);}
      }
      const result=await store.command('EVAL',contentScript,1,CONTENT_KEY,body.revision,record.id,req.method==='DELETE'?'reset':'save',JSON.stringify(body.patch||{}),new Date(now()).toISOString());
      if(Number(result[0])!==1)throw fault(409,'Outra edição foi publicada. Recarregue os dados antes de tentar novamente; seu texto foi preservado no editor.');
      return send(res,200,parse(result[1],{}));
    } catch(error) {
      const status=error.status||503;
      if(!error.status)console.error('Falha no serviço do Arquivo GMS.');
      return send(res,status,{error:error.status?error.message:'O serviço está temporariamente indisponível. Tente novamente em instantes.'});
    }
  };
}
