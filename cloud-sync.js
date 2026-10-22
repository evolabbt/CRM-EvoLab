// EvoLab CRM cloud adapter. Never silently overwrite the browser's existing records.
const kinds=['clients','deals','tasks','inbox'];
async function call(method,type,payload){
 const response=await fetch('/api/data'+(method==='GET'?'?type='+encodeURIComponent(type):''),{
  method,credentials:'same-origin',headers:method==='GET'?{}:{'Content-Type':'application/json'},
  body:method==='GET'?undefined:JSON.stringify({type,...payload})
 });
 const result=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(result.error||'Falha na sincronização');
 return result;
}
window.EvoLabCloud={
 async status(){
  const r=await fetch('/api/auth/me',{credentials:'same-origin'});
  if(r.status===401)return {authenticated:false};
  if(!r.ok)throw new Error('Não foi possível verificar a sessão');
  return r.json();
 },
 async load(){
  const entries=await Promise.all(kinds.map(async k=>[k,(await call('GET',k)).items]));
  return Object.fromEntries(entries);
 },
 async add(type,item){return call('POST',type,{item});},
 async update(type,id,item){return call('PUT',type,{id,item});},
 async remove(type,id){return call('DELETE',type,{id});}
};
