import { createTerminalSound } from './terminal-sound.js';
export { terminalSoundKey, readTerminalSound } from './terminal-sound.js';

export function createTerminalInterface({ storage } = {}) {
  const sound = createTerminalSound({ storage });
  let timer;
  let lastRoute = '';
  const reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function updateButton() {
    const button = document.querySelector('[data-terminal-sound]');
    if (!button) return;
    button.textContent = sound.enabled ? 'Som: ativado' : 'Som: desativado';
    button.setAttribute('aria-pressed', String(sound.enabled));
    button.setAttribute('aria-label', sound.enabled ? 'Desativar sons do terminal' : 'Ativar sons do terminal');
  }
  function markup() {
    return `<div class="terminal-status-strip" aria-label="Estado do terminal"><span class="terminal-status-label">ARQUIVO CENTRAL</span><span class="terminal-status-message" role="status" aria-live="polite" data-terminal-message>Terminal disponível.</span><button type="button" data-terminal-sound aria-pressed="${sound.enabled}" aria-label="${sound.enabled ? 'Desativar' : 'Ativar'} sons do terminal">Som: ${sound.enabled ? 'ativado' : 'desativado'}</button></div>`;
  }
  function cancel() {
    clearTimeout(timer);
    sound.stopProcessing();
    document.querySelector('.terminal-status-strip')?.classList.remove('is-loading');
    document.querySelector('main')?.classList.remove('terminal-page-opening');
  }
  function attach({ route, record, page, locked = false }) {
    cancel();
    const strip = document.querySelector('.terminal-status-strip');
    if (!strip) return;
    const message = strip.querySelector('[data-terminal-message]');
    const changed = route !== lastRoute; lastRoute = route;
    const ready = locked ? 'Aguardando autorização de consulta.' : record ? `Registro ${record.code} carregado.` : page === 'minha-ficha' ? 'Ficha de agente disponível.' : page === 'pasta-de-trabalho' ? 'Pasta de trabalho disponível.' : page === 'credenciais' ? 'Central de credenciais disponível.' : 'Índice disponível para consulta.';
    updateButton();
    strip.querySelector('[data-terminal-sound]').addEventListener('click', () => {
      sound.setEnabled(!sound.enabled);
      if (sound.enabled) sound.play('navigation');
    });
    if (!changed || reducedMotion() || locked) { message.textContent = ready; if (changed) sound.play(locked ? 'denied' : 'navigation'); return; }
    message.textContent = record ? `Localizando registro ${record.code}…` : 'Consultando arquivo…';
    strip.classList.add('is-loading'); document.querySelector('main')?.classList.add('terminal-page-opening');
    timer = setTimeout(() => {
      if (!strip.isConnected) return;
      strip.classList.remove('is-loading'); document.querySelector('main')?.classList.remove('terminal-page-opening');
      message.textContent = ready; sound.play('navigation');
    }, 220);
  }
  sound.subscribe(updateButton);
  return { markup, attach, cancel, sound };
}
