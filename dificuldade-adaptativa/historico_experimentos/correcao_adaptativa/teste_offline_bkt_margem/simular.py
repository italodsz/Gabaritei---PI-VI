"""Comparação offline com IDs reais e respostas inteiramente sintéticas."""
from collections import Counter
from itertools import product
import json

import numpy as np
from scipy.special import expit

from adaptador import ANCHORS, Catalog, HERE, HISTORY, LEVELS, PROTOCOL, REV, Session, TARGET, inventory, old

METHODS = ("taxa","bkt","taxa_cadencia")


def probabilities(theta,generator):
    diff=theta-np.asarray(ANCHORS)
    return expit(diff) if generator=="logistico" else .18+.82*expit(np.asarray([.7,1.4,1.8])*diff)


def construct(catalog,scale,seed,profile,preference,rep,horizon):
    rng=np.random.default_rng([seed,profile,preference,rep])
    ordered=tuple(rng.permutation(inventory(catalog,scale)[0]).tolist())
    pool=[[i for i in ordered if catalog.items[i]["nivel"]==level] for level in LEVELS]
    offset=(preference+1+rep%2)%3
    diagnostic=[pool[(offset+k)%3].pop(0) for k in range(10)]
    draws=rng.random((10+horizon,2))
    return ordered,diagnostic,draws


def run_session(catalog,scale,method,preference,closed,generator,profile,ordered,diagnostic,draws,key):
    s=Session(catalog,scale,preference,method,diagnostic=True,session_id=key)
    assert catalog.diagnostic(diagnostic,REV,scale,preference,mixed=True)["motivo"]=="diagnostico_disponivel"
    profile_theta=np.linspace(*PROTOCOL["perfis"][profile],len(draws))
    count=Counter()
    motives=Counter()
    items=[]
    trace=[]
    for step,(u,consent) in enumerate(draws):
        probs=probabilities(profile_theta[step],generator)
        before=s.snapshot()
        if step<10:
            i=diagnostic[step]
            advice={"motivo":"diagnostico_misto_autorizado"}
            level=LEVELS.index(catalog.items[i]["nivel"])
        else:
            available=catalog.candidates(ordered,scale,s.seen_families)
            if not any(catalog.items[i]["nivel"]==LEVELS[s.preference] for i in available):
                motives["esgotamento_faixa_escolhida"]+=1
                count["encerramentos_inventario"]+=1
                break
            truth=int(np.argmin(abs(probs-TARGET)))
            advice=s.advise(available,REV)
            offer="nivel" in advice
            predicted=advice.get("nivel",s.preference)
            count["avaliadas"]+=1
            count["acertos"]+=int(predicted==truth)
            count["fora_desafio"]+=int(not .55<=probs[predicted]<=.85)
            count["ja_adequadas"]+=int(s.preference==truth)
            count["falsas_mudancas"]+=int(s.preference==truth and offer)
            count["ofertas"]+=int(offer)
            if offer:
                accept=bool(closed and consent<PROTOCOL["probabilidade_aceite_sintetico"])
                answer=s.respond(advice["oferta_id"],advice["versao"],accept,available,REV)
                assert answer==("aceita" if accept else "recusada")
                count["mudancas_aceitas"]+=int(accept and s.preference!=before["preferencia"])
                count["violacoes"]+=int(not accept and s.preference!=before["preferencia"])
            else:
                motives[advice["motivo"]]+=1
                count["violacoes"]+=int(s.preference!=before["preferencia"])
            level=s.preference
            # A bancada simula o chamador. O adaptador devolve somente a faixa.
            i=next(i for i in available if catalog.items[i]["nivel"]==LEVELS[level])
        row=catalog.items[i]
        y=int(u<probs[level])
        decision=s.record(i,REV,scale,row["familia"],y)
        assert decision==("atualizou_bkt" if method=="bkt" else "atualizou_taxa")
        items.append(i)
        if key.endswith("/amostra"):
            trace.append({"passo":step,"id":i,"familia":row["familia"],"escala":scale,"resposta_sintetica":y,
                          "faixa":level,"antes":before,"depois":s.snapshot(),"decisao":advice,
                          "origem":"simulacao"})
    assert len(items)==len(s.seen_families) and not count["violacoes"]
    assert count["ofertas"]+sum(v for k,v in motives.items() if k!="esgotamento_faixa_escolhida")==count["avaliadas"]
    return {"contagens":dict(count),"abstencoes":dict(motives),"ids_consumidos":items,
            "inventario_restante":len(ordered)-len(items),"trace":trace}


def rate(a,b):
    return a/b if b else None


