"""Inventory original publications and inspect them without modifying the original packages."""
import argparse
import hashlib
import json
from pathlib import Path
import platform
import sys
import zipfile

ROOT=Path(__file__).resolve().parent


def sha(path):
    with path.open("rb") as f:
        return hashlib.file_digest(f,"sha256").hexdigest()


def main(workspace,originals):
    names=["Gabaritei_BKT_Fase01_Preparacao_Auditada.zip","Gabaritei_BKT_Fase02_Treinamento_Auditado.zip",
           "Gabaritei_BKT_Fase03_Avaliacao_Auditada.zip"]
    inventory=[]
    for phase,name in enumerate(names,1):
        p=Path.home()/"Downloads"/name
        folder=originals/f"fase{phase:02}"
        with zipfile.ZipFile(p) as z:
            assert z.testzip() is None
            hashes=dict((n,h) for h,n in (s.split("  ",1) for s in z.read("SHA256SUMS.txt").decode().splitlines()))
            assert set(z.namelist())==set(hashes)|{"SHA256SUMS.txt"}
            for n,h in hashes.items():
                data=z.read(n)
                assert hashlib.sha256(data).hexdigest()==h
                out=folder/n
                out.parent.mkdir(parents=True,exist_ok=True)
                if out.exists():
                    assert sha(out)==h
                else:
                    out.write_bytes(data)
            inventory.append({"phase":phase,"name":name,"sha256":sha(p),"bytes":p.stat().st_size,
                              "verified_member_hashes":len(hashes),"members":len(hashes)+1})
    documents=[]
    lists={
      1:["README.md","reports/qualidade_dados.md","reports/analise_habilidades.md","handoff/CONTRATO_FASE02.md"],
      2:["README.md","reports/relatorio_treinamento.md","reports/validacao_preliminar.md","reports/estabilidade_identificabilidade.md"],
      3:["README.md","reports/relatorio_cientifico.md","external_review/PROTOCOLO_CLAUDE_CODE.md","handoff/CONTRATO_FASE04.md"]}
    for phase,paths in lists.items():
        for name in paths:
            p=originals/f"fase{phase:02}"/name
            text=p.read_text(encoding="utf-8-sig")
            documents.append({"phase":phase,"file":name,"sha256":sha(p),"characters":len(text)})
    source=workspace/"assistments.csv"
    private=workspace.parent/"Gabaritei_BKT_Fase01_Dados_locais"
    assert source.stat().st_size==64412812
    assert sha(source)=="162ef8d2d28bcbfea6591a282994062bd8d5eaa00636544292a0d268dca6e5da"
    manifest=json.loads((private/"manifesto_local.json").read_bytes())
    for n,h in manifest["sha256_arquivos"].items():
        assert sha(private/n)==h
    import fitz
    pdf=Path.home()/"Desktop/Auditoria_BKT_Fases_01_a_03_Gabaritei.pdf"
    with fitz.open(pdf) as d:
        extracted="\n\n".join(f"PÁGINA {i+1}\n"+page.get_text() for i,page in enumerate(d))
    reports=ROOT/"reports"
    reports.mkdir(exist_ok=True)
    (reports/"auditoria_claude_texto_integral.txt").write_text(extracted,encoding="utf-8")
    architecture=[]
    for n in ["base-oficial/frontend/package.json","base-oficial/frontend/src/lib/api/client.ts",
              "base-oficial/frontend/src/lib/api/types.ts","base-oficial/frontend/src/lib/api/http/client.ts",
              "base-oficial/frontend/src/lib/api/mock/engine.ts"]:
        p=workspace/n
        architecture.append({"file":n,"sha256":sha(p),"bytes":p.stat().st_size})
    result={"archives":inventory,"documents_read":documents,
            "audit_pdf":{"name":pdf.name,"sha256":sha(pdf),"pages":8},
            "source":{"name":source.name,"bytes":source.stat().st_size,"sha256":sha(source)},
            "private_files":manifest["sha256_arquivos"],"original_key_available":(private/".chave_local").exists(),
            "architecture":architecture,"environment":{"python":sys.version,"os":platform.platform()},
            "backend_observed":"Next.js/React; Api com mock local; httpApi lança indisponível"}
    (reports/"inventario_entrada.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("ZIPs verificados",[(r["phase"],r["verified_member_hashes"]) for r in inventory])
    print("CSV e oito arquivos privados íntegros; documentos lidos:",len(documents))


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("workspace",type=Path)
    p.add_argument("originals",type=Path)
    a=p.parse_args()
    main(a.workspace.resolve(),a.originals.resolve())
