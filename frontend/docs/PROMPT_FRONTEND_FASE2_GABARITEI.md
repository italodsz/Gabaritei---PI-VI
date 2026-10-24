# Gabaritei: prompt do front-end, Fase 2 (Claude Code ou Cursor)

**Só use este arquivo depois que a Fase 1 (`docs/FRONTEND_PROMPT.md`) estiver pronta e estável.** Ele acrescenta as telas que ficaram de fora para não sobrecarregar a primeira entrega: desempenho completo, histórico, listas, plano, diagnóstico, assistente de estudo (chat com IA), preferências completas, conta e dados pessoais, recuperação de senha, primeiros passos e as páginas de transparência.

As seções 2 (regras), 4 (stack), 6 (design system), 7 (camada de dados), 9 (componentes) e 11 (verificação) do arquivo da Fase 1 **continuam valendo** e não são repetidas aqui. Este arquivo só traz o que muda ou o que é novo.

> Nota desta etapa (Etapa 0 da Fase 1): este arquivo foi salvo apenas como referência futura. **Nenhuma tela, rota, link, botão ou flag de ambiente da Fase 2 foi construída.** `NEXT_PUBLIC_DIAGNOSTICO` e `NEXT_PUBLIC_ASSISTENTE` não existem no `.env.example` ainda — só entram quando a Fase 2 for aberta de verdade, conforme a seção F6 abaixo.

## Como usar

1. Salve este arquivo em `docs/FRONTEND_PROMPT_FASE2.md` do mesmo repositório e acrescente uma linha ao `CLAUDE.md` (ou à regra do Cursor): "Na Fase 2, leia também docs/FRONTEND_PROMPT_FASE2.md".
2. Siga as etapas 6 a 10 da seção F6, uma por conversa, com o mesmo texto de início de etapa da Fase 1 (troque o número da etapa).
3. `TODO(equipe)` continua sendo decisão do grupo. A IA não inventa valor.

---

# PROMPT, FASE 2 (começa aqui)

## F1. Regra nova (IA e chat de apoio)

Vale a partir da etapa 10, quando o assistente entrar.
- Âmbar (`--amber`, `--amber-ink`) passa a valer também para o **chat de apoio**, além do bloco de critério da recomendação. Continua exclusivo de "gerado por IA".
- O chat de apoio (LLM de terceiros) é uma camada **complementar e isolada**: explica enunciados e conceitos, nunca escolhe questão, nunca altera gabarito e nunca é chamado direto do navegador (o front só fala com a nossa API; chave e provedor ficam no back-end). Não aparece durante simulado ou diagnóstico em andamento, e em treino ou questão avulsa só depois de a resposta ser enviada.
- `TODO(equipe)`: o documento do projeto ainda lista "uso de API para LLMs" em *Não escopo*. O texto precisa ser atualizado para refletir a decisão de ter o chat de apoio, e o RF07 continua valendo: a resolução cadastrada é a oficial, o assistente não a substitui.

## F2. O que muda nas telas da Fase 1 quando a Fase 2 entra

| Tela da Fase 1 | Mudança | Etapa |
|---|---|---|
| 1 Entrar | Aparece o link "Esqueci minha senha". | 6 |
| 1 Entrar | Depois de entrar, quem ainda não concluiu os primeiros passos vai a `/boas-vindas` (usa `Perfil.onboardingConcluido`). | 6 |
| 2 Criar conta | O texto sobre excluir conta passa a ser "Você pode excluir sua conta quando quiser" com link para Conta e dados. | 6 |
| 13 Perfil | As preferências saem do Perfil e viram um link para `/configuracoes`. Entram links "Ver desempenho completo", "Histórico" e "Conta e dados". | 6 e 7 |
| 3 Início | Entram os blocos "Atividade recente" (5 últimas tentativas) e "Plano de estudo" (próximos 3 passos). | 7 e 8 |
| 4 Treino: escolher modo | Entra "Salvar como lista" no painel de resumo. | 8 |
| 5, 8 e 12 (questão resolvida) | Entra o botão "Tirar dúvida com o assistente", atrás de `NEXT_PUBLIC_ASSISTENTE=on`. | 10 |
| Navegação | Barra lateral ganha os grupos *Acompanhar* (Desempenho, Histórico), *Estudar* (Listas, Plano de estudo) e *Apoio* (Assistente). No celular, o 5º item da barra inferior vira "Mais" e abre uma folha com o resto. | 7 a 10 |
| 14 Termos e Privacidade | Saem as páginas provisórias, entra a estrutura final (tela F2.15). | 6 |

