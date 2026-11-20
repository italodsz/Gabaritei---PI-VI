# Fase 2 · Dificuldade das questões

## Execução autorizada · Resultado para revisão

O experimento preliminar foi reexecutado antes de adicionar o MiniLM. Validação, teste, sensibilidade, cortes e seleção coincidiram exatamente com o JSON preliminar. Os resultados dessa reprodução estão separados do experimento ampliado.

O modelo escolhido foi MiniLM multilíngue congelado com LinearSVC treinado pela equipe. O encoder usa média dos tokens válidos e limita a entrada a 128 tokens. Treino de 2009–2022, validação de 2023 e teste de 2024 usaram os mesmos IDs elegíveis para todos os candidatos. O TF-IDF foi ajustado apenas no treino. O MiniLM foi usado como transformação fixa, e só o enunciado entrou nos classificadores. A escolha pelo maior macro-F1 na validação e o salvamento do pipeline ocorreram antes de carregar os registros do teste. O teste de 2024 já havia sido consultado no experimento preliminar e não constitui uma avaliação inteiramente cega.

| Modelo | Macro-F1 validação (136) | Acurácia validação | Macro-F1 teste (126) | Acurácia teste |
|---|---:|---:|---:|---:|
| Classe majoritária | 0,1895 | 0,3971 | 0,1974 | 53/126 (42,06%) |
| TF-IDF palavras + LinearSVC | 0,4182 | 0,4191 | — | — |
| TF-IDF caracteres + LinearSVC | 0,4188 | 0,4265 | — | — |
| MiniLM + LinearSVC | 0,4710 | 64/136 (47,06%) | 0,5284 | 67/126 (53,17%) |

O resultado histórico de aproximadamente 0,586 para MiniLM permanece sem protocolo confirmado. A comparação ampliada usa o checkpoint multilíngue fixado no script. [Cartão do modelo](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2)

| Classe no teste | Suporte | Precisão | Recall | F1 |
|---|---:|---:|---:|---:|
| Fácil | 53 | 0,6591 | 0,5472 | 0,5979 |
| Média | 42 | 0,4359 | 0,4048 | 0,4198 |
| Difícil | 31 | 0,4884 | 0,6774 | 0,5676 |

Na matriz de confusão (linhas reais, colunas previstas, ordem fácil/média/difícil), as linhas foram `[29,17,7]`, `[10,17,15]` e `[5,5,21]`. A classe média teve o menor F1, com 15 de 42 classificados como difíceis e 10 como fáceis. O teste por área teve macro-F1 de 0,5636 em CH (42), 0,1470 em CN (18), 0,3815 em LC (37) e 0,4916 em MT (29). Em CN houve apenas 3 acertos em 18. Amostras pequenas limitam conclusões por área.

O item `gq_dd151465e965379ee8bfeba1`, cujo texto discute sistemas e centros comerciais, foi de fácil para média. O item `gq_990025b80c8a382ed1386f98`, com contexto histórico, foi de média para difícil. Uma hipótese é que a linguagem do texto de apoio sinalize complexidade diferente da exigida pelo comando. O pipeline usa somente o enunciado, tem limite de tokens e não incorpora as alternativas como um campo separado. Essas observações não confirmam causas pedagógicas. O JSON registra os IDs e as classes de todos os erros.

Na análise de sensibilidade, a regra exploratória `tri.a < 0,25` removeu seis itens difíceis do treino, incluindo o caso extremo. O macro-F1 de validação do MiniLM passou de 0,4710 para 0,4562. O modelo principal manteve os itens e o conjunto de teste permaneceu fixo. O JSON lista os IDs afetados.

O pipeline `models/fase_02.joblib` inclui o classificador e a configuração do pré-processamento. Os pesos públicos do encoder são carregados sob demanda da revisão registrada e ficam fora do pacote. O aviso sobre `embeddings.position_ids` apareceu no carregamento e a geração de embeddings prosseguiu. A inferência retorna classe, versão do modelo, revisão do dataset e confiança nula. Os resultados são classes operacionais derivadas da TRI e não estimativas calibradas de acerto individual.

Os comandos de reprodução estão no README. Os logs em `results/` registram treinamento, testes e inferência. A avaliação está pronta para revisão.

## Registro do experimento preliminar

Aprovada como linha de base experimental para estimar classes TRI a partir do enunciado. A adequação ao estudante será avaliada separadamente.

O script validou os hashes da Fase 1 e usou 1.801 questões elegíveis até 2022 para treino, 136 de 2023 para seleção e 126 de 2024 para avaliação final. Os cortes vieram do treino auditado. O classificador recebeu somente o enunciado. As classes foram derivadas de `tri.b`.

| Modelo | Macro-F1 em 2023 | Acurácia em 2023 | Macro-F1 em 2024 | Acurácia em 2024 |
|---|---:|---:|---:|---:|
| Classe majoritária | 0,1895 | 0,3971 | 0,1974 | 0,4206 |
| TF-IDF palavras + LinearSVC | 0,4182 | 0,4191 | — | — |
| TF-IDF caracteres + LinearSVC | 0,4188 | 0,4265 | 0,4467 | 0,4524 |

O critério de seleção foi macro-F1 na validação. A diferença entre os modelos textuais foi de aproximadamente 0,0006, insuficiente para uma conclusão de superioridade. No teste, 18 dos 42 itens médios foram classificados como difíceis. O macro-F1 por área variou de 0,246 em MT a 0,352 em CH. Consulte as matrizes e os tamanhos das amostras no JSON.

Como análise de sensibilidade, retirar seis itens de treino com `tri.a < 0,25` elevou o macro-F1 na validação de 0,4188 para 0,4275. O limiar foi adotado para essa análise exploratória e não afetou o modelo avaliado no teste. MiniLM ficou pendente de uma execução comparável. A saída do LinearSVC expressa classes e margens, sem calibração de probabilidade de acerto.

O treinamento e a geração do JSON foram executados localmente com scikit-learn 1.8.0 e seed 42. Os dois testes de regressão da auditoria passaram. Consulte o README para reproduzir.
