# Gabaritei: prompt do front-end, Fase 1 (Claude Code ou Cursor)

Gabaritei: Sistema de Auxílio para Estudo (Projeto Integrador VI, PUC-Campinas). Briefing para uma IA de código construir o front-end num repositório Next.js. Versão de 23/10/2026.

Esta é a Fase 1: só as telas centrais, as que mostram o que o projeto é. As demais telas estão em `PROMPT_FRONTEND_FASE2_GABARITEI.md` e não devem ser construídas agora.

## Como usar (leia antes, não faz parte do prompt)

- Crie o repositório do front (sugestão de nome: gabaritei-web) e salve este arquivo em `docs/FRONTEND_PROMPT.md`.
- Crie um `CLAUDE.md` (Claude Code) ou `.cursor/rules/gabaritei.mdc` (Cursor) com duas linhas: "Leia docs/FRONTEND_PROMPT.md inteiro antes de qualquer tarefa" e "As regras da seção 2 valem em toda resposta".
- Siga as etapas da seção 12, uma por conversa, com o texto de início de etapa que está lá. São 6 etapas (0 a 5).
- Tudo que aparece como `TODO(equipe)` é decisão do grupo. A IA não deve inventar valor nenhum: deixa o marcador no código e lista no final da etapa.
- Ao fim de cada etapa, peça para ela rodar as checagens da seção 11 e colar o resultado.
- Só abra o arquivo da Fase 2 depois que a Fase 1 estiver estável.

## PROMPT (começa aqui)

### 1. Papel e objetivo

Você é um engenheiro front-end sênior com olho de designer, trabalhando num repositório Next.js que já existe ou que você vai criar na etapa 0. Seu trabalho é implementar o front-end do Gabaritei, uma plataforma web que recomenda questões do ENEM de forma adaptativa, sempre dizendo o critério da recomendação, e mostra ao estudante o desempenho dele. O back-end (FastAPI + PostgreSQL/Supabase) é feito por outras pessoas do grupo e ainda não está pronto, então você constrói contra uma camada de API tipada com dados mockados (seção 7) que depois troca por chamadas reais sem mexer nas telas.

Escopo desta fase. Entrar e criar conta, Início, treino adaptativo (os 4 modos e o Combo), banco de questões, resolver e corrigir questão, simulado com cartão-resposta, e um Perfil enxuto (proficiência por área, reforço prioritário, Foguinho, preferências). São 15 telas, listadas na seção 8. Não construa, não crie link e não crie botão para nada da lista "Fase 2" da seção 8. Se um botão levaria a uma tela da Fase 2, ele simplesmente não aparece.

Responda e comente em português do Brasil. Textos da interface também em português do Brasil, com tom direto e sem formalidade exagerada.

### 2. Regras que valem sempre

Estas regras vêm dos requisitos do projeto e de decisões já tomadas pelo grupo. Se algum pedido seu entrar em conflito com elas, pare e avise antes de seguir.

**Escopo**

1. Só ENEM. FUVEST e UNICAMP aparecem apenas como "em breve", desabilitados, com o motivo escrito na tela.
2. Não existe: redação ou questão discursiva, geração de questões novas, escaneamento de questão por foto (OCR), aplicativo mobile nativo, XP, níveis, moedas, ranking entre alunos. As únicas mecânicas de engajamento são Foguinho (dias seguidos com atividade) e Combo (acertos seguidos dentro da sessão que sobem a dificuldade).
3. O front não calcula regra de negócio. Proficiência, Combo, Foguinho, dificuldade, critério da recomendação e elegibilidade vêm da API (no mock, vêm do "servidor falso" da seção 7). A tela só mostra. Isso é o RNF04: trocar o recomendador não pode exigir reescrever telas.

**Honestidade dos dados**

4. Nunca invente conteúdo que parece oficial. Resolução ausente aparece como "Resolução ainda não cadastrada para esta questão" (RF07). Metadado ausente (habilidade, ano, parâmetros TRI) aparece como "não informado" e a questão não entra no filtro daquele metadado (RF03 e RF04). Figura sem descrição cadastrada mostra um aviso, nunca uma descrição inventada (RF05).
5. Antes do volume mínimo de respostas, proficiência e prioridades de reforço mostram "dados insuficientes" com quantas respostas faltam (RF09 e RF10). Nunca mostre número estimado nesse caso.
6. Toda recomendação mostra o critério usado (RF11). O texto do critério vem da API; o front não monta frase de critério com dados que não recebeu.
7. Quando as questões elegíveis acabam, a API devolve um aviso (faixa ampliada, questões reapresentadas) e a tela conta isso ao estudante (RF11).
8. Em modo mock, existe sempre um aviso fixo "Dados de demonstração" visível. O mock usa questões fictícias e marcadas como demonstração, nunca texto de prova real colado como se fosse dado.

**IA**

9. Âmbar (`--amber`) é a cor exclusiva de "isto foi decidido por IA": o bloco de critério da recomendação e o selo "Recomendado". Âmbar não aparece em mais nada (nem no Foguinho, nem em alertas). Nenhum roxo ou violeta em lugar nenhum.

**Acessibilidade (RNF06)**

10. WCAG 2.1 AA: contraste de texto ≥ 4,5:1 (3:1 para texto grande e para ícones e bordas que carregam informação), tudo operável só pelo teclado, compatível com leitor de tela, informação nunca só por cor (sempre ícone ou texto junto), alvos de toque ≥ 44 px, `prefers-reduced-motion` respeitado.
11. Interface responsiva de 360 px a 1440 px. Sem rolagem horizontal da página em 360 px.

**Código**

12. TypeScript estrito, sem `any`. Todo dado que vem de fora passa por tipos da seção 7. Tipo novo que não está na seção 7: crie, mas liste no final da etapa para o grupo aprovar.
13. Nada de `outline: none` sem substituto, nada de `transition: all`, animar só `transform` e `opacity`.
14. Se faltar informação, não adivinhe: deixe `// TODO(equipe): <pergunta>` e liste no fim da etapa.

### 3. Contexto do produto

O que é. Uma plataforma de preparação para o ENEM. O estudante resolve questões reais de provas anteriores. A cada resposta, o sistema atualiza o desempenho e a proficiência estimada dele por área (modelo TRI de três parâmetros) e recomenda as próximas questões considerando desempenho, conteúdo prioritário e dificuldade.

Quem usa. Estudantes brasileiros que se preparam para o ENEM, incluindo menores de 18 anos (isso importa para a LGPD, RNF07). Pense em alguém de 17 anos no celular entre uma aula e outra, e em alguém de 20 anos num notebook fazendo simulado de manhã.

Dados que as telas mostram (vêm do INEP):

- Área do conhecimento: LC (Linguagens), CH (Ciências Humanas), CN (Ciências da Natureza), MT (Matemática).
- Habilidade da Matriz de Referência (códigos H1 a H30 dentro de cada área). `TODO(equipe)`: conferir os códigos e as descrições com a Matriz oficial antes de publicar.
- Ano da prova, código do item (co_item), parâmetros TRI a, b e c, gabarito oficial.
- Faixa de dificuldade fácil, média ou difícil, derivada do parâmetro b com cortes por área (RF03).

Os quatro modos de recomendação (RF11). O motor devolve até 5 questões por chamada, sempre com o critério:

- Tema: questões de conteúdo parecido com um tema escrito ou com uma questão escolhida (similaridade de texto). Único modo que funciona sem histórico.
- Habilidade: questões das habilidades prioritárias do estudante. Precisa de histórico suficiente.
- Nível: questões com dificuldade compatível com a proficiência estimada, buscando o alvo de acerto definido pelo grupo. Precisa de proficiência estimada e de TRI.
- Progressão com Combo: a dificuldade-alvo sobe a cada sequência de acertos e reduz ou reinicia no erro (RF18).

