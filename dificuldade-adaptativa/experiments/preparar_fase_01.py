import hashlib
import os
from pathlib import Path
import subprocess
import sys
import tempfile


ROOT = Path(__file__).resolve().parents[1]
REMOTE = "https://github.com/italodsz/Gabaritei---PI-VI.git"
REVISION = "7e720fa876beb7249adab2f05d3ecf33ae5a2c51"
SHA256 = "22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5"


def run(command, log, env):
    log.write("$ " + subprocess.list2cmdline(command) + "\n")
    log.flush()
    subprocess.run(command, cwd=ROOT, env=env, stdout=log, stderr=subprocess.STDOUT, check=True)


def main():
    results = ROOT / "results"
    results.mkdir(exist_ok=True)
    env = {**os.environ, "PYTHONIOENCODING": "utf-8", "GIT_TERMINAL_PROMPT": "0"}
    with tempfile.TemporaryDirectory(dir=ROOT) as directory:
        checkout = Path(directory)
        dataset = checkout / "Dataset/base_trabalho"
        env["GABARITEI_DATASET"] = str(dataset)
        with (results / "fase_01_auditoria.log").open("w", encoding="utf8") as log:
            run(["git", "init", str(checkout)], log, env)
            run(["git", "-C", str(checkout), "fetch", "--depth=1", REMOTE, REVISION], log, env)
            run(["git", "-C", str(checkout), "-c", "core.autocrlf=false",
                 "checkout", "--detach", REVISION], log, env)
            actual = hashlib.sha256((dataset / "data/questions.jsonl").read_bytes()).hexdigest()
            log.write(f"SHA-256 data/questions.jsonl: {actual}\n")
            if actual != SHA256:
                raise ValueError("SHA-256 divergente em data/questions.jsonl")
            run([sys.executable, "-B", "experiments/fase_01_auditoria.py", str(dataset)], log, env)
        with (results / "fase_01_testes.log").open("w", encoding="utf8") as log:
            run([sys.executable, "-B", "-m", "unittest", "discover", "-s", "tests",
                 "-p", "test_auditoria.py", "-v"], log, env)
    print("Fase 1 executada. Consulte results/fase_01*.log e results/fase_01.json.")


if __name__ == "__main__":
    main()
