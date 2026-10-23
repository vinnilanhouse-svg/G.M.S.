import {createHash,randomBytes,timingSafeEqual} from 'node:crypto';

export const cookieName='gms_admin_session';
export const SESSION_SECONDS=8*60*60;
export const hash=value=>createHash('sha256').update(value).digest('hex');
export const newToken=()=>randomBytes(32).toString('base64url');
export function passwordMatches(value,expected) {
  return typeof value==='string'&&value.length<=256&&Boolean(expected)&&timingSafeEqual(Buffer.from(hash(value)),Buffer.from(hash(expected)));
}
export function sessionCookie(req,token,seconds=SESSION_SECONDS) {
  const secure=String(req.headers['x-forwarded-proto']||'').split(',')[0].trim()==='https'||process.env.VERCEL==='1';
  return `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${seconds}${secure?'; Secure':''}`;
}
export function readSessionToken(req) {
  const cookie=String(req.headers.cookie||'').split(';').map(part=>part.trim()).find(part=>part.startsWith(`${cookieName}=`));
  const token=cookie?.slice(cookieName.length+1);
  return token&&/^[A-Za-z0-9_-]{43}$/.test(token)?token:null;
}
export function sameOrigin(req) {
  try {return new URL(req.headers.origin).host===req.headers.host&&req.headers['sec-fetch-site']!=='cross-site';}catch{return false;}
}
