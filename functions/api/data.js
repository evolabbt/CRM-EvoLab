import {json} from '../_auth.js';
const fields={
 clients:['name','company','phone'],
 deals:['title','client','value','stage'],
 tasks:['title','due','status'],
 inbox:['name','phone','type','owner','status']
};
const allowed=(type)=>Object.prototype.hasOwnProperty.call(fields,type);
export async function onRequestGet({request,env}){
 const type=new URL(request.url).searchParams.get('type');
 if(!allowed(type))return json({error:'Tipo inválido'},400);
 try{
  const {results}=await env.DB.prepare('SELECT * FROM '+type+' ORDER BY created_at DESC LIMIT 2000').all();
  return json({items:results});
 }catch{return json({error:'Falha ao consultar dados'},503);}
}
export async function onRequestPost({request,env}){
 try{
  const {type,item}=await request.json();
  if(!allowed(type)||!item||typeof item!=='object')return json({error:'Dados inválidos'},400);
  const keys=fields[type],id=crypto.randomUUID();
  const values=keys.map(k=>k==='value'?Number(item[k]||0):String(item[k]??'').slice(0,500));
  if(values.some(v=>typeof v==='number'&&!Number.isFinite(v)))return json({error:'Valor inválido'},400);
  await env.DB.prepare('INSERT INTO '+type+' (id,'+keys.join(',')+') VALUES ('+['?'].concat(keys.map(()=>'?')).join(',')+')').bind(id,...values).run();
  return json({id},201);
 }catch{return json({error:'Falha ao salvar'},503);}
}
export async function onRequestPut({request,env}){
 try{
  const {type,id,item}=await request.json();
  if(!allowed(type)||typeof id!=='string'||!item||typeof item!=='object')return json({error:'Dados inválidos'},400);
  const keys=fields[type].filter(k=>Object.prototype.hasOwnProperty.call(item,k));
  if(!keys.length)return json({error:'Nenhum campo'},400);
  const values=keys.map(k=>k==='value'?Number(item[k]):String(item[k]??'').slice(0,500));
  if(values.some(v=>typeof v==='number'&&!Number.isFinite(v)))return json({error:'Valor inválido'},400);
  const result=await env.DB.prepare('UPDATE '+type+' SET '+keys.map(k=>k+'=?').join(',')+' WHERE id=?').bind(...values,id).run();
  return json({ok:result.meta.changes>0});
 }catch{return json({error:'Falha ao atualizar'},503);}
}
export async function onRequestDelete({request,env}){
 try{
  const {type,id}=await request.json();
  if(!allowed(type)||typeof id!=='string')return json({error:'Dados inválidos'},400);
  const result=await env.DB.prepare('DELETE FROM '+type+' WHERE id=?').bind(id).run();
  return json({ok:result.meta.changes>0});
 }catch{return json({error:'Falha ao excluir'},503);}
}
