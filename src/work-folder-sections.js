const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const sections = {
  documentos: { key: 'documents', label: 'Documentos', icon: 'file', add: 'Vincular documento', empty: 'Nenhum documento vinculado.', description: 'Reúna ordens, relatórios e referências do acervo para consultar durante a investigação.' },
  pessoas: { key: 'people', label: 'Pessoas de interesse', icon: 'users', add: 'Adicionar pessoa', empty: 'Nenhuma pessoa registrada.', description: 'Registre contatos, testemunhas e outras pessoas relevantes para a investigação.' },
  localidades: { key: 'localities', label: 'Localidades', icon: 'target', add: 'Adicionar localidade', empty: 'Nenhuma localidade registrada.', description: 'Organize os locais de interesse, suas referências e suas observações de campo.' },
};

export function workFolderUrl(missionId = '', noteId = '', tab = 'anotacoes') {
  const params = new URLSearchParams({ ...(tab !== 'anotacoes' ? { aba: tab } : {}), ...(missionId ? { missao: missionId } : {}), ...(noteId && tab === 'anotacoes' ? { nota: noteId } : {}) });
  return '#/pasta-de-trabalho' + (params.size ? `?${params}` : '');
}

export function workFolderTabs(state, filter, tab, icon) {
  const visible = entries => entries.filter(entry => !filter || (filter === 'avulsas' ? !entry.missionId : entry.missionId === filter)).length;
  return `<nav class="work-folder-tabs" aria-label="Seções da pasta de trabalho">${[['anotacoes', 'Anotações', 'clipboard', 'notes'], ...Object.entries(sections).map(([id, section]) => [id, section.label, section.icon, section.key])].map(([id, label, symbol, key]) => `<a href="${workFolderUrl(filter, '', id)}" class="${tab === id ? 'selected' : ''}" ${tab === id ? 'aria-current="page"' : ''}>${icon(symbol)}<span>${label}</span><b>${visible(state[key])}</b></a>`).join('')}</nav>`;
}

