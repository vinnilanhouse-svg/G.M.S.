// Sequência narrativa temporária acionada pela credencial PAPÃO.
const DENIAL_MS = 8000;
const REDIRECT_MS = 1500;
const SEGMENTS = 24;
const warning = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M32 7 59 54H5Z"/><path d="M32 23v15"/><circle cx="32" cy="46" r="1.5" fill="currentColor" stroke="none"/></svg>';

export function showAccessDeniedEffect({ onComplete }) {
  const originalTitle = document.title;
  const screen = document.createElement('dialog');
  screen.className = 'access-denied-screen';
  screen.setAttribute('aria-labelledby', 'access-denied-title');
  screen.tabIndex = -1;
  screen.innerHTML = `
    <header class="denied-header">
      <div class="denied-brand"><span class="denied-logo" role="img" aria-label="Erro de autorização">${warning}</span><span>ARQUIVO <b>GMS</b><small>CONTROLE DE ACESSO</small></span></div>
      <span class="denied-terminal">TERMINAL 001 / ERRO 403</span>
    </header>
    <div class="denied-content">
      <div class="denied-symbol">${warning}</div>
      <p class="denied-kicker">CONSULTA INTERROMPIDA</p>
      <h1 id="access-denied-title">Acesso negado</h1>
      <p class="denied-message">Você não tem autorização para acessar este arquivo.</p>
      <div class="denied-rule"></div>
      <p class="denied-detail">A credencial informada não habilita a consulta solicitada.</p>
    </div>
    <footer class="denied-footer"><span>G.M.S. / ARQUIVO CENTRAL</span><span>ACESSO NÃO AUTORIZADO</span></footer>`;

  const redirect = document.createElement('dialog');
  redirect.className = 'access-redirect-dialog';
  redirect.setAttribute('aria-labelledby', 'access-redirect-title');
  redirect.tabIndex = -1;
  redirect.innerHTML = `
    <div class="redirect-heading">${warning}<span>GMS / CONTROLE DE ACESSO</span></div>
    <h2 id="access-redirect-title">Redirecionando</h2>
    <p>Retornando ao painel inicial.</p>
    <div class="redirect-progress" role="progressbar" aria-label="Redirecionamento ao painel inicial" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      ${Array.from({ length: SEGMENTS }, () => '<span aria-hidden="true"></span>').join('')}
    </div>
    <div class="redirect-meta"><span>RESTABELECENDO CONSULTA</span><span data-redirect-percentage>0%</span></div>`;

  document.body.append(screen, redirect);
  document.body.classList.add('access-denied-active');
  document.title = 'Acesso negado — Arquivo GMS';
  screen.showModal();
  screen.focus({ preventScroll: true });

  const started = performance.now();
  const progress = redirect.querySelector('[role="progressbar"]');
  const segments = [...progress.children];
  const percentage = redirect.querySelector('[data-redirect-percentage]');
  let frame;
  let disposed = false;

  function setProgress(value) {
    const filled = Math.floor(value * SEGMENTS / 100);
    segments.forEach((segment, index) => segment.classList.toggle('is-filled', index < filled));
    progress.setAttribute('aria-valuenow', String(value));
    percentage.textContent = `${value}%`;
  }

  function cleanup() {
    if (disposed) return;
    disposed = true;
    clearTimeout(denialTimer);
    clearTimeout(finishTimer);
    cancelAnimationFrame(frame);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    removeEventListener('pagehide', cleanup);
    for (const dialog of [redirect, screen]) {
      if (dialog.open) dialog.close();
      dialog.remove();
    }
    document.body.classList.remove('access-denied-active');
    document.title = originalTitle;
  }

  function finish() {
    if (disposed) return;
    setProgress(100);
    cleanup();
    onComplete();
  }

  function animate(now) {
    if (disposed) return;
    const elapsed = now - started - DENIAL_MS;
    if (elapsed >= REDIRECT_MS) { finish(); return; }
    setProgress(Math.max(0, Math.min(99, Math.floor(elapsed * 100 / REDIRECT_MS))));
    frame = requestAnimationFrame(animate);
  }

  function beginRedirect() {
    if (disposed || redirect.open) return;
    if (performance.now() - started >= DENIAL_MS + REDIRECT_MS) { finish(); return; }
    redirect.showModal();
    redirect.focus({ preventScroll: true });
    animate(performance.now());
  }

  function onVisibilityChange() {
    if (document.hidden || disposed) return;
    const elapsed = performance.now() - started;
    if (elapsed >= DENIAL_MS + REDIRECT_MS) finish();
    else if (elapsed >= DENIAL_MS) beginRedirect();
  }

  const denialTimer = setTimeout(beginRedirect, DENIAL_MS);
  const finishTimer = setTimeout(finish, DENIAL_MS + REDIRECT_MS);
  for (const dialog of [screen, redirect]) {
    dialog.addEventListener('cancel', event => event.preventDefault());
  }
  document.addEventListener('visibilitychange', onVisibilityChange);
  addEventListener('pagehide', cleanup);
  return cleanup;
}
