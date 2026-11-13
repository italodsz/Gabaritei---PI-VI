-- 0002: username local do aluno (PostgreSQL). Idempotente; nao apaga nem recria tabelas.
-- Alunos antigos (so UUID) ficam com username NULL; nenhum historico e vinculado a um username por suposicao.
-- Em SQLite/PostgreSQL o backend aplica o equivalente automaticamente (gabaritei_rec.db.migrar).
BEGIN;
ALTER TABLE aluno ADD COLUMN IF NOT EXISTS username VARCHAR(80);
CREATE UNIQUE INDEX IF NOT EXISTS ux_aluno_username ON aluno (username);
CREATE TABLE IF NOT EXISTS migracao_aplicada (
    versao VARCHAR(40) NOT NULL PRIMARY KEY,
    aplicada_em TIMESTAMP WITH TIME ZONE NOT NULL
);
INSERT INTO migracao_aplicada (versao, aplicada_em) VALUES ('0001_inicial', now()) ON CONFLICT DO NOTHING;
INSERT INTO migracao_aplicada (versao, aplicada_em) VALUES ('0002_usuario', now()) ON CONFLICT DO NOTHING;
COMMIT;
