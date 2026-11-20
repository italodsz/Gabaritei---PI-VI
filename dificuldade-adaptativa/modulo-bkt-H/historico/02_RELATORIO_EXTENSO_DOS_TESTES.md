# Gabaritei PI VI · Relatório extenso dos testes

**Data de referência** · 08/11/2026  
**Natureza da entrega** · Consolidação retrospectiva de arquivos, logs e resultados. Nenhum treino foi reexecutado para escrever este relatório.

## Como localizar cada teste

O [Anexo de resultados](03_ANEXO_RESULTADOS.md) apresenta as tabelas das configurações registradas, incluindo as 36 variantes da Fase 2 reformulada, as execuções de fine-tuning, as ablações, os resultados externos e as políticas simuladas. O [Inventário de execuções](04_INVENTARIO_EXECUCOES.md) aponta os logs, suas falhas e reexecuções. `casos_de_teste.csv` separa casos declarados em código de casos observados em log. Os JSONs, predições, trajetórias, protocolos e logs originais disponíveis ficam em `evidencias/`. A mesma suíte pode ter sido executada em mais de uma rodada. Somar os totais dos logs duplicaria parte do trabalho.

## 1 · Fase 1, validação do dataset e da entrega

A base auditada foi `dataset` em `7e720fa876beb7249adab2f05d3ecf33ae5a2c51`. O catálogo registrou SHA-256 `22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5`. O notebook examinado tem três células de código com contadores 1, 2 e 3 e saídas persistidas. As cópias do notebook, o JSON, a versão de preparação e os logs da cópia publicada entram no dossiê.

| Partição | Período | Catálogo bruto | Elegíveis | Fácil / média / difícil entre elegíveis |
| --- | --- | ---: | ---: | --- |
| Treino | 2009–2022 | 2.616 | 1.801 | 601 / 600 / 600 |
| Validação | 2023 | 177 | 136 | 54 / 42 / 40 |
| Teste | 2024 | 178 | 126 | 53 / 42 / 31 |
| Total | 2009–2024 | 2.971 | 2.063 | |

Os três testes da Fase 1 verificaram integridade, cálculo reprodutível de cortes, ausência de sobreposição sob as chaves auditadas e rejeição de catálogo adulterado em cópia. O recorte elegível deixou 908 registros do catálogo fora dos experimentos textuais. Os tercis de `b` ajustados no treino foram **0,80054** e **1,56301**. Houve 38 alertas de a, 60 de b e 42 de c por IQR. O item `gq_cf15f16c076fceccbc04a730` tem b = 61,05459 e baixa discriminação. Isso motivou cautela, sem reclassificação automática. A triagem de duplicatas não prova ausência de paráfrases ou equivalências visuais.

A execução inicial dependia de uma base já preparada. A entrega regularizada adicionou preparação com revisão fixada, hash e execução de auditoria e testes. O usuário aprovou a Fase 1 em documento posterior. A falta de histórico individual permaneceu como dependência para as fases adaptativas.

## 2 · Classificação da dificuldade do item

### 2.1 · Baselines e primeira comparação autorizada

| Modelo | Macro-F1 em 2023 | Macro-F1 em 2024 quando medido |
| --- | ---: | ---: |
| Classe majoritária | 0,1895 | 0,1974 |
| TF-IDF de palavras + LinearSVC | 0,4182 | — |
| TF-IDF de caracteres + LinearSVC | 0,4188 | 0,4467 na rodada preliminar |
| MiniLM congelado + LinearSVC | 0,4710 | 0,5284 na primeira rodada com MiniLM |

O MiniLM fez 64/136 acertos em 2023 e 67/126 em 2024. A primeira publicação experimental testou pipeline salvo, inferência, rejeição de entradas inválidas e consistência de métricas. Resultados e logs distinguem TF-IDF preliminar e a rodada autorizada. **O teste 2024 já foi consultado** e ficou fora das avaliações posteriores. Ele não serve como conjunto completamente inédito para aprovar um modelo futuro.

### 2.2 · Encoders congelados, hardware, ordinal e regressão

