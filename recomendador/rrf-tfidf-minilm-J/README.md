# RRF TF-IDF + MiniLM (J)

Autor: Ítalo. **Recomendador de trabalho do Gabaritei; não validado para todas as áreas.**

Estado e limitações atualizados: [ESTADO_ATUAL.md](ESTADO_ATUAL.md).

Atualização de 13/11/2026: usa a base final do dataset (e6712a8), com 3.086 questões
e 2.731 elegíveis: 2.382 treino, 175 validação e 174 teste.
SHA-256: `6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f`.
O texto de busca inclui as descrições explicitamente marcadas para o recomendador.
O método oficial continua sendo `titulo_area`, com os mesmos filtros e pesos.
TF-IDF ajustado só no treino; catálogo com galeria de todos os elegíveis.
Migração, defeitos e validação: [RELATORIO_BASE_FINAL.md](RELATORIO_BASE_FINAL.md).
Os resultados nas seções históricas abaixo se referem à base anterior.

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

## Recodificação da base final

O MiniLM foi recodificado integralmente, incluindo a V01
(`gq_14561aefce51ecddf26b4262`). Não há vetores MiniLM pendentes.
Os rótulos novos e as descrições ainda precisam da conferência humana por amostra.

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

## Oficial desde 11/11/2026: modo `titulo_area`

Mesmo filtro do modo `titulo` (só a mesma matéria e o mesmo título amplo, sem defeitos nem duplicatas,
língua estrangeira na mesma língua), com a ordem dentro do título escolhida **por matéria**
(`busca_por_area_v1.json`, sinais em `sinais.py`):
- na maioria das matérias, só o sentido do texto (Qwen); a semelhança de palavras (TF-IDF) atrapalhava
  dentro do título;
- Filosofia: Qwen + bônus de mesmo autor; Literatura: mistura TF-IDF + Qwen + bônus de autor e época;
  Tecnologias da informação: mistura atual.

Escolha feita em treino e validação (`resultados/busca_por_area/`). Conferência: avaliação da IA às cegas
em 50 referências novas do teste (`resultados/avaliacao_ia_50/`): média 6,23 (`titulo`) contra 6,60;
1ª sugestão 6,92 contra 7,38; sugestões abaixo de 5 caem de 20% para 11%; diferença por referência
+0,37 (IC95 0,18 a 0,59). Limite: notas da IA, que construiu o método; falta avaliação humana.

`buscar` e `exportar` usam `titulo_area` por padrão. Catálogo do app: `catalogo/recomendacoes_titulo_area.json`.
