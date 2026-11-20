"""Verify every distributed file against its manifest. Does not change files."""
import hashlib
from pathlib import Path

ROOT=Path(__file__).resolve().parent
def main():
    failures=[];count=0
    for line in (ROOT/"SHA256SUMS.txt").read_text(encoding="utf-8").splitlines():
        expected,name=line.split("  ",1)
        path=(ROOT/name).resolve()
        if not path.is_relative_to(ROOT) or not path.is_file():
            failures.append(name+": ausente ou caminho inválido");continue
        with path.open("rb") as f:actual=hashlib.file_digest(f,"sha256").hexdigest()
        if actual!=expected:failures.append(name+": conteúdo alterado")
        count+=1
    if failures:
        print("\n".join(failures));return 1
    print(f"Integridade aprovada: {count} arquivos conferidos.");return 0
if __name__=="__main__":raise SystemExit(main())
