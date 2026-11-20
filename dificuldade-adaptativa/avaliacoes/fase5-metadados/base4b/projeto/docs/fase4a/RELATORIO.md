# Gabaritei — Fase 4A: integridade de respostas e perfis TRI

Data: 18/11/2026. Entrega local para auditoria. **Não representa aprovação da fase.**

## 1. Resultado executivo

Foram corrigidos os quatro problemas de integridade autorizados: tempo mínimo,
repetições, importação sem comprovação e denominador da calibração. A implementação
usa tentativas emitidas no servidor, eventos persistentes e projeções transacionais.
O laboratório foi bloqueado por padrão. Autenticação definitiva e recomendador
unificado Top 5 ficaram como contratos para uma etapa futura.

A suíte original passou com 56 testes antes da alteração. A suíte final passou com
84 testes: os 56 casos existentes, com adaptações de contrato explicitadas abaixo,
e 28 casos novos de integridade. Também passaram três testes Python do diagnóstico
semântico, a integração HTTP com seus índices reais e o roteiro da tela no Chrome.
As sondas e testes usam respostas e contas de fixture. Não medem aprendizagem,
qualidade pedagógica, AUC em estudantes reais ou melhoria do recomendador.

**Recomendação técnica:** encaminhar a Fase 4A para auditoria de aceitação. Os critérios
de integridade exercitados passaram; a aprovação formal cabe ao responsável pelo
projeto. Não avançar para Fase 5, autenticação definitiva ou integração completa.

## 2. Base examinada e isolamento

- Repositório: https://github.com/italodsz/Gabaritei---PI-VI
- Origem: branch `recomendador-dificuldade`.
- Commit base: `f7ce6aca633f2543e0d8be18ae1a5a898a4ac929`.
- Branch criada somente localmente: `fase4a/integridade-tri`.
- Nenhum commit, push, merge ou pull request realizado.
- A branch `joao/recomendador-dificuldade` não foi consultada nesta execução.
- Não foram treinados modelos nem alterados o dataset, catálogo, índices semânticos,
  parâmetros numéricos do estimador ou configurações de dificuldade.

O aplicativo usa a base tratada versionada no commit acima. Não misturar com o
inventário histórico de 2.971 questões: esta versão tem 3.086 registros brutos,
2.731 elegíveis textuais, 2.657 disponíveis para prática e 1.885 que passam pela
triagem TRI do código. Esses conjuntos têm finalidades diferentes.

SHA-256 do dataset `Dataset/base_trabalho/data/questions.jsonl`:
`6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f`.

SHA-256 do catálogo `recomendador/rrf-tfidf-minilm-J/catalogo/recomendacoes_titulo_area.json`:
`c754d4a3a96375849a3954501f2f162aadd0b1da080b4c469639cb9604204fcb`.

A preparação inspecionou as auditorias anteriores e os pontos de recepção,
armazenamento, importação, controle adaptativo e diagnóstico. Não reabriu a escolha
de modelos. O motor deste checkout estima proficiência TRI por área; não se deve
chamá-lo de novo treinamento BKT nem misturá-lo às evidências históricas ASSISTments.

## 3. Estado inicial e causas

| Problema | Evidência antes | Causa localizada |
|---|---|---|
| Tempo ausente | `tempo_ausente_conta=true` | Filtro excluía apenas tempo finito abaixo do mínimo; inexistência de apresentação verificável |
| Repetição | n=1, janela=15, meta=0,65 após 18 revisões | Atualização do controlador separada da elegibilidade do estimador |
| Importação | n=15 aceito sem eventos | Perfil do navegador promovido a estado oficial |
| Calibração | 19 registros, somente 1 elegível | Filtro de assistência insuficiente; não exigia `conta=1` |
| Painel | Resposta 200 sem autorização | Rotas de desenvolvimento abertas |

Fontes de execução: `evidencias/baseline.json`, `baseline_testes.log` e
`baseline_sondas.json`. A linha de base usa fixtures isoladas; não alterou contas
ou históricos de usuários reais. Os nomes dos logs são mantidos mesmo quando
registram uma falha intermediária, para não apagar a sequência de investigação.

