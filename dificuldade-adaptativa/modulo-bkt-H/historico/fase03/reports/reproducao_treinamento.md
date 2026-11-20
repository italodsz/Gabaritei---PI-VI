# Reprodução em ambiente limpo

O ambiente virtual novo recebeu as dependências fixadas pela Fase 02. Os 56 modelos foram ajustados novamente em uma cópia isolada, com 20 inicializações, semente 20261110, SLSQP, 500 iterações e ftol 1e-9. Os dados foram os mesmos, identificados pelo gate e pelo manifesto local.

As 56 reproduções foram exatas. O arquivo reproducao_treinamento.csv mostra L0,T,G,S originais e reproduzidos, diferenças absolutas, log-verossimilhanças, NLLs, convergência e inicialização selecionada. As tolerâncias preservadas da Fase 02 são 1e-4 nos parâmetros e 1e-8 na NLL média. Nenhuma habilidade precisou da categoria de equivalência estatística ou de tolerância não nula.

Versões efetivas da reprodução: Python 3.14.0, NumPy 2.4.3, SciPy 1.17.1. O processo usou quatro trabalhadores, com uma thread BLAS e OpenMP por processo. O log registra as 1.120 otimizações principais reproduzidas.
