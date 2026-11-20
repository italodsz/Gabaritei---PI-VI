import csv
import json
import sys
from collections import defaultdict
from pathlib import Path

import numpy as np
from scipy.special import expit, logit

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent / "validacao_adaptativa"))
import avaliar as old

CONFIG = json.loads((ROOT / "protocolo.json").read_bytes())
METHODS = ("taxa", "hibrido_antigo", "bkt_item", "elo_item", "rasch", "hibrido_item")
GRID = np.linspace(-4, 4, 81)
PROFILES = ("progressivo","rapido","queda","queda_gradual","irregular","por_habilidade",
            "estavel_facil","estavel_medio","estavel_dificil")


class Estimator:
    def __init__(self):
        self.history = defaultdict(list)
        self.items = set()
        self.families = set()
        self.states = {}

    def record(self, item, family, skill, difficulty, answer):
        if item in self.items or family in self.families or answer not in (0,1):
            return False
        self.items.add(item)
        self.families.add(family)
        self.history[skill].append(answer)
        mastery, elo, weights = self.states.get(skill, (old.R["params_bkt"][0], 0., np.exp(-GRID**2/2)))
        _, learn, guess, slip = old.R["params_bkt"]
        emission = expit(logit([guess,1-slip])-difficulty)
        likelihood = emission if answer else 1-emission
        posterior = mastery*likelihood[1]/np.dot([1-mastery,mastery],likelihood)
        mastery = posterior+(1-posterior)*learn
        elo += .35*(answer-expit(elo-difficulty))
        p = expit(GRID-difficulty)
        weights = weights*(p if answer else 1-p)
        weights /= weights.sum()
        self.states[skill] = mastery,elo,weights
        return True

    def predict(self, skill, method, difficulty):
        mastery, elo, weights = self.states.get(skill,(old.R["params_bkt"][0],0.,np.exp(-GRID**2/2)))
        weights = weights/weights.sum()
        _, _, guess, slip = old.R["params_bkt"]
        emission = expit(logit([guess,1-slip])-difficulty)
        bkt = np.dot([1-mastery,mastery],emission)
        rasch = np.dot(weights,expit(GRID-difficulty))
        return {"bkt_item":bkt,"elo_item":expit(elo-difficulty),"rasch":rasch,
                "hibrido_item":.5*(bkt+rasch)}[method]


class Policy:
    def __init__(self, preference, kind):
        self.selected = preference
        self.kind = kind
        self.last = {}
        self.previous = {}

    def offer(self, skill, n, target):
        direction = int(np.sign(target-self.selected))
        old_direction, old_n = self.previous.get(skill,(0,-1))
        self.previous[skill] = (direction,n)
        if n < CONFIG["minimum_families"] or not direction or n-self.last.get(skill,-100)<CONFIG["cooldown"]:
            return None
        if self.kind=="persistencia" and (direction!=old_direction or n<=old_n):
            return None
        self.last[skill]=n
        return self.selected+direction

    def respond(self, offer, accept):
        if accept and offer in (0,1,2):
            self.selected=offer


def generate():
    for generator in CONFIG["generators"]:
        for seed in CONFIG["seeds"]:
            rng = np.random.default_rng(seed)
            for profile in PROFILES:
                for level in range(3):
                    for rep in range(3):
                        yield generator, seed, profile, level, rep, rng.random(36)


def experiment():
    rows=[]
    for generator,seed,profile,level,rep,uniforms in generate():
        legacy=old.Session(level)
        model=Estimator()
        policies={(m,p):Policy(level,p) for m in METHODS for p in CONFIG["policies"]}
        for t,u in enumerate(uniforms):
            skill="MT:algebra" if t%3 else "CN:outra"
            theta=old.trajectory(profile,t,skill)
            truth_p=(expit(theta-old.DIFF) if generator=="logistic_original"
                     else .18+.82*expit(np.array([.7,1.4,1.8])*(theta-old.DIFF)))
            truth=int(np.argmin(abs(truth_p-CONFIG["target"])))
            y=int(u<truth_p[level])
            for method in METHODS:
                if method in ("taxa","hibrido_antigo"):
                    target,n,_,ability=legacy.estimate(skill, "taxa" if method=="taxa" else "hibrido")
                    p=expit(ability-old.DIFF)
                else:
                    p=np.array([model.predict(skill,method,d) for d in old.DIFF])
                    n=len(model.history[skill])
                    target=int(np.argmin(abs(p-CONFIG["target"])))
                for kind in CONFIG["policies"]:
                    policy=policies[method,kind]
                    offer=policy.offer(skill,n,target)
                    effective=level if offer is None else offer
                    rows.append(dict(generator=generator,seed=seed,profile=profile,chosen=level,
                        replicate=rep,step=t,skill=skill,method=method,policy=kind,truth=truth,
                        theta=theta,expected_p=float(truth_p[effective]),oracle_p=float(truth_p[truth]),
                        suggested=effective,offered=offer is not None,recommended=offer,
                        estimated=target if n>=8 else None,effective=policy.selected,
                        ability_proxy=float(logit(np.clip(p[1],.001,.999))+old.DIFF[1]),
                        direct_correct=int(target==truth) if n>=8 else None,
                        next_answer=y,next_probability=float(p[level])))
            legacy.record(t,skill,level,y)
            model.record(t,t,skill,old.DIFF[level],y)
    return rows


def summary(rows):
    result=old.summarize(rows)
    direct=[r["direct_correct"] for r in rows if r["direct_correct"] is not None]
    result["direct_accuracy_covered"]=float(np.mean(direct))
    result["response_brier"]=float(np.mean([(r["next_answer"]-r["next_probability"])**2 for r in rows]))
    return result


def main():
    rows=experiment()
    report={}
    for gen in CONFIG["generators"]:
        for kind in CONFIG["policies"]:
            cohorts={m:[r for r in rows if r["generator"]==gen and r["policy"]==kind and r["method"]==m]
                     for m in METHODS}
            for method,subset in cohorts.items():
                delta=defaultdict(list)
                for a,b in zip(subset,cohorts["taxa"]):
                    key=a["seed"],a["profile"],a["chosen"],a["replicate"]
                    delta[key].append(int(a["suggested"]==a["truth"])-int(b["suggested"]==b["truth"]))
                diffs=np.array([np.mean(v) for v in delta.values()])
                ci=np.quantile(np.random.default_rng(42).choice(diffs,(2000,len(diffs))).mean(1),[.025,.975])
                report[f"{gen}/{kind}/{method}"]={"overall":summary(subset),"paired_ci95":ci.tolist(),
                    "gain":float(diffs.mean()),
                    "by_profile":{p:summary([r for r in subset if r["profile"]==p]) for p in PROFILES},
                    "by_skill":{s:summary([r for r in subset if r["skill"]==s]) for s in ("MT:algebra","CN:outra")}}
    (ROOT/"resultados.json").write_text(json.dumps(report,indent=2),encoding="utf8")
    with (ROOT/"trajetorias.csv").open("w",encoding="utf8",newline="") as file:
        writer=csv.DictWriter(file,fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    for key,value in report.items():
        print(key,round(value["overall"]["accuracy"],4),round(value["overall"]["inadequate_challenge"],4),
              round(value["gain"],4),value["paired_ci95"])


if __name__=="__main__":
    main()
