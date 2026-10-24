# Paridade com o front em desenvolvimento (Vercel)

Análise feita pelo grupo em 24/10/2026, comparando este frontend (`gabaritei-web`, construído seguindo `docs/FRONTEND_PROMPT.md`) com outra versão do front publicada em `https://gabaritei-frontend-pi-vi.vercel.app`, aberta no Chrome.

Telas vistas naquela versão: Início, Questões (montar lista), sessão de questões, Simulados, Novo simulado (3 passos), prova, resultado, revisão, Histórico, Desempenho, Perfil, Configurações, busca Ctrl K e menu do usuário. Login/criar conta não foram abertos. O chrome-devtools (MCP) não estava instalado na sessão que fez a análise; foi usado Claude in Chrome e `getComputedStyle` só pra identificar o que **não** copiar.

**Importante**: essa outra versão (Vercel) usa fontes, paleta e elementos de gamificação que `docs/FRONTEND_PROMPT.md` proíbe explicitamente (seção 6, regra 9, etc.) — ou foi gerada por um prompt diferente, ou o design system foi ignorado por quem a construiu. Nada deste documento é uma recomendação de copiar aquele visual; é só um mapeamento de ideias estruturais (o quê existe) separado do que não deve ser copiado (como está estilizado).

## 1. O que vale copiar (estrutura e elementos, sem a tipografia)

### Navegação e casca
- Barra lateral: Início, Questões, Simulados, Histórico, Desempenho. Cartão fixo no rodapé com "lista em andamento" e Foguinho.
- Busca global (Ctrl K) em paleta de comandos: páginas e depois matérias, assuntos, questões.
- Menu do usuário: perfil, configurações, tema (claro, escuro, automático), sair.
- Aviso de conteúdo demonstrativo e etiqueta "Questão demonstrativa · ref. ano" em cada questão.

### Início
- Bloco principal "Seu próximo passo": retomar de onde parou, com progresso, mais um botão para a recomendação automática.
- "Continue de onde parou": lista de atividades interrompidas (lista ou simulado) com barra de progresso.
- Quatro números: questões resolvidas (com "nesta semana"), taxa de acertos, sequência (com melhor marca), simulados concluídos.
- Meta da semana em anel (21 de 80), evolução de 14 dias, recomendações com motivo numérico ("Acerto de 38% em 13 questões deste assunto"), atalhos das matérias frequentes, e três sugestões (refazer erradas, simulado rápido, seleção automática).

### Questões (montar lista)
- Abas: Montar lista, Recomendadas, escolha automática.
- Passos: matéria (agrupada por área, com contagem), assuntos (com o % de acerto do aluno como atalho de dificuldade), quantidade (5, 10, 15, 20, 30), ano (filtro opcional).
- Painel "Resumo da lista" fixo, com "disponíveis no acervo" e chave "cronômetro visível".

### Sessão de questões
- Barra superior: voltar, título, "Questão 1 de 10 · 1 respondida", cronômetro com ocultar, pausar, modo foco, finalizar. Barra fina de progresso.
- Grade de navegação 1 a 10 com legenda (acerto, erro, revisar) e contador "1/1 acertos".
- "Marcar para revisão" (M) e "Favoritar" (F). Painel de atalhos: A a E, Enter, setas, P.
- Correção na hora: alternativa certa com ícone e rótulo de texto ("Sua resposta · correta"), explicação que pode ser ocultada, "Habilidade avaliada".

### Simulado
- Assistente em 3 passos: Tipo (por edição, ou personalizado), Configuração (áreas, 10 a 90 questões, critério equilibrado, foco em dificuldades ou aleatório, língua estrangeira), Instruções. Resumo lateral com questões e duração.
- Instruções claras: tempo, em branco conta como erro, pode alterar até finalizar, pausa, aviso nos últimos 15 minutos, cronômetro ocultável.
- Prova: grade de questões agrupada por área, legenda respondida, em branco, marcada. Modal ao finalizar avisando quantas ficaram em branco.
- Resultado: anel de acertos, acertos, erros, em branco, média por questão, comparação com o simulado anterior, resultado por área com alternância Gráfico/Tabela, recomendações por assunto, evolução entre simulados, botão "Praticar erros".
- Revisão: filtros Todas, Erradas, Em branco, Certas, grade por área com cores, explicação e habilidade.

### Histórico
- Abas Atividades, Erradas, Favoritas, Para revisar. Filtros: tipo, situação, matéria, período, resultado. Linha com título, situação (concluída ou interrompida), data, duração, acertos e %. "Mostrar mais".

### Desempenho
- Alternância Diário, Semanal, Mensal. Quatro números com variação. Comparação com o período anterior. Volume por dia. Distribuição por área. Acerto por matéria com alternância Barras/Tabela. Assuntos de maior dificuldade e melhor desempenho (com botão Praticar). Calendário de atividades de 20 semanas. Metas pessoais editáveis. Recomendações de revisão.

