import { answerCodex, codexGreeting, codexSuggestions, codexQueryLimit } from './codex-chat-model.js';
import { createCodexResponsePicker, personalizeCodexText } from './codex-small-talk.js';
import './codex-chat.css';

const face = '/agent-icons/codex-chibi-face.webp';
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';

export function createCodexChat({ getRecords, getAgentName = () => '', isAvailable = () => true }) {
  const root = document.createElement('div'); root.className = 'codex-chat';
  root.innerHTML = `<button type="button" class="codex-chat-launcher" aria-label="Conversar com C.O.D.E.X" aria-haspopup="dialog" aria-controls="codex-chat-dialog" aria-expanded="false"><span class="codex-chat-face"><img src="${face}" width="40" height="40" alt=""></span><span>C.O.D.E.X<small>CONSULTAR</small></span></button>
    <dialog id="codex-chat-dialog" class="codex-chat-dialog" aria-labelledby="codex-chat-title" aria-describedby="codex-chat-description">
      <header class="codex-chat-header"><span class="codex-chat-face"><img src="${face}" width="42" height="42" alt=""></span><div><h2 id="codex-chat-title">C.O.D.E.X</h2><p id="codex-chat-description">Assistência do arquivo</p></div><button type="button" class="codex-chat-close" aria-label="Fechar conversa com C.O.D.E.X">×</button></header>
      <div class="codex-chat-tools"><span>CONSULTA AO ÍNDICE</span><button type="button" data-codex-clear>Limpar conversa</button></div>
      <div class="codex-chat-log" role="log" aria-label="Conversa com C.O.D.E.X" aria-live="polite" aria-relevant="additions" tabindex="0"></div>
      <div class="codex-chat-suggestions" aria-label="Sugestões de consulta"></div>
      <form class="codex-chat-form"><label for="codex-chat-query">Sua consulta</label><div><input id="codex-chat-query" name="query" type="text" placeholder="Nome, código ou dúvida…" maxlength="${codexQueryLimit}" autocomplete="off" enterkeyhint="send" required><button type="submit" aria-label="Enviar consulta">${arrow}</button></div></form>
      <p class="codex-chat-footnote">Respostas preparadas e trechos do acervo.<br>Conversa disponível até recarregar esta página.</p>
    </dialog>`;
  // A mesma imagem em contorno das notas do arquivista, acompanhando a paleta.
  root.style.setProperty('--codex-chat-face', `url('${face}')`);
  document.body.append(root);
  const launcher = root.querySelector('.codex-chat-launcher');
  const dialog = root.querySelector('dialog');
  const log = root.querySelector('[role=log]');
  const input = root.querySelector('input');
  const suggestions = root.querySelector('.codex-chat-suggestions');
  const form = root.querySelector('form');
  const submit = form.querySelector('button[type=submit]');
  const turns = [];
  const pickResponse = createCodexResponsePicker();
  let pending = null;
  let replyTimer;

  function message(author, text, reply) {
    const article = document.createElement('article'); article.className = `codex-chat-message ${author === 'AGENTE' ? 'codex-chat-question' : 'codex-chat-answer'}`;
    const label = document.createElement('span'); label.className = 'codex-chat-author'; label.textContent = author;
    const paragraph = document.createElement('p'); paragraph.textContent = text;
    article.append(label, paragraph);
    if (reply?.results?.length) {
      const list = document.createElement('ul'); list.className = 'codex-chat-results';
      for (const result of reply.results) {
        const row = document.createElement('li');
        const a = document.createElement('a'); a.href = result.href;
        const code = document.createElement('span'); code.textContent = `${result.code} · ${result.kind}`;
        const title = document.createElement('strong'); title.textContent = result.title;
        const status = document.createElement('small'); status.textContent = [result.status, result.access].filter(Boolean).join(' · ');
        const quote = document.createElement('p'); quote.textContent = result.excerpt;
        a.append(code, title, status, quote); row.append(a); list.append(row);
      }
      article.append(list);
    }
    if (reply?.links?.length) {
      const links = document.createElement('div'); links.className = 'codex-chat-links';
      for (const item of reply.links) {
        const a = document.createElement('a'); a.href = item.href; a.textContent = `${item.title} →`; links.append(a);
      }
      article.append(links);
    }
    return article;
  }
  function typingMessage() {
    const article = document.createElement('article'); article.className = 'codex-chat-message codex-chat-answer codex-chat-typing';
    article.innerHTML = '<span class="codex-chat-author">C.O.D.E.X</span><span class="sr-only">Preparando resposta…</span><span class="codex-chat-dots" aria-hidden="true"><i></i><i></i><i></i></span>';
    return article;
  }
  function updateControls() {
    suggestions.hidden = turns.length > 0 || Boolean(pending);
    root.querySelector('[data-codex-clear]').disabled = turns.length === 0 && !pending;
    submit.disabled = Boolean(pending);
    form.setAttribute('aria-busy', String(Boolean(pending)));
  }
  function renderConversation() {
    const fragment = document.createDocumentFragment();
    fragment.append(message('C.O.D.E.X', personalizeCodexText(codexGreeting, getAgentName())));
    for (const turn of turns) {
      fragment.append(message('AGENTE', turn.query));
      // Preserve a fala sorteada no histórico. Consultas ao índice continuam
      // verificando o acervo atual, sem sortear outra resposta ao reabrir.
      const reply = ['records', 'empty'].includes(turn.reply.type)
        ? answerCodex(turn.query, getRecords(), { agentName: turn.agentName }) : turn.reply;
      fragment.append(message('C.O.D.E.X', reply.text, reply));
    }
    if (pending) fragment.append(message('AGENTE', pending.query), typingMessage());
    log.replaceChildren(fragment);
    updateControls();
    log.scrollTop = log.scrollHeight;
  }
  function send(value) {
    if (pending) return;
    const query = String(value ?? '').trim(); if (!query) { input.focus(); return; }
    const turn = { query }; pending = turn;
    log.append(message('AGENTE', query), typingMessage());
    updateControls();
    input.value = ''; input.focus({ preventScroll: true }); log.scrollTop = log.scrollHeight;
    replyTimer = setTimeout(() => {
      if (pending !== turn) return;
      turn.agentName = getAgentName();
      const reply = answerCodex(query, getRecords(), { agentName: turn.agentName, pickResponse });
      turn.reply = reply;
      pending = null; replyTimer = undefined;
      // Mantém apenas as doze consultas mais recentes em memória, sem armazenamento.
      turns.push(turn);
      if (turns.length > 12) { turns.shift(); renderConversation(); }
      else log.querySelector('.codex-chat-typing')?.replaceWith(message('C.O.D.E.X', reply.text, reply));
      updateControls(); log.scrollTop = log.scrollHeight;
    }, 1500);
  }
  function close(restoreFocus = true) {
    if (!dialog.open) return;
    dialog.close();
    if (restoreFocus && !launcher.hidden) launcher.focus({ preventScroll: true });
  }
  function refresh() {
    launcher.hidden = !isAvailable();
    if (launcher.hidden) close(false);
  }
  launcher.addEventListener('click', () => {
    if (!isAvailable() || document.querySelector('dialog[open]')) return;
    renderConversation(); dialog.showModal(); document.body.classList.add('codex-chat-open');
    launcher.setAttribute('aria-expanded', 'true'); input.focus({ preventScroll: true });
  });
  dialog.addEventListener('close', () => { document.body.classList.remove('codex-chat-open'); launcher.setAttribute('aria-expanded', 'false'); });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),[tabindex="0"]')].filter(element => element.getClientRects().length);
    const first = controls[0]; const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close(); }
    if (event.target.closest('a[href]')) close(false);
  });
  root.querySelector('.codex-chat-close').addEventListener('click', () => close());
  root.querySelector('[data-codex-clear]').addEventListener('click', () => { clearTimeout(replyTimer); replyTimer = undefined; pending = null; turns.length = 0; renderConversation(); input.focus(); });
  form.addEventListener('submit', event => { event.preventDefault(); send(input.value); });
  for (const prompt of codexSuggestions) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = prompt;
    button.addEventListener('click', () => send(prompt)); suggestions.append(button);
  }
  addEventListener('hashchange', () => close(false));
  renderConversation(); refresh();
  return { refresh, close };
}
