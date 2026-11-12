# Teste Qwen3-Embedding-8B (05/11/2026)

Máquina: Windows 11, RTX 4060 Ti 8 GB, 32 GB RAM. Modelo em 4 bits (NF4), até 8.192 tokens,
lote 4, base de trabalho (sha 22d83ac5…). Duas versões: sem instrução (354 s) e com a
instrução "conceito" aplicada a todas as questões (404 s). Resultado reproduzido de forma
independente a partir dos vetores (mesma tabela).

| Método | Pares na ordem certa | Mesma hab@3 | Posições das 5 notas 2 |
|---|---|---|---|
| MiniLM | 24/44 (55%) | 14,5% | 1, 1, 1, 12, 61 |
| RRF TF-IDF + MiniLM (oficial) | 34/44 (77%) | 15,2% | 1, 2, 3, 8, 11 |
| Qwen sem instrução | 34/44 (77%) | 19,1% | 1, 1, 1, 7, 76 |
| RRF TF-IDF + Qwen sem instrução | 37/44 (84%) | 20,1% | 1, 1, 2, 10, 20 |
| Qwen "conceito" | 39/44 (89%) | 22,3% | 1, 1, 2, 6, 36 |
| **RRF TF-IDF + Qwen "conceito"** | **39/44 (89%)** | 21,3% | **1, 1, 2, 5, 10** |

Candidato escolhido: `rrf_qwen` (empata com o Qwen sozinho nos pares e tem a pior nota 2 em
10º, contra 36º). Ressalvas: 44 comparações em 10 consultas; notas majoritariamente de IA;
várias variantes comparadas no mesmo conjunto. Precisa de avaliação cega humana antes de
virar oficial. Os 8 pares de vetores idênticos correspondem a questões com texto idêntico na
mesma família (esperado).
