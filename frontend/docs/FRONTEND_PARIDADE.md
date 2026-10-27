# Gabaritei: prompt de paridade com a referência (Fase 1B), Claude Code ou Cursor

Versão de 24/10/2026. Complementa `PROMPT_FRONTEND_GABARITEI.md` (Fase 1) e `PROMPT_FRONTEND_FASE2_GABARITEI.md` (Fase 2). Não substitui nenhum dos dois.

**Para que serve.** Um site de referência (outro deploy, autor desconhecido) tem coisas que o grupo gostou: transições entre telas, um Início que recebe o estudante, Perfil editável com medalhas, escolha de paleta, Configurações, atalhos. Este arquivo traz isso para o Gabaritei **adaptado**: mesma tipografia, mesmos tokens de base, mesmas regras, mesma API tipada. Nada foi copiado: telas, textos, regras de conquista e valores são nossos. O objetivo é um app acolhedor e vivo para adolescentes que continua parecendo uma ferramenta séria de estudo.

## Como usar (leia antes, não faz parte do prompt)

1. **Pré-requisitos.** Fase 1 completa. Repositório git com o commit "Fase 1 completa" e push para um repositório privado (sem isso não existe "desfazer"). Etapa V (calor e identidade, arquivo `PROMPT_AJUSTE_CALOR_GABARITEI.md`) aplicada ou descartada pelo grupo. A etapa P2 abaixo cobre o Início por inteiro; se a Etapa V já foi feita, a ferramenta evolui o que existe.
2. Salve este arquivo em `docs/FRONTEND_PARIDADE.md` e acrescente uma linha ao `CLAUDE.md`: "Na paridade, leia também docs/FRONTEND_PARIDADE.md".
3. Siga as etapas **P1 a P5, uma por conversa**, com o texto de início da seção 8.
4. `TODO(equipe)` é decisão do grupo. A ferramenta deixa o marcador no código e lista no fim da etapa.
5. Quatro coisas mudam regras que o grupo já tinha fechado e ficam atrás de chave ou de decisão do grupo: **conquistas**, **escola/cidade/sobre você**, **paletas Brasa e Sol** e a **cascata de movimento** (tabela da seção 2). Construir não significa aprovar.

**Como isto se encaixa na Fase 2**

| Tela da Fase 2 | Quem constrói | O que sobra para a Fase 2 |
|---|---|---|
| F2.2 Primeiros passos | P2 (com um passo novo de aparência) | Diagnóstico (F2.3 a F2.5) fica na Etapa 9 |
| F2.10 Desempenho, F2.11 Histórico | P4 (versões ampliadas) | Nada |
| F2.13 Preferências | P1 (Aparência) e P3 (o resto) | Nada |
| F2.1, F2.14, F2.15 | Continuam na Etapa 6 | **Fazer antes de qualquer usuário real** (LGPD, RNF07), ainda mais agora que o Perfil aceita dados opcionais |

Ordem sugerida: Etapa V, P1, P2, P3, Etapa 6 da Fase 2 (sem as telas F2.2 e F2.13, que a paridade já fez), P4 (no lugar da Etapa 7 da Fase 2), P5, Etapas 8 a 10 da Fase 2. A P5 vem depois da P4 porque os atalhos de favoritar e marcar para revisar usam os botões que a P4 cria.

---

# PROMPT (começa aqui)

## 1. Papel, objetivo e regra de entrega

Você é um engenheiro front-end sênior com olho de designer, trabalhando no repositório `gabaritei-web` (Next.js App Router, React, TypeScript estrito, Tailwind v4, Radix UI, TanStack Query, API tipada com mock). A Fase 1 está pronta. Seu trabalho agora é fazer o app ficar **acolhedor e vivo para adolescentes** sem quebrar o que o projeto é: recomendação adaptativa que **sempre diz o critério**, dados honestos e acessibilidade. Use o gerenciador de pacotes que o repositório já usa (npm), não troque.

**Regra de entrega (leia antes de agir).** Este arquivo é um briefing completo, não uma ordem para construir tudo de uma vez. Se ele chegou inteiro numa única mensagem, **não construa nada ainda**: responda perguntando qual etapa (P1 a P5). Faça só o que foi pedido. **Cada tela é uma rota própria, com nome; nunca junte telas numa página única nem faça "um painel com tudo".** Ao terminar, resuma em até 3 linhas e espere o próximo pedido.

**O repositório manda.** Antes de criar uma tela, um tipo ou um componente, procure no código se já existe e evolua o que existe. Não duplique. Se este arquivo supõe algo que o repositório não tem (rota, tipo, componente, script), diga isso na primeira resposta da etapa, antes de escrever código.

Responda e comente em português do Brasil. Textos da interface em português do Brasil, tom direto e sem formalidade exagerada.

## 2. Regras

**Continuam valendo todas as regras da seção 2 da Fase 1** (ENEM só, nada de redação/OCR/geração de questões, front não calcula regra de negócio, honestidade dos dados, âmbar só para IA, sem roxo, WCAG 2.1 AA, código estrito), com as exceções da tabela abaixo. Em qualquer outro conflito, pare e avise.

**O que este arquivo muda (cada linha tem dono: o grupo)**

| Regra ou texto atual | O que muda | Como fica protegido |
|---|---|---|
| Regra 2 e lista "Evite" da Fase 1: sem medalha, sem XP, nível, moeda, ranking | Entram **conquistas** com medalha | Atrás de `NEXT_PUBLIC_CONQUISTAS`. Continuam proibidos XP, nível, moeda, ranking, comparação com outras pessoas, conquista por horário do dia ou por velocidade, conquista que dependa de preencher dado pessoal, e conquista perdida depois de obtida. Sem cores de metal (nada de ouro, que seria âmbar). Veja P3 |
| Seção 6, movimento: "120 a 180 ms, um único momento orquestrado" e "Evite fade-and-slide-up em toda seção" | Entram transição de página e cascata de blocos na **entrada** de cada tela | Limites e tokens da seção 4.4. Nada disso roda dentro de sessão de questão, simulado ou diálogo |
| Regra 13: "animar só transform e opacity" | Controles também transicionam `color`, `background-color` e `border-color` em 200 ms | Nunca layout, nunca `transition: all`, nunca sombra animada |
| Seção 6, tokens: uma identidade verde (`--forest`) | Cinco **paletas** trocáveis (Floresta, Oceano, Terracota, Brasa, Sol) | `--amber`, `--err` e `--area-*` não mudam nunca. Todas as paletas têm contraste auditado, nos dois temas (seção 4.2). Floresta é o padrão e fica **idêntica** ao que existe hoje |
| Regra 9: âmbar é exclusivo da IA | Na paleta Sol o acento é amarelo, parecido com o âmbar da IA. Na Brasa o acento é um vermelho parecido com `--err` | Regras de uso do acento na seção 4.3. Sol e Brasa saem do app mudando uma linha de `NEXT_PUBLIC_PALETAS` |
| RNF07: coletar o mínimo de dados | Perfil aceita escola, cidade e "sobre você" | Opcionais, atrás de `NEXT_PUBLIC_PERFIL_EXTRA`, com a frase "Opcional. Só você vê." e nenhuma funcionalidade depende deles. O grupo decide com o texto jurídico, principalmente para menores de 18 |
| Fase 2, F2.2 e F2.13 | P2 e P1/P3 constroem essas telas, ampliadas | Marque no `PENDENCIAS.md` que a Etapa 6 da Fase 2 não refaz essas telas |

