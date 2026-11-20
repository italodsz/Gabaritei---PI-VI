# Gabaritei — Fase 4B: implementação TRI + titulo_area

18/11/2026. **Entrega para auditoria independente; fase não declarada aprovada.**

## Resultado executivo

Foi implementado um seletor unificado no backend, conectado à aba **Para você** da
prática. Ele recupera candidatas do titulo_area real, usa a distribuição TRI da área,
consulta exposições oficiais, evita famílias já apresentadas e retorna até cinco itens.
A abertura da questão completa gera uma exposição persistente e reutiliza a tentativa
da Fase 4A. A correção, o mínimo de oito segundos, os recibos, o controlador e a
calibração continuam no fluxo de integridade existente.

O catálogo original não continha escores. Um exportador de inferência reutilizou a
classe `Indice.ranking(..., 'titulo_area', galeria='todas')` do Ítalo, com vetores e
índices já existentes, e materializou **107.985 pares para 2.731 referências**. A ordem
reproduziu exatamente todas as listas do catálogo. Não foi gerado embedding novo,
feito fine-tuning, treinado modelo ou chamado serviço remoto.

**98 testes Node passaram**: os 84 da 4A preservados e 14 novos. Passaram ainda três
testes Python e a integração HTTP do worker semântico; os roteiros Chrome da 4A e do
aplicativo completo 4B também passaram. A sonda real retornou cinco candidatas em
cada uma das quatro áreas e três em um assunto com escassez.

Esses resultados são funcionais. As respostas/perfis de teste são sintéticos,
identificados como fixtures. Não demonstram eficácia pedagógica, qualidade estatística
de calibração ou acurácia de recomendação em estudantes reais.

## 1. Inspeção, fontes e versões

- Base Git: `recomendador-dificuldade@f7ce6aca633f2543e0d8be18ae1a5a898a4ac929`.
- A consulta remota da branch de origem ainda retornou esse hash; main retornou
  `4ac05808105949ae9d086c3413380b3e86ed7435`. Nenhuma branch remota foi modificada.
- Continuidade efetiva: ZIP `Gabaritei_Fase_4A_Integridade_TRI.zip`, SHA-256
  `938a25997659b893abf289a225dfcb37b17dd51155b6606f3765a9de5840915d`.
- Os 218 arquivos do projeto do ZIP foram comparados por hash antes de iniciar.
- Branch criada somente localmente: `fase4b/recomendador-unificado`.
- Não houve commit, push, merge, pull request, deploy ou avanço para Fase 5.
- A branch excluída pelo usuário, `joao/recomendador-dificuldade`, não foi analisada.

Foram consultados o relatório comparativo da Fase 2, o desenho da Fase 3 e os
relatórios/código da 4A disponíveis no workspace. As conclusões anteriores não
foram convertidas em validação estatística nova. A 4A foi incorporada integralmente.

Na primeira cópia de trabalho, uma exclusão genérica de pastas `dados` removeu
indevidamente também metadados semânticos; três testes dev falharam. A cópia foi
corrigida antes de implementar a 4B, os 218 hashes conferidos e a linha de base
passou com 84/84. Ambos os logs estão preservados. Não foi alterada a lógica dos
testes para contornar essa falha de preparação.

### Arquitetura encontrada

| Componente | Arquivo/artefato | Função |
|---|---|---|
| Acervo | backend/acervo.mjs | Hashes, IDs canônicos, metadados e triagem |
| TRI | frontend/dificuldade.js e config/dificuldade_v1.json | 3PL, distribuição EAP em grade, incerteza, atualização por área |
| Controlador | registrarAcerto no motor TRI | Estado de janela/meta dos fluxos existentes |
| Integridade | backend/integridade.mjs | Apresentações, recibos, eventos, perfil oficial, replay e calibração |
| Semântico | recomendador/rrf-tfidf-minilm-J | TF-IDF, vetores, RRF e sinais/receita por matéria |
| Persistência | backend/db.mjs | SQLite com migrações e transações |
| Interface | config-studio, learning-pages, practice-screen | Seleção, sessão, resolução e feedback |

