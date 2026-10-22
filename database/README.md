# Preparar o D1 da EvoLab

Banco Cloudflare D1: `evolab-crm-db`. Binding no Pages: `DB`.

## Aplicação das tabelas

No painel Cloudflare > Workers & Pages > D1 > evolab-crm-db > Console, executar primeiro o conteúdo de `database/schema.sql` e depois `database/auth-schema.sql`.

Alternativa com Wrangler autenticado na conta da EvoLab:

```bash
npx wrangler d1 execute evolab-crm-db --remote --file=database/schema.sql
npx wrangler d1 execute evolab-crm-db --remote --file=database/auth-schema.sql
```

Ambos os scripts usam `CREATE TABLE IF NOT EXISTS` e não apagam cadastros existentes.

## Verificação

```sql
SELECT name FROM sqlite_master WHERE type='table' AND name IN ('clients','deals','tasks','inbox','users','sessions','password_reset_tokens') ORDER BY name;
```

Esperado: 7 tabelas. Confirmar também que `DB` está associado ao D1 nas configurações de produção e pré-visualização do Pages.

**Importante:** `/api/health` confirma conexão, mas não comprova que as tabelas foram criadas. Não colocar a integração em produção antes de configurar usuários, testar autenticação e validar a sincronização.
