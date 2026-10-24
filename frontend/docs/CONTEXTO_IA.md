# Contexto do frontend do Gabaritei — briefing para IA

Este documento existe porque você (a IA lendo isto) não consegue ver o frontend rodando. Tudo que você precisa saber sobre o que foi decidido, por quê, e como o código está organizado, está aqui. Leia isto inteiro antes de mexer em qualquer coisa.

Repositório de trabalho: `C:\Users\Darkz\Desktop\gabaritei-web` (Windows), git inicializado localmente. O remote de verdade (GitHub) é outro clone, em `C:\Users\Darkz\Documents\GitHub\Gabaritei---PI-VI`, dentro da subpasta `frontend/` — é um repositório de equipe (`github.com/italodsz/Gabaritei---PI-VI`, hoje público) que também guarda outras partes do projeto (dataset/pipeline do ENEM, numa branch separada `dataset-pipeline`). Depois de mexer em `gabaritei-web`, sincronize pra `Gabaritei---PI-VI/frontend/` antes de commitar/dar push por lá — os dois não são o mesmo working tree.

Os dois documentos-fonte que geraram tudo isto:
- `docs/FRONTEND_PROMPT.md` — a especificação completa da Fase 1 (o prompt original, em português, ~710 linhas). É a autoridade máxima: qualquer dúvida sobre "deveria ser assim?" se resolve lendo lá, não adivinhando.
- `docs/PENDENCIAS.md` — o diário vivo de decisões técnicas, bugs encontrados e `TODO(equipe)` de cada etapa. É o complemento deste arquivo: lá tem o histórico cronológico e o motivo de cada decisão não óbvia; aqui tem o quadro geral.

---

## 1. O que é o Gabaritei

Uma plataforma de estudo adaptativo pro ENEM (o principal exame de admissão universitária do Brasil). O estudante resolve questões, o sistema recomenda o que praticar a seguir com base no desempenho (RF11), mede proficiência por área com um modelo de resposta ao item (3PL, RF09/RF10), e tem simulados completos com cartão-resposta no estilo do exame real.

A Fase 1 (o que já está pronto) cobre: entrar/criar conta, treino adaptativo com 4 modos de recomendação, banco de questões navegável, simulado completo, e um Perfil enxuto. A Fase 2 (não construída, nem deve ser) adiciona: histórico, desempenho com gráficos, busca global, modo foco avançado, favoritos, etc. — veja a seção "O que NÃO existe de propósito" mais abaixo.

---

## 2. Stack técnica

- **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript estrito** (sem `any`).
- **Tailwind CSS v4** — configuração via `@theme` em `src/styles/globals.css`, não `tailwind.config.js` (Tailwind v4 não usa mais esse arquivo).
- **Radix UI** (primitivos sem estilo: Dialog, RadioGroup, Switch, Sheet, Tooltip) — a casca visual é toda nossa, Radix só dá o comportamento acessível.
- **TanStack Query** (`@tanstack/react-query`) para toda busca de dado — nunca `useEffect` + `fetch` manual.
- **react-hook-form + zod** nos formulários com validação (entrar, criar conta).
- **lucide-react** pra ícones.
- **Vitest** (unitário) + **Playwright** (e2e) + **@axe-core/playwright** (acessibilidade automatizada).
- Gerenciador de pacotes: **npm**, não pnpm (pnpm foi a sugestão original do prompt, mas a máquina de desenvolvimento não tinha permissão pra instalar global — `npm install -g pnpm` falhou com EPERM; todo comando do prompt original com `pnpm` deve ser lido como `npm run`).

Comandos:
```
npm run dev          # servidor de desenvolvimento, localhost:3000
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
npm run test         # vitest run (unitário)
npx playwright test  # e2e completo
npx tsx scripts/auditar-contraste.ts   # auditoria de contraste (precisa do dev rodando)
npm run check:regras # varredura estática das regras 4-9 (gradiente, roxo, âmbar fora de IA, etc.)
npm run build        # build de produção
```

---

## 3. O sistema de design "geek e clean"

Isto não é estético opcional — é regra, verificada em todo etapa. A letra "geek" vem da tipografia tripla e da estética editorial/técnica; "clean" vem da paleta neutra e da ausência de qualquer efeito decorativo.

### 3.1 Tipografia

Três famílias, cada uma com um papel fixo (nunca trocam de função):
- **Source Serif 4** — a marca ("Gabaritei" no cabeçalho/sidebar) e o enunciado da questão. Só isso, direto via `font-serif`.
- **IBM Plex Sans** — interface: botões, rótulos, texto corrido de UI.
- **IBM Plex Mono** — dados técnicos: códigos de habilidade (H21), métricas tabulares, qualquer coisa que pareça "dado bruto".

