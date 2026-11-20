# Recomendador com a base final

Método oficial: `titulo_area`, mesma área, matéria e título da árvore v1.2,
com a ordenação congelada de `busca_por_area_v1.json`.
Fonte: `recomendador-base-final`, commit `d10f5a3`. Dataset: `e6712a8`.

- 2.731 elegíveis: treino 2.382, validação 175, teste 174.
- TF-IDF ajustado apenas no treino; MiniLM e Qwen recodificados integralmente.
- Qwen3-Embedding-8B, NF4 4 bits, dupla quantização, compute float16,
  instrução conceito, 8.192 tokens.
- SHA-256 Qwen: `10f44a7935e23b9922305cbe9ded397e74f10619adc90e0826858834e410d1c5`.
- SHA-256 da base: `6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f`.
- Validação de desenvolvimento: `titulo_area` 8/10, `rrf_qwen` 41/44.

## Uso do aplicativo

Na raiz do projeto: `npm start`. A API usa o catálogo já exportado, sem Python,
CUDA ou download de modelos. Para consultar o catálogo manualmente, leia
`catalogo/LEIA.md`. Só o catálogo oficial foi integrado na main.

## Manutenção dos índices

Com o ambiente Python apropriado, nesta pasta:

```powershell
python recomendador.py avaliar
python recomendador.py exportar
# Apenas depois de mudar a base e revisar os rótulos:
python recomendador.py construir --recodificar
python gerar_vetores_qwen.py --quantizar-4bit --lote 2
# Registrar o novo QWEN_SHA256 antes de exportar novamente.
```

A geração neural exige PyTorch com CUDA, sentence-transformers e bitsandbytes;
o uso normal do app não exige esses pacotes. Não use vetores de outra base.

Relatório: [RELATORIO_BASE_FINAL.md](RELATORIO_BASE_FINAL.md).
A amostra em `classificador/saida/amostra_conferencia_base_final.csv` continua
aguardando conferência humana. Os 67 defeitos continuam bloqueados. A integração
não corrige enunciados nem considera a amostra como validada pelo grupo.
