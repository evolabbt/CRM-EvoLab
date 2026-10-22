import {authenticated,json} from '../../_auth.js';
export async function onRequestGet({request,env}){
 try{const user=await authenticated(request,env);return user?json({authenticated:true,username:user.username}):json({authenticated:false},401)}
 catch{return json({error:'Serviço indisponível'},503)}
}
