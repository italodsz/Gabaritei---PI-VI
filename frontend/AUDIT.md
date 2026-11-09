# AUDIT — Gabaritei front-end (visant-killer)

> Alvo: o front-end inteiro (`src/`), 17 rotas + onboarding + 404.
> Tier: **T3 Core**. O app cobre onboarding, identidade (conta/perfil), ações destrutivas (sair, apagar histórico, resetar dados) e o fluxo entre várias rotas. Cada rota é uma região **T2**.
> Data: 2026-10-30 · Branch `feature`.

## Placar (primeiro)

| Bloco | Peso | Nota | Por quê |
|---|---|---|---|
| Gate (detectores) | 25 | 18 | Varredura de proibições duras zerada (só exceções documentadas). `impeccable`, `copy-lint` e `noise-scan` **não rodaram** (ver Gates). |
| Verificação (telas abertas) | 25 | 21 | 176 telas + 24 de onboarding/404, 4 larguras × 2 temas × 3 estados, falha de armazenamento. Ficaram de fora: ritmo de espaçamento, sensação a 25% e performance medida. |
| Correções de raiz | 25 | 22 | Todo defeito confirmado foi corrigido na origem (shell, componentes base, tokens, store), com teste de regressão no mais grave. |
| Interrogatório / posicionamento | 25 | 15 | T3 respondido com `file:line`. As duas mudanças de conceito mais fortes (navegação mobile e a promessa "IA") ficaram como **proposta**, não aplicadas. |
| **Total (não oficial)** | 100 | **76** | Rubrica própria: `references/scorecard.md` não veio com a skill. |

O número não é elogio. Até as propostas P1 e P2 serem decididas, a experiência no celular continua sendo a de um app de desktop encolhido.

## Achados (defeitos confirmados, todos corrigidos)

| # | Sev. | Defeito | Causa | Correção (`file:line`) |
|---|---|---|---|---|
| 1 | Crítico | **Toda** rota do app estourava a 390px (108–368px de rolagem horizontal) | O sidebar expandido ocupava a tela estreita. A busca do Topbar tinha largura fixa. O padding do shell era de desktop. | O sidebar recolhe sozinho abaixo de 1024px e o botão de expandir fica oculto (`src/components/navigation/Sidebar.tsx:32-33`, `:82`). Nova consulta compartilhada em `src/hooks/useMediaQuery.ts:19`. A busca agora é fluida (`src/components/navigation/Topbar.tsx:53`). O padding do shell é responsivo (`src/components/layout/AppShell.tsx`). |
| 2 | Crítico | Com `localStorage` bloqueado (modo privado, dados do site bloqueados), o app **não abria** ("This page couldn't load") | O `persist` do zustand não cria `.persist` quando o storage falha, e o `rehydrate()` quebrava (`src/components/providers/AppProviders.tsx:12`) | O storage cai para memória quando o `localStorage` falha (`src/stores/appStore.ts:20`, `:215`). Teste de regressão em `src/stores/appStore.test.ts`: falha sem a correção e passa com ela. |
| 3 | Alto | Na sessão de questões e no simulado, o painel lateral espremia a questão abaixo de 1024px | O painel era fixo, sem modo estreito | Abaixo de 1024px o painel vira gaveta com scrim e tem botão próprio (`src/features/practice/PracticeSessionPage.tsx:93`, `:396`; `src/features/simulations/ExamPage.tsx:79`). Os cabeçalhos escondem rótulos secundários no celular. |
| 4 | Alto | Tabelas largas estouravam a página | Faltava contêiner de rolagem | `overflow-x-auto` + `min-w` em `src/features/simulations/SimulationsPage.tsx:179`, `src/features/simulations/SimulationResultPage.tsx:185` e `src/features/performance/PerformancePage.tsx:264` |
| 5 | Médio | Restavam estouros e textos cortados a 390px em `/questoes/resultado`, `/simulados/revisao`, `/configuracoes` e `/perfil` | Problemas nos componentes base | SegmentedControl: rola em vez de estourar (`src/components/ui/Form.tsx:147`). Badge: trunca (`src/components/ui/Badge.tsx:50`). Cards de estatística: empilham no celular (`src/features/practice/PracticeResultPage.tsx:119`, `src/features/simulations/SimulationResultPage.tsx:143`). Heróis: sem `min-w` no celular (`PracticeResultPage.tsx:87`, `src/features/profile/ProfilePage.tsx:67`). Indicador de etapas: quebra linha (`src/features/simulations/NewSimulationPage.tsx:113`). |
| 6 | Médio (a11y) | Leitor de tela lia **"0"** nos números animados até o elemento entrar na tela | A contagem só começa ao ficar visível (`useInView`) | O valor final vai em `sr-only` e a contagem fica `aria-hidden` (`src/components/ui/Progress.tsx:158`) |
| 7 | Médio | **Duas portas** para a mesma coisa na mesma tela | 1) Havia um botão de tema no Topbar e também um seletor de tema no menu do usuário. 2) A sugestão "Seleção automática" repetia o "IA escolhe por mim" do herói da home. | 1) Botão duplicado removido; ficou só o seletor no menu (`src/components/navigation/Topbar.tsx:119`). 2) A sugestão virou "Questões para revisar" (`src/features/home/HomePage.tsx:405`). |
| 8 | Médio | Estado vazio sem próximo passo ("nada em andamento") | Faltava ação | "Tudo em dia" + link para Histórico (`src/features/home/HomePage.tsx:195`) |
| 9 | Médio | Proibições duras violadas (ver tabela abaixo) | Valores soltos e efeitos decorativos | Tokens novos em `src/styles/globals.css` (`--ink-raised*`, `--ink-line`, `--ink-track`, `--on-status`, `--figure-bg`, `--knob`, tokens de medalha) e substituição em todos os `.tsx` |
| 10 | Baixo | `cursor` padrão em controles com `role` | Faltava regra global | `src/styles/globals.css:320` |
| 11 | Segurança | `next build` abortava com `SecurityFatalError` na 16.4.0 | Versão vulnerável | `next` e `eslint-config-next` atualizados para `^16.4.3` (`package.json`). O build recomenda rodar `next upgrade --agent=security`: decisão do dono do repo. |