O campo `tri` só é exposto ao motor quando a aplicação regular/formato padrão e a
triagem existente aprovam os parâmetros. O θ é da área, não do assunto. A distribuição
usa grade de 161 pontos, de −4 a 4, D=1 e pesos originais de prática/simulado. Isso
não é média de acertos e não é um novo BKT.

## 2. Dataset e compatibilidade

Nesta versão: 3.086 registros brutos; 2.731 elegíveis textuais; 2.657 liberados para
prática; 1.885 com TRI triada. Não misturar com a versão histórica de 2.971 questões.

- ID canônico: `gq_...`, comum a dataset, catálogo, documentos dos índices e app.
- Família de conteúdo: usada para impedir novidade artificial por duplicação de caderno.
- Parâmetros: `tri.a`, `tri.b`, `tri.c`; valores ausentes/reprovados não são inventados.
- 772 questões de prática sem TRI triada continuam nos fluxos anteriores de estudo,
  mas não entram na seleção unificada que exige adequação TRI calculável.
- `topicId` vincula o título amplo e a matéria do catálogo à taxonomia da interface.

Hashes preservados:

| Artefato | SHA-256 |
|---|---|
| Dataset | 6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f |
| Catálogo | c754d4a3a96375849a3954501f2f162aadd0b1da080b4c469639cb9604204fcb |
| Escores novos de inferência | 5e5020339d05ef4786736b2f1bda74ac51bb33401b3ea495fdd5c20c0d01ae77 |

O teste de correspondência verifica todos os IDs/escores do catálogo. A integração
confere que área, título, família e TRI de cada item retornado pertencem ao mesmo ID.
Os módulos originais do recomendador e os arquivos de dataset não foram modificados.

## 3. Integração semântica real e seus limites

A receita titulo_area utiliza os vetores Qwen3-Embedding-8B-4bit, instrução `conceito`,
TF-IDF e sinais definidos por matéria em busca_por_area_v1.json. O índice MiniLM
multilíngue L12-v2 também existe e é usado no diagnóstico, mas sua simples presença
não significa que participe com peso não zero de toda receita titulo_area.

O TF-IDF já estava ajustado ao treino; os vetores vieram dos encoders preexistentes.
A configuração declara `fine_tuning_neural=false`. A procedência dos arquivos,
receita, fontes e matrizes tem hashes no artefato novo. Esta fase apenas executou
inferência da rotina original sobre esses índices, sem reconstruí-los.

O escore RRF é uma soma de contribuições por posição, com k=60 e pesos por matéria;
não é uma probabilidade, nota escolar ou medida calibrada entre assuntos. Algumas
matérias priorizam primeiro o mesmo assunto da árvore e só depois o RRF. Por isso
preservamos **escore bruto e posição original** separadamente.

Para selecionar um título/assunto, o serviço encontra seu grupo exato na taxonomia
e escolhe deterministicamente uma referência existente com a maior lista do catálogo,
com desempate por ID. A API também aceita uma questão de referência explícita.
Não há encoder de consulta livre instalado para novos textos: um título desconhecido
é recusado, em vez de produzir um embedding fictício ou usar uma busca substituta.

A galeria de produção congelada inclui todos os elegíveis, como já fazia o catálogo.
Isso é inferência operacional, não avaliação independente em holdout. A rotina dev
continua reservando as consultas do teste no diagnóstico. Não foi medido ganho de
modelo com os dados de 2024.

## 4. Política de seleção implementada

Configuração: `backend/config/unificado_v1.json`. Todos os números abaixo são
**heurísticas de engenharia configuráveis, não parâmetros cientificamente otimizados**.

