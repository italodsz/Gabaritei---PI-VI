# Treinamento científico BKT · Fase 02

## Entrada efetivamente verificada

O gate conferiu 55 membros do ZIP da Fase 01 por manifesto e CRC, os oito arquivos processados locais, o SHA-256 do CSV oficial e as atribuições por estudante. A reconstrução em pasta temporária reproduziu os agregados e os 15 testes críticos da Fase 01 passaram novamente. A elegibilidade de 56 habilidades foi recalculada exclusivamente no treino. O carregador entregou 19.370 sequências e 143.092 eventos dessas habilidades. Os totais integrais dos três conjuntos continuam em 151.015 / 31.521 / 31.881 eventos, mas o ajuste usa apenas as 56 habilidades selecionadas do treino.

O treino estimou 56 conjuntos de L0, T, G e S, em 19,370 sequências, 143,092 eventos e 56 habilidades. A quantidade de estudantes por habilidade está na tabela, sem somá-la como número de pessoas distintas. O corpus de treino principal da Fase 01 cobre 2.773 estudantes. Todas as 1120 inicializações principais convergiram com solução viável. A seleção utilizou a menor NLL de treino entre soluções convergentes e viáveis.

## Modelo e convenções

A ordem dos estados é não dominada e dominada. As observações são 0 e 1. A distribuição inicial é [1−L0,L0], a transição tem linhas [1−T,T] e [0,1], e a emissão tem linhas [1−G,G] e [S,1−S]. O valor 0 da edição ASSISTments inclui erro ou pedido de ajuda. Cada estudante–habilidade começa em L0.

A inferência primeiro calcula p=m(1−S)+(1−m)G. Depois de observar y, normaliza as duas massas de estado com a emissão de y. Por fim, aplica m'=m_posterior+(1−m_posterior)T para a próxima oportunidade. O traço exporta a previsão anterior e o estado para a oportunidade seguinte. A transição depois da resposta final não acrescenta observação à verossimilhança.