Carregadas via `next/font` em `src/app/layout.tsx`, expostas como variáveis CSS e consumidas no Tailwind `@theme`.

Desde a etapa V (ajuste visual), título de tela (`h1`/`h2`/`h3`) e número grande (estatísticas) usam um token à parte, `--font-display` (hoje = `--font-serif`, mesma aparência de antes) — isolado assim de propósito pra poder virar IBM Plex Sans 600 numa linha só, se o grupo decidir que serif demais estava deixando o app "sério" pra adolescente. Use `font-display`, não `font-serif`, em título/número novo; `font-serif` fica reservado pra marca e enunciado.

### 3.2 Cores (tokens, `src/styles/tokens.css`)

Nunca cor literal no código — sempre o token. Valores (claro / escuro):

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--paper` | `#f4f2ec` | `#121714` | fundo da página (nunca `#fff` puro) |
| `--paper-2` | `#ece9e0` | `#1e2622` | áreas rebaixadas (trilhas, cabeçalho de tabela) |
| `--card` | `#fbfaf7` | `#1a211d` | superfície elevada (questão, painel) |
| `--ink` | `#1d2420` | `#e9ebe4` | texto principal |
| `--ink-2` | `#4b554e` | `#a9b3ac` | texto secundário |
| `--rule` | `#d9d5c8` | `#2c3530` | linha decorativa (nunca borda de campo) |
| `--rule-strong` | `#8f8a7a` | `#6a7370` | borda de campo/controle |
| `--forest` / `--forest-hover` | `#2c6e49` / `#245c3c` | `#6bbe90` / `#82cba3` | cor primária (botão, barra, ícone) |
| `--forest-soft` / `--forest-ink` | `#e3ece4` / `#245c3c` | `#24342b` / `#6bbe90` | fundo suave / texto verde (links) |
| `--amber` / `--amber-soft` / `--amber-ink` | `#b8842e` / `#f3e7cc` / `#6b4a10` | `#d9a441` / `#323324` / `#e5b85a` | **exclusivo de conteúdo decidido por IA** |
| `--err` / `--err-soft` / `--on-err` | `#a8321f` / `#f5e1dc` / `#fff` | `#ee8f7f` / `#332e29` / `#1a0f0c` | erro / "você errou" |
| `--area-{mt,cn,ch,lc}` + `-soft` | ver arquivo | ver arquivo | `AreaTag`, filetes finos, e (etapa V, `TODO(equipe)` a ratificar) o ladrilho `AreaTile` |
| `--focus` | `#2c6e49` | `#6bbe90` | anel de foco, 2px + offset 2px |

Regra crítica (seção 2, regra 9 do prompt): **`--amber` é exclusivo de "isto foi decidido por IA"** — hoje só aparece em `CriterioRecomendacao` (o bloco que explica por que uma questão foi recomendada) e no selo "Recomendado". Não aparece em nenhum alerta, aviso, banner de demonstração, ou qualquer outra coisa. Já corrigi uma violação real disso nesta sessão (ver seção 8).

**Nunca roxo ou violeta em lugar nenhum** — regra explícita, verificada por grep (zero ocorrências confirmadas).

Troca de tema: atributo `data-theme="light"|"dark"` no `<html>`. Sem o atributo = segue `prefers-color-scheme` do sistema. O usuário pode forçar claro/escuro no Perfil → Aparência (`src/lib/hooks/use-tema.ts`, componente `Segmented`). Script inline no `<head>` (`SCRIPT_TEMA_INICIAL`) aplica o tema antes da hidratação pra nunca ter flash de tema errado.

### 3.3 Voz e regras de texto (seção 6 do prompt)

- **Nunca travessão "—" nem meio-ponto " · " como separador de texto visível ao usuário.** Usar vírgula, dois-pontos, ou reestruturar o layout. Isso vale pra texto de UI (rótulos, mensagens, enunciados) — comentário de código não conta. Fiz uma varredura completa disso nesta sessão (seção 8 abaixo tem o detalhe de cada ocorrência encontrada e corrigida).
- Nunca inventar número: campo sem dado mostra "não informado" (habilidade, ano) ou um estado de "dados insuficientes" com `ProgressToMinimum` (proficiência, reforço) — nunca um placeholder fabricado.
- Maiúsculas com `tracking-wide`/`uppercase` como estilo de rótulo: **proibido** (zero ocorrências confirmadas por grep).

