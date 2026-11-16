// Rotas de conta e de dados do usuário. Devolve true quando tratou a requisição.
import { hashSenha, conferirSenha, validarCadastro, lerCookie, cookieSessao, cookieLimpo, LimiteTentativas, erro } from './auth.mjs';
import { randomBytes } from 'node:crypto';

const BLOCOS = { estudos: ['obterEstudos', 'salvarEstudos'], plano: ['obterPlano', 'salvarPlano'], notas: ['obterNotas', 'salvarNotas'] };
export const LIMITE_CORPO_DADOS = 8_000_000;

export function criarRotasConta(repo, { seguro = false, limites = {} } = {}) {
  // e-mail: 8 falhas/15 min; IP: 30 falhas/15 min (laboratórios compartilham IP); cadastros: 20/hora por IP
  const porEmail = limites.email ?? new LimiteTentativas(8), porIp = limites.ip ?? new LimiteTentativas(30), cadastros = limites.cadastros ?? new LimiteTentativas(20, 3600_000);
  // hash falso para gastar o mesmo tempo quando o e-mail não existe (evita revelar quais e-mails têm conta)
  const falso = hashSenha('senha-inexistente-' + randomBytes(8).toString('hex'));

  async function iniciarSessao(res, req, usuario) {
    const token = randomBytes(32).toString('base64url');
    repo.criarSessaoLogin(usuario.id, token, req.headers['user-agent']);
    res.setHeader('Set-Cookie', cookieSessao(token, { seguro }));
  }
  const usuarioAtual = req => repo.usuarioDaSessao(lerCookie(req));
  const exigir = req => { const u = usuarioAtual(req); if (!u) throw erro(401, 'Entre na sua conta para continuar.'); return u; };

  return async function tratar({ req, res, pathname, send, body }) {
    if (!pathname.startsWith('/api/auth/') && !pathname.startsWith('/api/eu')) return false;
    const m = req.method;
    const chaveIp = `ip:${req.socket.remoteAddress}`;

    if (m === 'POST' && pathname === '/api/auth/registrar') {
      if (cadastros.bloqueado(chaveIp)) throw erro(429, 'Muitos cadastros deste computador. Tente novamente mais tarde.');
      const dados = validarCadastro(await body(req));
      const usuario = repo.criarUsuario({ nome: dados.nome, email: dados.email, senhaHash: await hashSenha(dados.senha) });
      cadastros.registrarFalha(chaveIp);
      await iniciarSessao(res, req, usuario);
      send(res, 201, { usuario }); return true;
    }
    if (m === 'POST' && pathname === '/api/auth/entrar') {
      const input = await body(req);
      const email = typeof input?.email === 'string' ? input.email.trim().toLowerCase() : '';
      if (porEmail.bloqueado(email) || porIp.bloqueado(chaveIp)) throw erro(429, 'Muitas tentativas. Aguarde alguns minutos.');
      const u = email && typeof input.senha === 'string' && input.senha.length <= 200 ? repo.usuarioPorEmail(email) : null;
      const ok = await conferirSenha(typeof input?.senha === 'string' ? input.senha.slice(0, 200) : '', u ? u.senha_hash : await falso);
      if (!u || !ok) { porEmail.registrarFalha(email); porIp.registrarFalha(chaveIp); throw erro(401, 'E-mail ou senha incorretos.'); }
      porEmail.zerar(email);
      await iniciarSessao(res, req, repo.publico(u));
      send(res, 200, { usuario: repo.publico(u) }); return true;
    }
    if (m === 'POST' && pathname === '/api/auth/sair') {
      repo.encerrarSessaoLogin(lerCookie(req));
      res.setHeader('Set-Cookie', cookieLimpo());
      send(res, 200, { ok: true }); return true;
    }
    if (m === 'GET' && pathname === '/api/eu') { send(res, 200, { usuario: usuarioAtual(req) }); return true; }

    if (m === 'POST' && pathname === '/api/eu/senha') {
      const u = exigir(req), input = await body(req);
      const completo = repo.usuarioPorEmail(u.email);
      if (typeof input?.atual !== 'string' || !(await conferirSenha(input.atual.slice(0, 200), completo.senha_hash))) throw erro(403, 'Senha atual incorreta.');
      if (typeof input.nova !== 'string' || input.nova.length < 8 || input.nova.length > 200) throw erro(400, 'A nova senha precisa ter de 8 a 200 caracteres.');
      repo.trocarSenha(u.id, await hashSenha(input.nova));
      await iniciarSessao(res, req, u); // as demais sessões foram encerradas
      send(res, 200, { ok: true }); return true;
    }
    if (m === 'DELETE' && pathname === '/api/eu') {
      const u = exigir(req), input = await body(req);
      if (typeof input?.senha !== 'string' || !(await conferirSenha(input.senha.slice(0, 200), repo.usuarioPorEmail(u.email).senha_hash))) throw erro(403, 'Senha incorreta.');
      repo.excluirUsuario(u.id);
      res.setHeader('Set-Cookie', cookieLimpo());
      send(res, 200, { ok: true }); return true;
    }
    if (m === 'GET' && pathname === '/api/eu/exportar') {
      const u = exigir(req);
      send(res, 200, { exportadoEm: new Date().toISOString(), usuario: u, estudos: repo.obterEstudos(u.id).data, plano: repo.obterPlano(u.id).data, notas: repo.obterNotas(u.id).data }); return true;
    }
    const bloco = pathname.match(/^\/api\/eu\/(estudos|plano|notas)$/);
    if (bloco) {
      const u = exigir(req), [obter, salvar] = BLOCOS[bloco[1]];
      if (m === 'GET') { send(res, 200, repo[obter](u.id)); return true; }
      if (m === 'PUT') {
        const input = await body(req, LIMITE_CORPO_DADOS);
        if (!input || typeof input !== 'object' || !('data' in input)) throw erro(400, 'Envie { "data": ..., "baseRevisao": n }.');
        const base = input.baseRevisao === undefined || input.baseRevisao === null ? undefined : input.baseRevisao;
        if (base !== undefined && !Number.isInteger(base)) throw erro(400, 'baseRevisao inválida.');
        try { send(res, 200, repo[salvar](u.id, input.data, base)); } catch (e) { if (e.status === 409 && e.revisao !== undefined) { send(res, 409, { error: e.message, revisao: e.revisao }); } else throw e; }
        return true;
      }
    }
    return false;
  };
}
