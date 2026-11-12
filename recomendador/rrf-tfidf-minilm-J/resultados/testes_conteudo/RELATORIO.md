# Testes de conteúdo dentro do título (11/11/2026)

Base de comparação: `titulo_area` (oficial). Régua: notas 0–10 da IA, às cegas quanto ao método
(sugestões novas misturadas com iscas), nas 50 referências de `resultados/avaliacao_ia_50`.
A mesma IA construiu os métodos; não é avaliação humana.

| Teste | O que muda | Validação (mesmo assunto top 3) | Média top 3 (IA) | 1ª sugestão | Abaixo de 5 | Por referência (melhor/igual/pior) | Diferença média (IC95) |
|---|---|---|---|---|---|---|---|
| Base `titulo_area` | — | 65,5% | 6,60 | 7,38 | 11% | — | — |
| 1. Mesmo assunto primeiro | assunto da árvore na frente | (não se aplica: é o próprio critério) | 6,59 | 7,26 | 17% | 13 / 30 / 7 | −0,01 (−0,24 a +0,19) |
| 2. Alternativa correta | bônus pela alternativa certa (TF-IDF, peso 0,5) | 63,6% (pior) | 6,55 | 7,46 | 13% | 3 / 40 / 7 | −0,05 (−0,13 a +0,01) |
| 3. Fichas (piloto, 12 refs de Natureza) | ficha "conceito + tarefa" escrita à mão, RRF com Qwen | 69,2% vs 66,7% | 6,14 vs 6,00 | 7,33 vs 7,42 | 25% vs 25% | 4 / 7 / 1 | +0,14 (−0,08 a +0,36) |
| 3b. Só a ficha | ficha sem Qwen | 62,1% | 5,86 | 6,83 | 33% | 4 / 3 / 5 | −0,14 (−0,42 a +0,14) |

Conclusão: nenhum teste melhora de forma clara. O teste 1 ajuda Linguagens (61% de notas 7+ contra 47%) e piora
Humanas (28% abaixo de 5 contra 13%). O teste 3 tem o único sinal positivo, pequeno e incerto. Mantém-se `titulo_area`.

Arquivos: `preparar_t12.py`, `resultado_t12_IA.json`, `fichas_cn.txt` (256 fichas), `fichas.py`,
`preparar_t3.py`, `resultado_t3_IA.json`; chaves com notas em `chave_*_com_notas.json`.
