# Gabaritei — front-end

Plataforma de preparação para o ENEM: prática de questões, simulados, recomendações personalizadas, análise de desempenho, histórico e gamificação.

Esta etapa é **exclusivamente front-end**. Não há back-end, autenticação real, banco remoto nem chamadas a serviços de IA. Todos os dados ficam no navegador, e a arquitetura está pronta para trocar os repositórios locais por Supabase/FastAPI.

---

## Como instalar e executar

Requisitos: Node.js 20.9 ou superior (testado com Node 22) e npm.

```bash
npm install
npm run dev          # http://localhost:3000
```

Outros scripts:

| Comando             | O que faz                                   |
| ------------------- | ------------------------------------------- |
| `npm run build`     | Build de produção                           |
| `npm start`         | Servidor de produção (após o build)         |
| `npm run lint`      | ESLint (regras Next.js + React Compiler)    |
| `npm run typecheck` | Verificação de tipos (`tsc --noEmit`)       |
| `npm test`          | Testes automatizados (Vitest)               |

## Stack

- **Next.js 16** (App Router, Turbopack) com **React 19** e **TypeScript**
- **Tailwind CSS 4**, com os tokens definidos em CSS (`src/styles/globals.css`)
- **Motion 12** (`motion/react`) para todo o sistema de movimento
- **Recharts 3** para os gráficos e **Hugeicons** (traço arredondado, via `src/components/icons`) para os ícones
- **Zustand** (com `persist`) para o estado global persistido
- Inter e Bricolage Grotesque via `@fontsource-variable`, sem depender de rede no build
- **Vitest** para os testes

## Contas e perfis demonstrativos

Na tela **Entrar**:

| Opção                                | Comportamento                                                                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Explorar demonstração**            | Entra como *Marina Alves* (`demo@gabaritei.app`), com cerca de 110 dias de histórico, simulados, sequência ativa, metas, conquistas, favoritas e atividades interrompidas. |
| **Experimentar como estudante novo** | Cria um estudante vazio e passa pelo onboarding. A cada clique, recomeça do zero.                                                        |
| **Criar conta**                      | Cria uma conta local (nome + e-mail). A senha é validada, mas **nunca é armazenada**.                                                    |
| **Entrar com e-mail**                | Funciona para `demo@gabaritei.app` ou para contas criadas neste navegador, com qualquer senha de 6+ caracteres.                          |
| **Recuperar senha**                  | Fluxo visual que avisa claramente que **nenhum e-mail é enviado**.                                                                       |

## Rotas

| Rota | Tela |
| --- | --- |
| `/` | Decide o destino: entrar, onboarding ou Início |
| `/entrar`, `/cadastro`, `/recuperar-senha` | Autenticação demonstrativa |
| `/onboarding` | Objetivo, edição, matérias com dificuldade e nível; pode ser pulado |
| `/inicio` | Página Início (personalizada; diferente do dashboard) |
| `/questoes` | Configuração da prática: montar lista, recomendadas ou **IA escolhe por mim** (aceita `?materia=` e `?assunto=`) |
| `/questoes/sessao/[id]` | Resolução das questões (layout focado) |
| `/questoes/resultado/[id]` | Resultado da lista |
| `/simulados` | Em andamento, concluídos e estrutura da prova |
| `/simulados/novo` | Prova por edição ou simulado personalizado, seguido das instruções (`?modo=relampago` cria 10 questões) |
| `/simulados/prova/[id]` | Interface da prova (layout focado, cronômetro regressivo) |
| `/simulados/resultado/[id]` | Resultado com nota estimada demonstrativa |
| `/simulados/revisao/[id]` | Revisão completa com gabarito e explicações |
| `/historico` | Atividades (com filtros), erradas, favoritas e marcadas para revisão (`?aba=`) |
| `/desempenho` | Dashboard analítico com visão diária, semanal ou mensal |
| `/perfil` | Dados pessoais, conquistas e metas |
| `/configuracoes` | Tema, movimento, cronômetro, preferências, dados e saída |

