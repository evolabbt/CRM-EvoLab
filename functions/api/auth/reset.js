import {digest,derive,randomToken,json} from '../../_auth.js';
export async function onRequestPost({request,env}){
 try{
  const {token,password}=await request.json();
  if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token)||typeof password!=='string'||password.length<12||password.length>1024)return json({error:'Token ou senha inválidos (mínimo 12 caracteres)'},400);
  const hash=await digest(token);
  const record=await env.DB.prepare("SELECT user_id FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>datetime('now')").bind(hash).first();
  if(!record)return json({error:'Link expirado ou inválido'},400);
  const salt=randomToken().slice(0,32),iterations=310000;
  const passwordHash=await derive(password,salt,iterations);
  const consumed=await env.DB.prepare("UPDATE password_reset_tokens SET used_at=datetime('now') WHERE token_hash=? AND used_at IS NULL AND expires_at>datetime('now')").bind(hash).run();
  if(consumed.meta.changes!==1)return json({error:'Link já utilizado'},400);
  await env.DB.batch([
   env.DB.prepare("UPDATE users SET password_hash=?,password_salt=?,password_iterations=?,updated_at=datetime('now') WHERE id=?").bind(passwordHash,salt,iterations,record.user_id),
   env.DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(record.user_id)
  ]);
  return json({ok:true,message:'Senha atualizada. Entre novamente.'});
 }catch{return json({error:'Não foi possível redefinir a senha'},503);}
}
