# Gabaritei

Plataforma de estudos para o ENEM com recomendação de questões por dificuldade e desempenho do aluno.

## Estrutura

- `backend/`: API FastAPI, persistência, importação do catálogo e recomendador por área.
- `frontend/`: interface Next.js e camada de API tipada; o modo de demonstração usa dados mockados.
- `Dataset/base_trabalho/`: dataset, critérios de qualidade e divisões de treino, validação e teste.

## Executar

As instruções de instalação e uso da API estão no [README do backend](backend/README.md).

Para iniciar a interface:

```sh
cd frontend
npm ci
npm run dev
```

O frontend usa sua camada mock por padrão. A integração HTTP deve respeitar o contrato descrito nos arquivos do frontend; a presença dos dois projetos neste repositório não implica paridade completa entre seus contratos.

## Recomendação

O backend oferece escolha manual de dificuldade, diagnóstico e recomendação automática. A estimativa de proficiência é separada para Matemática, Linguagens, Ciências Humanas e Ciências da Natureza.

O modelo adaptativo permanece experimental: a comparabilidade das escalas e a constante dos parâmetros TRI ainda precisam de validação. Taxa de acerto do aluno, precisão de previsão e ganho de aprendizagem são medidas diferentes.

## Desenvolvimento

Os testes automatizados do código permanecem no projeto. Dados de alunos, bancos locais, relatórios de sessões, ambientes virtuais e saídas geradas não fazem parte do versionamento.
