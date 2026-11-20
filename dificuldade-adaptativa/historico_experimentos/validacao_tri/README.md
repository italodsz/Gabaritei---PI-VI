# Gabaritei · Validação de TRI e experimento incremental

**Decisão: dados suficientes para um protótipo controlado de catálogo e para demonstrar atualização incremental fora do ENEM.** A arquitetura B, com recuperação semântica, TRI conferida e modelo individual, é a hipótese prioritária. A eficácia adaptativa no ENEM ainda precisa de um piloto. Assunto inferido fica separado da camada validada.

## Evidência por questão

O catálogo da revisão `7e720fa876beb7249adab2f05d3ecf33ae5a2c51` manteve SHA-256 `22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5`. Os hashes dos insumos da Fase 1 coincidiram. Foram conferidos 2.971 IDs únicos, 2.063 elegíveis e os tamanhos de treino, validação e teste de 1.801, 136 e 126. O teste de 2024 foi incluído na auditoria de integridade, sem seleção de modelos.

Extraí somente as 16 tabelas oficiais de itens dos ZIPs públicos por intervalos de bytes e verifiquei o CRC de cada entrada extraída. A junção exigiu arquivo anual, código do item, caderno, posição, área e gabarito coincidentes, com chave única. Os valores a, b e c foram comparados com tolerância absoluta de 0,000005. As tabelas, hashes, scripts e logs estão no pacote. O método confirma associação tabular e parâmetros, sem comparação manual de cada enunciado ou recurso com o caderno original. [Microdados do Inep](https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem)

