// Fail closed: no CRM data endpoint may be used without verified authentication.
// /api/health remains a separate public connectivity check.
export async function onRequest(context) {
  const path = new URL(context.request.url).pathname;
  if (path === '/api/health') return context.next();
  return Response.json({error:'Autenticacao ainda nao configurada'}, {status:503,headers:{'Cache-Control':'no-store'}});
}
