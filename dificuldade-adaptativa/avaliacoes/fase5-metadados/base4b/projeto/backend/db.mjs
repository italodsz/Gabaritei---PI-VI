// Banco de dados do Gabaritei: SQLite pelo módulo embutido do Node (node:sqlite), sem pacotes.
// Todo acesso passa por este arquivo e por repositorio.mjs, para permitir trocar de banco depois.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const caminhoPadrao = resolve(fileURLToPath(new URL('./dados/', import.meta.url)), 'gabaritei.db');

/** Migrações em ordem. Nunca edite uma já publicada: acrescente outra. */
export const MIGRACOES = [
  {
    versao: '0001_inicial',
    sql: `
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
`,
  },
  {
    versao: '0002_dificuldade',
    sql: `
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
`,
  },
];

// Fase 4A: acrescenta uma linhagem verificável sem reclassificar perfis/eventos legados.
MIGRACOES.push({ versao: '0003_integridade_fase4a', sql: `
CREATE TABLE sessao_exercicio (token_hash TEXT PRIMARY KEY, criada_ms INTEGER NOT NULL);
CREATE TABLE tentativa_integridade (
 id TEXT PRIMARY KEY, sujeito TEXT NOT NULL, questao_id TEXT NOT NULL, familia TEXT NOT NULL,
 sessao TEXT NOT NULL, origem TEXT NOT NULL, emitida_ms INTEGER NOT NULL, emitida_mono REAL NOT NULL,
 instancia TEXT NOT NULL, expira_ms INTEGER NOT NULL, apoio INTEGER NOT NULL DEFAULT 0,
 item_json TEXT NOT NULL, config_json TEXT NOT NULL, versoes_json TEXT NOT NULL,
 chance_previa REAL, recibo TEXT, payload_hash TEXT
);
CREATE INDEX ix_tentativa_sujeito ON tentativa_integridade(sujeito, sessao, questao_id);
CREATE TABLE evento_integridade (
 seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL UNIQUE, tentativa_id TEXT NOT NULL UNIQUE,
 sujeito TEXT NOT NULL, questao_id TEXT NOT NULL, familia TEXT NOT NULL, area TEXT NOT NULL,
 alternativa TEXT NOT NULL, correta INTEGER NOT NULL, tempo_ms INTEGER NOT NULL, recebida_ms INTEGER NOT NULL,
 origem TEXT NOT NULL, apoio INTEGER NOT NULL, conta INTEGER NOT NULL, adapta INTEGER NOT NULL, alvo REAL NOT NULL,
 motivo TEXT, chance_previa REAL, item_json TEXT NOT NULL, config_json TEXT NOT NULL, versoes_json TEXT NOT NULL,
 chave TEXT NOT NULL, payload_hash TEXT NOT NULL, perfil_apos TEXT NOT NULL, UNIQUE(sujeito, chave)
);
CREATE INDEX ix_evento_integridade ON evento_integridade(sujeito, familia);
CREATE TABLE perfil_verificado (
 sujeito TEXT NOT NULL, area TEXT NOT NULL, perfil_json TEXT NOT NULL, revisao INTEGER NOT NULL,
 PRIMARY KEY(sujeito, area)
);
CREATE TABLE rejeicao_integridade (
 id TEXT PRIMARY KEY, sujeito TEXT, tentativa_id TEXT, motivo TEXT NOT NULL, recebida_ms INTEGER NOT NULL
);
CREATE TABLE legado_importado (
 sujeito TEXT NOT NULL, hash TEXT NOT NULL, conteudo TEXT NOT NULL, criada_ms INTEGER NOT NULL,
 PRIMARY KEY(sujeito, hash)
);
` });

MIGRACOES.push({versao:'0004_recomendacao_unificada',sql:`
CREATE TABLE recomendacao_unificada (
 id TEXT PRIMARY KEY, sujeito TEXT NOT NULL, criada_ms INTEGER NOT NULL,
 entrada_json TEXT NOT NULL, resultado_json TEXT NOT NULL, versao TEXT NOT NULL
);
CREATE INDEX recomendacao_sujeito ON recomendacao_unificada(sujeito,criada_ms);
CREATE TABLE exposicao_unificada (
 id TEXT PRIMARY KEY, sujeito TEXT NOT NULL, recomendacao_id TEXT NOT NULL REFERENCES recomendacao_unificada(id),
 questao_id TEXT NOT NULL, tentativa_id TEXT NOT NULL REFERENCES tentativa_integridade(id), criada_ms INTEGER NOT NULL,
 UNIQUE(sujeito,recomendacao_id,tentativa_id)
);
`});

export function abrirBanco(caminho = process.env.GABARITEI_DB || caminhoPadrao) {
  if (caminho !== ':memory:') mkdirSync(dirname(caminho), { recursive: true });
  const db = new DatabaseSync(caminho);
  db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  if (caminho !== ':memory:') db.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;');
  migrar(db);
  return db;
}

export function migrar(db) {
  db.exec('CREATE TABLE IF NOT EXISTS migracao (versao TEXT PRIMARY KEY, aplicada_em TEXT NOT NULL)');
  const feitas = new Set(db.prepare('SELECT versao FROM migracao').all().map(r => r.versao));
  const aplicadas = [];
  for (const m of MIGRACOES) {
    if (feitas.has(m.versao)) continue;
    db.exec('BEGIN');
    try {
      db.exec(m.sql);
      db.prepare('INSERT INTO migracao (versao, aplicada_em) VALUES (?, ?)').run(m.versao, new Date().toISOString());
      db.exec('COMMIT');
    } catch (erro) { db.exec('ROLLBACK'); throw erro; }
    aplicadas.push(m.versao);
  }
  return aplicadas;
}

/** Executa fn dentro de uma transação; desfaz tudo se lançar erro. */
export function transacao(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const r = fn(); db.exec('COMMIT'); return r; } catch (erro) { db.exec('ROLLBACK'); throw erro; }
}
