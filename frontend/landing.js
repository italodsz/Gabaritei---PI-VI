// Página de entrada para quem não está logado: apresenta o Gabaritei e leva a criar conta, entrar
// ou usar sem conta. Os números (questões, anos, questões por área) e as questões da demonstração
// vêm do acervo já carregado; a chance estimada vem do recomendador de dificuldade.
import * as Dif from './dificuldade-cliente.js';

const CHAVE_SEM_CONTA = 'gabaritei:sem-conta:v1';
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => n.toLocaleString('pt-BR');
const reduzido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const limpar = t => String(t ?? '').replace(/\*\*/g, '').replace(/^\s*\[imagem\]\s*$/gim, '').replace(/\s+/g, ' ').trim();
const corte = (t, n) => (t.length > n ? `${t.slice(0, n).replace(/\s+\S*$/, '')}…` : t);

const AREAS = [
  { id: 'linguagens', nome: 'Linguagens' },
  { id: 'humanas', nome: 'Ciências Humanas' },
  { id: 'natureza', nome: 'Ciências da Natureza' },
  { id: 'matematica', nome: 'Matemática' },
];
const AREA_DA_QUESTAO = { linguagens: 'linguagens', humanas: 'humanas', natureza: 'natureza', matematica: 'matematica' };

export const usarSemContaEscolhido = () => { try { return localStorage.getItem(CHAVE_SEM_CONTA) === '1'; } catch { return false; } };

/** Três questões reais, curtas e sem figura, de áreas diferentes, para a demonstração. */
function questoesDemo(E) {
  const todas = E.questionRepository.query({});
  const ok = q => !q.image && q.tri && q.alternatives?.length === 5 && limpar(q.prompt).length >= 60 && limpar(q.prompt).length <= 320
    && q.alternatives.every(a => limpar(a.text).length > 0 && limpar(a.text).length <= 60);
  const escolha = [];
  for (const area of ['matematica', 'natureza', 'humanas']) {
    const q = todas.filter(x => x.areaId === area && ok(x)).sort((a, b) => (a.id < b.id ? -1 : 1))[0];
    if (q) escolha.push(q);
  }
  return escolha;
}

function cartaoHTML(q, E, i) {
  const area = AREA_DA_QUESTAO[q.areaId] ?? 'matematica';
  const materia = E.SUBJECT_BY_ID[q.subjectId]?.name ?? '';
  const chance = Dif.chanceDe(q);
  return `<article class="ld-card area-${area}" data-i="${i}" aria-hidden="${i ? 'true' : 'false'}">
    <header class="ld-card-top">
      <span class="ld-badge">${esc(materia)}</span>
      <span class="ld-meta">ENEM ${q.year}</span>
      ${Number.isFinite(chance) ? `<span class="ld-chance">Chance estimada <b>${Math.round(chance * 100)}%</b></span>` : ''}
    </header>
    <p class="ld-prompt">${esc(corte(limpar(q.prompt), 190))}</p>
    <ol class="ld-alts">${q.alternatives.map(a => `<li data-letra="${esc(a.letter)}" class="${a.letter === q.correct ? 'is-certa' : ''}"><span>${esc(a.letter)}</span>${esc(corte(limpar(a.text), 46))}</li>`).join('')}</ol>
    <p class="ld-retorno" role="status">Acertou. A próxima é parecida com esta, no seu nível.</p>
  </article>`;
}

