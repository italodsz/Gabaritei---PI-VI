# Estabilidade e identificabilidade

As 1.120 inicializações principais convergiram. Dentro do conjunto com NLL média até 1e-5 da melhor solução, nenhuma habilidade teve amplitude de parâmetro superior ao limiar exploratório de 0,10. A maior amplitude observada foi 0.069855.

Há 7 habilidades com parâmetros a menos de 0,005 de um limite numérico. Os IDs são 16, 84, 91, 307, 308, 322, 323. As fronteiras por parâmetro estão no JSON e no CSV. Esses casos pedem cautela, especialmente a habilidade 307 com T no limite inferior e as habilidades 84 e 308 com L0 no limite inferior. A habilidade 323 tem T elevado e G no limite inferior. O significado de domínio permanece latente.

O bootstrap usou 100 amostras de estudantes com reposição em cada habilidade, preservando a sequência completa. Cada reajuste usou a solução original como uma inicialização e outras quatro inicializações determinísticas, totalizando 28.000 tentativas de otimização em 5.600 reajustes. Convergiram 5600 reajustes. Em cada habilidade existe uma sequência por estudante, de modo que reamostrar a sequência inteira equivale a reamostrar o estudante naquele ajuste. A incerteza conjunta entre habilidades não foi estimada.

Os percentis 2,5 e 97,5% são intervalos empíricos exploratórios. O número de replicações e o máximo restrito afetam sua precisão e cobertura. 28 habilidades apresentaram pelo menos um intervalo com largura superior a 0,30. Os IDs são 4, 8, 16, 39, 40, 46, 51, 54, 58, 65, 67, 81, 82, 84, 86, 91, 96, 101, 279, 294, 297, 303, 307, 308, 312, 322, 323, 325. O arquivo bootstrap.json traz desvio-padrão, mediana, larguras e matriz de correlação de L0,T,G,S. Correlações ficam nulas quando a variância numérica é praticamente zero.

A baixa sensibilidade à inicialização dentro da mesma amostra convive com incerteza elevada entre amostras de estudantes. Os resultados não demonstram identificabilidade estatística dos quatro parâmetros em cada habilidade. Habilidades com intervalos amplos ou soluções de fronteira precisam de diagnóstico adicional antes de interpretação pedagógica.

Os gráficos 06 e 08 mostram a dispersão por parâmetro e sua relação com o volume de eventos. O treino é observacional e as oportunidades foram selecionadas pela política do tutor. T representa a transição entre oportunidades retidas sob esse processo.
