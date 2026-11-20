# Fase 2 reformulada · Seleção de arquitetura

## Protocolo

A referência é o MiniLM + LinearSVC da Fase 2 anterior. O resultado histórico de 2024 foi macro-F1 de 0,5284 e 67 acertos em 126 questões. Essa partição já foi consultada. A investigação usa 1.801 questões elegíveis até 2022 para ajuste e 136 de 2023 para seleção. A leitura dos registros de 2024 para uma nova avaliação fica condicionada à qualificação de uma candidata. A revisão dos dados e os hashes foram comparados com o registro da Fase 1.

Antes de gerar os embeddings, o protocolo fixou checkpoints, revisões, limites de entrada, critérios de seleção e bootstrap. Uma candidata precisa ganhar pelo menos 0,02 de macro-F1 na validação, apresentar limite inferior positivo no intervalo pareado de 95%, evitar aumento nas confusões direto entre fácil e difícil e limitar a perda de macro-F1 por área a 0,10. O bootstrap estratifica por classe e reamostra as mesmas questões para os dois modelos. Os intervalos são exploratórios, sem ajuste pelas múltiplas comparações, e a amostra é pequena.

Todos os encoders estão congelados. Qwen usa o último token válido e BGE usa o primeiro token, com normalização L2. MiniLM usa a média dos tokens válidos, conforme a baseline anterior. Qwen 0.6B e BGE foram configurados com teto operacional de 256 tokens para CPU. A comparação entre encoders representa esses pipelines completos, incluindo diferenças de tokenização, pooling e limite. Os atributos híbridos incluem área ou contagens do texto. A padronização foi ajustada só no treino e aplicada a todas as colunas nos híbridos. Assim, as diferenças dos híbridos em relação à baseline também refletem a mudança de escala das coordenadas.

O LinearSVC prevê três classes. A formulação ordinal usa duas regressões logísticas para estimar os limiares ordenados, com correção quando as saídas se cruzam. A regressão Ridge usa `b` como alvo e converte as estimativas em classes com os cortes fixados. Para Ridge, 36 alvos do treino ficaram fora dos percentis 1 e 99, `[-0,64144; 3,8538]`, e foram limitados a esse intervalo. O MAE de validação usa os valores originais. Nenhum parâmetro TRI entra como preditor.

## Diagnóstico da baseline

O MiniLM reproduziu macro-F1 de 0,4710 em 2023. Houve 16 confusões diretas fácil–difícil em 136 itens. O limite de 128 tokens truncou 1.427 de 1.801 itens de treino e 110 de 136 de validação. Na validação, foram 59 erros em 110 itens truncados e 13 em 26 sem truncamento. Entre as 30 questões de validação com ponto de interrogação, 23 tinham o último ponto de interrogação além da janela. Isso evidencia perda de texto potencialmente relevante. A comparação de taxas entre esses grupos não isola o efeito causal do truncamento.

Os campos `assets` e `descriptions` estavam vazios no treino e na validação elegíveis. As expressões usadas para identificar fórmulas e referências a figuras, tabelas ou gráficos sinalizaram apenas dois e um itens de validação, respectivamente. Essas contagens servem como triagem lexical e são insuficientes para estimar a dificuldade de itens dependentes de recursos visuais.

No treino, Matemática tem 195 de 274 itens difíceis, enquanto Linguagens tem 282 de 548 itens fáceis. Os tercis globais equilibram o total do treino, mas deixam células pequenas por área. Na validação, Matemática tem dois itens fáceis em 26. As métricas por área são sensíveis a poucos erros. A habilidade estava ausente em 164 de 1.801 itens de treino. Os campos pedagógicos estavam marcados como gerados por regras e sem revisão em todas as linhas avaliadas. Eles ficaram fora das entradas.

## Viabilidade de modelos maiores