## 4. Soluções e fluxo atual

1. Abrir uma questão emite `tentativaId`, associada ao sujeito identificado pelo
   servidor e à sessão de exercício. Guarda instante de emissão, relógio monotônico,
   validade de seis horas, família do item, parâmetros, configuração e previsão prévia.
2. O frontend mostra a espera e bloqueia botão e atalho. O servidor calcula o intervalo:
   antes de 8.000 ms responde 425 e registra rejeição sem criar evidência TRI.
3. Tempo do navegador ausente, fracionário, textual ou incompatível é recusado.
   É exigido inteiro >=8.000 ms, sem exceder intervalo servidor em mais de 250 ms.
4. Questão incompatível, tentativa alheia ou inexistente são recusadas. Reinício
   invalida apresentações pendentes cujo relógio monotônico deixou de ser verificável;
   reabrir emite outra tentativa. Recibos já confirmados continuam válidos após reinício.
5. O servidor corrige a alternativa a partir do item, decide elegibilidade centralmente
   e grava evento, perfil e recibo na mesma transação SQLite `BEGIN IMMEDIATE`.
6. Reenvio idêntico devolve o mesmo recibo. Conteúdo diferente para a mesma tentativa
   ou chave retorna conflito 409. O frontend congela o envio durante a requisição.
7. Respostas posteriores da mesma família são revisões: ficam na atividade, mas não
   atualizam proficiência nem controlador. Anterior e retomada na mesma sessão reutilizam
   a apresentação; não fabricam outro evento. A exclusão por família é conservadora:
   mesmo uma primeira exposição respondida com apoio impede contar a revisão como inédita.
8. Apoio fica registrado no servidor e não pode ser desfeito com `apoio=false`.
   Itens reprovados na triagem TRI também ficam fora do estimador e do controlador.
9. Somente eventos novos, sem assistência e com TRI triada recebem `conta=1`.
   Em prática esses mesmos eventos têm `adapta=1`. Em simulado atualizam TRI com o
   peso já existente, mas não o controlador da prática. O perfil usa pesos e meta originais.
10. Importações são preservadas em quarentena `legado_importado`, com hash e indicação
    de não verificação. Nunca substituem n ou o vetor oficial. Tabelas antigas permanecem.
11. O perfil calculado é uma projeção dos eventos. O replay usa parâmetros, configuração,
    alvo, origem e horário congelados para reconstruí-lo; inicia cada área com a configuração
    do primeiro evento. Não é necessário fazer replay em toda consulta.
12. Calibração principal exige `conta=1` e previsão finita congelada antes da resposta.
    Atividade, exclusões e rejeições têm contagens separadas. N=0 não produz taxa inventada.

O cliente continua podendo escolher o desafio; essa preferência não é evidência de domínio.
O motor semântico do Ítalo, sua ordenação de catálogo e a seleção existente foram preservados.
Esta fase não implementou um novo recomendador integrado.

### Armazenamento

Migração aditiva `0003_integridade_fase4a`, sem apagar tabelas anteriores:

- `sessao_exercicio`: hash do cookie opaco e criação.
- `tentativa_integridade`: apresentação, sujeito, questão, família, sessão, origem,
  tempos, suporte, snapshots, chance prévia, recibo e hash do payload.
- `evento_integridade`: ID/ordem, tentativa, sujeito, questão/família/área, alternativa,
  correção, tempos, origem, conta/adapta, motivo, alvo, versão e perfil após evento.
- `perfil_verificado`: projeção por sujeito e área com revisão.
- `rejeicao_integridade`: recusas auditáveis, sem efeito no aprendizado.
- `legado_importado`: payload preservado por sujeito/hash, sem promoção automática.

