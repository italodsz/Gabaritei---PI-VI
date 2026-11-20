# Gabaritei · Correção arquitetural da dificuldade adaptativa

**Decisão: NÃO APROVADA para encerrar a Fase 2 com uma política adaptativa escolhida.** O BKT com emissões sensíveis à dificuldade é o candidato prioritário, com a taxa de acertos como referência. O ganho ficou abaixo do critério pré-fixado. A separação entre estimador, política e preferência é viável e pode ser preservada.

## Auditoria e protocolo

Reexecutei `validacao_adaptativa/avaliar.py`. A regra simples reproduziu 34,22% e o híbrido 32,42%, com diferença de −1,80 ponto percentual. O alvo anterior escolhia, entre três níveis, a probabilidade latente mais próxima de 70%, hipótese de desafio e não prescrição educacional. A simulação usava uma curva logística, favorável por construção a modelos logísticos. A nova rodada manteve esse gerador para comparação e acrescentou outro com chance de acerto ao acaso e inclinações diferentes por nível.

O híbrido antigo preservava ordem e habilidade, mas suas emissões BKT e os atributos do SGD ignoravam a dificuldade dos itens respondidos. A previsão obtida no ASSISTments era projetada para uma curva sintética sem calibração entre domínios. O atraso mínimo, a abstenção e a restrição a passos adjacentes também comprimiam a taxa final de acerto. A ablação nova cruza seis estimadores com duas políticas, sob respostas pareadas, para separar parte desses efeitos. O critério de promoção de três pontos percentuais, intervalo pareado positivo e ausência de piora do desafio foi registrado antes dos novos resultados.

## Arquiteturas e simulação

O BKT estendido mantém um estado binário latente, com emissões de acerto condicionadas por dificuldade em log-odds. A dificuldade passa a afetar tanto a atualização após resposta como a previsão do próximo item. Os parâmetros de partida vieram do ajuste externo e ficaram fixos. Elo atualiza habilidade pelo erro entre resposta e probabilidade prevista, com taxa fixa de 0,35. O protótipo Rasch usa posterior discreto para habilidade e dificuldade conhecida no simulador. Esse posterior estático pode reagir lentamente a mudanças abruptas. O híbrido sensível faz média das probabilidades de BKT estendido e Rasch. Ele é distinto do híbrido histórico BKT + SGD. Um SGD com atributos sensíveis ao item foi ajustado separadamente no ASSISTments.

Foram 324 trajetórias por gerador, 36 pontos por trajetória, quatro sementes e nove perfis. O estimador só recebe respostas passadas da habilidade em questão. A escolha fica fixa nas trajetórias comparativas, e as propostas são avaliadas em um passo sobre o histórico compartilhado. Aceite e recusa são testes funcionais separados. Não há avaliação de trajetórias fechadas após a aceitação.

| Estimador | Logístico, política original | Logístico, persistência | Segundo gerador, original | Segundo gerador, persistência |
|---|---:|---:|---:|---:|
| Taxa de acerto | 34,22% | 33,99% | 34,48% | 34,35% |
| BKT + SGD anterior | 32,42% | 32,39% | 33,13% | 32,91% |
| BKT sensível ao item | **35,19%** | **35,44%** | **35,20%** | **35,31%** |
| Elo sensível ao item | 33,43% | 33,36% | 34,20% | 34,24% |
| Rasch | 33,48% | 33,36% | 34,16% | 34,09% |
| BKT + Rasch | 33,97% | 34,00% | 34,50% | 34,34% |

Sob persistência, o melhor estimador ganhou 1,45 ponto no primeiro gerador (IC pareado 95% de +1,03 a +1,86) e 0,95 no segundo (+0,55 a +1,36). A faixa de desafio foi respeitada com maior frequência que pela taxa simples nos dois geradores. Os intervalos reamostram trajetórias inteiras e descrevem estes geradores, sem extrapolação para estudantes reais.

No gerador original, o BKT sensível acertou 61,91% do nível direto nos pontos cobertos, frente a 40,97% do híbrido antigo. Essa métrica condicionada à cobertura ignora a política e não equivale à taxa de recomendação. A proxy de habilidade teve erro absoluto de 0,931 contra 1,107 do híbrido antigo. Mantendo o estimador e trocando a política original pela persistência, as falsas mudanças quando o nível já era adequado caíram de 6,79% para 5,48%, e as mudanças consecutivas na saída passaram de 2.470 para 2.240. A mediana para detectar queda aumentou de 12 para 15 passos. Com persistência, as precisões de subir, descer e manter foram 72,35%, 77,52% e 34,94%. A queda e a classe de manutenção ainda deixam margem para melhoria. A saída que retorna a manter entre ofertas é contabilizada como oscilação, sem mudança da preferência efetiva.

