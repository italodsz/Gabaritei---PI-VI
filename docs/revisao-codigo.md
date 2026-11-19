# Revisão do código — 18/11/2026

Este documento registra o estado anterior à migração. O servidor atual está
documentado em [backend/README.md](../backend/README.md).

Revisão da branch `integracao-front`, com foco em organização e correção: backend (Node), front-end
e os dois recomendadores no app. Inclui a avaliação de trocar o backend por FastAPI.

## Resumo

O código está em estado bom para a entrega. Os recomendadores, o banco e a conta estão separados em
módulos, com testes (61, todos passando), e o servidor confere os hashes da base e do catálogo ao
iniciar. Achei um defeito que podia **quebrar a sincronização da conta** em práticas longas, além
de código morto, um `server.mjs` que misturava tudo e documentação desatualizada. Isso foi corrigido.
Os pontos que não corrigi estão listados com prioridade no fim.

## Corrigido nesta revisão

| # | Gravidade | Problema | O que foi feito |
|---|---|---|---|
| 1 | Alta | O servidor recusava qualquer lista com mais de 500 questões. Uma prática sob medida longa ou a lista livre antiga fazia a **conta inteira deixar de sincronizar** (erro 400 em `/api/eu/estudos`). | Limite passou para 3.000 (o acervo tem 2.657). Teste novo com 800 respostas. |
| 2 | Média | `server.mjs` com 120 linhas que misturavam utilidades, rotas do acervo, do laboratório e arquivos estáticos. | Dividido: `http.mjs` (utilidades), `rotas-questoes.mjs` (acervo), `rotas-dev.mjs` (laboratório). O servidor só encaminha para uma lista de rotas. |
| 3 | Média | Código morto no front: a fila de recomendações antiga do protótipo (marcadas, erradas, pendentes, inéditas…), `startRecommended` e `recommendationOverview`, que não eram mais chamados. | Removidos (~75 linhas). Práticas contínuas antigas passam a usar o mesmo recomendador da prática sob medida. |
| 4 | Média | O servidor só escutava em `127.0.0.1`, o que impede hospedar. | Variável `HOST` (`HOST=0.0.0.0` para publicar). |
| 5 | Baixa | Erro depois de já ter respondido podia tentar responder de novo. Faltavam os tipos `.png` e `.ico` nos arquivos estáticos. | Proteção com `headersSent`; tipos adicionados. |
| 6 | Baixa | `INTEGRACAO_MAIN.md` e `DEV_LABORATORIO.md` soltos na raiz. O README descrevia o fluxo antigo, e o `/responder` era documentado como `persisted:false`. | Movidos para `docs/`. README com o fluxo atual (três modos, card de aprendizado, `/dev` ao vivo). README do backend com uma tabela de arquivos e a resposta atual do `/responder`. |
| 7 | — | A lista livre e o card de aprendizado não tinham testes. | `front-modulos.test.mjs`: filtro, lotes sem repetir (inéditas primeiro) e leitura do card. |

Corrigido nos dias anteriores e conferido de novo nesta revisão:
- O alerta de texto vinha como lista vazia e contava como alerta em todas as questões.
- Semelhante e Aleatória não funcionavam na lista livre.
- A lista livre colocava as 2.657 questões de uma vez.

## Organização atual

```
backend/   server.mjs → rotas-conta · rotas-dificuldade · rotas-dev · rotas-questoes
           http.mjs, auth.mjs, db.mjs (SQLite + migrações), repositorio.mjs, acervo.mjs
           config/dificuldade_v1.json   *.test.mjs (61 testes)
frontend/  app.js (início, plano, simulados) · learning-pages.js (páginas de estudo)
           practice-screen.js · exam-screen.js · challenge-screen.js · config-studio.js
           dificuldade.js (motor TRI, o mesmo no navegador e no servidor)
           dificuldade-cliente.js · sob-medida.js · lista-livre.js · aprendizado-ui.js
           dev.html/dev.js/dev-ao-vivo.js (laboratório)   legacy/ (fonte TypeScript do motor de estudos)
docs/      banco-de-dados · recomendador-dificuldade · laboratorio-dev · integracao-main · esta revisão
```

