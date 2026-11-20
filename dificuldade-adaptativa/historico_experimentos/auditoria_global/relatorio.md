# Gabaritei PI VI · Auditoria técnica global

## Resumo executivo

**Prioridade técnica: arquitetura B, relevância semântica + TRI observada + modelo individual, como hipótese de piloto.** A arquitetura A continua como controle e fallback de catálogo. A C entra depois, como ablação para itens sem TRI e atualizações globais. Nenhuma arquitetura foi validada em estudantes do ENEM. Esta entrega recalcula resultados salvos e inspeciona tokenizers. Não treina modelos.

O catálogo tem 2.971 itens, mas só 2.063 são elegíveis no recorte textual. Os 136 itens da validação de 2023 são insuficientes para atribuir causa a diferenças pequenas. A classe média é difícil tanto para BERTimbau como para mDeBERTa. O melhor BERTimbau não truncou nenhuma questão dessa validação, inclusive os 16 erros graves. A perda de contexto existe nos demais encoders e precisa de ablação pareada. Qualidade de conteúdo, qualidade de rótulo e efeito do modelo são fatores distintos.

## Artefatos e integridade

O SHA-256 de `questions.jsonl` é `22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5`. Os hashes dos arquivos da revisão `7e720fa876beb7249adab2f05d3ecf33ae5a2c51` coincidiram com a auditoria anterior. Os splits elegíveis contêm 1.801/136/126 itens, de 2009–2022/2023/2024. IDs são disjuntos. Os arquivos de split correspondem ao catálogo. A Fase 1 também verificou famílias e texto normalizado. Essa triagem tem alcance limitado para duplicatas semânticas. O teste de 2024 já foi consultado em rodadas anteriores e não foi pontuado nem usado para seleção aqui.

O inventário em `resultados.json` registra arquivos ZIP presentes, contagem de entradas, SHA-256 e teste de leitura. Os checkpoints BERTimbau e mDeBERTa e os caches MiniLM, Qwen e BGE foram verificados contra os hashes registrados. Para os dois primeiros, as predições completas de 2023 permitem recálculo e pareamento. Para os três encoders congelados e as ablações, os artefatos locais desta comparação contêm métricas e vetores, mas faltam predições completas equivalentes e cabeças preservadas para cada variante. Ajustar novamente uma cabeça seria novo treinamento e ficou fora. A variante MiniLM da rodada inicial tem um pipeline salvo, mas pode diferir no protocolo. Ela não foi tratada como prova do pareamento desta rodada.

## Matriz de completude e TRI

`completude.csv` contém um registro por item. As colunas `status_` separam validade formal, preenchimento não verificado, ausência, inconsistência e não aplicabilidade. A competência é derivável quando o código por área é válido; a atribuição pedagógica permanece pendente. Detecção de fórmulas, tabelas e gráficos é lexical e não confirma qualidade de renderização ou dependência visual. A matriz não trata a falta de figura como erro de todo item. Há 2.969 itens com enunciado, cinco opções e gabarito coerente com as opções. Desses, 2.239 também têm assunto e habilidade preenchidos. Nenhum está completo se disciplina explicitamente identificada e histórico individual forem obrigatórios. Os recursos catalogados aparecem em 878 itens, fora do recorte textual elegível. A dependência visual indisponível não foi certificada item a item. A amostra cega de 300 itens anterior fica disponível para revisão humana, com 560 assuntos e 192 habilidades ausentes no catálogo total.