### Proibições duras: antes e depois

| Regra | Antes | Depois |
|---|---|---|
| Glifos de seta (setas Unicode) | 3 (`CommandPalette`, atalhos da sessão) | 0: ícones `ArrowUp`/`ArrowDown`/`ArrowLeft`/`ArrowRight` do Lucide |
| Hover com `scale` | 7 | 0: trocado por cor, sombra ou anel |
| `transition-all` | 3 | 0: propriedades explícitas |
| `duration` ≥ 300 em interativo | 6 | 0 (máx. 200) |
| `backdrop-blur` fora de diálogo | 9 | 0: superfícies sólidas. Sobram `Modal`, `CommandPalette` e 2 scrims de pausa (exceções abaixo). |
| hex/rgb cru / `white`/`black` em classe | ≈38 | 0: tudo vai por token. Sobra só a exceção de `theme-color`. |
| Overlay `nowrap` sem `max-width` | 1 (tooltip do sidebar) | 0: `w-max max-w-[220px]` (`Sidebar.tsx:127`) |
| Duas portas na mesma tela | 2 | 0 |

### Exceções documentadas no código

- `src/app/layout.tsx:15`, **EXCEÇÃO ao token/hex**: a meta `theme-color` é lida antes do CSS e não aceita `var()`.
- `src/features/practice/PracticeSessionPage.tsx:373` e `src/features/simulations/ExamPage.tsx:280`, **EXCEÇÃO ao noise/backdrop-blur**: o scrim de pausa age como diálogo e esconde a questão com o tempo parado.
- `src/components/ui/Form.tsx:290` e `src/components/animations/Celebration.tsx:55`, **EXCEÇÃO ao killer/svg-desenhado**: o check é traçado com `pathLength` e o Lucide não expõe o path.
- Outros SVGs próprios (logo, ilustrações, medalha, anel de progresso, gráficos) são arte de marca e visualização de dados, não ícones substituíveis.

## Gates

