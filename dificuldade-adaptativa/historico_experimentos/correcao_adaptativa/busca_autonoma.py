import json
from collections import defaultdict
from pathlib import Path

import numpy as np
from scipy.special import expit

from rodada import CONFIG, Estimator, Policy, PROFILES, ROOT, old

GRID = np.linspace(-4, 4, 81)
PRIOR = np.exp(-GRID**2 / 2)
PRIOR /= PRIOR.sum()
CURVES = expit(GRID[:, None] - old.DIFF)
TARGET = CONFIG["target"]
TUNE = (211, 223, 227, 229)
TEST = (307, 311, 313, 317, 331, 337)
VARIANTS = [(window, min_items, step) for window in (5, 12, 36)
            for min_items in (4, 8) for step in (1, 2)]


def probabilities(theta, generator):
    if generator == "3pl":
        return .18 + .82 * expit(np.array([.7, 1.4, 1.8]) * (theta - old.DIFF))
    return expit(theta - old.DIFF)


def posterior(history, window):
    weights = PRIOR.copy()
    for level, correct in history[-window:]:
        p = CURVES[:, level]
        weights *= p if correct else 1-p
        weights /= weights.sum()
    return weights


def advise(weights, selected, n, config):
    _, minimum, step = config
    if n < minimum:
        return None
    predicted = weights @ CURVES
    options = np.arange(max(0, selected-step), min(2, selected+step)+1)
    best = int(options[np.argmin(abs(predicted[options]-TARGET))])
    if best == selected:
        return None
    # Require posterior support for improvement and a minimum expected benefit.
    benefit = abs(CURVES[:, selected]-TARGET)-abs(CURVES[:, best]-TARGET)
    if weights @ (benefit > 0) < .60 or abs(predicted[selected]-TARGET)-abs(predicted[best]-TARGET) < .04:
        return None
    return best


def simulate(seeds, generator, variants, closed=False):
    output = defaultdict(list)
    for seed in seeds:
        rng = np.random.default_rng(seed)
        for profile in PROFILES:
            for chosen in range(3):
                for replicate in range(3):
                    uniforms = rng.random((36,2))
                    for name, config in variants.items():
                        selected = chosen
                        model = Estimator()
                        policy = Policy(chosen,"persistencia")
                        history = defaultdict(list)
                        last_offer = defaultdict(lambda: -100)
                        hits = outside = offers = false = adequate = covered = covered_hits = 0
                        changes = violations = 0
                        correct_offers = reversals = 0
                        previous_direction = {}
                        previous_target = {}
                        student_offers = 0
                        for t,(u,consent) in enumerate(uniforms):
                            skill = "MT:algebra" if t%3 else "CN:outra"
                            truth_p = probabilities(old.trajectory(profile,t,skill),generator)
                            truth = int(np.argmin(abs(truth_p-TARGET)))
                            h = history[skill]
                            n = len(h)
                            minimum = 8 if config is None else config[1]
                            if name == "taxa":
                                rate = (sum(y for _,y in h)+1)/(n+2)
                                target = int(np.clip(selected+(1 if rate>.75 else -1 if rate<.45 else 0),0,2))
                                offer = policy.offer(skill,n,target)
                            elif name == "bkt_atual" or name.startswith("bkt_politica"):
                                distances = np.array([abs(model.predict(skill,"bkt_item",d)-TARGET) for d in old.DIFF])
                                target = int(np.argmin(distances))
                                if name == "bkt_atual":
                                    offer = policy.offer(skill,n,target)
                                else:
                                    cooldown, _, max_step, *settings = config
                                    margin, support, hysteresis = (settings+[0,0,False])[:3]
                                    offer = None
                                    candidate = int(selected + np.clip(target-selected,-max_step,max_step))
                                    direction = int(np.sign(candidate-selected))
                                    repeated = previous_target.get(skill) == direction
                                    previous_target[skill] = direction
                                    confident = (not support or posterior(h,12) @ (
                                        abs(CURVES[:,selected]-TARGET)>abs(CURVES[:,candidate]-TARGET)
                                    ) >= support)
                                    if (n>=minimum and candidate!=selected and n-last_offer[skill]>=cooldown
                                        and distances[selected]-distances[candidate] >= margin
                                        and confident and (not hysteresis or repeated)):
                                        offer = candidate
                                        last_offer[skill]=n
                            else:
                                offer = advise(posterior(h,config[0]),selected,n,config)
                                if n-last_offer[skill]<4:
                                    offer = None
                                if offer is not None:
                                    last_offer[skill]=n
                            proposed = selected if offer is None else offer
                            hits += proposed==truth
                            outside += not .55<=truth_p[proposed]<=.85
                            offers += offer is not None
                            if offer is not None:
                                direction = int(np.sign(offer-selected))
                                reversals += previous_direction.get(skill,-direction)==-direction and skill in previous_direction
                                previous_direction[skill]=direction
                                correct_offers += offer==truth
                                student_offers=1
                            adequate += selected==truth
                            false += selected==truth and offer is not None
                            covered += n>=minimum
                            covered_hits += n>=minimum and proposed==truth
                            before=selected
                            accepted=closed and offer is not None and consent<.65
                            if accepted:
                                selected=offer
                                policy.selected=selected
                            violations += not accepted and before!=selected
                            changes += selected!=before
                            y=int(u<truth_p[selected])
                            h.append((selected,y))
                            if name=="bkt_atual" or name.startswith("bkt_politica"):
                                model.record(t,t,skill,old.DIFF[selected],y)
                        output[name].append([hits,outside,offers,false,adequate,covered,covered_hits,changes,violations,
                                             correct_offers,reversals,student_offers])
    return {k:np.asarray(v) for k,v in output.items()}


