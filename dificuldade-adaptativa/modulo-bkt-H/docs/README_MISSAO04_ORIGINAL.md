# Gabaritei · Missão BKT 04

**Aprovado com ressalvas para reprodução e módulo independente experimental.**

A missão tratou os seis primeiros problemas prioritários do quadro da auditoria do Claude e as três ressalvas adicionais. A auditoria foi lida integralmente, com oito páginas e nove linhas no quadro de gravidade. O foco foi a reprodução com dados, a comparação estatística e os limites da aplicação ao ENEM. Os 56 modelos originais foram preservados.

## Entregáveis principais

- reports/relatorio_seis_problemas.md apresenta cada problema, tratamento, evidência, critério de aceitação, critério de reprovação e situação.
- reports/relatorio_tecnico_completo.md reúne todos os relatórios.
- reports/reconstrucao.json e reports/execucao_source_only.json comprovam a preparação e a execução a partir apenas do CSV.
- reports/reconstrucao_duas_chaves.json compara a representação alternativa e a chave original.
- reports/reproducao_treinamento.json compara os 56 ajustes e suas perdas.
- reports/comparacao_estatistica.json e .md apresentam o novo intervalo pareado contra histórico suavizado, inclusive nos grupos extremos.
- models/elegibilidade_integracao.json e reports/elegibilidade_habilidades.csv registram as 20 habilidades externas permitidas e as 36 com fallback.
- bkt04/motor.py e bkt04/adaptador.py implementam inferência, persistência e interface de integração.
- reports/politicas_validacao.json apresenta o replay e a configuração selecionada exclusivamente na validação.
- evidence/tests registra aprovados, reprovados, ignorados e bloqueados por grupo.
- reports/demo_integracao.json contém uma fixture sintética executada da interface.
- integration/contrato_frontend.json identifica os arquivos e tipos efetivamente encontrados no Gabaritei.
- external_review/README.md permite uma nova auditoria a partir do CSV, sem a chave privada anterior.
- SHA256SUMS.txt confere os artefatos redistribuídos.

Os parâmetros, históricos individuais, catálogo e scripts anteriores foram tratados como insumos. Os novos dados processados e bancos SQLite ficam na pasta local de execução e devem ter acesso controlado.

## Reprodução somente com o CSV

Requer Python 3.11 ou superior, conforme as dependências. A execução comprovada usou Python 3.14.0, NumPy 2.4.3 e SciPy 1.17.1 em um ambiente virtual novo. Extraia este ZIP e execute a partir da pasta que contém executar.py.

    python -m venv .venv
    ./.venv/Scripts/python.exe -m pip install -r requirements-lock.txt
    ./.venv/Scripts/python.exe -B obter_dataset.py local/raw/skill_builder_data_corrected_collapsed.csv
    ./.venv/Scripts/python.exe -B executar.py local/raw/skill_builder_data_corrected_collapsed.csv local/reproducao

Se a rede impedir o download, obtenha a edição corrigida colapsada pela fonte e passe o caminho do CSV já adquirido. O arquivo deve ter 64.412.812 bytes e SHA-256 162ef8d2d28bcbfea6591a282994062bd8d5eaa00636544292a0d268dca6e5da. Nome e tamanho sozinhos não validam a edição. O procedimento registra a origem, os hashes, as falhas de obtenção e os códigos de retorno. [Fonte oficial do ASSISTments](https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data/skill-builder-data-2009-2010)

O comando executar.py chama o pipeline original da Fase01, compara agregados e oito representações canônicas, reproduz o treino original de 56 habilidades, aplica o gate operacional, refaz a comparação estatística e o replay da validação e executa os cinco grupos de testes. Ele grava relatórios na cópia extraída. Preserve uma cópia intacta do ZIP para comparar os hashes.

O modo determinístico usa identificadores alternativos de reprodução. A divisão é a mesma, pois depende dos IDs originais e da semente, conforme o protocolo anterior. Os hashes de arquivos com pseudônimos novos são diferentes. Os hashes canônicos verificam que os eventos e históricos subjacentes são iguais. A chave antiga é desnecessária para esse caminho. Os identificadores de reprodução são ligáveis à fonte por quem já tem acesso ao CSV e não constituem garantia de anonimização.

Para comparar também os oito hashes individuais antigos, execute reproduzir_dados.py com --legacy-private apontando para uma pasta privada original autorizada. Esse modo foi executado nesta missão e ficou registrado, mas é opcional.

## Testes por grupo

Matemática e módulo de integração rodam sem dataset e sem pacotes externos:

    python -B testar.py --groups A,D --out evidence/tests/sem_dataset_AD.json

Para a suíte completa, configure o caminho do CSV e da pasta work usada por executar.py:

    $env:BKT04_SOURCE = (Resolve-Path local/raw/skill_builder_data_corrected_collapsed.csv).Path
    $env:BKT04_WORK = (Resolve-Path local/reproducao).Path
    ./.venv/Scripts/python.exe -B testar.py

O código de saída é 0 para aprovação completa, 1 para falha ou erro e 2 para testes bloqueados. Com os dados presentes, os 44 testes passaram. Sem as duas variáveis, todos os 44 foram coletados, com 31 aprovados e 13 bloqueados. Os bloqueados não são contados como aprovados. Os grupos A/D também passaram em venv criado sem pip.

A são matemática e política. B são dados e reconstrução. C é treinamento real. D é integração, persistência e concorrência. E são métricas e comparação com respostas reais. Os exemplos controlados não demonstram desempenho pedagógico.

## Motor de inferência

    from pathlib import Path
    from bkt04.motor import Motor

    Path("local").mkdir(exist_ok=True)
    motor = Motor(Path("local/motor.sqlite"))
    result = motor.respond(
        "aluno-demo",
        "assistments_2009_2010",
        "11",
        "tentativa-demo-1",
        1,
        1,
        {"facil": 3, "media": 3, "dificil": 3},
    )

O exemplo é sintético. O motor responde com a previsão anterior, posterior, estado para a oportunidade seguinte, versão, elegibilidade, estratégia, contagem de evidência e eventual sugestão. Uma mudança sugerida exige aceite por resolve_offer. A escolha manual usa choose_level. A preferência nunca muda por causa de uma resposta isolada ou de uma oferta ainda pendente.

O adaptador register_correction recebe o estudante autenticado pelo futuro backend, o EnvioResposta do contrato real, metadados de questão e uma correção autorizada. A tentativa usa o ID canônico da correção, que pode diferir da chave enviada pelo cliente. As letras do frontend não são tratadas como rótulo de acerto fornecido pelo aluno.

A integração na aplicação real está pendente. O frontend disponível tem contrato Api e implementação mock, enquanto httpApi lança indisponível. O pacote entrega uma interface Python testada, sem alegar conexão a um backend existente.

## Resultado científico e limites

O delta global de log-loss BKT menos histórico suavizado foi −0,01696853, com IC95% de −0,02184936 a −0,01145902, em 29.948 eventos de 585 estudantes. Nos grupos com taxa de acerto ≤10% e ≥90%, os intervalos favorecem o histórico. Essa é uma análise posterior ao teste original.

No replay da validação, a política BKT fez mais ofertas e reversões. A superioridade da recomendação de dificuldade e a melhoria da aprendizagem permanecem sem demonstração. O motor usa fallback para habilidades ENEM sem mapeamento aprovado. A revisão científica humana, a calibração local e a prova externa de anterioridade do protocolo histórico continuam pendentes.
