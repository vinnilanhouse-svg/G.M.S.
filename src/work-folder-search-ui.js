import { folderSearchExcerpt, folderSearchKinds, folderSearchUrl, folderTagOptions, normalizeFolderText, searchWorkFolder } from './work-folder-search.js';
import { folderTagChips } from './folder-tags-ui.js';
import { bindFolderNavigation, workFolderTabs } from './work-folder-sections.js';
import './work-folder-search.css';
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export function folderSearchShortcut(filter, icon) {
  return `<form class="folder-search-shortcut" data-folder-search-shortcut><label for="folder-quick-query">${icon('search')}Buscar na pasta</label><div><input type="search" id="folder-quick-query" name="q" maxlength="200" placeholder="Pesquisar suas notas e registros…"><input type="hidden" name="missao" value="${esc(filter)}"><button class="op-button" type="submit">Buscar</button></div></form>`;
}
export function bindFolderSearchShortcuts() {
  document.querySelectorAll('[data-folder-search-shortcut]').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault(); location.hash = folderSearchUrl({ query: form.elements.q.value, missionId: form.elements.missao.value });
  }));
}

export function createWorkFolderSearch({ folder, getRecords, getMissions, icon, renderTransfer }) {
  let cancel = () => {};
  const results = options => {
    const list = searchWorkFolder(folder.state, getRecords(), options);
    return `<p class="folder-search-count" role="status">${list.length} ${list.length === 1 ? 'registro encontrado' : 'registros encontrados'} nesta pasta</p>${list.length ? `<ul class="folder-search-results">${list.map(entry => `<li><div class="folder-search-result-meta"><span>${esc(folderSearchKinds[entry.kind])}</span><time datetime="${esc(entry.updatedAt)}">${esc(new Date(entry.updatedAt).toLocaleDateString('pt-BR'))}</time></div><h3><a href="${esc(entry.url)}">${esc(entry.title)} ${icon('arrow')}</a></h3>${entry.subtitle ? `<p class="folder-search-subtitle">${esc(entry.subtitle)}</p>` : ''}${entry.body ? `<p class="folder-search-excerpt">${esc(folderSearchExcerpt(entry.body, options.query))}</p>` : ''}${folderTagChips(entry.tags, options.missionId)}</li>`).join('')}</ul>` : `<div class="op-empty folder-search-empty">${icon('search')}<h3>Nenhum registro encontrado.</h3><p>Tente outro texto ou altere os filtros. A busca considera somente os registros da sua pasta de trabalho.</p></div>`}`;
  };
  function page(query) {
    const params = new URLSearchParams(query);
    const options = { query: (params.get('q') || '').slice(0, 200), missionId: params.get('missao') || '', tag: params.get('etiqueta') || '', kind: Object.hasOwn(folderSearchKinds, params.get('tipo')) ? params.get('tipo') : '' };
    const missions = getMissions(); const tags = folderTagOptions(folder.state, options.missionId);
    options.tag = tags.find(tag => normalizeFolderText(tag) === normalizeFolderText(options.tag)) || options.tag;
    return `<section class="work-folder folder-search-page" aria-labelledby="work-folder-title"><div class="op-section-heading"><div><span class="op-kicker">ARQUIVO PESSOAL DO AGENTE</span><h1 id="work-folder-title">Pasta de trabalho</h1><p>Encontre suas pistas, contatos e observações.</p></div></div>${renderTransfer(options.missionId)}<p class="folder-storage-notice">${icon('lock')}Esta busca consulta os registros pessoais salvos neste navegador.</p>${workFolderTabs(folder.state, options.missionId, 'busca', icon)}<h2>Buscar na pasta</h2><p class="folder-search-help">Pesquise títulos, textos, códigos, pessoas, referências e etiquetas. A busca também consulta objetivos, pendências e ligações entre evidências.</p><form class="folder-search-form" data-folder-search-form><label for="folder-search-query">O que você procura?</label><div class="folder-search-query-row"><input id="folder-search-query" type="search" name="q" maxlength="200" value="${esc(options.query)}" placeholder="Ex.: Vigília, Rá, rádio, coordenadas…"><button type="submit" class="op-button">${icon('search')}Buscar</button></div><div class="folder-search-filters"><div><label for="folder-search-mission">Missão</label><select id="folder-search-mission" name="missao"><option value="">Todas as missões</option><option value="avulsas" ${options.missionId === 'avulsas' ? 'selected' : ''}>Sem missão vinculada</option>${missions.map(mission => `<option value="${esc(mission.id)}" ${mission.id === options.missionId ? 'selected' : ''}>${esc(mission.code)} · ${esc(mission.title)}</option>`).join('')}${options.missionId && options.missionId !== 'avulsas' && !missions.some(item => item.id === options.missionId) ? `<option selected value="${esc(options.missionId)}">Missão indisponível</option>` : ''}</select></div><div><label for="folder-search-kind">Tipo de registro</label><select id="folder-search-kind" name="tipo"><option value="">Todos os tipos</option>${Object.entries(folderSearchKinds).map(([key, label]) => `<option value="${key}" ${options.kind === key ? 'selected' : ''}>${label}</option>`).join('')}</select></div><div><label for="folder-search-tag">Etiqueta</label><select id="folder-search-tag" name="etiqueta"><option value="">Todas as etiquetas</option>${tags.map(tag => `<option ${tag === options.tag ? 'selected' : ''}>${esc(tag)}</option>`).join('')}${options.tag && !tags.includes(options.tag) ? `<option selected>${esc(options.tag)}</option>` : ''}</select></div></div><button type="button" class="op-text-button" data-clear-folder-search>Limpar busca e filtros</button></form><div data-folder-search-results>${results(options)}</div></section>`;
  }
  function bind() {
    cancel(); const form = document.querySelector('[data-folder-search-form]'); if (!form) return;
    let timer;
    cancel = () => clearTimeout(timer);
    const options = () => ({ query: form.elements.q.value, missionId: form.elements.missao.value, kind: form.elements.tipo.value, tag: form.elements.etiqueta.value });
    function update({ missionChanged = false } = {}) {
      clearTimeout(timer); folder.reload();
      if (missionChanged) {
        const selected = form.elements.etiqueta.value; const tags = folderTagOptions(folder.state, form.elements.missao.value);
        form.elements.etiqueta.innerHTML = '<option value="">Todas as etiquetas</option>' + tags.map(tag => `<option>${esc(tag)}</option>`).join('');
        const matching = tags.find(tag => normalizeFolderText(tag) === normalizeFolderText(selected));
        if (matching) form.elements.etiqueta.value = matching;
      }
      history.replaceState(null, '', folderSearchUrl(options()));
      document.querySelector('[data-folder-search-results]').innerHTML = results(options());
      // Os atalhos de aba preservam a missão escolhida no formulário.
      const nav = document.querySelector('.folder-navigation');
      if (nav) { nav.outerHTML = workFolderTabs(folder.state, form.elements.missao.value, 'busca', icon); bindFolderNavigation(); }
      const scope = document.querySelector('#folder-export-scope'); const missionId = form.elements.missao.value;
      if (scope) scope.innerHTML = '<option value="">Pasta completa</option>' + (missionId ? `<option value="${esc(missionId)}">${missionId === 'avulsas' ? 'Somente registros sem missão vinculada' : 'Somente registros da missão selecionada'}</option>` : '');
    }
    form.addEventListener('submit', event => { event.preventDefault(); update(); });
    form.elements.q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(update, 160); });
    form.querySelectorAll('select').forEach(select => select.addEventListener('change', () => update({ missionChanged: select.name === 'missao' })));
    form.querySelector('[data-clear-folder-search]').addEventListener('click', () => {
      for (const input of form.querySelectorAll('input,select')) input.value = '';
      update({ missionChanged: true }); form.elements.q.focus();
    });
  }
  return { page, bind };
}