Chaves de etapa no `.env.example`: `NEXT_PUBLIC_DIAGNOSTICO=off|on` (liga o botão de diagnóstico dos primeiros passos) e `NEXT_PUBLIC_ASSISTENTE=off|on`.

## F3. Tipos e funções a acrescentar ao contrato

Acrescente em `lib/api/types.ts` (a Fase 1 já tem o resto). Tipo novo fora desta lista: crie e liste ao final da etapa.

```ts
/* ModoPratica ganha 'lista' e 'diagnostico' */
export type ModoPratica =
  | 'livre' | 'tema' | 'habilidade' | 'nivel' | 'progressao' | 'simulado' | 'lista' | 'diagnostico';

/* Regularidade completa (RF17) */
export interface Regularidade {
  foguinho: { atual: number; melhor: number; hojeContou: boolean; emRisco: boolean };
  semana: { data: string; questoes: number }[];           // 7 dias
  calendario: { data: string; questoes: number }[];       // até 12 semanas
  sessoes: { id: string; inicio: string; duracaoSegundos: number; questoes: number }[];
  metaSemanal: { alvo: number; feito: number };
}

/* Desempenho (RF15) */
export type Periodo = '7d' | '30d' | '90d' | 'tudo' | { de: string; ate: string };
export interface Desempenho {
  periodo: Periodo; respondidas: number; acertos: number; erros: number; taxaAcerto: number | null;
  porArea: { area: Area; respondidas: number; acertos: number }[];
  porHabilidade: { area: Area; habilidade: Habilidade; respondidas: number; acertos: number; prioridade: number | null }[];
  serieProficiencia: { area: Area; pontos: { data: string; valor: number }[] }[];
  proficiencias: Proficiencia[];
}

/* Histórico (RF16, RF08) */
export interface TentativaHistorico {
  id: string; questaoId: string; area: Area; habilidade: string | null; ano: number | null;
  resposta: Letra | null; gabarito: Letra; correta: boolean;
  modo: ModoPratica; versaoModelo: string | null; sessaoId: string | null; respondidaEm: string;
}

/* Listas (RF12, RF13) */
export interface Lista {
  id: string; nome: string; modo: ModoPratica; criado: string; modelo: { nome: string; versao: string } | null;
  itens: { posicao: number; questaoId: string; area: Area; criterio: Criterio | null; status: 'pendente' | 'acertou' | 'errou' }[];
}

/* Plano de estudo (RF14) */
export interface PassoPlano {
  id: string; posicao: number; area: Area; habilidade: Habilidade;
  motivo: string;                               // texto da API (RF10)
  meta: number; feitas: number; status: 'nao_iniciado' | 'em_andamento' | 'concluido';
  questoes: Recomendacao[];                     // RF14: mostra habilidades E questões
}
export interface Plano { origem: 'desempenho' | 'tema'; geradoEm: string; passos: PassoPlano[]; modelo: { nome: string; versao: string } }

/* Diagnóstico inicial (extra; ainda não está nos RFs) */
export interface Diagnostico { id: string; areas: Area[]; total: number; respondidas: number; duracaoEstimadaMin: number }
export interface ResultadoDiagnostico {
  porArea: { area: Area; acertos: number; total: number; proficiencia: Proficiencia }[];
  sugestoes: Recomendacao[];
}

/* Chat de apoio (extra; isolado da recomendação) */
export interface MensagemChat { id: string; papel: 'usuario' | 'assistente'; texto: string; criadaEm: string; util: boolean | null }
export interface Conversa { id: string; questaoId: string | null; titulo: string; mensagens: MensagemChat[] }
export interface LimiteChat { restantesHoje: number; limiteDia: number } // TODO(equipe)

/* Conta, perfil e preferências completos (RF21, RNF07) */
export interface Perfil { id: string; nome: string; email: string; faixaEtaria: 'maior_18' | 'menor_18' | null; onboardingConcluido: boolean; criadoEm: string }
export interface Preferencias {
  tema: 'sistema' | 'claro' | 'escuro'; reduzirMovimento: 'sistema' | 'sim';
  tamanhoTexto: 100 | 115 | 130; descricaoImagensAberta: boolean; atalhosTeclado: boolean;
  cronometroSessoes: boolean; metaSemanal: number; areasFoco: Area[];
}
export interface ExportacaoDados { id: string; status: 'preparando' | 'pronto' | 'expirou' | 'erro'; url: string | null }
```