Na Fase 2 reformulada, 36 combinações testaram encoder, representação estrutural e cabeça. Incluíram MiniLM, Qwen3-Embedding-0.6B e BGE-M3. Os três encoders estavam congelados e as cabeças foram ajustadas. As melhores referências apenas com embeddings e LinearSVC foram **0,4710**, **0,4548** e **0,4350**, respectivamente. Nenhuma variante atendeu aos critérios de promoção registrados.

Os tokenizadores truncaram **110/136** entradas do MiniLM a 128 tokens, **43/136** do Qwen a 256 e **28/136** do BGE a 256. A mediana de inferência curta registrada foi 19,1 ms para MiniLM em CPU, 59,3 ms para Qwen em CUDA e 17,9 ms para BGE em CUDA. Os JSONs separam medições em CPU e GPU, e tempo de codificação de tempo total. A experiência com CPU e GPU inclui a tentativa MiniLM com erro de rede, o uso do cache offline, a falha BF16 para NumPy no Qwen, a sonda corrigida em FP32, a interrupção em CPU e as rodadas em CUDA. A comparação de custo depende do hardware e da configuração.

Cabeças ordinais reduziram erros graves em algumas condições. Qwen ordinal registrou F1 0,4498 e seis trocas fácil–difícil. BGE ordinal registrou 0,4034 e três trocas. MiniLM ordinal com área e estrutura registrou 0,4545 e 11 trocas. A regressão Ridge de b em algumas variantes reduziu erro contínuo, mas perdeu Macro-F1 quando convertida em classes. A íntegra do anexo preserva todas as configurações e cortes.

### 2.3 · BERTimbau, mDeBERTa e avaliação interna

O treino ajustou as duas últimas camadas e a cabeça, mantendo as demais congeladas. Usou RTX 2060, AdamW, taxa 3e-5, batch efetivo 16 e até duas épocas. A primeira tentativa mDeBERTa falhou ao redimensionar gradientes FP16. A carga em FP32 com computação em precisão mista permitiu reexecutar.

| Encoder | Janela | Semente | Macro-F1 | Acertos | Erros fácil–difícil |
| --- | ---: | ---: | ---: | ---: | ---: |
| BERTimbau | 256 | 42 | 0,4852 | 66/136 | 7 |
| BERTimbau | 256 | 7 | 0,5123 | 77/136 | 17 |
| BERTimbau | 512 | 42 | 0,4937 | 67/136 | 8 |
| BERTimbau | 512 | 7 | **0,5223** | **78/136** | 16 |
| mDeBERTa | 256 | 42 | 0,4234 | 63/136 | 15 |
| mDeBERTa | 256 | 7 | 0,4254 | 71/136 | 21 |
| mDeBERTa | 512 | 42 | 0,4111 | 72/136 | 21 |

O BERTimbau 512/7 foi a melhor referência observada. O intervalo pareado versus MiniLM foi **−0,0357 a +0,1447** de Macro-F1. Houve seleção de configurações na mesma validação e diferença de entrada, pois o BERTimbau recebeu alternativas. Assim, a diferença não estabelece superioridade independente nem isola o fine-tuning. Em validação temporal interna distinta, BERTimbau 512/42 treinou em 1.667 questões de 2009–2021 e obteve 0,5134 em 134 de 2022, com 74 acertos e 13 trocas graves. Essa rodada recalculou os cortes com o treino interno.

Sobre os vetores do BERTimbau ajustado, a cabeça LinearSVC fez 0,4258, a ordinal 0,4435 e Ridge 0,3934 após conversão em classes, com MAE de b 0,6267 e RMSE 0,7702. Texto, texto com área, texto com estrutura e ambos fizeram 0,4258 / 0,4398 / 0,4320 / 0,4475 com LinearSVC. O resultado **0,5223** pertence à cabeça neural original.

### 2.4 · Assunto, habilidade, reprodução e auditoria de erros

| Encoder com LinearSVC | Texto | + assunto | + assunto e habilidade |
| --- | ---: | ---: | ---: |
| TF-IDF de caracteres | 0,4188 | 0,4062 | 0,4200 |
| MiniLM congelado | 0,4710 | 0,4353 | 0,4923 |
| MiniLM ajustado | 0,4534 | 0,4176 | 0,4710 |
| BERTimbau congelado | 0,4199 | 0,3771 | 0,3991 |
| BERTimbau ajustado | 0,4258 | 0,4208 | 0,4404 |