**Regras novas desta fase (N1 a N8, para não confundir com as etapas P1 a P5)**

- **N1. Quem calcula é a API.** Progresso de meta, conquistas (progresso, marcos, datas), atividades em andamento, escolha automática de modo e composição do simulado rápido vêm da API. No mock, vêm do servidor falso. O front só mostra. Tipos novos: seção 5.
- **N2. Sem culpa.** Foguinho, metas e conquistas são informativos. Nada de "você perdeu", "falhou", "quebrou". Vale "Faltam 12 questões para sua meta". Nenhum estado em vermelho para meta não cumprida.
- **N3. Sem dado pessoal em conquista, sem horário, sem pressa.** Conquista nunca premia estudar de madrugada, responder rápido ou preencher perfil.
- **N4. Visual.** Continuam proibidos: gradiente, desfoque (`blur`, `backdrop-filter`), brilho, roxo e violeta, caixa-alta com espaçamento, ponto médio em texto, traço longo, seta no fim de link ou botão, emoji. Esqueleto de carregamento pulsa em opacidade; **não** use brilho deslizante.
- **N5. Atalhos de uma tecla só podem ser desligados** (WCAG 2.1.4) e ficam inativos quando o foco está num campo de texto. `Ctrl K` e `Cmd K` não são de uma tecla e ficam sempre ativos.
- **N6. Ação destrutiva** (excluir, sair sem salvar) usa botão contornado com ícone e texto, nunca preenchido, em todas as paletas. Isso evita confusão com o botão principal em Terracota e Brasa, que têm cor próxima de `--err`.
- **N7. Dependência nova só com autorização.** Se achar que precisa de uma biblioteca (por exemplo `cmdk`), pare e pergunte. O que está aqui se faz com Radix, CSS e o que já está instalado.
- **N8. Não mexa em lógica de negócio, rotas existentes nem contrato** além do que a seção 5 lista. O que faltar no contrato, deixe `TODO(equipe)`.

## 3. O que adaptamos da referência e o que ficou de fora

| Na referência | No Gabaritei |
|---|---|
| Transição suave entre telas e blocos entrando em cascata | P1: seção 4.4, com limites e respeito a movimento reduzido |
| Início que recebe: "Retome...", botão para o modelo escolher, "Retomar lista", contadores | P2: faixa principal, "Continue de onde parou", números, meta, Foguinho |
| Cinco passos de onboarding com escolhas de estudo | P2: quatro passos (Exame, Foco, Rotina, Aparência). Sem perguntar ano escolar ou idade |
| Perfil com medalhas, nome, escola, cidade, sobre você | P3, com as travas da seção 2 |
| Medalhas bronze, prata e ouro | Marcos 1, 2 e 3 mostrados por forma e texto, sem cor de metal |
| Metas pessoais com chave e contador | P3: quatro metas, progresso vem da API |
| Paletas e modo claro/escuro | P1: cinco paletas validadas, sem roxo |
| Configurações | P1 (Aparência) e P3 (Estudo e Acessibilidade) |
| Desempenho com Diário/Semanal/Mensal, comparação e calendário | P4, sobre a F2.10 |
| Histórico com Atividades, Erradas, Favoritas, Para revisar | P4, sobre a F2.11 |
| Busca `Ctrl K`, leitura concentrada, pausa, simulado relâmpago | P5 (pausa sem desfoque e fora do simulado) |
| "Nota estimada" em escala ENEM tirada do percentual de acerto | **Fora.** Proficiência só por 3PL e só com volume mínimo |
| Rótulo "IA escolhe por mim" para regras locais | **Fora.** O rótulo de IA só aparece quando a resposta traz `modelo` |
| Fontes, dourado como cor principal, barra com gradiente, desfoque, rótulos em caixa-alta | **Fora.** Mantemos Source Serif 4, IBM Plex Sans e IBM Plex Mono |
| Dados guardados no navegador como banco | **Fora.** Nosso contrato é a camada de API tipada com mock |

## 4. Tokens, paletas e movimento

### 4.1 Renomear a identidade (mecânico)

Em `tokens.css`, nas classes Tailwind e em todo o código: `--forest` para `--brand`, `--forest-hover` para `--brand-hover`, `--forest-soft` para `--brand-soft`, `--forest-ink` para `--brand-ink`, `--on-forest` para `--on-brand`. Sem alias antigo. Acrescente `--accent`, `--accent-ink` e `--accent-soft` (na Floresta, iguais a `--brand`, `--brand-ink` e `--brand-soft`). `--focus` continua igual a `--brand`. Esse passo **não pode mudar nada visualmente**: compare capturas de antes e depois (seção 7).

### 4.2 As cinco paletas

Fonte única: `src/styles/paletas.json`, que alimenta (a) o gerador `scripts/gerar-paletas.ts`, que escreve `src/styles/paletas.generated.css` (versionado), e (b) `scripts/auditar-paletas.ts`. **Use exatamente estes valores.** Todos os pares abaixo já foram calculados contra WCAG por um script do grupo, com zero falhas. Se o seu auditor reprovar algum, é erro de transcrição: não mude a cor, corrija a cópia e avise.

