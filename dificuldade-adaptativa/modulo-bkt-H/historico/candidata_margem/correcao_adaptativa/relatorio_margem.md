# Busca com margem de benefício

Seleção em três sementes e teste em outras seis, com 486 trajetórias por cenário. Comparei 16 políticas BKT variando intervalo, mínimo de itens e margem de benefício. Entre as configurações com até 10% de falsas mudanças no desenvolvimento em ciclo fechado nos dois geradores, selecionei a maior acurácia no pior gerador. A vencedora usa quatro itens por habilidade, intervalo de um item e benefício mínimo de 0,09 na distância estimada até o alvo de 70%. Permite sugerir até dois níveis, com mudança efetiva condicionada ao aceite explícito. O estimador e o alvo permaneceram iguais.

| Cenário | Política anterior | Nova | Falsas mudanças da nova |
|---|---:|---:|---:|
| Logístico, escolha fixa | 41,94% | 51,12% | 22,96% |
| Acerto casual, escolha fixa | 40,13% | 47,51% | 22,43% |
| Logístico, com aceite | 48,03% | 50,53% | 9,94% |
| Acerto casual, com aceite | 46,68% | 48,90% | 9,88% |

Os quatro intervalos pareados de ganho contra a política anterior ficaram acima de zero. O ganho em ciclo fechado foi 2,50 e 2,22 pontos percentuais. A meta de 60% não foi alcançada. O intervalo menor tornou mais frequentes as ofertas em escolha fixa, incluindo falsas mudanças. Como o limite de 10% foi usado somente para seleção em ciclo fechado, esses resultados não justificam promoção geral. A cobertura foi 77,78%. Não houve alteração unilateral. O aceite sintético de 65% não representa comportamento real. O BKT atualiza estado individual; a atualização global do SGD continua sustentada apenas pelo experimento anterior no ASSISTments, sem retreino nesta rodada.

Reproduzir na raiz com Python 3.14, NumPy 2.4.3 e SciPy 1.17.1:

```powershell
python -B dificuldade-adaptativa/correcao_adaptativa/busca_margem.py
python -B -m unittest discover -s dificuldade-adaptativa/correcao_adaptativa -v
```

Nove testes passaram. A candidata merece comparação com uma política que mantenha uma estimativa de nível entre ofertas, separando a qualidade do diagnóstico da frequência de notificações. A métrica anterior deve permanecer como referência.