[Formulação de referência de Corbett e Anderson](https://doi.org/10.1007/BF01099821)

## Método de estimação

O objetivo é a soma das log-verossimilhanças das sequências de treino, com reinício por aluno–habilidade, dividida pelo número de eventos e com sinal invertido. O cálculo principal soma os n+1 caminhos latentes permitidos pela ausência de esquecimento em um histórico de n respostas. Há um caminho inicialmente dominado, caminhos de transição após cada uma das primeiras n−1 respostas e o caminho que permanece não dominado até a última observação. Log-sum-exp evita underflow.

O cálculo e seu gradiente analítico usam operações vetorizadas, em tempo O(N) e memória O(N) para N eventos da habilidade por avaliação do objetivo. As derivadas somam as contribuições das emissões e da mistura dos caminhos. A equivalência com forward matricial escalado foi verificada em todos os eventos de treino. Sequências unitárias informam a mistura inicial e as emissões, preservadas no ajuste. A transição precisa de evidência entre oportunidades.

O SLSQP do SciPy impõe simultaneamente os limites 0,0001 ≤ L0,T,G,S ≤ 0,9999 e G+S ≤ 0,99. Cada ajuste usa 20 inicializações viáveis determinísticas, limite de 500 iterações e ftol de 1e-9 sobre a NLL média. A tolerância é mais estrita que a referência histórica de 1e-7. A escolha do método permite impor a restrição conjunta durante a otimização. Não há recorte posterior de parâmetros.

As sementes combinam 20261110 com o código da habilidade. Todas as inicializações, objetivos, gradientes, mensagens, contagens de iteração e curvas foram gravadas. O resultado inclui a verossimilhança total e a NLL média. O status do otimizador é um critério numérico e a estabilidade requer os diagnósticos do relatório próprio.

[Documentação oficial do SLSQP](https://docs.scipy.org/doc/scipy/reference/optimize.minimize-slsqp.html)

## Parâmetros efetivamente estimados

O JSON preserva os valores de ponto flutuante completos. O CSV reúne suporte, parâmetros, validação e intervalos bootstrap. A tabela abaixo arredonda apenas a apresentação.

| Habilidade | Alunos | Eventos | L0 | T | G | S | Log-verossimilhança |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 4 | 162 | 1307 | 0.717978 | 0.241670 | 0.221491 | 0.226965 | -764.11034 |
| 8 | 255 | 1314 | 0.605677 | 0.426476 | 0.424419 | 0.052173 | -472.97707 |
| 11 | 392 | 2810 | 0.698692 | 0.281242 | 0.101488 | 0.196159 | -1560.50336 |
| 13 | 337 | 1015 | 0.720086 | 0.030906 | 0.150578 | 0.275764 | -654.06343 |
| 16 | 245 | 585 | 0.931103 | 0.339111 | 0.000100 | 0.135225 | -275.04527 |
| 17 | 294 | 2494 | 0.631688 | 0.046342 | 0.233663 | 0.263081 | -1578.68322 |
| 18 | 631 | 4342 | 0.866115 | 0.111179 | 0.176179 | 0.171520 | -2206.38209 |
| 25 | 311 | 1047 | 0.881085 | 0.073317 | 0.105438 | 0.217887 | -607.37630 |
| 27 | 193 | 4724 | 0.641654 | 0.015845 | 0.436973 | 0.291137 | -3065.35386 |
| 39 | 183 | 860 | 0.951910 | 0.100581 | 0.077635 | 0.279676 | -521.09304 |
| 40 | 180 | 1308 | 0.927307 | 0.165092 | 0.212286 | 0.282970 | -799.91133 |
| 46 | 272 | 3228 | 0.726429 | 0.071588 | 0.324423 | 0.208406 | -1839.21534 |
| 47 | 853 | 13217 | 0.648810 | 0.014221 | 0.406238 | 0.209301 | -8083.32741 |
| 49 | 577 | 3514 | 0.777732 | 0.061332 | 0.393583 | 0.114209 | -1815.84429 |
| 50 | 597 | 4216 | 0.705118 | 0.070195 | 0.525225 | 0.051644 | -1800.71845 |
| 51 | 321 | 1412 | 0.527820 | 0.064713 | 0.756619 | 0.015582 | -517.83657 |
| 54 | 159 | 648 | 0.717508 | 0.389971 | 0.118681 | 0.168946 | -358.78686 |
| 58 | 209 | 1296 | 0.707186 | 0.106785 | 0.522358 | 0.082650 | -547.75623 |
| 61 | 521 | 2780 | 0.620268 | 0.218981 | 0.179862 | 0.155924 | -1545.94517 |
| 65 | 258 | 2332 | 0.516114 | 0.272357 | 0.100507 | 0.246283 | -1408.51636 |
| 67 | 556 | 3806 | 0.600191 | 0.149513 | 0.312651 | 0.215001 | -2308.33926 |
| 70 | 607 | 2877 | 0.656286 | 0.304500 | 0.016474 | 0.247577 | -1742.93975 |
| 75 | 228 | 1797 | 0.807819 | 0.099694 | 0.407745 | 0.102934 | -771.34079 |
| 76 | 339 | 2174 | 0.402033 | 0.133432 | 0.044674 | 0.367512 | -1264.59783 |
| 77 | 473 | 4200 | 0.435161 | 0.136519 | 0.065499 | 0.189207 | -2227.40158 |
| 79 | 475 | 5621 | 0.494369 | 0.034371 | 0.422915 | 0.136404 | -3356.29977 |
| 81 | 421 | 2199 | 0.671572 | 0.095471 | 0.159738 | 0.357113 | -1455.53653 |
| 82 | 183 | 1247 | 0.588281 | 0.261239 | 0.273324 | 0.100972 | -585.75989 |
| 83 | 190 | 1953 | 0.322199 | 0.190027 | 0.215349 | 0.205263 | -1145.56410 |
| 84 | 113 | 478 | 0.000100 | 0.519114 | 0.580100 | 0.090509 | -218.06485 |
| 85 | 430 | 2080 | 0.845460 | 0.099446 | 0.378862 | 0.068977 | -805.23262 |
| 86 | 435 | 2031 | 0.910553 | 0.173638 | 0.082118 | 0.181910 | -1041.50108 |
| 91 | 149 | 461 | 0.954517 | 0.176678 | 0.000100 | 0.297758 | -288.13317 |
| 92 | 280 | 900 | 0.787473 | 0.025272 | 0.100736 | 0.378836 | -572.70343 |
| 94 | 247 | 1111 | 0.910757 | 0.032571 | 0.065349 | 0.302268 | -683.33219 |
| 96 | 196 | 575 | 0.915218 | 0.174800 | 0.060189 | 0.270862 | -357.42362 |
| 101 | 223 | 976 | 0.383389 | 0.224713 | 0.391784 | 0.205371 | -618.47747 |
| 276 | 237 | 1352 | 0.756791 | 0.106160 | 0.378087 | 0.077213 | -634.87189 |
| 277 | 858 | 8689 | 0.691850 | 0.011451 | 0.382151 | 0.195517 | -5324.08756 |
| 278 | 458 | 2893 | 0.673312 | 0.071968 | 0.134537 | 0.174171 | -1585.37403 |
| 279 | 632 | 4804 | 0.886036 | 0.077673 | 0.206361 | 0.140058 | -2216.51831 |
| 280 | 938 | 7745 | 0.773836 | 0.080090 | 0.108869 | 0.198094 | -4153.59127 |
| 294 | 140 | 582 | 0.682844 | 0.235911 | 0.031614 | 0.291102 | -366.30458 |
| 297 | 191 | 688 | 0.668499 | 0.335870 | 0.098317 | 0.297486 | -452.13975 |
| 301 | 196 | 1054 | 0.587599 | 0.283663 | 0.031664 | 0.299660 | -668.99425 |
| 303 | 212 | 965 | 0.625874 | 0.198380 | 0.187123 | 0.309155 | -644.05577 |
| 307 | 233 | 603 | 0.973099 | 0.000100 | 0.219192 | 0.118976 | -244.34408 |
| 308 | 133 | 568 | 0.000100 | 0.126703 | 0.502451 | 0.122900 | -379.10711 |
| 309 | 465 | 1557 | 0.915606 | 0.082574 | 0.045111 | 0.250638 | -911.48786 |
| 310 | 458 | 2321 | 0.549475 | 0.178882 | 0.256950 | 0.229583 | -1465.33224 |
| 311 | 687 | 12572 | 0.652856 | 0.034384 | 0.282230 | 0.256054 | -7635.72490 |
| 312 | 286 | 3481 | 0.447704 | 0.093459 | 0.256539 | 0.221417 | -2132.84968 |
| 322 | 157 | 787 | 0.902305 | 0.107678 | 0.000100 | 0.384011 | -509.83477 |
| 323 | 133 | 672 | 0.812926 | 0.978547 | 0.000100 | 0.075152 | -219.47919 |
| 325 | 236 | 1441 | 0.460805 | 0.149422 | 0.092689 | 0.407687 | -915.12352 |
| 368 | 225 | 1383 | 0.560919 | 0.052854 | 0.364121 | 0.126741 | -861.54893 |

## Reprodução e ambiente

O treinamento de referência usou Python 3.14.0, NumPy 2.4.3 e SciPy 1.17.1. O ambiente limpo foi criado com venv e dependências instaladas. Uma cópia isolada reexecutou 1.120 inicializações nas 56 habilidades. A maior diferença de parâmetro observada foi 0.0, e a maior diferença de NLL média foi 0.0. As threads BLAS e OpenMP foram fixadas em 1. requirements-lock.txt registra as dependências da verificação limpa.

O processamento de diagnóstico e as evidências são registrados com versões e hashes. O modelo é serializado em JSON e a API de inferência verifica versão, convenção de estados e restrições.
