-- Conta sintética gerada pela versão Node. Identificador e datas fixados para o teste.
INSERT INTO usuario VALUES ('legado','aluno@example.org','Aluno legado','','','','','scrypt$16384$8$1$g6d+xD0E0KB6sFENz4rEug==$99hMnaMMTgMVKMb9Ab75pbQlXVoM+nkkqdcsmDEHh7KzSbJUXm111k/Chu9H1xcq/A40ggCqVMILMIa2ljZSEw==','2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z');
INSERT INTO sessao_login VALUES ('6a6c8ae71ef0737e190a6f022a6362131d3a91d55e7b52c74c999cfeb5e5cc0c','legado','2026-01-01T00:00:00.000Z','2099-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z','');
INSERT INTO conta_estudos VALUES ('legado',1,'{}','{}','{"extra":"mantido"}');
INSERT INTO favorita VALUES ('legado','gq_aaa',0);
INSERT INTO meta VALUES ('legado','weekly_questions',30,1,0);
INSERT INTO sessao_pratica VALUES ('p','legado',0,'custom','Lista','completed','2026-01-01','2026-01-01',NULL,'{}','["gq_aaa"]',0,'{"elapsedMs":5000}',0,1,'{"campo":true}');
INSERT INTO resposta_pratica VALUES ('p','gq_aaa','A',1,1,NULL,0,'{"extra":9}');
INSERT INTO simulado VALUES ('s','legado',0,'Lista','completed','2026-01-01','2026-01-01',NULL,NULL,'{}','["gq_aaa"]','[]','[]',0,'{"elapsedMs":5000}',0,0,'{}');
INSERT INTO resposta_simulado VALUES ('s','gq_aaa','A',NULL,0,'{"confirmed":true,"correct":true,"extra":9}');
INSERT INTO estado_usuario VALUES ('legado','estudos',1,'2026-01-01T00:00:00.000Z');
