# Gabaritei · Busca experimental por uma política melhor

## Decisão

A melhor configuração desta rodada mantém o BKT sensível à dificuldade e muda a política. Ela superou a configuração vigente nos quatro recortes de teste sintético, mas ficou abaixo da meta de 60% e aumentou falsas sugestões quando o nível já era adequado. Fica como candidata de pesquisa, sem substituir a política de referência.

## Método

Na primeira busca, comparei 12 configurações de um posterior Rasch com janela móvel. A janela controla quanto histórico entra no estado. A política exige evidência mínima, apoio posterior de 60% à mudança e benefício esperado de 0,04 na distância até a probabilidade-alvo. A configuração escolhida usou janela de 12 respostas, mínimo de quatro itens e proposta de até dois níveis. Ela fez 35,65% e 36,20% com escolha fixa, mas ficou atrás do BKT vigente nos dois ensaios com aceite.

Na segunda busca, mantive o estimador BKT e comparei 18 políticas variando evidência mínima, intervalo entre ofertas e tamanho do passo. O critério de seleção maximizou primeiro o menor acerto entre os dois geradores com escolha fixa e, em caso de empate, a média dos quatro cenários. As sementes de seleção ficaram separadas das de teste. A melhor configuração usou mínimo de seis itens únicos por habilidade, intervalo de dois itens e proposta de até dois níveis, com alvo em 70%. Essa configuração não exige duas estimativas consecutivas na mesma direção, ao contrário da política vigente.

Usei dois geradores sintéticos, um logístico e outro com acerto casual e discriminação variável. Cada recorte final teve 486 trajetórias e 17.496 passos por método. Em escolha fixa, o nível escolhido nunca muda e ausência de oferta conta como manter. No ciclo fechado, o nível só muda após aceite sintético explícito, com probabilidade fixa de 65% quando há uma proposta. Os próximos itens são gerados no novo nível. Nenhuma política recebe a habilidade latente como entrada. Os métodos compartilham sorteios por trajetória. O intervalo pareado reamostra trajetórias inteiras.

## Resultados em sementes reservadas

| Simulador e regime | Taxa de acertos | BKT vigente | Nova política BKT | Ganho sobre BKT, IC 95% |
|---|---:|---:|---:|---|
| Logístico, escolha fixa | 34,20% | 35,33% | **41,80%** | +6,46 pp [5,32; 7,59] |
| Acerto casual, escolha fixa | 34,51% | 35,16% | **40,45%** | +5,29 pp [4,23; 6,32] |
| Logístico, com aceite | 37,53% | 42,62% | **47,34%** | +4,73 pp [3,31; 6,10] |
| Acerto casual, com aceite | 36,88% | 41,55% | **46,10%** | +4,55 pp [3,21; 5,84] |

No logístico com escolha fixa, a proporção de recomendações fora da faixa de desafio caiu de 66,07% para 60,73%. Ao mesmo tempo, falsas propostas quando o nível estava correto passaram de 5,74% para 14,75%. Com aceite, o melhor caso foi 47,34% no total e 54,53% entre passos com evidência mínima. Os recortes cobertos usam mínimos diferentes entre políticas e devem ser lidos com as coberturas no JSON. Houve zero alterações sem aceite em todos os recortes.

## O que significa a meta de 60%

Calculei por programação dinâmica o máximo de acertos no protocolo de escolha fixa para um oráculo que conhece o nível adequado em cada passo. Mantive a dificuldade escolhida, a abstenção inicial, o intervalo entre ofertas e o limite por passo. O oráculo pode emitir ou não uma oferta em cada oportunidade. O teto foi de 39,30%–39,51% para as restrições da política vigente e 55,97%–56,07% para as da nova candidata. O teto relaxa a exigência de persistência da política vigente. É específico a essa métrica e ao histórico fixo, em que cada passo sem oferta é contado como manter. Ele não limita outros protocolos, incluindo ciclo fechado. Atingir 60% no protocolo fixo exigiria alterar uma restrição ou avaliar uma recomendação que permaneça válida entre ofertas. Uma nova métrica deve ser reportada junto da original e identificada claramente.

## Aprendizagem e limites

O BKT sensível atualiza o estado por habilidade após cada resposta e distingue dificuldade do item de domínio. A busca só alterou a política, sem reajustar seus parâmetros globais. A atualização global por SGD permanece demonstrada na avaliação temporal anterior do ASSISTments, incluída como evidência separada. As atualizações mudaram coeficientes, mas a versão congelada teve Log Loss ligeiramente melhor no período posterior. Os resultados desta busca são sintéticos, sem validação de recomendação no ENEM. O aceite constante de 65% é um mecanismo de teste, não uma estimativa de comportamento real. A política candidata precisa de controle de falsas sugestões e nova avaliação antes de ser promovida.

## Reprodução

Execute com Python 3.14, NumPy 2.4.3 e SciPy 1.17.1 na raiz. O pacote inclui as dependências locais da rodada anterior.

```powershell
python -B dificuldade-adaptativa/correcao_adaptativa/busca_autonoma.py
python -B dificuldade-adaptativa/correcao_adaptativa/busca_politica.py
python -B dificuldade-adaptativa/correcao_adaptativa/teto_protocolo.py
python -B -m unittest discover -s dificuldade-adaptativa/correcao_adaptativa -v
```

Nove testes passaram. A Fase 2 permanece em revisão. Nenhuma alteração foi publicada.