## Pendências (não corrigidas), por prioridade

1. **Gabarito no `/api/bootstrap`.** O contrato original dizia "o gabarito só vem depois da
   resposta", mas o app manda todos os gabaritos ao navegador: os simulados, a revisão, o desafio e
   o apoio são corrigidos ali. Está documentado como decisão (app de estudo, não de prova). Se o
   projeto precisar de sigilo, por exemplo um ranking, os simulados devem passar a ser corrigidos
   no servidor.
2. **SQL fora do repositório.** `rotas-dificuldade.mjs` escreve SQL direto em vez de usar
   `repositorio.mjs`. Isso não causa erro, mas precisa ser movido antes de uma troca para PostgreSQL.
3. **Sincronização regrava tudo.** `salvarEstudos` apaga e regrava todas as sessões a cada
   salvamento, com 0,7 s de atraso. Está bom para dezenas de alunos; com milhares de respostas por
   aluno, o certo é gravar só o que mudou.
4. **Limite de tentativas por IP.** Hoje usa o IP da conexão. Num servidor atrás de proxy, todos os
   alunos parecem ter o mesmo IP. Ao hospedar, o certo é ler `X-Forwarded-For` (opção configurável).
5. **Arquivos grandes e funções repetidas no front.** `practice-screen.js` tem ~980 linhas e `app.js`
   ~850, e `esc`/`pct` estão copiadas em 14 arquivos. Vale dividir só quando for mexer nesses arquivos.
6. **Referências antigas no recomendador.** `ESTADO_ATUAL.md` e `RELATORIO_BASE_FINAL.md` ainda
   apontam para `../../INTEGRACAO_MAIN.md`. Não mexi para preservar o pacote do recomendador como foi
   publicado.

## Vale trocar para FastAPI?

**Recomendação: não agora.** O motivo principal é o motor TRI compartilhado; o custo e o risco de
reescrever completam a conta.

| | Node atual | FastAPI |
|---|---|---|
| Situação | Pronto: ~1.250 linhas de JavaScript e 61 testes, sem dependências para rodar | Reescrever servidor, banco, login, rotas e testes (2 a 3 dias) |
| Motor TRI | Um arquivo só (`dificuldade.js`), usado pelo navegador e pelo servidor: a chance mostrada é exatamente a do servidor | Precisaria existir em JavaScript (navegador) **e** em Python (servidor), e as duas versões teriam de ser mantidas idênticas, ou o navegador teria de pedir cada chance à API |
| Validação | Feita à mão (`repositorio.mjs`) | Pydantic: menos código e mensagens automáticas |
| Documentação da API | Tabela no `backend/README.md` | `/docs` (Swagger) automático: bom para a banca |
| PostgreSQL | Possível com o pacote `pg` | Natural com SQLAlchemy |
| Python do recomendador | Roda à parte (worker do laboratório) | Poderia rodar junto, por exemplo para buscar por texto digitado |
| Plano original | — | Era o combinado (FastAPI + Supabase) |

O ganho real do FastAPI seria a documentação automática e a validação. Nada muda para o aluno, e
reescrever tudo no fim do projeto traz risco de regressão. Quando o projeto estiver entregue, ou se o
professor exigir Python, o caminho mais seguro seria este:

1. FastAPI só para a API, servindo o mesmo front-end;
2. levar o motor TRI para o servidor com uma rota `/api/chances` em lote;
3. migrar rota a rota, com os testes atuais transformados em testes HTTP que valem para os dois
   servidores.

Para o relatório, a justificativa da escolha é: Node permite um único motor TRI no navegador e no
servidor; não precisa instalar nada para rodar; e o Python continua sendo usado onde faz diferença,
no recomendador e no laboratório.

## Banco de dados

O plano original era PostgreSQL (Supabase). Hoje o banco é SQLite. A recomendação continua sendo
**PostgreSQL como banco oficial, com SQLite como modo local**, escolhido pela variável
`DATABASE_URL`. Para isso, o primeiro passo é o item 2 das pendências: concentrar todo o SQL em
`repositorio.mjs`.
