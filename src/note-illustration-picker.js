import { evidenceIllustrations, evidenceIllustrationMarkup, getEvidenceIllustration, maxNoteIllustrations, noteIllustrations } from './evidence-illustrations.js';
import './note-illustrations.css';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const normalize = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const groups = { todas: 'Todas', criaturas: 'Criaturas', paises: 'Países', mundo: 'Mundo' };
const preview = ids => ids.map(id => `<span class="note-illustration-choice">${evidenceIllustrationMarkup(id)}<span>${esc(getEvidenceIllustration(id).label)}</span><button type="button" data-remove-note-illustration="${id}" aria-label="Remover imagem: ${esc(getEvidenceIllustration(id).label)}">×</button></span>`).join('');

export function noteIllustrationControl(entry = {}, { noteId = '' } = {}) {
  const ids = noteIllustrations(entry);
  return `<section class="note-illustration-control" data-note-illustrations${noteId ? ` data-illustrated-note="${esc(noteId)}"` : ''} aria-label="Imagens da anotação"><div class="note-illustration-control-heading"><span>Imagens da anotação <small>opcional · até ${maxNoteIllustrations}</small></span><button type="button" class="op-text-button" data-choose-note-illustrations>Escolher imagens</button></div><input type="hidden" name="illustrations" value="${esc(JSON.stringify(ids))}"><div class="note-illustration-selected" data-selected-note-illustrations>${preview(ids)}</div><p class="note-illustration-empty" data-no-note-illustrations ${ids.length ? 'hidden' : ''}>Criaturas, países e planeta Terra para identificar suas pistas.</p></section>`;
}

export function bindNoteIllustrationControls(root, { onChange = () => {} } = {}) {
  if (!root) return;
  const read = control => {
    try { return noteIllustrations({ illustrations: JSON.parse(control.querySelector('[name="illustrations"]').value) }); }
    catch { return []; }
  };
  function commit(control, values) {
    const result = onChange({ control, values });
    if (result === false) throw new Error('A alteração não foi salva. Confira o aviso da anotação.');
    if (!control.isConnected) return;
    control.querySelector('[name="illustrations"]').value = JSON.stringify(values);
    control.querySelector('[data-selected-note-illustrations]').innerHTML = preview(values);
    control.querySelector('[data-no-note-illustrations]').hidden = values.length > 0;
  }
  function open(control, opener) {
    let pending = [...read(control)]; let group = 'todas'; let search = '';
    const dialog = document.createElement('dialog');
    dialog.className = 'note-illustration-dialog';
    dialog.setAttribute('aria-labelledby', 'note-image-picker-title');
    dialog.innerHTML = `<div class="folder-dialog-heading"><div><span class="op-kicker">BIBLIOTECA VISUAL</span><h2 id="note-image-picker-title">Imagens da anotação</h2></div><button type="button" class="op-text-button" data-cancel-note-images>Cancelar</button></div><p class="note-image-help">Combine até ${maxNoteIllustrations} imagens para identificar esta pista.</p><label for="note-image-search">Buscar imagem</label><input id="note-image-search" type="search" placeholder="Ex.: lobisomem, Brasil, Terra…" autocomplete="off"><div class="note-image-groups" role="group" aria-label="Categorias de imagens">${Object.entries(groups).map(([id, label]) => `<button type="button" data-image-group="${id}" aria-pressed="${id === group}">${label}</button>`).join('')}</div><p class="note-image-count" role="status" data-note-image-count></p><div class="note-image-library" data-note-image-library></div><p class="note-image-feedback" role="status" data-note-image-feedback></p><div class="note-image-actions"><button type="button" class="op-text-button" data-clear-note-images>Limpar seleção</button><button type="button" class="op-button" data-apply-note-images>Aplicar seleção</button></div>`;
    const feedback = dialog.querySelector('[data-note-image-feedback]');
    const library = dialog.querySelector('[data-note-image-library]');
    function renderLibrary() {
      const images = evidenceIllustrations.filter(image => (group === 'todas' || image.group === group) && normalize(image.label).includes(normalize(search.trim())));
      library.innerHTML = images.map(image => `<button type="button" class="note-image-option" data-select-note-image="${image.id}" aria-pressed="${pending.includes(image.id)}" aria-label="${esc(image.label)}">${evidenceIllustrationMarkup(image.id, { decorative: true })}<span>${esc(image.label)}</span><b aria-hidden="true">${pending.includes(image.id) ? '✓' : '+'}</b></button>`).join('') || '<p class="note-image-help">Nenhuma imagem encontrada. Tente outro nome.</p>';
      dialog.querySelector('[data-note-image-count]').textContent = `${images.length} ${images.length === 1 ? 'imagem disponível' : 'imagens disponíveis'} · ${pending.length} de ${maxNoteIllustrations} selecionadas`;
      dialog.querySelectorAll('[data-image-group]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.imageGroup === group)));
    }
    renderLibrary();
    dialog.querySelector('#note-image-search').addEventListener('input', event => { search = event.target.value; renderLibrary(); feedback.textContent = ''; });
    dialog.addEventListener('click', event => {
      const button = event.target.closest('button'); if (!button) return;
      if (button.hasAttribute('data-cancel-note-images')) dialog.close();
      else if (button.hasAttribute('data-image-group')) { group = button.dataset.imageGroup; library.scrollTop = 0; renderLibrary(); feedback.textContent = ''; }
      else if (button.hasAttribute('data-select-note-image')) {
        const id = button.dataset.selectNoteImage;
        if (pending.includes(id)) pending = pending.filter(selected => selected !== id);
        else if (pending.length < maxNoteIllustrations) pending.push(id);
        else { feedback.textContent = `Você já selecionou ${maxNoteIllustrations} imagens. Remova uma para escolher outra.`; return; }
        feedback.textContent = ''; const scroll = library.scrollTop; renderLibrary(); library.scrollTop = scroll;
        library.querySelector(`[data-select-note-image="${id}"]`)?.focus({ preventScroll: true });
      }
      else if (button.hasAttribute('data-clear-note-images')) { pending = []; renderLibrary(); feedback.textContent = ''; }
      else if (button.hasAttribute('data-apply-note-images')) {
        try {
          if (!control.isConnected) throw new Error('Esta anotação não está mais aberta. Feche a seleção e consulte a pasta novamente.');
          commit(control, pending); dialog.close();
        } catch (error) { feedback.textContent = error.message; }
      }
    });
    const closeOnNavigation = () => dialog.close();
    window.addEventListener('hashchange', closeOnNavigation);
    dialog.addEventListener('close', () => { window.removeEventListener('hashchange', closeOnNavigation); dialog.remove(); if (opener.isConnected) opener.focus({ preventScroll: true }); }, { once: true });
    document.body.append(dialog); dialog.showModal();
    if (globalThis.matchMedia?.('(pointer: fine)').matches) dialog.querySelector('#note-image-search').focus();
  }
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-choose-note-illustrations],[data-remove-note-illustration]');
    const control = button?.closest('[data-note-illustrations]');
    if (!control || !root.contains(control)) return;
    if (button.hasAttribute('data-choose-note-illustrations')) open(control, button);
    else {
      try { commit(control, read(control).filter(id => id !== button.dataset.removeNoteIllustration)); }
      catch (error) { control.querySelector('[data-no-note-illustrations]').hidden = false; control.querySelector('[data-no-note-illustrations]').textContent = error.message; }
    }
  });
}
