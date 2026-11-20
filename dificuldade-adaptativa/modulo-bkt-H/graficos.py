"""Visual comparisons generated from the executed mission results."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from bkt04.common import ROOT,load

OUT=ROOT/"reports/graficos"


def finish(fig,name):
    OUT.mkdir(parents=True,exist_ok=True)
    fig.tight_layout()
    fig.savefig(OUT/f"{name}.png",dpi=140)
    plt.close(fig)


def main():
    r=load(ROOT/"reports/comparacao_estatistica.json")
    groups={"Geral":r["overall"],"Acerto ≤10%":r["extreme_groups"]["accuracy_le_0.1"],
            "Acerto ≥90%":r["extreme_groups"]["accuracy_ge_0.9"]}
    fig,ax=plt.subplots(figsize=(10,5))
    for i,(name,data) in enumerate(groups.items()):
        low,high=data["ci95"]
        ax.hlines(i,low,high,color="#176d7a",linewidth=2)
        ax.scatter(data["delta_log_loss"],i,color="#176d7a",s=55)
    ax.axvline(0,color="gray",linestyle="--")
    ax.set_yticks(range(len(groups)),list(groups))
    ax.set(title="BKT e histórico suavizado · comparação posterior ao teste",
           xlabel="Delta log-loss BKT − histórico · IC95% por estudante",ylabel="Grupo observado")
    finish(fig,"01_comparacao_pareada")
    gate=load(ROOT/"models/elegibilidade_integracao.json")["skills"]
    allowed=sum(r["eligible_for_experimental_difficulty"] for r in gate.values())
    fig,ax=plt.subplots(figsize=(7,5))
    ax.bar(["BKT experimental","Fallback"],[allowed,len(gate)-allowed],color=["#176d7a","#b86537"])
    ax.set(title="Triagem operacional das 56 habilidades ASSISTments",ylabel="Habilidades (n)")
    finish(fig,"02_elegibilidade")
    p=load(ROOT/"reports/politicas_validacao.json")["selected"]
    if p:
        fig,axes=plt.subplots(1,2,figsize=(11,5))
        labels=["Histórico suavizado","BKT"]
        methods=["historico_suavizado","bkt"]
        axes[0].bar(labels,[p["metrics"][m]["offers"] for m in methods],color=["#b86537","#176d7a"])
        axes[0].set(title="Ofertas de mudança",ylabel="Sugestões (n)")
        axes[1].bar(labels,[p["metrics"][m]["reversals"] for m in methods],color=["#b86537","#176d7a"])
        axes[1].set(title="Reversões entre sugestões",ylabel="Reversões (n)")
        fig.suptitle("Replay da validação · preferência fixa e sem aceite simulado")
        finish(fig,"03_politicas")
    print("Três gráficos gerados dos resultados observados.")


if __name__=="__main__":
    main()
