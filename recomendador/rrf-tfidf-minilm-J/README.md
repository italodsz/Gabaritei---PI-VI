# RRF TF-IDF + MiniLM (J)

Autor: Ítalo. **Recomendador de trabalho do Gabaritei; não validado para todas as áreas.**

Estado e limitações atualizados: [ESTADO_ATUAL.md](ESTADO_ATUAL.md).

Combina TF-IDF e MiniLM em blocos por fusão de posições (RRF, k = 60) sobre a base de
trabalho das etapas 1 a 3 (2.971 questões; 2.063 elegíveis: 1.801 treino, 136 validação,
126 teste). A galeria é o treino elegível; filtros de mesma área e família de conteúdo.

## Rodar

    pip install numpy scipy scikit-learn joblib threadpoolctl
    python recomendador.py avaliar
    python recomendador.py buscar --question-id gq_e21312d2bf6fabef103eb061

O índice já está em `indice/`. Para reconstruí-lo:

    python recomendador.py construir --minilm-de CAMINHO/Gabaritei_v2_1_rc1/entrega/vectors
    python recomendador.py construir --recodificar   # recalcula o MiniLM (precisa de torch,
                                                     # sentence-transformers e acesso ao modelo)

## Configuração congelada

Ver `DECISAO_FINAL.json`. Testes de melhoria em `resultados/`.

## Pendência

O vetor MiniLM da V01 (gq_14561aefce51ecddf26b4262) ainda é o da v2.1-rc1, de antes da
correção da fórmula. Está listado em `indice/config.json`. Rode `construir --recodificar`
num computador com acesso ao HuggingFace para eliminar isso.

## Resultado na validação (45 pares com nota, 44 comparações)

| Método | Pares na ordem certa |
|---|---|
| TF-IDF | 30/44 (68%) |
| MiniLM | 24/44 (55%) |
| RRF | 34/44 (77%) |

As notas desses pares são majoritariamente de IA (rodadas de 32 e 16 pares), não uma
avaliação humana independente. O teste reservado estava fechado na escolha da configuração;
posteriormente, foram realizadas avaliações das sugestões. Não deve ser tratado agora como
um conjunto de teste ainda intocado.

## Avaliação cega humana (29/10/2026)

Avaliador: Ítalo. 12/24 sugestões com nota 2 (critério: 50%), 21/24 com nota 1 ou 2,
nenhum bloco com dois zeros. Aprovado no limite. Linguagens 5/6 e Matemática 4/6;
Natureza 2/6 e Humanas 1/6.

Há resultados posteriores da segunda avaliação (CN e CH), mas as fontes disponíveis
conflitam sobre notas e autoria. O histórico relata 3/24 notas 2 e 13/24 notas 1 ou 2;
o DOCX consultado se identifica como análise por IA e apresenta 3/24 e 11/24,
respectivamente. Não classificamos esta segunda avaliação como humana confirmada.
Ver [registro das fontes](resultados/avaliacao2_fontes.json).
A comparação posterior com filtro por habilidade ainda requer avaliação humana independente.

## Comparação com os outros recomendadores do grupo (validação, mesma base)

| Recomendador | Pares na ordem certa |
|---|---|
| Este (RRF) | 34/44 (77%) |
| Híbrido v2.1 (João), sem limiar | 29/44 (66%) |
| Chroma + MiniLM (Cauê) | 26/44 (59%) |
| Sorteio na mesma área | 23/44 (52%) |

## Candidato: RRF TF-IDF + Qwen3-Embedding-8B (05/11/2026)

Modo `--metodo rrf_qwen`: troca o MiniLM pelo Qwen3-Embedding-8B (4 bits) com a instrução de
representar o conceito e a operação pedida, ignorando o cenário. Na validação: **39/44** pares
na ordem certa, contra 34/44 do oficial. Ainda não é o oficial: falta a avaliação cega 4.
Detalhes em `resultados/teste_qwen3.md`. Os vetores ficam em `indice/qwen/` (34 MB) e são
gerados por `gerar_vetores_qwen.py --quantizar-4bit`; `comparar_modelos.py` refaz a tabela.

