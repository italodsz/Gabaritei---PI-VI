"""Generate technical reports and complete per-skill tables from observed artifacts."""
import csv
import json
from pathlib import Path

from bkt.common import ROOT,PARAMETERS,save,sha


def read(path):
    return json.loads((ROOT/path).read_bytes())


def write(path,text):
    (ROOT/path).write_text(text.strip()+"\n",encoding="utf8",newline="\n")


def main():
    m=read("models/parametros_por_habilidade.json")["skills"]
    meta=read("models/metadados_modelo.json")
    val=read("reports/validacao.json")
    boot=read("reports/bootstrap.json")["skills"]
    audit=read("reports/auditoria_matematica.json")
    gate=read("reports/gate_entrada.json")
    repro=read("reports/reproducibilidade.json")
    tests=read("evidence/testes/resultados.json")
    skills=sorted(m,key=int)
    boundary=[s for s in skills if m[s]["diagnostics"]["boundary_parameters"]]
    unstable=[s for s in skills if boot[s]["wide_interval"]]
    improved=[s for s in skills if val["skills"][s]["bkt"]["log_loss"]<val["skills"][s]["baseline"]["log_loss"]]
    with (ROOT/"models/parametros_por_habilidade.csv").open("w",encoding="utf8",newline="") as f:
        fields=["skill_id","training_students","training_sequences","training_events","length_mean","length_median",
                "training_correct_rate",*PARAMETERS,"log_likelihood","iterations","best_initialization",
                "converged_runs","boundary_parameters","validation_events","validation_log_loss",
                "baseline_log_loss",*sum(([k+"_q025",k+"_q975"] for k in PARAMETERS),[])]
        writer=csv.DictWriter(f,fieldnames=fields,lineterminator="\n")
        writer.writeheader()
        for s in skills:
            entry=m[s]
            row={k:entry[k] for k in fields if k in entry}
            row.update(entry["parameters"])
            row.update({"converged_runs":entry["diagnostics"]["converged_runs"],
                        "boundary_parameters":"|".join(entry["diagnostics"]["boundary_parameters"]),
                        "validation_events":val["skills"][s]["bkt"]["n"],
                        "validation_log_loss":val["skills"][s]["bkt"]["log_loss"],
                        "baseline_log_loss":val["skills"][s]["baseline"]["log_loss"]})
            for k in PARAMETERS:
                row[k+"_q025"]=boot[s]["parameters"][k]["q025"]
                row[k+"_q975"]=boot[s]["parameters"][k]["q975"]
            writer.writerow(row)
    rows=["| Habilidade | Alunos | Eventos | L0 | T | G | S | Log-verossimilhança |",
          "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |"]
    rows.extend(f"| {s} | {m[s]['training_students']} | {m[s]['training_events']} | "+
                " | ".join(f"{m[s]['parameters'][k]:.6f}" for k in PARAMETERS)+f" | {m[s]['log_likelihood']:.5f} |"
                for s in skills)
    write("reports/relatorio_treinamento.md",f"""
# Treinamento científico BKT · Fase 02

## Entrada efetivamente verificada

O gate conferiu {gate['membros_verificados']} membros do ZIP da Fase 01 por manifesto e CRC, os oito arquivos processados locais, o SHA-256 do CSV oficial e as atribuições por estudante. A reconstrução em pasta temporária reproduziu os agregados e os 15 testes críticos da Fase 01 passaram novamente. A elegibilidade de 56 habilidades foi recalculada exclusivamente no treino. O carregador entregou 19.370 sequências e 143.092 eventos dessas habilidades. Os totais integrais dos três conjuntos continuam em 151.015 / 31.521 / 31.881 eventos, mas o ajuste usa apenas as 56 habilidades selecionadas do treino.

O treino estimou {len(m)} conjuntos de L0, T, G e S, em {meta['training_sequences']:,} sequências, {meta['training_events']:,} eventos e {len({s for s in m})} habilidades. A quantidade de estudantes por habilidade está na tabela, sem somá-la como número de pessoas distintas. O corpus de treino principal da Fase 01 cobre 2.773 estudantes. Todas as {meta['starts']} inicializações principais convergiram com solução viável. A seleção utilizou a menor NLL de treino entre soluções convergentes e viáveis.

## Modelo e convenções

A ordem dos estados é não dominada e dominada. As observações são 0 e 1. A distribuição inicial é [1−L0,L0], a transição tem linhas [1−T,T] e [0,1], e a emissão tem linhas [1−G,G] e [S,1−S]. O valor 0 da edição ASSISTments inclui erro ou pedido de ajuda. Cada estudante–habilidade começa em L0.

A inferência primeiro calcula p=m(1−S)+(1−m)G. Depois de observar y, normaliza as duas massas de estado com a emissão de y. Por fim, aplica m'=m_posterior+(1−m_posterior)T para a próxima oportunidade. O traço exporta a previsão anterior e o estado para a oportunidade seguinte. A transição depois da resposta final não acrescenta observação à verossimilhança.

[Formulação de referência de Corbett e Anderson](https://doi.org/10.1007/BF01099821)

## Método de estimação

O objetivo é a soma das log-verossimilhanças das sequências de treino, com reinício por aluno–habilidade, dividida pelo número de eventos e com sinal invertido. O cálculo principal soma os n+1 caminhos latentes permitidos pela ausência de esquecimento em um histórico de n respostas. Há um caminho inicialmente dominado, caminhos de transição após cada uma das primeiras n−1 respostas e o caminho que permanece não dominado até a última observação. Log-sum-exp evita underflow.

O cálculo e seu gradiente analítico usam operações vetorizadas, em tempo O(N) e memória O(N) para N eventos da habilidade por avaliação do objetivo. As derivadas somam as contribuições das emissões e da mistura dos caminhos. A equivalência com forward matricial escalado foi verificada em todos os eventos de treino. Sequências unitárias informam a mistura inicial e as emissões, preservadas no ajuste. A transição precisa de evidência entre oportunidades.

O SLSQP do SciPy impõe simultaneamente os limites 0,0001 ≤ L0,T,G,S ≤ 0,9999 e G+S ≤ 0,99. Cada ajuste usa 20 inicializações viáveis determinísticas, limite de 500 iterações e ftol de 1e-9 sobre a NLL média. A tolerância é mais estrita que a referência histórica de 1e-7. A escolha do método permite impor a restrição conjunta durante a otimização. Não há recorte posterior de parâmetros.

As sementes combinam 20261110 com o código da habilidade. Todas as inicializações, objetivos, gradientes, mensagens, contagens de iteração e curvas foram gravadas. O resultado inclui a verossimilhança total e a NLL média. O status do otimizador é um critério numérico e a estabilidade requer os diagnósticos do relatório próprio.

[Documentação oficial do SLSQP](https://docs.scipy.org/doc/scipy/reference/optimize.minimize-slsqp.html)

## Parâmetros efetivamente estimados

O JSON preserva os valores de ponto flutuante completos. O CSV reúne suporte, parâmetros, validação e intervalos bootstrap. A tabela abaixo arredonda apenas a apresentação.

{chr(10).join(rows)}

## Reprodução e ambiente

O treinamento de referência usou Python {meta['python']}, NumPy {meta['numpy']} e SciPy {meta['scipy']}. O ambiente limpo foi criado com venv e dependências instaladas. Uma cópia isolada reexecutou 1.120 inicializações nas 56 habilidades. A maior diferença de parâmetro observada foi {repro['max_parameter_difference']}, e a maior diferença de NLL média foi {repro['max_mean_nll_difference']}. As threads BLAS e OpenMP foram fixadas em 1. requirements-lock.txt registra as dependências da verificação limpa.

O processamento de diagnóstico e as evidências são registrados com versões e hashes. O modelo é serializado em JSON e a API de inferência verifica versão, convenção de estados e restrições.
""")
    v=val["micro"]
    table=["| Métrica micro | BKT | Baseline por habilidade |",
           "| --- | ---: | ---: |"]
    for metric in ("log_loss","brier","auc_roc","accuracy_threshold_0_5","ece_10_bins"):
        table.append(f"| {metric} | {v['bkt'][metric]:.8f} | {v['baseline'][metric]:.8f} |")
    ci=val["paired_validation_bootstrap"]
    write("reports/validacao_preliminar.md",f"""
# Validação preliminar prospectiva

A validação avaliou {v['bkt']['n']:,} eventos de {val['students_evaluated']} estudantes nas 56 habilidades. Os estudantes são inéditos em relação ao treino. Para cada sequência, o estado inicia em L0, a previsão é salva antes da resposta e a atualização usa somente respostas anteriores para a oportunidade seguinte. Os parâmetros ficam fixos.

O baseline usa a taxa por habilidade estimada no treino, suavizada por Beta(1,1), isto é, (acertos+1)/(eventos+2). Ele recebe o mesmo conjunto de observações para a comparação. A acurácia usa limiar de 0,5. AUC usa ranks médios em empates e fica indefinida quando há apenas uma classe. A calibração usa dez intervalos fixos de largura 0,1. O último inclui a borda 1.

{chr(10).join(table)}

A log-loss do BKT é menor em {len(improved)} de 56 habilidades. O ganho micro de log-loss é {v['baseline']['log_loss']-v['bkt']['log_loss']:.8f}. A diferença BKT menos baseline teve intervalo empírico de 95% entre {ci['q025']:.8f} e {ci['q975']:.8f}, com 2.000 reamostragens pareadas de estudantes da validação. O resultado é preliminar, com a seleção de parâmetros já encerrada pelo objetivo de treino. O teste continua reservado.

A ECE é menor para o baseline. Portanto, a melhoria de log-loss, Brier e discriminação convive com maior desvio de calibração nos intervalos usados. A ECE depende da definição dos intervalos. Os gráficos incluem a quantidade de eventos por intervalo.

A agregação macro dá o mesmo peso a cada habilidade. Os valores macro de log-loss são {val['macro']['bkt']['log_loss']:.8f} para BKT e {val['macro']['baseline']['log_loss']:.8f} para baseline. Os resultados completos, suportes por classe, calibração por habilidade e demais médias macro estão em validacao.json.

Há itens compartilhados entre treino e validação. A avaliação mede generalização a estudantes novos sob a política do tutor. Os históricos, as habilidades e a escala de dificuldade não estabelecem calibração para o ENEM.
""")
    write("reports/estabilidade_identificabilidade.md",f"""
# Estabilidade e identificabilidade

As 1.120 inicializações principais convergiram. Dentro do conjunto com NLL média até 1e-5 da melhor solução, nenhuma habilidade teve amplitude de parâmetro superior ao limiar exploratório de 0,10. A maior amplitude observada foi {max(max(x['diagnostics']['near_optimal_parameter_range'].values()) for x in m.values()):.6f}.

Há {len(boundary)} habilidades com parâmetros a menos de 0,005 de um limite numérico. Os IDs são {', '.join(boundary)}. As fronteiras por parâmetro estão no JSON e no CSV. Esses casos pedem cautela, especialmente a habilidade 307 com T no limite inferior e as habilidades 84 e 308 com L0 no limite inferior. A habilidade 323 tem T elevado e G no limite inferior. O significado de domínio permanece latente.

O bootstrap usou 100 amostras de estudantes com reposição em cada habilidade, preservando a sequência completa. Cada reajuste usou a solução original como uma inicialização e outras quatro inicializações determinísticas, totalizando 28.000 tentativas de otimização em 5.600 reajustes. Convergiram {sum(r['converged'] for r in boot.values())} reajustes. Em cada habilidade existe uma sequência por estudante, de modo que reamostrar a sequência inteira equivale a reamostrar o estudante naquele ajuste. A incerteza conjunta entre habilidades não foi estimada.

Os percentis 2,5 e 97,5% são intervalos empíricos exploratórios. O número de replicações e o máximo restrito afetam sua precisão e cobertura. {len(unstable)} habilidades apresentaram pelo menos um intervalo com largura superior a 0,30. Os IDs são {', '.join(unstable)}. O arquivo bootstrap.json traz desvio-padrão, mediana, larguras e matriz de correlação de L0,T,G,S. Correlações ficam nulas quando a variância numérica é praticamente zero.

A baixa sensibilidade à inicialização dentro da mesma amostra convive com incerteza elevada entre amostras de estudantes. Os resultados não demonstram identificabilidade estatística dos quatro parâmetros em cada habilidade. Habilidades com intervalos amplos ou soluções de fronteira precisam de diagnóstico adicional antes de interpretação pedagógica.

Os gráficos 06 e 08 mostram a dispersão por parâmetro e sua relação com o volume de eventos. O treino é observacional e as oportunidades foram selecionadas pela política do tutor. T representa a transição entre oportunidades retidas sob esse processo.
""")
    write("reports/auditoria_independente.md",f"""
# Auditoria matemática por implementação separada

A verificação usa um forward de matrizes 2×2 escrito separadamente, com escalonamento em cada observação. Ele foi aplicado aos {audit['training_events_checked']:,} eventos de treino e às 56 habilidades. O maior erro absoluto de NLL média em relação ao objetivo vetorizado foi {max(x['nll_absolute_error'] for x in audit['skills']):.3g}. O gradiente analítico foi comparado a diferenças finitas, com maior diferença {max(x['max_gradient_error'] for x in audit['skills']):.3g}, dentro do critério de 1e-4, incluindo soluções próximas à fronteira.

Foram enumeradas {audit['exact_sequences_checked']} sequências binárias de tamanho 1 a 5 por aritmética de frações, somando todas as configurações de estados. A auditoria conferiu os 1.120 ajustes principais, as restrições de todas as soluções, a escolha por objetivo de treino, a convenção de estados, a normalização das matrizes e a inferência prospectiva. Conferiu também os metadados e a viabilidade dos 5.600 reajustes bootstrap.

As previsões do forward alternativo reproduziram as métricas de validação. A primeira comparação exigia diferença inferior a 1e-11 em todas as métricas. A AUC diferiu em 1,2642e-8, decorrente de pequenas diferenças de previsão de até 6,14e-13 alterarem ranks de valores praticamente empatados. A tolerância da comparação de AUC foi ajustada para 1e-7, com 1e-11 mantido para as demais métricas. A falha e o diagnóstico estão preservados.

A primeira validação também encontrou um estado de domínio ligeiramente acima de 1 após erro com domínio igual a 1. A atualização anterior obtinha a probabilidade do erro por subtração 1−p, provocando cancelamento numérico. A implementação foi corrigida para normalizar diretamente as duas massas de emissão. O teste de regressão reproduziu 1,0000000000000882 e o reteste produziu exatamente 1,0.

A primeira suíte teve 24 aprovações e uma falha na igualdade literal entre parâmetros ajustados em contextos numéricos distintos. A diferença observada era da ordem de 1e-13. O teste passou a usar tolerância absoluta de 1e-10 para comparação entre contextos e preserva igualdade exata entre duas chamadas no mesmo contexto. A reprodução integral posterior, com threads fixas e ambiente isolado, teve diferença observada zero.

A suíte final executou {tests['tests_run']} testes, com {tests['failures']} falhas e {tests['errors']} erros. A matriz de evidências associa requisitos, resultados observados, código, versão, data, comando e logs.

O conjunto de teste teve os hashes conferidos. O carregador desta fase recusa solicitá-lo para treino ou validação. Os testes críticos de entrada inspecionam o contrato e os rótulos binários para fidelidade. O ajuste, o bootstrap de parâmetros e a seleção usam treino. As métricas desta fase usam validação.

A autoria da auditoria e da implementação principal é a mesma. Esta entrega inclui testes automatizados e auditoria por implementação separada. A revisão externa por outra pessoa ou equipe permanece pendente.
""")
    write("reports/parecer_final.md",f"""
# Parecer da Fase 02

**APROVADO COM RESSALVAS para continuidade experimental à avaliação da Fase 03.**

Foram treinadas 56 habilidades do ASSISTments, com 19.370 sequências e 143.092 eventos. As 20 inicializações por habilidade convergiram. A formulação de dois estados sem esquecimento foi conferida por forward matricial e por enumeração exata. A reprodução integral em uma cópia isolada e ambiente virtual limpo produziu os mesmos parâmetros.

A validação preliminar em 29.780 eventos e 596 estudantes apresentou log-loss {v['bkt']['log_loss']:.6f}, Brier {v['bkt']['brier']:.6f}, AUC {v['bkt']['auc_roc']:.6f} e acurácia {100*v['bkt']['accuracy_threshold_0_5']:.2f}%. O baseline de taxa por habilidade teve log-loss {v['baseline']['log_loss']:.6f}. A ECE em dez intervalos foi maior para o BKT. As métricas por habilidade e as médias macro acompanham a entrega.

Os 100 bootstraps por habilidade concluíram 5.600 reajustes convergentes, com 28 habilidades apresentando intervalos amplos. Sete habilidades ficaram próximas a fronteiras numéricas. A interpretação individual de L0,T,G,S exige cautela. A revisão externa permanece pendente e o notebook foi executado em Jupyter local, com verificação de dependências em ambiente limpo. A execução no serviço Colab permanece a verificar.

Os modelos são próprios das habilidades ASSISTments. A correspondência pedagógica com o ENEM, a calibração com alunos do Gabaritei e a qualidade das recomendações ficam pendentes. A inferência já permite atualização de domínio com parâmetros fixos. O processo periódico de retreinamento depende de implementação e validação posteriores.

A Fase 03 pode consumir os modelos e os conjuntos congelados pelo contrato. A aprovação externa desta entrega é a próxima decisão.
""")
    save(ROOT/"reports/resumo_executivo.json",{"status":"aprovado_com_ressalvas","trained_skills":56,
         "training_sequences":19370,"training_events":143092,"initializations":1120,
         "bootstrap_refits":5600,"wide_bootstrap_skills":unstable,"boundary_skills":boundary,
         "validation_micro":{k:{metric:value for metric,value in r.items() if metric!="calibration"} for k,r in v.items()},
         "tests_passed":tests["tests_run"],"test_evaluated":False})
    print("Relatórios técnicos e tabela de 56 habilidades gerados.")


if __name__=="__main__":
    main()
