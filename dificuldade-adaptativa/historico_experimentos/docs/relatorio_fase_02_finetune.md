# Fase 2 · Fine-tuning de BERTimbau e mDeBERTa

## Dados e protocolo

A rodada validou os hashes da Fase 1 na revisão `7e720fa876beb7249adab2f05d3ecf33ae5a2c51`. O catálogo corresponde ao SHA-256 publicado. Os IDs elegíveis somam 1.801 no treino, 136 na validação e 126 no teste. As classes fácil/média/difícil têm suporte de 601/600/600 no treino e 54/42/40 na validação. O registro da auditoria anterior traz 53/42/31 no teste. A nova rodada verificou a disjunção dos IDs e das famílias entre treino e validação, além da separação temporal. Os 126 itens de 2024 ficaram fora da avaliação desta rodada.

A entrada concatena o enunciado com as alternativas em sua ordem original. As alternativas corretas não são marcadas. Campos TRI, gabarito, habilidade e metadados pedagógicos ficam fora do texto. Todos os itens elegíveis de treino e validação têm enunciado e alternativas. Nenhum traz assets nesse recorte. A triagem lexical de fórmulas e tabelas identificou 43 itens no treino e três na validação. A triagem depende de marcadores textuais.

| Tokenizer | Partição | Acima de 128 | Acima de 256 | Acima de 512 |
|---|---|---:|---:|---:|
| BERTimbau | Treino (1.801) | 1.697 | 774 | 59 |
| BERTimbau | Validação (136) | 131 | 42 | 0 |
| mDeBERTa | Treino (1.801) | 1.760 | 1.220 | 174 |
| mDeBERTa | Validação (136) | 135 | 87 | 7 |

A montagem preserva o texto na origem. A truncagem à direita pode remover alternativas ou parte do enunciado, especialmente no mDeBERTa. Os dois tokenizers processam a mesma entrada textual com contagens diferentes.

## Configuração de treinamento

