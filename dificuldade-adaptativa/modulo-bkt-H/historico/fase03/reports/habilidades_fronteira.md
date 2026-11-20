# Investigação das sete habilidades de fronteira

Para 16, 84, 91, 307, 308, 322 e 323, o parâmetro próximo da fronteira foi fixado em uma grade que inclui seu valor oficial e valores entre 0,0001 e 0,9999. Os outros três foram reotimizados com três inicializações, os mesmos limites e a restrição G+S≤0,99. As configurações inviáveis de emissão foram excluídas da grade. Os modelos oficiais foram preservados.

O perfil relata a perda de log-verossimilhança total em relação ao modelo oficial. O conjunto ΔLL≤1,92 é uma referência descritiva de suporte de likelihood, sem alegação de intervalo nominal válido na fronteira. As alternativas foram mantidas como exploração e tiveram suas previsões comparadas na validação.

| ID | Parâmetro | Valor oficial | Distância inferior | Valores no perfil com ΔLL≤1,92 | Maior RMSE preditivo nesse conjunto |
| --- | --- | ---: | ---: | --- | ---: |
| 16 | G | 0.00010000 | 0 | [0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1] | 0.043800 |
| 84 | L0 | 0.00010000 | 6.78e-20 | [0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5] | 0.021655 |
| 91 | G | 0.00010000 | 1.79e-17 | [0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25] | 0.040898 |
| 307 | T | 0.00010000 | 0 | [0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25] | 0.058874 |
| 308 | L0 | 0.00010000 | 0 | [0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5] | 0.041193 |
| 322 | G | 0.00010000 | 0 | [0.0001, 0.001, 0.005, 0.01, 0.025] | 0.010581 |
| 323 | G | 0.00010000 | 0 | [0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 0.75] | 0.002378 |

O menor delta observado foi da ordem de −2e-11, compatível com aritmética e tolerância de otimização, sem melhoria substantiva sobre o ajuste oficial. Os perfis mostram regiões de parâmetros alternativas com objetivos semelhantes. Todas as sete habilidades ficaram na categoria C, por suporte de teste limitado e/ou ganho inconclusivo ou Brier pontualmente pior. Esses motivos individuais constam no CSV.