Funções a acrescentar em `Api` (caminho futuro sugerido à direita):

| Função | Endpoint futuro |
|---|---|
| `pedirRedefinicaoSenha`, `redefinirSenha` | Supabase Auth |
| `obterDesempenho(periodo, area?, habilidade?)` | `GET /desempenho` |
| `listarTentativas(filtros, pagina): Pagina<TentativaHistorico>` | `GET /tentativas` |
| `listarListas`, `criarListaRecomendada`, `obterLista`, `atualizarLista`, `excluirLista` | `/listas` |
| `obterPlano`, `regenerarPlano` | `GET /plano`, `POST /plano/regenerar` |
| `iniciarDiagnostico(areas)`, `obterDiagnostico(id)`, `obterResultadoDiagnostico(id)` | `/diagnostico` |
| `enviarMensagemChat({ conversaId?, questaoId?, texto })` (stream), `listarConversas`, `avaliarMensagem`, `obterLimiteChat` | `/chat` |
| `solicitarExportacaoDados`, `obterExportacao(id)`, `excluirConta(confirmacao)` | `/me/exportacao`, `DELETE /me` |

O mock ganha: chat em *stream* com respostas pré-escritas que **sempre começam avisando que é demonstração**; histórico e calendário gerados a partir das tentativas do cenário; exportação que muda de `preparando` para `pronto` depois de alguns segundos.

## F4. Componentes a acrescentar

`Stepper` numérico, `Tabs`, `AIBadge` (âmbar), `LineChart` (proficiência por área ao longo do tempo; áreas com dados insuficientes ficam fora da linha e listadas abaixo), `BarList` (barras horizontais com número), `Heatmap` (calendário de 12 semanas; cada célula é um botão com `aria-label` "12 de outubro, 8 questões"; intensidade em 4 degraus de `--forest` mais o número ao focar), `ChatMessage`, `ChatComposer`. Gráficos em SVG próprio ou visx, com as cores dos tokens, **todos com "Ver como tabela"**. Não use tema padrão de biblioteca de gráfico.

## F5. Especificação das telas (Fase 2)

Mesmas regras de estados e de definição de pronto da Fase 1 (seções 10 e 13 de lá).

### Acesso e primeiros passos

#### Tela F2.1: Recuperar e redefinir senha (`/recuperar-senha`, `/redefinir-senha`, RF01, P1)
`/recuperar-senha`: campo de e-mail e botão "Enviar link". Resposta **sempre neutra**: "Se existir uma conta com esse e-mail, enviamos um link para criar uma nova senha." `/redefinir-senha`: nova senha com mostrar/ocultar, botão "Salvar nova senha", sucesso leva a `/entrar` com aviso; link expirado mostra erro com botão para pedir outro.

#### Tela F2.2: Primeiros passos (`/boas-vindas`, RF11, RF14, P1)
Casca de foco. Três passos num `<ol>` com "Passo 1 de 3", progresso salvo ao avançar, botão "Voltar" e "Pular por enquanto" em cada um.
1. **Exame.** ENEM selecionado. FUVEST e UNICAMP desabilitados com "em breve" escrito.
2. **Foco.** "Quais áreas você quer priorizar?" (4 opções múltiplas, com as `AreaTag`). "Quer começar por algum tema?" campo de texto livre (alimenta o modo tema, que é o único que funciona sem histórico, RF11) com exemplos clicáveis.
3. **Rotina.** Meta semanal de questões (atalhos 20, 50, 100 e campo livre). Preferência de abrir a descrição das figuras (RF05/RNF06).
**Fim.** Duas saídas: "Fazer o diagnóstico (cerca de N min)" como principal e "Ir para o início" como secundária. Salva com `atualizarPerfil` e `atualizarPreferencias`; marca `onboardingConcluido`.

### Diagnóstico inicial

