# Gabaritei — avaliação de recomendação

Abra Gabaritei_Metricas_Recomendacao.html para ler o relatório sem instalar nada.

Para reproduzir, use Python >=3.10 e execute `python calcular_metricas.py` e `python -m unittest -v test_metricas.py`. Não execute preparar_fontes.py; ele documenta apenas a coleta inicial local. Os arquivos necessários já estão em fontes/. Não há treinamento nem conexão com serviços para calcular as métricas.

resultados/resumo.csv e por_consulta.csv: métricas, limiares, denominadores e intervalos. manifesto_fontes.json: SHA-256 e URLs. logs/: execução e testes. RELATORIO.md: metodologia e limitações.

Os resultados principais se referem à relevância semântica em 11 referências com notas humanas históricas, não à personalização BKT. Recall e nDCG são restritos ao pool conhecido.
