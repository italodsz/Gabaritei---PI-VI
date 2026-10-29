# Etapa 2: melhorias controladas testadas (validação)

Cada variante troca só a parte TF-IDF do RRF. MiniLM e filtros iguais.

| Variante | Pares na ordem certa | Posições das 5 questões nota 2 | Nota 0 no top 5 |
|---|---|---|---|
| Base (palavras) | 34/44 | 1, 2, 3, 8, 11 | 10 de 25 |
| Radical RSLP | 34/44 | 1, 2, 2, 2, 22 | 10 de 25 |
| Prefixo de 5 letras | 33/44 | 1, 1, 2, 3, 21 | 8 de 25 |
| Palavras + caracteres | 34/44 | 1, 2, 2, 2, 16 | 9 de 25 |

Conclusões:
1. Normalizar o texto não trouxe ganho mensurável: as diferenças são de 0 a 1 par em 44.
   Base mantida, sem nova regra.
2. As boas questões já aparecem cedo: 4 das 5 com nota 2 ficam no top 10 e todas no top 22.
   O problema não é encontrar candidatos, é ordená-los: 10 das 25 com nota 0 também
   ficam no top 5. A próxima melhoria precisa reordenar pelo objetivo pedagógico.