### 3.4 O que é terminantemente proibido no visual

Verificado por varredura de código nesta sessão (grep em todo `src/`, zero ocorrências de cada um):
- `gradient`, `backdrop-blur`, `blur-*` — sem gradiente, sem vidro/glassmorphism.
- `purple`/`violet`/roxo/lilás em qualquer tom.
- `uppercase`/`tracking-wide(r|st)` como estilo de rótulo.
- Nota ENEM estimada, conquistas/medalhas/emblemas de progresso, XP, "nível" como sistema de jogo (engajamento é só Foguinho + Combo — ver seção 5).

### 3.5 Acessibilidade (RNF06 — requisito, não acabamento)

- Alvo de toque mínimo 44×44px em todo controle interativo.
- Foco visível sempre (`--focus`, 2px + offset 2px), `outline: none` sem substituto é proibido (checado por lint).
- Skip link pro conteúdo principal; foco vai pro `h1` a cada troca de rota (`src/components/layout/foco-no-h1.tsx`, hook global em `providers.tsx`).
- Sem rolagem horizontal a 360px nem linha de leitura > 68 caracteres a 1440px.
- `prefers-reduced-motion` respeitado; `prefers-contrast: more` aumenta `--rule` pra `--rule-strong`.
- `@axe-core/playwright` zero violações em toda rota, nos dois temas — parte do critério de "pronto" de cada tela.
- Auditoria de contraste própria (`scripts/auditar-contraste.ts`) além do axe, porque axe não enxerga tudo (texto sobre fundo com transparência composta, texto sobre a "bolha" do cartão-resposta). Mínimo 4,5:1 (3:1 pra texto ≥24px ou ≥18,66px em negrito).

---

## 4. Arquitetura de código

### 4.1 Grupos de rota (route groups do App Router)

```
src/app/
├─ (publico)/      entrar, cadastrar, termos, privacidade — sem casca de app
├─ (app)/          inicio, questoes, treino, simulados, perfil — layout.tsx envolve com <AppShell>
├─ (foco)/         treino/[sessaoId], simulados/[id], .../resultado — layout.tsx é passthrough;
│                  cada página escolhe manualmente <FocusShell> ou <AppShell>
└─ dev/componentes/  galeria de componentes, só existe fora de produção (NODE_ENV !== "production")
```

Três "cascas" (shells), cada uma com um papel fixo:
- **`AppShell`** (`src/components/layout/app-shell.tsx`) — navegação completa: sidebar de 240px ≥1024px (recolhe pra ícones com tooltip), barra superior + barra inferior de 5 itens <1024px. Usada nas telas de navegação livre (início, questões, simulados, perfil).
- **`FocusShell`** — casca de "modo foco", sem distração lateral, usada durante resolução ativa (sessão de treino, simulado em andamento, resultado do simulado). Tem seu próprio `h1` (o título da barra superior).
- Páginas públicas (entrar/cadastrar) não usam casca nenhuma, só um container centralizado.

### 4.2 Padrão de arquivo por rota

Toda rota segue o mesmo padrão, sem exceção:
```
page.tsx          # Server Component. Só exporta `metadata` e renderiza o client component.
[nome]-client.tsx # "use client". Toda a lógica, hooks, estado, JSX de verdade mora aqui.
```
Exemplo real (`src/app/(app)/perfil/page.tsx`):
```tsx
import type { Metadata } from "next";
import { PerfilClient } from "./perfil-client";
export const metadata: Metadata = { title: "Perfil" };
export default function PerfilPage() { return <PerfilClient />; }
```
Isso existe pra manter `metadata` (SEO/título de aba) em Server Component enquanto toda a interatividade fica isolada no client component — nunca misture os dois no mesmo arquivo.

### 4.3 Camada de API (a parte mais importante da arquitetura)

