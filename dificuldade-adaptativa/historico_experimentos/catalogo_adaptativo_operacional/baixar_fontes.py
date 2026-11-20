from concurrent.futures import ThreadPoolExecutor
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
from urllib.parse import urljoin, urlsplit

from bs4 import BeautifulSoup
import requests

HERE = Path(__file__).resolve().parent / "fontes"
PORTAL = "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos"


def links(year):
    url = f"{PORTAL}/{year}"
    response = requests.get(url, timeout=25)
    response.raise_for_status()
    matches = {}
    for a in BeautifulSoup(response.content, "html.parser").select("a[href]"):
        label = a.get_text(" ", strip=True).casefold()
        kind = {"prova": "prova", "gabarito": "gabarito"}.get(label)
        if not kind:
            continue
        heading = a.find_previous(["p", "h3", "h4"])
        title = heading.get_text(" ", strip=True).casefold() if heading else ""
        match = re.search(r"(?:([12])\s*[º°]?\s*dia|dia\s*([12])).*caderno\s+([17])\b.*azul", title)
        if not match or any(x in title for x in ("reaplic", "digital", "ampliad", "2ª aplicação")):
            continue
        day, number = int(match[1] or match[2]), int(match[3])
        if number != (1 if day == 1 else 7):
            continue
        pdf = urljoin(url, a["href"])
        if urlsplit(pdf).hostname == "download.inep.gov.br" and urlsplit(pdf).path.lower().endswith(".pdf"):
            matches.setdefault((day, kind), pdf)
    return [(year, day, kind, url, value) for (day, kind), value in sorted(matches.items())]


def fetch(entry):
    year, day, kind, portal, url = entry
    name = f"{year}_{day}_{kind}.pdf"
    path = HERE / name
    errors = []
    for target in (url, url + "?download=1"):
        try:
            result = subprocess.run(["curl", "-sSfL", "--max-time", "28", target],
                                    capture_output=True, check=True)
            data = result.stdout
            if not data.startswith(b"%PDF"):
                raise ValueError("resposta sem assinatura PDF")
            path.write_bytes(data)
            return dict(ano=year,dia=day,tipo=kind,portal=portal,url=url,arquivo=name,
                        sha256=hashlib.sha256(data).hexdigest(),erros=errors)
        except (subprocess.CalledProcessError, ValueError) as exc:
            errors.append(exc.stderr.decode(errors="replace").strip()
                          if isinstance(exc, subprocess.CalledProcessError) else str(exc))
    return dict(ano=year,dia=day,tipo=kind,portal=portal,url=url,erros=errors)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--restaurar", action="store_true")
    args = parser.parse_args()
    HERE.mkdir(exist_ok=True)
    manifest = HERE/"manifesto.json"
    if args.restaurar:
        expected = [r for r in json.loads(manifest.read_bytes()) if "sha256" in r]
        pending = [r for r in expected if not (HERE/r["arquivo"]).is_file()
                   or hashlib.sha256((HERE/r["arquivo"]).read_bytes()).hexdigest()!=r["sha256"]]
        entries = [(r["ano"],r["dia"],r["tipo"],r["portal"],r["url"]) for r in pending]
        with ThreadPoolExecutor(12) as pool:
            for e, got in zip(pending,pool.map(fetch,entries)):
                if got.get("sha256")!=e["sha256"]:
                    raise SystemExit(f"Fonte indisponível ou hash diferente: {e['arquivo']} ({got.get('erros')})")
        print(f"Manifesto preservado. {len(expected)} PDFs conferidos.")
        raise SystemExit(0)
    with ThreadPoolExecutor(12) as pool:
        entries = [e for group in pool.map(links, range(2009, 2025)) for e in group]
        results = list(pool.map(fetch, entries))
    manifest.write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding="utf8")
    print("Links encontrados:",len(entries),"PDFs baixados:",sum("sha256" in x for x in results))
