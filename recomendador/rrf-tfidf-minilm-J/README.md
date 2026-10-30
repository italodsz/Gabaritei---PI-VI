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
