"""Abre somente as figuras da questao, sem gabarito nem descricoes reservadas a busca."""
import base64
import html
from pathlib import Path
import webbrowser


def abrir_figuras(catalogo, item, pasta: Path) -> bool:
    files = catalogo.arquivos_midia(item)
    if not files:
        return False
    parts = ['<!doctype html><html lang="pt-BR"><meta charset="utf-8">',
             '<title>Figuras da questão</title>',
             '<style>body{font:18px system-ui;margin:24px;max-width:1000px}img{max-width:100%;height:auto}figure{margin:24px 0}</style>',
             '<h1>Figuras da questão</h1>', '<p>' + html.escape(item.id) + '</p>']
    for n, file in enumerate(files, 1):
        mime = {'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.gif':'image/gif','.webp':'image/webp','.bmp':'image/bmp'}[file.suffix.lower()]
        data = base64.b64encode(file.read_bytes()).decode('ascii')
        parts.append(f'<figure><figcaption>Figura {n}</figcaption><img alt="Figura {n} da questão" src="data:{mime};base64,{data}"></figure>')
    parts.append('</html>')
    path = Path(pasta) / 'figuras.html'
    path.write_text('\n'.join(parts), encoding='utf-8')
    return webbrowser.open(path.resolve().as_uri())