O MiniLM ajustado com cabeça neural teve 0,4324. O melhor BERTimbau reproduziu 0,5223 por inferência da cabeça original. O MiniLM congelado reproduziu 0,4710 com nova cabeça ajustada sobre vetores verificados. O ganho de 0,0213 na condição C do MiniLM congelado teve IC 95% de **−0,0449 a +0,0916**. Assunto sozinho piorou as configurações testadas. Isso não identifica a causa da queda. A fatia lexical de seis itens com marcadores de recurso é insuficiente para generalizar.

A auditoria global recompôs métricas das predições por ID onde havia evidência. BERTimbau e mDeBERTa acertaram em comum 61 itens, erraram em comum 48 e divergiram em 27. Na classe média, o BERTimbau recuperou 8/42 e o mDeBERTa 1/42. Os 16 erros graves do BERTimbau ocorreram sem truncamento naquela validação. Tercis por área trocariam 30/136 rótulos e 25/136 estavam a até 0,10 de um corte global. São análises de sensibilidade, não validação de um novo rótulo. Não foi possível afirmar quais questões todos os modelos erraram por falta de predições equivalentes para algumas variantes.

## 3 · Previsão de respostas em dados reais externos

**Fonte:** ASSISTments Skill Builder. A cópia corrigida tinha 346.860 linhas e 4.217 IDs de alunos. O filtro deixou 214.417 registros elegíveis na primeira rodada. EdNet KT1 foi investigado documentalmente e ficou sem treino. O ASSISTments tem respostas reais em outro domínio. A correspondência de habilidades e calibração para o ENEM não foi demonstrada.

| Rodada e conjunto avaliado | Comparação principal | Resultado e limite |
| --- | --- | --- |
| Viabilidade inicial, 12.363 eventos | Constante, BKT, SGD congelado e atualizado | AUC 0,5000 / 0,6780 / 0,6922 / 0,6932. Log Loss do SGD 0,5793 → 0,5824. Norma L2 0,1841 e 904 decisões cruzaram 0,5. Alunos separados, com possível sobreposição temporal global |
| Encerramento técnico, 4.899 eventos e 26 alunos finais | Constante, BKT, SGD isolado e híbrido, com versões congeladas e atualizadas | SGD isolado congelado teve AUC 0,6185. BKT + SGD congelado teve Log Loss 0,5795 e a versão atualizada 0,5833. A alteração de parâmetros mudou 31 decisões. Separação adicional por janelas globais |
| Modelo sensível ao item, 4.808 eventos e 26 alunos | Constante, BKT sensível, Elo, Rasch, BKT + Rasch e SGD | SGD congelado 0,6396 AUC e 0,5797 Log Loss. Após dois lotes, 0,6344 e 0,5800. ECE melhorou de 0,0442 para 0,0397. Proxy de dificuldade calculada sem respostas do próprio aluno no treino final |
| Validação TRI e atualização em dez lotes, 4.899 eventos | Constante, taxa por habilidade, BKT, BKT + SGD congelado e duas taxas | Congelado 0,57949 Log Loss. Taxa 0,0002 obteve 0,57928. Taxa 0,002 obteve 0,57975. Ambas alteraram pesos em dez lotes e perderam para a congelada em quatro lotes cada |

O ensaio temporal avaliou taxa de atualização, ajuste de intercepto, critérios de promoção e preservação de snapshot. O híbrido foi útil como hipótese de arquitetura, mas ganhos no filtro local não asseguraram ganho posterior. O DKT ficou como arquitetura investigada sem treino registrado. Atualizar a crença individual do BKT e alterar os pesos globais de SGD foram operações separadas. Nenhuma rodada validou aprendizado contínuo em alunos do Gabaritei.

## 4 · Personalização e política em simulação

### 4.1 · Validação inicial e correção arquitetural

O primeiro protocolo usou **324 trajetórias e 11.664 pontos por método**. Acerto do nível adequado: manter 33,33%, taxa suavizada 34,22%, BKT 33,94%, SGD 32,12%, BKT + SGD 32,42% e Elo 33,43%. O híbrido perdeu 1,80 ponto percentual, com IC de −2,36 a −1,27. A confiança exigia histórico mínimo. Foram testados perfis estáveis, progressão, queda, poucos dados, isolamento de habilidades, recusas, aceites, mudança manual e repetição. A avaliação principal era de um passo em histórico compartilhado.