### Configurações
- Tema, reduzir animações (com prévia), cronômetro separado para listas e simulados, quantidade habitual de questões, preferências do primeiro uso, redefinir dados de demonstração.

## 2. O que NÃO copiar (conflita com nossas regras)

| Item no front (Vercel) | Por que não |
|---|---|
| Fontes Inter e Bricolage Grotesque | Nosso design system usa Source Serif 4, IBM Plex Sans e IBM Plex Mono. |
| Dourado como cor de botão principal e barra lateral com gradiente radial, um elemento com desfoque de fundo | Nossa regra: âmbar só para IA, sem gradiente, sem vidro. Primária é o verde floresta. |
| Seis paletas (Ameixa roxa, Neon com violeta, Terracota, Editorial, Oceano) | Fora de escopo, e roxo/violeta é proibido no nosso sistema. |
| Rótulos em caixa alta com espaçamento ("PRÁTICA", "NOVO SIMULADO", "RESUMO DA LISTA", "SEU PRÓXIMO PASSO") | Nossa regra proíbe. |
| "Nota estimada 332" no resultado (um simulado com 1 acerto em 30 mostra 332) | Número em escala ENEM tirado do % de acerto, mesmo com aviso. Nossa regra: nada de nota ENEM; proficiência só por 3PL e só com volume mínimo. |
| Conquistas (13 medalhas bronze, prata, ouro; "10/13" no cabeçalho do perfil) | Escopo: só Foguinho e Combo como engajamento. Sem XP, níveis, moeda ou medalhas. |
| "IA escolhe por mim" para regras locais | A própria página diz "regras locais e transparentes". O rótulo IA engana e mistura com o âmbar da IA. |
| Perfil com escola, cidade e "sobre você" | LGPD e menores de 18 (RNF07): coletar o mínimo. |
| Dados no localStorage (`gabaritei:v1`) | Nosso contrato é a camada de API tipada com mock e `NEXT_PUBLIC_API_MODE`. |
| Cronômetro do simulado pausa ao sair da tela | Decisão do grupo (simulado real não pausa). |

## 3. O que nosso prompt exige e o front (Vercel) ainda não tem

- Critério da recomendação visível em cada questão do treino (RF11) e os quatro modos (tema, habilidade, nível, progressão com Combo).
- Combo e escada de dificuldade (RF18). Lá só há sequência de dias.
- Habilidade H1 a H30 e área como eixo. O front deles usa matéria e assunto próprios ("Cinemática") e habilidade em texto livre.
- Proficiência por área e o estado "dados insuficientes" (RF09, RF10).
- Banco de questões navegável com filtros na URL e questão avulsa (RF04). O `/questoes` deles hoje é só montador de lista.
- Cartão-resposta ENEM (A a E, 3 colunas) como elemento da marca no resultado.
- Imagens com alt e audiodescrição (RF05) e estado de resolução ausente (RF07). Não apareceu questão com figura na análise.
- Avisos de faixa ampliada, reapresentação e banco esgotado.
- Login, criar conta, termos e privacidade (não foram abertos na análise).

**Estado neste repositório (`gabaritei-web`) em relação a essa lista, ao fim da Fase 1**: todos os itens acima já existem aqui — critério de recomendação (`CriterioRecomendacao`), os 4 modos + Combo, habilidade com código (ainda com ressalvas documentadas em `docs/PENDENCIAS.md`, item 6), proficiência por área com `dados_insuficientes`, banco de questões com filtros na URL (`/questoes`) e questão avulsa (`/questoes/[id]`), `CartaoResposta` no resultado do simulado, figura com alt/audiodescrição e aviso de resolução ausente, avisos de faixa/reapresentação/banco esgotado (ver seção 10 do prompt), e entrar/criar conta/termos/privacidade.

## 4. Ajustes sugeridos nos prompts (decisão do grupo, não da IA)

Sugestão discutida: incluir na Fase 1 o bloco "Continue de onde parou" no Início (hoje só existe "Retomar" com um único item, não uma lista), atalhos de teclado e "Favoritar" na sessão de questões, aviso de faixa/Combo no lugar de um contador cru de acertos, modal de finalizar contando em branco (**já existe** no simulado desta fase), e filtros Todas/Erradas/Em branco/Certas na correção (**já existe**, como Todas/Erradas/Em branco/Marcadas no `CartaoResposta`).

Sugestão pra Fase 2: busca global Ctrl K; abas Favoritas e Para revisar no histórico; alternância Diário/Semanal/Mensal; comparação com período anterior; modo foco.

Não incluir em nenhuma fase: conquistas/medalhas, seletor de paletas, nota ENEM estimada, rótulo "IA" em regras locais que não são de IA.

Pergunta em aberto do grupo: qual ferramenta recebeu o prompt que gerou a versão do Vercel? O resultado usa fontes, paleta e conquistas que `docs/FRONTEND_PROMPT.md` proíbe explicitamente, então ou foi outro prompt, ou o design system foi ignorado por quem construiu.
