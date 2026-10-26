import { createPersonalRecords, downloadPersonal, escapePersonal as esc, personalId } from './personal-records.js';
import { appendReportSources, fieldReportsKey, newFieldReport, parseFieldReport, reportFields, reportSections, reportSources, serializeFieldReport, validateFieldReport } from './field-report-model.js';
import { readAgentSheet } from './agent-sheet-model.js';
import { readAgentName } from './agent-identity.js';
import { readPersonalCredential } from './personal-credential-model.js';
import { workFolderTabs, workFolderUrl } from './work-folder-sections.js';
import logoUrl from './assets/gms-logo.png';
import './field-reports.css';

export const fieldReportUrl = (id = '', missionId = '') => workFolderUrl(missionId, '', 'relatorios') + (id ? `&relatorio=${encodeURIComponent(id)}` : '');
const longFields = new Set(['team', 'location', ...reportSections.map(([key]) => key)]);
export function fieldReportPaper(report) {
  return `<article class="report-paper"><header><img src="${logoUrl}" alt="Emblema da G.M.S." width="70" height="70"><div><strong>G.M.S.</strong><span>GLOBAL MONSTER SECURITY</span><small>DEPARTAMENTO DE DOCUMENTAÇÃO E MEMÓRIA</small></div></header><div class="report-paper-strip">RELATÓRIO DE CAMPO <b>${esc(report.access.toUpperCase())}</b></div><div class="report-paper-title"><span>${esc(report.code)}</span><h2>${esc(report.title || 'Relatório de campo')}</h2><b>${esc(report.status.toUpperCase())}</b></div><dl class="report-paper-metadata">${['author', 'registry', 'date', 'department', 'mission', 'team', 'location'].map(key => `<div><dt>${reportFields[key][0]}</dt><dd>${esc(report[key] || 'Não informado')}</dd></div>`).join('')}</dl>${reportSections.map(([key, label], index) => `<section><h3>${String(index + 1).padStart(2, '0')} / ${label}</h3><p>${esc(report[key] || 'Sem registro.')}</p></section>`).join('')}<footer><div class="report-signature">${esc(report.signature || '________________________________')}<small>IDENTIFICAÇÃO DO RESPONSÁVEL</small></div><span>GMS / ARQUIVO CENTRAL · REGISTRO PESSOAL</span></footer></article>`;
}

