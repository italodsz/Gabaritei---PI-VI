# Quando não há sugestão boa (estudo de 11/11/2026, sem mudar o recomendador)

## 1. Dá para detectar sugestão fraca?
`analise.py`: 502 pares do mesmo título com nota 0–10 da IA. A semelhança de sentido (cosseno Qwen) entre referência
e sugestão acompanha a nota (correlação 0,69; separa notas < 5 com AUC 0,87). Por área: MT 0,91, CN 0,87, CH 0,86,
LC 0,75 (Linguagens é a mais difícil de prever).

Cortes (cosseno abaixo de X → alarme):

| Corte | Pares abaixo | Ruins entre os de baixo | Ruins entre os de cima | Ruins pegos | Catálogo: 1ª sugestão abaixo | 3ª abaixo |
|---|---|---|---|---|---|---|
| 0,555 | 10% | 80% | 19% | 32% | 0,6% | 3,2% |
| 0,592 | 20% | 68% | 14% | 54% | 2,0% | 8,6% |
| 0,622 | 30% | 61% | 10% | 72% | 5,7% | 18,2% |
| 0,649 | 40% | 53% | 7% | 84% | 10,7% | 30,2% |

Limites: notas da IA (a avaliação cega 7 permitirá conferir com notas humanas); os pares avaliados são sugestões do topo,
não amostra aleatória.

## 2. As 23 questões sem sugestão (`sem_lista.json`)
- 22 têm o texto incompleto na base (só o comando, sem texto-base, tabela ou figura; 2 sem enunciado). Não dá para
  classificar nem recomendar sem recuperar o texto da prova original.
- 1 não é defeito: `gq_1a3a6d4a138f7ba1fba29cef` (ENEM 2009, caderno de Humanas, trecho de Lúcio Cardoso) foi
  classificada como Literatura › Modernismo. Como a busca exige a mesma área, ela não encontra nenhuma outra
  questão de Literatura em Humanas. É a "Literatura em Humanas" da contagem por matéria.

## Correções aplicadas (11/11/2026)

- **Textos:** o enunciado oficial do INEP (caderno azul) foi aplicado às 22 questões que estavam truncadas, em `base/questions.jsonl`. O texto antigo foi guardado em `question_truncada_original` e a fonte em `correcao_texto`. As alternativas da base foram mantidas, porque o gabarito depende da ordem delas, com duas exceções: na `gq_c43c6eee` foi retirado um "A " que sobrava no início da alternativa A, e na `gq_6a697545` as alternativas viraram I a V.
- **Classificação:** as 22 foram classificadas na árvore (`classificacao_manual.jsonl`). A `gq_d729403b` (Kelsen/Bobbio) é duplicata da `gq_b5d827ac` e foi marcada como tal. Nela, as alternativas da base são de outra questão.
- **Área:** a `gq_1a3a6d4a` (Lúcio Cardoso, Literatura) estava na área CH e foi movida para LC (`area_original` guarda o valor antigo).
- **Índice:** o TF-IDF foi refeito com `atualizar_textos.py`. Os vetores Qwen e MiniLM dessas 22 questões ainda são os do texto truncado e estão listados em `indice/config.json` → `qwen_vetores_desatualizados`. Para atualizá-los, rode `python atualizar_qwen_parcial.py` no computador que tem o modelo Qwen e depois atualize `QWEN_SHA256`.
- **Resultado:** o catálogo foi regenerado. As 23 questões agora têm sugestões (de 12 a 50 cada), e nenhuma questão da base fica mais com a lista vazia.
- **Vetores Qwen atualizados (11/11/2026, commit 0d4955a, no PC com a RTX 4060 Ti):** foram recalculadas só as 22 linhas, com a mesma configuração de 4 bits. As outras 2.041 linhas não mudaram. A semelhança entre o vetor antigo e o novo vai de 0,53 a 0,98, e os menores valores são das questões em que o texto truncado tinha perdido mais conteúdo. O novo `QWEN_SHA256` confere com o arquivo, e o catálogo foi regenerado com ele.