```json
{
  "floresta": {
    "light": {"paper": "#F4F2EC", "paper-2": "#ECE9E0", "card": "#FBFAF7", "ink": "#1D2420", "ink-2": "#4B554E", "rule-strong": "#8F8A7A", "brand": "#2C6E49", "brand-hover": "#245C3C", "brand-soft": "#E3ECE4", "brand-ink": "#245C3C", "on-brand": "#FFFFFF", "accent": "#2C6E49", "accent-ink": "#245C3C", "accent-soft": "#E3ECE4"},
    "dark": {"paper": "#121714", "paper-2": "#1E2622", "card": "#1A211D", "ink": "#E9EBE4", "ink-2": "#A9B3AC", "rule-strong": "#6A7370", "brand": "#6BBE90", "brand-hover": "#82CBA3", "brand-soft": "#24342B", "brand-ink": "#6BBE90", "on-brand": "#0E1A13", "accent": "#6BBE90", "accent-ink": "#6BBE90", "accent-soft": "#24342B"}
  },
  "oceano": {
    "light": {"paper": "#EDF2F4", "paper-2": "#E2EAEE", "card": "#F7FAFB", "ink": "#14262C", "ink-2": "#44575E", "rule-strong": "#728890", "brand": "#1E6C7A", "brand-hover": "#17555F", "brand-soft": "#DCEAED", "brand-ink": "#17555F", "on-brand": "#F7FAFB", "accent": "#1E6C7A", "accent-ink": "#17555F", "accent-soft": "#DCEAED"},
    "dark": {"paper": "#0F1A1E", "paper-2": "#172529", "card": "#132127", "ink": "#E4EEF0", "ink-2": "#A3B5BA", "rule-strong": "#668087", "brand": "#5BB8C6", "brand-hover": "#7CC8D3", "brand-soft": "#1C3A41", "brand-ink": "#5BB8C6", "on-brand": "#0F1A1E", "accent": "#5BB8C6", "accent-ink": "#5BB8C6", "accent-soft": "#1C3A41"}
  },
  "terracota": {
    "light": {"paper": "#F6F0EA", "paper-2": "#EDE4DB", "card": "#FCF9F6", "ink": "#2B1F18", "ink-2": "#5A4A40", "rule-strong": "#8F7C6C", "brand": "#A5481F", "brand-hover": "#8A3B18", "brand-soft": "#F3E1D5", "brand-ink": "#8A3B18", "on-brand": "#FCF9F6", "accent": "#A5481F", "accent-ink": "#8A3B18", "accent-soft": "#F3E1D5"},
    "dark": {"paper": "#1A130F", "paper-2": "#261C16", "card": "#211812", "ink": "#F2E9E1", "ink-2": "#BBA99B", "rule-strong": "#7E6C5E", "brand": "#E58A57", "brand-hover": "#EEA27A", "brand-soft": "#3A2418", "brand-ink": "#E58A57", "on-brand": "#1A130F", "accent": "#E58A57", "accent-ink": "#E58A57", "accent-soft": "#3A2418"}
  },
  "brasa": {
    "light": {"paper": "#F2F1EF", "paper-2": "#E8E6E3", "card": "#FAFAF8", "ink": "#171717", "ink-2": "#474543", "rule-strong": "#85817C", "brand": "#1F1F1F", "brand-hover": "#3A3A3A", "brand-soft": "#E6E4E1", "brand-ink": "#1F1F1F", "on-brand": "#FAFAF8", "accent": "#C42B2B", "accent-ink": "#9E1F1F", "accent-soft": "#F6DCDC"},
    "dark": {"paper": "#0F0F0F", "paper-2": "#1A1A1A", "card": "#151515", "ink": "#F1F0EE", "ink-2": "#B2AFAB", "rule-strong": "#6E6B67", "brand": "#F1F0EE", "brand-hover": "#FFFFFF", "brand-soft": "#262626", "brand-ink": "#F1F0EE", "on-brand": "#0F0F0F", "accent": "#F0646A", "accent-ink": "#F28A8F", "accent-soft": "#3A1517"}
  },
  "sol": {
    "light": {"paper": "#F6F3EA", "paper-2": "#EDE8D8", "card": "#FCFAF3", "ink": "#1F1D14", "ink-2": "#55503E", "rule-strong": "#8C8467", "brand": "#26241A", "brand-hover": "#3C3A2C", "brand-soft": "#ECE8D6", "brand-ink": "#26241A", "on-brand": "#FCFAF3", "accent": "#8A6A00", "accent-ink": "#6B5200", "accent-soft": "#F7E7A8"},
    "dark": {"paper": "#14130D", "paper-2": "#201E14", "card": "#1B1A11", "ink": "#F3F0E2", "ink-2": "#B8B29A", "rule-strong": "#7A7452", "brand": "#F3F0E2", "brand-hover": "#FFFFFF", "brand-soft": "#2A2814", "brand-ink": "#F3F0E2", "on-brand": "#14130D", "accent": "#E8C13A", "accent-ink": "#EFD36E", "accent-soft": "#3A3210"}
  }
}
```

Como aplicar:
- Atributos no `<html>`: `data-palette` (`floresta` por padrão), `data-theme` (`light` ou `dark`, mecanismo que já existe) e `data-motion` (seção 4.4). O CSS gerado cobre `html[data-palette="x"]` (claro), `html[data-palette="x"][data-theme="dark"]` e a variante `@media (prefers-color-scheme: dark)` com `:not([data-theme="light"])`, no mesmo padrão que o tema já usa.
- `--rule` (decorativo): na Floresta mantém o valor de hoje (`#D9D5C8` no claro, `#2C3530` no escuro). Nas outras, `color-mix(in srgb, var(--ink) 16%, var(--paper))` no claro e `14%` no escuro.
- Não mudam em nenhuma paleta: `--amber*`, `--err*`, `--on-err`, `--area-*`, `--shadow-overlay`.
- Os dois temas continuam existindo em todas as paletas. Brasa e Sol têm o botão principal em tom neutro (quase preto no claro, quase branco no escuro) e o **acento** em vermelho e amarelo, respectivamente.
- Atualize `<meta name="theme-color">` com o valor de `--paper` quando a paleta ou o tema mudar.
- `NEXT_PUBLIC_PALETAS` (lista separada por vírgula) define quais aparecem. Valor salvo que não esteja na lista cai em Floresta.

**Auditoria (`npm run audit:paletas`).** Para cada paleta e cada tema, falha se algum par ficar abaixo do mínimo:

| Par | Mínimo |
|---|---|
| `--ink` e `--ink-2` sobre `--paper`, `--paper-2` e `--card` | 4,5 |
| `--brand-ink` sobre `--paper`, `--card` e `--brand-soft` | 4,5 |
| `--on-brand` sobre `--brand` e `--brand-hover` | 4,5 |
| `--rule-strong` sobre `--paper` e `--card` | 3 |
| `--brand` e `--accent` sobre `--paper` e `--card` (ícone, anel de foco) | 3 |
| `--accent-ink` sobre `--accent-soft` e sobre `--paper` | 4,5 |
| `--err` (fixo) sobre `--paper` e `--card` | 4,5 |
| `--amber-ink` sobre `--amber-soft` (fixos) | 4,5 |
| **Faixa principal, claro:** `--on-brand` sobre `--brand-hover`; `--ink` sobre `--paper` (botão invertido); `--paper` contra `--brand-hover` (borda do botão) | 4,5; 4,5; 3 |
| **Faixa principal, escuro:** `--ink` e `--ink-2` sobre `--brand-soft`; `--on-brand` sobre `--brand` (botão); `--brand` contra `--brand-soft`; `--accent-ink` sobre `--brand-soft` | 4,5; 4,5; 3; 4,5 |

Os contrastes do app inteiro continuam sendo medidos pelo `audit:contraste` da Fase 1, agora em **todas as paletas** nas rotas listadas na seção 7.

### 4.3 O acento (`--accent`) e a faixa principal