#### Tela F2.3: Diagnóstico, apresentação (`/diagnostico`, extra, P3)
Casca de foco.
**O que tem.** `h1` "Diagnóstico inicial". O que é, em duas frases: um conjunto curto de questões (3 por área, N no total, tempo estimado vindo da API) para começar a calibrar as recomendações. Escolha das áreas (padrão todas). Aviso honesto em nota neutra: "Com poucas respostas ainda não dá para estimar sua proficiência. O diagnóstico é um ponto de partida, e a estimativa melhora conforme você pratica." Botões "Começar diagnóstico" e "Fazer depois". Pode ser retomado se estiver incompleto.
`TODO(equipe)`: o diagnóstico **não está nos requisitos** e precisa virar RF (tamanho, quais questões, se a correção é imediata, quantas respostas valem para o volume mínimo).

#### Tela F2.4: Diagnóstico, respondendo (`/diagnostico/[id]`, extra, P3)
Usa o mesmo *runner* do simulado (Simulado em andamento, tela 10 da Fase 1) em modo `diagnostico`: **sem correção imediata**, sem cronômetro obrigatório, "Salvar e sair", pular e voltar, painel de cartão-resposta mini agrupado por área. Ao finalizar, vai para o resultado.

#### Tela F2.5: Diagnóstico, resultado (`/diagnostico/[id]/resultado`, extra, RF09, P3)
**O que tem.** `h1` "Seu ponto de partida". Uma linha por área (lista, não 4 cards iguais): `AreaTag`, "acertou X de Y" e o estado da proficiência. Se `dados_insuficientes`, escreve "Ainda não dá para estimar. Faltam N respostas nesta área" com `ProgressToMinimum`; se `ok`, mostra o valor com o rótulo de escala. Sem rótulos como "nível iniciante". Abaixo, "Por onde começar": as recomendações iniciais (modo tema) com `CriterioRecomendacao`. Botão "Começar a treinar" (cria sessão) e link "Ir para o início".

### Listas e plano

#### Tela F2.6: Minhas listas (`/listas`, RF12, RF13, P2)
**O que tem.** `h1` "Listas de prática". Botão "Nova lista recomendada". Lista em linhas: nome, o modo/critério em que foi gerada, quantas questões, progresso ("4 de 10", barra mais número), criada em. Ações por linha: "Continuar" ou "Começar", renomear, excluir (com confirmação que diz o que some). **Estado vazio**: "Você ainda não tem listas. Crie uma a partir das recomendações" com o botão.

#### Tela F2.7: Nova lista recomendada (`/listas/nova`, RF12, P2)
**O que tem.** O mesmo seletor de modo e opções da tela Treino: escolher modo (tela 4 da Fase 1), mas termina em "Gerar lista". Depois de gerar: **prévia ordenada** das questões, cada uma com `AreaTag`, habilidade, `FaixaChip` e o `CriterioRecomendacao`. Dá para remover um item e reordenar (arrastar **e** botões "Subir" e "Descer", para teclado). Campo "Nome da lista". Botões "Salvar lista" e "Salvar e começar".
**Regras.** Sem questões duplicadas e sem questões em quarentena (a API garante; a tela não reintroduz). Tamanho da lista: `TODO(equipe)` (mínimo e máximo). Se não houver elegíveis suficientes, mostra o aviso da API.

#### Tela F2.8: Detalhe da lista (`/listas/[id]`, RF12, RF13, P2)
**O que tem.** Nome editável, progresso, o modelo/versão que a gerou (recolhido). Itens ordenados com status ("Pendente", "Acertou", "Errou" com ícone e texto) e o critério. Botão "Continuar de onde parou" abre a **mesma tela de sessão (tela 5 da Fase 1)** em modo `lista`. Itens ainda não feitos podem ser reordenados. Quando termina, vai ao resumo (tela 6 da Fase 1).

