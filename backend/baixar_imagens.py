"""Recupera localmente os arquivos de imagem já registrados na base do Gabaritei."""
import argparse
from collections import defaultdict
import json
from pathlib import Path
import re
from shutil import copyfileobj
from tempfile import NamedTemporaryFile, TemporaryDirectory
from urllib.error import URLError
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen
from zipfile import BadZipFile, ZipFile

from .acervo import Acervo
from .common import ROOT
from .media import imagem

PONTOS = {"candido-ai/enem-ocr", "maritaca-ai/enem"}
HOSTS = {"enem.dev", "raw.githubusercontent.com", "github.com", "huggingface.co",
         "codeload.github.com", "datasets-server.huggingface.co"}
ENEM_ZIP = "https://codeload.github.com/yunger7/enem-api/zip/refs/heads/main"


def abrir(url):
    destino = urlsplit(url)
    if destino.scheme != "https" or destino.hostname not in HOSTS:
        raise ValueError("Endereço fora das fontes conhecidas.")
    return urlopen(Request(url, headers={"User-Agent": "Gabaritei/1"}), timeout=30)


def tirar_json(url):
    with abrir(url) as f:
        return json.load(f)


def parquet(repo, diretorio):
    from pyarrow.parquet import ParquetFile

    assert repo in PONTOS
    url = "https://datasets-server.huggingface.co/parquet?" + urlencode({"dataset": repo})
    for arquivo in tirar_json(url)["parquet_files"]:
        with NamedTemporaryFile(dir=diretorio, suffix=".parquet") as temporario:
            with abrir(arquivo["url"]) as f:
                copyfileobj(f, temporario)
            temporario.flush()
            yield arquivo["config"], ParquetFile(temporario.name)


def candido(pedidos, diretorio):
    for _, tabela in parquet("candido-ai/enem-ocr", diretorio):
        for lote in tabela.iter_batches(batch_size=32, columns=["id", "images"]):
            for r in lote.to_pylist():
                for img, pos in pedidos.get(r["id"], []):
                    imagens = r.get("images") or []
                    if 0 <= pos < len(imagens):
                        yield img, imagens[pos].get("bytes")


def maritaca(pedidos, diretorio):
    for ano, tabela in parquet("maritaca-ai/enem", diretorio):
        for r in tabela.read(columns=["id", "figures"]).to_pylist():
            for img, pos in pedidos.get(f"{ano}_{r['id']}", []):
                links = r.get("figures") or []
                if 0 <= pos < len(links):
                    yield img, links[pos]


def baixar_enem(pedidos, destino):
    # A fonte versiona as imagens em public/<ano>/questions/<número>/.
    # O ZIP em lote evita exceder o limite de requisições do endpoint individual.
    with NamedTemporaryFile(suffix=".zip") as temporario:
        with abrir(ENEM_ZIP) as f:
            copyfileobj(f, temporario)
        temporario.flush()
        with ZipFile(temporario.name) as pacote:
            verificadas = set()
            for entrada in pacote.infolist():
                partes = entrada.filename.split("/")
                if len(partes) < 6 or partes[1] != "public" or partes[3] != "questions" or entrada.is_dir():
                    continue
                for img in pedidos.get((partes[2], partes[4]), ()):
                    if entrada.file_size == img.tamanho and img.nome not in verificadas:
                        if salvar(img, pacote.read(entrada), destino):
                            verificadas.add(img.nome)


def salvar(img, dados, destino):
    if not dados or not img.confere(dados):
        return False
    with NamedTemporaryFile(dir=destino, delete=False) as arquivo:
        arquivo.write(dados)
        caminho = Path(arquivo.name)
    try:
        caminho.replace(destino / img.nome)
    finally:
        caminho.unlink(missing_ok=True)
    return True


