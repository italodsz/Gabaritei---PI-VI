# Candidata histórica sensível ao item

`bkt_politica_1_4_0.09` foi preservada com código, parâmetros e catálogo de ensaio. Ela **não é o mesmo modelo** dos 56 BKT clássicos das missões BKT01–04. Os parâmetros globais externos e a transformação de emissões com âncoras sintéticas estão em viabilidade/fechamento.json e correcao_adaptativa/rodada.py; a política usa mínimo 4 famílias, intervalo 1 e margem .09. Não misturar com a política da Missão04 (.4/.8, mínimo 5, margem .05, intervalo 5).

Para repetir apenas os testes funcionais, em uma cópia desta pasta, com requirements-research.txt instalado:

```
python -B correcao_adaptativa/teste_offline_bkt_margem/test_catalogo_bkt.py
```

Esse teste grava resultados no diretório da bancada, portanto preserve a cópia congelada. O teste C tem bloqueio documental por falta de faixa local MT; deve continuar assim. As respostas de todos os funcionais são sintéticas. `simular.py` permite repetir a bancada antiga com respostas sintéticas, mas não foi executado nesta entrega e não constitui validação real. Esta cópia não é o runtime recomendado para integração; preserva as decisões e permite auditoria da arquitetura anterior, sem descartá-la ou declará-la homologada.
