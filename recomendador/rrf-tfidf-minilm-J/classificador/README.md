# Classificador da árvore curricular

Classifica as 2063 questões da base nos 319 assuntos da árvore v1.2. O resultado é o que vai permitir recomendar por proximidade de assunto.

## Arquivos

| Arquivo | O que faz | Onde roda |
|---|---|---|
| `dados/arvore_v1.2.json` | árvore: 319 assuntos com descrição e regra de fronteira | — |
| `dados/gabarito_v1.2.json` | 347 questões classificadas à mão (339 válidas, 8 com defeito) | — |
| `gerar_vetores_arvore.py` | vetores Qwen dos assuntos e das questões, com instrução de classificação | GPU, uns 7 min |
| `classificar.py` | etapa 1: combina Qwen, TF-IDF e vizinhos do gabarito; mede no gabarito; classifica a base | CPU, segundos |
| `juiz_llm.py` | etapa 2, experimental: um modelo local escolhe entre os 10 candidatos da etapa 1 | GPU |

## Ordem de execução (de dentro de `recomendador/rrf-tfidf-minilm-J/`)

```bash
python classificador/gerar_vetores_arvore.py --quantizar-4bit
python classificador/classificar.py
python classificador/juiz_llm.py --quantizar-4bit          # mede o juiz só no gabarito
python classificador/juiz_llm.py --quantizar-4bit --tudo   # só se o juiz passar da etapa 1
```

## Resultado sem os vetores novos (10/11/2026, TF-IDF + vizinhos)

Medido no gabarito, deixando cada questão de fora:
- **Grande tema:** 57,5% (meta: 95%).
- **Assunto:** 44,0% (meta: 85%).
- **Assunto certo entre os 10 primeiros candidatos:** 83,5%.

Conclusão: só a similaridade não basta para classificar. Ela serve para separar os candidatos, e a escolha final fica para a etapa 2: o juiz, ou uma revisão humana quando a confiança for baixa.

Detalhes em `saida/relatorio.md`. Esses números servem de linha de base para comparar com o resultado que inclui os vetores Qwen.

## Cuidados

- A avaliação deixa cada questão de fora, mas os pesos são escolhidos no próprio gabarito. A acurácia real tende a ser um pouco menor.
- O gabarito v1.2 ainda está em conferência pelo Gabriel e pelo Cauê. Quando a conferência terminar, substitua o arquivo em `dados/` e rode tudo de novo.
- Se a árvore mudar, é preciso gerar os vetores de novo. O `classificar.py` recusa vetores gerados com outra árvore.
