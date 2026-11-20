# 04 · Comparação e inventário de evidências

## Comparação histórica preservada

Os valores vêm de [comparacao_regra.json](../revisao_fase_02/comparacao_regra.json) e do [log de execução](../revisao_fase_02/execucao.log). O confronto congelou `bkt_politica_1_4_0.09` e reutilizou a regra de taxa de acerto suavizada ((acertos+1)/(n+2)), com política de persistência histórica. Usou as seis sementes 479, 487, 491, 499, 503 e 509. Cada cenário tem 486 trajetórias de 36 passos, totalizando 17.496 oportunidades por método. Os ICs de 95% usam 2.000 reamostragens pareadas por trajetória. Em ciclo fechado, os métodos compartilham sorteios, mas decisões aceitas podem mudar os históricos.

| Cenário | Acerto regra → candidata | Ganho e IC 95%, pp | Falsas mudanças regra → candidata | Desafio fora da faixa regra → candidata |
| --- | --- | --- | --- | --- |
| Logístico fixo | 34,06% → 51,12% | +17,06 [14,60; 19,48] | 5,08% → 22,96% | 66,97% → 53,24% |
| Logístico com aceite | 36,04% → 50,53% | +14,49 [12,60; 16,36] | 2,89% → 9,94% | 62,85% → 53,69% |
| 3PL fixo | 34,49% → 47,51% | +13,02 [10,70; 15,18] | 4,08% → 22,43% | 59,77% → 47,25% |
| 3PL com aceite | 37,09% → 48,90% | +11,81 [10,02; 13,67] | 2,49% → 9,88% | 57,33% → 47,02% |

A cobertura de histórico mínimo foi de 55,56% para a regra e 77,78% para a candidata. O mínimo usado foi diferente. A candidata nunca alterou o nível sem aceite na simulação. As falsas mudanças usam como denominador somente ocasiões em que o nível escolhido já era o adequado. O ganho tem respaldo nos cenários consultados, com o custo de mais sugestões indevidas. Sementes reutilizadas, denominadores, cadências distintas e ausência de alunos reais impedem concluir superioridade pedagógica ou atribuir o ganho exclusivamente ao BKT. A meta de 60% de acerto total ficou pendente.

## O que foi localizado

Os caminhos abaixo são relativos à raiz do workspace e foram conferidos na cópia local. Os comandos históricos documentados são referência e não foram executados nesta revisão.

| Artefato e caminho | Código, pesos e execução | Dados, divisão e resultado |
| --- | --- | --- |
| `base-oficial/Dataset/base_trabalho/data/questions.jsonl` e `ids_elegiveis.json` | Base original e filtro histórico. Revisão `7e720fa876beb7249adab2f05d3ecf33ae5a2c51` e hash normalizado no JSON desta auditoria | 2.971 itens. Recorte textual 1.801 treino, 136 validação, 126 teste já consultado |
| `dificuldade-adaptativa/catalogo_adaptativo_operacional/` | `gerar.py`, prontos JSONL, dificuldade CSV, auditoria CSV, contrato de eventos e logs históricos | 112 prontos, 41 com faixa local. Não contém eventos reais de estudantes |
| `dificuldade-adaptativa/results/ft_bert_512_7/` | `delta.pt`, `execucao.json`, `metricas.json`, tokenizer, log `results/ft_bert_512_7.log`. SHA-256 do delta conferido e igual ao registrado, `c8026a554b5857dde412fc1a8ee69e799ec541104df502fc06e2da9aecbb578b` | ENEM 2009–2022 e validação 2023. Macro-F1 0,5223, 78/136. Cabeça neural e duas camadas ajustadas. O delta é parcial, requer encoder-base |
| `dificuldade-adaptativa/models/fase_02.joblib` e `results/fase_02_final.json` | Pipeline salvo da Fase 2 de classificação. Há também caches congelados em `results/fase02r_*.npz` | Evidência de classificação do item. Não serve como checkpoint do BKT |
| `dificuldade-adaptativa/viabilidade/fechamento.py`, `fechamento.json`, `fechamento.log` | Ajuste de BKT externo e SGD com janelas separadas. Quatro parâmetros BKT persistidos em JSON e coeficientes das versões SGD registrados. Sem checkpoint integrado da candidata | ASSISTments corrigido. 13.905 eventos/297 alunos no treino e 4.899/26 no teste, com duas janelas de atualização e duas de validação separadas |
| `dificuldade-adaptativa/correcao_adaptativa/real.py`, `reais.json`, `reais.log` | BKT sensível com parâmetros herdados. SGD ajustado e atualizado. Métricas e mudanças registradas, sem arquivo serializado de um recomendador integrado | ASSISTments. 13.804 eventos/297 alunos no treino, 4.808/26 no teste após deduplicação. SGD congelado AUC 0,6396 e Log Loss 0,5797. Atualizado 0,6344 e 0,5800 |
| `dificuldade-adaptativa/validacao_tri/incremental.py`, `incremental.json`, `incremental.log` | Valores antes/depois de pesos globais em JSON, dez lotes por taxa. Ensaio separado | ASSISTments 13.905 eventos/297 alunos no treino e 4.899/26 na avaliação temporal. Mudança de pesos comprovada, ganho inconsistente |
| `dificuldade-adaptativa/correcao_adaptativa/busca_margem.py`, `busca_margem.json`, `busca_margem.log` | Busca de 16 configurações, com configuração vencedora persistida em JSON. Executa o estimador congelado e a política, sem novo fit | Desenvolvimento em três sementes distintas do teste. Dois geradores e dois regimes. Política selecionada por busca, sem evidência de aprendizagem dos parâmetros |
| `dificuldade-adaptativa/correcao_adaptativa/revisao_fase_02/` | `comparar_regra.py`, `comparacao_regra.json`, `execucao.log`. O script verifica que métricas históricas comuns da candidata permanecem iguais | Confronto simulado com regra simples. Números da tabela acima |
| `dificuldade-adaptativa/viabilidade/integracao.py` e `catalogo_adaptativo_operacional/contrato_eventos_resposta.json` | Prova de conceito histórica por ID com outro arranjo, BKT + SGD, e contrato de resposta. Documentação local do módulo de Ítalo em `recuperacao_catalogo/fontes/` | Seis itens ENEM e dois históricos sintéticos no ensaio. Ausente teste de contrato com a candidata exata e o serviço do Ítalo |

O `assistments.csv` existe na raiz e seu hash confere com o registrado, `162ef8d2d28bcbfea6591a282994062bd8d5eaa00636544292a0d268dca6e5da`. Esta revisão não leu os eventos para treinar ou avaliar.

### Comandos históricos recuperáveis

Da raiz, constam `python -B dificuldade-adaptativa/viabilidade/fechamento.py assistments.csv base-oficial/Dataset/base_trabalho`, `python -B dificuldade-adaptativa/correcao_adaptativa/real.py assistments.csv` e `python -B dificuldade-adaptativa/validacao_tri/incremental.py assistments.csv`. Eles **podem treinar** e estão fora da execução atual.

Para o BERTimbau, o README permite reconstruir o comando a partir da pasta `dificuldade-adaptativa`: `python -B -m experiments.fase_02_finetune ../base-oficial/Dataset/base_trabalho bert 94d69c95f98f7d5b2a8700c420230ae10def0baa --batch 2 --limit 512 --seed 7 --epochs 2`. Trata-se da reprodução documentada, sem alegar acesso à linha literal da sessão original. A busca e a comparação em simulação estão indicadas no plano de execução.
