import json

import numpy as np

from busca_autonoma import PROFILES, ROOT, TARGET, old, probabilities


def ceiling(minimum, cooldown, max_step, generator):
    hits = total = 0
    for profile in PROFILES:
        for chosen in range(3):
            for skill in ("MT:algebra","CN:outra"):
                targets = [
                    int(np.argmin(abs(probabilities(old.trajectory(profile,t,skill),generator)-TARGET)))
                    for t in range(36) if (t%3!=0)==(skill=="MT:algebra")
                ]
                n = len(targets)
                best = [0]*(n+cooldown+1)
                for i in range(n-1,-1,-1):
                    best[i] = int(targets[i]==chosen)+best[i+1]
                    if i>=minimum and 0<abs(targets[i]-chosen)<=max_step:
                        skip = sum(v==chosen for v in targets[i+1:i+cooldown])
                        best[i] = max(best[i],1+skip+best[i+cooldown])
                hits += best[0]
                total += n
    return hits/total


if __name__=="__main__":
    configurations={"politica_atual":(8,4,1),"posterior":(4,4,2)}
    policy=json.loads((ROOT/"busca_politica.json").read_bytes())
    cooldown, minimum, step=policy["variants"][policy["selected"]]
    configurations["politica_buscada"]=(minimum,cooldown,step)
    result={name:{g:ceiling(*config,g) for g in ("logistic","3pl")}
            for name,config in configurations.items()}
    (ROOT/"teto_protocolo.json").write_text(json.dumps(result,indent=2),encoding="utf8")
    print(result)