O acento existe para dar vida sem mexer no significado das cores. **Onde usa:** ícone do Foguinho aceso, filete do item ativo da navegação, anel e ícone da medalha obtida, dia de hoje no `WeekStrip`. `--accent-soft` só em chip de até 32 px de altura; **nunca** em bloco grande (na Sol ele é amarelo claro, quase o `--amber-soft` da IA, então na Sol não o use em lugar nenhum).

**Onde nunca usa:** `StatusChip`, `Alternativa` (acertou, errou, gabarito), barras de acerto e de erro, `ProgressToMinimum`, `ComboMeter`, mensagens de erro e aviso, ação destrutiva, tabelas de resultado. Essas peças usam `--brand`, `--ink`, `--err` e o que já usam hoje. Nenhuma informação depende só do acento: sempre ícone ou texto junto. Toda nota de IA continua com ícone próprio e texto "Recomendado pelo modelo" ou "Gerado por IA".

**Faixa principal (a massa de cor do Início).** Claro: fundo `--brand-hover`, texto `--on-brand` (hierarquia por tamanho e peso, não por opacidade), botão principal invertido (fundo `--paper`, texto `--ink`). Escuro: fundo `--brand-soft`, texto `--ink` e `--ink-2`, botão principal `--brand` com `--on-brand`. **Dentro da faixa o anel de foco no tema claro usa `--on-brand`** (o verde sobre verde some); no escuro, `--focus`. Sem gradiente, sem imagem.

### 4.4 Movimento

Tokens em `tokens.css`:

```css
:root {
  --dur-pagina: 340ms;   --ease-pagina: cubic-bezier(0.2, 0, 0, 1);
  --dur-bloco: 360ms;    --ease-bloco: cubic-bezier(0.22, 1, 0.36, 1);
  --passo-bloco: 70ms;
  --dur-controle: 200ms; --ease-controle: ease-out;
  --dur-troca: 160ms;
  /* --ease-spring: gerado por scripts/gerar-mola.ts (função linear()), rigidez 170, amortecimento 18, massa 1 */
}
@keyframes pagina-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes bloco-in  { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes pulso     { 0%, 100% { opacity: 1 } 50% { opacity: 0.55 } }
```

Regras:
- **Página:** `src/app/(app)/template.tsx` (e o equivalente em `(publico)`; **não** em `(foco)`) envolve o conteúdo com `animation: pagina-in` (só opacidade). Sem View Transitions API, sem biblioteca de animação, sem animação de saída. O foco programático no `h1` (`foco-no-h1.tsx`) continua imediato, sem esperar a animação.
- **Cascata:** atributo `data-reveal` e variável `--i` (0, 1, 2...) nos blocos de topo da tela. Estilo: `animation: bloco-in var(--dur-bloco) var(--ease-bloco) both; animation-delay: calc(min(var(--i, 0), 5) * var(--passo-bloco))`. Do sexto bloco em diante entra junto com o quinto. Só quando a rota é aberta (navegação ou carga da página). **Nunca** em atualização de dados, filtro, paginação ou troca de aba.
- **Não anima:** sessão de questão, simulado em andamento, diálogos (usam fade de `--dur-troca`), tabelas, gráficos que já estão na tela. Troca de questão dentro da sessão: fade de `--dur-troca`, sem deslocamento.
- **Mola (`--ease-spring`):** só para o Foguinho acender, uma medalha ser desbloqueada e um item entrar numa lista que o próprio estudante montou. Gere os pontos de `linear()` com o script, não escreva à mão.
- **Controles:** transições de `color`, `background-color`, `border-color` em `--dur-controle`. Sem sombra animada, sem hover animado em card.
- **Carregando:** esqueleto com `animation: pulso 1.4s ease-in-out infinite`.
- **Preferência `Movimento`:** `sistema` (padrão) segue `prefers-reduced-motion`; `reduzido` desliga tudo. Com `html[data-motion="reduzido"]`, ou com `prefers-reduced-motion: reduce` (qualquer que seja o `data-motion`), vale `animation: none !important; transition-duration: 0ms !important`, e nenhuma peça fica invisível esperando animação. Não existe opção que force mais movimento que o sistema pede.

### 4.5 Primeira pintura sem piscar

Script inline no `<head>` (try/catch, sem dependência) lê `localStorage["gabaritei:aparencia"]` (`{ tema, paleta, movimento }`) e coloca os três atributos no `<html>` antes de qualquer pintura. A **fonte da verdade é `Preferencias` na API**; o `localStorage` é só cache para a primeira pintura e é atualizado sempre que as preferências carregam ou mudam. `<html>` com `suppressHydrationWarning`. Se o `localStorage` falhar (navegação privada), o app funciona com os padrões.

### 4.6 Chaves de etapa (`.env.example`)

```
NEXT_PUBLIC_PALETAS=floresta,oceano,terracota,brasa,sol
NEXT_PUBLIC_CONQUISTAS=on
NEXT_PUBLIC_PERFIL_EXTRA=on
```

"on" aqui é para o grupo ver funcionando. O que vai para produção é decisão do grupo (seção 9).

## 5. Contrato: tipos e funções a acrescentar ou estender

Se o tipo já existe no repositório, **estenda**; não crie um paralelo. Tipo novo fora desta lista: crie e liste no fim da etapa.

```ts
export type PaletaId = 'floresta' | 'oceano' | 'terracota' | 'brasa' | 'sol';

/* Preferencias ganha (os campos de F3 da Fase 2 continuam) */
//   paleta: PaletaId;
//   reduzirMovimento: 'sistema' | 'sim';
//   quantidadePadrao: 5 | 10 | 15 | 20 | 30;
//   modoPadraoTreino: ModoPratica | null;
//   cronometroSessoes: boolean; cronometroSimulados: boolean;

/* Perfil ganha */
//   apelido: string | null; escola: string | null; cidade: string | null; sobre: string | null;  // sobre: até 160 caracteres

export interface AtividadeEmAndamento {
  id: string; tipo: 'sessao' | 'lista' | 'simulado' | 'diagnostico';
  titulo: string; area: Area | null; feitas: number; total: number; atualizadaEm: string;
}

/* ResumoGeral ganha */
//   simuladosConcluidos: number; sessoesConcluidas: number; respondidasSemana: number;

export type ChaveMeta = 'questoes_semana' | 'dias_semana' | 'simulados_mes' | 'taxa_acerto';
export interface MetaPessoal { chave: ChaveMeta; ligada: boolean; alvo: number }
export interface ProgressoMeta extends MetaPessoal { feito: number; inicioPeriodo: string; fimPeriodo: string }

export interface Conquista {
  id: string; nome: string; regra: string;            // texto da API
  icone: 'passo' | 'volume' | 'constancia' | 'meta' | 'simulado' | 'combo' | 'areas' | 'habilidades' | 'revisao' | 'resolucao';
  marcos: { alvo: number; obtidoEm: string | null }[]; // de 1 a 3
  progresso: number;                                   // contagem atual
}

export interface Marcacao { questaoId: string; favorita: boolean; paraRevisar: boolean; atualizadaEm: string }

export interface AtividadeHistorico {
  id: string; tipo: 'sessao' | 'lista' | 'simulado' | 'diagnostico'; titulo: string;
  situacao: 'concluida' | 'interrompida'; iniciadaEm: string; duracaoSegundos: number | null;
  acertos: number; total: number;
}

/* Desempenho ganha (P4) */
//   volume: { data: string; questoes: number }[];
//   anterior: { respondidas: number; acertos: number; erros: number; taxaAcerto: number | null } | null;
```

