import test from 'node:test';
import assert from 'node:assert/strict';
import { createTerminalSound, terminalSoundGain, terminalSoundKey, readTerminalSound } from '../src/terminal-sound.js';

function setup(initial = 'on', options = {}) {
  let now = 0, next = 0, created = 0;
  const tasks = new Map(); const data = new Map([[terminalSoundKey, initial]]);
  const storage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
  const setTimer = (fn, delay) => { const id = ++next; tasks.set(id, { at: now + delay, fn }); return id; };
  const clearTimer = id => tasks.delete(id);
  const advance = delay => {
    const end = now + delay;
    while (true) {
      const item = [...tasks].sort((a, b) => a[1].at - b[1].at)[0];
      if (!item || item[1].at > end) break;
      now = item[1].at; tasks.delete(item[0]); item[1].fn();
    }
    now = end;
  };
  const param = () => ({ events: [], setValueAtTime(...args) { this.events.push(['set', ...args]); }, linearRampToValueAtTime(...args) { this.events.push(['linear', ...args]); }, exponentialRampToValueAtTime(...args) { this.events.push(['exponential', ...args]); }, cancelScheduledValues() {}, setTargetAtTime() {} });
  const gains = [], oscillators = [];
  const audio = {
    state: 'running', destination: {}, get currentTime() { return now / 1000; },
    createGain() { const gain = { gain: param(), connect() {}, disconnect() { this.disconnected = true; } }; gains.push(gain); return gain; },
    createOscillator() {
      let ending;
      const oscillator = { frequency: param(), connect() {}, disconnect() { this.disconnected = true; }, start() {}, stop(at) { clearTimer(ending); ending = setTimer(() => this.onended?.(), Math.max(0, at * 1000 - now)); } };
      oscillators.push(oscillator); return oscillator;
    },
    resume() { this.state = 'running'; return Promise.resolve(); },
    close() { this.state = 'closed'; return Promise.resolve(); },
  };
  const doc = new EventTarget(); doc.visibilityState = 'visible'; const view = new EventTarget();
  const sound = createTerminalSound({ storage, doc, view, now: () => now, setTimer, clearTimer, createAudioContext: () => { created++; return options.factory ? options.factory(audio) : audio; } });
  return { sound, storage, data, doc, view, audio, gains, oscillators, tasks, advance, get created() { return created; } };
}

test('o áudio das rolagens aguarda interação e preserva o ganho adicional de 50%', () => {
  const env = setup(); env.sound.play('result'); assert.equal(env.created, 0);
  env.sound.unlock(); env.sound.play('result');
  assert.equal(env.created, 1); assert.equal(terminalSoundGain, 1.5);
  assert.deepEqual(env.gains[0].gain.events[0], ['set', 1.5, 0]);
  assert.deepEqual(env.oscillators[0].frequency.events[0], ['set', 620, 0]);
  assert.deepEqual(env.gains[1].gain.events[1], ['linear', .012, .008]);
  assert.ok(Math.abs(.012 * terminalSoundGain - .018) < Number.EPSILON);
  env.advance(200); assert.equal(env.gains[1].disconnected, true); env.sound.dispose();
});

test('som começa desativado, guarda somente a preferência e silencia notas já em andamento', () => {
  const env = setup('off'); env.data.set('gms-agent-name-v1', 'Agente');
  env.sound.unlock(); env.sound.play('result'); assert.equal(env.created, 0);
  env.sound.setEnabled(true); env.sound.play('result'); assert.equal(env.oscillators.length, 2);
  assert.equal(readTerminalSound(env.storage), true);
  env.sound.setEnabled(false); env.sound.play('result'); env.advance(1000);
  assert.equal(env.oscillators.length, 2); assert.ok(env.oscillators.every(node => node.disconnected));
  assert.equal(env.data.get(terminalSoundKey), 'off'); assert.equal(env.data.get('gms-agent-name-v1'), 'Agente');
  env.sound.dispose();
});