#### Tela F2.9: Plano de estudo (`/plano`, RF14, RF10, RF11, P2)
**Para que serve.** Uma sequência de prática baseada no desempenho, **sem calendário** (diferente de cronogramas por rotina de outras plataformas).
**O que tem.** `h1` "Plano de estudo". Frase de origem: "Montado a partir do seu desempenho" ou "Montado a partir do tema que você escolheu" (sem histórico, RF14). Lista ordenada de passos. Cada passo: posição, `AreaTag`, habilidade (código e descrição), o **motivo** (texto da API, RF10), meta ("10 questões"), progresso ("4 de 10", barra mais número), status. Cada passo expande (`Disclosure`) mostrando as **questões recomendadas** daquele passo (RF14 pede habilidades e questões), com `FaixaChip` e links. Botão "Praticar" abre uma sessão no modo habilidade para aquele passo. Botão "Atualizar plano" (chama `regenerarPlano`) com nota de quando ele se atualiza sozinho (`TODO(equipe)`).
**Estados.** Sem histórico: campo "Comece por um tema" que gera um plano inicial. `dados_insuficientes`: mostra o que falta para um plano baseado em desempenho.

### Acompanhamento

#### Tela F2.10: Desempenho (`/desempenho`, RF15, RF09, RF10, RF17, P1)
**Para que serve.** Ver evolução e regularidade. É a tela mais densa; hierarquia importa.
**Filtros no topo** (ficam na URL e atualizam tudo; `aria-busy` enquanto recarrega): Período (7 dias, 30 dias, 90 dias, tudo, personalizado), Área (todas ou uma), Habilidade (opcional).
**O que tem, de cima para baixo.**
1. **Faixa de indicadores** numa só linha com divisores (não 4 cards iguais): respondidas, acertos, erros, taxa de acerto. Números serifados, tabulares.
2. **Evolução da proficiência**: `LineChart` com uma linha por área (cor da área **mais** rótulo direto na ponta da linha, não só legenda por cor). Áreas com `dados_insuficientes` não entram no gráfico e aparecem listadas abaixo com `ProgressToMinimum`. Botão "Ver como tabela".
3. **Por área**: `BarList` com acertos de respondidas e a taxa em número.
4. **Habilidades** (`<table>` ordenável): habilidade, área, respondidas, taxa de acerto, tendência, e a coluna **Prioridade de reforço** (RF10, "1ª", "2ª"...) para as que o motor apontou. Botão "Treinar" por linha. `dados_insuficientes` para reforço aparece como nota acima da tabela.
5. **Regularidade (RF17)**: `FoguinhoBadge` (atual e melhor), `Heatmap` de 12 semanas, e "Sessões recentes" (data, duração, nº de questões).
**Estados.** Sem dados no período: "Você não respondeu questões neste período. Tente um período maior ou comece um treino." com botões. Os filtros nunca devolvem tela vazia sem explicação (RF15).

#### Tela F2.11: Histórico de estudos (`/historico`, RF16, RF08, P2)
**O que tem.** `h1` "Histórico". Filtros: período, área, resultado (acertou, errou), modo de prática. Lista **agrupada por dia** (cabeçalho do dia em sentence case: "Hoje", "Ontem", "12 de outubro"). Cada linha: horário, `AreaTag`, habilidade, ano, sua resposta e o gabarito, resultado (`StatusChip`), o modo (Tema, Habilidade, Nível, Progressão, Lista, Simulado, Livre, Diagnóstico) e, quando veio de recomendação, "Modelo 0.3.1" (RF08). A linha abre `/questoes/[id]?tentativa=` em modo `revisao`, com a resolução se existir (RF16). Paginação. **Só dados do usuário autenticado.** Vazio: "Quando você responder questões, elas aparecem aqui."

### Apoio e conta