| Gate | Rodou? | Como |
|---|---|---|
| Raízes primeiro (Passo 0) | Sim | Shell, componentes base, tokens e store foram corrigidos antes das folhas |
| `tsc --noEmit` | Sim | 0 erros |
| ESLint | Sim | 0 avisos |
| Vitest | Sim | 44/44 (eram 43; +1 de regressão) |
| `next build` (prod, sem dev rodando) | Sim | ok |
| Token / hex | Sim (fallback próprio) | grep de hex/rgb/`white`/`black` em `.tsx` |
| Proibições duras | Sim (fallback próprio) | grep por regra, resultado na tabela acima |
| `impeccable` | **Não** | `npx impeccable` foi bloqueado pela política do ambiente (código externo) |
| `killer-scan`, `noise-scan`, `copy-lint`, `refine-scan`, `dist-scan`, `verify-screens`, `corta`/`ritmo` | **Não** | Os scripts não vieram com a skill. Substituídos por Playwright próprio: estouro do documento, texto cortado, console, HTTP. |
| `visant-frontend`/`motion`/`copy`, `revenue-centric-design`, `slop-catalog`, `scorecard`, `devils-advocate.md` | **Não** | Referências ausentes. O julgamento e o banco de perguntas abaixo são próprios. |
| Ritmo de espaçamento medido | **Não** | Sem `ritmo()`; revisão só visual nos screenshots |
| Sensação a 25% (DevTools Animations) | **Não** | Sem navegador interativo |
| Performance (Lighthouse/peso de bundle) | **Não** | Não medido |

## Superfícies

| Rota | Região | Superfície | Variável de negócio |
|---|---|---|---|
| `/entrar` | T2 | A aquisição | visitante que vira sessão ativa (taxa de login / demo iniciada) |
| `/cadastro` | T2 | A aquisição | contas criadas por visita |
| `/recuperar-senha` | T2 | C confiança | contas recuperadas sem suporte |
| `/onboarding` | T3 | A, depois B | ativação: primeira atividade iniciada na mesma sessão |
| `/inicio` | T2 | B trabalho | retorno D1/D7 e meta semanal batida |
| `/questoes` | T2 | B trabalho | listas iniciadas por visita |
| `/questoes/sessao/[id]` | T2 | B trabalho | questões respondidas por sessão; taxa de abandono |
| `/questoes/resultado/[id]` | T2 | B trabalho | erros refeitos ("Refazer erros") |
| `/simulados` | T2 | B trabalho | simulados iniciados |
| `/simulados/novo` | T2 | B trabalho | configuração que vira prova iniciada |
| `/simulados/prova/[id]` | T3 | B + C (entrega irreversível, tempo) | simulados concluídos vs. abandonados |
| `/simulados/resultado/[id]` | T2 | B trabalho | revisões abertas após a nota |
| `/simulados/revisao/[id]` | T2 | B trabalho | erros revisados por simulado |
| `/historico` | T2 | B + C (apagar) | questões marcadas que foram revisadas |
| `/desempenho` | T2 | B trabalho | metas definidas e atingidas |
| `/perfil` | T2 | C (dados de identidade) | perfil completo |
| `/configuracoes` | T3 | C (resetar dados, sair) | perda acidental de dados = 0; preferências ajustadas |
| `404` | T1 | A/B | retorno a uma rota válida |

## Tela vista

Servidor de **produção** (`next build` + `next start`, sem dev). Script Playwright mede `scrollWidth - clientWidth` do documento, texto cortado (ignora `sr-only` e reticências intencionais), erros de console/página e HTTP ≥ 400. Estados: `guest` (deslogado), `demo` (conta com dados reais de demonstração, inclusive os registros mais longos) e `new` (conta vazia). Cada linha cobre 1440, 1024, 768 e 390px, claro e escuro.

| Rota | Estados | Telas | Resultado final |
|---|---|---|---|
| `/entrar`, `/cadastro`, `/recuperar-senha` | guest | 24 | 0 estouro · 0 corte · 0 erro |
| `/inicio` | demo, new | 16 | ok |
| `/questoes` | demo | 8 | ok |
| `/questoes/sessao/demo-lista-interrompida` | demo | 8 | ok (gaveta < 1024) |
| `/questoes/resultado/[id]` | demo | 8 | ok. **Antes**: estouro de 25px a 390 (achado 5). |
| `/simulados` | demo, new | 16 | ok |
| `/simulados/novo` | demo | 8 | ok |
| `/simulados/prova/demo-simulado-interrompido` | demo | 8 | ok (gaveta < 1024) |
| `/simulados/resultado/[id]` | demo | 8 | ok |
| `/simulados/revisao/[id]` | demo | 8 | ok. **Antes**: estouro (SegmentedControl). |
| `/historico`, `/historico?aba=erradas` | demo, new | 24 | ok |
| `/desempenho` | demo, new | 16 | ok |
| `/perfil` | demo, new | 16 | ok. **Antes**: nome cortado a 390. |
| `/configuracoes` | demo | 8 | ok. **Antes**: estouro (SegmentedControl). |
| `/onboarding`, 6 etapas até "Tudo pronto!" | new | 24 | ok; nome longo testado |
| `404` (`/rota-que-nao-existe`) | guest | 4 | ok (o 404 no console é o esperado) |
| `localStorage` corrompido | guest | 2 | ok, volta para `/entrar` |
| `localStorage` bloqueado | guest | 2 | ok após a correção. **Antes**: tela de erro (achado 2). |

