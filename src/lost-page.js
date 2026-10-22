import codexLost from './assets/codex-lost.webp';

// Uma tela independente do acervo para continuar funcionando se uma ficha falhar.
export function showLostPage({ logo, onReturnHome }) {
  document.title = 'Rota não localizada — Arquivo GMS';
  document.body.classList.remove('image-viewer-open');
  document.querySelector('#app').innerHTML = `
    <div class="lost-terminal">
      <header class="lost-header">
        <div class="lost-brand"><img class="gms-mark" src="${logo}" alt="GMS" width="60" height="60"><span>ARQUIVO <b>GMS</b><small>SISTEMA DE DOCUMENTAÇÃO</small></span></div>
        <span class="lost-terminal-label">TERMINAL / ROTA NÃO LOCALIZADA</span>
      </header>
      <main class="lost-main" id="main-content">
        <div class="lost-illustration"><img src="${codexLost}" width="1254" height="1254" alt="C.O.D.E.X chibi desenhado em contornos verde-sálvia, segurando uma chave de fenda ao lado de um gabinete de computador." decoding="async"></div>
        <div class="lost-copy">
          <span class="lost-eyebrow"><i></i>ASSISTÊNCIA DO ARQUIVO</span>
          <h1>Ei, desculpa, acho que você se perdeu.</h1>
          <p>Vou te mandar de volta para casa.</p>
          <a class="lost-home-button" href="#/inicio" data-return-home>Voltar para a tela inicial <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></a>
          <div class="lost-signature"><strong>C.O.D.E.X</strong><span>RESPONSÁVEL PELO ARQUIVO CENTRAL</span></div>
        </div>
      </main>
      <footer class="lost-footer"><span>GMS / DEPARTAMENTO DE DOCUMENTAÇÃO E MEMÓRIA</span><span>SEU CAMINHO DE VOLTA AO ARQUIVO</span></footer>
    </div>`;
  document.querySelector('[data-return-home]').addEventListener('click', event => {
    event.preventDefault();
    onReturnHome();
  });
}
