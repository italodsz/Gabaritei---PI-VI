# Gabaritei · Ablação de metadados com encoders

## Protocolo

Os três experimentos compartilham 1.801 itens elegíveis de treino até 2022 e 136 itens de validação de 2023. Os cortes vieram da auditoria da Fase 1. A TRI entra somente no rótulo. O script valida hashes, IDs e isolamento de famílias. A parte de 2024 ficou sem pontuação nesta rodada.

Para cada encoder, uma cabeça LinearSVC com seed 42 recebeu os mesmos vetores em três condições. A usa só representação textual, B acrescenta o assunto inferido, C acrescenta assunto e a chave de habilidade por área. O codificador categórico é ajustado no treino, com ausentes explícitos e categorias inéditas ignoradas. Não houve ajuste de hiperparâmetros por resultado de 2024.

MiniLM usa enunciado, pooling médio e limite 128. BERTimbau usa enunciado e alternativas, CLS e limite 512. Essas diferenças impedem atribuir o ranking entre encoders exclusivamente à arquitetura. A comparação de congelado e ajustado dentro de cada família mantém texto, pooling, limite e classificador externo. O checkpoint BERTimbau anterior foi escolhido em 2023, a mesma validação usada aqui. Seu desempenho nesta rodada é confirmação e comparação exploratória, sem independência de seleção.

## Qualidade de metadados

Dos 2.063 elegíveis, todos têm status pedagógico `rule_generated_unreviewed`. Faltam assuntos em 277/1.801 itens de treino, 24/136 de validação e 22/126 de teste. Faltam habilidades em 164 no treino e zero nos demais splits. Essa diferença de cobertura também pode introduzir efeito de período. A matriz oficial valida o domínio dos códigos por área. A correspondência item a item com a tabela oficial ainda precisa de conferência. [Matriz do Inep](https://download.inep.gov.br/download/enem/matriz_referencia.pdf) · [Microdados do Inep](https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem)

Assunto e habilidade são atributos experimentais de catálogo. O desenho não mede sua exatidão nem isola causalmente o impacto de rótulos ruidosos. Para verificar esse impacto, separar uma amostra por ano, área, assunto e confiança, pedir duas revisões independentes, adjudicar divergências e repetir a ablação com metadados revisados. Não houve fine-tuning para classificar assunto ou habilidade.

Nenhum item elegível registra assets. A análise por palavras como figura, gráfico, tabela e imagem é uma triagem lexical, sem comprovar dependência visual. Os modelos recebem texto e não interpretam figuras. O JSON contém os denominadores e os erros nessa fatia.

## Reprodução

Use a base auditada e o ambiente PyTorch 2.11.0+cu128, Transformers 5.5.0, scikit-learn 1.8.0, NumPy 2.4.3. Da pasta do módulo execute `python -B -m enriquecimento.ablar_encoders`. O script precisa de `results/fase02r_minilm.npz` e seu JSON, além do checkpoint `results/ft_bert_512_7`. Os pesos-base públicos são resolvidos pelas revisões fixadas. O README do módulo documenta como gerar os vetores e os checkpoints anteriores.

## Resultados e decisão

| Encoder e cabeça LinearSVC | A. Texto | B. + assunto | C. + habilidade |
|---|---:|---:|---:|
| MiniLM congelado | 0,4710 | 0,4353 | 0,4923 |
| MiniLM ajustado | 0,4534 | 0,4176 | 0,4710 |
| BERTimbau congelado | 0,4199 | 0,3771 | 0,3991 |
| BERTimbau ajustado | 0,4258 | 0,4208 | 0,4404 |
| TF-IDF, referência anterior | 0,4188 | 0,4062 | 0,4200 |

O checkpoint BERTimbau com sua cabeça neural original reproduziu 0,5223 exatamente por inferência. A configuração histórica usou duas camadas ajustadas, seed 7, 512 tokens, LR 3e-5, microbatch 2 e batch efetivo 16. O melhor checkpoint foi da primeira época. O resultado da cabeça LinearSVC sobre os mesmos vetores é outro experimento. Com cabeça LinearSVC e entradas iguais, o ajuste melhorou o BERTimbau textual em cerca de 0,006, sem evidência de ganho robusto.

O MiniLM congelado reproduziu 0,4710 ao treinar novamente o LinearSVC sobre vetores verificados por SHA-256 e ordem dos IDs. O MiniLM ajustado usou duas camadas treináveis, seed 42, 128 tokens, LR 3e-5, microbatch 4 e duas épocas. Sua cabeça neural ficou em 0,4324, e o LinearSVC textual caiu para 0,4534. Os vetores de referência foram gerados em CPU. Os vetores ajustados foram extraídos com CUDA e precisão mista, pequena diferença de implementação. O resultado vale para esta configuração de ajuste.

Qwen 0.6B (0,4548) e BGE-M3 (0,4350) foram conferidos no JSON histórico. Ambos usaram encoder congelado, limite 256, LinearSVC e os mesmos itens de validação. Seus vetores e classificadores não foram reexecutados nesta rodada.

Assunto sozinho piorou todos os encoders. A condição C melhorou o MiniLM congelado em 0,0213, com IC pareado de 95% de −0,0449 a +0,0916. Todos os intervalos da condição C cruzaram zero. A amostra lexical de seis itens foi pequena para atribuir erros a elementos visuais. Em C, MiniLM congelado errou quatro e BERTimbau ajustado errou dois desses seis. Todos os denominadores e as matrizes estão no JSON.

**Recomendação para investigar.** Preserve BERTimbau com a cabeça original como melhor referência observada e MiniLM congelado como referência leve e candidato para repetir a ablação com rótulos revisados. A seleção entre arquiteturas exige avaliação independente. A hipótese sobre assunto e habilidade segue em aberto. O relatório anterior do catálogo descreve a linha de base TF-IDF. Cinco testes de consistência e reconstrução passaram.
