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

## Tela de início: os três modos

| Modo | Como escolhe as questões |
|---|---|
| **Até onde você chega?** (esquerda) | Escada de dificuldade: começa pelas questões mais fáceis do acervo e sobe ~4,5 pontos de percentil a cada acerto, pela dificuldade oficial do item (parâmetro *b* da TRI), sem depender do nível do aluno. Alterna as áreas. Errou ou o tempo acabou, fim. As respostas também entram no perfil TRI. |
| **Prática sob medida** (meio, modo padrão) | O aluno escolhe o ponto de partida: uma questão (busca no enunciado), um tema ou aleatório (todas as áreas ou uma). Depois, sem fim: a próxima é a parecida com a última pelo `titulo_area`, sem as já respondidas, com o ajuste suave da dificuldade entre as 20 primeiras. Se a última não tem parecidas novas, tenta as anteriores; depois o mesmo assunto e a mesma matéria pela dificuldade. Cada questão mostra o motivo da escolha. |
| **Revisão** (direita) | Refazer as questões erradas até acertar. |

## Aprendizado contínuo

O recomendador aprende em dois níveis:

1. **Aluno, a cada resposta.** O θ da área é atualizado (distribuição posterior completa) e o controlador
   ajusta a meta pelas últimas 15 respostas. Com login, no servidor (`resposta_evento`, `perfil_tri`);
   sem login, no navegador. Depois de cada resposta, a tela da questão mostra o card **O que o
   recomendador aprendeu**: o que ele previa, θ e incerteza antes → depois, a nota, a chance da mesma
   questão agora, a meta e o motivo quando a resposta não conta. O card pode ser desligado no laboratório.
2. **Sistema, com as respostas de todos os alunos com conta.** Para cada área, um deslocamento δ em
   logit corrige a chance prevista quando os alunos acertam sistematicamente mais (ou menos) do que o
   modelo do INEP previu. Estimado por máxima verossimilhança com prior N(0; 0,3²), só a partir de 30
   respostas válidas na área, limitado a ±0,6 e recalculado a cada 10 respostas novas
   (`estimarAjuste` em `dificuldade.js`). A chance guardada no banco é sempre a sem ajuste.

O `titulo_area` não muda com as respostas: é o conhecimento fixo de quais questões são parecidas.

O laboratório (`/dev`, aba **Recomendadores ao vivo**) mostra o perfil TRI atual, a linha do tempo do
que foi aprendido a cada resposta (e de cada escolha da próxima questão, com as 5 primeiras do
`titulo_area` e suas chances), o aprendizado do sistema por área e a calibração previsto × observado.
Atualiza sozinho enquanto o app é usado em outra aba.

## Modos da API (para os modos futuros)

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