Foguinho (RF17): +1 a cada dia com pelo menos uma questão respondida; reinicia depois de um dia sem atividade. Combo (RF18): conta acertos seguidos na sessão, aparece durante a sessão, e a regra (acertos por degrau, tamanho do degrau, o que acontece no erro) é configurável e vem da API.

Referências de mercado (para você ter noção do nível esperado, sem copiar): Estuda.com, Descomplica, Stoodi, Khan Academy. O diferencial do Gabaritei é usar os parâmetros TRI oficiais por questão e mostrar o critério de cada recomendação.

### 4. Stack e convenções

- Next.js (App Router) + TypeScript estrito + React atual estável. Gerenciador de pacotes: npm (`TODO(equipe)`: documento original sugeria pnpm; trocado para npm nesta etapa porque não havia permissão para instalar pnpm globalmente na máquina usada — confirmar com o grupo se querem manter npm ou migrar).
- Estilo: Tailwind CSS lendo os tokens da seção 6 como variáveis CSS (`@theme`). Componentes de comportamento complexo (Dialog, Popover, RadioGroup, Switch, Select) sobre Radix UI (headless, acessível) com estilo próprio. Não use os estilos padrão do shadcn/ui nem de nenhum kit pronto: o visual do Gabaritei é específico e kit genérico quebra isso.
- Dados do servidor: TanStack Query. Estado só de interface: `useState`/`useReducer`.
- Formulários: react-hook-form + zod.
- Ícones: lucide-react, traço 1,75, sempre com rótulo de texto ou `aria-label`.
- Autenticação: assuma Supabase Auth (e-mail e senha). Sem login social. No mock, uma sessão falsa em cookie. `TODO(equipe)`: confirmar o provedor.
- Testes: Vitest + Testing Library (lógica e componentes), Playwright + @axe-core/playwright (fluxos e acessibilidade).
- Fontes: via `next/font/google` (hospedadas pelo próprio Next). Nada carregado de CDN em tempo de execução.
- Idioma: `<html lang="pt-BR">`. Datas e números com `Intl` em pt-BR.
- Nomes: termos de domínio em português sem acento (Questao, Tentativa, Sessao, Proficiencia, CartaoResposta, Foguinho, Combo); termos técnicos em inglês (Button, Dialog, useQuery). Componentes em PascalCase, arquivos em kebab-case.
- Commits: pequenos, um por tela ou componente, mensagem curta no imperativo.

### 5. Estrutura do repositório

```
gabaritei-web/
  CLAUDE.md                      # aponta para docs/FRONTEND_PROMPT.md
  docs/
    FRONTEND_PROMPT.md           # este arquivo
    PENDENCIAS.md                # lista viva de TODO(equipe) e tipos novos
  src/
    app/
      (publico)/                 # entrar, cadastrar, privacidade, termos
      (foco)/                    # treino/[sessaoId], simulados/[id] (tela cheia, sem menu)
      (app)/                     # inicio, treino, questoes, simulados, perfil  (com AppShell)
      dev/componentes/page.tsx   # galeria viva dos componentes (some em produção)
      layout.tsx  not-found.tsx  error.tsx
    components/
      ui/                        # Button, Field, Dialog, Table, Switch... (base, sem regra de negócio)
      dominio/                   # QuestionView, CartaoResposta, ComboMeter, FoguinhoBadge,
                                 # CriterioRecomendacao, AreaTag, FaixaChip, StatusChip...
      layout/                    # AppShell, Sidebar, BottomNav, FocusShell, PageHeader, SkipLink
    lib/
      api/
        types.ts                 # CONTRATO (seção 7). Fonte única dos tipos.
        client.ts                # interface Api + escolha mock|http por env
        http/                    # implementação real (fetch para a FastAPI). Começa vazia.
        mock/                    # servidor falso: engine.ts, dados.ts, cenarios.ts
        errors.ts                # ApiError e mapeamento para textos
      hooks/                     # useSessao, useCombo, useTema, useAtalhos...
      format.ts                  # datas, números, unidades com espaço sem quebra
    styles/
      tokens.css                 # variáveis claro/escuro (seção 6)
      globals.css
  e2e/                           # Playwright + axe
  scripts/                       # gerar-mock.ts, auditar-contraste.ts
  .env.example                   # NEXT_PUBLIC_API_MODE=mock | http, NEXT_PUBLIC_API_URL=
```

### 6. Design system: "geek e clean"

A ideia. Um painel técnico de dados (terminal, monitor financeiro) que nasceu do material impresso de prova: papel off-white, tipografia de tinta, tabelas e marcações de caderno de questões. Precisa passar a sensação de estudar com seriedade e de forma organizada, e não de app infantil, de gamificação ou de clínica.

Evite (já decidido pelo grupo):

- Look clínico ou de hospital: verdes menta ou azul-piscina, fundo branco puro, grade de cards todos iguais, cara de SaaS genérico.
- Gamificado demais: verde neon, brilho (glow), estética RGB.
- Roxo e violeta em qualquer lugar.
- Rótulos de seção em caixa-alta com espaçamento entre letras.
- Pontos de XP, nível, moeda, medalha.
- Strings com ponto médio ("A · B · C"), traço longo, setas "→" no fim de links e botões.
- Cards todos com o mesmo raio, a mesma sombra cinza e o mesmo preenchimento.
- Gradientes decorativos, fade-and-slide-up em toda seção, hover animado em todo card.

O elemento memorável (gaste a ousadia aqui): o cartão-resposta do ENEM. Bolhas A a E em linhas numeradas, como a folha de verdade. Ele aparece no resultado do simulado (45 questões, 3 colunas × 15 linhas), no painel lateral do simulado em andamento e, em miniatura, como indicador de progresso das sessões de treino. O resto da interface fica quieto e disciplinado.

**Tokens (`src/styles/tokens.css`)**

Todos os pares abaixo foram calculados contra WCAG. Use exatamente estes valores; mude só com nova checagem.

