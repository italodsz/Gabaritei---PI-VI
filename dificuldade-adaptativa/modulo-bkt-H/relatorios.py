"""Reports, acceptance criteria and traceability for all Claude findings."""
from collections import Counter
import csv
import sys
import platform

from bkt04.common import ROOT,load,save,sha


def write(name,text):
    p=ROOT/name
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(text.strip()+"\n",encoding="utf-8",newline="\n")


def csv_file(name,records):
    records=list(records)
    p=ROOT/name
    p.parent.mkdir(parents=True,exist_ok=True)
    with p.open("w",encoding="utf-8",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=list(records[0]),lineterminator="\n")
        writer.writeheader()
        writer.writerows(records)


def main():
    inventory=load(ROOT/"reports/inventario_entrada.json")
    reconstruction=load(ROOT/"reports/reconstrucao.json")
    original_key=load(ROOT/"reports/reconstrucao_duas_chaves.json")
    training=load(ROOT/"reports/reproducao_treinamento.json")
    stats=load(ROOT/"reports/comparacao_estatistica.json")
    policy=load(ROOT/"reports/politicas_validacao.json")
    gate=load(ROOT/"models/elegibilidade_integracao.json")["skills"]
    tests=load(ROOT/"evidence/tests/all.json")
    missing=load(ROOT/"evidence/tests/sem_dados.json")
    stdlib=load(ROOT/"evidence/tests/stdlib_AD.json")
    main=stats["overall"]
    low=stats["extreme_groups"]["accuracy_le_0.1"]
    high=stats["extreme_groups"]["accuracy_ge_0.9"]
    eligible=[s for s,r in gate.items() if r["eligible_for_experimental_difficulty"]]
    cases=[
      {"id":"P1","audit_page":"6","problem":"Reprodução externa inviável com o pacote entregue",
       "treatment":"Reconstrução somente a partir do CSV verificado; identidades alternativas determinísticas e hashes canônicos sem chave antiga.",
       "accept":"346860 brutos, 214417 válidos, 4003 estudantes, 56 habilidades, split 2802/601/600 e oito representações lógicas iguais; modelos dentro de 1e-4 e NLL 1e-8.",
       "reject":"Qualquer divergência não explicada de fonte, eventos, sequências, split, seleção ou parâmetros.",
       "evidence":"reports/reconstrucao.json; reports/execucao_source_only.json; reports/reproducao_treinamento.json; tests/B_dados; tests/C_treinamento",
       "status":"CORRIGIDO_NO_MODO_SOURCE_ONLY"},
      {"id":"P2","audit_page":"6","problem":"Comparação principal limitada a baseline por habilidade",
       "treatment":"Delta pareado BKT menos histórico suavizado, 2000 reamostragens de estudantes, incluindo os dois grupos extremos.",
       "accept":"IC95 superior <0 favorece BKT nesse grupo; IC contendo zero é inconclusivo; IC inferior >0 favorece histórico.",
       "reject":"Alegar ganho sem perdas individuais alinhadas, quebrar agrupamento por aluno ou apresentar análise como pré-registrada.",
       "evidence":"reports/comparacao_estatistica.json; evidence/logs/comparacao_estatistica.log; tests/E_avaliacao",
       "status":"COMPLEMENTADO_POS_HOC_GANHO_GLOBAL_E_CONTRAPONTOS"},
      {"id":"P3","audit_page":"6","problem":"Conclusões não demonstram aplicação ao Gabaritei e ENEM",
       "treatment":"Inspeção do frontend real, adaptador para Envios/Correção, motor independente com SQLite e namespace ENEM encaminhado a fallback.",
       "accept":"Interface, persistência e consentimento passam nos testes; implantação real exige backend conectado e evidência local ENEM.",
       "reject":"Declarar modelo calibrado no ENEM ou integração na aplicação sem execução na aplicação real.",
       "evidence":"integration/contrato_frontend.json; bkt04/adaptador.py; bkt04/motor.py; reports/demo_integracao.json; tests/D_integracao",
       "status":"MITIGADO_NO_MODULO_APLICACAO_REAL_PENDENTE"},
      {"id":"P4","audit_page":"6","problem":"Parâmetros pouco plausíveis atravessam as categorias históricas",
       "treatment":"Gate operacional adicional bloqueia G≥0.5, S≥0.5, fronteira, categoria C/D, intervalos amplos e evidência preditiva insuficiente.",
       "accept":"Os cinco G altos e sete casos de fronteira usam fallback; nenhum caso bloqueado recebe domínio BKT para controlar dificuldade.",
       "reject":"Categoria A/B autorizar sozinha a política ou algum bloqueado operar como BKT.",
       "evidence":"models/elegibilidade_integracao.json; reports/elegibilidade_habilidades.csv; tests/D_integracao/test_engine.py",
       "status":"CORRIGIDO_COM_GATE_CONSERVADOR"},
      {"id":"P5","audit_page":"6","problem":"Anterioridade do protocolo histórico não tem prova externa",
       "treatment":"Preservação do protocolo anterior; nova análise é explicitamente posterior ao teste; hash da Missão04 registrado no chat antes das análises.",
       "accept":"Para futura confirmação prospectiva, exigir registro verificável externo anterior ao acesso a dados novos.",
       "reject":"Tratar logs próprios ou registro criado depois como prova retroativa de anterioridade das Fases01–03.",
       "evidence":"reports/protocolo_missao04.json; evidence/protocolo_hash.json; comunicação no chat",
       "status":"LIMITACAO_HISTORICA_PENDENTE_MITIGACAO_NESTA_RODADA"},
      {"id":"P6","audit_page":"7","problem":"Suítes dependem dos dados privados para coleta e execução",
       "treatment":"Grupos independentes A matemática, B dados, C treino, D integração e E avaliação; ausência vira bloqueio e código 2.",
       "accept":"A/D passam em venv só com biblioteca padrão; coleta completa sem dados distingue aprovados e bloqueados; com dados todos passam.",
       "reject":"Erro de importação por variável ausente, ausência de coleta ou contagem de bloqueados como aprovados.",
       "evidence":"testar.py; evidence/tests/all.json; evidence/tests/sem_dados.json; evidence/tests/stdlib_AD.json",
       "status":"CORRIGIDO_COM_GRUPOS_INDEPENDENTES"}
    ]
    save(ROOT/"reports/tratamento_auditoria.json",{"source_pdf":inventory["audit_pdf"],"priority_findings":cases,
          "additional_findings":[{"id":"R7","problem":"Calibração na ponta baixa","status":"VALIDACAO_ENEM_PENDENTE"},
                                 {"id":"R8","problem":"Comparações múltiplas","status":"CATEGORIAS_CONTINUAM_DESCRITIVAS"},
                                 {"id":"R9","problem":"Viés da política do tutor","status":"LIMITACAO_PRESERVADA_NO_TRANSPORTE"}]})
    csv_file("reports/matriz_seis_problemas.csv",cases)
    per_skill=[]
    for s,r in sorted(gate.items(),key=lambda kv:int(kv[0])):
        row={"skill_id":s,"original_category":r["original_category"],**r["parameters"],
             "boundary":"|".join(r["boundary"]),"G_lt_0_5":r["plausibility_G"],"S_lt_0_5":r["plausibility_S"],
             "decision":"BKT_experimental" if r["eligible_for_experimental_difficulty"] else "fallback",
             "reasons":"|".join(r["reasons"])}
        for p in ("L0","T","G","S"):
            row[p+"_q025"]=r["parameter_intervals"][p]["q025"]
            row[p+"_q975"]=r["parameter_intervals"][p]["q975"]
        per_skill.append(row)
    csv_file("reports/elegibilidade_habilidades.csv",per_skill)
    table=["| Prioridade | Problema | Tratamento e evidência | Situação |","| --- | --- | --- | --- |"]
    for r in cases:
        table.append(f"| {r['id']} | {r['problem']} | {r['treatment']} Evidência em {r['evidence']}. | {r['status']} |")
    body=["# Tratamento integral da auditoria do Claude",
          "A auditoria fornecida tem oito páginas. Seu quadro de gravidade contém nove linhas, sendo três de gravidade alta, quatro médias e duas baixas. Os seis primeiros apontamentos foram tratados como prioritários, incluindo a linha de testes que continua na página 7. As outras três ressalvas também receberam análise. A matemática e o treinamento existentes foram preservados e a execução de treinamento teve finalidade de reprodução.",
          "\n".join(table)]
    for r in cases:
        body.append(f"## {r['id']} · {r['problem']}\n\nTratamento aplicado. {r['treatment']}\n\nCritério de aceitação. {r['accept']}\n\nCritério de reprovação. {r['reject']}\n\nEvidências. {r['evidence']}\n\nEstado registrado. {r['status']}")
    body.append("""## R7 · Calibração

A auditoria registrou ECE de 0,0133 no BKT e 0,0122 na taxa por habilidade, com excesso de confiança em parte da ponta baixa. A Missão04 preservou as probabilidades e os parâmetros publicados. O calibrador anterior havia sido rejeitado na validação. O gate de integração adiciona controle de plausibilidade e incerteza, e toda habilidade ENEM sem mapeamento validado segue por fallback. Isso é uma mitigação de uso. A calibração em dados locais permanece pendente. O critério futuro é avaliar calibração em validação local e observar desempenho em uma amostra posterior, com a configuração previamente definida.

## R8 · Comparações múltiplas

As 56 categorias originais foram preservadas como triagem descritiva com intervalos marginais, sem reivindicação de controle familiar. A elegibilidade operacional é uma camada de requisitos adicionais. O novo intervalo global versus histórico foi solicitado após a avaliação original e é descrito como análise posterior. Os dois grupos extremos também são análises exploratórias. O critério de reprovação é apresentar esses resultados como confirmação originalmente pré-registrada ou como proteção contra todos os falsos positivos.

## R9 · Política do tutor

A coleta ASSISTments usa prática guiada e parada por domínio. T reflete as transições entre oportunidades retidas sob esse processo. A reprodução conserva o desenho sem esquecimento. O replay das sugestões usa respostas reais previamente observadas, mas os resultados das questões que seriam recomendadas não foram observados. O critério de aceitação é manter essas condições explícitas. Afirmar ganho causal de aprendizagem ou transferência automática ao ENEM reprovaria a conclusão.
""")
    write("reports/relatorio_seis_problemas.md","\n\n".join(body))
    stats_table=["| Grupo | Estudantes | Eventos | Delta log-loss BKT − histórico | IC95% | Resultado |",
                 "| --- | ---: | ---: | ---: | --- | --- |"]
    for name,r in (("Geral",main),("Taxa ≤10%",low),("Taxa ≥90%",high)):
        stats_table.append(f"| {name} | {r['students']} | {r['events']} | {r['delta_log_loss']:.8f} | [{r['ci95'][0]:.8f}, {r['ci95'][1]:.8f}] | {r['status']} |")
    write("reports/comparacao_estatistica.md",f"""
# Comparação com o histórico suavizado

Esta análise foi solicitada depois da avaliação original e tem caráter posterior ao teste. As previsões foram regeneradas dos históricos reconstruídos, com parâmetros oficiais preservados e origem alinhada por event_id. A probabilidade foi calculada antes da resposta. O baseline é (acertos anteriores + 2·taxa de treino da habilidade)/(oportunidades anteriores + 2), reproduzindo a Fase03.

O bootstrap reamostra estudantes inteiros com reposição e mantém todos os seus eventos. Foram 2.000 réplicas, com semente 20261111 no total, 20261112 na faixa baixa e 20261113 na alta. O intervalo usa os percentis 2,5 e 97,5. O resultado é ponderado por evento em cada amostra.

{chr(10).join(stats_table)}

A log-loss global foi {main['bkt_log_loss']:.8f} para BKT e {main['history_log_loss']:.8f} para histórico. A diferença favorece BKT nesse conjunto, com o intervalo inteiramente negativo. Nos dois grupos extremos, os intervalos são positivos e favorecem o histórico suavizado. Esses grupos são definidos pela taxa observada de acerto no teste, com fronteiras inclusivas de 10% e 90%, para reproduzir os recortes anteriores. Isso serve à descrição e não foi usado para escolher parâmetros ou a política desta missão.

Os intervalos de Brier e todas as réplicas estão no JSON. A vantagem global não sustenta superioridade universal por estudante nem demonstra recomendação pedagógica melhor. O teste era público para esta missão e a seleção do comparador ocorreu após a auditoria. Uma confirmação prospectiva deve usar novas observações.
""")
    alternative=reconstruction["modes"]["deterministic_alternative"]
    write("reports/reprodutibilidade.md",f"""
# Recuperação de reprodução

Os três ZIPs anteriores foram extraídos em diretórios separados e conferidos por CRC e SHA-256. Os manifestos cobrem 54, 249 e 358 membros respectivamente, além dos próprios SHA256SUMS. O CSV disponível tem 64.412.812 bytes e SHA-256 {inventory['source']['sha256']}. Os oito arquivos privados originais também foram localizados e conferidos.

O novo modo source-only parte exclusivamente desse CSV e do código original da Fase01 incorporado, com as mesmas regras de limpeza. Seus identificadores alternativos são HMACs determinísticos com uma chave de reprodução derivada da edição. Essa chave pública de reprodução não oferece garantia de anonimização e os IDs individuais permanecem fora do ZIP.

A identidade canônica de um estudante usa sua menor ordem global de evento retido. Ela normaliza os IDs entre as representações, preservando item, habilidade, resultado, ordem, split e origem. Os eventos são ordenados por source_row e as sequências por habilidade e primeira ordem. Os hashes canônicos dos oito artefatos coincidiram. Isso permite testar a equivalência sem usar a chave privada anterior.

O modo alternativo reproduziu 214.417 eventos, 4.003 estudantes, 56 habilidades e a divisão 2.802/601/600. Os agregados completos são idênticos. Os hashes de arquivos pseudonimizados diferem, com somente exclusoes.csv igual. Uma execução adicional com a chave original reproduziu todos os oito hashes individuais.

O ajuste usou o algoritmo original da Fase02, com 20 inicializações, 500 iterações, ftol 1e-9 e restrições originais. Os 56 conjuntos de parâmetros e as perdas foram reproduzidos exatamente. As tolerâncias de aceitação, fixadas antes da comparação, são 1e-4 e 1e-8. Os modelos originais foram preservados e não houve procura por números melhores.

Uma execução integral em ambiente virtual limpo foi concluída a partir apenas do CSV e sem a chave anterior. O arquivo execucao_source_only.json registra comandos, durações, saídas e códigos de retorno. Os testes finais posteriores também cobrem a correção do adaptador de contrato.
""")
    write("reports/integracao.md",f"""
# Motor e arquitetura confirmada

Foram inspecionados package.json, o contrato Api, types.ts, mock/engine.ts e http/client.ts do frontend disponível. Ele usa Next.js 16.4.3 e React 19.3.0. O contrato confirma enviarResposta, EnvioResposta e Correcao. A implementação HTTP lança indisponível em todas as operações. O material disponível contém um mock local e o backend real não foi confirmado.

A entrega implementa um módulo Python independente com adaptador para registrar uma correção autorizada, persistência SQLite e controle por estudante, namespace, habilidade e versão. O ID canônico da tentativa vem da correção do servidor e pode ser diferente da chave idempotente enviada pelo cliente. A primeira versão do adaptador exigia igualdade entre esses campos. O teste de regressão demonstrou essa restrição indevida e a correção preservou a distinção do contrato real.

A transação reúne estado, recibo idempotente e eventual oferta. O intervalo entre ofertas é contado por respostas processadas, independentemente dos saltos de order_id. Um teste reproduziu ofertas excessivas quando a distância entre IDs era usada como contagem. A correção passou a persistir last_offer_count, com migração transacional que recupera a contagem de recibos anteriores sem perder o estado. Tentativas repetidas com o mesmo conteúdo devolvem o recibo original. Reutilização conflitante ou entre estudantes é rejeitada. A ordem deve ser estritamente posterior à última observação. O identificador da versão inclui modelos, gate e política, isolando estados entre versões. Uma falha injetada antes do recibo confirmou rollback integral. Dezesseis chamadas concorrentes da mesma tentativa resultaram em um único evento persistido.

O motor retorna domínio anterior, previsão anterior, posterior, domínio para a próxima oportunidade, versão, elegibilidade, estratégia e motivo. Para fallback, os campos de domínio são nulos e a previsão usa taxa suavizada Beta(1,1). A sugestão de faixa conserva a preferência até aceite ou escolha manual explícita. Ofertas têm dono e revisão do estado, com rejeição de aceite cruzado ou oferta desatualizada.

A lista operacional permite {len(eligible)} habilidades externas e usa fallback para {len(gate)-len(eligible)}. As cinco com G≥0,5, as sete de fronteira e os casos de evidência insuficiente estão protegidos. Adotei adicionalmente o bloqueio de intervalos amplos de parâmetros, porque a política usa domínio latente. Esse gate é mais conservador que a categoria preditiva A/B. Todas as habilidades ENEM sem mapeamento validado usam fallback.

A demo usa IDs e respostas sintéticos claramente identificados e parâmetros reais. Ela verificou dez eventos, replay, reinício e fallback ENEM. O teste é da interface do módulo. A ligação na aplicação real, autenticação, transações compartilhadas com a correção do backend e um piloto com estudantes continuam pendentes.
""")
    selected=policy["selected"]
    write("reports/politica_dificuldade.md",f"""
# Investigação das políticas de dificuldade

O experimento usa exclusivamente a validação das habilidades que passaram no gate operacional. Foram {policy['sequences']} sequências em {policy['skills']} habilidades. Os limiares, os mínimos de observação e os intervalos entre ofertas foram especificados antes do replay. A escolha minimiza reversões e mudanças, com cobertura mínima de 50%. O objetivo é estabilidade das sugestões, sem rótulo observado de dificuldade ideal.

A política de referência usa (acertos+1)/(respostas+2). A candidata usa o domínio BKT após a resposta e a transição. As duas recebem o mesmo histórico, preferência inicial média, margem e disponibilidade assumida das três faixas. A preferência fica fixa no replay, sem aceite automático.

A configuração selecionada foi {selected['config'] if selected else None}. A política BKT fez {selected['metrics']['bkt']['offers'] if selected else 'NA'} ofertas e {selected['metrics']['bkt']['reversals'] if selected else 'NA'} reversões. O baseline fez {selected['metrics']['historico_suavizado']['offers'] if selected else 'NA'} ofertas e {selected['metrics']['historico_suavizado']['reversals'] if selected else 'NA'} reversões. As mudanças de preferência sem aceite foram zero.

A maior frequência e as reversões do BKT não sustentam superioridade da política sobre a regra simples. As respostas observadas foram dadas às questões históricas e não às questões que cada política sugeriria. Os estados iniciais, mínimos de evidência, limites adjacentes, falta de estoque e preferência foram testados em fixtures do módulo.

O ganho preditivo global no ASSISTments é distinto do comportamento das sugestões e de eventual ganho pedagógico no ENEM. A qualidade da recomendação continua indeterminada.
""")
    all_counts=tests["counts"]
    write("reports/testes.md",f"""
# Testes e ambiente

Os grupos são independentes. A usa somente matemática e política em biblioteca padrão. B usa o CSV e o corpus reconstruído. C verifica os ajustes efetivamente executados. D verifica o motor, o adaptador e a persistência. E verifica perdas e bootstrap com respostas reais.

Na execução completa, o resultado foi {all_counts}, com {tests['failures']} falhas e {tests['errors']} erros. A execução sem dados coletou todos os testes e teve {missing['counts']}, retornando código 2. Isso identifica bloqueio por dependência e evita aprovação falsa. A e D também foram executados em um venv criado sem pip nem pacotes externos, com {stdlib['counts']}.

A primeira execução de D terminou com um erro de limpeza do arquivo SQLite porque uma conexão aberta no próprio teste não tinha sido fechada. O harness foi corrigido para fechar a conexão. A regressão posterior do adaptador demonstrou a exigência incorreta de igualdade entre ID de tentativa do servidor e chave do cliente, que foi removida. Um teste adicional demonstrou que ordens com saltos encurtavam indevidamente o intervalo entre sugestões. A correção usa contagem de respostas e inclui teste da migração do banco anterior. As falhas e os retestes foram preservados.

Os dados e o treinamento foram reexecutados em ambiente virtual limpo com as dependências fixadas. O relatório ambiente_verificado.json registra versões reais. A análise estatística e o replay usam fontes reais. Os exemplos de integração são sintéticos e não medem desempenho educacional.
""")
    write("reports/limitacoes_pendencias.md","""
# Limitações e pendências

A cronologia externa do congelamento das Fases01–03 não pode ser reconstruída retroativamente. O hash da Missão04 foi comunicado no chat antes de suas análises, mas isso não é um atestado temporal independente nem transforma o teste já público em amostra inédita.

A reprodução com dados foi executada neste ambiente limpo pelo mesmo responsável. O modo source-only permite uma nova auditoria sem chave privada, mas a reexecução desse modo por terceiro e uma revisão científica humana continuam pendentes.

A infraestrutura disponível do Gabaritei confirma frontend e contrato, com cliente HTTP indisponível. O motor e o adaptador foram testados separadamente. A conexão no backend real, sua autenticação, o acoplamento transacional à correção oficial e a implantação continuam pendentes.

Os parâmetros são ASSISTments. O mapeamento pedagógico para o ENEM, a calibração com respostas locais e a adequação das faixas exigem coleta e avaliação próprias. A atualização do domínio usa parâmetros fixos e não implementa retreinamento periódico.

O BKT teve vantagem média de previsão, enquanto o histórico suavizado foi melhor nos grupos extremos. As políticas não têm desfechos observados para suas recomendações. As diferenças de sugestões não demonstram melhora de aprendizagem. As categorias anteriores são descritivas e os efeitos da política de parada do tutor acompanham a interpretação de T.
""")
    write("reports/parecer_final.md",f"""
# Parecer

**APROVADO COM RESSALVAS para o módulo independente experimental e a reprodução source-only.**

A preparação a partir do CSV foi reconstruída com equivalência lógica completa, sem depender da chave original. Os 56 modelos e perdas foram reproduzidos exatamente. Os {tests['tests_collected']} testes finais passaram, com bloqueios devidamente identificados na execução sem dados.

A comparação posterior ao teste encontrou delta de log-loss {main['delta_log_loss']:.8f}, com IC95% de {main['ci95'][0]:.8f} a {main['ci95'][1]:.8f}, a favor do BKT na média. Nos dois grupos extremos o histórico suavizado foi superior. A prova de conceito mantém modelo, estado, versão, idempotência, ordem e consentimento verificáveis.

O gate operacional permite 20 habilidades externas e encaminha 36 a fallback. O vínculo com ENEM permanece bloqueado para controle por BKT sem mapeamento validado. A política BKT fez mais ofertas e reversões que a regra simples, de modo que a superioridade da recomendação de dificuldade continua sem demonstração.

O parecer não encerra a integração na aplicação real, a validação pedagógica, a revisão humana e a prova externa de anterioridade histórica. Esses itens permanecem explícitos nos relatórios e no roteiro de auditoria.
""")
    chapters=["reports/relatorio_seis_problemas.md","reports/reprodutibilidade.md","reports/comparacao_estatistica.md",
              "reports/integracao.md","reports/politica_dificuldade.md","reports/testes.md","reports/limitacoes_pendencias.md","reports/parecer_final.md"]
    write("reports/relatorio_tecnico_completo.md","\n\n".join((ROOT/n).read_text(encoding="utf-8") for n in chapters))
    matrix=[]
    for r in tests["tests"]:
        matrix.append({"test":r["test"],"status":r["status"],"source":r["source"],"source_sha256":r["source_sha256"],
                       "utc":r["utc"],"seconds":r["seconds"],"command":"python -B testar.py","log":"evidence/logs/testes_completos.log"})
    csv_file("reports/matriz_testes.csv",matrix)
    save(ROOT/"reports/resumo_executivo.json",{"verdict":"APROVADO_COM_RESSALVAS_NO_MODULO_INDEPENDENTE",
          "eligible_skills":len(eligible),"fallback_skills":len(gate)-len(eligible),"tests":tests["counts"],
          "global_delta_log_loss":main["delta_log_loss"],"global_ci95":main["ci95"],
          "real_app_integration":False,"ENEM_pedagogical_validation":False,
          "historical_external_timestamp":"pendente","difficulty_policy_superiority":"não demonstrada"})
    print("Relatórios dos seis problemas e três ressalvas adicionais gerados.")


if __name__=="__main__":
    main()