A correção testou **seis estimadores × duas políticas × dois geradores**. Com persistência, BKT sensível ao item fez 35,44% no gerador logístico e 35,31% no segundo. Superou a regra simples em 1,45 e 0,95 ponto percentual, abaixo do critério de três. O acerto de 61,91% em uma fatia coberta avaliava o nível estimado diretamente, sem a política. Não corresponde ao acerto total da recomendação. Foram conferidos aceite explícito, rejeição de repetição pela família, falhas em itens fáceis e difíceis e abstenção quando falta histórico.

### 4.2 · Busca autônoma, política, margem e refinamento

A busca inicial comparou 14 configurações. A busca de política comparou 18 e incluiu ciclo fechado com aceite sintético de 65%. A busca por margem comparou 16, com teto de falsa mudança no desenvolvimento em ciclo fechado. O refinamento comparou oito, incluindo confirmação em duas estimativas e filtros de suporte posterior. As sementes de seleção e avaliação ficaram separadas. A tabela registra as melhores candidatas por rodada nas condições relatadas, com resultados completos por variante no anexo.

| Rodada | Logístico fixo | Logístico com aceite | Acerto casual fixo | Acerto casual com aceite |
| --- | ---: | ---: | ---: | ---: |
| Busca de política, candidata BKT | 41,80% | 47,34% | 40,45% | 46,10% |
| Busca por margem, candidata | 51,12% | 50,53% | 47,51% | 48,90% |
| Refinamento, referência de margem | 50,97% | 50,34% | 47,91% | 48,41% |
| Refinamento, confirmação de direção | 50,60% | 48,82% | 47,58% | 46,84% |

A confirmação de direção diminuiu falsas mudanças e reversões no ciclo fechado, com menos ofertas e menor acerto total. O filtro posterior forte teve 68,49% e 69,16% de precisão **das ofertas** com cobertura menor. A programação dinâmica do oráculo em escolha fixa estimou teto de cerca de 39,3–39,5% sob a política antiga e 55,97–56,07% sob a nova naquele protocolo. O teto é condicionado à métrica e ao calendário de ofertas. Não vale para todos os desenhos. **A meta de 60% em acerto total não foi atingida nos resultados registrados.** Nenhuma mudança de preferência sem aceite foi observada nas rodadas que mediram essa restrição.

A prova de conceito de integração usou seis itens ENEM reais e dois históricos sintéticos. O primeiro item de nível médio passou de 0,6961 a 0,7029 em um perfil e de 0,2590 a 0,3237 no outro após um acerto. A transformação de dificuldade e as probabilidades foram ilustrativas. Não houve integração produtiva nem piloto com alunos.

## 5 · Testes de qualidade pedagógica, TRI e recuperação do catálogo

| Rodada | Verificações e resultado |
| --- | --- |
| Enriquecimento | 2.971 IDs, procedência, UTF-8, splits e catálogo lateral. 2.411 assuntos inferidos, 2.779 habilidades presentes e 878 referências a recursos. A ablação de TF-IDF e encoders ficou registrada por configuração |
| Amostra independente de rótulos | 300 itens, 75 por área, de 2009 a 2024. Triagem lexical com 279 inconclusivos, 14 compatíveis e sete concorrentes. Revisão dirigida de sete casos sem adjudicação humana. A tentativa de obter microdados nesta rodada falhou |
| Auditoria global | Conferência de hashes, catálogo e splits, tokenizadores, métricas e erros graves. Parte das predições originais de encoders congelados não estava disponível em formato comparável |
| TRI em todas as edições | 2.971 parâmetros a/b/c conciliados nas tabelas, 46 com alerta heurístico, 2.779 habilidades presentes e coincidentes e 192 ausentes. 1.331 itens no filtro preliminar. A origem tabular não certifica assunto, leitura visual ou escala comum |
| Revisão pedagógica integral | Triagem das 2.971, ficha cega de 300, 560 sem assunto, 192 sem habilidade, 55 suspeitos e 18 sugestões. O piloto derivado ficou com 1.329. Sem certificação humana |
| MVP A/B/C/D | 9 / 1.305 / 1.653 / 4. 1.314 do piloto permaneceram em A ou B, sem recuperação de fora. Cinco testes e nove produtos idênticos na reprodução registrada |
| Recuperação multitararefa | 2.032 textos e alvos para o ensaio de classificação de área, 14 itens de recomendação, 12 de demo e 928 com bloqueio em algum uso. Cinco recuperações para recomendação a partir de C/D. Seis testes e 15 produtos idênticos |
| Catálogo adaptativo operacional | 112 prontos, 2.822 condicionais e 37 bloqueados. 41 dos prontos têm faixa relativa dentro da mesma prova e área. 98 novas prontas em relação às 14 anteriores. 69 pendências de revisão curta. 32 pares oficiais de prova e gabarito, oito itens inspecionados visualmente e dois recortes reabertos. Seis testes e 12 produtos idênticos |