/** Monta a página. `conta.abrirEntrada('criar' | 'entrar')` abre o formulário de conta do app. */
export function montarLanding({ E, conta }) {
  const raiz = document.createElement('div');
  raiz.id = 'landing';
  raiz.className = 'ld';
  raiz.setAttribute('role', 'region');
  raiz.setAttribute('aria-label', 'Apresentação do Gabaritei');

  const todas = E.questionRepository.query({});
  const anos = todas.map(q => q.year).filter(Number.isFinite);
  const [ini, fim] = [Math.min(...anos), Math.max(...anos)];
  const porArea = AREAS.map(a => ({ ...a, n: todas.filter(q => q.areaId === a.id).length }));
  const maxArea = Math.max(...porArea.map(a => a.n));
  const demo = questoesDemo(E);

  raiz.innerHTML = `
  <header class="ld-top">
    <span class="ld-brand"><span class="ld-logo" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span><span>gabaritei<span class="ld-dot">.</span></span></span>
    <nav class="ld-top-acoes" aria-label="Conta">
      <button type="button" class="ld-btn ld-btn-texto" data-acao="entrar">Entrar</button>
      <button type="button" class="ld-btn ld-btn-escuro" data-acao="criar">Criar conta</button>
    </nav>
  </header>

  <main class="ld-main">
    <section class="ld-hero" aria-labelledby="ld-titulo">
      <div class="ld-hero-texto">
        <h1 id="ld-titulo">Questões do ENEM que se ajustam ao seu nível.</h1>
        <p class="ld-lead">São ${fmt(todas.length)} questões oficiais das provas de ${ini} a ${fim}. A cada resposta, o Gabaritei estima o seu nível e escolhe a próxima: parecida com a anterior e na medida para você.</p>
        <div class="ld-ctas">
          <button type="button" class="ld-btn ld-btn-verde ld-btn-grande" data-acao="criar">Criar conta</button>
          <button type="button" class="ld-btn ld-btn-contorno ld-btn-grande" data-acao="sem-conta">Usar sem conta</button>
        </div>
        <p class="ld-fino">Sem conta, o progresso fica só neste navegador.</p>
      </div>
      <div class="ld-demo" aria-label="Exemplo de questão sendo respondida">${demo.map((q, i) => cartaoHTML(q, E, i)).join('')}</div>
    </section>

    <section class="ld-bloco" aria-labelledby="ld-modos">
      <h2 id="ld-modos">Três jeitos de começar</h2>
      <div class="ld-modos">
        <article class="ld-modo ld-modo-largo"><img src="assets/hub-pratica.svg" alt="" width="320" height="210" loading="lazy"><div><h3>Prática sob medida</h3><p>Comece por uma questão, um tema ou no aleatório. Depois, as questões seguem sem fim, cada uma parecida com a anterior.</p></div></article>
        <article class="ld-modo"><img src="assets/hub-desafio.svg" alt="" width="320" height="210" loading="lazy"><div><h3>Até onde você chega?</h3><p>Começa fácil e a dificuldade sobe a cada acerto. Errou, acabou.</p></div></article>
        <article class="ld-modo"><img src="assets/hub-revisao.svg" alt="" width="320" height="210" loading="lazy"><div><h3>Revisão</h3><p>Refaça as questões que errou até acertar.</p></div></article>
      </div>
    </section>

    <section class="ld-bloco ld-como" aria-labelledby="ld-como">
      <div>
        <h2 id="ld-como">Como a próxima questão é escolhida</h2>
        <p class="ld-lado">Depois de 15 respostas numa área, você vê a sua nota estimada na escala do ENEM, com a margem de erro.</p>
      </div>
      <ol class="ld-passos">
        <li><h3>Você responde</h3><p>Só a primeira tentativa de cada questão conta.</p></li>
        <li><h3>O nível é recalculado</h3><p>Com a mesma teoria que o INEP usa na nota do ENEM (TRI) e os parâmetros oficiais de cada questão.</p></li>
        <li><h3>Vem a próxima</h3><p>Uma questão parecida com a anterior, com cerca de 75% de chance de acerto para você.</p></li>
      </ol>
    </section>

    <section class="ld-bloco ld-sim" aria-labelledby="ld-sim">
      <div>
        <h2 id="ld-sim">Simulados no formato do ENEM</h2>
        <p class="ld-lado">Faça a prova de uma área, com 45 questões, ou o dia completo, com 90. Tem cronômetro, e a correção aparece ao finalizar.</p>
      </div>
      <ul class="ld-areas" aria-label="Questões por área">${porArea.map(a => `<li class="area-${a.id}"><span class="ld-area-nome">${a.nome}</span><span class="ld-area-barra" style="--w:${(a.n / maxArea).toFixed(3)}" aria-hidden="true"></span><b>${fmt(a.n)}</b></li>`).join('')}</ul>
    </section>

    <section class="ld-final" aria-labelledby="ld-final">
      <h2 id="ld-final">Comece pela primeira questão.</h2>
      <div class="ld-ctas">
        <button type="button" class="ld-btn ld-btn-verde ld-btn-grande" data-acao="criar">Criar conta</button>
        <button type="button" class="ld-btn ld-btn-texto ld-btn-grande" data-acao="entrar">Já tenho conta</button>
      </div>
    </section>
  </main>
  <footer class="ld-rodape">Gabaritei, Projeto Integrador de Sistemas de Informação da PUC-Campinas.</footer>`;

  document.body.append(raiz);
  document.body.classList.add('ld-aberta');
  raiz.querySelector('h1').focus?.();

  let parado = false, timers = [];
  const fechar = () => {
    parado = true; timers.forEach(clearTimeout);
    raiz.classList.add('is-saindo');
    const fim = () => { raiz.remove(); document.body.classList.remove('ld-aberta'); };
    if (reduzido()) fim(); else setTimeout(fim, 260);
  };
  raiz.querySelectorAll('[data-acao]').forEach(b => b.addEventListener('click', () => {
    const acao = b.dataset.acao;
    if (acao === 'sem-conta') { try { localStorage.setItem(CHAVE_SEM_CONTA, '1'); } catch { /* sem armazenamento */ } fechar(); }
    else conta.abrirEntrada(acao);
  }));

  // A demonstração: a questão do topo é respondida, confirma o acerto e dá lugar à próxima.
  const cards = [...raiz.querySelectorAll('.ld-card')];
  const demoEl = raiz.querySelector('.ld-demo');
  if (!cards.length) demoEl.remove();
  else if (reduzido()) cards[0].classList.add('is-respondida');
  else {
    let atual = 0;
    const depois = (ms, fn) => timers.push(setTimeout(() => { if (!parado) fn(); }, ms));
    const ordem = () => cards.forEach((c, k) => { const pos = (k - atual + cards.length) % cards.length; c.dataset.pos = pos; c.setAttribute('aria-hidden', String(pos !== 0)); });
    const ciclo = () => {
      const c = cards[atual];
      c.classList.remove('is-marcando', 'is-respondida');
      depois(1400, () => c.classList.add('is-marcando'));
      depois(2300, () => c.classList.add('is-respondida'));
      depois(5200, () => {
        if (document.hidden) { depois(1000, ciclo); return; }
        c.classList.add('is-fora');
        depois(450, () => {
          // A que saiu volta para o fim da pilha sem cruzar as outras.
          c.classList.add('sem-transicao'); c.classList.remove('is-fora', 'is-marcando', 'is-respondida');
          atual = (atual + 1) % cards.length; ordem();
          void c.offsetWidth; c.classList.remove('sem-transicao');
          ciclo();
        });
      });
    };
    ordem(); ciclo();
  }
  return { fechar };
}
