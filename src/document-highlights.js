import { createPersonalRecords, escapePersonal as esc, personalId } from './personal-records.js';
import { documentHighlightsKey, highlightRangesOverlap, resolveDocumentHighlight, validateDocumentHighlight } from './document-highlights-model.js';
import './document-highlights.css';

const tones = { destaque: 'Destaque', duvida: 'Dúvida', atencao: 'Atenção' };
export function createDocumentHighlights({ icon, storage }) {
  const store = createPersonalRecords(documentHighlightsKey, validateDocumentHighlight, storage);
  let events;
  function markup(record) {
    if (record.unlisted) return '';
    return `<section id="grifos" class="document-highlights" aria-labelledby="document-highlights-title"><div class="highlight-toolbar"><div><span class="op-kicker">MARGENS PESSOAIS</span><h2 id="document-highlights-title">Grifos e anotações</h2></div><button type="button" class="op-button" data-highlight-selection disabled>${icon('file')}Grifar seleção</button></div><p>Selecione um trecho de um parágrafo do arquivo e use “Grifar seleção”. Seus comentários ficam neste navegador.</p><p class="highlight-feedback" role="status" data-highlight-feedback></p><div data-highlight-list></div></section>`;
  }
  function bind(record) {
    events?.abort(); events = null;
    const root = document.querySelector('.document-highlights'); if (!record || !root) return;
    events = new AbortController(); const { signal } = events;
    const list = root.querySelector('[data-highlight-list]'); const button = root.querySelector('[data-highlight-selection]');
    const feedback = root.querySelector('[data-highlight-feedback]'); let pending;
    const counters = new Map(); const blocks = new Map();
    document.querySelectorAll('.dossier-body .document-section p,.dossier-body .document-section li').forEach(block => {
      const section = block.closest('.document-section');
      if (!section?.id || block.closest('.employee-note,.codex-margin-note,.related-list,.notable-members-list,.document-highlights') || (block.tagName === 'LI' && block.querySelector('p,li')) || !block.textContent.trim()) return;
      const index = counters.get(section.id) || 0; counters.set(section.id, index + 1);
      const key = `${section.id}:${index}`; block.dataset.highlightBlock = key; blocks.set(key, block);
    });
    const say = (text, error = false) => { feedback.textContent = text; feedback.classList.toggle('personal-warning', error); };
    function items() { return store.reload().filter(item => item.recordId === record.id); }
    function paintMarks(entries) {
      document.querySelectorAll('mark[data-personal-highlight]').forEach(mark => mark.replaceWith(...mark.childNodes));
      blocks.forEach(block => block.normalize());
      const positions = new Map();
      for (const [key, block] of blocks) {
        const ranges = entries.filter(item => item.block === key).map(item => ({ item, range: resolveDocumentHighlight(block.textContent, item) })).filter(item => item.range).sort((a, b) => a.range.start - b.range.start);
        let previous = null;
        for (const { item, range } of ranges) {
          if (previous && highlightRangesOverlap(previous, range)) continue;
          positions.set(item.id, range); previous = range;
        }
        for (const { item, range } of ranges.reverse()) {
          if (!positions.has(item.id)) continue;
          const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT); const nodes = []; let offset = 0, node;
          while ((node = walker.nextNode())) { nodes.push({ node, start: offset, end: offset + node.length }); offset += node.length; }
          for (const entry of nodes.reverse()) {
            const start = Math.max(entry.start, range.start), end = Math.min(entry.end, range.end); if (start >= end) continue;
            const selected = entry.node.splitText(start - entry.start); selected.splitText(end - start);
            const mark = document.createElement('mark'); mark.dataset.personalHighlight = item.id; mark.dataset.tone = item.tone;
            mark.tabIndex = 0; mark.setAttribute('role', 'button'); mark.setAttribute('aria-label', `${tones[item.tone]}: ${item.quote}. Abrir anotação.`);
            selected.replaceWith(mark); mark.append(selected);
          }
        }
      }
      return positions;
    }
    function renderList(focusId) {
      const entries = items(); const positions = paintMarks(entries);
      list.innerHTML = entries.map(item => `<article class="highlight-note" id="personal-highlight-${esc(item.id)}" data-highlight-note="${esc(item.id)}"><div class="highlight-note-top"><span>${esc(record.code)} / MARGEM PESSOAL</span><button type="button" class="op-text-button" data-remove-highlight="${esc(item.id)}">Remover grifo</button></div><blockquote>${esc(item.quote)}</blockquote>${positions.has(item.id) ? '<button type="button" class="op-link" data-find-highlight="' + esc(item.id) + '">Localizar trecho ↑</button>' : '<p class="personal-warning">Este grifo não foi aplicado ao texto atual. Sua anotação foi preservada; confira o trecho e outras marcações na mesma passagem.</p>'}<label for="highlight-tone-${esc(item.id)}">Tipo de marcação</label><select id="highlight-tone-${esc(item.id)}" data-highlight-tone="${esc(item.id)}">${Object.entries(tones).map(([key, label]) => `<option value="${key}" ${item.tone === key ? 'selected' : ''}>${label}</option>`).join('')}</select><label for="highlight-comment-${esc(item.id)}">Seu comentário</label><textarea id="highlight-comment-${esc(item.id)}" maxlength="6000" rows="3" data-highlight-comment="${esc(item.id)}" placeholder="O que este trecho sugere?">${esc(item.comment)}</textarea><p role="status" data-highlight-save>${store.persisted ? 'Salvo neste navegador.' : 'Apenas nesta sessão. Copie a anotação antes de sair.'}</p></article>`).join('') || '<p class="highlight-empty">Nenhum trecho grifado neste arquivo.</p>';
      const base = new Map(entries.map(item => [item.id, item]));
      for (const field of list.querySelectorAll('[data-highlight-comment],[data-highlight-tone]')) field.addEventListener(field.tagName === 'SELECT' ? 'change' : 'input', () => {
        const id = field.dataset.highlightComment || field.dataset.highlightTone; const key = field.tagName === 'SELECT' ? 'tone' : 'comment';
        const status = field.closest('article').querySelector('[data-highlight-save]');
        try {
          const next = store.update(id, { [key]: field.value }, { [key]: base.get(id)[key] }); base.set(id, { ...base.get(id), [key]: next[key], updatedAt: next.updatedAt }); field.removeAttribute('aria-invalid');
          status.textContent = store.persisted ? 'Salvo neste navegador.' : 'Apenas nesta sessão. Copie a anotação antes de sair.';
          if (key === 'tone') document.querySelectorAll('mark[data-personal-highlight]').forEach(mark => { if (mark.dataset.personalHighlight === id) mark.dataset.tone = field.value; });
        } catch (error) { field.setAttribute('aria-invalid', 'true'); status.textContent = error.message; }
      });
      list.querySelectorAll('[data-remove-highlight]').forEach(control => control.addEventListener('click', () => {
        try { store.remove(control.dataset.removeHighlight, base.get(control.dataset.removeHighlight)); renderList(); say('Grifo e comentário removidos deste navegador.'); } catch (error) { say(error.message, true); }
      }));
      list.querySelectorAll('[data-find-highlight]').forEach(control => control.addEventListener('click', () => {
        const target = [...document.querySelectorAll('mark[data-personal-highlight]')].find(mark => mark.dataset.personalHighlight === control.dataset.findHighlight);
        target?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); target?.focus({ preventScroll: true });
      }));
      if (focusId) list.querySelector(`#highlight-comment-${CSS.escape(focusId)}`)?.focus();
    }
    function selectionChanged() {
      const selection = getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) { if (!root.contains(document.activeElement)) { pending = null; button.disabled = true; } return; }
      const range = selection.getRangeAt(0); const element = node => node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      const first = element(range.startContainer)?.closest('[data-highlight-block]');
      const last = element(range.endContainer)?.closest('[data-highlight-block]');
      if (!first || first !== last || !first.isConnected) { pending = null; button.disabled = true; return; }
      const quote = range.toString();
      if (!quote.trim() || quote.length > 4000) { pending = null; button.disabled = true; return; }
      const before = range.cloneRange(); before.selectNodeContents(first); before.setEnd(range.startContainer, range.startOffset);
      const start = before.toString().length, end = start + quote.length;
      pending = { block: first.dataset.highlightBlock, quote, start, end, prefix: first.textContent.slice(Math.max(0, start - 64), start), suffix: first.textContent.slice(end, end + 64) };
      button.disabled = false;
    }
    document.addEventListener('selectionchange', selectionChanged, { signal });
    // Mantém a seleção ao pressionar o controle, inclusive no teclado móvel.
    button.addEventListener('pointerdown', event => event.preventDefault());
    button.addEventListener('click', () => {
      if (!pending) return;
      try {
        const block = blocks.get(pending.block); const existing = items().filter(item => item.block === pending.block);
        if (!block || block.textContent.slice(pending.start, pending.end) !== pending.quote) throw new Error('O texto mudou. Selecione o trecho novamente.');
        if (existing.some(item => { const range = resolveDocumentHighlight(block.textContent, item); return range && highlightRangesOverlap(range, pending); })) throw new Error('Esse trecho já contém um grifo. Use a anotação existente ou selecione outro trecho.');
        const now = new Date().toISOString(); const item = store.add({ ...pending, id: personalId(), recordId: record.id, createdAt: now, updatedAt: now, comment: '', tone: 'destaque' });
        pending = null; button.disabled = true; getSelection()?.removeAllRanges(); renderList(item.id);
        say(store.persisted ? 'Trecho grifado. Adicione seu comentário abaixo.' : 'Grifo apenas nesta sessão. Copie o trecho e seu comentário antes de sair.', !store.persisted);
      } catch (error) { say(error.message, true); }
    });
    document.querySelector('.dossier-body').addEventListener('click', event => {
      const mark = event.target.closest('mark[data-personal-highlight]'); if (!mark) return;
      const target = list.querySelector(`#highlight-comment-${CSS.escape(mark.dataset.personalHighlight)}`); target?.scrollIntoView({ block: 'center' }); target?.focus({ preventScroll: true });
    }, { signal });
    document.querySelector('.dossier-body').addEventListener('keydown', event => { const mark = event.target.closest('mark[data-personal-highlight]'); if (mark && ['Enter', ' '].includes(event.key)) { event.preventDefault(); mark.click(); } }, { signal });
    renderList();
  }
  return { markup, bind, snapshot: () => store.reload(), reload: force => store.reload(force) };
}
