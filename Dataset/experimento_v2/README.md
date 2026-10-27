# Experimento do dataset v2

Este diretório guarda o pacote completo `Gabaritei_git_experimento_v2.zip` dividido em partes menores que o limite individual de arquivos do GitHub.

O ZIP reúne os arquivos de dados, auditoria, documentação e mídias do experimento. A integridade do pacote e de cada parte é registrada em `partes.json` com SHA-256.

## Reconstruir e validar

Na raiz deste diretório, execute:

```bash
python reconstruir_e_validar.py
```

O script:

1. valida o tamanho e o SHA-256 de cada parte;
2. reconstrói `Gabaritei_git_experimento_v2.zip`;
3. confere o tamanho e o SHA-256 do ZIP original;
4. testa a integridade interna do arquivo ZIP.

Para salvar o ZIP em outro local:

```bash
python reconstruir_e_validar.py --saida caminho/arquivo.zip
```

## Regenerar as partes

Se houver uma cópia íntegra do ZIP original, as partes e o manifesto podem ser recriados com:

```bash
python dividir_pacote.py caminho/Gabaritei_git_experimento_v2.zip
```

O tamanho padrão de cada parte é 40 MiB.
