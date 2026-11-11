# Busca por área dentro do título (11/11/2026)

Pergunta: depois do filtro de título, vale usar uma busca diferente por matéria?

1. `validar.py` – liga uma peça de `sinais.py` por vez (comando, nomes-chave, formato, gênero) sobre a ordem atual.
   Medida: mesmo assunto nas 3 primeiras, 1.864 consultas de treino e validação (sem teste). Nenhuma peça ajudou no geral;
   "comando" e "formato" pioram o conceito; "nomes" ajuda um pouco em Literatura, Filosofia e Artes.
2. `sinais_x_notas.py` – nos 141 pares que já tinham nota 0–10, a semelhança de palavras (TF-IDF) acompanha a nota
   em 46% das vezes (pior que moeda) e a de sentido (Qwen) em 72%. Atenção: esses pares incluem referências do teste;
   foi daqui que saiu a ideia de testar "só sentido".
3. `validar_pesos.py` – mesma medida do item 1: só Qwen dá +3,6 pontos (61,9% → 65,5%), melhor em 11 de 13 matérias.
   Exceções: Literatura (mistura + nomes) e TIC (mistura atual). Filosofia: Qwen + nomes.
   Receita final em `busca_por_area_v1.json` (modo `titulo_area`).
4. `preparar_teste.py` + `notas_teste.py` – conferência única nas 20 referências do teste, notas da IA às cegas
   (22 sugestões novas misturadas com 27 iscas). Resultado em `resultado_teste_IA.json`:
   média 6,48 → 6,90; 1ª sugestão 7,47 → 7,92; notas 7+ de 50% → 63%; melhor em 12 referências, igual em 6, pior em 2.

Limites: notas da IA, que também fez o método; 20 referências; o item 2 usou pares do teste para ter a ideia.
