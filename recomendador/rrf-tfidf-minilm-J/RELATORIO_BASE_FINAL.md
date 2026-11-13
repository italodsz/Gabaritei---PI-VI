# Migração para a base final — 13/11/2026

> Registro da preparação em `recomendador-base-final`. A integração posterior na
> main está descrita em `../../INTEGRACAO_MAIN.md`. As pendências humanas continuam abertas.

## Base

Fonte congelada: branch dataset, commit e6712a8, Dataset/base_trabalho.
Copiados sem transformação questions.jsonl e ids_elegiveis.json. SHA-256 conferido:
`6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f`.
Nenhum arquivo da branch dataset foi alterado.

Antes: 2.971 registros, 2.063 elegíveis (1.801 treino, 136 validação, 126 teste).
Depois: 3.086 registros, 2.731 elegíveis (2.382 treino, 175 validação, 174 teste).
O carregador legado deixou de exigir contagens fixas; preserva as verificações de
IDs únicos, composição dos splits e isolamento das famílias.

Nove IDs antigos não existem na base final (remoção das versões adaptadas documentada
no README do dataset):

- gq_053cef1eadda732d756e224f
- gq_0ca35992cee4d0404c69cc2c
- gq_43af5e0298b07a51facf3218
- gq_52354dffa0cf4a5a24a74a46
- gq_5ee286b3a6bb12356cd757c3
- gq_837a844ed0ca7c39ff0303e9
- gq_98b71afcfadc707111984efc
- gq_a691bb3047c6a701effb18bd
- gq_f8f72f54cff2ecccfac8b197

Auditoria detalhada: resultados/base_final/auditoria_base.json. O utilitário
migrar_base_final.py reproduz a cópia e a auditoria usando a origem do recomendador
congelada em a7b5b8c e o dataset em e6712a8. Arquivos auxiliares contendo as questões
inteiras por área ficam ignorados pelo Git; os IDs e as decisões estão versionados.

## Texto e consumidores

- Base copiada e conferida.
- Texto atualizado: enunciado, descrições com flag booleana true na ordem original,
  alternativas ordenadas pelo rótulo; todas as partes passam por clean.
- Teste reproduzível: verificar_texto_base_final.py. Exemplos completos de Tardelli,
  Maritaca, ledor e questão sem imagem em resultados/base_final/exemplos_texto.md.
- Auditoria dos consumidores: recomendador.py, gerar_vetores_qwen.py,
  atualizar_qwen_parcial.py e os três scripts do classificador chamam question_text.
  sinais.py contém extratores especializados: comando (última frase e alternativas),
  formato (alternativas), nomes, gênero, época e escala. Foram preservados para não
  mudar os pesos/sinais do método congelado nesta migração; as descrições entram
  integralmente nas representações principais TF-IDF, MiniLM e Qwen.
  A construção padrão de Sinais também deixou de montar a matriz experimental
  resposta, que lia o gabarito embora não integrasse a receita oficial. Uma tentativa
  de solicitar esse sinal agora é recusada. verificar_sinais_sem_gabarito.py confirma
  que nenhum desses campos é acessado durante a construção dos sinais.
- 165 descrições elegíveis ao recomendador têm text_scope de texto completo
  reescrito do caderno do ledor, sem alternativas; são incluídas conforme solicitado.
- Arquivos com NAO_ABRIR no nome não foram consultados.

## Classificação e conferência

Foram encontradas 681 elegíveis sem rótulo na classificação anterior: 283 MT,
170 CN, 63 CH e 165 LC. Cada uma foi lida com enunciado, descrições marcadas e
alternativas, e recebeu decisão e justificativa em decisoes_MT.tsv, decisoes_CN.tsv,
decisoes_CH.tsv e decisoes_LC.tsv, em resultados/base_final. Não foi usado o
classificador automático para preencher os rótulos.

Decisões novas acrescentadas ao fim da classificação manual, em quatro commits por
área. Entre elas, 65 defeitos: 46 MT, 11 CN, 1 CH e 7 LC. Receberam no nulo;
os motivos estão em obs. As demais receberam nó específico da mesma área da prova.
Os rótulos ainda precisam de conferência humana: leitura individual não equivale a
uma medição independente de acurácia. Casos de fronteira estão anotados em obs.

Das antigas que continuam elegíveis, 244 tiveram algum campo textual alterado:
165 ficaram com o mesmo texto de busca após normalizar marcação e 79 tiveram
diferenças efetivas lidas. Onze decisões antigas foram alteradas: nove mudanças de
assunto por troca de conteúdo e dois bloqueios por descrição insuficiente.
Detalhes e diferenças: resultados/base_final/revisao_antigas.json.