export function createWorkFolderSections({ folder, getRecords, getMissions, icon, onNotice, onChange }) {
  const knownRecords = () => getRecords().filter(record => !record.unlisted);
  const matchingRecords = tab => knownRecords().filter(record => tab === 'pessoas' ? record.kind === 'agente' || record.category === 'Pessoas' : tab === 'localidades' ? record.category === 'Locais' : record.kind !== 'agente' && record.category !== 'Pessoas');
  const missionOptions = selected => `<option value="">Sem missão vinculada</option>${getMissions().map(mission => `<option value="${esc(mission.id)}" ${selected === mission.id ? 'selected' : ''}>${esc(mission.code)} · ${esc(mission.title)}</option>`).join('')}${selected && !getMissions().some(mission => mission.id === selected) ? `<option selected value="${esc(selected)}">Missão indisponível</option>` : ''}`;
  const recordOptions = (tab, selected = '') => `<option value="">${tab === 'documentos' ? 'Selecione um arquivo' : 'Sem ficha vinculada'}</option>${matchingRecords(tab).map(record => `<option value="${esc(record.id)}" ${selected === record.id ? 'selected' : ''}>${esc(record.code)} · ${esc(record.title)}</option>`).join('')}${selected && !matchingRecords(tab).some(record => record.id === selected) ? `<option selected value="${esc(selected)}">Ficha indisponível</option>` : ''}`;
  const saveNotice = () => folder.persisted ? 'Salvo neste navegador.' : 'Armazenamento indisponível. Este registro está apenas nesta sessão; copie suas observações antes de sair.';
  const field = (id, label, name, value, max, placeholder = '') => `<label for="${id}">${label}</label><input id="${id}" name="${name}" value="${esc(value)}" maxlength="${max}" placeholder="${esc(placeholder)}"${name === 'name' ? ' required' : ''}>`;
  let removing = null;

  function page(tab, filter) {
    if (!Object.hasOwn(sections, tab)) return null;
    const section = sections[tab];
    const entries = folder.state[section.key].filter(entry => !filter || (filter === 'avulsas' ? !entry.missionId : entry.missionId === filter));
    const missions = getMissions();
    const defaultMission = missions.some(mission => mission.id === filter) ? filter : filter === 'avulsas' ? '' : missions.find(mission => mission.id === folder.state.missionId)?.id || '';
    const records = knownRecords();
    return `<section class="work-folder" aria-labelledby="work-folder-title"><div class="op-section-heading"><div><span class="op-kicker">ARQUIVO PESSOAL DO AGENTE</span><h1 id="work-folder-title">Pasta de trabalho</h1><p>Registre o que encontrou. Guarde o que ainda precisa investigar.</p></div><button type="button" class="op-button" data-open-folder-add>${icon(section.icon)}${section.add}</button></div><p class="folder-storage-notice">${icon('lock')}Registros pessoais, salvos apenas neste navegador.</p>
      ${workFolderTabs(folder.state, filter, tab, icon)}
      <div class="folder-section-heading"><div><h2>${section.label}</h2><p>${section.description}</p></div><div class="folder-section-filter"><label for="folder-filter">Filtrar por missão</label><select id="folder-filter" data-folder-filter><option value="">Todos os registros</option><option value="avulsas" ${filter === 'avulsas' ? 'selected' : ''}>Sem missão vinculada</option>${missions.map(mission => `<option value="${esc(mission.id)}" ${filter === mission.id ? 'selected' : ''}>${esc(mission.code)} · ${esc(mission.title)}</option>`).join('')}${filter && filter !== 'avulsas' && !missions.some(mission => mission.id === filter) ? `<option selected value="${esc(filter)}">Missão indisponível</option>` : ''}</select></div></div>
      <div class="folder-entry-grid">${entries.map(entry => {
        const record = records.find(record => record.id === entry.recordId);
        const prefix = `folder-entry-${entry.id}`;
        const recordSelect = tab === 'documentos' || (tab === 'localidades' && !matchingRecords(tab).length && !entry.recordId) ? '' : `<label for="${prefix}-record">Ficha do acervo (opcional)</label><select id="${prefix}-record" name="recordId">${recordOptions(tab, entry.recordId)}</select>`;
        return `<article class="folder-entry-card" id="${prefix}"><div class="folder-entry-top">${icon(section.icon)}<span>${tab === 'documentos' ? esc(record?.code || 'CONSULTA INDISPONÍVEL') : 'REGISTRO PESSOAL'}</span><button type="button" class="op-text-button" data-remove-folder-entry="${esc(entry.id)}" aria-label="Remover ${esc(tab === 'documentos' ? record?.title || 'documento' : entry.name || 'registro')} da pasta">Remover</button></div><h3 data-folder-entry-title>${tab === 'documentos' ? record ? `<a href="#/arquivo/${esc(record.id)}">${esc(record.title)} ${icon('external')}</a>` : 'Documento indisponível' : esc(entry.name.trim() || (tab === 'pessoas' ? 'Pessoa sem nome' : 'Localidade sem nome'))}</h3>${tab === 'documentos' && !record ? '<p class="folder-entry-unavailable">O arquivo não está disponível com os acessos atuais deste terminal.</p>' : ''}<form class="folder-entry-editor" data-folder-entry="${esc(entry.id)}" data-folder-tab="${tab}">${tab !== 'documentos' ? field(`${prefix}-name`, tab === 'pessoas' ? 'Nome da pessoa' : 'Nome da localidade', 'name', entry.name, 120) : ''}${tab === 'pessoas' ? field(`${prefix}-role`, 'Relação com a investigação', 'role', entry.role, 160, 'Ex.: contato, testemunha, responsável pelo local') : tab === 'localidades' ? field(`${prefix}-reference`, 'Referência / coordenadas', 'reference', entry.reference, 240, 'Endereço, região ou coordenadas') : ''}${recordSelect}<a class="op-link folder-entry-record-link" data-folder-record-link ${tab !== 'documentos' && record ? `href="#/arquivo/${esc(record.id)}"` : 'hidden'}>Consultar ficha no acervo ${icon('arrow')}</a><label for="${prefix}-mission">Missão vinculada</label><select id="${prefix}-mission" name="missionId">${missionOptions(entry.missionId)}</select><label for="${prefix}-body">Suas observações</label><textarea id="${prefix}-body" name="body" maxlength="20000" rows="5" placeholder="Registre o que sabe e o que ainda precisa verificar…">${esc(entry.body)}</textarea><p class="note-save-status" role="status" data-entry-save-status>${esc(saveNotice())}</p></form></article>`;
      }).join('') || `<div class="op-empty folder-section-empty">${icon(section.icon)}<h3>${section.empty}</h3><p>${filter ? 'Adicione registros a esta missão ou selecione outro filtro.' : section.description}</p><button type="button" class="op-button" data-open-folder-add>${section.add}</button></div>`}</div>
      <dialog class="folder-entry-dialog" aria-labelledby="folder-add-title"><div class="folder-dialog-heading"><h2 id="folder-add-title">${section.add}</h2><button type="button" class="op-text-button" data-close-folder-add>Fechar</button></div><form class="folder-add-form" data-add-folder-entry="${tab}">${tab === 'documentos' ? `<label for="folder-add-record">Documento do acervo</label><select id="folder-add-record" name="recordId" required>${recordOptions(tab)}</select><p class="op-local-note">O vínculo guarda um atalho para o arquivo original.</p>` : `${field('folder-add-name', tab === 'pessoas' ? 'Nome da pessoa' : 'Nome da localidade', 'name', '', 120)}${tab === 'pessoas' ? field('folder-add-role', 'Relação com a investigação', 'role', '', 160, 'Ex.: contato ou testemunha') : field('folder-add-reference', 'Referência / coordenadas', 'reference', '', 240, 'Endereço, região ou coordenadas')}${matchingRecords(tab).length ? `<label for="folder-add-record">Ficha do acervo (opcional)</label><select id="folder-add-record" name="recordId">${recordOptions(tab)}</select>` : ''}`}<label for="folder-add-mission">Missão vinculada</label><select id="folder-add-mission" name="missionId">${missionOptions(defaultMission)}</select><p class="note-save-status note-save-warning" role="status" data-folder-add-feedback></p><button type="submit" class="op-button">${section.add}</button></form></dialog>
      <dialog class="folder-entry-delete-dialog" aria-labelledby="folder-remove-title"><h2 id="folder-remove-title">Remover este registro da pasta?</h2><p>Suas observações deste registro serão removidas. Os arquivos originais do acervo serão preservados.</p><div class="op-actions"><button type="button" class="op-button" data-cancel-folder-remove>Manter registro</button><button type="button" class="op-button" data-confirm-folder-remove>Remover da pasta</button></div></dialog></section>`;
  }

  function bind() {
    const addDialog = document.querySelector('.folder-entry-dialog');
    if (!addDialog) return;
    const tab = document.querySelector('[data-add-folder-entry]').dataset.addFolderEntry;
    const filter = new URLSearchParams(location.hash.split('?')[1]).get('missao') || '';
    const addForm = addDialog.querySelector('form');
    document.querySelectorAll('[data-open-folder-add]').forEach(button => button.addEventListener('click', () => addDialog.showModal()));
    addDialog.querySelector('[data-close-folder-add]').addEventListener('click', () => addDialog.close());
    addForm.elements.namedItem('recordId')?.addEventListener('change', event => {
      const name = addForm.elements.namedItem('name');
      if (name && !name.value.trim()) name.value = matchingRecords(tab).find(record => record.id === event.target.value)?.title || '';
    });
    addForm.addEventListener('submit', event => {
      event.preventDefault();
      try {
        const data = Object.fromEntries(new FormData(addForm));
        if ((data.recordId || tab === 'documentos') && !matchingRecords(tab).some(record => record.id === data.recordId)) throw new Error('Selecione um arquivo disponível no acervo.');
        const id = tab === 'documentos' ? folder.addDocument(data.recordId, data.missionId) : tab === 'pessoas' ? folder.addPerson(data) : folder.addLocality(data);
        addDialog.close();
        if (filter && (filter === 'avulsas' ? Boolean(data.missionId) : data.missionId !== filter)) location.hash = workFolderUrl(data.missionId || 'avulsas', '', tab);
        else { onChange(); document.getElementById(`folder-entry-${id}`)?.querySelector('textarea')?.focus(); }
        onNotice(folder.persisted ? 'Registro adicionado à pasta de trabalho.' : saveNotice());
      } catch (error) { addForm.querySelector('[data-folder-add-feedback]').textContent = error.message; }
    });
    document.querySelectorAll('[data-folder-entry]').forEach(form => {
      form.addEventListener('submit', event => event.preventDefault());
      function save(event) {
        const feedback = form.querySelector('[data-entry-save-status]');
        try {
          const { name, value } = event.target;
          if (name === 'recordId' && value && !matchingRecords(tab).some(record => record.id === value)) throw new Error('Esta ficha não está disponível para consulta.');
          const update = tab === 'documentos' ? folder.updateDocument : tab === 'pessoas' ? folder.updatePerson : folder.updateLocality;
          update(form.dataset.folderEntry, name, value);
          feedback.textContent = saveNotice(); feedback.classList.toggle('note-save-warning', !folder.persisted);
          if (name === 'name') form.closest('article').querySelector('[data-folder-entry-title]').textContent = value.trim() || (tab === 'pessoas' ? 'Pessoa sem nome' : 'Localidade sem nome');
          if (name === 'recordId') {
            const link = form.querySelector('[data-folder-record-link]');
            link.hidden = !value;
            if (value) link.href = `#/arquivo/${value}`;
          }
          if (name === 'missionId' && filter && (filter === 'avulsas' ? Boolean(value) : filter !== value)) location.hash = workFolderUrl(value || 'avulsas', '', tab);
        } catch (error) { feedback.textContent = error.message; feedback.classList.add('note-save-warning'); }
      }
      form.querySelectorAll('input,textarea').forEach(input => input.addEventListener('input', save));
      form.querySelectorAll('select').forEach(input => input.addEventListener('change', save));
    });
    const removeDialog = document.querySelector('.folder-entry-delete-dialog');
    document.querySelectorAll('[data-remove-folder-entry]').forEach(button => button.addEventListener('click', () => { removing = { tab, id: button.dataset.removeFolderEntry }; removeDialog.showModal(); }));
    removeDialog.querySelector('[data-cancel-folder-remove]').addEventListener('click', () => removeDialog.close());
    removeDialog.querySelector('[data-confirm-folder-remove]').addEventListener('click', () => {
      if (!removing) return;
      const remove = removing.tab === 'documentos' ? folder.removeDocument : removing.tab === 'pessoas' ? folder.removePerson : folder.removeLocality;
      remove(removing.id); removing = null; removeDialog.close(); onChange();
      onNotice(folder.persisted ? 'Registro removido da pasta de trabalho.' : saveNotice());
    });
  }
  return { page, bind };
}
