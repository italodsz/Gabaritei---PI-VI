# Gabaritei · Viabilidade de previsão de respostas

## Auditoria dos experimentos de dificuldade

Os registros em `results/fase02r_comparacao.json` e `results/ft_comparacao.json` distinguem dois tipos de treino. MiniLM, Qwen 0.6B e BGE-M3 geraram embeddings congelados. Os classificadores LinearSVC foram ajustados sobre 1.801 questões elegíveis até 2022. Em 136 questões de 2023, obtiveram macro-F1 de 0,4710, 0,4548 e 0,4350. BERTimbau e mDeBERTa tiveram ajuste das duas últimas camadas e da cabeça supervisionada, com 32 tensores do encoder alterados em cada treino completo. Os melhores resultados foram 0,5223 e 0,4254. O intervalo pareado do melhor BERTimbau contra MiniLM incluiu zero.

O protocolo de itens usa 2023 para seleção e preserva 126 itens de 2024. O teste já foi consultado na rodada preliminar e ficou fora das rodadas posteriores. Os hashes e a ausência de sobreposição nas chaves auditadas foram verificados na Fase 1. Nos scripts de treino, o texto e as alternativas são separados dos rótulos TRI. A ausência de sobreposição nessas chaves não exclui paráfrases nem exposição de questões no pré-treino. MiniLM truncou 110/136 enunciados em 128 tokens. BERTimbau 512 acomodou as entradas de validação, mas ainda teve baixo desempenho na classe média. São reutilizáveis a auditoria, o catálogo, os IDs e os pipelines como referências de dificuldade populacional. Nenhum desses resultados mede conhecimento individual.

## Dados públicos

| Base | Disponibilidade e licença | Campos e adequação |
|---|---|---|
| ASSISTments Skill Builder 2009–2010 | CSV corrigido baixado da fonte oficial. A página autoriza uso gratuito e pede citação. Não identifiquei licença padronizada ou termos explícitos de redistribuição. O CSV ficou fora do ZIP. | A cópia baixada tinha 346.860 linhas e 4.217 IDs de alunos. Possui ordem cronológica, aluno, problema, habilidade e acerto na primeira tentativa. Pedir ajuda pode contar como erro. É matemática com política de domínio própria. |
| EdNet KT1 | O repositório oficial lista o download e licença CC BY-NC 4.0. A execução não baixou o arquivo. | A coleção anuncia 131.441.538 interações e 784.309 alunos. KT1 oferece arquivos por aluno, timestamp, questão e resposta. Acerto e habilidades exigem junção com metadados de questões. É preparação para TOEIC, com outra língua, taxonomia e política de aplicação. |

