# TF-IDF: unigramas, bigramas e trigramas (05/11/2026)

Pedido do professor na reunião de 30/10: verificar se sequências de 2 ou 3 palavras
representam melhor o contexto do que palavras isoladas. Mesmos parâmetros do TF-IDF
oficial (min_df 2, max_df 0,98, sublinear, sem acentos), ajuste só no treino; mesmas regras
de candidatos (mesma área, família excluída e deduplicada). Validação: 44 pares com nota;
hab@5 = proporção das 5 primeiras com a mesma habilidade oficial (proxy automático).

| TF-IDF | Termos | Sozinho | hab@5 | RRF + MiniLM | RRF + Qwen | hab@5 (RRF+Qwen) |
|---|---|---|---|---|---|---|
| Só palavras (1) | 14.395 | 28/44 | 13,7% | 30/44 | 38/44 | 18,8% |
| **Palavras + pares (1-2), atual** | 45.176 | 30/44 | 13,2% | **34/44** | **39/44** | 20,4% |
| 1-3, até 50 mil termos | 50.000 | 30/44 | 13,5% | 32/44 | 40/44 | 20,9% |
| 1-3, sem limite | 60.657 | 30/44 | 13,2% | 33/44 | 40/44 | 21,0% |

Conclusão: pares de palavras ajudam em relação a palavras isoladas (+2 sozinho, +4 no RRF com
MiniLM). Trigramas não trazem ganho consistente: +1 par com Qwen, −1 a −2 com MiniLM, dentro
do ruído de 44 comparações. Configuração mantida: unigramas + bigramas.
