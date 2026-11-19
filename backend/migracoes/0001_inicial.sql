CREATE TABLE usuario (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  nome TEXT NOT NULL,
  apelido TEXT NOT NULL DEFAULT '',
  escola TEXT NOT NULL DEFAULT '',
  cidade TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  senha_hash TEXT NOT NULL,
  criado_em TEXT NOT NULL,
  atualizado_em TEXT NOT NULL
);
CREATE TABLE sessao_login (
  token_hash TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  criada_em TEXT NOT NULL,
  expira_em TEXT NOT NULL,
  ultimo_uso TEXT NOT NULL,
  agente TEXT NOT NULL DEFAULT ''
);
CREATE INDEX ix_sessao_login_usuario ON sessao_login(usuario_id);
-- uma linha por bloco de dados do usuário; "revisao" evita que duas abas se sobrescrevam
CREATE TABLE estado_usuario (
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  chave TEXT NOT NULL CHECK (chave IN ('estudos','plano','notas')),
  revisao INTEGER NOT NULL DEFAULT 0,
  atualizado_em TEXT NOT NULL,
  PRIMARY KEY (usuario_id, chave)
);
CREATE TABLE conta_estudos (
  usuario_id TEXT PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
  schema_version INTEGER NOT NULL,
  onboarding TEXT NOT NULL,
  preferencias TEXT NOT NULL,
  extra TEXT NOT NULL DEFAULT '{}'
);
CREATE TABLE sessao_pratica (
  id TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  modo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_progress','completed')),
  criada_em TEXT NOT NULL,
  atualizada_em TEXT NOT NULL,
  concluida_em TEXT,
  filtros TEXT NOT NULL,
  questoes TEXT NOT NULL,
  indice_atual INTEGER NOT NULL DEFAULT 0,
  relogio TEXT NOT NULL,
  cursor_ms INTEGER NOT NULL DEFAULT 0,
  cronometro_visivel INTEGER NOT NULL DEFAULT 1,
  extra TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX ix_pratica_usuario ON sessao_pratica(usuario_id, atualizada_em);
CREATE TABLE resposta_pratica (
  sessao_id TEXT NOT NULL REFERENCES sessao_pratica(id) ON DELETE CASCADE,
  questao_id TEXT NOT NULL,
  selecionada TEXT CHECK (selecionada IS NULL OR selecionada IN ('A','B','C','D','E')),
  confirmada INTEGER NOT NULL DEFAULT 0,
  correta INTEGER,
  respondida_em TEXT,
  tempo_ms INTEGER NOT NULL DEFAULT 0,
  extra TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (sessao_id, questao_id)
);
CREATE INDEX ix_resposta_pratica_questao ON resposta_pratica(questao_id);
CREATE TABLE simulado (
  id TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_progress','completed')),
  criado_em TEXT NOT NULL,
  atualizado_em TEXT NOT NULL,
  concluido_em TEXT,
  motivo_fim TEXT,
  configuracao TEXT NOT NULL,
  questoes TEXT NOT NULL,
  secoes TEXT NOT NULL,
  marcadas TEXT NOT NULL,
  indice_atual INTEGER NOT NULL DEFAULT 0,
  relogio TEXT NOT NULL,
  cursor_ms INTEGER NOT NULL DEFAULT 0,
  cronometro_oculto INTEGER NOT NULL DEFAULT 0,
  extra TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX ix_simulado_usuario ON simulado(usuario_id, atualizado_em);
CREATE TABLE resposta_simulado (
  simulado_id TEXT NOT NULL REFERENCES simulado(id) ON DELETE CASCADE,
  questao_id TEXT NOT NULL,
  selecionada TEXT CHECK (selecionada IS NULL OR selecionada IN ('A','B','C','D','E')),
  respondida_em TEXT,
  tempo_ms INTEGER NOT NULL DEFAULT 0,
  extra TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (simulado_id, questao_id)
);
CREATE TABLE favorita (
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  questao_id TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  PRIMARY KEY (usuario_id, questao_id)
);
CREATE TABLE marca_revisao (
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  questao_id TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  PRIMARY KEY (usuario_id, questao_id)
);
CREATE TABLE meta (
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  alvo REAL NOT NULL,
  ativa INTEGER NOT NULL,
  ordem INTEGER NOT NULL,
  PRIMARY KEY (usuario_id, tipo)
);
CREATE TABLE conquista_celebrada (
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  conquista_id TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  PRIMARY KEY (usuario_id, conquista_id)
);
CREATE TABLE atividade_plano (
  id TEXT NOT NULL,
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  area TEXT NOT NULL,
  criada_em TEXT,
  atualizada_em TEXT,
  dados TEXT NOT NULL,
  PRIMARY KEY (usuario_id, id)
);
CREATE TABLE nota_bloco (
  id TEXT NOT NULL,
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('text','ref')),
  html TEXT,
  ref_tipo TEXT,
  ref_id TEXT,
  dados TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (usuario_id, id)
);