## Dados reais e atualização

O CSV corrigido do ASSISTments foi validado pelo SHA-256 anterior. A divisão disjunta por aluno e janela foi reutilizada, com deduplicação adicional por problema dentro do aluno e da janela. A dificuldade é uma proxy de item, o negativo do logit da taxa suavizada de acerto. Na execução final, excluí as respostas do próprio aluno ao gerar sua proxy de treino, corrigindo a dependência do rótulo observada na primeira execução. Para as janelas posteriores, a proxy usa somente o treino. Problemas inéditos usam zero. Essa medida não é uma calibração TRI conjunta. A associação de problema usa o primeiro registro por chave no CSV.

| Modelo, teste posterior de 4.808 eventos / 26 alunos | AUC | Log Loss | Brier | ECE |
|---|---:|---:|---:|---:|
| Constante | 0,5000 | 0,6104 | 0,2096 | 0,0519 |
| BKT sensível | 0,6289 | 0,5827 | 0,1969 | **0,0378** |
| Elo | 0,6213 | 0,6288 | 0,2190 | 0,1390 |
| Rasch com proxy | 0,6289 | 0,6244 | 0,2168 | 0,1354 |
| BKT + Rasch | 0,6319 | 0,5923 | 0,2018 | 0,0734 |
| SGD congelado | **0,6396** | **0,5797** | **0,1960** | 0,0442 |
| SGD após dois lotes | 0,6344 | 0,5800 | 0,1961 | 0,0397 |

O SGD treinado usou as duas previsões, dificuldade e contagem do histórico. Dois candidatos passaram pelo filtro de promoção temporal e alteraram os parâmetros em norma L2 de 0,130 e 0,157. No teste posterior, a versão atualizada reduziu ECE, mas perdeu AUC e teve Log Loss ligeiramente maior que a congelada. O SGD congelado teve o menor Log Loss nesta tarefa de previsão de acerto. Isso não mede a adequação de dificuldade nem implica promoção para o ENEM.

## Respostas de encerramento

1. A causa principal identificada foi omitir dificuldade na atualização do histórico, agravada por projeção de escala e limitações da política.
2. A correção melhorou a recomendação nos dois geradores e produziu evidências distintas para erros em itens fáceis e difíceis.
3. O melhor candidato foi BKT sensível ao item com persistência.
4. Superou a regra simples nas condições testadas, mas ficou abaixo do ganho mínimo. Não foi promovido.
5. O protótipo representa habilidade e dificuldade separadamente. Ainda falta calibrar as escalas no ENEM.
6. A política mantém quando o alvo coincide, se abstém com menos de oito famílias e reduziu falsas mudanças com persistência. A precisão de manter permanece baixa.
7. Os testes executados preservaram preferência na recusa, aceitaram apenas mediante consentimento explícito e ignoraram repetição pela família. Nos replays houve zero alterações da preferência.
8. Persistem limitações de simulação, poucos alunos no teste externo, proxy de dificuldade, ausência de validação fechada e ausência de respostas reais ENEM.
9. Há bloqueio para escolher a política atual como superior. A interface modular e a prova de conceito estão disponíveis para uma próxima rodada.
10. A Fase 2 permanece aberta. O candidato mais defensável para nova comparação é BKT sensível ao item, com taxa de acerto como baseline.

## Reprodução

Da raiz do pacote, com Python 3.14, NumPy 2.4.3, SciPy 1.17.1, pandas 2.3.3 e scikit-learn 1.8.0:

```powershell
python -B dificuldade-adaptativa/correcao_adaptativa/rodada.py
python -B dificuldade-adaptativa/correcao_adaptativa/real.py assistments.csv
python -B -m unittest discover -s dificuldade-adaptativa/correcao_adaptativa -v
```

O CSV público corrigido é baixado conforme `viabilidade/relatorio.md`. O JSON contém métricas por perfil e habilidade. O CSV registra os passos, ofertas, probabilidades e erros. Os quatro testes novos foram executados. O manifesto lista hashes. Os dados brutos ficam fora do pacote.

[ASSISTments corrigido](https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data/skill-builder-data-2009-2010) · [BKT de Corbett e Anderson](https://doi.org/10.1007/BF01099821) · [Elo educacional de Klinkenberg et al.](https://www.klinkenberg.amsterdam/content/publication/) · [TRI do Inep](https://download.inep.gov.br/educacao_basica/enem/nota_tecnica/2011/nota_tecnica_tri_enem_18012012.pdf) · [SGDClassifier](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.SGDClassifier.html) · [Protocolo pyKT](https://papers.neurips.cc/paper_files/paper/2022/hash/75ca2b23d9794f02a92449af65a57556-Abstract-Datasets_and_Benchmarks.html)
