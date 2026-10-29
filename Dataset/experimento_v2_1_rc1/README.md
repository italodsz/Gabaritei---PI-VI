# Experimento do dataset v2.1-rc1

Este diretório guarda o pacote `Gabaritei_v2_1_rc1.zip`, uma candidata experimental separada do v2 congelado. O ZIP foi dividido em partes menores que o limite individual de arquivos do GitHub.

A integridade do pacote e de cada parte está registrada em `partes.json`, com tamanho e SHA-256. A publicação deste pacote não altera nem substitui os arquivos do experimento v2.

## Reconstruir e validar

Na raiz deste diretório, execute:

```bash
python reconstruir_e_validar.py
```

O script valida todas as partes, reconstrói `Gabaritei_v2_1_rc1.zip`, confere o SHA-256 original e testa a integridade interna do ZIP.

Para salvar o ZIP em outro local:

```bash
python reconstruir_e_validar.py --saida caminho/Gabaritei_v2_1_rc1.zip
```

Depois de reconstruir, consulte `Gabaritei_v2_1_rc1/LEIA_PRIMEIRO.md` dentro do pacote antes de usar os dados ou executar os scripts.