**Total: 176 telas na varredura principal + 24 extras. Estado final: 0 estouro, 0 texto cortado, 0 erro inesperado.**

Primeira varredura, antes das correções: todas as rotas do app estouravam a 390px. Depois disso houve 3 rodadas de remedição, uma após cada leva de correções.

## Advogado do diabo

Bloco fixo **F1–F6**, depois as perguntas T3. O banco oficial (`devils-advocate.md`) não veio com a skill, então as perguntas são próprias. Cada uma foi respondida antes de qualquer coisa ir para o dono do repo.

**F1. Reuso.** O card de estatística (ícone + rótulo + número animado) aparece idêntico em `src/features/practice/PracticeResultPage.tsx:119` e `src/features/simulations/SimulationResultPage.tsx:143`. Foi corrigido nos dois lugares, mas a duplicação continua. Extrair um `StatCard` seria criar componente novo de design system, o que exige permissão: **P3**.

**F2. Consistência do design system.** Agora toda cor passa por token semântico (`gold`/`sage`/`coral`/`ink`/`on-*`), inclusive medalha, confete e logo. Isso também faz as 6 paletas valerem em todo o app. Os gráficos usam paleta categórica validada e fixa por área do ENEM, de propósito.

**F3. Responsividade e performance medidas.** A responsividade foi medida: 4 larguras × 2 temas, ver Tela vista. A performance **não** foi medida: sem Lighthouse, sem peso de bundle (o Next 16 não imprime mais tamanhos).

**F4. Fluxo progressivo para o ICP.** O onboarding tem 6 etapas e pode ser pulado ("Pular por enquanto", `src/features/onboarding/OnboardingFlow.tsx:101`). Termina numa primeira atividade concreta, escolhida pela dificuldade declarada. A home abre com "continuar de onde parou" e com a escolha automática. Ou seja, o default já é a decisão.

**F5. O que esconder ou iconizar.** Abaixo de 1024px o sidebar vira só ícones. Os cabeçalhos de foco escondem logo, timer e o rótulo de "Finalizar" no celular. O botão de tema duplicado saiu. Ainda dá para cortar mais no celular: ver P1.

**F6. O que falta para nível Vale do Silício.** (a) Navegação mobile nativa (P1). (b) Sincronização: hoje tudo vive em um navegador; trocar de aparelho perde o progresso. (c) Aviso quando o armazenamento é só em memória (P4). (d) Promessas do tamanho da prova (P2). (e) Distribuição: falta `robots`/`sitemap`/OG (P5).

**T3-1. O fluxo destrutivo pede confirmação?** Sim. `ConfirmDialog` em sair (`Topbar.tsx:153`), apagar histórico (`src/features/history/HistoryPage.tsx:413`), resetar dados (`src/features/settings/SettingsPage.tsx:322`, `:341`), abandonar simulado/lista (`SimulationsPage.tsx:238`, `ExamPage.tsx:363`, `PracticeSessionPage.tsx:487`).

**T3-2. O que acontece se o armazenamento falhar?** Antes, o app não abria. Agora roda em memória (achado 2). Falta avisar o usuário (P4).

**T3-3. Dado corrompido derruba o app?** Não. Com JSON inválido o app volta para `/entrar`. Testado (Tela vista).

**T3-4. Existe "zero silencioso"?** Existia para leitor de tela nos números animados (achado 6). Não há backend, então não há fetch que falhe e pinte 0.