## Oficial desde 06/11/2026: RRF TF-IDF + Qwen3-Embedding-8B (`rrf_qwen`)

Avaliação cega 4 (Teles, 8 referências, três métodos): média 0,96 para `rrf_qwen`, 0,79 para o
anterior (RRF + MiniLM) e 0,75 com reranker. Avaliação em escala por agente (36 referências):
0,87 × 0,62 × 0,92. O `rrf_qwen` passa a ser o padrão do `buscar`. Limitação: não atinge os
limiares de qualidade (50% de nota 2), sobretudo em Ciências da Natureza. O reranker
(Qwen3-Reranker-4B) está documentado em `resultados/teste_reranker.md` e não foi adotado.
Detalhes em `resultados/avaliacao_cega_4/` e `resultados/avaliacao_escala/`.

## Candidato: modo `arvore` (10/11/2026)

Usa a árvore curricular v1.2 e a classificação completa das 2.063 questões elegíveis
(`classificador/dados/`: gabarito + classificação manual, conferida por amostra de 100).

- Primeiro vêm as questões do **mesmo assunto**, na ordem do `rrf_qwen`.
- Depois, o resto da área por RRF de três listas: TF-IDF, Qwen e a ordem da árvore
  (mesmo grande tema, grande tema vizinho no tempo em História e Literatura, resto).
- Ficam fora da galeria as questões com defeito e as duplicatas anotadas. A base não foi alterada.
- Em língua estrangeira, só sugere questões na mesma língua (inglês ou espanhol).

Validação (mesmos 44 pares): **40/44**, contra 39/44 do `rrf_qwen`. Variantes testadas: só o
assunto primeiro e o resto por texto, 41/44; árvore estrita (assunto, depois grande tema, depois
o resto), 36/44, porque empurra para baixo questões parecidas de outro grande tema.
Com 44 pares de notas majoritariamente de IA, as três diferenças são pequenas.

No top 5, a média de sugestões do mesmo assunto sobe de 1,4–2,3 (`rrf_qwen`) para 4,1–4,7 (`arvore`),
conforme a área. Mesmo assunto não garante o mesmo conceito, e os rótulos têm cerca de 85–88% de acerto
na amostra conferida.

Ainda não é o oficial: falta avaliação cega humana. Catálogo em `catalogo/recomendacoes_arvore.json`
(`python recomendador.py exportar --metodo arvore`), com `grande_tema`, `assunto` e `lingua` de cada questão.

## Candidato: modo `titulo` (10/11/2026)

Decisão de produto: a recomendação é feita 100% dentro do **título amplo** da questão (mesma matéria e
mesmo título), na ordem do `rrf_qwen`. Motivo: o ENEM quase não repete conceitos (ex.: só duas questões de
efeito Doppler na base), então prometer "mesmo conceito" não é cumprível; "mesmo título" é.

- 15 matérias e 67 títulos em `classificador/dados/titulos_v1.json`: são os grandes temas da árvore v1.2,
  com grupos pequenos fundidos (História, Literatura até o Pré-Modernismo, Filosofia antiga e medieval, Artes)
  e grandes divididos (Proporcionalidade, Geometria). Menor título: 7 questões; mediana de 34 sugestões por questão.
- Sem defeitos nem duplicatas; língua estrangeira só na mesma língua.
- Catálogo: `catalogo/recomendacoes_titulo.json` (`python recomendador.py exportar --metodo titulo`), com
  `materia` e `titulo` em cada questão. As 23 questões sem rótulo (defeito) ficam sem sugestões.
- Matéria e título são classificação nossa, não dado oficial do INEP. Ainda sem avaliação humana.