As questões MT de 2018 q160, q168 e q177 foram conferidas com as alternativas novas:
gq_201c1d3d948a07c720ae929f (média do pictograma),
gq_49e02d15d073c464f0588987 (interpolação afim) e
gq_dc616200f8229abbc6a00107 (porcentagem total vacinada). Foram classificadas entre
as novas elegíveis. Nenhuma exigiu alteração do dataset.

Zero elegíveis sem decisão; 67 bloqueadas por defeito no total. Não foram encontradas
duplicatas exatas do texto de busca entre os elegíveis; os bloqueios de duplicatas
preexistentes e a exclusão/deduplicação de famílias permanecem no método.

Amostra para o grupo: classificador/saida/amostra_conferencia_base_final.csv.
Semente 20261113, sorteio proporcional por maiores restos: 42 MT, 25 CN, 9 CH e
24 LC, embaralhadas após sorteio por área. A coluna conferência ficou vazia.

## Problemas encontrados no dataset

Nenhuma questão foi editada. Os bloqueios incluem tabelas sem valores, enunciados
sem comando, alternativas truncadas ou duplicadas, descrição de outra questão,
gráficos sem coordenadas e respostas incompatíveis com os números transcritos.
Cada ID e motivo consta em obs e no mapa de alertas atualizado.

Exemplos: gq_d98826f00c663b2acc7338b8 (comando ausente),
gq_cbb55dd3f9b3112e7a7e1f69 (equações das alternativas truncadas),
gq_889f9373563ffc0e945ad206 (duas alternativas corretas idênticas),
gq_96332204d78f9b567d129b92 (potência pedida não está nas alternativas),
gq_01b5eaca21b50f3a342fdf87 (descrição de maternidade anexada à tirinha em inglês).
Há ainda ressalvas que não impedem identificar a tarefa, anotadas nas decisões:
nome antimônio associado a 50 prótons, isotermas na descrição de um ciclo cujo quadro
informa adiabáticas, equações corrompidas e erros menores de transcrição.

O topo do README do dataset ainda dizia que gq_29b02702604175cb29267886 estava
bloqueada, mas a seção "Pendências, lote 2" já registrava a liberação da catalase.
A revisão posterior confirmou que o registro e a lista de elegíveis estão corretos;
o topo da documentação foi atualizado na integração. A fórmula/unidade kW por hora e a grafia garantido-lhes
permanecem como na prova, conforme a revisão documentada do dataset.

Os alertas antigos foram atualizados para não perpetuar defeitos já corrigidos.
Histórico dos removidos e mapa atual: resultados/base_final/auditoria_alertas.json.
Os 67 defeitos da classificação são excluídos pelo método; duas ressalvas da prova
original continuam como avisos. Não houve ajuste de pesos ou escolha com o teste.

## Índices, catálogo e avaliação

TF-IDF e MiniLM reconstruídos com construir --recodificar. MiniLM usa a revisão
e8f8c211226b894fcb81acc59f3b34ba3efd5f42 de
sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2, com blocos e sobreposição
da configuração existente. TF-IDF ajustado exclusivamente aos 2.382 IDs do treino.

Qwen executado em CUDA, RTX 4060 Ti de 8 GB, NF4 4 bits, dupla quantização,
compute float16, instrução conceito e limite de 8.192 tokens. O lote padrão de quatro
foi interrompido por lentidão antes de salvar vetores; a execução foi reiniciada com
--lote 2, opção prevista no script, preservando a configuração do modelo.
A variante sem instrução gerada pelo script fica ignorada; somente os vetores
anteriormente versionados entram nos commits.

Comandos usados, na pasta do recomendador, com o ambiente existente:

```powershell
python -X utf8 recomendador.py construir --recodificar
python -X utf8 gerar_vetores_qwen.py --quantizar-4bit --lote 2
# Após registrar o novo SHA-256 em recomendador.py:
python -X utf8 recomendador.py exportar
python -X utf8 recomendador.py avaliar
python -X utf8 auditar_entrega_base_final.py
python -X utf8 avaliar_base_final.py depois
```

A avaliação padrão passou a incluir titulo e titulo_area; antes só media os métodos
mais antigos. O exportador passou a incluir matéria, título, assunto e bloqueios
também nos metadados do titulo_area, como já fazia para titulo/arvore.
Essas correções não alteram os escores nem a receita de ordenação.

### Resultado verificado