**T3-5. Uma conta nova vê telas vazias com próximo passo?** Sim. `EmptyState` com ação em Histórico, Simulados e Resultado (`HistoryPage.tsx:293`, `SimulationsPage.tsx:76`). Na home, o card de retomar agora aponta para Histórico (achado 8).

**T3-6. A prova cronometrada é justa no celular?** Agora sim. A questão ocupa a largura toda e o mapa de questões vira gaveta (achado 3). A pausa esconde a questão (exceção documentada).

**T3-7. Teclado alcança tudo que o hover revela?** Sim. O tooltip do sidebar e o selo de zoom da figura também abrem com `group-focus-visible` (`Sidebar.tsx:127`, `src/components/questions/QuestionView.tsx:67`). Há link "pular para o conteúdo" (`AppShell.tsx:32`).

**T3-8. Atalhos têm porta visível?** Sim. Ctrl K e `/` abrem a busca, e o atalho aparece no botão (`Topbar.tsx:58-61`). As setas da revisão aparecem no painel de ajuda da sessão.

**T3-9. Movimento reduzido é respeitado?** Sim. O app segue `data-motion` e a preferência do sistema (`src/components/providers/ThemeController.tsx`), e `AnimatedNumber` pula a contagem.

**T3-10. Tema claro quebra onde ninguém olha?** Não. Todas as telas foram abertas nos dois temas, e as 6 paletas passam no teste de contraste WCAG (`src/lib/theme/palettes.test.ts`).

**T3-11. Identidade: o perfil aguenta nome longo?** Agora sim (achado 5). O onboarding foi testado com nome de 5 palavras.

**T3-12. Existe porta duplicada?** Havia duas (achado 7). A paleta aparece no menu e em Configurações, mas em telas diferentes: não conta.

**T3-13. A home responde "o que eu faço agora?" em um toque?** Sim. O herói tem "IA escolhe por mim" e "Continuar", e as sugestões vêm abaixo. A hierarquia de atenção está certa no desktop. No celular, o herói divide a tela com a barra de 84px (P1).

**T3-14. A promessa tem o tamanho da prova?** **Não.** "IA escolhe por mim" (`src/features/home/HomePage.tsx:141`, `src/features/practice/PracticeConfigPage.tsx:134`) é uma regra local (`selectPracticeQuestions`, `src/lib/sessions/factory.ts:83`), não um modelo. É a pergunta que mais pesa: ver P2.

**Posicionamento (T3).** O Gabaritei é para quem estuda para o ENEM sem cursinho: estudante de escola pública, que estuda principalmente **no celular** e em blocos curtos. O produto vende uma coisa: "abra, faça a próxima questão certa e veja onde melhorar". As alavancas já estão no lugar: o default é a decisão (escolha automática como CTA principal) e a hierarquia de atenção põe retomar antes de explorar. Duas coisas contradizem o posicionamento. Primeiro, o layout pensa em desktop: no celular, uma barra lateral fixa come 22% da largura (P1). Segundo, o rótulo "IA" promete mais do que entrega (P2). **Se só uma coisa for feita depois desta auditoria, é P1.**

## Propostas (gosto e conceito, NÃO aplicadas)

| # | Proposta | Por quê | Custo / permissão |
|---|---|---|---|
| P1 | Abaixo de 640px, trocar a barra lateral de 84px por uma barra de abas inferior (Início, Questões, Simulados, Histórico, Desempenho) | O ICP estuda no celular; a barra fixa ocupa 22% da largura em 390px | Componente novo de navegação: **precisa de permissão** |
| P2 | Renomear "IA escolhe por mim" para algo como "Escolher por mim", ou mostrar o critério ("com base nos seus erros e dificuldades") | A seleção é uma regra local; prometer IA sem IA corrói confiança | Só texto: 2 arquivos |
| P3 | Extrair `StatCard` dos dois resultados | Duplicação real (F1) | Componente novo de DS: **precisa de permissão** |
| P4 | Toast discreto quando o storage cair para memória ("Seu progresso não será salvo neste navegador") | Hoje o app funciona, mas o usuário não sabe que vai perder tudo | Pequeno |
| P5 | `robots.ts` (bloquear rotas do app), `sitemap`, imagem OG | A página não existe fora de si mesma | Depende do domínio de deploy |
| P6 | Rodar `next upgrade --agent=security` | Recomendado pelo próprio `next build` após o patch 16.4.3 | Mexe em dependências: decisão do dono |