O arquivo SQLite fica no caminho padrão já usado pelo aplicativo (`backend/dados/`)
ou em `GABARITEI_DB`. Contas existentes usam a sessão de login já disponível. Exercícios
sem login recebem cookie HttpOnly SameSite=Lax emitido pelo backend. Limpar esse cookie
perde a associação ao histórico anônimo; ele não é identidade educacional permanente.

### Contrato HTTP relevante

| Operação | Requisição / efeito |
|---|---|
| `POST /api/questoes/{id}/tentativas` | `{sessaoId,origem}`; retorna tentativa, espera e expiração |
| `POST /api/tentativas/{id}/apoio` | Marca apoio permanentemente na apresentação |
| `POST /api/questoes/{id}/responder` | `{tentativaId,selected,tempoMs,apoio?,desafio?}`; correção e perfil oficial |
| `GET /api/eu/perfil-tri` | Somente sujeito da sessão; não aceita identidade de terceiro |
| `PUT /api/eu/perfil-tri` | Preserva importação como legado não verificado |
| `POST /api/eu/perfil-tri/respostas` | Até 200 respostas com tentativas existentes; resultado por item |
| `GET /api/dev/dificuldade` | Diagnóstico apenas após controle local administrativo |

O lote é transacional **por evento**, com sucessos e recusas explícitos; não há rollback
integral do lote. Um retry devolve recibo sem duplicar efeitos. `registradas` conta recibos
bem-sucedidos na chamada, não novas evidências; para estas usar os eventos únicos `conta=1`.
Essa diferença precisa ser respeitada por qualquer futura integração de simulado.

## 5. Evidências e critérios de aceitação

| Critério | Resultado real | Evidência |
|---|---|---|
| API aos 3/7/8 segundos | 425 / 425 / 200 | `sonda_final.json`, `integridade_final.log` |
| Tela aos 3/7 segundos | Botão desabilitado; Enter não envia | `ui/resultado_ui.json`, imagens |
| Tela após mínimo | Liberada por volta de 8,985 s; atualização visual a cada segundo | `ui.log` |
| Duplo clique | Um evento | `ui/resultado_ui.json` |
| Retry/concorrência | 10 reenvios: um ID de evento | `testes_finais.log` |
| 18 revisões | 19 atividades, n=1, janela=1; perfil/meta idênticos ao primeiro evento | `sonda_final.json` |
| Importação fictícia n=15 | Oficial n=0, promovido=false | `sonda_final.json` |
| Recuperação SQLite em disco | Perfil, replay e recibo iguais após reabrir banco | `testes_finais.log` |
| Transação interrompida | Falha injetada faz rollback; retry limpo funciona | `integridade_final.log` |
| Isolamento de tentativa | Outra sessão recebe 404 e não cria evento | `testes_finais.log` |
| Administração | Padrão 404; habilitado sem token 403; token local no teste 200 | `testes_finais.log` |
| Regressão do motor e UI lógica | 84 aprovados, 0 falhas, 0 ignorados | `testes_finais.log` |
| Semântico congelado | 3 testes Python e HTTP→worker→índices aprovados | `semantico_final.log` |

### Sonda de calibração em duas etapas

Após as correções 1–3, foi mantido temporariamente o filtro anterior para retestar a
hipótese: a divergência **persistiu**, 19 registros para 1 elegível. Registro em
`sonda_apos123_antes_filtro.json`. Somente então foi aplicado o filtro final `conta=1`.
A sonda final tem 19 eventos, 1 evidência TRI, 1 registro de calibração, 18 exclusões
por repetição e 2 rejeições antecipadas. A chance congelada foi 0,3139260294.
N=1 é apenas prova de integridade do denominador, não validação estatística da calibração.

### Alterações nos testes existentes e falhas intermediárias

Não foram removidos os testes numéricos do estimador nem rebaixados seus limiares.
Os contratos antigos que esperavam resposta sem tentativa, perfil n vindo do navegador
e painel aberto foram atualizados para as exigências da Fase 4A. Testes de catálogo,
correção, matrícula/conta, seleção e escores permanecem. Uma expressão de asserção
preexistente recebeu parênteses para comparar o booleano com a condição correta.
O helper do teste semântico passou a usar banco em memória e token local explícito.