export function createFieldReports({ folder, getRecords, getMissions, icon, onNotice, onChange, storage }) {
  if (!storage) try { storage = globalThis.localStorage; } catch {}
  const store = createPersonalRecords(fieldReportsKey, validateFieldReport, storage);
  const notice = () => store.persisted ? 'Relatório salvo neste navegador.' : 'Relatório apenas nesta sessão. Exporte uma cópia antes de sair; o navegador não permitiu salvar.';
  let openReport, pendingImport, importEpoch = 0;
  const missions = () => getMissions().filter(record => !record.unlisted);
  function control(key) {
    const [label, max] = reportFields[key]; const value = openReport[key];
    const id = `report-${key}`;
    const select = key === 'access' ? ['Público', 'Restrito', 'Censurado'] : key === 'status' ? ['Rascunho', 'Concluído'] : null;
    return `<div class="report-field ${longFields.has(key) ? 'report-field-wide' : ''}"><label for="${id}">${label}</label>${select ? `<select id="${id}" name="${key}">${select.map(option => `<option ${value === option ? 'selected' : ''}>${option}</option>`).join('')}</select>` : longFields.has(key) ? `<textarea id="${id}" name="${key}" rows="${reportSections.some(([id]) => id === key) ? 7 : 3}" maxlength="${max}">${esc(value)}</textarea>` : `<input id="${id}" name="${key}" type="${key === 'date' ? 'date' : 'text'}" maxlength="${max}" value="${esc(value)}">`}</div>`;
  }
  function page(query, filter) {
    const items = store.reload(); const params = new URLSearchParams(query);
    const filtered = items.filter(item => !filter || (filter === 'avulsas' ? !item.missionId : item.missionId === filter));
    openReport = filtered.find(item => item.id === params.get('relatorio')) || filtered[0];
    if (openReport && params.get('relatorio') !== openReport.id) history.replaceState(null, '', fieldReportUrl(openReport.id, filter));
    return `<section class="work-folder field-reports" aria-labelledby="work-folder-title"><div class="op-section-heading"><div><span class="op-kicker">DOCUMENTAÇÃO DE CAMPO</span><h1 id="work-folder-title">Relatórios pessoais</h1><p>Reúna seus registros em um documento institucional.</p></div><div class="op-actions"><button type="button" class="op-button" data-new-field-report>${icon('file')}Novo relatório</button><button type="button" class="op-text-button" data-import-field-report>Importar relatório</button></div></div><p class="folder-storage-notice">${icon('lock')}Registros pessoais deste navegador. A conclusão de um relatório não o publica no acervo.</p>${workFolderTabs(folder.state, filter, 'relatorios', icon)}<div class="report-workspace"><aside class="report-index"><label for="report-mission-filter">Filtrar por missão</label><select id="report-mission-filter"><option value="">Todas as missões</option><option value="avulsas" ${filter === 'avulsas' ? 'selected' : ''}>Sem missão vinculada</option>${missions().map(item => `<option value="${esc(item.id)}" ${filter === item.id ? 'selected' : ''}>${esc(item.code)} · ${esc(item.title)}</option>`).join('')}${filter && filter !== 'avulsas' && !missions().some(item => item.id === filter) ? `<option selected value="${esc(filter)}">Missão indisponível</option>` : ''}</select><nav aria-label="Seus relatórios">${filtered.map(item => `<a href="${fieldReportUrl(item.id, filter)}" ${item.id === openReport?.id ? 'aria-current="page" class="selected"' : ''}><small>${esc(item.code)}</small><strong>${esc(item.title || 'Sem título')}</strong><span>${esc(item.status)} · ${esc(item.date)}</span></a>`).join('') || '<p>Nenhum relatório nesta seleção.</p>'}</nav></aside><div>${openReport ? `<div class="report-toolbar"><button type="button" class="op-button" data-report-export-pdf>${icon('external')}Exportar PDF editável</button><button type="button" class="op-text-button" data-report-preview>Visualizar documento</button><button type="button" class="op-text-button" data-report-backup>Backup JSON</button><button type="button" class="op-text-button" data-report-sources>Reunir registros da pasta</button><button type="button" class="op-text-button" data-report-delete>Excluir relatório</button></div><p role="status" class="personal-save-status" data-report-feedback>${notice()}</p><form class="field-report-editor"><fieldset><legend>01 / Identificação do documento</legend><div class="report-fields">${['code', 'title', 'author', 'registry', 'date', 'department', 'access', 'status'].map(control).join('')}<div class="report-field report-field-wide"><label for="report-missionId">Missão vinculada</label><select id="report-missionId" name="missionId"><option value="">Sem missão vinculada</option>${missions().map(item => `<option value="${esc(item.id)}" ${openReport.missionId === item.id ? 'selected' : ''}>${esc(item.code)} · ${esc(item.title)}</option>`).join('')}${openReport.missionId && !missions().some(item => item.id === openReport.missionId) ? `<option selected value="${esc(openReport.missionId)}">Missão indisponível</option>` : ''}</select></div>${['mission', 'team', 'location'].map(control).join('')}</div></fieldset><fieldset><legend>02 / Corpo do relatório</legend><p class="op-local-note">Separe observações verificadas de interpretações. Os registros selecionados são copiados integralmente para a seção escolhida.</p>${reportSections.map(([key]) => control(key)).join('')}</fieldset><fieldset><legend>03 / Responsabilidade</legend>${control('signature')}<p class="op-local-note">Identificação narrativa do responsável. A classificação não cria uma permissão de acesso.</p></fieldset></form>` : `<div class="op-empty"><h2>Prepare seu primeiro relatório</h2><p>Escolha uma missão, registre o que aconteceu e reúna as evidências da sua pasta.</p><button type="button" class="op-button" data-new-field-report>Novo relatório</button></div>`}</div></div>
    <dialog class="personal-dialog report-new-dialog" aria-labelledby="report-new-title"><div class="folder-dialog-heading"><h2 id="report-new-title">Abrir relatório de campo</h2><button type="button" class="op-text-button" data-close-personal-dialog>Fechar</button></div><form><label for="new-report-mission">Missão</label><select id="new-report-mission" name="missionId"><option value="">Relatório avulso</option>${missions().map(item => `<option value="${esc(item.id)}" ${item.id === filter || (!filter && item.id === folder.state.missionId) ? 'selected' : ''}>${esc(item.code)} · ${esc(item.title)}</option>`).join('')}</select><button type="submit" class="op-button">Criar relatório</button><p role="status"></p></form></dialog>
    <dialog class="personal-dialog report-import-dialog" aria-labelledby="report-import-title"><div class="folder-dialog-heading"><h2 id="report-import-title">Importar relatório</h2><button type="button" class="op-text-button" data-close-personal-dialog>Fechar</button></div><p>Use o PDF editável ou o JSON de um relatório exportado por este site. Uma nova cópia será criada; seus relatórios atuais serão preservados.</p><p class="op-local-note">PDFs digitalizados, achatados e documentos de outros modelos não têm os campos necessários.</p><label for="report-import-file">Arquivo do relatório</label><input id="report-import-file" type="file" accept=".pdf,.json,application/pdf,application/json"><p role="status" data-report-import-feedback></p><div data-report-import-summary></div><button type="button" class="op-button" data-confirm-report-import disabled>Importar como nova cópia</button></dialog>
    <dialog class="personal-dialog report-source-dialog" aria-labelledby="report-source-title"><div class="folder-dialog-heading"><h2 id="report-source-title">Reunir registros da pasta</h2><button type="button" class="op-text-button" data-close-personal-dialog>Fechar</button></div><p>Selecione os registros que deseja copiar. O conteúdo será acrescentado ao texto existente.</p><form><label for="report-source-section">Seção de destino</label><select id="report-source-section" name="section">${reportSections.map(([key, label]) => `<option value="${key}" ${key === 'findings' ? 'selected' : ''}>${label}</option>`).join('')}</select><div class="report-source-list"></div><p role="status" data-report-source-feedback></p><button type="submit" class="op-button">Acrescentar ao relatório</button></form></dialog>
    <dialog class="personal-dialog report-preview-dialog" aria-label="Prévia do relatório"><div class="folder-dialog-heading"><h2>Prévia do documento</h2><button type="button" class="op-text-button" data-close-personal-dialog>Fechar</button></div><div data-report-paper></div></dialog>
    <dialog class="personal-dialog report-delete-dialog" aria-labelledby="report-delete-title"><h2 id="report-delete-title">Excluir este relatório pessoal?</h2><p>Exporte uma cópia se quiser guardá-lo. Os documentos e as notas usados para montá-lo serão preservados.</p><div class="op-actions"><button type="button" class="op-button" data-close-personal-dialog>Cancelar</button><button type="button" class="op-button" data-confirm-report-delete>Excluir relatório</button></div><p role="status"></p></dialog></section>`;
  }
  function bind() {
    const root = document.querySelector('.field-reports'); if (!root) return;
    const params = new URLSearchParams(location.hash.split('?')[1]); const filter = params.get('missao') || '';
    const feedback = root.querySelector('[data-report-feedback]');
    const say = (message, error = false) => { if (feedback) { feedback.textContent = message; feedback.classList.toggle('personal-warning', error); } };
    root.querySelectorAll('[data-close-personal-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
    root.querySelector('#report-mission-filter').addEventListener('change', event => { location.hash = fieldReportUrl('', event.target.value); });
    const newDialog = root.querySelector('.report-new-dialog');
    root.querySelectorAll('[data-new-field-report]').forEach(button => button.addEventListener('click', () => newDialog.showModal()));
    newDialog.querySelector('form').addEventListener('submit', event => {
      event.preventDefault();
      try {
        const mission = missions().find(item => item.id === newDialog.querySelector('select').value);
        const fields = readAgentSheet(storage).fields;
        const credential = readPersonalCredential(storage);
        const item = store.add(newFieldReport({ mission, author: credential?.name || fields.nome || readAgentName(storage), registry: credential?.registry || '' }));
        newDialog.close(); location.hash = fieldReportUrl(item.id, mission?.id || ''); onNotice(notice());
      } catch (error) { newDialog.querySelector('[role="status"]').textContent = error.message; }
    });
    const importDialog = root.querySelector('.report-import-dialog');
    const confirmImport = root.querySelector('[data-confirm-report-import]');
    const importFeedback = root.querySelector('[data-report-import-feedback]');
    root.querySelector('[data-import-field-report]').addEventListener('click', () => { pendingImport = null; confirmImport.disabled = true; importFeedback.textContent = ''; root.querySelector('#report-import-file').value = ''; root.querySelector('[data-report-import-summary]').textContent = ''; importDialog.showModal(); });
    importDialog.addEventListener('close', () => { importEpoch++; pendingImport = null; });
    root.querySelector('#report-import-file').addEventListener('change', async event => {
      const epoch = ++importEpoch; pendingImport = null; confirmImport.disabled = true;
      root.querySelector('[data-report-import-summary]').textContent = '';
      const file = event.target.files[0]; if (!file) return;
      importFeedback.textContent = 'Lendo o documento…';
      try {
        const pdf = /\.pdf$/i.test(file.name) || file.type === 'application/pdf';
        if (file.size > (pdf ? 12 : 2) * 1024 * 1024) throw new Error(`O arquivo ultrapassa ${pdf ? 12 : 2} MB.`);
        const item = pdf ? await (await import('./field-report-pdf.js')).readFieldReportPdf(await file.arrayBuffer()) : parseFieldReport(await file.text());
        if (epoch !== importEpoch || !importDialog.open || !root.isConnected) return;
        pendingImport = item; root.querySelector('[data-report-import-summary]').textContent = `${item.code} · ${item.title} · ${item.author || 'Autoria não informada'}`;
        importFeedback.textContent = 'Documento compatível. Confira a identificação antes de importar.'; confirmImport.disabled = false;
      } catch (error) { if (epoch === importEpoch && root.isConnected) importFeedback.textContent = error.message; }
    });
    confirmImport.addEventListener('click', () => {
      if (!pendingImport) return;
      try {
        const now = new Date().toISOString(); const item = store.add({ ...pendingImport, id: personalId(), createdAt: now, updatedAt: now });
        importDialog.close(); location.hash = fieldReportUrl(item.id); onNotice(`Cópia importada. ${notice()}`);
      } catch (error) { importFeedback.textContent = error.message; }
    });
    if (!openReport) return;
    // A base de cada campo só avança quando sua gravação termina com sucesso.
    let base = structuredClone(openReport); const invalid = new Set();
    const form = root.querySelector('.field-report-editor');
    form.addEventListener('submit', event => event.preventDefault());
    function saveControl(event) {
      const { name, value } = event.target;
      try {
        const patch = { [name]: value }; const expected = { [name]: base[name] };
        if (name === 'missionId') { const mission = missions().find(item => item.id === value); patch.mission = mission ? `${mission.code} · ${mission.title}` : ''; expected.mission = base.mission; }
        const item = store.update(openReport.id, patch, expected);
        for (const key of Object.keys(patch)) base[key] = item[key];
        openReport = item; invalid.delete(name); event.target.removeAttribute('aria-invalid');
        if (name === 'missionId') form.elements.namedItem('mission').value = item.mission;
        say(notice(), !store.persisted);
        const link = root.querySelector('.report-index a[aria-current]');
        if (link) { link.querySelector('small').textContent = item.code; link.querySelector('strong').textContent = item.title || 'Sem título'; link.querySelector('span').textContent = `${item.status} · ${item.date}`; }
      } catch (error) { invalid.add(name); event.target.setAttribute('aria-invalid', 'true'); say(error.message, true); }
    }
    form.querySelectorAll('input,textarea').forEach(input => input.addEventListener('input', saveControl));
    form.querySelectorAll('select').forEach(input => input.addEventListener('change', saveControl));
    const current = () => { if (invalid.size) throw new Error('Revise os campos destacados antes de exportar ou reunir registros. Seu texto continua no editor.'); const item = store.reload().find(item => item.id === openReport.id); if (!item) throw new Error('O relatório foi removido em outra aba.'); return item; };
    root.querySelector('[data-report-backup]').addEventListener('click', () => { try { const item = current(); downloadPersonal(new Blob([serializeFieldReport(item)], { type: 'application/json' }), 'GMS-relatorio.json'); say('Cópia JSON preparada.'); } catch (error) { say(error.message, true); } });
    root.querySelector('[data-report-export-pdf]').addEventListener('click', async event => {
      const button = event.currentTarget; button.disabled = true;
      try { const item = current(); say('Preparando o documento editável…'); const { createFieldReportPdf } = await import('./field-report-pdf.js'); const bytes = await createFieldReportPdf(item, { getLogo: async () => { const response = await fetch(logoUrl); if (!response.ok) throw new Error('Não foi possível carregar o emblema.'); return response.arrayBuffer(); } }); downloadPersonal(new Blob([bytes], { type: 'application/pdf' }), `GMS-${item.code.replace(/[^A-Za-z0-9_-]/g, '-') || 'relatorio'}.pdf`); say('PDF preparado. Guarde o arquivo editável para importá-lo novamente.'); } catch (error) { say(error.message, true); } finally { button.disabled = false; }
    });
    root.querySelector('[data-report-preview]').addEventListener('click', () => { try { root.querySelector('[data-report-paper]').innerHTML = fieldReportPaper(current()); root.querySelector('.report-preview-dialog').showModal(); } catch (error) { say(error.message, true); } });
    const sourceDialog = root.querySelector('.report-source-dialog'); let sources = [];
    root.querySelector('[data-report-sources]').addEventListener('click', () => {
      try {
        const item = current(); folder.reload(); sources = reportSources(folder.state, getRecords(), item.missionId || 'avulsas');
        root.querySelector('.report-source-list').innerHTML = sources.map(source => `<label><input type="checkbox" name="source" value="${esc(source.id)}"><span><small>${esc(source.label)}</small><strong>${esc(source.title)}</strong><span>${esc(source.text.slice(0, 220))}</span></span></label>`).join('') || '<p>Nenhum registro na pasta para esta missão. Adicione notas, documentos, pessoas ou localidades primeiro.</p>';
        root.querySelector('[data-report-source-feedback]').textContent = ''; sourceDialog.showModal();
      } catch (error) { say(error.message, true); }
    });
    sourceDialog.querySelector('form').addEventListener('submit', event => {
      event.preventDefault();
      try {
        const selected = [...sourceDialog.querySelectorAll('input:checked')].map(input => sources.find(source => source.id === input.value));
        if (!selected.length) throw new Error('Selecione pelo menos um registro.');
        const key = sourceDialog.querySelector('select').value;
        const item = store.update(openReport.id, { [key]: appendReportSources(base[key], selected) }, { [key]: base[key] });
        base[key] = item[key]; openReport = item; form.elements.namedItem(key).value = item[key];
        sourceDialog.close(); say(`${selected.length} registro(s) acrescentado(s). ${notice()}`, !store.persisted);
      } catch (error) { root.querySelector('[data-report-source-feedback]').textContent = error.message; }
    });
    const deleteDialog = root.querySelector('.report-delete-dialog'); let deleting;
    root.querySelector('[data-report-delete]').addEventListener('click', () => { deleting = store.reload().find(item => item.id === openReport.id); deleteDialog.showModal(); });
    root.querySelector('[data-confirm-report-delete]').addEventListener('click', () => {
      try { store.remove(openReport.id, deleting); deleteDialog.close(); location.hash = fieldReportUrl('', filter); onChange(); onNotice('Relatório pessoal removido.'); } catch (error) { deleteDialog.querySelector('[role="status"]').textContent = error.message; }
    });
  }
  return { page, bind, reload: store.reload };
}
