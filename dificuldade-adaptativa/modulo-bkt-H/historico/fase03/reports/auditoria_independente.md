# Auditoria e situação da revisão externa

A auditoria dos dados verificou hashes, contratos, critérios de limpeza já congelados, suportes, ordenação, seleção de habilidades apenas no treino e ausência de estudantes compartilhados. Os 25 testes anteriores passaram. O gate desta missão reexecutou verificações críticas da Fase 01 por inspeção de esquema e hash, reconciliação e elegibilidade. Os testes da Fase 02 foram reexecutados integralmente. Os rótulos de teste não foram usados para seleção de modelos ou calibradores.

O forward novo foi escrito com equações próprias e conferido em todos os eventos de treino, em 126 sequências exatas e em sequências longas. A conferência final recalculou métricas com fórmulas diretas e ranks do SciPy, verificou a origem de cada previsão e os registros de abertura do teste. Os resultados desse replay estão em auditoria_resultados.json.

A primeira checagem de AUC falhou na reprodução da validação por diferença de ranks em probabilidades quase empatadas. A correção da convenção de empate ocorreu antes do congelamento e está documentada. A primeira tentativa do notebook falhou porque o arquivo de dependências ainda não tinha sido incluído na pasta de trabalho. O arquivo foi adicionado e a execução foi repetida. A alteração foi de empacotamento, com os códigos científicos congelados preservados. Os logs originais permanecem na entrega.

O Claude Code estava disponível no ambiente. A chamada com ferramentas desativadas, destinada apenas à inspeção do código e sem dados individuais, excedeu o limite de 120 segundos. Seu status real é nao_concluida. A reprodução integral e a avaliação no Claude estão pendentes. A tabela comparativa mantém NA nos resultados externos. O pacote contém o roteiro de duas etapas, especificação matemática, comandos, critérios e tolerâncias.

Esta missão tem testes automatizados e auditoria por implementação separada sob a mesma autoria. A revisão humana científica externa continua pendente. O notebook executado foi Jupyter local. A execução no serviço Google Colab permanece sem comprovação.