`src/lib/api/`:
```
types.ts        # TODO o contrato: interfaces TypeScript de cada entidade (Questao, Sessao, Simulado,
                 # Perfil, Proficiencia, etc.) — fonte única da verdade dos tipos.
client.ts        # interface Api { ... } com toda operação (entrar, obterQuestao, iniciarSessao,
                 # criarSimulado, obterPerfil, etc.) + getApi() que escolhe mock ou http.
http/client.ts    # esqueleto que lança erro "indisponível" em cada método — existe só pra interface
                 # Api ter uma segunda implementação, pronta pro dia que a FastAPI real existir.
mock/             # implementação completa e funcional que simula o backend inteiro:
  ├─ client.ts     # implementa TODOS os métodos de Api, com localStorage como "banco de dados"
  ├─ dados.ts       # gera o banco de questões fictício (determinístico, semente fixa — mesma saída
  │                 # sempre), com MOCK_MIN_RESPOSTAS, gabarito, resolução
  ├─ engine.ts       # motor de recomendação fake: calcula proficiência, reforço, Combo
  ├─ estado.ts        # lê/escreve o localStorage (chave gabaritei:mock:v1), gera IDs
  └─ cenarios.ts       # o seletor de cenário (?cenario= na URL ou dropdown dev): novo, ativo,
                       # parcial, esgotado, lento, erro, sem-permissao — cada um semeia dados
                       # diferentes ou muda o comportamento de latência/erro das chamadas
```

**Regra de ouro**: nenhuma tela ou componente importa `mock/` ou `http/` diretamente — todo mundo chama `getApi()` (de `lib/api/client.ts`) e usa a interface `Api`. Trocar de mock pra http no futuro não deve exigir mudar NENHUMA tela, só trocar `NEXT_PUBLIC_API_MODE=mock` pra `http` no `.env`. `getApi()` só pode ser chamado de Client Component (o mock usa `localStorage`, que não existe no servidor).

O mock simula latência de rede real (300–900ms, até 4s no cenário "lento") via `comLatenciaECenario()` — por isso toda tela precisa de estado de carregamento (`Skeleton`) de verdade, não só visual.

### 4.4 Busca de dado: sempre TanStack Query

Nunca `useEffect` + `fetch`. Padrão em toda tela:
```tsx
const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ["algo", idRelevante],
  queryFn: () => getApi().algumMetodo(idRelevante),
});
```
Mutações (salvar algo) são funções `async` manuais que chamam `getApi().metodo()` e depois `refetch()` — este projeto não usa `useMutation` do TanStack Query, usa um padrão mais simples de estado local (`salvando`) + função async + refetch. Mantenha esse padrão por consistência, não introduza `useMutation` sem necessidade.

### 4.5 Regras de pureza do React 19 (`react-hooks/purity`, `react-hooks/set-state-in-effect`, `react-hooks/refs`)

O lint é estrito sobre isso. `Date.now()`, leitura de `localStorage`, ou qualquer chamada impura **direto no corpo do componente** quebra a regra. Os três padrões usados pra contornar, todos já validados pelo lint neste projeto:

1. **Inicializador preguiçoso de `useState`** — a chamada impura só roda uma vez, na montagem:
   ```tsx
   const [segundosIniciais] = useState<number | null>(() => {
     if (!simulado?.limiteEm) return null;
     return Math.max(0, Math.round((new Date(simulado.limiteEm).getTime() - Date.now()) / 1000));
   });
   ```
2. **Mover pra dentro de `useEffect`** quando precisa rodar depois da montagem (ex.: ler tema salvo):
   ```tsx
   useEffect(() => {
     // eslint-disable-next-line react-hooks/set-state-in-effect
     setTema(lerTemaSalvo());
   }, []);
   ```
3. **"Ajustar estado durante a renderização"** — comparar valor atual com uma flag de "já apliquei" guardada em estado, sem usar efeito.

Nunca mutar `ref.current` durante a renderização (regra `react-hooks/refs`) — só em handler de evento ou efeito.

---

## 5. Conceitos de domínio que você precisa entender

- **Foguinho** (streak): dias consecutivos com atividade. Informativo, nunca punitivo — nunca "você quebrou sua sequência" em tom negativo. Componente `FoguinhoBadge`. Nunca usa `--amber`.
- **Combo**: escada de dificuldade no modo "progressão" de treino — acerta, sobe de degrau (fica mais difícil); erra, desce ou reinicia (regra exata ainda é `TODO(equipe)`, hoje é um placeholder no mock: `COMBO_CONFIG_PADRAO = { acertosPorDegrau: 3, noErro: 'reduz' }`).
- **4 modos de recomendação** (`ModoPratica` em `types.ts`, exceto `livre`/`simulado`): `tema` (texto livre + áreas), `habilidade` (código específico, ex. H21), `nivel` (faixa de dificuldade: fácil/média/difícil), `progressao` (usa o Combo pra ajustar dificuldade dinamicamente).
- **Proficiência**: estimada por um modelo 3PL (TRI), por área (`LC`, `CH`, `CN`, `MT`). Só aparece depois de um volume mínimo de respostas (`MOCK_MIN_RESPOSTAS = 20` por área no mock) — antes disso, mostra `ProgressToMinimum` ("faltam N respostas"), nunca um número inventado. Escala exibida é `TODO(equipe)` (mock usa -3 a 3 provisoriamente).
- **Reforço prioritário**: lista de habilidades com pior desempenho, até 5, cada uma com botão "Treinar". Mesmo princípio de `dados_insuficientes` antes do volume mínimo.
- **Cartão-resposta** (`CartaoResposta`, `CartaoRespostaMini`): o elemento mais "de marca" do produto — grade de questões no estilo do cartão-resposta real do ENEM (A a E), usado no resultado do simulado (com filtro Todas/Erradas/Em branco/Marcadas) e durante a resolução do simulado (mini, navegação rápida).
- **Simulado**: ao contrário de Treino/Questões, a resposta salva ao escolher a alternativa (sem botão "Enviar", sem correção na hora) — só vê certo/errado no final. Pode ter tempo limite opcional (sugestão: 3min/questão) e cronômetro ocultável.

