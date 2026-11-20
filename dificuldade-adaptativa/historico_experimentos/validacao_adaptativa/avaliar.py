import csv
import json
from pathlib import Path

import numpy as np
from scipy.special import expit, logit

ROOT = Path(__file__).resolve().parent
P = json.loads((ROOT / "protocolo.json").read_bytes())
R = json.loads((ROOT.parent / "viabilidade/fechamento.json").read_bytes())
METHODS = ("manter", "taxa", "bkt", "sgd", "hibrido", "elo")
MODELS = {name: R["models"][key]["selected_test_change"]["before"]
          for name, key in (("sgd", "sgd"), ("hibrido", "bkt_sgd"))}
DIFF = np.array(P["synthetic_item_difficulties"])


class Session:
    def __init__(self, selected):
        self.selected = selected
        self.history = {}
        self.last_offer = {}

    def record(self, item, skill, level, answer):
        if item in self.history or skill is None or answer not in (0, 1):
            return False
        self.history[item] = skill, level, answer
        return True

    def estimate(self, skill, method):
        rows = [(level, y) for s, level, y in self.history.values() if s == skill]
        initial, learn, guess, slip = R["params_bkt"]
        state, theta = initial, 0.
        for level, answer in rows:
            p = state*(1-slip)+(1-state)*guess
            state = state*((1-slip) if answer else slip)/(p if answer else 1-p)
            state += (1-state)*learn
            theta += .35*(answer-expit(theta-DIFF[level]))
        rate = (sum(y for _,y in rows)+1)/(len(rows)+2)
        bkt_p = state*(1-slip)+(1-state)*guess
        if method in MODELS:
            inputs = [np.log1p(len(rows)), rate, 1.]
            if method == "hibrido":
                inputs.insert(0, bkt_p)
            anchor = float(expit(np.dot(inputs, MODELS[method])))
        else:
            anchor = {"bkt":bkt_p, "elo":float(expit(theta)), "taxa":rate,
                      "manter":.7}[method]
        ability = float(logit(np.clip(anchor,.001,.999)))
        probabilities = expit(ability-DIFF)
        estimated = int(np.argmin(abs(probabilities-P["target_probability"])))
        if method == "taxa":
            estimated = int(np.clip(self.selected + (1 if rate > .75 else -1 if rate < .45 else 0),0,2))
        if method == "manter":
            estimated = self.selected
        return estimated, len(rows), state, ability

    def advise(self, skill, method, available=(0,1,2)):
        level, n, mastery, ability = self.estimate(skill,method)
        last = self.last_offer.get(skill,-100)
        offer = None
        next_level = self.selected + int(np.sign(level-self.selected))
        if n >= P["minimum_unique_items"] and n-last >= P["cooldown_unique_items"]:
            if level != self.selected and next_level in available:
                offer = next_level
                self.last_offer[skill] = n
        reason = ("evidencia_insuficiente" if n < P["minimum_unique_items"] else
                  "manter" if level == self.selected else "ajuste_proposto" if offer is not None
                  else "indisponivel_ou_intervalo")
        return {"estimated": level if n >= P["minimum_unique_items"] else None,
                "selected": self.selected, "recommended":offer, "effective":self.selected,
                "confidence":"insuficiente" if n < P["minimum_unique_items"] else "exploratoria",
                "unique":n,"mastery":mastery,"ability_proxy":ability,"reason":reason,
                "candidate_levels":[self.selected] if self.selected in available else [],
                "model_version":"fase2-exp-v1"}

    def choose(self, level):
        if level not in (0,1,2):
            raise ValueError("Nível inválido")
        self.selected = level

    def respond(self, advice, accept):
        if accept and advice["selected"] == self.selected and advice["recommended"] is not None:
            self.choose(advice["recommended"])


def oracle(theta):
    return int(np.argmin(abs(expit(theta-DIFF)-P["target_probability"])))


def trajectory(profile,t,skill):
    if profile == "progressivo":
        return -1.8 + min(t/18,1)*3.3
    if profile == "rapido":
        return -1.6 if t < 10 else 1.6
    if profile == "queda":
        return 1.6 if t < 12 else -1.7
    if profile == "queda_gradual":
        return 1.6-min(t/24,1)*3.3
    if profile == "irregular":
        return 1.4*np.sin(t/3)
    if profile == "por_habilidade":
        return 1.6 if skill=="MT:algebra" else -1.6
    return {"estavel_facil":-1.3,"estavel_medio":0.,"estavel_dificil":1.5}[profile]


def run_simulation():
    rows = []
    profiles = ("progressivo","rapido","queda","queda_gradual","irregular","por_habilidade",
                "estavel_facil","estavel_medio","estavel_dificil")
    for seed in P["seeds"]:
        rng = np.random.default_rng(seed)
        for profile in profiles:
            for chosen in range(3):
                for replicate in range(3):
                    sessions = {m:Session(chosen) for m in METHODS}
                    for t in range(36):
                        skill = "MT:algebra" if t % 3 else "CN:outra"
                        theta = trajectory(profile,t,skill)
                        truth = oracle(theta)
                        probabilities = expit(theta-DIFF)
                        # All policies observe the same logged path with the explicit level fixed.
                        answer = int(rng.random() < probabilities[chosen])
                        for method, session in sessions.items():
                            advice = session.advise(skill,method)
                            recommendation = advice["recommended"]
                            effective = chosen if recommendation is None else recommendation
                            rows.append(dict(seed=seed, profile=profile, chosen=chosen, replicate=replicate,
                                step=t, skill=skill, method=method, truth=truth, theta=theta,
                                expected_p=float(probabilities[effective]), oracle_p=float(probabilities[truth]),
                                suggested=effective, offered=recommendation is not None,
                                **advice))
                            assert session.record(t,skill,chosen,answer)
    return rows