Funções a acrescentar em `Api` (ou estender), com o caminho futuro sugerido:

| Função | Endpoint futuro |
|---|---|
| `obterPerfil`, `atualizarPerfil(parcial)` | `GET/PATCH /me` |
| `atualizarPreferencias(parcial)` | `PATCH /me/preferencias` |
| `listarAtividadesEmAndamento()` | `GET /atividades/em-andamento` |
| `iniciarSessao({ modo: 'auto' })` (a API escolhe o modo e devolve o critério) | `POST /sessoes` |
| `obterMetas()`, `atualizarMetas(metas)` | `/me/metas` |
| `listarConquistas()` (as conquistas novas voltam em `finalizarSessao` e `finalizarSimulado` como `conquistasNovas: string[]`) | `GET /conquistas` |
| `definirMarcacao(questaoId, { favorita?, paraRevisar? })`, `listarMarcacoes(filtro, pagina)` | `/marcacoes` |
| `listarAtividadesHistorico(filtros, pagina)` | `GET /atividades` |
| `obterDesempenho(periodo, area?, habilidade?, { agrupar, comparar })` | `GET /desempenho` |
| `montarSimulado({ composicao: 'rapido' })` | `POST /simulados` |

O que o back-end ainda não prometeu (`modo: 'auto'`, conquistas, marcações, metas, atividades) vira **pendência para o responsável pela FastAPI**: crie e atualize ao fim de cada etapa uma lista curta de contrato em `docs/CONTRATO_PARIDADE.md`. O mock implementa tudo; os cenários ganham dados: `ativo` com duas atividades em andamento, metas, quatro conquistas obtidas e marcações; `parcial` com pouco; `novo` sem nada.

## 6. Etapas de construção

Faça **uma etapa por vez**. Cada etapa termina com as checagens da seção 7 coladas na resposta e com a lista de `TODO(equipe)` e tipos novos.

### P1. Movimento e paletas (rota nova: `/configuracoes`, só com a seção Aparência)

1. Capturas "antes" de todas as rotas (cenário `ativo`, claro e escuro, 1280 e 360 px) em `e2e/capturas/antes/`. Commit.
2. Renomeação mecânica da seção 4.1. Capturas "depois": **diferença zero**.
3. Paletas (4.2): JSON, gerador, CSS gerado, `audit:paletas`, filtro por `NEXT_PUBLIC_PALETAS`, `theme-color`.
4. Primeira pintura (4.5) e campo `paleta` e `reduzirMovimento` em `Preferencias`.
5. Movimento (4.4): tokens, `template.tsx`, `data-reveal` nos blocos de topo de Início, Treino (escolha de modo), Questões, Simulados (lista e montar), Perfil e Configurações. Mola e esqueleto.
6. `/configuracoes`, seção **Aparência**, salva sozinha com "Salvo" numa região `aria-live` (sem botão global):
   - **Tema:** Sistema, Claro, Escuro (mova o controle que hoje está no Perfil; o Perfil mostra um link "Configurações" no lugar).
   - **Paleta:** `radiogroup` com uma opção por paleta. Cada opção é um controle de 48 px com três amostras (`--brand`, `--accent`, `--paper`), o nome ("Floresta", "Oceano", "Terracota", "Brasa", "Sol") e um ícone de check quando selecionada, mais borda de 2 px. Selecionar aplica na hora, sem recarregar. As amostras refletem o tema ativo.
   - **Movimento:** Sistema ou Reduzido, com botão "Ver prévia" que reexecuta a cascata num cartão de exemplo.
   - **Tamanho do texto:** 100, 115 e 130 % (se ainda não existir).
   - Acrescente "Configurações" ao menu do usuário.
7. Testes: troca de paleta persiste e é aplicada antes da pintura após recarregar; `prefers-reduced-motion` zera animações (`document.getAnimations().length === 0`); paleta fora da lista cai em Floresta.

*Pronto quando:* Floresta é visualmente idêntica a antes, as 5 paletas passam em `audit:paletas`, axe e `audit:contraste` ficam em zero nas rotas da seção 7 em todas as paletas e nos dois temas, não há piscada ao recarregar, e com movimento reduzido nada se mexe e nada fica invisível.

### P2. Primeiros passos e Início (rotas: `/boas-vindas`, `/inicio`)

**Primeiros passos** (`/boas-vindas`, é a F2.2 ampliada). Casca de foco. Quatro passos num `<ol>` ("Passo 1 de 4", `aria-live` ao avançar, foco no título do passo), botões "Voltar" e "Pular por enquanto" em todos. Progresso salvo a cada avanço. Fade de `--dur-troca` entre passos. Depois de entrar, quem tem `onboardingConcluido = false` vai para cá.
1. **Exame.** ENEM selecionado. FUVEST e UNICAMP desabilitados com "em breve" escrito e o motivo.
2. **Foco.** "Quais áreas você quer priorizar?" em ladrilhos selecionáveis (controles reais, check mais borda quando marcado). "Quer começar por algum tema?" campo livre com exemplos clicáveis (alimenta o modo tema).
3. **Rotina.** Meta de questões por semana (atalhos 20, 50, 100 e campo livre), dias de estudo por semana (opcional, de 1 a 7) e "Abrir a descrição das figuras por padrão" (`Switch`).
4. **Aparência.** Paleta, tema e movimento com **prévia ao vivo na própria tela**. Texto: "Escolha um visual. Dá para mudar depois em Configurações."

**Fim.** "Tudo pronto, {primeiro nome}." Botão principal "Começar um treino"; secundário "Ir para o início". Se `NEXT_PUBLIC_DIAGNOSTICO=on`, o principal vira "Fazer o diagnóstico (cerca de N min)". Marca `onboardingConcluido`. Não pergunte ano escolar nem idade aqui.

