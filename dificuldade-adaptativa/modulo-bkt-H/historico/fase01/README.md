# Gabaritei · BKT Fase 01

Históricos reais do ASSISTments Skill Builder 2009–2010, edição corrigida colapsada. A Fase 01 produz eventos e sequências para posterior treinamento do BKT clássico. A execução conferiu 346.860 registros, reteve 214.417 eventos de 4.003 estudantes e reconstruiu 32.070 sequências. A triagem selecionou 56 habilidades no treino.

| Conjunto | Estudantes | Eventos | Sequências | Eventos nas 56 habilidades |
| --- | ---: | ---: | ---: | ---: |
| Treino | 2.802 | 151.015 | 22.591 | 143.092 |
| Validação | 601 | 31.521 | 4.974 | 29.780 |
| Teste | 600 | 31.881 | 4.505 | 29.948 |

## Google Colab

Abra notebooks/Fase01_Preparacao_BKT.ipynb e envie o ZIP desta entrega ao painel **Arquivos** da sessão do Colab. Execute as células em ordem. Elas verificam a fonte, preparam os dados, fazem a auditoria e exibem resultados agregados. O notebook foi executado em Jupyter local com resultados salvos. O núcleo também foi executado em ambiente virtual limpo. O Colab hospedado permanece sem execução comprovada.

Se o download automatizado falhar, abra a página oficial, escolha o arquivo corrigido **colapsado** e coloque skill_builder_data_corrected_collapsed.csv em data/bkt_local da pasta extraída. A verificação exige o SHA-256 congelado. [Página oficial do ASSISTments](https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data/skill-builder-data-2009-2010)

## Reprodução local

Extraia o ZIP e execute a partir da pasta que contém src. Use Python 3.11 ou superior. Preparação, gráficos, auditoria e testes usam a biblioteca padrão. A execução de referência usou Python 3.14.0. No PowerShell:

    $env:PYTHONUTF8 = '1'
    $env:BKT_SOURCE = 'data/bkt_local/skill_builder_data_corrected_collapsed.csv'
    $env:BKT_PRIVATE = 'data/bkt_local/processado_restrito'
    $env:BKT_PUBLIC = 'data/bkt_local/agregados'
    $env:BKT_REPRO_PUBLIC = 'data/bkt_local/reexecucao/agregados'
    python -B -m src.ingestao $env:BKT_SOURCE
    python -B -m src.preparar --source $env:BKT_SOURCE --private $env:BKT_PRIVATE --public $env:BKT_PUBLIC
    python -B -m src.auditoria $env:BKT_SOURCE $env:BKT_PRIVATE $env:BKT_PUBLIC "$env:BKT_PUBLIC/auditoria.json"
    python -B -m src.complementos $env:BKT_PRIVATE $env:BKT_PUBLIC
    python -B -m src.graficos "$env:BKT_PUBLIC/manifesto_dados.json" "$env:BKT_PUBLIC/graficos"
    python -B -m src.preparar --source $env:BKT_SOURCE --private data/bkt_local/reexecucao/privado --public $env:BKT_REPRO_PUBLIC
    python -B -m unittest discover -s tests -v
    python -B -m src.carregar $env:BKT_PRIVATE

A rotina de auditoria confere a publicação de referência da primeira execução da fonte congelada. O teste de idempotência prepara duas vezes em uma pasta temporária e confere byte a byte com a primeira saída usando a mesma chave local. Outra execução, com chave nova, reproduz os agregados públicos. Em Bash, exporte as mesmas quatro variáveis usando export e invoque os mesmos módulos. Guarde a pasta privada e a chave no armazenamento da equipe autorizado para esses dados.

## Arquivos para conferir

- **reports/auditoria_inicial.md** e **reports/inventario_inicial.json** registram o material recuperado e a fonte.
- **reports/qualidade_dados.md**, **reports/analise_habilidades.md** e **reports/parecer_final.md** apresentam metodologia, resultados e limites.
- **data/manifests/** contém o manifesto de processamento, os indicadores e a decisão individual de cada uma das 101 habilidades observadas.
- **reports/auditoria_independente.json** registra a conferência por SQLite, com uma implementação separada do pipeline.
- **reports/graficos/** contém dez gráficos gerados dos agregados.
- **evidence/logs/** contém as saídas registradas. **reports/matriz_evidencias.csv** liga os 15 testes a requisitos, código, comando e resultado.
- **handoff/CONTRATO_FASE02.md** descreve como consumir as sequências. O carregador já foi testado.
- **SHA256SUMS.txt** registra os hashes dos membros do ZIP.

Os eventos e sequências individuais já preparados ficam numa pasta local separada, junto da chave. O ZIP é a versão compartilhável com código e agregados. A edição e suas condições podem ser conferidas com o publicador. [Termos de uso do ASSISTments](https://sites.google.com/site/assistmentsdata/termsofuseforusingdata)
