import { defaultEvidencePositions, evidenceConnections, evidenceNodes, evidenceStatuses } from './evidence-board-model.js';
import { workFolderTabs, workFolderUrl } from './work-folder-sections.js';
import { noteIllustrationStrip } from './evidence-illustrations.js';
import { bindNoteIllustrationControls, noteIllustrationControl } from './note-illustration-picker.js';
import { createEvidenceViewport } from './evidence-viewport.js';
import { folderTagsField } from './folder-tags-ui.js';
import { parseFolderTags } from './work-folder-search.js';
import { createBoardExport } from './board-export-ui.js';
import './evidence-board.css';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const types = {
  people: { label: 'Pessoa de interesse', icon: 'users', tab: 'pessoas' },
  documents: { label: 'Documento', icon: 'file', tab: 'documentos' },
  notes: { label: 'Anotação', icon: 'clipboard', tab: 'anotacoes' },
  localities: { label: 'Localidade', icon: 'target', tab: 'localidades' },
};

export function createEvidenceBoard({ folder, getRecords, getMissions, icon, renderTransfer, onChange, onNotice }) {
  let mode = globalThis.matchMedia?.('(max-width: 700px)').matches ? 'list' : 'map';
  let reopenDetail = '';
  let cancelViewport = () => {};
  let cancelShortcuts = () => {};
  const views = new Map();
  const boardExport = createBoardExport({ folder, getRecords });
  const records = () => getRecords().filter(record => !record.unlisted);
  const notice = () => folder.persisted ? 'Quadro salvo neste navegador.' : 'Rascunho somente nesta sessão. Exporte a pasta antes de sair.';
  function meta(node) {
    const record = records().find(record => record.id === node.entry.recordId);
    return {
      ...node, record, type: types[node.kind],
      title: node.kind === 'documents' ? record?.title || 'Documento indisponível' : node.entry.name?.trim() || node.entry.title?.trim() || 'Anotação sem título',
      code: record?.code || types[node.kind].label,
      href: workFolderUrl(node.entry.missionId || 'avulsas', node.kind === 'notes' ? node.entry.id : '', types[node.kind].tab) + (node.kind === 'notes' ? '' : `&registro=${encodeURIComponent(node.entry.id)}`),
    };
  }
  const nodeOption = node => `<option value="${esc(node.ref)}">${esc(types[node.kind].label)} · ${esc(meta(node).title)}</option>`;
  const missionOptions = selected => `<option value="">Sem missão vinculada</option>${getMissions().map(item => `<option value="${esc(item.id)}" ${selected === item.id ? 'selected' : ''}>${esc(item.code)} · ${esc(item.title)}</option>`).join('')}`;

  function page(filter = '') {
    const nodes = evidenceNodes(folder.state, filter).map(meta);
    const links = evidenceConnections(folder.state, filter);
    const positions = defaultEvidencePositions(nodes);
    const missions = getMissions();
    const selectedMission = missions.find(mission => mission.id === filter)?.id || (filter === 'avulsas' ? '' : folder.state.missionId);
    const names = new Map(nodes.map(node => [node.ref, node.title]));
    return `<section class="work-folder evidence-page" aria-labelledby="work-folder-title"><div class="op-section-heading"><div><span class="op-kicker">ARQUIVO PESSOAL DO AGENTE</span><h1 id="work-folder-title">Pasta de trabalho</h1><p>Suas notas, referências e relatórios.</p></div></div>
      ${renderTransfer(filter)}<p class="folder-storage-notice">${icon('lock')}Registros pessoais, salvos neste navegador.</p>
      ${workFolderTabs(folder.state, filter, 'evidencias', icon)}
      <div class="folder-section-heading"><div><span class="op-kicker">ANÁLISE DE VÍNCULOS / QEV</span><h2>Quadro de evidências</h2><p>Organize as pistas e conecte o que está relacionado.</p></div><div class="folder-section-filter"><label for="folder-filter">Filtrar por missão</label><select id="folder-filter" data-folder-filter><option value="">Todos os registros</option><option value="avulsas" ${filter === 'avulsas' ? 'selected' : ''}>Sem missão vinculada</option>${missions.map(mission => `<option value="${esc(mission.id)}" ${filter === mission.id ? 'selected' : ''}>${esc(mission.code)} · ${esc(mission.title)}</option>`).join('')}${filter && filter !== 'avulsas' && !missions.some(mission => mission.id === filter) ? `<option selected value="${esc(filter)}">Missão indisponível</option>` : ''}</select></div></div>
      <div class="evidence-toolbar"><div class="op-actions"><button type="button" class="op-button" data-evidence-add>${icon('file')}Adicionar evidência</button><button type="button" class="op-button" data-evidence-connect ${nodes.length < 2 ? 'disabled' : ''}>${icon('connections')}Criar ligação</button></div><div class="evidence-toolbox"><button type="button" class="evidence-toolbox-button" data-evidence-toolbox aria-expanded="false">Exibição e ferramentas ▾</button><div class="evidence-toolbox-content"><div class="evidence-history-tools" role="group" aria-label="Histórico do quadro"><button type="button" class="op-button" data-evidence-history="undo">↶ Desfazer</button><button type="button" class="op-button" data-evidence-history="redo">↷ Refazer</button></div><button type="button" class="op-button evidence-export-button" data-open-board-export ${nodes.length ? '' : 'disabled'}>${icon('external')}Exportar quadro</button><div class="evidence-view" role="group" aria-label="Visualização das evidências"><button type="button" data-evidence-mode="map" aria-pressed="${mode === 'map'}">${icon('connections')}Quadro</button><button type="button" data-evidence-mode="list" aria-pressed="${mode === 'list'}">${icon('clipboard')}Lista</button></div>${mode === 'map' && nodes.length ? `<div class="evidence-zoom-tools" role="group" aria-label="Controles do quadro"><div><button type="button" data-evidence-zoom="out" aria-label="Diminuir zoom">−</button><button type="button" data-evidence-zoom="reset" aria-label="Restaurar zoom para 100%">100%</button><button type="button" data-evidence-zoom="in" aria-label="Aumentar zoom">+</button></div><button type="button" class="op-text-button" data-evidence-fit>${icon('expand')}Centralizar tudo</button></div>` : ''}</div></div></div>
      <div class="evidence-readout"><span>${String(nodes.length).padStart(2, '0')} evidências · ${String(links.length).padStart(2, '0')} ligações</span><span class="evidence-legend"><i></i>Hipótese <i class="is-confirmed"></i>Confirmada pelo agente</span></div>
      <div class="evidence-link-selection" data-evidence-selection hidden><span role="status" data-evidence-selection-message></span><div class="op-actions"><button type="button" class="op-text-button" data-evidence-connect-list>Escolher pela lista</button><button type="button" class="op-text-button" data-cancel-evidence-selection>Cancelar seleção</button></div></div>${nodes.length ? `<p class="evidence-help">${mode === 'map' ? 'Arraste pela alça do cartão para organizar. Use as setas do teclado com a alça selecionada. Toque em um cartão para consultar.' : 'Abra uma evidência para consultar suas observações, a origem e suas ligações.'}</p><div class="evidence-viewport ${mode === 'list' ? 'is-list' : ''}" ${mode === 'map' ? 'tabindex="0" role="region" aria-label="Quadro de evidências. Role para explorar todos os cartões."' : ''}><div class="evidence-stage" data-evidence-stage><div class="evidence-canvas" data-evidence-canvas>${mode === 'map' ? '<svg class="evidence-wires" aria-hidden="true" data-evidence-wires></svg><div class="evidence-column-labels" aria-hidden="true"><span>PESSOAS DE INTERESSE</span><span>DOCUMENTOS / ANOTAÇÕES</span><span>LOCALIDADES</span></div>' : ''}${nodes.map(node => {
        const position = positions.get(node.ref);
        const count = links.filter(link => link.from === node.ref || link.to === node.ref).length;
        const artwork = node.kind === 'notes' ? noteIllustrationStrip(node.entry) : '';
        return `<article class="evidence-card" data-evidence-ref="${esc(node.ref)}" style="left:${position.x}px;top:${position.y}px"><div class="evidence-card-heading"><span>${icon(node.type.icon)}${esc(node.type.label)}</span><span class="evidence-select-mark" data-evidence-select-mark aria-hidden="true">+</span><button type="button" class="evidence-drag" data-evidence-drag="${esc(node.ref)}" aria-label="Mover ${esc(node.title)}. Use as setas para mover; Shift para passos maiores." title="Arrastar cartão ou mover com as setas">⠿</button></div><button type="button" class="evidence-card-content ${artwork ? 'has-note-illustrations' : ''}" data-evidence-detail="${esc(node.ref)}">${artwork}<strong>${esc(node.title)}</strong><span>${esc(node.entry.body?.trim() || node.entry.role || node.entry.reference || 'Abra para consultar e relacionar.')}</span><small>${esc(node.code)}<b>${count} ${count === 1 ? 'ligação' : 'ligações'} ${icon('arrow')}</b></small></button></article>`;
      }).join('')}</div></div></div><div class="evidence-under-board"><p role="status" data-evidence-save>${esc(notice())}</p>${mode === 'map' ? '<button type="button" class="op-text-button" data-evidence-organize>Organizar cartões em colunas</button>' : ''}</div>` : `<div class="op-empty evidence-empty">${icon('connections')}<h3>${filter ? 'Nenhuma evidência neste filtro.' : 'As pistas começam aqui.'}</h3><p>Documentos, anotações, pessoas e localidades da pasta aparecem neste quadro. Adicione os primeiros registros e crie suas ligações.</p><button type="button" class="op-button" data-evidence-add>Adicionar evidência</button></div>`}
      <details class="evidence-relations folder-fold"><summary>Ligações registradas <span>${links.length}</span></summary><section aria-labelledby="evidence-relations-title"><div class="op-section-heading"><div><span class="op-kicker">RELAÇÕES REGISTRADAS</span><h3 id="evidence-relations-title">Ligações entre evidências</h3></div><span class="evidence-personal-label">ANÁLISE PESSOAL</span></div>${links.length ? `<ul>${links.map((link, index) => `<li><span class="evidence-link-number">L${String(index + 1).padStart(2, '0')}</span><div><span class="evidence-link-status ${link.status === 'confirmado' ? 'is-confirmed' : ''}">${esc(evidenceStatuses[link.status])}</span><h4>${esc(link.label)}</h4><div class="evidence-link-ends"><button type="button" data-evidence-detail="${esc(link.from)}">${esc(names.get(link.from))}</button>${icon('arrow')}<button type="button" data-evidence-detail="${esc(link.to)}">${esc(names.get(link.to))}</button></div>${link.body ? `<p>${esc(link.body)}</p>` : ''}</div><button type="button" class="op-text-button" data-evidence-edit="${esc(link.id)}" aria-label="Editar ligação: ${esc(link.label)}">Editar ligação</button></li>`).join('')}</ul>` : '<p class="evidence-help">Nenhuma ligação registrada. Escolha duas evidências e descreva o que as conecta.</p>'}</section></details>
      <dialog class="evidence-dialog" data-evidence-add-dialog aria-labelledby="evidence-add-title"><div class="folder-dialog-heading"><h2 id="evidence-add-title">Adicionar evidência</h2><button type="button" class="op-text-button" data-close-evidence>Fechar</button></div><p class="evidence-help">O registro será adicionado à sua pasta de trabalho e aparecerá no quadro.</p><form data-evidence-add-form><label for="evidence-add-kind">Tipo de evidência</label><select id="evidence-add-kind" name="kind">${Object.entries(types).map(([key, type]) => `<option value="${key}">${type.label}</option>`).join('')}</select><div data-evidence-add-fields></div><label for="evidence-add-mission">Missão vinculada</label><select id="evidence-add-mission" name="missionId">${missionOptions(selectedMission)}</select><label for="evidence-add-body">Suas observações</label><textarea id="evidence-add-body" name="body" rows="4" maxlength="20000" placeholder="O que encontrou? O que ainda precisa confirmar?"></textarea><p class="note-save-status note-save-warning" role="status" data-evidence-add-feedback></p><button type="submit" class="op-button">Adicionar à pasta e ao quadro</button></form></dialog>
      <dialog class="evidence-dialog" data-evidence-link-dialog aria-labelledby="evidence-link-title"><div class="folder-dialog-heading"><h2 id="evidence-link-title">Criar ligação</h2><button type="button" class="op-text-button" data-close-evidence>Fechar</button></div><form data-evidence-link-form><input type="hidden" name="id"><label for="evidence-link-from">Primeira evidência</label><select id="evidence-link-from" name="from" required><option value="">Selecione uma evidência</option>${nodes.map(nodeOption).join('')}</select><label for="evidence-link-to">Segunda evidência</label><select id="evidence-link-to" name="to" required><option value="">Selecione outra evidência</option>${nodes.map(nodeOption).join('')}</select><label for="evidence-link-label">O que conecta essas evidências?</label><input id="evidence-link-label" name="label" maxlength="120" required placeholder="Ex.: último local conhecido, citado no relatório…"><label for="evidence-link-status">Situação da ligação</label><select id="evidence-link-status" name="status">${Object.entries(evidenceStatuses).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select><p class="evidence-help">A confirmação representa sua análise pessoal. As informações do acervo permanecem como foram registradas.</p><label for="evidence-link-body">Fundamentação / observações</label><textarea id="evidence-link-body" name="body" rows="4" maxlength="4000" placeholder="Registre a fonte ou o motivo desta hipótese."></textarea><p class="note-save-status note-save-warning" role="status" data-evidence-link-feedback></p><div class="op-actions"><button type="submit" class="op-button">Salvar ligação</button><button type="button" class="op-text-button" data-evidence-remove hidden>Remover ligação</button></div></form></dialog>
      <dialog class="evidence-dialog" data-evidence-detail-dialog aria-labelledby="evidence-detail-title"><div class="folder-dialog-heading"><span class="op-kicker">CONSULTA DE EVIDÊNCIA</span><button type="button" class="op-text-button" data-close-evidence>Fechar</button></div><div data-evidence-detail-content></div></dialog>
      <dialog class="evidence-dialog" data-evidence-delete-dialog aria-labelledby="evidence-delete-title"><h2 id="evidence-delete-title">Remover esta ligação?</h2><p>Somente a ligação será removida. As duas evidências continuarão na sua pasta.</p><div class="op-actions"><button type="button" class="op-button" data-close-evidence>Manter ligação</button><button type="button" class="op-text-button" data-confirm-evidence-delete>Remover ligação</button></div></dialog>
    </section>`;
  }

  function bind() {
    cancelViewport(); cancelViewport = () => {};
    cancelShortcuts(); cancelShortcuts = () => {};
    const root = document.querySelector('.evidence-page');
    if (!root) { boardExport.bind({ root: null }); return; }
    const filter = new URLSearchParams(location.hash.split('?')[1]).get('missao') || '';
    const nodes = evidenceNodes(folder.state, filter).map(meta);
    const links = evidenceConnections(folder.state, filter);
    const byRef = new Map(nodes.map(node => [node.ref, node]));
    const positions = defaultEvidencePositions(nodes);
    boardExport.bind({ root, filter, positions });
    const addDialog = root.querySelector('[data-evidence-add-dialog]');
    const linkDialog = root.querySelector('[data-evidence-link-dialog]');
    const detailDialog = root.querySelector('[data-evidence-detail-dialog]');
    const deleteDialog = root.querySelector('[data-evidence-delete-dialog]');
    const addForm = root.querySelector('[data-evidence-add-form]');
    const linkForm = root.querySelector('[data-evidence-link-form]');
    let deleting = '';
    function updateHistory() {
      for (const action of ['undo', 'redo']) root.querySelectorAll(`[data-evidence-history="${action}"]`).forEach(button => {
        const label = action === 'undo' ? folder.undoLabel : folder.redoLabel;
        button.disabled = !label; button.title = label ? `${action === 'undo' ? 'Desfazer' : 'Refazer'}: ${label}` : 'Nenhuma ação disponível';
      });
    }
    function travelHistory(action) {
      try { if (folder[action]()) { onChange(); onNotice(action === 'undo' ? 'Ação desfeita.' : 'Ação refeita.'); } }
      catch (error) { onNotice(error.message); }
    }
    updateHistory();
    const shortcut = event => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || document.querySelector('dialog[open]') || document.activeElement?.closest('input,textarea,select,[contenteditable="true"]')) return;
      const key = event.key.toLowerCase();
      const action = key === 'z' ? event.shiftKey ? 'redo' : 'undo' : key === 'y' ? 'redo' : '';
      if (!action) return; event.preventDefault(); travelHistory(action);
    };
    document.addEventListener('keydown', shortcut); cancelShortcuts = () => document.removeEventListener('keydown', shortcut);
    let selecting = false; let firstEvidence = '';
    function selectionState(active, first = '') {
      selecting = active; firstEvidence = first;
      root.querySelector('[data-evidence-connect]').setAttribute('aria-pressed', String(active));
      root.querySelector('[data-evidence-selection]').hidden = !active;
      root.querySelector('[data-evidence-selection-message]').textContent = first ? `Primeira evidência: ${byRef.get(first).title}. Agora selecione a segunda.` : 'Selecione o primeiro cartão para criar uma ligação.';
      root.querySelectorAll('[data-evidence-ref]').forEach(card => {
        const selected = first === card.dataset.evidenceRef;
        card.classList.toggle('is-selectable', active); card.classList.toggle('is-selected', selected);
        card.querySelector('[data-evidence-select-mark]').textContent = selected ? '✓' : '+';
        const button = card.querySelector('[data-evidence-detail]');
        if (active) button.setAttribute('aria-pressed', String(selected)); else button.removeAttribute('aria-pressed');
      });
    }
    function refresh(ref) {
      onChange();
      if (ref) document.querySelector(`[data-evidence-detail="${ref}"]`)?.focus({ preventScroll: true });
      onNotice(notice());
    }
    function feedback(error) {
      updateHistory();
      const output = root.querySelector('[data-evidence-save]');
      if (output) { output.textContent = error?.message || notice(); output.classList.toggle('note-save-warning', Boolean(error) || !folder.persisted); }
      else if (error) onNotice(error.message);
    }
    function openLink(id = '', from = '', to = '') {
      selectionState(false);
      const link = links.find(link => link.id === id);
      linkForm.reset();
      for (const [key, value] of Object.entries(link || { id: '', from, to })) if (linkForm.elements.namedItem(key)) linkForm.elements.namedItem(key).value = value;
      root.querySelector('#evidence-link-title').textContent = link ? 'Editar ligação' : 'Criar ligação';
      linkForm.querySelector('[data-evidence-remove]').hidden = !link;
      linkForm.querySelector('[data-evidence-link-feedback]').textContent = '';
      detailDialog.close(); linkDialog.showModal();
      if (from && to) linkForm.elements.namedItem('label').focus();
    }
    function openDetail(ref) {
      const node = byRef.get(ref); if (!node) return;
      const related = links.filter(link => link.from === ref || link.to === ref);
      const mission = getMissions().find(mission => mission.id === node.entry.missionId);
      root.querySelector('[data-evidence-detail-content]').innerHTML = `<span class="evidence-detail-type">${icon(node.type.icon)}${esc(node.type.label)} · ${esc(node.code)}</span><h2 id="evidence-detail-title">${esc(node.title)}</h2><p class="evidence-help">${esc(mission ? `${mission.code} · ${mission.title}` : node.entry.missionId ? 'Missão indisponível' : 'Sem missão vinculada')}</p>${node.entry.role || node.entry.reference ? `<p class="evidence-detail-reference">${esc(node.entry.role || node.entry.reference)}</p>` : ''}${node.kind === 'notes' ? noteIllustrationControl(node.entry, { noteId: node.entry.id }) : ''}<div data-evidence-tags="${esc(ref)}">${folderTagsField(node.entry, `evidence-${node.entry.id}`)}<p class="note-save-status" role="status" data-evidence-tags-status></p></div><p class="evidence-detail-body">${esc(node.entry.body || 'Nenhuma observação registrada.')}</p><div class="op-actions"><a class="op-link" href="${esc(node.href)}">Editar registro na pasta ${icon('arrow')}</a>${node.record ? `<a class="op-link" href="#/arquivo/${esc(node.record.id)}">Consultar ficha no acervo ${icon('external')}</a>` : ''}</div><h3>Ligações desta evidência</h3>${related.length ? `<ul class="evidence-detail-links">${related.map(link => `<li><span class="evidence-link-status ${link.status === 'confirmado' ? 'is-confirmed' : ''}">${esc(evidenceStatuses[link.status])}</span><strong>${esc(link.label)}</strong><span>${esc(byRef.get(link.from === ref ? link.to : link.from)?.title)}</span><button type="button" class="op-text-button" data-evidence-edit="${esc(link.id)}">Editar ligação</button></li>`).join('')}</ul>` : '<p class="evidence-help">Esta evidência ainda não possui ligações.</p>'}<button type="button" class="op-button" data-evidence-connect-from="${esc(ref)}" ${nodes.length < 2 ? 'disabled' : ''}>${icon('connections')}Ligar a outra evidência</button>`;
      detailDialog.showModal();
    }
    root.addEventListener('click', event => {
      const button = event.target.closest('button'); if (!button || button.disabled) return;
      if (button.hasAttribute('data-close-evidence')) button.closest('dialog').close();
      else if (button.hasAttribute('data-evidence-add')) { selectionState(false); addForm.querySelector('[data-evidence-add-feedback]').textContent = ''; addDialog.showModal(); }
      else if (button.hasAttribute('data-evidence-connect')) selectionState(!selecting);
      else if (button.hasAttribute('data-cancel-evidence-selection')) selectionState(false);
      else if (button.hasAttribute('data-evidence-connect-list')) openLink();
      else if (button.hasAttribute('data-evidence-connect-from')) openLink('', button.dataset.evidenceConnectFrom);
      else if (button.hasAttribute('data-evidence-edit')) openLink(button.dataset.evidenceEdit);
      else if (button.hasAttribute('data-evidence-detail')) {
        const ref = button.dataset.evidenceDetail;
        if (!selecting) openDetail(ref);
        else if (!firstEvidence || firstEvidence === ref) selectionState(true, firstEvidence === ref ? '' : ref);
        else openLink('', firstEvidence, ref);
      }
      else if (button.hasAttribute('data-evidence-mode')) { mode = button.dataset.evidenceMode; onChange(); document.querySelector(`[data-evidence-mode="${mode}"]`)?.focus({ preventScroll: true }); }
      else if (button.hasAttribute('data-evidence-organize')) { folder.organizeEvidence(nodes.map(node => node.ref)); refresh(); }
      else if (button.hasAttribute('data-evidence-history')) travelHistory(button.dataset.evidenceHistory);
      else if (button.hasAttribute('data-evidence-toolbox')) { const box = button.closest('.evidence-toolbox'); const open = box.classList.toggle('is-open'); button.setAttribute('aria-expanded', String(open)); }
      else if (button.hasAttribute('data-evidence-remove')) { deleting = linkForm.elements.namedItem('id').value; linkDialog.close(); deleteDialog.showModal(); }
      else if (button.hasAttribute('data-confirm-evidence-delete')) { folder.removeConnection(deleting); deleting = ''; deleteDialog.close(); refresh(); }
    });
    root.addEventListener('keydown', event => { if (event.key === 'Escape' && selecting) { event.preventDefault(); selectionState(false); } });
    root.addEventListener('input', event => {
      if (event.target.name !== 'tags') return;
      const wrapper = event.target.closest('[data-evidence-tags]'); if (!wrapper) return;
      const node = byRef.get(wrapper.dataset.evidenceTags); const output = wrapper.querySelector('[data-evidence-tags-status]');
      try {
        folder.setEntryTags(node.kind, node.entry.id, parseFolderTags(event.target.value));
        node.entry = folder.state[node.kind].find(entry => entry.id === node.entry.id);
        output.textContent = notice(); event.target.removeAttribute('aria-invalid');
      } catch (error) { output.textContent = error.message; event.target.setAttribute('aria-invalid', 'true'); }
    });
    const matchingRecords = kind => records().filter(record => kind === 'people' ? record.kind === 'agente' || record.category === 'Pessoas' : record.kind !== 'agente' && record.category !== 'Pessoas');
    function addFields() {
      const kind = addForm.elements.namedItem('kind').value;
      const field = (name, label, max) => `<label for="evidence-new-${name}">${label}</label><input id="evidence-new-${name}" name="${name}" maxlength="${max}" ${['name', 'title'].includes(name) ? 'required' : ''}>`;
      addForm.querySelector('[data-evidence-add-fields]').innerHTML = `${kind === 'documents' ? '' : field(kind === 'notes' ? 'title' : 'name', kind === 'notes' ? 'Título da anotação' : kind === 'people' ? 'Nome da pessoa' : 'Nome da localidade', 120)}${kind === 'people' ? field('role', 'Relação com a investigação', 160) : kind === 'localities' ? field('reference', 'Referência / coordenadas', 240) : ''}${kind === 'notes' ? noteIllustrationControl() : ''}${folderTagsField({}, 'evidence-add')}${['documents', 'people'].includes(kind) ? `<label for="evidence-new-record">${kind === 'documents' ? 'Documento do acervo' : 'Ficha do acervo (opcional)'}</label><select id="evidence-new-record" name="recordId" ${kind === 'documents' ? 'required' : ''}><option value="">${kind === 'documents' ? 'Selecione um arquivo' : 'Sem ficha vinculada'}</option>${matchingRecords(kind).map(record => `<option value="${esc(record.id)}">${esc(record.code)} · ${esc(record.title)}</option>`).join('')}</select>` : ''}`;
    }
    addFields();
    addForm.elements.namedItem('kind').addEventListener('change', addFields);
    addForm.addEventListener('change', event => {
      if (event.target.name === 'recordId' && addForm.elements.namedItem('name') && !addForm.elements.namedItem('name').value.trim()) addForm.elements.namedItem('name').value = records().find(record => record.id === event.target.value)?.title || '';
    });
    addForm.addEventListener('submit', event => {
      event.preventDefault();
      try {
        const data = Object.fromEntries(new FormData(addForm));
        const tags = parseFolderTags(data.tags || '');
        if (data.recordId && !matchingRecords(data.kind).some(record => record.id === data.recordId)) throw new Error('Selecione um arquivo disponível no acervo.');
        if (data.missionId && !getMissions().some(mission => mission.id === data.missionId)) throw new Error('Selecione uma missão disponível.');
        const previous = data.kind === 'documents' ? folder.state.documents.find(entry => entry.recordId === data.recordId && entry.missionId === data.missionId)?.body : '';
        const body = data.body.trim() ? previous ? `${previous}\n\n${data.body}` : data.body : '';
        if (body.length > 20000) throw new Error('O documento já possui observações. O texto combinado deve ter até 20.000 caracteres; edite o registro na aba Documentos.');
        const id = folder.transaction('Adicionar evidência', () => {
          const id = data.kind === 'people' ? folder.addPerson(data) : data.kind === 'localities' ? folder.addLocality(data) : data.kind === 'notes' ? folder.addNote(data.missionId, JSON.parse(data.illustrations || '[]')) : folder.addDocument(data.recordId, data.missionId);
          const update = data.kind === 'people' ? folder.updatePerson : data.kind === 'localities' ? folder.updateLocality : data.kind === 'notes' ? folder.updateNote : folder.updateDocument;
          if (data.kind === 'notes') update(id, 'title', data.title);
          if (body) update(id, 'body', body);
          if (tags.length) folder.setEntryTags(data.kind, id, tags);
          return id;
        });
        addDialog.close();
        if (filter && (filter === 'avulsas' ? Boolean(data.missionId) : data.missionId !== filter)) location.hash = workFolderUrl(data.missionId || 'avulsas', '', 'evidencias');
        else refresh(`${data.kind}:${id}`);
      } catch (error) { addForm.querySelector('[data-evidence-add-feedback]').textContent = error.message; }
    });
    linkForm.addEventListener('submit', event => {
      event.preventDefault();
      try { folder.saveConnection(Object.fromEntries(new FormData(linkForm))); linkDialog.close(); refresh(); }
      catch (error) { linkForm.querySelector('[data-evidence-link-feedback]').textContent = error.message; }
    });

    bindNoteIllustrationControls(root, { onChange: ({ control, values }) => {
      const id = control.dataset.illustratedNote;
      if (!id) return;
      folder.setNoteIllustrations(id, values);
      reopenDetail = `notes:${id}`; onChange(); onNotice(notice());
    } });
    if (reopenDetail) { const ref = reopenDetail; reopenDetail = ''; openDetail(ref); }
    const params = new URLSearchParams(location.hash.split('?')[1]);
    if (links.some(link => link.id === params.get('ligacao'))) {
      const id = params.get('ligacao'); params.delete('ligacao');
      history.replaceState(null, '', `#/pasta-de-trabalho?${params}`); openLink(id);
    }

    if (mode !== 'map' || !nodes.length) return;
    const canvas = root.querySelector('[data-evidence-canvas]');
    const wires = root.querySelector('[data-evidence-wires]');
    const viewport = root.querySelector('.evidence-viewport');
    const camera = createEvidenceViewport({ root, viewport, stage: root.querySelector('[data-evidence-stage]'), canvas, getPositions: () => positions, saved: views.get(filter), onView: view => views.set(filter, view) });
    cancelViewport = () => camera.dispose();
    const cards = new Map([...canvas.querySelectorAll('[data-evidence-ref]')].map(card => [card.dataset.evidenceRef, card]));
    function draw() {
      const width = Math.max(1040, ...[...positions.values()].map(position => position.x + 294));
      const height = Math.max(530, ...[...positions.values()].map(position => position.y + 228));
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      camera.setSize(width, height);
      wires.setAttribute('width', width); wires.setAttribute('height', height); wires.setAttribute('viewBox', `0 0 ${width} ${height}`);
      wires.innerHTML = links.map((link, index) => {
        const a = positions.get(link.from); const b = positions.get(link.to);
        const horizontal = Math.abs(a.x - b.x) > 40;
        const forward = horizontal ? a.x < b.x : a.y < b.y;
        const x1 = a.x + (horizontal ? forward ? 250 : 0 : 125); const x2 = b.x + (horizontal ? forward ? 0 : 250 : 125);
        const y1 = a.y + (horizontal ? 90 : forward ? 180 : 0); const y2 = b.y + (horizontal ? 90 : forward ? 0 : 180);
        const middleX = (x1 + x2) / 2; const middleY = (y1 + y2) / 2;
        const path = horizontal ? `M${x1},${y1} C${middleX},${y1} ${middleX},${y2} ${x2},${y2}` : `M${x1},${y1} C${x1},${middleY} ${x2},${middleY} ${x2},${y2}`;
        return `<g class="${link.status === 'confirmado' ? 'is-confirmed' : ''}"><path d="${path}"/><circle cx="${x1}" cy="${y1}" r="3"/><circle cx="${x2}" cy="${y2}" r="3"/><rect x="${middleX - 18}" y="${middleY - 11}" width="36" height="22"/><text x="${middleX}" y="${middleY + 4}">L${String(index + 1).padStart(2, '0')}</text></g>`;
      }).join('');
    }
    draw();
    for (const [ref, card] of cards) {
      const handle = card.querySelector('[data-evidence-drag]');
      let drag;
      function move(x, y) {
        const position = { x: Math.max(0, Math.min(6000, Math.round(x))), y: Math.max(0, Math.min(6000, Math.round(y))) };
        positions.set(ref, position); card.style.left = `${position.x}px`; card.style.top = `${position.y}px`; draw();
      }
      function save() {
        try { folder.moveEvidence(ref, positions.get(ref)); feedback(); }
        catch (error) { feedback(error); }
      }
      handle.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        drag = { x: event.clientX, y: event.clientY, origin: { ...positions.get(ref) }, pointer: event.pointerId, scrollX: viewport.scrollLeft, scrollY: viewport.scrollTop };
        handle.setPointerCapture(event.pointerId); card.classList.add('is-dragging');
      });
      handle.addEventListener('pointermove', event => {
        if (!drag || drag.pointer !== event.pointerId) return;
        move(drag.origin.x + (event.clientX - drag.x + viewport.scrollLeft - drag.scrollX) / camera.zoom, drag.origin.y + (event.clientY - drag.y + viewport.scrollTop - drag.scrollY) / camera.zoom);
      });
      function end(event, cancel = false) {
        if (!drag || drag.pointer !== event.pointerId) return;
        const origin = drag.origin; drag = null; card.classList.remove('is-dragging');
        if (cancel) move(origin.x, origin.y); else save();
      }
      handle.addEventListener('pointerup', event => end(event));
      handle.addEventListener('pointercancel', event => end(event, true));
      handle.addEventListener('lostpointercapture', event => end(event, true));
      handle.addEventListener('keydown', event => {
        const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
        if (!direction) return;
        event.preventDefault();
        const position = positions.get(ref); const step = event.shiftKey ? 50 : 10;
        move(position.x + direction[0] * step, position.y + direction[1] * step); save();
      });
    }
  }
  return { page, bind };
}
