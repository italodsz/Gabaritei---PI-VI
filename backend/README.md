# Back-end local

FastAPI em Python 3.12, com SQLite via SQLAlchemy. Depois de configurar o
[ambiente](../README.md#rodar-localmente), inicie com `.venv/bin/python -m backend`.
O front-end e a API ficam em `http://127.0.0.1:4173` por padrão. A documentação
interativa da API fica em `/docs`. A variável `GABARITEI_DB` muda o caminho do banco.

O servidor confere o SHA-256, os IDs e os filtros da base e do catálogo em
`recomendador/rrf-tfidf-minilm-J/catalogo/recomendacoes_titulo_area.json` ao iniciar.
Os hashes congelados ficam em `acervo.py`.

## Arquivos

| Arquivo | Papel |
|---|---|
| `app.py` · `common.py` | API, arquivos do front-end e checagem de origem |
| `acervo.py` · `media.py` | Base, catálogo e imagens conferidas por hash |
| `contas.py` · `auth.py` | Cadastro, sessão, dados pessoais e senhas |
| `db.py` · `repositorio.py` | Migrações SQLite e dados de estudos, plano e notas |
| `dificuldade.py` · `tri.py` | Perfis TRI, eventos e recomendação adaptativa |
| `config/dificuldade_v1.json` | Parâmetros comuns ao servidor e ao navegador |
| `dev.py` · `recomendador_debug.py` | Estatísticas do catálogo e diagnóstico com os índices oficiais |

## Rotas

| Método | Caminho | Resultado |
|---|---|---|
| GET | `/api/health` | Estado, origem, contagens, SHA-256 e `database: "sqlite"` |
| GET | `/api/bootstrap` | Questões liberadas, imagens verificadas, matérias, títulos, assuntos e anos |
| GET | `/media/{nome}` | Imagem conhecida e verificada, quando disponível localmente |
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
Correção recebe `{"selected":"A"}` (e, opcionalmente, `tempoMs`, `primeira`, `desafio`) e retorna
`correct`, `answer`, `explanation` e, com login, `tri` (o que o perfil TRI aprendeu) com `persisted:true`. Não há resolução comentada: a mensagem informa essa ausência.

O bootstrap inclui gabaritos para a correção local dos simulados e da revisão.
Esta aplicação local de estudos não é um ambiente de provas com sigilo de respostas.
Sem login, respostas, sessões, favoritas, notas e metas ficam só no navegador. Com login
(`/api/auth/*`), o front-end envia esses dados para `/api/eu/*` e o servidor os guarda no banco;
o histórico de práticas vem pelo estado de estudos; `/responder` grava só o evento do perfil TRI.

As descrições servidas são somente as marcadas `use_for_recommender: true`.
Os filtros de matéria/título vêm da classificação do recomendador, sem inferir
assuntos com base no gabarito ou em rótulos automáticos do dataset.

Testes da API: `.venv/bin/python -m pytest` na raiz. A paridade do motor TRI
com JavaScript e os testes do front-end rodam com `npm test`.

## Modo dev

O painel do [modo dev](../docs/modo-dev.md) usa estas rotas; todas exigem a conta de desenvolvedor.
`GET /api/dev/resumo`, `GET /api/dev/questoes` e `GET /api/dev/questoes/gq_...`
oferecem estatísticas e inspeção da fonte. `GET /api/dev/dificuldade` traz a
calibração TRI. `POST /api/dev/diagnostico` recebe
`{"questionId":"gq_...","limit":20,"exclude":[]}` e consulta o método oficial
com galeria de treino diretamente em Python. O limite é 50 e a partição de
teste de 2024 fica reservada. Os índices são carregados na primeira consulta.