#### Tela F2.12: Assistente de estudo (`/assistente`, extra, P3)
**Isolamento (leia duas vezes).** É uma ajuda **complementar**. O grupo definiu que LLM de terceiros fica restrito a chat de apoio e **nunca** entra no motor de recomendação. `TODO(equipe)`: o documento do projeto ainda lista "uso de API de LLM" em *Não escopo*; o texto precisa ser atualizado para refletir esta decisão (e RF07 continua valendo: resolução cadastrada é a oficial, o assistente não a substitui).
**Duas entradas.** A página `/assistente` (conversas) e um **painel lateral** (`Sheet`) aberto pelos botões "Tirar dúvida com o assistente" das telas 5, 8 e 12 da Fase 1, já com o contexto da questão (um chip "Questão ENEM 2022, MT, H21"). **Desabilitado durante simulado ou diagnóstico em andamento** e, em treino/questão avulsa, **só depois de enviar a resposta** (não pode entregar o gabarito antes).
**O que tem.**
- Cabeçalho com `AIBadge` ("Assistente de estudo, IA") e um aviso fixo e legível: "Respostas geradas por IA podem conter erros. O gabarito oficial e a resolução cadastrada valem mais do que o assistente."
- Lista de mensagens: do estudante (alinhada à direita, fundo `--paper-2`) e do assistente (à esquerda, **nota de margem em âmbar** com o selo "Gerado por IA"). Em cada resposta: copiar, "Foi útil" e "Não foi útil" (`avaliarMensagem`).
- Sugestões iniciais quando vazio: "Explique o enunciado com outras palavras", "Por que a alternativa B está errada?", "Revise o conceito por trás desta questão". **Nenhuma** sugere "me diga a resposta".
- Campo de mensagem com contador, `Enter` envia e `Shift+Enter` quebra linha. Aviso "Não envie dados pessoais."
- Contador do limite diário ("Restam 12 mensagens hoje", `obterLimiteChat`).
**Estados.** Resposta chegando em *stream* (`aria-busy`; o leitor de tela anuncia **só quando a resposta termina**, não token por token). Limite atingido: "Você usou as mensagens de hoje. Volta amanhã." Assistente indisponível: "O assistente está fora do ar. O resto do Gabaritei continua funcionando." Erro: tentar de novo.
**Regras.** O front nunca chama o provedor do LLM nem guarda chave. O chat **não recomenda questões**: se o estudante pedir, a resposta dele deve apontar para Treino (comportamento do back-end; no mock, uma resposta pronta).

#### Tela F2.13: Preferências (`/configuracoes`, RNF06, P2)
Esta tela absorve as preferências que na Fase 1 ficavam no Perfil. Uma página com seções em âncoras (navegação lateral em telas largas). **Salva sozinho** a cada mudança, com texto "Salvo" numa região `aria-live` (sem botão "Salvar" global).
- **Aparência:** tema (Sistema, Claro, Escuro), reduzir movimento (Sistema, Sim), tamanho do texto (100, 115, 130 %).
- **Estudo:** meta semanal de questões, áreas de foco, mostrar cronômetro nas sessões, atalhos de teclado (liga e desliga).
- **Acessibilidade:** "Abrir descrição das figuras por padrão" (`Switch`, RF05/RNF06).
- **Modo padrão** do botão "Começar treino" do Início.
Mudar o tema aplica na hora, sem recarregar.

#### Tela F2.14: Conta e dados pessoais (`/conta`, RF21, RNF07, P2)
**O que tem.**
- **Perfil:** nome, e-mail (alterar via fluxo do provedor), "Alterar senha".
- **Seus dados:** lista do que o Gabaritei guarda (tentativas, sessões, preferências, conversas com o assistente se houver). Botão "Baixar meus dados": cria a solicitação, mostra "Estamos preparando seu arquivo" e, quando pronto, o link de download (estados: preparando, pronto, expirou, erro).
- **Excluir conta** (zona de perigo, em nota de margem com ícone e texto, não só vermelho): explica o que acontece ("suas tentativas e seu perfil deixam de ser acessíveis e não entram em novos ajustes do modelo"), pede confirmação digitando "EXCLUIR" e a senha, botão "Excluir minha conta". Depois do sucesso: sai da sessão, vai a `/entrar` com a mensagem "Conta excluída."
`TODO(equipe)`: prazo de retenção e texto exato para menores de 18 (RNF07).

### Páginas de transparência

#### Tela F2.15: Privacidade e Termos (`/privacidade`, `/termos`, RNF07, P2)
Só a **estrutura**: índice lateral fixo em telas largas, seções com `h2` (quais dados coletamos, para que usamos, por quanto tempo guardamos, como exportar e excluir, menores de 18 anos, contato) e "Última atualização". **O texto é do grupo**: preencha com `TODO(equipe): texto jurídico` em cada seção, sem inventar conteúdo legal. Boa leitura em impressão.