test('pulsos de processamento encerram e liberam seus nós ao fechar ou sair da rolagem', () => {
  const env = setup(); env.sound.unlock(); const stop = env.sound.startProcessing(3000);
  env.advance(1000); assert.ok(env.oscillators.length > 3);
  stop(); const count = env.oscillators.length; env.advance(4000);
  assert.equal(env.oscillators.length, count); assert.ok(env.oscillators.every(node => node.disconnected));
  assert.equal(env.tasks.size, 0);
  env.sound.startProcessing(8000); env.advance(300); env.sound.stopProcessing(); const second = env.oscillators.length;
  env.advance(9000); assert.equal(env.oscillators.length, second); assert.equal(env.tasks.size, 0);
  env.sound.dispose();
});

test('desativar ou ocultar a página impede novos sons e a preferência sincroniza entre abas', () => {
  const env = setup(); env.sound.unlock(); env.sound.startProcessing(8000); env.advance(500);
  env.sound.setEnabled(false); const mutedCount = env.oscillators.length; env.advance(700);
  assert.equal(env.oscillators.length, mutedCount);
  env.storage.setItem(terminalSoundKey, 'on'); const change = new Event('storage'); change.key = terminalSoundKey; env.view.dispatchEvent(change);
  assert.equal(env.sound.enabled, true); env.advance(500); assert.ok(env.oscillators.length > mutedCount);
  env.doc.visibilityState = 'hidden'; env.doc.dispatchEvent(new Event('visibilitychange'));
  const hiddenCount = env.oscillators.length; env.sound.play('critical-success'); env.advance(9000);
  assert.equal(env.oscillators.length, hiddenCount); assert.equal(env.tasks.size, 0);
  env.doc.visibilityState = 'visible'; env.advance(1000); assert.equal(env.oscillators.length, hiddenCount);
  env.sound.dispose();
});

test('sucesso crítico e falha possuem assinaturas sonoras diferentes e áudio indisponível não quebra a aplicação', () => {
  const env = setup(); env.sound.unlock(); env.sound.play('critical-success');
  const success = env.oscillators.map(node => node.frequency.events[0][1]);
  env.advance(500); env.sound.play('failure'); const failure = env.oscillators.slice(3).map(node => node.frequency.events[0][1]);
  assert.ok(success[0] < success.at(-1)); assert.ok(failure[0] > failure.at(-1)); env.sound.dispose();
  const unavailable = setup('on', { factory() { throw new Error('Sem áudio'); } });
  assert.doesNotThrow(() => { unavailable.sound.unlock(); unavailable.sound.play('result'); const stop = unavailable.sound.startProcessing(3000); unavailable.advance(500); stop(); unavailable.sound.dispose(); });
});

test('retomar o contexto depois de silenciar não reproduz sinais pendentes antigos', async () => {
  const pending = [];
  const env = setup('on', { factory(audio) { audio.state = 'suspended'; audio.resume = () => new Promise(resolve => pending.push(() => { audio.state = 'running'; resolve(); })); return audio; } });
  env.sound.unlock(); env.sound.play('result'); env.sound.setEnabled(false); env.sound.setEnabled(true);
  pending.forEach(resolve => resolve()); await Promise.resolve();
  assert.equal(env.oscillators.length, 0);
  env.sound.play('result'); assert.equal(env.oscillators.length, 2); env.sound.dispose();
});

test('navegação, cliques, imagens e credenciais permanecem silenciosos mesmo com o som ativado', () => {
  const env = setup(); env.sound.unlock();
  for (const name of ['navigation', 'click', 'open', 'close', 'accepted', 'saved', 'denied']) env.sound.play(name);
  assert.equal(env.oscillators.length, 0);
  env.sound.play('result'); assert.equal(env.oscillators.length, 2);
  env.sound.dispose();
});
