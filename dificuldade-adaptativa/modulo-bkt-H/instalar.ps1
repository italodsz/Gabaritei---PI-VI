$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot
python -m venv .venv
if ($LASTEXITCODE -ne 0) { throw "Falha ao criar ambiente Python." }
& ./.venv/Scripts/python.exe -B testar.py --groups A,D,F --out local/testes_instalacao.json
if ($LASTEXITCODE -ne 0) { throw "Testes funcionais falharam." }
Write-Output "Ambiente instalado e testes funcionais aprovados. Consulte README.md para o exemplo."
