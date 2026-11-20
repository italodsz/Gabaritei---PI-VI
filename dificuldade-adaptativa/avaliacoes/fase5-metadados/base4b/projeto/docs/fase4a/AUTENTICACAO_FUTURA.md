# Contrato para autenticação e isolamento futuros — não implementado nesta fase

## Estado real

O checkout já tinha cadastro/login por cookie, senhas scrypt e tabelas de conta.
Esses componentes foram preservados. A Fase 4A adicionou associação verificável das
tentativas à sessão existente ou ao cookie de exercício e bloqueou APIs dev por padrão.
Isso não é homologação de autenticação para produção nem substitui a arquitetura abaixo.

## Estrutura prevista

- `user_id` único, nome e e-mail com normalização e unicidade; coletar somente o necessário.
- Hash de senha com algoritmo e parâmetros versionados, sal aleatório; nunca senha em log.
- Sessão autenticada com token opaco, somente hash no banco, expiração, revogação e rotação.
- Cookie HttpOnly, Secure em HTTPS e política SameSite; proteção CSRF e origem para mutações.
- Recuperação de senha, política de tentativas e de encerramento de sessões explicitadas.
- `user_id` como chave de propriedade em respostas, exposições, revisões, proficiência por
  área e projeções. Derivá-lo da sessão no backend; rejeitar acesso arbitrário por ID do cliente.
- Contas de administração com permissão específica; aluno não consulta métricas globais.
- Logs de acesso administrativo e eventos de alteração, sem tokens e dados sensíveis.
- Controle de retenção, exclusão e exportação individual; plano de backup e recuperação.

Cada rota deve verificar a permissão e a propriedade do objeto, inclusive em lotes,
replay, importação, histórico, arquivo exportado e tentativa. Não basta esconder botões.
Não herdar dados anônimos em uma conta automaticamente: exigir vínculo explícito e
política para não duplicar respostas. Contadores só podem vir dos eventos verificáveis.

## Testes de aceitação para uma futura implementação

| Caso | Esperado |
|---|---|
| Sem sessão consulta histórico privado | 401, sem conteúdo |
| A consulta/modifica tentativa, evento, perfil ou exportação de B | 403/404, sem vazamento ou alteração |
| A envia user_id de B no corpo ou URL | Ignorado/rejeitado; autorização sempre de A |
| A inclui tentativa de B em lote misto | Sem alterações nos dados de B; resultado auditável |
| Sessão expirada, revogada ou logout | Acesso recusado; token anterior não reutilizável |
| Aluno acessa diagnóstico global | 403/404 |
| Administrador autorizado acessa diagnóstico | Acesso e auditoria registrada |
| Cookie/CSRF/origem adulterados | Mutações recusadas |
| Conexões simultâneas/retry | Nenhuma duplicação de evidência |
| Recuperação e restauração | Propriedade e projeções preservadas |

Esses casos **não foram todos executados** nesta fase. Passou o teste específico em
que uma sessão anônima não pode responder à tentativa de outra. Isso não comprova
a autorização de todos os recursos de duas contas reais.

## Medida provisória entregue

Todas as APIs `/api/dev/*` retornam 404 por padrão e em `NODE_ENV=production`.
Para teste isolado: habilitação explícita, socket loopback e token Bearer de pelo
menos 24 caracteres. Um token de teste é usado somente em fixtures de memória.
O servidor não confia em cabeçalho de IP encaminhado para autorizar esse acesso.
Ainda assim, um proxy local pode tornar a origem do socket local: **não encaminhar
essas APIs em um serviço público**. A autorização definitiva requer usuário/papel.

Exemplo para uma investigação local futura, sem publicar o token:

```powershell
$env:GABARITEI_DEV_ENABLED='1'
$env:GABARITEI_DEV_TOKEN=[Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
npm start
```

O cliente HTTP deve enviar `Authorization: Bearer <token local>`. Não incluir o token
no código frontend, no ZIP ou no Git. A tela antiga /dev não possui fluxo de login/token
para esse novo bloqueio. O restante do app roda sem habilitar essas APIs.
