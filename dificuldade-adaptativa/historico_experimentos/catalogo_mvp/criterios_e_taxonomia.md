# Critérios e taxonomia

Aplicamos a triagem aos 2.971 IDs de 2009 a 2024. A base foi aberta para leitura e nenhuma classificação de origem foi substituída. Todos os IDs recebem exatamente um grupo, por ordem de precedência D, C, A e B.

| Grupo | Evidência exigida | Uso |
| --- | --- | --- |
| D | Bloqueio de origem, anulação, campo essencial inválido ou incompatibilidade grave observada entre comando e opções | Bloquear a exibição |
| C | Falta de vínculo ou evidência de conteúdo, suspeita de rótulo, duplicidade textual, dependência de recurso ou alerta de qualidade ou TRI. Também recebe itens fora do piloto anterior sem evidência nova de recuperação | Revisar antes de exibir |
| A | Pertence ao piloto anterior, passa na triagem e tem parecer técnico item a item sobre o texto, as alternativas, o gabarito, o assunto e a habilidade | Demonstração interna supervisionada, condicionada à conferência dos direitos |
| B | Pertence ao piloto anterior, passa na triagem e carece de parecer individual suficiente para A | Reserva por área. Conferir o texto e os direitos antes de qualquer exibição. Sem filtros por assunto ou habilidade |

O script verifica unicidade, origem, texto não vazio, cinco alternativas A–E e gabarito válido. Enunciados repetidos após normalização e referências a contexto em comandos curtos são sinais de revisão. O script consulta a lista de bloqueios, o recorte textual anterior, os recursos cadastrados e os estados de qualidade. Um recurso listado ou a ausência no recorte textual basta para remeter a C. Recursos visuais não foram abertos. A ausência de imagem no cadastro não garante que a questão seja autossuficiente. A leitura dirigida, registrada separadamente em `evidencias.json`, também identifica exemplos desse problema.

- **Habilidade e competência.** A chave oficial é área mais habilidade. A competência decorre do descritor na matriz. A existência do código é uma verificação estrutural. O status tabular e a leitura dirigida são evidências separadas.
- **Assunto e subassunto.** Usamos os rótulos originais como hipóteses, preservando os níveis mais amplos e específicos. A taxonomia complementar proposta na auditoria anterior está em `revisao_pedagogica/taxonomia_proposta.json`, em caráter experimental. Uma divergência como Geometria em um comando que pede variância fica em revisão. Regras por palavra não demonstram correspondência.
- **TRI.** Os parâmetros a, b e c representam discriminação, dificuldade e acerto casual no modelo de origem. Sinalizamos registros sem conferência tabular ou com a < 0,25, |b| > 5 ou c fora de 0 a 0,35. São limiares conservadores de triagem, sem reclassificar dificuldade e sem excluir da base. A escala entre provas e anos não foi verificada para cortes comuns.
- **Direitos.** Os 2.971 registros têm a publicação marcada para revisão. O status não equivale a autorização. O catálogo A é uma proposta para teste interno, sujeita às condições da instituição e às permissões aplicáveis aos itens escolhidos.

O trecho textual em uma linha de triagem é uma pista para conferência. Somente as linhas com parecer técnico específico tiveram leitura dirigida nesta rodada. A confiança declarada em A é plausibilidade técnica. Para os demais itens, o grupo e os alertas indicam a ação possível. Não houve certificação pedagógica humana.