1. Exigir área e assunto/título ou referência compatível, além de preferência explícita.
2. Recuperar até o limite já presente no catálogo por referência, em geral 50 candidatas.
3. Preservar área, título, qualidade do catálogo, compatibilidade linguística, família
   e TRI triada. Não completar a lista com outro assunto.
4. Consultar apresentações e respostas oficiais por família. Por padrão, usar só inéditas.
5. Para preferências fácil/média/difícil, filtrar pelo rótulo de faixa existente do
   catálogo, derivado de b por área. Não mudar essa escolha no fallback.
6. Para a opção adaptativa, comparar b com θ da área e considerar incerteza.
7. Reordenar por relevância e adequação dentro das etapas da política; desempatar
   pela posição original do catálogo e pelo ID. Deduplicar famílias.
8. Retornar no máximo cinco; se houver menos, informar escassez.

### Cálculo

- Relevância relativa `r = escore_RRF / maior_escore_RRF` do conjunto da referência.
- Componente semântico `S = 0,7*r + 0,3/log2(posição_original+1)`.
- Centro de dificuldade `θ − 0,25`: ligeiro favorecimento de itens mais acessíveis,
  hipótese operacional que ainda precisa de avaliação pedagógica.
- Adequação `A = exp(−(b − centro)² / (2*(1² + dp²)))`.
- Fator de evidência `C = min(1,n/15) * min(1,0,6/dp)`.
- Escore combinado `(0,4*S + 0,6*C*A)/(0,4 + 0,6*C)`.

Não há probabilidade-alvo fixa de 75% nessa seleção. A probabilidade 3PL integrada
é retornada como informação provisória, sem ser o alvo da ordenação. O controlador
anterior permanece atualizado no fluxo 4A, para compatibilidade dos fluxos legados;
o seletor 4B não usa sua meta/pstar nem foi apresentado como controlador otimizado.

Com n=0, C=0: a ordem inicial usa conteúdo e novidade, sem inventar domínio individual.
Com menos de 15 respostas o estado é `inicial`. Com mais evidências e dp alto,
é `incerta`; caso contrário, `estimativa_disponivel`, ainda provisória. O aviso
explicita que 15 respostas não garantem confiabilidade. Esses estados são de produto,
não certificação estatística do diagnóstico.

### Fallback e novidade

Dentro de cada classe de novidade autorizada:

1. Relevância relativa >=0,65 e distância de b ao centro <=1,25.
2. Ampliar relevância até o piso 0,40, mantendo margem 1,25.
3. Ampliar margem de b para 2,50, sem baixar o piso semântico.

No estado n=0 não se impõe margem individual de b: a ordenação é inicial por conteúdo.
Questões apresentadas/respondidas/revisadas só podem completar a lista se o usuário
habilitar explicitamente revisões. Mesmo nesse modo todas as inéditas elegíveis têm
precedência. Revisões continuam inelegíveis como nova evidência TRI.

Nada relaxa área, qualidade, integridade, preferência escolhida ou necessidade de TRI.
O piso relativo e o título não garantem relevância pedagógica de cada par; precisam
ser validados com julgamentos independentes. Não se chamou esse filtro de certificação.

## 5. Histórico, persistência e isolamento

A migração aditiva `0004_recomendacao_unificada` cria:

- `recomendacao_unificada`: sujeito, instante, entrada, resultado ordenado e versão.
- `exposicao_unificada`: recomendação, questão e tentativa pertencentes ao sujeito.

Cada resultado guarda configuração da política, hashes de dataset/catálogo/escores,
hash do perfil utilizado, θ/dp/n, posição original, escores, exclusões e etapas.
A prévia da lista não conta como apresentação completa. A exposição é registrada ao
abrir a questão no fluxo de prática, em transação com a emissão/reutilização da tentativa.

A novidade considera também tentativas dos outros fluxos 4A, não somente desta aba.
Estados: inédita, apresentada sem resposta, respondida e revisada. Reenvio idêntico
retorna recibo e não cria outro evento; portanto não aparece como revisão falsa.
A navegação Anterior reutiliza a tentativa. A leitura do histórico não gera respostas.

