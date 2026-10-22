import {randomToken,derive,json} from '../../_auth.js';
// Set BOOTSTRAP_SECRET as a Cloudflare secret; never place it in GitHub or chat.
// Only initializes the two named accounts; cannot replace existing credentials.
export async function onRequestPost({request,env}){
 try{
  if(!env.BOOTSTRAP_SECRET)return json({error:'Configuração inicial indisponível'},503);
  const {secret,username,password,recovery_email}=await request.json();
  if(typeof secret!=='string'||secret.length!==env.BOOTSTRAP_SECRET.length)return json({error:'Não autorizado'},403);
  let mismatch=0;for(let i=0;i<secret.length;i++)mismatch|=secret.charCodeAt(i)^env.BOOTSTRAP_SECRET.charCodeAt(i);
  if(mismatch)return json({error:'Não autorizado'},403);
  if(!['kevin','bryan'].includes(username)||typeof password!=='string'||password.length<12||password.length>1024||typeof recovery_email!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recovery_email))return json({error:'Dados inválidos'},400);
  const exists=await env.DB.prepare('SELECT id FROM users WHERE username=? COLLATE NOCASE').bind(username).first();
  if(exists)return json({error:'Conta já configurada'},409);
  const salt=randomToken().slice(0,32),iterations=310000,hash=await derive(password,salt,iterations);
  await env.DB.prepare('INSERT INTO users(id,username,recovery_email,password_hash,password_salt,password_iterations) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),username,recovery_email,hash,salt,iterations).run();
  return json({ok:true},201);
 }catch{return json({error:'Não foi possível configurar a conta'},503);}
}
