"""Render auditable SVG charts using actual public aggregates."""
import argparse
import json
from html import escape
from pathlib import Path
from math import log10


def histogram(h, bins):
    return [(name, sum(v for k,v in h.items() if low <= int(k) <= high)) for name,low,high in bins]


def svg(path,title,values,log=False):
    width, step = 1050, 26
    size = 100 + len(values)*step
    def scale(value):
        return log10(1+value) if log else value
    peak = max(1, *(scale(value) for _,value in values))
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {size}" role="img">',
             f'<title>{escape(title)}</title><rect width="100%" height="100%" fill="#f7fafc"/>',
             f'<text x="22" y="32" font-size="22" font-weight="bold">{escape(title)}</text>',
             f'<text x="22" y="57" font-size="13">{"Comprimento das barras em escala log10(1 + n)." if log else "Comprimento das barras proporcional à contagem."}</text>',
             '<g font-family="Arial, sans-serif" font-size="14">']
    for i,(label,value) in enumerate(values):
        y = 78+i*step
        n = int(620*scale(value)/peak)
        parts.extend([f'<text x="22" y="{y+14}">{escape(label)}</text>',
                      f'<rect x="330" y="{y}" width="{n}" height="17" rx="2" fill="#146468"/>',
                      f'<text x="{340+n}" y="{y+14}">{value:,}</text>'.replace(",",".")])
    parts.append("</g></svg>")
    path.write_text("\n".join(parts)+"\n",encoding="utf-8")


def generate(manifest, out):
    m = json.loads(manifest.read_bytes())
    out.mkdir(parents=True,exist_ok=True)
    a = m["eventos_validos"]
    tr = m["split"]["treino"]
    svg(out/"01_eventos_aluno.svg","Eventos por estudante",histogram(a["histograma_eventos_aluno"],
        [("1–4",1,4),("5–19",5,19),("20–49",20,49),("50–99",50,99),("100–199",100,199),("200+",200,10**9)]))
    svg(out/"02_eventos_habilidade.svg","Eventos por habilidade · 20 maiores volumes",sorted(a["eventos_por_habilidade"].items(),key=lambda kv:(-kv[1],int(kv[0])))[:20])
    svg(out/"03_sequencias.svg","Comprimento dos históricos estudante–habilidade",histogram(a["histograma_comprimentos"],
        [("1",1,1),("2–4",2,4),("5–9",5,9),("10–19",10,19),("20+",20,10**9)]))
    svg(out/"04_acertos.svg","Resultados binários · somente treino",
        [("Acerto na primeira ação",tr["rotulos"]["acertos"]),("Erro ou ajuda inicial",tr["rotulos"]["erros_ou_ajuda"])])
    svg(out/"05_elegibilidade.svg","Habilidades que passam cada critério de treino",
        [(k.capitalize(),len(v)) for k,v in m["habilidades_elegiveis"].items()])
    svg(out/"06_cobertura.svg","Cobertura em eventos · todos e habilidades principais",
        [(f"{s} · {label}",m["split"][s][key]) for s in ("treino","validacao","teste")
         for label,key in (("total","eventos"),("principal","eventos_habilidades_principais"))])
    svg(out/"07_itens.svg","Itens distintos por conjunto",[(s,m["split"][s]["itens"]) for s in ("treino","validacao","teste")])
    svg(out/"08_repeticao.svg","Reexposição ao mesmo item por estudante",
        [("Primeiras exposições",a["eventos"]-a["repeticoes_item_aluno"]),("Reexposições",a["repeticoes_item_aluno"])],log=True)
    svg(out/"09_perdas.svg","Exclusões por motivo principal",[(k.replace("_"," "),v) for k,v in m["exclusoes"].items() if v],log=True)
    skills = json.loads((manifest.parent/"habilidades.json").read_bytes())
    rate_bins = [(f"{i*10}–{(i+1)*10}%",sum(i == min(9,int(r["taxa_acertos"]*10)) for r in skills))
                 for i in range(10)]
    svg(out/"10_desequilibrio.svg","Habilidades do treino por faixa de taxa de acerto",rate_bins)
    print("10 gráficos SVG gerados")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest",type=Path)
    parser.add_argument("out",type=Path)
    args = parser.parse_args()
    generate(args.manifest,args.out)
