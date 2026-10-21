// Vinheta de entrada: não altera as credenciais ou as permissões do arquivo.
const VALIDATION_MS = 1800;
const WELCOME_MS = 700;
const EXIT_MS = 150;
const SEGMENTS = 24;

export function showEntryScreen(logo) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const validationMs = reducedMotion ? 0 : VALIDATION_MS;
  const dialog = document.createElement('dialog');
  dialog.className = 'entry-screen';
  dialog.setAttribute('aria-label', 'Acesso ao Arquivo GMS');
  dialog.tabIndex = -1;
  dialog.innerHTML = `
    <div class="entry-screen-brand"><img class="gms-mark" alt="" width="88" height="88"><span>GMS / ARQUIVO CENTRAL</span></div>
    <div class="entry-screen-status" aria-live="polite" aria-atomic="true">
      <h2>Validando credenciais</h2>
      <p>Aguarde a liberação do terminal.</p>
    </div>
    <div class="entry-screen-progress" role="progressbar" aria-label="Validação de credenciais" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      ${Array.from({length: SEGMENTS}, () => '<span aria-hidden="true"></span>').join('')}
    </div>
    <div class="entry-screen-meta" aria-hidden="true"><span data-entry-label>VERIFICAÇÃO EM ANDAMENTO</span><span data-entry-percentage>0%</span></div>`;
  dialog.querySelector('img').src = logo;
  document.body.append(dialog);
  document.body.classList.add('entry-screen-open');
  dialog.showModal();
  dialog.focus({preventScroll: true});

  const started = performance.now();
  const progress = dialog.querySelector('[role="progressbar"]');
  const segments = [...progress.children];
  const percentage = dialog.querySelector('[data-entry-percentage]');
  let frame;
  let removeTimer;
  let completed = false;
  let leaving = false;
  let disposed = false;

  function setProgress(value) {
    const filled = Math.floor(value * SEGMENTS / 100);
    segments.forEach((segment, index) => segment.classList.toggle('is-filled', index < filled));
    progress.setAttribute('aria-valuenow', String(value));
    percentage.textContent = `${value}%`;
  }

  function complete() {
    if (completed || disposed) return;
    completed = true;
    setProgress(100);
    dialog.classList.add('is-approved');
    dialog.querySelector('h2').textContent = 'Acesso permitido!';
    dialog.querySelector('.entry-screen-status p').textContent = 'Bem vindo agente!';
    dialog.querySelector('[data-entry-label]').textContent = 'TERMINAL AUTORIZADO';
  }

  function cleanup() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    clearTimeout(validationTimer);
    clearTimeout(dismissTimer);
    clearTimeout(removeTimer);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (dialog.open) dialog.close();
    dialog.remove();
    document.body.classList.remove('entry-screen-open');
  }

  function dismiss() {
    if (leaving || disposed) return;
    complete();
    leaving = true;
    dialog.classList.add('is-leaving');
    cancelAnimationFrame(frame);
    removeTimer = setTimeout(cleanup, reducedMotion ? 0 : EXIT_MS);
  }

  function animate(now) {
    if (disposed || leaving) return;
    const elapsed = Math.max(0, now - started);
    if (elapsed >= validationMs + WELCOME_MS) { dismiss(); return; }
    if (elapsed >= validationMs) complete();
    else setProgress(Math.min(99, Math.floor(elapsed * 100 / validationMs)));
    frame = requestAnimationFrame(animate);
  }

  function onVisibilityChange() {
    if (document.hidden) return;
    const elapsed = performance.now() - started;
    // Uma aba que ficou em segundo plano não deve reiniciar a espera ao voltar.
    if (elapsed >= validationMs + WELCOME_MS) cleanup();
    else if (elapsed >= validationMs) complete();
  }

  const validationTimer = setTimeout(complete, validationMs);
  const dismissTimer = setTimeout(dismiss, validationMs + WELCOME_MS);
  dialog.addEventListener('cancel', event => { event.preventDefault(); cleanup(); });
  dialog.addEventListener('close', cleanup);
  document.addEventListener('visibilitychange', onVisibilityChange);
  if (reducedMotion) complete();
  frame = requestAnimationFrame(animate);
  return cleanup;
}