Atalhos: **Ctrl/⌘ + K** ou **/** abrem a busca global. Na resolução de questões: **A–E** escolhem a alternativa, **Enter** confirma ou avança, **← →** navegam, **P** pausa, **M** marca para revisão e **F** ativa o modo leitura.

## Organização das pastas

```text
src/
  app/                    Rotas (App Router)
    (auth)/               entrar, cadastro, recuperar-senha
    (app)/                áreas com menu lateral (AppShell persistente)
    (focus)/              sessões de estudo sem menu (questões e prova)
    onboarding/
  components/
    ui/                   Design system: Button, Card, Badge, Form, Select, Modal, Toast, Progress…
    layout/               AppShell, AuthGate, PageHeader, skeletons
    navigation/           Sidebar retrátil, Topbar, CommandPalette (busca global)
    animations/           PageTransition, Stagger/Reveal, ParticleBurst, AnimatedCheck
    charts/               Gráficos Recharts com tema próprio e calendário de atividades
    questions/            Enunciado, imagem com zoom, alternativas
    gamification/         Medalhas SVG e celebração de conquistas
    brand/                Logo (SVG) e ilustrações próprias
  features/               Telas por domínio (auth, onboarding, home, practice, simulations, history, performance, profile, settings)
  data/
    fixtures/             Taxonomia (áreas, matérias, assuntos) e acervo de questões
    seeds/                Geração dos perfis demonstrativo e vazio
  lib/
    animations/           Tokens e variantes de movimento
    calculations/         Estatísticas, séries, sequência, resultados, metas e conquistas
    recommendations/      Motor local de recomendação
    repositories/         Contrato de acesso ao acervo (ponto de troca para a API)
    services/             Autenticação demonstrativa
    sessions/             Fábricas, cronômetro e reducers das sessões
  hooks/                  useAccount, useNow, useHotkeys, useShake, useShouldReduceMotion
  stores/                 Estado global persistido (Zustand)
  styles/                 globals.css (tokens de cor, sombra, raio e tema escuro)
  types/                  Tipos de conteúdo e de usuário/sessões
public/questoes/          Figuras SVG das questões
```

## Dados demonstrativos

- **Acervo** (`src/data/fixtures/questions/`): 254 questões **autorais e fictícias**, no formato do ENEM. São 55 de Linguagens (12 de língua estrangeira), 63 de Humanas, 66 de Natureza e 70 de Matemática. Todas têm `origin: "demonstrativa"` e o selo “Questão demonstrativa” na interface. **Nenhuma é atribuída ao INEP.** O “ano” é apenas uma etiqueta de referência para o filtro.
  - As questões de cálculo são geradas a partir de parâmetros. Alternativas, distratores e explicações são calculados, então o gabarito é sempre coerente.
  - As questões conceituais vêm de bancos de conceitos curados, e os distratores saem do próprio banco.
  - Os IDs são estáveis e as alternativas são embaralhadas com uma seed fixa.
  - O acervo comporta simulados completos de 90 questões por dia (testado).
- **Perfil demonstrativo** (`src/data/seeds/accounts.ts`): o histórico é gerado de forma determinística em relação à data atual, com pontos fortes (Português, História) e fracos (Química, Física, Matemática).

## Persistência e estado

- Tudo fica em `localStorage`, na chave versionada **`gabaritei:v1`**: contas, sessão ativa, preferências, onboarding, listas, simulados, favoritas, marcações, metas e conquistas já celebradas.
- O store usa `skipHydration`. A reidratação acontece no cliente (`AppProviders`), e as rotas protegidas exibem skeletons até ela terminar. Assim o HTML do servidor e o do cliente não divergem.
- Um script inline aplica o tema e a preferência de movimento antes da primeira pintura, para evitar flash.
- **As sessões são a única fonte de verdade.** Estatísticas, séries, sequência, metas e conquistas são *derivadas* das respostas registradas (`lib/calculations/records.ts`), sem contadores independentes. Por isso Início, Histórico, Desempenho e Perfil mostram sempre os mesmos números.
- **Cronômetro serializável** (`lib/sessions/clock.ts`): tempo acumulado mais o instante da última retomada. Ao sair da tela (`pagehide` ou desmontagem), a sessão é pausada. Um “batimento” a cada 15 s permite recuperar uma sessão cuja aba foi fechada sem contar o tempo em que ela ficou fechada. O tempo por questão desconta as pausas.
- Os simulados encerram automaticamente quando o tempo chega a zero, inclusive ao restaurar uma sessão já esgotada.
- `migrate`/`merge` do `persist` concentram as futuras migrações de esquema.

## Sistema de Motion

- **Tokens** (`src/lib/animations/tokens.ts`): durações (micro 160 ms, base 280 ms, página 340 ms, gráficos 750 ms), curvas (`out`, `emphasized`, `inOut`) e molas nomeadas por intenção (`snappy`, `layout`, `soft`, `bouncy`, `sidebar`).
- **Variantes** (`variants.ts`): página, stagger, fadeUp, scaleIn, slide direcional (onboarding e questões), slide contido (simulados), modal, overlay, popover, toast, tremor de erro, pulso de acerto e revelação de medalha.
- **Navegação:** o menu e a barra superior ficam montados, e só o conteúdo principal transiciona (chaveado pelo `pathname`). Os indicadores ativos deslizam com `layoutId`: menu, abas, controles segmentados, grade de questões e busca.
- **Microinterações:** hover, pressão e foco em botões, cards, chips, campos, switches, checkboxes (traço desenhado), selects, menus, accordions e steppers.
- **Aprendizagem:** alternativas animadas, revelação do gabarito, tremor no erro, painel de explicação expansível, barra de progresso, troca de questão direcional e pausa com desfoque. Nos simulados, o movimento é propositalmente mais discreto, e o aviso dos 15 minutos finais é sutil.
- **Dados e gamificação:** linhas desenhadas progressivamente, barras crescendo, contadores animados, anéis de progresso, calendário em cascata, medalhas com brilho e partículas nas conquistas.
- **Desempenho:** as animações usam `transform` e `opacity`, e não há animação de largura em listas grandes.
- **Acessibilidade:** a configuração interna (Seguir o sistema, Reduzir animações ou Completas) alimenta o `MotionConfig reducedMotion` e o atributo `data-motion` no `<html>`. Com movimento reduzido, deslocamentos, escalas, partículas e shimmer são desligados, e o feedback continua por cor, ícone e texto.

## Design system

- **Paleta:** grafite `#29332F` (estrutura e menu), dourado `#DDB54D` (ação, progresso e conquista), sálvia `#86A58C` e coral `#DF967D` (apoio), creme `#F7F5EE` (fundo). Cada área do ENEM tem uma cor própria, e o tema escuro tem valores calibrados separadamente.
- **Paletas de cores:** além da padrão (Grafite & Dourado), o estudante pode escolher **Oceano**, **Ameixa**, **Terracota**, **Neon** ou **Editorial**, todas com versão clara e escura. A troca fica em Configurações › Aparência e também no menu do usuário. Ela acontece com uma transição suave de cores e fica salva no `localStorage`.
  - As paletas ficam em `src/lib/theme/palettes.ts`. Esse arquivo gera o CSS (injetado no `<head>`), as prévias da interface e os testes de contraste.
  - Cada paleta só redefine tokens semânticos (`--ink`, `--gold` = destaque, `--sage`/`--coral` = apoio etc.), então os componentes não precisam saber qual paleta está ativa.
  - Um teste automatizado garante contraste WCAG (texto 4,5:1, títulos 7:1) em todas as paletas e nos dois temas.
  - As cores das áreas do ENEM e a paleta categórica dos gráficos não mudam entre paletas, para não perder identidade nem a validação para daltonismo.
- **Gráficos:** a paleta categórica por área foi validada para daltonismo (separação CVD/ΔE) nos dois temas. Os gráficos sempre têm legenda ou rótulos e, quando relevante, uma visão em tabela.
- **Logo:** um “G” aberto, completado por um check dourado (`src/components/brand/Logo.tsx`, `public/icon.svg`), com variações para fundo claro, escuro e menu recolhido.
- Componentes próprios, sem estilos padrão de bibliotecas de UI.

## O que está pronto

- Autenticação demonstrativa (demonstração, estudante novo, cadastro, login local e recuperação) e onboarding completo com tela de boas-vindas e primeira atividade sugerida.
- Menu lateral retrátil com indicador animado, busca global, menu do usuário e alternância de tema.
- Página Início com hero, próximo passo, retomada, indicadores, evolução, recomendações, acessos rápidos, matérias frequentes e sugestões.
- Prática: filtros por matéria, assuntos e subtópicos, quantidade e ano; recomendadas; “IA escolhe por mim”; resolução com confirmação, explicação, marcação, favoritos, pausa e retomada, pular, voltar, modo leitura, questão semelhante ou aleatória; resultado com desempenho por assunto e revisão.
- Simulados: prova por edição (Dia 1 ou Dia 2, completa ou reduzida), simulado personalizado, instruções, prova com grade, marcação, pausa, cronômetro ocultável, encerramento por tempo, confirmação com contagem de brancos, resultado e revisão.
- Histórico com filtros (tipo, situação, matéria, período e resultado), cards expansíveis, erradas (refazer sem mostrar a resposta anterior), favoritas e marcadas.
- Dashboard de desempenho, metas pessoais editáveis, 13 conquistas com regras claras, perfil editável e configurações completas.

## O que é demonstrativo

- Questões fictícias, ainda sem o acervo oficial do INEP.
- “IA escolhe por mim” e as recomendações usam regras locais e transparentes, sem modelos nem APIs, e não são previsões.
- A **nota estimada** é proporcional ao percentual de acerto (faixa de ~320 a 850 pontos). **Não é a TRI.**
- A redação aparece na estrutura do Dia 1, mas o editor e a correção estão fora do escopo.
- Não há upload de foto nem avatar personalizado (são usadas as iniciais).

## Integração futura (Supabase + FastAPI)

1. **Acervo:** implemente `QuestionRepository` (`src/lib/repositories/questionRepository.ts`) consumindo a API (FastAPI ou Supabase) e troque o export `questionRepository`. Como as telas só acessam o acervo por esse contrato, nenhuma delas precisa mudar. Para carregamento assíncrono, envolva o acesso em hooks com cache (por exemplo React Query), aproveitando os skeletons existentes.
2. **Autenticação:** substitua as funções de `src/lib/services/authService.ts` e as ações `signIn*`/`register` do store por `supabase.auth` (`signInWithPassword`, `signUp`, `resetPasswordForEmail`). O `AuthGate` já centraliza as regras de redirecionamento.
3. **Dados do estudante:** `AccountData` (`src/types/user.ts`) mapeia diretamente para tabelas (`profiles`, `practice_sessions`, `simulations`, `answers`, `goals`). As ações do store (`addPractice`, `updatePractice`, `updateSimulation` etc.) são o ponto para sincronizar com o back-end; os reducers puros de `lib/sessions/reducers.ts` podem rodar no cliente e no servidor.
4. **Recomendações:** `recommendTopics` e `buildAutoSelection` têm entradas e saídas tipadas. Um serviço de recomendação (FastAPI) pode devolver o mesmo formato (`TopicRecommendation`, com `reason`).
5. **Simulados oficiais:** `SimulationConfig` já guarda edição, dia, língua estrangeira e seções com numeração oficial (1–90 e 91–180). Basta buscar as questões oficiais pelo repositório.

## Testes

Os testes ficam em `src/**/*.test.ts` (43 no total):

- **Integridade do acervo:** IDs únicos, cinco alternativas distintas, gabarito válido e capacidade para simulados de 90 questões.
- **Cronômetro:** pausa e retomada, recuperação de sessão e encerramento por tempo.
- **Sequência de estudos:** cálculo da sequência atual e da melhor.
- **Perfis:** determinismo e coerência do perfil demonstrativo; estudante novo vazio.
- **Recomendações:** baseadas no onboarding para quem ainda não tem respostas.
- **Sessões:** listas e “IA escolhe por mim” respeitam a quantidade configurada; simulados oficiais têm 90 questões únicas, numeração 1/46 e 91/136 e língua estrangeira nas questões 1–5; simulados personalizados respeitam o tamanho.
- **Resultados:** brancos, nota demonstrativa e tempo por questão descontando pausas.
- **Paletas:** contraste acessível de todas as paletas nos temas claro e escuro, e geração do CSS.
