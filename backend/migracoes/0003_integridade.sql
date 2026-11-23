-- 0003 · Integridade (auditoria do banco para o MER, 20/11/2026)
-- Torna explícitas regras que antes só o código garantia. As colunas, a ordem delas e os nomes
-- continuam os mesmos: as consultas do backend não mudam.
--   * versão de configuração do TRI vira chave estrangeira (perfil_tri, resposta_evento → config_dificuldade);
--   * campos lógicos aceitam só 0 ou 1; chances e metas ficam entre 0 e 1; tempos não negativos;
--   * resposta_evento: "conta" e "motivo" coerentes (conta = 1 sem motivo; conta = 0 com um motivo conhecido);
--   * nota_bloco: bloco de texto tem html e não tem referência; bloco de referência tem o tipo da referência;
--   * área TRI validada também no histórico; índices para as consultas do painel e da limpeza de sessões.
-- SQLite não altera restrições de uma tabela existente: cada tabela é recriada e os dados copiados.
-- Só são recriadas tabelas que não são referenciadas por outras (nenhuma exclusão em cascata é disparada).

-- Versões de configuração já usadas e ainda não registradas (bancos antigos) entram como conhecidas.
INSERT OR IGNORE INTO config_dificuldade (versao, sha256, conteudo, registrada_em)
  SELECT versao_config, 'desconhecido', '{}', '1970-01-01T00:00:00.000Z' FROM perfil_tri
  UNION SELECT versao_config, 'desconhecido', '{}', '1970-01-01T00:00:00.000Z' FROM resposta_evento;

CREATE TABLE perfil_tri_novo (
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  area TEXT NOT NULL CHECK (area IN ('CN','CH','LC','MT')),
  lw TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0 CHECK (n >= 0),
  atualizado_em INTEGER,
  pstar REAL CHECK (pstar IS NULL OR pstar BETWEEN 0 AND 1),
  respostas TEXT NOT NULL DEFAULT '[]',
  versao_config TEXT NOT NULL REFERENCES config_dificuldade(versao),
  PRIMARY KEY (usuario_id, area)
);
INSERT INTO perfil_tri_novo SELECT * FROM perfil_tri;
DROP TABLE perfil_tri;
ALTER TABLE perfil_tri_novo RENAME TO perfil_tri;

CREATE TABLE perfil_tri_historico_novo (
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  area TEXT NOT NULL CHECK (area IN ('CN','CH','LC','MT')),
  dia TEXT NOT NULL,
  nota REAL,
  nota_min REAL,
  nota_max REAL,
  n INTEGER NOT NULL CHECK (n >= 0),
  PRIMARY KEY (usuario_id, area, dia)
);
INSERT INTO perfil_tri_historico_novo SELECT * FROM perfil_tri_historico;
DROP TABLE perfil_tri_historico;
ALTER TABLE perfil_tri_historico_novo RENAME TO perfil_tri_historico;

CREATE TABLE resposta_evento_novo (
  id TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  questao_id TEXT NOT NULL,
  area TEXT NOT NULL CHECK (area IN ('CN','CH','LC','MT')),
  alternativa TEXT CHECK (alternativa IS NULL OR alternativa IN ('A','B','C','D','E')),
  correta INTEGER NOT NULL CHECK (correta IN (0,1)),
  tempo_ms INTEGER CHECK (tempo_ms IS NULL OR tempo_ms >= 0),
  primeira INTEGER NOT NULL CHECK (primeira IN (0,1)),
  apoio INTEGER NOT NULL DEFAULT 0 CHECK (apoio IN (0,1)),
  origem TEXT NOT NULL CHECK (origem IN ('pratica','simulado')),
  chance_prevista REAL CHECK (chance_prevista IS NULL OR chance_prevista BETWEEN 0 AND 1),
  theta_media REAL,
  theta_dp REAL CHECK (theta_dp IS NULL OR theta_dp >= 0),
  pstar REAL CHECK (pstar IS NULL OR pstar BETWEEN 0 AND 1),
  conta INTEGER NOT NULL CHECK (conta IN (0,1)),
  motivo TEXT,
  versao_config TEXT NOT NULL REFERENCES config_dificuldade(versao),
  criada_em TEXT NOT NULL,
  CHECK ((conta = 1 AND motivo IS NULL) OR (conta = 0 AND motivo IS NOT NULL AND motivo IN
    ('parametros_fora_da_triagem','repeticao','com_apoio','resposta_muito_rapida')))
);
INSERT INTO resposta_evento_novo SELECT * FROM resposta_evento;
DROP TABLE resposta_evento;
ALTER TABLE resposta_evento_novo RENAME TO resposta_evento;
CREATE INDEX ix_evento_usuario ON resposta_evento(usuario_id, criada_em);
CREATE INDEX ix_evento_questao ON resposta_evento(questao_id);
CREATE INDEX ix_evento_area ON resposta_evento(area, conta, apoio);

CREATE TABLE resposta_pratica_novo (
  sessao_id TEXT NOT NULL REFERENCES sessao_pratica(id) ON DELETE CASCADE,
  questao_id TEXT NOT NULL,
  selecionada TEXT CHECK (selecionada IS NULL OR selecionada IN ('A','B','C','D','E')),
  confirmada INTEGER NOT NULL DEFAULT 0 CHECK (confirmada IN (0,1)),
  correta INTEGER CHECK (correta IS NULL OR correta IN (0,1)),
  respondida_em TEXT,
  tempo_ms INTEGER NOT NULL DEFAULT 0 CHECK (tempo_ms >= 0),
  extra TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (sessao_id, questao_id)
);
INSERT INTO resposta_pratica_novo SELECT * FROM resposta_pratica;
DROP TABLE resposta_pratica;
ALTER TABLE resposta_pratica_novo RENAME TO resposta_pratica;
CREATE INDEX ix_resposta_pratica_questao ON resposta_pratica(questao_id);

CREATE TABLE meta_novo (
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  alvo REAL NOT NULL,
  ativa INTEGER NOT NULL CHECK (ativa IN (0,1)),
  ordem INTEGER NOT NULL,
  PRIMARY KEY (usuario_id, tipo)
);
INSERT INTO meta_novo SELECT * FROM meta;
DROP TABLE meta;
ALTER TABLE meta_novo RENAME TO meta;

CREATE TABLE nota_bloco_novo (
  id TEXT NOT NULL,
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('text','ref')),
  html TEXT,
  ref_tipo TEXT,
  ref_id TEXT,
  dados TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (usuario_id, id),
  CHECK ((tipo = 'text' AND html IS NOT NULL AND ref_tipo IS NULL AND ref_id IS NULL)
      OR (tipo = 'ref' AND html IS NULL AND ref_tipo IS NOT NULL AND ref_id IS NOT NULL))
);
INSERT INTO nota_bloco_novo SELECT * FROM nota_bloco;
DROP TABLE nota_bloco;
ALTER TABLE nota_bloco_novo RENAME TO nota_bloco;

CREATE INDEX ix_resposta_simulado_questao ON resposta_simulado(questao_id);
CREATE INDEX ix_sessao_login_expira ON sessao_login(expira_em);