- Catálogo: 2731 questões, até 50 sugestões por lista.
- Listas vazias: 68 (67 por defeito de texto e uma sem candidato compatível após os filtros).
- Mediana do tamanho: 45; menor lista não vazia: 7.
- Nenhuma sugestão é a própria questão, da própria família, de família já sugerida,
  marcada com defeito ou duplicata, de outra matéria/título ou de língua incompatível.
- Alinhamento exato de IDs nos documentos, MiniLM, TF-IDF e Qwen; vetores finitos,
  com dimensões esperadas e normas próximas de 1. Novo ajuste independente do TF-IDF com
  somente o treino reproduziu o vocabulário e os valores IDF exatamente.
- Qwen SHA-256: `10f44a7935e23b9922305cbe9ded397e74f10619adc90e0826858834e410d1c5`.
- Ambiente e hashes de todos os índices: resultados/base_final/ambiente_indices.json.
- Auditoria completa: resultados/base_final/auditoria_entrega.json.

A lista vazia sem defeito é gq_1a3a6d4a138f7ba1fba29cef (2009, questão 69):
o texto de Lúcio Cardoso e o rótulo herdado são de Literatura/Modernismo, mas a base
informa área CH. O filtro de área não encontra outra questão desse título em CH.
O README do dataset documenta que essa é a área oficial da prova em 2009. O registro
foi preservado; não se forçou um assunto de Humanas nem se retirou o filtro do método.

O encode de Qwen normaliza em baixa precisão e grava float32. Suas normas ficaram
entre 0.9963663 e 1.0039026;
os vetores anteriores variavam de 0,9964104 a 1,0038823. Todas as coordenadas novas
são representáveis em bfloat16. Foi usada tolerância absoluta de 0,005 na auditoria
do Qwen e 0,00002 no MiniLM. Nenhum vetor foi renormalizado depois da geração,
preservando o comportamento de produto escalar do método anterior.

### Validação de desenvolvimento

| Método | Antes | Depois |
|---|---:|---:|
| tfidf | 30/44 | 29/44 |
| minilm | 24/44 | 23/44 |
| rrf | 33/44 | 33/44 |
| qwen | 39/44 | 39/44 |
| rrf_qwen | 39/44 | 41/44 |
| arvore | 40/44 | 41/44 |
| titulo | 9/10 | 9/10 |
| titulo_area | 8/10 | 8/10 |

O README histórico registra RRF 34/44, TF-IDF 30/44, MiniLM 24/44 e rrf_qwen 39/44.
A reprodução no código de a7b5b8c deu RRF 33/44, TF-IDF 30/44, MiniLM 24/44 e
rrf_qwen 39/44. Essa diferença do RRF foi registrada, sem alterar a evidência antiga.
O README não publicava resultado nesses pares para titulo_area; foi medida a origem
com o mesmo método: 8/10. O filtro de título elimina candidatos de muitos pares,
por isso 10 não é diretamente comparável a 44. Mudanças de denominador também
impedem interpretar a tabela como ganho isolado de ordenação.

Pares de desenvolvimento afetados: 13 linhas, listadas em
resultados/base_final/pares_desenvolvimento_afetados.json. São listados separadamente
IDs fora das elegíveis e textos alterados; nenhuma nota foi modificada.

Comparação sem notas: resultados/base_final/comparacao_20_validacao.md apresenta
20 questões de 2023 sorteadas com semente 20261113 e os cinco primeiros IDs antes
e depois, lado a lado, indicando mudanças e sugestões vindas dos resgates.
Questões que não eram elegíveis antes aparecem como sem consulta anterior.
O teste de 2024 não foi usado para selecionar filtros, pesos ou configuração;
seus registros apenas foram classificados, codificados e incluídos no catálogo
conforme o escopo solicitado.

### Entrega e pendências

Branch exclusiva: recomendador-base-final, originada de a7b5b8c. Commits por etapa,
todos com autoria de Ítalo de Souza <italopropriedades@gmail.com>.
Trabalho feito em cópia separada para preservar as alterações locais do clone
original. As branches recomendador, dataset e main não receberam commits nem push.

Pendências do grupo: conferir as 100 linhas da amostra, revisar os defeitos e as
ressalvas no dataset de origem e confirmar casos de fronteira dos rótulos. Essas
pendências não foram preenchidas como se fossem validação humana já realizada.
Nenhuma etapa de índice ou catálogo ficou sem execução.

Para reproduzir a comparação anterior, a partir da raiz do repositório:
`git worktree add --detach ../Gabaritei-base-final-antes a7b5b8c`.
Depois execute `python -X utf8 avaliar_base_final.py antes` na pasta do recomendador.
As demais verificações podem ser repetidas com verificar_texto_base_final.py,
verificar_sinais_sem_gabarito.py e auditar_entrega_base_final.py.