**Início** (`/inicio`), de cima para baixo. Cada bloco carrega e falha sozinho; cada um tem estado vazio com convite.
1. **Faixa principal** (4.3). "Bom dia, {nome de exibição}." (bom dia, boa tarde ou boa noite pela hora local; nome de exibição = apelido, senão primeiro nome, **nunca** o e-mail). Uma frase com a próxima ação e um botão grande:
   - com atividade em andamento: "Retome sua lista de Matemática: 7 de 10 feitas." e botão **Retomar lista** (ou Retomar simulado);
   - sem atividade: "Bora treinar?" e botão **Começar treino** (abre o modo padrão das Configurações, senão a escolha de modo);
   - segundo botão, contornado: **Deixar o modelo escolher** (`iniciarSessao({ modo: 'auto' })`). O resultado mostra o `CriterioRecomendacao` em âmbar **somente se a resposta trouxer `modelo`**; se a escolha foi por regra simples, o critério aparece como nota neutra, sem selo de IA.
   - À direita (ou abaixo no celular): `FoguinhoBadge` grande, com os três estados da Etapa V (acesa, em espera, zerada), e a meta da semana em anel de SVG **com o número no centro** e a frase "Faltam 12 questões para sua meta". O link "Editar meta" só entra na P3.
2. **Seus números**, um único painel com divisores (não quatro cartões iguais): questões respondidas (com "N nesta semana"), taxa de acerto, simulados concluídos, treinos concluídos. Sem número inventado: conta nova mostra o convite "Responda algumas questões para ver seus números aqui". **Não** mostre proficiência nem "desempenho" agregado aqui; isso fica no Perfil e no Desempenho, com `dados_insuficientes`.
3. **Continue de onde parou**: até 3 atividades (`listarAtividadesEmAndamento`), cada uma com ícone do tipo, título, barra mais "7 de 10", há quanto tempo e botão "Continuar". Vazio: "Nada em andamento. Comece um treino e ele aparece aqui."
4. **Por onde começar** (só quando o estudante ainda não tem histórico): ladrilhos das 4 áreas (se a Etapa V já fez, reaproveite) e o campo de tema.
5. **Reforço prioritário**: até 3 itens do RF10 com botão "Treinar" (modo habilidade). Antes do volume mínimo: "Faltam N respostas para apontar o que reforçar" com `ProgressToMinimum`.
6. **Semana**: `WeekStrip` de 7 dias, com o dia de hoje destacado pelo acento e por texto.

Só aparece o que tem destino pronto: "Simulado rápido" entra no Início na P5, "Atividade recente" e "Plano" seguem a Fase 2.

Copy: tom de conversa, segunda pessoa, frases curtas, sem exclamação decorativa, sem gíria que envelhece. Liste **todos os textos novos** no `PENDENCIAS.md` para o grupo revisar.

*Pronto quando:* conta nova é levada aos primeiros passos e sai com `onboardingConcluido`; o Início funciona em todos os cenários (`novo`, `ativo`, `parcial`, `esgotado`, `lento`, `erro`), cada bloco falha sozinho, o nome nunca vem do e-mail, a faixa tem contraste e foco corretos nas 5 paletas, e `docs/CONTRATO_PARIDADE.md` lista o que a API precisa entregar.

### P3. Perfil, conquistas, metas e Configurações (rotas: `/perfil`, `/configuracoes`)

**Perfil** (evolui a tela 13). Cabeçalho: avatar redondo com iniciais (exceção registrada ao raio de 999 px; fundo `--brand-soft`, texto `--brand-ink`; sem upload de foto), nome de exibição, "Estudante desde outubro de 2026", e, se `NEXT_PUBLIC_PERFIL_EXTRA=on` e preenchidos, escola e cidade como linhas de texto. Botões "Editar perfil" e "Sair". Se `NEXT_PUBLIC_CONQUISTAS=on`, "4 de 11 conquistas" que leva à seção. O resto da tela 13 continua (números gerais, Foguinho e meta, proficiência por área, reforço). As preferências saem do Perfil e viram o link "Configurações".

**Editar perfil**: `Dialog` com react-hook-form + zod. Campos: Nome (obrigatório), Apelido (opcional, "como você quer ser chamado"), e, atrás de `NEXT_PUBLIC_PERFIL_EXTRA`, Escola, Cidade e Sobre você (160 caracteres, contador). Cada campo extra mostra "Opcional. Só você vê." Botões "Salvar" e "Cancelar"; sucesso: "Perfil salvo". Erro de servidor mostra o que fazer. Foco volta ao botão "Editar perfil" ao fechar.

**Conquistas** (`NEXT_PUBLIC_CONQUISTAS=on`). Seção no Perfil: filtros Todas, Obtidas, Bloqueadas (grupo de botões com `aria-pressed` e contagem). Grade de medalhas; cada medalha é um **botão** que abre um `Dialog` com: nome, "Regra" (texto da API), progresso ("7 de 10" com barra) e, se obtida, a data. **Marcos:** 1 a 3, mostrados como "Marco 2 de 3" e três pontos de forma distinta (cheio, cheio, vazio). Sem cor de metal.
- Medalha obtida: ícone em `--brand-ink`, fundo `--brand-soft`, anel de `--accent`, check. Bloqueada: fundo `--paper-2`, ícone `--ink-2`, ícone de cadeado e o texto "Bloqueada" (nunca só cinza).
- Ícone vem do campo `icone` mapeado para uma lista fechada de ícones lucide; desconhecido cai num ícone genérico.
- Desbloqueio: toast educado (`role="status"`, "Conquista nova: Primeiro passo", com botão "Ver"), sem som, sem confete, e a medalha usa `--ease-spring` uma vez. Vem de `conquistasNovas` na resposta da API. O front **não** detecta nada sozinho.
- Lista do **mock** (a lista real e os números dos marcos são do grupo, `TODO(equipe)`): Primeiro passo (1 questão); Volume de prática (50, 200, 1.000 questões); Constância (3, 7, 30 dias de Foguinho); Meta cumprida (1, 4, 12 semanas); Prova feita (1, 3, 10 simulados); Prova inteira (1 simulado de 45 questões sem branco); Em sequência (Combo x3, x5, x8); As quatro áreas (1, 2, 4 áreas com pelo menos 20 respostas); Explorador de habilidades (5, 15, 30 habilidades); Segunda chance (5, 20, 50 questões acertadas depois de erradas); Leitura da resolução (10, 50, 200 resoluções abertas).

**Metas** (`obterMetas`, `atualizarMetas`). `Dialog` "Suas metas" aberto pelo link "Editar meta" do Início (entra agora) e pela seção Estudo das Configurações. Quatro linhas, cada uma com `Switch` "ligada" e um `Stepper` numérico (botões `-` e `+`, valor editável, mínimo e máximo; crie o componente se ainda não existir, ele está na lista F4 da Fase 2): questões por semana (de 5 a 500, passo 5); dias de estudo por semana (de 1 a 7); simulados por mês (de 1 a 8); taxa de acerto desejada (de 30 a 95 %, **desligada por padrão**). Meta desligada não aparece em lugar nenhum. O progresso de cada meta vem de `ProgressoMeta`; textos de progresso falam em quanto falta, nunca em fracasso (regra N2). `TODO(equipe)`: valores padrão e se a meta de taxa de acerto fica.

