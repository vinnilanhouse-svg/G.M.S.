export const agentDice = Object.freeze([4, 6, 8, 10, 12, 20, 100]);
const randomRange = 2 ** 32;

export function rollAgentDie(sides, source = globalThis.crypto) {
  if (!agentDice.includes(sides)) throw new Error('Selecione um dos dados disponíveis.');
  if (typeof source?.getRandomValues !== 'function') throw new Error('Este navegador não disponibilizou o gerador seguro de dados. Tente em um navegador atualizado.');
  // Rejeitar o restante da divisão evita favorecer algumas faces com o módulo.
  const limit = randomRange - randomRange % sides;
  const sample = new Uint32Array(1);
  do { source.getRandomValues(sample); } while (sample[0] >= limit);
  return sample[0] % sides + 1;
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

export function createAgentSheetRolls() {
  let rolls = [];
  let sequence = 0;
  const latest = () => rolls[0];
  const resultMarkup = () => latest() ? `<span class="sheet-roll-kicker">RESULTADO / D${latest().sides}</span><strong data-roll-value>${latest().result}</strong><span>de ${latest().sides} faces</span>` : '<span class="sheet-roll-kicker">AGUARDANDO ROLAGEM</span><strong data-roll-value>—</strong><span>Selecione um dado para começar.</span>';
  const historyMarkup = () => rolls.length ? `<ol>${rolls.map(roll => `<li><span class="sheet-roll-sequence">${String(roll.id).padStart(2, '0')}</span><span class="sheet-history-die">d${roll.sides}</span><strong>${roll.result}</strong><time datetime="${new Date(roll.at).toISOString()}">${timeLabel(roll.at)}</time></li>`).join('')}</ol>` : '<p class="sheet-roll-empty">Nenhuma rolagem registrada nesta sessão.</p>';

  function page(hidden) {
    return `<section class="sheet-roll-panel" data-sheet-page="rolagens" aria-labelledby="sheet-roll-title" ${hidden ? 'hidden' : ''}><header class="sheet-paper-heading"><div><span>04 / APOIO AO AGENTE</span><h2 id="sheet-roll-title">Central de rolagens</h2></div><small>GMS / DADOS</small></header><p class="sheet-roll-help">Escolha seu dado. Cada clique faz uma nova rolagem, com a mesma chance para todas as faces.</p><div class="sheet-roll-layout"><div class="sheet-dice-grid" role="group" aria-label="Dados disponíveis">${agentDice.map(sides => `<button type="button" class="sheet-die" data-roll-die="${sides}" aria-label="Rolar d${sides}">${dieIcon(sides)}<strong>d${sides}</strong><span>${sides} faces</span></button>`).join('')}</div><section class="sheet-roll-result" aria-label="Último resultado"><div class="sheet-roll-readout" data-roll-readout>${resultMarkup()}</div><button type="button" class="op-button" data-repeat-roll ${latest() ? '' : 'disabled'}>${latest() ? `Rolar d${latest().sides} novamente` : 'Rolar novamente'}</button><p class="sheet-roll-feedback" data-roll-feedback role="status" aria-live="polite" aria-atomic="true"></p></section></div><section class="sheet-roll-history" aria-labelledby="sheet-roll-history-title"><div><div><h3 id="sheet-roll-history-title">Histórico de rolagens</h3><p>Últimas 20 rolagens · disponível até recarregar ou fechar esta página.</p></div><button type="button" class="op-text-button" data-clear-rolls ${rolls.length ? '' : 'disabled'}>Limpar histórico</button></div><div data-roll-history>${historyMarkup()}</div></section></section>`;
  }

  function bind(root) {
    const panel = root.querySelector('.sheet-roll-panel');
    if (!panel) return;
    const feedback = panel.querySelector('[data-roll-feedback]');
    const repeat = panel.querySelector('[data-repeat-roll]');
    const clear = panel.querySelector('[data-clear-rolls]');
    function refresh() {
      panel.querySelector('[data-roll-readout]').innerHTML = resultMarkup();
      panel.querySelector('[data-roll-history]').innerHTML = historyMarkup();
      repeat.disabled = !latest(); clear.disabled = !rolls.length;
      repeat.textContent = latest() ? `Rolar d${latest().sides} novamente` : 'Rolar novamente';
    }
    function roll(sides) {
      try {
        const result = rollAgentDie(sides);
        rolls.unshift({ id: ++sequence, sides, result, at: Date.now() });
        rolls = rolls.slice(0, 20); refresh();
        feedback.classList.remove('sheet-roll-error');
        feedback.textContent = `Rolagem ${sequence}: d${sides}, resultado ${result}.`;
      } catch (error) { feedback.classList.add('sheet-roll-error'); feedback.textContent = error.message; }
    }
    panel.querySelectorAll('[data-roll-die]').forEach(button => button.addEventListener('click', () => roll(Number(button.dataset.rollDie))));
    repeat.addEventListener('click', () => { if (latest()) roll(latest().sides); });
    clear.addEventListener('click', () => { rolls = []; sequence = 0; refresh(); feedback.classList.remove('sheet-roll-error'); feedback.textContent = 'Histórico limpo. Selecione um dado para começar.'; });
  }
  return { page, bind };
}