def summarize(rows):
    y = np.array([r["truth"] for r in rows])
    p = np.array([r["suggested"] for r in rows])
    chosen = np.array([r["chosen"] for r in rows])
    covered = [r for r in rows if r["estimated"] is not None]
    probs = np.array([r["expected_p"] for r in rows])
    groups = {}
    for row in rows:
        groups.setdefault((row["seed"],row["profile"],row["chosen"],row["replicate"],row["skill"]),[]).append(row)
    delays = {"up":[], "down":[]}
    missed = {"up":0,"down":0}
    switches = repeated = offers = 0
    for seq in groups.values():
        switches += sum(a["suggested"]!=b["suggested"] for a,b in zip(seq,seq[1:]))
        emitted = [r["recommended"] for r in seq if r["offered"]]
        offers += len(emitted)
        repeated += sum(a==b for a,b in zip(emitted,emitted[1:]))
        for direction, sign in (("up",1),("down",-1)):
            for i in range(len(seq)-2):
                if (i==0 or np.sign(seq[i-1]["truth"]-seq[i-1]["chosen"])!=sign) and all(
                    np.sign(r["truth"]-r["chosen"])==sign for r in seq[i:i+3]
                ):
                    segment = []
                    for r in seq[i:]:
                        if np.sign(r["truth"]-r["chosen"])!=sign:
                            break
                        segment.append(r)
                    detected = next((r["step"]-seq[i]["step"] for r in segment
                                     if np.sign(r["suggested"]-r["chosen"])==sign),None)
                    if detected is None:
                        missed[direction]+=1
                    else:
                        delays[direction].append(detected)
    return {"n":len(rows),"accuracy":float(np.mean(y==p)), "difficulty_error":float(np.mean(y!=p)),
            "inadequate_challenge":float(np.mean((probs<P["challenge_band"][0])|(probs>P["challenge_band"][1]))),
            "false_change_when_adequate":float(np.mean(p[y==chosen]!=chosen[y==chosen])) if (y==chosen).any() else None,
            "direction_precision":{str(d):float(np.mean(np.sign(y-chosen)[np.sign(p-chosen)==d]==d))
                                   if (np.sign(p-chosen)==d).any() else None for d in (-1,0,1)},
            "coverage":len(covered)/len(rows),
            "latent_proxy_mae":float(np.mean([abs(r["ability_proxy"]-r["theta"]) for r in covered])) if covered else None,
            "oscillations":switches, "repeat_rate":repeated/offers if offers else 0.,
            "autonomy_violations":sum(r["effective"]!=r["chosen"] for r in rows),
            "detection":{k:{"detected":len(v),"missed":missed[k],"median_steps":float(np.median(v)) if v else None}
                         for k,v in delays.items()}}


def main():
    rows = run_simulation()
    results = {}
    for method in METHODS:
        subset = [r for r in rows if r["method"]==method]
        results[method] = {"overall":summarize(subset),
                           "by_profile":{p:summarize([r for r in subset if r["profile"]==p])
                                         for p in sorted({r["profile"] for r in subset})},
                           "by_skill":{s:summarize([r for r in subset if r["skill"]==s])
                                       for s in sorted({r["skill"] for r in subset})}}
    simple = max(("manter","taxa"),key=lambda m:results[m]["overall"]["accuracy"])
    trajectories = {}
    for r in rows:
        if r["method"] in ("hibrido",simple):
            key = r["seed"],r["profile"],r["chosen"],r["replicate"]
            trajectories.setdefault(key,[]).append((1 if r["method"]=="hibrido" else -1)*int(r["truth"]==r["suggested"]))
    diffs = np.array([sum(v)/(len(v)/2) for v in trajectories.values()])
    rng = np.random.default_rng(42)
    ci = np.quantile(rng.choice(diffs,(2000,len(diffs))).mean(1),[.025,.975]).tolist()
    report = {"results":results,"best_simple":simple,"hybrid_gain":float(diffs.mean()),
              "paired_trajectory_ci95":ci,"synthetic_trajectories":len(diffs),
              "real_data_reference":{k:R["models"][k]["test"]["baseline"] for k in ("sgd","bkt_sgd")},
              "real_bkt":R["bkt"],"global_update_evidence":R["models"]["bkt_sgd"]["selected_test_change"]}
    (ROOT/"resultados.json").write_text(json.dumps(report,indent=2),encoding="utf8")
    with (ROOT/"trajetorias.csv").open("w",encoding="utf8",newline="") as file:
        writer = csv.DictWriter(file,fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    print(simple,report["hybrid_gain"],ci)
    print({m:{k:round(results[m]["overall"][k],4) for k in ("accuracy","inadequate_challenge","coverage")}
           for m in METHODS})


if __name__=="__main__":
    main()
