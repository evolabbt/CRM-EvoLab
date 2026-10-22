# Integração D1 com autenticação — plano de implementação

Esta branch preserva a versão publicada em `main`. **Não publicar uma API de clientes sem autenticação.**

## Estado verificado
- `index.html` usa `localStorage` para clientes, negócios, tarefas e fila de atendimento.
- `functions/api/health.js` executa `SELECT 1` no binding `DB`; o teste HTTP retornou `status: ok`.
- `database/schema.sql` contém tabelas iniciais, mas não há confirmação de que foram executadas no D1.
- Não há login, sessões ou autorização de usuários no código atual.

## Próximas alterações, em ordem segura
1. Definir autenticação de Kevin e Bryan (por exemplo, Cloudflare Access com contas individuais e validação do JWT no servidor; não confiar só na interface).
2. Validar identidade e autorização **em todas as rotas de dados**; bloquear acesso anônimo e configurar proteção contra requisições indevidas.
3. Conferir se o schema foi aplicado ao D1 e preparar migrações reversíveis.
4. Implementar endpoints de CRUD para clients, deals, tasks e inbox, com validação de campos, consultas parametrizadas e tratamento de erros.
5. Adaptar `index.html` para usar API autenticada, com estados de carregamento e erro, mantendo a interface.
6. Planejar migração voluntária dos dados existentes em `localStorage`, com backup e sem apagar a origem automaticamente.
7. Testar com as duas contas, em navegadores distintos, antes de aprovar a publicação.

**Não inserir dados reais de clientes antes da proteção do acesso.**
