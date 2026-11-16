# Back-end local

Node.js 22.13+, sem dependências de execução. O banco é SQLite pelo módulo `node:sqlite`
(arquivo em `backend/dados/gabaritei.db`, ou onde `GABARITEI_DB` apontar; ver [docs/banco-de-dados.md](../docs/banco-de-dados.md)). Inicie pela raiz
com `npm start`. A API e o front-end ficam no mesmo endereço, `http://127.0.0.1:4173`.
O servidor escuta somente no computador local.

Lê o dataset congelado em `Dataset/base_trabalho/` e o catálogo oficial em
`recomendador/rrf-tfidf-minilm-J/catalogo/recomendacoes_titulo_area.json`.
Ao iniciar, confere o SHA-256, os IDs e os filtros das sugestões. A API não carrega
os modelos nem muda a ordem do catálogo.
Os hashes congelados ficam em `acervo.mjs`. Ao publicar outra base ou reexportar
o catálogo, repita a auditoria e registre ali os novos hashes e commits de origem.

## Rotas

| Método | Caminho | Resultado |
|---|---|---|
| GET | `/api/health` | Estado, origem, contagens, SHA-256 e `database: "sqlite"` |
| GET | `/api/bootstrap` | Questões liberadas, matérias, títulos, assuntos e anos para as telas |
| GET | `/api/questoes` | Busca paginada; parâmetros `area`, `materia`, `ano`, `busca`, `inicio`, `limite` |
| GET | `/api/questoes/gq_...` | Uma questão liberada; 422 se bloqueada |
| GET/POST | `/api/questoes/gq_.../recomendacoes` | IDs e questões na ordem oficial; até 50 |
| POST | `/api/questoes/gq_.../responder` | Confere a alternativa contra o gabarito oficial |
| POST | `/api/auth/registrar` | `{nome,email,senha}`; cria a conta e já inicia a sessão (cookie HttpOnly) |
| POST | `/api/auth/entrar` · `/api/auth/sair` | Login por e-mail e senha; encerra a sessão |
| GET | `/api/eu` | `{usuario}` ou `{usuario:null}` quando não há login |
| GET/PUT | `/api/eu/estudos` · `/plano` · `/notas` | Dados do usuário. PUT recebe `{data, baseRevisao}`; 409 se a revisão mudou |
| POST/DELETE | `/api/eu/senha` · `/api/eu` | Trocar senha (encerra as outras sessões); excluir conta e todos os dados |
| GET | `/api/eu/exportar` | Todos os dados do usuário em JSON |
| GET | `/api/dificuldade/config` | Configuração do recomendador de dificuldade |
| GET/PUT | `/api/eu/perfil-tri` | Nota TRI estimada por área, histórico; PUT sobe o perfil feito sem login |
| POST | `/api/eu/perfil-tri/respostas` | Respostas de simulado para o perfil TRI |
| POST | `/api/recomendar` | Modos `semelhante`, `conjunto`, `aleatorio`, com ou sem dificuldade ([docs](../docs/recomendador-dificuldade.md)) |

Recomendações por POST recebem `{"exclude":["gq_..."],"limit":10}`. Excluem também
as famílias dos IDs informados. Lista vazia retorna uma justificativa, sem trocar
de matéria, título, área ou idioma nem completar com sorteio.
Correção recebe `{"selected":"A"}` e retorna `correct`, `answer`, `explanation`
e `persisted:false`. Não há resolução comentada: a mensagem informa essa ausência.

O bootstrap inclui gabaritos para a correção local dos simulados e da revisão.
Esta aplicação local de estudos não é um ambiente de provas com sigilo de respostas.
Sem login, respostas, sessões, favoritas, notas e metas ficam só no navegador. Com login
(`/api/auth/*`), o front-end envia esses dados para `/api/eu/*` e o servidor os guarda no banco;
`persisted:false` em `/responder` continua valendo, porque a gravação é feita pelo estado de estudos.

As descrições servidas são somente as marcadas `use_for_recommender: true`.
Os filtros de matéria/título vêm da classificação do recomendador, sem inferir
assuntos com base no gabarito ou em rótulos automáticos do dataset.

Testes: `npm test` na raiz. O teste HTTP usa uma porta temporária e verifica a base
real, filtros, ordem do catálogo, exclusões, bloqueios, gabaritos e rotas inválidas.

## Laboratório local

`/dev` abre o painel descrito em [DEV_LABORATORIO.md](../DEV_LABORATORIO.md).
`GET /api/dev/resumo`, `GET /api/dev/questoes` e `GET /api/dev/questoes/gq_...`
oferecem estatísticas e inspeção da fonte. `POST /api/dev/diagnostico` recebe
`{"questionId":"gq_...","limit":20,"exclude":[]}` e consulta o método oficial
com galeria de treino, por um processo Python iniciado sob demanda. O limite é 50;
os IDs reservados de teste são recusados. Não aceita pesos nem modelos alternativos.

O Python reutiliza os índices, sem CUDA. Configure `GABARITEI_PYTHON` se o ambiente
existente não for localizado. Falhas são explícitas (503); o app por catálogo e as
estatísticas não dependem da disponibilidade desse diagnóstico. O processo é
encerrado com o servidor. Teste numérico: `npm run test:dev-model`.
