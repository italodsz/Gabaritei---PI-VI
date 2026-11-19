CREATE TABLE perfil_tri (
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  area TEXT NOT NULL CHECK (area IN ('CN','CH','LC','MT')),
  lw TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  atualizado_em INTEGER,
  pstar REAL,
  respostas TEXT NOT NULL DEFAULT '[]',
  versao_config TEXT NOT NULL,
  PRIMARY KEY (usuario_id, area)
);
CREATE TABLE perfil_tri_historico (
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  area TEXT NOT NULL,
  dia TEXT NOT NULL,
  nota REAL,
  nota_min REAL,
  nota_max REAL,
  n INTEGER NOT NULL,
  PRIMARY KEY (usuario_id, area, dia)
);
CREATE TABLE resposta_evento (
  id TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  questao_id TEXT NOT NULL,
  area TEXT NOT NULL,
  alternativa TEXT CHECK (alternativa IS NULL OR alternativa IN ('A','B','C','D','E')),
  correta INTEGER NOT NULL,
  tempo_ms INTEGER,
  primeira INTEGER NOT NULL,
  apoio INTEGER NOT NULL DEFAULT 0,
  origem TEXT NOT NULL CHECK (origem IN ('pratica','simulado')),
  chance_prevista REAL,
  theta_media REAL,
  theta_dp REAL,
  pstar REAL,
  conta INTEGER NOT NULL,
  motivo TEXT,
  versao_config TEXT NOT NULL,
  criada_em TEXT NOT NULL
);
CREATE INDEX ix_evento_usuario ON resposta_evento(usuario_id, criada_em);
CREATE INDEX ix_evento_questao ON resposta_evento(questao_id);
CREATE TABLE config_dificuldade (
  versao TEXT PRIMARY KEY,
  sha256 TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  registrada_em TEXT NOT NULL
);
