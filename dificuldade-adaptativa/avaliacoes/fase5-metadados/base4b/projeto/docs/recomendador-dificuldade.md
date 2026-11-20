# Recomendador de dificuldade

Estima a nota TRI do aluno em cada área, na escala do ENEM, e usa essa estimativa para dar um toque de
dificuldade às recomendações. Ele trabalha junto do `titulo_area`: a relevância continua mandando.

Planejamento completo, simulações e resultados dos microdados: documento “Gabaritei — Planejamento do
recomendador de dificuldade”. Configuração: `backend/config/dificuldade_v1.json`.

## Como funciona

- **Modelo:** TRI de 3 parâmetros com os parâmetros oficiais do INEP (`tri.a`, `tri.b`, `tri.c` da base) e
  D = 1,0, confirmado nos microdados do ENEM 2022–2024.
- **Triagem:** só entram questões de formato padrão e aplicação regular com a ≥ 0,4, −3 ≤ b ≤ 5 e
  0 ≤ c ≤ 0,4. As outras continuam no app, sem chance estimada e sem efeito na nota.
- **θ do aluno:** uma distribuição por área numa grade de 161 pontos (−4 a 4). O ponto de partida é a
  distribuição real dos candidatos (microdados 2023). Cada resposta válida multiplica a distribuição
  pela chance da resposta. O tempo sem praticar alarga a distribuição (τ = 0,026 por dia), para que o
  aluno possa mudar de nível.
- **Nota exibida:** a média do θ passa por uma tabela θ → nota ajustada nos microdados de 2023. Com 45
  respostas, a nota recalculada de 2024 erra em média 0,9 a 1,9 ponto. O app mostra uma faixa
  (±1,28 desvio, cerca de 80%), só a partir de 15 respostas válidas na área, e “abaixo de 500” quando a faixa inteira
  fica abaixo disso.

**O que conta para o θ:** só a primeira tentativa, sem apoio, com pelo menos 8 segundos, em questão
triada. Prática tem peso 0,8 e simulado 1,0. O motivo de cada resposta que não conta fica registrado
(`resposta_evento.motivo`).

## Onde ele age

| Lugar | Efeito |
|---|---|
| Semelhante e Recomendadas | ajuste suave nas 20 primeiras do `titulo_area`: score = R × (0,5 + 0,5·A). Troca a primeira sugestão em 5 a 9% dos casos, sempre por uma das 2 ou 3 seguintes |
| Montar lista, Seleção automática, listas do plano | escolhe do conjunto já filtrado pela adequação ao alvo, com até 20% de revisão de erros antigos (≥ 3 dias), e começa pela mais acessível. A Seleção automática mantém os assuntos escolhidos pelo app e só reordena |
| Simulados | nada na escolha; as respostas atualizam o θ com peso de prova |

- **Adequação A:** gaussiana na distância em logit entre a chance prevista e o alvo (largura 0,5).
- **Alvo:** 85% (leve), 75% (no ponto, padrão) ou 65% (puxado), escolhido em Montar lista. Um controlador
  corrige o alvo pelas últimas 15 respostas (±0,1). A **meta alcançável** é o menor valor entre o alvo e
  a chance da 3ª questão mais acessível do conjunto: o app não persegue o impossível.
- **Apoio:** quando a chance estimada é menor que 45%, o aluno pode eliminar 2 alternativas erradas. A
  resposta é registrada, mas não entra no θ.
- **Resultado da lista:** “acertou X de N; o esperado era Y”, com as chances calculadas quando a lista
  foi criada (sem as respostas com apoio).

Efeito medido em simulação com o banco real (listas de um título): o acerto sobe de 4 a 12 pontos
percentuais e fica entre 64% e 71% na zona viável. Abaixo de ~550–650 pontos (conforme a área), as
questões do ENEM são difíceis demais para 75%; para esses alunos valem a meta alcançável, o apoio, a
revisão de erros e o progresso contra o esperado.

## Modos (para os modos futuros)

`POST /api/recomendar` recebe `modo` e `usarDificuldade`:

| Modo | Entrada | Uso |
|---|---|---|
| `semelhante` | `questaoRef` | questões relacionadas a uma questão (ordem do `titulo_area`, ajuste suave) |
| `conjunto` | `ids` | qualquer conjunto já filtrado pelo app |
| `aleatorio` | `area`, `materia` (opcionais) | aleatórias; com `usarDificuldade: true`, “aleatórias na minha dificuldade” |

Também aceita `exclude`, `limite` (até 50), `desafio`, `historico` (`[{id, correta, em}]`, para revisão) e,
sem login, `perfis` (o perfil do navegador). Devolve `ids` e `itens` com `chance` e `apoioDisponivel`.

## API e banco

- `GET /api/dificuldade/config`: configuração e SHA-256.
- `POST /api/questoes/{id}/responder` aceita `tempoMs`, `apoio`, `primeira`, `desafio`; com login, grava o
  evento e devolve `tri` (perfil da área, se contou, chance prevista, resumo da nota).
- `GET /api/eu/perfil-tri`: perfis, resumos, agregados (média geral, exatas, humanas) e histórico diário.
  `PUT` sobe o perfil feito sem login para as áreas ainda vazias no servidor.
- `POST /api/eu/perfil-tri/respostas`: respostas de simulado, conferidas no servidor.
- `GET /api/dev/dificuldade`: eventos, motivos e calibração previsto × observado (laboratório `/dev`, aba de estatísticas).
- Tabelas (migração `0002_dificuldade`): `perfil_tri` (distribuição completa por área), `perfil_tri_historico`,
  `resposta_evento` (chance prevista antes da resposta, θ no momento, se contou e por quê), `config_dificuldade`.

Sem login, o mesmo cálculo roda no navegador (`frontend/dificuldade.js`) e o perfil fica em
`gabaritei:perfil-tri:v1`. Ao entrar, ele sobe para a conta.

## Arquivos

- `frontend/dificuldade.js`: motor (puro, usado pelo navegador e pelo servidor).
- `frontend/dificuldade-cliente.js`: ligação com as telas.
- `backend/rotas-dificuldade.mjs`: rotas, perfis e eventos.
- `backend/config/dificuldade_v1.json`: todos os números. Mudou um número? Crie `dificuldade_v2.json`.
- `backend/testdata/microdados_2024_amostra.json`: amostra dos microdados do ENEM 2024 (só acertos,
  parâmetros e nota oficial) usada nos testes.

## Testes

`npm test` inclui `backend/dificuldade.test.mjs` (motor; reproduz a nota oficial de 2024 com erro médio
≤ 8 pontos, ≤ 10 em MT), `backend/dificuldade-api.test.mjs` (API e banco) e
`backend/dificuldade-simulacao.test.mjs` (regressão por simulação: listas, níveis, Semelhante e apoio).

## Limites

- A nota estimada vem da prática, não de prova: o aluno pode ter acabado de estudar o tema.
- Quem está abaixo da zona viável quase não recebe questões com 75% de chance, porque o banco é o do ENEM.
- O aprendizado em lote (calibração prática × prova, ajuste de questões, τ) ainda não está ligado; os dados
  necessários já são gravados em `resposta_evento`.
