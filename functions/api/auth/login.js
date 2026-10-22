import {verifyPassword,randomToken,digest,json} from '../../_auth.js';
export async function onRequestPost({request,env}){
  try{
    const body=await request.json();
    if(typeof body.username!=='string'||typeof body.password!=='string'||body.username.length>64||body.password.length>1024)return json({error:'Credenciais inválidas'},400);
    const user=await env.DB.prepare('SELECT * FROM users WHERE username=? COLLATE NOCASE').bind(body.username.trim()).first();
    // Run a comparable expensive hash for unknown usernames to reduce timing leakage.
    if(!user||!(await verifyPassword(body.password,user)))return json({error:'Usuário ou senha inválidos'},401);
    const token=randomToken(),hash=await digest(token);
    await env.DB.prepare("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,datetime('now','+7 days'))").bind(hash,user.id).run();
    const response=json({ok:true,username:user.username});
    response.headers.set('Set-Cookie','evolab_session='+token+'; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=604800');
    return response;
  }catch{return json({error:'Não foi possível entrar'},503);}
}