---

## 6. As 15 telas da Fase 1 (inventário completo)

| # | Rota | Casca | O que é | Etapa |
|---|---|---|---|---|
| 1 | `/entrar` | nenhuma | login | 1 |
| 2 | `/cadastrar` | nenhuma | criar conta (+ tela "confira seu e-mail") | 1 |
| 3 | `/inicio` | AppShell | "próximo passo", retomar, Foguinho/meta, reforço | 3 |
| 4 | `/treino` | AppShell | escolher modo de prática (RadioCard por modo) | 3 |
| 5 | `/treino/[sessaoId]` | FocusShell | sessão de treino ativa, uma questão por vez | 3 |
| 6 | `/treino/[sessaoId]/resumo` | FocusShell | resumo ao encerrar a sessão | 3 |
| 7 | `/questoes` | AppShell | banco de questões com filtros na URL | 2 |
| 8 | `/questoes/[id]` | AppShell | questão avulsa, com anterior/próxima se veio da lista | 2 |
| 9 | `/simulados` | AppShell | montar simulado (3 escopos), listar em andamento/concluídos | 4 |
| 10 | `/simulados/[id]` | FocusShell | simulado em andamento | 4 |
| 11 | `/simulados/[id]/resultado` | AppShell | resultado: cartão-resposta, por área, reforço, proficiência | 4 |
| 12 | `/simulados/[id]/questao/[n]` | AppShell | correção de uma questão do simulado, com anterior/próxima | 4 |
| 13 | `/perfil` | AppShell | identidade, números, Foguinho, proficiência, reforço, preferências | 5 |
| 14 | `/termos`, `/privacidade` | nenhuma | provisórias, estrutura de `h2` com `TODO(equipe)` no texto jurídico | 1 |
| 15 | `not-found.tsx`, `error.tsx` | — | 404 e erro inesperado | 0 |

### O que NÃO existe de propósito (reservado pra Fase 2 — não construir sem pedido explícito)

Histórico de atividades com abas (Atividades/Erradas/Favoritas/Para revisar), tela de Desempenho com gráficos e calendário de 20 semanas, busca global (Ctrl K), modo foco avançado, favoritar questão, comparação com período anterior, exportar dados, link "Esqueci minha senha", "Tirar dúvida com assistente", qualquer link do Perfil pra Desempenho/Histórico/Conta.

---

## 7. Componentes de domínio chave (`src/components/dominio/`)

- `QuestionView` — orquestra Enunciado + AlternativasRadio + Envio/FeedbackCorrecao nos 3 modos: `resolver` (interativo, com botão enviar — exceto no simulado, ver prop abaixo), `correcao` (acabou de responder, mostra certo/errado na hora), `revisao` (revendo uma tentativa antiga). Tem a prop `mostrarBotaoEnviar?: boolean` (default `true`) especificamente pra desligar o botão "Enviar" no simulado, onde a resposta salva ao escolher a alternativa.
- `AlternativasRadio` — grupo de rádio de verdade (Radix), nunca `<div onClick>` fingindo ser rádio. Estado nunca depende só de cor (tabela de estados visuais na seção 6 do prompt).
- `CartaoResposta` / `CartaoRespostaMini` — ver seção 5.
- `CriterioRecomendacao` — o único lugar que usa `--amber`. "Nota de margem" explicando por que uma questão foi recomendada + selo "Recomendado pelo modelo" + versão do modelo recolhida (RF08).
- `FoguinhoBadge`, `WeekStrip` — streak e os 7 dias da semana (bolhas com intensidade por volume de questões).
- `AreaTag`, `FaixaChip` — metadado de questão (área colorida; dificuldade com ícone de barras + texto, nunca só cor).
- `Timer` — cronômetro do simulado, ocultável.
- `Enunciado` — renderiza os `Bloco[]` da questão (texto, figura com alt obrigatório ou aviso de ausência, citação, fórmula em LaTeX — este último ainda sem uso real nos dados mock).

