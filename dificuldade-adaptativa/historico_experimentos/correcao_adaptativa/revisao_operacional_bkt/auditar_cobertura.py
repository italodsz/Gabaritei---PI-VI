"""Audita artefatos salvos. Não importa modelos, simula ou treina."""
from collections import Counter, defaultdict
import csv
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
MODULE = HERE.parents[1]
ROOT = MODULE.parent
CAT = MODULE / "catalogo_adaptativo_operacional"
LEVELS = ("b_relativo_baixo", "b_relativo_medio", "b_relativo_alto")


def read_csv(p):
    with p.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f, delimiter=";"))


def write_csv(name, rows):
    with (HERE/name).open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]), delimiter=";")
        writer.writeheader()
        writer.writerows(rows)


def sha(p):
    with p.open("rb") as f:
        return hashlib.file_digest(f, "sha256").hexdigest()


def main():
    paths = [CAT/"auditoria_por_questao.csv", CAT/"catalogo_adaptativo_pronto.jsonl",
             CAT/"catalogo_dificuldade.csv"]
    source = ROOT/"base-oficial/Dataset/base_trabalho/data/questions.jsonl"
    data = source.read_bytes().replace(b"\r\n", b"\n")
    digest = hashlib.sha256(data).hexdigest()
    assert digest == "22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5"
    original = {r["id"]:r for r in map(json.loads, data.splitlines())}
    audit = read_csv(paths[0])
    ready = {r["id"]:r for r in map(json.loads, paths[1].read_bytes().splitlines())}
    difficulty = {r["id"]:r for r in read_csv(paths[2])}
    prior = {r["id"]:r for r in read_csv(MODULE/"revisao_pedagogica/catalogo_derivado.csv")}
    assert len(audit)==len(original)==len(difficulty)==len(prior)==2971 and len(ready)==112
    assert original.keys()==difficulty.keys()==prior.keys()=={r["id"] for r in audit}
    assert set(ready)=={r["id"] for r in audit if r["apta_exibicao_correcao"]=="True"}
    items, coverage, groups = [], Counter(), defaultdict(list)
    for row in audit:
        i = row["id"]
        raw = original[i]
        d = difficulty[i]
        assert row["area"] == raw["area"] == d["area"] and row["c6_status"] == d["c6_status"]
        labels = (row["c5_status"] == "PASSOU" and bool(row["assunto_usavel"]) and bool(row["habilidade_usavel"]))
        local = (d["apta_selecao_adaptativa"] == "True" and d["c6_status"] == "PASSOU"
                 and d["nivel_dificuldade"] in LEVELS and bool(d["escala_operacional"]) and not d["tri_alerta"])
        if local:
            assert i in ready and d["escala_operacional"] == f'{row["ano"]}/{row["co_prova"]}/{row["area"]}'
        category = "E" if i not in ready else "ABCD"[(0 if local else 2)+(0 if labels else 1)]
        subtopic = prior[i]["subassunto_original"]
        state = lambda value: "ausente" if not value else "confianca_tecnica_C5" if labels else (
            "conflito" if row["c5_status"]=="FALHOU" else "sem_confirmacao_integral_C5")
        item = dict(id=i, categoria=category, area=row["area"], status=row["status_final"],
                    familia=row["grupo_variantes"], ano=row["ano"], prova=row["co_prova"],
                    assunto=row["assunto_original"], estado_assunto=state(row["assunto_original"]),
                    subassunto=subtopic, estado_subassunto=state(subtopic),
                    habilidade=row["habilidade_original"], estado_habilidade=state(row["habilidade_original"]),
                    c5=row["c5_status"], c6=row["c6_status"], escala=d["escala_operacional"],
                    nivel=d["nivel_dificuldade"], tri_b=d["tri_b"], fonte=row["fonte_oficial"],
                    restricao_direitos=row["restricao_direitos"])
        items.append(item)
        for field in ("assunto","subassunto","habilidade"):
            coverage[category,item["area"],field,item[field] or "(ausente)",item[f"estado_{field}"]] += 1
        if local:
            groups[item["escala"]].append(item)
    write_csv("itens_por_categoria.csv",items)
    write_csv("cobertura_por_rotulo.csv",[
        dict(categoria=c,area=a,dimensao=f,rotulo=l,estado=s,n=n)
        for (c,a,f,l,s),n in sorted(coverage.items())])
    for group in groups.values():
        assert len(group)==len({r["familia"] for r in group})
    report = dict(catalogo_sha256_lf=digest, hashes={p.relative_to(ROOT).as_posix():sha(p) for p in paths},
                  categorias={c:sum(r["categoria"]==c for r in items) for c in "ABCDE"},
                  por_area={c:dict(Counter(r["area"] for r in items if r["categoria"]==c)) for c in "ABCDE"},
                  por_escala={g:{level:sum(r["nivel"]==level for r in v) for level in LEVELS}
                              for g,v in sorted(groups.items())},
                  topicos_confianca_tecnica=[r for r in items if r["categoria"] in "AC"])
    (HERE/"cobertura.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print({k:v for k,v in report.items() if k!="topicos_confianca_tecnica"})
    for key, members in sorted(groups.items()):
        print(key, [(r["id"],r["nivel"],r["categoria"],r["assunto"]) for r in members])
    print("Exemplos E", [(r["id"],r["area"],r["status"]) for r in items if r["status"]=="BLOQUEADA"][:3])


if __name__ == "__main__":
    main()