O backend determina o sujeito pela sessão de login existente ou cookie opaco de
exercício. Não aceita user_id, θ, n ou histórico enviados ao endpoint novo. A busca
por recomendação e a emissão de exposição exigem propriedade pelo mesmo sujeito.
Duas contas reais de teste comprovaram rejeição de acesso cruzado e separação de
perfil/histórico. Isso não homologa a segurança de toda a plataforma ou autenticação
para produção; papéis administrativos continuam pendentes.

A persistência foi testada com SQLite em disco e reinício do servidor: a recomendação
original foi recuperada, exposições permaneceram e uma nova seleção excluiu a família
já apresentada. O cookie da sessão de teste foi preservado. Não houve teste de carga
multi-instância, restauração operacional ou migração de banco de produção.

## 6. Interface e demonstração

Em Questões → Para você, o aluno seleciona área, assunto do catálogo e preferência.
Um aceite explícito é obrigatório. Revisões têm opção separada, desmarcada por padrão.
São mostradas as candidatas, justificativas, estágio inicial/incerto e escassez.
O estudante abre a lista na tela de resolução existente, espera o mínimo, responde
e recebe a correção do backend. O botão Novas recomendações volta ao painel para
buscar novamente com o histórico atualizado e a preferência mantida.

Nas sessões desta aba, os botões antigos Semelhante/Aleatória foram substituídos
por Novas recomendações: assim não se anexa um item de outro fluxo sem associação
à recomendação auditada. Os botões antigos permanecem nas listas anteriores.
O histórico verificado da aba mostra apresentações, respostas e contagens TRI próprias.
Os gráficos legados de estudo não foram todos substituídos nesta fase.

Capturas reais: `evidencias/reexecucao/ui4b/top5.png`, `questao_apos_minimo.png` e
`historico.png`. O roteiro abriu o aplicativo completo, e não uma tela simulada.

## 7. Testes e resultados

| Grupo | Resultado | Evidência |
|---|---|---|
| Linha de base 4A após preparar cópia correta | 84 aprovados | baseline_4a_corrigido.log |
| Suíte final Node | 98 aprovados, 0 falhas/ignorados | reexecucao/testes.log |
| Índices semânticos/worker original | 3 Python aprovados + HTTP aprovado | reexecucao/worker-semantico.log |
| Integridade 4A | 19 atividades, 1 evidência TRI, 1 calibração; 18 revisões sem alteração | reexecucao/sonda4a.json |
| Novo seletor | 14 testes: perfil, semântica, novidade, escassez, preferências e API | testes/unificado no log final |
| Isolamento | Duas contas: acesso cruzado 404; perfil B n=0 e A n=1 | teste de duas contas no log |
| Reinício | Recomendação e exposições recuperadas; novidade respeitada | teste de SQLite em disco |
| Navegador 4A | Contador, atalhos, retry e Anterior aprovados | reexecucao/ui4a/resultado_ui.json |
| Navegador 4B | Aceite obrigatório, Top5, exposição, resposta, nova seleção e reload | reexecucao/ui4b/resultado.json |
| Escores | 2.731 referências, 107.985 pares; ordem original exata | exportacao_escores.log |
| Validador agregado | Seis execuções, saída 0 em todas | reexecucao/execucao.json |

### Exemplos reais da sonda

Sem histórico individual, a API produziu cinco itens em cada área:

- CN: Ecologia.
- CH: Revoluções, século XIX e século XX.
- LC: Leitura e interpretação.
- MT: Álgebra e funções.

Em Filosofia contemporânea retornou três itens e status de escassez. A prova de
interface em Geometria plana e semelhança abriu o item
`gq_0c6c6e3f100203586e974ae3`, registrou uma exposição e uma resposta; a seleção
seguinte excluiu sua família. As demais prévias continuaram disponíveis por ainda
não terem sido abertas. Isso é intencional, não falha de novidade.