Os logs intermediários registram incompatibilidades esperadas dos testes antigos
após a troca de contrato. Durante o novo teste de navegador e o helper semântico,
a primeira execução concluiu as asserções mas falhou ao fechar o banco duas vezes;
o encerramento foi corrigido e ambos foram reexecutados com saída 0. O log final
contém uma exceção `fixture rollback` deliberadamente provocada pelo teste de
atomicidade: o respectivo caso passou. Não é falha silenciosa do aplicativo.

## 6. Arquivos alterados

- `backend/integridade.mjs`: regras centrais, tentativas, eventos, replay e calibração.
- `backend/db.mjs`: migração aditiva.
- `backend/rotas-dificuldade.mjs`: perfis oficiais, importações e lote verificável.
- `backend/server.mjs`: recepção de respostas e bloqueio administrativo.
- `frontend/dificuldade.js`: validação estrita do tempo; matemática preservada.
- `frontend/tentativas.js`: emissão, contador visual e retry idempotente.
- `frontend/practice-screen.js`: espera, bloqueios, suporte e envio verificável.
- `frontend/exam-screen.js`: emissão de apresentações do simulado.
- `frontend/dificuldade-cliente.js`: adota perfil oficial, arquiva legado local.
- Testes de API, desenvolvimento, dificuldade e novo `integridade.test.mjs`.
- `backend/check-dev-model.mjs`, scripts de sonda, validação e teste de tela.
- README, contratos e este relatório. Manifesto na raiz do pacote lista todos os arquivos.

## 7. Limitações e pendências

- Oito segundos comprovam intervalo entre apresentação e envio, não leitura ou atenção.
  Tempo de aba em segundo plano pode entrar no intervalo; não mede esforço cognitivo.
- Contas opcionais e cookie anônimo não substituem autenticação/autorização definitiva.
  O cliente informa a sessão e a origem prática/simulado na emissão; ainda não há
  objeto de matrícula/simulado autorizado que valide essa origem em nível de produto.
- O bloqueio administrativo local é provisório. Uma interface administrativa autenticada,
  papéis, auditoria de acesso e implantação segura continuam pendentes.
- Históricos legados não foram certificados nem promovidos. Não há migração educativa
  automática, união de sessão anônima à conta ou recuperação de cookie perdido.
- Elegibilidade por família é conservadora; política de aprendizagem com novas tentativas
  espaçadas requer estudo futuro, sem contabilizar memorização como evidência independente.
- Snapshots suportam replay desta versão. Mudanças futuras de grade/prior/modelo exigem
  migração versionada própria. Não misturar calibração de configurações diferentes sem estratos.
- Banco único SQLite, único processo de serviço no ensaio; sem teste de carga distribuída,
  múltiplas instâncias, backup/restauração operacional ou migração de um banco real de produção.
- O teste de tela monta a tela real com conta e seleção de fixture. Não cobre todos os
  percursos do aplicativo, dispositivos móveis, interrupção de rede ou todas as telas do simulado.
- Não existem novas respostas reais do Gabaritei nesta entrega. Não há aprovação pedagógica,
  treinamento novo, demonstração de ganho educacional nem recomendador unificado final.
- A tela antiga do laboratório não autentica com token; APIs ficaram indisponíveis por padrão.
  Isso é uma restrição de acesso intencional, não uma implementação da futura tela de administração.

## 8. Reproduzir e revisar

Leia `REPRODUCAO.md`, `AUTENTICACAO_FUTURA.md` e `POLITICA_TOP5_FUTURA.md`.
Os logs completos ficam em `evidencias/`. O pacote preserva a base de código inteira
sem `.git`, bancos locais, credenciais ou ambientes instalados. Existe também um overlay
com apenas alterações, um patch dos arquivos já rastreados e manifesto de hashes.
A publicação fica a cargo do usuário após revisão. Não há novo hash de commit desta fase.