def baixar(img, urls, destino):
    motivos = []
    for url in dict.fromkeys(urls):
        try:
            with abrir(url) as f:
                dados = f.read(img.tamanho + 1)
            if salvar(img, dados, destino):
                return None
            motivos.append("SHA-256 ou tamanho diferente da base")
        except (URLError, OSError, ValueError) as erro:
            motivos.append(str(erro))
    return "; ".join(dict.fromkeys(motivos)) or "nenhum arquivo disponível na fonte"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--destino", type=Path, default=ROOT / "Dataset/base_trabalho/media")
    parser.add_argument("--relatorio", type=Path, default=ROOT / "backend/dados/relatorio-imagens.json")
    parser.add_argument("--somente-enem-api", action="store_true", help="Executa só as origens enem-api e enem.dev.")
    args = parser.parse_args()
    args.destino.mkdir(parents=True, exist_ok=True)
    acervo = Acervo(mostrar_imagens=False)
    imagens, origens = {}, defaultdict(list)
    for id_ in acervo.by_id:
        q = acervo.rows[id_]
        for asset in q.get("assets", []):
            img = imagem(asset)
            if img is not None:
                imagens[img.nome] = img
                origens[img.nome].extend((q["year"], o) for o in asset["origins"])

    def existe(img):
        caminho = args.destino / img.nome
        return not caminho.is_symlink() and caminho.is_file() and img.confere(caminho.read_bytes())

    pendentes = {k: img for k, img in imagens.items() if not existe(img)}
    problemas = defaultdict(list)
    fontes = {"enem-api", "enem.dev/enem-api"}

    pedidos_enem = defaultdict(list)
    for nome, img in pendentes.items():
        for ano, o in origens[nome]:
            if o["source"] in fontes:
                numero = o.get("path") or o.get("id", "").rsplit("_q", 1)[-1]
                if isinstance(numero, str) and re.fullmatch(r"\d+(?:-(?:ingles|espanhol))?", numero):
                    n, separador, idioma = numero.partition("-")
                    pedidos_enem[(str(ano), f"{int(n)}{separador}{idioma}")].append(img)
    if pedidos_enem:
        try:
            baixar_enem(pedidos_enem, args.destino)
        except (BadZipFile, URLError, OSError, ValueError) as erro:
            print(f"enem-api: {erro}")
            for itens in pedidos_enem.values():
                for img in itens:
                    problemas[img.nome].append(str(erro))

    if not args.somente_enem_api:
        with TemporaryDirectory() as temp:
            for fonte, extrair in (("candido-ai/enem-ocr", candido), ("maritaca-ai/enem:original_url", maritaca)):
                pedidos = defaultdict(list)
                for nome, img in pendentes.items():
                    if not existe(img):
                        for _, o in origens[nome]:
                            if o["source"] == fonte:
                                pedidos[o["id"]].append((img, o["index"]))
                if not pedidos:
                    continue
                try:
                    for img, dados in extrair(pedidos, temp):
                        if existe(img):
                            continue
                        if isinstance(dados, str):
                            motivo = baixar(img, [dados], args.destino)
                        else:
                            motivo = None if salvar(img, dados, args.destino) else "SHA-256 ou tamanho diferente da base"
                        if motivo:
                            problemas[img.nome].append(motivo)
                except (ImportError, URLError, OSError, ValueError, KeyError) as erro:
                    print(f"{fonte}: {erro}")
                    for itens in pedidos.values():
                        for img, _ in itens:
                            problemas[img.nome].append(str(erro))

    faltantes = []
    for nome, img in imagens.items():
        if not existe(img):
            fontes_locais = sorted({o["source"] for _, o in origens[nome]})
            motivo = ("recorte do PDF oficial precisa do arquivo original"
                      if fontes_locais == ["PDF oficial INEP (recorte)"] else "arquivo não obtido das fontes consultadas")
            faltantes.append(dict(arquivo=nome, fontes=fontes_locais, motivos=list(dict.fromkeys(problemas[nome])) or [motivo]))
    resultado = dict(esperadas=len(imagens), verificadas=len(imagens) - len(faltantes), faltantes=faltantes)
    args.relatorio.parent.mkdir(parents=True, exist_ok=True)
    args.relatorio.write_text(json.dumps(resultado, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{resultado['verificadas']}/{len(imagens)} imagens verificadas. Relatório: {args.relatorio}")
    return 1 if faltantes else 0


if __name__ == "__main__":
    raise SystemExit(main())
