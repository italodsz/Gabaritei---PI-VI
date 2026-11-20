"""Create and verify the protocol before any evaluation access to test outcomes."""
from datetime import datetime, timezone
from pathlib import Path

from .common import ROOT,load,save,sha,log_access

LOCKED = ("src/common.py","src/matematica.py","src/metricas.py","src/predicoes.py","src/calibracao.py",
          "src/protocolo.py","src/avaliacao.py","avaliar_teste.py","config/decisoes.json",
          "models/parametros_por_habilidade.json","models/calibracao.json",
          "reports/estabilidade_parametros.json","reports/habilidades_fronteira.json")


def freeze():
    target = ROOT/"reports/protocolo_pre_teste.json"
    if target.exists():
        verify()
        print("Protocolo já congelado e íntegro.",sha(target))
        return
    ledger = ROOT/"evidence/acesso_teste.jsonl"
    if ledger.exists() and '"test_outcomes_open"' in ledger.read_text(encoding="utf-8"):
        raise RuntimeError("Já houve abertura do teste. Novo protocolo exigiria incidente documentado.")
    config = load(ROOT/"config/decisoes.json")
    gate = load(ROOT/"reports/gate_entrada.json")
    assert gate["status"]=="aprovado"
    calibration = load(ROOT/"models/calibracao.json")
    methods = ["bkt","taxa_habilidade","taxa_global","historico_suavizado"]
    if calibration["selected"]:
        methods.append("bkt_calibrado")
    document = {
        "version":"3.0.0","frozen_utc":datetime.now(timezone.utc).isoformat(),
        "hypothesis":config["main_hypothesis"],"primary_comparison":"bkt_menos_taxa_habilidade",
        "methods":methods,"primary_metric":"log_loss","secondary":config["secondary_metrics"],
        "definitions":config,"selection":"parâmetros BKT da Fase02, escolha de calibração por crossfit de validação",
        "calibration":calibration["choice"],"locked_sha256":{n:sha(ROOT/n) for n in LOCKED},
        "test_sha256":{n:h for n,h in gate["private_sha256"].items() if "teste" in n},
        "model_sha256":gate["model_sha256"],
        "decision":"favorável global se IC95 superior de delta log-loss <0 e delta Brier <=0; avaliação descritiva por habilidade",
        "external_review":"reprodução integral por Claude e revisão humana externa somente quando houver evidência real"}
    save(target,document)
    markdown = """# Protocolo congelado antes da avaliação final

Hipótese principal de menor log-loss do BKT em estudantes inéditos frente à taxa por habilidade do treino. Brier, AUC, acurácia com limiar 0,5 e ECE em dez intervalos fixos são métricas secundárias. Os mesmos eventos recebem todas as previsões. Para a AUC, somente os scores de ranking são arredondados a dez casas decimais, de forma a tratar empates numéricos documentados na validação. Log-loss, Brier, acurácia e ECE usam as probabilidades completas.

Os parâmetros BKT são os da Fase 02. Os baselines são taxa Beta(1,1) por habilidade, taxa global do treino e histórico suavizado do aluno–habilidade com prior de duas observações na taxa de treino. Este último usa apenas respostas anteriores. Uma calibração logística global pode ser selecionada por cinco folds de estudantes na validação se reduzir log-loss em pelo menos 0,002, com aumento de Brier de no máximo 0,0005 e ECE não superior. A seleção e os coeficientes completos estão congelados no JSON.

O bootstrap pareado reamostra estudantes com reposição e preserva todas as suas interações. São 2.000 réplicas globais e 1.000 por habilidade. A semente principal é 20261111. A análise por habilidade usa essa semente mais o ID numérico da habilidade. Os intervalos percentis são 2,5 e 97,5%, por interpolação linear. Métricas indefinidas são nulas e a quantidade de réplicas válidas é registrada. As comparações usam a mesma reamostragem para todos os métodos.

A classificação da habilidade se refere ao BKT original. D indica falha crítica ou inferioridade com os dois limites inferiores dos ICs de delta log-loss e Brier acima de zero. C indica suporte inferior a 30 estudantes ou 100 eventos, intervalo de delta log-loss incluindo zero, Brier pontualmente pior ou mediana da largura preditiva acima de 0,20. B exige superioridade em log-loss e Brier pontualmente não pior, acompanhada de alerta de fronteira, intervalo amplo de parâmetro, largura preditiva acima de 0,10 ou ECE superior a 0,10. A exige os mesmos critérios favoráveis e ausência desses alertas. Os intervalos são marginais e as categorias são descritivas experimentais, sem controle familiar das 56 comparações.

As análises de subgrupos usam primeira resposta, oportunidades posteriores, comprimentos, suporte de treino, incerteza de parâmetros, fronteiras, padrões extremos por estudante, exposição repetida e itens presentes ou ausentes do treino. São análises descritivas previamente especificadas. Os escores latentes e o desempenho observado não estabelecem validade pedagógica para o ENEM.

Os arquivos, os modelos, os coeficientes, os critérios e os códigos científicos estão identificados por SHA-256 no protocolo JSON. Os resultados originais de uma primeira abertura devem ser preservados se houver uma correção posterior. A configuração não poderá ser escolhida a partir do teste.
"""
    (ROOT/"reports/protocolo_pre_teste.md").write_text(markdown,encoding="utf-8")
    save(ROOT/"evidence/hashes/protocolo.json",{"sha256":sha(target),"file":"reports/protocolo_pre_teste.json"})
    log_access("protocol_frozen","reports/protocolo_pre_teste.json",sha256=sha(target))
    print("Protocolo congelado.",sha(target))


def verify():
    target = ROOT/"reports/protocolo_pre_teste.json"
    recorded = load(ROOT/"evidence/hashes/protocolo.json")
    if sha(target)!=recorded["sha256"]:
        raise ValueError("Protocolo alterado.")
    p = load(target)
    for filename,h in p["locked_sha256"].items():
        if sha(ROOT/filename)!=h:
            raise ValueError("Código ou insumo científico alterado após congelamento: "+filename)
    return p
