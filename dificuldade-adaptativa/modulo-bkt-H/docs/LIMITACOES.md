# Limitações e pendências acionáveis

1. **Transferência ENEM:** nenhuma associação ASSISTments→ENEM foi validada. Todos os namespaces ENEM usam fallback. Necessário coletar eventos reais e avaliar por área/habilidade antes de treinar/promover modelo local.
2. **Sensibilidade ao item:** o BKT clássico congelado recebe apenas respostas binárias por habilidade; não consome b/a/c. A política usa seu estado, mas não compensa a dificuldade enfrentada. Não declarar que o motor já distingue integralmente errar uma difícil de errar uma fácil.
3. **Adaptação por área:** interface separa MT/LC/CH/CN, porém agrega histórico com Beta(1,1); não há parâmetros BKT por área do ENEM. Resultado agregado não prova domínio de assuntos específicos.
4. **Política:** mínimo 5, margem .05 e cooldown 5 respostas são escolhas experimentais; aumentaram ofertas/reversões no replay. Nenhuma eficácia pedagógica demonstrada. Ausência de violação de consentimento não garante boa sugestão.
5. **Diagnóstico:** dez questões por matéria é decisão de produto; não há seleção/balanceamento ou encerramento de diagnóstico implementados. Dez eventos sintéticos no exemplo não suprem isso.
6. **Estoque:** motor bloqueia oferta para faixa sem estoque, mas depende da contagem correta fornecida pelo chamador. Não escolhe questões nem resolve esgotamento de uma sessão. Há histórico de 2.304 trajetórias esgotadas.
7. **Repetição:** reenvio da mesma tentativa é idempotente; nova tentativa do mesmo item/família pode atualizar de novo. Repetição versus aprendizagem não foi validada. Controle por questão/família e log de exposição pertencem ao futuro backend.
8. **Persistência:** SQLite local comprovado; não existe integração entregue com FastAPI, Supabase, autenticação, RLS ou frontend atual. IDs não devem ser dados pessoais. Recibos não substituem log completo de questões/sessões/TRI.
9. **TRI:** cortes globais históricos diferem de cortes arredondados e do catálogo por área do Ítalo. Não há configuração final única comprovada. Não misturar escalas/anos automaticamente. b classifica item, não aluno.
10. **Incerteza:** gate limita parâmetros com G/S altos, fronteiras, instabilidade e calibração ruim; não fornece garantia individual calibrada. ECE e classes A/B/C são descritivos; não há correção por múltiplas comparações.
11. **Aprendizado contínuo:** atualização Bayesiana do estado individual comprovada no externo; nenhum ciclo produtivo de retreino, promoção, rollback e monitoramento global implementado. SGD histórico é ensaio separado sem ganho consistente.
12. **Validação externa:** nenhuma resposta real de aluno do Gabaritei disponível; simulações, exemplos e ASSISTments não medem aprendizagem ENEM. Missão 05 e fases futuras não executadas nesta entrega.
13. **Anterioridade:** não se recuperou prova externa da data do protocolo histórico; logs/hash locais e declaração de pré-especificação não são registro independente.
14. **Portabilidade:** execução atual em Windows/Python 3.14; documentação para 3.11+ e Linux/macOS não equivale a teste nessas plataformas. Dependências científicas fixadas podem requerer a versão de Python compatível.

Prioridades: conciliar contrato/cortes com Ítalo; construir log autenticado com consentimento e contexto; pilotar com dados reais e revisão pedagógica; só então autorizar ajustes e avaliação temporal independente, incluindo repetição, abstenção, estoque e falsas mudanças. Não há correção definitiva do dataset ou recomendador completo neste pacote.
