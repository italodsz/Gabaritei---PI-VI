import hashlib
import json
from pathlib import Path
import re

from pypdf import PdfReader

ROOT=Path(__file__).resolve().parent
SOURCE=ROOT/"matriz_1.pdf"
AREAS=["LC","MT","CN","CH"]


def extract(path):
    text="\n".join(page.extract_text() for page in PdfReader(path).pages)
    sections=re.split(r"(?m)^\s*Matriz de Referência de ",text)[1:]
    assert len(sections)==4
    output={}
    for area,part in zip(AREAS,sections):
        part=re.split(r"(?im)^\s*(?:ANEXO|Objetos de conhecimento)",part,maxsplit=1)[0]
        marks=list(re.finditer(r"(?m)^\s*(Competência de área\s+\d+|H\d+)\s*[-–]\s*",part))
        current=None
        skills={}
        for i,mark in enumerate(marks):
            code=mark.group(1)
            value=" ".join(part[mark.end():marks[i+1].start() if i+1<len(marks) else len(part)].split())
            if code.startswith("Compet"):
                current={"numero":int(code.split()[-1]),"texto_extraido":value}
            else:
                if code=="H30":
                    value=value.split(".")[0]+"."
                skills[code]={"descritor_extraido":value,"competencia":current}
        assert set(skills)=={f"H{i}" for i in range(1,31)},(area,list(skills))
        output[area]=skills
    return output


if __name__=="__main__":
    result={"sha256":hashlib.sha256(SOURCE.read_bytes()).hexdigest(),"areas":extract(SOURCE)}
    (ROOT/"matriz_codigos.json").write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf8")
    print(result["sha256"],{a:len(s) for a,s in result["areas"].items()})
