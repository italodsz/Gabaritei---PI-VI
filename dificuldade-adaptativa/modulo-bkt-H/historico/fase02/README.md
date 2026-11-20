# Gabaritei · BKT Fase 02

**Treinamento concluído com ressalvas para avaliação experimental posterior.**

Foram treinados quatro parâmetros independentes em cada uma das 56 habilidades ASSISTments selecionadas na Fase 01. O ajuste usou 19.370 sequências, 143.092 eventos de treino e 20 inicializações por habilidade. Os 1.120 ajustes principais convergiram. A validação prospectiva utilizou 29.780 eventos de 596 estudantes, em 56 habilidades.

| Métrica micro de validação | BKT | Taxa por habilidade |
| --- | ---: | ---: |
| Log-loss | 0,565095 | 0,620076 |
| Brier | 0,190877 | 0,215191 |
| AUC-ROC | 0,721236 | 0,610262 |
| Acurácia, limiar 0,5 | 71,63% | 66,99% |
| ECE, dez intervalos | 0,009511 | 0,003529 |

A calibração por ECE favoreceu o baseline. O bootstrap de parâmetros concluiu 5.600 reajustes, com 100 amostras de estudantes por habilidade e cinco inicializações por reajuste. Há 28 habilidades com pelo menos um intervalo de parâmetro com largura superior a 0,30 e sete com solução próxima a um limite numérico.

## Onde conferir

- **models/parametros_por_habilidade.json** contém os 56 modelos, com valores completos, suporte, verossimilhança, convergência e diagnósticos.
- **models/parametros_por_habilidade.csv** apresenta os parâmetros, resultados por habilidade e intervalos bootstrap em tabela.
- **models/metadados_modelo.json** registra versões, configurações, hashes e execução.
- **reports/** contém os relatórios técnicos, o gate de entrada, a validação, a estabilidade, a auditoria e a matriz de evidências.
- **evidence/initializations/** preserva as 20 inicializações de cada habilidade. **evidence/bootstrap/** preserva as 100 reamostragens e suas inicializações.
- **evidence/logs/** e **evidence/testes/** incluem execuções, falhas encontradas, diagnósticos e retestes.
- **notebooks/Fase02_Treinamento_BKT.ipynb** contém células executadas e saídas salvas de uma reprodução ponta a ponta em Jupyter local.
- **handoff/CONTRATO_FASE03.md** descreve o carregamento dos modelos e o conjunto congelado.
- **inputs/** inclui o ZIP da Fase 01 conferido. **fase01/** contém seus códigos e agregados extraídos para reconstrução legítima dos históricos.
- **SHA256SUMS.txt** confere os membros do pacote.

## Google Colab

Abra o notebook e envie este ZIP ao painel **Arquivos** do Colab. A primeira célula extrai a entrega e instala as dependências. As demais obtêm ou conferem o CSV oficial, preparam os históricos quando necessário, executam o gate, treinam os modelos, calculam bootstrap, validam e fazem a auditoria. A execução salva gráficos e modelos na pasta extraída. O processo pode levar alguns minutos em CPU. O notebook foi executado em Jupyter local. O serviço hospedado do Colab continua pendente de conferência.

Se a obtenção automática falhar, use o arquivo **corrigido colapsado** oferecido pelo publicador e coloque-o em data/bkt_local/skill_builder_data_corrected_collapsed.csv dentro da pasta extraída. O SHA-256 congelado é 162ef8d2d28bcbfea6591a282994062bd8d5eaa00636544292a0d268dca6e5da. [Fonte oficial do ASSISTments](https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data/skill-builder-data-2009-2010)

## Execução local

Use Python 3.11 ou superior, conforme os requisitos declarados pelas dependências. A execução comprovada usou Python 3.14.0, NumPy 2.4.3 e SciPy 1.17.1. Instale em ambiente virtual. A partir da pasta que contém treinar.py, no PowerShell:

    python -m venv .venv
    ./.venv/Scripts/python.exe -m pip install -r requirements-lock.txt
    $env:PYTHONUTF8 = '1'
    $env:OPENBLAS_NUM_THREADS = '1'
    $env:OMP_NUM_THREADS = '1'
    ./.venv/Scripts/python.exe -B executar.py --source data/bkt_local/skill_builder_data_corrected_collapsed.csv --private data/bkt_local/processado_restrito --workers 4
    $env:BKT_PRIVATE = (Resolve-Path data/bkt_local/processado_restrito).Path
    ./.venv/Scripts/python.exe -B testar.py
    ./.venv/Scripts/python.exe -B reproduzir.py $env:BKT_PRIVATE
    ./.venv/Scripts/python.exe -B relatorios.py

O arquivo bruto e os históricos processados são locais e sujeitos aos termos da fonte. O código usa a biblioteca padrão para a preparação e NumPy/SciPy para estimação. requirements-lock.txt registra o ambiente limpo verificado. requirements-notebook.txt acrescenta as dependências para executar notebooks fora do Colab. Os comandos podem gravar relatórios e modelos na cópia extraída. Preserve uma cópia original para comparar os hashes. A matriz de evidências entregue corresponde à execução registrada.

Para conferir apenas o contrato de entrada, execute gate.py com três argumentos posicionais, nesta ordem: o ZIP da Fase 01, o CSV oficial e a pasta privada processada. Os comandos individuais treinar.py, validar.py, bootstrap.py e auditar.py recebem a pasta privada como argumento. graficos.py e relatorios.py usam os resultados já gerados na pasta da entrega.

## Inferência reutilizável

    from pathlib import Path
    from bkt.inferencia import load_model, predict_correctness, update_mastery, trace

    model = load_model(Path("models/parametros_por_habilidade.json"))
    params = model["skills"]["4"]["parameters"]
    mastery = params["L0"]
    predicted = predict_correctness(mastery, params)
    mastery = update_mastery(mastery, 1, params)

O estado é reiniciado por estudante e habilidade. A previsão deve ser obtida antes da resposta. A coluna mastery_next no traço representa a crença para a oportunidade seguinte.

As 25 verificações finais passaram. O relatório de auditoria documenta uma correção numérica na atualização de domínio e duas comparações cujas tolerâncias precisaram considerar o ponto flutuante. A revisão por implementação separada foi feita sob a mesma autoria. A revisão externa permanece pendente. A aplicação pedagógica no ENEM exige dados e avaliação próprios.
