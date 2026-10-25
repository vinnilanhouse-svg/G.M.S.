import { describeAgentCheck, resolveAgentCheck } from './agent-sheet-checks.js';

export const agentDice = Object.freeze([4, 6, 8, 10, 12, 20, 100]);
const randomRange = 2 ** 32;
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function randomBelow(range, source = globalThis.crypto) {
  if (typeof source?.getRandomValues !== 'function') throw new Error('Este navegador não disponibilizou o gerador seguro de dados. Tente em um navegador atualizado.');
  // Rejeitar o restante da divisão evita favorecer algumas faces com o módulo.
  const limit = randomRange - randomRange % range;
  const sample = new Uint32Array(1);
  do { source.getRandomValues(sample); } while (sample[0] >= limit);
  return sample[0] % range;
}

export function rollAgentDie(sides, source = globalThis.crypto) {
  if (!agentDice.includes(sides)) throw new Error('Selecione um dos dados disponíveis.');
  return randomBelow(sides, source) + 1;
}

const outlines = {
  4: '<path d="m24 5 20 34H4L24 5Zm0 0v23m0 0L4 39m20-11 20 11"/>',
  6: '<path d="m24 3 19 11v21L24 46 5 35V14L24 3Zm0 22L5 14m19 11 19-11M24 25v21"/>',
  8: '<path d="m24 3 20 22-20 21L4 25 24 3Zm0 0v43M4 25h40"/>',
  10: '<path d="m24 3 19 16-6 21-13 6-13-6-6-21L24 3Zm0 0L13 29l11 17 11-17L24 3M5 19l8 10m22 0 8-10M13 29h22"/>',
  12: '<path d="m15 4 18 0 12 15-6 21-15 6-15-6-6-21L15 4Zm9 10 12 9-5 14H17l-5-14 12-9Zm0 0L15 4m9 10 9-10m3 19 9-4m-14 18 8 3M17 37l-8 3m3-17-9-4"/>',
  20: '<path d="m24 3 20 12v23L24 46 4 38V15L24 3ZM4 15l20-4 20 4-10 21-20 0L4 15Zm20-4 10 25M24 11 14 36m0 0 10 10 10-10M4 38l10-2m20 0 10 2M24 3v8"/>',
  100: '<path d="m24 3 19 16-6 21-13 6-13-6-6-21L24 3Zm0 0v43M5 19l19 9 19-9M11 40l13-12 13 12"/><path d="m12 14 6-5m12 0 6 5"/>',
};
const dieIcon = sides => `<svg class="sheet-die-icon" viewBox="0 0 48 50" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${outlines[sides]}</svg>`;
const timeLabel = value => new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const orbit = `<svg class="cyber-roll-orbit" viewBox="0 0 300 300" fill="none" aria-hidden="true"><circle cx="150" cy="150" r="140"/><circle class="cyber-orbit-track" cx="150" cy="150" r="124"/><circle class="cyber-orbit-arc" cx="150" cy="150" r="133" stroke-dasharray="92 34 8 34 92 158 18 80 60 160"/>${Array.from({ length: 40 }, (_, index) => `<path d="M150 ${index % 5 ? 12 : 7}v${index % 5 ? 5 : 13}" transform="rotate(${index * 9} 150 150)"/>`).join('')}<path class="cyber-orbit-crosshair" d="M150 0v24m0 252v24M0 150h24m252 0h24"/></svg>`;

