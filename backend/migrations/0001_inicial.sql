-- Gerado por `python -m gabaritei_rec.db sql`. Migracao inicial do recomendador (PostgreSQL).

BEGIN;

CREATE TABLE aluno (
	id VARCHAR(36) NOT NULL,
	criado_em TIMESTAMP WITH TIME ZONE NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE versao_dataset (
	sha256 VARCHAR(64) NOT NULL,
	release VARCHAR(40) NOT NULL,
	cortes_versao VARCHAR(40) NOT NULL,
	triagem_versao VARCHAR(40) NOT NULL,
	catalogo_sha256 VARCHAR(64),
	registrado_em TIMESTAMP WITH TIME ZONE NOT NULL,
	PRIMARY KEY (sha256)
);

CREATE TABLE versao_politica (
	versao VARCHAR(80) NOT NULL,
	config JSON NOT NULL,
	registrado_em TIMESTAMP WITH TIME ZONE NOT NULL,
	PRIMARY KEY (versao)
);

CREATE TABLE perfil (
	aluno_id VARCHAR(36) NOT NULL,
	area VARCHAR(2) NOT NULL,
	theta FLOAT NOT NULL,
	dp FLOAT NOT NULL,
	n_evidencias INTEGER NOT NULL,
	status VARCHAR(20) NOT NULL,
	"D_usado" FLOAT NOT NULL,
	experimental BOOLEAN NOT NULL,
	ultima_tentativa_id VARCHAR(36),
	versao INTEGER NOT NULL,
	atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL,
	PRIMARY KEY (aluno_id, area),
	FOREIGN KEY(aluno_id) REFERENCES aluno (id)
);

CREATE TABLE sessao_estudo (
	id VARCHAR(36) NOT NULL,
	aluno_id VARCHAR(36) NOT NULL,
	modo VARCHAR(20) NOT NULL,
	criado_em TIMESTAMP WITH TIME ZONE NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY(aluno_id) REFERENCES aluno (id)
);

CREATE INDEX ix_sessao_estudo_aluno_id ON sessao_estudo (aluno_id);

CREATE TABLE versao_item (
	versao_id VARCHAR(80) NOT NULL,
	questao_id VARCHAR(40) NOT NULL,
	dataset_sha256 VARCHAR(64) NOT NULL,
	questao_hash VARCHAR(64) NOT NULL,
	gabarito_hash VARCHAR(64) NOT NULL,
	gabarito VARCHAR(1) NOT NULL,
	parametros_hash VARCHAR(64) NOT NULL,
	tri_a FLOAT NOT NULL,
	tri_b FLOAT NOT NULL,
	tri_c FLOAT NOT NULL,
	area VARCHAR(2) NOT NULL,
	faixa VARCHAR(10),
	cortes_versao VARCHAR(40) NOT NULL,
	grupo_conteudo VARCHAR(40) NOT NULL,
	habilidade_chave VARCHAR(20),
	formato VARCHAR(30) NOT NULL,
	tipo_aplicacao VARCHAR(30) NOT NULL,
	PRIMARY KEY (versao_id),
	FOREIGN KEY(dataset_sha256) REFERENCES versao_dataset (sha256)
);

CREATE INDEX ix_versao_item_questao_id ON versao_item (questao_id);

CREATE INDEX ix_versao_item_grupo_conteudo ON versao_item (grupo_conteudo);

CREATE TABLE recomendacao (
	id VARCHAR(36) NOT NULL,
	sessao_id VARCHAR(36) NOT NULL,
	aluno_id VARCHAR(36) NOT NULL,
	politica_versao VARCHAR(80) NOT NULL,
	dataset_sha256 VARCHAR(64) NOT NULL,
	cortes_versao VARCHAR(40) NOT NULL,
	modo VARCHAR(20) NOT NULL,
	pedido JSON NOT NULL,
	status VARCHAR(30) NOT NULL,
	limitacao JSON,
	funil JSON,
	perfil_snapshot JSON,
	semente INTEGER NOT NULL,
	experimental BOOLEAN NOT NULL,
	criado_em TIMESTAMP WITH TIME ZONE NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY(sessao_id) REFERENCES sessao_estudo (id),
	FOREIGN KEY(aluno_id) REFERENCES aluno (id),
	FOREIGN KEY(politica_versao) REFERENCES versao_politica (versao),
	FOREIGN KEY(dataset_sha256) REFERENCES versao_dataset (sha256)
);

CREATE INDEX ix_recomendacao_sessao_id ON recomendacao (sessao_id);

CREATE INDEX ix_recomendacao_aluno_id ON recomendacao (aluno_id);

CREATE TABLE recomendacao_item (
	id VARCHAR(36) NOT NULL,
	recomendacao_id VARCHAR(36) NOT NULL,
	posicao INTEGER NOT NULL,
	versao_item_id VARCHAR(80) NOT NULL,
	prob_prevista FLOAT,
	razao JSON NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY(recomendacao_id) REFERENCES recomendacao (id),
	FOREIGN KEY(versao_item_id) REFERENCES versao_item (versao_id)
);

CREATE INDEX ix_recomendacao_item_recomendacao_id ON recomendacao_item (recomendacao_id);

CREATE TABLE apresentacao (
	id VARCHAR(36) NOT NULL,
	sessao_id VARCHAR(36) NOT NULL,
	aluno_id VARCHAR(36) NOT NULL,
	recomendacao_item_id VARCHAR(36),
	versao_item_id VARCHAR(80) NOT NULL,
	questao_id VARCHAR(40) NOT NULL,
	grupo_conteudo VARCHAR(40) NOT NULL,
	politica_versao VARCHAR(80) NOT NULL,
	apresentado_em TIMESTAMP WITH TIME ZONE NOT NULL,
	prob_prevista FLOAT,
	theta_no_momento FLOAT,
	perfil_versao_no_momento INTEGER,
	usou_dica BOOLEAN NOT NULL,
	gabarito_exposto BOOLEAN NOT NULL,
	razao JSON,
	PRIMARY KEY (id),
	FOREIGN KEY(sessao_id) REFERENCES sessao_estudo (id),
	FOREIGN KEY(aluno_id) REFERENCES aluno (id),
	FOREIGN KEY(recomendacao_item_id) REFERENCES recomendacao_item (id),
	FOREIGN KEY(versao_item_id) REFERENCES versao_item (versao_id)
);

CREATE INDEX ix_apresentacao_sessao_id ON apresentacao (sessao_id);

CREATE INDEX ix_apresentacao_aluno_id ON apresentacao (aluno_id);

CREATE INDEX ix_apresentacao_questao_id ON apresentacao (questao_id);

CREATE TABLE exposicao_gabarito (
	id VARCHAR(36) NOT NULL,
	aluno_id VARCHAR(36) NOT NULL,
	questao_id VARCHAR(40) NOT NULL,
	grupo_conteudo VARCHAR(40) NOT NULL,
	origem VARCHAR(30) NOT NULL,
	apresentacao_id VARCHAR(36),
	exposto_em TIMESTAMP WITH TIME ZONE NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY(aluno_id) REFERENCES aluno (id),
	FOREIGN KEY(apresentacao_id) REFERENCES apresentacao (id)
);

CREATE INDEX ix_exposicao_gabarito_grupo_conteudo ON exposicao_gabarito (grupo_conteudo);

CREATE INDEX ix_exposicao_gabarito_aluno_id ON exposicao_gabarito (aluno_id);

CREATE TABLE tentativa (
	id VARCHAR(36) NOT NULL,
	apresentacao_id VARCHAR(36) NOT NULL,
	chave_idempotencia VARCHAR(100),
	aluno_id VARCHAR(36) NOT NULL,
	sessao_id VARCHAR(36) NOT NULL,
	versao_item_id VARCHAR(80) NOT NULL,
	questao_id VARCHAR(40) NOT NULL,
	area VARCHAR(2) NOT NULL,
	pulada BOOLEAN NOT NULL,
	alternativa VARCHAR(1),
	correta BOOLEAN,
	tipo VARCHAR(30) NOT NULL,
	primeira_tentativa BOOLEAN NOT NULL,
	usou_dica BOOLEAN NOT NULL,
	gabarito_exposto_antes BOOLEAN NOT NULL,
	peso_perfil FLOAT NOT NULL,
	conta_para_perfil BOOLEAN NOT NULL,
	motivo_nao_conta VARCHAR(60),
	prob_prevista FLOAT,
	tempo_resposta_ms INTEGER,
	enviado_em TIMESTAMP WITH TIME ZONE NOT NULL,
	politica_versao VARCHAR(80) NOT NULL,
	PRIMARY KEY (id),
	CONSTRAINT uq_tentativa_apresentacao UNIQUE (apresentacao_id),
	FOREIGN KEY(apresentacao_id) REFERENCES apresentacao (id),
	FOREIGN KEY(aluno_id) REFERENCES aluno (id),
	FOREIGN KEY(sessao_id) REFERENCES sessao_estudo (id),
	FOREIGN KEY(versao_item_id) REFERENCES versao_item (versao_id)
);

CREATE INDEX ix_tentativa_aluno_id ON tentativa (aluno_id);

CREATE INDEX ix_tentativa_questao_id ON tentativa (questao_id);

COMMIT;
