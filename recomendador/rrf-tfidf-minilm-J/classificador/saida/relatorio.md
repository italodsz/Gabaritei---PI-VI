# Classificador da árvore curricular — relatório

Árvore: arvore_v1.2.json (319 assuntos). Gabarito: 339 questões válidas (0 fora da base de 2063, 8 com defeito).
Sinal Qwen questão × assunto: **ausente**. Rode `gerar_vetores_arvore.py` na GPU para ativá-lo.
Pesos escolhidos (tfidf, qwen, vizinhos): (1, 0, 0.5)

## Acurácia no gabarito (deixa-um-de-fora)

| Medida | Resultado | Meta |
|---|---|---|
| Grande tema | 57.5% | ❌ 95% |
| Assunto | 44.0% | ❌ 85% |
| Assunto certo entre os 3 primeiros | 67.8% | |
| Assunto certo entre os 5 primeiros | 75.8% | |
| Assunto certo entre os 10 primeiros | 83.5% | |

| Área | n | Grande tema | Assunto | Top 5 | Top 10 |
|---|---|---|---|---|---|
| CH | 145 | 64.8% | 51.0% | 80.7% | 90.3% |
| LC | 100 | 52.0% | 44.0% | 70.0% | 78.0% |
| CN | 48 | 56.2% | 41.7% | 66.7% | 72.9% |
| MT | 46 | 47.8% | 23.9% | 82.6% | 84.8% |

## Revisão manual

Nenhum limiar de margem atinge 85.0% de precisão; todas as 1724 questões automáticas vão para revisão.

## Distribuição

Assuntos sem nenhuma questão: 17. Assuntos com 1 ou 2 questões: 66. Ver `distribuicao_assuntos.csv`.

O conceito (nível mais fino) não é atribuído por este classificador.