```css
:root {
  color-scheme: light;

  /* superfícies */
  --paper:        #F4F2EC;   /* fundo da página (off-white, nunca #FFF) */
  --paper-2:      #ECE9E0;   /* áreas rebaixadas: trilhas, cabeçalho de tabela */
  --card:         #FBFAF7;   /* folha elevada: questão, painéis */

  /* tinta */
  --ink:          #1D2420;   /* texto principal   14,15:1 no paper */
  --ink-2:        #4B554E;   /* texto secundário   6,93:1 no paper */
  --rule:         #D9D5C8;   /* linhas DECORATIVAS (não usar em borda de campo) */
  --rule-strong:  #8F8A7A;   /* bordas de campo e controle   3,08:1 */

  /* identidade */
  --forest:       #2C6E49;   /* botão, barras, ícones   5,46:1 no paper */
  --forest-hover: #245C3C;
  --forest-soft:  #E3ECE4;
  --forest-ink:   #245C3C;   /* texto verde (links, rótulos)   6,51:1 sobre forest-soft */
  --on-forest:    #FFFFFF;   /* texto no botão   6,12:1 */

  /* IA: exclusivo (regra 9) */
  --amber:        #B8842E;   /* APENAS preenchimento, borda, ícone. 2,94:1, nunca texto */
  --amber-soft:   #F3E7CC;
  --amber-ink:    #6B4A10;   /* texto de IA   7,18:1 no paper, 6,55:1 no amber-soft */

  /* erro (e "errou") */
  --err:          #A8321F;   /* 5,97:1 no paper */
  --err-soft:     #F5E1DC;   /* texto --err sobre ele: 5,31:1 */
  --on-err:       #FFFFFF;   /* 6,69:1 sobre --err */

  /* áreas: em tags, filetes finos, e (etapa V, item 2, TODO(equipe): ratificar) ladrilhos
     de seleção de área (AreaTile) — ícone + fundo *-soft + texto da cor da área, nunca
     texto corrido nem fundo sólido forte. Ver docs/PENDENCIAS.md. */
  --area-mt: #3F5E8C;  --area-mt-soft: #E4EAF3;   /* azul-ardósia */
  --area-cn: #17665F;  --area-cn-soft: #DFEEEC;   /* verde-azulado */
  --area-ch: #7D2E45;  --area-ch-soft: #F1E2E6;   /* bordô */
  --area-lc: #9A4614;  --area-lc-soft: #F6E6DA;   /* laranja queimado */

  --focus: #2C6E49;                                /* anel de foco: 2px + offset 2px */
  --shadow-overlay: 0 8px 24px rgb(29 36 32 / 0.16);
}

[data-theme="dark"] {
  color-scheme: dark;
  --paper: #121714;  --paper-2: #1E2622;  --card: #1A211D;
  --ink: #E9EBE4;   --ink-2: #A9B3AC;
  --rule: #2C3530;  --rule-strong: #6A7370;
  --forest: #6BBE90; --forest-hover: #82CBA3; --forest-soft: #24342B; --forest-ink: #6BBE90; --on-forest: #0E1A13;
  --amber: #D9A441; --amber-soft: #323324; --amber-ink: #E5B85A;
  --err: #EE8F7F;   --err-soft: #332E29;   --on-err: #1A0F0C;
  --area-mt: #8FAAD6; --area-mt-soft: #283133;
  --area-cn: #62B8AF; --area-cn-soft: #23332F;
  --area-ch: #DB93AB; --area-ch-soft: #312F2E;
  --area-lc: #E8975F; --area-lc-soft: #332F25;
  --focus: #6BBE90;
  --shadow-overlay: 0 8px 24px rgb(0 0 0 / 0.5);
}
/* Tema: classe/atributo no <html>. Padrão = preferência do sistema; o usuário pode forçar em Configurações. */
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { /* repetir os valores de [data-theme="dark"] */ } }
```

Contrastes conferidos (claro): texto das áreas sobre o papel 5,88 (MT), 6,05 (CN), 7,99 (CH), 5,75 (LC); sobre o soft de cada uma 5,44, 5,67, 7,14, 5,29. No escuro, todos os textos de acento ≥ 5,5:1 sobre o soft. Se mudar uma cor, rode de novo a auditoria da seção 11.

Ressalvas conhecidas (não tente "consertar" sem falar com o grupo):

- `--amber` como borda ou ícone tem 2,94:1 no claro, um pouco abaixo dos 3:1 de elementos gráficos. Por isso sempre há um rótulo de texto em `--amber-ink` junto (por exemplo "Recomendado pelo modelo"), e a informação nunca depende só do âmbar.
- `--rule` (1,31:1) é só decoração. Borda de campo, de botão secundário e de alternativa usa `--rule-strong`.
- O verde das barras contra a trilha `--paper-2` tem 5,04:1, mas todo valor aparece também em número ao lado da barra.

**Mapa de cor por área**

LC laranja queimado, CH bordô, CN verde-azulado, MT azul-ardósia. `TODO(equipe)`: o design system antigo previa cor por disciplina (Matemática, Física, Biologia, Química), mas os dados do INEP só trazem as 4 áreas. Se o banco passar a ter disciplina, o mapa muda; os tokens aguentam.

**Tipografia**

- Serifada editorial: Source Serif 4 (variável, com tamanho óptico). Títulos (h1 a h3), números grandes (acertos, proficiência) e todo enunciado de questão.
- Interface: IBM Plex Sans. Botões, formulários, tabelas, menus.
- Dados técnicos: IBM Plex Mono, somente para valores que são "de máquina": código do item (co_item), parâmetros a, b, c, cronômetro, Combo ×3. Nunca para rótulos comuns.
- Escala: 12, 14, 16, 18, 22, 28, 36 px. Corpo de interface 16. Enunciado 18 com entrelinha 1,65 e no máximo 68 caracteres por linha. 12 px só em tags. Títulos com `text-wrap: balance`, parágrafos com `text-wrap: pretty`.
- `font-variant-numeric: tabular-nums` em toda tabela, cronômetro e número que muda.
- Unidades com espaço sem quebra: "2 h 49 min", "38 %".
- Texto em caixa baixa e sentence case. Sem rótulo em caixa-alta com tracking.

**Forma, superfície e movimento**

- Cards variam por função (não uma grade de iguais):
  - Folha (questão, resolução): `--card`, filete fino `--rule`, filete grosso de 2 px no topo em `--ink`, cantos de 4 px.
  - Painel (indicadores): fundo `--paper-2`, sem borda, cantos de 8 px.
  - Nota de margem (critério da IA, avisos): fundo `*-soft`, filete de 3 px à esquerda na cor do tipo, cantos retos à esquerda.
  - Linha de lista (histórico, questões, listas): sem card, só separador de `--rule`.
  - Tabela semântica de verdade (`<table>`, `<caption>`, `th scope`).
- Raios: 4 px (folha, controles pequenos), 6 px (botões, campos), 8 px (painéis), 999 px só em tags e bolhas do cartão-resposta.
- Sombra só em sobreposições (dialog, menu, toast). Nenhuma sombra em card.
- Movimento: 120 a 180 ms, ease-out, só `transform` e `opacity`. Um único momento orquestrado: as bolhas do cartão-resposta entram em sequência uma vez no resultado (até 900 ms no total). Combo subindo de degrau anima 240 ms. Tudo some com `prefers-reduced-motion`.
- `prefers-contrast: more` aumenta `--rule` para `--rule-strong`. `prefers-reduced-transparency`: não há vidro, então nada a fazer.
- `touch-action: manipulation` em controles. `scrollbar-gutter: stable` em áreas rolantes. Cor do tema em `<meta name="theme-color">` por modo.

**Estados visuais de uma alternativa (componente Alternativa)**

Cada estado tem forma + texto, nunca só cor:

| Estado | Aparência | Texto para leitor de tela |
|---|---|---|
| normal | bolha vazia com letra | "Alternativa C" |
| selecionada | bolha cheia `--ink` | "Alternativa C, selecionada" |
| acertou | bolha cheia `--forest` com check | "Alternativa C, sua resposta, correta" |
| errou | bolha cheia `--err` com X | "Alternativa B, sua resposta, incorreta" |
| gabarito (quando errou) | anel grosso `--forest` com check | "Alternativa C, gabarito oficial" |

**Dificuldade, status e tags**

- `FaixaChip`: ícone de 1, 2 ou 3 barras + texto "Fácil", "Média", "Difícil", em `--ink-2`. Não usa cor de área nem âmbar.
- `AreaTag`: sigla (LC, CH, CN, MT) + nome curto, fundo `*-soft`, texto da cor da área.
- `StatusChip`: "Acertou" (check), "Errou" (X), "Em branco" (traço), "Não respondida" (círculo vazio), "Marcada para revisar" (bandeira).

**Voz e textos**

- Sentence case, voz ativa, verbo claro no botão ("Enviar resposta", "Começar treino", "Finalizar simulado"). O mesmo nome para a mesma ação em todo o fluxo (se o botão diz "Salvar lista", o aviso diz "Lista salva").
- Erro explica o que houve e o que fazer. Sem pedir desculpa, sem "Ops". Vazio vira convite para agir.
- Sem emoji. Sem exclamação decorativa. Sem culpa no Foguinho ("Responda uma questão hoje para manter o Foguinho", nunca "Você vai perder!").