Os critérios de bloqueio mudaram conforme o uso. Os **928** da rodada multitararefa não são comparáveis diretamente com os **37** do catálogo operacional. Um arquivo ausente sem confirmação de que é indispensável pode deixar o item condicional para exibição. As notas 0–6 são descrições de evidência. Os direitos de uso e a certificação humana exigem confirmação própria.

## 6 · Falhas, controles e decisão retrospectiva

- Foram preservadas falhas de rede, incompatibilidade BF16, redimensionamento FP16, importação circular em teste, teste de auditoria global com falha, tentativa de PDF indisponível, diferenças de linha CRLF na cópia de reprodução, junção com variação de maiúsculas nos arquivos de 2016 e checagem de distribuição com chaves ausentes. Os logs e relatórios explicam a resolução quando ela foi registrada.
- Os testes unitários e de integração local cobrem hash e adulteração, partições e famílias, classes e matrizes, validação de inferência, estado antes da resposta, separação temporal, alteração de parâmetros, recusa e aceite, catálogo, rubricagem, ligação com gabarito oficial, arquivos visuais e reproducibilidade. O inventário lista os nomes efetivamente identificados.
- A classificação textual atingiu o melhor Macro-F1 observado de **0,5223** em 2023. A atualização global foi demonstrada em dados reais externos, com piora em várias avaliações posteriores. A validação sintética de política chegou a **51,12%** em uma rodada de escolha fixa e **50,53%** em ciclo fechado na busca por margem. Nenhuma dessas linhas estabelece melhora educacional no Gabaritei.
- O estado defensável é **Fase 1 aprovada pelo usuário, Fase 2 com evidências técnicas e política adaptativa em revisão, Fases 3–5 sem execução formal demonstrada**. As ausências de arquivos e de dados estão registradas separadamente das reprovações experimentais.

## 7 · Atualização de 09/11/2026

Foram incorporadas três entregas posteriores ao inventário inicial. Nenhuma delas autoriza promoção da Fase 2.

| Rodada | Resultado e fonte |
| --- | --- |
| Comparação histórica direta com regra simples | Ganhos de 11,81 a 17,06 pp nos quatro cenários, com aumento de falsas mudanças. [Resultados por cenário](evidencias/workspace/dificuldade-adaptativa/correcao_adaptativa/revisao_fase_02/comparacao_regra.json) |
| Revisão operacional do BKT | Auditoria A/B/C/D/E em 1/40/8/63/2.859 itens. A e B somam as 41 faixas utilizáveis. Preparou 22 IDs e os casos A–J sem simulação nesta rodada. [Parecer de cobertura](evidencias/workspace/dificuldade-adaptativa/correcao_adaptativa/revisao_operacional_bkt/06_PARECER.md) |
| Ensaio autorizado com IDs reais | Sete funcionais passaram, C ficou bloqueado e H/I executaram oito cenários com respostas sintéticas. Melhor recorte 57,88% nas oportunidades avaliadas e 22,19% no horizonte. Falsas mudanças cresceram nos oito recortes e 2.304 trajetórias BKT esgotaram a faixa escolhida. [Relatório e métricas](evidencias/workspace/dificuldade-adaptativa/correcao_adaptativa/teste_offline_bkt_margem/RELATORIO.md) |

A [consolidação das decisões](00_RELATORIO_CONSOLIDADO_E_DECISOES.md) explica a diferença entre viabilidade funcional e qualidade, e quais requisitos ainda impedem aprovação.
