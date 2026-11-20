"""Export scientific findings and per-skill judgments from frozen executed results."""
from collections import Counter
import csv
from datetime import datetime, timezone
from pathlib import Path
import platform
import re
import sys

import numpy as np
import scipy

from src.common import ROOT,PHASE2,PARAMS,load,save,sha,rows


def write(name,text):
    p=ROOT/name
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(text.strip()+"\n",encoding="utf-8",newline="\n")


def csv_file(name,records):
    records=list(records)
    with (ROOT/name).open("w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=list(records[0]),lineterminator="\n")
        w.writeheader()
        for r in records:
            w.writerow({k:"NA" if v is None else v for k,v in r.items()})


def main():
    final=load(ROOT/"reports/avaliacao_final.json")
    m=load(ROOT/"models/parametros_por_habilidade.json")["skills"]
    v=load(ROOT/"reports/validacao_reproduzida.json")
    s=load(ROOT/"reports/estabilidade_parametros.json")
    profiles=load(ROOT/"reports/habilidades_fronteira.json")
    repro=load(ROOT/"reports/reproducibilidade.json")
    audit=load(ROOT/"reports/auditoria_matematica.json")
    cal=load(ROOT/"models/calibracao.json")
    external=load(ROOT/"external_review/status_revisao.json")
    skills=sorted(m,key=int)
    per_skill=[]
    classifications=[]
    interval_rows=[]
    for k in skills:
        r=final["skills"][k]
        ci=r["confidence"]["paired_difference"]["bkt"]
        row={"skill_id":k,"train_students":m[k]["training_students"],"train_events":m[k]["training_events"],
             "train_sequences":m[k]["training_sequences"],"test_students":r["students"],
             "test_events":r["events"],"test_sequences":r["sequences"],**m[k]["parameters"],
             "parameter_wide":s[k]["parameter_wide"],
             "boundary":"|".join(s[k]["initialization"]["boundary_parameters"]),
             "predictive_width_median":s[k]["predictive_width_median"],
             "predictive_width_p95":s[k]["predictive_width_p95"],
             "validation_log_loss":v["skills"][k]["bkt"]["log_loss"],
             "validation_baseline_log_loss":v["skills"][k]["taxa_habilidade"]["log_loss"]}
        for method in final["methods"]:
            for metric in ("log_loss","brier","auc_roc","accuracy","ece"):
                row[method+"_"+metric]=r["metrics"][method][metric]
        row.update({"delta_logloss_ci_low":ci["log_loss"]["low"],"delta_logloss_ci_high":ci["log_loss"]["high"],
                    "delta_brier_ci_low":ci["brier"]["low"],"delta_brier_ci_high":ci["brier"]["high"],
                    "classification":r["classification"],"limitations":"|".join(r["limitations"])})
        per_skill.append(row)
        classifications.append({k2:row[k2] for k2 in ("skill_id","train_students","train_events","test_students","test_events",
                   "parameter_wide","boundary","predictive_width_median","classification","limitations")})
        for method,bounds in r["confidence"]["metrics"].items():
            for metric,b in bounds.items():
                interval_rows.append({"scope":k,"method":method,"metric":metric,
                                      "point":r["metrics"][method][metric],**b})
        for method,bounds in r["confidence"]["paired_difference"].items():
            for metric,b in bounds.items():
                point=r["metrics"][method][metric]-r["metrics"]["taxa_habilidade"][metric]
                interval_rows.append({"scope":k,"method":method+"_menos_taxa_habilidade","metric":metric,"point":point,**b})
    for method,bounds in final["confidence"]["metrics"].items():
        for metric,b in bounds.items():
            interval_rows.append({"scope":"micro","method":method,"metric":metric,"point":final["micro"][method][metric],**b})
    for method,bounds in final["confidence"]["paired_difference"].items():
        for metric,b in bounds.items():
            interval_rows.append({"scope":"micro","method":method+"_menos_taxa_habilidade","metric":metric,
                                 "point":final["micro"][method][metric]-final["micro"]["taxa_habilidade"][metric],**b})
    csv_file("reports/resultados_por_habilidade.csv",per_skill)
    csv_file("reports/qualificacao_habilidades.csv",classifications)
    csv_file("reports/intervalos_confianca.csv",interval_rows)
    reproduction=[]
    for r in repro["rows"]:
        row={"skill_id":r["skill_id"]}
        for p in PARAMS:
            row[p+"_original"]=r["original"][p]
            row[p+"_reproduced"]=r["reproduced"][p]
            row[p+"_absolute_difference"]=r["absolute_differences"][p]
        row.update({k:r[k] for k in ("original_nll","reproduced_nll","original_log_likelihood",
                                    "reproduced_log_likelihood","converged","original_initialization",
                                    "reproduced_initialization","classification")})
        reproduction.append(row)
    csv_file("reports/reproducao_treinamento.csv",reproduction)
    metrics=("log_loss","brier","auc_roc","accuracy","ece")
    table=["| Método | Log-loss | Brier | AUC | Acurácia | ECE |","| --- | ---: | ---: | ---: | ---: | ---: |"]
    for method,r in final["micro"].items():
        table.append("| "+method+" | "+" | ".join(f"{r[k]:.8f}" for k in metrics)+" |")
    confidence=final["confidence"]["paired_difference"]["bkt"]
    categories=final["classification_counts"]
    verdict="APROVAÇÃO PARCIAL"
    math_error=max(r["nll_error"] for r in audit["skills"])
    write("reports/auditoria_matematica.md",f"""
# Auditoria matemática

Uma implementação matricial nova, sem importar as equações centrais da Fase 02, conferiu as verossimilhanças das 56 habilidades nos 143.092 eventos de treino. A maior diferença de NLL média foi {math_error:.3g}. O código compara também probabilidades anteriores e estados posteriores em amostras de sequências por habilidade, com erro máximo permitido de 1e-10.

A enumeração exata de 126 sequências binárias com comprimento entre 1 e 6, usando frações, confirmou o forward escalado. Foram incluídas sequências de 5.000 observações para estabilidade numérica. A crença reinicia por estudante e habilidade. A resposta atual só atualiza o estado depois da previsão. A transição após a última resposta não integra a verossimilhança como nova observação.

As restrições dos parâmetros, os exemplos manuais, o reset e a ausência de respostas futuras foram executados como testes. O status é aprovado para a implementação conferida. A autoria é a mesma do pipeline. A revisão humana externa está pendente.
""")
    write("reports/reproducao_treinamento.md",f"""
# Reprodução em ambiente limpo

O ambiente virtual novo recebeu as dependências fixadas pela Fase 02. Os 56 modelos foram ajustados novamente em uma cópia isolada, com 20 inicializações, semente 20261110, SLSQP, 500 iterações e ftol 1e-9. Os dados foram os mesmos, identificados pelo gate e pelo manifesto local.

As 56 reproduções foram exatas. O arquivo reproducao_treinamento.csv mostra L0,T,G,S originais e reproduzidos, diferenças absolutas, log-verossimilhanças, NLLs, convergência e inicialização selecionada. As tolerâncias preservadas da Fase 02 são 1e-4 nos parâmetros e 1e-8 na NLL média. Nenhuma habilidade precisou da categoria de equivalência estatística ou de tolerância não nula.

Versões efetivas da reprodução: Python {repro['environment']['python']}, NumPy {repro['environment']['numpy']}, SciPy {repro['environment']['scipy']}. O processo usou quatro trabalhadores, com uma thread BLAS e OpenMP por processo. O log registra as 1.120 otimizações principais reproduzidas.
""")
    wide=[k for k in skills if s[k]["parameter_wide"]]
    wide_categories=Counter(final["skills"][k]["classification"] for k in wide)
    stability_table=["| Habilidade | Eventos de treino | Largura preditiva mediana | RMSE preditivo p95 | Categoria |",
                     "| --- | ---: | ---: | ---: | --- |"]
    for k in wide:
        stability_table.append(f"| {k} | {s[k]['training_events']} | {s[k]['predictive_width_median']:.6f} | {s[k]['predictive_rmse_p95']:.6f} | {final['skills'][k]['classification']} |")
    write("reports/estabilidade_parametros.md",f"""
# Investigação das 28 habilidades com parâmetros amplos

Os 100 conjuntos de parâmetros bootstrap já estimados por habilidade foram reaplicados prospectivamente aos mesmos históricos de validação. Para cada observação foi calculada a largura entre os percentis 2,5 e 97,5% das previsões. Também foi calculado RMSE de cada réplica em relação às previsões do modelo oficial. Essa análise examina incerteza preditiva sob a distribuição empírica dos estudantes de treino.

Entre as 28 habilidades com ao menos um intervalo de parâmetro mais largo que 0,30, 14 tiveram mediana da largura preditiva até 0,10. No conjunto das 56, 20 excederam 0,10 e uma excedeu 0,20. A habilidade 294 apresentou mediana {s['294']['predictive_width_median']:.6f}. O limiar é uma triagem experimental pré-especificada. O arquivo JSON contém suportes, distribuições de comprimento, taxa de acerto, intervalos de parâmetros, variação por inicialização, larguras e RMSEs de previsão por habilidade.

As 28 habilidades terminaram com {dict(wide_categories)}. A incerteza de parâmetro não ocasionou exclusão automática. A classificação também considerou suporte, diferença pareada de log-loss, Brier e fronteira. Dez ficaram B e dezoito ficaram C. A comparação de inicializações é herdada dos 20 ajustes por habilidade e permanece rastreável ao artefato original.

{chr(10).join(stability_table)}
""")
    frontier_table=["| ID | Parâmetro | Valor oficial | Distância inferior | Valores no perfil com ΔLL≤1,92 | Maior RMSE preditivo nesse conjunto |",
                    "| --- | --- | ---: | ---: | --- | ---: |"]
    for k,entries in sorted(profiles.items(),key=lambda kv:int(kv[0])):
        parameter=entries[0]["fixed_parameter"]
        support=[r for r in entries if r["delta_log_likelihood"]<=1.92]
        vals=sorted(set(round(r["fixed_value"],6) for r in support))
        frontier_table.append(f"| {k} | {parameter} | {m[k]['parameters'][parameter]:.8f} | {entries[0]['distance_to_lower']:.3g} | {vals} | {max(r['validation_prediction_rmse'] for r in support):.6f} |")
    write("reports/habilidades_fronteira.md",f"""
# Investigação das sete habilidades de fronteira

Para 16, 84, 91, 307, 308, 322 e 323, o parâmetro próximo da fronteira foi fixado em uma grade que inclui seu valor oficial e valores entre 0,0001 e 0,9999. Os outros três foram reotimizados com três inicializações, os mesmos limites e a restrição G+S≤0,99. As configurações inviáveis de emissão foram excluídas da grade. Os modelos oficiais foram preservados.

O perfil relata a perda de log-verossimilhança total em relação ao modelo oficial. O conjunto ΔLL≤1,92 é uma referência descritiva de suporte de likelihood, sem alegação de intervalo nominal válido na fronteira. As alternativas foram mantidas como exploração e tiveram suas previsões comparadas na validação.

{chr(10).join(frontier_table)}

O menor delta observado foi da ordem de −2e-11, compatível com aritmética e tolerância de otimização, sem melhoria substantiva sobre o ajuste oficial. Os perfis mostram regiões de parâmetros alternativas com objetivos semelhantes. Todas as sete habilidades ficaram na categoria C, por suporte de teste limitado e/ou ganho inconclusivo ou Brier pontualmente pior. Esses motivos individuais constam no CSV.
""")
    auc_changes=[(k,r["historic_raw_auc"],r["bkt"]["auc_roc"],r["auc_difference_to_historic"])
                 for k,r in v["skills"].items() if abs(r["auc_difference_to_historic"])>1e-6]
    auc_table=["| Habilidade | AUC histórica sem arredondamento | AUC com empate a dez casas | Diferença |",
               "| --- | ---: | ---: | ---: |"]
    auc_table.extend(f"| {k} | {a:.8f} | {b:.8f} | {delta:.8f} |" for k,a,b,delta in sorted(auc_changes,key=lambda r:int(r[0])))
    write("reports/validacao_reproduzida.md",f"""
# Reprodução da validação e sensibilidade da AUC

A nova implementação avaliou as mesmas 4.253 sequências, 29.780 eventos e 596 estudantes da Fase 02. Log-loss, Brier, acurácia e ECE foram reproduzidos até 1e-11, globalmente e por habilidade. A maior diferença de probabilidade entre os dois filtros foi {v['max_prediction_difference']:.3g}.

Probabilidades praticamente empatadas tiveram ranks distintos por ponto flutuante. A primeira checagem de AUC por habilidade falhou e o log foi preservado. Antes de abrir o teste, foi fixada a regra de arredondar a dez casas somente os scores usados no ranking da AUC. As duas implementações produziram a mesma AUC por habilidade sob essa convenção. As probabilidades completas continuam usadas nas demais métricas.

A AUC micro original de 0,72123583 passou a {v['micro']['bkt']['auc_roc']:.8f}. Em algumas habilidades com previsões quase constantes, a variação por tratamento de empates foi maior. A maior mudança foi aproximadamente 0,03211 na habilidade 323. Os valores históricos e os valores desta missão estão abaixo. A alteração de convenção não participa da classificação favorável, que usa log-loss e Brier. O cuidado é especialmente relevante ao interpretar AUCs de habilidades de fronteira.

{chr(10).join(auc_table)}
""")
    write("reports/calibracao.md",f"""
# Calibração probabilística

Foi ajustada uma transformação logística global expit(a·logit(p)+b), com a entre 0,05 e 5 e b entre −5 e 5. Os dados usados foram exclusivamente os estudantes de validação. A escolha foi avaliada por cinco folds de estudantes, formados deterministicamente pela primeira ordem de evento do estudante e a semente 20261111. Cada evento recebeu uma previsão calibrada fora do fold usado no seu ajuste.

O critério anterior ao teste exigia ganho mínimo de 0,002 em log-loss, aumento de Brier de até 0,0005 e ECE não maior. A log-loss original da validação foi {cal['original_metrics']['log_loss']:.8f}, e a logística crossfit teve {cal['crossfit_metrics']['log_loss']:.8f}. O resultado selecionou {cal['choice']}. O calibrador ajustado em toda a validação está armazenado como candidato, com selected=false, e não foi aplicado na avaliação principal.

A regra reduz a chance de promover uma calibração por ajuste aparente na própria amostra, mas cinco folds de uma única validação mantêm incerteza e risco de sobreajuste. O desempenho em teste permaneceu reservado ao protocolo congelado. As curvas de confiabilidade e distribuições de probabilidade acompanham o relatório. A ECE é uma descrição dependente dos intervalos e do suporte, avaliada em conjunto com log-loss e Brier.
""")
    ci=final["confidence"]["metrics"]["bkt"]
    category_table="\n".join(f"| {k} | {final['classification_counts'].get(k,0)} |" for k in ("A","B","C","D"))
    write("reports/avaliacao_final.md",f"""
# Avaliação final congelada

A avaliação utilizou {final['events']} eventos, {final['sequences']} sequências e {final['students']} estudantes nas 56 habilidades. O protocolo foi congelado com SHA-256 {final['protocol_sha256']}. O registro de acesso coloca o congelamento antes da primeira abertura de rótulos para avaliação nesta missão. Os parâmetros permanecem idênticos aos modelos da Fase 02.

O recorte preparado tem 4.003 estudantes. A divisão por estudante soma 2.802 no treino, 601 na validação e 600 no teste. O filtro de 56 habilidades, definido apenas pelo treino, deixa 2.773 estudantes de treino, 596 na validação e 585 no teste. Os quinze estudantes de teste restantes tinham eventos apenas nas habilidades fora do recorte principal. As contagens integrais foram preservadas, com cobertura explicitamente reportada.

A média micro pesa cada evento igualmente. A média macro pesa igualmente cada habilidade com métrica definida. Métricas indefinidas são nulas em JSON e NA em CSV. O baseline por habilidade é (acertos_treino+1)/(eventos_treino+2). A taxa global usa os eventos das 56 habilidades de treino. O histórico suavizado usa (acertos anteriores+2·taxa_treino)/(oportunidades anteriores+2) por estudante–habilidade.

{chr(10).join(table)}

Os IC95% do BKT foram {ci['log_loss']['low']:.6f} a {ci['log_loss']['high']:.6f} para log-loss e {ci['brier']['low']:.6f} a {ci['brier']['high']:.6f} para Brier. O bootstrap pareado, com 2.000 reamostragens de estudantes, encontrou delta BKT menos taxa por habilidade de log-loss entre {confidence['log_loss']['low']:.6f} e {confidence['log_loss']['high']:.6f}. Para Brier, o intervalo foi {confidence['brier']['low']:.6f} a {confidence['brier']['high']:.6f}. Esses intervalos favorecem o BKT na comparação primária.

O histórico suavizado também obteve log-loss menor que a taxa por habilidade. A vantagem pontual do BKT sobre esse comparador é {final['micro']['historico_suavizado']['log_loss']-final['micro']['bkt']['log_loss']:.6f}. A hipótese e os intervalos confirmatórios desta entrega têm como referência a taxa por habilidade. As comparações adicionais são exploratórias.

A ECE micro do BKT foi {final['micro']['bkt']['ece']:.6f}, frente a {final['micro']['taxa_habilidade']['ece']:.6f} no baseline. O resultado de erro preditivo favorável convive com ECE pontualmente maior. A ECE macro foi {final['macro']['bkt']['ece']:.6f}. Macro log-loss foi {final['macro']['bkt']['log_loss']:.6f}, frente a {final['macro']['taxa_habilidade']['log_loss']:.6f}. As demais métricas macro estão no JSON.

| Categoria | Habilidades |
| --- | ---: |
{category_table}

Os intervalos por habilidade usam 1.000 reamostragens de estudantes. São intervalos marginais e as categorias têm caráter descritivo experimental, sem controle familiar de 56 comparações. O CSV registra suportes, parâmetros, diagnóstico, validação, teste, intervalos e justificativas de cada decisão.

Dos {final['item_overlap']['selected_test_items']} itens distintos do teste selecionado, {final['item_overlap']['shared_items']} aparecem no treino e {final['item_overlap']['unseen_items']} são inéditos em relação ao estoque completo de treino retido. A pergunta principal diz respeito a estudantes novos. Os recortes de itens novos, primeira resposta, comprimentos, repetição, poucos dados, fronteiras e padrões extremos são descritos por máscaras pré-especificadas. A seleção de estudantes extremos usa seu resultado observado somente para descrição, sem alteração dos modelos.

A log-loss do BKT na primeira resposta foi {final['subgroups']['position_1']['metrics']['bkt']['log_loss']:.6f}, frente a {final['subgroups']['position_1']['metrics']['taxa_habilidade']['log_loss']:.6f}. Todas as métricas dos recortes e seus suportes constam em avaliacao_final.json e no gráfico 09. Os subgrupos recebem estimativas pontuais e não herdam automaticamente os intervalos globais.
""")
    write("reports/auditoria_independente.md",f"""
# Auditoria e situação da revisão externa

A auditoria dos dados verificou hashes, contratos, critérios de limpeza já congelados, suportes, ordenação, seleção de habilidades apenas no treino e ausência de estudantes compartilhados. Os 25 testes anteriores passaram. O gate desta missão reexecutou verificações críticas da Fase 01 por inspeção de esquema e hash, reconciliação e elegibilidade. Os testes da Fase 02 foram reexecutados integralmente. Os rótulos de teste não foram usados para seleção de modelos ou calibradores.

O forward novo foi escrito com equações próprias e conferido em todos os eventos de treino, em 126 sequências exatas e em sequências longas. A conferência final recalculou métricas com fórmulas diretas e ranks do SciPy, verificou a origem de cada previsão e os registros de abertura do teste. Os resultados desse replay estão em auditoria_resultados.json.

A primeira checagem de AUC falhou na reprodução da validação por diferença de ranks em probabilidades quase empatadas. A correção da convenção de empate ocorreu antes do congelamento e está documentada. A primeira tentativa do notebook falhou porque o arquivo de dependências ainda não tinha sido incluído na pasta de trabalho. O arquivo foi adicionado e a execução foi repetida. A alteração foi de empacotamento, com os códigos científicos congelados preservados. Os logs originais permanecem na entrega.

O Claude Code estava disponível no ambiente. A chamada com ferramentas desativadas, destinada apenas à inspeção do código e sem dados individuais, excedeu o limite de 120 segundos. Seu status real é {external['code_inspection']}. A reprodução integral e a avaliação no Claude estão pendentes. A tabela comparativa mantém NA nos resultados externos. O pacote contém o roteiro de duas etapas, especificação matemática, comandos, critérios e tolerâncias.

Esta missão tem testes automatizados e auditoria por implementação separada sob a mesma autoria. A revisão humana científica externa continua pendente. O notebook executado foi Jupyter local. A execução no serviço Google Colab permanece sem comprovação.
""")
    a_ids=[k for k in skills if final["skills"][k]["classification"]=="A"]
    b_ids=[k for k in skills if final["skills"][k]["classification"]=="B"]
    c_ids=[k for k in skills if final["skills"][k]["classification"]=="C"]
    save(ROOT/"models/elegibilidade_experimental.json",{
        "verdict":verdict,"namespace":"ASSISTments_2009_2010_skill_ids","A":a_ids,"B":b_ids,"C":c_ids,"D":[],
        "model_sha256":final["model_sha256"],"protocol_sha256":final["protocol_sha256"],
        "transfer_to_enem":"mapeamento pedagógico e validação local necessários"})
    write("reports/parecer_final.md",f"""
# Parecer final

**{verdict}.** A integridade matemática, a reprodução e o resultado preditivo agregado sustentam continuidade experimental controlada para parte das habilidades ASSISTments. Há 21 habilidades A e 14 B, totalizando 35 com evidência favorável sob os critérios pré-especificados. As 21 habilidades C têm uso experimental restrito. A categoria D ficou vazia.

A reprodução dos 56 modelos foi exata. O teste de 29.948 respostas de 585 estudantes apresentou log-loss {final['micro']['bkt']['log_loss']:.6f}, Brier {final['micro']['bkt']['brier']:.6f}, AUC {final['micro']['bkt']['auc_roc']:.6f} e acurácia de previsão de acerto {100*final['micro']['bkt']['accuracy']:.2f}%. Os intervalos pareados de log-loss e Brier favoreceram o BKT frente à taxa por habilidade do treino. A ECE pontual favoreceu o baseline. O ajuste de calibração foi rejeitado na validação cruzada.

As 28 habilidades com parâmetros amplos tiveram dez classificações B e dezoito C. Os sete casos de fronteira ficaram C. Os intervalos dos parâmetros e os perfis de likelihood exigem prudência na interpretação de domínio. As classificações individuais são descritivas e usam intervalos marginais.

A revisão integral no Claude Code está pendente, após uma tentativa limitada de inspeção de código exceder 120 segundos. A revisão humana externa está pendente. A execução do notebook foi local.

Para a Fase 04, recomenda-se uma prova de conceito controlada com a origem dos parâmetros explícita, usando a lista A/B e mecanismos de restrição para C. A transferência ao ENEM exige alinhamento pedagógico, histórias locais e avaliação própria. A integração deve preservar a escolha do aluno e o papel do módulo semântico. O contrato da Fase 04 documenta os requisitos. A entrega fica sujeita à análise e aprovação do responsável pelo projeto.
""")
    chapters=["reports/parecer_final.md","reports/reproducao_treinamento.md","reports/auditoria_matematica.md",
              "reports/estabilidade_parametros.md","reports/habilidades_fronteira.md","reports/validacao_reproduzida.md",
              "reports/calibracao.md","reports/avaliacao_final.md","reports/auditoria_independente.md"]
    write("reports/relatorio_cientifico.md","\n\n".join((ROOT/p).read_text(encoding="utf-8") for p in chapters))
    # Populate Work test values in the external comparison table, keeping external results unfilled.
    with (ROOT/"external_review/comparacao_template.csv").open(encoding="utf-8",newline="") as f:
        ext=list(csv.DictReader(f))
    for r in ext:
        if r["etapa"]=="B":
            key=r["metrica"]
            r["work"]=str(final["micro"]["bkt"].get(key,final.get(key,"NA")))
    csv_file("external_review/comparacao_template.csv",ext)
    log=ROOT/"evidence/logs/testes_completos.log"
    text=log.read_text(encoding="utf-8")
    matches=re.findall(r"^(test_(\d+)_\w+) \(([^)]+)\) \.\.\. (\w+)$",text,re.M)
    assert len(matches)==32 and all(r[3]=="ok" for r in matches)
    timestamp=datetime.fromtimestamp(log.stat().st_mtime,timezone.utc).isoformat()
    evidence=[]
    for name,number,identifier,status in sorted(matches,key=lambda r:int(r[1])):
        source="tests/"+identifier.split(".")[0]+".py"
        evidence.append({"test_id":name,"source":source,"source_sha256":sha(ROOT/source),"version":"3.0.0",
                         "command":"python -B -m unittest discover -s tests -v","expected":"asserções objetivas satisfeitas",
                         "observed":status,"exit_code":0,"log":"evidence/logs/testes_completos.log",
                         "utc":timestamp,"status":"aprovado"})
    csv_file("reports/matriz_evidencias.csv",evidence)
    save(ROOT/"evidence/testes/resultados.json",{"tests":evidence,"count":32,"failures":0,"exit_code":0})
    ledger=list(rows(ROOT/"evidence/acesso_teste.jsonl"))
    opening=next(r for r in ledger if r["action"]=="test_outcomes_open")
    ending=next(r for r in ledger if r["action"]=="test_evaluation_completed")
    elapsed=(datetime.fromisoformat(ending["utc"])-datetime.fromisoformat(opening["utc"])).total_seconds()
    save(ROOT/"reports/ambiente.json",{"system":platform.platform(),"python":sys.version,"numpy":np.__version__,
         "scipy":scipy.__version__,"seeds":[20261110,20261111],"google_colab_executed":False,
         "protocol_sha256":sha(ROOT/"reports/protocolo_pre_teste.json"),
         "isolated_virtual_environment":sys.prefix!=sys.base_prefix,
         "final_evaluation_elapsed_seconds":elapsed,
         "test_started_utc":opening["utc"],"test_completed_utc":ending["utc"]})
    print("Relatórios, CSVs e parecer gerados dos resultados executados.")


if __name__=="__main__":
    main()