### 7. Camada de dados tipada com mocks

Princípio. As telas só conversam com `lib/api/client.ts`. Esse arquivo expõe uma interface `Api` e escolhe a implementação por `NEXT_PUBLIC_API_MODE`:

- `mock`: usa `lib/api/mock/*` (servidor falso, roda no navegador, persiste em `localStorage` dentro de `try/catch`).
- `http`: usa `lib/api/http/*` (fetch para a FastAPI). Na etapa 0 fica só com o esqueleto, funções lançando `ApiError('indisponivel')`.

Trocar de mock para http não pode exigir mudança em nenhuma tela ou componente. Os tipos abaixo são o contrato; quando a FastAPI existir, eles são regenerados do OpenAPI (`openapi-typescript`) e as diferenças viram lista de ajustes em `docs/PENDENCIAS.md`. `TODO(equipe)`: combinar com quem faz o back-end os nomes finais dos campos (aqui estão em português, seguindo os requisitos).

#### 7.1 Tipos do contrato (`lib/api/types.ts`)

```ts
export type Area = 'LC' | 'CH' | 'CN' | 'MT';
export type Faixa = 'facil' | 'media' | 'dificil';
export type Letra = 'A' | 'B' | 'C' | 'D' | 'E';
export type ModoPratica = 'livre' | 'tema' | 'habilidade' | 'nivel' | 'progressao' | 'simulado'; // a Fase 2 acrescenta 'lista' e 'diagnostico'
export type StatusDados = 'ok' | 'dados_insuficientes';

export interface Pagina<T> { itens: T[]; total: number; pagina: number; porPagina: number }

/* Conteúdo da questão (RF05). Figura sem alt/audiodescricao NÃO pode ser escondida nem inventada. */
export interface Figura { id: string; src: string; alt: string | null; audiodescricao: string | null }
export type Bloco =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'figura'; figura: Figura }
  | { tipo: 'citacao'; texto: string; fonte?: string }
  | { tipo: 'formula'; latex: string; leitura: string }; // TODO(equipe): só se o dataset trouxer fórmulas

export interface Habilidade { codigo: string; descricao: string | null } // ex.: 'H21'

export interface Questao {
  id: string;
  ano: number | null;
  area: Area;
  coItem: string | null;
  habilidade: Habilidade | null;               // null = "não informado"
  faixa: Faixa | null;                         // null = sem TRI para derivar
  tri: { a: number | null; b: number | null; c: number | null };
  enunciado: Bloco[];
  alternativas: { letra: Letra; conteudo: Bloco[] }[]; // 5 itens
  temResolucao: boolean;
  // gabarito e texto da resolução NÃO vêm aqui: só chegam em Correcao, depois do envio.
}

/* Linha da listagem do banco de questões (RF04) */
export interface QuestaoResumo {
  id: string; area: Area; ano: number | null; habilidade: Habilidade | null; faixa: Faixa | null;
  trecho: string;                              // início do enunciado, texto puro
  ultimaTentativa: 'acertou' | 'errou' | null; // null = ainda não respondeu
}
export interface FiltrosQuestoes { areas?: Area[]; habilidades?: string[]; anos?: number[]; faixas?: Faixa[] }

/* Recomendação (RF11) */
export interface Criterio {
  modo: 'tema' | 'habilidade' | 'nivel' | 'progressao';
  texto: string;   // frase pronta da API. Ex.: "Mesma habilidade (H21) em que você acertou 38 %."
  area?: Area; habilidade?: string; faixaAlvo?: Faixa;
}
export interface Recomendacao { id: string; posicao: number; questao: Questao; criterio: Criterio }
export interface Aviso {
  tipo: 'sem_historico' | 'faixa_ampliada' | 'reapresentadas' | 'poucas_elegiveis';
  texto: string;
}
export interface RecomendacaoResposta {
  itens: Recomendacao[];                       // até 5
  modelo: { nome: string; versao: string };    // RF08/RNF09: versão que originou a recomendação
  aviso: Aviso | null;
}
export interface PedidoRecomendacao {
  modo: 'tema' | 'habilidade' | 'nivel' | 'progressao';
  areas?: Area[]; habilidade?: string;
  temaTexto?: string; questaoBaseId?: string;
  quantidade?: number;                          // padrão 5
}

/* Tentativa e correção (RF06, RF07, RF08) */
export interface EnvioResposta {
  questaoId: string; letra: Letra; modo: ModoPratica;
  sessaoId: string | null; recomendacaoId: string | null;
  chaveIdempotencia: string;                    // impede duplicação acidental (RF06)
}
export interface Correcao {
  tentativaId: string; correta: boolean; gabarito: Letra;
  resolucao: string | null;                     // null = "Resolução ainda não cadastrada"
  respondidaEm: string;
}
export interface EnvioResultado { correcao: Correcao; combo: ComboEstado | null; proxima: Recomendacao | null }

export interface Tentativa {                    // usada na revisão de uma questão já respondida
  id: string; questaoId: string; resposta: Letra | null; correcao: Correcao;
  modo: ModoPratica; versaoModelo: string | null; sessaoId: string | null;
}

/* Sessão de treino e Combo (RF17, RF18). Regra do Combo é da API; a tela só exibe. */
export interface ComboConfig { acertosPorDegrau: number; noErro: 'reinicia' | 'reduz' } // TODO(equipe): valores
export interface ComboEstado {
  atual: number; melhor: number;
  degrau: number; degrausTotal: number;         // posição na escada de dificuldade
  faixaAlvo: Faixa;
  acertosParaSubir: number | null;              // null = já no topo
  evento: null | 'subiu' | 'desceu' | 'reiniciou' | 'no_topo';
  config: ComboConfig;
}
export interface Sessao {
  id: string; modo: ModoPratica; iniciadaEm: string; encerradaEm: string | null;
  total: number | null; respondidas: number; acertos: number; combo: ComboEstado | null;
  duracaoSegundos: number | null;
}
export interface ParamsSessao extends PedidoRecomendacao { quantidade: number }
export interface ResumoSessao {
  sessao: Sessao;
  itens: { posicao: number; tentativaId: string; questaoId: string; area: Area; habilidade: string | null; letra: Letra; correta: boolean }[];
  porHabilidade: { habilidade: Habilidade | null; acertos: number; total: number }[];
  foguinho: Regularidade['foguinho'];
  proficiencias: Proficiencia[];
  proxima: Recomendacao | null;
}

/* Progresso e perfil (RF09, RF10, RF17) */
export interface Proficiencia {
  area: Area; status: StatusDados;
  valor: number | null; intervalo: [number, number] | null;
  respostasConsideradas: number; respostasMinimas: number;
  rotuloEscala: string;                         // TODO(equipe): que escala exibir (theta ou 0 a 1000)
  tendencia: 'subindo' | 'estavel' | 'caindo' | null; atualizadaEm: string | null;
}
export interface Reforco {
  status: StatusDados; respostasAtuais: number; respostasMinimas: number;
  prioridades: { posicao: number; area: Area; habilidade: Habilidade; taxaAcerto: number; respostas: number }[];
}
export interface Regularidade {
  foguinho: { atual: number; melhor: number; hojeContou: boolean; emRisco: boolean };
  semana: { data: string; questoes: number }[];           // 7 dias
  metaSemanal: { alvo: number; feito: number };
}
export interface ResumoGeral { respondidas: number; acertos: number; erros: number; taxaAcerto: number | null }

/* Simulado (RF13) */
export interface SimuladoConfig {
  escopo: 'area' | 'dia' | 'personalizado'; areas: Area[]; quantidade: number;
  ano: number | null; duracaoMinutos: number | null; cronometroVisivel: boolean;
}
export interface SimuladoResumo {
  id: string; status: 'em_andamento' | 'finalizado'; rotulo: string; iniciadoEm: string;
  limiteEm: string | null; total: number; respondidas: number; acertos: number | null; duracaoSegundos: number | null;
}
export interface Simulado {
  id: string; config: SimuladoConfig; status: 'em_andamento' | 'finalizado';
  iniciadoEm: string; limiteEm: string | null;
  itens: { n: number; questao: Questao; resposta: Letra | null; marcada: boolean }[];
}
export interface ResultadoSimulado {
  simuladoId: string; acertos: number; total: number; emBranco: number; duracaoSegundos: number;
  porArea: { area: Area; acertos: number; total: number }[];
  itens: { n: number; questaoId: string; area: Area; habilidade: string | null;
           resposta: Letra | null; gabarito: Letra; correta: boolean; marcada: boolean }[];
  habilidadesFracas: { area: Area; habilidade: Habilidade; acertos: number; total: number }[];
  proficiencias: Proficiencia[];
}

/* Conta e preferências */
export interface Perfil { id: string; nome: string; email: string; faixaEtaria: 'maior_18' | 'menor_18' | null; criadoEm: string }
export interface Preferencias {
  tema: 'sistema' | 'claro' | 'escuro'; descricaoImagensAberta: boolean;
  atalhosTeclado: boolean; metaSemanal: number;
}

export type CodigoErro =
  | 'nao_autenticado' | 'sem_permissao' | 'nao_encontrado' | 'validacao'
  | 'limite_excedido' | 'indisponivel' | 'desconhecido';
export class ApiError extends Error { constructor(public codigo: CodigoErro, mensagem: string, public detalhes?: unknown) { super(mensagem); } }
```

