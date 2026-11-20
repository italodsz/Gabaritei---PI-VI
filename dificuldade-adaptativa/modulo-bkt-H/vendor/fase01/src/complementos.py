"""Export eligibility decisions and training-only sensitivity to aid and repeats."""
import argparse
import json
from pathlib import Path

from .common import config, csv_write, json_rows, json_write
from .estatisticas import eligibility
from .sequencias import sequences


def decisions(public):
    out = []
    m = json.loads((public / "manifesto_dados.json").read_bytes())
    for s in json.loads((public / "habilidades.json").read_bytes()):
        fields = {k: s[k] for k in ("skill_id","estudantes","eventos","itens","sequencias",
             "sequencias_5_mais","acertos","erros_ou_ajuda","taxa_acertos","comprimento_medio",
             "comprimento_mediano","sequencias_unitarias","repeticoes_item_aluno_habilidade",
             "principal","brando","estrito")}
        out.append({**fields, "motivos": "|".join(s["criterios_nao_atendidos"])})
    for skill in m["habilidades_sem_treino"]:
        out.append({**dict.fromkeys(out[0],None),"skill_id":skill,"estudantes":0,"eventos":0,
                    "principal":False,"brando":False,"estrito":False,"motivos":"sem_eventos_no_treino"})
    csv_write(public/"decisoes_habilidades.csv",list(out[0]),sorted(out,key=lambda r:int(r["skill_id"])))


def sensitivity(private, public):
    training = list(json_rows(private/"eventos_treino.jsonl"))
    retained_first = {}
    for e in training:
        retained_first.setdefault((e["student_id"],e["item_id"]),e)
    splits = {"principal": training,
              "sem_ajuda_primeira_acao": [e for e in training if e["aid_on_first_nullable"] is False],
              "primeira_exposicao_ao_item": list(retained_first.values())}
    result = {}
    for name, ev in splits.items():
        seq = list(sequences(ev))
        accepted = [s["skill_id"] for s in eligibility(ev,seq,config()["thresholds"]) if s["principal"]]
        result[name] = {"eventos":len(ev),"sequencias":len(seq),"habilidades_elegiveis":accepted}
    item_sets = {s:{e["item_id"] for e in json_rows(private/f"eventos_{s}.jsonl")}
                 for s in ("treino","validacao","teste")}
    result["sobreposicao_itens_sem_rotulos"] = {
        s: {"compartilhados_com_treino":len(items & item_sets["treino"]),
            "fora_do_treino":len(items-item_sets["treino"])}
        for s,items in item_sets.items() if s!="treino"}
    json_write(public/"sensibilidade.json",result)


if __name__ == "__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("private",type=Path)
    parser.add_argument("public",type=Path)
    args=parser.parse_args()
    decisions(args.public)
    sensitivity(args.private,args.public)
    print("Decisões por habilidade e sensibilidades de treino exportadas.")
