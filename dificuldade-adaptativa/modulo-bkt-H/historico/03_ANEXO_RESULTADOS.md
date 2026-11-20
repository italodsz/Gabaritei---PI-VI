# Anexo de resultados experimentais e auditorias

Os nomes das configurações seguem as chaves originais. Uma tabela pode incluir execução, reprodução, validação, teste e seleção de parâmetros. Compare apenas condições da mesma tarefa e partição. As métricas por classe, matrizes, predições e listas grandes continuam nos arquivos originais. `metricas_indexadas.csv` permite procurar a chave e a origem.

## auditoria_global/estatistica.json

Arquivo integral · [estatistica.json](evidencias/workspace/dificuldade-adaptativa/auditoria_global/estatistica.json)

Contagens e resultados de topo · `paired_f1_bert_minus_deberta` = 0.09695259267596407, `bootstrap_replicates` = 2000, `seed` = 42
Veja o arquivo integral para distribuições, critérios, tempos, resultados por lote e verificações.

## auditoria_global/resultados.json

Arquivo integral · [resultados.json](evidencias/workspace/dificuldade-adaptativa/auditoria_global/resultados.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `modelos_recalculados / bert / recomputed` | accuracy = 0.573529, ordinal_mae = 0.544118 |
| `modelos_recalculados / bert / config` | n = 136, macro_f1 = 0.522332, accuracy = 0.573529, ordinal_mae = 0.544118, easy_hard_errors = 16, easy_hard_rate = 0.117647, validation_seconds = 0.866772, epoch = 1, seed = 7, limit = 512, cuts = [0.8005400000000001, 1.56301], validation_year = 2023, batch = 2, effective_batch = 16, lr = 0.000030, changed_encoder_parameters = 32 |
| `modelos_recalculados / deberta / recomputed` | accuracy = 0.522059, ordinal_mae = 0.632353 |
| `modelos_recalculados / deberta / config` | n = 136, macro_f1 = 0.425380, accuracy = 0.522059, ordinal_mae = 0.632353, easy_hard_errors = 21, easy_hard_rate = 0.154412, validation_seconds = 1.453756, epoch = 2, seed = 7, limit = 256, cuts = [0.8005400000000001, 1.56301], validation_year = 2023, batch = 2, effective_batch = 16, lr = 0.000030, changed_encoder_parameters = 32 |
| `erros_por_fatia / bert/area / CH` | n = 39, acerto = 23, erro = 16 |
| `erros_por_fatia / bert/area / CN` | n = 32, acerto = 17, erro = 15 |
| `erros_por_fatia / bert/area / LC` | n = 39, acerto = 24, erro = 15 |
| `erros_por_fatia / bert/area / MT` | n = 26, acerto = 14, erro = 12 |
| `erros_por_fatia / bert/ano / 2023` | n = 136, acerto = 78, erro = 58 |
| `erros_por_fatia / bert/assunto_catalogo / None` | n = 24, acerto = 14, erro = 10 |
| `erros_por_fatia / bert/assunto_catalogo / Sociologia` | n = 3, acerto = 2, erro = 1 |
| `erros_por_fatia / bert/assunto_catalogo / História` | n = 6, acerto = 4, erro = 2 |
| `erros_por_fatia / bert/assunto_catalogo / Geografia` | n = 5, acerto = 4, erro = 1 |
| `erros_por_fatia / bert/assunto_catalogo / Filosofia` | n = 6, acerto = 3, erro = 3 |
| `erros_por_fatia / bert/assunto_catalogo / Economia` | n = 12, acerto = 4, erro = 8 |
| `erros_por_fatia / bert/assunto_catalogo / Biologia` | n = 12, erro = 5, acerto = 7 |
| `erros_por_fatia / bert/assunto_catalogo / Física` | n = 9, erro = 5, acerto = 4 |
| `erros_por_fatia / bert/assunto_catalogo / Artes` | n = 3, acerto = 3 |
| `erros_por_fatia / bert/assunto_catalogo / Leitura` | n = 14, erro = 6, acerto = 8 |
| `erros_por_fatia / bert/assunto_catalogo / Linguística` | n = 6, acerto = 5, erro = 1 |
| `erros_por_fatia / bert/assunto_catalogo / Literatura` | n = 7, acerto = 3, erro = 4 |
| `erros_por_fatia / bert/assunto_catalogo / Gramática` | n = 2, erro = 1, acerto = 1 |
| `erros_por_fatia / bert/assunto_catalogo / Educação física` | n = 4, erro = 1, acerto = 3 |
| `erros_por_fatia / bert/assunto_catalogo / Números` | n = 7, acerto = 5, erro = 2 |
| `erros_por_fatia / bert/assunto_catalogo / Probabilidade e estatística` | n = 5, erro = 3, acerto = 2 |
| `erros_por_fatia / bert/assunto_catalogo / Matemática financeira` | n = 4, erro = 1, acerto = 3 |
| `erros_por_fatia / bert/assunto_catalogo / Álgebra` | n = 1, acerto = 1 |
| `erros_por_fatia / bert/assunto_catalogo / Grandezas e medidas` | n = 3, acerto = 2, erro = 1 |
| `erros_por_fatia / bert/habilidade_catalogo / 22` | n = 6, acerto = 5, erro = 1 |
| `erros_por_fatia / bert/habilidade_catalogo / 3` | n = 6, acerto = 3, erro = 3 |
| `erros_por_fatia / bert/habilidade_catalogo / 21` | n = 3, erro = 1, acerto = 2 |
| `erros_por_fatia / bert/habilidade_catalogo / 1` | n = 4, acerto = 4 |
| `erros_por_fatia / bert/habilidade_catalogo / 15` | n = 5, acerto = 4, erro = 1 |
| `erros_por_fatia / bert/habilidade_catalogo / 26` | n = 5, acerto = 2, erro = 3 |
| `erros_por_fatia / bert/habilidade_catalogo / 16` | n = 7, acerto = 5, erro = 2 |
| `erros_por_fatia / bert/habilidade_catalogo / 9` | n = 3, acerto = 3 |
| `erros_por_fatia / bert/habilidade_catalogo / 23` | n = 6, erro = 3, acerto = 3 |
| `erros_por_fatia / bert/habilidade_catalogo / 2` | n = 3, acerto = 1, erro = 2 |
| `erros_por_fatia / bert/habilidade_catalogo / 27` | n = 5, erro = 2, acerto = 3 |
| `erros_por_fatia / bert/habilidade_catalogo / 7` | n = 3, acerto = 3 |
| `erros_por_fatia / bert/habilidade_catalogo / 14` | n = 4, erro = 3, acerto = 1 |
| `erros_por_fatia / bert/habilidade_catalogo / 30` | n = 6, acerto = 3, erro = 3 |
| `erros_por_fatia / bert/habilidade_catalogo / 8` | n = 5, erro = 2, acerto = 3 |
| `erros_por_fatia / bert/habilidade_catalogo / 4` | n = 4, acerto = 3, erro = 1 |
| `erros_por_fatia / bert/habilidade_catalogo / 11` | n = 5, acerto = 4, erro = 1 |
| `erros_por_fatia / bert/habilidade_catalogo / 29` | n = 6, erro = 2, acerto = 4 |
| `erros_por_fatia / bert/habilidade_catalogo / 12` | n = 6, acerto = 4, erro = 2 |
| `erros_por_fatia / bert/habilidade_catalogo / 28` | n = 6, erro = 3, acerto = 3 |
| `erros_por_fatia / bert/habilidade_catalogo / 19` | n = 4, erro = 3, acerto = 1 |
| `erros_por_fatia / bert/habilidade_catalogo / 25` | n = 3, erro = 2, acerto = 1 |
| `erros_por_fatia / bert/habilidade_catalogo / 18` | n = 6, erro = 4, acerto = 2 |
| `erros_por_fatia / bert/habilidade_catalogo / 5` | n = 4, erro = 3, acerto = 1 |
| `erros_por_fatia / bert/habilidade_catalogo / 10` | n = 5, acerto = 4, erro = 1 |
| `erros_por_fatia / bert/habilidade_catalogo / 24` | n = 4, erro = 3, acerto = 1 |
| `erros_por_fatia / bert/habilidade_catalogo / 13` | n = 2, erro = 1, acerto = 1 |
| `erros_por_fatia / bert/habilidade_catalogo / 20` | n = 3, erro = 2, acerto = 1 |
| `erros_por_fatia / bert/habilidade_catalogo / 6` | n = 3, acerto = 3 |
| `erros_por_fatia / bert/dificuldade / media` | n = 42, acerto = 8, erro = 34 |
| `erros_por_fatia / bert/dificuldade / facil` | n = 54, acerto = 43, erro = 11 |
| `erros_por_fatia / bert/dificuldade / dificil` | n = 40, acerto = 27, erro = 13 |
| `erros_por_fatia / bert/assets / False` | n = 136, acerto = 78, erro = 58 |
| `erros_por_fatia / bert/formula_proxy / False` | n = 134, acerto = 77, erro = 57 |
| `erros_por_fatia / bert/formula_proxy / True` | n = 2, acerto = 1, erro = 1 |
| `erros_por_fatia / bert/tabela_proxy / False` | n = 135, acerto = 77, erro = 58 |
| `erros_por_fatia / bert/tabela_proxy / True` | n = 1, acerto = 1 |
| `erros_por_fatia / bert/visual_proxy / False` | n = 131, acerto = 75, erro = 56 |
| `erros_por_fatia / bert/visual_proxy / True` | n = 5, acerto = 3, erro = 2 |
| `erros_por_fatia / bert/sem_assunto / True` | n = 24, acerto = 14, erro = 10 |
| `erros_por_fatia / bert/sem_assunto / False` | n = 112, acerto = 64, erro = 48 |
| `erros_por_fatia / bert/sem_habilidade / False` | n = 136, acerto = 78, erro = 58 |
| `erros_por_fatia / bert/bert_truncated / False` | n = 136, acerto = 78, erro = 58 |
| `erros_por_fatia / deberta/area / CH` | n = 39, erro = 19, acerto = 20 |
| `erros_por_fatia / deberta/area / CN` | n = 32, acerto = 18, erro = 14 |
| `erros_por_fatia / deberta/area / LC` | n = 39, erro = 20, acerto = 19 |
| `erros_por_fatia / deberta/area / MT` | n = 26, acerto = 14, erro = 12 |
| `erros_por_fatia / deberta/ano / 2023` | n = 136, erro = 65, acerto = 71 |
| `erros_por_fatia / deberta/assunto_catalogo / None` | n = 24, erro = 11, acerto = 13 |
| `erros_por_fatia / deberta/assunto_catalogo / Sociologia` | n = 3, acerto = 3 |
| `erros_por_fatia / deberta/assunto_catalogo / História` | n = 6, erro = 2, acerto = 4 |
| `erros_por_fatia / deberta/assunto_catalogo / Geografia` | n = 5, acerto = 3, erro = 2 |
| `erros_por_fatia / deberta/assunto_catalogo / Filosofia` | n = 6, acerto = 2, erro = 4 |
| `erros_por_fatia / deberta/assunto_catalogo / Economia` | n = 12, acerto = 5, erro = 7 |
| `erros_por_fatia / deberta/assunto_catalogo / Biologia` | n = 12, erro = 6, acerto = 6 |
| `erros_por_fatia / deberta/assunto_catalogo / Física` | n = 9, erro = 4, acerto = 5 |
| `erros_por_fatia / deberta/assunto_catalogo / Artes` | n = 3, erro = 1, acerto = 2 |
| `erros_por_fatia / deberta/assunto_catalogo / Leitura` | n = 14, erro = 7, acerto = 7 |
| `erros_por_fatia / deberta/assunto_catalogo / Linguística` | n = 6, acerto = 3, erro = 3 |
| `erros_por_fatia / deberta/assunto_catalogo / Literatura` | n = 7, acerto = 1, erro = 6 |
| `erros_por_fatia / deberta/assunto_catalogo / Gramática` | n = 2, erro = 1, acerto = 1 |
| `erros_por_fatia / deberta/assunto_catalogo / Educação física` | n = 4, erro = 1, acerto = 3 |
| `erros_por_fatia / deberta/assunto_catalogo / Números` | n = 7, acerto = 5, erro = 2 |
| `erros_por_fatia / deberta/assunto_catalogo / Probabilidade e estatística` | n = 5, erro = 3, acerto = 2 |
| `erros_por_fatia / deberta/assunto_catalogo / Matemática financeira` | n = 4, erro = 1, acerto = 3 |
| `erros_por_fatia / deberta/assunto_catalogo / Álgebra` | n = 1, acerto = 1 |
| `erros_por_fatia / deberta/assunto_catalogo / Grandezas e medidas` | n = 3, acerto = 2, erro = 1 |
| `erros_por_fatia / deberta/habilidade_catalogo / 22` | n = 6, erro = 3, acerto = 3 |
| `erros_por_fatia / deberta/habilidade_catalogo / 3` | n = 6, acerto = 3, erro = 3 |
| `erros_por_fatia / deberta/habilidade_catalogo / 21` | n = 3, acerto = 3 |
| `erros_por_fatia / deberta/habilidade_catalogo / 1` | n = 4, erro = 2, acerto = 2 |
| `erros_por_fatia / deberta/habilidade_catalogo / 15` | n = 5, acerto = 3, erro = 2 |
| `erros_por_fatia / deberta/habilidade_catalogo / 26` | n = 5, acerto = 2, erro = 3 |
| `erros_por_fatia / deberta/habilidade_catalogo / 16` | n = 7, acerto = 4, erro = 3 |
| `erros_por_fatia / deberta/habilidade_catalogo / 9` | n = 3, acerto = 2, erro = 1 |
| `erros_por_fatia / deberta/habilidade_catalogo / 23` | n = 6, erro = 3, acerto = 3 |
| `erros_por_fatia / deberta/habilidade_catalogo / 27` | n = 5, erro = 2, acerto = 3 |
| `erros_por_fatia / deberta/habilidade_catalogo / 7` | n = 3, acerto = 2, erro = 1 |
| `erros_por_fatia / deberta/habilidade_catalogo / 14` | n = 4, erro = 2, acerto = 2 |
| `erros_por_fatia / deberta/habilidade_catalogo / 30` | n = 6, acerto = 4, erro = 2 |
| `erros_por_fatia / deberta/habilidade_catalogo / 8` | n = 5, erro = 4, acerto = 1 |
| `erros_por_fatia / deberta/habilidade_catalogo / 4` | n = 4, erro = 2, acerto = 2 |
| `erros_por_fatia / deberta/habilidade_catalogo / 11` | n = 5, erro = 1, acerto = 4 |
| `erros_por_fatia / deberta/habilidade_catalogo / 29` | n = 6, acerto = 6 |
| `erros_por_fatia / deberta/habilidade_catalogo / 12` | n = 6, acerto = 4, erro = 2 |
| `erros_por_fatia / deberta/habilidade_catalogo / 28` | n = 6, acerto = 3, erro = 3 |
| `erros_por_fatia / deberta/habilidade_catalogo / 25` | n = 3, acerto = 2, erro = 1 |
| `erros_por_fatia / deberta/habilidade_catalogo / 18` | n = 6, erro = 4, acerto = 2 |
| `erros_por_fatia / deberta/habilidade_catalogo / 5` | n = 4, erro = 3, acerto = 1 |
| `erros_por_fatia / deberta/habilidade_catalogo / 10` | n = 5, acerto = 4, erro = 1 |
| `erros_por_fatia / deberta/habilidade_catalogo / 24` | n = 4, erro = 3, acerto = 1 |
| `erros_por_fatia / deberta/habilidade_catalogo / 13` | n = 2, erro = 1, acerto = 1 |
| `erros_por_fatia / deberta/habilidade_catalogo / 20` | n = 3, erro = 2, acerto = 1 |
| `erros_por_fatia / deberta/habilidade_catalogo / 6` | n = 3, acerto = 3 |
| `erros_por_fatia / deberta/dificuldade / media` | n = 42, erro = 41, acerto = 1 |
| `erros_por_fatia / deberta/dificuldade / facil` | n = 54, acerto = 40, erro = 14 |
| `erros_por_fatia / deberta/dificuldade / dificil` | n = 40, erro = 10, acerto = 30 |
| `erros_por_fatia / deberta/assets / False` | n = 136, erro = 65, acerto = 71 |
| `erros_por_fatia / deberta/formula_proxy / False` | n = 134, erro = 64, acerto = 70 |
| `erros_por_fatia / deberta/formula_proxy / True` | n = 2, acerto = 1, erro = 1 |
| `erros_por_fatia / deberta/tabela_proxy / False` | n = 135, erro = 65, acerto = 70 |
| `erros_por_fatia / deberta/tabela_proxy / True` | n = 1, acerto = 1 |
| `erros_por_fatia / deberta/visual_proxy / False` | n = 131, erro = 62, acerto = 69 |
| `erros_por_fatia / deberta/visual_proxy / True` | n = 5, acerto = 2, erro = 3 |
| `erros_por_fatia / deberta/sem_assunto / True` | n = 24, erro = 11, acerto = 13 |
| `erros_por_fatia / deberta/sem_assunto / False` | n = 112, acerto = 58, erro = 54 |
| `erros_por_fatia / deberta/sem_habilidade / False` | n = 136, erro = 65, acerto = 71 |
| `erros_por_fatia / deberta/deberta_truncated / False` | n = 49, erro = 25, acerto = 24 |
| `erros_por_fatia / deberta/deberta_truncated / True` | n = 87, acerto = 47, erro = 40 |

## auditoria_rotulos/metricas.json

Arquivo integral · [metricas.json](evidencias/workspace/dificuldade-adaptativa/auditoria_rotulos/metricas.json)

Contagens e resultados de topo · `catalogo` = 2971, `sem_assunto` = 560, `sem_habilidade` = 192, `amostra` = 300, `confirmadas_oficialmente` = 0, `pendentes` = 300
Veja o arquivo integral para distribuições, critérios, tempos, resultados por lote e verificações.

## catalogo_adaptativo_operacional/metricas.json

Arquivo integral · [metricas.json](evidencias/workspace/dificuldade-adaptativa/catalogo_adaptativo_operacional/metricas.json)

Contagens e resultados de topo · `total` = 2971, `documentos_oficiais` = 64, `pares_caderno_gabarito` = 32, `coincidencias_textuais_com_caderno` = 180, `prontas_exibicao` = 112, `prontas_adaptativo` = 41, `novas_prontas_vs_14` = 98, `anteriores_mantidas` = 14, `itens_revistos_visualmente_nesta_rodada` = 8, `recortes_de_apoio_reabertos` = 2, `midia_referenciada_ausente` = 878, `pendencias_curtas_prioridade_1` = 69
Veja o arquivo integral para distribuições, critérios, tempos, resultados por lote e verificações.

## catalogo_mvp/metricas.json

Arquivo integral · [metricas.json](evidencias/workspace/dificuldade-adaptativa/catalogo_mvp/metricas.json)

Contagens e resultados de topo · `total` = 2971, `recuperadas` = 0, `piloto_anterior` = 1329, `piloto_mantido` = 1314, `sem_assunto` = 560, `sem_habilidade` = 192, `revisao_licenca` = 2971
Veja o arquivo integral para distribuições, critérios, tempos, resultados por lote e verificações.

## correcao_adaptativa/busca_autonoma.json

Arquivo integral · [busca_autonoma.json](evidencias/workspace/dificuldade-adaptativa/correcao_adaptativa/busca_autonoma.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `validation / logistic / bkt_atual` | accuracy = 0.355195, outside = 0.660751, offers = 0.098165, false_change = 0.054784, coverage = 0.555556, covered_accuracy = 0.372685, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic / taxa` | accuracy = 0.342335, outside = 0.669410, offers = 0.074417, false_change = 0.048354, coverage = 0.555556, covered_accuracy = 0.349537, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic / (5, 4, 1)` | accuracy = 0.343621, outside = 0.675326, offers = 0.124486, false_change = 0.095165, coverage = 0.777778, covered_accuracy = 0.346561, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic / (5, 4, 2)` | accuracy = 0.356053, outside = 0.668467, offers = 0.124486, false_change = 0.095165, coverage = 0.777778, covered_accuracy = 0.362544, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic / (5, 8, 1)` | accuracy = 0.336677, outside = 0.678755, offers = 0.088992, false_change = 0.070473, coverage = 0.555556, covered_accuracy = 0.339352, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic / (5, 8, 2)` | accuracy = 0.346193, outside = 0.673783, offers = 0.088992, false_change = 0.070473, coverage = 0.555556, covered_accuracy = 0.356481, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic / (12, 4, 1)` | accuracy = 0.346536, outside = 0.670782, offers = 0.123200, false_change = 0.088992, coverage = 0.777778, covered_accuracy = 0.350309, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic / (12, 4, 2)` | accuracy = 0.357167, outside = 0.664866, offers = 0.123200, false_change = 0.088992, coverage = 0.777778, covered_accuracy = 0.363977, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic / (12, 8, 1)` | accuracy = 0.339506, outside = 0.675240, offers = 0.087791, false_change = 0.065072, coverage = 0.555556, covered_accuracy = 0.344444, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic / (12, 8, 2)` | accuracy = 0.347651, outside = 0.671039, offers = 0.087791, false_change = 0.065072, coverage = 0.555556, covered_accuracy = 0.359105, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic / (36, 4, 1)` | accuracy = 0.345079, outside = 0.670782, offers = 0.122599, false_change = 0.092078, coverage = 0.777778, covered_accuracy = 0.348435, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic / (36, 4, 2)` | accuracy = 0.354681, outside = 0.663666, offers = 0.122599, false_change = 0.092078, coverage = 0.777778, covered_accuracy = 0.360780, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic / (36, 8, 1)` | accuracy = 0.338134, outside = 0.675240, offers = 0.086934, false_change = 0.067901, coverage = 0.555556, covered_accuracy = 0.341975, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic / (36, 8, 2)` | accuracy = 0.345250, outside = 0.669839, offers = 0.086934, false_change = 0.067901, coverage = 0.555556, covered_accuracy = 0.354784, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl / bkt_atual` | accuracy = 0.354681, outside = 0.589163, offers = 0.092164, false_change = 0.052726, coverage = 0.555556, covered_accuracy = 0.371759, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl / taxa` | accuracy = 0.344907, outside = 0.597222, offers = 0.066187, false_change = 0.038580, coverage = 0.555556, covered_accuracy = 0.354167, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl / (5, 4, 1)` | accuracy = 0.349709, outside = 0.590535, offers = 0.105024, false_change = 0.063529, coverage = 0.777778, covered_accuracy = 0.354387, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl / (5, 4, 2)` | accuracy = 0.361111, outside = 0.575960, offers = 0.105024, false_change = 0.063529, coverage = 0.777778, covered_accuracy = 0.369048, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl / (5, 8, 1)` | accuracy = 0.344993, outside = 0.595250, offers = 0.074074, false_change = 0.043467, coverage = 0.555556, covered_accuracy = 0.354321, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl / (5, 8, 2)` | accuracy = 0.352795, outside = 0.584877, offers = 0.074074, false_change = 0.043467, coverage = 0.555556, covered_accuracy = 0.368364, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl / (12, 4, 1)` | accuracy = 0.355453, outside = 0.586248, offers = 0.108025, false_change = 0.060700, coverage = 0.777778, covered_accuracy = 0.361772, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl / (12, 4, 2)` | accuracy = 0.364283, outside = 0.575103, offers = 0.108025, false_change = 0.060700, coverage = 0.777778, covered_accuracy = 0.373126, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl / (12, 8, 1)` | accuracy = 0.350309, outside = 0.590706, offers = 0.076989, false_change = 0.041409, coverage = 0.555556, covered_accuracy = 0.363889, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl / (12, 8, 2)` | accuracy = 0.356053, outside = 0.583333, offers = 0.076989, false_change = 0.041409, coverage = 0.555556, covered_accuracy = 0.374228, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl / (36, 4, 1)` | accuracy = 0.350051, outside = 0.591392, offers = 0.106567, false_change = 0.067644, coverage = 0.777778, covered_accuracy = 0.354828, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl / (36, 4, 2)` | accuracy = 0.356396, outside = 0.582562, offers = 0.106567, false_change = 0.067644, coverage = 0.777778, covered_accuracy = 0.362985, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl / (36, 8, 1)` | accuracy = 0.344993, outside = 0.595850, offers = 0.075446, false_change = 0.048097, coverage = 0.555556, covered_accuracy = 0.354321, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl / (36, 8, 2)` | accuracy = 0.348337, outside = 0.590706, offers = 0.075446, false_change = 0.048097, coverage = 0.555556, covered_accuracy = 0.360340, accepted_changes = 0, violations = 0, trajectories = 324 |
| `test / logistic/fixed / taxa` | accuracy = 0.341678, outside = 0.668896, offers = 0.074588, false_change = 0.049211, coverage = 0.555556, covered_accuracy = 0.348354, accepted_changes = 0, violations = 0, trajectories = 486 |
| `test / logistic/fixed / bkt_atual` | accuracy = 0.353967, outside = 0.659979, offers = 0.098080, false_change = 0.056070, coverage = 0.555556, covered_accuracy = 0.370473, accepted_changes = 0, violations = 0, trajectories = 486 |
| `test / logistic/fixed / (12, 4, 2)` | accuracy = 0.356539, outside = 0.664838, offers = 0.121685, false_change = 0.089163, coverage = 0.777778, covered_accuracy = 0.363169, accepted_changes = 0, violations = 0, trajectories = 486 |
| `test / logistic/fixed / delta_vs_taxa` | gain = 0.014861, ci95 = [0.008516232281664381, 0.020976223136716963] |
| `test / logistic/fixed / delta_vs_bkt_atual` | gain = 0.002572, ci95 = [-0.003829446730681298, 0.009316415180612712] |
| `test / logistic/closed / taxa` | accuracy = 0.368541, outside = 0.629915, offers = 0.050354, false_change = 0.024739, coverage = 0.555556, covered_accuracy = 0.402366, accepted_changes = 591, violations = 0, trajectories = 486 |
| `test / logistic/closed / bkt_atual` | accuracy = 0.425183, outside = 0.586420, offers = 0.081390, false_change = 0.042238, coverage = 0.555556, covered_accuracy = 0.501337, accepted_changes = 927, violations = 0, trajectories = 486 |
| `test / logistic/closed / (12, 4, 2)` | accuracy = 0.384145, outside = 0.649005, offers = 0.091107, false_change = 0.049992, coverage = 0.777778, covered_accuracy = 0.393519, accepted_changes = 1040, violations = 0, trajectories = 486 |
| `test / logistic/closed / delta_vs_taxa` | gain = 0.015604, ci95 = [-0.006174268404206674, 0.037837219935985364] |
| `test / logistic/closed / delta_vs_bkt_atual` | gain = -0.041038, ci95 = [-0.06475908779149521, -0.015827903520804782] |
| `test / 3pl/fixed / taxa` | accuracy = 0.345679, outside = 0.597165, offers = 0.067444, false_change = 0.038923, coverage = 0.555556, covered_accuracy = 0.355556, accepted_changes = 0, violations = 0, trajectories = 486 |
| `test / 3pl/fixed / bkt_atual` | accuracy = 0.352481, outside = 0.591392, offers = 0.091335, false_change = 0.053669, coverage = 0.555556, covered_accuracy = 0.367798, accepted_changes = 0, violations = 0, trajectories = 486 |
| `test / 3pl/fixed / (12, 4, 2)` | accuracy = 0.361968, outside = 0.576475, offers = 0.106824, false_change = 0.060528, coverage = 0.777778, covered_accuracy = 0.370150, accepted_changes = 0, violations = 0, trajectories = 486 |
| `test / 3pl/fixed / delta_vs_taxa` | gain = 0.016289, ci95 = [0.01102966392318244, 0.021606367169638766] |
| `test / 3pl/fixed / delta_vs_bkt_atual` | gain = 0.009488, ci95 = [0.004000914494741656, 0.015775034293552814] |
| `test / 3pl/closed / taxa` | accuracy = 0.358653, outside = 0.586877, offers = 0.046811, false_change = 0.023490, coverage = 0.555556, covered_accuracy = 0.386831, accepted_changes = 541, violations = 0, trajectories = 486 |
| `test / 3pl/closed / bkt_atual` | accuracy = 0.414895, outside = 0.538523, offers = 0.073045, false_change = 0.041108, coverage = 0.555556, covered_accuracy = 0.484053, accepted_changes = 845, violations = 0, trajectories = 486 |
| `test / 3pl/closed / (12, 4, 2)` | accuracy = 0.405350, outside = 0.525320, offers = 0.084705, false_change = 0.042723, coverage = 0.777778, covered_accuracy = 0.422031, accepted_changes = 961, violations = 0, trajectories = 486 |
| `test / 3pl/closed / delta_vs_taxa` | gain = 0.046696, ci95 = [0.02605738454503887, 0.06728395061728389] |
| `test / 3pl/closed / delta_vs_bkt_atual` | gain = -0.009545, ci95 = [-0.033493369913122996, 0.015603566529492453] |

## correcao_adaptativa/busca_margem.json

Arquivo integral · [busca_margem.json](evidencias/workspace/dificuldade-adaptativa/correcao_adaptativa/busca_margem.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `development_closed / bkt_politica_1_4_0.04 / 0` | accuracy = 0.528121, outside = 0.515889, offers = 0.270576, false_change = 0.147088, coverage = 0.777778, covered_accuracy = 0.575985, accepted_changes = 1586, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_1_4_0.04 / 1` | accuracy = 0.505144, outside = 0.451532, offers = 0.240512, false_change = 0.124298, coverage = 0.777778, covered_accuracy = 0.549089, accepted_changes = 1404, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_1_4_0.09 / 0` | accuracy = 0.512231, outside = 0.529150, offers = 0.209419, false_change = 0.098469, coverage = 0.777778, covered_accuracy = 0.554527, accepted_changes = 1218, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_1_4_0.09 / 1` | accuracy = 0.489712, outside = 0.467078, offers = 0.189415, false_change = 0.090281, coverage = 0.777778, covered_accuracy = 0.528660, accepted_changes = 1110, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_1_4_0.14 / 0` | accuracy = 0.450046, outside = 0.594422, offers = 0.136260, false_change = 0.064611, coverage = 0.777778, covered_accuracy = 0.477219, accepted_changes = 796, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_1_4_0.14 / 1` | accuracy = 0.411637, outside = 0.539666, offers = 0.110311, false_change = 0.055849, coverage = 0.777778, covered_accuracy = 0.429747, accepted_changes = 659, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_1_4_0.19 / 0` | accuracy = 0.438615, outside = 0.598194, offers = 0.059899, false_change = 0.010992, coverage = 0.777778, covered_accuracy = 0.463110, accepted_changes = 353, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_1_4_0.19 / 1` | accuracy = 0.400777, outside = 0.518747, offers = 0.046411, false_change = 0.005314, coverage = 0.777778, covered_accuracy = 0.417402, accepted_changes = 272, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_1_6_0.04 / 0` | accuracy = 0.496571, outside = 0.540352, offers = 0.223137, false_change = 0.127230, coverage = 0.666667, covered_accuracy = 0.579904, accepted_changes = 1298, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_1_6_0.04 / 1` | accuracy = 0.484568, outside = 0.471994, offers = 0.197531, false_change = 0.111632, coverage = 0.666667, covered_accuracy = 0.563272, accepted_changes = 1107, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_1_6_0.09 / 0` | accuracy = 0.478852, outside = 0.554070, offers = 0.173525, false_change = 0.090663, coverage = 0.666667, covered_accuracy = 0.553669, accepted_changes = 981, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_1_6_0.09 / 1` | accuracy = 0.473137, outside = 0.480681, offers = 0.157636, false_change = 0.079131, coverage = 0.666667, covered_accuracy = 0.547497, accepted_changes = 888, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_1_6_0.14 / 0` | accuracy = 0.423297, outside = 0.612826, offers = 0.113626, false_change = 0.064776, coverage = 0.666667, covered_accuracy = 0.470336, accepted_changes = 665, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_1_6_0.14 / 1` | accuracy = 0.398491, outside = 0.548240, offers = 0.095107, false_change = 0.056786, coverage = 0.666667, covered_accuracy = 0.434499, accepted_changes = 553, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_1_6_0.19 / 0` | accuracy = 0.415066, outside = 0.615341, offers = 0.052469, false_change = 0.016667, coverage = 0.666667, covered_accuracy = 0.454390, accepted_changes = 306, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_1_6_0.19 / 1` | accuracy = 0.391404, outside = 0.532007, offers = 0.041381, false_change = 0.010668, coverage = 0.666667, covered_accuracy = 0.420267, accepted_changes = 229, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_2_4_0.04 / 0` | accuracy = 0.503201, outside = 0.530293, offers = 0.189186, false_change = 0.095901, coverage = 0.777778, covered_accuracy = 0.544680, accepted_changes = 1104, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_2_4_0.04 / 1` | accuracy = 0.485368, outside = 0.471651, offers = 0.167353, false_change = 0.085237, coverage = 0.777778, covered_accuracy = 0.524397, accepted_changes = 974, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_2_4_0.09 / 0` | accuracy = 0.479424, outside = 0.546754, offers = 0.153064, false_change = 0.070043, coverage = 0.777778, covered_accuracy = 0.513962, accepted_changes = 871, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_2_4_0.09 / 1` | accuracy = 0.462849, outside = 0.488797, offers = 0.135574, false_change = 0.064787, coverage = 0.777778, covered_accuracy = 0.495591, accepted_changes = 801, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_2_4_0.14 / 0` | accuracy = 0.427755, outside = 0.604824, offers = 0.105396, false_change = 0.053270, coverage = 0.777778, covered_accuracy = 0.449588, accepted_changes = 608, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_2_4_0.14 / 1` | accuracy = 0.391175, outside = 0.556470, offers = 0.083448, false_change = 0.043396, coverage = 0.777778, covered_accuracy = 0.404174, accepted_changes = 493, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_2_4_0.19 / 0` | accuracy = 0.417467, outside = 0.609854, offers = 0.046411, false_change = 0.011213, coverage = 0.777778, covered_accuracy = 0.437243, accepted_changes = 269, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_2_4_0.19 / 1` | accuracy = 0.387289, outside = 0.530178, offers = 0.034636, false_change = 0.005346, coverage = 0.777778, covered_accuracy = 0.400647, accepted_changes = 200, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_2_6_0.04 / 0` | accuracy = 0.484225, outside = 0.548011, offers = 0.155921, false_change = 0.087666, coverage = 0.666667, covered_accuracy = 0.559671, accepted_changes = 912, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_2_6_0.04 / 1` | accuracy = 0.477595, outside = 0.476909, offers = 0.136031, false_change = 0.075351, coverage = 0.666667, covered_accuracy = 0.549897, accepted_changes = 753, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_2_6_0.09 / 0` | accuracy = 0.465592, outside = 0.559785, offers = 0.128829, false_change = 0.068717, coverage = 0.666667, covered_accuracy = 0.532064, accepted_changes = 718, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_2_6_0.09 / 1` | accuracy = 0.462277, outside = 0.487654, offers = 0.113740, false_change = 0.056969, coverage = 0.666667, covered_accuracy = 0.528121, accepted_changes = 629, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_2_6_0.14 / 0` | accuracy = 0.414037, outside = 0.613969, offers = 0.088706, false_change = 0.052538, coverage = 0.666667, covered_accuracy = 0.454047, accepted_changes = 506, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_2_6_0.14 / 1` | accuracy = 0.388089, outside = 0.552469, offers = 0.071102, false_change = 0.040925, coverage = 0.666667, covered_accuracy = 0.416324, accepted_changes = 403, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_2_6_0.19 / 0` | accuracy = 0.409579, outside = 0.618084, offers = 0.041381, false_change = 0.014754, coverage = 0.666667, covered_accuracy = 0.444959, accepted_changes = 238, violations = 0, trajectories = 243 |
| `development_closed / bkt_politica_2_6_0.19 / 1` | accuracy = 0.393804, outside = 0.528349, offers = 0.030864, false_change = 0.007330, coverage = 0.666667, covered_accuracy = 0.422325, accepted_changes = 165, violations = 0, trajectories = 243 |
| `test / logistic/False / bkt_atual` | accuracy = 0.354310, outside = 0.660322, offers = 0.098137, false_change = 0.055213, coverage = 0.555556, covered_accuracy = 0.371091, accepted_changes = 0, violations = 0, trajectories = 486 |
| `test / logistic/False / bkt_politica_anterior` | accuracy = 0.419353, outside = 0.604024, offers = 0.233196, false_change = 0.141632, coverage = 0.666667, covered_accuracy = 0.462363, accepted_changes = 0, violations = 0, trajectories = 486 |
| `test / logistic/False / bkt_politica_1_4_0.09` | accuracy = 0.511203, outside = 0.532407, offers = 0.415466, false_change = 0.229595, coverage = 0.777778, covered_accuracy = 0.562022, accepted_changes = 0, violations = 0, trajectories = 486 |
| `test / logistic/False / vs_bkt_atual` | gain = 0.156893, ci95 = [0.13265603566529494, 0.1805569844535894] |
| `test / logistic/False / vs_bkt_politica_anterior` | gain = 0.091850, ci95 = [0.07795924782807499, 0.1057384545038866] |
| `test / logistic/True / bkt_atual` | accuracy = 0.416267, outside = 0.593221, offers = 0.084476, false_change = 0.046078, coverage = 0.555556, covered_accuracy = 0.484568, accepted_changes = 955, violations = 0, trajectories = 486 |
| `test / logistic/True / bkt_politica_anterior` | accuracy = 0.480281, outside = 0.547840, offers = 0.177183, false_change = 0.101389, coverage = 0.666667, covered_accuracy = 0.554955, accepted_changes = 2038, violations = 0, trajectories = 486 |
| `test / logistic/True / bkt_politica_1_4_0.09` | accuracy = 0.505316, outside = 0.536923, offers = 0.208219, false_change = 0.099362, coverage = 0.777778, covered_accuracy = 0.547105, accepted_changes = 2354, violations = 0, trajectories = 486 |
| `test / logistic/True / vs_bkt_atual` | gain = 0.089049, ci95 = [0.0713277320530407, 0.10660008001828988] |
| `test / logistic/True / vs_bkt_politica_anterior` | gain = 0.025034, ci95 = [0.012631458619112941, 0.03703989483310469] |
| `test / 3pl/False / bkt_atual` | accuracy = 0.352080, outside = 0.591392, offers = 0.093850, false_change = 0.056756, coverage = 0.555556, covered_accuracy = 0.367078, accepted_changes = 0, violations = 0, trajectories = 486 |
| `test / 3pl/False / bkt_politica_anterior` | accuracy = 0.401292, outside = 0.542810, offers = 0.223308, false_change = 0.138889, coverage = 0.666667, covered_accuracy = 0.435271, accepted_changes = 0, violations = 0, trajectories = 486 |
| `test / 3pl/False / bkt_politica_1_4_0.09` | accuracy = 0.475080, outside = 0.472508, offers = 0.391232, false_change = 0.224280, coverage = 0.777778, covered_accuracy = 0.515579, accepted_changes = 0, violations = 0, trajectories = 486 |
| `test / 3pl/False / vs_bkt_atual` | gain = 0.123000, ci95 = [0.10087734339277549, 0.143924325560128] |
| `test / 3pl/False / vs_bkt_politica_anterior` | gain = 0.073788, ci95 = [0.06109967992684043, 0.08630687014174668] |
| `test / 3pl/True / bkt_atual` | accuracy = 0.416724, outside = 0.537037, offers = 0.075617, false_change = 0.042861, coverage = 0.555556, covered_accuracy = 0.485185, accepted_changes = 847, violations = 0, trajectories = 486 |
| `test / 3pl/True / bkt_politica_anterior` | accuracy = 0.466792, outside = 0.485139, offers = 0.158493, false_change = 0.091822, coverage = 0.666667, covered_accuracy = 0.536351, accepted_changes = 1814, violations = 0, trajectories = 486 |
| `test / 3pl/True / bkt_politica_1_4_0.09` | accuracy = 0.489026, outside = 0.470222, offers = 0.192101, false_change = 0.098810, coverage = 0.777778, covered_accuracy = 0.528513, accepted_changes = 2175, violations = 0, trajectories = 486 |
| `test / 3pl/True / vs_bkt_atual` | gain = 0.072302, ci95 = [0.05532264517604023, 0.08916323731138545] |
| `test / 3pl/True / vs_bkt_politica_anterior` | gain = 0.022234, ci95 = [0.010459533607681756, 0.03355052583447646] |

## correcao_adaptativa/busca_politica.json

Arquivo integral · [busca_politica.json](evidencias/workspace/dificuldade-adaptativa/correcao_adaptativa/busca_politica.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `validation / logistic/False / bkt_politica_2_6_1` | accuracy = 0.379715, outside = 0.643004, offers = 0.238340, false_change = 0.144290, coverage = 0.666667, covered_accuracy = 0.402906, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic/False / bkt_politica_2_6_2` | accuracy = 0.421125, outside = 0.608796, offers = 0.238340, false_change = 0.144290, coverage = 0.666667, covered_accuracy = 0.465021, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic/False / bkt_politica_2_8_1` | accuracy = 0.376457, outside = 0.644633, offers = 0.198560, false_change = 0.111626, coverage = 0.555556, covered_accuracy = 0.410957, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic/False / bkt_politica_2_8_2` | accuracy = 0.412980, outside = 0.615312, offers = 0.198560, false_change = 0.111626, coverage = 0.555556, covered_accuracy = 0.476698, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic/False / bkt_politica_2_10_1` | accuracy = 0.373285, outside = 0.647034, offers = 0.158350, false_change = 0.080247, coverage = 0.444444, covered_accuracy = 0.423225, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic/False / bkt_politica_2_10_2` | accuracy = 0.405607, outside = 0.620885, offers = 0.158350, false_change = 0.080247, coverage = 0.444444, covered_accuracy = 0.495949, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic/False / bkt_politica_4_6_1` | accuracy = 0.360854, outside = 0.656550, offers = 0.142404, false_change = 0.086163, coverage = 0.666667, covered_accuracy = 0.374614, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic/False / bkt_politica_4_6_2` | accuracy = 0.385888, outside = 0.636403, offers = 0.142404, false_change = 0.086163, coverage = 0.666667, covered_accuracy = 0.412166, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic/False / bkt_politica_4_8_1` | accuracy = 0.355710, outside = 0.659808, offers = 0.108110, false_change = 0.064300, coverage = 0.555556, covered_accuracy = 0.373611, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic/False / bkt_politica_4_8_2` | accuracy = 0.373028, outside = 0.645490, offers = 0.108110, false_change = 0.064300, coverage = 0.555556, covered_accuracy = 0.404784, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic/False / bkt_politica_4_10_1` | accuracy = 0.357510, outside = 0.658093, offers = 0.100823, false_change = 0.052212, coverage = 0.444444, covered_accuracy = 0.387731, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic/False / bkt_politica_4_10_2` | accuracy = 0.377658, outside = 0.642833, offers = 0.100823, false_change = 0.052212, coverage = 0.444444, covered_accuracy = 0.433063, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic/False / bkt_politica_6_6_1` | accuracy = 0.348680, outside = 0.666409, offers = 0.091392, false_change = 0.061214, coverage = 0.666667, covered_accuracy = 0.356353, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic/False / bkt_politica_6_6_2` | accuracy = 0.360511, outside = 0.654835, offers = 0.091392, false_change = 0.061214, coverage = 0.666667, covered_accuracy = 0.374100, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic/False / bkt_politica_6_8_1` | accuracy = 0.349280, outside = 0.664180, offers = 0.088306, false_change = 0.055813, coverage = 0.555556, covered_accuracy = 0.362037, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic/False / bkt_politica_6_8_2` | accuracy = 0.363512, outside = 0.653121, offers = 0.088306, false_change = 0.055813, coverage = 0.555556, covered_accuracy = 0.387654, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic/False / bkt_politica_6_10_1` | accuracy = 0.351595, outside = 0.663066, offers = 0.081019, false_change = 0.042953, coverage = 0.444444, covered_accuracy = 0.374421, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic/False / bkt_politica_6_10_2` | accuracy = 0.367884, outside = 0.650720, offers = 0.081019, false_change = 0.042953, coverage = 0.444444, covered_accuracy = 0.411073, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / logistic/True / bkt_politica_2_6_1` | accuracy = 0.469222, outside = 0.556156, offers = 0.181756, false_change = 0.101398, coverage = 0.666667, covered_accuracy = 0.538452, accepted_changes = 1374, violations = 0, trajectories = 324 |
| `validation / logistic/True / bkt_politica_2_6_2` | accuracy = 0.489626, outside = 0.548611, offers = 0.176355, false_change = 0.100249, coverage = 0.666667, covered_accuracy = 0.569316, accepted_changes = 1358, violations = 0, trajectories = 324 |
| `validation / logistic/True / bkt_politica_2_8_1` | accuracy = 0.469736, outside = 0.558213, offers = 0.143433, false_change = 0.084710, coverage = 0.555556, covered_accuracy = 0.575309, accepted_changes = 1058, violations = 0, trajectories = 324 |
| `validation / logistic/True / bkt_politica_2_8_2` | accuracy = 0.483968, outside = 0.552040, offers = 0.137088, false_change = 0.081332, coverage = 0.555556, covered_accuracy = 0.599537, accepted_changes = 1037, violations = 0, trajectories = 324 |
| `validation / logistic/True / bkt_politica_2_10_1` | accuracy = 0.461763, outside = 0.566872, offers = 0.106996, false_change = 0.060164, coverage = 0.444444, covered_accuracy = 0.595872, accepted_changes = 800, violations = 0, trajectories = 324 |
| `validation / logistic/True / bkt_politica_2_10_2` | accuracy = 0.478481, outside = 0.557785, offers = 0.100823, false_change = 0.057067, coverage = 0.444444, covered_accuracy = 0.629051, accepted_changes = 763, violations = 0, trajectories = 324 |
| `validation / logistic/True / bkt_politica_4_6_1` | accuracy = 0.437157, outside = 0.582990, offers = 0.124057, false_change = 0.068408, coverage = 0.666667, covered_accuracy = 0.491512, accepted_changes = 935, violations = 0, trajectories = 324 |
| `validation / logistic/True / bkt_politica_4_6_2` | accuracy = 0.465106, outside = 0.567301, offers = 0.119256, false_change = 0.066916, coverage = 0.666667, covered_accuracy = 0.532665, accepted_changes = 908, violations = 0, trajectories = 324 |
| `validation / logistic/True / bkt_politica_4_8_1` | accuracy = 0.439386, outside = 0.582819, offers = 0.096622, false_change = 0.055907, coverage = 0.555556, covered_accuracy = 0.522377, accepted_changes = 723, violations = 0, trajectories = 324 |
| `validation / logistic/True / bkt_politica_4_8_2` | accuracy = 0.456190, outside = 0.572188, offers = 0.092678, false_change = 0.052267, coverage = 0.555556, covered_accuracy = 0.550617, accepted_changes = 701, violations = 0, trajectories = 324 |
| `validation / logistic/True / bkt_politica_4_10_1` | accuracy = 0.421296, outside = 0.599537, offers = 0.084877, false_change = 0.045950, coverage = 0.444444, covered_accuracy = 0.521412, accepted_changes = 637, violations = 0, trajectories = 324 |
| `validation / logistic/True / bkt_politica_4_10_2` | accuracy = 0.449160, outside = 0.579990, offers = 0.079475, false_change = 0.044467, coverage = 0.444444, covered_accuracy = 0.573495, accepted_changes = 601, violations = 0, trajectories = 324 |
| `validation / logistic/True / bkt_politica_6_6_1` | accuracy = 0.411866, outside = 0.608711, offers = 0.088563, false_change = 0.048647, coverage = 0.666667, covered_accuracy = 0.453575, accepted_changes = 680, violations = 0, trajectories = 324 |
| `validation / logistic/True / bkt_politica_6_6_2` | accuracy = 0.446674, outside = 0.579733, offers = 0.086163, false_change = 0.047225, coverage = 0.666667, covered_accuracy = 0.505015, accepted_changes = 660, violations = 0, trajectories = 324 |
| `validation / logistic/True / bkt_politica_6_8_1` | accuracy = 0.410065, outside = 0.605796, offers = 0.083762, false_change = 0.049030, coverage = 0.555556, covered_accuracy = 0.473920, accepted_changes = 628, violations = 0, trajectories = 324 |
| `validation / logistic/True / bkt_politica_6_8_2` | accuracy = 0.434071, outside = 0.592164, offers = 0.080761, false_change = 0.047164, coverage = 0.555556, covered_accuracy = 0.514352, accepted_changes = 603, violations = 0, trajectories = 324 |
| `validation / logistic/True / bkt_politica_6_10_1` | accuracy = 0.403635, outside = 0.614455, offers = 0.071674, false_change = 0.037594, coverage = 0.444444, covered_accuracy = 0.485918, accepted_changes = 530, violations = 0, trajectories = 324 |
| `validation / logistic/True / bkt_politica_6_10_2` | accuracy = 0.429955, outside = 0.594222, offers = 0.069102, false_change = 0.038953, coverage = 0.444444, covered_accuracy = 0.537616, accepted_changes = 514, violations = 0, trajectories = 324 |
| `validation / 3pl/False / bkt_politica_2_6_1` | accuracy = 0.376800, outside = 0.571588, offers = 0.226080, false_change = 0.138117, coverage = 0.666667, covered_accuracy = 0.398534, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl/False / bkt_politica_2_6_2` | accuracy = 0.409294, outside = 0.535322, offers = 0.226080, false_change = 0.138117, coverage = 0.666667, covered_accuracy = 0.447274, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl/False / bkt_politica_2_8_1` | accuracy = 0.372771, outside = 0.574846, offers = 0.189129, false_change = 0.110082, coverage = 0.555556, covered_accuracy = 0.404321, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl/False / bkt_politica_2_8_2` | accuracy = 0.401663, outside = 0.542353, offers = 0.189129, false_change = 0.110082, coverage = 0.555556, covered_accuracy = 0.456327, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl/False / bkt_politica_2_10_1` | accuracy = 0.367627, outside = 0.577418, offers = 0.150634, false_change = 0.080761, coverage = 0.444444, covered_accuracy = 0.410494, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl/False / bkt_politica_2_10_2` | accuracy = 0.393947, outside = 0.548268, offers = 0.150634, false_change = 0.080761, coverage = 0.444444, covered_accuracy = 0.469715, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl/False / bkt_politica_4_6_1` | accuracy = 0.358368, outside = 0.585820, offers = 0.134774, false_change = 0.082819, coverage = 0.666667, covered_accuracy = 0.370885, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl/False / bkt_politica_4_6_2` | accuracy = 0.377829, outside = 0.564643, offers = 0.134774, false_change = 0.082819, coverage = 0.666667, covered_accuracy = 0.400077, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl/False / bkt_politica_4_8_1` | accuracy = 0.354167, outside = 0.590621, offers = 0.104167, false_change = 0.065072, coverage = 0.555556, covered_accuracy = 0.370833, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl/False / bkt_politica_4_8_2` | accuracy = 0.367370, outside = 0.575274, offers = 0.104167, false_change = 0.065072, coverage = 0.555556, covered_accuracy = 0.394599, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl/False / bkt_politica_4_10_1` | accuracy = 0.353909, outside = 0.588992, offers = 0.095936, false_change = 0.052984, coverage = 0.444444, covered_accuracy = 0.379630, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl/False / bkt_politica_4_10_2` | accuracy = 0.370027, outside = 0.571245, offers = 0.095936, false_change = 0.052984, coverage = 0.444444, covered_accuracy = 0.415895, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl/False / bkt_politica_6_6_1` | accuracy = 0.348080, outside = 0.594993, offers = 0.087449, false_change = 0.058128, coverage = 0.666667, covered_accuracy = 0.355453, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl/False / bkt_politica_6_6_2` | accuracy = 0.357853, outside = 0.584276, offers = 0.087449, false_change = 0.058128, coverage = 0.666667, covered_accuracy = 0.370113, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl/False / bkt_politica_6_8_1` | accuracy = 0.350051, outside = 0.593364, offers = 0.084105, false_change = 0.052984, coverage = 0.555556, covered_accuracy = 0.363426, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl/False / bkt_politica_6_8_2` | accuracy = 0.360168, outside = 0.581619, offers = 0.084105, false_change = 0.052984, coverage = 0.555556, covered_accuracy = 0.381636, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl/False / bkt_politica_6_10_1` | accuracy = 0.349966, outside = 0.591992, offers = 0.077675, false_change = 0.042438, coverage = 0.444444, covered_accuracy = 0.370756, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl/False / bkt_politica_6_10_2` | accuracy = 0.363254, outside = 0.577503, offers = 0.077675, false_change = 0.042438, coverage = 0.444444, covered_accuracy = 0.400656, accepted_changes = 0, violations = 0, trajectories = 324 |
| `validation / 3pl/True / bkt_politica_2_6_1` | accuracy = 0.452332, outside = 0.504458, offers = 0.168296, false_change = 0.093642, coverage = 0.666667, covered_accuracy = 0.514789, accepted_changes = 1268, violations = 0, trajectories = 324 |
| `validation / 3pl/True / bkt_politica_2_6_2` | accuracy = 0.464249, outside = 0.490055, offers = 0.164781, false_change = 0.091019, coverage = 0.666667, covered_accuracy = 0.532279, accepted_changes = 1257, violations = 0, trajectories = 324 |
| `validation / 3pl/True / bkt_politica_2_8_1` | accuracy = 0.449760, outside = 0.504630, offers = 0.134259, false_change = 0.076675, coverage = 0.555556, covered_accuracy = 0.543056, accepted_changes = 980, violations = 0, trajectories = 324 |
| `validation / 3pl/True / bkt_politica_2_8_2` | accuracy = 0.463649, outside = 0.488769, offers = 0.130144, false_change = 0.075154, coverage = 0.555556, covered_accuracy = 0.566049, accepted_changes = 968, violations = 0, trajectories = 324 |
| `validation / 3pl/True / bkt_politica_2_10_1` | accuracy = 0.453361, outside = 0.497085, offers = 0.097822, false_change = 0.053508, coverage = 0.444444, covered_accuracy = 0.580826, accepted_changes = 744, violations = 0, trajectories = 324 |
| `validation / 3pl/True / bkt_politica_2_10_2` | accuracy = 0.465449, outside = 0.482596, offers = 0.092421, false_change = 0.050697, coverage = 0.444444, covered_accuracy = 0.602623, accepted_changes = 709, violations = 0, trajectories = 324 |
| `validation / 3pl/True / bkt_politica_4_6_1` | accuracy = 0.424297, outside = 0.531807, offers = 0.113254, false_change = 0.059778, coverage = 0.666667, covered_accuracy = 0.473251, accepted_changes = 853, violations = 0, trajectories = 324 |
| `validation / 3pl/True / bkt_politica_4_6_2` | accuracy = 0.442987, outside = 0.510888, offers = 0.110940, false_change = 0.058140, coverage = 0.666667, covered_accuracy = 0.500643, accepted_changes = 839, violations = 0, trajectories = 324 |
| `validation / 3pl/True / bkt_politica_4_8_1` | accuracy = 0.421982, outside = 0.534979, offers = 0.089678, false_change = 0.053727, coverage = 0.555556, covered_accuracy = 0.494290, accepted_changes = 669, violations = 0, trajectories = 324 |
| `validation / 3pl/True / bkt_politica_4_8_2` | accuracy = 0.433899, outside = 0.519890, offers = 0.086334, false_change = 0.051181, coverage = 0.555556, covered_accuracy = 0.513580, accepted_changes = 637, violations = 0, trajectories = 324 |
| `validation / 3pl/True / bkt_politica_4_10_1` | accuracy = 0.417867, outside = 0.530007, offers = 0.078961, false_change = 0.041926, coverage = 0.444444, covered_accuracy = 0.515046, accepted_changes = 592, violations = 0, trajectories = 324 |
| `validation / 3pl/True / bkt_politica_4_10_2` | accuracy = 0.436300, outside = 0.508402, offers = 0.074760, false_change = 0.039504, coverage = 0.444444, covered_accuracy = 0.548997, accepted_changes = 560, violations = 0, trajectories = 324 |
| `validation / 3pl/True / bkt_politica_6_6_1` | accuracy = 0.403206, outside = 0.553841, offers = 0.083848, false_change = 0.047270, coverage = 0.666667, covered_accuracy = 0.441615, accepted_changes = 638, violations = 0, trajectories = 324 |
| `validation / 3pl/True / bkt_politica_6_6_2` | accuracy = 0.430641, outside = 0.524434, offers = 0.081619, false_change = 0.044496, coverage = 0.666667, covered_accuracy = 0.482124, accepted_changes = 628, violations = 0, trajectories = 324 |
| `validation / 3pl/True / bkt_politica_6_8_1` | accuracy = 0.398320, outside = 0.559671, offers = 0.077846, false_change = 0.046433, coverage = 0.555556, covered_accuracy = 0.455401, accepted_changes = 577, violations = 0, trajectories = 324 |
| `validation / 3pl/True / bkt_politica_6_8_2` | accuracy = 0.417781, outside = 0.537723, offers = 0.075960, false_change = 0.045767, coverage = 0.555556, covered_accuracy = 0.487809, accepted_changes = 559, violations = 0, trajectories = 324 |
| `validation / 3pl/True / bkt_politica_6_10_1` | accuracy = 0.395576, outside = 0.554012, offers = 0.068587, false_change = 0.035329, coverage = 0.444444, covered_accuracy = 0.470486, accepted_changes = 508, violations = 0, trajectories = 324 |
| `validation / 3pl/True / bkt_politica_6_10_2` | accuracy = 0.418896, outside = 0.526749, offers = 0.065672, false_change = 0.034697, coverage = 0.444444, covered_accuracy = 0.515818, accepted_changes = 488, violations = 0, trajectories = 324 |
| `test / logistic/fixed / bkt_atual` | accuracy = 0.353338, outside = 0.660722, offers = 0.100194, false_change = 0.057442, coverage = 0.555556, covered_accuracy = 0.369342, accepted_changes = 0, violations = 0, trajectories = 486 |
| `test / logistic/fixed / taxa` | accuracy = 0.341964, outside = 0.667810, offers = 0.076875, false_change = 0.050412, coverage = 0.555556, covered_accuracy = 0.348868, accepted_changes = 0, violations = 0, trajectories = 486 |
| `test / logistic/fixed / bkt_politica_2_6_2` | accuracy = 0.417981, outside = 0.607339, offers = 0.238054, false_change = 0.147462, coverage = 0.666667, covered_accuracy = 0.460305, accepted_changes = 0, violations = 0, trajectories = 486 |
| `test / logistic/fixed / vs_bkt_atual` | gain = 0.064643, ci95 = [0.05315500685871056, 0.07590306355738453] |
| `test / logistic/fixed / vs_taxa` | gain = 0.076017, ci95 = [0.06389889117512573, 0.08847736625514402] |
| `test / logistic/closed / bkt_atual` | accuracy = 0.426155, outside = 0.591449, offers = 0.078589, false_change = 0.043234, coverage = 0.555556, covered_accuracy = 0.501749, accepted_changes = 931, violations = 0, trajectories = 486 |
| `test / logistic/closed / taxa` | accuracy = 0.375343, outside = 0.626829, offers = 0.050812, false_change = 0.026200, coverage = 0.555556, covered_accuracy = 0.413889, accepted_changes = 581, violations = 0, trajectories = 486 |
| `test / logistic/closed / bkt_politica_2_6_2` | accuracy = 0.473422, outside = 0.550526, offers = 0.172439, false_change = 0.096483, coverage = 0.666667, covered_accuracy = 0.545267, accepted_changes = 1957, violations = 0, trajectories = 486 |
| `test / logistic/closed / vs_bkt_atual` | gain = 0.047268, ci95 = [0.03309327846364883, 0.06104395290352079] |
| `test / logistic/closed / vs_taxa` | gain = 0.098080, ci95 = [0.08076131687242798, 0.11482910379515315] |
| `test / 3pl/fixed / bkt_atual` | accuracy = 0.351623, outside = 0.592593, offers = 0.094536, false_change = 0.057099, coverage = 0.555556, covered_accuracy = 0.366255, accepted_changes = 0, violations = 0, trajectories = 486 |
| `test / 3pl/fixed / taxa` | accuracy = 0.345050, outside = 0.597622, offers = 0.069216, false_change = 0.040981, coverage = 0.555556, covered_accuracy = 0.354424, accepted_changes = 0, violations = 0, trajectories = 486 |
| `test / 3pl/fixed / bkt_politica_2_6_2` | accuracy = 0.404492, outside = 0.542181, offers = 0.223765, false_change = 0.139232, coverage = 0.666667, covered_accuracy = 0.440072, accepted_changes = 0, violations = 0, trajectories = 486 |
| `test / 3pl/fixed / vs_bkt_atual` | gain = 0.052869, ci95 = [0.04229252400548697, 0.06321587791495198] |
| `test / 3pl/fixed / vs_taxa` | gain = 0.059442, ci95 = [0.04760945358939186, 0.07087477137631457] |
| `test / 3pl/closed / bkt_atual` | accuracy = 0.415466, outside = 0.541381, offers = 0.071788, false_change = 0.039615, coverage = 0.555556, covered_accuracy = 0.484979, accepted_changes = 827, violations = 0, trajectories = 486 |
| `test / 3pl/closed / taxa` | accuracy = 0.368827, outside = 0.577789, offers = 0.046696, false_change = 0.022461, coverage = 0.555556, covered_accuracy = 0.404630, accepted_changes = 538, violations = 0, trajectories = 486 |
| `test / 3pl/closed / bkt_politica_2_6_2` | accuracy = 0.460963, outside = 0.491427, offers = 0.151177, false_change = 0.084834, coverage = 0.666667, covered_accuracy = 0.528635, accepted_changes = 1718, violations = 0, trajectories = 486 |
| `test / 3pl/closed / vs_bkt_atual` | gain = 0.045496, ci95 = [0.03206304298125286, 0.05841335162322816] |
| `test / 3pl/closed / vs_taxa` | gain = 0.092135, ci95 = [0.07475851623228165, 0.10819615912208504] |

## correcao_adaptativa/reais.json

Arquivo integral · [reais.json](evidencias/workspace/dificuldade-adaptativa/correcao_adaptativa/reais.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `results / bkt_item` | auc = 0.628856, accuracy = 0.717346, f1 = 0.822978, log_loss = 0.582686, brier = 0.196917, ece = 0.037826 |
| `results / elo_item` | auc = 0.621335, accuracy = 0.677621, f1 = 0.778064, log_loss = 0.628834, brier = 0.218995, ece = 0.138964 |
| `results / rasch` | auc = 0.628928, accuracy = 0.682820, f1 = 0.780733, log_loss = 0.624391, brier = 0.216814, ece = 0.135371 |
| `results / hibrido_item` | auc = 0.631929, accuracy = 0.710691, f1 = 0.812103, log_loss = 0.592289, brier = 0.201796, ece = 0.073420 |
| `results / constante` | auc = 0.500000, accuracy = 0.707571, f1 = 0.828745, log_loss = 0.610437, brier = 0.209607, ece = 0.051891 |
| `results / sgd_congelado` | auc = 0.639600, accuracy = 0.716098, f1 = 0.823803, log_loss = 0.579656, brier = 0.195982, ece = 0.044206 |
| `results / sgd_selecionado` | auc = 0.634436, accuracy = 0.720258, f1 = 0.827409, log_loss = 0.580012, brier = 0.196115, ece = 0.039706 |
| `updates / 0 / incumbent_gate` | auc = 0.701754, accuracy = 0.712493, f1 = 0.814091, log_loss = 0.580608, brier = 0.196859, ece = 0.043832 |
| `updates / 0 / candidate_gate` | auc = 0.705006, accuracy = 0.712778, f1 = 0.817075, log_loss = 0.577311, brier = 0.195757, ece = 0.043791 |
| `updates / 1 / incumbent_gate` | auc = 0.702499, accuracy = 0.652918, f1 = 0.759946, log_loss = 0.630558, brier = 0.220051, ece = 0.075140 |
| `updates / 1 / candidate_gate` | auc = 0.708004, accuracy = 0.664983, f1 = 0.763564, log_loss = 0.623677, brier = 0.216868, ece = 0.064217 |

## correcao_adaptativa/refinamento.json

Arquivo integral · [refinamento.json](evidencias/workspace/dificuldade-adaptativa/correcao_adaptativa/refinamento.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `development / logistic/False / bkt_atual` | accuracy = 0.356196, outside = 0.659236, offers = 0.097965, false_change = 0.050412, coverage = 0.555556, covered_accuracy = 0.374486, accepted_changes = 0, violations = 0, trajectories = 243, offer_precision = 0.404901, no_offer_rate = 0.902035, student_coverage = 0.958848, offer_count = 857, direction_reversals = 33 |
| `development / logistic/False / bkt_politica_margem` | accuracy = 0.526520, outside = 0.521605, offers = 0.419982, false_change = 0.202332, coverage = 0.777778, covered_accuracy = 0.581717, accepted_changes = 0, violations = 0, trajectories = 243, offer_precision = 0.620577, no_offer_rate = 0.580018, student_coverage = 0.975309, offer_count = 3674, direction_reversals = 29 |
| `development / logistic/False / bkt_politica_conservadora` | accuracy = 0.411065, outside = 0.614883, offers = 0.162323, false_change = 0.071674, coverage = 0.555556, covered_accuracy = 0.473251, accepted_changes = 0, violations = 0, trajectories = 243, offer_precision = 0.626056, no_offer_rate = 0.837677, student_coverage = 0.938272, offer_count = 1420, direction_reversals = 19 |
| `development / logistic/False / bkt_politica_incerteza` | accuracy = 0.437700, outside = 0.604138, offers = 0.213649, false_change = 0.092593, coverage = 0.777778, covered_accuracy = 0.467519, accepted_changes = 0, violations = 0, trajectories = 243, offer_precision = 0.632959, no_offer_rate = 0.786351, student_coverage = 0.773663, offer_count = 1869, direction_reversals = 7 |
| `development / logistic/False / bkt_politica_incerteza_forte` | accuracy = 0.434156, outside = 0.607339, offers = 0.198331, false_change = 0.079218, coverage = 0.777778, covered_accuracy = 0.462963, accepted_changes = 0, violations = 0, trajectories = 243, offer_precision = 0.641499, no_offer_rate = 0.801669, student_coverage = 0.646091, offer_count = 1735, direction_reversals = 7 |
| `development / logistic/False / bkt_politica_histerese` | accuracy = 0.524234, outside = 0.522977, offers = 0.413009, false_change = 0.196502, coverage = 0.777778, covered_accuracy = 0.578777, accepted_changes = 0, violations = 0, trajectories = 243, offer_precision = 0.620814, no_offer_rate = 0.586991, student_coverage = 0.971193, offer_count = 3613, direction_reversals = 26 |
| `development / logistic/False / bkt_politica_hibrida` | accuracy = 0.435871, outside = 0.605167, offers = 0.208048, false_change = 0.087791, coverage = 0.777778, covered_accuracy = 0.465168, accepted_changes = 0, violations = 0, trajectories = 243, offer_precision = 0.633516, no_offer_rate = 0.791952, student_coverage = 0.765432, offer_count = 1820, direction_reversals = 7 |
| `development / logistic/False / bkt_politica_hibrida_2` | accuracy = 0.384431, outside = 0.641175, offers = 0.114769, false_change = 0.054527, coverage = 0.777778, covered_accuracy = 0.399030, accepted_changes = 0, violations = 0, trajectories = 243, offer_precision = 0.603586, no_offer_rate = 0.885231, student_coverage = 0.765432, offer_count = 1004, direction_reversals = 7 |
| `development / logistic/True / bkt_atual` | accuracy = 0.427526, outside = 0.582076, offers = 0.082533, false_change = 0.044444, coverage = 0.555556, covered_accuracy = 0.506173, accepted_changes = 475, violations = 0, trajectories = 243, offer_precision = 0.475069, no_offer_rate = 0.917467, student_coverage = 0.958848, offer_count = 722, direction_reversals = 100 |
| `development / logistic/True / bkt_politica_margem` | accuracy = 0.515089, outside = 0.533493, offers = 0.203132, false_change = 0.099588, coverage = 0.777778, covered_accuracy = 0.559083, accepted_changes = 1157, violations = 0, trajectories = 243, offer_precision = 0.566685, no_offer_rate = 0.796868, student_coverage = 0.975309, offer_count = 1777, direction_reversals = 168 |
| `development / logistic/True / bkt_politica_conservadora` | accuracy = 0.460791, outside = 0.563329, offers = 0.098537, false_change = 0.053050, coverage = 0.555556, covered_accuracy = 0.562346, accepted_changes = 558, violations = 0, trajectories = 243, offer_precision = 0.534803, no_offer_rate = 0.901463, student_coverage = 0.938272, offer_count = 862, direction_reversals = 100 |
| `development / logistic/True / bkt_politica_incerteza` | accuracy = 0.425697, outside = 0.618541, offers = 0.068016, false_change = 0.023550, coverage = 0.777778, covered_accuracy = 0.445914, accepted_changes = 388, violations = 0, trajectories = 243, offer_precision = 0.684034, no_offer_rate = 0.931984, student_coverage = 0.773663, offer_count = 595, direction_reversals = 28 |
| `development / logistic/True / bkt_politica_incerteza_forte` | accuracy = 0.418496, outside = 0.627572, offers = 0.050869, false_change = 0.015013, coverage = 0.777778, covered_accuracy = 0.437243, accepted_changes = 284, violations = 0, trajectories = 243, offer_precision = 0.707865, no_offer_rate = 0.949131, student_coverage = 0.646091, offer_count = 445, direction_reversals = 19 |
| `development / logistic/True / bkt_politica_histerese` | accuracy = 0.505716, outside = 0.543210, offers = 0.162551, false_change = 0.073796, coverage = 0.777778, covered_accuracy = 0.547472, accepted_changes = 924, violations = 0, trajectories = 243, offer_precision = 0.595640, no_offer_rate = 0.837449, student_coverage = 0.971193, offer_count = 1422, direction_reversals = 127 |
| `development / logistic/True / bkt_politica_hibrida` | accuracy = 0.423640, outside = 0.622657, offers = 0.062186, false_change = 0.021675, coverage = 0.777778, covered_accuracy = 0.443710, accepted_changes = 350, violations = 0, trajectories = 243, offer_precision = 0.672794, no_offer_rate = 0.937814, student_coverage = 0.765432, offer_count = 544, direction_reversals = 24 |
| `development / logistic/True / bkt_politica_hibrida_2` | accuracy = 0.408665, outside = 0.631344, offers = 0.052355, false_change = 0.020280, coverage = 0.777778, covered_accuracy = 0.425632, accepted_changes = 304, violations = 0, trajectories = 243, offer_precision = 0.633188, no_offer_rate = 0.947645, student_coverage = 0.765432, offer_count = 458, direction_reversals = 27 |
| `development / 3pl/False / bkt_atual` | accuracy = 0.353567, outside = 0.589963, offers = 0.092707, false_change = 0.053498, coverage = 0.555556, covered_accuracy = 0.369753, accepted_changes = 0, violations = 0, trajectories = 243, offer_precision = 0.410604, no_offer_rate = 0.907293, student_coverage = 0.930041, offer_count = 811, direction_reversals = 25 |
| `development / 3pl/False / bkt_politica_margem` | accuracy = 0.489712, outside = 0.456104, offers = 0.391175, false_change = 0.212620, coverage = 0.777778, covered_accuracy = 0.534392, accepted_changes = 0, violations = 0, trajectories = 243, offer_precision = 0.580947, no_offer_rate = 0.608825, student_coverage = 0.946502, offer_count = 3422, direction_reversals = 28 |
| `development / 3pl/False / bkt_politica_conservadora` | accuracy = 0.395519, outside = 0.546068, offers = 0.151235, false_change = 0.077160, coverage = 0.555556, covered_accuracy = 0.445267, accepted_changes = 0, violations = 0, trajectories = 243, offer_precision = 0.581255, no_offer_rate = 0.848765, student_coverage = 0.913580, offer_count = 1323, direction_reversals = 16 |
| `development / 3pl/False / bkt_politica_incerteza` | accuracy = 0.431070, outside = 0.492341, offers = 0.176269, false_change = 0.061728, coverage = 0.777778, covered_accuracy = 0.458995, accepted_changes = 0, violations = 0, trajectories = 243, offer_precision = 0.671206, no_offer_rate = 0.823731, student_coverage = 0.765432, offer_count = 1542, direction_reversals = 10 |
| `development / 3pl/False / bkt_politica_incerteza_forte` | accuracy = 0.423411, outside = 0.499428, offers = 0.159579, false_change = 0.054184, coverage = 0.777778, covered_accuracy = 0.449148, accepted_changes = 0, violations = 0, trajectories = 243, offer_precision = 0.677650, no_offer_rate = 0.840421, student_coverage = 0.576132, offer_count = 1396, direction_reversals = 10 |
| `development / 3pl/False / bkt_politica_histerese` | accuracy = 0.487083, outside = 0.459648, offers = 0.386145, false_change = 0.209191, coverage = 0.777778, covered_accuracy = 0.531011, accepted_changes = 0, violations = 0, trajectories = 243, offer_precision = 0.578745, no_offer_rate = 0.613855, student_coverage = 0.946502, offer_count = 3378, direction_reversals = 26 |
| `development / 3pl/False / bkt_politica_hibrida` | accuracy = 0.429127, outside = 0.495085, offers = 0.172154, false_change = 0.058642, coverage = 0.777778, covered_accuracy = 0.456496, accepted_changes = 0, violations = 0, trajectories = 243, offer_precision = 0.669987, no_offer_rate = 0.827846, student_coverage = 0.748971, offer_count = 1506, direction_reversals = 10 |
| `development / 3pl/False / bkt_politica_hibrida_2` | accuracy = 0.383288, outside = 0.548125, offers = 0.095908, false_change = 0.034294, coverage = 0.777778, covered_accuracy = 0.397560, accepted_changes = 0, violations = 0, trajectories = 243, offer_precision = 0.640048, no_offer_rate = 0.904092, student_coverage = 0.748971, offer_count = 839, direction_reversals = 10 |
| `development / 3pl/True / bkt_atual` | accuracy = 0.413123, outside = 0.539209, offers = 0.074188, false_change = 0.040290, coverage = 0.555556, covered_accuracy = 0.482716, accepted_changes = 426, violations = 0, trajectories = 243, offer_precision = 0.466872, no_offer_rate = 0.925812, student_coverage = 0.930041, offer_count = 649, direction_reversals = 90 |
| `development / 3pl/True / bkt_politica_margem` | accuracy = 0.487997, outside = 0.465135, offers = 0.189758, false_change = 0.096809, coverage = 0.777778, covered_accuracy = 0.526896, accepted_changes = 1062, violations = 0, trajectories = 243, offer_precision = 0.542771, no_offer_rate = 0.810242, student_coverage = 0.946502, offer_count = 1660, direction_reversals = 134 |
| `development / 3pl/True / bkt_politica_conservadora` | accuracy = 0.438843, outside = 0.504915, offers = 0.092250, false_change = 0.049017, coverage = 0.555556, covered_accuracy = 0.526337, accepted_changes = 518, violations = 0, trajectories = 243, offer_precision = 0.501859, no_offer_rate = 0.907750, student_coverage = 0.913580, offer_count = 807, direction_reversals = 98 |
| `development / 3pl/True / bkt_politica_incerteza` | accuracy = 0.428441, outside = 0.486168, offers = 0.070302, false_change = 0.016475, coverage = 0.777778, covered_accuracy = 0.452087, accepted_changes = 395, violations = 0, trajectories = 243, offer_precision = 0.658537, no_offer_rate = 0.929698, student_coverage = 0.765432, offer_count = 615, direction_reversals = 31 |
| `development / 3pl/True / bkt_politica_incerteza_forte` | accuracy = 0.412209, outside = 0.498285, offers = 0.050297, false_change = 0.006932, coverage = 0.777778, covered_accuracy = 0.431364, accepted_changes = 278, violations = 0, trajectories = 243, offer_precision = 0.706818, no_offer_rate = 0.949703, student_coverage = 0.576132, offer_count = 440, direction_reversals = 19 |
| `development / 3pl/True / bkt_politica_histerese` | accuracy = 0.473137, outside = 0.481939, offers = 0.151806, false_change = 0.068132, coverage = 0.777778, covered_accuracy = 0.508083, accepted_changes = 828, violations = 0, trajectories = 243, offer_precision = 0.562500, no_offer_rate = 0.848194, student_coverage = 0.946502, offer_count = 1328, direction_reversals = 110 |
| `development / 3pl/True / bkt_politica_hibrida` | accuracy = 0.421925, outside = 0.497599, offers = 0.063329, false_change = 0.013934, coverage = 0.777778, covered_accuracy = 0.443857, accepted_changes = 350, violations = 0, trajectories = 243, offer_precision = 0.658845, no_offer_rate = 0.936671, student_coverage = 0.748971, offer_count = 554, direction_reversals = 28 |
| `development / 3pl/True / bkt_politica_hibrida_2` | accuracy = 0.407293, outside = 0.514060, offers = 0.052698, false_change = 0.014449, coverage = 0.777778, covered_accuracy = 0.425926, accepted_changes = 300, violations = 0, trajectories = 243, offer_precision = 0.626898, no_offer_rate = 0.947302, student_coverage = 0.748971, offer_count = 461, direction_reversals = 31 |
| `test / logistic/False / bkt_atual` | accuracy = 0.354424, outside = 0.659236, offers = 0.099966, false_change = 0.057613, coverage = 0.555556, covered_accuracy = 0.371296, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.403087, no_offer_rate = 0.900034, student_coverage = 0.944444, offer_count = 1749, direction_reversals = 59, gain_ci95 = [-0.17901663237311385, -0.13088705989940558] |
| `test / logistic/False / bkt_politica_margem` | accuracy = 0.509717, outside = 0.534294, offers = 0.419239, false_change = 0.228909, coverage = 0.777778, covered_accuracy = 0.560112, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.602727, no_offer_rate = 0.580761, student_coverage = 0.960905, offer_count = 7335, direction_reversals = 56, gain_ci95 = [0.0, 0.0] |
| `test / logistic/False / bkt_politica_conservadora` | accuracy = 0.405979, outside = 0.616541, offers = 0.165181, false_change = 0.085905, coverage = 0.555556, covered_accuracy = 0.464095, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.613149, no_offer_rate = 0.834819, student_coverage = 0.932099, offer_count = 2890, direction_reversals = 35, gain_ci95 = [-0.11974737082761773, -0.08664694787379974] |
| `test / logistic/False / bkt_politica_incerteza` | accuracy = 0.431013, outside = 0.609396, offers = 0.202218, false_change = 0.093278, coverage = 0.777778, covered_accuracy = 0.458921, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.636800, no_offer_rate = 0.797782, student_coverage = 0.769547, offer_count = 3538, direction_reversals = 12, gain_ci95 = [-0.09813814586191129, -0.05767032464563329] |
| `test / logistic/False / bkt_politica_incerteza_forte` | accuracy = 0.427755, outside = 0.612883, offers = 0.187186, false_change = 0.079904, coverage = 0.777778, covered_accuracy = 0.454733, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.646718, no_offer_rate = 0.812814, student_coverage = 0.637860, offer_count = 3275, direction_reversals = 9, gain_ci95 = [-0.1019675925925926, -0.060413808870598995] |
| `test / logistic/False / bkt_politica_histerese` | accuracy = 0.506001, outside = 0.536294, offers = 0.411294, false_change = 0.223765, coverage = 0.777778, covered_accuracy = 0.555335, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.601167, no_offer_rate = 0.588706, student_coverage = 0.958848, offer_count = 7196, direction_reversals = 52, gain_ci95 = [-0.00542981252857796, -0.0019433013260173753] |
| `test / logistic/False / bkt_politica_hibrida` | accuracy = 0.428212, outside = 0.611054, offers = 0.196273, false_change = 0.089678, coverage = 0.777778, covered_accuracy = 0.455320, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.635702, no_offer_rate = 0.803727, student_coverage = 0.763374, offer_count = 3434, direction_reversals = 11, gain_ci95 = [-0.10088305898491085, -0.06041237997256516] |
| `test / logistic/False / bkt_politica_hibrida_2` | accuracy = 0.380430, outside = 0.643347, offers = 0.110311, false_change = 0.057785, coverage = 0.777778, covered_accuracy = 0.393886, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.601554, no_offer_rate = 0.889689, student_coverage = 0.763374, offer_count = 1930, direction_reversals = 11, gain_ci95 = [-0.1506644375857339, -0.10682298811156837] |
| `test / logistic/True / bkt_atual` | accuracy = 0.427069, outside = 0.580418, offers = 0.081619, false_change = 0.042508, coverage = 0.555556, covered_accuracy = 0.505658, accepted_changes = 957, violations = 0, trajectories = 486, offer_precision = 0.453081, no_offer_rate = 0.918381, student_coverage = 0.944444, offer_count = 1428, direction_reversals = 193, gain_ci95 = [-0.0937385688157293, -0.05698016689529038] |
| `test / logistic/True / bkt_politica_margem` | accuracy = 0.503429, outside = 0.533208, offers = 0.200160, false_change = 0.090218, coverage = 0.777778, covered_accuracy = 0.545782, accepted_changes = 2294, violations = 0, trajectories = 486, offer_precision = 0.568532, no_offer_rate = 0.799840, student_coverage = 0.960905, offer_count = 3502, direction_reversals = 288, gain_ci95 = [0.0, 0.0] |
| `test / logistic/True / bkt_politica_conservadora` | accuracy = 0.456047, outside = 0.564815, offers = 0.097051, false_change = 0.052491, coverage = 0.555556, covered_accuracy = 0.552778, accepted_changes = 1122, violations = 0, trajectories = 486, offer_precision = 0.531802, no_offer_rate = 0.902949, student_coverage = 0.932099, offer_count = 1698, direction_reversals = 204, gain_ci95 = [-0.06092821216278006, -0.03274605624142663] |
| `test / logistic/True / bkt_politica_incerteza` | accuracy = 0.406150, outside = 0.629572, offers = 0.062471, false_change = 0.024163, coverage = 0.777778, covered_accuracy = 0.421958, accepted_changes = 700, violations = 0, trajectories = 486, offer_precision = 0.663312, no_offer_rate = 0.937529, student_coverage = 0.769547, offer_count = 1093, direction_reversals = 70, gain_ci95 = [-0.11969593049839965, -0.07469707361682673] |
| `test / logistic/True / bkt_politica_incerteza_forte` | accuracy = 0.397691, outside = 0.639403, offers = 0.041895, false_change = 0.011029, coverage = 0.777778, covered_accuracy = 0.411523, accepted_changes = 477, violations = 0, trajectories = 486, offer_precision = 0.684857, no_offer_rate = 0.958105, student_coverage = 0.637860, offer_count = 733, direction_reversals = 33, gain_ci95 = [-0.13088848879743942, -0.08092564014631919] |
| `test / logistic/True / bkt_politica_histerese` | accuracy = 0.488169, outside = 0.547154, offers = 0.160894, false_change = 0.065982, coverage = 0.777778, covered_accuracy = 0.526382, accepted_changes = 1840, violations = 0, trajectories = 486, offer_precision = 0.580107, no_offer_rate = 0.839106, student_coverage = 0.958848, offer_count = 2815, direction_reversals = 233, gain_ci95 = [-0.021550640146319158, -0.008457647462277099] |
| `test / logistic/True / bkt_politica_hibrida` | accuracy = 0.401463, outside = 0.631516, offers = 0.054813, false_change = 0.019896, coverage = 0.777778, covered_accuracy = 0.416226, accepted_changes = 619, violations = 0, trajectories = 486, offer_precision = 0.646507, no_offer_rate = 0.945187, student_coverage = 0.763374, offer_count = 959, direction_reversals = 59, gain_ci95 = [-0.1256301440329218, -0.07864654778235025] |
| `test / logistic/True / bkt_politica_hibrida_2` | accuracy = 0.391232, outside = 0.634316, offers = 0.049954, false_change = 0.020636, coverage = 0.777778, covered_accuracy = 0.404541, accepted_changes = 563, violations = 0, trajectories = 486, offer_precision = 0.609840, no_offer_rate = 0.950046, student_coverage = 0.763374, offer_count = 874, direction_reversals = 58, gain_ci95 = [-0.1361582647462277, -0.08938614540466396] |
| `test / 3pl/False / bkt_atual` | accuracy = 0.353681, outside = 0.590821, offers = 0.093050, false_change = 0.054355, coverage = 0.555556, covered_accuracy = 0.369959, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.413391, no_offer_rate = 0.906950, student_coverage = 0.901235, offer_count = 1628, direction_reversals = 44, gain_ci95 = [-0.1473508230452675, -0.10236625514403293] |
| `test / 3pl/False / bkt_politica_margem` | accuracy = 0.479138, outside = 0.471422, offers = 0.393118, false_change = 0.228909, coverage = 0.777778, covered_accuracy = 0.520797, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.564990, no_offer_rate = 0.606882, student_coverage = 0.932099, offer_count = 6878, direction_reversals = 53, gain_ci95 = [0.0, 0.0] |
| `test / 3pl/False / bkt_politica_conservadora` | accuracy = 0.394433, outside = 0.548868, offers = 0.154550, false_change = 0.082819, coverage = 0.555556, covered_accuracy = 0.443313, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.573964, no_offer_rate = 0.845450, student_coverage = 0.888889, offer_count = 2704, direction_reversals = 28, gain_ci95 = [-0.09979566758116142, -0.06847279378143575] |
| `test / 3pl/False / bkt_politica_incerteza` | accuracy = 0.421525, outside = 0.505487, offers = 0.160494, false_change = 0.054184, coverage = 0.777778, covered_accuracy = 0.446723, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.662037, no_offer_rate = 0.839506, student_coverage = 0.746914, offer_count = 2808, direction_reversals = 17, gain_ci95 = [-0.07636173982624601, -0.03737568587105627] |
| `test / 3pl/False / bkt_politica_incerteza_forte` | accuracy = 0.414552, outside = 0.512117, offers = 0.144147, false_change = 0.045439, coverage = 0.777778, covered_accuracy = 0.437757, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.668517, no_offer_rate = 0.855853, student_coverage = 0.584362, offer_count = 2522, direction_reversals = 12, gain_ci95 = [-0.08413780292638316, -0.04343850022862369] |
| `test / 3pl/False / bkt_politica_histerese` | accuracy = 0.475766, outside = 0.475537, offers = 0.387631, false_change = 0.226166, coverage = 0.777778, covered_accuracy = 0.516461, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.561929, no_offer_rate = 0.612369, student_coverage = 0.932099, offer_count = 6782, direction_reversals = 48, gain_ci95 = [-0.004915409236396891, -0.0018861454046639231] |
| `test / 3pl/False / bkt_politica_hibrida` | accuracy = 0.418496, outside = 0.508973, offers = 0.155921, false_change = 0.052298, coverage = 0.777778, covered_accuracy = 0.442828, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.657991, no_offer_rate = 0.844079, student_coverage = 0.742798, offer_count = 2728, direction_reversals = 14, gain_ci95 = [-0.079565329218107, -0.040234910836762706] |
| `test / 3pl/False / bkt_politica_hibrida_2` | accuracy = 0.378201, outside = 0.554641, offers = 0.089506, false_change = 0.032750, coverage = 0.777778, covered_accuracy = 0.391020, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.623244, no_offer_rate = 0.910494, student_coverage = 0.742798, offer_count = 1566, direction_reversals = 14, gain_ci95 = [-0.12128629401005944, -0.07933098994055786] |
| `test / 3pl/True / bkt_atual` | accuracy = 0.421296, outside = 0.532179, offers = 0.073331, false_change = 0.038897, coverage = 0.555556, covered_accuracy = 0.495062, accepted_changes = 866, violations = 0, trajectories = 486, offer_precision = 0.448948, no_offer_rate = 0.926669, student_coverage = 0.901235, offer_count = 1283, direction_reversals = 151, gain_ci95 = [-0.07933241883859168, -0.04515174897119342] |
| `test / 3pl/True / bkt_politica_margem` | accuracy = 0.484053, outside = 0.468679, offers = 0.185014, false_change = 0.088155, coverage = 0.777778, covered_accuracy = 0.522193, accepted_changes = 2122, violations = 0, trajectories = 486, offer_precision = 0.542478, no_offer_rate = 0.814986, student_coverage = 0.932099, offer_count = 3237, direction_reversals = 235, gain_ci95 = [0.0, 0.0] |
| `test / 3pl/True / bkt_politica_conservadora` | accuracy = 0.446045, outside = 0.501029, offers = 0.088134, false_change = 0.048253, coverage = 0.555556, covered_accuracy = 0.536420, accepted_changes = 1022, violations = 0, trajectories = 486, offer_precision = 0.520104, no_offer_rate = 0.911866, student_coverage = 0.888889, offer_count = 1542, direction_reversals = 169, gain_ci95 = [-0.05149748513946045, -0.02394833104709648] |
| `test / 3pl/True / bkt_politica_incerteza` | accuracy = 0.415638, outside = 0.501772, offers = 0.069159, false_change = 0.021864, coverage = 0.777778, covered_accuracy = 0.436434, accepted_changes = 789, violations = 0, trajectories = 486, offer_precision = 0.648760, no_offer_rate = 0.930841, student_coverage = 0.746914, offer_count = 1210, direction_reversals = 71, gain_ci95 = [-0.09196816415180613, -0.0431512917238226] |
| `test / 3pl/True / bkt_politica_incerteza_forte` | accuracy = 0.401692, outside = 0.512574, offers = 0.045039, false_change = 0.009927, coverage = 0.777778, covered_accuracy = 0.418871, accepted_changes = 524, violations = 0, trajectories = 486, offer_precision = 0.691624, no_offer_rate = 0.954961, student_coverage = 0.584362, offer_count = 788, direction_reversals = 36, gain_ci95 = [-0.10911208276177414, -0.05411665523548245] |
| `test / 3pl/True / bkt_politica_histerese` | accuracy = 0.468450, outside = 0.486854, offers = 0.150606, false_change = 0.066491, coverage = 0.777778, covered_accuracy = 0.502205, accepted_changes = 1737, violations = 0, trajectories = 486, offer_precision = 0.552941, no_offer_rate = 0.849394, student_coverage = 0.932099, offer_count = 2635, direction_reversals = 192, gain_ci95 = [-0.02109053497942387, -0.01034522176497485] |
| `test / 3pl/True / bkt_politica_hibrida` | accuracy = 0.407407, outside = 0.512689, offers = 0.060071, false_change = 0.018268, coverage = 0.777778, covered_accuracy = 0.425999, accepted_changes = 705, violations = 0, trajectories = 486, offer_precision = 0.646051, no_offer_rate = 0.939929, student_coverage = 0.742798, offer_count = 1051, direction_reversals = 62, gain_ci95 = [-0.10014288980338362, -0.05075302926383174] |
| `test / 3pl/True / bkt_politica_hibrida_2` | accuracy = 0.397577, outside = 0.523262, offers = 0.052069, false_change = 0.017942, coverage = 0.777778, covered_accuracy = 0.414095, accepted_changes = 603, violations = 0, trajectories = 486, offer_precision = 0.605928, no_offer_rate = 0.947931, student_coverage = 0.742798, offer_count = 911, direction_reversals = 60, gain_ci95 = [-0.11043238454503888, -0.060755315500685886] |

## correcao_adaptativa/resultados.json

Arquivo integral · [resultados.json](evidencias/workspace/dificuldade-adaptativa/correcao_adaptativa/resultados.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `logistic_original/original/taxa` | paired_ci95 = [0.0, 0.0], gain = 0.000000 |
| `logistic_original/original/taxa / overall` | n = 11664, accuracy = 0.342164, difficulty_error = 0.657836, inadequate_challenge = 0.666667, false_change_when_adequate = 0.054527, coverage = 0.555556, latent_proxy_mae = 1.174933, oscillations = 1859, repeat_rate = 0.526971, autonomy_violations = 0, direct_accuracy_covered = 0.398920, response_brier = 0.216901 |
| `logistic_original/original/taxa / by_profile / progressivo` | n = 1296, accuracy = 0.320988, difficulty_error = 0.679012, inadequate_challenge = 0.666667, false_change_when_adequate = 0.085648, coverage = 0.555556, latent_proxy_mae = 1.056519, oscillations = 189, repeat_rate = 0.480392, autonomy_violations = 0, direct_accuracy_covered = 0.216667, response_brier = 0.215988 |
| `logistic_original/original/taxa / by_profile / rapido` | n = 1296, accuracy = 0.307870, difficulty_error = 0.692130, inadequate_challenge = 0.784722, false_change_when_adequate = 0.085648, coverage = 0.555556, latent_proxy_mae = 1.245807, oscillations = 173, repeat_rate = 0.510638, autonomy_violations = 0, direct_accuracy_covered = 0.169444, response_brier = 0.227300 |
| `logistic_original/original/taxa / by_profile / queda` | n = 1296, accuracy = 0.322531, difficulty_error = 0.677469, inadequate_challenge = 0.888889, false_change_when_adequate = 0.060185, coverage = 0.555556, latent_proxy_mae = 2.045850, oscillations = 186, repeat_rate = 0.361702, autonomy_violations = 0, direct_accuracy_covered = 0.273611, response_brier = 0.260787 |
| `logistic_original/original/taxa / by_profile / queda_gradual` | n = 1296, accuracy = 0.311728, difficulty_error = 0.688272, inadequate_challenge = 0.747685, false_change_when_adequate = 0.087963, coverage = 0.555556, latent_proxy_mae = 1.749486, oscillations = 202, repeat_rate = 0.524272, autonomy_violations = 0, direct_accuracy_covered = 0.194444, response_brier = 0.250915 |
| `logistic_original/original/taxa / by_profile / irregular` | n = 1296, accuracy = 0.310185, difficulty_error = 0.689815, inadequate_challenge = 0.614969, false_change_when_adequate = 0.104167, coverage = 0.555556, latent_proxy_mae = 1.299815, oscillations = 209, repeat_rate = 0.587156, autonomy_violations = 0, direct_accuracy_covered = 0.250000, response_brier = 0.224230 |
| `logistic_original/original/taxa / by_profile / estavel_facil` | n = 1296, accuracy = 0.371914, difficulty_error = 0.628086, inadequate_challenge = 0.628086, false_change_when_adequate = 0.013889, coverage = 0.555556, latent_proxy_mae = 0.936766, oscillations = 243, repeat_rate = 0.590164, autonomy_violations = 0, direct_accuracy_covered = 0.602778, response_brier = 0.220000 |
| `logistic_original/original/taxa / by_profile / estavel_medio` | n = 1296, accuracy = 0.388117, difficulty_error = 0.611883, inadequate_challenge = 0.295525, false_change_when_adequate = 0.041667, coverage = 0.555556, latent_proxy_mae = 0.766578, oscillations = 204, repeat_rate = 0.514019, autonomy_violations = 0, direct_accuracy_covered = 0.694444, response_brier = 0.223364 |
| `logistic_original/original/taxa / by_profile / estavel_dificil` | n = 1296, accuracy = 0.370370, difficulty_error = 0.629630, inadequate_challenge = 0.629630, false_change_when_adequate = 0.006944, coverage = 0.555556, latent_proxy_mae = 0.690227, oscillations = 218, repeat_rate = 0.552632, autonomy_violations = 0, direct_accuracy_covered = 0.566667, response_brier = 0.154886 |
| `logistic_original/original/taxa / by_skill / MT:algebra` | n = 7776, accuracy = 0.343236, difficulty_error = 0.656764, inadequate_challenge = 0.649691, false_change_when_adequate = 0.065586, coverage = 0.666667, latent_proxy_mae = 1.176406, oscillations = 1490, repeat_rate = 0.659740, autonomy_violations = 0, direct_accuracy_covered = 0.393519, response_brier = 0.214179 |
| `logistic_original/original/taxa / by_skill / CN:outra` | n = 3888, accuracy = 0.340021, difficulty_error = 0.659979, inadequate_challenge = 0.700617, false_change_when_adequate = 0.032407, coverage = 0.333333, latent_proxy_mae = 1.169037, oscillations = 369, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.420525, response_brier = 0.222344 |
| `logistic_original/original/hibrido_antigo` | paired_ci95 = [-0.023576817558299042, -0.012688614540466395], gain = -0.018004 |
| `logistic_original/original/hibrido_antigo / overall` | n = 11664, accuracy = 0.324160, difficulty_error = 0.675840, inadequate_challenge = 0.681070, false_change_when_adequate = 0.118313, coverage = 0.555556, latent_proxy_mae = 1.107272, oscillations = 2620, repeat_rate = 0.565350, autonomy_violations = 0, direct_accuracy_covered = 0.409722, response_brier = 0.218301 |
| `logistic_original/original/hibrido_antigo / by_profile / progressivo` | n = 1296, accuracy = 0.319444, difficulty_error = 0.680556, inadequate_challenge = 0.671296, false_change_when_adequate = 0.115741, coverage = 0.555556, latent_proxy_mae = 0.650010, oscillations = 260, repeat_rate = 0.561538, autonomy_violations = 0, direct_accuracy_covered = 0.308333, response_brier = 0.198590 |
| `logistic_original/original/hibrido_antigo / by_profile / rapido` | n = 1296, accuracy = 0.290895, difficulty_error = 0.709105, inadequate_challenge = 0.801698, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 0.843452, oscillations = 258, repeat_rate = 0.565891, autonomy_violations = 0, direct_accuracy_covered = 0.213889, response_brier = 0.209629 |
| `logistic_original/original/hibrido_antigo / by_profile / queda` | n = 1296, accuracy = 0.290895, difficulty_error = 0.709105, inadequate_challenge = 0.888889, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 2.327383, oscillations = 278, repeat_rate = 0.542857, autonomy_violations = 0, direct_accuracy_covered = 0.173611, response_brier = 0.274021 |
| `logistic_original/original/hibrido_antigo / by_profile / queda_gradual` | n = 1296, accuracy = 0.289352, difficulty_error = 0.710648, inadequate_challenge = 0.750000, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 1.998915, oscillations = 285, repeat_rate = 0.538462, autonomy_violations = 0, direct_accuracy_covered = 0.208333, response_brier = 0.261769 |
| `logistic_original/original/hibrido_antigo / by_profile / irregular` | n = 1296, accuracy = 0.317901, difficulty_error = 0.682099, inadequate_challenge = 0.608025, false_change_when_adequate = 0.111111, coverage = 0.555556, latent_proxy_mae = 1.277917, oscillations = 263, repeat_rate = 0.560606, autonomy_violations = 0, direct_accuracy_covered = 0.279167, response_brier = 0.222783 |
| `logistic_original/original/hibrido_antigo / by_profile / estavel_facil` | n = 1296, accuracy = 0.324846, difficulty_error = 0.675154, inadequate_challenge = 0.675154, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 1.326759, oscillations = 335, repeat_rate = 0.585799, autonomy_violations = 0, direct_accuracy_covered = 0.540278, response_brier = 0.255582 |
| `logistic_original/original/hibrido_antigo / by_profile / estavel_medio` | n = 1296, accuracy = 0.412809, difficulty_error = 0.587191, inadequate_challenge = 0.294753, false_change_when_adequate = 0.039352, coverage = 0.555556, latent_proxy_mae = 0.689285, oscillations = 274, repeat_rate = 0.554745, autonomy_violations = 0, direct_accuracy_covered = 0.558333, response_brier = 0.224189 |
| `logistic_original/original/hibrido_antigo / by_profile / estavel_dificil` | n = 1296, accuracy = 0.333333, difficulty_error = 0.666667, inadequate_challenge = 0.666667, false_change_when_adequate = 0.122685, coverage = 0.555556, latent_proxy_mae = 0.291390, oscillations = 328, repeat_rate = 0.590361, autonomy_violations = 0, direct_accuracy_covered = 0.691667, response_brier = 0.136713 |
| `logistic_original/original/hibrido_antigo / by_skill / MT:algebra` | n = 7776, accuracy = 0.323174, difficulty_error = 0.676826, inadequate_challenge = 0.667567, false_change_when_adequate = 0.139660, coverage = 0.666667, latent_proxy_mae = 1.077456, oscillations = 2077, repeat_rate = 0.713327, autonomy_violations = 0, direct_accuracy_covered = 0.410108, response_brier = 0.212622 |
| `logistic_original/original/hibrido_antigo / by_skill / CN:outra` | n = 3888, accuracy = 0.326132, difficulty_error = 0.673868, inadequate_challenge = 0.708076, false_change_when_adequate = 0.075617, coverage = 0.333333, latent_proxy_mae = 1.226536, oscillations = 543, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.408179, response_brier = 0.229658 |
| `logistic_original/original/bkt_item` | paired_ci95 = [0.005227623456790123, 0.014231824417009601], gain = 0.009688 |
| `logistic_original/original/bkt_item / overall` | n = 11664, accuracy = 0.351852, difficulty_error = 0.648148, inadequate_challenge = 0.660665, false_change_when_adequate = 0.067901, coverage = 0.555556, latent_proxy_mae = 0.930900, oscillations = 2470, repeat_rate = 0.508000, autonomy_violations = 0, direct_accuracy_covered = 0.619136, response_brier = 0.210601 |
| `logistic_original/original/bkt_item / by_profile / progressivo` | n = 1296, accuracy = 0.359568, difficulty_error = 0.640432, inadequate_challenge = 0.630401, false_change_when_adequate = 0.064815, coverage = 0.555556, latent_proxy_mae = 0.489895, oscillations = 288, repeat_rate = 0.489655, autonomy_violations = 0, direct_accuracy_covered = 0.633333, response_brier = 0.184974 |
| `logistic_original/original/bkt_item / by_profile / rapido` | n = 1296, accuracy = 0.350309, difficulty_error = 0.649691, inadequate_challenge = 0.742284, false_change_when_adequate = 0.048611, coverage = 0.555556, latent_proxy_mae = 0.671379, oscillations = 269, repeat_rate = 0.474453, autonomy_violations = 0, direct_accuracy_covered = 0.590278, response_brier = 0.192276 |
| `logistic_original/original/bkt_item / by_profile / queda` | n = 1296, accuracy = 0.335648, difficulty_error = 0.664352, inadequate_challenge = 0.888889, false_change_when_adequate = 0.081019, coverage = 0.555556, latent_proxy_mae = 2.001676, oscillations = 258, repeat_rate = 0.415385, autonomy_violations = 0, direct_accuracy_covered = 0.469444, response_brier = 0.267135 |
| `logistic_original/original/bkt_item / by_profile / queda_gradual` | n = 1296, accuracy = 0.321759, difficulty_error = 0.678241, inadequate_challenge = 0.752315, false_change_when_adequate = 0.108796, coverage = 0.555556, latent_proxy_mae = 1.732995, oscillations = 299, repeat_rate = 0.483444, autonomy_violations = 0, direct_accuracy_covered = 0.425000, response_brier = 0.257883 |
| `logistic_original/original/bkt_item / by_profile / irregular` | n = 1296, accuracy = 0.320216, difficulty_error = 0.679784, inadequate_challenge = 0.612654, false_change_when_adequate = 0.115741, coverage = 0.555556, latent_proxy_mae = 1.317127, oscillations = 297, repeat_rate = 0.480000, autonomy_violations = 0, direct_accuracy_covered = 0.261111, response_brier = 0.235680 |
| `logistic_original/original/bkt_item / by_profile / estavel_facil` | n = 1296, accuracy = 0.359568, difficulty_error = 0.640432, inadequate_challenge = 0.640432, false_change_when_adequate = 0.055556, coverage = 0.555556, latent_proxy_mae = 0.902745, oscillations = 277, repeat_rate = 0.545455, autonomy_violations = 0, direct_accuracy_covered = 0.884722, response_brier = 0.232365 |
| `logistic_original/original/bkt_item / by_profile / estavel_medio` | n = 1296, accuracy = 0.364198, difficulty_error = 0.635802, inadequate_challenge = 0.314815, false_change_when_adequate = 0.127315, coverage = 0.555556, latent_proxy_mae = 0.683658, oscillations = 294, repeat_rate = 0.526667, autonomy_violations = 0, direct_accuracy_covered = 0.373611, response_brier = 0.231074 |
| `logistic_original/original/bkt_item / by_profile / estavel_dificil` | n = 1296, accuracy = 0.377315, difficulty_error = 0.622685, inadequate_challenge = 0.622685, false_change_when_adequate = 0.004630, coverage = 0.555556, latent_proxy_mae = 0.171618, oscillations = 244, repeat_rate = 0.581967, autonomy_violations = 0, direct_accuracy_covered = 0.952778, response_brier = 0.131218 |
| `logistic_original/original/bkt_item / by_skill / MT:algebra` | n = 7776, accuracy = 0.356353, difficulty_error = 0.643647, inadequate_challenge = 0.641847, false_change_when_adequate = 0.079090, coverage = 0.666667, latent_proxy_mae = 0.909492, oscillations = 1949, repeat_rate = 0.644016, autonomy_violations = 0, direct_accuracy_covered = 0.617477, response_brier = 0.205279 |
| `logistic_original/original/bkt_item / by_skill / CN:outra` | n = 3888, accuracy = 0.342850, difficulty_error = 0.657150, inadequate_challenge = 0.698302, false_change_when_adequate = 0.045525, coverage = 0.333333, latent_proxy_mae = 1.016529, oscillations = 521, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.625772, response_brier = 0.221247 |
| `logistic_original/original/elo_item` | paired_ci95 = [-0.01286008230452675, -0.0030864197530864196], gain = -0.007888 |
| `logistic_original/original/elo_item / overall` | n = 11664, accuracy = 0.334276, difficulty_error = 0.665724, inadequate_challenge = 0.677726, false_change_when_adequate = 0.087706, coverage = 0.555556, latent_proxy_mae = 0.949323, oscillations = 2274, repeat_rate = 0.543478, autonomy_violations = 0, direct_accuracy_covered = 0.420062, response_brier = 0.199905 |
| `logistic_original/original/elo_item / by_profile / progressivo` | n = 1296, accuracy = 0.307099, difficulty_error = 0.692901, inadequate_challenge = 0.682099, false_change_when_adequate = 0.118056, coverage = 0.555556, latent_proxy_mae = 1.124920, oscillations = 234, repeat_rate = 0.529915, autonomy_violations = 0, direct_accuracy_covered = 0.083333, response_brier = 0.194658 |
| `logistic_original/original/elo_item / by_profile / rapido` | n = 1296, accuracy = 0.292438, difficulty_error = 0.707562, inadequate_challenge = 0.800154, false_change_when_adequate = 0.127315, coverage = 0.555556, latent_proxy_mae = 1.335367, oscillations = 233, repeat_rate = 0.508475, autonomy_violations = 0, direct_accuracy_covered = 0.050000, response_brier = 0.204502 |
| `logistic_original/original/elo_item / by_profile / queda` | n = 1296, accuracy = 0.351080, difficulty_error = 0.648920, inadequate_challenge = 0.888889, false_change_when_adequate = 0.053241, coverage = 0.555556, latent_proxy_mae = 1.445926, oscillations = 256, repeat_rate = 0.488372, autonomy_violations = 0, direct_accuracy_covered = 0.638889, response_brier = 0.224141 |
| `logistic_original/original/elo_item / by_profile / queda_gradual` | n = 1296, accuracy = 0.343364, difficulty_error = 0.656636, inadequate_challenge = 0.733796, false_change_when_adequate = 0.074074, coverage = 0.555556, latent_proxy_mae = 1.195003, oscillations = 269, repeat_rate = 0.540146, autonomy_violations = 0, direct_accuracy_covered = 0.593056, response_brier = 0.218448 |
| `logistic_original/original/elo_item / by_profile / irregular` | n = 1296, accuracy = 0.320988, difficulty_error = 0.679012, inadequate_challenge = 0.604167, false_change_when_adequate = 0.127315, coverage = 0.555556, latent_proxy_mae = 1.028237, oscillations = 275, repeat_rate = 0.578571, autonomy_violations = 0, direct_accuracy_covered = 0.322222, response_brier = 0.211040 |
| `logistic_original/original/elo_item / by_profile / estavel_facil` | n = 1296, accuracy = 0.375000, difficulty_error = 0.625000, inadequate_challenge = 0.625000, false_change_when_adequate = 0.013889, coverage = 0.555556, latent_proxy_mae = 0.591254, oscillations = 252, repeat_rate = 0.595238, autonomy_violations = 0, direct_accuracy_covered = 0.956944, response_brier = 0.211281 |
| `logistic_original/original/elo_item / by_profile / estavel_medio` | n = 1296, accuracy = 0.377315, difficulty_error = 0.622685, inadequate_challenge = 0.287037, false_change_when_adequate = 0.092593, coverage = 0.555556, latent_proxy_mae = 0.307278, oscillations = 270, repeat_rate = 0.554745, autonomy_violations = 0, direct_accuracy_covered = 0.530556, response_brier = 0.210731 |
| `logistic_original/original/elo_item / by_profile / estavel_dificil` | n = 1296, accuracy = 0.306327, difficulty_error = 0.693673, inadequate_challenge = 0.693673, false_change_when_adequate = 0.108796, coverage = 0.555556, latent_proxy_mae = 0.770994, oscillations = 237, repeat_rate = 0.558333, autonomy_violations = 0, direct_accuracy_covered = 0.166667, response_brier = 0.156627 |
| `logistic_original/original/elo_item / by_skill / MT:algebra` | n = 7776, accuracy = 0.334748, difficulty_error = 0.665252, inadequate_challenge = 0.661137, false_change_when_adequate = 0.104552, coverage = 0.666667, latent_proxy_mae = 0.928697, oscillations = 1827, repeat_rate = 0.677874, autonomy_violations = 0, direct_accuracy_covered = 0.406636, response_brier = 0.195444 |
| `logistic_original/original/elo_item / by_skill / CN:outra` | n = 3888, accuracy = 0.333333, difficulty_error = 0.666667, inadequate_challenge = 0.710905, false_change_when_adequate = 0.054012, coverage = 0.333333, latent_proxy_mae = 1.031828, oscillations = 447, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.473765, response_brier = 0.208828 |
| `logistic_original/original/rasch` | paired_ci95 = [-0.01174554183813443, -0.003172153635116598], gain = -0.007373 |
| `logistic_original/original/rasch / overall` | n = 11664, accuracy = 0.334791, difficulty_error = 0.665209, inadequate_challenge = 0.676097, false_change_when_adequate = 0.082562, coverage = 0.555556, latent_proxy_mae = 1.008779, oscillations = 2209, repeat_rate = 0.546750, autonomy_violations = 0, direct_accuracy_covered = 0.408179, response_brier = 0.203980 |
| `logistic_original/original/rasch / by_profile / progressivo` | n = 1296, accuracy = 0.301698, difficulty_error = 0.698302, inadequate_challenge = 0.685957, false_change_when_adequate = 0.127315, coverage = 0.555556, latent_proxy_mae = 1.314971, oscillations = 233, repeat_rate = 0.541667, autonomy_violations = 0, direct_accuracy_covered = 0.047222, response_brier = 0.205307 |
| `logistic_original/original/rasch / by_profile / rapido` | n = 1296, accuracy = 0.287809, difficulty_error = 0.712191, inadequate_challenge = 0.804784, false_change_when_adequate = 0.136574, coverage = 0.555556, latent_proxy_mae = 1.566622, oscillations = 233, repeat_rate = 0.516949, autonomy_violations = 0, direct_accuracy_covered = 0.008333, response_brier = 0.217513 |
| `logistic_original/original/rasch / by_profile / queda` | n = 1296, accuracy = 0.344907, difficulty_error = 0.655093, inadequate_challenge = 0.888889, false_change_when_adequate = 0.057870, coverage = 0.555556, latent_proxy_mae = 1.680625, oscillations = 256, repeat_rate = 0.476923, autonomy_violations = 0, direct_accuracy_covered = 0.511111, response_brier = 0.239325 |
| `logistic_original/original/rasch / by_profile / queda_gradual` | n = 1296, accuracy = 0.336420, difficulty_error = 0.663580, inadequate_challenge = 0.738426, false_change_when_adequate = 0.071759, coverage = 0.555556, latent_proxy_mae = 1.380201, oscillations = 255, repeat_rate = 0.523077, autonomy_violations = 0, direct_accuracy_covered = 0.468056, response_brier = 0.230373 |
| `logistic_original/original/rasch / by_profile / irregular` | n = 1296, accuracy = 0.323302, difficulty_error = 0.676698, inadequate_challenge = 0.604938, false_change_when_adequate = 0.113426, coverage = 0.555556, latent_proxy_mae = 1.046304, oscillations = 253, repeat_rate = 0.581395, autonomy_violations = 0, direct_accuracy_covered = 0.326389, response_brier = 0.214257 |
| `logistic_original/original/rasch / by_profile / estavel_facil` | n = 1296, accuracy = 0.375000, difficulty_error = 0.625000, inadequate_challenge = 0.625000, false_change_when_adequate = 0.013889, coverage = 0.555556, latent_proxy_mae = 0.492300, oscillations = 252, repeat_rate = 0.595238, autonomy_violations = 0, direct_accuracy_covered = 0.972222, response_brier = 0.205570 |
| `logistic_original/original/rasch / by_profile / estavel_medio` | n = 1296, accuracy = 0.373457, difficulty_error = 0.626543, inadequate_challenge = 0.287809, false_change_when_adequate = 0.085648, coverage = 0.555556, latent_proxy_mae = 0.343928, oscillations = 247, repeat_rate = 0.579365, autonomy_violations = 0, direct_accuracy_covered = 0.477778, response_brier = 0.212719 |
| `logistic_original/original/rasch / by_profile / estavel_dificil` | n = 1296, accuracy = 0.325617, difficulty_error = 0.674383, inadequate_challenge = 0.674383, false_change_when_adequate = 0.076389, coverage = 0.555556, latent_proxy_mae = 0.641723, oscillations = 227, repeat_rate = 0.547009, autonomy_violations = 0, direct_accuracy_covered = 0.313889, response_brier = 0.150751 |
| `logistic_original/original/rasch / by_skill / MT:algebra` | n = 7776, accuracy = 0.334748, difficulty_error = 0.665252, inadequate_challenge = 0.659979, false_change_when_adequate = 0.100309, coverage = 0.666667, latent_proxy_mae = 1.004510, oscillations = 1783, repeat_rate = 0.679204, autonomy_violations = 0, direct_accuracy_covered = 0.391975, response_brier = 0.200876 |
| `logistic_original/original/rasch / by_skill / CN:outra` | n = 3888, accuracy = 0.334877, difficulty_error = 0.665123, inadequate_challenge = 0.708333, false_change_when_adequate = 0.047068, coverage = 0.333333, latent_proxy_mae = 1.025855, oscillations = 426, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.472994, response_brier = 0.210188 |
| `logistic_original/original/hibrido_item` | paired_ci95 = [-0.006087105624142661, 0.001114540466392318], gain = -0.002486 |
| `logistic_original/original/hibrido_item / overall` | n = 11664, accuracy = 0.339678, difficulty_error = 0.660322, inadequate_challenge = 0.671296, false_change_when_adequate = 0.080504, coverage = 0.555556, latent_proxy_mae = 0.965179, oscillations = 2337, repeat_rate = 0.541596, autonomy_violations = 0, direct_accuracy_covered = 0.465895, response_brier = 0.203683 |
| `logistic_original/original/hibrido_item / by_profile / progressivo` | n = 1296, accuracy = 0.309414, difficulty_error = 0.690586, inadequate_challenge = 0.680556, false_change_when_adequate = 0.118056, coverage = 0.555556, latent_proxy_mae = 0.937606, oscillations = 246, repeat_rate = 0.528000, autonomy_violations = 0, direct_accuracy_covered = 0.090278, response_brier = 0.189890 |
| `logistic_original/original/hibrido_item / by_profile / rapido` | n = 1296, accuracy = 0.290895, difficulty_error = 0.709105, inadequate_challenge = 0.801698, false_change_when_adequate = 0.129630, coverage = 0.555556, latent_proxy_mae = 1.164934, oscillations = 246, repeat_rate = 0.504000, autonomy_violations = 0, direct_accuracy_covered = 0.044444, response_brier = 0.199130 |
| `logistic_original/original/hibrido_item / by_profile / queda` | n = 1296, accuracy = 0.341049, difficulty_error = 0.658951, inadequate_challenge = 0.888889, false_change_when_adequate = 0.069444, coverage = 0.555556, latent_proxy_mae = 1.826980, oscillations = 265, repeat_rate = 0.462687, autonomy_violations = 0, direct_accuracy_covered = 0.493056, response_brier = 0.250323 |
| `logistic_original/original/hibrido_item / by_profile / queda_gradual` | n = 1296, accuracy = 0.330247, difficulty_error = 0.669753, inadequate_challenge = 0.738426, false_change_when_adequate = 0.092593, coverage = 0.555556, latent_proxy_mae = 1.539389, oscillations = 278, repeat_rate = 0.531915, autonomy_violations = 0, direct_accuracy_covered = 0.450000, response_brier = 0.241177 |
| `logistic_original/original/hibrido_item / by_profile / irregular` | n = 1296, accuracy = 0.323302, difficulty_error = 0.676698, inadequate_challenge = 0.603395, false_change_when_adequate = 0.120370, coverage = 0.555556, latent_proxy_mae = 1.138353, oscillations = 271, repeat_rate = 0.583942, autonomy_violations = 0, direct_accuracy_covered = 0.308333, response_brier = 0.220801 |
| `logistic_original/original/hibrido_item / by_profile / estavel_facil` | n = 1296, accuracy = 0.371142, difficulty_error = 0.628858, inadequate_challenge = 0.628858, false_change_when_adequate = 0.020833, coverage = 0.555556, latent_proxy_mae = 0.669973, oscillations = 254, repeat_rate = 0.582677, autonomy_violations = 0, direct_accuracy_covered = 0.938889, response_brier = 0.215626 |
| `logistic_original/original/hibrido_item / by_profile / estavel_medio` | n = 1296, accuracy = 0.382716, difficulty_error = 0.617284, inadequate_challenge = 0.288580, false_change_when_adequate = 0.085648, coverage = 0.555556, latent_proxy_mae = 0.467304, oscillations = 275, repeat_rate = 0.557971, autonomy_violations = 0, direct_accuracy_covered = 0.587500, response_brier = 0.218436 |
| `logistic_original/original/hibrido_item / by_profile / estavel_dificil` | n = 1296, accuracy = 0.347994, difficulty_error = 0.652006, inadequate_challenge = 0.652006, false_change_when_adequate = 0.050926, coverage = 0.555556, latent_proxy_mae = 0.422553, oscillations = 248, repeat_rate = 0.556452, autonomy_violations = 0, direct_accuracy_covered = 0.555556, response_brier = 0.138711 |
| `logistic_original/original/hibrido_item / by_skill / MT:algebra` | n = 7776, accuracy = 0.341307, difficulty_error = 0.658693, inadequate_challenge = 0.653807, false_change_when_adequate = 0.095679, coverage = 0.666667, latent_proxy_mae = 0.952530, oscillations = 1871, repeat_rate = 0.678002, autonomy_violations = 0, direct_accuracy_covered = 0.458526, response_brier = 0.199361 |
| `logistic_original/original/hibrido_item / by_skill / CN:outra` | n = 3888, accuracy = 0.336420, difficulty_error = 0.663580, inadequate_challenge = 0.706276, false_change_when_adequate = 0.050154, coverage = 0.333333, latent_proxy_mae = 1.015775, oscillations = 466, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.495370, response_brier = 0.212329 |
| `logistic_original/persistencia/taxa` | paired_ci95 = [0.0, 0.0], gain = 0.000000 |
| `logistic_original/persistencia/taxa / overall` | n = 11664, accuracy = 0.339935, difficulty_error = 0.660065, inadequate_challenge = 0.668724, false_change_when_adequate = 0.050669, coverage = 0.555556, latent_proxy_mae = 1.174933, oscillations = 1722, repeat_rate = 0.519540, autonomy_violations = 0, direct_accuracy_covered = 0.398920, response_brier = 0.216901 |
| `logistic_original/persistencia/taxa / by_profile / progressivo` | n = 1296, accuracy = 0.317130, difficulty_error = 0.682870, inadequate_challenge = 0.673611, false_change_when_adequate = 0.083333, coverage = 0.555556, latent_proxy_mae = 1.056519, oscillations = 168, repeat_rate = 0.464286, autonomy_violations = 0, direct_accuracy_covered = 0.216667, response_brier = 0.215988 |
| `logistic_original/persistencia/taxa / by_profile / rapido` | n = 1296, accuracy = 0.306327, difficulty_error = 0.693673, inadequate_challenge = 0.786265, false_change_when_adequate = 0.083333, coverage = 0.555556, latent_proxy_mae = 1.245807, oscillations = 150, repeat_rate = 0.426667, autonomy_violations = 0, direct_accuracy_covered = 0.169444, response_brier = 0.227300 |
| `logistic_original/persistencia/taxa / by_profile / queda` | n = 1296, accuracy = 0.320216, difficulty_error = 0.679784, inadequate_challenge = 0.888889, false_change_when_adequate = 0.060185, coverage = 0.555556, latent_proxy_mae = 2.045850, oscillations = 169, repeat_rate = 0.366667, autonomy_violations = 0, direct_accuracy_covered = 0.273611, response_brier = 0.260787 |
| `logistic_original/persistencia/taxa / by_profile / queda_gradual` | n = 1296, accuracy = 0.309414, difficulty_error = 0.690586, inadequate_challenge = 0.748457, false_change_when_adequate = 0.083333, coverage = 0.555556, latent_proxy_mae = 1.749486, oscillations = 186, repeat_rate = 0.515789, autonomy_violations = 0, direct_accuracy_covered = 0.194444, response_brier = 0.250915 |
| `logistic_original/persistencia/taxa / by_profile / irregular` | n = 1296, accuracy = 0.316358, difficulty_error = 0.683642, inadequate_challenge = 0.614198, false_change_when_adequate = 0.085648, coverage = 0.555556, latent_proxy_mae = 1.299815, oscillations = 187, repeat_rate = 0.574468, autonomy_violations = 0, direct_accuracy_covered = 0.250000, response_brier = 0.224230 |
| `logistic_original/persistencia/taxa / by_profile / estavel_facil` | n = 1296, accuracy = 0.371142, difficulty_error = 0.628858, inadequate_challenge = 0.628858, false_change_when_adequate = 0.013889, coverage = 0.555556, latent_proxy_mae = 0.936766, oscillations = 241, repeat_rate = 0.586777, autonomy_violations = 0, direct_accuracy_covered = 0.602778, response_brier = 0.220000 |
| `logistic_original/persistencia/taxa / by_profile / estavel_medio` | n = 1296, accuracy = 0.381173, difficulty_error = 0.618827, inadequate_challenge = 0.296296, false_change_when_adequate = 0.034722, coverage = 0.555556, latent_proxy_mae = 0.766578, oscillations = 183, repeat_rate = 0.543478, autonomy_violations = 0, direct_accuracy_covered = 0.694444, response_brier = 0.223364 |
| `logistic_original/persistencia/taxa / by_profile / estavel_dificil` | n = 1296, accuracy = 0.364969, difficulty_error = 0.635031, inadequate_challenge = 0.635031, false_change_when_adequate = 0.006944, coverage = 0.555556, latent_proxy_mae = 0.690227, oscillations = 208, repeat_rate = 0.557692, autonomy_violations = 0, direct_accuracy_covered = 0.566667, response_brier = 0.154886 |
| `logistic_original/persistencia/taxa / by_skill / MT:algebra` | n = 7776, accuracy = 0.341178, difficulty_error = 0.658822, inadequate_challenge = 0.652006, false_change_when_adequate = 0.061343, coverage = 0.666667, latent_proxy_mae = 1.176406, oscillations = 1384, repeat_rate = 0.648494, autonomy_violations = 0, direct_accuracy_covered = 0.393519, response_brier = 0.214179 |
| `logistic_original/persistencia/taxa / by_skill / CN:outra` | n = 3888, accuracy = 0.337449, difficulty_error = 0.662551, inadequate_challenge = 0.702160, false_change_when_adequate = 0.029321, coverage = 0.333333, latent_proxy_mae = 1.169037, oscillations = 338, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.420525, response_brier = 0.222344 |
| `logistic_original/persistencia/hibrido_antigo` | paired_ci95 = [-0.021862139917695474, -0.010373799725651578], gain = -0.016032 |
| `logistic_original/persistencia/hibrido_antigo / overall` | n = 11664, accuracy = 0.323903, difficulty_error = 0.676097, inadequate_challenge = 0.681156, false_change_when_adequate = 0.114712, coverage = 0.555556, latent_proxy_mae = 1.107272, oscillations = 2532, repeat_rate = 0.566379, autonomy_violations = 0, direct_accuracy_covered = 0.409722, response_brier = 0.218301 |
| `logistic_original/persistencia/hibrido_antigo / by_profile / progressivo` | n = 1296, accuracy = 0.319444, difficulty_error = 0.680556, inadequate_challenge = 0.671296, false_change_when_adequate = 0.115741, coverage = 0.555556, latent_proxy_mae = 0.650010, oscillations = 259, repeat_rate = 0.561538, autonomy_violations = 0, direct_accuracy_covered = 0.308333, response_brier = 0.198590 |
| `logistic_original/persistencia/hibrido_antigo / by_profile / rapido` | n = 1296, accuracy = 0.290123, difficulty_error = 0.709877, inadequate_challenge = 0.802469, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 0.843452, oscillations = 251, repeat_rate = 0.579365, autonomy_violations = 0, direct_accuracy_covered = 0.213889, response_brier = 0.209629 |
| `logistic_original/persistencia/hibrido_antigo / by_profile / queda` | n = 1296, accuracy = 0.290123, difficulty_error = 0.709877, inadequate_challenge = 0.888889, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 2.327383, oscillations = 269, repeat_rate = 0.536765, autonomy_violations = 0, direct_accuracy_covered = 0.173611, response_brier = 0.274021 |
| `logistic_original/persistencia/hibrido_antigo / by_profile / queda_gradual` | n = 1296, accuracy = 0.287809, difficulty_error = 0.712191, inadequate_challenge = 0.746914, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 1.998915, oscillations = 272, repeat_rate = 0.551471, autonomy_violations = 0, direct_accuracy_covered = 0.208333, response_brier = 0.261769 |
| `logistic_original/persistencia/hibrido_antigo / by_profile / irregular` | n = 1296, accuracy = 0.315586, difficulty_error = 0.684414, inadequate_challenge = 0.610340, false_change_when_adequate = 0.113426, coverage = 0.555556, latent_proxy_mae = 1.277917, oscillations = 257, repeat_rate = 0.565891, autonomy_violations = 0, direct_accuracy_covered = 0.279167, response_brier = 0.222783 |
| `logistic_original/persistencia/hibrido_antigo / by_profile / estavel_facil` | n = 1296, accuracy = 0.317130, difficulty_error = 0.682870, inadequate_challenge = 0.682870, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 1.326759, oscillations = 318, repeat_rate = 0.578616, autonomy_violations = 0, direct_accuracy_covered = 0.540278, response_brier = 0.255582 |
| `logistic_original/persistencia/hibrido_antigo / by_profile / estavel_medio` | n = 1296, accuracy = 0.418210, difficulty_error = 0.581790, inadequate_challenge = 0.293210, false_change_when_adequate = 0.023148, coverage = 0.555556, latent_proxy_mae = 0.689285, oscillations = 260, repeat_rate = 0.553846, autonomy_violations = 0, direct_accuracy_covered = 0.558333, response_brier = 0.224189 |
| `logistic_original/persistencia/hibrido_antigo / by_profile / estavel_dificil` | n = 1296, accuracy = 0.336420, difficulty_error = 0.663580, inadequate_challenge = 0.663580, false_change_when_adequate = 0.113426, coverage = 0.555556, latent_proxy_mae = 0.291390, oscillations = 318, repeat_rate = 0.592593, autonomy_violations = 0, direct_accuracy_covered = 0.691667, response_brier = 0.136713 |
| `logistic_original/persistencia/hibrido_antigo / by_skill / MT:algebra` | n = 7776, accuracy = 0.323302, difficulty_error = 0.676698, inadequate_challenge = 0.667052, false_change_when_adequate = 0.134645, coverage = 0.666667, latent_proxy_mae = 1.077456, oscillations = 2005, repeat_rate = 0.715278, autonomy_violations = 0, direct_accuracy_covered = 0.410108, response_brier = 0.212622 |
| `logistic_original/persistencia/hibrido_antigo / by_skill / CN:outra` | n = 3888, accuracy = 0.325103, difficulty_error = 0.674897, inadequate_challenge = 0.709362, false_change_when_adequate = 0.074846, coverage = 0.333333, latent_proxy_mae = 1.226536, oscillations = 527, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.408179, response_brier = 0.229658 |
| `logistic_original/persistencia/bkt_item` | paired_ci95 = [0.010288065843621397, 0.018604252400548693], gain = 0.014489 |
| `logistic_original/persistencia/bkt_item / overall` | n = 11664, accuracy = 0.354424, difficulty_error = 0.645576, inadequate_challenge = 0.658865, false_change_when_adequate = 0.054784, coverage = 0.555556, latent_proxy_mae = 0.930900, oscillations = 2240, repeat_rate = 0.499564, autonomy_violations = 0, direct_accuracy_covered = 0.619136, response_brier = 0.210601 |
| `logistic_original/persistencia/bkt_item / by_profile / progressivo` | n = 1296, accuracy = 0.358796, difficulty_error = 0.641204, inadequate_challenge = 0.630401, false_change_when_adequate = 0.055556, coverage = 0.555556, latent_proxy_mae = 0.489895, oscillations = 264, repeat_rate = 0.466667, autonomy_violations = 0, direct_accuracy_covered = 0.633333, response_brier = 0.184974 |
| `logistic_original/persistencia/bkt_item / by_profile / rapido` | n = 1296, accuracy = 0.351080, difficulty_error = 0.648920, inadequate_challenge = 0.741512, false_change_when_adequate = 0.041667, coverage = 0.555556, latent_proxy_mae = 0.671379, oscillations = 238, repeat_rate = 0.451613, autonomy_violations = 0, direct_accuracy_covered = 0.590278, response_brier = 0.192276 |
| `logistic_original/persistencia/bkt_item / by_profile / queda` | n = 1296, accuracy = 0.339506, difficulty_error = 0.660494, inadequate_challenge = 0.888889, false_change_when_adequate = 0.064815, coverage = 0.555556, latent_proxy_mae = 2.001676, oscillations = 219, repeat_rate = 0.387931, autonomy_violations = 0, direct_accuracy_covered = 0.469444, response_brier = 0.267135 |
| `logistic_original/persistencia/bkt_item / by_profile / queda_gradual` | n = 1296, accuracy = 0.322531, difficulty_error = 0.677469, inadequate_challenge = 0.752315, false_change_when_adequate = 0.097222, coverage = 0.555556, latent_proxy_mae = 1.732995, oscillations = 267, repeat_rate = 0.471014, autonomy_violations = 0, direct_accuracy_covered = 0.425000, response_brier = 0.257883 |
| `logistic_original/persistencia/bkt_item / by_profile / irregular` | n = 1296, accuracy = 0.326389, difficulty_error = 0.673611, inadequate_challenge = 0.608025, false_change_when_adequate = 0.094907, coverage = 0.555556, latent_proxy_mae = 1.317127, oscillations = 249, repeat_rate = 0.488372, autonomy_violations = 0, direct_accuracy_covered = 0.261111, response_brier = 0.235680 |
| `logistic_original/persistencia/bkt_item / by_profile / estavel_facil` | n = 1296, accuracy = 0.365741, difficulty_error = 0.634259, inadequate_challenge = 0.634259, false_change_when_adequate = 0.030093, coverage = 0.555556, latent_proxy_mae = 0.902745, oscillations = 255, repeat_rate = 0.562500, autonomy_violations = 0, direct_accuracy_covered = 0.884722, response_brier = 0.232365 |
| `logistic_original/persistencia/bkt_item / by_profile / estavel_medio` | n = 1296, accuracy = 0.370370, difficulty_error = 0.629630, inadequate_challenge = 0.310185, false_change_when_adequate = 0.099537, coverage = 0.555556, latent_proxy_mae = 0.683658, oscillations = 263, repeat_rate = 0.492537, autonomy_violations = 0, direct_accuracy_covered = 0.373611, response_brier = 0.231074 |
| `logistic_original/persistencia/bkt_item / by_profile / estavel_dificil` | n = 1296, accuracy = 0.377315, difficulty_error = 0.622685, inadequate_challenge = 0.622685, false_change_when_adequate = 0.004630, coverage = 0.555556, latent_proxy_mae = 0.171618, oscillations = 241, repeat_rate = 0.586777, autonomy_violations = 0, direct_accuracy_covered = 0.952778, response_brier = 0.131218 |
| `logistic_original/persistencia/bkt_item / by_skill / MT:algebra` | n = 7776, accuracy = 0.358668, difficulty_error = 0.641332, inadequate_challenge = 0.640561, false_change_when_adequate = 0.064043, coverage = 0.666667, latent_proxy_mae = 0.909492, oscillations = 1772, repeat_rate = 0.633149, autonomy_violations = 0, direct_accuracy_covered = 0.617477, response_brier = 0.205279 |
| `logistic_original/persistencia/bkt_item / by_skill / CN:outra` | n = 3888, accuracy = 0.345936, difficulty_error = 0.654064, inadequate_challenge = 0.695473, false_change_when_adequate = 0.036265, coverage = 0.333333, latent_proxy_mae = 1.016529, oscillations = 468, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.625772, response_brier = 0.221247 |
| `logistic_original/persistencia/elo_item` | paired_ci95 = [-0.011145404663923183, -0.0018004115226337447], gain = -0.006344 |
| `logistic_original/persistencia/elo_item / overall` | n = 11664, accuracy = 0.333591, difficulty_error = 0.666409, inadequate_challenge = 0.677898, false_change_when_adequate = 0.079218, coverage = 0.555556, latent_proxy_mae = 0.949323, oscillations = 2102, repeat_rate = 0.529522, autonomy_violations = 0, direct_accuracy_covered = 0.420062, response_brier = 0.199905 |
| `logistic_original/persistencia/elo_item / by_profile / progressivo` | n = 1296, accuracy = 0.305556, difficulty_error = 0.694444, inadequate_challenge = 0.682099, false_change_when_adequate = 0.115741, coverage = 0.555556, latent_proxy_mae = 1.124920, oscillations = 216, repeat_rate = 0.500000, autonomy_violations = 0, direct_accuracy_covered = 0.083333, response_brier = 0.194658 |
| `logistic_original/persistencia/elo_item / by_profile / rapido` | n = 1296, accuracy = 0.292438, difficulty_error = 0.707562, inadequate_challenge = 0.800154, false_change_when_adequate = 0.125000, coverage = 0.555556, latent_proxy_mae = 1.335367, oscillations = 217, repeat_rate = 0.495495, autonomy_violations = 0, direct_accuracy_covered = 0.050000, response_brier = 0.204502 |
| `logistic_original/persistencia/elo_item / by_profile / queda` | n = 1296, accuracy = 0.350309, difficulty_error = 0.649691, inadequate_challenge = 0.888889, false_change_when_adequate = 0.046296, coverage = 0.555556, latent_proxy_mae = 1.445926, oscillations = 239, repeat_rate = 0.491803, autonomy_violations = 0, direct_accuracy_covered = 0.638889, response_brier = 0.224141 |
| `logistic_original/persistencia/elo_item / by_profile / queda_gradual` | n = 1296, accuracy = 0.339506, difficulty_error = 0.660494, inadequate_challenge = 0.734568, false_change_when_adequate = 0.069444, coverage = 0.555556, latent_proxy_mae = 1.195003, oscillations = 252, repeat_rate = 0.523438, autonomy_violations = 0, direct_accuracy_covered = 0.593056, response_brier = 0.218448 |
| `logistic_original/persistencia/elo_item / by_profile / irregular` | n = 1296, accuracy = 0.317901, difficulty_error = 0.682099, inadequate_challenge = 0.608025, false_change_when_adequate = 0.115741, coverage = 0.555556, latent_proxy_mae = 1.028237, oscillations = 246, repeat_rate = 0.568000, autonomy_violations = 0, direct_accuracy_covered = 0.322222, response_brier = 0.211040 |
| `logistic_original/persistencia/elo_item / by_profile / estavel_facil` | n = 1296, accuracy = 0.373457, difficulty_error = 0.626543, inadequate_challenge = 0.626543, false_change_when_adequate = 0.011574, coverage = 0.555556, latent_proxy_mae = 0.591254, oscillations = 244, repeat_rate = 0.590164, autonomy_violations = 0, direct_accuracy_covered = 0.956944, response_brier = 0.211281 |
| `logistic_original/persistencia/elo_item / by_profile / estavel_medio` | n = 1296, accuracy = 0.377315, difficulty_error = 0.622685, inadequate_challenge = 0.287037, false_change_when_adequate = 0.074074, coverage = 0.555556, latent_proxy_mae = 0.307278, oscillations = 238, repeat_rate = 0.553719, autonomy_violations = 0, direct_accuracy_covered = 0.530556, response_brier = 0.210731 |
| `logistic_original/persistencia/elo_item / by_profile / estavel_dificil` | n = 1296, accuracy = 0.308642, difficulty_error = 0.691358, inadequate_challenge = 0.691358, false_change_when_adequate = 0.097222, coverage = 0.555556, latent_proxy_mae = 0.770994, oscillations = 222, repeat_rate = 0.548673, autonomy_violations = 0, direct_accuracy_covered = 0.166667, response_brier = 0.156627 |
| `logistic_original/persistencia/elo_item / by_skill / MT:algebra` | n = 7776, accuracy = 0.333976, difficulty_error = 0.666024, inadequate_challenge = 0.661908, false_change_when_adequate = 0.094522, coverage = 0.666667, latent_proxy_mae = 0.928697, oscillations = 1685, repeat_rate = 0.660047, autonomy_violations = 0, direct_accuracy_covered = 0.406636, response_brier = 0.195444 |
| `logistic_original/persistencia/elo_item / by_skill / CN:outra` | n = 3888, accuracy = 0.332819, difficulty_error = 0.667181, inadequate_challenge = 0.709877, false_change_when_adequate = 0.048611, coverage = 0.333333, latent_proxy_mae = 1.031828, oscillations = 417, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.473765, response_brier = 0.208828 |
| `logistic_original/persistencia/rasch` | paired_ci95 = [-0.01046167695473251, -0.0021433470507544582], gain = -0.006344 |
| `logistic_original/persistencia/rasch / overall` | n = 11664, accuracy = 0.333591, difficulty_error = 0.666409, inadequate_challenge = 0.676955, false_change_when_adequate = 0.078447, coverage = 0.555556, latent_proxy_mae = 1.008779, oscillations = 2098, repeat_rate = 0.545198, autonomy_violations = 0, direct_accuracy_covered = 0.408179, response_brier = 0.203980 |
| `logistic_original/persistencia/rasch / by_profile / progressivo` | n = 1296, accuracy = 0.302469, difficulty_error = 0.697531, inadequate_challenge = 0.688272, false_change_when_adequate = 0.125000, coverage = 0.555556, latent_proxy_mae = 1.314971, oscillations = 223, repeat_rate = 0.535714, autonomy_violations = 0, direct_accuracy_covered = 0.047222, response_brier = 0.205307 |
| `logistic_original/persistencia/rasch / by_profile / rapido` | n = 1296, accuracy = 0.287809, difficulty_error = 0.712191, inadequate_challenge = 0.804784, false_change_when_adequate = 0.136574, coverage = 0.555556, latent_proxy_mae = 1.566622, oscillations = 221, repeat_rate = 0.504425, autonomy_violations = 0, direct_accuracy_covered = 0.008333, response_brier = 0.217513 |
| `logistic_original/persistencia/rasch / by_profile / queda` | n = 1296, accuracy = 0.342593, difficulty_error = 0.657407, inadequate_challenge = 0.888889, false_change_when_adequate = 0.053241, coverage = 0.555556, latent_proxy_mae = 1.680625, oscillations = 235, repeat_rate = 0.459016, autonomy_violations = 0, direct_accuracy_covered = 0.511111, response_brier = 0.239325 |
| `logistic_original/persistencia/rasch / by_profile / queda_gradual` | n = 1296, accuracy = 0.331019, difficulty_error = 0.668981, inadequate_challenge = 0.739969, false_change_when_adequate = 0.071759, coverage = 0.555556, latent_proxy_mae = 1.380201, oscillations = 240, repeat_rate = 0.532787, autonomy_violations = 0, direct_accuracy_covered = 0.468056, response_brier = 0.230373 |
| `logistic_original/persistencia/rasch / by_profile / irregular` | n = 1296, accuracy = 0.321759, difficulty_error = 0.678241, inadequate_challenge = 0.608796, false_change_when_adequate = 0.101852, coverage = 0.555556, latent_proxy_mae = 1.046304, oscillations = 237, repeat_rate = 0.596639, autonomy_violations = 0, direct_accuracy_covered = 0.326389, response_brier = 0.214257 |
| `logistic_original/persistencia/rasch / by_profile / estavel_facil` | n = 1296, accuracy = 0.375000, difficulty_error = 0.625000, inadequate_challenge = 0.625000, false_change_when_adequate = 0.013889, coverage = 0.555556, latent_proxy_mae = 0.492300, oscillations = 252, repeat_rate = 0.595238, autonomy_violations = 0, direct_accuracy_covered = 0.972222, response_brier = 0.205570 |
| `logistic_original/persistencia/rasch / by_profile / estavel_medio` | n = 1296, accuracy = 0.371142, difficulty_error = 0.628858, inadequate_challenge = 0.287809, false_change_when_adequate = 0.081019, coverage = 0.555556, latent_proxy_mae = 0.343928, oscillations = 236, repeat_rate = 0.588235, autonomy_violations = 0, direct_accuracy_covered = 0.477778, response_brier = 0.212719 |
| `logistic_original/persistencia/rasch / by_profile / estavel_dificil` | n = 1296, accuracy = 0.324846, difficulty_error = 0.675154, inadequate_challenge = 0.675154, false_change_when_adequate = 0.067130, coverage = 0.555556, latent_proxy_mae = 0.641723, oscillations = 208, repeat_rate = 0.523810, autonomy_violations = 0, direct_accuracy_covered = 0.313889, response_brier = 0.150751 |
| `logistic_original/persistencia/rasch / by_skill / MT:algebra` | n = 7776, accuracy = 0.333976, difficulty_error = 0.666024, inadequate_challenge = 0.661265, false_change_when_adequate = 0.094907, coverage = 0.666667, latent_proxy_mae = 1.004510, oscillations = 1694, repeat_rate = 0.674040, autonomy_violations = 0, direct_accuracy_covered = 0.391975, response_brier = 0.200876 |
| `logistic_original/persistencia/rasch / by_skill / CN:outra` | n = 3888, accuracy = 0.332819, difficulty_error = 0.667181, inadequate_challenge = 0.708333, false_change_when_adequate = 0.045525, coverage = 0.333333, latent_proxy_mae = 1.025855, oscillations = 404, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.472994, response_brier = 0.210188 |
| `logistic_original/persistencia/hibrido_item` | paired_ci95 = [-0.003260030864197531, 0.0034293552812071334], gain = 0.000086 |
| `logistic_original/persistencia/hibrido_item / overall` | n = 11664, accuracy = 0.340021, difficulty_error = 0.659979, inadequate_challenge = 0.671382, false_change_when_adequate = 0.072016, coverage = 0.555556, latent_proxy_mae = 0.965179, oscillations = 2169, repeat_rate = 0.545123, autonomy_violations = 0, direct_accuracy_covered = 0.465895, response_brier = 0.203683 |
| `logistic_original/persistencia/hibrido_item / by_profile / progressivo` | n = 1296, accuracy = 0.307870, difficulty_error = 0.692130, inadequate_challenge = 0.681327, false_change_when_adequate = 0.118056, coverage = 0.555556, latent_proxy_mae = 0.937606, oscillations = 232, repeat_rate = 0.504274, autonomy_violations = 0, direct_accuracy_covered = 0.090278, response_brier = 0.189890 |
| `logistic_original/persistencia/hibrido_item / by_profile / rapido` | n = 1296, accuracy = 0.290895, difficulty_error = 0.709105, inadequate_challenge = 0.801698, false_change_when_adequate = 0.127315, coverage = 0.555556, latent_proxy_mae = 1.164934, oscillations = 230, repeat_rate = 0.517241, autonomy_violations = 0, direct_accuracy_covered = 0.044444, response_brier = 0.199130 |
| `logistic_original/persistencia/hibrido_item / by_profile / queda` | n = 1296, accuracy = 0.341049, difficulty_error = 0.658951, inadequate_challenge = 0.888889, false_change_when_adequate = 0.060185, coverage = 0.555556, latent_proxy_mae = 1.826980, oscillations = 240, repeat_rate = 0.451613, autonomy_violations = 0, direct_accuracy_covered = 0.493056, response_brier = 0.250323 |
| `logistic_original/persistencia/hibrido_item / by_profile / queda_gradual` | n = 1296, accuracy = 0.327160, difficulty_error = 0.672840, inadequate_challenge = 0.742284, false_change_when_adequate = 0.085648, coverage = 0.555556, latent_proxy_mae = 1.539389, oscillations = 252, repeat_rate = 0.550388, autonomy_violations = 0, direct_accuracy_covered = 0.450000, response_brier = 0.241177 |
| `logistic_original/persistencia/hibrido_item / by_profile / irregular` | n = 1296, accuracy = 0.317130, difficulty_error = 0.682870, inadequate_challenge = 0.609568, false_change_when_adequate = 0.115741, coverage = 0.555556, latent_proxy_mae = 1.138353, oscillations = 247, repeat_rate = 0.588710, autonomy_violations = 0, direct_accuracy_covered = 0.308333, response_brier = 0.220801 |
| `logistic_original/persistencia/hibrido_item / by_profile / estavel_facil` | n = 1296, accuracy = 0.371914, difficulty_error = 0.628086, inadequate_challenge = 0.628086, false_change_when_adequate = 0.016204, coverage = 0.555556, latent_proxy_mae = 0.669973, oscillations = 248, repeat_rate = 0.588710, autonomy_violations = 0, direct_accuracy_covered = 0.938889, response_brier = 0.215626 |
| `logistic_original/persistencia/hibrido_item / by_profile / estavel_medio` | n = 1296, accuracy = 0.387346, difficulty_error = 0.612654, inadequate_challenge = 0.287809, false_change_when_adequate = 0.067130, coverage = 0.555556, latent_proxy_mae = 0.467304, oscillations = 255, repeat_rate = 0.546875, autonomy_violations = 0, direct_accuracy_covered = 0.587500, response_brier = 0.218436 |
| `logistic_original/persistencia/hibrido_item / by_profile / estavel_dificil` | n = 1296, accuracy = 0.354167, difficulty_error = 0.645833, inadequate_challenge = 0.645833, false_change_when_adequate = 0.030093, coverage = 0.555556, latent_proxy_mae = 0.422553, oscillations = 223, repeat_rate = 0.584071, autonomy_violations = 0, direct_accuracy_covered = 0.555556, response_brier = 0.138711 |
| `logistic_original/persistencia/hibrido_item / by_skill / MT:algebra` | n = 7776, accuracy = 0.342593, difficulty_error = 0.657407, inadequate_challenge = 0.653421, false_change_when_adequate = 0.084877, coverage = 0.666667, latent_proxy_mae = 0.952530, oscillations = 1745, repeat_rate = 0.677237, autonomy_violations = 0, direct_accuracy_covered = 0.458526, response_brier = 0.199361 |
| `logistic_original/persistencia/hibrido_item / by_skill / CN:outra` | n = 3888, accuracy = 0.334877, difficulty_error = 0.665123, inadequate_challenge = 0.707305, false_change_when_adequate = 0.046296, coverage = 0.333333, latent_proxy_mae = 1.015775, oscillations = 424, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.495370, response_brier = 0.212329 |
| `guessing_discrimination/original/taxa` | paired_ci95 = [0.0, 0.0], gain = 0.000000 |
| `guessing_discrimination/original/taxa / overall` | n = 11664, accuracy = 0.344822, difficulty_error = 0.655178, inadequate_challenge = 0.597908, false_change_when_adequate = 0.046039, coverage = 0.555556, latent_proxy_mae = 1.166650, oscillations = 1684, repeat_rate = 0.514188, autonomy_violations = 0, direct_accuracy_covered = 0.410031, response_brier = 0.215670 |
| `guessing_discrimination/original/taxa / by_profile / progressivo` | n = 1296, accuracy = 0.343364, difficulty_error = 0.656636, inadequate_challenge = 0.601080, false_change_when_adequate = 0.046296, coverage = 0.555556, latent_proxy_mae = 0.847098, oscillations = 166, repeat_rate = 0.463158, autonomy_violations = 0, direct_accuracy_covered = 0.312500, response_brier = 0.215138 |
| `guessing_discrimination/original/taxa / by_profile / rapido` | n = 1296, accuracy = 0.327932, difficulty_error = 0.672068, inadequate_challenge = 0.672068, false_change_when_adequate = 0.041667, coverage = 0.555556, latent_proxy_mae = 1.033867, oscillations = 124, repeat_rate = 0.400000, autonomy_violations = 0, direct_accuracy_covered = 0.306944, response_brier = 0.229826 |
| `guessing_discrimination/original/taxa / by_profile / queda` | n = 1296, accuracy = 0.307099, difficulty_error = 0.692901, inadequate_challenge = 0.692901, false_change_when_adequate = 0.087963, coverage = 0.555556, latent_proxy_mae = 2.352187, oscillations = 152, repeat_rate = 0.354430, autonomy_violations = 0, direct_accuracy_covered = 0.188889, response_brier = 0.256962 |
| `guessing_discrimination/original/taxa / by_profile / queda_gradual` | n = 1296, accuracy = 0.317130, difficulty_error = 0.682870, inadequate_challenge = 0.614198, false_change_when_adequate = 0.076389, coverage = 0.555556, latent_proxy_mae = 1.898642, oscillations = 182, repeat_rate = 0.494624, autonomy_violations = 0, direct_accuracy_covered = 0.212500, response_brier = 0.255408 |
| `guessing_discrimination/original/taxa / by_profile / irregular` | n = 1296, accuracy = 0.315586, difficulty_error = 0.684414, inadequate_challenge = 0.604938, false_change_when_adequate = 0.085648, coverage = 0.555556, latent_proxy_mae = 1.321954, oscillations = 174, repeat_rate = 0.532609, autonomy_violations = 0, direct_accuracy_covered = 0.236111, response_brier = 0.230336 |
| `guessing_discrimination/original/taxa / by_profile / estavel_facil` | n = 1296, accuracy = 0.358796, difficulty_error = 0.641204, inadequate_challenge = 0.641204, false_change_when_adequate = 0.020833, coverage = 0.555556, latent_proxy_mae = 1.062082, oscillations = 220, repeat_rate = 0.549550, autonomy_violations = 0, direct_accuracy_covered = 0.509722, response_brier = 0.236101 |
| `guessing_discrimination/original/taxa / by_profile / estavel_medio` | n = 1296, accuracy = 0.376543, difficulty_error = 0.623457, inadequate_challenge = 0.311728, false_change_when_adequate = 0.053241, coverage = 0.555556, latent_proxy_mae = 0.778781, oscillations = 193, repeat_rate = 0.519608, autonomy_violations = 0, direct_accuracy_covered = 0.620833, response_brier = 0.223878 |
| `guessing_discrimination/original/taxa / by_profile / estavel_dificil` | n = 1296, accuracy = 0.379630, difficulty_error = 0.620370, inadequate_challenge = 0.620370, false_change_when_adequate = 0.000000, coverage = 0.555556, latent_proxy_mae = 0.519929, oscillations = 236, repeat_rate = 0.600000, autonomy_violations = 0, direct_accuracy_covered = 0.661111, response_brier = 0.125465 |
| `guessing_discrimination/original/taxa / by_skill / MT:algebra` | n = 7776, accuracy = 0.346451, difficulty_error = 0.653549, inadequate_challenge = 0.597479, false_change_when_adequate = 0.055556, coverage = 0.666667, latent_proxy_mae = 1.156280, oscillations = 1345, repeat_rate = 0.648069, autonomy_violations = 0, direct_accuracy_covered = 0.403549, response_brier = 0.211106 |
| `guessing_discrimination/original/taxa / by_skill / CN:outra` | n = 3888, accuracy = 0.341564, difficulty_error = 0.658436, inadequate_challenge = 0.598765, false_change_when_adequate = 0.027006, coverage = 0.333333, latent_proxy_mae = 1.208128, oscillations = 339, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.435957, response_brier = 0.224798 |
| `guessing_discrimination/original/hibrido_antigo` | paired_ci95 = [-0.018689986282578876, -0.008659122085048012], gain = -0.013546 |
| `guessing_discrimination/original/hibrido_antigo / overall` | n = 11664, accuracy = 0.331276, difficulty_error = 0.668724, inadequate_challenge = 0.615226, false_change_when_adequate = 0.104938, coverage = 0.555556, latent_proxy_mae = 1.130510, oscillations = 2580, repeat_rate = 0.561485, autonomy_violations = 0, direct_accuracy_covered = 0.415123, response_brier = 0.211718 |
| `guessing_discrimination/original/hibrido_antigo / by_profile / progressivo` | n = 1296, accuracy = 0.327932, difficulty_error = 0.672068, inadequate_challenge = 0.616512, false_change_when_adequate = 0.115741, coverage = 0.555556, latent_proxy_mae = 0.519074, oscillations = 284, repeat_rate = 0.549296, autonomy_violations = 0, direct_accuracy_covered = 0.359722, response_brier = 0.191368 |
| `guessing_discrimination/original/hibrido_antigo / by_profile / rapido` | n = 1296, accuracy = 0.297068, difficulty_error = 0.702932, inadequate_challenge = 0.702932, false_change_when_adequate = 0.136574, coverage = 0.555556, latent_proxy_mae = 0.694386, oscillations = 262, repeat_rate = 0.572519, autonomy_violations = 0, direct_accuracy_covered = 0.250000, response_brier = 0.204820 |
| `guessing_discrimination/original/hibrido_antigo / by_profile / queda` | n = 1296, accuracy = 0.287809, difficulty_error = 0.712191, inadequate_challenge = 0.712191, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 2.543071, oscillations = 275, repeat_rate = 0.542857, autonomy_violations = 0, direct_accuracy_covered = 0.051389, response_brier = 0.260767 |
| `guessing_discrimination/original/hibrido_antigo / by_profile / queda_gradual` | n = 1296, accuracy = 0.305556, difficulty_error = 0.694444, inadequate_challenge = 0.629630, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 2.122366, oscillations = 306, repeat_rate = 0.535948, autonomy_violations = 0, direct_accuracy_covered = 0.134722, response_brier = 0.259544 |
| `guessing_discrimination/original/hibrido_antigo / by_profile / irregular` | n = 1296, accuracy = 0.325617, difficulty_error = 0.674383, inadequate_challenge = 0.600309, false_change_when_adequate = 0.111111, coverage = 0.555556, latent_proxy_mae = 1.317078, oscillations = 297, repeat_rate = 0.557047, autonomy_violations = 0, direct_accuracy_covered = 0.233333, response_brier = 0.223564 |
| `guessing_discrimination/original/hibrido_antigo / by_profile / estavel_facil` | n = 1296, accuracy = 0.310185, difficulty_error = 0.689815, inadequate_challenge = 0.689815, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 1.530537, oscillations = 302, repeat_rate = 0.562914, autonomy_violations = 0, direct_accuracy_covered = 0.411111, response_brier = 0.258473 |
| `guessing_discrimination/original/hibrido_antigo / by_profile / estavel_medio` | n = 1296, accuracy = 0.404321, difficulty_error = 0.595679, inadequate_challenge = 0.308642, false_change_when_adequate = 0.064815, coverage = 0.555556, latent_proxy_mae = 0.772235, oscillations = 296, repeat_rate = 0.574324, autonomy_violations = 0, direct_accuracy_covered = 0.540278, response_brier = 0.220271 |
| `guessing_discrimination/original/hibrido_antigo / by_profile / estavel_dificil` | n = 1296, accuracy = 0.363426, difficulty_error = 0.636574, inadequate_challenge = 0.636574, false_change_when_adequate = 0.048611, coverage = 0.555556, latent_proxy_mae = 0.161346, oscillations = 282, repeat_rate = 0.609929, autonomy_violations = 0, direct_accuracy_covered = 0.912500, response_brier = 0.114123 |
| `guessing_discrimination/original/hibrido_antigo / by_skill / MT:algebra` | n = 7776, accuracy = 0.332047, difficulty_error = 0.667953, inadequate_challenge = 0.617027, false_change_when_adequate = 0.123457, coverage = 0.666667, latent_proxy_mae = 1.094434, oscillations = 2035, repeat_rate = 0.711765, autonomy_violations = 0, direct_accuracy_covered = 0.419560, response_brier = 0.205657 |
| `guessing_discrimination/original/hibrido_antigo / by_skill / CN:outra` | n = 3888, accuracy = 0.329733, difficulty_error = 0.670267, inadequate_challenge = 0.611626, false_change_when_adequate = 0.067901, coverage = 0.333333, latent_proxy_mae = 1.274813, oscillations = 545, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.397377, response_brier = 0.223839 |
| `guessing_discrimination/original/bkt_item` | paired_ci95 = [0.003000685871056241, 0.011316872427983538], gain = 0.007202 |
| `guessing_discrimination/original/bkt_item / overall` | n = 11664, accuracy = 0.352023, difficulty_error = 0.647977, inadequate_challenge = 0.591564, false_change_when_adequate = 0.063014, coverage = 0.555556, latent_proxy_mae = 1.045129, oscillations = 2307, repeat_rate = 0.518010, autonomy_violations = 0, direct_accuracy_covered = 0.561420, response_brier = 0.206426 |
| `guessing_discrimination/original/bkt_item / by_profile / progressivo` | n = 1296, accuracy = 0.375000, difficulty_error = 0.625000, inadequate_challenge = 0.569444, false_change_when_adequate = 0.034722, coverage = 0.555556, latent_proxy_mae = 0.400896, oscillations = 266, repeat_rate = 0.500000, autonomy_violations = 0, direct_accuracy_covered = 0.684722, response_brier = 0.171894 |
| `guessing_discrimination/original/bkt_item / by_profile / rapido` | n = 1296, accuracy = 0.362654, difficulty_error = 0.637346, inadequate_challenge = 0.637346, false_change_when_adequate = 0.023148, coverage = 0.555556, latent_proxy_mae = 0.655406, oscillations = 242, repeat_rate = 0.500000, autonomy_violations = 0, direct_accuracy_covered = 0.618056, response_brier = 0.181212 |
| `guessing_discrimination/original/bkt_item / by_profile / queda` | n = 1296, accuracy = 0.318673, difficulty_error = 0.681327, inadequate_challenge = 0.681327, false_change_when_adequate = 0.101852, coverage = 0.555556, latent_proxy_mae = 2.387369, oscillations = 228, repeat_rate = 0.448276, autonomy_violations = 0, direct_accuracy_covered = 0.261111, response_brier = 0.264674 |
| `guessing_discrimination/original/bkt_item / by_profile / queda_gradual` | n = 1296, accuracy = 0.322531, difficulty_error = 0.677469, inadequate_challenge = 0.611111, false_change_when_adequate = 0.099537, coverage = 0.555556, latent_proxy_mae = 2.002236, oscillations = 254, repeat_rate = 0.468750, autonomy_violations = 0, direct_accuracy_covered = 0.290278, response_brier = 0.264930 |
| `guessing_discrimination/original/bkt_item / by_profile / irregular` | n = 1296, accuracy = 0.327160, difficulty_error = 0.672840, inadequate_challenge = 0.597222, false_change_when_adequate = 0.094907, coverage = 0.555556, latent_proxy_mae = 1.413243, oscillations = 258, repeat_rate = 0.492308, autonomy_violations = 0, direct_accuracy_covered = 0.251389, response_brier = 0.231020 |
| `guessing_discrimination/original/bkt_item / by_profile / estavel_facil` | n = 1296, accuracy = 0.347222, difficulty_error = 0.652778, inadequate_challenge = 0.652778, false_change_when_adequate = 0.078704, coverage = 0.555556, latent_proxy_mae = 1.127851, oscillations = 294, repeat_rate = 0.523179, autonomy_violations = 0, direct_accuracy_covered = 0.720833, response_brier = 0.246005 |
| `guessing_discrimination/original/bkt_item / by_profile / estavel_medio` | n = 1296, accuracy = 0.356481, difficulty_error = 0.643519, inadequate_challenge = 0.333333, false_change_when_adequate = 0.131944, coverage = 0.555556, latent_proxy_mae = 0.767232, oscillations = 283, repeat_rate = 0.534722, autonomy_violations = 0, direct_accuracy_covered = 0.362500, response_brier = 0.226430 |
| `guessing_discrimination/original/bkt_item / by_profile / estavel_dificil` | n = 1296, accuracy = 0.379630, difficulty_error = 0.620370, inadequate_challenge = 0.620370, false_change_when_adequate = 0.000000, coverage = 0.555556, latent_proxy_mae = 0.179261, oscillations = 240, repeat_rate = 0.600000, autonomy_violations = 0, direct_accuracy_covered = 0.938889, response_brier = 0.111206 |
| `guessing_discrimination/original/bkt_item / by_skill / MT:algebra` | n = 7776, accuracy = 0.355838, difficulty_error = 0.644162, inadequate_challenge = 0.589506, false_change_when_adequate = 0.075231, coverage = 0.666667, latent_proxy_mae = 1.023477, oscillations = 1827, repeat_rate = 0.654388, autonomy_violations = 0, direct_accuracy_covered = 0.561535, response_brier = 0.200865 |
| `guessing_discrimination/original/bkt_item / by_skill / CN:outra` | n = 3888, accuracy = 0.344393, difficulty_error = 0.655607, inadequate_challenge = 0.595679, false_change_when_adequate = 0.038580, coverage = 0.333333, latent_proxy_mae = 1.131738, oscillations = 480, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.560957, response_brier = 0.217548 |
| `guessing_discrimination/original/elo_item` | paired_ci95 = [-0.007716049382716049, 0.0020576131687242796], gain = -0.002829 |
| `guessing_discrimination/original/elo_item / overall` | n = 11664, accuracy = 0.341992, difficulty_error = 0.658008, inadequate_challenge = 0.598337, false_change_when_adequate = 0.064300, coverage = 0.555556, latent_proxy_mae = 0.980402, oscillations = 2017, repeat_rate = 0.514174, autonomy_violations = 0, direct_accuracy_covered = 0.431481, response_brier = 0.200032 |
| `guessing_discrimination/original/elo_item / by_profile / progressivo` | n = 1296, accuracy = 0.316358, difficulty_error = 0.683642, inadequate_challenge = 0.628086, false_change_when_adequate = 0.087963, coverage = 0.555556, latent_proxy_mae = 0.974497, oscillations = 194, repeat_rate = 0.459184, autonomy_violations = 0, direct_accuracy_covered = 0.131944, response_brier = 0.186199 |
| `guessing_discrimination/original/elo_item / by_profile / rapido` | n = 1296, accuracy = 0.304012, difficulty_error = 0.695988, inadequate_challenge = 0.695988, false_change_when_adequate = 0.097222, coverage = 0.555556, latent_proxy_mae = 1.192746, oscillations = 185, repeat_rate = 0.410526, autonomy_violations = 0, direct_accuracy_covered = 0.152778, response_brier = 0.196411 |
| `guessing_discrimination/original/elo_item / by_profile / queda` | n = 1296, accuracy = 0.337191, difficulty_error = 0.662809, inadequate_challenge = 0.662809, false_change_when_adequate = 0.076389, coverage = 0.555556, latent_proxy_mae = 1.702686, oscillations = 259, repeat_rate = 0.496183, autonomy_violations = 0, direct_accuracy_covered = 0.436111, response_brier = 0.230947 |
| `guessing_discrimination/original/elo_item / by_profile / queda_gradual` | n = 1296, accuracy = 0.358796, difficulty_error = 0.641204, inadequate_challenge = 0.571759, false_change_when_adequate = 0.048611, coverage = 0.555556, latent_proxy_mae = 1.340027, oscillations = 238, repeat_rate = 0.528455, autonomy_violations = 0, direct_accuracy_covered = 0.488889, response_brier = 0.228868 |
| `guessing_discrimination/original/elo_item / by_profile / irregular` | n = 1296, accuracy = 0.317130, difficulty_error = 0.682870, inadequate_challenge = 0.599537, false_change_when_adequate = 0.118056, coverage = 0.555556, latent_proxy_mae = 1.057694, oscillations = 240, repeat_rate = 0.585366, autonomy_violations = 0, direct_accuracy_covered = 0.263889, response_brier = 0.217513 |
| `guessing_discrimination/original/elo_item / by_profile / estavel_facil` | n = 1296, accuracy = 0.368056, difficulty_error = 0.631944, inadequate_challenge = 0.631944, false_change_when_adequate = 0.025463, coverage = 0.555556, latent_proxy_mae = 0.820736, oscillations = 254, repeat_rate = 0.559055, autonomy_violations = 0, direct_accuracy_covered = 0.855556, response_brier = 0.223874 |
| `guessing_discrimination/original/elo_item / by_profile / estavel_medio` | n = 1296, accuracy = 0.383488, difficulty_error = 0.616512, inadequate_challenge = 0.287809, false_change_when_adequate = 0.048611, coverage = 0.555556, latent_proxy_mae = 0.346169, oscillations = 213, repeat_rate = 0.523364, autonomy_violations = 0, direct_accuracy_covered = 0.595833, response_brier = 0.211418 |
| `guessing_discrimination/original/elo_item / by_profile / estavel_dificil` | n = 1296, accuracy = 0.334877, difficulty_error = 0.665123, inadequate_challenge = 0.665123, false_change_when_adequate = 0.053241, coverage = 0.555556, latent_proxy_mae = 0.648101, oscillations = 214, repeat_rate = 0.537037, autonomy_violations = 0, direct_accuracy_covered = 0.394444, response_brier = 0.141398 |
| `guessing_discrimination/original/elo_item / by_skill / MT:algebra` | n = 7776, accuracy = 0.346965, difficulty_error = 0.653035, inadequate_challenge = 0.594007, false_change_when_adequate = 0.070988, coverage = 0.666667, latent_proxy_mae = 0.957010, oscillations = 1600, repeat_rate = 0.648582, autonomy_violations = 0, direct_accuracy_covered = 0.432677, response_brier = 0.193811 |
| `guessing_discrimination/original/elo_item / by_skill / CN:outra` | n = 3888, accuracy = 0.332047, difficulty_error = 0.667953, inadequate_challenge = 0.606996, false_change_when_adequate = 0.050926, coverage = 0.333333, latent_proxy_mae = 1.073971, oscillations = 417, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.426698, response_brier = 0.212473 |
| `guessing_discrimination/original/rasch` | paired_ci95 = [-0.007460991083676268, 0.0010288065843621398], gain = -0.003258 |
| `guessing_discrimination/original/rasch / overall` | n = 11664, accuracy = 0.341564, difficulty_error = 0.658436, inadequate_challenge = 0.599194, false_change_when_adequate = 0.063272, coverage = 0.555556, latent_proxy_mae = 1.043220, oscillations = 1985, repeat_rate = 0.529121, autonomy_violations = 0, direct_accuracy_covered = 0.416049, response_brier = 0.202678 |
| `guessing_discrimination/original/rasch / by_profile / progressivo` | n = 1296, accuracy = 0.305556, difficulty_error = 0.694444, inadequate_challenge = 0.638889, false_change_when_adequate = 0.118056, coverage = 0.555556, latent_proxy_mae = 1.135819, oscillations = 205, repeat_rate = 0.509259, autonomy_violations = 0, direct_accuracy_covered = 0.062500, response_brier = 0.198242 |
| `guessing_discrimination/original/rasch / by_profile / rapido` | n = 1296, accuracy = 0.296296, difficulty_error = 0.703704, inadequate_challenge = 0.703704, false_change_when_adequate = 0.113426, coverage = 0.555556, latent_proxy_mae = 1.386313, oscillations = 191, repeat_rate = 0.443299, autonomy_violations = 0, direct_accuracy_covered = 0.086111, response_brier = 0.210472 |
| `guessing_discrimination/original/rasch / by_profile / queda` | n = 1296, accuracy = 0.327160, difficulty_error = 0.672840, inadequate_challenge = 0.672840, false_change_when_adequate = 0.081019, coverage = 0.555556, latent_proxy_mae = 1.940914, oscillations = 248, repeat_rate = 0.433071, autonomy_violations = 0, direct_accuracy_covered = 0.320833, response_brier = 0.241591 |
| `guessing_discrimination/original/rasch / by_profile / queda_gradual` | n = 1296, accuracy = 0.344907, difficulty_error = 0.655093, inadequate_challenge = 0.586420, false_change_when_adequate = 0.053241, coverage = 0.555556, latent_proxy_mae = 1.519235, oscillations = 216, repeat_rate = 0.540541, autonomy_violations = 0, direct_accuracy_covered = 0.355556, response_brier = 0.236953 |
| `guessing_discrimination/original/rasch / by_profile / irregular` | n = 1296, accuracy = 0.317901, difficulty_error = 0.682099, inadequate_challenge = 0.602623, false_change_when_adequate = 0.108796, coverage = 0.555556, latent_proxy_mae = 1.082804, oscillations = 229, repeat_rate = 0.598291, autonomy_violations = 0, direct_accuracy_covered = 0.258333, response_brier = 0.218580 |
| `guessing_discrimination/original/rasch / by_profile / estavel_facil` | n = 1296, accuracy = 0.369599, difficulty_error = 0.630401, inadequate_challenge = 0.630401, false_change_when_adequate = 0.020833, coverage = 0.555556, latent_proxy_mae = 0.749887, oscillations = 248, repeat_rate = 0.568000, autonomy_violations = 0, direct_accuracy_covered = 0.887500, response_brier = 0.222641 |
| `guessing_discrimination/original/rasch / by_profile / estavel_medio` | n = 1296, accuracy = 0.381944, difficulty_error = 0.618056, inadequate_challenge = 0.288580, false_change_when_adequate = 0.043981, coverage = 0.555556, latent_proxy_mae = 0.392303, oscillations = 198, repeat_rate = 0.534653, autonomy_violations = 0, direct_accuracy_covered = 0.563889, response_brier = 0.212787 |
| `guessing_discrimination/original/rasch / by_profile / estavel_dificil` | n = 1296, accuracy = 0.361883, difficulty_error = 0.638117, inadequate_challenge = 0.638117, false_change_when_adequate = 0.016204, coverage = 0.555556, latent_proxy_mae = 0.554312, oscillations = 216, repeat_rate = 0.572727, autonomy_violations = 0, direct_accuracy_covered = 0.540278, response_brier = 0.127037 |
| `guessing_discrimination/original/rasch / by_skill / MT:algebra` | n = 7776, accuracy = 0.344907, difficulty_error = 0.655093, inadequate_challenge = 0.596708, false_change_when_adequate = 0.072917, coverage = 0.666667, latent_proxy_mae = 1.035544, oscillations = 1588, repeat_rate = 0.665012, autonomy_violations = 0, direct_accuracy_covered = 0.407407, response_brier = 0.197807 |
| `guessing_discrimination/original/rasch / by_skill / CN:outra` | n = 3888, accuracy = 0.334877, difficulty_error = 0.665123, inadequate_challenge = 0.604167, false_change_when_adequate = 0.043981, coverage = 0.333333, latent_proxy_mae = 1.073925, oscillations = 397, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.450617, response_brier = 0.212420 |
| `guessing_discrimination/original/hibrido_item` | paired_ci95 = [-0.003515089163237311, 0.003943758573388203], gain = 0.000171 |
| `guessing_discrimination/original/hibrido_item / overall` | n = 11664, accuracy = 0.344993, difficulty_error = 0.655007, inadequate_challenge = 0.597565, false_change_when_adequate = 0.066101, coverage = 0.555556, latent_proxy_mae = 1.028535, oscillations = 2177, repeat_rate = 0.526892, autonomy_violations = 0, direct_accuracy_covered = 0.444907, response_brier = 0.201174 |
| `guessing_discrimination/original/hibrido_item / by_profile / progressivo` | n = 1296, accuracy = 0.319444, difficulty_error = 0.680556, inadequate_challenge = 0.625000, false_change_when_adequate = 0.097222, coverage = 0.555556, latent_proxy_mae = 0.796246, oscillations = 227, repeat_rate = 0.491228, autonomy_violations = 0, direct_accuracy_covered = 0.161111, response_brier = 0.180565 |
| `guessing_discrimination/original/hibrido_item / by_profile / rapido` | n = 1296, accuracy = 0.302469, difficulty_error = 0.697531, inadequate_challenge = 0.697531, false_change_when_adequate = 0.101852, coverage = 0.555556, latent_proxy_mae = 1.055790, oscillations = 205, repeat_rate = 0.457143, autonomy_violations = 0, direct_accuracy_covered = 0.169444, response_brier = 0.191370 |
| `guessing_discrimination/original/hibrido_item / by_profile / queda` | n = 1296, accuracy = 0.322531, difficulty_error = 0.677469, inadequate_challenge = 0.677469, false_change_when_adequate = 0.094907, coverage = 0.555556, latent_proxy_mae = 2.143692, oscillations = 253, repeat_rate = 0.421875, autonomy_violations = 0, direct_accuracy_covered = 0.284722, response_brier = 0.250166 |
| `guessing_discrimination/original/hibrido_item / by_profile / queda_gradual` | n = 1296, accuracy = 0.339506, difficulty_error = 0.660494, inadequate_challenge = 0.594136, false_change_when_adequate = 0.074074, coverage = 0.555556, latent_proxy_mae = 1.738115, oscillations = 250, repeat_rate = 0.531250, autonomy_violations = 0, direct_accuracy_covered = 0.333333, response_brier = 0.247514 |
| `guessing_discrimination/original/hibrido_item / by_profile / irregular` | n = 1296, accuracy = 0.320216, difficulty_error = 0.679784, inadequate_challenge = 0.601852, false_change_when_adequate = 0.108796, coverage = 0.555556, latent_proxy_mae = 1.202937, oscillations = 245, repeat_rate = 0.577236, autonomy_violations = 0, direct_accuracy_covered = 0.240278, response_brier = 0.220664 |
| `guessing_discrimination/original/hibrido_item / by_profile / estavel_facil` | n = 1296, accuracy = 0.361111, difficulty_error = 0.638889, inadequate_challenge = 0.638889, false_change_when_adequate = 0.039352, coverage = 0.555556, latent_proxy_mae = 0.920891, oscillations = 260, repeat_rate = 0.553846, autonomy_violations = 0, direct_accuracy_covered = 0.800000, response_brier = 0.231026 |
| `guessing_discrimination/original/hibrido_item / by_profile / estavel_medio` | n = 1296, accuracy = 0.385802, difficulty_error = 0.614198, inadequate_challenge = 0.297068, false_change_when_adequate = 0.067130, coverage = 0.555556, latent_proxy_mae = 0.528542, oscillations = 251, repeat_rate = 0.531746, autonomy_violations = 0, direct_accuracy_covered = 0.623611, response_brier = 0.215926 |
| `guessing_discrimination/original/hibrido_item / by_profile / estavel_dificil` | n = 1296, accuracy = 0.377315, difficulty_error = 0.622685, inadequate_challenge = 0.622685, false_change_when_adequate = 0.004630, coverage = 0.555556, latent_proxy_mae = 0.350821, oscillations = 242, repeat_rate = 0.586777, autonomy_violations = 0, direct_accuracy_covered = 0.666667, response_brier = 0.117452 |
| `guessing_discrimination/original/hibrido_item / by_skill / MT:algebra` | n = 7776, accuracy = 0.349408, difficulty_error = 0.650592, inadequate_challenge = 0.594779, false_change_when_adequate = 0.074460, coverage = 0.666667, latent_proxy_mae = 1.011993, oscillations = 1723, repeat_rate = 0.665899, autonomy_violations = 0, direct_accuracy_covered = 0.440586, response_brier = 0.195894 |
| `guessing_discrimination/original/hibrido_item / by_skill / CN:outra` | n = 3888, accuracy = 0.336163, difficulty_error = 0.663837, inadequate_challenge = 0.603138, false_change_when_adequate = 0.049383, coverage = 0.333333, latent_proxy_mae = 1.094704, oscillations = 454, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.462191, response_brier = 0.211735 |
| `guessing_discrimination/persistencia/taxa` | paired_ci95 = [0.0, 0.0], gain = 0.000000 |
| `guessing_discrimination/persistencia/taxa / overall` | n = 11664, accuracy = 0.343536, difficulty_error = 0.656464, inadequate_challenge = 0.598680, false_change_when_adequate = 0.040381, coverage = 0.555556, latent_proxy_mae = 1.166650, oscillations = 1542, repeat_rate = 0.507079, autonomy_violations = 0, direct_accuracy_covered = 0.410031, response_brier = 0.215670 |
| `guessing_discrimination/persistencia/taxa / by_profile / progressivo` | n = 1296, accuracy = 0.334877, difficulty_error = 0.665123, inadequate_challenge = 0.609568, false_change_when_adequate = 0.043981, coverage = 0.555556, latent_proxy_mae = 0.847098, oscillations = 136, repeat_rate = 0.441176, autonomy_violations = 0, direct_accuracy_covered = 0.312500, response_brier = 0.215138 |
| `guessing_discrimination/persistencia/taxa / by_profile / rapido` | n = 1296, accuracy = 0.323302, difficulty_error = 0.676698, inadequate_challenge = 0.676698, false_change_when_adequate = 0.039352, coverage = 0.555556, latent_proxy_mae = 1.033867, oscillations = 104, repeat_rate = 0.307692, autonomy_violations = 0, direct_accuracy_covered = 0.306944, response_brier = 0.229826 |
| `guessing_discrimination/persistencia/taxa / by_profile / queda` | n = 1296, accuracy = 0.307870, difficulty_error = 0.692130, inadequate_challenge = 0.692130, false_change_when_adequate = 0.083333, coverage = 0.555556, latent_proxy_mae = 2.352187, oscillations = 141, repeat_rate = 0.356164, autonomy_violations = 0, direct_accuracy_covered = 0.188889, response_brier = 0.256962 |
| `guessing_discrimination/persistencia/taxa / by_profile / queda_gradual` | n = 1296, accuracy = 0.318673, difficulty_error = 0.681327, inadequate_challenge = 0.612654, false_change_when_adequate = 0.069444, coverage = 0.555556, latent_proxy_mae = 1.898642, oscillations = 167, repeat_rate = 0.458824, autonomy_violations = 0, direct_accuracy_covered = 0.212500, response_brier = 0.255408 |
| `guessing_discrimination/persistencia/taxa / by_profile / irregular` | n = 1296, accuracy = 0.322531, difficulty_error = 0.677469, inadequate_challenge = 0.600309, false_change_when_adequate = 0.064815, coverage = 0.555556, latent_proxy_mae = 1.321954, oscillations = 146, repeat_rate = 0.534247, autonomy_violations = 0, direct_accuracy_covered = 0.236111, response_brier = 0.230336 |
| `guessing_discrimination/persistencia/taxa / by_profile / estavel_facil` | n = 1296, accuracy = 0.357253, difficulty_error = 0.642747, inadequate_challenge = 0.642747, false_change_when_adequate = 0.018519, coverage = 0.555556, latent_proxy_mae = 1.062082, oscillations = 212, repeat_rate = 0.551402, autonomy_violations = 0, direct_accuracy_covered = 0.509722, response_brier = 0.236101 |
| `guessing_discrimination/persistencia/taxa / by_profile / estavel_medio` | n = 1296, accuracy = 0.371142, difficulty_error = 0.628858, inadequate_challenge = 0.310185, false_change_when_adequate = 0.041667, coverage = 0.555556, latent_proxy_mae = 0.778781, oscillations = 169, repeat_rate = 0.541176, autonomy_violations = 0, direct_accuracy_covered = 0.620833, response_brier = 0.223878 |
| `guessing_discrimination/persistencia/taxa / by_profile / estavel_dificil` | n = 1296, accuracy = 0.378858, difficulty_error = 0.621142, inadequate_challenge = 0.621142, false_change_when_adequate = 0.000000, coverage = 0.555556, latent_proxy_mae = 0.519929, oscillations = 232, repeat_rate = 0.586207, autonomy_violations = 0, direct_accuracy_covered = 0.661111, response_brier = 0.125465 |
| `guessing_discrimination/persistencia/taxa / by_skill / MT:algebra` | n = 7776, accuracy = 0.345165, difficulty_error = 0.654835, inadequate_challenge = 0.598508, false_change_when_adequate = 0.049383, coverage = 0.666667, latent_proxy_mae = 1.156280, oscillations = 1235, repeat_rate = 0.635484, autonomy_violations = 0, direct_accuracy_covered = 0.403549, response_brier = 0.211106 |
| `guessing_discrimination/persistencia/taxa / by_skill / CN:outra` | n = 3888, accuracy = 0.340278, difficulty_error = 0.659722, inadequate_challenge = 0.599023, false_change_when_adequate = 0.022377, coverage = 0.333333, latent_proxy_mae = 1.208128, oscillations = 307, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.435957, response_brier = 0.224798 |
| `guessing_discrimination/persistencia/hibrido_antigo` | paired_ci95 = [-0.019718792866941014, -0.009173525377229081], gain = -0.014403 |
| `guessing_discrimination/persistencia/hibrido_antigo / overall` | n = 11664, accuracy = 0.329132, difficulty_error = 0.670868, inadequate_challenge = 0.617541, false_change_when_adequate = 0.104938, coverage = 0.555556, latent_proxy_mae = 1.130510, oscillations = 2494, repeat_rate = 0.562898, autonomy_violations = 0, direct_accuracy_covered = 0.415123, response_brier = 0.211718 |
| `guessing_discrimination/persistencia/hibrido_antigo / by_profile / progressivo` | n = 1296, accuracy = 0.329475, difficulty_error = 0.670525, inadequate_challenge = 0.614969, false_change_when_adequate = 0.113426, coverage = 0.555556, latent_proxy_mae = 0.519074, oscillations = 278, repeat_rate = 0.549296, autonomy_violations = 0, direct_accuracy_covered = 0.359722, response_brier = 0.191368 |
| `guessing_discrimination/persistencia/hibrido_antigo / by_profile / rapido` | n = 1296, accuracy = 0.296296, difficulty_error = 0.703704, inadequate_challenge = 0.703704, false_change_when_adequate = 0.136574, coverage = 0.555556, latent_proxy_mae = 0.694386, oscillations = 257, repeat_rate = 0.576923, autonomy_violations = 0, direct_accuracy_covered = 0.250000, response_brier = 0.204820 |
| `guessing_discrimination/persistencia/hibrido_antigo / by_profile / queda` | n = 1296, accuracy = 0.287037, difficulty_error = 0.712963, inadequate_challenge = 0.712963, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 2.543071, oscillations = 263, repeat_rate = 0.522727, autonomy_violations = 0, direct_accuracy_covered = 0.051389, response_brier = 0.260767 |
| `guessing_discrimination/persistencia/hibrido_antigo / by_profile / queda_gradual` | n = 1296, accuracy = 0.307099, difficulty_error = 0.692901, inadequate_challenge = 0.629630, false_change_when_adequate = 0.131944, coverage = 0.555556, latent_proxy_mae = 2.122366, oscillations = 293, repeat_rate = 0.544218, autonomy_violations = 0, direct_accuracy_covered = 0.134722, response_brier = 0.259544 |
| `guessing_discrimination/persistencia/hibrido_antigo / by_profile / irregular` | n = 1296, accuracy = 0.309414, difficulty_error = 0.690586, inadequate_challenge = 0.616512, false_change_when_adequate = 0.134259, coverage = 0.555556, latent_proxy_mae = 1.317078, oscillations = 289, repeat_rate = 0.565517, autonomy_violations = 0, direct_accuracy_covered = 0.233333, response_brier = 0.223564 |
| `guessing_discrimination/persistencia/hibrido_antigo / by_profile / estavel_facil` | n = 1296, accuracy = 0.301698, difficulty_error = 0.698302, inadequate_challenge = 0.698302, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 1.530537, oscillations = 279, repeat_rate = 0.571429, autonomy_violations = 0, direct_accuracy_covered = 0.411111, response_brier = 0.258473 |
| `guessing_discrimination/persistencia/hibrido_antigo / by_profile / estavel_medio` | n = 1296, accuracy = 0.405864, difficulty_error = 0.594136, inadequate_challenge = 0.307099, false_change_when_adequate = 0.060185, coverage = 0.555556, latent_proxy_mae = 0.772235, oscillations = 291, repeat_rate = 0.582192, autonomy_violations = 0, direct_accuracy_covered = 0.540278, response_brier = 0.220271 |
| `guessing_discrimination/persistencia/hibrido_antigo / by_profile / estavel_dificil` | n = 1296, accuracy = 0.366512, difficulty_error = 0.633488, inadequate_challenge = 0.633488, false_change_when_adequate = 0.039352, coverage = 0.555556, latent_proxy_mae = 0.161346, oscillations = 273, repeat_rate = 0.598540, autonomy_violations = 0, direct_accuracy_covered = 0.912500, response_brier = 0.114123 |
| `guessing_discrimination/persistencia/hibrido_antigo / by_skill / MT:algebra` | n = 7776, accuracy = 0.331019, difficulty_error = 0.668981, inadequate_challenge = 0.618313, false_change_when_adequate = 0.121142, coverage = 0.666667, latent_proxy_mae = 1.094434, oscillations = 1970, repeat_rate = 0.713421, autonomy_violations = 0, direct_accuracy_covered = 0.419560, response_brier = 0.205657 |
| `guessing_discrimination/persistencia/hibrido_antigo / by_skill / CN:outra` | n = 3888, accuracy = 0.325360, difficulty_error = 0.674640, inadequate_challenge = 0.615998, false_change_when_adequate = 0.072531, coverage = 0.333333, latent_proxy_mae = 1.274813, oscillations = 524, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.397377, response_brier = 0.223839 |
| `guessing_discrimination/persistencia/bkt_item` | paired_ci95 = [0.005486968449931413, 0.013631687242798353], gain = 0.009516 |
| `guessing_discrimination/persistencia/bkt_item / overall` | n = 11664, accuracy = 0.353052, difficulty_error = 0.646948, inadequate_challenge = 0.590621, false_change_when_adequate = 0.053498, coverage = 0.555556, latent_proxy_mae = 1.045129, oscillations = 2119, repeat_rate = 0.517114, autonomy_violations = 0, direct_accuracy_covered = 0.561420, response_brier = 0.206426 |
| `guessing_discrimination/persistencia/bkt_item / by_profile / progressivo` | n = 1296, accuracy = 0.373457, difficulty_error = 0.626543, inadequate_challenge = 0.570988, false_change_when_adequate = 0.027778, coverage = 0.555556, latent_proxy_mae = 0.400896, oscillations = 253, repeat_rate = 0.492308, autonomy_violations = 0, direct_accuracy_covered = 0.684722, response_brier = 0.171894 |
| `guessing_discrimination/persistencia/bkt_item / by_profile / rapido` | n = 1296, accuracy = 0.360340, difficulty_error = 0.639660, inadequate_challenge = 0.639660, false_change_when_adequate = 0.023148, coverage = 0.555556, latent_proxy_mae = 0.655406, oscillations = 214, repeat_rate = 0.486726, autonomy_violations = 0, direct_accuracy_covered = 0.618056, response_brier = 0.181212 |
| `guessing_discrimination/persistencia/bkt_item / by_profile / queda` | n = 1296, accuracy = 0.320988, difficulty_error = 0.679012, inadequate_challenge = 0.679012, false_change_when_adequate = 0.090278, coverage = 0.555556, latent_proxy_mae = 2.387369, oscillations = 203, repeat_rate = 0.415094, autonomy_violations = 0, direct_accuracy_covered = 0.261111, response_brier = 0.264674 |
| `guessing_discrimination/persistencia/bkt_item / by_profile / queda_gradual` | n = 1296, accuracy = 0.319444, difficulty_error = 0.680556, inadequate_challenge = 0.612654, false_change_when_adequate = 0.092593, coverage = 0.555556, latent_proxy_mae = 2.002236, oscillations = 231, repeat_rate = 0.461538, autonomy_violations = 0, direct_accuracy_covered = 0.290278, response_brier = 0.264930 |
| `guessing_discrimination/persistencia/bkt_item / by_profile / irregular` | n = 1296, accuracy = 0.327160, difficulty_error = 0.672840, inadequate_challenge = 0.595679, false_change_when_adequate = 0.090278, coverage = 0.555556, latent_proxy_mae = 1.413243, oscillations = 224, repeat_rate = 0.517544, autonomy_violations = 0, direct_accuracy_covered = 0.251389, response_brier = 0.231020 |
| `guessing_discrimination/persistencia/bkt_item / by_profile / estavel_facil` | n = 1296, accuracy = 0.352623, difficulty_error = 0.647377, inadequate_challenge = 0.647377, false_change_when_adequate = 0.050926, coverage = 0.555556, latent_proxy_mae = 1.127851, oscillations = 255, repeat_rate = 0.534884, autonomy_violations = 0, direct_accuracy_covered = 0.720833, response_brier = 0.246005 |
| `guessing_discrimination/persistencia/bkt_item / by_profile / estavel_medio` | n = 1296, accuracy = 0.364969, difficulty_error = 0.635031, inadequate_challenge = 0.328704, false_change_when_adequate = 0.104167, coverage = 0.555556, latent_proxy_mae = 0.767232, oscillations = 258, repeat_rate = 0.534351, autonomy_violations = 0, direct_accuracy_covered = 0.362500, response_brier = 0.226430 |
| `guessing_discrimination/persistencia/bkt_item / by_profile / estavel_dificil` | n = 1296, accuracy = 0.379630, difficulty_error = 0.620370, inadequate_challenge = 0.620370, false_change_when_adequate = 0.000000, coverage = 0.555556, latent_proxy_mae = 0.179261, oscillations = 240, repeat_rate = 0.600000, autonomy_violations = 0, direct_accuracy_covered = 0.938889, response_brier = 0.111206 |
| `guessing_discrimination/persistencia/bkt_item / by_skill / MT:algebra` | n = 7776, accuracy = 0.356224, difficulty_error = 0.643776, inadequate_challenge = 0.588863, false_change_when_adequate = 0.064815, coverage = 0.666667, latent_proxy_mae = 1.023477, oscillations = 1678, repeat_rate = 0.653037, autonomy_violations = 0, direct_accuracy_covered = 0.561535, response_brier = 0.200865 |
| `guessing_discrimination/persistencia/bkt_item / by_skill / CN:outra` | n = 3888, accuracy = 0.346708, difficulty_error = 0.653292, inadequate_challenge = 0.594136, false_change_when_adequate = 0.030864, coverage = 0.333333, latent_proxy_mae = 1.131738, oscillations = 441, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.560957, response_brier = 0.217548 |
| `guessing_discrimination/persistencia/elo_item` | paired_ci95 = [-0.005403377914951988, 0.003172153635116598], gain = -0.001115 |
| `guessing_discrimination/persistencia/elo_item / overall` | n = 11664, accuracy = 0.342421, difficulty_error = 0.657579, inadequate_challenge = 0.598508, false_change_when_adequate = 0.054527, coverage = 0.555556, latent_proxy_mae = 0.980402, oscillations = 1849, repeat_rate = 0.505330, autonomy_violations = 0, direct_accuracy_covered = 0.431481, response_brier = 0.200032 |
| `guessing_discrimination/persistencia/elo_item / by_profile / progressivo` | n = 1296, accuracy = 0.317130, difficulty_error = 0.682870, inadequate_challenge = 0.627315, false_change_when_adequate = 0.083333, coverage = 0.555556, latent_proxy_mae = 0.974497, oscillations = 180, repeat_rate = 0.456522, autonomy_violations = 0, direct_accuracy_covered = 0.131944, response_brier = 0.186199 |
| `guessing_discrimination/persistencia/elo_item / by_profile / rapido` | n = 1296, accuracy = 0.303241, difficulty_error = 0.696759, inadequate_challenge = 0.696759, false_change_when_adequate = 0.094907, coverage = 0.555556, latent_proxy_mae = 1.192746, oscillations = 169, repeat_rate = 0.376471, autonomy_violations = 0, direct_accuracy_covered = 0.152778, response_brier = 0.196411 |
| `guessing_discrimination/persistencia/elo_item / by_profile / queda` | n = 1296, accuracy = 0.337191, difficulty_error = 0.662809, inadequate_challenge = 0.662809, false_change_when_adequate = 0.064815, coverage = 0.555556, latent_proxy_mae = 1.702686, oscillations = 228, repeat_rate = 0.466102, autonomy_violations = 0, direct_accuracy_covered = 0.436111, response_brier = 0.230947 |
| `guessing_discrimination/persistencia/elo_item / by_profile / queda_gradual` | n = 1296, accuracy = 0.354167, difficulty_error = 0.645833, inadequate_challenge = 0.576389, false_change_when_adequate = 0.039352, coverage = 0.555556, latent_proxy_mae = 1.340027, oscillations = 216, repeat_rate = 0.527273, autonomy_violations = 0, direct_accuracy_covered = 0.488889, response_brier = 0.228868 |
| `guessing_discrimination/persistencia/elo_item / by_profile / irregular` | n = 1296, accuracy = 0.317901, difficulty_error = 0.682099, inadequate_challenge = 0.602623, false_change_when_adequate = 0.101852, coverage = 0.555556, latent_proxy_mae = 1.057694, oscillations = 217, repeat_rate = 0.568807, autonomy_violations = 0, direct_accuracy_covered = 0.263889, response_brier = 0.217513 |
| `guessing_discrimination/persistencia/elo_item / by_profile / estavel_facil` | n = 1296, accuracy = 0.368056, difficulty_error = 0.631944, inadequate_challenge = 0.631944, false_change_when_adequate = 0.020833, coverage = 0.555556, latent_proxy_mae = 0.820736, oscillations = 245, repeat_rate = 0.560976, autonomy_violations = 0, direct_accuracy_covered = 0.855556, response_brier = 0.223874 |
| `guessing_discrimination/persistencia/elo_item / by_profile / estavel_medio` | n = 1296, accuracy = 0.385031, difficulty_error = 0.614969, inadequate_challenge = 0.287809, false_change_when_adequate = 0.037037, coverage = 0.555556, latent_proxy_mae = 0.346169, oscillations = 194, repeat_rate = 0.525253, autonomy_violations = 0, direct_accuracy_covered = 0.595833, response_brier = 0.211418 |
| `guessing_discrimination/persistencia/elo_item / by_profile / estavel_dificil` | n = 1296, accuracy = 0.342593, difficulty_error = 0.657407, inadequate_challenge = 0.657407, false_change_when_adequate = 0.025463, coverage = 0.555556, latent_proxy_mae = 0.648101, oscillations = 182, repeat_rate = 0.548387, autonomy_violations = 0, direct_accuracy_covered = 0.394444, response_brier = 0.141398 |
| `guessing_discrimination/persistencia/elo_item / by_skill / MT:algebra` | n = 7776, accuracy = 0.347737, difficulty_error = 0.652263, inadequate_challenge = 0.594136, false_change_when_adequate = 0.059028, coverage = 0.666667, latent_proxy_mae = 0.957010, oscillations = 1469, repeat_rate = 0.637954, autonomy_violations = 0, direct_accuracy_covered = 0.432677, response_brier = 0.193811 |
| `guessing_discrimination/persistencia/elo_item / by_skill / CN:outra` | n = 3888, accuracy = 0.331790, difficulty_error = 0.668210, inadequate_challenge = 0.607253, false_change_when_adequate = 0.045525, coverage = 0.333333, latent_proxy_mae = 1.073971, oscillations = 380, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.426698, response_brier = 0.212473 |
| `guessing_discrimination/persistencia/rasch` | paired_ci95 = [-0.006344307270233196, 0.0011145404663923184], gain = -0.002658 |
| `guessing_discrimination/persistencia/rasch / overall` | n = 11664, accuracy = 0.340878, difficulty_error = 0.659122, inadequate_challenge = 0.600309, false_change_when_adequate = 0.058385, coverage = 0.555556, latent_proxy_mae = 1.043220, oscillations = 1868, repeat_rate = 0.531780, autonomy_violations = 0, direct_accuracy_covered = 0.416049, response_brier = 0.202678 |
| `guessing_discrimination/persistencia/rasch / by_profile / progressivo` | n = 1296, accuracy = 0.304784, difficulty_error = 0.695216, inadequate_challenge = 0.639660, false_change_when_adequate = 0.118056, coverage = 0.555556, latent_proxy_mae = 1.135819, oscillations = 190, repeat_rate = 0.520833, autonomy_violations = 0, direct_accuracy_covered = 0.062500, response_brier = 0.198242 |
| `guessing_discrimination/persistencia/rasch / by_profile / rapido` | n = 1296, accuracy = 0.297068, difficulty_error = 0.702932, inadequate_challenge = 0.702932, false_change_when_adequate = 0.108796, coverage = 0.555556, latent_proxy_mae = 1.386313, oscillations = 178, repeat_rate = 0.450549, autonomy_violations = 0, direct_accuracy_covered = 0.086111, response_brier = 0.210472 |
| `guessing_discrimination/persistencia/rasch / by_profile / queda` | n = 1296, accuracy = 0.322531, difficulty_error = 0.677469, inadequate_challenge = 0.677469, false_change_when_adequate = 0.078704, coverage = 0.555556, latent_proxy_mae = 1.940914, oscillations = 228, repeat_rate = 0.427350, autonomy_violations = 0, direct_accuracy_covered = 0.320833, response_brier = 0.241591 |
| `guessing_discrimination/persistencia/rasch / by_profile / queda_gradual` | n = 1296, accuracy = 0.340278, difficulty_error = 0.659722, inadequate_challenge = 0.591049, false_change_when_adequate = 0.050926, coverage = 0.555556, latent_proxy_mae = 1.519235, oscillations = 200, repeat_rate = 0.534653, autonomy_violations = 0, direct_accuracy_covered = 0.355556, response_brier = 0.236953 |
| `guessing_discrimination/persistencia/rasch / by_profile / irregular` | n = 1296, accuracy = 0.322531, difficulty_error = 0.677469, inadequate_challenge = 0.602623, false_change_when_adequate = 0.094907, coverage = 0.555556, latent_proxy_mae = 1.082804, oscillations = 215, repeat_rate = 0.601852, autonomy_violations = 0, direct_accuracy_covered = 0.258333, response_brier = 0.218580 |
| `guessing_discrimination/persistencia/rasch / by_profile / estavel_facil` | n = 1296, accuracy = 0.368056, difficulty_error = 0.631944, inadequate_challenge = 0.631944, false_change_when_adequate = 0.018519, coverage = 0.555556, latent_proxy_mae = 0.749887, oscillations = 242, repeat_rate = 0.570248, autonomy_violations = 0, direct_accuracy_covered = 0.887500, response_brier = 0.222641 |
| `guessing_discrimination/persistencia/rasch / by_profile / estavel_medio` | n = 1296, accuracy = 0.381173, difficulty_error = 0.618827, inadequate_challenge = 0.288580, false_change_when_adequate = 0.037037, coverage = 0.555556, latent_proxy_mae = 0.392303, oscillations = 187, repeat_rate = 0.563830, autonomy_violations = 0, direct_accuracy_covered = 0.563889, response_brier = 0.212787 |
| `guessing_discrimination/persistencia/rasch / by_profile / estavel_dificil` | n = 1296, accuracy = 0.361111, difficulty_error = 0.638889, inadequate_challenge = 0.638889, false_change_when_adequate = 0.009259, coverage = 0.555556, latent_proxy_mae = 0.554312, oscillations = 199, repeat_rate = 0.544554, autonomy_violations = 0, direct_accuracy_covered = 0.540278, response_brier = 0.127037 |
| `guessing_discrimination/persistencia/rasch / by_skill / MT:algebra` | n = 7776, accuracy = 0.344264, difficulty_error = 0.655736, inadequate_challenge = 0.598380, false_change_when_adequate = 0.067901, coverage = 0.666667, latent_proxy_mae = 1.035544, oscillations = 1501, repeat_rate = 0.660526, autonomy_violations = 0, direct_accuracy_covered = 0.407407, response_brier = 0.197807 |
| `guessing_discrimination/persistencia/rasch / by_skill / CN:outra` | n = 3888, accuracy = 0.334105, difficulty_error = 0.665895, inadequate_challenge = 0.604167, false_change_when_adequate = 0.039352, coverage = 0.333333, latent_proxy_mae = 1.073925, oscillations = 367, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.450617, response_brier = 0.212420 |
| `guessing_discrimination/persistencia/hibrido_item` | paired_ci95 = [-0.0032578875171467756, 0.003000685871056242], gain = -0.000171 |
| `guessing_discrimination/persistencia/hibrido_item / overall` | n = 11664, accuracy = 0.343364, difficulty_error = 0.656636, inadequate_challenge = 0.598337, false_change_when_adequate = 0.059928, coverage = 0.555556, latent_proxy_mae = 1.028535, oscillations = 2007, repeat_rate = 0.521994, autonomy_violations = 0, direct_accuracy_covered = 0.444907, response_brier = 0.201174 |
| `guessing_discrimination/persistencia/hibrido_item / by_profile / progressivo` | n = 1296, accuracy = 0.320216, difficulty_error = 0.679784, inadequate_challenge = 0.624228, false_change_when_adequate = 0.090278, coverage = 0.555556, latent_proxy_mae = 0.796246, oscillations = 217, repeat_rate = 0.477477, autonomy_violations = 0, direct_accuracy_covered = 0.161111, response_brier = 0.180565 |
| `guessing_discrimination/persistencia/hibrido_item / by_profile / rapido` | n = 1296, accuracy = 0.303241, difficulty_error = 0.696759, inadequate_challenge = 0.696759, false_change_when_adequate = 0.099537, coverage = 0.555556, latent_proxy_mae = 1.055790, oscillations = 190, repeat_rate = 0.432990, autonomy_violations = 0, direct_accuracy_covered = 0.169444, response_brier = 0.191370 |
| `guessing_discrimination/persistencia/hibrido_item / by_profile / queda` | n = 1296, accuracy = 0.320988, difficulty_error = 0.679012, inadequate_challenge = 0.679012, false_change_when_adequate = 0.090278, coverage = 0.555556, latent_proxy_mae = 2.143692, oscillations = 226, repeat_rate = 0.394958, autonomy_violations = 0, direct_accuracy_covered = 0.284722, response_brier = 0.250166 |
| `guessing_discrimination/persistencia/hibrido_item / by_profile / queda_gradual` | n = 1296, accuracy = 0.328704, difficulty_error = 0.671296, inadequate_challenge = 0.598765, false_change_when_adequate = 0.067130, coverage = 0.555556, latent_proxy_mae = 1.738115, oscillations = 210, repeat_rate = 0.537037, autonomy_violations = 0, direct_accuracy_covered = 0.333333, response_brier = 0.247514 |
| `guessing_discrimination/persistencia/hibrido_item / by_profile / irregular` | n = 1296, accuracy = 0.314815, difficulty_error = 0.685185, inadequate_challenge = 0.604938, false_change_when_adequate = 0.104167, coverage = 0.555556, latent_proxy_mae = 1.202937, oscillations = 225, repeat_rate = 0.566372, autonomy_violations = 0, direct_accuracy_covered = 0.240278, response_brier = 0.220664 |
| `guessing_discrimination/persistencia/hibrido_item / by_profile / estavel_facil` | n = 1296, accuracy = 0.358796, difficulty_error = 0.641204, inadequate_challenge = 0.641204, false_change_when_adequate = 0.037037, coverage = 0.555556, latent_proxy_mae = 0.920891, oscillations = 248, repeat_rate = 0.560000, autonomy_violations = 0, direct_accuracy_covered = 0.800000, response_brier = 0.231026 |
| `guessing_discrimination/persistencia/hibrido_item / by_profile / estavel_medio` | n = 1296, accuracy = 0.388117, difficulty_error = 0.611883, inadequate_challenge = 0.295525, false_change_when_adequate = 0.046296, coverage = 0.555556, latent_proxy_mae = 0.528542, oscillations = 216, repeat_rate = 0.531532, autonomy_violations = 0, direct_accuracy_covered = 0.623611, response_brier = 0.215926 |
| `guessing_discrimination/persistencia/hibrido_item / by_profile / estavel_dificil` | n = 1296, accuracy = 0.378086, difficulty_error = 0.621914, inadequate_challenge = 0.621914, false_change_when_adequate = 0.000000, coverage = 0.555556, latent_proxy_mae = 0.350821, oscillations = 234, repeat_rate = 0.593220, autonomy_violations = 0, direct_accuracy_covered = 0.666667, response_brier = 0.117452 |
| `guessing_discrimination/persistencia/hibrido_item / by_skill / MT:algebra` | n = 7776, accuracy = 0.347737, difficulty_error = 0.652263, inadequate_challenge = 0.595036, false_change_when_adequate = 0.067130, coverage = 0.666667, latent_proxy_mae = 1.011993, oscillations = 1593, repeat_rate = 0.656827, autonomy_violations = 0, direct_accuracy_covered = 0.440586, response_brier = 0.195894 |
| `guessing_discrimination/persistencia/hibrido_item / by_skill / CN:outra` | n = 3888, accuracy = 0.334619, difficulty_error = 0.665381, inadequate_challenge = 0.604938, false_change_when_adequate = 0.045525, coverage = 0.333333, latent_proxy_mae = 1.094704, oscillations = 414, repeat_rate = 0.000000, autonomy_violations = 0, direct_accuracy_covered = 0.462191, response_brier = 0.211735 |

## correcao_adaptativa/revisao_fase_02/comparacao_regra.json

Arquivo integral · [comparacao_regra.json](evidencias/workspace/dificuldade-adaptativa/correcao_adaptativa/revisao_fase_02/comparacao_regra.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `cenarios / logistic/False` | delta_acerto = 0.170553, ic95_bootstrap_pareado = [0.1459747942386831, 0.19478880887059902] |
| `cenarios / logistic/False / resultados / taxa` | accuracy = 0.340649, outside = 0.669696, offers = 0.074531, false_change = 0.050754, coverage = 0.555556, covered_accuracy = 0.346502, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.325153, no_offer_rate = 0.925469, student_coverage = 0.862140, offer_count = 1304, direction_reversals = 8 |
| `cenarios / logistic/False / resultados / bkt_politica_1_4_0.09` | accuracy = 0.511203, outside = 0.532407, offers = 0.415466, false_change = 0.229595, coverage = 0.777778, covered_accuracy = 0.562022, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.612326, no_offer_rate = 0.584534, student_coverage = 0.971193, offer_count = 7269, direction_reversals = 63 |
| `cenarios / logistic/True` | delta_acerto = 0.144890, ic95_bootstrap_pareado = [0.12597022176497485, 0.16363883173296753] |
| `cenarios / logistic/True / resultados / taxa` | accuracy = 0.360425, outside = 0.628544, offers = 0.052355, false_change = 0.028926, coverage = 0.555556, covered_accuracy = 0.388169, accepted_changes = 596, violations = 0, trajectories = 486, offer_precision = 0.397380, no_offer_rate = 0.947645, student_coverage = 0.862140, offer_count = 916, direction_reversals = 17 |
| `cenarios / logistic/True / resultados / bkt_politica_1_4_0.09` | accuracy = 0.505316, outside = 0.536923, offers = 0.208219, false_change = 0.099362, coverage = 0.777778, covered_accuracy = 0.547105, accepted_changes = 2354, violations = 0, trajectories = 486, offer_precision = 0.565743, no_offer_rate = 0.791781, student_coverage = 0.971193, offer_count = 3643, direction_reversals = 327 |
| `cenarios / 3pl/False` | delta_acerto = 0.130201, ic95_bootstrap_pareado = [0.10699302697759487, 0.15180898491083672] |
| `cenarios / 3pl/False / resultados / taxa` | accuracy = 0.344879, outside = 0.597679, offers = 0.068930, false_change = 0.040809, coverage = 0.555556, covered_accuracy = 0.354115, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.364842, no_offer_rate = 0.931070, student_coverage = 0.845679, offer_count = 1206, direction_reversals = 2 |
| `cenarios / 3pl/False / resultados / bkt_politica_1_4_0.09` | accuracy = 0.475080, outside = 0.472508, offers = 0.391232, false_change = 0.224280, coverage = 0.777778, covered_accuracy = 0.515579, accepted_changes = 0, violations = 0, trajectories = 486, offer_precision = 0.553397, no_offer_rate = 0.608768, student_coverage = 0.944444, offer_count = 6845, direction_reversals = 54 |
| `cenarios / 3pl/True` | delta_acerto = 0.118141, ic95_bootstrap_pareado = [0.10019147233653405, 0.1366626657521719] |
| `cenarios / 3pl/True / resultados / taxa` | accuracy = 0.370885, outside = 0.573274, offers = 0.048525, false_change = 0.024872, coverage = 0.555556, covered_accuracy = 0.406996, accepted_changes = 546, violations = 0, trajectories = 486, offer_precision = 0.439340, no_offer_rate = 0.951475, student_coverage = 0.845679, offer_count = 849, direction_reversals = 12 |
| `cenarios / 3pl/True / resultados / bkt_politica_1_4_0.09` | accuracy = 0.489026, outside = 0.470222, offers = 0.192101, false_change = 0.098810, coverage = 0.777778, covered_accuracy = 0.528513, accepted_changes = 2175, violations = 0, trajectories = 486, offer_precision = 0.540315, no_offer_rate = 0.807899, student_coverage = 0.944444, offer_count = 3361, direction_reversals = 259 |

## correcao_adaptativa/revisao_operacional_bkt/cobertura.json

Arquivo integral · [cobertura.json](evidencias/workspace/dificuldade-adaptativa/correcao_adaptativa/revisao_operacional_bkt/cobertura.json)

Veja o arquivo integral para distribuições, critérios, tempos, resultados por lote e verificações.

## correcao_adaptativa/teste_offline_bkt_margem/funcionais.json

Arquivo integral · [funcionais.json](evidencias/workspace/dificuldade-adaptativa/correcao_adaptativa/teste_offline_bkt_margem/funcionais.json)

Contagens e resultados de topo · `total` = 8, `falhas` = 0, `erros` = 0
Veja o arquivo integral para distribuições, critérios, tempos, resultados por lote e verificações.

## correcao_adaptativa/teste_offline_bkt_margem/simulacao.json

Arquivo integral · [simulacao.json](evidencias/workspace/dificuldade-adaptativa/correcao_adaptativa/teste_offline_bkt_margem/simulacao.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `cenarios / 2018/451/CH/logistico/fixo / metodos / taxa` | trajetorias = 288, previstas = 2880, avaliadas = 1056, acertos = 369, acerto = 0.349432, acerto_por_horizonte = 0.128125, fora_desafio = 0.625947, ofertas = 92, cobertura = 0.087121, trajetorias_com_oferta = 92, falsas_mudancas = 11, ja_adequadas = 336, taxa_falsa_mudanca = 0.032738, mudancas_aceitas = 0, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 1824, familias_consumidas = 3936, inventario_restante = 1824 |
| `cenarios / 2018/451/CH/logistico/fixo / metodos / bkt` | trajetorias = 288, previstas = 2880, avaliadas = 1056, acertos = 544, acerto = 0.515152, acerto_por_horizonte = 0.188889, fora_desafio = 0.434659, ofertas = 578, cobertura = 0.547348, trajetorias_com_oferta = 190, falsas_mudancas = 120, ja_adequadas = 336, taxa_falsa_mudanca = 0.357143, mudancas_aceitas = 0, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 1824, familias_consumidas = 3936, inventario_restante = 1824 |
| `cenarios / 2018/451/CH/logistico/fixo / metodos / taxa_cadencia` | trajetorias = 288, previstas = 2880, avaliadas = 1056, acertos = 449, acerto = 0.425189, acerto_por_horizonte = 0.155903, fora_desafio = 0.541667, ofertas = 331, cobertura = 0.313447, trajetorias_com_oferta = 103, falsas_mudancas = 41, ja_adequadas = 336, taxa_falsa_mudanca = 0.122024, mudancas_aceitas = 0, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 1824, familias_consumidas = 3936, inventario_restante = 1824 |
| `cenarios / 2018/451/CH/logistico/aceite / metodos / taxa` | trajetorias = 288, previstas = 2880, avaliadas = 1098, acertos = 419, acerto = 0.381603, acerto_por_horizonte = 0.145486, fora_desafio = 0.589253, ofertas = 92, cobertura = 0.083789, trajetorias_com_oferta = 92, falsas_mudancas = 11, ja_adequadas = 386, taxa_falsa_mudanca = 0.028497, mudancas_aceitas = 59, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 1782, familias_consumidas = 3978, inventario_restante = 1782 |
| `cenarios / 2018/451/CH/logistico/aceite / metodos / bkt` | trajetorias = 288, previstas = 2880, avaliadas = 1090, acertos = 536, acerto = 0.491743, acerto_por_horizonte = 0.186111, fora_desafio = 0.466055, ofertas = 315, cobertura = 0.288991, trajetorias_com_oferta = 190, falsas_mudancas = 67, ja_adequadas = 427, taxa_falsa_mudanca = 0.156909, mudancas_aceitas = 193, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 1790, familias_consumidas = 3970, inventario_restante = 1790 |
| `cenarios / 2018/451/CH/logistico/aceite / metodos / taxa_cadencia` | trajetorias = 288, previstas = 2880, avaliadas = 1093, acertos = 491, acerto = 0.449222, acerto_por_horizonte = 0.170486, fora_desafio = 0.515096, ofertas = 219, cobertura = 0.200366, trajetorias_com_oferta = 103, falsas_mudancas = 35, ja_adequadas = 405, taxa_falsa_mudanca = 0.086420, mudancas_aceitas = 136, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 1787, familias_consumidas = 3973, inventario_restante = 1787 |
| `cenarios / 2018/451/CH/3pl/fixo / metodos / taxa` | trajetorias = 288, previstas = 2880, avaliadas = 1056, acertos = 372, acerto = 0.352273, acerto_por_horizonte = 0.129167, fora_desafio = 0.581439, ofertas = 89, cobertura = 0.084280, trajetorias_com_oferta = 89, falsas_mudancas = 2, ja_adequadas = 336, taxa_falsa_mudanca = 0.005952, mudancas_aceitas = 0, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 1824, familias_consumidas = 3936, inventario_restante = 1824 |
| `cenarios / 2018/451/CH/3pl/fixo / metodos / bkt` | trajetorias = 288, previstas = 2880, avaliadas = 1056, acertos = 597, acerto = 0.565341, acerto_por_horizonte = 0.207292, fora_desafio = 0.325758, ofertas = 573, cobertura = 0.542614, trajetorias_com_oferta = 187, falsas_mudancas = 98, ja_adequadas = 336, taxa_falsa_mudanca = 0.291667, mudancas_aceitas = 0, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 1824, familias_consumidas = 3936, inventario_restante = 1824 |
| `cenarios / 2018/451/CH/3pl/fixo / metodos / taxa_cadencia` | trajetorias = 288, previstas = 2880, avaliadas = 1056, acertos = 452, acerto = 0.428030, acerto_por_horizonte = 0.156944, fora_desafio = 0.497159, ofertas = 304, cobertura = 0.287879, trajetorias_com_oferta = 101, falsas_mudancas = 20, ja_adequadas = 336, taxa_falsa_mudanca = 0.059524, mudancas_aceitas = 0, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 1824, familias_consumidas = 3936, inventario_restante = 1824 |
| `cenarios / 2018/451/CH/3pl/aceite / metodos / taxa` | trajetorias = 288, previstas = 2880, avaliadas = 1122, acertos = 421, acerto = 0.375223, acerto_por_horizonte = 0.146181, fora_desafio = 0.557041, ofertas = 89, cobertura = 0.079323, trajetorias_com_oferta = 89, falsas_mudancas = 2, ja_adequadas = 385, taxa_falsa_mudanca = 0.005195, mudancas_aceitas = 61, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 1758, familias_consumidas = 4002, inventario_restante = 1758 |
| `cenarios / 2018/451/CH/3pl/aceite / metodos / bkt` | trajetorias = 288, previstas = 2880, avaliadas = 1104, acertos = 639, acerto = 0.578804, acerto_por_horizonte = 0.221875, fora_desafio = 0.323370, ofertas = 305, cobertura = 0.276268, trajetorias_com_oferta = 187, falsas_mudancas = 60, ja_adequadas = 507, taxa_falsa_mudanca = 0.118343, mudancas_aceitas = 190, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 1776, familias_consumidas = 3984, inventario_restante = 1776 |
| `cenarios / 2018/451/CH/3pl/aceite / metodos / taxa_cadencia` | trajetorias = 288, previstas = 2880, avaliadas = 1123, acertos = 557, acerto = 0.495993, acerto_por_horizonte = 0.193403, fora_desafio = 0.422084, ofertas = 211, cobertura = 0.187890, trajetorias_com_oferta = 101, falsas_mudancas = 14, ja_adequadas = 457, taxa_falsa_mudanca = 0.030635, mudancas_aceitas = 135, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 1757, familias_consumidas = 4003, inventario_restante = 1757 |
| `cenarios / 2020/567/CH/logistico/fixo / metodos / taxa` | trajetorias = 288, previstas = 576, avaliadas = 288, acertos = 96, acerto = 0.333333, acerto_por_horizonte = 0.166667, fora_desafio = 0.750000, ofertas = 0, cobertura = 0.000000, trajetorias_com_oferta = 0, falsas_mudancas = 0, ja_adequadas = 96, taxa_falsa_mudanca = 0.000000, mudancas_aceitas = 0, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 288, familias_consumidas = 3168, inventario_restante = 288 |
| `cenarios / 2020/567/CH/logistico/fixo / metodos / bkt` | trajetorias = 288, previstas = 576, avaliadas = 288, acertos = 117, acerto = 0.406250, acerto_por_horizonte = 0.203125, fora_desafio = 0.687500, ofertas = 84, cobertura = 0.291667, trajetorias_com_oferta = 84, falsas_mudancas = 19, ja_adequadas = 96, taxa_falsa_mudanca = 0.197917, mudancas_aceitas = 0, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 288, familias_consumidas = 3168, inventario_restante = 288 |
| `cenarios / 2020/567/CH/logistico/fixo / metodos / taxa_cadencia` | trajetorias = 288, previstas = 576, avaliadas = 288, acertos = 100, acerto = 0.347222, acerto_por_horizonte = 0.173611, fora_desafio = 0.739583, ofertas = 41, cobertura = 0.142361, trajetorias_com_oferta = 41, falsas_mudancas = 13, ja_adequadas = 96, taxa_falsa_mudanca = 0.135417, mudancas_aceitas = 0, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 288, familias_consumidas = 3168, inventario_restante = 288 |
| `cenarios / 2020/567/CH/logistico/aceite / metodos / taxa` | trajetorias = 288, previstas = 576, avaliadas = 288, acertos = 96, acerto = 0.333333, acerto_por_horizonte = 0.166667, fora_desafio = 0.750000, ofertas = 0, cobertura = 0.000000, trajetorias_com_oferta = 0, falsas_mudancas = 0, ja_adequadas = 96, taxa_falsa_mudanca = 0.000000, mudancas_aceitas = 0, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 288, familias_consumidas = 3168, inventario_restante = 288 |
| `cenarios / 2020/567/CH/logistico/aceite / metodos / bkt` | trajetorias = 288, previstas = 576, avaliadas = 288, acertos = 117, acerto = 0.406250, acerto_por_horizonte = 0.203125, fora_desafio = 0.687500, ofertas = 84, cobertura = 0.291667, trajetorias_com_oferta = 84, falsas_mudancas = 19, ja_adequadas = 96, taxa_falsa_mudanca = 0.197917, mudancas_aceitas = 58, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 288, familias_consumidas = 3168, inventario_restante = 288 |
| `cenarios / 2020/567/CH/logistico/aceite / metodos / taxa_cadencia` | trajetorias = 288, previstas = 576, avaliadas = 288, acertos = 100, acerto = 0.347222, acerto_por_horizonte = 0.173611, fora_desafio = 0.739583, ofertas = 41, cobertura = 0.142361, trajetorias_com_oferta = 41, falsas_mudancas = 13, ja_adequadas = 96, taxa_falsa_mudanca = 0.135417, mudancas_aceitas = 33, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 288, familias_consumidas = 3168, inventario_restante = 288 |
| `cenarios / 2020/567/CH/3pl/fixo / metodos / taxa` | trajetorias = 288, previstas = 576, avaliadas = 288, acertos = 96, acerto = 0.333333, acerto_por_horizonte = 0.166667, fora_desafio = 0.666667, ofertas = 0, cobertura = 0.000000, trajetorias_com_oferta = 0, falsas_mudancas = 0, ja_adequadas = 96, taxa_falsa_mudanca = 0.000000, mudancas_aceitas = 0, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 288, familias_consumidas = 3168, inventario_restante = 288 |
| `cenarios / 2020/567/CH/3pl/fixo / metodos / bkt` | trajetorias = 288, previstas = 576, avaliadas = 288, acertos = 142, acerto = 0.493056, acerto_por_horizonte = 0.246528, fora_desafio = 0.506944, ofertas = 79, cobertura = 0.274306, trajetorias_com_oferta = 79, falsas_mudancas = 9, ja_adequadas = 96, taxa_falsa_mudanca = 0.093750, mudancas_aceitas = 0, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 288, familias_consumidas = 3168, inventario_restante = 288 |
| `cenarios / 2020/567/CH/3pl/fixo / metodos / taxa_cadencia` | trajetorias = 288, previstas = 576, avaliadas = 288, acertos = 109, acerto = 0.378472, acerto_por_horizonte = 0.189236, fora_desafio = 0.621528, ofertas = 41, cobertura = 0.142361, trajetorias_com_oferta = 41, falsas_mudancas = 6, ja_adequadas = 96, taxa_falsa_mudanca = 0.062500, mudancas_aceitas = 0, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 288, familias_consumidas = 3168, inventario_restante = 288 |
| `cenarios / 2020/567/CH/3pl/aceite / metodos / taxa` | trajetorias = 288, previstas = 576, avaliadas = 288, acertos = 96, acerto = 0.333333, acerto_por_horizonte = 0.166667, fora_desafio = 0.666667, ofertas = 0, cobertura = 0.000000, trajetorias_com_oferta = 0, falsas_mudancas = 0, ja_adequadas = 96, taxa_falsa_mudanca = 0.000000, mudancas_aceitas = 0, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 288, familias_consumidas = 3168, inventario_restante = 288 |
| `cenarios / 2020/567/CH/3pl/aceite / metodos / bkt` | trajetorias = 288, previstas = 576, avaliadas = 288, acertos = 142, acerto = 0.493056, acerto_por_horizonte = 0.246528, fora_desafio = 0.506944, ofertas = 79, cobertura = 0.274306, trajetorias_com_oferta = 79, falsas_mudancas = 9, ja_adequadas = 96, taxa_falsa_mudanca = 0.093750, mudancas_aceitas = 54, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 288, familias_consumidas = 3168, inventario_restante = 288 |
| `cenarios / 2020/567/CH/3pl/aceite / metodos / taxa_cadencia` | trajetorias = 288, previstas = 576, avaliadas = 288, acertos = 109, acerto = 0.378472, acerto_por_horizonte = 0.189236, fora_desafio = 0.621528, ofertas = 41, cobertura = 0.142361, trajetorias_com_oferta = 41, falsas_mudancas = 6, ja_adequadas = 96, taxa_falsa_mudanca = 0.062500, mudancas_aceitas = 33, violacoes = 0, encerramentos_inventario = 288, oportunidades_nao_avaliadas = 288, familias_consumidas = 3168, inventario_restante = 288 |

## correcao_adaptativa/teto_protocolo.json

Arquivo integral · [teto_protocolo.json](evidencias/workspace/dificuldade-adaptativa/correcao_adaptativa/teto_protocolo.json)

Veja o arquivo integral para distribuições, critérios, tempos, resultados por lote e verificações.

## enriquecimento/ablacao.json

Arquivo integral · [ablacao.json](evidencias/workspace/dificuldade-adaptativa/enriquecimento/ablacao.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `texto / validation` | accuracy = 0.426471 |
| `texto_assunto / validation` | accuracy = 0.411765 |
| `texto_assunto_habilidade / validation` | accuracy = 0.426471 |

## enriquecimento/ablacao_encoders.json

Arquivo integral · [ablacao_encoders.json](evidencias/workspace/dificuldade-adaptativa/enriquecimento/ablacao_encoders.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `minilm_congelado / A_texto` | n = 136, macro_f1 = 0.470983, accuracy = 0.470588, paired_ci_vs_text = [0.0, 0.0] |
| `minilm_congelado / B_assunto` | n = 136, macro_f1 = 0.435292, accuracy = 0.433824, paired_ci_vs_text = [-0.08052637244547775, 0.012573669389258394] |
| `minilm_congelado / C_habilidade` | n = 136, macro_f1 = 0.492339, accuracy = 0.492647, paired_ci_vs_text = [-0.044875320957927074, 0.09162332439423418] |
| `bert_checkpoint` | n = 136, macro_f1 = 0.522332, accuracy = 0.573529 |
| `bert_ajustado / A_texto` | n = 136, macro_f1 = 0.425823, accuracy = 0.426471, paired_ci_vs_text = [0.0, 0.0] |
| `bert_ajustado / B_assunto` | n = 136, macro_f1 = 0.420812, accuracy = 0.419118, paired_ci_vs_text = [-0.04605558697973882, 0.03689568061836382] |
| `bert_ajustado / C_habilidade` | n = 136, macro_f1 = 0.440358, accuracy = 0.441176, paired_ci_vs_text = [-0.060197236072787326, 0.09139364052221338] |
| `bert_congelado / A_texto` | n = 136, macro_f1 = 0.419856, accuracy = 0.419118, paired_ci_vs_text = [0.0, 0.0] |
| `bert_congelado / B_assunto` | n = 136, macro_f1 = 0.377068, accuracy = 0.375000, paired_ci_vs_text = [-0.08495522564989527, -0.006560208009579511] |
| `bert_congelado / C_habilidade` | n = 136, macro_f1 = 0.399124, accuracy = 0.397059, paired_ci_vs_text = [-0.08467369129023918, 0.04279639671743225] |
| `minilm_ajustado / A_texto` | n = 136, macro_f1 = 0.453380, accuracy = 0.455882, paired_ci_vs_text = [0.0, 0.0] |
| `minilm_ajustado / B_assunto` | n = 136, macro_f1 = 0.417558, accuracy = 0.419118, paired_ci_vs_text = [-0.08718794378423146, 0.012265384722064137] |
| `minilm_ajustado / C_habilidade` | n = 136, macro_f1 = 0.470963, accuracy = 0.470588, paired_ci_vs_text = [-0.04496824548699471, 0.08769025712548476] |

## recuperacao_catalogo/metricas.json

Arquivo integral · [metricas.json](evidencias/workspace/dificuldade-adaptativa/recuperacao_catalogo/metricas.json)

Contagens e resultados de topo · `total` = 2971, `bloqueadas` = 928, `pendentes_rubrica` = 2962, `sem_uso_aprovado` = 938, `com_midia_referenciada` = 878, `com_midia_ausente` = 878, `quase_duplicatas_pares` = 17, `itens_em_grupo_nao_unitario` = 36, `taxa_itens_em_grupo_nao_unitario` = 0.012117, `grupos_cruzam_particao_historica` = 0, `grupos_cruzam_particao_nova` = 0
Veja o arquivo integral para distribuições, critérios, tempos, resultados por lote e verificações.

## results/fase02r_bge_cuda_latencia.json

Arquivo integral · [fase02r_bge_cuda_latencia.json](evidencias/workspace/dificuldade-adaptativa/results/fase02r_bge_cuda_latencia.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `raiz` | median_seconds = 0.017935 |

## results/fase02r_bge_latencia.json

Arquivo integral · [fase02r_bge_latencia.json](evidencias/workspace/dificuldade-adaptativa/results/fase02r_bge_latencia.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `raiz` | median_seconds = 0.155163 |

## results/fase02r_comparacao.json

Arquivo integral · [fase02r_comparacao.json](evidencias/workspace/dificuldade-adaptativa/results/fase02r_comparacao.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `results / minilm/embedding/multiclass` | n = 136, macro_f1 = 0.470983, accuracy = 0.470588, ordinal_mae = 0.647059, easy_hard_errors = 16, easy_hard_rate = 0.117647, fit_and_validation_seconds = 0.639133, gain_vs_baseline = 0.000000, paired_bootstrap_95 = [0.0, 0.0], worst_area_loss = 0.000000 |
| `results / minilm/embedding/ordinal` | n = 136, macro_f1 = 0.404528, accuracy = 0.411765, ordinal_mae = 0.654412, easy_hard_errors = 9, easy_hard_rate = 0.066176, fit_and_validation_seconds = 0.049842, gain_vs_baseline = -0.066455, paired_bootstrap_95 = [-0.15452416642839376, 0.017262396473421555], worst_area_loss = 0.103983 |
| `results / minilm/embedding/ridge_b` | n = 136, macro_f1 = 0.344204, accuracy = 0.375000, ordinal_mae = 0.654412, easy_hard_errors = 4, easy_hard_rate = 0.029412, mae_raw_b = 0.660438, fit_and_validation_seconds = 0.019847, gain_vs_baseline = -0.126779, paired_bootstrap_95 = [-0.2205587968997483, -0.03375790450864714], worst_area_loss = 0.316080 |
| `results / minilm/structure/multiclass` | n = 136, macro_f1 = 0.418437, accuracy = 0.419118, ordinal_mae = 0.742647, easy_hard_errors = 22, easy_hard_rate = 0.161765, fit_and_validation_seconds = 1.104286, gain_vs_baseline = -0.052546, paired_bootstrap_95 = [-0.10896880806223676, 0.007392175670441168], worst_area_loss = 0.070799 |
| `results / minilm/structure/ordinal` | n = 136, macro_f1 = 0.397533, accuracy = 0.389706, ordinal_mae = 0.705882, easy_hard_errors = 13, easy_hard_rate = 0.095588, fit_and_validation_seconds = 0.152636, gain_vs_baseline = -0.073450, paired_bootstrap_95 = [-0.14498310455774174, -0.0033187375588479883], worst_area_loss = 0.114683 |
| `results / minilm/structure/ridge_b` | n = 136, macro_f1 = 0.384761, accuracy = 0.397059, ordinal_mae = 0.676471, easy_hard_errors = 10, easy_hard_rate = 0.073529, mae_raw_b = 0.712141, fit_and_validation_seconds = 0.027976, gain_vs_baseline = -0.086222, paired_bootstrap_95 = [-0.18509253616205482, 0.015525670024087366], worst_area_loss = 0.110616 |
| `results / minilm/area/multiclass` | n = 136, macro_f1 = 0.418317, accuracy = 0.419118, ordinal_mae = 0.720588, easy_hard_errors = 19, easy_hard_rate = 0.139706, fit_and_validation_seconds = 1.179530, gain_vs_baseline = -0.052666, paired_bootstrap_95 = [-0.10965840080469398, 0.004118765262582718], worst_area_loss = 0.102875 |
| `results / minilm/area/ordinal` | n = 136, macro_f1 = 0.418982, accuracy = 0.411765, ordinal_mae = 0.676471, easy_hard_errors = 12, easy_hard_rate = 0.088235, fit_and_validation_seconds = 0.124599, gain_vs_baseline = -0.052000, paired_bootstrap_95 = [-0.1180905361720123, 0.016083248690265835], worst_area_loss = 0.100410 |
| `results / minilm/area/ridge_b` | n = 136, macro_f1 = 0.387789, accuracy = 0.389706, ordinal_mae = 0.683824, easy_hard_errors = 10, easy_hard_rate = 0.073529, mae_raw_b = 0.677543, fit_and_validation_seconds = 0.024423, gain_vs_baseline = -0.083194, paired_bootstrap_95 = [-0.1739026114833013, 0.008243710939493361], worst_area_loss = 0.195801 |
| `results / minilm/both/multiclass` | n = 136, macro_f1 = 0.423465, accuracy = 0.426471, ordinal_mae = 0.727941, easy_hard_errors = 21, easy_hard_rate = 0.154412, fit_and_validation_seconds = 1.004991, gain_vs_baseline = -0.047518, paired_bootstrap_95 = [-0.1068711177328097, 0.013625986658970204], worst_area_loss = 0.104545 |
| `results / minilm/both/ordinal` | n = 136, macro_f1 = 0.454475, accuracy = 0.448529, ordinal_mae = 0.632353, easy_hard_errors = 11, easy_hard_rate = 0.080882, fit_and_validation_seconds = 0.129074, gain_vs_baseline = -0.016508, paired_bootstrap_95 = [-0.08212541086121442, 0.051157431915173024], worst_area_loss = 0.057077 |
| `results / minilm/both/ridge_b` | n = 136, macro_f1 = 0.388699, accuracy = 0.389706, ordinal_mae = 0.683824, easy_hard_errors = 10, easy_hard_rate = 0.073529, mae_raw_b = 0.677583, fit_and_validation_seconds = 0.027137, gain_vs_baseline = -0.082284, paired_bootstrap_95 = [-0.17145220098553132, 0.01027944532687599], worst_area_loss = 0.216106 |
| `results / qwen06/embedding/multiclass` | n = 136, macro_f1 = 0.454772, accuracy = 0.463235, ordinal_mae = 0.654412, easy_hard_errors = 16, easy_hard_rate = 0.117647, fit_and_validation_seconds = 1.320428, gain_vs_baseline = -0.016211, paired_bootstrap_95 = [-0.10247586275818432, 0.08750569046258834], worst_area_loss = 0.237136 |
| `results / qwen06/embedding/ordinal` | n = 136, macro_f1 = 0.449779, accuracy = 0.448529, ordinal_mae = 0.595588, easy_hard_errors = 6, easy_hard_rate = 0.044118, fit_and_validation_seconds = 0.084276, gain_vs_baseline = -0.021204, paired_bootstrap_95 = [-0.1173360001227259, 0.0724073764621785], worst_area_loss = 0.210153 |
| `results / qwen06/embedding/ridge_b` | n = 136, macro_f1 = 0.325839, accuracy = 0.367647, ordinal_mae = 0.647059, easy_hard_errors = 2, easy_hard_rate = 0.014706, mae_raw_b = 0.616285, fit_and_validation_seconds = 0.046952, gain_vs_baseline = -0.145144, paired_bootstrap_95 = [-0.24577180937348778, -0.05843118727422416], worst_area_loss = 0.371264 |
| `results / qwen06/structure/multiclass` | n = 136, macro_f1 = 0.445070, accuracy = 0.448529, ordinal_mae = 0.727941, easy_hard_errors = 24, easy_hard_rate = 0.176471, fit_and_validation_seconds = 39.489778, gain_vs_baseline = -0.025913, paired_bootstrap_95 = [-0.1244399375950753, 0.08384521936735187], worst_area_loss = 0.269413 |
| `results / qwen06/structure/ordinal` | n = 136, macro_f1 = 0.380561, accuracy = 0.382353, ordinal_mae = 0.750000, easy_hard_errors = 18, easy_hard_rate = 0.132353, fit_and_validation_seconds = 0.264841, gain_vs_baseline = -0.090422, paired_bootstrap_95 = [-0.19386639321373178, 0.019811823672381927], worst_area_loss = 0.293262 |
| `results / qwen06/structure/ridge_b` | n = 136, macro_f1 = 0.423541, accuracy = 0.426471, ordinal_mae = 0.683824, easy_hard_errors = 15, easy_hard_rate = 0.110294, mae_raw_b = 0.774764, fit_and_validation_seconds = 0.068143, gain_vs_baseline = -0.047442, paired_bootstrap_95 = [-0.15179275819053897, 0.05738660119114284], worst_area_loss = 0.225706 |
| `results / qwen06/area/multiclass` | n = 136, macro_f1 = 0.392838, accuracy = 0.397059, ordinal_mae = 0.786765, easy_hard_errors = 25, easy_hard_rate = 0.183824, fit_and_validation_seconds = 27.178881, gain_vs_baseline = -0.078145, paired_bootstrap_95 = [-0.19070102846105713, 0.032282949532896656], worst_area_loss = 0.324910 |
| `results / qwen06/area/ordinal` | n = 136, macro_f1 = 0.395209, accuracy = 0.397059, ordinal_mae = 0.750000, easy_hard_errors = 20, easy_hard_rate = 0.147059, fit_and_validation_seconds = 0.132526, gain_vs_baseline = -0.075774, paired_bootstrap_95 = [-0.17738527712794253, 0.0443503897278647], worst_area_loss = 0.316921 |
| `results / qwen06/area/ridge_b` | n = 136, macro_f1 = 0.390330, accuracy = 0.389706, ordinal_mae = 0.735294, easy_hard_errors = 17, easy_hard_rate = 0.125000, mae_raw_b = 0.790680, fit_and_validation_seconds = 0.044251, gain_vs_baseline = -0.080653, paired_bootstrap_95 = [-0.184425082258295, 0.03536808400238483], worst_area_loss = 0.310871 |
| `results / qwen06/both/multiclass` | n = 136, macro_f1 = 0.402821, accuracy = 0.404412, ordinal_mae = 0.772059, easy_hard_errors = 24, easy_hard_rate = 0.176471, fit_and_validation_seconds = 15.882435, gain_vs_baseline = -0.068162, paired_bootstrap_95 = [-0.17230381144441115, 0.038767763388295885], worst_area_loss = 0.305608 |
| `results / qwen06/both/ordinal` | n = 136, macro_f1 = 0.386946, accuracy = 0.389706, ordinal_mae = 0.772059, easy_hard_errors = 22, easy_hard_rate = 0.161765, fit_and_validation_seconds = 0.130750, gain_vs_baseline = -0.084037, paired_bootstrap_95 = [-0.18463371338907977, 0.032030245649357], worst_area_loss = 0.316921 |
| `results / qwen06/both/ridge_b` | n = 136, macro_f1 = 0.401690, accuracy = 0.404412, ordinal_mae = 0.720588, easy_hard_errors = 17, easy_hard_rate = 0.125000, mae_raw_b = 0.801096, fit_and_validation_seconds = 0.043215, gain_vs_baseline = -0.069293, paired_bootstrap_95 = [-0.17260519377153027, 0.03313009430608034], worst_area_loss = 0.195338 |
| `results / bge/embedding/multiclass` | n = 136, macro_f1 = 0.434996, accuracy = 0.441176, ordinal_mae = 0.691176, easy_hard_errors = 18, easy_hard_rate = 0.132353, fit_and_validation_seconds = 0.594715, gain_vs_baseline = -0.035987, paired_bootstrap_95 = [-0.1263928770289615, 0.056506941339887706], worst_area_loss = 0.202334 |
| `results / bge/embedding/ordinal` | n = 136, macro_f1 = 0.403357, accuracy = 0.404412, ordinal_mae = 0.617647, easy_hard_errors = 3, easy_hard_rate = 0.022059, fit_and_validation_seconds = 0.045156, gain_vs_baseline = -0.067626, paired_bootstrap_95 = [-0.15782759433907806, 0.031290332055569574], worst_area_loss = 0.201501 |
| `results / bge/embedding/ridge_b` | n = 136, macro_f1 = 0.260076, accuracy = 0.316176, ordinal_mae = 0.698529, easy_hard_errors = 2, easy_hard_rate = 0.014706, mae_raw_b = 0.641398, fit_and_validation_seconds = 0.029822, gain_vs_baseline = -0.210907, paired_bootstrap_95 = [-0.30216613899907213, -0.1217475748711728], worst_area_loss = 0.401877 |
| `results / bge/structure/multiclass` | n = 136, macro_f1 = 0.386350, accuracy = 0.389706, ordinal_mae = 0.816176, easy_hard_errors = 28, easy_hard_rate = 0.205882, fit_and_validation_seconds = 8.665397, gain_vs_baseline = -0.084632, paired_bootstrap_95 = [-0.19641211185646015, 0.027779524521515577], worst_area_loss = 0.202941 |
| `results / bge/structure/ordinal` | n = 136, macro_f1 = 0.354688, accuracy = 0.352941, ordinal_mae = 0.816176, easy_hard_errors = 23, easy_hard_rate = 0.169118, fit_and_validation_seconds = 0.138171, gain_vs_baseline = -0.116295, paired_bootstrap_95 = [-0.22037539822123153, -0.011853335725103144], worst_area_loss = 0.256232 |
| `results / bge/structure/ridge_b` | n = 136, macro_f1 = 0.368239, accuracy = 0.367647, ordinal_mae = 0.823529, easy_hard_errors = 26, easy_hard_rate = 0.191176, mae_raw_b = 0.850195, fit_and_validation_seconds = 0.041554, gain_vs_baseline = -0.102744, paired_bootstrap_95 = [-0.20823278179591426, 0.0009269989026315592], worst_area_loss = 0.096313 |
| `results / bge/area/multiclass` | n = 136, macro_f1 = 0.390424, accuracy = 0.397059, ordinal_mae = 0.816176, easy_hard_errors = 29, easy_hard_rate = 0.213235, fit_and_validation_seconds = 9.571665, gain_vs_baseline = -0.080559, paired_bootstrap_95 = [-0.18518422289081785, 0.027034176236839652], worst_area_loss = 0.250975 |
| `results / bge/area/ordinal` | n = 136, macro_f1 = 0.367440, accuracy = 0.367647, ordinal_mae = 0.816176, easy_hard_errors = 25, easy_hard_rate = 0.183824, fit_and_validation_seconds = 0.159331, gain_vs_baseline = -0.103543, paired_bootstrap_95 = [-0.20864212061810508, 0.007688542600475769], worst_area_loss = 0.189199 |
| `results / bge/area/ridge_b` | n = 136, macro_f1 = 0.368174, accuracy = 0.367647, ordinal_mae = 0.786765, easy_hard_errors = 21, easy_hard_rate = 0.154412, mae_raw_b = 0.857946, fit_and_validation_seconds = 0.044789, gain_vs_baseline = -0.102809, paired_bootstrap_95 = [-0.21557550033680234, 0.009921852796315545], worst_area_loss = 0.200846 |
| `results / bge/both/multiclass` | n = 136, macro_f1 = 0.384349, accuracy = 0.389706, ordinal_mae = 0.808824, easy_hard_errors = 27, easy_hard_rate = 0.198529, fit_and_validation_seconds = 9.882311, gain_vs_baseline = -0.086634, paired_bootstrap_95 = [-0.19263870997042196, 0.02051963445719825], worst_area_loss = 0.222898 |
| `results / bge/both/ordinal` | n = 136, macro_f1 = 0.352838, accuracy = 0.352941, ordinal_mae = 0.830882, easy_hard_errors = 25, easy_hard_rate = 0.183824, fit_and_validation_seconds = 0.159645, gain_vs_baseline = -0.118145, paired_bootstrap_95 = [-0.22294002708364227, -0.00940216917910178], worst_area_loss = 0.249161 |
| `results / bge/both/ridge_b` | n = 136, macro_f1 = 0.360680, accuracy = 0.360294, ordinal_mae = 0.823529, easy_hard_errors = 25, easy_hard_rate = 0.183824, mae_raw_b = 0.858831, fit_and_validation_seconds = 0.040677, gain_vs_baseline = -0.110303, paired_bootstrap_95 = [-0.22386122296409075, -0.00027689038309374343], worst_area_loss = 0.228263 |

## results/fase02r_minilm_latencia.json

Arquivo integral · [fase02r_minilm_latencia.json](evidencias/workspace/dificuldade-adaptativa/results/fase02r_minilm_latencia.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `raiz` | median_seconds = 0.019089 |

## results/fase02r_qwen06_cuda_latencia.json

Arquivo integral · [fase02r_qwen06_cuda_latencia.json](evidencias/workspace/dificuldade-adaptativa/results/fase02r_qwen06_cuda_latencia.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `raiz` | median_seconds = 0.059341 |

## results/fase02r_qwen06_latencia.json

Arquivo integral · [fase02r_qwen06_latencia.json](evidencias/workspace/dificuldade-adaptativa/results/fase02r_qwen06_latencia.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `raiz` | median_seconds = 0.874287 |

## results/fase_01.json

Arquivo integral · [fase_01.json](evidencias/workspace/dificuldade-adaptativa/results/fase_01.json)

Contagens e resultados de topo · `catalog_count` = 2971, `near_duplicates_flagged` = 0
Veja o arquivo integral para distribuições, critérios, tempos, resultados por lote e verificações.

## results/fase_02.json

Arquivo integral · [fase_02.json](evidencias/workspace/dificuldade-adaptativa/results/fase_02.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `validation / majoritaria` | n = 136, macro_f1 = 0.189474, accuracy = 0.397059 |
| `validation / tfidf_palavras` | n = 136, macro_f1 = 0.418243, accuracy = 0.419118 |
| `validation / tfidf_caracteres` | n = 136, macro_f1 = 0.418841, accuracy = 0.426471 |
| `sensitivity_validation / metrics` | n = 136, macro_f1 = 0.427520, accuracy = 0.433824 |
| `test / tfidf_caracteres` | n = 126, macro_f1 = 0.446749, accuracy = 0.452381 |
| `test / majoritaria` | n = 126, macro_f1 = 0.197393, accuracy = 0.420635 |

## results/fase_02_final.json

Arquivo integral · [fase_02_final.json](evidencias/workspace/dificuldade-adaptativa/results/fase_02_final.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `validation / majoritaria` | n = 136, macro_f1 = 0.189474, accuracy = 0.397059 |
| `validation / tfidf_palavras` | n = 136, macro_f1 = 0.418243, accuracy = 0.419118 |
| `validation / tfidf_caracteres` | n = 136, macro_f1 = 0.418841, accuracy = 0.426471 |
| `validation / minilm` | n = 136, macro_f1 = 0.470983, accuracy = 0.470588 |
| `sensitivity_validation / metrics` | n = 136, macro_f1 = 0.456217, accuracy = 0.455882 |
| `test / minilm` | n = 126, macro_f1 = 0.528420, accuracy = 0.531746 |
| `test / majoritaria` | n = 126, macro_f1 = 0.197393, accuracy = 0.420635 |

## results/fase_02_reproducao.json

Arquivo integral · [fase_02_reproducao.json](evidencias/workspace/dificuldade-adaptativa/results/fase_02_reproducao.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `validation / majoritaria` | n = 136, macro_f1 = 0.189474, accuracy = 0.397059 |
| `validation / tfidf_palavras` | n = 136, macro_f1 = 0.418243, accuracy = 0.419118 |
| `validation / tfidf_caracteres` | n = 136, macro_f1 = 0.418841, accuracy = 0.426471 |
| `sensitivity_validation / metrics` | n = 136, macro_f1 = 0.427520, accuracy = 0.433824 |
| `test / tfidf_caracteres` | n = 126, macro_f1 = 0.446749, accuracy = 0.452381 |
| `test / majoritaria` | n = 126, macro_f1 = 0.197393, accuracy = 0.420635 |

## results/ft_bert_256_42/metricas.json

Arquivo integral · [metricas.json](evidencias/workspace/dificuldade-adaptativa/results/ft_bert_256_42/metricas.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `raiz` | n = 136, macro_f1 = 0.485202, accuracy = 0.485294, ordinal_mae = 0.566176, easy_hard_errors = 7, easy_hard_rate = 0.051471, validation_seconds = 0.597806, epoch = 2, seed = 42, limit = 256, batch = 4, effective_batch = 16, lr = 0.000030, changed_encoder_parameters = 32 |

## results/ft_bert_256_7/metricas.json

Arquivo integral · [metricas.json](evidencias/workspace/dificuldade-adaptativa/results/ft_bert_256_7/metricas.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `raiz` | n = 136, macro_f1 = 0.512251, accuracy = 0.566176, ordinal_mae = 0.558824, easy_hard_errors = 17, easy_hard_rate = 0.125000, validation_seconds = 0.809632, epoch = 1, seed = 7, limit = 256, batch = 2, effective_batch = 16, lr = 0.000030, changed_encoder_parameters = 32 |

## results/ft_bert_512_42/metricas.json

Arquivo integral · [metricas.json](evidencias/workspace/dificuldade-adaptativa/results/ft_bert_512_42/metricas.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `raiz` | n = 136, macro_f1 = 0.493676, accuracy = 0.492647, ordinal_mae = 0.566176, easy_hard_errors = 8, easy_hard_rate = 0.058824, validation_seconds = 0.863032, epoch = 2, seed = 42, limit = 512, batch = 2, effective_batch = 16, lr = 0.000030, changed_encoder_parameters = 32 |

## results/ft_bert_512_7/metricas.json

Arquivo integral · [metricas.json](evidencias/workspace/dificuldade-adaptativa/results/ft_bert_512_7/metricas.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `raiz` | n = 136, macro_f1 = 0.522332, accuracy = 0.573529, ordinal_mae = 0.544118, easy_hard_errors = 16, easy_hard_rate = 0.117647, validation_seconds = 0.866772, epoch = 1, seed = 7, limit = 512, cuts = [0.8005400000000001, 1.56301], validation_year = 2023, batch = 2, effective_batch = 16, lr = 0.000030, changed_encoder_parameters = 32 |

## results/ft_comparacao.json

Arquivo integral · [ft_comparacao.json](evidencias/workspace/dificuldade-adaptativa/results/ft_comparacao.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `runs / ft_bert_256_42` | n = 136, macro_f1 = 0.485202, accuracy = 0.485294, ordinal_mae = 0.566176, easy_hard_errors = 7, easy_hard_rate = 0.051471, validation_seconds = 0.597806, epoch = 2, seed = 42, limit = 256, batch = 4, effective_batch = 16, lr = 0.000030, changed_encoder_parameters = 32, paired_ci_vs_minilm = [-0.09203261447248048, 0.1255952532442659] |
| `runs / ft_bert_256_7` | n = 136, macro_f1 = 0.512251, accuracy = 0.566176, ordinal_mae = 0.558824, easy_hard_errors = 17, easy_hard_rate = 0.125000, validation_seconds = 0.809632, epoch = 1, seed = 7, limit = 256, batch = 2, effective_batch = 16, lr = 0.000030, changed_encoder_parameters = 32, paired_ci_vs_minilm = [-0.04692320526077565, 0.13413665339512482] |
| `runs / ft_bert_512_42` | n = 136, macro_f1 = 0.493676, accuracy = 0.492647, ordinal_mae = 0.566176, easy_hard_errors = 8, easy_hard_rate = 0.058824, validation_seconds = 0.863032, epoch = 2, seed = 42, limit = 512, batch = 2, effective_batch = 16, lr = 0.000030, changed_encoder_parameters = 32, paired_ci_vs_minilm = [-0.08444404481070372, 0.13271835493413844] |
| `runs / ft_bert_512_7` | n = 136, macro_f1 = 0.522332, accuracy = 0.573529, ordinal_mae = 0.544118, easy_hard_errors = 16, easy_hard_rate = 0.117647, validation_seconds = 0.866772, epoch = 1, seed = 7, limit = 512, cuts = [0.8005400000000001, 1.56301], validation_year = 2023, batch = 2, effective_batch = 16, lr = 0.000030, changed_encoder_parameters = 32, paired_ci_vs_minilm = [-0.035733399682716764, 0.14467401456625514] |
| `runs / ft_deberta_256_42` | n = 136, macro_f1 = 0.423442, accuracy = 0.463235, ordinal_mae = 0.647059, easy_hard_errors = 15, easy_hard_rate = 0.110294, validation_seconds = 1.346126, epoch = 2, seed = 42, limit = 256, batch = 2, effective_batch = 16, lr = 0.000030, changed_encoder_parameters = 32, paired_ci_vs_minilm = [-0.1377490970012594, 0.05693171110566496] |
| `runs / ft_deberta_256_7` | n = 136, macro_f1 = 0.425380, accuracy = 0.522059, ordinal_mae = 0.632353, easy_hard_errors = 21, easy_hard_rate = 0.154412, validation_seconds = 1.453756, epoch = 2, seed = 7, limit = 256, cuts = [0.8005400000000001, 1.56301], validation_year = 2023, batch = 2, effective_batch = 16, lr = 0.000030, changed_encoder_parameters = 32, paired_ci_vs_minilm = [-0.12543388651396176, 0.03686826939206458] |
| `runs / ft_deberta_512_42` | n = 136, macro_f1 = 0.411062, accuracy = 0.529412, ordinal_mae = 0.625000, easy_hard_errors = 21, easy_hard_rate = 0.154412, validation_seconds = 2.157020, epoch = 2, seed = 42, limit = 512, batch = 2, effective_batch = 16, lr = 0.000030, changed_encoder_parameters = 32, paired_ci_vs_minilm = [-0.14611478989066629, 0.029854791181098836] |
| `alternative_heads / multiclass` | n = 136, macro_f1 = 0.425823, accuracy = 0.426471, ordinal_mae = 0.683824, easy_hard_errors = 15, easy_hard_rate = 0.110294 |
| `alternative_heads / ordinal` | n = 136, macro_f1 = 0.443496, accuracy = 0.441176, ordinal_mae = 0.647059, easy_hard_errors = 12, easy_hard_rate = 0.088235 |
| `alternative_heads / ridge` | n = 136, macro_f1 = 0.393361, accuracy = 0.389706, ordinal_mae = 0.691176, easy_hard_errors = 11, easy_hard_rate = 0.080882, mae_raw_b = 0.626699, rmse_raw_b = 0.770248, residual_quantiles = [-1.1010736622524262, 0.22278746255874637, 1.4142967757892608], clipping_bounds = [-0.64144, 3.8538], clipped_train = 36 |
| `hybrid / embedding` | n = 136, macro_f1 = 0.425823, accuracy = 0.426471, ordinal_mae = 0.683824, easy_hard_errors = 15, easy_hard_rate = 0.110294 |
| `hybrid / area` | n = 136, macro_f1 = 0.439806, accuracy = 0.441176, ordinal_mae = 0.676471, easy_hard_errors = 16, easy_hard_rate = 0.117647 |
| `hybrid / structure` | n = 136, macro_f1 = 0.431952, accuracy = 0.433824, ordinal_mae = 0.691176, easy_hard_errors = 17, easy_hard_rate = 0.125000 |
| `hybrid / both` | n = 136, macro_f1 = 0.447507, accuracy = 0.448529, ordinal_mae = 0.661765, easy_hard_errors = 15, easy_hard_rate = 0.110294 |
| `seed_comparisons / neuralmind/bert-base-portuguese-cased/256 / 0` | seed = 42, batch = 4, macro_f1 = 0.485202 |
| `seed_comparisons / neuralmind/bert-base-portuguese-cased/256 / 1` | seed = 7, batch = 2, macro_f1 = 0.512251 |
| `seed_comparisons / neuralmind/bert-base-portuguese-cased/512 / 0` | seed = 42, batch = 2, macro_f1 = 0.493676 |
| `seed_comparisons / neuralmind/bert-base-portuguese-cased/512 / 1` | seed = 7, batch = 2, macro_f1 = 0.522332 |
| `seed_comparisons / microsoft/mdeberta-v3-base/256 / 0` | seed = 42, batch = 2, macro_f1 = 0.423442 |
| `seed_comparisons / microsoft/mdeberta-v3-base/256 / 1` | seed = 7, batch = 2, macro_f1 = 0.425380 |
| `seed_comparisons / microsoft/mdeberta-v3-base/512 / 0` | seed = 42, batch = 2, macro_f1 = 0.411062 |

## results/ft_deberta_256_42/metricas.json

Arquivo integral · [metricas.json](evidencias/workspace/dificuldade-adaptativa/results/ft_deberta_256_42/metricas.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `raiz` | n = 136, macro_f1 = 0.423442, accuracy = 0.463235, ordinal_mae = 0.647059, easy_hard_errors = 15, easy_hard_rate = 0.110294, validation_seconds = 1.346126, epoch = 2, seed = 42, limit = 256, batch = 2, effective_batch = 16, lr = 0.000030, changed_encoder_parameters = 32 |

## results/ft_deberta_256_7/metricas.json

Arquivo integral · [metricas.json](evidencias/workspace/dificuldade-adaptativa/results/ft_deberta_256_7/metricas.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `raiz` | n = 136, macro_f1 = 0.425380, accuracy = 0.522059, ordinal_mae = 0.632353, easy_hard_errors = 21, easy_hard_rate = 0.154412, validation_seconds = 1.453756, epoch = 2, seed = 7, limit = 256, cuts = [0.8005400000000001, 1.56301], validation_year = 2023, batch = 2, effective_batch = 16, lr = 0.000030, changed_encoder_parameters = 32 |

## results/ft_deberta_512_42/metricas.json

Arquivo integral · [metricas.json](evidencias/workspace/dificuldade-adaptativa/results/ft_deberta_512_42/metricas.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `raiz` | n = 136, macro_f1 = 0.411062, accuracy = 0.529412, ordinal_mae = 0.625000, easy_hard_errors = 21, easy_hard_rate = 0.154412, validation_seconds = 2.157020, epoch = 2, seed = 42, limit = 512, batch = 2, effective_batch = 16, lr = 0.000030, changed_encoder_parameters = 32 |

## results/ft_minilm_ablation_128_42/metricas.json

Arquivo integral · [metricas.json](evidencias/workspace/dificuldade-adaptativa/results/ft_minilm_ablation_128_42/metricas.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `raiz` | n = 136, macro_f1 = 0.432419, accuracy = 0.441176, ordinal_mae = 0.683824, easy_hard_errors = 17, easy_hard_rate = 0.125000, validation_seconds = 0.277278, epoch = 2, seed = 42, limit = 128, cuts = [0.8005400000000001, 1.56301], validation_year = 2023, batch = 4, effective_batch = 16, lr = 0.000030, changed_encoder_parameters = 32 |

## results/interno_ft_bert_512_42/metricas.json

Arquivo integral · [metricas.json](evidencias/workspace/dificuldade-adaptativa/results/interno_ft_bert_512_42/metricas.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `raiz` | n = 134, macro_f1 = 0.513364, accuracy = 0.552239, ordinal_mae = 0.544776, easy_hard_errors = 13, easy_hard_rate = 0.097015, validation_seconds = 0.897292, epoch = 2, seed = 42, limit = 512, cuts = [0.7979433333333333, 1.55102], validation_year = 2022, batch = 2, effective_batch = 16, lr = 0.000030, changed_encoder_parameters = 32 |

## revisao_pedagogica/metricas.json

Arquivo integral · [metricas.json](evidencias/workspace/dificuldade-adaptativa/revisao_pedagogica/metricas.json)

Contagens e resultados de topo · `n` = 2971, `sem_assunto` = 560, `sem_habilidade` = 192, `sugestoes` = 18, `sugestoes_em_ausentes` = 2, `amostra` = 300, `piloto` = 1329, `visual_sem_asset` = 0, `extracao_incompleta` = 2, `certificadas` = 0
Veja o arquivo integral para distribuições, critérios, tempos, resultados por lote e verificações.

## validacao_adaptativa/resultados.json

Arquivo integral · [resultados.json](evidencias/workspace/dificuldade-adaptativa/validacao_adaptativa/resultados.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `results / manter / overall` | n = 11664, accuracy = 0.333333, difficulty_error = 0.666667, inadequate_challenge = 0.676955, false_change_when_adequate = 0.000000, coverage = 0.555556, latent_proxy_mae = 1.344512, oscillations = 0, repeat_rate = 0.000000, autonomy_violations = 0 |
| `results / manter / by_profile / estavel_dificil` | n = 1296, accuracy = 0.333333, difficulty_error = 0.666667, inadequate_challenge = 0.666667, false_change_when_adequate = 0.000000, coverage = 0.555556, latent_proxy_mae = 0.652702, oscillations = 0, repeat_rate = 0.000000, autonomy_violations = 0 |
| `results / manter / by_profile / estavel_facil` | n = 1296, accuracy = 0.333333, difficulty_error = 0.666667, inadequate_challenge = 0.666667, false_change_when_adequate = 0.000000, coverage = 0.555556, latent_proxy_mae = 2.147298, oscillations = 0, repeat_rate = 0.000000, autonomy_violations = 0 |
| `results / manter / by_profile / estavel_medio` | n = 1296, accuracy = 0.333333, difficulty_error = 0.666667, inadequate_challenge = 0.333333, false_change_when_adequate = 0.000000, coverage = 0.555556, latent_proxy_mae = 0.847298, oscillations = 0, repeat_rate = 0.000000, autonomy_violations = 0 |
| `results / manter / by_profile / irregular` | n = 1296, accuracy = 0.333333, difficulty_error = 0.666667, inadequate_challenge = 0.601852, false_change_when_adequate = 0.000000, coverage = 0.555556, latent_proxy_mae = 1.267233, oscillations = 0, repeat_rate = 0.000000, autonomy_violations = 0 |
| `results / manter / by_profile / progressivo` | n = 1296, accuracy = 0.333333, difficulty_error = 0.666667, inadequate_challenge = 0.657407, false_change_when_adequate = 0.000000, coverage = 0.555556, latent_proxy_mae = 0.577162, oscillations = 0, repeat_rate = 0.000000, autonomy_violations = 0 |
| `results / manter / by_profile / queda` | n = 1296, accuracy = 0.333333, difficulty_error = 0.666667, inadequate_challenge = 0.888889, false_change_when_adequate = 0.000000, coverage = 0.555556, latent_proxy_mae = 2.547298, oscillations = 0, repeat_rate = 0.000000, autonomy_violations = 0 |
| `results / manter / by_profile / queda_gradual` | n = 1296, accuracy = 0.333333, difficulty_error = 0.666667, inadequate_challenge = 0.740741, false_change_when_adequate = 0.000000, coverage = 0.555556, latent_proxy_mae = 2.217298, oscillations = 0, repeat_rate = 0.000000, autonomy_violations = 0 |
| `results / manter / by_profile / rapido` | n = 1296, accuracy = 0.333333, difficulty_error = 0.666667, inadequate_challenge = 0.759259, false_change_when_adequate = 0.000000, coverage = 0.555556, latent_proxy_mae = 0.752702, oscillations = 0, repeat_rate = 0.000000, autonomy_violations = 0 |
| `results / manter / by_skill / CN:outra` | n = 3888, accuracy = 0.333333, difficulty_error = 0.666667, inadequate_challenge = 0.703704, false_change_when_adequate = 0.000000, coverage = 0.333333, latent_proxy_mae = 1.528965, oscillations = 0, repeat_rate = 0.000000, autonomy_violations = 0 |
| `results / manter / by_skill / MT:algebra` | n = 7776, accuracy = 0.333333, difficulty_error = 0.666667, inadequate_challenge = 0.663580, false_change_when_adequate = 0.000000, coverage = 0.666667, latent_proxy_mae = 1.298399, oscillations = 0, repeat_rate = 0.000000, autonomy_violations = 0 |
| `results / taxa / overall` | n = 11664, accuracy = 0.342164, difficulty_error = 0.657836, inadequate_challenge = 0.666667, false_change_when_adequate = 0.054527, coverage = 0.555556, latent_proxy_mae = 1.174933, oscillations = 1859, repeat_rate = 0.526971, autonomy_violations = 0 |
| `results / taxa / by_profile / estavel_dificil` | n = 1296, accuracy = 0.370370, difficulty_error = 0.629630, inadequate_challenge = 0.629630, false_change_when_adequate = 0.006944, coverage = 0.555556, latent_proxy_mae = 0.690227, oscillations = 218, repeat_rate = 0.552632, autonomy_violations = 0 |
| `results / taxa / by_profile / estavel_facil` | n = 1296, accuracy = 0.371914, difficulty_error = 0.628086, inadequate_challenge = 0.628086, false_change_when_adequate = 0.013889, coverage = 0.555556, latent_proxy_mae = 0.936766, oscillations = 243, repeat_rate = 0.590164, autonomy_violations = 0 |
| `results / taxa / by_profile / estavel_medio` | n = 1296, accuracy = 0.388117, difficulty_error = 0.611883, inadequate_challenge = 0.295525, false_change_when_adequate = 0.041667, coverage = 0.555556, latent_proxy_mae = 0.766578, oscillations = 204, repeat_rate = 0.514019, autonomy_violations = 0 |
| `results / taxa / by_profile / irregular` | n = 1296, accuracy = 0.310185, difficulty_error = 0.689815, inadequate_challenge = 0.614969, false_change_when_adequate = 0.104167, coverage = 0.555556, latent_proxy_mae = 1.299815, oscillations = 209, repeat_rate = 0.587156, autonomy_violations = 0 |
| `results / taxa / by_profile / progressivo` | n = 1296, accuracy = 0.320988, difficulty_error = 0.679012, inadequate_challenge = 0.666667, false_change_when_adequate = 0.085648, coverage = 0.555556, latent_proxy_mae = 1.056519, oscillations = 189, repeat_rate = 0.480392, autonomy_violations = 0 |
| `results / taxa / by_profile / queda` | n = 1296, accuracy = 0.322531, difficulty_error = 0.677469, inadequate_challenge = 0.888889, false_change_when_adequate = 0.060185, coverage = 0.555556, latent_proxy_mae = 2.045850, oscillations = 186, repeat_rate = 0.361702, autonomy_violations = 0 |
| `results / taxa / by_profile / queda_gradual` | n = 1296, accuracy = 0.311728, difficulty_error = 0.688272, inadequate_challenge = 0.747685, false_change_when_adequate = 0.087963, coverage = 0.555556, latent_proxy_mae = 1.749486, oscillations = 202, repeat_rate = 0.524272, autonomy_violations = 0 |
| `results / taxa / by_profile / rapido` | n = 1296, accuracy = 0.307870, difficulty_error = 0.692130, inadequate_challenge = 0.784722, false_change_when_adequate = 0.085648, coverage = 0.555556, latent_proxy_mae = 1.245807, oscillations = 173, repeat_rate = 0.510638, autonomy_violations = 0 |
| `results / taxa / by_skill / CN:outra` | n = 3888, accuracy = 0.340021, difficulty_error = 0.659979, inadequate_challenge = 0.700617, false_change_when_adequate = 0.032407, coverage = 0.333333, latent_proxy_mae = 1.169037, oscillations = 369, repeat_rate = 0.000000, autonomy_violations = 0 |
| `results / taxa / by_skill / MT:algebra` | n = 7776, accuracy = 0.343236, difficulty_error = 0.656764, inadequate_challenge = 0.649691, false_change_when_adequate = 0.065586, coverage = 0.666667, latent_proxy_mae = 1.176406, oscillations = 1490, repeat_rate = 0.659740, autonomy_violations = 0 |
| `results / bkt / overall` | n = 11664, accuracy = 0.339420, difficulty_error = 0.660580, inadequate_challenge = 0.668296, false_change_when_adequate = 0.108796, coverage = 0.555556, latent_proxy_mae = 1.063777, oscillations = 2938, repeat_rate = 0.554054, autonomy_violations = 0 |
| `results / bkt / by_profile / estavel_dificil` | n = 1296, accuracy = 0.367284, difficulty_error = 0.632716, inadequate_challenge = 0.632716, false_change_when_adequate = 0.037037, coverage = 0.555556, latent_proxy_mae = 0.185945, oscillations = 272, repeat_rate = 0.588235, autonomy_violations = 0 |
| `results / bkt / by_profile / estavel_facil` | n = 1296, accuracy = 0.329475, difficulty_error = 0.670525, inadequate_challenge = 0.670525, false_change_when_adequate = 0.136574, coverage = 0.555556, latent_proxy_mae = 1.337451, oscillations = 354, repeat_rate = 0.573034, autonomy_violations = 0 |
| `results / bkt / by_profile / estavel_medio` | n = 1296, accuracy = 0.385802, difficulty_error = 0.614198, inadequate_challenge = 0.315586, false_change_when_adequate = 0.120370, coverage = 0.555556, latent_proxy_mae = 0.897027, oscillations = 341, repeat_rate = 0.558140, autonomy_violations = 0 |
| `results / bkt / by_profile / irregular` | n = 1296, accuracy = 0.317901, difficulty_error = 0.682099, inadequate_challenge = 0.610340, false_change_when_adequate = 0.145833, coverage = 0.555556, latent_proxy_mae = 1.352153, oscillations = 351, repeat_rate = 0.551136, autonomy_violations = 0 |
| `results / bkt / by_profile / progressivo` | n = 1296, accuracy = 0.353395, difficulty_error = 0.646605, inadequate_challenge = 0.639660, false_change_when_adequate = 0.104167, coverage = 0.555556, latent_proxy_mae = 0.429398, oscillations = 331, repeat_rate = 0.550898, autonomy_violations = 0 |
| `results / bkt / by_profile / queda` | n = 1296, accuracy = 0.301698, difficulty_error = 0.698302, inadequate_challenge = 0.888889, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 2.337524, oscillations = 337, repeat_rate = 0.529412, autonomy_violations = 0 |
| `results / bkt / by_profile / queda_gradual` | n = 1296, accuracy = 0.299383, difficulty_error = 0.700617, inadequate_challenge = 0.753086, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 1.999958, oscillations = 344, repeat_rate = 0.554286, autonomy_violations = 0 |
| `results / bkt / by_profile / rapido` | n = 1296, accuracy = 0.336420, difficulty_error = 0.663580, inadequate_challenge = 0.756173, false_change_when_adequate = 0.108796, coverage = 0.555556, latent_proxy_mae = 0.558559, oscillations = 326, repeat_rate = 0.539394, autonomy_violations = 0 |
| `results / bkt / by_skill / CN:outra` | n = 3888, accuracy = 0.335134, difficulty_error = 0.664866, inadequate_challenge = 0.700617, false_change_when_adequate = 0.070988, coverage = 0.333333, latent_proxy_mae = 1.178737, oscillations = 607, repeat_rate = 0.000000, autonomy_violations = 0 |
| `results / bkt / by_skill / MT:algebra` | n = 7776, accuracy = 0.341564, difficulty_error = 0.658436, inadequate_challenge = 0.652135, false_change_when_adequate = 0.127701, coverage = 0.666667, latent_proxy_mae = 1.035037, oscillations = 2331, repeat_rate = 0.697872, autonomy_violations = 0 |
| `results / sgd / overall` | n = 11664, accuracy = 0.321159, difficulty_error = 0.678841, inadequate_challenge = 0.683299, false_change_when_adequate = 0.117027, coverage = 0.555556, latent_proxy_mae = 1.147104, oscillations = 2505, repeat_rate = 0.576096, autonomy_violations = 0 |
| `results / sgd / by_profile / estavel_dificil` | n = 1296, accuracy = 0.333333, difficulty_error = 0.666667, inadequate_challenge = 0.666667, false_change_when_adequate = 0.122685, coverage = 0.555556, latent_proxy_mae = 0.315608, oscillations = 330, repeat_rate = 0.590361, autonomy_violations = 0 |
| `results / sgd / by_profile / estavel_facil` | n = 1296, accuracy = 0.304784, difficulty_error = 0.695216, inadequate_challenge = 0.695216, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 1.416890, oscillations = 286, repeat_rate = 0.580420, autonomy_violations = 0 |
| `results / sgd / by_profile / estavel_medio` | n = 1296, accuracy = 0.420525, difficulty_error = 0.579475, inadequate_challenge = 0.292438, false_change_when_adequate = 0.016204, coverage = 0.555556, latent_proxy_mae = 0.686879, oscillations = 254, repeat_rate = 0.566929, autonomy_violations = 0 |
| `results / sgd / by_profile / irregular` | n = 1296, accuracy = 0.311728, difficulty_error = 0.688272, inadequate_challenge = 0.614198, false_change_when_adequate = 0.120370, coverage = 0.555556, latent_proxy_mae = 1.294004, oscillations = 254, repeat_rate = 0.574803, autonomy_violations = 0 |
| `results / sgd / by_profile / progressivo` | n = 1296, accuracy = 0.320988, difficulty_error = 0.679012, inadequate_challenge = 0.669753, false_change_when_adequate = 0.111111, coverage = 0.555556, latent_proxy_mae = 0.669414, oscillations = 256, repeat_rate = 0.570312, autonomy_violations = 0 |
| `results / sgd / by_profile / queda` | n = 1296, accuracy = 0.287809, difficulty_error = 0.712191, inadequate_challenge = 0.888889, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 2.400178, oscillations = 268, repeat_rate = 0.548148, autonomy_violations = 0 |
| `results / sgd / by_profile / queda_gradual` | n = 1296, accuracy = 0.287809, difficulty_error = 0.712191, inadequate_challenge = 0.744599, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 2.077291, oscillations = 270, repeat_rate = 0.562963, autonomy_violations = 0 |
| `results / sgd / by_profile / rapido` | n = 1296, accuracy = 0.290123, difficulty_error = 0.709877, inadequate_challenge = 0.802469, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 0.877790, oscillations = 248, repeat_rate = 0.588710, autonomy_violations = 0 |
| `results / sgd / by_skill / CN:outra` | n = 3888, accuracy = 0.322274, difficulty_error = 0.677726, inadequate_challenge = 0.711163, false_change_when_adequate = 0.078704, coverage = 0.333333, latent_proxy_mae = 1.276998, oscillations = 520, repeat_rate = 0.000000, autonomy_violations = 0 |
| `results / sgd / by_skill / MT:algebra` | n = 7776, accuracy = 0.320602, difficulty_error = 0.679398, inadequate_challenge = 0.669367, false_change_when_adequate = 0.136188, coverage = 0.666667, latent_proxy_mae = 1.114630, oscillations = 1985, repeat_rate = 0.726633, autonomy_violations = 0 |
| `results / hibrido / overall` | n = 11664, accuracy = 0.324160, difficulty_error = 0.675840, inadequate_challenge = 0.681070, false_change_when_adequate = 0.118313, coverage = 0.555556, latent_proxy_mae = 1.107272, oscillations = 2620, repeat_rate = 0.565350, autonomy_violations = 0 |
| `results / hibrido / by_profile / estavel_dificil` | n = 1296, accuracy = 0.333333, difficulty_error = 0.666667, inadequate_challenge = 0.666667, false_change_when_adequate = 0.122685, coverage = 0.555556, latent_proxy_mae = 0.291390, oscillations = 328, repeat_rate = 0.590361, autonomy_violations = 0 |
| `results / hibrido / by_profile / estavel_facil` | n = 1296, accuracy = 0.324846, difficulty_error = 0.675154, inadequate_challenge = 0.675154, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 1.326759, oscillations = 335, repeat_rate = 0.585799, autonomy_violations = 0 |
| `results / hibrido / by_profile / estavel_medio` | n = 1296, accuracy = 0.412809, difficulty_error = 0.587191, inadequate_challenge = 0.294753, false_change_when_adequate = 0.039352, coverage = 0.555556, latent_proxy_mae = 0.689285, oscillations = 274, repeat_rate = 0.554745, autonomy_violations = 0 |
| `results / hibrido / by_profile / irregular` | n = 1296, accuracy = 0.317901, difficulty_error = 0.682099, inadequate_challenge = 0.608025, false_change_when_adequate = 0.111111, coverage = 0.555556, latent_proxy_mae = 1.277917, oscillations = 263, repeat_rate = 0.560606, autonomy_violations = 0 |
| `results / hibrido / by_profile / progressivo` | n = 1296, accuracy = 0.319444, difficulty_error = 0.680556, inadequate_challenge = 0.671296, false_change_when_adequate = 0.115741, coverage = 0.555556, latent_proxy_mae = 0.650010, oscillations = 260, repeat_rate = 0.561538, autonomy_violations = 0 |
| `results / hibrido / by_profile / queda` | n = 1296, accuracy = 0.290895, difficulty_error = 0.709105, inadequate_challenge = 0.888889, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 2.327383, oscillations = 278, repeat_rate = 0.542857, autonomy_violations = 0 |
| `results / hibrido / by_profile / queda_gradual` | n = 1296, accuracy = 0.289352, difficulty_error = 0.710648, inadequate_challenge = 0.750000, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 1.998915, oscillations = 285, repeat_rate = 0.538462, autonomy_violations = 0 |
| `results / hibrido / by_profile / rapido` | n = 1296, accuracy = 0.290895, difficulty_error = 0.709105, inadequate_challenge = 0.801698, false_change_when_adequate = 0.138889, coverage = 0.555556, latent_proxy_mae = 0.843452, oscillations = 258, repeat_rate = 0.565891, autonomy_violations = 0 |
| `results / hibrido / by_skill / CN:outra` | n = 3888, accuracy = 0.326132, difficulty_error = 0.673868, inadequate_challenge = 0.708076, false_change_when_adequate = 0.075617, coverage = 0.333333, latent_proxy_mae = 1.226536, oscillations = 543, repeat_rate = 0.000000, autonomy_violations = 0 |
| `results / hibrido / by_skill / MT:algebra` | n = 7776, accuracy = 0.323174, difficulty_error = 0.676826, inadequate_challenge = 0.667567, false_change_when_adequate = 0.139660, coverage = 0.666667, latent_proxy_mae = 1.077456, oscillations = 2077, repeat_rate = 0.713327, autonomy_violations = 0 |
| `results / elo / overall` | n = 11664, accuracy = 0.334276, difficulty_error = 0.665724, inadequate_challenge = 0.677726, false_change_when_adequate = 0.087706, coverage = 0.555556, latent_proxy_mae = 0.949323, oscillations = 2274, repeat_rate = 0.543478, autonomy_violations = 0 |
| `results / elo / by_profile / estavel_dificil` | n = 1296, accuracy = 0.306327, difficulty_error = 0.693673, inadequate_challenge = 0.693673, false_change_when_adequate = 0.108796, coverage = 0.555556, latent_proxy_mae = 0.770994, oscillations = 237, repeat_rate = 0.558333, autonomy_violations = 0 |
| `results / elo / by_profile / estavel_facil` | n = 1296, accuracy = 0.375000, difficulty_error = 0.625000, inadequate_challenge = 0.625000, false_change_when_adequate = 0.013889, coverage = 0.555556, latent_proxy_mae = 0.591254, oscillations = 252, repeat_rate = 0.595238, autonomy_violations = 0 |
| `results / elo / by_profile / estavel_medio` | n = 1296, accuracy = 0.377315, difficulty_error = 0.622685, inadequate_challenge = 0.287037, false_change_when_adequate = 0.092593, coverage = 0.555556, latent_proxy_mae = 0.307278, oscillations = 270, repeat_rate = 0.554745, autonomy_violations = 0 |
| `results / elo / by_profile / irregular` | n = 1296, accuracy = 0.320988, difficulty_error = 0.679012, inadequate_challenge = 0.604167, false_change_when_adequate = 0.127315, coverage = 0.555556, latent_proxy_mae = 1.028237, oscillations = 275, repeat_rate = 0.578571, autonomy_violations = 0 |
| `results / elo / by_profile / progressivo` | n = 1296, accuracy = 0.307099, difficulty_error = 0.692901, inadequate_challenge = 0.682099, false_change_when_adequate = 0.118056, coverage = 0.555556, latent_proxy_mae = 1.124920, oscillations = 234, repeat_rate = 0.529915, autonomy_violations = 0 |
| `results / elo / by_profile / queda` | n = 1296, accuracy = 0.351080, difficulty_error = 0.648920, inadequate_challenge = 0.888889, false_change_when_adequate = 0.053241, coverage = 0.555556, latent_proxy_mae = 1.445926, oscillations = 256, repeat_rate = 0.488372, autonomy_violations = 0 |
| `results / elo / by_profile / queda_gradual` | n = 1296, accuracy = 0.343364, difficulty_error = 0.656636, inadequate_challenge = 0.733796, false_change_when_adequate = 0.074074, coverage = 0.555556, latent_proxy_mae = 1.195003, oscillations = 269, repeat_rate = 0.540146, autonomy_violations = 0 |
| `results / elo / by_profile / rapido` | n = 1296, accuracy = 0.292438, difficulty_error = 0.707562, inadequate_challenge = 0.800154, false_change_when_adequate = 0.127315, coverage = 0.555556, latent_proxy_mae = 1.335367, oscillations = 233, repeat_rate = 0.508475, autonomy_violations = 0 |
| `results / elo / by_skill / CN:outra` | n = 3888, accuracy = 0.333333, difficulty_error = 0.666667, inadequate_challenge = 0.710905, false_change_when_adequate = 0.054012, coverage = 0.333333, latent_proxy_mae = 1.031828, oscillations = 447, repeat_rate = 0.000000, autonomy_violations = 0 |
| `results / elo / by_skill / MT:algebra` | n = 7776, accuracy = 0.334748, difficulty_error = 0.665252, inadequate_challenge = 0.661137, false_change_when_adequate = 0.104552, coverage = 0.666667, latent_proxy_mae = 0.928697, oscillations = 1827, repeat_rate = 0.677874, autonomy_violations = 0 |
| `real_data_reference / sgd` | auc = 0.618480, accuracy = 0.725862, f1 = 0.833106, log_loss = 0.580836, brier = 0.196154, ece = 0.042373 |
| `real_data_reference / bkt_sgd` | auc = 0.617365, accuracy = 0.723413, f1 = 0.828763, log_loss = 0.579485, brier = 0.195601, ece = 0.040018 |
| `real_bkt` | auc = 0.600571, accuracy = 0.721780, f1 = 0.825904, log_loss = 0.585226, brier = 0.197984, ece = 0.042991 |

## validacao_tri/incremental.json

Arquivo integral · [incremental.json](evidencias/workspace/dificuldade-adaptativa/validacao_tri/incremental.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `metrics / constante` | auc = 0.500000, accuracy = 0.708104, f1 = 0.829111, log_loss = 0.609997, brier = 0.209398, ece = 0.052009 |
| `metrics / sem_personalizacao` | auc = 0.541202, accuracy = 0.672382, f1 = 0.795515, log_loss = 0.623440, brier = 0.216185, ece = 0.080030 |
| `metrics / bkt` | auc = 0.600571, accuracy = 0.721780, f1 = 0.825904, log_loss = 0.585226, brier = 0.197984, ece = 0.042991 |
| `metrics / congelado` | auc = 0.617365, accuracy = 0.723413, f1 = 0.828763, log_loss = 0.579485, brier = 0.195601, ece = 0.040018 |
| `metrics / incremental_0.0002` | auc = 0.618882, accuracy = 0.723821, f1 = 0.829059, log_loss = 0.579280, brier = 0.195499, ece = 0.034290 |
| `metrics / incremental_0.002` | auc = 0.618508, accuracy = 0.722596, f1 = 0.827385, log_loss = 0.579751, brier = 0.195554, ece = 0.038706 |
| `per_student_anonymous / 1 / metrics / constante` | auc = 0.500000, accuracy = 0.642857, f1 = 0.782609, log_loss = 0.652143, brier = 0.229767, ece = 0.013238 |
| `per_student_anonymous / 1 / metrics / sem_personalizacao` | auc = 0.400000, accuracy = 0.642857, f1 = 0.782609, log_loss = 0.670802, brier = 0.238571, ece = 0.143332 |
| `per_student_anonymous / 1 / metrics / bkt` | auc = 0.588889, accuracy = 0.571429, f1 = 0.727273, log_loss = 0.665025, brier = 0.238548, ece = 0.176838 |
| `per_student_anonymous / 1 / metrics / congelado` | auc = 0.455556, accuracy = 0.642857, f1 = 0.782609, log_loss = 0.683292, brier = 0.243888, ece = 0.118560 |
| `per_student_anonymous / 1 / metrics / incremental_0.0002` | auc = 0.444444, accuracy = 0.642857, f1 = 0.782609, log_loss = 0.684813, brier = 0.244600, ece = 0.117523 |
| `per_student_anonymous / 1 / metrics / incremental_0.002` | auc = 0.422222, accuracy = 0.571429, f1 = 0.727273, log_loss = 0.698815, brier = 0.251287, ece = 0.167210 |
| `per_student_anonymous / 2 / metrics / constante` | auc = 0.500000, accuracy = 0.176471, f1 = 0.300000, log_loss = 0.953400, brier = 0.375368, ece = 0.479624 |
| `per_student_anonymous / 2 / metrics / sem_personalizacao` | auc = 0.327381, accuracy = 0.176471, f1 = 0.300000, log_loss = 0.969072, brier = 0.381699, ece = 0.476706 |
| `per_student_anonymous / 2 / metrics / bkt` | auc = 0.681548, accuracy = 0.705882, f1 = 0.444444, log_loss = 0.635897, brier = 0.219545, ece = 0.300475 |
| `per_student_anonymous / 2 / metrics / congelado` | auc = 0.663690, accuracy = 0.676471, f1 = 0.421053, log_loss = 0.662602, brier = 0.232991, ece = 0.312771 |
| `per_student_anonymous / 2 / metrics / incremental_0.0002` | auc = 0.663690, accuracy = 0.676471, f1 = 0.421053, log_loss = 0.662602, brier = 0.232991, ece = 0.312771 |
| `per_student_anonymous / 2 / metrics / incremental_0.002` | auc = 0.663690, accuracy = 0.676471, f1 = 0.421053, log_loss = 0.662602, brier = 0.232991, ece = 0.312771 |
| `per_student_anonymous / 4 / metrics / constante` | auc = 0.500000, accuracy = 0.666667, f1 = 0.800000, log_loss = 0.636763, brier = 0.222334, ece = 0.010572 |
| `per_student_anonymous / 4 / metrics / sem_personalizacao` | auc = 0.333333, accuracy = 0.666667, f1 = 0.800000, log_loss = 0.666140, brier = 0.235806, ece = 0.026820 |
| `per_student_anonymous / 4 / metrics / bkt` | auc = 0.472222, accuracy = 0.555556, f1 = 0.714286, log_loss = 0.678971, brier = 0.241564, ece = 0.121359 |
| `per_student_anonymous / 4 / metrics / congelado` | auc = 0.472222, accuracy = 0.555556, f1 = 0.714286, log_loss = 0.672676, brier = 0.237712, ece = 0.232732 |
| `per_student_anonymous / 4 / metrics / incremental_0.0002` | auc = 0.472222, accuracy = 0.555556, f1 = 0.714286, log_loss = 0.672676, brier = 0.237712, ece = 0.232732 |
| `per_student_anonymous / 4 / metrics / incremental_0.002` | auc = 0.472222, accuracy = 0.555556, f1 = 0.714286, log_loss = 0.672676, brier = 0.237712, ece = 0.232732 |
| `per_student_anonymous / 5 / metrics / constante` | auc = 0.500000, accuracy = 0.782609, f1 = 0.878049, log_loss = 0.561871, brier = 0.186138, ece = 0.126514 |
| `per_student_anonymous / 5 / metrics / sem_personalizacao` | auc = 0.611111, accuracy = 0.782609, f1 = 0.878049, log_loss = 0.596073, brier = 0.202157, ece = 0.186913 |
| `per_student_anonymous / 5 / metrics / bkt` | auc = 0.111111, accuracy = 0.782609, f1 = 0.878049, log_loss = 0.550872, brier = 0.180252, ece = 0.055587 |
| `per_student_anonymous / 5 / metrics / congelado` | auc = 0.455556, accuracy = 0.782609, f1 = 0.878049, log_loss = 0.534669, brier = 0.174560, ece = 0.055783 |
| `per_student_anonymous / 5 / metrics / incremental_0.0002` | auc = 0.466667, accuracy = 0.782609, f1 = 0.878049, log_loss = 0.533097, brier = 0.174038, ece = 0.089459 |
| `per_student_anonymous / 5 / metrics / incremental_0.002` | auc = 0.522222, accuracy = 0.782609, f1 = 0.878049, log_loss = 0.521976, brier = 0.170160, ece = 0.155808 |
| `per_student_anonymous / 6 / metrics / constante` | auc = 0.500000, accuracy = 0.697802, f1 = 0.822006, log_loss = 0.616651, brier = 0.212614, ece = 0.041707 |
| `per_student_anonymous / 6 / metrics / sem_personalizacao` | auc = 0.516679, accuracy = 0.697802, f1 = 0.822006, log_loss = 0.618652, brier = 0.213890, ece = 0.058599 |
| `per_student_anonymous / 6 / metrics / bkt` | auc = 0.600859, accuracy = 0.697802, f1 = 0.810997, log_loss = 0.600924, brier = 0.205302, ece = 0.047259 |
| `per_student_anonymous / 6 / metrics / congelado` | auc = 0.592412, accuracy = 0.686813, f1 = 0.808081, log_loss = 0.601622, brier = 0.205766, ece = 0.055962 |
| `per_student_anonymous / 6 / metrics / incremental_0.0002` | auc = 0.592412, accuracy = 0.686813, f1 = 0.808081, log_loss = 0.601859, brier = 0.205869, ece = 0.056294 |
| `per_student_anonymous / 6 / metrics / incremental_0.002` | auc = 0.585970, accuracy = 0.686813, f1 = 0.808081, log_loss = 0.604091, brier = 0.206876, ece = 0.041400 |
| `per_student_anonymous / 7 / metrics / constante` | auc = 0.500000, accuracy = 0.709302, f1 = 0.829932, log_loss = 0.609223, brier = 0.209024, ece = 0.053207 |
| `per_student_anonymous / 7 / metrics / sem_personalizacao` | auc = 0.482541, accuracy = 0.709302, f1 = 0.829932, log_loss = 0.613616, brier = 0.211543, ece = 0.083926 |
| `per_student_anonymous / 7 / metrics / bkt` | auc = 0.564836, accuracy = 0.674419, f1 = 0.801418, log_loss = 0.616992, brier = 0.212843, ece = 0.072472 |
| `per_student_anonymous / 7 / metrics / congelado` | auc = 0.618934, accuracy = 0.697674, f1 = 0.820690, log_loss = 0.586564, brier = 0.200491, ece = 0.082702 |
| `per_student_anonymous / 7 / metrics / incremental_0.0002` | auc = 0.619098, accuracy = 0.697674, f1 = 0.820690, log_loss = 0.586684, brier = 0.200542, ece = 0.082760 |
| `per_student_anonymous / 7 / metrics / incremental_0.002` | auc = 0.614836, accuracy = 0.697674, f1 = 0.820690, log_loss = 0.587824, brier = 0.201037, ece = 0.088079 |
| `per_student_anonymous / 10 / metrics / constante` | auc = 0.500000, accuracy = 0.409091, f1 = 0.580645, log_loss = 0.803142, brier = 0.302747, ece = 0.247004 |
| `per_student_anonymous / 10 / metrics / sem_personalizacao` | auc = 0.380698, accuracy = 0.416667, f1 = 0.583784, log_loss = 0.925423, brier = 0.345503, ece = 0.306899 |
| `per_student_anonymous / 10 / metrics / bkt` | auc = 0.757241, accuracy = 0.704545, f1 = 0.706767, log_loss = 0.628033, brier = 0.216035, ece = 0.172968 |
| `per_student_anonymous / 10 / metrics / congelado` | auc = 0.754630, accuracy = 0.696970, f1 = 0.682540, log_loss = 0.601547, brier = 0.206231, ece = 0.121199 |
| `per_student_anonymous / 10 / metrics / incremental_0.0002` | auc = 0.751781, accuracy = 0.696970, f1 = 0.682540, log_loss = 0.602097, brier = 0.206503, ece = 0.119283 |
| `per_student_anonymous / 10 / metrics / incremental_0.002` | auc = 0.727802, accuracy = 0.651515, f1 = 0.610169, log_loss = 0.608514, brier = 0.209693, ece = 0.124442 |
| `per_student_anonymous / 11 / metrics / constante` | auc = 0.500000, accuracy = 0.200000, f1 = 0.333333, log_loss = 0.938202, brier = 0.368023, ece = 0.456095 |
| `per_student_anonymous / 11 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.200000, f1 = 0.333333, log_loss = 0.816263, brier = 0.310869, ece = 0.388419 |
| `per_student_anonymous / 11 / metrics / bkt` | auc = 0.437500, accuracy = 0.600000, f1 = 0.333333, log_loss = 0.689223, brier = 0.245757, ece = 0.275154 |
| `per_student_anonymous / 11 / metrics / congelado` | auc = 0.437500, accuracy = 0.600000, f1 = 0.333333, log_loss = 0.752046, brier = 0.275663, ece = 0.366847 |
| `per_student_anonymous / 11 / metrics / incremental_0.0002` | auc = 0.437500, accuracy = 0.600000, f1 = 0.333333, log_loss = 0.747613, brier = 0.273579, ece = 0.365289 |
| `per_student_anonymous / 11 / metrics / incremental_0.002` | auc = 0.437500, accuracy = 0.600000, f1 = 0.333333, log_loss = 0.714291, brier = 0.257880, ece = 0.292723 |
| `per_student_anonymous / 15 / metrics / constante` | auc = 0.500000, accuracy = 0.333333, f1 = 0.500000, log_loss = 0.852076, brier = 0.326397, ece = 0.322762 |
| `per_student_anonymous / 15 / metrics / sem_personalizacao` | auc = 1.000000, accuracy = 0.333333, f1 = 0.500000, log_loss = 0.761279, brier = 0.286437, ece = 0.505064 |
| `per_student_anonymous / 15 / metrics / bkt` | auc = 0.750000, accuracy = 0.333333, f1 = 0.500000, log_loss = 0.757719, brier = 0.281166, ece = 0.289720 |
| `per_student_anonymous / 15 / metrics / congelado` | auc = 0.750000, accuracy = 0.333333, f1 = 0.500000, log_loss = 0.780012, brier = 0.291647, ece = 0.307747 |
| `per_student_anonymous / 15 / metrics / incremental_0.0002` | auc = 0.750000, accuracy = 0.333333, f1 = 0.500000, log_loss = 0.776486, brier = 0.289977, ece = 0.305310 |
| `per_student_anonymous / 15 / metrics / incremental_0.002` | auc = 0.750000, accuracy = 0.333333, f1 = 0.500000, log_loss = 0.758224, brier = 0.281320, ece = 0.291496 |
| `per_student_anonymous / 16 / metrics / constante` | auc = 0.500000, accuracy = 0.770000, f1 = 0.870056, log_loss = 0.570016, brier = 0.190074, ece = 0.113905 |
| `per_student_anonymous / 16 / metrics / sem_personalizacao` | auc = 0.581310, accuracy = 0.722500, f1 = 0.830534, log_loss = 0.569420, brier = 0.192950, ece = 0.119817 |
| `per_student_anonymous / 16 / metrics / bkt` | auc = 0.505611, accuracy = 0.747500, f1 = 0.855093, log_loss = 0.557414, brier = 0.185371, ece = 0.042926 |
| `per_student_anonymous / 16 / metrics / congelado` | auc = 0.523221, accuracy = 0.755000, f1 = 0.860000, log_loss = 0.553770, brier = 0.183663, ece = 0.067366 |
| `per_student_anonymous / 16 / metrics / incremental_0.0002` | auc = 0.525198, accuracy = 0.760000, f1 = 0.863248, log_loss = 0.552420, brier = 0.183071, ece = 0.052627 |
| `per_student_anonymous / 16 / metrics / incremental_0.002` | auc = 0.517540, accuracy = 0.765000, f1 = 0.866856, log_loss = 0.548857, brier = 0.180983, ece = 0.060770 |
| `per_student_anonymous / 17 / metrics / constante` | auc = 0.500000, accuracy = 0.755230, f1 = 0.860548, log_loss = 0.579556, brier = 0.194685, ece = 0.099135 |
| `per_student_anonymous / 17 / metrics / sem_personalizacao` | auc = 0.587068, accuracy = 0.692469, f1 = 0.804261, log_loss = 0.585229, brier = 0.200317, ece = 0.122287 |
| `per_student_anonymous / 17 / metrics / bkt` | auc = 0.476916, accuracy = 0.742678, f1 = 0.851270, log_loss = 0.579597, brier = 0.195089, ece = 0.068886 |
| `per_student_anonymous / 17 / metrics / congelado` | auc = 0.522800, accuracy = 0.753138, f1 = 0.859189, log_loss = 0.566643, brier = 0.189504, ece = 0.041023 |
| `per_student_anonymous / 17 / metrics / incremental_0.0002` | auc = 0.522113, accuracy = 0.753138, f1 = 0.859189, log_loss = 0.566589, brier = 0.189378, ece = 0.048072 |
| `per_student_anonymous / 17 / metrics / incremental_0.002` | auc = 0.502415, accuracy = 0.755230, f1 = 0.860548, log_loss = 0.572553, brier = 0.190678, ece = 0.049147 |
| `per_student_anonymous / 18 / metrics / constante` | auc = 0.500000, accuracy = 0.831978, f1 = 0.908284, log_loss = 0.529982, brier = 0.170725, ece = 0.175883 |
| `per_student_anonymous / 18 / metrics / sem_personalizacao` | auc = 0.516182, accuracy = 0.739837, f1 = 0.846645, log_loss = 0.550488, brier = 0.184004, ece = 0.175187 |
| `per_student_anonymous / 18 / metrics / bkt` | auc = 0.384733, accuracy = 0.831978, f1 = 0.908284, log_loss = 0.492408, brier = 0.155242, ece = 0.075927 |
| `per_student_anonymous / 18 / metrics / congelado` | auc = 0.389461, accuracy = 0.831978, f1 = 0.908284, log_loss = 0.492304, brier = 0.154936, ece = 0.088337 |
| `per_student_anonymous / 18 / metrics / incremental_0.0002` | auc = 0.389251, accuracy = 0.831978, f1 = 0.908284, log_loss = 0.489394, brier = 0.153720, ece = 0.079929 |
| `per_student_anonymous / 18 / metrics / incremental_0.002` | auc = 0.389041, accuracy = 0.831978, f1 = 0.908284, log_loss = 0.484902, brier = 0.151820, ece = 0.097079 |
| `per_student_anonymous / 19 / metrics / constante` | auc = 0.500000, accuracy = 0.599576, f1 = 0.749669, log_loss = 0.680099, brier = 0.243279, ece = 0.056519 |
| `per_student_anonymous / 19 / metrics / sem_personalizacao` | auc = 0.570718, accuracy = 0.625000, f1 = 0.743849, log_loss = 0.682957, brier = 0.241207, ece = 0.100028 |
| `per_student_anonymous / 19 / metrics / bkt` | auc = 0.600323, accuracy = 0.625000, f1 = 0.728111, log_loss = 0.665205, brier = 0.234532, ece = 0.061265 |
| `per_student_anonymous / 19 / metrics / congelado` | auc = 0.607634, accuracy = 0.629237, f1 = 0.736842, log_loss = 0.658143, brier = 0.232159, ece = 0.041260 |
| `per_student_anonymous / 19 / metrics / incremental_0.0002` | auc = 0.603642, accuracy = 0.631356, f1 = 0.737160, log_loss = 0.657845, brier = 0.232080, ece = 0.035225 |
| `per_student_anonymous / 19 / metrics / incremental_0.002` | auc = 0.605063, accuracy = 0.616525, f1 = 0.721966, log_loss = 0.656830, brier = 0.231798, ece = 0.032446 |
| `per_student_anonymous / 20 / metrics / constante` | auc = 0.500000, accuracy = 0.771523, f1 = 0.871028, log_loss = 0.569032, brier = 0.189599, ece = 0.115428 |
| `per_student_anonymous / 20 / metrics / sem_personalizacao` | auc = 0.549792, accuracy = 0.738411, f1 = 0.843564, log_loss = 0.585530, brier = 0.197540, ece = 0.127979 |
| `per_student_anonymous / 20 / metrics / bkt` | auc = 0.488182, accuracy = 0.758278, f1 = 0.860421, log_loss = 0.561423, brier = 0.186566, ece = 0.081496 |
| `per_student_anonymous / 20 / metrics / congelado` | auc = 0.451235, accuracy = 0.761589, f1 = 0.863118, log_loss = 0.558992, brier = 0.184955, ece = 0.090599 |
| `per_student_anonymous / 20 / metrics / incremental_0.0002` | auc = 0.449431, accuracy = 0.761589, f1 = 0.863118, log_loss = 0.559308, brier = 0.185125, ece = 0.077723 |
| `per_student_anonymous / 20 / metrics / incremental_0.002` | auc = 0.453350, accuracy = 0.761589, f1 = 0.863118, log_loss = 0.557871, brier = 0.184296, ece = 0.100028 |
| `per_student_anonymous / 21 / metrics / constante` | auc = 0.500000, accuracy = 0.735849, f1 = 0.847826, log_loss = 0.592075, brier = 0.200736, ece = 0.079754 |
| `per_student_anonymous / 21 / metrics / sem_personalizacao` | auc = 0.470264, accuracy = 0.704403, f1 = 0.821970, log_loss = 0.624670, brier = 0.214753, ece = 0.133511 |
| `per_student_anonymous / 21 / metrics / bkt` | auc = 0.514856, accuracy = 0.726415, f1 = 0.838590, log_loss = 0.595695, brier = 0.202381, ece = 0.067281 |
| `per_student_anonymous / 21 / metrics / congelado` | auc = 0.501374, accuracy = 0.723270, f1 = 0.837037, log_loss = 0.591355, brier = 0.200303, ece = 0.059131 |
| `per_student_anonymous / 21 / metrics / incremental_0.0002` | auc = 0.501348, accuracy = 0.732704, f1 = 0.843462, log_loss = 0.590745, brier = 0.199922, ece = 0.053888 |
| `per_student_anonymous / 21 / metrics / incremental_0.002` | auc = 0.499771, accuracy = 0.726415, f1 = 0.839187, log_loss = 0.590071, brier = 0.199589, ece = 0.043434 |
| `per_student_anonymous / 22 / metrics / constante` | auc = 0.500000, accuracy = 0.691689, f1 = 0.817750, log_loss = 0.620600, brier = 0.214522, ece = 0.035594 |
| `per_student_anonymous / 22 / metrics / sem_personalizacao` | auc = 0.530367, accuracy = 0.662198, f1 = 0.792763, log_loss = 0.629203, brier = 0.219688, ece = 0.063486 |
| `per_student_anonymous / 22 / metrics / bkt` | auc = 0.492821, accuracy = 0.675603, f1 = 0.798669, log_loss = 0.641992, brier = 0.223326, ece = 0.087714 |
| `per_student_anonymous / 22 / metrics / congelado` | auc = 0.506202, accuracy = 0.672922, f1 = 0.800654, log_loss = 0.629665, brier = 0.218079, ece = 0.073859 |
| `per_student_anonymous / 22 / metrics / incremental_0.0002` | auc = 0.504179, accuracy = 0.678284, f1 = 0.806452, log_loss = 0.630173, brier = 0.218138, ece = 0.063562 |
| `per_student_anonymous / 22 / metrics / incremental_0.002` | auc = 0.472700, accuracy = 0.672922, f1 = 0.804487, log_loss = 0.639851, brier = 0.221666, ece = 0.062350 |
| `per_student_anonymous / 23 / metrics / constante` | auc = 0.500000, accuracy = 0.517717, f1 = 0.682231, log_loss = 0.732976, brier = 0.268835, ece = 0.138378 |
| `per_student_anonymous / 23 / metrics / sem_personalizacao` | auc = 0.565454, accuracy = 0.505906, f1 = 0.645980, log_loss = 0.732790, brier = 0.268041, ece = 0.165482 |
| `per_student_anonymous / 23 / metrics / bkt` | auc = 0.628897, accuracy = 0.596457, f1 = 0.639719, log_loss = 0.678242, brier = 0.241469, ece = 0.061365 |
| `per_student_anonymous / 23 / metrics / congelado` | auc = 0.618592, accuracy = 0.584646, f1 = 0.642978, log_loss = 0.678792, brier = 0.242393, ece = 0.056218 |
| `per_student_anonymous / 23 / metrics / incremental_0.0002` | auc = 0.618654, accuracy = 0.576772, f1 = 0.632479, log_loss = 0.678194, brier = 0.242135, ece = 0.052227 |
| `per_student_anonymous / 23 / metrics / incremental_0.002` | auc = 0.614837, accuracy = 0.588583, f1 = 0.622061, log_loss = 0.676791, brier = 0.241590, ece = 0.040539 |
| `per_student_anonymous / 24 / metrics / constante` | auc = 0.500000, accuracy = 0.732938, f1 = 0.845890, log_loss = 0.593956, brier = 0.201645, ece = 0.076843 |
| `per_student_anonymous / 24 / metrics / sem_personalizacao` | auc = 0.541768, accuracy = 0.697329, f1 = 0.812500, log_loss = 0.609767, brier = 0.209799, ece = 0.115454 |
| `per_student_anonymous / 24 / metrics / bkt` | auc = 0.537674, accuracy = 0.715134, f1 = 0.827957, log_loss = 0.591942, brier = 0.201017, ece = 0.069213 |
| `per_student_anonymous / 24 / metrics / congelado` | auc = 0.536955, accuracy = 0.727003, f1 = 0.838028, log_loss = 0.585681, brier = 0.198100, ece = 0.061643 |
| `per_student_anonymous / 24 / metrics / incremental_0.0002` | auc = 0.538799, accuracy = 0.721068, f1 = 0.833922, log_loss = 0.586547, brier = 0.198565, ece = 0.056827 |
| `per_student_anonymous / 24 / metrics / incremental_0.002` | auc = 0.538574, accuracy = 0.718101, f1 = 0.831261, log_loss = 0.590432, brier = 0.200463, ece = 0.071036 |
| `per_student_anonymous / 25 / metrics / constante` | auc = 0.500000, accuracy = 0.815000, f1 = 0.898072, log_loss = 0.540949, brier = 0.176026, ece = 0.158905 |
| `per_student_anonymous / 25 / metrics / sem_personalizacao` | auc = 0.513306, accuracy = 0.735000, f1 = 0.843658, log_loss = 0.565015, brier = 0.189028, ece = 0.157003 |
| `per_student_anonymous / 25 / metrics / bkt` | auc = 0.442194, accuracy = 0.812500, f1 = 0.896552, log_loss = 0.511023, brier = 0.163860, ece = 0.063901 |
| `per_student_anonymous / 25 / metrics / congelado` | auc = 0.425696, accuracy = 0.812500, f1 = 0.896552, log_loss = 0.510321, brier = 0.163220, ece = 0.083324 |
| `per_student_anonymous / 25 / metrics / incremental_0.0002` | auc = 0.425841, accuracy = 0.812500, f1 = 0.896552, log_loss = 0.511723, brier = 0.163828, ece = 0.075253 |
| `per_student_anonymous / 25 / metrics / incremental_0.002` | auc = 0.431230, accuracy = 0.812500, f1 = 0.896552, log_loss = 0.513586, brier = 0.164654, ece = 0.085542 |
| `per_student_anonymous / 26 / metrics / constante` | auc = 0.500000, accuracy = 0.830904, f1 = 0.907643, log_loss = 0.530676, brier = 0.171061, ece = 0.174809 |
| `per_student_anonymous / 26 / metrics / sem_personalizacao` | auc = 0.566213, accuracy = 0.760933, f1 = 0.861486, log_loss = 0.537709, brier = 0.177570, ece = 0.177788 |
| `per_student_anonymous / 26 / metrics / bkt` | auc = 0.601361, accuracy = 0.822157, f1 = 0.900489, log_loss = 0.467439, brier = 0.145471, ece = 0.102310 |
| `per_student_anonymous / 26 / metrics / congelado` | auc = 0.591077, accuracy = 0.822157, f1 = 0.900489, log_loss = 0.465254, brier = 0.144164, ece = 0.101724 |
| `per_student_anonymous / 26 / metrics / incremental_0.0002` | auc = 0.590895, accuracy = 0.822157, f1 = 0.900489, log_loss = 0.465427, brier = 0.144230, ece = 0.102027 |
| `per_student_anonymous / 26 / metrics / incremental_0.002` | auc = 0.594828, accuracy = 0.833819, f1 = 0.907916, log_loss = 0.458481, brier = 0.141645, ece = 0.087071 |
| `per_skill_anonymous / 1 / metrics / constante` | auc = 0.500000, accuracy = 0.722222, f1 = 0.838710, log_loss = 0.600878, brier = 0.204990, ece = 0.066127 |
| `per_skill_anonymous / 1 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.722222, f1 = 0.838710, log_loss = 0.600878, brier = 0.204990, ece = 0.066127 |
| `per_skill_anonymous / 1 / metrics / bkt` | auc = 0.330769, accuracy = 0.722222, f1 = 0.838710, log_loss = 0.633571, brier = 0.216928, ece = 0.146394 |
| `per_skill_anonymous / 1 / metrics / congelado` | auc = 0.530769, accuracy = 0.722222, f1 = 0.838710, log_loss = 0.596008, brier = 0.203071, ece = 0.123070 |
| `per_skill_anonymous / 1 / metrics / incremental_0.0002` | auc = 0.538462, accuracy = 0.722222, f1 = 0.838710, log_loss = 0.593929, brier = 0.202324, ece = 0.122111 |
| `per_skill_anonymous / 1 / metrics / incremental_0.002` | auc = 0.507692, accuracy = 0.722222, f1 = 0.838710, log_loss = 0.600836, brier = 0.205019, ece = 0.203562 |
| `per_skill_anonymous / 2 / metrics / constante` | auc = 0.500000, accuracy = 0.678571, f1 = 0.808511, log_loss = 0.629073, brier = 0.218617, ece = 0.022476 |
| `per_skill_anonymous / 2 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.678571, f1 = 0.808511, log_loss = 0.665312, brier = 0.231751, ece = 0.116786 |
| `per_skill_anonymous / 2 / metrics / bkt` | auc = 0.480994, accuracy = 0.625000, f1 = 0.758621, log_loss = 0.657419, brier = 0.232689, ece = 0.107209 |
| `per_skill_anonymous / 2 / metrics / congelado` | auc = 0.480994, accuracy = 0.625000, f1 = 0.764045, log_loss = 0.644557, brier = 0.227081, ece = 0.107172 |
| `per_skill_anonymous / 2 / metrics / incremental_0.0002` | auc = 0.498538, accuracy = 0.625000, f1 = 0.764045, log_loss = 0.644611, brier = 0.227087, ece = 0.101482 |
| `per_skill_anonymous / 2 / metrics / incremental_0.002` | auc = 0.520468, accuracy = 0.642857, f1 = 0.777778, log_loss = 0.637200, brier = 0.224307, ece = 0.085345 |
| `per_skill_anonymous / 4 / metrics / constante` | auc = 0.500000, accuracy = 0.727273, f1 = 0.842105, log_loss = 0.597615, brier = 0.203413, ece = 0.071178 |
| `per_skill_anonymous / 4 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.727273, f1 = 0.842105, log_loss = 0.586485, brier = 0.198563, ece = 0.014693 |
| `per_skill_anonymous / 4 / metrics / bkt` | auc = 0.506042, accuracy = 0.709091, f1 = 0.824176, log_loss = 0.603091, brier = 0.206097, ece = 0.049322 |
| `per_skill_anonymous / 4 / metrics / congelado` | auc = 0.541042, accuracy = 0.690909, f1 = 0.817204, log_loss = 0.594583, brier = 0.202578, ece = 0.040480 |
| `per_skill_anonymous / 4 / metrics / incremental_0.0002` | auc = 0.534375, accuracy = 0.690909, f1 = 0.817204, log_loss = 0.594538, brier = 0.202561, ece = 0.028711 |
| `per_skill_anonymous / 4 / metrics / incremental_0.002` | auc = 0.556875, accuracy = 0.709091, f1 = 0.826087, log_loss = 0.591965, brier = 0.201426, ece = 0.033703 |
| `per_skill_anonymous / 6 / metrics / constante` | auc = 0.500000, accuracy = 0.857143, f1 = 0.923077, log_loss = 0.513727, brier = 0.162869, ece = 0.201048 |
| `per_skill_anonymous / 6 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.142857, f1 = 0.000000, log_loss = 0.846606, brier = 0.325769, ece = 0.450910 |
| `per_skill_anonymous / 6 / metrics / bkt` | auc = 0.125000, accuracy = 0.857143, f1 = 0.923077, log_loss = 0.517560, brier = 0.164326, ece = 0.268093 |
| `per_skill_anonymous / 6 / metrics / congelado` | auc = 0.125000, accuracy = 0.857143, f1 = 0.923077, log_loss = 0.509252, brier = 0.160238, ece = 0.259840 |
| `per_skill_anonymous / 6 / metrics / incremental_0.0002` | auc = 0.125000, accuracy = 0.857143, f1 = 0.923077, log_loss = 0.511065, brier = 0.160959, ece = 0.259423 |
| `per_skill_anonymous / 6 / metrics / incremental_0.002` | auc = 0.083333, accuracy = 0.857143, f1 = 0.923077, log_loss = 0.515290, brier = 0.162701, ece = 0.174010 |
| `per_skill_anonymous / 7 / metrics / constante` | auc = 0.500000, accuracy = 0.823529, f1 = 0.903226, log_loss = 0.535439, brier = 0.173363, ece = 0.167434 |
| `per_skill_anonymous / 7 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.176471, f1 = 0.000000, log_loss = 0.862533, brier = 0.333211, ece = 0.433454 |
| `per_skill_anonymous / 7 / metrics / bkt` | auc = 0.535714, accuracy = 0.764706, f1 = 0.866667, log_loss = 0.531192, brier = 0.172066, ece = 0.224586 |
| `per_skill_anonymous / 7 / metrics / congelado` | auc = 0.535714, accuracy = 0.764706, f1 = 0.866667, log_loss = 0.515055, brier = 0.164812, ece = 0.210569 |
| `per_skill_anonymous / 7 / metrics / incremental_0.0002` | auc = 0.523810, accuracy = 0.764706, f1 = 0.866667, log_loss = 0.513958, brier = 0.164416, ece = 0.210396 |
| `per_skill_anonymous / 7 / metrics / incremental_0.002` | auc = 0.547619, accuracy = 0.764706, f1 = 0.866667, log_loss = 0.507408, brier = 0.162051, ece = 0.201842 |
| `per_skill_anonymous / 8 / metrics / constante` | auc = 0.500000, accuracy = 0.875000, f1 = 0.933333, log_loss = 0.502192, brier = 0.157294, ece = 0.218905 |
| `per_skill_anonymous / 8 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.875000, f1 = 0.933333, log_loss = 0.660672, brier = 0.233773, ece = 0.352701 |
| `per_skill_anonymous / 8 / metrics / bkt` | auc = 0.214286, accuracy = 0.875000, f1 = 0.933333, log_loss = 0.491899, brier = 0.152945, ece = 0.241056 |
| `per_skill_anonymous / 8 / metrics / congelado` | auc = 0.214286, accuracy = 0.875000, f1 = 0.933333, log_loss = 0.478206, brier = 0.146777, ece = 0.234573 |
| `per_skill_anonymous / 8 / metrics / incremental_0.0002` | auc = 0.285714, accuracy = 0.875000, f1 = 0.933333, log_loss = 0.473858, brier = 0.145051, ece = 0.234086 |
| `per_skill_anonymous / 8 / metrics / incremental_0.002` | auc = 0.285714, accuracy = 0.875000, f1 = 0.933333, log_loss = 0.465789, brier = 0.141450, ece = 0.145718 |
| `per_skill_anonymous / 9 / metrics / constante` | auc = 0.500000, accuracy = 0.882353, f1 = 0.937500, log_loss = 0.497443, brier = 0.154999, ece = 0.226258 |
| `per_skill_anonymous / 9 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.882353, f1 = 0.937500, log_loss = 0.540078, brier = 0.174736, ece = 0.266326 |
| `per_skill_anonymous / 9 / metrics / bkt` | auc = 0.266667, accuracy = 0.882353, f1 = 0.937500, log_loss = 0.507095, brier = 0.158999, ece = 0.205523 |
| `per_skill_anonymous / 9 / metrics / congelado` | auc = 0.266667, accuracy = 0.882353, f1 = 0.937500, log_loss = 0.496641, brier = 0.154005, ece = 0.192948 |
| `per_skill_anonymous / 9 / metrics / incremental_0.0002` | auc = 0.416667, accuracy = 0.882353, f1 = 0.937500, log_loss = 0.497331, brier = 0.154235, ece = 0.192635 |
| `per_skill_anonymous / 9 / metrics / incremental_0.002` | auc = 0.416667, accuracy = 0.882353, f1 = 0.937500, log_loss = 0.495977, brier = 0.153822, ece = 0.193585 |
| `per_skill_anonymous / 10 / metrics / constante` | auc = 0.500000, accuracy = 0.581197, f1 = 0.735135, log_loss = 0.691972, brier = 0.249017, ece = 0.074898 |
| `per_skill_anonymous / 10 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.581197, f1 = 0.735135, log_loss = 0.711667, brier = 0.257581, ece = 0.119052 |
| `per_skill_anonymous / 10 / metrics / bkt` | auc = 0.576080, accuracy = 0.589744, f1 = 0.688312, log_loss = 0.692158, brier = 0.247225, ece = 0.094172 |
| `per_skill_anonymous / 10 / metrics / congelado` | auc = 0.597389, accuracy = 0.581197, f1 = 0.691824, log_loss = 0.682000, brier = 0.243824, ece = 0.082952 |
| `per_skill_anonymous / 10 / metrics / incremental_0.0002` | auc = 0.595138, accuracy = 0.581197, f1 = 0.691824, log_loss = 0.683132, brier = 0.244231, ece = 0.083892 |
| `per_skill_anonymous / 10 / metrics / incremental_0.002` | auc = 0.591236, accuracy = 0.564103, f1 = 0.679245, log_loss = 0.694325, brier = 0.247890, ece = 0.117879 |
| `per_skill_anonymous / 11 / metrics / constante` | auc = 0.500000, accuracy = 0.907216, f1 = 0.951351, log_loss = 0.481382, brier = 0.147237, ece = 0.251122 |
| `per_skill_anonymous / 11 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.907216, f1 = 0.951351, log_loss = 0.309894, brier = 0.084324, ece = 0.012207 |
| `per_skill_anonymous / 11 / metrics / bkt` | auc = 0.568182, accuracy = 0.907216, f1 = 0.951351, log_loss = 0.383673, brier = 0.108195, ece = 0.147839 |
| `per_skill_anonymous / 11 / metrics / congelado` | auc = 0.464646, accuracy = 0.907216, f1 = 0.951351, log_loss = 0.388990, brier = 0.109937, ece = 0.148205 |
| `per_skill_anonymous / 11 / metrics / incremental_0.0002` | auc = 0.478535, accuracy = 0.907216, f1 = 0.951351, log_loss = 0.387780, brier = 0.109539, ece = 0.147145 |
| `per_skill_anonymous / 11 / metrics / incremental_0.002` | auc = 0.526515, accuracy = 0.907216, f1 = 0.951351, log_loss = 0.378401, brier = 0.106717, ece = 0.137790 |
| `per_skill_anonymous / 12 / metrics / constante` | auc = 0.500000, accuracy = 0.619048, f1 = 0.764706, log_loss = 0.667522, brier = 0.237200, ece = 0.037047 |
| `per_skill_anonymous / 12 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.619048, f1 = 0.764706, log_loss = 0.722298, brier = 0.258835, ece = 0.151682 |
| `per_skill_anonymous / 12 / metrics / bkt` | auc = 0.240385, accuracy = 0.571429, f1 = 0.727273, log_loss = 0.752133, brier = 0.275600, ece = 0.198948 |
| `per_skill_anonymous / 12 / metrics / congelado` | auc = 0.211538, accuracy = 0.571429, f1 = 0.727273, log_loss = 0.744678, brier = 0.271429, ece = 0.192356 |
| `per_skill_anonymous / 12 / metrics / incremental_0.0002` | auc = 0.173077, accuracy = 0.571429, f1 = 0.727273, log_loss = 0.743591, brier = 0.270962, ece = 0.191760 |
| `per_skill_anonymous / 12 / metrics / incremental_0.002` | auc = 0.163462, accuracy = 0.619048, f1 = 0.764706, log_loss = 0.747933, brier = 0.272390, ece = 0.280074 |
| `per_skill_anonymous / 13 / metrics / constante` | auc = 0.500000, accuracy = 0.692308, f1 = 0.818182, log_loss = 0.620201, brier = 0.214329, ece = 0.036213 |
| `per_skill_anonymous / 13 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.692308, f1 = 0.818182, log_loss = 0.633475, brier = 0.219168, ece = 0.078422 |
| `per_skill_anonymous / 13 / metrics / bkt` | auc = 0.416667, accuracy = 0.615385, f1 = 0.761905, log_loss = 0.679944, brier = 0.240923, ece = 0.292501 |
| `per_skill_anonymous / 13 / metrics / congelado` | auc = 0.416667, accuracy = 0.615385, f1 = 0.761905, log_loss = 0.664660, brier = 0.233016, ece = 0.285074 |
| `per_skill_anonymous / 13 / metrics / incremental_0.0002` | auc = 0.416667, accuracy = 0.615385, f1 = 0.761905, log_loss = 0.663064, brier = 0.232385, ece = 0.284343 |
| `per_skill_anonymous / 13 / metrics / incremental_0.002` | auc = 0.388889, accuracy = 0.692308, f1 = 0.818182, log_loss = 0.662694, brier = 0.231877, ece = 0.120452 |
| `per_skill_anonymous / 14 / metrics / constante` | auc = 0.500000, accuracy = 0.928571, f1 = 0.962963, log_loss = 0.467588, brier = 0.140570, ece = 0.272476 |
| `per_skill_anonymous / 14 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.928571, f1 = 0.962963, log_loss = 0.297592, brier = 0.068948, ece = 0.051199 |
| `per_skill_anonymous / 14 / metrics / bkt` | auc = 0.461538, accuracy = 0.928571, f1 = 0.962963, log_loss = 0.464943, brier = 0.140047, ece = 0.267385 |
| `per_skill_anonymous / 14 / metrics / congelado` | auc = 0.461538, accuracy = 0.928571, f1 = 0.962963, log_loss = 0.448825, brier = 0.132772, ece = 0.252791 |
| `per_skill_anonymous / 14 / metrics / incremental_0.0002` | auc = 0.807692, accuracy = 0.928571, f1 = 0.962963, log_loss = 0.448815, brier = 0.132815, ece = 0.253505 |
| `per_skill_anonymous / 14 / metrics / incremental_0.002` | auc = 0.807692, accuracy = 0.928571, f1 = 0.962963, log_loss = 0.445823, brier = 0.131814, ece = 0.254942 |
| `per_skill_anonymous / 16 / metrics / constante` | auc = 0.500000, accuracy = 0.880000, f1 = 0.936170, log_loss = 0.498963, brier = 0.155733, ece = 0.223905 |
| `per_skill_anonymous / 16 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.880000, f1 = 0.936170, log_loss = 0.457193, brier = 0.137514, ece = 0.178646 |
| `per_skill_anonymous / 16 / metrics / bkt` | auc = 0.386364, accuracy = 0.880000, f1 = 0.936170, log_loss = 0.428363, brier = 0.126758, ece = 0.111763 |
| `per_skill_anonymous / 16 / metrics / congelado` | auc = 0.340909, accuracy = 0.880000, f1 = 0.936170, log_loss = 0.430545, brier = 0.127250, ece = 0.125338 |
| `per_skill_anonymous / 16 / metrics / incremental_0.0002` | auc = 0.340909, accuracy = 0.880000, f1 = 0.936170, log_loss = 0.430757, brier = 0.127310, ece = 0.125308 |
| `per_skill_anonymous / 16 / metrics / incremental_0.002` | auc = 0.310606, accuracy = 0.880000, f1 = 0.936170, log_loss = 0.433682, brier = 0.128358, ece = 0.142312 |
| `per_skill_anonymous / 17 / metrics / constante` | auc = 0.500000, accuracy = 0.681287, f1 = 0.810435, log_loss = 0.627320, brier = 0.217770, ece = 0.025192 |
| `per_skill_anonymous / 17 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.681287, f1 = 0.810435, log_loss = 0.626413, brier = 0.217363, ece = 0.015100 |
| `per_skill_anonymous / 17 / metrics / bkt` | auc = 0.451530, accuracy = 0.681287, f1 = 0.806394, log_loss = 0.655603, brier = 0.227536, ece = 0.106050 |
| `per_skill_anonymous / 17 / metrics / congelado` | auc = 0.498661, accuracy = 0.684211, f1 = 0.809859, log_loss = 0.635966, brier = 0.220578, ece = 0.059448 |
| `per_skill_anonymous / 17 / metrics / incremental_0.0002` | auc = 0.486790, accuracy = 0.678363, f1 = 0.805654, log_loss = 0.637821, brier = 0.221240, ece = 0.063599 |
| `per_skill_anonymous / 17 / metrics / incremental_0.002` | auc = 0.483089, accuracy = 0.684211, f1 = 0.807143, log_loss = 0.648643, brier = 0.224615, ece = 0.084284 |
| `per_skill_anonymous / 18 / metrics / constante` | auc = 0.500000, accuracy = 0.968750, f1 = 0.984127, log_loss = 0.441635, brier = 0.128027, ece = 0.312655 |
| `per_skill_anonymous / 18 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.968750, f1 = 0.984127, log_loss = 0.393954, brier = 0.107072, ece = 0.277126 |
| `per_skill_anonymous / 18 / metrics / bkt` | auc = 0.274194, accuracy = 0.968750, f1 = 0.984127, log_loss = 0.323251, brier = 0.079913, ece = 0.212640 |
| `per_skill_anonymous / 18 / metrics / congelado` | auc = 0.274194, accuracy = 0.968750, f1 = 0.984127, log_loss = 0.310191, brier = 0.074937, ece = 0.201416 |
| `per_skill_anonymous / 18 / metrics / incremental_0.0002` | auc = 0.258065, accuracy = 0.968750, f1 = 0.984127, log_loss = 0.307848, brier = 0.074087, ece = 0.198898 |
| `per_skill_anonymous / 18 / metrics / incremental_0.002` | auc = 0.064516, accuracy = 0.968750, f1 = 0.984127, log_loss = 0.295489, brier = 0.069618, ece = 0.183096 |
| `per_skill_anonymous / 19 / metrics / constante` | auc = 0.500000, accuracy = 0.679104, f1 = 0.808889, log_loss = 0.628729, brier = 0.218451, ece = 0.023010 |
| `per_skill_anonymous / 19 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.679104, f1 = 0.808889, log_loss = 0.645015, brier = 0.226145, ece = 0.090686 |
| `per_skill_anonymous / 19 / metrics / bkt` | auc = 0.643496, accuracy = 0.731343, f1 = 0.825243, log_loss = 0.584899, brier = 0.197615, ece = 0.050695 |
| `per_skill_anonymous / 19 / metrics / congelado` | auc = 0.691924, accuracy = 0.712687, f1 = 0.814458, log_loss = 0.574938, brier = 0.194254, ece = 0.051919 |
| `per_skill_anonymous / 19 / metrics / incremental_0.0002` | auc = 0.693202, accuracy = 0.712687, f1 = 0.814458, log_loss = 0.574977, brier = 0.194319, ece = 0.054379 |
| `per_skill_anonymous / 19 / metrics / incremental_0.002` | auc = 0.692563, accuracy = 0.690299, f1 = 0.795062, log_loss = 0.576351, brier = 0.195273, ece = 0.060659 |
| `per_skill_anonymous / 20 / metrics / constante` | auc = 0.500000, accuracy = 0.691358, f1 = 0.817518, log_loss = 0.620814, brier = 0.214626, ece = 0.035263 |
| `per_skill_anonymous / 20 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.691358, f1 = 0.817518, log_loss = 0.621837, brier = 0.215089, ece = 0.041315 |
| `per_skill_anonymous / 20 / metrics / bkt` | auc = 0.716429, accuracy = 0.716049, f1 = 0.809917, log_loss = 0.563916, brier = 0.189959, ece = 0.042815 |
| `per_skill_anonymous / 20 / metrics / congelado` | auc = 0.697857, accuracy = 0.728395, f1 = 0.819672, log_loss = 0.569482, brier = 0.192618, ece = 0.080721 |
| `per_skill_anonymous / 20 / metrics / incremental_0.0002` | auc = 0.702500, accuracy = 0.716049, f1 = 0.813008, log_loss = 0.567899, brier = 0.192036, ece = 0.052474 |
| `per_skill_anonymous / 20 / metrics / incremental_0.002` | auc = 0.711786, accuracy = 0.703704, f1 = 0.803279, log_loss = 0.559696, brier = 0.189015, ece = 0.043385 |
| `per_skill_anonymous / 21 / metrics / constante` | auc = 0.500000, accuracy = 0.628099, f1 = 0.771574, log_loss = 0.661675, brier = 0.234374, ece = 0.027996 |
| `per_skill_anonymous / 21 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.628099, f1 = 0.771574, log_loss = 0.779210, brier = 0.275248, ece = 0.204102 |
| `per_skill_anonymous / 21 / metrics / bkt` | auc = 0.691228, accuracy = 0.809917, f1 = 0.865497, log_loss = 0.525742, brier = 0.168973, ece = 0.091242 |
| `per_skill_anonymous / 21 / metrics / congelado` | auc = 0.714912, accuracy = 0.818182, f1 = 0.869048, log_loss = 0.521493, brier = 0.166901, ece = 0.170601 |
| `per_skill_anonymous / 21 / metrics / incremental_0.0002` | auc = 0.712281, accuracy = 0.818182, f1 = 0.869048, log_loss = 0.520658, brier = 0.166607, ece = 0.167022 |
| `per_skill_anonymous / 21 / metrics / incremental_0.002` | auc = 0.742105, accuracy = 0.818182, f1 = 0.869048, log_loss = 0.517787, brier = 0.165647, ece = 0.130398 |
| `per_skill_anonymous / 22 / metrics / constante` | auc = 0.500000, accuracy = 0.705036, f1 = 0.827004, log_loss = 0.611979, brier = 0.210355, ece = 0.048941 |
| `per_skill_anonymous / 22 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.705036, f1 = 0.827004, log_loss = 0.606542, brier = 0.207962, ece = 0.001410 |
| `per_skill_anonymous / 22 / metrics / bkt` | auc = 0.622573, accuracy = 0.748201, f1 = 0.844444, log_loss = 0.566582, brier = 0.189126, ece = 0.064509 |
| `per_skill_anonymous / 22 / metrics / congelado` | auc = 0.603410, accuracy = 0.755396, f1 = 0.849558, log_loss = 0.567414, brier = 0.189574, ece = 0.048927 |
| `per_skill_anonymous / 22 / metrics / incremental_0.0002` | auc = 0.619462, accuracy = 0.755396, f1 = 0.849558, log_loss = 0.566624, brier = 0.189269, ece = 0.058547 |
| `per_skill_anonymous / 22 / metrics / incremental_0.002` | auc = 0.648830, accuracy = 0.748201, f1 = 0.844444, log_loss = 0.562040, brier = 0.187539, ece = 0.050804 |
| `per_skill_anonymous / 23 / metrics / constante` | auc = 0.500000, accuracy = 0.266667, f1 = 0.421053, log_loss = 0.895139, brier = 0.347210, ece = 0.389428 |
| `per_skill_anonymous / 23 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.266667, f1 = 0.421053, log_loss = 1.357208, brier = 0.515171, ece = 0.565345 |
| `per_skill_anonymous / 23 / metrics / bkt` | auc = 0.875000, accuracy = 0.666667, f1 = 0.615385, log_loss = 0.622112, brier = 0.216253, ece = 0.337661 |
| `per_skill_anonymous / 23 / metrics / congelado` | auc = 0.875000, accuracy = 0.666667, f1 = 0.615385, log_loss = 0.661613, brier = 0.235145, ece = 0.361591 |
| `per_skill_anonymous / 23 / metrics / incremental_0.0002` | auc = 0.886364, accuracy = 0.666667, f1 = 0.615385, log_loss = 0.656863, brier = 0.232747, ece = 0.359673 |
| `per_skill_anonymous / 23 / metrics / incremental_0.002` | auc = 0.886364, accuracy = 0.666667, f1 = 0.615385, log_loss = 0.636866, brier = 0.222751, ece = 0.284100 |
| `per_skill_anonymous / 25 / metrics / constante` | auc = 0.500000, accuracy = 0.636364, f1 = 0.777778, log_loss = 0.656337, brier = 0.231794, ece = 0.019731 |
| `per_skill_anonymous / 25 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.636364, f1 = 0.777778, log_loss = 0.659297, brier = 0.233223, ece = 0.042636 |
| `per_skill_anonymous / 25 / metrics / bkt` | auc = 0.678571, accuracy = 0.545455, f1 = 0.705882, log_loss = 0.632976, brier = 0.222788, ece = 0.182167 |
| `per_skill_anonymous / 25 / metrics / congelado` | auc = 0.678571, accuracy = 0.545455, f1 = 0.705882, log_loss = 0.626589, brier = 0.219887, ece = 0.190115 |
| `per_skill_anonymous / 25 / metrics / incremental_0.0002` | auc = 0.678571, accuracy = 0.545455, f1 = 0.705882, log_loss = 0.627224, brier = 0.220089, ece = 0.190146 |
| `per_skill_anonymous / 25 / metrics / incremental_0.002` | auc = 0.714286, accuracy = 0.545455, f1 = 0.705882, log_loss = 0.624389, brier = 0.218589, ece = 0.240335 |
| `per_skill_anonymous / 26 / metrics / constante` | auc = 0.500000, accuracy = 0.628571, f1 = 0.771930, log_loss = 0.661370, brier = 0.234227, ece = 0.027524 |
| `per_skill_anonymous / 26 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.628571, f1 = 0.771930, log_loss = 0.680300, brier = 0.243583, ece = 0.100565 |
| `per_skill_anonymous / 26 / metrics / bkt` | auc = 0.382867, accuracy = 0.571429, f1 = 0.716981, log_loss = 0.711617, brier = 0.256565, ece = 0.094779 |
| `per_skill_anonymous / 26 / metrics / congelado` | auc = 0.382867, accuracy = 0.571429, f1 = 0.716981, log_loss = 0.708343, brier = 0.254888, ece = 0.091725 |
| `per_skill_anonymous / 26 / metrics / incremental_0.0002` | auc = 0.351399, accuracy = 0.542857, f1 = 0.703704, log_loss = 0.709189, brier = 0.255134, ece = 0.109800 |
| `per_skill_anonymous / 26 / metrics / incremental_0.002` | auc = 0.379371, accuracy = 0.571429, f1 = 0.727273, log_loss = 0.712051, brier = 0.255741, ece = 0.264558 |
| `per_skill_anonymous / 27 / metrics / constante` | auc = 0.500000, accuracy = 0.500000, f1 = 0.666667, log_loss = 0.744420, brier = 0.274366, ece = 0.156095 |
| `per_skill_anonymous / 27 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.500000, f1 = 0.666667, log_loss = 0.896484, brier = 0.333535, ece = 0.289024 |
| `per_skill_anonymous / 27 / metrics / bkt` | auc = 0.500000, accuracy = 0.500000, f1 = 0.666667, log_loss = 0.751619, brier = 0.277591, ece = 0.166105 |
| `per_skill_anonymous / 27 / metrics / congelado` | auc = 0.500000, accuracy = 0.500000, f1 = 0.666667, log_loss = 0.766517, brier = 0.284120, ece = 0.184717 |
| `per_skill_anonymous / 27 / metrics / incremental_0.0002` | auc = 1.000000, accuracy = 0.500000, f1 = 0.666667, log_loss = 0.761819, brier = 0.282096, ece = 0.186347 |
| `per_skill_anonymous / 27 / metrics / incremental_0.002` | auc = 1.000000, accuracy = 0.500000, f1 = 0.666667, log_loss = 0.740215, brier = 0.272794, ece = 0.487083 |
| `per_skill_anonymous / 28 / metrics / constante` | auc = 0.500000, accuracy = 0.956522, f1 = 0.977778, log_loss = 0.449534, brier = 0.131844, ece = 0.300427 |
| `per_skill_anonymous / 28 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.956522, f1 = 0.977778, log_loss = 0.321323, brier = 0.079036, ece = 0.193514 |
| `per_skill_anonymous / 28 / metrics / bkt` | auc = 0.477273, accuracy = 0.956522, f1 = 0.977778, log_loss = 0.364359, brier = 0.097664, ece = 0.226904 |
| `per_skill_anonymous / 28 / metrics / congelado` | auc = 0.431818, accuracy = 0.956522, f1 = 0.977778, log_loss = 0.357452, brier = 0.094436, ece = 0.219805 |
| `per_skill_anonymous / 28 / metrics / incremental_0.0002` | auc = 0.431818, accuracy = 0.956522, f1 = 0.977778, log_loss = 0.357357, brier = 0.094361, ece = 0.219774 |
| `per_skill_anonymous / 28 / metrics / incremental_0.002` | auc = 0.431818, accuracy = 0.956522, f1 = 0.977778, log_loss = 0.357984, brier = 0.094417, ece = 0.220418 |
| `per_skill_anonymous / 29 / metrics / constante` | auc = 0.500000, accuracy = 0.517857, f1 = 0.682353, log_loss = 0.732885, brier = 0.268791, ece = 0.138238 |
| `per_skill_anonymous / 29 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.517857, f1 = 0.682353, log_loss = 0.705302, brier = 0.255940, ece = 0.079115 |
| `per_skill_anonymous / 29 / metrics / bkt` | auc = 0.566411, accuracy = 0.589286, f1 = 0.656716, log_loss = 0.688213, brier = 0.246974, ece = 0.169000 |
| `per_skill_anonymous / 29 / metrics / congelado` | auc = 0.562580, accuracy = 0.571429, f1 = 0.636364, log_loss = 0.698496, brier = 0.251361, ece = 0.143307 |
| `per_skill_anonymous / 29 / metrics / incremental_0.0002` | auc = 0.563218, accuracy = 0.553571, f1 = 0.615385, log_loss = 0.698252, brier = 0.251172, ece = 0.157316 |
| `per_skill_anonymous / 29 / metrics / incremental_0.002` | auc = 0.563218, accuracy = 0.589286, f1 = 0.656716, log_loss = 0.697253, brier = 0.250450, ece = 0.126128 |
| `per_skill_anonymous / 31 / metrics / constante` | auc = 0.500000, accuracy = 0.285714, f1 = 0.444444, log_loss = 0.882835, brier = 0.341263, ece = 0.370381 |
| `per_skill_anonymous / 31 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.714286, f1 = 0.000000, log_loss = 0.599803, brier = 0.204685, ece = 0.024565 |
| `per_skill_anonymous / 31 / metrics / bkt` | auc = 0.333333, accuracy = 0.380952, f1 = 0.315789, log_loss = 0.812075, brier = 0.306998, ece = 0.295878 |
| `per_skill_anonymous / 31 / metrics / congelado` | auc = 0.366667, accuracy = 0.380952, f1 = 0.315789, log_loss = 0.827717, brier = 0.314151, ece = 0.330503 |
| `per_skill_anonymous / 31 / metrics / incremental_0.0002` | auc = 0.344444, accuracy = 0.380952, f1 = 0.315789, log_loss = 0.828435, brier = 0.314421, ece = 0.330932 |
| `per_skill_anonymous / 31 / metrics / incremental_0.002` | auc = 0.322222, accuracy = 0.380952, f1 = 0.315789, log_loss = 0.843101, brier = 0.320521, ece = 0.343789 |
| `per_skill_anonymous / 32 / metrics / constante` | auc = 0.500000, accuracy = 0.604651, f1 = 0.753623, log_loss = 0.676821, brier = 0.241695, ece = 0.051444 |
| `per_skill_anonymous / 32 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.604651, f1 = 0.753623, log_loss = 0.674158, brier = 0.240548, ece = 0.038731 |
| `per_skill_anonymous / 32 / metrics / bkt` | auc = 0.466912, accuracy = 0.558140, f1 = 0.693548, log_loss = 0.718458, brier = 0.259660, ece = 0.115626 |
| `per_skill_anonymous / 32 / metrics / congelado` | auc = 0.466346, accuracy = 0.569767, f1 = 0.708661, log_loss = 0.707202, brier = 0.254394, ece = 0.082262 |
| `per_skill_anonymous / 32 / metrics / incremental_0.0002` | auc = 0.462104, accuracy = 0.581395, f1 = 0.718750, log_loss = 0.706766, brier = 0.254199, ece = 0.082847 |
| `per_skill_anonymous / 32 / metrics / incremental_0.002` | auc = 0.464367, accuracy = 0.581395, f1 = 0.718750, log_loss = 0.709502, brier = 0.255021, ece = 0.109585 |
| `per_skill_anonymous / 33 / metrics / constante` | auc = 0.500000, accuracy = 0.740000, f1 = 0.850575, log_loss = 0.589394, brier = 0.199440, ece = 0.083905 |
| `per_skill_anonymous / 33 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.740000, f1 = 0.850575, log_loss = 0.621771, brier = 0.214662, ece = 0.149204 |
| `per_skill_anonymous / 33 / metrics / bkt` | auc = 0.316008, accuracy = 0.720000, f1 = 0.837209, log_loss = 0.625850, brier = 0.214464, ece = 0.128159 |
| `per_skill_anonymous / 33 / metrics / congelado` | auc = 0.313929, accuracy = 0.720000, f1 = 0.837209, log_loss = 0.625412, brier = 0.213689, ece = 0.144141 |
| `per_skill_anonymous / 33 / metrics / incremental_0.0002` | auc = 0.332640, accuracy = 0.720000, f1 = 0.837209, log_loss = 0.626261, brier = 0.213985, ece = 0.133974 |
| `per_skill_anonymous / 33 / metrics / incremental_0.002` | auc = 0.361746, accuracy = 0.720000, f1 = 0.837209, log_loss = 0.630926, brier = 0.215120, ece = 0.148442 |
| `per_skill_anonymous / 34 / metrics / constante` | auc = 0.500000, accuracy = 0.916667, f1 = 0.956522, log_loss = 0.475278, brier = 0.144287, ece = 0.260572 |
| `per_skill_anonymous / 34 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.916667, f1 = 0.956522, log_loss = 0.287081, brier = 0.076428, ece = 0.006260 |
| `per_skill_anonymous / 34 / metrics / bkt` | auc = 0.159091, accuracy = 0.916667, f1 = 0.956522, log_loss = 0.439248, brier = 0.128638, ece = 0.203389 |
| `per_skill_anonymous / 34 / metrics / congelado` | auc = 0.159091, accuracy = 0.916667, f1 = 0.956522, log_loss = 0.422780, brier = 0.121604, ece = 0.254131 |
| `per_skill_anonymous / 34 / metrics / incremental_0.0002` | auc = 0.090909, accuracy = 0.916667, f1 = 0.956522, log_loss = 0.422878, brier = 0.121647, ece = 0.187081 |
| `per_skill_anonymous / 34 / metrics / incremental_0.002` | auc = 0.136364, accuracy = 0.916667, f1 = 0.956522, log_loss = 0.421376, brier = 0.121138, ece = 0.235828 |
| `per_skill_anonymous / 35 / metrics / constante` | auc = 0.500000, accuracy = 0.638298, f1 = 0.779221, log_loss = 0.655088, brier = 0.231190, ece = 0.017797 |
| `per_skill_anonymous / 35 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.638298, f1 = 0.779221, log_loss = 0.658560, brier = 0.232859, ece = 0.044555 |
| `per_skill_anonymous / 35 / metrics / bkt` | auc = 0.358824, accuracy = 0.574468, f1 = 0.722222, log_loss = 0.726419, brier = 0.262852, ece = 0.209727 |
| `per_skill_anonymous / 35 / metrics / congelado` | auc = 0.350980, accuracy = 0.617021, f1 = 0.763158, log_loss = 0.708617, brier = 0.254017, ece = 0.132665 |
| `per_skill_anonymous / 35 / metrics / incremental_0.0002` | auc = 0.350980, accuracy = 0.617021, f1 = 0.763158, log_loss = 0.709846, brier = 0.254466, ece = 0.159749 |
| `per_skill_anonymous / 35 / metrics / incremental_0.002` | auc = 0.300000, accuracy = 0.638298, f1 = 0.779221, log_loss = 0.723879, brier = 0.259340, ece = 0.161601 |
| `per_skill_anonymous / 36 / metrics / constante` | auc = 0.500000, accuracy = 0.552239, f1 = 0.711538, log_loss = 0.710677, brier = 0.258057, ece = 0.103856 |
| `per_skill_anonymous / 36 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.552239, f1 = 0.711538, log_loss = 0.724720, brier = 0.264266, ece = 0.130365 |
| `per_skill_anonymous / 36 / metrics / bkt` | auc = 0.765766, accuracy = 0.716418, f1 = 0.771084, log_loss = 0.581987, brier = 0.196081, ece = 0.127435 |
| `per_skill_anonymous / 36 / metrics / congelado` | auc = 0.772973, accuracy = 0.746269, f1 = 0.795181, log_loss = 0.579170, brier = 0.194692, ece = 0.087116 |
| `per_skill_anonymous / 36 / metrics / incremental_0.0002` | auc = 0.770270, accuracy = 0.746269, f1 = 0.795181, log_loss = 0.579476, brier = 0.194757, ece = 0.085491 |
| `per_skill_anonymous / 36 / metrics / incremental_0.002` | auc = 0.773874, accuracy = 0.731343, f1 = 0.780488, log_loss = 0.578623, brier = 0.194416, ece = 0.115119 |
| `per_skill_anonymous / 37 / metrics / constante` | auc = 0.500000, accuracy = 0.666667, f1 = 0.800000, log_loss = 0.636763, brier = 0.222334, ece = 0.010572 |
| `per_skill_anonymous / 37 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.666667, f1 = 0.800000, log_loss = 0.644477, brier = 0.225946, ece = 0.061026 |
| `per_skill_anonymous / 37 / metrics / bkt` | auc = 0.561983, accuracy = 0.787879, f1 = 0.862745, log_loss = 0.583697, brier = 0.194343, ece = 0.232016 |
| `per_skill_anonymous / 37 / metrics / congelado` | auc = 0.636364, accuracy = 0.727273, f1 = 0.830189, log_loss = 0.590325, brier = 0.198815, ece = 0.181792 |
| `per_skill_anonymous / 37 / metrics / incremental_0.0002` | auc = 0.634298, accuracy = 0.727273, f1 = 0.830189, log_loss = 0.590034, brier = 0.198666, ece = 0.182334 |
| `per_skill_anonymous / 37 / metrics / incremental_0.002` | auc = 0.630165, accuracy = 0.727273, f1 = 0.830189, log_loss = 0.585497, brier = 0.196997, ece = 0.125160 |
| `per_skill_anonymous / 38 / metrics / constante` | auc = 0.500000, accuracy = 0.732777, f1 = 0.845783, log_loss = 0.594060, brier = 0.201695, ece = 0.076682 |
| `per_skill_anonymous / 38 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.732777, f1 = 0.845783, log_loss = 0.592237, brier = 0.200876, ece = 0.071137 |
| `per_skill_anonymous / 38 / metrics / bkt` | auc = 0.596721, accuracy = 0.736952, f1 = 0.844059, log_loss = 0.573999, brier = 0.192687, ece = 0.043480 |
| `per_skill_anonymous / 38 / metrics / congelado` | auc = 0.588330, accuracy = 0.732777, f1 = 0.843521, log_loss = 0.567091, brier = 0.190202, ece = 0.017031 |
| `per_skill_anonymous / 38 / metrics / incremental_0.0002` | auc = 0.589833, accuracy = 0.736952, f1 = 0.846715, log_loss = 0.567440, brier = 0.190339, ece = 0.015478 |
| `per_skill_anonymous / 38 / metrics / incremental_0.002` | auc = 0.561142, accuracy = 0.734864, f1 = 0.844933, log_loss = 0.575973, brier = 0.193631, ece = 0.039037 |
| `per_skill_anonymous / 39 / metrics / constante` | auc = 0.500000, accuracy = 0.782353, f1 = 0.877888, log_loss = 0.562037, brier = 0.186218, ece = 0.126258 |
| `per_skill_anonymous / 39 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.782353, f1 = 0.877888, log_loss = 0.584770, brier = 0.196723, ece = 0.162622 |
| `per_skill_anonymous / 39 / metrics / bkt` | auc = 0.634830, accuracy = 0.811765, f1 = 0.888112, log_loss = 0.478082, brier = 0.150371, ece = 0.073023 |
| `per_skill_anonymous / 39 / metrics / congelado` | auc = 0.581996, accuracy = 0.811765, f1 = 0.887324, log_loss = 0.488307, brier = 0.154209, ece = 0.118436 |
| `per_skill_anonymous / 39 / metrics / incremental_0.0002` | auc = 0.586873, accuracy = 0.811765, f1 = 0.887324, log_loss = 0.487255, brier = 0.153783, ece = 0.128974 |
| `per_skill_anonymous / 39 / metrics / incremental_0.002` | auc = 0.620199, accuracy = 0.805882, f1 = 0.883392, log_loss = 0.481245, brier = 0.151499, ece = 0.078566 |
| `per_skill_anonymous / 40 / metrics / constante` | auc = 0.500000, accuracy = 0.557522, f1 = 0.715909, log_loss = 0.707264, brier = 0.256408, ece = 0.098573 |
| `per_skill_anonymous / 40 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.557522, f1 = 0.715909, log_loss = 0.707264, brier = 0.256408, ece = 0.098573 |
| `per_skill_anonymous / 40 / metrics / bkt` | auc = 0.490000, accuracy = 0.522124, f1 = 0.658228, log_loss = 0.769180, brier = 0.281061, ece = 0.182859 |
| `per_skill_anonymous / 40 / metrics / congelado` | auc = 0.431587, accuracy = 0.530973, f1 = 0.678788, log_loss = 0.715006, brier = 0.259778, ece = 0.094185 |
| `per_skill_anonymous / 40 / metrics / incremental_0.0002` | auc = 0.427778, accuracy = 0.530973, f1 = 0.678788, log_loss = 0.715289, brier = 0.259907, ece = 0.094001 |
| `per_skill_anonymous / 40 / metrics / incremental_0.002` | auc = 0.415714, accuracy = 0.530973, f1 = 0.678788, log_loss = 0.717720, brier = 0.261052, ece = 0.114210 |
| `per_skill_anonymous / 41 / metrics / constante` | auc = 0.500000, accuracy = 0.666667, f1 = 0.800000, log_loss = 0.636763, brier = 0.222334, ece = 0.010572 |
| `per_skill_anonymous / 41 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.666667, f1 = 0.800000, log_loss = 0.648878, brier = 0.228063, ece = 0.076423 |
| `per_skill_anonymous / 41 / metrics / bkt` | auc = 0.250000, accuracy = 0.666667, f1 = 0.800000, log_loss = 0.708363, brier = 0.256533, ece = 0.265087 |
| `per_skill_anonymous / 41 / metrics / congelado` | auc = 0.250000, accuracy = 0.666667, f1 = 0.800000, log_loss = 0.707992, brier = 0.255777, ece = 0.271876 |
| `per_skill_anonymous / 41 / metrics / incremental_0.0002` | auc = 0.500000, accuracy = 0.666667, f1 = 0.800000, log_loss = 0.706192, brier = 0.254824, ece = 0.272697 |
| `per_skill_anonymous / 41 / metrics / incremental_0.002` | auc = 0.000000, accuracy = 0.666667, f1 = 0.800000, log_loss = 0.702648, brier = 0.251791, ece = 0.271277 |
| `per_skill_anonymous / 43 / metrics / constante` | auc = 0.500000, accuracy = 0.613636, f1 = 0.760563, log_loss = 0.671017, brier = 0.238890, ece = 0.042459 |
| `per_skill_anonymous / 43 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.386364, f1 = 0.000000, log_loss = 0.790361, brier = 0.297255, ece = 0.245292 |
| `per_skill_anonymous / 43 / metrics / bkt` | auc = 0.420479, accuracy = 0.545455, f1 = 0.677419, log_loss = 0.719519, brier = 0.261017, ece = 0.118153 |
| `per_skill_anonymous / 43 / metrics / congelado` | auc = 0.444444, accuracy = 0.568182, f1 = 0.698413, log_loss = 0.708379, brier = 0.255300, ece = 0.110216 |
| `per_skill_anonymous / 43 / metrics / incremental_0.0002` | auc = 0.461874, accuracy = 0.568182, f1 = 0.698413, log_loss = 0.709047, brier = 0.255574, ece = 0.113605 |
| `per_skill_anonymous / 43 / metrics / incremental_0.002` | auc = 0.483660, accuracy = 0.545455, f1 = 0.677419, log_loss = 0.707195, brier = 0.254429, ece = 0.085472 |
| `per_skill_anonymous / 44 / metrics / constante` | auc = 0.500000, accuracy = 0.836066, f1 = 0.910714, log_loss = 0.527342, brier = 0.169449, ece = 0.179971 |
| `per_skill_anonymous / 44 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.836066, f1 = 0.910714, log_loss = 0.454900, brier = 0.139082, ece = 0.044973 |
| `per_skill_anonymous / 44 / metrics / bkt` | auc = 0.370588, accuracy = 0.836066, f1 = 0.910714, log_loss = 0.496525, brier = 0.157223, ece = 0.106959 |
| `per_skill_anonymous / 44 / metrics / congelado` | auc = 0.413725, accuracy = 0.836066, f1 = 0.910714, log_loss = 0.498740, brier = 0.157828, ece = 0.127914 |
| `per_skill_anonymous / 44 / metrics / incremental_0.0002` | auc = 0.420588, accuracy = 0.836066, f1 = 0.910714, log_loss = 0.497140, brier = 0.157242, ece = 0.140483 |
| `per_skill_anonymous / 44 / metrics / incremental_0.002` | auc = 0.432353, accuracy = 0.836066, f1 = 0.910714, log_loss = 0.495265, brier = 0.156492, ece = 0.123211 |
| `per_skill_anonymous / 45 / metrics / constante` | auc = 0.500000, accuracy = 0.750000, f1 = 0.857143, log_loss = 0.582935, brier = 0.196318, ece = 0.093905 |
| `per_skill_anonymous / 45 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.750000, f1 = 0.857143, log_loss = 0.582935, brier = 0.196318, ece = 0.093905 |
| `per_skill_anonymous / 45 / metrics / bkt` | auc = 0.500000, accuracy = 0.750000, f1 = 0.857143, log_loss = 0.606169, brier = 0.209154, ece = 0.263534 |
| `per_skill_anonymous / 45 / metrics / congelado` | auc = 0.500000, accuracy = 0.750000, f1 = 0.857143, log_loss = 0.600701, brier = 0.206635, ece = 0.264740 |
| `per_skill_anonymous / 45 / metrics / incremental_0.0002` | auc = 0.500000, accuracy = 0.750000, f1 = 0.857143, log_loss = 0.600701, brier = 0.206635, ece = 0.264740 |
| `per_skill_anonymous / 45 / metrics / incremental_0.002` | auc = 0.500000, accuracy = 0.750000, f1 = 0.857143, log_loss = 0.600701, brier = 0.206635, ece = 0.264740 |
| `per_skill_anonymous / 46 / metrics / constante` | auc = 0.500000, accuracy = 0.447368, f1 = 0.618182, log_loss = 0.778417, brier = 0.290797, ece = 0.208727 |
| `per_skill_anonymous / 46 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.447368, f1 = 0.618182, log_loss = 0.703601, brier = 0.255216, ece = 0.089366 |
| `per_skill_anonymous / 46 / metrics / bkt` | auc = 0.526961, accuracy = 0.526316, f1 = 0.560976, log_loss = 0.731366, brier = 0.267128, ece = 0.101628 |
| `per_skill_anonymous / 46 / metrics / congelado` | auc = 0.543067, accuracy = 0.552632, f1 = 0.595238, log_loss = 0.725170, brier = 0.264574, ece = 0.116770 |
| `per_skill_anonymous / 46 / metrics / incremental_0.0002` | auc = 0.554622, accuracy = 0.552632, f1 = 0.595238, log_loss = 0.723666, brier = 0.263766, ece = 0.126869 |
| `per_skill_anonymous / 46 / metrics / incremental_0.002` | auc = 0.577731, accuracy = 0.552632, f1 = 0.595238, log_loss = 0.718899, brier = 0.260599, ece = 0.126214 |
| `per_skill_anonymous / 47 / metrics / constante` | auc = 0.500000, accuracy = 0.821429, f1 = 0.901961, log_loss = 0.536796, brier = 0.174019, ece = 0.165334 |
| `per_skill_anonymous / 47 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.821429, f1 = 0.901961, log_loss = 0.536796, brier = 0.174019, ece = 0.165334 |
| `per_skill_anonymous / 47 / metrics / bkt` | auc = 0.439130, accuracy = 0.821429, f1 = 0.901961, log_loss = 0.491962, brier = 0.155141, ece = 0.043249 |
| `per_skill_anonymous / 47 / metrics / congelado` | auc = 0.334783, accuracy = 0.821429, f1 = 0.901961, log_loss = 0.500404, brier = 0.158024, ece = 0.138118 |
| `per_skill_anonymous / 47 / metrics / incremental_0.0002` | auc = 0.334783, accuracy = 0.821429, f1 = 0.901961, log_loss = 0.500326, brier = 0.158015, ece = 0.138364 |
| `per_skill_anonymous / 47 / metrics / incremental_0.002` | auc = 0.334783, accuracy = 0.821429, f1 = 0.901961, log_loss = 0.499998, brier = 0.158042, ece = 0.083701 |
| `per_skill_anonymous / 48 / metrics / constante` | auc = 0.500000, accuracy = 0.615385, f1 = 0.761905, log_loss = 0.669888, brier = 0.238344, ece = 0.040710 |
| `per_skill_anonymous / 48 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.615385, f1 = 0.761905, log_loss = 0.703120, brier = 0.252107, ece = 0.124181 |
| `per_skill_anonymous / 48 / metrics / bkt` | auc = 0.512500, accuracy = 0.615385, f1 = 0.761905, log_loss = 0.664773, brier = 0.235965, ece = 0.049599 |
| `per_skill_anonymous / 48 / metrics / congelado` | auc = 0.487500, accuracy = 0.615385, f1 = 0.761905, log_loss = 0.679280, brier = 0.241764, ece = 0.060021 |
| `per_skill_anonymous / 48 / metrics / incremental_0.0002` | auc = 0.487500, accuracy = 0.615385, f1 = 0.761905, log_loss = 0.676223, brier = 0.240309, ece = 0.063636 |
| `per_skill_anonymous / 48 / metrics / incremental_0.002` | auc = 0.587500, accuracy = 0.615385, f1 = 0.761905, log_loss = 0.660538, brier = 0.233485, ece = 0.109330 |
| `per_skill_anonymous / 51 / metrics / constante` | auc = 0.500000, accuracy = 0.777778, f1 = 0.875000, log_loss = 0.564992, brier = 0.187646, ece = 0.121683 |
| `per_skill_anonymous / 51 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.777778, f1 = 0.875000, log_loss = 0.564992, brier = 0.187646, ece = 0.121683 |
| `per_skill_anonymous / 51 / metrics / bkt` | auc = 0.580357, accuracy = 0.722222, f1 = 0.838710, log_loss = 0.541436, brier = 0.180287, ece = 0.158079 |
| `per_skill_anonymous / 51 / metrics / congelado` | auc = 0.598214, accuracy = 0.722222, f1 = 0.838710, log_loss = 0.556704, brier = 0.185731, ece = 0.143125 |
| `per_skill_anonymous / 51 / metrics / incremental_0.0002` | auc = 0.598214, accuracy = 0.722222, f1 = 0.838710, log_loss = 0.556920, brier = 0.185806, ece = 0.143294 |
| `per_skill_anonymous / 51 / metrics / incremental_0.002` | auc = 0.598214, accuracy = 0.722222, f1 = 0.838710, log_loss = 0.558736, brier = 0.186466, ece = 0.144676 |
| `per_skill_anonymous / 53 / metrics / constante` | auc = 0.500000, accuracy = 0.630137, f1 = 0.773109, log_loss = 0.660359, brier = 0.233738, ece = 0.025958 |
| `per_skill_anonymous / 53 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.630137, f1 = 0.773109, log_loss = 0.673157, brier = 0.239235, ece = 0.078554 |
| `per_skill_anonymous / 53 / metrics / bkt` | auc = 0.557568, accuracy = 0.575342, f1 = 0.680412, log_loss = 0.674218, brier = 0.240084, ece = 0.100903 |
| `per_skill_anonymous / 53 / metrics / congelado` | auc = 0.577697, accuracy = 0.575342, f1 = 0.715596, log_loss = 0.656484, brier = 0.232204, ece = 0.055790 |
| `per_skill_anonymous / 53 / metrics / incremental_0.0002` | auc = 0.581320, accuracy = 0.575342, f1 = 0.710280, log_loss = 0.656979, brier = 0.232395, ece = 0.055415 |
| `per_skill_anonymous / 53 / metrics / incremental_0.002` | auc = 0.552335, accuracy = 0.561644, f1 = 0.686275, log_loss = 0.663542, brier = 0.234693, ece = 0.145563 |
| `per_skill_anonymous / 54 / metrics / constante` | auc = 0.500000, accuracy = 0.616667, f1 = 0.762887, log_loss = 0.669060, brier = 0.237943, ece = 0.039428 |
| `per_skill_anonymous / 54 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.616667, f1 = 0.762887, log_loss = 0.665738, brier = 0.236420, ece = 0.005571 |
| `per_skill_anonymous / 54 / metrics / bkt` | auc = 0.652174, accuracy = 0.750000, f1 = 0.810127, log_loss = 0.583565, brier = 0.195526, ece = 0.106186 |
| `per_skill_anonymous / 54 / metrics / congelado` | auc = 0.635723, accuracy = 0.750000, f1 = 0.805195, log_loss = 0.591810, brier = 0.199377, ece = 0.107657 |
| `per_skill_anonymous / 54 / metrics / incremental_0.0002` | auc = 0.653349, accuracy = 0.750000, f1 = 0.805195, log_loss = 0.591312, brier = 0.199124, ece = 0.106028 |
| `per_skill_anonymous / 54 / metrics / incremental_0.002` | auc = 0.669800, accuracy = 0.750000, f1 = 0.805195, log_loss = 0.585980, brier = 0.196830, ece = 0.089489 |
| `per_skill_anonymous / 55 / metrics / constante` | auc = 0.500000, accuracy = 0.775281, f1 = 0.873418, log_loss = 0.566605, brier = 0.188426, ece = 0.119186 |
| `per_skill_anonymous / 55 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.775281, f1 = 0.873418, log_loss = 0.551883, brier = 0.181930, ece = 0.087802 |
| `per_skill_anonymous / 55 / metrics / bkt` | auc = 0.354710, accuracy = 0.752809, f1 = 0.858974, log_loss = 0.563095, brier = 0.186554, ece = 0.049024 |
| `per_skill_anonymous / 55 / metrics / congelado` | auc = 0.417754, accuracy = 0.752809, f1 = 0.858974, log_loss = 0.560107, brier = 0.185290, ece = 0.100920 |
| `per_skill_anonymous / 55 / metrics / incremental_0.0002` | auc = 0.403986, accuracy = 0.764045, f1 = 0.866242, log_loss = 0.560037, brier = 0.185148, ece = 0.105589 |
| `per_skill_anonymous / 55 / metrics / incremental_0.002` | auc = 0.417754, accuracy = 0.775281, f1 = 0.873418, log_loss = 0.559612, brier = 0.184481, ece = 0.065940 |
| `per_skill_anonymous / 56 / metrics / constante` | auc = 0.500000, accuracy = 0.743902, f1 = 0.853147, log_loss = 0.586873, brier = 0.198222, ece = 0.087808 |
| `per_skill_anonymous / 56 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.743902, f1 = 0.853147, log_loss = 0.571082, brier = 0.191368, ece = 0.029268 |
| `per_skill_anonymous / 56 / metrics / bkt` | auc = 0.428571, accuracy = 0.719512, f1 = 0.832117, log_loss = 0.595240, brier = 0.201373, ece = 0.113287 |
| `per_skill_anonymous / 56 / metrics / congelado` | auc = 0.451210, accuracy = 0.719512, f1 = 0.834532, log_loss = 0.587667, brier = 0.198166, ece = 0.086409 |
| `per_skill_anonymous / 56 / metrics / incremental_0.0002` | auc = 0.451210, accuracy = 0.719512, f1 = 0.834532, log_loss = 0.587858, brier = 0.198172, ece = 0.094924 |
| `per_skill_anonymous / 56 / metrics / incremental_0.002` | auc = 0.441062, accuracy = 0.719512, f1 = 0.832117, log_loss = 0.594506, brier = 0.200402, ece = 0.081187 |
| `per_skill_anonymous / 57 / metrics / constante` | auc = 0.500000, accuracy = 0.809524, f1 = 0.894737, log_loss = 0.544486, brier = 0.177735, ece = 0.153429 |
| `per_skill_anonymous / 57 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.809524, f1 = 0.894737, log_loss = 0.487561, brier = 0.154402, ece = 0.014402 |
| `per_skill_anonymous / 57 / metrics / bkt` | auc = 0.279412, accuracy = 0.809524, f1 = 0.894737, log_loss = 0.571234, brier = 0.189236, ece = 0.153050 |
| `per_skill_anonymous / 57 / metrics / congelado` | auc = 0.279412, accuracy = 0.809524, f1 = 0.894737, log_loss = 0.567936, brier = 0.187114, ece = 0.141289 |
| `per_skill_anonymous / 57 / metrics / incremental_0.0002` | auc = 0.308824, accuracy = 0.809524, f1 = 0.894737, log_loss = 0.567889, brier = 0.186952, ece = 0.142499 |
| `per_skill_anonymous / 57 / metrics / incremental_0.002` | auc = 0.323529, accuracy = 0.809524, f1 = 0.894737, log_loss = 0.568748, brier = 0.186685, ece = 0.183943 |
| `per_skill_anonymous / 58 / metrics / constante` | auc = 0.500000, accuracy = 0.694561, f1 = 0.819753, log_loss = 0.618745, brier = 0.213626, ece = 0.038466 |
| `per_skill_anonymous / 58 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.694561, f1 = 0.819753, log_loss = 0.616247, brier = 0.212496, ece = 0.018704 |
| `per_skill_anonymous / 58 / metrics / bkt` | auc = 0.641649, accuracy = 0.711297, f1 = 0.806723, log_loss = 0.573132, brier = 0.193508, ece = 0.039002 |
| `per_skill_anonymous / 58 / metrics / congelado` | auc = 0.646848, accuracy = 0.707113, f1 = 0.805556, log_loss = 0.574977, brier = 0.193964, ece = 0.057412 |
| `per_skill_anonymous / 58 / metrics / incremental_0.0002` | auc = 0.639710, accuracy = 0.702929, f1 = 0.801120, log_loss = 0.575297, brier = 0.194038, ece = 0.047007 |
| `per_skill_anonymous / 58 / metrics / incremental_0.002` | auc = 0.649034, accuracy = 0.723849, f1 = 0.810345, log_loss = 0.576664, brier = 0.194410, ece = 0.074514 |
| `per_skill_anonymous / 59 / metrics / constante` | auc = 0.500000, accuracy = 0.738636, f1 = 0.849673, log_loss = 0.590275, brier = 0.199866, ece = 0.082541 |
| `per_skill_anonymous / 59 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.738636, f1 = 0.849673, log_loss = 0.601018, brier = 0.204799, ece = 0.108378 |
| `per_skill_anonymous / 59 / metrics / bkt` | auc = 0.567726, accuracy = 0.710227, f1 = 0.828283, log_loss = 0.582247, brier = 0.197589, ece = 0.044876 |
| `per_skill_anonymous / 59 / metrics / congelado` | auc = 0.563211, accuracy = 0.738636, f1 = 0.848684, log_loss = 0.574544, brier = 0.193846, ece = 0.050305 |
| `per_skill_anonymous / 59 / metrics / incremental_0.0002` | auc = 0.569482, accuracy = 0.738636, f1 = 0.848684, log_loss = 0.574260, brier = 0.193732, ece = 0.038735 |
| `per_skill_anonymous / 59 / metrics / incremental_0.002` | auc = 0.581689, accuracy = 0.732955, f1 = 0.844884, log_loss = 0.573503, brier = 0.193234, ece = 0.041520 |
| `per_skill_anonymous / 60 / metrics / constante` | auc = 0.500000, accuracy = 0.712644, f1 = 0.832215, log_loss = 0.607065, brier = 0.207980, ece = 0.056549 |
| `per_skill_anonymous / 60 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.712644, f1 = 0.832215, log_loss = 0.626529, brier = 0.213995, ece = 0.095981 |
| `per_skill_anonymous / 60 / metrics / bkt` | auc = 0.538387, accuracy = 0.678161, f1 = 0.800000, log_loss = 0.607130, brier = 0.207807, ece = 0.061220 |
| `per_skill_anonymous / 60 / metrics / congelado` | auc = 0.530645, accuracy = 0.678161, f1 = 0.802817, log_loss = 0.600731, brier = 0.204540, ece = 0.083604 |
| `per_skill_anonymous / 60 / metrics / incremental_0.0002` | auc = 0.539355, accuracy = 0.712644, f1 = 0.827586, log_loss = 0.601311, brier = 0.204793, ece = 0.039191 |
| `per_skill_anonymous / 60 / metrics / incremental_0.002` | auc = 0.560000, accuracy = 0.689655, f1 = 0.811189, log_loss = 0.602712, brier = 0.205152, ece = 0.062779 |
| `per_skill_anonymous / 61 / metrics / constante` | auc = 0.500000, accuracy = 0.951613, f1 = 0.975207, log_loss = 0.452705, brier = 0.133377, ece = 0.295518 |
| `per_skill_anonymous / 61 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.951613, f1 = 0.975207, log_loss = 0.377904, brier = 0.101187, ece = 0.234823 |
| `per_skill_anonymous / 61 / metrics / bkt` | auc = 0.598870, accuracy = 0.951613, f1 = 0.975207, log_loss = 0.339979, brier = 0.088056, ece = 0.198488 |
| `per_skill_anonymous / 61 / metrics / congelado` | auc = 0.531073, accuracy = 0.951613, f1 = 0.975207, log_loss = 0.334330, brier = 0.085810, ece = 0.191717 |
| `per_skill_anonymous / 61 / metrics / incremental_0.0002` | auc = 0.500000, accuracy = 0.951613, f1 = 0.975207, log_loss = 0.332530, brier = 0.085152, ece = 0.189763 |
| `per_skill_anonymous / 61 / metrics / incremental_0.002` | auc = 0.500000, accuracy = 0.951613, f1 = 0.975207, log_loss = 0.321294, brier = 0.081545, ece = 0.177596 |
| `per_skill_anonymous / 63 / metrics / constante` | auc = 0.500000, accuracy = 0.720000, f1 = 0.837209, log_loss = 0.602313, brier = 0.205684, ece = 0.063905 |
| `per_skill_anonymous / 63 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.720000, f1 = 0.837209, log_loss = 0.773977, brier = 0.242578, ece = 0.202430 |
| `per_skill_anonymous / 63 / metrics / bkt` | auc = 0.194444, accuracy = 0.720000, f1 = 0.837209, log_loss = 0.660637, brier = 0.229684, ece = 0.237873 |
| `per_skill_anonymous / 63 / metrics / congelado` | auc = 0.289683, accuracy = 0.720000, f1 = 0.837209, log_loss = 0.627689, brier = 0.216626, ece = 0.240617 |
| `per_skill_anonymous / 63 / metrics / incremental_0.0002` | auc = 0.313492, accuracy = 0.720000, f1 = 0.837209, log_loss = 0.625908, brier = 0.215947, ece = 0.131575 |
| `per_skill_anonymous / 63 / metrics / incremental_0.002` | auc = 0.416667, accuracy = 0.720000, f1 = 0.837209, log_loss = 0.621353, brier = 0.214315, ece = 0.089434 |
| `per_skill_anonymous / 64 / metrics / constante` | auc = 0.500000, accuracy = 0.756410, f1 = 0.861314, log_loss = 0.578794, brier = 0.194317, ece = 0.100315 |
| `per_skill_anonymous / 64 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.756410, f1 = 0.861314, log_loss = 0.555509, brier = 0.184377, ece = 0.011087 |
| `per_skill_anonymous / 64 / metrics / bkt` | auc = 0.575379, accuracy = 0.756410, f1 = 0.857143, log_loss = 0.563816, brier = 0.189008, ece = 0.059667 |
| `per_skill_anonymous / 64 / metrics / congelado` | auc = 0.520963, accuracy = 0.756410, f1 = 0.857143, log_loss = 0.568606, brier = 0.190408, ece = 0.069410 |
| `per_skill_anonymous / 64 / metrics / incremental_0.0002` | auc = 0.530776, accuracy = 0.756410, f1 = 0.857143, log_loss = 0.567277, brier = 0.189909, ece = 0.063128 |
| `per_skill_anonymous / 64 / metrics / incremental_0.002` | auc = 0.548617, accuracy = 0.756410, f1 = 0.857143, log_loss = 0.564583, brier = 0.189107, ece = 0.082426 |
| `per_skill_anonymous / 65 / metrics / constante` | auc = 0.500000, accuracy = 0.557143, f1 = 0.715596, log_loss = 0.707509, brier = 0.256526, ece = 0.098952 |
| `per_skill_anonymous / 65 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.557143, f1 = 0.715596, log_loss = 0.689768, brier = 0.248273, ece = 0.039219 |
| `per_skill_anonymous / 65 / metrics / bkt` | auc = 0.605045, accuracy = 0.728571, f1 = 0.795699, log_loss = 0.631388, brier = 0.216545, ece = 0.154080 |
| `per_skill_anonymous / 65 / metrics / congelado` | auc = 0.569479, accuracy = 0.700000, f1 = 0.778947, log_loss = 0.652315, brier = 0.226823, ece = 0.131518 |
| `per_skill_anonymous / 65 / metrics / incremental_0.0002` | auc = 0.562448, accuracy = 0.700000, f1 = 0.778947, log_loss = 0.650113, brier = 0.225769, ece = 0.130598 |
| `per_skill_anonymous / 65 / metrics / incremental_0.002` | auc = 0.578164, accuracy = 0.714286, f1 = 0.787234, log_loss = 0.643118, brier = 0.222559, ece = 0.171645 |
| `per_skill_anonymous / 66 / metrics / constante` | auc = 0.500000, accuracy = 0.767677, f1 = 0.868571, log_loss = 0.571517, brier = 0.190800, ece = 0.111582 |
| `per_skill_anonymous / 66 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.767677, f1 = 0.868571, log_loss = 0.571105, brier = 0.190614, ece = 0.110747 |
| `per_skill_anonymous / 66 / metrics / bkt` | auc = 0.475973, accuracy = 0.747475, f1 = 0.853801, log_loss = 0.558261, brier = 0.185429, ece = 0.036069 |
| `per_skill_anonymous / 66 / metrics / congelado` | auc = 0.431350, accuracy = 0.757576, f1 = 0.860465, log_loss = 0.565925, brier = 0.187943, ece = 0.095429 |
| `per_skill_anonymous / 66 / metrics / incremental_0.0002` | auc = 0.438787, accuracy = 0.757576, f1 = 0.860465, log_loss = 0.564402, brier = 0.187338, ece = 0.089273 |
| `per_skill_anonymous / 66 / metrics / incremental_0.002` | auc = 0.458810, accuracy = 0.747475, f1 = 0.855491, log_loss = 0.561542, brier = 0.185967, ece = 0.075634 |
| `per_skill_anonymous / 67 / metrics / constante` | auc = 0.500000, accuracy = 0.750000, f1 = 0.857143, log_loss = 0.582935, brier = 0.196318, ece = 0.093905 |
| `per_skill_anonymous / 67 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.250000, f1 = 0.000000, log_loss = 0.822701, brier = 0.313724, ece = 0.355281 |
| `per_skill_anonymous / 67 / metrics / bkt` | auc = 0.366391, accuracy = 0.750000, f1 = 0.857143, log_loss = 0.615449, brier = 0.210865, ece = 0.070494 |
| `per_skill_anonymous / 67 / metrics / congelado` | auc = 0.363636, accuracy = 0.750000, f1 = 0.857143, log_loss = 0.616745, brier = 0.210676, ece = 0.128933 |
| `per_skill_anonymous / 67 / metrics / incremental_0.0002` | auc = 0.381543, accuracy = 0.750000, f1 = 0.857143, log_loss = 0.616265, brier = 0.210486, ece = 0.091874 |
| `per_skill_anonymous / 67 / metrics / incremental_0.002` | auc = 0.400826, accuracy = 0.750000, f1 = 0.857143, log_loss = 0.612511, brier = 0.208707, ece = 0.110842 |
| `per_skill_anonymous / 69 / metrics / constante` | auc = 0.500000, accuracy = 0.508197, f1 = 0.673913, log_loss = 0.739125, brier = 0.271807, ece = 0.147898 |
| `per_skill_anonymous / 69 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.491803, f1 = 0.000000, log_loss = 0.713950, brier = 0.260228, ece = 0.101468 |
| `per_skill_anonymous / 69 / metrics / bkt` | auc = 0.696774, accuracy = 0.655738, f1 = 0.676923, log_loss = 0.634853, brier = 0.220345, ece = 0.054332 |
| `per_skill_anonymous / 69 / metrics / congelado` | auc = 0.683871, accuracy = 0.639344, f1 = 0.656250, log_loss = 0.642809, brier = 0.224357, ece = 0.095741 |
| `per_skill_anonymous / 69 / metrics / incremental_0.0002` | auc = 0.696237, accuracy = 0.655738, f1 = 0.676923, log_loss = 0.642040, brier = 0.223850, ece = 0.055592 |
| `per_skill_anonymous / 69 / metrics / incremental_0.002` | auc = 0.693011, accuracy = 0.672131, f1 = 0.696970, log_loss = 0.640071, brier = 0.222016, ece = 0.065956 |
| `per_skill_anonymous / 70 / metrics / constante` | auc = 0.500000, accuracy = 0.740260, f1 = 0.850746, log_loss = 0.589226, brier = 0.199359, ece = 0.084165 |
| `per_skill_anonymous / 70 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.259740, f1 = 0.000000, log_loss = 0.846325, brier = 0.324835, ece = 0.364088 |
| `per_skill_anonymous / 70 / metrics / bkt` | auc = 0.656579, accuracy = 0.753247, f1 = 0.850394, log_loss = 0.539350, brier = 0.178326, ece = 0.024691 |
| `per_skill_anonymous / 70 / metrics / congelado` | auc = 0.627851, accuracy = 0.746753, f1 = 0.845850, log_loss = 0.543220, brier = 0.179245, ece = 0.070088 |
| `per_skill_anonymous / 70 / metrics / incremental_0.0002` | auc = 0.629167, accuracy = 0.753247, f1 = 0.849206, log_loss = 0.542274, brier = 0.178839, ece = 0.043606 |
| `per_skill_anonymous / 70 / metrics / incremental_0.002` | auc = 0.642325, accuracy = 0.753247, f1 = 0.849206, log_loss = 0.538850, brier = 0.177499, ece = 0.040181 |
| `per_skill_anonymous / 71 / metrics / constante` | auc = 0.500000, accuracy = 0.726415, f1 = 0.841530, log_loss = 0.598169, brier = 0.203681, ece = 0.070320 |
| `per_skill_anonymous / 71 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.273585, f1 = 0.000000, log_loss = 0.702078, brier = 0.254465, ece = 0.236069 |
| `per_skill_anonymous / 71 / metrics / bkt` | auc = 0.528213, accuracy = 0.716981, f1 = 0.829545, log_loss = 0.606686, brier = 0.208652, ece = 0.123620 |
| `per_skill_anonymous / 71 / metrics / congelado` | auc = 0.554187, accuracy = 0.726415, f1 = 0.841530, log_loss = 0.592782, brier = 0.201805, ece = 0.053952 |
| `per_skill_anonymous / 71 / metrics / incremental_0.0002` | auc = 0.544335, accuracy = 0.716981, f1 = 0.835165, log_loss = 0.592370, brier = 0.201566, ece = 0.070597 |
| `per_skill_anonymous / 71 / metrics / incremental_0.002` | auc = 0.498657, accuracy = 0.716981, f1 = 0.835165, log_loss = 0.596021, brier = 0.202820, ece = 0.106575 |
| `per_skill_anonymous / 72 / metrics / constante` | auc = 0.500000, accuracy = 0.897059, f1 = 0.945736, log_loss = 0.487944, brier = 0.150408, ece = 0.240964 |
| `per_skill_anonymous / 72 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.897059, f1 = 0.945736, log_loss = 0.643592, brier = 0.225256, ece = 0.364571 |
| `per_skill_anonymous / 72 / metrics / bkt` | auc = 0.427400, accuracy = 0.897059, f1 = 0.945736, log_loss = 0.410213, brier = 0.119145, ece = 0.148350 |
| `per_skill_anonymous / 72 / metrics / congelado` | auc = 0.382904, accuracy = 0.897059, f1 = 0.945736, log_loss = 0.416578, brier = 0.120953, ece = 0.167904 |
| `per_skill_anonymous / 72 / metrics / incremental_0.0002` | auc = 0.373536, accuracy = 0.897059, f1 = 0.945736, log_loss = 0.414307, brier = 0.120081, ece = 0.154009 |
| `per_skill_anonymous / 72 / metrics / incremental_0.002` | auc = 0.380562, accuracy = 0.897059, f1 = 0.945736, log_loss = 0.403855, brier = 0.116218, ece = 0.127223 |
| `per_skill_anonymous / 73 / metrics / constante` | auc = 0.500000, accuracy = 0.565217, f1 = 0.722222, log_loss = 0.702293, brier = 0.254005, ece = 0.090878 |
| `per_skill_anonymous / 73 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.434783, f1 = 0.000000, log_loss = 0.751864, brier = 0.278696, ece = 0.181519 |
| `per_skill_anonymous / 73 / metrics / bkt` | auc = 0.584615, accuracy = 0.608696, f1 = 0.689655, log_loss = 0.682259, brier = 0.243342, ece = 0.065007 |
| `per_skill_anonymous / 73 / metrics / congelado` | auc = 0.561538, accuracy = 0.608696, f1 = 0.689655, log_loss = 0.688168, brier = 0.246049, ece = 0.093722 |
| `per_skill_anonymous / 73 / metrics / incremental_0.0002` | auc = 0.530769, accuracy = 0.608696, f1 = 0.689655, log_loss = 0.689095, brier = 0.246502, ece = 0.092486 |
| `per_skill_anonymous / 73 / metrics / incremental_0.002` | auc = 0.515385, accuracy = 0.565217, f1 = 0.642857, log_loss = 0.696777, brier = 0.250104, ece = 0.109254 |
| `per_skill_anonymous / 75 / metrics / constante` | auc = 0.500000, accuracy = 0.910714, f1 = 0.953271, log_loss = 0.479123, brier = 0.146145, ece = 0.254619 |
| `per_skill_anonymous / 75 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.910714, f1 = 0.953271, log_loss = 0.301525, brier = 0.081426, ece = 0.010574 |
| `per_skill_anonymous / 75 / metrics / bkt` | auc = 0.415686, accuracy = 0.910714, f1 = 0.953271, log_loss = 0.375900, brier = 0.104804, ece = 0.141827 |
| `per_skill_anonymous / 75 / metrics / congelado` | auc = 0.423529, accuracy = 0.910714, f1 = 0.953271, log_loss = 0.376878, brier = 0.104984, ece = 0.141369 |
| `per_skill_anonymous / 75 / metrics / incremental_0.0002` | auc = 0.403922, accuracy = 0.910714, f1 = 0.953271, log_loss = 0.374417, brier = 0.104163, ece = 0.137245 |
| `per_skill_anonymous / 75 / metrics / incremental_0.002` | auc = 0.470588, accuracy = 0.910714, f1 = 0.953271, log_loss = 0.355614, brier = 0.098222, ece = 0.119612 |
| `per_skill_anonymous / 76 / metrics / constante` | auc = 0.500000, accuracy = 0.714286, f1 = 0.833333, log_loss = 0.606004, brier = 0.207468, ece = 0.058191 |
| `per_skill_anonymous / 76 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.714286, f1 = 0.833333, log_loss = 0.617000, brier = 0.210710, ece = 0.081414 |
| `per_skill_anonymous / 76 / metrics / bkt` | auc = 0.440625, accuracy = 0.678571, f1 = 0.800000, log_loss = 0.653455, brier = 0.227935, ece = 0.182385 |
| `per_skill_anonymous / 76 / metrics / congelado` | auc = 0.428125, accuracy = 0.714286, f1 = 0.826087, log_loss = 0.636152, brier = 0.220461, ece = 0.139868 |
| `per_skill_anonymous / 76 / metrics / incremental_0.0002` | auc = 0.509375, accuracy = 0.714286, f1 = 0.826087, log_loss = 0.635611, brier = 0.220373, ece = 0.141714 |
| `per_skill_anonymous / 76 / metrics / incremental_0.002` | auc = 0.515625, accuracy = 0.678571, f1 = 0.800000, log_loss = 0.636428, brier = 0.220816, ece = 0.128564 |
| `per_skill_anonymous / 77 / metrics / constante` | auc = 0.500000, accuracy = 0.937500, f1 = 0.967742, log_loss = 0.461821, brier = 0.137783, ece = 0.281405 |
| `per_skill_anonymous / 77 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.937500, f1 = 0.967742, log_loss = 0.582731, brier = 0.195120, ece = 0.369494 |
| `per_skill_anonymous / 77 / metrics / bkt` | auc = 0.533333, accuracy = 0.937500, f1 = 0.967742, log_loss = 0.441341, brier = 0.129845, ece = 0.264096 |
| `per_skill_anonymous / 77 / metrics / congelado` | auc = 0.533333, accuracy = 0.937500, f1 = 0.967742, log_loss = 0.425132, brier = 0.122716, ece = 0.249723 |
| `per_skill_anonymous / 77 / metrics / incremental_0.0002` | auc = 0.733333, accuracy = 0.937500, f1 = 0.967742, log_loss = 0.425118, brier = 0.122670, ece = 0.250129 |
| `per_skill_anonymous / 77 / metrics / incremental_0.002` | auc = 0.666667, accuracy = 0.937500, f1 = 0.967742, log_loss = 0.419586, brier = 0.120181, ece = 0.247023 |
| `per_skill_anonymous / 78 / metrics / constante` | auc = 0.500000, accuracy = 0.666667, f1 = 0.800000, log_loss = 0.636763, brier = 0.222334, ece = 0.010572 |
| `per_skill_anonymous / 78 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.333333, f1 = 0.000000, log_loss = 0.827096, brier = 0.314990, ece = 0.304578 |
| `per_skill_anonymous / 78 / metrics / bkt` | auc = 0.427500, accuracy = 0.666667, f1 = 0.800000, log_loss = 0.698262, brier = 0.250510, ece = 0.174256 |
| `per_skill_anonymous / 78 / metrics / congelado` | auc = 0.427500, accuracy = 0.666667, f1 = 0.800000, log_loss = 0.682841, brier = 0.242348, ece = 0.173784 |
| `per_skill_anonymous / 78 / metrics / incremental_0.0002` | auc = 0.387500, accuracy = 0.666667, f1 = 0.800000, log_loss = 0.685600, brier = 0.243297, ece = 0.174367 |
| `per_skill_anonymous / 78 / metrics / incremental_0.002` | auc = 0.157500, accuracy = 0.666667, f1 = 0.800000, log_loss = 0.700742, brier = 0.248636, ece = 0.303052 |
| `per_skill_anonymous / 79 / metrics / constante` | auc = 0.500000, accuracy = 0.677419, f1 = 0.807692, log_loss = 0.629817, brier = 0.218977, ece = 0.021324 |
| `per_skill_anonymous / 79 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.677419, f1 = 0.807692, log_loss = 0.628855, brier = 0.218546, ece = 0.004901 |
| `per_skill_anonymous / 79 / metrics / bkt` | auc = 0.473810, accuracy = 0.548387, f1 = 0.708333, log_loss = 0.673156, brier = 0.239206, ece = 0.209038 |
| `per_skill_anonymous / 79 / metrics / congelado` | auc = 0.459524, accuracy = 0.645161, f1 = 0.784314, log_loss = 0.658262, brier = 0.231429, ece = 0.122312 |
| `per_skill_anonymous / 79 / metrics / incremental_0.0002` | auc = 0.476190, accuracy = 0.645161, f1 = 0.784314, log_loss = 0.658267, brier = 0.231436, ece = 0.124441 |
| `per_skill_anonymous / 79 / metrics / incremental_0.002` | auc = 0.480952, accuracy = 0.548387, f1 = 0.708333, log_loss = 0.659292, brier = 0.231683, ece = 0.172018 |
| `per_skill_anonymous / 80 / metrics / constante` | auc = 0.500000, accuracy = 0.630435, f1 = 0.773333, log_loss = 0.660167, brier = 0.233645, ece = 0.025660 |
| `per_skill_anonymous / 80 / metrics / sem_personalizacao` | auc = 0.500000, accuracy = 0.630435, f1 = 0.773333, log_loss = 0.713693, brier = 0.254490, ece = 0.146638 |
| `per_skill_anonymous / 80 / metrics / bkt` | auc = 0.426978, accuracy = 0.543478, f1 = 0.686567, log_loss = 0.721177, brier = 0.261086, ece = 0.150134 |
| `per_skill_anonymous / 80 / metrics / congelado` | auc = 0.414807, accuracy = 0.586957, f1 = 0.732394, log_loss = 0.706073, brier = 0.253486, ece = 0.141397 |
| `per_skill_anonymous / 80 / metrics / incremental_0.0002` | auc = 0.433063, accuracy = 0.586957, f1 = 0.732394, log_loss = 0.706645, brier = 0.253618, ece = 0.130350 |
| `per_skill_anonymous / 80 / metrics / incremental_0.002` | auc = 0.449290, accuracy = 0.565217, f1 = 0.714286, log_loss = 0.701854, brier = 0.251468, ece = 0.102457 |

## viabilidade/fechamento.json

Arquivo integral · [fechamento.json](evidencias/workspace/dificuldade-adaptativa/viabilidade/fechamento.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `models / sgd / gate_records / 0 / gate` | auc = 0.721825, accuracy = 0.719571, f1 = 0.820466, log_loss = 0.571300, brier = 0.193315, ece = 0.063764 |
| `models / sgd / gate_records / 0 / incumbent_gate` | auc = 0.721490, accuracy = 0.719571, f1 = 0.820466, log_loss = 0.571462, brier = 0.193380, ece = 0.064092 |
| `models / sgd / gate_records / 1 / gate` | auc = 0.723884, accuracy = 0.719571, f1 = 0.820855, log_loss = 0.569431, brier = 0.192765, ece = 0.064331 |
| `models / sgd / gate_records / 1 / incumbent_gate` | auc = 0.721490, accuracy = 0.719571, f1 = 0.820466, log_loss = 0.571462, brier = 0.193380, ece = 0.064092 |
| `models / sgd / gate_records / 2 / gate` | auc = 0.724250, accuracy = 0.721265, f1 = 0.820382, log_loss = 0.561618, brier = 0.189638, ece = 0.048986 |
| `models / sgd / gate_records / 2 / incumbent_gate` | auc = 0.721490, accuracy = 0.719571, f1 = 0.820466, log_loss = 0.571462, brier = 0.193380, ece = 0.064092 |
| `models / sgd / gate_records / 3 / gate` | auc = 0.721997, accuracy = 0.722112, f1 = 0.819912, log_loss = 0.572237, brier = 0.193326, ece = 0.060619 |
| `models / sgd / gate_records / 3 / incumbent_gate` | auc = 0.721490, accuracy = 0.719571, f1 = 0.820466, log_loss = 0.571462, brier = 0.193380, ece = 0.064092 |
| `models / sgd / gate_records / 4 / gate` | auc = 0.699197, accuracy = 0.667412, f1 = 0.766116, log_loss = 0.619379, brier = 0.214623, ece = 0.058132 |
| `models / sgd / gate_records / 4 / incumbent_gate` | auc = 0.699136, accuracy = 0.666015, f1 = 0.765456, log_loss = 0.619916, brier = 0.214855, ece = 0.060068 |
| `models / sgd / gate_records / 5 / gate` | auc = 0.699126, accuracy = 0.666015, f1 = 0.765824, log_loss = 0.619575, brier = 0.214679, ece = 0.060177 |
| `models / sgd / gate_records / 5 / incumbent_gate` | auc = 0.699136, accuracy = 0.666015, f1 = 0.765456, log_loss = 0.619916, brier = 0.214855, ece = 0.060068 |
| `models / sgd / gate_records / 6 / gate` | auc = 0.709822, accuracy = 0.666015, f1 = 0.766920, log_loss = 0.620507, brier = 0.214998, ece = 0.063999 |
| `models / sgd / gate_records / 6 / incumbent_gate` | auc = 0.699136, accuracy = 0.666015, f1 = 0.765456, log_loss = 0.619916, brier = 0.214855, ece = 0.060068 |
| `models / sgd / gate_records / 7 / gate` | auc = 0.699091, accuracy = 0.666015, f1 = 0.765824, log_loss = 0.626878, brier = 0.217898, ece = 0.079101 |
| `models / sgd / gate_records / 7 / incumbent_gate` | auc = 0.699136, accuracy = 0.666015, f1 = 0.765456, log_loss = 0.619916, brier = 0.214855, ece = 0.060068 |
| `models / sgd / test / baseline` | auc = 0.618480, accuracy = 0.725862, f1 = 0.833106, log_loss = 0.580836, brier = 0.196154, ece = 0.042373 |
| `models / sgd / test / selected` | auc = 0.616187, accuracy = 0.724842, f1 = 0.831289, log_loss = 0.583364, brier = 0.196813, ece = 0.043692 |
| `models / sgd / test / batch1_eta0.0002` | auc = 0.618633, accuracy = 0.725862, f1 = 0.833106, log_loss = 0.580843, brier = 0.196154, ece = 0.042172 |
| `models / sgd / test / batch1_eta0.002` | auc = 0.618576, accuracy = 0.725658, f1 = 0.833251, log_loss = 0.580644, brier = 0.195989, ece = 0.032840 |
| `models / sgd / test / batch1_eta0.02` | auc = 0.616211, accuracy = 0.724025, f1 = 0.830915, log_loss = 0.583292, brier = 0.196749, ece = 0.042672 |
| `models / sgd / test / batch1_calibrated` | auc = 0.618495, accuracy = 0.723413, f1 = 0.829324, log_loss = 0.585777, brier = 0.198399, ece = 0.055076 |
| `models / sgd / test / batch2_eta0.0002` | auc = 0.616187, accuracy = 0.724842, f1 = 0.831289, log_loss = 0.583364, brier = 0.196813, ece = 0.043692 |
| `models / sgd / test / batch2_eta0.002` | auc = 0.614181, accuracy = 0.724842, f1 = 0.831668, log_loss = 0.584600, brier = 0.197251, ece = 0.043305 |
| `models / sgd / test / batch2_eta0.02` | auc = 0.606751, accuracy = 0.724434, f1 = 0.832048, log_loss = 0.587896, brier = 0.198430, ece = 0.046980 |
| `models / sgd / test / batch2_calibrated` | auc = 0.617467, accuracy = 0.724842, f1 = 0.831626, log_loss = 0.582544, brier = 0.196203, ece = 0.036555 |
| `models / bkt_sgd / gate_records / 0 / gate` | auc = 0.723755, accuracy = 0.725501, f1 = 0.821782, log_loss = 0.568948, brier = 0.192174, ece = 0.072886 |
| `models / bkt_sgd / gate_records / 0 / incumbent_gate` | auc = 0.722855, accuracy = 0.723807, f1 = 0.820022, log_loss = 0.569472, brier = 0.192329, ece = 0.071518 |
| `models / bkt_sgd / gate_records / 1 / gate` | auc = 0.726242, accuracy = 0.722395, f1 = 0.820784, log_loss = 0.566995, brier = 0.191643, ece = 0.067247 |
| `models / bkt_sgd / gate_records / 1 / incumbent_gate` | auc = 0.722855, accuracy = 0.723807, f1 = 0.820022, log_loss = 0.569472, brier = 0.192329, ece = 0.071518 |
| `models / bkt_sgd / gate_records / 2 / gate` | auc = 0.725781, accuracy = 0.723242, f1 = 0.818720, log_loss = 0.559754, brier = 0.188827, ece = 0.053582 |
| `models / bkt_sgd / gate_records / 2 / incumbent_gate` | auc = 0.722855, accuracy = 0.723807, f1 = 0.820022, log_loss = 0.569472, brier = 0.192329, ece = 0.071518 |
| `models / bkt_sgd / gate_records / 3 / gate` | auc = 0.726003, accuracy = 0.722677, f1 = 0.817675, log_loss = 0.569278, brier = 0.192035, ece = 0.059890 |
| `models / bkt_sgd / gate_records / 3 / incumbent_gate` | auc = 0.722855, accuracy = 0.723807, f1 = 0.820022, log_loss = 0.569472, brier = 0.192329, ece = 0.071518 |
| `models / bkt_sgd / gate_records / 4 / gate` | auc = 0.699520, accuracy = 0.666294, f1 = 0.760817, log_loss = 0.617409, brier = 0.213656, ece = 0.056341 |
| `models / bkt_sgd / gate_records / 4 / incumbent_gate` | auc = 0.699444, accuracy = 0.666294, f1 = 0.760817, log_loss = 0.617901, brier = 0.213862, ece = 0.057951 |
| `models / bkt_sgd / gate_records / 5 / gate` | auc = 0.708768, accuracy = 0.666015, f1 = 0.761620, log_loss = 0.617583, brier = 0.213661, ece = 0.058944 |
| `models / bkt_sgd / gate_records / 5 / incumbent_gate` | auc = 0.699444, accuracy = 0.666294, f1 = 0.760817, log_loss = 0.617901, brier = 0.213862, ece = 0.057951 |
| `models / bkt_sgd / gate_records / 6 / gate` | auc = 0.709864, accuracy = 0.667412, f1 = 0.765101, log_loss = 0.618924, brier = 0.214116, ece = 0.063668 |
| `models / bkt_sgd / gate_records / 6 / incumbent_gate` | auc = 0.699444, accuracy = 0.666294, f1 = 0.760817, log_loss = 0.617901, brier = 0.213862, ece = 0.057951 |
| `models / bkt_sgd / gate_records / 7 / gate` | auc = 0.699432, accuracy = 0.668250, f1 = 0.764718, log_loss = 0.624801, brier = 0.216791, ece = 0.077757 |
| `models / bkt_sgd / gate_records / 7 / incumbent_gate` | auc = 0.699444, accuracy = 0.666294, f1 = 0.760817, log_loss = 0.617901, brier = 0.213862, ece = 0.057951 |
| `models / bkt_sgd / test / baseline` | auc = 0.617365, accuracy = 0.723413, f1 = 0.828763, log_loss = 0.579485, brier = 0.195601, ece = 0.040018 |
| `models / bkt_sgd / test / selected` | auc = 0.612608, accuracy = 0.724025, f1 = 0.828861, log_loss = 0.583348, brier = 0.196805, ece = 0.045656 |
| `models / bkt_sgd / test / batch1_eta0.0002` | auc = 0.617524, accuracy = 0.724025, f1 = 0.829809, log_loss = 0.579229, brier = 0.195473, ece = 0.035737 |
| `models / bkt_sgd / test / batch1_eta0.002` | auc = 0.616149, accuracy = 0.725250, f1 = 0.831539, log_loss = 0.579248, brier = 0.195364, ece = 0.033762 |
| `models / bkt_sgd / test / batch1_eta0.02` | auc = 0.612743, accuracy = 0.724025, f1 = 0.828861, log_loss = 0.583231, brier = 0.196728, ece = 0.046074 |
| `models / bkt_sgd / test / batch1_calibrated` | auc = 0.617358, accuracy = 0.720963, f1 = 0.825838, log_loss = 0.583218, brier = 0.197297, ece = 0.048484 |
| `models / bkt_sgd / test / batch2_eta0.0002` | auc = 0.612608, accuracy = 0.724025, f1 = 0.828861, log_loss = 0.583348, brier = 0.196805, ece = 0.045656 |
| `models / bkt_sgd / test / batch2_eta0.002` | auc = 0.608756, accuracy = 0.726883, f1 = 0.831401, log_loss = 0.585376, brier = 0.197503, ece = 0.052096 |
| `models / bkt_sgd / test / batch2_eta0.02` | auc = 0.603520, accuracy = 0.727291, f1 = 0.832539, log_loss = 0.589511, brier = 0.198920, ece = 0.060137 |
| `models / bkt_sgd / test / batch2_calibrated` | auc = 0.612875, accuracy = 0.726067, f1 = 0.831280, log_loss = 0.583209, brier = 0.196407, ece = 0.047848 |
| `constant` | auc = 0.500000, accuracy = 0.708104, f1 = 0.829111, log_loss = 0.609997, brier = 0.209398, ece = 0.052009 |
| `bkt` | auc = 0.600571, accuracy = 0.721780, f1 = 0.825904, log_loss = 0.585226, brier = 0.197984, ece = 0.042991 |

## viabilidade/resultados.json

Arquivo integral · [resultados.json](evidencias/workspace/dificuldade-adaptativa/viabilidade/resultados.json)

| Configuração ou recorte | Medidas salvas |
| --- | --- |
| `metrics / constant` | auc = 0.500000, accuracy = 0.665534, f1 = 0.799184, log_loss = 0.640588, brier = 0.224115, ece = 0.038948 |
| `metrics / bkt` | auc = 0.677960, accuracy = 0.707029, f1 = 0.800177, log_loss = 0.584977, brier = 0.198661, ece = 0.029425 |
| `metrics / sgd_frozen` | auc = 0.692174, accuracy = 0.705330, f1 = 0.798674, log_loss = 0.579313, brier = 0.196765, ece = 0.023369 |
| `metrics / sgd_updated` | auc = 0.693160, accuracy = 0.709051, f1 = 0.810674, log_loss = 0.582386, brier = 0.197937, ece = 0.037167 |