def summarize(rows,horizon):
    counts=Counter()
    motives=Counter()
    for r in rows:
        counts.update(r["contagens"])
        motives.update(r["abstencoes"])
    scheduled=len(rows)*horizon
    return dict(trajetorias=len(rows),previstas=scheduled,avaliadas=counts["avaliadas"],acertos=counts["acertos"],
                acerto=rate(counts["acertos"],counts["avaliadas"]),
                acerto_por_horizonte=rate(counts["acertos"],scheduled),
                fora_desafio=rate(counts["fora_desafio"],counts["avaliadas"]),
                ofertas=counts["ofertas"],cobertura=rate(counts["ofertas"],counts["avaliadas"]),
                trajetorias_com_oferta=sum(r["contagens"].get("ofertas",0)>0 for r in rows),
                falsas_mudancas=counts["falsas_mudancas"],ja_adequadas=counts["ja_adequadas"],
                taxa_falsa_mudanca=rate(counts["falsas_mudancas"],counts["ja_adequadas"]),
                mudancas_aceitas=counts["mudancas_aceitas"],violacoes=counts["violacoes"],
                encerramentos_inventario=counts["encerramentos_inventario"],
                oportunidades_nao_avaliadas=scheduled-counts["avaliadas"],abstencoes=dict(motives),
                familias_consumidas=sum(len(r["ids_consumidos"]) for r in rows),
                inventario_restante=sum(r["inventario_restante"] for r in rows),
                ids_distintos_consumidos=sorted({i for r in rows for i in r["ids_consumidos"]}))


def paired(rows_a,rows_b,metric):
    bootstrap=PROTOCOL["bootstrap"]
    n=len(rows_a)
    indices=np.random.default_rng(bootstrap["seed"]).integers(0,n,(bootstrap["replicas"],n))
    a,b=[np.asarray([[r["contagens"].get(key,0) for key in metric] for r in rows]) for rows in (rows_a,rows_b)]
    def metric_rate(x):
        return np.divide(x[...,0],x[...,1],out=np.full(x.shape[:-1],np.nan),where=x[...,1]!=0)
    delta=metric_rate(a.sum(0))-metric_rate(b.sum(0))
    samples=metric_rate(a[indices].sum(1))-metric_rate(b[indices].sum(1))
    valid=samples[np.isfinite(samples)]
    return {"delta":float(delta) if np.isfinite(delta) else None,
            "ic95":np.quantile(valid,[.025,.975]).tolist() if len(valid) else None,"reamostras_validas":len(valid)}


def main():
    cat=Catalog()
    frozen_params=tuple(old.R["params_bkt"])
    seedlist=PROTOCOL["sementes_avaliacao"]
    prior=json.loads((HISTORY/"busca_margem.json").read_bytes())
    assert not set(seedlist)&set(prior["test_seeds"]+prior["tune"])
    assert prior["configs"][prior["selected"]]==PROTOCOL["configuracao_congelada"]
    evidence={"origem":"simulacao","hashes":cat.hashes,"parametros_bkt_congelados":old.R["params_bkt"],
              "protocol":PROTOCOL,"cenarios":{}}
    traces=[]
    with (HERE/"trajetorias.jsonl").open("w",encoding="utf8",newline="\n") as file:
        for scope,horizon in PROTOCOL["coortes"].items():
            for generator,closed in product(PROTOCOL["geradores"],(False,True)):
                scenario=f"{scope}/{generator}/{'aceite' if closed else 'fixo'}"
                data={m:[] for m in METHODS}
                for seed,(profile_n,profile),pref,rep in product(seedlist,enumerate(PROTOCOL["perfis"]),range(3),
                                                                  range(PROTOCOL["replicas_por_perfil_faixa_semente"])):
                    order,diagnostic,draws=construct(cat,scope,seed,profile_n,pref,rep,horizon)
                    for m in METHODS:
                        key=f"{seed}/{profile}/{pref}/{rep}/{m}"
                        if not data[m]:
                            key+="/amostra"
                        r=run_session(cat,scope,m,pref,closed,generator,profile,order,diagnostic,draws,key)
                        if r["trace"]:
                            traces.append({"cenario":scenario,"trajetoria":key,"passos":r.pop("trace")})
                        else:
                            r.pop("trace")
                        data[m].append(r)
                        file.write(json.dumps(dict(cenario=scenario,metodo=m,semente=seed,perfil=profile,
                                                   preferencia=pref,replica=rep,origem="simulacao",**r),
                                              ensure_ascii=False)+"\n")
                stats={m:summarize(rows,horizon) for m,rows in data.items()}
                contrasts={m:{"acerto":paired(data["bkt"],data[m],("acertos","avaliadas")),
                              "falsas_mudancas":paired(data["bkt"],data[m],("falsas_mudancas","ja_adequadas"))}
                           for m in ("taxa","taxa_cadencia")}
                evidence["cenarios"][scenario]={"metodos":stats,"contrastes_bkt":contrasts}
                print(scenario,[(m,x["avaliadas"],x["acerto"],x["taxa_falsa_mudanca"]) for m,x in stats.items()])
    evidence["amostras_de_trilha"]=traces
    assert tuple(old.R["params_bkt"])==frozen_params
    (HERE/"simulacao.json").write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+"\n",encoding="utf8")


if __name__=="__main__":
    main()