#### 7.2 Funções da interface Api (e o endpoint futuro)

Toda função é async, devolve o tipo acima e lança `ApiError`. O caminho da direita é só uma sugestão para a FastAPI.

| Função | Endpoint futuro |
|---|---|
| `entrar`, `cadastrar`, `sair`, `obterUsuarioAtual` | Supabase Auth |
| `obterPerfil`, `atualizarPerfil` | `GET/PATCH /me` |
| `obterPreferencias`, `atualizarPreferencias` | `GET/PATCH /me/preferencias` |
| `listarQuestoes(filtros, pagina): Pagina<QuestaoResumo>`, `obterQuestao(id)`, `listarHabilidades()` | `GET /questoes`, `GET /questoes/{id}`, `GET /habilidades` |
| `obterRecomendacoes(pedido)` | `POST /recomendacoes` |
| `iniciarSessao(params: ParamsSessao): { sessao, primeira: RecomendacaoResposta }`, `obterSessao(id)`, `encerrarSessao(id): ResumoSessao`, `obterResumoSessao(id)` | `POST /sessoes`, `GET /sessoes/{id}`, `POST /sessoes/{id}/encerrar`, `GET /sessoes/{id}/resumo` |
| `enviarResposta(envio): EnvioResultado`, `obterTentativa(id)` | `POST /tentativas`, `GET /tentativas/{id}` |
| `obterProficiencias()`, `obterReforco()`, `obterRegularidade()`, `obterResumoGeral()` | `GET /proficiencias`, `/reforco`, `/regularidade`, `/resumo` |
| `listarSimulados()`, `criarSimulado(config)`, `obterSimulado(id)`, `salvarRespostaSimulado(id, n, letra)`, `marcarRevisao(id, n, marcada)`, `finalizarSimulado(id)`, `obterResultadoSimulado(id)` | `/simulados` |

Regras de comportamento (valem para o mock e para o real):

- O gabarito e a resolução só existem na resposta de `enviarResposta` (ou no resultado do simulado e na revisão, depois de respondido). Nunca vêm junto da questão.
- `enviarResposta` devolve também a próxima questão (`proxima`), porque no modo progressão a dificuldade depende da resposta que acabou de ser dada. Nos outros modos, as 5 recomendações vêm em lote (em `iniciarSessao`) e `proxima` pode ser `null`.
- A tela envia `chaveIdempotencia` (um UUID por tentativa de envio). Reenviar com a mesma chave não duplica a tentativa.
- Erros 401 e 403 levam para `/entrar` com mensagem; nunca mostram dado de outro usuário.
- Leitura e recomendação precisam responder em até 3 s (RNF02). A tela mostra skeleton depois de 200 ms de espera e nunca trava a interface.

#### 7.3 O servidor falso (`lib/api/mock/`)

É um pedaço de software de verdade, pequeno, para que as telas exercitem todos os estados:

- `dados.ts` + `scripts/gerar-mock.ts`: gera de forma determinística (semente fixa) cerca de 60 questões fictícias, claramente marcadas como demonstração no texto (por exemplo "Questão de demonstração 12, Matemática"). Misture de propósito: com e sem habilidade, com e sem TRI, com e sem resolução, com figura com descrição, com figura sem descrição, anos variados, as 4 áreas, as 3 faixas. Não cole texto de prova real.
- `engine.ts`: versão mínima das regras para as telas terem o que mostrar, sem pretensão de ser o recomendador: elegibilidade, os 4 modos (ordenação simples), redutor do Combo (usando `ComboConfig`), Foguinho (+1 por dia, reinicia após 1 dia sem atividade), proficiência com volume mínimo (`MOCK_MIN_RESPOSTAS`, padrão 20 por área), ampliar faixa e reapresentar quando as elegíveis acabam. Devolve `modelo: { nome: 'mock', versao: '0.0.0' }`.
- `cenarios.ts`: seletor de cenário por `?cenario=` ou por um menu que só aparece em desenvolvimento (`ScenarioSwitcher`):
  - `novo` (conta sem histórico), `ativo` (histórico e proficiência ok), `parcial` (algumas áreas com dados insuficientes), `esgotado` (poucas questões elegíveis), `lento` (respostas de 4 s), `erro` (30 % das chamadas falham), `sem-permissao` (401/403).
- Latência simulada de 300 a 900 ms em toda chamada, para os estados de carregamento aparecerem de verdade.
- Um `DemoBanner` fixo no topo enquanto `API_MODE=mock`.

### 8. Mapa de telas e navegação

**Fase 1 (construir agora): 15 telas**

| # | Rota | Tela | Requisitos | Etapa |
|---|---|---|---|---|
| 1 | `/entrar` | Entrar | RF01 | 1 |
| 2 | `/cadastrar` | Criar conta | RF01, RNF07 | 1 |
| 3 | `/inicio` | Início | RF10, RF11, RF17 | 3 |
| 4 | `/treino` | Treino: escolher modo | RF11 | 3 |
| 5 | `/treino/[sessaoId]` | Treino: sessão | RF05 a RF08, RF11, RF17, RF18 | 3 |
| 6 | `/treino/[sessaoId]/resumo` | Treino: resumo | RF09, RF17 | 3 |
| 7 | `/questoes` | Banco de questões com filtros | RF03, RF04 | 2 |
| 8 | `/questoes/[id]` | Resolver questão e correção | RF05, RF06, RF07 | 2 |
| 9 | `/simulados` | Simulados: montar e ver os seus | RF13 | 4 |
| 10 | `/simulados/[id]` | Simulado em andamento | RF05, RF06, RF13 | 4 |
| 11 | `/simulados/[id]/resultado` | Resultado com cartão-resposta | RF07, RF13 | 4 |
| 12 | `/simulados/[id]/questao/[n]` | Correção da questão do simulado | RF07 | 4 |
| 13 | `/perfil` | Perfil: proficiência, reforço, Foguinho, preferências | RF09, RF10, RF17 | 5 |
| 14 | `/privacidade`, `/termos` | Páginas provisórias (texto é do grupo) | RNF07 | 1 |
| 15 | `not-found`, `error` | Página não encontrada e erro | n/a | 0 |