#### Tela F2.16: Como o Gabaritei recomenda (`/como-funciona`, RF11, RF17, RF18, P2)
Página de transparência, o argumento de venda do projeto. Sem login.
**O que tem.**
- `h1` "Como o Gabaritei escolhe suas questões".
- O **funil** em lista numerada (texto, não só imagem): 1) buscamos questões parecidas no conteúdo, 2) tiramos as que você já respondeu, 3) filtramos pela dificuldade (parâmetro b do TRI), 4) mostramos as 5 melhores, sempre dizendo por quê.
- Os 4 modos, um parágrafo curto cada, com **um exemplo de frase de critério** (rotulada como exemplo).
- "O que é dificuldade fácil, média e difícil" (derivada do parâmetro b, com cortes por área; `TODO(equipe)`: cortes documentados).
- "Proficiência estimada" (modelo TRI de 3 parâmetros, só aparece depois de um volume mínimo de respostas; `TODO(equipe)`: valor).
- "Foguinho" e "Combo" com as regras reais lidas da API (config do Combo).
- "O que usamos dos seus dados" e "O que o assistente de IA faz e não faz" (explica; não escolhe questão nem muda gabarito).
- "De onde vêm as questões": INEP/ENEM. `TODO(equipe)`: texto de licença das fontes (RNF10).

## F6. Etapas de construção (Fase 2)

Mesmo texto de início de etapa da Fase 1 (troque o número). Uma etapa por vez.

**Etapa 6: Conta e acesso** (telas F2.1, F2.2, F2.13, F2.14, F2.15)
Recuperar e redefinir senha, primeiros passos (com `NEXT_PUBLIC_DIAGNOSTICO` ainda desligado), preferências completas, conta e dados pessoais (exportar e excluir), Termos e Privacidade definitivos. Aplica as mudanças da tabela F2 nas telas 1, 2, 13 e 14. **Esta etapa vem primeiro porque o RF21 e o RNF07 (LGPD, menores de 18) precisam estar prontos antes de qualquer usuário real.**
*Pronto quando:* a recuperação de senha responde sempre de forma neutra, a exportação passa por todos os estados, a exclusão pede confirmação e desloga, e as preferências persistem e aplicam na hora.

**Etapa 7: Desempenho e histórico** (telas F2.10, F2.11)
Desempenho completo com gráficos e tabelas equivalentes, e Histórico. Atualiza o Perfil (links) e o Início (atividade recente).
*Pronto quando:* os filtros do Desempenho atualizam todos os indicadores e a URL, `dados_insuficientes` aparece em cada lugar previsto, todo gráfico tem a tabela alternativa, e o histórico abre a questão com a resolução (quando existe).

**Etapa 8: Listas e plano** (telas F2.6, F2.7, F2.8, F2.9)
Listas de prática, plano de estudo, botão "Salvar como lista" no Treino, bloco de plano no Início.
*Pronto quando:* a lista não tem questões duplicadas, reordenar funciona por arrastar e por botões, o plano mostra habilidades e questões, e o plano sem histórico começa por tema.

**Etapa 9: Diagnóstico** (telas F2.3, F2.4, F2.5)
Ligue `NEXT_PUBLIC_DIAGNOSTICO=on`. Reaproveita o *runner* do simulado.
*Pronto quando:* o diagnóstico pode ser pausado e retomado, o resultado fala honestamente em "dados insuficientes" quando for o caso, e nada nele diz "nível" ou "nota".

**Etapa 10: Assistente e transparência** (telas F2.12, F2.16 e revisão geral)
Ligue `NEXT_PUBLIC_ASSISTENTE=on`. Assistente (página e painel), página Como funciona. Passada final contra todas as regras da Fase 1 e a regra F1; lista de testes manuais (leitor de tela, celular, Safari e Firefox).
*Pronto quando:* o assistente fica indisponível durante simulado e diagnóstico e antes de enviar a resposta, o aviso de IA está sempre visível, e a lista de testes manuais está escrita.

## F7. Decisões em aberto da Fase 2 (`TODO(equipe)`)

1. **Diagnóstico inicial:** tamanho, composição, se corrige na hora, quantas respostas contam para o volume mínimo. Hoje não é requisito: precisa virar RF.
2. **Chat de apoio:** provedor, limite diário, retenção das conversas, e atualizar o *Não escopo* do documento do projeto.
3. **Lista de prática:** tamanho mínimo e máximo.
4. **Plano de estudo:** quando ele se atualiza sozinho.
5. **Licença das fontes de questões** e o texto de atribuição na página Como funciona (RNF10).
6. **Exportação e exclusão de dados:** formato do arquivo, prazo de expiração do link, retenção depois da exclusão (RF21, RNF07).

---

# FIM DO PROMPT, FASE 2
