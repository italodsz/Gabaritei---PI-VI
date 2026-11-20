# 06 · Parecer da Fase 2

**A arquitetura pode ser utilizada como candidata a uma prova de conceito restrita por área e por escala local. O uso adaptativo com estudantes ainda não está demonstrado.** O catálogo tem 41 itens tecnicamente aptos à seleção por faixa local, em três recortes. Só os dois de Humanas têm dez famílias disponíveis se o estudante autorizar faixas mistas e o módulo semântico devolver candidatos suficientes. Nenhum recorte tem dez itens de uma única faixa. Natureza tem nove no melhor recorte. Matemática e Linguagens não têm faixa operacional. Somente um dos 41 possui assunto e habilidade tecnicamente sustentados, insuficiente para adaptar por esses rótulos.

| Requisito | Classificação | Evidência ou lacuna |
| --- | --- | --- |
| Catálogo, faixas, IDs e grupos | Comprovado por artefato | Junção executada nesta revisão, 2.971 IDs e 112 prontos técnicos, com 41 faixas locais |
| Inicialização manual histórica | Comprovado por artefato | Ponto inicial da otimização BKT e âncoras de dificuldade sintéticas explícitos |
| Parâmetros aprendidos do BKT | Demonstrado em dados reais externos | Quatro parâmetros ajustados no ASSISTments e persistidos. A sensibilidade ao item reaproveita esses parâmetros |
| Ajuste supervisionado no ENEM para dificuldade de item | Comprovado por artefato | Delta do BERTimbau e resultados da classificação. Tarefa distinta |
| Ajuste BKT em eventos ENEM do Gabaritei | Inviável com os dados atuais | Sem histórico real de respostas do Gabaritei |
| Estado individual muda com respostas | Comprovado por artefato | Fórmula, código e testes históricos. Falta teste da ligação do catálogo na candidata |
| Atualização global de coeficientes | Demonstrado em dados reais externos | SGD alterou pesos em ensaios separados, sem ganho consistente |
| Configuração BKT + margem congelada | Comprovado por reexecução local relatada | A reexecução anterior recuperou candidata e métricas históricas comuns. O JSON atual tem campos adicionais. Esta rodada não repetiu a simulação |
| Comparação direta com regra simples | Demonstrado apenas em simulação | Ganho entre 11,81 e 17,06 pp nos cenários antigos, com mais falsas mudanças. Zero alterações sem aceite na simulação |
| Diagnóstico de dez itens, respeitando a escolha | Pendente | Cobertura permite um teste restrito em CH com faixas mistas. Falta validar fluxo e disponibilidade de candidatos. Em faixa única, inviável com o catálogo atual |
| Personalização por assunto, subassunto ou habilidade | Inviável com os dados atuais | Um item na interseção entre faixa local e rótulos sustentados. Certificação pedagógica independente não localizada |
| Contrato candidato por ID e revisão | Pendente | Existe prova de conceito com outro modelo. A arquitetura exata carece de teste de contrato e controle de oferta expirada |
| Treino e avaliação conjunta da arquitetura candidata | Pendente | Sem execução integrada com checkpoint, divisão e relatório. Inicialização, inferência e busca de política têm evidências separadas |

**Menor próximo passo.** Um teste offline com os dez IDs de Humanas, mais os controles de falta de itens, repetição, abstenção e aceite. Se passar, comparar a candidata congelada à regra simples com disponibilidade controlada e limite explícito de falsas mudanças. Para discutir aprovação, ainda são necessários confirmação explícita de treino e evidência compatível com a alegação feita. A Fase 2 permanece em revisão. A aprovação da Fase 1 é preservada e as fases posteriores ficam fora desta execução.

### Arquivos

- [01 · Cobertura](01_COBERTURA.md) e [tabela por rótulo](cobertura_por_rotulo.csv).
- [02 · Matriz A–J](02_MATRIZ_TESTES.md) e [IDs preparados](fixtures.json).
- [03 · Arquitetura](03_ARQUITETURA.md).
- [04 · Baselines e artefatos](04_BASELINES_E_ARTEFATOS.md).
- [05 · Plano e comandos](05_PLANO_EXECUCAO.md).
- [Dados por ID](itens_por_categoria.csv) e [log da auditoria tabular](auditoria.log).