function rollVisual(roll, { check = false, pending = false } = {}) {
  const sides = roll?.sides || 20;
  const evaluation = roll?.evaluation;
  const status = pending ? 'ROLAGEM EM CURSO' : roll ? 'RESULTADO CONFIRMADO' : 'TERMINAL EM ESPERA';
  return `<div class="cyber-roll ${pending ? 'is-rolling' : roll ? 'is-revealed' : 'is-idle'}"><div class="cyber-roll-telemetry" aria-hidden="true"><span>${roll ? `SEQ. ${String(roll.id).padStart(3, '0')}` : 'GMS / DADOS'}</span><span><i></i>${pending ? 'EM CURSO' : roll ? 'CONCLUÍDO' : 'PRONTO'}</span></div><div class="cyber-roll-stage"><span class="cyber-roll-coordinate cyber-coordinate-left" aria-hidden="true">X / 01</span><span class="cyber-roll-coordinate cyber-coordinate-right" aria-hidden="true">Y / ${sides}</span><div class="cyber-roll-hologram" aria-hidden="true">${orbit}<div class="cyber-roll-wire">${dieIcon(sides)}</div><i class="cyber-roll-scan"></i></div><div class="cyber-roll-center"><span class="cyber-roll-die-label">${roll || pending ? `D${sides}` : 'DADOS'}</span><strong class="cyber-roll-number" ${!pending ? check ? 'data-check-result' : 'data-roll-value' : ''}>${pending ? '<span aria-hidden="true">··</span><span class="sr-only">Rolando o dado.</span>' : roll?.result ?? '—'}</strong><span class="cyber-roll-center-label" aria-hidden="true">${pending ? 'VARREDURA' : roll ? 'RESULTADO' : 'AGUARDANDO'}</span></div></div><div class="cyber-roll-meter" aria-hidden="true"><i></i></div><div class="cyber-roll-summary">${pending ? '<b class="cyber-roll-phase" data-roll-phase aria-hidden="true">Iniciando rolagem…</b><span class="sr-only">Aguarde o resultado da rolagem.</span>' : evaluation ? `<b class="sheet-check-verdict" data-check-outcome="${evaluation.outcome}">${evaluation.verdict}</b><p>${esc(evaluation.comparison)}</p>` : `<b class="cyber-roll-phase">${roll ? 'Rolagem concluída' : 'Selecione um dado'}</b><p>${roll ? `Resultado de um dado de ${sides} faces.` : 'O próximo movimento começa aqui.'}</p>`}</div><div class="cyber-roll-footer"><span>${pending ? 'LEITURA EM ANDAMENTO' : status}</span><span>${roll?.check ? `VALOR / ${roll.check.target}` : `FACES / ${roll ? sides : '—'}`}</span></div></div>`;
}