Componentes genéricos (`src/components/ui/`) seguem o mesmo padrão de outros design systems: `Button` (variantes: padrão/secundário/discreto/perigoso, prop `carregando`), `Field`, `Switch`, `Checkbox`, `RadioCard`/`RadioCardGroup`, `Segmented`, `Dialog`, `Sheet`, `Tooltip`, `Skeleton`, `ErrorState`, `EmptyState`, `ProgressBar`, `ProgressToMinimum` (a barra + "faltam N respostas"), `Toast`.

---

## 8. Decisões arquiteturais não óbvias (e o motivo)

Isto é o que mais importa pra uma IA que vai mexer no código sem poder ver a tela — são decisões que parecem arbitrárias lendo só um arquivo, mas têm um motivo concreto.

1. **`mostrarBotaoEnviar` em `QuestionView`**: existe porque o componente é compartilhado entre Treino, Questões e Simulado, mas só o Simulado esconde o botão de envio. Sem essa prop, o comportamento do simulado estaria errado (foi um bug real, corrigido na Etapa 4).

2. **`Tentativa.id` no mock precisa ser previsível no simulado**: `finalizarSimulado` (em `mock/client.ts`) gera o id da tentativa como `` `simulado-${simuladoId}-${n}` `` (não um id sequencial aleatório), porque a tela de correção (`/simulados/[id]/questao/[n]`) precisa buscar essa tentativa especificamente por esse padrão pra conseguir o texto de resolução, que não vem no resultado agregado do simulado. Já foi um bug real (os dois ids não batiam) — se você regenerar essa lógica, mantenha o padrão previsível.

3. **`AppShell` precisa de `min-w-0` no container flex do conteúdo** (`src/components/layout/app-shell.tsx`): sem isso, qualquer conteúdo largo (ex.: uma tabela com texto que não quebra linha) força rolagem horizontal na página inteira a 360px, porque um `flex-1` não encolhe abaixo do min-content do que tem dentro por padrão em CSS. Foi um bug real descoberto testando o Perfil a 360px. Se adicionar uma tabela ou qualquer conteúdo potencialmente largo numa tela nova, lembre que esse fix já existe no nível do `AppShell` — não precisa reaplicar, mas tabelas ainda devem ter seu próprio wrapper `overflow-x-auto` por correção (o `min-w-0` evita o vazamento pro resto da página, não substitui a rolagem interna da própria tabela).

4. **`sr-only` num `<caption>` de tabela deve envolver um `<span>` dentro, não ir direto no `<caption>`**: `<caption>` tem `display: table-caption`, que em alguns motores não respeita bem `position: absolute` (parte da técnica do `sr-only`). Use `<caption><span className="sr-only">texto</span></caption>`, nunca `<caption className="sr-only">`.

5. **Clique em `RadioCard` não pode conter outro controle focável dentro**: `RadioCard` é um `<button role="radio">`, e um botão não pode conter outro controle focável (regra `nested-interactive` do axe). Quando um modo de treino precisa de um campo extra (ex.: texto livre no modo "tema", combobox de habilidade no modo "habilidade"), esse campo fica **fora** do `RadioCard`, mostrado/escondido condicionalmente logo abaixo do grupo de rádio — nunca aninhado dentro.

6. **Preferências do Perfil salvam campo a campo, sem botão global de salvar**: cada controle (tema, descrição de imagem por padrão, meta semanal, atalhos de teclado) dispara `atualizarPreferencias({ [campo]: valor })` sozinho ao mudar, com um indicador `aria-live` próprio ("Salvando…"/"Salvo") ao lado. Troca de tema também chama `aplicarTema()` direto (de `lib/hooks/use-tema.ts`) antes mesmo da resposta da API voltar, pra não ter atraso visual — a chamada à API só existe pra persistir no "servidor" mock, em paralelo.

7. **`listarQuestoes` pagina sem endpoint de ordenação**: a tela de Questões ordena só a página atual (20 itens já paginados), não o banco inteiro antes de paginar — pode dar ordenação "quebrada" entre páginas. É uma limitação conhecida do contrato atual, documentada, não um bug a corrigir sem mudar a API.

