# Gabaritei — como preparar a integração com Ítalo

**Data: 13/11/2026.** Análise de arquitetura e compatibilidade. Nenhuma integração foi publicada ou implantada.

## Resultado

Conseguimos carregar o dataset completo e selecionar questões automaticamente no protótipo local. Para vinculá-lo ao recomendador do Ítalo, precisamos alinhar versões dos dados, significado das faixas de dificuldade, formato das questões e estoque de candidatas. O frontend atual ainda não liga esses componentes por um backend.

## Exclusão solicitada

A branch encontrada no GitHub chama-se **`joao/recomendador-dificulade`**, com grafia diferente de `joao/recomendador-dificuldade`, citada na mensagem. As duas formas foram registradas como excluídas. **Não li o conteúdo, os arquivos ou o histórico dessa branch.** Observei somente seu nome na listagem para aplicar a exclusão.

## O que foi conferido no GitHub

As oito árvores permitidas foram consultadas integralmente, sem truncamento, nas revisões abaixo. Os arquivos executáveis coincidem com os blobs da auditoria de 12/11; a análise anterior foi reaproveitada por identidade de conteúdo, e os pontos de integração foram relidos. Isso não é uma certificação humana linha a linha de todo o repositório.

| Branch analisada | Commit fixado |
|---|---|
| `dataset` | `67a5036b2297c7c2e78b1f011219ca112977d7a5` |
| `dificuldade-adaptativa` | `e00f20c0d534a2bdd1a845d71cb791a16e3f4212` |
| `front-end` | `1ada7f3a2e5f1d80fc9d5c9e08df4aaf2a52c461` |
| `main` | `90d54984c21982c89e0d645ecfa78b1442b813b9` |
| `paridade-p1` | `50060d0f5ff8494226905c2b0c023c84214983a7` |
| `recomendador` | `a7b5b8c9ae8c153c04956d2e1ac3dcdada6a41ef` |
| `recomendador-para-main` | `f9ca200ac92c41c70b13eb9db57f35c8a7972e76` |
| `wardrobe` | `ea3f28d22f805dea191e12130e14a3034099cf43` |

## Como os componentes funcionam hoje

**`main` e `front-end`: experiência visual.** O frontend Canvas usa 254 questões demonstrativas, regras locais e armazenamento no navegador. `learning-engine.ts` reaproveita módulos de `legacy/src`. O servidor é estático; não foi encontrado backend de produção que autentique alunos, corrija respostas e atualize o BKT.

**`recomendador` e `recomendador-para-main`: seleção de questões do Ítalo.** O método oficial documentado é `titulo_area`: mesma matéria e título amplo, com uma receita de ordenação por matéria. Há código Python, índices e catálogo pré-calculado. A saída importante para a integração é uma lista de IDs ordenados por relevância, acompanhada da versão dos dados.

**`dificuldade-adaptativa`: publicação antiga.** A branch contém os nove arquivos da auditoria da Fase 1. O motor BKT e a nova seleção automática estão nas entregas locais; o ZIP não foi publicado automaticamente.

**`dataset`: fonte atual.** São 3.086 questões, das quais 2.563 são elegíveis para uso textual segundo a revisão publicada. A auditoria desta rodada preservou o arquivo original e identificou os motivos de exclusão individualmente.

**`paridade-p1`: trabalho visual histórico.** Usa o frontend Next.js anterior e deve ser preservada. Seus contratos de API não são automaticamente os contratos do Canvas atual.

**`wardrobe`: arquivo de versões.** Contém pacotes e pipelines antigos. Não deve ser incorporada inteira à `main` para tentar unir o projeto.

## O principal problema antes de ligar os módulos

O recomendador do Ítalo usa uma base indexada de **2.971 questões / 2.063 elegíveis**. O dataset atual tem **3.086 / 2.563**. Os hashes são diferentes.

| Comparação | Resultado |
|---|---:|
| IDs brutos presentes nas duas bases | 2.962 |
| IDs brutos novos | 124 |
| IDs brutos removidos | 9 |
| Elegíveis textuais presentes nas duas versões | 2.049 |
| Elegíveis atuais sem representação no índice antigo | **514** |
| Elegíveis antigos que saíram da lista atual | 14 |

Nos IDs comuns, 690 enunciados e 59 conjuntos de alternativas mudaram. Essas mudanças podem incluir formatação, transcrição ou conteúdo; não classifiquei todos esses casos como alterações semânticas. Elas exigem conciliação antes de afirmar que os vetores representam os textos atuais. Gabaritos, habilidades, TRI e famílias não mudaram nesses IDs; houve uma mudança de área.

