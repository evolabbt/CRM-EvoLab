import {cookie,digest,json} from '../../_auth.js';
export async function onRequestPost({request,env}){
 try{
  const token=cookie(request);
  if(/^[a-f0-9]{64}$/.test(token))await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await digest(token)).run();
  const response=json({ok:true});
  response.headers.set('Set-Cookie','evolab_session=; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=0');
  return response;
 }catch{return json({error:'Falha ao sair'},503);}
}
