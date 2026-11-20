# Fontes, regras e reprodução

## Fontes consultadas em 08/11/2026

- A branch pública `dataset` apontava para a mesma revisão local `7e720fa876beb7249adab2f05d3ecf33ae5a2c51`. A base foi lida em `base-oficial/Dataset/base_trabalho/data/questions.jsonl`. O SHA-256 após normalizar quebras de linha para LF é `22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5`. [Revisão do dataset](https://github.com/italodsz/Gabaritei---PI-VI/tree/7e720fa876beb7249adab2f05d3ecf33ae5a2c51/Dataset/base_trabalho)
- Os 16 arquivos `ITENS_PROVA_YYYY.csv` de 2009 a 2024 foram relidos. Seus hashes conferem com a auditoria anterior. A junção exige coincidência única de arquivo de origem, código do item, código da prova, posição, área e ano. Maiúsculas e minúsculas no nome da tabela são equivalentes. Gabarito e parâmetros TRI são comparados separadamente. [Microdados do INEP](https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem)
- A Matriz de Referência do ENEM foi reextraída da cópia oficial de 24 páginas, já obtida e preservada na auditoria anterior. O acesso web direto retornou 502 nesta rodada. Os metadados do PDF registram criação em 22/05/2012. SHA-256 `6b56d523ccb85f74f7ed33e0cd679f3dd178ed6f13a5b0948bcfdfe8964ce6a1`. Cada área tem 30 habilidades. O código tem significado dentro da área. Espaços produzidos pela extração podem diferir da redação visual do PDF. [Matriz de Referência oficial](https://download.inep.gov.br/download/enem/matriz_referencia.pdf)
- Os PDFs e gabaritos de 2018 Azul e de 2022 Laranja sustentam as recuperações dirigidas. O arquivo `fontes/hashes_documentais.json` guarda seus hashes. As páginas e itens efetivamente examinados estão em `revisao_dirigida.json`. Também consultamos os cadernos Azul de 2021 e de 2022 para localizar material. O Azul de 2022 corroborou a identidade do item sobre catalase, que foi reconciliado com o Laranja por posição e gabarito. O Azul de 2021 não resolveu de forma segura os casos de texto faltante pesquisados. [Cadernos 2018](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/2018) · [Cadernos 2021](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/2021) · [Cadernos 2022](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/2022)
- A árvore da revisão `ea3f28d22f805dea191e12130e14a3034099cf43` de `wardrobe` foi consultada em busca de arquivos de mídia. Nenhum caminho em `media/` apareceu. A busca não esgota outras cópias ou fontes originais. As 878 referências na base não apontaram para arquivo existente na revisão local.
- O código de preparação da busca, a configuração do índice e os documentos de decisão do módulo semântico foram lidos na revisão `d9250a7d64eaf116e28d11d9c44907f87bda65c7`. O hash da base confere. O estado de 30/10 documenta TF-IDF + MiniLM, e o arquivo de decisão registra Qwen como adotado em 06/11. Nenhuma dessas variantes foi executada nesta etapa. [Módulo de recomendação](https://github.com/italodsz/Gabaritei---PI-VI/tree/d9250a7d64eaf116e28d11d9c44907f87bda65c7/recomendador/rrf-tfidf-minilm-J)

## Como a rubrica funciona

| Critério | Aprovação | Revisão ou falha |
| --- | --- | --- |
| C1 Integridade | Texto, opções e gabarito conferidos por leitura dirigida e vínculo de origem | Incompletude demonstrada ou representação textual sem campo essencial reprova. Ausência de conferência integral fica pendente |
| C2 Origem | Vínculo único nos microdados | Sem vínculo inequívoco fica pendente |
| C3 Coerência | Habilidade oficial na área correta e compatibilidade de assunto e subassunto sustentada por leitura | Conflito demonstrado reprova. Falta de rótulo ou de evidência deixa pendente |
| C4 Consistência | Estrutura legível, sem colisão ou variante redundante detectada | Defeito concreto ou variante reservada reprova. Alerta editorial sem decisão fica pendente |
| C5 TRI | a finito e positivo, b finito, c entre 0 e 1, valores iguais à fonte dentro de 0,000005 | Valor fora do domínio reprova. Origem incerta fica pendente |
| C6 Apoio | Leitura confirma autossuficiência ou o material necessário foi inspecionado e preservado | Arquivo referenciado ausente ou material indispensável comprovadamente faltante reprova. Suspeita ou ausência de leitura fica pendente |

O ponto só é atribuído ao status APROVADO. As colunas de motivo, evidência e método distinguem conferência documental, triagem automática e leitura dirigida. A confiança é qualitativa. O dataset contém itens objetivos em cadernos comuns e acessíveis. A exigência A–E vale para a representação textual desta tarefa. Se opções aparecem somente em uma imagem indisponível, a reprovação de estrutura descreve a cópia disponível, sem julgar a qualidade do caderno original.

A taxonomia complementar usa **área → assunto → subassunto**, com os nomes originais e a taxonomia experimental anterior em `revisao_pedagogica/taxonomia_proposta.json`. Termos do comando servem para revisão, sem preencher lacunas. Por exemplo, a questão `gq_e898766ae6adc513f38c0641` pede variância e traz Geometria no rótulo original. O conflito fica explícito. Em C5, a igualdade com a tabela da edição verifica procedência. Não foram produzidas faixas de dificuldade comparáveis entre anos. Os alertas a < 0,25, |b| > 5 e c > 0,35 ficam separados da validade numérica.

## Uso por tarefa

- **Texto semântico.** Texto e alternativas legíveis, origem e gabarito coerentes, sem duplicata reservada, sem bloqueio e sem sinal relevante de contexto ausente. A triagem olha marcadores de recurso perto de referências contextuais, referências em comandos curtos, lacunas de texto e arquivos ausentes. O piso de oito tokens ajuda a reter comandos curtos para inspeção em vez de aprová-los automaticamente. Um falso negativo ou positivo da triagem continua possível. A entrada é enunciado seguido das alternativas na ordem original, normalização Unicode NFC e espaços por linha. Prefixos de alternativa duplicados são removidos conservadoramente. Gabarito, assunto, habilidade e TRI ficam fora da entrada.
- **Supervisionado.** Apenas para o alvo exploratório **classificar a área oficial em quatro classes**, presente em uma coluna separada. Não há pares de relevância validados para ajustar o recomendador nem alvo de dificuldade calibrado entre edições. A área já conhecida torna esse experimento um teste técnico, de utilidade limitada no app.
- **Recomendação.** Exige leitura dirigida do item completo, opções e gabarito, e do apoio visual quando necessário. O catálogo técnico exige que o app respeite os recursos associados e a revisão de direitos. O gráfico derivado deve ser exibido. A tabela de catalase deve ser renderizada como tabela. A triagem anterior entra como histórico e nunca decide a elegibilidade sozinha.
- **Demo.** Subconjunto textual de recomendação, com revisão dirigida de conteúdo e gabarito. Os dois itens que dependem de tabela ou gráfico aguardam teste de renderização para entrar na demo. Todos os registros mantêm revisão de direitos pendente, inclusive os com 6/6.
- **Pendente e bloqueado.** Pendências são incertezas documentadas. Bloqueios são falhas específicas do uso na representação disponível. Direitos constituem uma restrição separada.

## Partições e integração

Os grupos reúnem mesmo CO_ITEM, famílias cadastradas, enunciado normalizado idêntico com pelo menos oito tokens e quase duplicatas com Jaccard ≥ 0,85 em sequências de cinco tokens para textos de ao menos 25 tokens. A união é transitiva. Um representante é conservado. Grupos que atravessarem as partições por ano ficam em quarentena. Treino até 2022, validação em 2023, teste em 2024. O índice de busca de qualquer avaliação deve ser ajustado apenas com treino. A regra não detecta toda paráfrase. Como a base já foi usada em experimentos anteriores, a divisão cronológica proposta precisa de controle de acesso e conjunto independente antes de ser apresentada como avaliação inédita.

O vínculo com o recomendador do Ítalo pode usar `id`, revisão do catálogo, `area`, `content_family_id` e `texto_entrada`. Use a lista de recomendação como filtro de exibição, com `alternativas`, `recursos` e `variante`. A correção usa `gabarito` no servidor. Alterações de texto exigem conferir novamente hashes, ordem dos IDs e vetores do índice. Nenhuma integração, indexação ou atualização de parâmetros foi executada.

## Reprodução a partir do ZIP

Extraia mantendo as pastas. O pacote inclui tabelas, fontes oficiais usadas nas decisões, entradas anteriores e os arquivos originais necessários à reprodução. A extração tem apenas o recorte de arquivos da base exigido pelo script. Execute da pasta extraída com Python 3.14.0, versão usada nesta entrega.

```sh
python -m pip install pypdf==6.9.2 PyMuPDF==1.27.2.2
python -B dificuldade-adaptativa/recuperacao_catalogo/auditar.py
python -B -m unittest discover -v -s dificuldade-adaptativa/recuperacao_catalogo
```

O script recria CSVs com separador ponto e vírgula e UTF-8 com BOM, JSONL em UTF-8 e o recorte do gráfico. O CSV protege textos que começariam como fórmulas. Para integração, prefira o JSONL. Os hashes das entradas estão em `metricas.json`, os hashes do pacote em `SHA256SUMS.txt` e a comparação da reprodução em `reproducao.log`.