**Configurações** (`/configuracoes`, é a F2.13 completa). Página com seções em âncoras (índice lateral em tela larga), salva sozinha com "Salvo" em `aria-live`:
- **Aparência** (feita na P1).
- **Estudo:** metas (abre o diálogo), áreas de foco, quantidade habitual de questões (5, 10, 15, 20, 30), modo padrão do botão "Começar treino", cronômetro nas sessões e cronômetro nos simulados (dois `Switch` separados), atalhos de teclado (liga e desliga).
- **Acessibilidade:** "Abrir descrição das figuras por padrão" (`Switch`, RF05).
- **Dados de demonstração** (só em modo mock): "Redefinir dados de demonstração" com confirmação.

*Pronto quando:* editar perfil salva e reflete na saudação do Início; com `NEXT_PUBLIC_CONQUISTAS=off` não sobra nem rastro da seção, do link ou do toast; com `NEXT_PUBLIC_PERFIL_EXTRA=off` os campos somem; medalha obtida e bloqueada são distinguíveis em escala de cinza; metas desligadas somem de todas as telas; as preferências persistem entre recarregamentos; nenhum texto de meta ou conquista tem tom de culpa.

### P4. Desempenho e Histórico (rotas: `/desempenho`, `/historico`; são as F2.10 e F2.11)

Construa as duas telas **como estão na Fase 2** (filtros na URL, `dados_insuficientes`, "Ver como tabela" em todo gráfico), criando os componentes da lista F4 da Fase 2 que ainda não existirem (`Tabs`, `LineChart`, `BarList`, `Heatmap`), e acrescente:

**Desempenho**
- **Agrupar por:** dia, semana ou mês (grupo de botões; afeta o gráfico de volume). Os filtros de Período, Área e Habilidade da F2.10 continuam.
- **Comparar com o período anterior** (`Switch`): cada indicador da faixa ganha a variação em texto e ícone ("5 pontos percentuais a mais que nos 30 dias anteriores", com ícone de seta para cima ou para baixo e o texto; **sem cor de alerta** para queda). Sem período anterior: "Ainda não há período anterior para comparar."
- **Volume por dia** (`volume`): gráfico de barras com "Ver como tabela".
- **Onde você mais erra** e **Onde você vai melhor**: até 3 habilidades cada, com taxa e número de respostas e botão "Treinar". Só aparecem com volume mínimo; senão `dados_insuficientes` com `ProgressToMinimum`.
- **Metas:** bloco com o progresso das metas ligadas (barra mais número) e "Editar metas".
- Calendário (Heatmap) e Foguinho como na F2.10, nas cores da paleta ativa (4 degraus de `--brand`, número ao focar).

**Histórico**: abas **Atividades** (`listarAtividadesHistorico`: título, concluída ou interrompida, data, duração, "7 de 10", percentual), **Tentativas** (a lista por dia da F2.11), **Erradas** (Tentativas com resultado "errou"), **Favoritas** e **Para revisar** (`listarMarcacoes`). Abas com contagem, filtros na URL, botão "Mostrar mais" com anúncio em `aria-live` ("10 itens a mais"). Linha de atividade interrompida tem "Continuar". Favoritar e marcar para revisar passam a existir também em treino e questão avulsa (P5 liga os atalhos; aqui os botões).

Atualize a navegação: grupo "Acompanhar" (Desempenho, Histórico) como na tabela F2 da Fase 2; no celular, o quinto item da barra vira "Mais".

*Pronto quando:* filtros, agrupamento e comparação atualizam números e URL; todo gráfico tem tabela; abas respeitam `dados_insuficientes` e estado vazio com convite; favoritar e marcar para revisar persistem e aparecem nas abas; nenhuma queda é mostrada como erro.

### P5. Atalhos, paleta de comandos, leitura concentrada, pausa e simulado rápido

- **Paleta de comandos** (`Ctrl K` e `Cmd K`, mais um botão "Buscar" visível na barra com `aria-keyshortcuts`). `Dialog` Radix com padrão ARIA combobox e lista (`role="listbox"`, `aria-activedescendant`), setas, `Enter` abre, `Esc` fecha e devolve o foco. Grupos: **Ir para** (só telas que existem), **Ações** (começar treino, simulado rápido, trocar tema, trocar paleta, reduzir movimento), **Áreas e habilidades** (LC, CH, CN, MT e H1 a H30; abre Questões com o filtro na URL), **Questões** (busca por texto só se a API tiver; senão fica de fora com `TODO(equipe)`). Resultado vazio: "Nada encontrado. Tente o nome de uma área ou de uma habilidade."
- **Atalhos na sessão e na questão** (respeitam a preferência "Atalhos de teclado" e não valem em campo de texto): `A` a `E` escolhem, `Enter` envia, setas navegam (lista e simulado), `M` marca para revisar, `F` favorita, `L` leitura concentrada, `P` pausa, `?` abre o painel de atalhos. Cada botão correspondente mostra a tecla no rótulo ("Favoritar (F)"). Painel de atalhos em `Dialog`.
- **Leitura concentrada** (`L`): botão com `aria-pressed`. Esconde painel lateral, grade de navegação, `ComboMeter` e dicas; mantém enunciado em coluna de até 68 caracteres, alternativas, botão de enviar e o cronômetro, se ligado. `Esc` ou `L` sai. O estado vale só para a sessão aberta.
- **Pausa** (`P`): só em sessão de treino ou lista, só se o cronômetro estiver ligado. Para o cronômetro e cobre a questão com um painel **opaco** `--paper` ("Sessão em pausa" e botão **Continuar**), região da questão com `inert`, foco no botão, e volta o foco onde estava. **Sem desfoque.** Simulado e diagnóstico **não** pausam (o tempo continua correndo, como na Fase 1); mude isso só se o grupo decidir, `TODO(equipe)`.
- **Simulado rápido** (a "relâmpago" da referência): um atalho na tela Simulados (tela 9), no Início e na paleta de comandos. Uma pergunta só: "Começar simulado rápido" com N questões divididas por igual entre as áreas escolhidas e o tempo padrão do simulado. `montarSimulado({ composicao: 'rapido' })`; a composição vem da API. `TODO(equipe)`: N (sugestão 12) e tempo.
- **Favoritar e marcar para revisar** com `definirMarcacao`, otimista, com desfazer.

*Pronto quando:* a paleta de comandos funciona só por teclado e com leitor de tela (anúncio de quantidade de resultados), os atalhos podem ser desligados e não disparam em campo de texto, a pausa esconde a questão do leitor de tela e devolve o foco, a leitura concentrada não perde nenhum controle necessário, e o simulado rápido vai do início ao resultado.

## 7. Verificação

Cada etapa só termina com a saída colada na resposta de:

