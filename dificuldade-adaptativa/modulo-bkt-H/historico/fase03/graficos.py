"""Scientific figures based on actual frozen evaluation outputs."""
import json
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from src.common import ROOT,load

plt.rcParams.update({"font.family":"DejaVu Sans","font.size":10,"svg.hashsalt":"gabaritei-bkt03"})
OUT=ROOT/"reports/graficos"


def finish(fig,name):
    OUT.mkdir(parents=True,exist_ok=True)
    fig.tight_layout()
    fig.savefig(OUT/f"{name}.png",dpi=130)
    fig.savefig(OUT/f"{name}.svg",metadata={"Date":None})
    plt.close(fig)


def main(local):
    final=load(ROOT/"reports/avaliacao_final.json")
    validation=load(ROOT/"reports/validacao_reproduzida.json")
    stability=load(ROOT/"reports/estabilidade_parametros.json")
    profiles=load(ROOT/"reports/habilidades_fronteira.json")
    methods=final["methods"]
    names={"bkt":"BKT","taxa_habilidade":"Taxa por habilidade","taxa_global":"Taxa global",
           "historico_suavizado":"Histórico suavizado","bkt_calibrado":"BKT calibrado"}
    colors=["#176d7a","#af5a37","#7a739c","#95a840","#986048"]
    fig,axs=plt.subplots(1,2,figsize=(12,5))
    x=np.arange(len(methods))
    for ax,metric,title in zip(axs,("log_loss","brier"),("Log-loss","Brier")):
        ax.bar(x-.18,[validation["micro"][m][metric] for m in methods],.36,label="Validação",color="#9bbbbb")
        ax.bar(x+.18,[final["micro"][m][metric] for m in methods],.36,label="Teste",color="#176d7a")
        ax.set_xticks(x,[names[m] for m in methods],rotation=25,ha="right")
        ax.set(title=title,ylabel="Erro médio por evento")
        ax.legend()
    fig.suptitle("Generalização · previsões prospectivas")
    finish(fig,"01_metricas")
    fig,axs=plt.subplots(1,2,figsize=(12,5))
    for i,m in enumerate(methods):
        bins=[b for b in final["micro"][m]["calibration"] if b["n"]]
        axs[0].plot([b["predicted"] for b in bins],[b["observed"] for b in bins],"o-",label=names[m],color=colors[i])
        axs[1].plot([b["predicted"] for b in bins],[b["n"] for b in bins],"o-",label=names[m],color=colors[i])
    axs[0].plot([0,1],[0,1],"--",color="gray")
    axs[0].set(title="Confiabilidade no teste",xlabel="Probabilidade média prevista",ylabel="Frequência observada de acerto",xlim=(0,1),ylim=(0,1))
    axs[1].set(title="Suporte por intervalo",xlabel="Probabilidade média prevista",ylabel="Eventos (escala log)")
    axs[1].set_yscale("log")
    axs[0].legend(fontsize=8)
    finish(fig,"02_calibracao")
    fig,axs=plt.subplots(1,2,figsize=(12,5))
    for ax,metric in zip(axs,("log_loss","brier")):
        alternatives=[m for m in methods if m!="taxa_habilidade"]
        points=[final["micro"][m][metric]-final["micro"]["taxa_habilidade"][metric] for m in alternatives]
        bounds=[final["confidence"]["paired_difference"][m][metric] for m in alternatives]
        ax.errorbar(points,range(len(alternatives)),
                    xerr=[[p-b["low"] for p,b in zip(points,bounds)],[b["high"]-p for p,b in zip(points,bounds)]],
                    fmt="o",color="#176d7a",capsize=4)
        ax.set_yticks(range(len(alternatives)),[names[m] for m in alternatives])
        ax.axvline(0,linestyle="--",color="gray")
        ax.set(title=metric,xlabel="Diferença para taxa por habilidade · IC95%")
    fig.suptitle("Bootstrap pareado por estudante · 2.000 réplicas")
    finish(fig,"03_intervalos")
    fig,ax=plt.subplots(figsize=(8,5))
    cats=["A","B","C","D"]
    ax.bar(cats,[final["classification_counts"].get(c,0) for c in cats],
           color=["#176d7a","#62978a","#d69c4e","#af5a37"])
    ax.set(title="Classificação experimental pré-especificada",xlabel="Categoria",ylabel="Habilidades (n)")
    finish(fig,"04_categorias")
    skills=sorted(final["skills"],key=int)
    fig,ax=plt.subplots(figsize=(11,13))
    for i,s in enumerate(skills):
        r=final["skills"][s]
        delta=r["metrics"]["bkt"]["log_loss"]-r["metrics"]["taxa_habilidade"]["log_loss"]
        ci=r["confidence"]["paired_difference"]["bkt"]["log_loss"]
        ax.errorbar(delta,i,xerr=[[delta-ci["low"]],[ci["high"]-delta]],fmt="o",capsize=2,
                    color={"A":"#176d7a","B":"#62978a","C":"#d69c4e","D":"#af5a37"}[r["classification"]])
    ax.set_yticks(range(len(skills)),[s+" · "+final["skills"][s]["classification"] for s in skills],fontsize=8)
    ax.axvline(0,color="gray",linestyle="--")
    ax.set(title="Log-loss por habilidade · intervalos marginais de 95%",
           xlabel="BKT − taxa por habilidade · 1.000 réplicas por habilidade",ylabel="Habilidade e categoria")
    finish(fig,"05_habilidades")
    fig,ax=plt.subplots(figsize=(9,6))
    for s,r in stability.items():
        width=max(v["width"] for v in r["bootstrap"]["parameters"].values())
        ax.scatter(width,r["predictive_width_median"],color="#af5a37" if r["initialization"]["boundary_parameters"] else "#176d7a",alpha=.7)
        if r["predictive_width_median"]>.15:
            ax.annotate(s,(width,r["predictive_width_median"]),fontsize=8)
    ax.axhline(.1,color="gray",linestyle="--")
    ax.axhline(.2,color="gray",linestyle=":")
    ax.set(title="Incerteza de parâmetros e previsões na validação",xlabel="Maior largura de intervalo de parâmetro",
           ylabel="Mediana da largura preditiva bootstrap")
    finish(fig,"06_estabilidade_preditiva")
    fig,axs=plt.subplots(2,4,figsize=(16,8))
    for ax,(s,records) in zip(axs.flat,profiles.items()):
        label=records[0]["fixed_parameter"]
        v=sorted([r for r in records if r["fixed_parameter"]==label],key=lambda r:r["fixed_value"])
        ax.plot([r["fixed_value"] for r in v],[r["delta_log_likelihood"] for r in v],"o-",color="#176d7a")
        ax.axhline(1.92,color="gray",linestyle="--")
        ax.set(title=f"Habilidade {s}",xlabel=f"{label} fixado",ylabel="Perda de log-verossimilhança")
    axs.flat[-1].axis("off")
    fig.suptitle("Perfis exploratórios com reotimização dos demais parâmetros")
    finish(fig,"07_fronteiras")
    data=dict(np.load(local/"predicoes_teste.npz",allow_pickle=False))
    fig,ax=plt.subplots(figsize=(11,5))
    for i,m in enumerate(methods):
        ax.hist(data[m],bins=np.linspace(0,1,21),histtype="step",density=True,label=names[m],color=colors[i],linewidth=1.5)
    ax.set(title="Distribuição das probabilidades no teste",xlabel="Probabilidade prospectiva de acerto",ylabel="Densidade")
    ax.legend()
    finish(fig,"08_probabilidades")
    fig,ax=plt.subplots(figsize=(12,9))
    groups=final["subgroups"]
    labels=list(groups)
    for i,m in enumerate(("bkt","taxa_habilidade","historico_suavizado")):
        ax.plot([groups[g]["metrics"][m]["log_loss"] if groups[g]["metrics"] else np.nan for g in labels],
                np.arange(len(labels))+(i-1)*.17,"o",label=names[m],color=colors[i])
    ax.set_yticks(range(len(labels)),labels,fontsize=8)
    ax.set(title="Subgrupos pré-especificados · análise descritiva",xlabel="Log-loss por evento",ylabel="Recorte")
    ax.legend()
    finish(fig,"09_subgrupos")
    fig,ax=plt.subplots(figsize=(10,6))
    for s in skills:
        e=load(ROOT/"models/parametros_por_habilidade.json")["skills"][s]
        ci=final["skills"][s]["confidence"]["paired_difference"]["bkt"]["log_loss"]
        ax.scatter(e["training_events"],ci["high"]-ci["low"],color="#176d7a",alpha=.7)
    ax.set_xscale("log")
    ax.set(title="Suporte de treino e incerteza do ganho no teste",xlabel="Eventos de treino (escala log)",
           ylabel="Largura do IC95% de delta log-loss")
    finish(fig,"10_suporte")
    print("Dez figuras geradas em PNG e SVG.")


if __name__=="__main__":
    import argparse
    p=argparse.ArgumentParser()
    p.add_argument("local",type=Path)
    main(p.parse_args().local)
