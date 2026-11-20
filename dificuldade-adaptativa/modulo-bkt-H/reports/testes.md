# Testes e ambiente

Os grupos são independentes. A usa somente matemática e política em biblioteca padrão. B usa o CSV e o corpus reconstruído. C verifica os ajustes efetivamente executados. D verifica o motor, o adaptador e a persistência. E verifica perdas e bootstrap com respostas reais.

Na execução completa, o resultado foi {'aprovado': 44}, com 0 falhas e 0 erros. A execução sem dados coletou todos os testes e teve {'aprovado': 31, 'bloqueado': 13}, retornando código 2. Isso identifica bloqueio por dependência e evita aprovação falsa. A e D também foram executados em um venv criado sem pip nem pacotes externos, com {'aprovado': 31}.

A primeira execução de D terminou com um erro de limpeza do arquivo SQLite porque uma conexão aberta no próprio teste não tinha sido fechada. O harness foi corrigido para fechar a conexão. A regressão posterior do adaptador demonstrou a exigência incorreta de igualdade entre ID de tentativa do servidor e chave do cliente, que foi removida. Um teste adicional demonstrou que ordens com saltos encurtavam indevidamente o intervalo entre sugestões. A correção usa contagem de respostas e inclui teste da migração do banco anterior. As falhas e os retestes foram preservados.

Os dados e o treinamento foram reexecutados em ambiente virtual limpo com as dependências fixadas. O relatório ambiente_verificado.json registra versões reais. A análise estatística e o replay usam fontes reais. Os exemplos de integração são sintéticos e não medem desempenho educacional.