**Fase 2 (NÃO construir agora, nem linkar)**

Recuperar e redefinir senha, primeiros passos (onboarding), diagnóstico inicial, listas de prática, plano de estudo, desempenho completo (filtros, gráficos de evolução, regularidade em calendário), histórico de estudos, assistente de estudo (chat com IA), preferências completas, conta e dados pessoais (LGPD, RF21) e a página "Como o Gabaritei recomenda". Estão descritas em `PROMPT_FRONTEND_FASE2_GABARITEI.md`.

Consequências para a Fase 1: o link "Esqueci minha senha" não aparece; depois de entrar vai direto a `/inicio`; não existe botão "Tirar dúvida com o assistente" nem "Salvar como lista"; o Perfil não tem link para "Desempenho" ou "Histórico". O Perfil já mostra o essencial de proficiência, reforço e Foguinho, só sem gráficos nem filtros.

A raiz `/` redireciona para `/inicio` (logado) ou `/entrar`. Sem landing page pública.

**Casca e navegação**

- Três cascas: pública (cabeçalho simples com logo), app (`AppShell`) e foco (`FocusShell`: sem menu, só título, progresso e "Sair"), usada em sessão de treino e simulado.
- `AppShell` ≥ 1024 px: barra lateral de 240 px (recolhe para só ícones com rótulo em tooltip e `aria-label`). Itens: Início, Treino, Questões, Simulados, e no rodapé Perfil e Sair. Item ativo com `aria-current="page"` e marca que não depende só de cor (barra de 3 px à esquerda mais peso da fonte). FUVEST e UNICAMP aparecem num seletor de exame no topo da barra como itens desabilitados "em breve".
- `AppShell` < 1024 px: barra superior com o título da página e barra inferior com 5 itens (Início, Treino, Questões, Simulados, Perfil).
- `FocusShell`: "Sair" abre confirmação que explica o que será salvo.
- Todas as cascas têm: skip link "Pular para o conteúdo", landmarks (`header`, `nav`, `main`, `footer`), um único `h1` por página, e a cada troca de rota o foco vai para o `h1` (o App Router não faz isso sozinho).
- `<title>` por rota no formato "Treino adaptativo | Gabaritei".

### 9. Componentes compartilhados

Construa antes das telas (etapa 0) e documente todos em `/dev/componentes`, nos temas claro e escuro, com todos os estados. Só o que a Fase 1 usa.

Base (`components/ui`): Button (primário, secundário, discreto, perigoso; carregando; mínimo 44 px), IconButton, Link (sempre sublinhado), Field (rótulo visível, dica, erro com `aria-describedby` e `aria-invalid`), PasswordField (botão mostrar/ocultar com `aria-pressed`), Checkbox, RadioCard (opção grande selecionável), Segmented, Switch (`role="switch"`), Combobox (habilidades, com busca), Dialog, Sheet, Tooltip (nunca carrega informação que só existe nele), Toast (região `aria-live="polite"`), Disclosure (`aria-expanded` e `aria-controls`), Pagination, Table, Skeleton, EmptyState, ErrorState (mensagem, o que fazer, botão de tentar de novo), ProgressBar (sempre com número ao lado), ProgressToMinimum ("12 de 20 respostas para estimar sua proficiência").

Domínio (`components/dominio`):

- `QuestionView` com os modos `resolver`, `revisao` e `correcao`: Enunciado (blocos de texto e citação em serifada; Figura com legenda e botão "Ler descrição da figura" que respeita a preferência de abrir por padrão; fórmula com leitura), AlternativasRadio (grupo de rádio de verdade, ver tabela de estados na seção 6), Envio (botão que bloqueia reenvio, usa `aria-disabled` e explica "Escolha uma alternativa antes de enviar" em vez de ficar cinza mudo), FeedbackCorrecao.
- `CriterioRecomendacao`: nota de margem em âmbar com o selo "Recomendado pelo modelo" (texto em `--amber-ink`), o texto do critério e, recolhido, "Versão do modelo: x.y" (RF08).
- `ComboMeter` (ver abaixo), `FoguinhoBadge`, `WeekStrip` (7 dias, cada um com `aria-label` "segunda, 3 questões" ou "terça, sem atividade").
- `CartaoResposta` (resultado, 3 colunas × 15 linhas, bolhas A a E; marcou e acertou = bolha cheia verde com check; marcou e errou = bolha cheia vermelha com X; gabarito de questão errada = anel verde grosso com check; em branco = linha com traço e texto "em branco"; cada linha é um link com `aria-label` completo, por exemplo "Questão 14: você errou, marcou A, gabarito C"; abaixo de 640 px vira 1 coluna agrupada de 15 em 15) e `CartaoRespostaMini` (sessão de treino: uma fileira de bolhas pequenas com a letra marcada; simulado: grade compacta clicável com estados respondida, marcada e em branco).
- `AreaTag`, `FaixaChip`, `StatusChip`, `Timer` (`role="timer"`, mono, `aria-live` desligado; avisos em região separada só em 30, 10, 5 e 1 min restantes), `DemoBanner`, `ScenarioSwitcher` (dev).

**ComboMeter: o Combo ligado à dificuldade (decisão de design)**

O Combo não é um contador solto. É uma escada de 3 degraus (Fácil, Média, Difícil) com o degrau-alvo atual marcado, mais o número de acertos seguidos em Combo ×3 (mono). Ao lado, o texto "Faltam 2 acertos para subir para difícil" (vem de `acertosParaSubir`). Quando `evento` é `subiu`, o degrau novo anima 240 ms (`transform`) e uma mensagem polida avisa "Combo 4. As próximas questões sobem para difícil". Quando é `reiniciou` ou `desceu`, a mensagem diz isso com a mesma clareza. Há um botão "Como o Combo funciona" que abre um Dialog lendo `config` da API. O Combo aparece durante a sessão (RF18) e no resumo (melhor Combo). Sem som, sem brilho, sem confete.

**FoguinhoBadge**

Número de dias e um ícone de chama em `--ink` ou `--forest` (nunca âmbar). `hojeContou` mostra "Hoje já conta". `emRisco` mostra "Responda uma questão hoje para manter o Foguinho". É informativo, nunca punitivo.

### 10. Especificação das telas (Fase 1)

Para cada tela: rota, requisitos, o que tem (de cima para baixo), estados, ações e regras, dados. Todo item vale para os temas claro e escuro e para 360 a 1440 px. Estados obrigatórios em toda tela que busca dados: carregando (skeleton), vazio, erro (com botão de tentar de novo), e, onde existir proficiência ou reforço, dados insuficientes.

*(O detalhamento completo tela a tela está preservado no histórico de conversa que originou este documento; use-o como referência normativa junto com este arquivo ao implementar cada etapa.)*

#### 10.1 Entrada

**Tela 1: Entrar (`/entrar`, RF01)**

Para que serve. Autenticar e levar o estudante ao Início.

O que tem: duas colunas em telas largas (esquerda formulário, direita frase curta + miniatura decorativa `aria-hidden` do cartão-resposta); em telas estreitas só o formulário. `h1` "Entrar no Gabaritei". Campos: e-mail (`autocomplete="email"`), senha (`current-password`, botão mostrar/ocultar). Botão "Entrar". Link "Criar conta". Sem "Esqueci minha senha" (é Fase 2).

Estados: enviando (spinner, "Entrando", sem reenvio); credenciais inválidas ("E-mail ou senha incorretos. Confira os dados e tente de novo.", sem dizer qual dos dois); muitas tentativas ("Muitas tentativas. Tente de novo em alguns minutos."); falha de rede (erro com tentar de novo).

