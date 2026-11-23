# Avaliação dos recomendadores de dificuldade

Compara os três recomendadores de dificuldade feitos no grupo, com **respostas reais de 660 alunos do ENEM 2024**.
Resultado: os dois que usam TRI (Ítalo e João) empatam e ganham com folga do BKT (Gabriel). O do Ítalo é o que está
no app.

| Método | Autor | Onde está |
| --- | --- | --- |
| TRI 3PL (oficial do app) | Ítalo | `main`: `backend/tri.py`, `backend/dificuldade.py` |
| TRI 3PL com estratégias automáticas | João | branch `joao/recomendador-dificulade` (f99bd07), pasta `recomendador/` |
| BKT; no ENEM, média de acertos suavizada | Gabriel | branch `recomendador-dificuldade-v2` (e7db348), pasta `dificuldade-adaptativa/modulo-bkt-H/` |

## Como rodar

Na raiz do projeto, com o ambiente do backend ativo (o mesmo do `pytest`):

```
python avaliacao/dificuldade/comparar_recomendadores.py
```

Leva cerca de 3 minutos e grava `avaliacao/dificuldade/resultados.json`. Para uma conferência rápida (menos
precisa): `--sementes-previsao 1 --sementes-escolha 2`. As sementes são fixas, então o resultado se repete.

## Dados

`backend/testdata/microdados_2024_amostra.json`: amostra aleatória dos microdados oficiais do INEP de 2024, com
44 ou 45 respostas (certo ou errado) de cada aluno, os parâmetros TRI de cada questão e a nota oficial. Os três
métodos são avaliados nas mesmas questões (triagem do app: a ≥ 0,4, −3 ≤ b ≤ 5, 0 ≤ c ≤ 0,4).

## Teste 1: prever se o aluno vai acertar

As respostas de cada aluno são embaralhadas (5 ordens). Antes de cada resposta, o método dá a chance de acerto e
depois aprende com o resultado: 145.845 previsões por método.

| Método | Log-loss (menor é melhor) | AUC (maior é melhor) | AUC nas 5 primeiras respostas |
| --- | --- | --- | --- |
| Ítalo (TRI) | **0,566** | **0,742** | **0,704** |
| João (TRI) | 0,567 | 0,741 | 0,699 |
| Gabriel (modo ENEM) | 0,633 | 0,660 | 0,580 |

Diferença pareada por aluno (log-loss, intervalo de 95% por bootstrap):

- Ítalo − João: −0,0014 [−0,0019; −0,0009]. Real, mas pequena demais para importar; vem do ponto de partida
  (o do Ítalo começa no nível dos candidatos de 2023, o do João em média 0 e desvio 1).
- Ítalo − Gabriel: −0,067 [−0,072; −0,063]. O Ítalo é melhor em 87% dos alunos.
- João − Gabriel: −0,066 [−0,070; −0,061]. O João é melhor em 89% dos alunos.

## Teste 2: escolher a próxima questão

Cada método escolhe 20 questões, uma por vez, entre as da prova do aluno (10 repetições); conta-se o acerto real
do aluno nelas. Ítalo mira 75% de chance; João segue o modo automático (diagnóstico inicial, diagnóstico
direcionado e depois a faixa de 65% a 80%); Gabriel começa na faixa média, sorteia dentro da faixa e aceita toda
sugestão de troca (melhor caso para ele).

| Método | Nota abaixo de 500 (305 alunos) | 500 a 650 (325) | Acima de 650 (30) |
| --- | --- | --- | --- |
| Sorteio | 23% | 49% | 64% |
| Gabriel (modo ENEM) | 26% | 50% | 64% |
| João (TRI) | 28% | 61% | 73% |
| Ítalo (TRI) | 28% | 61% | **76%** |

Abaixo de 500 ninguém chega perto de 75%: as questões do ENEM são difíceis demais para esse grupo. Por isso o app
usa a meta alcançável, o apoio e a revisão de erros.

## Limites

- Os parâmetros de 2024 foram calibrados pelo INEP com toda a população daquele ano, que inclui estes alunos. No
  app a situação é a mesma (parâmetros oficiais), então o teste reflete o uso real.
- O teste 2 é um replay: o estoque são as 45 questões da prova, não o acervo inteiro.
- João e Gabriel foram reproduzidos a partir do código deles, não executados nos programas originais. Do João
  ficaram de fora o bônus de revisão por habilidade, as penalidades de diversidade e o deslocamento do reforço.
  Do Gabriel foi usado o modo que roda no ENEM, porque não existe BKT treinado para o ENEM.
- Acertar mais não é aprender mais: nenhum dos três foi testado com alunos reais usando o app ao longo do tempo.
