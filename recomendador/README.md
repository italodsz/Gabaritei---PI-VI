# Recomendador oficial

A pasta `rrf-tfidf-minilm-J/` contém o resultado final integrado na main a partir
de `recomendador-base-final`, commit `d10f5a3`.

Foi trazido somente o necessário para consultar, reconstruir e conferir o método
atual: código principal, sinais usados, configuração, árvore, classificação manual,
índices da base final, catálogo `titulo_area` e evidências da migração.
Catálogos antigos, reranqueadores e avaliações experimentais permanecem nas branches
de pesquisa e não fazem parte do aplicativo integrado.

O aplicativo consulta o catálogo por meio do FastAPI. O diagnóstico do modo dev
usa os vetores prontos em CPU; não calcula Qwen em tempo de execução.
Veja o [README do projeto](../README.md) para abrir o app e o
[README do recomendador](rrf-tfidf-minilm-J/README.md) para reconstrução e pendências.
