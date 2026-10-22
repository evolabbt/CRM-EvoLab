import { authenticated, json } from '../_auth.js';
export async function onRequest(context) {
  const {request,env}=context;
  const path=new URL(request.url).pathname;
  if(path==='/api/health')return context.next();
  if(!env.DB)return json({error:'Banco indisponível'},503);
  if(!['GET','HEAD','OPTIONS'].includes(request.method)){
    const origin=request.headers.get('Origin');
    if(!origin || origin!==new URL(request.url).origin)return json({error:'Origem não autorizada'},403);
  }
  // Authentication endpoints handle their own login, recovery and rate limits.
  if(path.startsWith('/api/auth/'))return context.next();
  try{
    const user=await authenticated(request,env);
    if(!user)return json({error:'Faça login'},401);
    context.data.user=user;
    return context.next();
  }catch{return json({error:'Serviço indisponível'},503);}
}
