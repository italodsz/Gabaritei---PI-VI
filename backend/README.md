# Backend do recomendador Gabaritei

API FastAPI e SQLAlchemy para importar questões, corrigir respostas e recomendar por dificuldade e perfil. O perfil usa EAP com modelo 3PL por área e permanece experimental enquanto a escala e a constante D não forem confirmadas.

## Instalação

Requer Python 3.11 ou superior. Execute a partir da raiz do repositório:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\python.exe -m pip install -e ".[dev,postgres]"
.venv\Scripts\python.exe -m gabaritei_rec.importacao
.venv\Scripts\python.exe -m uvicorn gabaritei_rec.api:app --reload
```

Em Linux/macOS, utilize `.venv/bin/python` no lugar de `.venv\Scripts\python.exe`.
O arquivo `requirements-lock.txt` registra as versões do ambiente verificado. A instalação por `pyproject.toml` resolve versões compatíveis com o interpretador utilizado.

Abra `http://localhost:8000/docs` para usar a documentação interativa da API.
O dataset padrão fica em `../Dataset/base_trabalho`. Para outro local, defina `GABARITEI_DATASET`.

## Banco de dados

SQLite é o padrão local. Para PostgreSQL, defina a variável de ambiente `DATABASE_URL`:

```powershell
$env:DATABASE_URL = "postgresql+psycopg://USUARIO:SENHA@localhost:5432/gabaritei"
.venv\Scripts\python.exe -m uvicorn gabaritei_rec.api:app --reload
```

O serviço cria as tabelas na inicialização. As migrações SQL ficam em `migrations/`.
Credenciais reais e bancos de alunos devem permanecer fora do Git.

## Política de recomendação

- `nivel`: respeita a dificuldade escolhida, área, língua e demais filtros.
- `diagnostico`: cobertura inicial e seleção informativa para estimar o perfil.
- `adaptativo`: exige perfil suficiente e respeita estritamente a faixa-alvo prevista.
- `automatico`: escolhe diagnóstico, reforço ou adaptação conforme o histórico, com alternativas e limitações registradas.

Erros esperados não causam rebaixamento por contagem fixa. O desempenho recente é comparado às probabilidades registradas antes das respostas. Alterações do desafio são graduais.

Na falta de itens acessíveis, o automático pode oferecer sondagens limitadas e informativas com perfil incerto, inclusive no reforço. A resposta da API distingue falta de adequação, limite de sondagens e estoque restante. Um cliente pode solicitar `modo=diagnostico` para exploração explícita ou apresentar uma questão anterior para revisão; repetições não alteram a proficiência.

As regras ficam em `config/politica.json`. Uma alteração gera um novo hash de política, registrado nas recomendações. O cálculo do perfil, os parâmetros originais e os cortes de dificuldade têm responsabilidades distintas.

## Dados e artefatos

O comando de importação gera `artefatos/catalogo.json`, necessário para executar a API. Ele não é versionado e deve ser regenerado após clonar o projeto. Os cortes, o manifesto e os relatórios de qualidade documentam a procedência e a auditoria do dataset.

O catálogo de conteúdo em `data/externo/` é uma entrada da auditoria e deve acompanhar o projeto. As divisões de treino, validação e teste do dataset também são necessárias.

Bancos SQLite, arquivos de interações reais, caches e a pasta `resultados/` são ignorados pelo Git. Não inclua dados pessoais nos fixtures de desenvolvimento.

## Verificação

```powershell
.venv\Scripts\python.exe -m pytest -q
```

Os testes usam bancos descartáveis e dados sintéticos. O teste de PostgreSQL depende de configuração própria.

Para avaliar previsões registradas antes das respostas, com um arquivo local:

```powershell
.venv\Scripts\python.exe -m gabaritei_rec.avaliacao.previsao --interacoes CAMINHO_DO_ARQUIVO.jsonl --saida resultados/previsao
```

Esse relatório mede previsão de acerto e erro, com referências e separação temporal; não comprova ganho de aprendizagem. Os arquivos de entrada e saída da avaliação não devem ser versionados.

## Documentação

- [Arquitetura](docs/ARQUITETURA.md)
- [API](docs/API.md)
- [Formato das interações](docs/FORMATO_INTERACOES.md)
