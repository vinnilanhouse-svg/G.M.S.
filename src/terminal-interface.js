export const terminalSoundKey = 'gms-terminal-sound-v1';
export function readTerminalSound(storage) {
  try { return storage.getItem(terminalSoundKey) === 'on'; } catch { return false; }
}

export function createTerminalInterface({ storage } = {}) {
  if (!storage) try { storage = globalThis.localStorage; } catch {}
  let soundEnabled = readTerminalSound(storage);
  let audio;
  let timer;
  let lastRoute = '';
  const reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function unlockAudio() {
    if (!soundEnabled) return;
    try {
      const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!Audio) return;
      audio ||= new Audio();
      if (audio.state === 'suspended') void audio.resume().catch(() => {});
    } catch {}
  }
  function tone() {
    if (!soundEnabled || !audio || audio.state !== 'running' || document.visibilityState === 'hidden') return;
    try {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const start = audio.currentTime;
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(620, start);
      gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.016, start + .008); gain.gain.exponentialRampToValueAtTime(.0001, start + .065);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(start); oscillator.stop(start + .075);
    } catch {}
  }
  function updateButton() {
    const button = document.querySelector('[data-terminal-sound]');
    if (!button) return;
    button.textContent = soundEnabled ? 'Som: ativado' : 'Som: desativado';
    button.setAttribute('aria-pressed', String(soundEnabled));
    button.setAttribute('aria-label', soundEnabled ? 'Desativar sons do terminal' : 'Ativar sons do terminal');
  }
  function markup() {
    return `<div class="terminal-status-strip" aria-label="Estado do terminal"><span class="terminal-status-label">ARQUIVO CENTRAL</span><span class="terminal-status-message" role="status" aria-live="polite" data-terminal-message>Terminal disponível.</span><button type="button" data-terminal-sound aria-pressed="${soundEnabled}" aria-label="${soundEnabled ? 'Desativar' : 'Ativar'} sons do terminal">Som: ${soundEnabled ? 'ativado' : 'desativado'}</button></div>`;
  }
  function cancel() {
    clearTimeout(timer);
    document.querySelector('.terminal-status-strip')?.classList.remove('is-loading');
    document.querySelector('main')?.classList.remove('terminal-page-opening');
  }
  function attach({ route, record, page, locked = false }) {
    cancel();
    const strip = document.querySelector('.terminal-status-strip');
    if (!strip) return;
    const message = strip.querySelector('[data-terminal-message]');
    const changed = route !== lastRoute; lastRoute = route;
    const ready = locked ? 'Aguardando autorização de consulta.' : record ? `Registro ${record.code} carregado.` : page === 'pasta-de-trabalho' ? 'Pasta de trabalho disponível.' : page === 'credenciais' ? 'Central de credenciais disponível.' : 'Índice disponível para consulta.';
    updateButton();
    strip.querySelector('[data-terminal-sound]').addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      try { storage.setItem(terminalSoundKey, soundEnabled ? 'on' : 'off'); } catch {}
      updateButton(); unlockAudio();
      if (soundEnabled) tone();
    });
    if (!changed || reducedMotion() || locked) { message.textContent = ready; if (changed && !locked) tone(); return; }
    message.textContent = record ? `Localizando registro ${record.code}…` : 'Consultando arquivo…';
    strip.classList.add('is-loading'); document.querySelector('main')?.classList.add('terminal-page-opening');
    timer = setTimeout(() => {
      if (!strip.isConnected) return;
      strip.classList.remove('is-loading'); document.querySelector('main')?.classList.remove('terminal-page-opening');
      message.textContent = ready; tone();
    }, 220);
  }
  const unlock = event => { if (event.isTrusted) unlockAudio(); };
  document.addEventListener('pointerdown', unlock, { passive: true });
  document.addEventListener('keydown', unlock);
  addEventListener('storage', event => { if (event.key === terminalSoundKey) { soundEnabled = readTerminalSound(storage); updateButton(); } });
  return { markup, attach, cancel };
}