def metrics(rows):
    h,o,s,f,a,c,ch,changes,violations,correct,reversals,students=rows.sum(axis=0)
    n=len(rows)*36
    return {"accuracy":h/n,"outside":o/n,"offers":s/n,"false_change":f/max(a,1),
            "coverage":c/n,"covered_accuracy":ch/max(c,1),"accepted_changes":int(changes),
            "violations":int(violations),"trajectories":len(rows),
            "offer_precision":correct/s if s else None,"no_offer_rate":1-s/n,
            "student_coverage":students/len(rows),"offer_count":int(s),
            "direction_reversals":int(reversals)}


def main():
    variants={"bkt_atual":None,"taxa":None,**{str(c):c for c in VARIANTS}}
    tuned={g:simulate(TUNE,g,variants) for g in ("logistic","3pl")}
    # Select on the mean accuracy of two generators, with challenge as tie breaker.
    chosen=max((str(c) for c in VARIANTS), key=lambda k:(
        np.mean([metrics(v[k])["accuracy"] for v in tuned.values()]),
        -np.mean([metrics(v[k])["outside"] for v in tuned.values()])))
    report={"goal":.60,"tune_seeds":TUNE,"test_seeds":TEST,
            "configurations":variants,"selected":chosen,
            "validation":{g:{k:metrics(v) for k,v in rows.items()} for g,rows in tuned.items()},"test":{}}
    for g in ("logistic","3pl"):
        for closed in (False,True):
            rows=simulate(TEST,g,{k:variants[k] for k in ("taxa","bkt_atual",chosen)},closed)
            result={k:metrics(v) for k,v in rows.items()}
            for baseline in ("taxa","bkt_atual"):
                d=(rows[chosen][:,0]-rows[baseline][:,0])/36
                interval=np.quantile(np.random.default_rng(42).choice(d,(2000,len(d))).mean(1),[.025,.975])
                result[f"delta_vs_{baseline}"]={"gain":float(d.mean()),"ci95":interval.tolist()}
            report["test"][f"{g}/{'closed' if closed else 'fixed'}"]=result
    (ROOT/"busca_autonoma.json").write_text(json.dumps(report,indent=2),encoding="utf8")
    print("Selected",chosen)
    print(json.dumps(report["test"],indent=2))


if __name__=="__main__":
    main()
