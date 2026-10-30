export function resetReadingMode() { document.body.classList.remove('reading-mode'); }
export function attachReadingTools(main, icon) {
  const dossier = main.querySelector('.dossier');
  if (!dossier) return;
  const aside = dossier.querySelector('.dossier-aside');
  if (aside) {
    const details = document.createElement('details'); details.className = 'reading-folder-details';
    const summary = document.createElement('summary'); summary.textContent = 'Nesta pasta · informações e vínculos';
    aside.before(details); details.append(summary, aside);
    // Native details semantics work on keyboard and touch. Desktop starts expanded.
    const media = matchMedia('(max-width: 760px)');
    details.open = !media.matches;
    // This element is discarded on navigation: avoid retaining it with media listeners.
  }
  const toolbar = document.createElement('div'); toolbar.className = 'reading-toolbar';
  toolbar.innerHTML = `<span>CONSULTA DOCUMENTAL</span><button type="button" class="op-button" data-reading-toggle aria-pressed="false">${icon('expand')}<span>Modo de leitura</span></button>`;
  main.querySelector('.folio-reading-layout').before(toolbar);
  const button = toolbar.querySelector('button');
  button.addEventListener('click', () => {
    const focused = document.activeElement;
    const active = document.body.classList.toggle('reading-mode');
    button.setAttribute('aria-pressed', String(active));
    button.querySelector('span').textContent = active ? 'Sair da leitura' : 'Modo de leitura';
    focused?.focus({preventScroll:true});
    toolbar.scrollIntoView({block:'start',behavior:'instant'});
  });
}
addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.body.classList.contains('reading-mode') && !document.querySelector('dialog[open]')) {
    document.querySelector('[data-reading-toggle]')?.click();
  }
});