Foram ajustadas as duas últimas camadas de cada encoder e uma cabeça de três classes. As camadas inferiores permaneceram congeladas. O treino usou RTX 2060, PyTorch 2.11.0+cu128, autocast FP16 com parâmetros FP32, AdamW com learning rate 0,00003, weight decay 0,01 e batch efetivo 16. O orçamento foi de até duas épocas, com preservação do melhor checkpoint pelo macro-F1 de validação e paciência de uma época. A primeira tentativa de mDeBERTa falhou ao tentar redimensionar gradientes FP16. Os parâmetros foram carregados explicitamente em FP32, mantendo o cálculo em precisão mista, e o treino foi reexecutado. [BERTimbau](https://huggingface.co/neuralmind/bert-base-portuguese-cased) · [mDeBERTa](https://huggingface.co/microsoft/mdeberta-v3-base)

Os checkpoints guardam os tensores treinados, o tokenizer e a revisão dos pesos-base. Os pesos-base públicos são recuperados sob demanda. As mudanças nos tensores do encoder foram verificadas contra a inicialização.

## Comparação em 2023

| Modelo | Tokens | Semente | Macro-F1 | Acertos | Fácil–difícil | Treino | Pico GPU |
|---|---:|---:|---:|---:|---:|---:|---:|
| MiniLM + LinearSVC, referência | 128 | — | 0,4710 | 64/136 | 16 | — | — |
| Qwen 0.6B + LinearSVC, referência | 256 | — | 0,4548 | 63/136 | 16 | — | — |
| BGE-M3 + LinearSVC, referência | 256 | — | 0,4350 | 60/136 | 18 | — | — |
| BERTimbau | 256 | 42 | 0,4852 | 66/136 | 7 | 24,0 s | 0,76 GB |
| BERTimbau | 256 | 7 | 0,5123 | 77/136 | 17 | 31,4 s | 0,71 GB |
| BERTimbau | 512 | 42 | 0,4937 | 67/136 | 8 | 37,1 s | 0,76 GB |
| BERTimbau | 512 | 7 | **0,5223** | **78/136** | 16 | 38,5 s | 0,76 GB |
| mDeBERTa | 256 | 42 | 0,4234 | 63/136 | 15 | 53,6 s | 1,47 GB |
| mDeBERTa | 256 | 7 | 0,4254 | 71/136 | 21 | 55,9 s | 1,47 GB |
| mDeBERTa | 512 | 42 | 0,4111 | 72/136 | 21 | 87,8 s | 1,65 GB |

Os valores históricos vêm de `fase02r_comparacao.json`. Para o bootstrap pareado, o classificador MiniLM foi reconstruído com os vetores originais e reproduziu a matriz de confusão. O intervalo exploratório de 95% para a diferença entre BERTimbau 512, seed 7, e MiniLM foi **[-0,0357; +0,1447]**. Todos os intervalos desta rodada cruzaram zero. A seleção entre várias configurações e o número pequeno de itens limitam a interpretação. Os pipelines também usam representações distintas. Os novos modelos recebem alternativas, enquanto a baseline recebia apenas o enunciado. A comparação não isola o efeito do fine-tuning.

As duas sementes do BERTimbau a 512 tokens deram 0,4937 e 0,5223, com 8 e 16 confusões graves. Em 256 tokens, a troca de seed coincidiu com a redução de microbatch de 4 para 2, embora o batch efetivo tenha permanecido 16. O mDeBERTa a 256 tokens apresentou macro-F1 semelhante nas duas sementes, com aumento de 15 para 21 erros graves. O contexto maior não melhorou o macro-F1 desse modelo.

O BERTimbau de maior macro-F1 teve matriz de confusão `[[43,3,8],[15,8,19],[8,5,27]]` na ordem fácil/média/difícil. Classificou corretamente apenas 8 dos 42 itens médios. Em CH, CN, LC e MT, o macro-F1 foi 0,470, 0,489, 0,375 e 0,233, com 39, 32, 39 e 26 itens. O ganho em CN conviveu com regressão em CH e MT frente ao MiniLM. Dois exemplos de Humanas classificados de fácil para difícil foram `gq_6b2d8d9c52f1dc40f69aba12` e `gq_708ed13d3f9bfd2bf3587b2d`. Como os 136 itens couberam em 512 tokens nesse tokenizer, truncagem não explica esses dois erros.

## Formulações e híbridos

Sobre o encoder congelado da melhor execução, LinearSVC multiclasse obteve macro-F1 de 0,4258. A cabeça ordinal obteve 0,4435 com 12 confusões graves. Ridge obteve 0,3934 com 11 confusões graves, MAE de 0,6267 e RMSE de 0,7702 na escala bruta de b. Os alvos extremos de treino foram limitados aos percentis 1 e 99. As métricas de resíduos usam b bruto na validação. Essa comparação mede cabeças alternativas sobre uma representação já ajustada para multiclasse.

A ablação LinearSVC usou os mesmos embeddings e normalizou somente os atributos anexados com estatísticas de treino. Texto isolado, texto + área, texto + estrutura e texto + ambos deram 0,4258, 0,4398, 0,4320 e 0,4475. Área veio do catálogo. Comprimento, contagens e marcadores de fórmulas/tabelas foram extraídos do enunciado. Metadados pedagógicos ficaram fora. Nenhum híbrido superou a cabeça supervisionada do BERTimbau ou a baseline MiniLM.

O melhor checkpoint levou mediana de 6,6 ms em cinco chamadas aquecidas de uma questão curta na RTX 2060, incluindo tokenização e transferência. Essa medição exclui o carregamento inicial. O teste de inferência executou a interface completa e reproduziu previsões do checkpoint salvo. A rodada verificou mudanças em 32 tensores do encoder por treino completo.

## Decisão

No diagnóstico temporal interno, o BERTimbau 512, seed 42, treinou em 1.667 itens de 2009–2021 e validou em 134 de 2022. Os cortes foram recalculados apenas no treino interno, em 0,7979433 e 1,55102. O resultado foi macro-F1 de 0,5134, 74 acertos e 13 confusões graves em 134 questões. Essa execução ficou fora da seleção de 2023 e tem rótulos ligeiramente diferentes.

O BERTimbau de 512 tokens foi o melhor resultado observado, mas o ganho não foi estável o suficiente para promover a arquitetura. O desempenho da classe média, as confusões graves e as perdas por área pesam contra a promoção. O mDeBERTa não apresentou vantagem nas configurações executadas. Recomenda-se manter MiniLM como referência experimental e investigar separação explícita de texto de apoio, comando e alternativas, além da consistência dos tercis TRI por área. A Fase 2 fica aberta para revisão. O teste de 2024 não foi reavaliado.
