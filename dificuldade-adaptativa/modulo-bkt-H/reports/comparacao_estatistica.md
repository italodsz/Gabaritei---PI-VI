# Comparação com o histórico suavizado

Esta análise foi solicitada depois da avaliação original e tem caráter posterior ao teste. As previsões foram regeneradas dos históricos reconstruídos, com parâmetros oficiais preservados e origem alinhada por event_id. A probabilidade foi calculada antes da resposta. O baseline é (acertos anteriores + 2·taxa de treino da habilidade)/(oportunidades anteriores + 2), reproduzindo a Fase03.

O bootstrap reamostra estudantes inteiros com reposição e mantém todos os seus eventos. Foram 2.000 réplicas, com semente 20261111 no total, 20261112 na faixa baixa e 20261113 na alta. O intervalo usa os percentis 2,5 e 97,5. O resultado é ponderado por evento em cada amostra.

| Grupo | Estudantes | Eventos | Delta log-loss BKT − histórico | IC95% | Resultado |
| --- | ---: | ---: | ---: | --- | --- |
| Geral | 585 | 29948 | -0.01696853 | [-0.02184936, -0.01145902] | vantagem_BKT |
| Taxa ≤10% | 40 | 343 | 0.11144977 | [0.04938568, 0.16166079] | vantagem_historico |
| Taxa ≥90% | 92 | 822 | 0.02523110 | [0.01498192, 0.03660610] | vantagem_historico |

A log-loss global foi 0.56560806 para BKT e 0.58257659 para histórico. A diferença favorece BKT nesse conjunto, com o intervalo inteiramente negativo. Nos dois grupos extremos, os intervalos são positivos e favorecem o histórico suavizado. Esses grupos são definidos pela taxa observada de acerto no teste, com fronteiras inclusivas de 10% e 90%, para reproduzir os recortes anteriores. Isso serve à descrição e não foi usado para escolher parâmetros ou a política desta missão.

Os intervalos de Brier e todas as réplicas estão no JSON. A vantagem global não sustenta superioridade universal por estudante nem demonstra recomendação pedagógica melhor. O teste era público para esta missão e a seleção do comparador ocorreu após a auditoria. Uma confirmação prospectiva deve usar novas observações.
