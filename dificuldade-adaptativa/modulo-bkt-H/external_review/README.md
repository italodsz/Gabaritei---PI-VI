# Auditoria externa da Missão BKT 04

Esta entrega incorpora o código necessário para uma reprodução a partir apenas do CSV oficial. Os três ZIPs anteriores são referências identificadas no inventário, mas seus diretórios privados e a chave de pseudônimo não são necessários para o novo caminho.

1. Confira o SHA256SUMS.txt desta entrega e o SHA-256 do CSV corrigido colapsado.
2. Crie um ambiente virtual limpo e instale requirements-lock.txt.
3. Execute executar.py com o CSV e uma pasta local vazia.
4. Confira 346.860 registros brutos, 214.417 eventos, 4.003 estudantes, 56 habilidades e split 2.802/601/600.
5. Confira os oito hashes canônicos contra references/identidade_logica.json. Os hashes individuais podem diferir dos antigos e isso deve ser declarado.
6. Compare os 56 ajustes, com tolerância de 1e-4 nos parâmetros e 1e-8 na perda. Confira as 20 inicializações por habilidade e a seleção por treino.
7. Recalcule a comparação pareada contra histórico suavizado usando respostas individuais e bootstrap por estudante.
8. Confira a operação dos 20 modelos permitidos, o fallback dos 36 restantes e todos os casos ENEM sem mapeamento.
9. Rode A/D sem dados, a suíte completa com dados e a suíte completa sem dados. Verifique a distinção entre aprovado e bloqueado.
10. Confira persistência, replay, transações, concorrência, ID canônico do servidor, ordens com saltos e aceite explícito.
11. Compare o comportamento das duas políticas na validação. A frequência de sugestões não mede efeito pedagógico.

O protocolo desta missão descreve uma análise posterior ao teste original. O registro de hash no chat é uma evidência adicional da comunicação desta rodada, sem prova retroativa da cronologia anterior. Uma futura avaliação prospectiva deverá registrar o protocolo em um meio verificável externo antes de observar dados novos.

A auditoria original do Claude foi recebida em PDF e lida integralmente. Uma nova execução pelo Claude ou outra equipe não foi declarada concluída nesta entrega. O relatório atual contém verificações automatizadas e reprodução em ambiente limpo sob a mesma autoria. A revisão humana externa permanece pendente.