Os três parâmetros TRI estão presentes em todos os itens. A proveniência aponta para tabelas e ligações do Inep, mas não houve conferência independente das 2.971 associações, parâmetros e escalas por edição. Portanto, **2.971 completos e zero certificados individualmente nesta rodada**. As distribuições por área e ano estão no JSON. `a` descreve discriminação, `b` localização de dificuldade, `c` assíntota inferior. A TRI descreve características do item numa escala psicométrica. Complexidade cognitiva, percepção e probabilidade individual são construtos distintos. O extremo `b=61,05459` com baixa discriminação já havia sido sinalizado. A origem do método de calibração do ENEM está na nota do Inep. O método e a escala exatos para cada registro desta compilação dependem da ligação ao microdado original. [Nota técnica TRI do Inep](https://download.inep.gov.br/educacao_basica/enem/nota_tecnica/2011/nota_tecnica_tri_enem_18012012.pdf) · [Microdados do Inep](https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem)

Os cortes globais foram reproduzidos a partir do treino. A sensibilidade descritiva a tercis por área, também calculados só no treino, mudou 30/136 rótulos de 2023. O primeiro corte de MT foi 1,6446, acima do segundo corte de LC, 1,1241. Isso mostra que a escolha operacional muda o alvo. Não demonstra que as escalas sejam incompatíveis. Em 2023, 25/136 itens estão a até 0,10 de um corte global, incluindo 13/42 médios. Nenhuma categoria foi alterada.

## Entradas, treinamento e comparação de modelos

| Modelo | Entrada efetiva e ajuste | Macro-F1 2023 | Evidência |
|---|---|---:|---|
| BERTimbau Base | Enunciado e alternativas, tokenizer próprio 512, CLS, duas últimas camadas e cabeça neural, seed 7, LR 3e-5, checkpoint da época 1 | 0,5223 | Recalculado de 136 predições, 78 acertos |
| MiniLM | Enunciado, tokenizer multilíngue 128, média mascarada, encoder congelado, LinearSVC seed 42 | 0,4710 | Métrica anterior e cache verificado |
| Qwen 0.6B | Enunciado, tokenizer próprio 256, último token válido normalizado, congelado, LinearSVC seed 42 | 0,4548 | Métrica anterior e cache verificado |
| BGE-M3 | Enunciado, tokenizer próprio 256, primeiro token normalizado, congelado, LinearSVC seed 42 | 0,4350 | Métrica anterior e cache verificado |
| mDeBERTa | Enunciado e alternativas, tokenizer próprio 256, CLS, duas últimas camadas e cabeça neural, seed 7, LR 3e-5 | 0,4254 | Recalculado de 136 predições, 71 acertos |
| MiniLM + metadados | Mesmo encoder congelado, assunto de regra e código de habilidade por área, one-hot do treino | 0,4923 | Ablação anterior |
| TF-IDF + LinearSVC | Enunciado, trigramas a pentagramas de caracteres, vocabulário ajustado no treino | 0,4188 | Referência anterior |

Os scripts usam TRI exclusivamente como alvo ou em análise de sensibilidade. O texto pode conter fórmulas e menções visuais, mas nenhum desses encoders recebeu imagem, gabarito, competência ou TRI como entrada. Os híbridos estruturais anteriores acrescentaram área, comprimento, dígitos e marcadores de fórmulas e recursos, com padronização no treino. A rodada híbrida variou também a escala dos embeddings, um confundidor para interpretar o efeito dos atributos. A ablação posterior acrescentou one-hot sem reescalar os vetores. Os tempos, dimensões, revisões, batches e memória disponíveis estão nos JSON e configurações originais incluídos no pacote.

## Erros, classe média e truncamento

O pareamento completo é BERTimbau versus mDeBERTa. Ambos acertaram 61 itens, ambos erraram 48 e só um acertou 27. Os IDs e atributos estão no CSV e no JSON. Nenhuma evidência permite dizer quais **todos** os modelos erraram. Em 42 médias, BERTimbau previu 15 fáceis, oito médias e 19 difíceis. mDeBERTa previu 18 fáceis, uma média e 23 difíceis. Isso confirma dificuldade compartilhada de recuperar a classe, sem provar erro no rótulo. Os 42 itens eram todos de 2023; as distribuições de área, TRI, marcadores, comprimento e metadados estão na tabela individual. Quatorze dos 24 itens sem assunto foram acertados pelo BERTimbau, frente a 64 de 112 com assunto. O campo não entrava nesse modelo, e as taxas são próximas. A amostra com marcadores de fórmula ou visual é pequena.

O BERTimbau trocou oito fáceis por difíceis e oito difíceis por fáceis. Quatro erros graves estão a até 0,10 de algum corte. Nenhum sofreu truncamento. Os 16 enunciados e predições mDeBERTa estão em `erros_graves.csv`. A causa individual ficou inconclusiva. Proximidade de corte, estatística de item e semântica do enunciado podem contribuir, sem confirmação pedagógica.

| Tokenizer | Truncadas de 136 | Última interrogação do enunciado fora da janela | Marcador matemático perdido | Alternativas não mantidas integralmente |
|---|---:|---:|---:|---:|
| MiniLM | 110 | 23 | 2 | Não entravam |
| Qwen | 43 | 6 | 0 | Não entravam |
| BGE | 28 | 3 | 0 | Não entravam |
| BERTimbau | 0 | 0 | 0 | 0 |
| mDeBERTa | 87 | 9 | 2 | 372 |

Os tokenizers reais e o limite de cada execução foram usados. As contagens por item estão no CSV pareado. O último ponto de interrogação e os símbolos são proxies, sem equivalência a comando ou fórmula completos. O mDeBERTa errou 47/87 truncadas e 25/49 não truncadas. É associação descritiva pequena, sem causalidade. Para MiniLM, Qwen e BGE faltam as predições comparáveis por item nesta rodada. Os dados não sustentam atribuir o ranking a truncamento. O intervalo histórico do ganho BERTimbau versus MiniLM foi de −0,0357 a +0,1447, já com seleção em 2023.

## Alternativas e integração

| Opção | Papel e dados | Personalização, atualização e custo |
|---|---|---|
| Classificação textual | Texto para classe, alvo de b | Fallback de catálogo. Baixo com TF-IDF, médio com encoder. Reajuste periódico |
| Ordinal | Mesmo texto e classes ordenadas | Pode reduzir erros graves. Sem personalização. Exige medir trade-off com macro-F1 |
| Regressão b | Texto para alvo contínuo com TRI | Exige tratar extremos no treino e avaliar MAE/RMSE; estudos Ridge anteriores perderam F1 |
| Texto + metadados | Inclui assunto e habilidade com procedência | Depende de rótulos revisados. Ganhos prévios incertos |
| TRI observada | Usar item com vínculo oficial verificável | Barata, preserva informação psicométrica; ainda precisa estimativa individual |
| TRI ausente | Estimativa textual com indicador de origem | Não intercambiar classe e b contínuo. Usar calibração e margem de incerteza |
| BKT | Respostas ordenadas e habilidade | Estado individual barato; atualização de estado distinta de reajuste global |
| Logística incremental / SGDClassifier | Estado, histórico e item para probabilidade | Treino leve e atualização efetiva. Exige monitoramento, calibração e rollback |
| IRT/Rasch | Item calibrado e respostas para estimar proficiência | Interpretação clara; precisa escala comum e eventos suficientes |
| Modelos de conhecimento individual | BKT sensível, Elo, DKT e variantes | BKT/Elo são leves. DKT demanda sequências maiores. Comparações sintéticas não validam ENEM |
| Sistema híbrido | Relevância, item, estado, probabilidade e preferência | Maior potencial de extensão e complexidade; exige contrato, validação e eventos reais |

| Arquitetura | Avaliação |
|---|---|
| A. Relevância + classe textual | Implementação inicial simples e evidência de F1 de item. Personalização limitada. Sem atualização individual por si só |
| B. Relevância + TRI observada + modelo individual | Hipótese prioritária de piloto. Menor dependência de um classificador de item. Exige escala, catálogo e respostas reais. Estado individual pode mudar a cada resposta |
| C. Híbrido com TRI estimada e atualização global | Candidata de extensão se a ablação mostrar valor. Mais custo e superfícies de deriva. Requer promover versões apenas após avaliação temporal e preservar rollback |

O contrato proposto recebe candidatos `question_id`, relevância e revisão/hash. O catálogo fornece área, habilidade com procedência e TRI observada ou fallback marcado. O módulo individual usa apenas eventos anteriores, retorna probabilidade, incerteza, dificuldade sugerida e versão. A escolha explícita prevalece. O histórico registra aceites e recusas. A fonte semântica pode variar, inclusive recuperação lexical. Qwen e reranker são uma linha de trabalho de Ítalo, não uma integração validada aqui.

## Aprendizado contínuo

O JSON original do ASSISTments registra 12.363 eventos de avaliação. AUC de constante, BKT, SGD congelado e atualizado foi 0,5000/0,6780/0,6922/0,6932. Log Loss do SGD passou de 0,5793 a 0,5824 e Brier de 0,1968 a 0,1979. Houve alteração de parâmetros e 904 decisões cruzaram 0,5. A rodada temporal posterior separou também janelas globais e mostrou que passar pelo filtro local não impede piora no período posterior. Isso demonstra capacidade de treinamento incremental, sem melhoria garantida. Falta medir esquecimento em coortes antigas e deriva por área. O ENEM local é catálogo. Um piloto deve registrar aluno pseudonimizado, item e família, habilidade validada, timestamp, ordem, primeira tentativa, acerto, assistência, candidatos apresentados, escolha, sugestão, aceite e versões. Prever antes da resposta, avaliar versões em sombra e comparar em duas ou mais janelas antes de promover. [ASSISTments oficial](https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data/skill-builder-data-2009-2010)

## Reprodução e evidências pendentes

Use Python 3.14, NumPy 2.4.3, Transformers 5.5.0 e scikit-learn 1.8.0. A cópia auditada fica em `base-oficial/Dataset/base_trabalho`. O script usa o cache local dos tokenizers congelados nas revisões registradas e os tokenizers dos checkpoints treinados. Os caches NPZ e deltas podem ser recuperados dos artefatos anteriores quando disponíveis. Os ZIPs grandes, o dataset e os caches não são duplicados nesta entrega.

```powershell
$env:HF_HOME=(Join-Path (Get-Location) 'dificuldade-adaptativa/.hf-cache')
$env:HF_HUB_OFFLINE='1'
python -B dificuldade-adaptativa/auditoria_global/auditar.py base-oficial/Dataset/base_trabalho
python -B -m unittest discover -s dificuldade-adaptativa/auditoria_global -v
```

O primeiro teste detectou colisão de nomes entre os campos de status e de identificação no CSV. Corrigi os nomes com o prefixo `status_` e reexecutei. Os logs preservam a falha e a correção. Faltam predições completas das cabeças congeladas, vínculo oficial conferido por item, validação visual, rótulos humanos e respostas do piloto ENEM. O plano separado especifica intervenções, critérios, riscos e dependências.