O catálogo semântico corresponde à própria base antiga, mas **não corresponde à base atual**. Por isso, a mistura direta de versões deve ser recusada. Não atualizei embeddings, índices ou modelos nesta análise.

## Outro problema: “fácil” precisa significar a mesma coisa

O catálogo de Ítalo usa tercis do parâmetro b por área no treino. A nossa demonstração usa faixas relativas locais de ano/prova/área. Essas classificações podem atribuir faixas diferentes ao mesmo item.

O integrador precisará receber uma versão explícita de dificuldade, a escala TRI e o b do item. Não basta juntar os módulos porque ambos devolvem as palavras “fácil”, “média” e “difícil”. O percentual do BKT continua sendo um estado do aluno; não é convertido diretamente em b.

## Onde conectar no frontend

`QuestionRepository`, em `frontend/legacy/src/lib/repositories/questionRepository.ts`, é um ponto de entrada para substituir o acervo demonstrativo. Ele expõe `all`, `getById`, `getMany`, `query` e `search`.

Entretanto, trocar só esse repositório é insuficiente: os reducers de sessão acessam `QUESTION_BY_ID` diretamente e corrigem respostas pelo gabarito no navegador. Esses acessos precisam ser conciliados. Para a integração real, a correção deve ser autorizada pelo servidor e vinculada a uma tentativa canônica e idempotente.

Também precisamos adaptar áreas (`MT` → `matematica`, por exemplo), alternativas (`label` → `letter`), língua e campos de taxonomia. O frontend exige matéria, assunto e resolução em situações nas quais o dataset pode não ter informação confiável. A solução deve aceitar “desconhecido” ou “resolução não cadastrada”, sem inventar rótulos ou explicações.

## Fluxo proposto

1. O estudante responde uma questão.
2. O backend autentica, corrige e registra a tentativa com versões e contexto.
3. O módulo de dificuldade atualiza o estado e retorna uma sugestão ou abstenção.
4. O estudante aceita, recusa ou escolhe manualmente a faixa.
5. Ítalo fornece as candidatas semanticamente relevantes, em ordem.
6. O integrador filtra validade, língua, repetição, escala e faixa aceita, **preservando a ordem semântica**.
7. O sistema entrega a questão ou informa que não há estoque compatível.

O arquivo `CONTRATO_RASCUNHO.json` detalha os envelopes e a proteção de versão. É uma proposta para revisão, não uma API já implementada.

## Estoque precisa ser contado depois de combinar os filtros

Ter milhares de questões no catálogo não garante várias candidatas do mesmo título, escala e faixa. Uma projeção estrutural usando apenas os IDs do ranking antigo encontrou, em 2.029 consultas ainda identificáveis:

- 384 consultas sem candidata na mesma escala.
- Mediana de duas candidatas na mesma escala.
- Muitas combinações de consulta e faixa sem nenhuma candidata.

Essa projeção **não aprova o ranking antigo para o dataset novo**, pois os hashes diferem. Ela não mede precisão ou aprendizagem; apenas aponta um risco que precisa ser testado novamente com dados alinhados.

Sem estoque, o sistema deve informar a situação e oferecer opções explícitas. Não deve trocar a dificuldade, ampliar o assunto ou misturar escalas silenciosamente.

## Próximos passos concretos

1. Acordar uma revisão única de dados e uma classificação de dificuldade versionada.
2. Planejar a atualização das 514 questões ainda não indexadas e dos textos modificados, preservando versões antigas. A execução dessa atualização depende de autorização específica.
3. Conciliar o contrato de questões reais com o Canvas e remover acessos diretos aos fixtures nos fluxos integrados.
4. Preparar a camada de backend para autenticação, correção, eventos, idempotência, histórico e consentimento.
5. Fazer o adaptador entre a lista ordenada de Ítalo e a decisão de dificuldade, com verificação de estoque após todos os filtros.
6. Só então realizar teste ponta a ponta e piloto real autorizado.

O BKT permanece externo e experimental no ENEM. A atualização individual de estado não é comprovação de aprendizado contínuo global ou domínio certificado.

## Evidências e limites

`compatibilidade.json` contém as diferenças medidas; `projecao_estoque_por_query.json` contém os resultados por consulta; `snapshot_permitido.json` e `escopo.json` registram as árvores e a exclusão; `verificacoes_integracao.json` registra as verificações de compatibilidade. O anexo técnico contém detalhes adicionais e links para os arquivos do GitHub.

Não houve commit, push, merge, publicação, treinamento ou implementação do backend nesta rodada. A análise prepara uma integração revisável; não declara a Fase 2 aprovada.
