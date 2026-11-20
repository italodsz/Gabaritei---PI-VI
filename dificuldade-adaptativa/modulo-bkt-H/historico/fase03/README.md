# Gabaritei · Missão BKT 03/05

**Parecer de aprovação parcial para continuidade experimental.** Das 56 habilidades ASSISTments, 21 ficaram A, 14 B e 21 C. A categoria D ficou vazia. Os critérios foram congelados antes da avaliação final.

O teste avaliou 29.948 eventos em 3.892 sequências de 585 estudantes. A log-loss do BKT foi 0,565608, frente a 0,625443 da taxa por habilidade e 0,582577 do histórico suavizado. O IC95% pareado da diferença BKT menos taxa por habilidade foi −0,073389 a −0,048882. A ECE micro pontual foi maior para o BKT.

## Artefatos

- reports/relatorio_cientifico.md reúne método, hipóteses, auditoria, reprodução, estabilidade, fronteiras, validação, calibração, avaliação e parecer.
- reports/resultados_por_habilidade.csv reúne suporte, parâmetros, métricas e intervalos por habilidade.
- reports/qualificacao_habilidades.csv registra categoria e motivos. models/elegibilidade_experimental.json fornece as listas A–D.
- reports/intervalos_confianca.csv contém os intervalos globais e por habilidade, inclusive diferenças pareadas.
- reports/protocolo_pre_teste.json e .md registram as regras e os códigos congelados. evidence/hashes/protocolo.json fixa seu SHA-256.
- evidence/acesso_teste.jsonl registra integridade, congelamento e abertura de rótulos para avaliação.
- reports/reproducao_treinamento.csv compara cada parâmetro original e reproduzido. reports/reproducibilidade.json resume a execução.
- evidence/logs guarda as execuções e falhas. reports/matriz_evidencias.csv liga os 32 testes finais a código e resultado.
- notebooks/BKT_Fase03_Avaliacao_Cientifica.ipynb contém a reprodução executada em Jupyter local, com saídas reais.
- external_review contém a especificação para Claude Code, o roteiro em duas etapas, o estado real da tentativa de inspeção e a comparação a preencher com evidências externas.
- handoff/CONTRATO_FASE04.md define o escopo de uma futura integração controlada.
- fase02 contém uma cópia do pacote anterior extraída e verificada. inputs contém os ZIPs de referência. SHA256SUMS.txt confere os membros desta entrega.

## Dados privados necessários

Os eventos e sequências preparados permanecem fora do ZIP. Use a pasta privada da Fase 01, que contém manifesto_local.json, estudantes.jsonl, exclusoes.csv e os seis JSONL de eventos e sequências. O protocolo congela os hashes desses arquivos. Os novos arquivos de previsão também são locais e contêm respostas individuais.

A origem é o CSV corrigido colapsado, cujo SHA-256 é 162ef8d2d28bcbfea6591a282994062bd8d5eaa00636544292a0d268dca6e5da. O procedimento original de obtenção e preparação está em fase02/fase01 e no ZIP da Fase 01 incluído. [Página oficial do ASSISTments](https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data/skill-builder-data-2009-2010)

A Fase 01 usa chave local para pseudonimização. Para obter hashes individuais idênticos, reutilize privadamente a mesma chave e os mesmos dados preparados. Uma reconstrução com nova chave conserva as decisões de divisão e os resultados científicos, mas altera IDs transformados e hashes de arquivos individuais. O avaliador congelado exige os hashes originais. A reprodução em outra máquina deve disponibilizar a cópia privada autorizada ou documentar uma reprodução independente com novos pseudônimos, comparando agregados, eventos de origem, modelos e protocolo. Evite sobrescrever as evidências publicadas.

## Reprodução por comandos

Execute a partir da pasta que contém avaliar_teste.py. O ambiente comprovado foi Python 3.14.0 com NumPy 2.4.3 e SciPy 1.17.1. Use um ambiente virtual e os caminhos reais dos arquivos privados. Os exemplos usam caminhos relativos à pasta extraída.

    python -m venv .venv
    ./.venv/Scripts/python.exe -m pip install -r requirements-lock.txt
    $env:PYTHONUTF8 = '1'
    $env:OPENBLAS_NUM_THREADS = '1'
    $env:OMP_NUM_THREADS = '1'
    $env:BKT_PRIVATE = (Resolve-Path data/processado_restrito).Path
    ./.venv/Scripts/python.exe -B reproduzir.py $env:BKT_PRIVATE .venv/Scripts/python.exe
    ./.venv/Scripts/python.exe -B auditar_matematica.py $env:BKT_PRIVATE
    ./.venv/Scripts/python.exe -B investigar.py $env:BKT_PRIVATE
    ./.venv/Scripts/python.exe -B validar.py $env:BKT_PRIVATE data/reproducao_local
    ./.venv/Scripts/python.exe -B -m unittest discover -s tests -p test_pre_teste.py -v

Para reproduzir a avaliação publicada, confira primeiro o protocolo congelado e os hashes. A cópia extraída já contém o protocolo. Os comandos seguintes preservam sua identidade e recalculam a avaliação com as mesmas regras.

    ./.venv/Scripts/python.exe -B congelar.py
    ./.venv/Scripts/python.exe -B avaliar_teste.py $env:BKT_PRIVATE data/reproducao_local
    ./.venv/Scripts/python.exe -B auditar_resultados.py $env:BKT_PRIVATE data/reproducao_local
    ./.venv/Scripts/python.exe -B graficos.py data/reproducao_local
    ./.venv/Scripts/python.exe -B -m unittest discover -s tests -v *> evidence/logs/testes_completos.log
    ./.venv/Scripts/python.exe -B relatorios.py

As duas primeiras etapas científicas foram executadas antes da avaliação inicial. Em uma reprodução posterior, a ordem dos comandos permite verificar as dependências, mas a avaliação já é pública. Alterações numéricas nos insumos congelados são detectadas. Registre diferenças de plataforma e preserve a entrega original.

O gate inicial pode ser executado com gate.py recebendo o ZIP original da Fase 02, a pasta privada e o CSV bruto oficial. O gate confere hashes, suporte e elegibilidade e reexecuta os 25 testes anteriores. Para começar a partir de arquivos reconstruídos com hashes diferentes, prepare uma cópia de auditoria identificada e documente a diferença de representação. Os critérios estatísticos desta entrega continuam fixos.

## Notebook e alcance das evidências

No Colab, envie o ZIP da Fase 03 e disponibilize a pasta de dados privados conforme a primeira célula. requirements-notebook.txt é útil para executar o notebook fora do Colab. A execução comprovada foi local. O serviço hospedado do Colab continua sem execução registrada.

A revisão matemática teve implementação separada, sob a mesma autoria. A chamada de inspeção ao Claude Code excedeu 120 segundos e ficou inconclusa. A reprodução integral no Claude e a revisão humana externa permanecem pendentes. Os 28 casos de parâmetros amplos tiveram dez classificações B e dezoito C. As sete habilidades de fronteira ficaram C.

As métricas representam previsão de acerto no ASSISTments. A calibração para o ENEM e a recomendação adaptativa dependem de dados e validação específicos. A Fase 04 aguarda a revisão desta entrega.