Há 46 itens com pelo menos um alerta exploratório. Dez têm a<0,25, 16 têm |b|>5 e 27 têm c>0,35, com sobreposição. Esses limites são triagem, e não regra de descarte. O item `gq_cf15f16c076fceccbc04a730` de CN 2015, código 53958, caderno 235, posição 70, possui a=0,01929, b=61,05459 e c=0,21513 na própria tabela oficial. Um b extremo em item de discriminação baixa merece cautela na adaptação individual. Nenhuma divergência de parâmetros foi encontrada. O JSON resume distribuições por ano, área, assunto e habilidade. Dispersões diferentes não demonstram escala comum. O modelo TRI tem proficiência e parâmetros próprios por área; comparar áreas ou transferir escalas ao ASSISTments exigiria calibração adicional. [Nota técnica TRI](https://download.inep.gov.br/educacao_basica/enem/nota_tecnica/2011/nota_tecnica_tri_enem_18012012.pdf)

Todos os assuntos foram triados lexicalmente com sinais independentes do rótulo atual. Os 52 sinais concorrentes são alertas e podem refletir vocabulário incidental, temas múltiplos ou diferença de granularidade. Seis sugestões para assuntos ausentes estão separadas e sem validação. Preservei o vocabulário de área/assunto/subassunto anterior, que mistura disciplina com tema e ainda precisa de adjudicação. A revisão humana de enunciados, alternativas e figuras permanece pendente para certificar a taxonomia. As habilidades presentes coincidiram com a tabela oficial e a competência foi derivada por área pela matriz. Isso não valida habilidades adicionais nem a fidelidade textual de todas as questões. As 192 habilidades ausentes também estavam vazias nas linhas oficiais ligadas. [Matriz oficial](https://download.inep.gov.br/download/enem/matriz_referencia.pdf)

## Experimento com respostas reais externas

Não encontrei logs individuais do Gabaritei nos insumos locais inspecionados. O CSV público corrigido do ASSISTments passou no SHA-256 já registrado. A documentação autoriza o uso e solicita citação. O CSV não está no ZIP. Usei a filtragem anterior e os grupos disjuntos de 13.905 eventos de 297 alunos no treino e 4.899 eventos posteriores de 26 alunos na avaliação. Cada predição usou apenas histórico anterior daquele aluno e habilidade. O BKT usa parâmetros previamente ajustados no mesmo grupo de treino. Os SGD partiram da mesma regressão logística e receberam dez lotes em ordem. Para cada lote, previram todas as respostas antes da atualização global. A sequência de avaliação externa já foi usada em estudos anteriores, sem seleção de taxas pelo resultado nesta execução. [ASSISTments corrigido e condições de uso](https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data/skill-builder-data-2009-2010)

| Método | AUC | Log Loss ↓ | Brier ↓ | ECE ↓ |
|---|---:|---:|---:|---:|
| Constante | 0,50000 | 0,61000 | 0,20940 | 0,05201 |
| Taxa por habilidade, sem personalização | 0,54120 | 0,62344 | 0,21619 | 0,08003 |
| BKT | 0,60057 | 0,58523 | 0,19798 | 0,04299 |
| BKT + SGD congelado | 0,61736 | 0,57949 | 0,19560 | 0,04002 |
| BKT + SGD, taxa 0,0002 | 0,61888 | 0,57928 | 0,19550 | 0,03429 |
| BKT + SGD, taxa 0,002 | 0,61851 | 0,57975 | 0,19555 | 0,03871 |

As duas taxas alteraram parâmetros nos dez lotes. Ambas perderam em Log Loss para a congelada em quatro lotes. A taxa menor teve melhora agregada pequena, sem teste de significância. A maior piorou Log Loss agregado, embora o Brier tenha melhorado ligeiramente. AUC, Log Loss e calibração medem propriedades diferentes. Os resultados por aluno e habilidade com ambas as classes, curvas de calibração e coeficientes por lote estão no JSON. O ASSISTments não fornece assuntos ENEM equivalentes; não foi produzida uma métrica por assunto.

## Respostas às 24 perguntas

Alta indica contagem ou igualdade verificável neste material. Média indica associação experimental restrita à amostra. Baixa indica hipótese sem validação no ENEM.

| # | Resposta, evidência e limite | Confiança |
|---|---|---|
| 1 | 2.971 TRI preenchidas e estruturalmente válidas. CSV por item | Alta |
| 2 | 2.971 coincidiram com as tabelas oficiais; fidelidade ao caderno ainda não certificada | Alta para junção |
| 3 | 46 com flags heurísticas; nenhum divergente da fonte tabular | Alta para flags |
| 4 | Distribuições por ano e área disponíveis. Escala comum para personalização não demonstrada | Inconclusiva |
| 5 | 2.411 assuntos preenchidos, oriundos de regras | Alta para presença |
| 6 | 52 sinais concorrentes. Taxa real de inconsistência exige adjudicação | Média para triagem |
| 7 | 560 assuntos ausentes. Seis sugestões separadas | Alta |
| 8 | 2.779 habilidades preenchidas e coincidentes com o código oficial | Alta para junção |
| 9 | Zero divergências tabulares entre habilidades presentes; não foi feita adjudicação pedagógica de todos os itens | Alta para junção |
| 10 | 192 habilidades ausentes tanto no catálogo como nas linhas oficiais ligadas | Alta |
| 11 | Zero no cruzamento estritamente certificado, pois falta revisão de assunto | Alta para cobertura |
| 12 | 1.331 itens de treino elegíveis com TRI e habilidade conferidas, assunto preenchido sem alerta lexical e TRI sem alerta. Assunto fica como atributo não certificado | Alta para filtro |
| 13 | Nenhum histórico do Gabaritei encontrado. ASSISTments disponível | Alta no recorte local |
| 14 | Suficiente para prova prequential externa; 26 alunos de avaliação limitam inferência e transferência | Média |
| 15 | Híbrido BKT + SGD tem a melhor perda probabilística nesta comparação. O ganho da atualização de taxa baixa é pequeno | Média |
| 16 | Dois candidatos mudaram pesos em dez de dez lotes | Alta |
| 17 | Melhora agregada marginal para taxa baixa; taxa alta perde em Log Loss | Média |
| 18 | Quatro lotes por taxa perderam para o congelado em Log Loss | Alta nesta execução |
| 19 | Estimar acerto por logística treinada sobre histórico e estado BKT, acrescentando item/TRI somente após calibração no domínio | Hipótese de piloto |
| 20 | Filtrar preferência, novidade e relevância, estimar desafio e testar faixas por política, com abstenção em pouca evidência | Hipótese de piloto |
| 21 | Trocar IDs, versão e relevância; consultar catálogo; devolver probabilidade, incerteza e ranking | Contrato proposto |
| 22 | Faltam revisão de assuntos, validação textual e visual completa, escala por domínio e eventos ENEM | Alta |
| 23 | B é a primeira arquitetura a testar, C é extensão e A é fallback e controle | Evidência indireta |
| 24 | Aprovar protocolo, revisar amostra e coletar eventos ENEM; executar piloto antes de promover | Plano |

## Política progressiva e contrato

Em itens **já apresentados** no ASSISTments, a taxa 0,0002 atribuiu probabilidade entre 65% e 80% a 3.326/4.899 eventos, com 76,31% de acertos observados. Na faixa 60%–85%, foram 3.936 com 75,64%. Isso mede cobertura e acerto condicional nos itens registrados. Não simula escolher outro item nem mede aprendizagem. No piloto, comparar as duas bandas com controle não personalizado, por aluno, com métricas de ganho, falso alerta, cobertura e repetição.

Entrada proposta do módulo adaptativo: `question_id`, `dataset_revision`, relevância semântica, área e preferências. Enriquecer pelo catálogo com TRI observada e vínculo, habilidade e procedência, assunto provisório e família. Rejeitar revisão incompatível e evitar questões vistas. Saída: IDs ordenados, probabilidade quando calibrada, incerteza, dificuldade sugerida, justificativa e versão. Aceite explícito é necessário para mudar a escolha. Registrar exposição, alternativas disponíveis, evento, horário, primeira tentativa, acerto, sugestão, aceite e versões. Em histórico escasso, preservar escolha e abster-se. Promover SGD somente após comparação temporal em sombra e preservar rollback. BKT altera estado individual após resposta; SGD altera parâmetros treináveis em lote.

A tem custo menor e serve de referência, mas classificação textual de dificuldade não personaliza por si só. B aproveita TRI tabular conferida e reduz a dependência de estimativa textual, com custo moderado e necessidade de respostas ENEM. C adiciona fallback textual, metadados e atualização global; tem mais superfícies de deriva e precisa provar ganho por ablação. Nenhuma comparação em produção foi executada. O recomendador de Ítalo pode fornecer candidatos sem receber históricos brutos; sua implementação ficou fora.

## Reprodução e inventário

O pacote inclui tabelas oficiais de itens, auditoria por questão, alertas, sugestões, pendências, subconjuntos, resultados prequential, três testes e logs. Os ZIPs de auditoria citados não estavam presentes na raiz no início desta rodada. Foram usados os artefatos locais correspondentes e a cópia oficial verificada. Prepare a base e o ASSISTments pelo README anterior. Execute da raiz com Python 3.14, pandas 2.3.3, NumPy 2.4.3, SciPy 1.17.1 e scikit-learn 1.8.0:

```powershell
$a = @('base-oficial/Dataset/base_trabalho')
Get-ChildItem inep_tabelas/ITENS_PROVA_*.csv | ForEach-Object { $a += @('--tabela',$_.FullName) }
python -B dificuldade-adaptativa/validacao_tri/auditar.py @a
python -B dificuldade-adaptativa/validacao_tri/incremental.py assistments.csv
python -B -m unittest discover -s dificuldade-adaptativa/validacao_tri -v
```

O script `obter_tabela.py` reproduz a extração seletiva. A primeira execução da auditoria falhou por colisão da variável de referência; o primeiro teste falhou por importação circular entre arquivos de mesmo nome. Corrigi ambos e reexecutei. O manifesto cobre a entrega.