8. **"Anterior"/"Próxima" numa questão avulsa só existem se ela foi aberta a partir da lista** (`?de=questoes&<filtros>` na URL) — a tela refaz a mesma busca com os mesmos filtros pra saber a posição atual e os vizinhos. Abrir a questão direto pela URL não mostra esses links (comportamento esperado, não um bug).

9. **A sessão de treino guarda a lista de questões no `sessionStorage` da aba** (não vem de volta do servidor): `obterSessao` não devolve a lista completa de itens, só o progresso agregado. Se a aba recarregar no meio do treino, a lista some e a tela mostra erro orientando a escolher o modo de novo (o que já foi respondido continua salvo no servidor — só a fila de próximas questões se perde). É uma limitação de contrato documentada, não bug.

10. **O cenário de mock (`?cenario=` ou dropdown dev) só re-semeia dados se `estado.tentativas.length === 0`** — trocar de cenário no meio de uma sessão com dados existentes não limpa/recria automaticamente, a não ser que você use o dropdown `ScenarioSwitcher` (que chama `definirCenario()` explicitamente). Isso é intencional (não quer perder dado sem querer), mas pode confundir quem está testando manualmente — lembre disso antes de concluir "o cenário não funciona".
11. **`AreaTile` (etapa V)** é um `CheckboxPrimitive.Root`, não um `RadioGroupPrimitive.Item`, mesmo onde só uma área pode ser escolhida por vez (ex.: Início sem histórico, escopo "Uma área" do Simulado) — o padrão já estabelecido no projeto pra "seleção única com aparência de card" é checkbox que limpa as outras opções ao marcar uma nova (`setAreas(... ? [] : [area])`), não um grupo de rádio de verdade. Siga esse padrão se adicionar um 4º lugar com ladrilho de área.
12. **`FoguinhoBadge` tem 3 estados visuais** (acesa/em espera/zerada), todos derivados de campos que já existiam em `Regularidade.foguinho` — nunca adicione um 4º estado nem o vocabulário "apagou"/"quebrou" (é informativo, nunca punitivo, regra desde a Etapa 0).
13. **Botão "inverso"** (`bg-paper text-forest-ink`) existe só pra funcionar em cima da faixa verde-floresta sólida do Início: a variante "primario" (`bg-forest`) é **invisível** nessa faixa no tema escuro, porque `--forest` e `--forest-ink` são a mesma cor exata nesse tema. Qualquer botão novo sobre um fundo `bg-forest-ink` precisa da variante "inverso", nunca "primario".

---

## 9. Bugs reais encontrados e corrigidos nesta sessão (histórico, por etapa)

Toda etapa seguiu o mesmo método: implementar → rodar typecheck/lint → testar de verdade num navegador controlado (não só ler código) → achar bug real → corrigir → escrever teste e2e cobrindo o fluxo → rodar axe + auditoria de contraste → documentar em `PENDENCIAS.md`. Os bugs reais encontrados (não suposições — todos confirmados batendo em UI de verdade):

- **Etapa 3**: modo "progressão" ignorava a área escolhida ao gerar a próxima questão; painel "Nesta sessão" não atualizava após cada resposta; `FocusShell` não tinha `h1` (falha de axe `page-has-heading-one`).
- **Etapa 4**: botão "Enviar resposta" aparecia indevidamente no simulado (ver decisão 1 da seção 8); `Tentativa.id` inconsistente quebrando a busca de resolução (ver decisão 2); em-dash usado como separador na listagem de simulados.
- **Etapa 5**: rolagem horizontal a 360px no Perfil causada pelo `AppShell` sem `min-w-0` (ver decisão 3); uso indevido de `--amber` num aviso de "modo de demonstração" que não é conteúdo de IA (violação da regra 9, corrigido pro estilo neutro já usado em avisos parecidos); travessão como separador em 6 lugares de texto visível ao usuário (banner de demonstração global, mensagem de erro do treino, enunciado de toda questão do mock, resumo do treino, títulos da galeria dev) — todos corrigidos pra dois-pontos, frase separada, ou parênteses.
- **Etapa V (ajuste visual "calor e identidade")**: `trecho` da listagem de Questões cortava o enunciado com `.slice(0, 140)` sem respeitar palavra nem acrescentar reticências (o "enunciado cortado no meio" apontado no diagnóstico de paridade) — o `line-clamp-2` em CSS já existia e não era o problema; corrigido com `truncarNaPalavra` novo em `lib/format.ts`. `mock/client.ts` `entrar()` gerava o nome do perfil a partir do prefixo do e-mail (`"Olá, santoz"` pra um e-mail assim), trocado por nome fixo de demonstração. Anel de foco aparecia no `h1` em toda troca de rota mesmo por clique de mouse (heurística de `:focus-visible` do navegador em foco programático de elemento não interativo) — exceção CSS documentada e escopada só a `h1[tabindex="-1"]`.

