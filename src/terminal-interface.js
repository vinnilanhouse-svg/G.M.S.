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
    button.setAttribute('aria-label', sound.enabled ? 'Desativar sons das rolagens' : 'Ativar sons das rolagens');
  }
  function markup() {
    return `<div class="terminal-status-strip" aria-label="Estado do terminal"><span class="terminal-status-label">ARQUIVO CENTRAL</span><span class="terminal-status-message" role="status" aria-live="polite" data-terminal-message>Terminal disponível.</span><button type="button" data-terminal-sound aria-pressed="${sound.enabled}" aria-label="${sound.enabled ? 'Desativar' : 'Ativar'} sons das rolagens" title="Efeitos sonoros somente nas rolagens de dados">Som: ${sound.enabled ? 'ativado' : 'desativado'}</button></div>`;
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
    const ready = locked ? 'Aguardando autorização de consulta.' : record ? `Registro ${record.code} carregado.` : page === 'minha-ficha' ? 'Ficha de agente disponível.' : page === 'pasta-de-trabalho' ? 'Pasta de trabalho disponível.' : page === 'credenciais' ? 'Central de credenciais disponível.' : ({'meu-agente':'Perfil de agente disponível.','minha-credencial':'Credencial pessoal disponível.','minha-missao':'Missão em acompanhamento disponível.','salvar-meus-dados':'Backup pessoal disponível.'}[page] || 'Índice disponível para consulta.');
    updateButton();
    strip.querySelector('[data-terminal-sound]').addEventListener('click', () => {
      sound.setEnabled(!sound.enabled);
    });
    if (!changed || reducedMotion() || locked) { message.textContent = ready; return; }
    message.textContent = record ? `Localizando registro ${record.code}…` : 'Consultando arquivo…';
    strip.classList.add('is-loading'); document.querySelector('main')?.classList.add('terminal-page-opening');
    timer = setTimeout(() => {
      if (!strip.isConnected) return;
      strip.classList.remove('is-loading'); document.querySelector('main')?.classList.remove('terminal-page-opening');
      message.textContent = ready;
    }, 220);
  }
  sound.subscribe(updateButton);
  return { markup, attach, cancel, sound };
}
