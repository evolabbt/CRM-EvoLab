// Shared password and session utilities for Cloudflare Pages Functions.
// Passwords use PBKDF2-SHA256 with unique salts; session tokens are stored hashed.
const enc = new TextEncoder();
const hex = bytes => [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');
export const randomToken = () => { const a=new Uint8Array(32);crypto.getRandomValues(a);return hex(a); };
export async function digest(value){return hex(await crypto.subtle.digest('SHA-256',enc.encode(value)));}
export async function derive(password,salt,iterations=310000){
  const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:Uint8Array.from(salt.match(/../g).map(x=>parseInt(x,16))),iterations,hash:'SHA-256'},key,256);
  return hex(bits);
}
export async function verifyPassword(password,user){
  if(!user.password_hash||!user.password_salt||!user.password_iterations)return false;
  const actual=await derive(password,user.password_salt,user.password_iterations);
  const a=Uint8Array.from(actual.match(/../g).map(x=>parseInt(x,16)));
  const b=Uint8Array.from(user.password_hash.match(/../g).map(x=>parseInt(x,16)));
  if(a.length!==b.length)return false;
  let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;
}
export const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export function cookie(request){return request.headers.get('Cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('evolab_session='))?.split('=')[1]||'';}
export async function authenticated(request,env){
  const token=cookie(request);if(!/^[a-f0-9]{64}$/.test(token))return null;
  const hash=await digest(token);
  return env.DB.prepare("SELECT users.id, users.username FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token_hash=? AND sessions.expires_at > datetime('now')").bind(hash).first();
}
