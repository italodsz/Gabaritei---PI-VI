# Banco de dados

FastAPI acessa o SQLite via SQLAlchemy. O arquivo fica em `backend/dados/gabaritei.db`
(ignorado pelo Git). `GABARITEI_DB=/caminho/arquivo.db` muda o local e
`GABARITEI_DB=:memory:` cria um banco descartável. O esquema e o formato das
senhas e dos tokens continuam compatíveis com o banco criado pelo servidor Node.

O banco guarda **contas e progresso dos alunos**. O acervo de questões e o catálogo do recomendador continuam
sendo arquivos congelados, conferidos por SHA-256: não vão para o banco.

## Como o app usa

- Sem login, tudo continua no navegador.
- Com login, `frontend/conta.js` envia ao servidor os mesmos três blocos que antes ficavam no `localStorage`
  (`estudos`, `plano`, `notas`) e o servidor os decompõe em tabelas. Ao carregar a página o servidor é a fonte da verdade.
- **Controle de concorrência:** cada bloco tem uma `revisao`. O PUT envia a `baseRevisao` que o cliente conhece; se outra
  aba ou dispositivo gravou antes, o servidor responde 409 e o app avisa para recarregar, em vez de sobrescrever.
- Gravar é "substituir o bloco inteiro" dentro de uma transação: ou grava tudo ou nada. Campos que o servidor não conhece
  são preservados em colunas `extra` (JSON), então novas versões do front-end não perdem dados.

## Tabelas

| Tabela | Conteúdo |
|---|---|
| `usuario` | e-mail único (sem diferenciar maiúsculas), nome, apelido, escola, cidade, bio, hash da senha |
| `sessao_login` | sessões de login; só o SHA-256 do token é guardado; expira em 30 dias |
| `estado_usuario` | `revisao` e data de cada bloco (`estudos`, `plano`, `notas`) |
| `conta_estudos` | versão do esquema do front, onboarding, preferências de estudo |
| `sessao_pratica` · `resposta_pratica` | listas de questões e a resposta de cada questão (alternativa, confirmada, correta, tempo) |
| `simulado` · `resposta_simulado` | simulados (configuração, seções, marcadas, relógio) e respostas |
| `favorita` · `marca_revisao` | questões favoritas e marcadas para revisão (com a ordem) |
| `meta` · `conquista_celebrada` | metas pessoais e conquistas já comemoradas |
| `atividade_plano` | cards do plano de estudos (com a ordem) |
| `nota_bloco` | blocos do "Minhas notas": texto (HTML limpo) ou atalho para um item |
| `migracao` | migrações aplicadas |

Chaves estrangeiras com `ON DELETE CASCADE`: excluir o usuário apaga tudo dele. Identificadores de questão são
guardados como texto (`gq_...`) sem chave estrangeira, porque o acervo não está no banco.

Migrações ficam em `backend/db.mjs` (`MIGRACOES`) e rodam ao iniciar, uma única vez cada. **Nunca edite uma migração já
publicada**: acrescente uma nova.

## Integridade (migração 0003) e MER

A migração `0003_integridade` (20/11/2026) passou para o banco regras que antes só o código
garantia, sem mudar nomes nem ordem das colunas:

- `perfil_tri.versao_config` e `resposta_evento.versao_config` são chaves estrangeiras para
  `config_dificuldade` (versões antigas sem registro entram como `sha256 = 'desconhecido'`);
- campos lógicos aceitam só 0 ou 1; chances e metas ficam entre 0 e 1; tempos não podem ser negativos;
- em `resposta_evento`, `conta = 1` não tem motivo e `conta = 0` exige um motivo conhecido;
- em `nota_bloco`, bloco `text` tem `html` e nenhuma referência; bloco `ref` tem tipo e id da referência;
- área validada também em `perfil_tri_historico`; índices novos para o painel (`resposta_evento(area, conta, apoio)`),
  para respostas de simulado por questão e para a limpeza de sessões vencidas.

Testes: `tests/test_integridade.py` (dados antigos preservados, chaves conferidas, regras recusando dados inválidos e
exclusão em cascata).

O modelo entidade-relacionamento está em `docs/mer/`:

| Arquivo | Para quê |
|---|---|
| `gabaritei.dbml` | MER completo com descrições e regras; cole em https://dbdiagram.io para o diagrama editável |
| `gabaritei.mmd` | o mesmo em Mermaid (o GitHub desenha sozinho) |
| `gabaritei-mer.png` | MER físico completo, com todas as colunas |
| `gabaritei-visao-geral.png` / `.svg` / `.dot` | visão conceitual por grupo, com as entidades em arquivo |

## Segurança

- Senha: scrypt (N=16384, r=8, p=1) com sal próprio; mínimo de 8 caracteres.
- Sessão: token aleatório de 256 bits em cookie `HttpOnly; SameSite=Lax` (adicione `Secure` com `GABARITEI_COOKIE_SEGURO=1`
  atrás de HTTPS). Trocar a senha encerra as outras sessões.
- Limite de tentativas: 8 falhas de senha por e-mail e 30 por IP a cada 15 min; 20 cadastros por hora por IP.
  O login gasta o mesmo tempo quando o e-mail não existe, para não revelar quem tem conta.
- Escritas vindas de outra origem (`Origin` diferente do `Host`) são recusadas.
- HTML das notas é filtrado também no servidor (só negrito, itálico, sublinhado, listas, cor).
- Validação de tipos e tamanhos antes de gravar (alternativas A–E, limites de listas, ids únicos).
- O servidor escuta só em `127.0.0.1`. Para publicar na internet faltam HTTPS, recuperação de senha por e-mail,
  backups e revisão de privacidade (LGPD): `GET /api/eu/exportar` e `DELETE /api/eu` já cobrem exportar e excluir os dados.

## Backup e limpeza

Com o servidor parado, copie `backend/dados/gabaritei.db` (e os arquivos `-wal`/`-shm`, se existirem).
Para usar um banco novo, aponte `GABARITEI_DB` para outro arquivo.

## Trocar de banco depois

As migrações ficam em `backend/migracoes/`. As consultas de conta, estudos e TRI
estão em `backend/contas.py`, `backend/repositorio.py` e `backend/dificuldade.py`.
Uma futura migração para PostgreSQL precisaria adaptar as conexões, as migrações,
as transações e as consultas específicas do SQLite.

## Testes

`.venv/bin/python -m pytest` cobre migrações, login e leitura de dados legados,
sincronização com revisão (409), plano, notas, troca de senha e exclusão de conta.
