"""Generate the scientific figures from executed training and validation artifacts."""
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from bkt.common import ROOT,PARAMETERS

plt.rcParams.update({"font.family":"DejaVu Sans","font.size":10,"svg.hashsalt":"gabaritei-bkt02"})
OUT=ROOT/"reports/graficos"


def finish(fig,name):
    OUT.mkdir(parents=True,exist_ok=True)
    fig.tight_layout()
    fig.savefig(OUT/f"{name}.png",dpi=135)
    fig.savefig(OUT/f"{name}.svg",metadata={"Date":None})
    plt.close(fig)


def main():
    model=json.loads((ROOT/"models/parametros_por_habilidade.json").read_bytes())["skills"]
    validation=json.loads((ROOT/"reports/validacao.json").read_bytes())
    bootstrap=json.loads((ROOT/"reports/bootstrap.json").read_bytes())["skills"]
    skills=sorted(model,key=int)
    values=np.array([[model[s]["parameters"][k] for k in PARAMETERS] for s in skills])
    fig,axs=plt.subplots(2,2,figsize=(10,7))
    for i,(ax,k) in enumerate(zip(axs.flat,PARAMETERS)):
        ax.hist(values[:,i],bins=np.linspace(0,1,11),color="#176d7a",edgecolor="white")
        ax.set(title=k,xlabel="Probabilidade estimada",ylabel="Habilidades (n)")
    fig.suptitle("Distribuição dos quatro parâmetros · 56 habilidades")
    finish(fig,"01_parametros")
    fig,ax=plt.subplots(figsize=(11,6))
    for s in skills:
        e=model[s]
        runs=[json.loads(l) for l in (ROOT/f"evidence/initializations/skill_{s}.jsonl").read_text(encoding="utf8").splitlines()]
        run=runs[e["best_initialization"]]
        curve=run["objective_history"]
        ax.plot(range(1,len(curve)+1),curve,alpha=.3,linewidth=1)
    ax.set(title="Convergência · inicialização selecionada por habilidade",xlabel="Iteração SLSQP",
           ylabel="NLL média por evento de treino")
    finish(fig,"02_convergencia")
    fig,ax=plt.subplots(figsize=(12,6))
    for i,s in enumerate(skills):
        runs=[json.loads(l) for l in (ROOT/f"evidence/initializations/skill_{s}.jsonl").read_text(encoding="utf8").splitlines()]
        delta=[max(0,r["mean_nll"]-model[s]["mean_nll"])+1e-12 for r in runs]
        ax.scatter([i]*len(delta),delta,s=10,alpha=.5,color="#176d7a")
    ax.set_xticks(range(len(skills)),skills,rotation=90,fontsize=7)
    ax.set_yscale("log")
    ax.set(title="Variação de objetivo entre 20 inicializações",xlabel="Habilidade ASSISTments",
           ylabel="NLL média − melhor NLL média + 10⁻¹²")
    finish(fig,"03_inicializacoes")
    improvement=[validation["skills"][s]["baseline"]["log_loss"]-validation["skills"][s]["bkt"]["log_loss"] for s in skills]
    fig,ax=plt.subplots(figsize=(11,12))
    ax.barh(range(len(skills)),improvement,color=["#176d7a" if x>=0 else "#b85634" for x in improvement])
    ax.set_yticks(range(len(skills)),skills,fontsize=8)
    ax.axvline(0,color="black",linewidth=.7)
    ax.set(title="Validação preliminar por habilidade",xlabel="Log-loss baseline − BKT · positivo favorece BKT",
           ylabel="Habilidade ASSISTments")
    finish(fig,"04_validacao_habilidade")
    fig,axs=plt.subplots(1,2,figsize=(12,5))
    for name,color in (("bkt","#176d7a"),("baseline","#b85634")):
        bins=[r for r in validation["micro"][name]["calibration"] if r["n"]]
        axs[0].plot([r["predicted"] for r in bins],[r["observed"] for r in bins],"o-",label=name,color=color)
        axs[1].plot([r["predicted"] for r in bins],[r["n"] for r in bins],"o-",label=name,color=color)
    axs[0].plot([0,1],[0,1],"--",color="gray",label="Calibração ideal")
    axs[0].set(title="Calibração · validação",xlabel="Probabilidade média prevista",ylabel="Frequência observada de acerto",
               xlim=(0,1),ylim=(0,1))
    axs[1].set(title="Suporte dos dez intervalos fixos",xlabel="Probabilidade média prevista",ylabel="Eventos por intervalo")
    axs[1].set_yscale("log")
    for ax in axs: ax.legend()
    finish(fig,"05_calibracao")
    fig,axs=plt.subplots(2,2,figsize=(14,9))
    for ax,k in zip(axs.flat,PARAMETERS):
        r=[bootstrap[s]["parameters"][k] for s in skills]
        med=np.array([x["median"] for x in r])
        lo=np.array([x["q025"] for x in r])
        hi=np.array([x["q975"] for x in r])
        ax.errorbar(range(len(skills)),med,yerr=[med-lo,hi-med],fmt=".",capsize=2,color="#176d7a")
        ax.set_xticks(range(0,len(skills),3),skills[::3],rotation=90,fontsize=7)
        ax.set(title=k,xlabel="Habilidade ASSISTments",ylabel="Mediana e percentis 2,5–97,5%",ylim=(0,1))
    fig.suptitle("Estabilidade · 100 reamostragens de estudantes por habilidade")
    finish(fig,"06_bootstrap")
    fig,ax=plt.subplots(figsize=(12,5))
    ax.bar(range(len(skills)),[model[s]["training_events"] for s in skills],color="#176d7a")
    ax.set_xticks(range(len(skills)),skills,rotation=90,fontsize=7)
    ax.set(title="Suporte do treinamento por habilidade",xlabel="Habilidade ASSISTments",ylabel="Eventos de treino (n)")
    finish(fig,"07_suporte")
    fig,ax=plt.subplots(figsize=(10,6))
    for k in PARAMETERS:
        ax.scatter([model[s]["training_events"] for s in skills],
                   [bootstrap[s]["parameters"][k]["width"] for s in skills],label=k,alpha=.7,s=28)
    ax.set_xscale("log")
    ax.set(title="Volume de dados e dispersão dos parâmetros",xlabel="Eventos de treino (escala log)",
           ylabel="Largura do intervalo empírico 2,5–97,5%")
    ax.legend(title="Parâmetro")
    finish(fig,"08_volume_incerteza")
    print("Oito figuras em PNG e SVG geradas de artefatos executados.")


if __name__=="__main__":
    main()