Regras: depois de entrar vai para `/inicio`. Respeita `?proxima=` só para caminhos internos. Quem já está logado é redirecionado. Resumo de erros no topo recebe o foco ao falhar; campos com `aria-invalid`. Não bloqueie colar senha. Sair encerra a sessão.

**Tela 2: Criar conta (`/cadastrar`, RF01, RNF07)**

O que tem: `h1` "Criar conta". Campos: como quer ser chamado, e-mail, senha (regras de senha escritas). Pergunta de faixa etária em rádio: "Tenho 18 anos ou mais" / "Tenho menos de 18 anos". Caixa não marcada por padrão: "Li e aceito os Termos e a Política de Privacidade" (links). Parágrafo: "Suas respostas, sem identificação, ajudam a avaliar e melhorar as recomendações. Para excluir sua conta, fale com a equipe em `TODO(equipe)`: e-mail de contato." Botão "Criar conta".

Estados: e-mail já em uso (com link para entrar); senha fraca; sucesso com confirmação de e-mail ("Confira seu e-mail", "Reenviar e-mail" com contagem regressiva).

Regras: `TODO(equipe)` tratamento de menores de 18 (consentimento de responsável, texto jurídico). Enquanto isso, só registre `faixaEtaria` e mostre texto-padrão. Coletar só o necessário (sem CPF, telefone, data de nascimento completa). Depois de criar conta vai a `/inicio`, que já lida com conta nova.

#### 10.2 Início e treino adaptativo (o coração do projeto)

**Tela 3: Início (`/inicio`, RF10, RF11, RF17)**

Para que serve. Dizer em três segundos "o que fazer agora" e como estou indo.

Layout: coluna principal + lateral (larga); empilha no celular (saudação, próxima prática, retomar, Foguinho e meta, reforço).

O que tem: saudação curta com o nome (sem "bem-vindo de volta!!"); próxima prática (herói): título claro, `CriterioRecomendacao`, duração estimada e faixa-alvo, botão primário "Começar treino", secundário "Escolher outro modo"; conta nova vira "Escolha um tema para começar" com campo de tema e áreas e nota neutra; retomar (se houver treino/simulado em andamento) com "Continuar"; Foguinho e meta semanal (lateral): `FoguinhoBadge`, `WeekStrip`, meta com barra e número; reforço prioritário: lista ordenada com as 3 primeiras prioridades e botão "Treinar" em cada, ou `dados_insuficientes` com `ProgressToMinimum`.

Estados: cada bloco carrega/falha independente. Conta nova sem números inventados.

**Tela 4: Treino, escolher modo (`/treino`, RF11)**

Para que serve. Escolher como treinar.

O que tem: `h1` "Como você quer treinar?"; grupo de rádio com 4 `RadioCard` grandes (tema, habilidade, nível, progressão com Combo), cada com nome, explicação e condição de uso escrita (desabilitada com motivo quando não aplicável); opções comuns: áreas, quantidade (5/10/15/20); painel "Resumo do treino" (lateral/rodapé fixo no celular) com modo, áreas, quantidade e critério; botão "Começar treino".

Estados: sem histórico (modo tema pré-selecionado, nota neutra); sem questões elegíveis (aviso antes de começar).

**Tela 5: Treino, sessão (`/treino/[sessaoId]`, RF05 a RF08, RF11, RF17, RF18)**

Casca de foco. A tela mais importante do produto.

Layout (≥1024px): coluna da questão (até 68 caracteres) + painel lateral da sessão; no celular painel vira faixa compacta no topo.

Barra superior: título, "Questão N de M", `CartaoRespostaMini`, cronômetro opcional, "Encerrar sessão" (confirmação).

Coluna da questão: `CriterioRecomendacao` (âmbar) com motivo; nota de aviso (faixa ampliada/reapresentada) se houver; metadados discretos (`AreaTag`, habilidade, ano, `FaixaChip`); `QuestionView` modo `resolver`; botão "Enviar resposta" (bloqueia sem seleção, explica, foca o grupo); após envio: `FeedbackCorrecao` (acertou/errou, gabarito, resolução ou aviso de ausência); "Próxima questão" ou, na última, "Ver resumo".

Painel lateral: `ComboMeter`, "Nesta sessão" (acertos, erros, tempo), link "Como o Combo funciona"; anúncios `aria-live` polidos para correção, Combo, troca de questão.

Teclado: setas no grupo de alternativas; atalhos opcionais A-E/Enter/N (desligáveis no Perfil), lista em Dialog por `?`.

Erros: perda de conexão ao enviar (mantém seleção, "Tentar de novo" com mesma chave); sem mais elegíveis (painel com ações, nunca tela em branco).

**Tela 6: Treino, resumo (`/treino/[sessaoId]/resumo`, RF09, RF17)**

O que tem: `h1` "Sessão concluída"; número grande "7 de 10" e taxa de acerto; tempo total; maior Combo; `CartaoRespostaMini` clicável por linha (leva à revisão); tabela "Por habilidade"; bloco Foguinho; bloco proficiência (valor+tendência ou `ProgressToMinimum`); "Próxima sugestão" com `CriterioRecomendacao`; ações "Treinar mais", "Voltar ao início".

#### 10.3 Questões

**Tela 7: Banco de questões (`/questoes`, RF03, RF04)**

O que tem: `h1` "Questões"; painel de filtros (lateral/Sheet no celular com contador "Filtros, 3 ativos"): área (checkboxes com `AreaTag`), habilidade (Combobox agrupado por área), ano, faixa de dificuldade; chips removíveis + "Limpar filtros"; região `aria-live` com contagem; ordenação; resultados em linhas (`AreaTag`, habilidade, ano, `FaixaChip`, trecho, `StatusChip` da última tentativa, link "Resolver", linha clicável); paginação (20/página); filtros na URL.

Estados: sem resultados (com botões para remover cada filtro); nota quando filtro de habilidade/ano está ativo ("Questões sem esse dado cadastrado não aparecem neste filtro.").

**Tela 8: Resolver questão e correção (`/questoes/[id]`, RF05, RF06, RF07)**

O que tem: migalhas; cabeçalho de metadados (`AreaTag`, habilidade ou "não informada", ano, `FaixaChip`, `co_item` em mono); Disclosure "Detalhes técnicos" (a, b, c e derivação da faixa); `QuestionView` (`resolver`/`correcao`/`revisao` conforme `?tentativa=`); ações "Enviar resposta", e se veio do banco, "Anterior"/"Próxima" mantendo filtros na URL.

#### 10.4 Simulado

**Tela 9: Simulados (`/simulados`, RF13)**

O que tem: `h1` "Simulados"; em andamento no topo (se houver) com "Continuar"; bloco Novo simulado (escopo em rádio: área/dia completo/personalizado; tempo sem limite ou com limite em minutos, padrão sugerido `TODO(equipe)`; "Mostrar cronômetro"; nota neutra sobre correção só no final; botão "Iniciar simulado", ou mensagem se não houver questões suficientes); concluídos em linhas (data, escopo, acertos, duração, link resultado); vazio.

**Tela 10: Simulado em andamento (`/simulados/[id]`, RF05, RF06, RF13)**

Casca de foco. Layout (≥1024px): questão à esquerda, painel Cartão-resposta à direita (`CartaoRespostaMini` em grade 3×15); no celular, folha "Cartão-resposta".

Barra: título+posição, `Timer`, indicador "Salvo", "Finalizar". `QuestionView` modo `resolver` sem correção. Ações: "Marcar para revisar" (`aria-pressed`), "Limpar resposta", "Anterior"/"Próxima", salto pelo cartão-resposta. Legenda do cartão. Finalizar abre Dialog com resumo (em branco, marcadas) e confirmação. Fim do tempo: Dialog e vai ao resultado.

