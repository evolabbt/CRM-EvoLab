import {json} from '../../_auth.js';
export async function onRequestGet({env}){
 if(!env.DB)return json({status:'erro',etapa:'ligacao',detalhe:'D1 não vinculado à pré-visualização'},503);
 try{
  const row=await env.DB.prepare('SELECT count(*) AS total FROM users').first();
  return json({status:'ok',banco:'conectado',tabela_users:'ok',contas:Number(row?.total||0)});
 }catch(e){return json({status:'erro',etapa:'tabela_users',tipo:e?.name||'Erro'},503)}
}