export function createAgentSheetRolls({ getFields } = {}) {
  let rolls = [];
  let sequence = 0;
  let finishAnimation = null;
  const latest = () => rolls[0];
  const repeatLabel = () => latest()?.check ? `Repetir teste de ${latest().check.label}` : latest() ? `Rolar d${latest().sides} novamente` : 'Rolar novamente';
  const resultMarkup = () => rollVisual(latest());
  const historyMarkup = () => rolls.length ? `<ol>${rolls.map(roll => `<li><span class="sheet-roll-sequence">${String(roll.id).padStart(2, '0')}</span><span class="sheet-history-die">d${roll.sides}</span><div class="sheet-history-result"><strong>${roll.result}</strong>${roll.check ? `<span>${esc(roll.check.label)} · valor ${roll.check.target}</span><b data-check-outcome="${roll.evaluation.outcome}">${roll.evaluation.verdict}</b>` : ''}</div><time datetime="${new Date(roll.at).toISOString()}">${timeLabel(roll.at)}</time></li>`).join('')}</ol>` : '<p class="sheet-roll-empty">Nenhuma rolagem registrada nesta sessão.</p>';

  function trigger(id, label) {
    return `<button type="button" class="sheet-check-trigger" data-sheet-check="${esc(id)}" aria-label="Testar ${esc(label.replace(/^\*/, ''))} com d20" aria-haspopup="dialog"><span>${esc(label)}</span>${dieIcon(20)}</button>`;
  }

  function dialog() {
    return `<dialog class="sheet-check-dialog" aria-labelledby="sheet-check-title" aria-describedby="sheet-check-description"><div class="sheet-roll-terminal-bar" aria-hidden="true"><span>G.M.S. / CENTRAL DE ROLAGENS</span><span>● CANAL LOCAL</span></div><header><div><span class="sheet-roll-kicker" data-check-kind>TESTE DE ATRIBUTO</span><h2 id="sheet-check-title">Teste do agente</h2></div><button type="button" class="op-text-button" data-close-agent-check autofocus>Fechar <span aria-hidden="true">×</span></button></header><div class="sheet-check-dialog-result" data-check-dialog-result role="status" aria-live="polite" aria-atomic="true"></div><p id="sheet-check-description" data-check-description></p><div class="sheet-check-dialog-actions"><button type="button" class="op-button" data-repeat-agent-check>Rolar novamente</button><button type="button" class="op-text-button" data-view-check-history>Ver histórico</button></div></dialog>`;
  }

  function page(hidden) {
    finishAnimation?.();
    return `<section class="sheet-roll-panel" data-sheet-page="rolagens" aria-labelledby="sheet-roll-title" ${hidden ? 'hidden' : ''}><header class="sheet-paper-heading"><div><span>04 / APOIO AO AGENTE</span><h2 id="sheet-roll-title">Central de rolagens</h2></div><small>GMS / DADOS</small></header><p class="sheet-roll-help">Escolha seu dado. Cada clique faz uma nova rolagem, com a mesma chance para todas as faces. Para fazer um teste, clique no nome de um atributo ou de uma perícia na aba Ficha.</p><div class="sheet-roll-layout"><div class="sheet-dice-grid" role="group" aria-label="Dados disponíveis">${agentDice.map(sides => `<button type="button" class="sheet-die" data-roll-die="${sides}" aria-label="Rolar d${sides}">${dieIcon(sides)}<strong>d${sides}</strong><span>${sides} faces</span></button>`).join('')}</div><section class="sheet-roll-result" aria-label="Último resultado"><div class="sheet-roll-readout" data-roll-readout>${resultMarkup()}</div><button type="button" class="op-button" data-repeat-roll ${latest() ? '' : 'disabled'}>${esc(repeatLabel())}</button><p class="sheet-roll-feedback" data-roll-feedback role="status" aria-live="polite" aria-atomic="true"></p></section></div><section class="sheet-roll-history" aria-labelledby="sheet-roll-history-title"><div><div><h3 id="sheet-roll-history-title">Histórico de rolagens</h3><p>Últimas 20 rolagens · disponível até recarregar ou fechar esta página.</p></div><button type="button" class="op-text-button" data-clear-rolls ${rolls.length ? '' : 'disabled'}>Limpar histórico</button></div><div data-roll-history>${historyMarkup()}</div></section></section>`;
  }

  function bind(root) {
    finishAnimation?.();
    const panel = root.querySelector('.sheet-roll-panel');
    if (!panel) return;
    const feedback = panel.querySelector('[data-roll-feedback]');
    const repeat = panel.querySelector('[data-repeat-roll]');
    const clear = panel.querySelector('[data-clear-rolls]');
    const checkDialog = root.querySelector('.sheet-check-dialog');
    let activeCheck = null;
    let rolling = false;
    let animationOutput = null;
    function refresh() {
      panel.querySelector('[data-roll-readout]').innerHTML = resultMarkup();
      panel.querySelector('[data-roll-history]').innerHTML = historyMarkup();
      repeat.disabled = !latest(); clear.disabled = !rolls.length;
      repeat.textContent = repeatLabel();
    }
    function record(roll) {
      const entry = { ...roll, id: ++sequence, at: Date.now() };
      rolls.unshift(entry); rolls = rolls.slice(0, 20); return entry;
    }
    const animationDuration = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches || document.hidden ? 0 : 5000 + randomBelow(5001);
    function present(entry, output, check, duration) {
      const motion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
      const controls = [...root.querySelectorAll('[data-roll-die],[data-repeat-roll],[data-clear-rolls],[data-sheet-check],[data-repeat-agent-check]')].map(button => [button, button.disabled]);
      const timers = [];
      let finished = false;
      function complete() {
        if (finished) return;
        finished = true; timers.forEach(clearTimeout);
        motion?.removeEventListener('change', onMotionChange);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        controls.forEach(([button, disabled]) => { button.disabled = disabled; });
        rolling = false; animationOutput = null; output.removeAttribute('aria-busy');
        if (root.isConnected) {
          refresh();
          if (check) output.innerHTML = rollVisual(entry, { check: true });
          feedback.classList.remove('sheet-roll-error');
          feedback.textContent = entry.check ? `Rolagem ${entry.id}: ${entry.check.label}, d20 ${entry.result}, ${entry.evaluation.verdict.toLowerCase()}.` : `Rolagem ${entry.id}: d${entry.sides}, resultado ${entry.result}.`;
        }
        if (finishAnimation === complete) finishAnimation = null;
      }
      function onMotionChange(event) { if (event.matches) complete(); }
      function onVisibilityChange() { if (document.hidden) complete(); }
      finishAnimation = complete;
      animationOutput = output;
      if (!duration || motion?.matches || document.hidden) { complete(); return; }
      rolling = true; controls.forEach(([button]) => { button.disabled = true; });
      feedback.classList.remove('sheet-roll-error'); feedback.textContent = 'Rolagem em curso…';
      output.setAttribute('aria-busy', 'true');
      output.innerHTML = rollVisual(entry, { check, pending: true });
      output.querySelector('.cyber-roll').style.setProperty('--roll-duration', `${duration}ms`);
      const phase = output.querySelector('[data-roll-phase]');
      timers.push(setTimeout(() => { if (output.isConnected) phase.textContent = 'Lendo o dado…'; }, Math.round(duration * .3)));
      timers.push(setTimeout(() => { if (output.isConnected) phase.textContent = 'Concluindo a rolagem…'; }, Math.round(duration * .7)));
      timers.push(setTimeout(complete, duration));
      motion?.addEventListener('change', onMotionChange);
      document.addEventListener('visibilitychange', onVisibilityChange);
    }
    function roll(sides) {
      if (rolling) return;
      try {
        const result = rollAgentDie(sides);
        const duration = animationDuration();
        const entry = record({ sides, result });
        present(entry, panel.querySelector('[data-roll-readout]'), false, duration);
      } catch (error) { feedback.classList.add('sheet-roll-error'); feedback.textContent = error.message; }
    }
    function runCheck(id) {
      if (!checkDialog || rolling) return;
      activeCheck = id;
      const output = checkDialog.querySelector('[data-check-dialog-result]');
      const description = checkDialog.querySelector('[data-check-description]');
      const reroll = checkDialog.querySelector('[data-repeat-agent-check]');
      checkDialog.querySelector('#sheet-check-title').textContent = 'Teste do agente';
      try {
        const check = describeAgentCheck(getFields(), id);
        checkDialog.querySelector('#sheet-check-title').textContent = `Teste de ${check.label}`;
        checkDialog.querySelector('[data-check-kind]').textContent = check.kind === 'attribute' ? 'TESTE DE ATRIBUTO / 1D20' : check.combat ? 'TESTE DE ATAQUE / 1D20' : 'TESTE DE PERÍCIA / 1D20';
        reroll.disabled = Boolean(check.blocked);
        if (check.blocked) {
          output.innerHTML = '<strong class="sheet-check-blocked">Treinamento necessário</strong>';
          description.textContent = check.blocked;
        } else {
          const result = rollAgentDie(20);
          const evaluation = resolveAgentCheck(check, result);
          const duration = animationDuration();
          const entry = record({ sides: 20, result, check, evaluation });
          present(entry, output, true, duration);
          description.textContent = `${check.breakdown}. Menor que o valor: sucesso; igual: sucesso crítico; maior: falha.${check.combat ? ' Em ataques, 20 natural é falha crítica.' : ''}`;
        }
      } catch (error) {
        output.innerHTML = '<strong class="sheet-check-blocked">Teste não realizado</strong>';
        description.textContent = error.message; reroll.disabled = false;
      }
      if (!checkDialog.open) checkDialog.showModal();
    }
    panel.querySelectorAll('[data-roll-die]').forEach(button => button.addEventListener('click', () => roll(Number(button.dataset.rollDie))));
    repeat.addEventListener('click', () => { if (latest()?.check) runCheck(latest().check.id); else if (latest()) roll(latest().sides); });
    clear.addEventListener('click', () => { if (rolling) return; rolls = []; sequence = 0; refresh(); feedback.classList.remove('sheet-roll-error'); feedback.textContent = 'Histórico limpo. Selecione um dado para começar.'; });
    root.querySelectorAll('[data-sheet-check]').forEach(button => button.addEventListener('click', () => runCheck(button.dataset.sheetCheck)));
    const finishDialogAnimation = () => { if (animationOutput && checkDialog.contains(animationOutput)) finishAnimation?.(); };
    checkDialog?.addEventListener('close', finishDialogAnimation);
    checkDialog?.addEventListener('cancel', finishDialogAnimation);
    checkDialog?.querySelector('[data-close-agent-check]').addEventListener('click', () => { finishAnimation?.(); checkDialog.close(); });
    checkDialog?.querySelector('[data-repeat-agent-check]').addEventListener('click', () => { if (activeCheck) runCheck(activeCheck); });
    checkDialog?.querySelector('[data-view-check-history]').addEventListener('click', () => { finishAnimation?.(); checkDialog.close(); location.hash = '#/minha-ficha?aba=rolagens'; });
  }
  return { page, bind, trigger, dialog };
}