**Tela 11: Resultado do simulado (`/simulados/[id]/resultado`, RF07, RF13)**

O elemento memorável. `h1` "Resultado do simulado"; número grande "34 de 45", tempo, em branco; `CartaoResposta` completo (entra em sequência, até 900ms, respeita `prefers-reduced-motion`); filtro (Todas/Erradas/Em branco/Marcadas); legenda com as 3 formas; por área (se houver mais de uma); habilidades para reforçar (com "Treinar esta habilidade"); proficiência estimada (ou `ProgressToMinimum`); nunca escrever "nota do ENEM". Ações: "Novo simulado", "Treinar as habilidades fracas", "Voltar a Simulados".

**Tela 12: Correção da questão do simulado (`/simulados/[id]/questao/[n]`, RF07)**

`QuestionView` modo `revisao`: status com ícone+texto, "Você marcou C. Gabarito oficial: A", alternativas com os estados da tabela da seção 6, resolução ou aviso de ausência, metadados como na tela 8. "Anterior"/"Próxima" entre as questões do mesmo filtro do resultado.

#### 10.5 Perfil e utilitários

**Tela 13: Perfil (`/perfil`, RF09, RF10, RF17)**

Para que serve. Versão enxuta do acompanhamento (sem gráficos, filtros ou calendário — isso é Fase 2).

O que tem, de cima para baixo: identidade (nome, e-mail, "Conta criada em...", "Sair"); números gerais numa linha com divisores (respondidas, acertos, erros, taxa); Foguinho e meta (`FoguinhoBadge`, `WeekStrip`, meta); proficiência por área (`<table>` com `caption`: área, proficiência ou `dados insuficientes`+`ProgressToMinimum`, tendência, respostas consideradas; `TODO(equipe)` escala exibida); reforço prioritário (até 5, com "Treinar", ou `dados_insuficientes`); preferências que salvam sozinhas (`aria-live` "Salvo", sem botão global): aparência (tema sistema/claro/escuro aplicado na hora), acessibilidade ("Abrir descrição das figuras por padrão"), estudo (meta semanal, atalhos de teclado).

Estados: conta nova (convites, sem números inventados). Não inclui links para Desempenho, Histórico, Conta ou Exportar dados (Fase 2).

**Tela 14: Privacidade e Termos (`/privacidade`, `/termos`)**

Páginas provisórias, só para os links do cadastro não quebrarem. Estrutura de `h2` (quais dados coletamos, para que usamos, por quanto tempo guardamos, menores de 18 anos, contato), "Última atualização", `TODO(equipe)`: texto jurídico em cada seção. Não escrever texto legal de fato. Boa leitura em impressão.

**Tela 15: Não encontrada e erro (`not-found.tsx`, `error.tsx`)**

Não encontrada: "Não achamos essa página." com "Ir para o início" e "Ver questões". Erro inesperado: "Algo deu errado do nosso lado." com o que fazer e um código de erro copiável, botão "Tentar de novo". Sem permissão (401/403): vai para `/entrar` com "Entre para continuar."; nunca revela se o recurso existe.

### 11. Acessibilidade e qualidade: como verificar

A acessibilidade aqui é requisito (RNF06), não acabamento. Cada etapa só termina depois destas checagens, com a saída colada na resposta:

| Comando | O que garante |
|---|---|
| `npm run typecheck` e `npm run lint` | TypeScript estrito, sem `any`, sem `outline: none`, sem `transition: all` |
| `npm run test` | Lógica e componentes (envio sem alternativa, bloqueio de reenvio, estados do ComboMeter, filtros na URL) |
| `npm run test:e2e` | Fluxos com Playwright: entrar, treinar e corrigir, filtrar sem resultado, simulado até o resultado |
| `npm run test:a11y` | @axe-core/playwright em toda rota, nos temas claro e escuro e nos cenários novo, ativo e parcial. Zero violações. |
| `npm run audit:contraste` | Veja abaixo |

Auditoria de contraste (`scripts/auditar-contraste.ts`). O axe não enxerga tudo. Script Playwright que, para cada elemento de texto visível: lê a cor calculada, descobre o fundo real atrás dele e calcula a razão WCAG. Falha se < 4,5:1 (< 3:1 para texto ≥ 24 px, ou ≥ 18,66 px em negrito). Rode em todas as rotas, nos dois temas. Meta: zero falhas.

Checagens adicionais: sem erro/aviso no console; sem rolagem horizontal a 360 px (nem linha de leitura > 68 caracteres a 1440 px); alvos interativos ≥ 44×44 px; nome acessível em todo controle; fluxos navegáveis só por teclado com foco visível; `prefers-reduced-motion` respeitado; toda imagem com descrição acessível ou aviso de ausência.

O que a IA não consegue verificar (fazer à mão): leitor de tela real (NVDA/VoiceOver) em entrar, treino completo e simulado até o resultado; celular de verdade; Safari e Firefox.

### 12. Etapas de construção

Faça uma etapa por vez.

- **Etapa 0: Fundação** (tela 15 e nenhuma outra). Projeto Next.js, tokens claro/escuro, fontes, troca de tema, as três cascas e a navegação, AppShell responsivo, skip link e foco no h1. Camada de API completa (types, interface Api, http esqueleto, mock com dados fictícios, engine mínimo, cenários, DemoBanner, ScenarioSwitcher). Componentes das seções 6 e 9 em `/dev/componentes`. `not-found`/`error`. Harness de testes. `docs/PENDENCIAS.md`.
- **Etapa 1: Entrada** (telas 1, 2, 14).
- **Etapa 2: Questões** (telas 7, 8).
- **Etapa 3: Treino adaptativo e Início** (telas 3, 4, 5, 6): o coração do projeto.
- **Etapa 4: Simulado** (telas 9, 10, 11, 12).
- **Etapa 5: Perfil e acabamento** (tela 13 e revisão geral).

### 13. Definição de pronto de cada tela

Uma tela só está pronta se: todos os estados existem e foram vistos nos cenários do mock; o fluxo principal funciona só pelo teclado com foco visível; axe e auditoria de contraste sem falhas nos dois temas; sem rolagem horizontal a 360 px nem linha longa a 1440 px; sem erro no console, sem `any`, nenhuma cor fora dos tokens; textos seguem a voz da seção 6; as regras 4 a 9 da seção 2 foram conferidas; há ao menos um teste cobrindo o caminho principal.

### 14. Decisões em aberto (`TODO(equipe)`)

1. Escala da proficiência que o estudante vê (theta do modelo 3PL ou 0-1000) e o rótulo.
2. Volume mínimo de respostas para estimar proficiência e apontar reforço (RF09, RF10), por área.
3. Regra do Combo: acertos por degrau, tamanho do degrau, o que acontece no erro (RF18).
4. Cortes de dificuldade por área a partir do parâmetro b (RF03) e onde documentar.
5. Menores de 18 anos: consentimento, texto e retenção (RNF07). Texto jurídico de Termos e Privacidade. Contato para exclusão de conta.
6. Habilidades: conferir códigos e descrições com a Matriz de Referência oficial.
7. Nomes finais dos campos da API e geração dos tipos a partir do OpenAPI.
8. Autenticação: confirmar Supabase Auth e a política de confirmação de e-mail.
9. Simulado: tempo padrão (sugestão 3 min/questão) e composição do "dia completo".
10. Cor por área ou por disciplina, se o banco passar a ter disciplina.
11. Fórmulas: o dataset traz LaTeX?
12. Repositório: nome (`gabaritei-web`, já definido), gerenciador de pacotes (npm, ver seção 4).

### FIM DO PROMPT
