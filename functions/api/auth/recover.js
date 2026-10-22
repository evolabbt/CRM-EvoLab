import {randomToken,digest,json} from '../../_auth.js';
export async function onRequestPost({request,env}){
 const generic={ok:true,message:'Se a conta existir, enviaremos instruções para o e-mail cadastrado.'};
 try{
  const {username}=await request.json();
  if(typeof username!=='string'||username.length>64)return json(generic);
  const user=await env.DB.prepare('SELECT id,recovery_email FROM users WHERE username=? COLLATE NOCASE').bind(username.trim()).first();
  if(!user)return json(generic);
  if(!env.RESEND_API_KEY||!env.RESET_FROM_EMAIL)return json({error:'Serviço de e-mail ainda não configurado'},503);
  const token=randomToken(),hash=await digest(token);
  await env.DB.prepare("DELETE FROM password_reset_tokens WHERE user_id=?").bind(user.id).run();
  await env.DB.prepare("INSERT INTO password_reset_tokens(token_hash,user_id,expires_at) VALUES(?,?,datetime('now','+20 minutes'))").bind(hash,user.id).run();
  const origin=new URL(request.url).origin;
  const link=origin+'/reset.html?token='+encodeURIComponent(token);
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:env.RESET_FROM_EMAIL,to:[user.recovery_email],subject:'Recuperação de senha — EvoLab CRM',text:'Para redefinir sua senha, acesse este link em até 20 minutos: '+link+'\nSe você não solicitou, ignore este e-mail.'})});
  if(!response.ok)return json({error:'Serviço de e-mail indisponível'},503);
  return json(generic);
 }catch{return json({error:'Não foi possível processar a solicitação'},503);}
}
