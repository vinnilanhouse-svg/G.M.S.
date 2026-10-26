export const terminalSoundKey = 'gms-terminal-sound-v1';
export const terminalSoundGain = 1.5;

export function readTerminalSound(storage) {
  try { return storage.getItem(terminalSoundKey) === 'on'; } catch { return false; }
}

// Sons exclusivos das rolagens. Frequência, atraso, duração, amplitude e forma.
// O ganho mestre preserva o aumento de volume de 50%.
const sounds = {
  error: [[420, 0, .09, .012], [260, .08, .11, .012]],
  processing: [[220, 0, .16, .008, 'triangle', 660]],
  result: [[620, 0, .075, .012], [930, .07, .11, .012]],
  success: [[660, 0, .08, .012], [880, .08, .14, .012]],
  'critical-success': [[523, 0, .09, .014], [784, .07, .11, .014], [1047, .15, .19, .014]],
  failure: [[440, 0, .1, .013], [294, .1, .14, .013]],
  'critical-failure': [[330, 0, .1, .013], [247, .09, .12, .013], [165, .19, .2, .013]],
};

export function createTerminalSound({ storage, doc = globalThis.document, view = globalThis, createAudioContext, now = () => globalThis.performance.now(), setTimer = setTimeout, clearTimer = clearTimeout } = {}) {
  if (!storage) try { storage = globalThis.localStorage; } catch {}
  let enabled = readTerminalSound(storage);
  let interacted = false;
  let audio, master;
  let epoch = 0;
  let disposed = false;
  const voices = new Set();
  const processing = new Set();
  const subscribers = new Set();
  const visible = () => doc?.visibilityState !== 'hidden';
  const audible = () => !disposed && enabled && interacted && visible();
  const notify = () => subscribers.forEach(listener => listener(enabled));

  function context() {
    if (!audible()) return null;
    if (!audio) {
      const Audio = view.AudioContext || view.webkitAudioContext;
      audio = createAudioContext ? createAudioContext() : Audio ? new Audio() : null;
      if (!audio) return null;
      master = audio.createGain(); master.gain.setValueAtTime(terminalSoundGain, audio.currentTime); master.connect(audio.destination);
    }
    return audio;
  }
  function unlock() {
    interacted = true;
    try { const ctx = context(); if (ctx?.state === 'suspended') void ctx.resume().catch(() => {}); } catch {}
  }
  function stopVoices() {
    epoch++;
    for (const voice of voices) {
      try { voice.gain.gain.cancelScheduledValues(audio.currentTime); voice.gain.gain.setTargetAtTime(.0001, audio.currentTime, .003); voice.oscillator.stop(audio.currentTime + .015); } catch {}
    }
  }
  function stopProcessing() {
    for (const stop of [...processing]) stop();
  }
  function stopAll() {
    stopProcessing();
    stopVoices();
  }
  function schedule(ctx, pattern, owner) {
    for (const [frequency, delay, duration, level, type = 'sine', endFrequency] of pattern) {
      const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
      const start = ctx.currentTime + delay;
      oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, start);
      if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
      gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(level, start + .008); gain.gain.exponentialRampToValueAtTime(.0001, start + duration - .01);
      oscillator.connect(gain); gain.connect(master);
      const voice = { oscillator, gain, owner }; voices.add(voice);
      oscillator.onended = () => { voices.delete(voice); oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(start); oscillator.stop(start + duration);
    }
  }
  function playPattern(pattern, owner) {
    if (!audible()) return;
    const requested = now(); const generation = epoch;
    try {
      const ctx = context(); if (!ctx) return;
      if (ctx.state === 'running') schedule(ctx, pattern, owner);
      else if (ctx.state === 'suspended') void ctx.resume().then(() => {
        if (audible() && generation === epoch && now() - requested < 250 && !owner?.stopped) schedule(ctx, pattern, owner);
      }).catch(() => {});
    } catch { /* Áudio indisponível não interrompe a interface. */ }
  }
  function play(name) { const pattern = sounds[name]; if (pattern) playPattern(pattern); }

  function startProcessing(duration) {
    if (!Number.isFinite(duration) || duration <= 0 || disposed || !visible()) return () => {};
    const owner = { stopped: false };
    const start = now(); let timer; let tick = 0;
    function stop() {
      if (owner.stopped) return;
      owner.stopped = true; clearTimer(timer); processing.delete(stop);
      for (const voice of voices) if (voice.owner === owner) {
        try { voice.gain.gain.cancelScheduledValues(audio.currentTime); voice.gain.gain.setTargetAtTime(.0001, audio.currentTime, .003); voice.oscillator.stop(audio.currentTime + .015); } catch {}
      }
    }
    function pulse() {
      if (owner.stopped || !visible() || disposed || now() - start >= duration) { stop(); return; }
      const progress = Math.min(1, (now() - start) / duration);
      playPattern([[ [330, 440, 550, 660][tick++ % 4], 0, .032, .0035, 'triangle' ]], owner);
      timer = setTimer(pulse, Math.round(240 - 110 * progress));
    }
    processing.add(stop); playPattern(sounds.processing, owner);
    timer = setTimer(pulse, 160);
    return stop;
  }
  function setEnabled(value, persist = true) {
    enabled = Boolean(value);
    if (!enabled) stopVoices();
    if (persist) try { storage.setItem(terminalSoundKey, enabled ? 'on' : 'off'); } catch {}
    notify();
    if (enabled && interacted) unlock();
  }
  const onGesture = event => { if (event.isTrusted) unlock(); };
  const onVisibility = () => { if (!visible()) stopAll(); };
  const onStorage = event => { if (event.key === terminalSoundKey || event.key === null) setEnabled(readTerminalSound(storage), false); };
  doc?.addEventListener('pointerdown', onGesture, { capture: true, passive: true });
  doc?.addEventListener('keydown', onGesture, true);
  doc?.addEventListener('visibilitychange', onVisibility);
  view.addEventListener?.('storage', onStorage);
  view.addEventListener?.('pagehide', stopAll);
  return {
    get enabled() { return enabled; }, unlock, play, startProcessing, stopProcessing, setEnabled, stopAll,
    subscribe(listener) { subscribers.add(listener); return () => subscribers.delete(listener); },
    dispose() {
      disposed = true; stopAll(); subscribers.clear();
      for (const voice of voices) { voice.oscillator.disconnect(); voice.gain.disconnect(); }
      voices.clear();
      doc?.removeEventListener('pointerdown', onGesture, true); doc?.removeEventListener('keydown', onGesture, true);
      doc?.removeEventListener('visibilitychange', onVisibility);
      view.removeEventListener?.('storage', onStorage); view.removeEventListener?.('pagehide', stopAll);
      try { void audio?.close().catch(() => {}); } catch {}
    },
  };
}
