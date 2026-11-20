# Validação experimental da dificuldade adaptativa

**Decisão: NÃO APROVADA para substituir regras simples na recomendação adaptativa.** O híbrido continua como hipótese de pesquisa. A taxa de acerto suavizada fica como referência de comparação, sem indicação de eficácia no ENEM.

O protocolo fixou antes da simulação ganho mínimo de três pontos percentuais sobre a melhor regra simples, intervalo pareado positivo, ausência de piora na faixa de desafio e nenhuma alteração unilateral. A faixa de 55% a 85%, centrada em 70%, é uma hipótese de simulação. A confiança usa quantidade de evidência e é exploratória acima do mínimo de oito itens únicos por habilidade.

Em 324 trajetórias, cada método viu as mesmas respostas na dificuldade escolhida. A dificuldade adequada de referência veio da habilidade latente e da dificuldade do item em uma curva logística sintética, sem acesso às saídas avaliadas. As trajetórias cobrem nove perfis, três níveis escolhidos, quatro sementes e três réplicas. Foram avaliados 11.664 pontos por método. A avaliação de sugestões é contrafactual de um passo sobre um histórico compartilhado. Aceitação e recusa foram exercitadas separadamente; não foi avaliado o efeito de aceitar sugestões ao longo de um percurso fechado.

| Método | Dificuldade correta | Desafio fora da faixa |
|---|---:|---:|
| Manter a escolha | 33,33% | 67,70% |
| Taxa de acerto | 34,22% | 66,67% |
| BKT | 33,94% | 66,83% |
| SGD | 32,12% | 68,33% |
| BKT + SGD | 32,42% | 68,11% |
| Elo | 33,43% | 67,77% |

O híbrido perdeu 1,80 ponto percentual para a taxa. O intervalo pareado de 95%, reamostrando trajetórias completas, foi de −2,36 a −1,27 pontos. Esse intervalo caracteriza o gerador usado. No híbrido, 11,83% dos pontos em nível adequado geraram mudança falsa, contra 5,45% da taxa. Detectou 179 de 324 episódios ascendentes e 187 de 372 descendentes, ambos com mediana de 12 passos entre os detectados. A precisão direcional de subir/descer/manter foi 62,09%/61,08%/33,13%. O erro absoluto médio da proxy de domínio na escala sintética foi 1,107 nos pontos cobertos. Houve 2.620 mudanças consecutivas na saída da política dentro de sequências por habilidade, incluindo o retorno a manter entre ofertas. Isso não representa mudanças na escolha efetiva. A cobertura com evidência suficiente foi 55,56%.

A dificuldade do item e o domínio são campos distintos. Elo usa o nível do item na atualização. O BKT e o SGD importados do ASSISTments ainda atualizam ou pontuam o histórico sem dificuldade observada do item. A projeção que transforma a probabilidade de referência em curva por dificuldade é hipotética. Um erro no difícil ainda pode penalizar o estado BKT da mesma forma que no fácil, uma limitação da arquitetura atual. Itens repetidos pelo mesmo ID foram rejeitados sem alterar estado, histórico ou confiança. Conteúdo duplicado com IDs distintos e aprendizagem por transferência a itens novos ainda precisam de teste.

## Cobertura e evidência

| Grupo | Cobertura executada | Pendente |
|---|---|---|
| A | Pouco histórico em todos os níveis, acerto, erro e contradição | Prior calibrado por aluno novo |
| B | Três perfis estáveis e respostas estocásticas | Eficácia pedagógica no ENEM |
| C | Progressão gradual, abrupta, irregular e por habilidade | Aceitação fechando o ciclo longitudinal |
| D | Quedas bruscas e graduais, erros persistentes | Efeito causal de aceitar redução |
| E | Habilidades e áreas separadas, dados escassos e ausência de habilidade | Mapeamento ENEM validado |
| F | Mesma taxa com ordem e nível diferentes, registros inválidos e ID repetido | Equivalência semântica entre IDs |
| G | Aceitar, recusar, mudar manualmente e manter | Política de ofertas ignoradas em produção |
| H | Histórico longo, alternância, intervalo de oferta e replay | Persistência de sessão com data real |
| I | Catálogo sem nível disponível, mudança de área e ausência de habilidade | Inatividade datada e TRI extremo, ausente ou pouco discriminativo no mesmo ensaio |

Sete testes automatizados passaram. Houve zero violações de autonomia na simulação e nos testes executados. Os casos de integração são em memória. A matriz agrupa a cobertura real por família e não certifica individualmente todos os subcasos A1–I12 pedidos.

## Dados reais e aprendizagem

O relatório temporal anterior, incluído no pacote, registra 4.899 respostas de 26 alunos do ASSISTments. O híbrido congelado obteve AUC 0,6174, Log Loss 0,5795, Brier 0,1956 e ECE 0,0400. A versão após dois lotes alterou parâmetros e 31 decisões, mas piorou Log Loss para 0,5833. Esta rodada reutiliza essa evidência verificável, sem retreinar em ASSISTments. Ela comprova previsão e atualização de parâmetros em dados externos, sem avaliar dificuldade recomendada com estudantes reais do ENEM. Alterar o estado individual após resposta e alterar coeficientes globais são operações distintas. A versão global permanece congelada na simulação.

Os resultados sintéticos mostram que há sinal parcial de evolução e diferenças entre habilidades, mas também falsas mudanças e episódios não detectados. O modelo treinado contribui numericamente, como mostra a comparação por ablação. Não há ganho suficiente para promovê-lo. Antes de aprovar a política adaptativa, é necessário testar uma atualização que considere dificuldade e novidade do item, incorporar proteção por família de conteúdo e repetir a comparação em trajetórias fechadas e no piloto ENEM. Isso bloqueia aprovar a política atual como superior, embora a prova de conceito permita testar alternativas sem depender de LLM.

## Reprodução

Com Python, NumPy e SciPy, execute da raiz do pacote:

```powershell
python -B dificuldade-adaptativa/validacao_adaptativa/avaliar.py
python -B -m unittest discover -s dificuldade-adaptativa/validacao_adaptativa -v
```

O JSON separa métricas por habilidade e perfil. O CSV registra os pontos de avaliação, incluindo os erros e a justificativa. O manifesto verifica os arquivos. O relatório temporal descreve a reprodução dos dados reais.

[Protocolo pyKT](https://papers.neurips.cc/paper_files/paper/2022/hash/75ca2b23d9794f02a92449af65a57556-Abstract-Datasets_and_Benchmarks.html) · [SGDClassifier](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.SGDClassifier.html) · [Nota técnica TRI do Inep](https://download.inep.gov.br/educacao_basica/enem/nota_tecnica/2011/nota_tecnica_tri_enem_18012012.pdf)