[ASSISTments, descrição de campos e condições](https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data) · [CSV corrigido](https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data/skill-builder-data-2009-2010) · [EdNet, documentação oficial](https://github.com/riiid/ednet)

O ENEM local é um catálogo de itens. Para usar dados estrangeiros como referência metodológica, é necessário harmonizar primeira tentativa, assistência, unidade de habilidade e ordem dos eventos. Parâmetros e calibração para o Gabaritei exigem respostas coletadas no próprio domínio.

## Experimento executado

Filtramos problemas principais com habilidade única e acerto binário, descartamos respostas abertas e deduplicamos aluno e ordem. Restaram 214.417 registros elegíveis. A semente 42 selecionou grupos disjuntos de 500/150/200 alunos com 26.863/7.467/12.363 eventos. Os grupos serviram para treino, atualização e avaliação. A ordem é cronológica dentro de cada histórico, sem corte global por data. Em avaliação, cada previsão usou apenas o prefixo já observado daquele aluno e habilidade. O resultado corrente só entra no estado após a previsão. Este desenho mede previsão da próxima resposta de alunos separados por grupo, sem demonstrar generalização para um período futuro global.

O BKT ajustou quatro parâmetros compartilhados por máxima verossimilhança no treino. O SGD recebeu a previsão BKT, número logarítmico de tentativas anteriores e taxa de acertos suavizada. O SGD atualizado recebeu um lote separado por `partial_fit`. A referência constante usou a prevalência do treino.

| Modelo em 12.363 eventos | AUC | Acurácia | F1 de acerto | Log Loss | Brier | ECE |
|---|---:|---:|---:|---:|---:|---:|
| Constante | 0,5000 | 0,6655 | 0,7992 | 0,6406 | 0,2241 | 0,0389 |
| BKT | 0,6780 | 0,7070 | 0,8002 | 0,5850 | 0,1987 | 0,0294 |
| SGD congelado | 0,6922 | 0,7053 | 0,7987 | **0,5793** | **0,1968** | **0,0234** |
| SGD atualizado | 0,6932 | 0,7091 | 0,8107 | 0,5824 | 0,1979 | 0,0372 |

A prevalência de acertos na avaliação foi 66,55%. A referência prevê todos como acerto no limiar 0,5, por isso seu F1 é alto mesmo com AUC de 0,5. ECE usa dez faixas fixas e é descritivo. O ajuste BKT levou 6,76 s em CPU. O treino SGD levou 0,030 s, a atualização 0,001 s e a inferência em lote sobre atributos já montados 0,00067 s. Essas medidas não incluem leitura, cálculo dos históricos ou latência de serviço.

O vetor de coeficientes e intercepto mudou em norma L2 de 0,1841. As probabilidades variaram em média 0,0490 e 904 decisões cruzaram 0,5. A atualização aumentou ligeiramente a AUC e piorou Log Loss, Brier e ECE. Não há estimativa de incerteza nesta amostra. A evidência demonstra que a atualização muda o modelo e suas decisões, sem demonstrar melhoria educacional ou robustez no ENEM.

## Arquitetura recomendada para o piloto

| Opção | Uso proposto |
|---|---|
| BKT | Ponto de partida para estimar domínio por habilidade. Tem estado pequeno, interpretação explícita e atualização barata. Atualizar o estado de um aluno é diferente de reajustar os parâmetros do modelo. Os parâmetros do piloto devem ser aprendidos com dados do domínio. |
| DKT | Rede recorrente para capturar relações ao longo do histórico. Requer sequências e validação mais amplas. Atualizar o estado recorrente é diferente de retreinar a rede. Ficou como comparação futura e não foi treinado nesta execução. |
| SGD incremental | Camada treinável de probabilidade de acerto e alternativa ao BKT puro. O experimento mostrou atualização real e piora de calibração após um lote. Sua adoção depende de avaliação e controle de promoção. |
| Híbrido com TRI | Combinar domínio individual, área e dificuldade populacional para estimar adequação. No piloto, testar se TRI acrescenta valor contra as mesmas entradas sem TRI. Usar TRI de item como atributo conhecido em previsão de acerto é uma tarefa distinta de prever a própria dificuldade do item. A combinação TRI não foi executada em ASSISTments. |

[BKT original](https://escholarship.org/uc/item/0873k1nz) · [DKT original](https://papers.nips.cc/paper/5654-deep-knowledge-tracing.pdf)

1. Coletar eventos com ID pseudonimizado, questão, habilidade validada, data, primeira tentativa, assistência, acerto, versão do catálogo e da política. Preservar a preferência de dificuldade escolhida pelo estudante.
2. Comparar prevalência, BKT ajustado e BKT + SGD num piloto ENEM. Avaliar alunos separados e cortes globais por tempo, incluindo incerteza por aluno, calibração por área e desempenho com histórico curto.
3. Manter o recomendador de Ítalo como fonte de candidatos relevantes. O módulo adaptativo poderá fornecer probabilidades ou pesos de adequação. Um catálogo sem habilidade confiável pode começar com recortes por área, com limites de interpretação.
4. Separar atualização imediata do estado do aluno de treinamento periódico do modelo. Comparar versão congelada e atualizada em eventos posteriores. Promover novas versões somente com critérios de calibração, erros por área e estabilidade previamente definidos, com registro e rollback.
5. Demonstrar em etapa autorizada que a atualização muda sugestões entre candidatos reais e preserva a escolha do aluno. O experimento atual mediu mudanças no limiar de classificação de respostas.

## Reprodução

Da raiz do projeto, com Python 3.14, baixe o CSV corrigido e execute:

```powershell
curl.exe -fLsS "https://drive.google.com/uc?export=download&id=1NNXHFRxcArrU0ZJSb9BIL56vmUt5FhlE" -o assistments.csv
python -m pip install pandas==2.3.3 numpy==2.4.3 scipy==1.17.1 scikit-learn==1.8.0
python -B dificuldade-adaptativa/viabilidade/experimento.py assistments.csv
```

O SHA-256 da cópia usada é `162ef8d2d28bcbfea6591a282994062bd8d5eaa00636544292a0d268dca6e5da`. Os resultados estruturados incluem parâmetros, métricas, calibração e tempos. A recomendação é para avaliação futura do piloto. A implementação do recomendador e das fases seguintes fica sujeita a autorização.