A máquina tem 20 CPUs lógicas, cerca de 31,8 GiB de RAM e uma RTX 2060 de 6 GiB. O PyTorch inicial, 2.11.0+cpu, reportou CUDA indisponível. Uma instalação isolada do PyTorch 2.11.0+cu128 ativou a GPU e viabilizou a geração em FP16 para Qwen 0.6B e BGE-M3. Os pesos de modelos de 4B e 8B demandariam aproximadamente 8 e 16 GB em 16 bits antes de alocar memória para inferência. Ambos ficaram pendentes nesta rodada. A alternativa é executar versões quantizadas ou usar uma GPU com memória suficiente, registrando a nova configuração. [Qwen 4B](https://huggingface.co/Qwen/Qwen3-Embedding-4B) · [Qwen 8B](https://huggingface.co/Qwen/Qwen3-Embedding-8B)

| Encoder e dispositivo | Dimensão | Limite usado | Truncadas em 2023 | Tempo de codificação treino + validação | Mediana em texto curto | RSS amostrado |
|---|---:|---:|---:|---:|---:|---:|
| MiniLM, CPU | 384 | 128 | 110/136 | 61,04 s | 19,1 ms | 1,05 GB |
| Qwen 0.6B, CUDA | 1.024 | 256 | 43/136 | 44,12 s | 59,3 ms | 2,83 GB |
| BGE-M3, CUDA | 1.024 | 256 | 28/136 | 18,84 s | 17,9 ms | 2,91 GB |

A latência curta é a mediana de cinco chamadas aquecidas do encoder para o mesmo enunciado, incluindo tokenização e transferência da saída. Ela não inclui carregamento do checkpoint. Os tempos são observações desta máquina, com cargas concorrentes, e misturam CPU e GPU. O RSS é amostrado ao fim dos lotes, e os JSON dos encoders CUDA registram também o pico alocado pelo PyTorch na GPU.

A primeira tentativa do MiniLM falhou por resolução de rede em uma consulta da biblioteca. A execução com os pesos já presentes e o modo offline concluiu. A tentativa inicial do Qwen em CPU falhou na conversão de BF16 para NumPy. A saída passou a ser convertida para FP32 antes de ser gravada. A execução CPU corrigida foi interrompida após confirmar progresso na GPU. Os logs das tentativas foram preservados.

## Resultados de validação

Foram avaliadas 36 configurações em 136 itens de 2023. As matrizes de confusão, precisão, recall, F1 e suporte por classe e área estão no JSON. O CSV reúne o ranking e as métricas principais.

| Encoder com LinearSVC e somente embeddings | Macro-F1 | Acurácia | Erro ordinal médio | Confusões fácil–difícil |
|---|---:|---:|---:|---:|
| MiniLM | 0,4710 | 64/136 | 0,6471 | 16/136 |
| Qwen 0.6B | 0,4548 | 63/136 | 0,6544 | 16/136 |
| BGE-M3 | 0,4350 | 60/136 | 0,6912 | 18/136 |

Qwen obteve macro-F1 de 0,477 em Ciências da Natureza e 0,473 em Linguagens, frente a 0,335 e 0,337 do MiniLM. Em Humanas, caiu de 0,538 para 0,301. BGE obteve 0,496 em Matemática, frente a 0,308 do MiniLM, mas perdeu desempenho agregado. Os intervalos pareados para a diferença de macro-F1 contra MiniLM cruzaram zero tanto para Qwen (`[-0,1025; 0,0875]`) quanto para BGE (`[-0,1264; 0,0565]`). Esses resultados sustentam a existência de diferenças por recorte, com incerteza sobre sua estabilidade.

| Configuração de interesse | Macro-F1 | Erro ordinal médio | Fácil–difícil | MAE bruto de b |
|---|---:|---:|---:|---:|
| MiniLM + área + estrutura, ordinal | 0,4545 | 0,6324 | 11/136 | — |
| Qwen só embeddings, ordinal | 0,4498 | 0,5956 | 6/136 | — |
| BGE só embeddings, ordinal | 0,4034 | 0,6176 | 3/136 | — |
| Qwen + estrutura, Ridge | 0,4235 | 0,6838 | 15/136 | 0,7748 |
| MiniLM só embeddings, Ridge | 0,3442 | 0,6544 | 4/136 | 0,6604 |

O melhor híbrido foi MiniLM ordinal com área e estrutura. Nenhum híbrido ou regressor superou a baseline em macro-F1. A formulação ordinal reduziu os erros extremos em alguns casos, com perda de macro-F1. A redução de truncamento com Qwen e BGE, por si só, também não se traduziu em ganho agregado. Os resultados sugerem investigar uma representação que separe texto de apoio, comando e alternativas e uma auditoria pedagógica dos rótulos por área antes de trocar o encoder. Essa hipótese ainda requer experimento controlado.

## Decisão e evidências

Nenhuma candidata cumpriu o protocolo de promoção e nenhuma atingiu a meta exploratória de 0,60. O MiniLM anterior fica como referência experimental. O comando de finalização foi executado e encerrou sem avaliar novamente 2024 nem gravar uma nova candidata. O pipeline e a interface de inferência anteriores foram preservados.

Os três testes da rodada passaram. Eles verificam a invariância das entradas híbridas a mudanças de TRI e habilidade, as saídas da formulação ordinal, as métricas de erro ordinal e o comportamento do bootstrap pareado. Consulte `results/fase02r_testes.log`, `results/fase02r_comparacao.log` e `results/fase02r_decisao.log`. As tentativas de execução em CPU, os metadados dos encoders e os logs CUDA também estão no pacote.