Uma "falsa pista" que vale registrar pelo processo: durante o teste manual do simulado, um script de automação (não o app) clicou em várias questões rápido demais sem esperar o React re-renderizar entre cliques, fazendo parecer que só a primeira resposta salvava. Refeito o teste clicando e aguardando a cada questão, confirmou que o mock e o client estavam corretos — vale sempre descartar erro de teste antes de assumir bug de produto.

---

## 10. Testes e verificação

```
e2e/
├─ entrada.spec.ts           # login, cadastro, termos/privacidade
├─ questoes.spec.ts           # banco de questões, resolver/corrigir
├─ treino.spec.ts              # início, escolher modo, sessão, resumo
├─ simulados.spec.ts            # montar, resolver, resultado, correção
├─ perfil.spec.ts                # identidade, tabela, tema, preferências
├─ navegacao.spec.ts              # redirecionamentos, 404
└─ acessibilidade.a11y.spec.ts     # axe em toda rota estática + dinâmica, nos 2 temas
scripts/
└─ auditar-contraste.ts             # contraste WCAG real, além do que o axe enxerga
```

Padrão de login em todo teste: `aluno@teste.com` / `senha123`. Padrão de criar um simulado de teste: ir em `/simulados`, clicar "Iniciar simulado" sem mudar nada (a configuração padrão já é um simulado personalizado de 10 questões de Matemática).

Estado atual (última verificação, com todas as 6 etapas): typecheck limpo, lint limpo, 10 testes unitários, 74 testes e2e, 32 checagens de acessibilidade (zero violações nos dois temas), zero falhas de contraste, build de produção limpo. Uma flakiness conhecida e documentada: o script de auditoria de contraste pode estourar timeout no fluxo de sessão de treino quando rodado sob alta concorrência (muitos navegadores abertos em sequência) — não é bug de tela, é contenção de recurso da máquina; os timeouts já foram aumentados uma vez (seção Etapa 5 do `PENDENCIAS.md` tem o detalhe).

---

## 11. Decisões que são do grupo, não da IA (`TODO(equipe)`, seção 14 do prompt)

A IA nunca decide estes itens sozinha — só sinaliza no código e documenta. Lista completa, com o que o mock usa como placeholder provisório, está em `docs/PENDENCIAS.md` seção "Decisões em aberto". Resumo:

1. Escala de proficiência exibida (theta 3PL vs. 0–1000).
2. Volume mínimo de respostas pra estimar proficiência/reforço, por área (mock: 20).
3. Regra exata do Combo (mock: 3 acertos por degrau, reduz no erro).
4. Cortes de dificuldade por área a partir do parâmetro `b` (mock usa corte único global, prompt pede por área).
5. Texto jurídico de Termos/Privacidade, consentimento de menores de 18.
6. Códigos/descrições reais de habilidade (mock inventa H1–H24 fora do padrão oficial H1–H30 por área).
7. Nomes finais dos campos da API quando a FastAPI existir (hoje tipado manualmente, vai ser gerado do OpenAPI).
8. Confirmar Supabase Auth como provedor.
9. Tempo padrão e composição do "dia completo" do simulado (mock já implementa uma escolha provisória — ver `PENDENCIAS.md`).

---

## 12. Como continuar a partir daqui

Se a tarefa for **adicionar algo novo**: primeiro confirme se está na Fase 1 (`docs/FRONTEND_PROMPT.md` seção 8) ou se é Fase 2 (`docs/PROMPT_FRONTEND_FASE2_GABARITEI.md`, não construído). Não adicione nada da Fase 2 sem pedido explícito do usuário — nem link, nem botão, nem rota, mesmo que pareça inofensivo.

Se a tarefa for **mexer em algo existente**: leia a tela inteira (`page.tsx` + `[nome]-client.tsx`) antes de editar, confirme o padrão de API (`getApi()`, nunca mock direto), e depois de editar rode pelo menos `npm run typecheck && npm run lint` — idealmente também o e2e da área que você tocou e, se mexeu em cor/layout, a auditoria de contraste.

Sempre que testar uma tela nova, teste de verdade (navegador, não só leitura de código) — o histórico da seção 9 mostra que isso encontrou bug real em praticamente toda etapa, nunca zero.
