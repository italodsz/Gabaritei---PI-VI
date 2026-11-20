# Avaliação final congelada

A avaliação utilizou 29948 eventos, 3892 sequências e 585 estudantes nas 56 habilidades. O protocolo foi congelado com SHA-256 bc2d2609405c4bb2d69ac43dc84f4ce0e88e13a81028579598f6172ea9500348. O registro de acesso coloca o congelamento antes da primeira abertura de rótulos para avaliação nesta missão. Os parâmetros permanecem idênticos aos modelos da Fase 02.

O recorte preparado tem 4.003 estudantes. A divisão por estudante soma 2.802 no treino, 601 na validação e 600 no teste. O filtro de 56 habilidades, definido apenas pelo treino, deixa 2.773 estudantes de treino, 596 na validação e 585 no teste. Os quinze estudantes de teste restantes tinham eventos apenas nas habilidades fora do recorte principal. As contagens integrais foram preservadas, com cobertura explicitamente reportada.

A média micro pesa cada evento igualmente. A média macro pesa igualmente cada habilidade com métrica definida. Métricas indefinidas são nulas em JSON e NA em CSV. O baseline por habilidade é (acertos_treino+1)/(eventos_treino+2). A taxa global usa os eventos das 56 habilidades de treino. O histórico suavizado usa (acertos anteriores+2·taxa_treino)/(oportunidades anteriores+2) por estudante–habilidade.

| Método | Log-loss | Brier | AUC | Acurácia | ECE |
| --- | ---: | ---: | ---: | ---: | ---: |
| bkt | 0.56560806 | 0.19133217 | 0.72857236 | 0.71670896 | 0.01331319 |
| historico_suavizado | 0.58257659 | 0.19903983 | 0.71359450 | 0.69396955 | 0.04814897 |
| taxa_global | 0.64614090 | 0.22686015 | 0.50000000 | 0.65243088 | 0.00976320 |
| taxa_habilidade | 0.62544293 | 0.21774701 | 0.61037140 | 0.66338320 | 0.01220171 |

Os IC95% do BKT foram 0.552316 a 0.579110 para log-loss e 0.185497 a 0.197276 para Brier. O bootstrap pareado, com 2.000 reamostragens de estudantes, encontrou delta BKT menos taxa por habilidade de log-loss entre -0.073389 e -0.048882. Para Brier, o intervalo foi -0.032687 a -0.021343. Esses intervalos favorecem o BKT na comparação primária.

O histórico suavizado também obteve log-loss menor que a taxa por habilidade. A vantagem pontual do BKT sobre esse comparador é 0.016969. A hipótese e os intervalos confirmatórios desta entrega têm como referência a taxa por habilidade. As comparações adicionais são exploratórias.

A ECE micro do BKT foi 0.013313, frente a 0.012202 no baseline. O resultado de erro preditivo favorável convive com ECE pontualmente maior. A ECE macro foi 0.057328. Macro log-loss foi 0.554804, frente a 0.610957. As demais métricas macro estão no JSON.

| Categoria | Habilidades |
| --- | ---: |
| A | 21 |
| B | 14 |
| C | 21 |
| D | 0 |

Os intervalos por habilidade usam 1.000 reamostragens de estudantes. São intervalos marginais e as categorias têm caráter descritivo experimental, sem controle familiar de 56 comparações. O CSV registra suportes, parâmetros, diagnóstico, validação, teste, intervalos e justificativas de cada decisão.

Dos 8131 itens distintos do teste selecionado, 7929 aparecem no treino e 202 são inéditos em relação ao estoque completo de treino retido. A pergunta principal diz respeito a estudantes novos. Os recortes de itens novos, primeira resposta, comprimentos, repetição, poucos dados, fronteiras e padrões extremos são descritos por máscaras pré-especificadas. A seleção de estudantes extremos usa seu resultado observado somente para descrição, sem alteração dos modelos.

A log-loss do BKT na primeira resposta foi 0.644189, frente a 0.670888. Todas as métricas dos recortes e seus suportes constam em avaliacao_final.json e no gráfico 09. Os subgrupos recebem estimativas pontuais e não herdam automaticamente os intervalos globais.