A sonda de comportamento usou distribuições artificiais concentradas em θ=-1,5,
0 e 1,5, com n=80 fictício, somente em função pura. Não importou esses perfis pela API.
O perfil baixo encontrou dois itens dentro dos limites, ambos com b aproximadamente
0,44–0,49; o alto iniciou com b≈1,27 e 1,82. As listas e escores completos estão em
`sonda4b.json`. Não se interpreta n=80 como coleta real nem como treinamento.

### Comparação com antes

| Antes da 4B | Depois da 4B |
|---|---|
| Catálogo com IDs e posições | Escore bruto materializado pela rotina original e posição preservada |
| Endpoint de listas recebe parte do histórico do cliente | Endpoint novo consulta exposições e eventos oficiais |
| Ajuste por alvo de chance no fluxo legado | Política nova usa distância b–θ e incerteza, sem alvo 75% |
| Seleção/aleatório locais em diversos percursos | Aba nova com consulta central, preferência e consentimento explícitos |
| Sem vínculo persistido entre Top5 e apresentação | Recomendação e exposição vinculadas à tentativa oficial |

As rotas e telas legadas continuam existindo. Não se declarou que todos os seus
percursos passaram a usar a nova política ou que toda a autenticação foi refeita.

## 8. Pendências e limites para Fase 5

1. Avaliar probabilidades e recomendações com respostas reais: Brier Score, Log Loss,
   calibração por área/coorte e incerteza, somente após autorização da Fase 5.
2. Definir relevância independente para Precision@K, Recall@K e NDCG@K; não usar o
   próprio seletor como gabarito e não tratar essas métricas como ganho de aprendizagem.
3. Validar pesos, deslocamento −0,25, margens, piso e regra de evidência; nenhum foi
   otimizado ou pedagogicamente homologado nesta fase.
4. Avaliar sessões completas, esgotamento, falsas mudanças, repetição/memorização,
   consentimento e curvas de evolução, comparando regra simples em condições iguais.
5. Validar diagnóstico inicial e mapeamentos de assunto/habilidade com evidência
   qualificada. θ por área não prova domínio por competência ou assunto.
6. A busca textual livre não existe: contexto é uma questão canônica ou título exato
   do catálogo. A referência automática é heurística e pode não representar toda a intenção.
7. Catálogo limitado por referência: em geral 50 IDs; não há garantia de percorrer
   todas as questões do título. O item de referência e sua família não são candidatos.
8. Ampliar cobertura apenas com revisão do semântico original e nova auditoria. Não
   inserir itens desconexos ou inventar TRI quando houver escassez.
9. Continua sem autenticação definitiva por papéis, incorporação segura de histórico
   anônimo à conta, recuperação de cookie perdido, limites de retenção, paginação
   completa de todo histórico e testes de infraestrutura distribuída.
10. Oito segundos comprovam intervalo, não atenção. Exposição indica entrega da
    questão, não leitura comprovada. Apoio externo não observado não pode ser detectado.
11. A qualidade dos textos/imagens e dos metadados herdados limita a relevância. A
    Fase 4B não executou certificação humana do catálogo nem retreinou classificadores.
12. Artefatos semânticos são necessários para auditar/regerar escores. Runtime Node
    usa o cache validado; se estiver ausente ou com hash diferente, falha explicitamente.

Não se calculou calibração estatística em amostra maior, não se iniciou piloto e não
se treinou modelo. A sonda 1/1 é somente uma prova do filtro de integridade.

## 9. Recomendação técnica

A implementação está **pronta para auditoria funcional da Fase 4B**, condicionada
à revisão das limitações e da política heurística documentada. Não se recomenda
chamá-la de modelo pedagogicamente validado nem publicar automaticamente.
A aprovação formal e a autorização da Fase 5 permanecem com o responsável pelo projeto.
