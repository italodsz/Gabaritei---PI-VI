# Recomendador de questões por dificuldade

Versão para testar o recomendador do Gabaritei no terminal. Inclui o catálogo pronto das quatro áreas do ENEM e salva um perfil separado por usuário e área.

## Começar no Windows

1. Instale **Python 3.11 ou superior** e habilite a opção de adicionar o Python ao PATH.
2. Baixe esta branch pelo botão **Code → Download ZIP** e extraia a pasta, ou clone o repositório nesta branch.
3. Abra **`iniciar.cmd`**, na raiz da pasta extraída, com dois cliques.
4. Informe seu usuário, escolha a área e responda com **A, B, C, D ou E**.

Na primeira execução, o iniciador prepara um ambiente Python e instala as duas dependências automaticamente. Essa etapa precisa de internet; as questões e o perfil ficam locais. O gabarito aparece depois da resposta.

O catálogo foi atualizado para a base de 13/11/2026, commit [`e6712a8`](https://github.com/italodsz/Gabaritei---PI-VI/commit/e6712a8a6b4bffffadbe75bd4e8d520ec7628e4d).
Das 3.086 questões de origem, 2.130 estão disponíveis neste pacote após os filtros de conteúdo, arquivos de imagem e parâmetros TRI. Há 586 questões elegíveis na origem cujas imagens não foram incluídas no repositório; elas não são oferecidas ao aluno. As demais exclusões seguem a triagem TRI.

Quatro questões disponíveis precisam de figuras. Nesses casos, digite `imagem`: as figuras locais abrem no navegador e você volta ao CMD para responder. Se não conseguir visualizar, use `pular`, sem contar como erro. As descrições reservadas à busca ficam separadas do enunciado e do gabarito.

## Comandos durante o teste

| Comando | Ação |
|---|---|
| `status` ou `perfil` | Mostra o progresso e o nível estimado por área. |
| `area` | Troca entre Matemática, Linguagens, Humanas e Natureza. |
| `auto` | Usa a estratégia automática. |
| `continuar` | Solicita exploração quando o automático pausa por falta de questões adequadas. A probabilidade prevista continua visível. |
| `nivel facil`, `nivel media`, `nivel dificil` | Escolhe a dificuldade manualmente. |
| `erros` e `rever ID` | Lista erros e abre uma questão anterior para revisão. |
| `pular` | Pula sem contar como erro. |
| `imagem` | Abre as figuras da questão atual, quando houver. |
| `sair` | Encerra e salva o progresso. |

Use o mesmo usuário nas próximas execuções para continuar. No Windows, o ambiente e os perfis ficam em `%LOCALAPPDATA%\GabariteiRecomendador`, fora do repositório. Para zerar o progresso, feche o programa e apague apenas a subpasta `dados_usuario` desse local. A variável `GABARITEI_LOCAL` permite escolher outro local.

## Arquivos do projeto

- `iniciar.cmd`: atalho na raiz para o usuário.
- `recomendador/iniciar.py`: preparação do ambiente e inicialização.
- `recomendador/requirements.txt`: NumPy e SQLAlchemy.
- `recomendador/`: algoritmo, terminal, persistência, configuração e catálogo pronto.

Não é necessário iniciar uma API, instalar Node.js ou preparar o dataset. O catálogo e os cortes já estão incluídos; o manifesto registra sua procedência e verifica a integridade dos arquivos.

O nível e as chances de acerto são estimativas experimentais, não uma nota do ENEM. Acurácia de previsão de resposta e ganho de aprendizagem são avaliações diferentes.

Em outros sistemas, execute `python recomendador/iniciar.py` a partir da raiz. Para conferir a instalação sem responder questões, use `python recomendador/iniciar.py --verificar`.

## Atualização do catálogo

O módulo `gabaritei_rec.importacao` valida a estrutura da base, os splits, o SHA-256, a elegibilidade e as imagens, e calcula os cortes apenas nos itens de treino aprovados. O SHA-256 esperado e as releases de origem aceitas ficam em `config/politica.json`. Para gerar um catálogo em outra pasta, execute a partir de `recomendador/`, com as dependências instaladas:

```text
python -m gabaritei_rec.importacao --dataset "CAMINHO/base_trabalho" --saida "CAMINHO/catalogo_novo" --anterior "artefatos/catalogo.json" --commit COMMIT_DA_BASE
```

As versões de questão incluem texto, gabarito e parâmetros. O histórico mantém os dados da versão efetivamente respondida; atualizar o catálogo não reavalia respostas antigas nem sobrescreve seus parâmetros. Grupos de conteúdo preservam o bloqueio de questões já vistas.
