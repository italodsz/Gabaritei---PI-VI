# Recomendador oficial

A pasta `rrf-tfidf-minilm-J/` contém o resultado final integrado na main a partir
de `recomendador-base-final`, commit `d10f5a3`.

Foi trazido somente o necessário para consultar, reconstruir e conferir o método
atual: código principal, sinais usados, configuração, árvore, classificação manual,
índices da base final, catálogo `titulo_area` e evidências da migração.
Catálogos antigos, reranqueadores e avaliações experimentais permanecem nas branches
de pesquisa e não fazem parte do aplicativo integrado.

O aplicativo consulta o catálogo por meio do back-end Node. Não calcula Qwen em
tempo de execução. Veja `../README.md` para abrir o app e
`rrf-tfidf-minilm-J/RELATORIO_BASE_FINAL.md` para a auditoria e pendências.
