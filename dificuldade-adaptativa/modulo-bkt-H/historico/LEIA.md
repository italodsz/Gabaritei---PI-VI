# Memória científica preservada

As Fases BKT01–03 são missões do treinamento externo; não são autorização de avanço das Fases 3–5 do produto. Fontes e relatórios congelados foram recuperados dos pacotes locais identificados em `docs/proveniencia.json`.

`vendor/fase01` contém preparação original; `vendor/fase02` contém o estimador original. O caminho operacional de reprodução é o descrito em `docs/REPRODUCAO.md`. `historico/fase03/src` e os testes históricos preservam a implementação auditada para consulta; seus caminhos originais de entrada exigem a estrutura e os gates históricos e não devem ser executados como suíte atual. A avaliação portável atual usa `comparar.py` e os testes A–E.

Arquivos idênticos aparecem uma vez: o inventário indica `shared_path`. Os relatórios antigos mantêm sua conclusão e data; as correções e o parecer vigente estão em `docs/RELATORIO_TECNICO.md`. As métricas antigas não foram recalculadas nesta montagem, salvo os testes de conferência explicitamente registrados. Não há ZIPs aninhados, CSV individual de alunos, chave privada ou banco de alunos neste pacote.
