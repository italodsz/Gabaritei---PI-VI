from collections import defaultdict
import hashlib
import re
import unicodedata

import fitz

HEADER = re.compile(r"^\s*questão\s+(\d{1,3})\s*$", re.I)
OPTION = re.compile(r"^([A-E])(?:\s+|[.)]\s+)(.*)$")
FOOTER = re.compile(r"^\s*(?:\*[^*]+\*|(?:\d+\s+)?(?:CH|CN|LC|MT|LC\s*-\s*MT|CH\s*-\s*CN)\s*-.*(?:caderno|página)|\d+)\s*$", re.I)
BAD = re.compile(r"[\x00-\x08\x0b-\x1f\x7f-\x9f\ufffd]")
SUSPECT_LAYOUT = re.compile(r"\b(?:figura|gráfico|tabela|quadro|mapa|imagem|tirinha|charge|diagrama|"
                            r"esquema|fórmula|equação|expressão|poema|versos|a seguir|abaixo|acima)\b|[=×÷√^≥≤±]", re.I)


def norm(text):
    text = unicodedata.normalize("NFC", text).translate(str.maketrans("‘’“”", "''\"\""))
    return re.sub(r"\s+", "", text.replace("\u00ad",""))


def pdf_answers(path):
    with fitz.open(path) as pdf:
        text = "\n".join(p.get_text() for p in pdf)
    answer = defaultdict(set)
    # A posição 1–5 pode ter duas línguas diferentes. Não é processada em lote.
    for m in re.finditer(r"(?m)^\s*(\d{1,3})[ \t]*\n?[ \t]+([A-E])\s*$|^\s*(\d{1,3})\s*\n([A-E])[ \t]*$",text):
        n, a = (m[1],m[2]) if m[1] else (m[3],m[4])
        if 6 <= int(n) <= 180:
            answer[int(n)].add(a)
    return {n: next(iter(v)) for n,v in answer.items() if len(v)==1}


def text_lines(page):
    return [("".join(s["text"] for s in line["spans"]).strip(), fitz.Rect(line["bbox"]))
            for b in page.get_text("dict",flags=fitz.TEXTFLAGS_TEXT)["blocks"]
            for line in b["lines"]]


def parse_body(lines, marker, width, images, drawings, superscripts):
    if not lines or any(BAD.search(line) for line,_ in lines):
        return None
    parts = [[]]
    for t,bbox in lines:
        m = OPTION.fullmatch(t)
        if m and m[1] == "ABCDE"[len(parts)-1:len(parts)] and abs(bbox.x0-marker.x0)<25:
            parts.append([m[2].strip()])
        elif t in "ABCDE" and len(t)==1 and t == "ABCDE"[len(parts)-1:len(parts)] and abs(bbox.x0-marker.x0)<25:
            parts.append([])
        elif t:
            parts[-1].append(t)
    if len(parts)!=6 or not all(any(p) for p in parts):
        return None
    for i,p in enumerate(parts[1:]):
        if len(p)>1 and p[0] == "ABCDE"[i]:
            p.pop(0)
        elif p and p[0].startswith("ABCDE"[i] + "\t"):
            p[0] = p[0][2:].strip()
    boxes = [b for _,b in lines]
    bottom = max(b.y1 for b in boxes)
    if min(b.y0 for b in boxes) < marker.y0 - 2 or min(b.x0 for b in boxes) < marker.x0-12:
        return None
    # Inclui a largura útil para flagrar figuras ao lado do texto.
    x1 = width if max(b.x1 for b in boxes) > width/2+7 or marker.x0 > width/3 else width/2+5
    region = fitz.Rect(max(0,marker.x0-6),marker.y1+1,x1,bottom+2)
    if any(not (region & fitz.Rect(i["bbox"])).is_empty for i in images):
        support = "imagem_no_pdf"
    elif any((region & d).width >= 18 and (region & d).height >= 7 for d in drawings):
        support = "desenho_no_pdf"
    elif any(not (region & s).is_empty for s in superscripts) or SUSPECT_LAYOUT.search(" ".join(s for p in parts for s in p)):
        support = "notacao_ou_material_mencionado"
    else:
        support = ""
    return ["\n".join(p) for p in parts], support, list(region)


def extract(path):
    result = defaultdict(list)
    with fitz.open(path) as pdf:
        for page in pdf:
            lines = text_lines(page)
            markers = [(i,int(m[1]),bbox) for i,(text,bbox) in enumerate(lines) if (m:=HEADER.fullmatch(text))]
            if not markers:
                continue
            images = page.get_image_info()
            superscripts = [fitz.Rect(s["bbox"]) for b in page.get_text("dict",flags=fitz.TEXTFLAGS_TEXT)["blocks"]
                            for line in b["lines"] for s in line["spans"] if s["flags"] & 1]
            # Marcas externas de corte podem compartilhar um traçado maior que a página.
            drawings = [d["rect"] for d in page.get_drawings()
                        if not (d["rect"].x0 < page.rect.x0 and d["rect"].x1 > page.rect.x1
                                and d["rect"].y0 < page.rect.y0 and d["rect"].y1 > page.rect.y1
                                and d["type"] == "s" and len(d["items"]) == 8
                                and all(item[0]=="l" and all(point not in page.rect for point in item[1:])
                                        for item in d["items"]))]
            for k,(i,n,bbox) in enumerate(markers):
                end = markers[k+1][0] if k+1<len(markers) else len(lines)
                # Dígitos isolados podem ser alternativas. Só remove rodapés alfanuméricos.
                body = [(t,b) for t,b in lines[i+1:end] if t and not (FOOTER.fullmatch(t) and not t.isdigit())]
                parsed = parse_body(body,bbox,page.rect.width,images,drawings,superscripts)
                if parsed:
                    parts,support,region = parsed
                    result[n].append({"partes":parts,"apoio":support,"pagina":page.number+1,"recorte":region})
    return result


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
