// Interface de conta: bloco no menu do perfil e janelas de entrar, criar conta, senha e exclusão.
import { usuarioAtual, entrar, registrar, sair, excluirConta, trocarSenha, aoMudarSituacao, situacaoAtual, definirAvisador } from './conta.js';

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TEXTO = {
  local: 'Seu progresso fica neste navegador. Entre para guardá-lo na sua conta.',
  salvo: 'Progresso salvo na sua conta.', salvando: 'Salvando na sua conta…',
  offline: 'Sem conexão com a conta: o progresso está salvo neste navegador e sobe quando possível.',
  conflito: 'Dados alterados em outra aba ou dispositivo. Recarregue a página.',
};

export function montarConta({ menu, openDialog, closeDialog, toast }) {
  const caixa = menu.querySelector('#account-box');
  const descricao = menu.querySelector('p');
  definirAvisador(toast);
  const recarregar = () => location.reload();

  function pintar() {
    const u = usuarioAtual();
    descricao.textContent = TEXTO[u ? situacaoAtual() : 'local'];
    caixa.innerHTML = u
      ? `<div class="account-who"><strong>${esc(u.nome)}</strong><span>${esc(u.email)}</span></div>
         <button type="button" class="profile-link" id="account-password">Trocar senha</button>
         <a class="profile-link" href="/api/eu/exportar" download="gabaritei-meus-dados.json">Baixar meus dados</a>
         <button type="button" class="profile-link" id="account-logout">Sair da conta</button>
         <button type="button" class="profile-link account-danger" id="account-delete">Excluir minha conta</button>`
      : '<button type="button" class="profile-link account-cta" id="account-login">Entrar ou criar conta</button>';
    caixa.querySelector('#account-login')?.addEventListener('click', () => { menu.hidden = true; abrirEntrada('entrar'); });
    caixa.querySelector('#account-logout')?.addEventListener('click', async () => { await sair(); recarregar(); });
    caixa.querySelector('#account-password')?.addEventListener('click', () => { menu.hidden = true; abrirSenha(); });
    caixa.querySelector('#account-delete')?.addEventListener('click', () => { menu.hidden = true; abrirExclusao(); });
  }

  function formulario({ rotulo, titulo, texto, campos, botao, enviar, rodape }) {
    openDialog(`${rotulo ? `<span class="dialog-label">${rotulo}</span>` : ''}<h2 id="dialog-title" class="dialog-title">${titulo}</h2><p class="dialog-description">${texto}</p>
      <form class="account-form" novalidate>${campos.map(c => `<label>${esc(c.rotulo)}<input name="${c.nome}" type="${c.tipo}" autocomplete="${c.auto}" ${c.min ? `minlength="${c.min}"` : ''} required></label>`).join('')}
      <p class="account-error" role="alert" aria-live="assertive"></p>
      <div class="dialog-actions"><button class="primary-button" type="submit">${botao}</button></div></form>${rodape || ''}`);
    const form = document.querySelector('#dialog-content .account-form'), erro = form.querySelector('.account-error'), btn = form.querySelector('button[type=submit]');
    form.elements[0]?.focus();
    form.addEventListener('submit', async ev => {
      ev.preventDefault(); erro.textContent = ''; btn.disabled = true;
      try { await enviar(Object.fromEntries(new FormData(form))); } catch (e) { erro.textContent = e.message; btn.disabled = false; }
    });
  }

  function abrirEntrada(modo) {
    const criar = modo === 'criar';
    formulario({
      rotulo: '', titulo: criar ? 'Criar conta' : 'Entrar',
      texto: criar ? 'Com uma conta, suas práticas, simulados, plano e notas ficam salvos no servidor e acompanham você em qualquer navegador. O que já está neste navegador sobe para a conta.' : 'Entre para continuar de onde parou.',
      campos: [...(criar ? [{ nome: 'nome', rotulo: 'Nome', tipo: 'text', auto: 'name' }] : []), { nome: 'email', rotulo: 'E-mail', tipo: 'email', auto: 'email' }, { nome: 'senha', rotulo: criar ? 'Senha (mínimo 8 caracteres)' : 'Senha', tipo: 'password', auto: criar ? 'new-password' : 'current-password', min: criar ? 8 : 0 }],
      botao: criar ? 'Criar conta' : 'Entrar',
      enviar: async d => { if (criar) await registrar(d.nome, d.email, d.senha); else await entrar(d.email, d.senha); closeDialog(); recarregar(); },
      rodape: `<p class="account-switch">${criar ? 'Já tem conta?' : 'Ainda não tem conta?'} <button type="button" class="account-link" id="account-switch">${criar ? 'Entrar' : 'Criar conta'}</button></p>`,
    });
    document.querySelector('#account-switch').onclick = () => abrirEntrada(criar ? 'entrar' : 'criar');
  }
  function abrirSenha() {
    formulario({ rotulo: '', titulo: 'Trocar senha', texto: 'As outras sessões desta conta serão encerradas.',
      campos: [{ nome: 'atual', rotulo: 'Senha atual', tipo: 'password', auto: 'current-password' }, { nome: 'nova', rotulo: 'Nova senha (mínimo 8 caracteres)', tipo: 'password', auto: 'new-password', min: 8 }], botao: 'Salvar nova senha',
      enviar: async d => { await trocarSenha(d.atual, d.nova); closeDialog(); toast('Senha alterada.'); } });
  }
  function abrirExclusao() {
    formulario({ rotulo: '', titulo: 'Excluir minha conta?', texto: 'Isso apaga do servidor o seu perfil, práticas, simulados, plano e notas. Não dá para desfazer. Baixe seus dados antes, se quiser guardá-los.',
      campos: [{ nome: 'senha', rotulo: 'Confirme sua senha', tipo: 'password', auto: 'current-password' }], botao: 'Excluir definitivamente',
      enviar: async d => { await excluirConta(d.senha); closeDialog(); recarregar(); } });
  }

  aoMudarSituacao(pintar); pintar();
  return { abrirEntrada };
}
