# Respostas da auditoria e rastreabilidade

Confiança alta refere-se a contagem ou recálculo neste catálogo. Confiança média refere-se a uma associação descritiva nesta amostra. Confiança baixa indica hipótese sem teste controlado. A classificação de hipóteses está na última coluna.

| # | Evidência e fonte | Confiança, limite e conclusão | Próxima ação |
|---|---|---|---|
| 1 | `completude.csv`: 2.969 com texto, cinco opções e gabarito consistente; 2.239 também com assunto e habilidade | Alta para preenchimento, sem confirmação pedagógica. Confirmada | Revisar os campos antes de ampliar o conceito de completo |
| 2 | Fase 1 e CSV: 1.801 treino, 136 validação, 126 teste elegíveis; zero rótulos de conteúdo certificados neste pacote | Alta no recorte textual. Confirmada | Manter split e certificar amostra de conteúdo |
| 3 | JSON: 2.971 com a,b,c | Alta para presença, confiabilidade individual inconclusiva | Conferir vínculos com os microdados |
| 4 | CSV: 560 sem assunto/subassunto, 192 sem habilidade, disciplina explícita e histórico individual ausentes | Alta. Confirmada | Documentar ausências e coletar eventos |
| 5 | Scripts: híbridos usam assunto/habilidade. Encoders de base não usam | Alta. Confirmada | Separar efeitos de cada entrada |
| 6 | BERT, sem assunto 14/24 e com 64/112 | Média para amostra; sem associação forte nem causalidade. Não sustentada como causa direta | Comparar metadados revisados nos mesmos IDs |
| 7 | CSV pareado: BERT sem truncagem. mDeBERTa 47/87 versus 25/49 erros | Média; efeito causal inconclusivo | Ablação de janela no mesmo modelo |
| 8 | Classe média: BERT 8/42 e mDeBERTa 1/42 | Alta para os dois modelos. Confirmada | Testar ordinal e regressão |
| 9 | JSON: 48 erros compartilhados entre os dois modelos pareáveis | Alta para dois; todos os modelos inconclusivo | Salvar predições completas dos demais |
| 10 | 13/42 médias próximas do corte. Erros para ambos os lados | Parcialmente sustentada como classe difícil, causa inconclusiva | Comparar margem TRI, ordinal e b contínuo |
| 11 | 16 erros graves, nenhum truncado, quatro próximos do corte | Causa individual inconclusiva. Truncagem não sustentada | Revisão cega dos 16 itens |
| 12 | Distribuições TRI por ano e área variam | Comparabilidade psicométrica inconclusiva | Conferir origem e calibração |
| 13 | 30/136 mudam com tercis por área | Confirmada a sensibilidade. Adequação pedagógica inconclusiva | Fixar objetivo e comparar alvos em treino interno |
| 14 | Pré-auditoria cega e exemplos de conflito | Ruído parcialmente sustentado. Taxa de erro inconclusiva | Dupla revisão e adjudicação |
| 15 | Alternativas excluídas nos congelados e recursos visuais ausentes da entrada de todos | Limitação de entrada confirmada | Medir perda de informação pareadamente |
| 16 | Perda de tokens varia por encoder. BERT preserva texto, mas tem erros graves | Adequação geral inconclusiva | Comparar apoio/comando/opções |
| 17 | Apenas 1.801 itens para treino e 136 para validação | Evidência inconclusiva sobre suficiência por arquitetura | Curvas de aprendizagem e validação temporal interna |
| 18 | Validação de 2023 reutilizada na seleção, teste 2024 consultado antes | Insuficiência para conclusão independente confirmada | Reservar conjunto posterior |
| 19 | Checkpoint BERT 0,5223 e IC anterior contra MiniLM inclui zero | Vale seguir como candidato, superioridade inconclusiva | Replicar com controle de texto e seed |
| 20 | MiniLM 0,4710, Qwen 0,4548, BGE 0,4350 em artefatos | MiniLM é referência leve; efeito de menor truncagem inconclusivo | Reutilizar caches e avaliar sob entradas equivalentes |
| 21 | Ridge anterior perdeu F1, mas preserva alvo contínuo | Superioridade não sustentada nesta configuração | Testar Huber e comparar MAE/RMSE e ordinal |
| 22 | Objetivo do projeto e distinção entre item e estudante | Recomendação arquitetural sustentada pelo escopo, eficácia ENEM inconclusiva | Medir acerto individual e adequação no piloto |
| 23 | Catálogo sem sequências individuais | Confirmada a lacuna | Registrar exposição, ordem, acerto, habilidade, preferência e versões |
| 24 | ASSISTments: parâmetros e 904 decisões mudaram, Log Loss piorou | Atualização confirmada, melhoria não sustentada | Avaliar sombra, congelado, deriva e rollback |
| 25 | Evidência combinada de TRI disponível e atualização experimental | B é hipótese prioritária, sem validação ENEM | Piloto B contra A |
| 26 | `plano.md`: 12 experimentos com controles | Resultado futuro inconclusivo | Aprovar critérios e executar só depois |
| 27 | Faltam ligação oficial, rótulos revisados, predições completas e holdout | Lacunas confirmadas no workspace | Resolver proveniência e congelar avaliação |
| 28 | Contrato por ID e piloto temporal | Próxima etapa defensável, sem afirmação de superioridade | Revisar plano antes de autorizar treino |

## Inventário de insumos

- Catálogo, lista elegível, splits, README e avisos da revisão oficial. Os hashes constam em `results/fase_01.json`, e a auditoria os checa antes de extrair dados.
- `results/ft_bert_512_7` e `results/ft_deberta_256_7`: métricas, predições, tokenizers, hashes e deltas. Os deltas foram verificados, sem carregar pesos para treinar.
- `results/fase02r_{minilm,qwen06_cuda,bge_cuda}.{npz,json}`: ordem, limites, comprimentos, vetores e revisões. `fase02r_comparacao.json` contém métricas, configuração e híbridos. Faltam cabeças e predições completas equivalentes por variante.
- `experiments/fase_02_finetune.py`, `fase_02_encoders.py`, `fase_02_comparar.py`, `fase_02_treinamento.py` e `enriquecimento/ablar_encoders.py`: proveniência de entradas, alvos e treinamento.
- `auditoria_rotulos` e `enriquecimento`: matriz, pré-auditoria, ficha cega e ablações, sem validação humana concluída.
- `viabilidade/resultados.json` e `viabilidade/fechamento.json`: evidência inicial e temporal de atualização de parâmetros. O CSV bruto ASSISTments não é necessário para recálculo desta entrega.
- A lista dos ZIPs encontrados e sua integridade consta em `resultados.json`. Pacotes antigos ausentes podem ser substituídos pelos artefatos locais correspondentes quando existirem. O pacote de auditoria contém os arquivos leves de evidência e instruções para localizar os insumos grandes.

## Comparação estatística adicional

`estatistica.py` recalcula, sem treino, a diferença BERTimbau menos mDeBERTa em macro-F1. A diferença foi +0,0970, com intervalo pareado estratificado de +0,0139 a +0,1746, usando 2.000 reamostragens por item e seed 42. Os checkpoints já foram selecionados nessa validação, portanto o intervalo é exploratório. Em itens a até 0,10 do corte, BERT acertou 9/25 e mDeBERTa 8/25. Nos demais, acertaram 69/111 e 63/111. São associações sem controle de área e classe.