| Comando | O que garante |
|---|---|
| `npm run typecheck` e `npm run lint` | TypeScript estrito, sem `any`, sem `outline: none` sem substituto, sem `transition: all` |
| `npm test` | Lógica e componentes (provedor de paleta, preferências, metas, filtros na URL) |
| `npm run test:e2e` | Fluxos: primeiros passos, trocar paleta e tema, editar perfil, desbloquear conquista (mock), pausa, paleta de comandos |
| `npm run test:a11y` | axe em toda rota, claro e escuro, cenários `novo`, `ativo` e `parcial`. Zero violações |
| `npm run audit:contraste` | A auditoria da Fase 1, agora também nas outras paletas |
| `npm run audit:paletas` | Pares da seção 4.2, 5 paletas por 2 temas, zero falhas |
| `npm run check:regras` | Veja abaixo |

**Matriz de paletas.** Floresta: todas as rotas, nos dois temas. Oceano, Terracota, Brasa e Sol (claro e escuro): `/inicio`, `/perfil`, `/configuracoes`, lista de `/questoes`, uma questão corrigida (acerto e erro), resultado do simulado e, quando existirem, `/desempenho` e `/historico`. Além disso, ao menos uma captura de cada paleta em cada tema para o grupo olhar.

**Capturas.** Antes e depois da P1 com diferença zero. Ao fim da P2, da P3 e da P4, capturas das telas novas em 1280 e 360 px, claro e escuro, Floresta e Brasa.

**`check:regras`** (todos devem dar zero ocorrência em `src/`; escapes em Unicode para o script achar o caractere, não a descrição):
- `\u2014` e `\u2013` (traço longo e traço médio) e `\u00B7` (ponto médio) em qualquer texto de interface; `\u2192` (seta) em link ou botão.
- `outline:\s*none`, `outline-none`, `transition:\s*all`, `transition-all`.
- `backdrop-filter`, `backdrop-blur`, `blur\(`, `gradient` (não confundir com `linear(` do easing), `uppercase`, `tracking-`, `letter-spacing`.
- Classe `purple|violet|indigo|fuchsia` ou qualquer cor com matiz entre 250 e 320 graus (calculado a partir do hexadecimal).
- `--amber` fora da lista permitida em `scripts/permite-ambar.txt` (`CriterioRecomendacao`, `AIBadge`, chat de apoio).
- `--accent` dentro de `StatusChip`, `Alternativa`, `ComboMeter`, `ProgressToMinimum` e componentes de barra de acerto.
- Cor literal fora de `tokens.css`, `paletas.json` e `paletas.generated.css`.

**Movimento.** Teste com `prefers-reduced-motion: reduce` e com `data-motion="reduzido"`: nenhuma animação em execução e nenhum bloco invisível.

**O que o grupo precisa fazer à mão:** leitor de tela (NVDA ou VoiceOver) nos fluxos primeiros passos, paleta de comandos e uma sessão com pausa; celular de verdade; Safari e Firefox; olhar as cinco paletas em tela real (contraste medido não garante gosto).

## 8. Texto de início de cada etapa

> Leia `docs/FRONTEND_PROMPT.md` (seções 2 e 6) e `docs/FRONTEND_PARIDADE.md` inteiro. Hoje é a **etapa P<número>**: <o que a etapa constrói>. Faça só isso. Antes de escrever código, me mostre em até 10 linhas o plano e liste qualquer dúvida ou suposição do arquivo que o repositório não confirme. No fim, rode as checagens da seção 7, cole a saída, e liste os `TODO(equipe)`, os tipos novos e os textos novos.

## 9. Decisões em aberto (`TODO(equipe)`)

Semeie `docs/PENDENCIAS.md` com esta lista. A ferramenta **não decide nenhuma**.

1. **Conquistas:** manter ou não (mexe na regra 2 e no "Evite" da Fase 1), lista final, números dos marcos e quem calcula na API.
2. **Escola, cidade e sobre você:** manter ou não, texto de privacidade, menores de 18 anos (RNF07). Decidir junto com a F2.14 e a F2.15.
3. **Paletas Brasa e Sol:** a Brasa tem acento próximo do `--err`; a Sol tem acento próximo do âmbar da IA. Manter as duas ou tirar de `NEXT_PUBLIC_PALETAS`?
4. **Acento quente** para Floresta, Oceano e Terracota (hoje o acento é igual à cor da marca; um coral para o Foguinho exigiria token novo e auditoria).
5. **Terracota e área LC:** o laranja queimado da área LC é parecido com o botão da Terracota. A `AreaTag` leva sigla e nome, então a informação não depende da cor, mas o grupo precisa ver em tela.
6. **"Deixar o modelo escolher":** contrato (`modo: 'auto'`), regra no back-end e rótulo.
7. **Pausa:** como o tempo pausado é registrado; se simulado pode pausar.
8. **Simulado rápido:** N de questões e tempo.
9. **Metas:** valores padrão, limites, e se a meta de taxa de acerto fica.
10. **Movimento:** o grupo aprova a cascata de entrada (muda a seção 6 e o "Evite")?
11. **Busca por texto** na paleta de comandos e **"Refazer erradas"**: existem no back-end?
12. **Marcações** (favoritas e para revisar): persistência e limite no back-end.
13. **Cor de área em ladrilhos** (Etapa V): ratificar ou reverter.
14. **Raio 999 px no avatar:** aceitar como exceção.

---

# FIM DO PROMPT

## Origem e limites (não faz parte do prompt)

- A referência é o site `gabaritei-frontend-pi-vi.vercel.app`, outro deploy cujo autor e prompt são desconhecidos. Foram abertos Início, Questões, sessão, Simulados, resultado, revisão, Histórico, Desempenho, Perfil, Configurações, busca, paletas, perfil editável, conquistas, metas, onboarding, leitura concentrada e pausa. Login e criar conta não foram abertos.
- Os tempos e curvas da seção 4.4 foram medidos nesse site (entrada de página, cascata, controles) e arredondados. Nada de código, texto ou lista de conquistas foi copiado: as 11 conquistas do mock e as quatro metas são propostas nossas, escritas a partir das mecânicas do Gabaritei (Foguinho, Combo, simulado, áreas).
- As cinco paletas foram calculadas e conferidas por script contra WCAG 2.1 (texto 4,5; elementos gráficos e anel de foco 3), nos dois temas, incluindo a faixa principal do Início. Isso garante contraste, **não** garante que o grupo goste de cada uma: olhar em tela.
- Este arquivo não foi executado por nenhuma ferramenta ainda. Os nomes de rotas, pastas e scripts supõem o repositório descrito no briefing do front (`gabaritei-web`, npm, Next 16); a primeira resposta de cada etapa deve apontar o que não bater.
- `TODO(equipe)` da seção 9 e o que depende de API nova (seção 5) precisam ser combinados com quem faz a FastAPI antes de ligar `NEXT_PUBLIC_API_MODE=http`.
