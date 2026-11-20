# Interface experimental e requisitos de ligação

O frontend inspecionado confirma EnvioResposta, Correcao, enviarResposta e o contrato Api. Os hashes dos arquivos estão no inventário. O cliente HTTP disponível está indisponível, portanto esta entrega integra o motor a uma interface compatível em Python.

O futuro backend deve receber o envio do aluno, autenticar a identidade, obter o gabarito por fonte autorizada e persistir uma correção canônica. Depois, pode chamar register_correction com o mesmo ID da tentativa. O acerto binário deve vir da correção autorizada. O ID de tentativa do servidor e a chave idempotente do cliente têm funções distintas.

O motor persiste por estudante, namespace, habilidade e versão. Ele grava atomicamente estado, recibo de tentativa e oferta. O adapter não implementa autenticação nem transação distribuída com um backend externo. O acoplamento real precisa de um fluxo idempotente de correção e atualização, incluindo recuperação de falhas entre os dois passos. Esses requisitos ficam pendentes na aplicação.

Os namespaces ASSISTments e ENEM são separados. A ausência de mapeamento aprovado para ENEM aciona fallback e devolve domínio nulo. Os parâmetros G e S, fronteiras e incerteza são controlados pelo gate operacional. A taxa suavizada é um fallback explícito, sem estimativa validada de domínio ENEM.

As mudanças de dificuldade são ofertas. O aceite exige o mesmo estudante, versão e revisão de estado. A recusa mantém a preferência. Eventos novos invalidam ofertas anteriores. A escolha manual usa evento próprio idempotente. O intervalo entre ofertas usa quantidade de respostas, e não distância entre IDs globais. Bancos com o esquema anterior são migrados sob transação, recuperando a contagem a partir dos recibos.

O módulo semântico mantém a responsabilidade de selecionar e ordenar questões relevantes. O motor devolve a sugestão de faixa e seu motivo. O chamador deve fornecer o inventário disponível e tratar falta de estoque. A inicialização diagnóstica e a oferta de dez questões por matéria dependem de estoque, metadados, política de exposição e validação próprios.

O replay e a demo desta missão são provas de funcionamento. A política BKT apresentou mais ofertas e reversões que o baseline na validação. O uso com estudantes reais do Gabaritei exige piloto identificado, revisão pedagógica, dados locais e monitoramento de desempenho e calibração.
