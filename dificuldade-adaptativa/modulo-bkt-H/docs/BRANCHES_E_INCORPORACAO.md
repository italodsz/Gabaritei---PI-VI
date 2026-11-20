# Inspeção remota e incorporação posterior

Consulta GET ao GitHub em 11/11/2026, sem checkout, fetch ou escrita em qualquer branch. A URL real confirmada é https://github.com/italodsz/Gabaritei---PI-VI . A URL com travessão do pedido não é a identidade canônica do repositório.

Foram inspecionadas as árvores recursivas completas de **todas as sete branches**, sem truncamento, os cinco commits mais recentes de cada uma e arquivos relevantes de código/documentação. Isso é um levantamento de componentes e contratos, não auditoria linha a linha de cada arquivo de todos os integrantes. O snapshot bruto inclui caminhos, hashes Git e commits em `evidence/github/snapshot.json`.

| Branch | Commit conferido | Arquivos blob | Conteúdo e preservação |
|---|---|---:|---|
| dataset | `7e720fa876beb7249adab2f05d3ecf33ae5a2c51` | 180 | Base de trabalho congelada em Dataset/base_trabalho; preservar. |
| dificuldade-adaptativa | `e00f20c0d534a2bdd1a845d71cb791a16e3f4212` | 178 | Fase 1 publicada; frontend Next.js histórico; nenhum BKT publicado. |
| front-end | `1ada7f3a2e5f1d80fc9d5c9e08df4aaf2a52c461` | 85 | Frontend Canvas estático e learning-engine/regras locais; não é backend BKT. |
| main | `90d54984c21982c89e0d645ecfa78b1442b813b9` | 78 | Frontend Canvas estático e learning-engine/regras locais; não é backend BKT. |
| paridade-p1 | `50060d0f5ff8494226905c2b0c023c84214983a7` | 298 | Trabalho visual histórico; preservar. |
| recomendador | `bd74deaa2d5a1e87acded278df4e1a8d393e725b` | 385 | Seleção semântica de Ítalo, modelos/vetores, avaliações e catálogo titulo_area; preservar. |
| wardrobe | `ea3f28d22f805dea191e12130e14a3034099cf43` | 35 | Arquivo de versões, partes ZIP e base de João; não incorporar ao módulo. |

A branch de destino está em **e00f20c0d534a2bdd1a845d71cb791a16e3f4212**, posterior ao commit de origem bc77b0a. O único componente de dificuldade publicado são os nove arquivos da auditoria Fase 1. O README menciona experimento Fase 2 cujos caminhos não existem nessa árvore: descrição antiga não comprova publicação. Os BKT das missões aqui recuperados estavam nas entregas locais, não no remoto.

## Regra de extração

O ZIP contém exclusivamente `dificuldade-adaptativa/modulo-bkt-H/**`, pasta ausente em todas as sete árvores verificadas. Na raiz da cópia local da branch de destino, extraia preservando essa estrutura. Não extraia dentro de dificuldade-adaptativa, pois duplicaria o caminho. Não substitua a raiz do repositório.

Antes da extração, se modulo-bkt-H já existir por outro trabalho posterior, pare e compare; o snapshot não garante ausência futura. Confirme manualmente a branch e o status local. Os arquivos da Fase 1, frontend, Dataset e recomendador não estão no ZIP e não serão substituídos. A conferência automática de sobreposição registra zero colisões contra o snapshot da branch.

A integração futura deve conciliar o frontend Canvas atual de main/front-end com o contrato Next.js histórico da branch de destino. O motor Python não é executável diretamente no navegador. Não há backend BKT identificado nas árvores. O servidor server.mjs serve arquivos estáticos e não implementa autenticação/correção BKT.

Nenhum commit novo é fornecido: esta é uma entrega de arquivos para revisão e publicação posterior pelo responsável. Não existe PR ou merge criado por esta tarefa. Ao publicar mais tarde, revisar o diff apenas desta pasta e manter os dados individuais fora do Git.
