# Back-end local

Node.js 22+, sem dependências de execução e sem banco de dados. Inicie pela raiz
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
| GET | `/api/health` | Estado, origem, contagens, SHA-256 e ausência de banco |
| GET | `/api/bootstrap` | Questões liberadas, matérias, títulos, assuntos e anos para as telas |
| GET | `/api/questoes` | Busca paginada; parâmetros `area`, `materia`, `ano`, `busca`, `inicio`, `limite` |
| GET | `/api/questoes/gq_...` | Uma questão liberada; 422 se bloqueada |
| GET/POST | `/api/questoes/gq_.../recomendacoes` | IDs e questões na ordem oficial; até 50 |
| POST | `/api/questoes/gq_.../responder` | Confere a alternativa contra o gabarito oficial |

Recomendações por POST recebem `{"exclude":["gq_..."],"limit":10}`. Excluem também
as famílias dos IDs informados. Lista vazia retorna uma justificativa, sem trocar
de matéria, título, área ou idioma nem completar com sorteio.
Correção recebe `{"selected":"A"}` e retorna `correct`, `answer`, `explanation`
e `persisted:false`. Não há resolução comentada: a mensagem informa essa ausência.

O bootstrap inclui gabaritos para a correção local dos simulados e da revisão.
Esta aplicação local de estudos não é um ambiente de provas com sigilo de respostas.
As respostas, sessões, favoritas, notas e metas ficam no navegador; o servidor não
mantém contas ou histórico. Não há autenticação nem sincronização entre dispositivos.

As descrições servidas são somente as marcadas `use_for_recommender: true`.
Os filtros de matéria/título vêm da classificação do recomendador, sem inferir
assuntos com base no gabarito ou em rótulos automáticos do dataset.

Testes: `npm test` na raiz. O teste HTTP usa uma porta temporária e verifica a base
real, filtros, ordem do catálogo, exclusões, bloqueios, gabaritos e rotas inválidas.
