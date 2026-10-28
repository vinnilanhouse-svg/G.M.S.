import { createWorkFolder, operationalMissions } from './work-folder.js';
import { bindFolderNavigation, createWorkFolderSections, workFolderTabs, workFolderUrl as folderUrl } from './work-folder-sections.js';
import { createWorkFolderTrash } from './work-folder-trash.js';
import './work-folder-navigation.css';
import './work-folder-simple.css';
import { createWorkFolderTransfer } from './work-folder-transfer.js';
import { createMissionProgress } from './mission-progress.js';
import { createEvidenceBoard } from './evidence-board.js';
import { bindNoteIllustrationControls, noteIllustrationControl } from './note-illustration-picker.js';
import { getEvidenceIllustration, noteIllustrations } from './evidence-illustrations.js';
import { bindFolderSearchShortcuts, createWorkFolderSearch, folderSearchShortcut } from './work-folder-search-ui.js';
import { folderTagsField } from './folder-tags-ui.js';
import { parseFolderTags } from './work-folder-search.js';
import { createFieldReports, fieldReportUrl } from './field-reports.js';
import { createMissionWorkspace } from './mission-workspace.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const noteTitle = note => note.title.trim() || 'Anotação sem título';
const noteDate = value => new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export function createOperationalPanel({ getRecords, icon, onNotice, onChange, storage }) {
  if (!storage) try { storage = globalThis.localStorage; } catch {}
  const folder = createWorkFolder(storage);
  let focusNewNote = false;
  const context = () => operationalMissions(getRecords());
  const selectedMission = () => context().missions.find(mission => mission.id === folder.state.missionId);
  const status = mission => `<span class="operation-status ${mission.status === 'Contato perdido' ? 'operation-status-alert' : ''}"><i></i>${esc(mission.status)}</span>`;
  const options = selected => `<option value="">Sem missão vinculada</option>${context().missions.map(mission => `<option value="${esc(mission.id)}" ${selected === mission.id ? 'selected' : ''}>${esc(mission.code)} · ${esc(mission.title)}</option>`).join('')}`;
  const memoryNotice = () => folder.persisted ? 'Salvo neste navegador.' : 'Armazenamento indisponível. As alterações estão apenas nesta sessão; copie seus registros antes de sair.';
  function announce(message) { onNotice(folder.persisted ? message : memoryNotice()); }
  const folderTransfer = createWorkFolderTransfer({ folder, getRecords, icon, onNotice, onChange });
  const folderTools = filter => `<div class="folder-tools-row">${folderSearchShortcut(filter, icon)}${folderTransfer.render(filter)}</div>`;
  const folderSearch = createWorkFolderSearch({ folder, getRecords, getMissions: () => context().missions, icon, renderTransfer: folderTransfer.render });
  const missionProgress = createMissionProgress({ folder, getMissions: () => context().missions, icon, renderTransfer: folderTools, onChange, onNotice });
  const folderSections = createWorkFolderSections({ folder, getRecords, getMissions: () => context().missions, icon, onNotice, onChange, renderTransfer: folderTools });
  const evidenceBoard = createEvidenceBoard({ folder, getRecords, getMissions: () => context().missions, icon, onNotice, onChange, renderTransfer: folderTools });
  const folderTrash = createWorkFolderTrash({ folder, getMissions: () => context().missions, icon, onNotice, onChange, renderTransfer: folderTools });
  const fieldReports = createFieldReports({ folder, getRecords, getMissions: () => context().missions, icon, onNotice, onChange, storage, renderTransfer: folderTools });
  const missionWorkspace = createMissionWorkspace({ folder, getRecords, reports: fieldReports, icon, onChange, onNotice });

  function missionAction(mission) {
    const selected = selectedMission()?.id === mission.id;
    return `<button type="button" class="op-button ${selected ? 'op-button-muted' : ''}" data-follow-mission="${esc(mission.id)}" ${selected ? 'disabled' : ''}>${icon(selected ? 'bookmark' : 'flag')}${selected ? 'Em acompanhamento' : 'Acompanhar missão'}</button>`;
  }

  function dashboard() {
    folder.reload();
    const { active, closed } = context();
    const mission = selectedMission();
    const missionNotes = folder.state.notes.filter(note => note.missionId === mission?.id);
    const notes = [...folder.state.notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return `<section class="operational-panel" aria-labelledby="operational-title">
      <div class="op-section-heading"><div><span class="op-kicker">COORDENAÇÃO DE CAMPO</span><h2 id="operational-title">Painel operacional</h2></div><a class="op-link" href="#/missoes">Todas as missões ${icon('arrow')}</a></div>
      <div class="op-summary"><span><b>${String(active.length).padStart(2, '0')}</b> operações abertas</span><span><b>${String(closed.length).padStart(2, '0')}</b> encerradas no acervo</span><span>${icon('clipboard')}Situação conforme os registros</span></div>
      <div class="op-layout"><div class="op-mission-list">${active.length ? active.map(item => {
        const team = item.profile?.find(field => field.label === 'Equipe');
        return `<article class="op-mission ${item.status === 'Contato perdido' ? 'op-mission-alert' : ''}"><div class="op-card-meta"><span>${esc(item.code)}</span>${status(item)}</div><h3><a href="#/arquivo/${esc(item.id)}">${esc(item.title)}</a></h3>${team ? `<p class="op-team">Equipe ${esc(team.value)}</p>` : ''}<p>${esc(item.summary)}</p><div class="op-actions"><a class="op-link" href="#/arquivo/${esc(item.id)}">Consultar ordem ${icon('arrow')}</a>${missionAction(item)}</div></article>`;
      }).join('') : '<div class="op-empty"><h3>Nenhuma operação aberta</h3><p>As ordens anteriores continuam disponíveis no arquivo de missões.</p></div>'}</div>
      <aside class="my-mission" aria-labelledby="my-mission-title"><span class="op-kicker">ACOMPANHAMENTO PESSOAL</span><h3 id="my-mission-title">Sua missão</h3>${mission ? `<div class="op-card-meta"><span>${esc(mission.code)}</span>${status(mission)}</div><h4><a href="#/arquivo/${esc(mission.id)}">${esc(mission.title)}</a></h4><p>${esc(mission.summary)}</p><a class="op-button continue-mission" href="${missionWorkspace.currentUrl()}">Continuar minha missão ${icon('arrow')}</a><div class="my-mission-links"><a href="#/arquivo/${esc(mission.id)}">${icon('flag')}Ordem de missão ${icon('arrow')}</a><a href="#/missoes/relatorios?missao=${encodeURIComponent(mission.id)}">${icon('clipboard')}Relatórios ${icon('arrow')}</a><a href="${folderUrl(mission.id)}">${icon('folder')}Anotações da missão <span>${missionNotes.length}</span></a></div>${missionProgress.summary(mission.id)}` : `<div class="my-mission-empty">${icon('flag')}<p>Nenhuma missão em acompanhamento.</p><p>Escolha a operação que está acompanhando para reunir seus documentos e anotações aqui.</p></div>`}<label for="personal-mission">${mission ? 'Trocar missão' : 'Selecionar missão'}</label><select id="personal-mission" data-personal-mission>${options(mission?.id || '')}</select>${mission ? '<button type="button" class="op-text-button" data-unfollow-mission>Remover do acompanhamento</button>' : ''}<p class="op-local-note">Sua seleção fica salva neste navegador.</p></aside></div>
    </section>
    <section class="work-folder-preview" aria-labelledby="folder-preview-title"><div class="op-section-heading"><div><span class="op-kicker">CADERNO PESSOAL</span><h2 id="folder-preview-title">Pasta de trabalho</h2></div><a class="op-link" href="${folderUrl()}">Abrir pasta ${icon('arrow')}</a></div><div class="folder-preview-content"><div><p>Observações de campo, pistas e perguntas para a próxima etapa.</p>${notes.length ? `<ul>${notes.slice(0, 3).map(note => `<li><a href="${folderUrl('', note.id)}">${icon('file')}<span>${esc(noteTitle(note))}</span>${icon('arrow')}</a></li>`).join('')}</ul>` : '<p class="op-local-note">Nenhuma anotação registrada. Seu caderno começa aqui.</p>'}</div><button type="button" class="op-button" data-new-work-note>${icon('file')}Nova anotação</button></div><p class="op-local-note">${folder.state.notes.length} ${folder.state.notes.length === 1 ? 'anotação' : 'anotações'} · Caderno pessoal salvo neste navegador.</p></section>`;
  }

  function missionTools(mission) {
    return `<div class="mission-personal-tools"><div>${icon('folder')}<span>Seu acompanhamento</span></div><div class="op-actions">${missionAction(mission)}<a class="op-link" href="${folderUrl(mission.id, '', 'andamento')}">Andamento pessoal ${icon('arrow')}</a><a class="op-link" href="${folderUrl(mission.id)}">Anotações desta missão ${icon('arrow')}</a><a class="op-link" href="${fieldReportUrl('', mission.id)}">Montar relatório ${icon('arrow')}</a></div></div>`;
  }

  function page(query) {
    folder.reload();
    const params = new URLSearchParams(query);
    const filter = params.get('missao') || '';
    if (params.get('aba') === 'relatorios') return fieldReports.page(query, filter);
    if (params.get('aba') === 'busca') return folderSearch.page(query);
    if (params.get('aba') === 'lixeira') return folderTrash.page(filter);
    if (params.get('aba') === 'andamento') return missionProgress.page(query);
    if (params.get('aba') === 'evidencias') return evidenceBoard.page(filter);
    const sectionPage = folderSections.page(params.get('aba'), filter);
    if (sectionPage) return sectionPage;
    const missions = context().missions;
    const filtered = folder.state.notes.filter(note => !filter || (filter === 'avulsas' ? !note.missionId : note.missionId === filter)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const note = filtered.find(item => item.id === params.get('nota')) || filtered[0];
    // Fixe a nota aberta para que uma nova anotação de outra aba não troque o editor.
    if (note && note.id !== params.get('nota')) history.replaceState(null, '', folderUrl(filter, note.id));
    const linkedMission = missions.find(mission => mission.id === note?.missionId);
    const knownFilter = filter === 'avulsas' || missions.some(mission => mission.id === filter);
    return `<section class="work-folder" aria-labelledby="work-folder-title"><div class="op-section-heading"><div><span class="op-kicker">ARQUIVO PESSOAL DO AGENTE</span><h1 id="work-folder-title">Pasta de trabalho</h1><p>Suas notas, referências e relatórios.</p></div><button type="button" class="op-button" data-new-work-note>${icon('file')}Nova anotação</button></div>${folderTools(filter)}<p class="folder-storage-notice">${icon('lock')}Registros pessoais, salvos apenas neste navegador. ${folder.persisted ? '' : esc(memoryNotice())}</p>
      ${workFolderTabs(folder.state, filter, 'anotacoes', icon)}
      <div class="folder-layout"><aside class="folder-index" aria-label="Índice de anotações"><details class="folder-mission-filter"><summary>Missão: <span>${esc(missions.find(mission => mission.id === filter)?.code || (filter === 'avulsas' ? 'sem vínculo' : filter ? 'indisponível' : 'todas'))}</span></summary><label for="folder-filter">Filtrar por missão</label><select id="folder-filter" data-folder-filter><option value="">Todas as anotações</option><option value="avulsas" ${filter === 'avulsas' ? 'selected' : ''}>Sem missão vinculada</option>${missions.map(mission => `<option value="${esc(mission.id)}" ${filter === mission.id ? 'selected' : ''}>${esc(mission.code)} · ${esc(mission.title)}</option>`).join('')}${filter && !knownFilter ? '<option selected value="indisponivel">Missão indisponível</option>' : ''}</select></details><div class="folder-mobile-notes"><label for="folder-note-picker">Anotação aberta</label><select id="folder-note-picker" data-folder-note-picker>${filtered.map(item => `<option value="${esc(folderUrl(filter, item.id))}" ${item.id === note?.id ? 'selected' : ''}>${esc(noteTitle(item))}</option>`).join('') || '<option>Nenhuma anotação</option>'}</select></div><p class="folder-count">${filtered.length} ${filtered.length === 1 ? 'ANOTAÇÃO' : 'ANOTAÇÕES'}</p><nav class="folder-notes" aria-label="Anotações">${filtered.map(item => `<a href="${folderUrl(filter, item.id)}" class="folder-note ${item.id === note?.id ? 'selected' : ''}" ${item.id === note?.id ? 'aria-current="true"' : ''} data-note-link="${esc(item.id)}"><strong>${esc(noteTitle(item))}</strong><span>${esc(missions.find(mission => mission.id === item.missionId)?.code || (item.missionId ? 'Missão indisponível' : 'Anotação avulsa'))}</span><time datetime="${esc(item.updatedAt)}">${esc(noteDate(item.updatedAt))}</time></a>`).join('') || '<p class="folder-no-notes">Nenhuma anotação nesta pasta.</p>'}</nav><a class="op-link folder-saved-link" href="#/favoritos">${icon('bookmark')}Consultar arquivos salvos ${icon('arrow')}</a></aside>
      ${note ? `<form class="note-editor" data-work-note="${esc(note.id)}"><div class="note-editor-heading"><span class="op-kicker">ANOTAÇÃO DE CAMPO</span><span role="status" class="note-save-status" data-note-status>${esc(memoryNotice())}</span></div><label for="note-title">Título da anotação</label><input id="note-title" name="title" maxlength="120" placeholder="Dê um título à anotação" value="${esc(note.title)}" autocomplete="off"><label for="note-body">Suas anotações</label><textarea id="note-body" name="body" maxlength="20000" placeholder="Registre pistas, observações, hipóteses e questões em aberto…">${esc(note.body)}</textarea><details class="folder-note-extras"><summary>Imagens e organização</summary><div><label for="note-mission">Missão vinculada</label><select id="note-mission" name="missionId">${options(note.missionId)}${note.missionId && !linkedMission ? '<option selected value="indisponivel">Missão indisponível</option>' : ''}</select><a class="op-link note-mission-link" data-note-mission-link ${linkedMission ? `href="#/arquivo/${esc(linkedMission.id)}"` : 'hidden'}>Consultar ordem de missão ${icon('arrow')}</a>${noteIllustrationControl(note, { noteId: note.id })}${folderTagsField(note, 'note')}</div></details><div class="note-editor-foot"><span data-note-length>${note.body.length.toLocaleString('pt-BR')} / 20.000 caracteres</span><span data-note-save-mode>${folder.persisted ? 'Alterações salvas automaticamente' : 'Rascunho somente nesta sessão'}</span></div><details class="folder-action-menu note-editor-actions"><summary>Opções da anotação</summary><div class="folder-options-menu"><button type="button" data-download-work-note>${icon('file')}Baixar anotação</button><button type="button" data-delete-work-note>Enviar para a lixeira</button></div></details></form>` : `<div class="op-empty folder-empty">${icon('folder')}<h2>Seu caderno está aberto.</h2><p>Crie uma anotação para registrar suas observações${filter && knownFilter && filter !== 'avulsas' ? ' sobre esta missão' : ''}.</p><button type="button" class="op-button" data-new-work-note>Nova anotação</button></div>`}</div>
      <dialog class="note-delete-dialog" aria-labelledby="note-delete-title"><h2 id="note-delete-title">Enviar esta anotação para a lixeira?</h2><p>Você poderá restaurar o texto, as imagens e suas ligações pela seção Lixeira.</p><div class="op-actions"><button type="button" class="op-button" data-cancel-note-delete>Manter anotação</button><button type="button" class="op-button" data-confirm-note-delete>Enviar para a lixeira</button></div></dialog></section>`;
  }

  function bind() {
    folderTransfer.bind();
    missionWorkspace.bind();
    fieldReports.bind();
    bindFolderNavigation();
    folderTrash.bind();
    missionProgress.bind();
    evidenceBoard.bind();
    folderSearch.bind();
    bindFolderSearchShortcuts();
    document.querySelectorAll('[data-follow-mission]').forEach(button => button.addEventListener('click', () => {
      if (!context().missions.some(mission => mission.id === button.dataset.followMission)) return;
      folder.selectMission(button.dataset.followMission); onChange(); announce('Missão adicionada ao seu acompanhamento.');
    }));
    document.querySelector('[data-personal-mission]')?.addEventListener('change', event => {
      if (event.target.value && !context().missions.some(mission => mission.id === event.target.value)) return;
      folder.selectMission(event.target.value); onChange(); announce(event.target.value ? 'Missão em acompanhamento atualizada.' : 'Acompanhamento removido.');
    });
    document.querySelector('[data-unfollow-mission]')?.addEventListener('click', () => {
      folder.selectMission(''); onChange(); announce('Acompanhamento removido. Suas anotações foram preservadas.');
    });
    const params = new URLSearchParams(location.hash.split('?')[1]);
    const filter = params.get('missao') || '';
    const tab = ['documentos', 'pessoas', 'localidades', 'evidencias', 'lixeira'].includes(params.get('aba')) ? params.get('aba') : 'anotacoes';
    document.querySelectorAll('[data-new-work-note]').forEach(button => button.addEventListener('click', () => {
      const missionId = context().missions.some(mission => mission.id === filter) ? filter : filter === 'avulsas' ? '' : selectedMission()?.id || '';
      const id = folder.addNote(missionId);
      focusNewNote = true;
      location.hash = folderUrl(filter === 'avulsas' || context().missions.some(mission => mission.id === filter) ? filter : '', id);
      if (!folder.persisted) onNotice(memoryNotice());
    }));
    document.querySelector('[data-folder-filter]')?.addEventListener('change', event => { location.hash = folderUrl(event.target.value, '', tab); });
    folderSections.bind();
    const form = document.querySelector('[data-work-note]');
    if (!form) return;
    const id = form.dataset.workNote;
    document.querySelector('[data-folder-note-picker]')?.addEventListener('change', event => { location.hash = event.target.value; });
    if (focusNewNote) { form.elements.namedItem('title').focus({ preventScroll: true }); focusNewNote = false; }
    form.addEventListener('submit', event => event.preventDefault());
    function saveField(event) {
      try {
        if (event.target.name === 'illustrations') folder.setNoteIllustrations(id, event.target.value);
        else if (event.target.name === 'tags') folder.setEntryTags('notes', id, parseFolderTags(event.target.value));
        else folder.updateNote(id, event.target.name, event.target.value);
        form.querySelector('[data-note-status]').textContent = memoryNotice();
        form.querySelector('[data-note-status]').classList.toggle('note-save-warning', !folder.persisted);
        form.querySelector('[data-note-save-mode]').textContent = folder.persisted ? 'Alterações salvas automaticamente' : 'Rascunho somente nesta sessão';
        const note = folder.state.notes.find(item => item.id === id);
        const option = document.querySelector('#folder-note-picker option:checked'); if (option) option.textContent = noteTitle(note);
        const link = document.querySelector(`[data-note-link="${id}"]`);
        if (link) {
          link.querySelector('strong').textContent = noteTitle(note);
          link.querySelector('time').textContent = noteDate(note.updatedAt);
          link.querySelector('time').dateTime = note.updatedAt;
          link.querySelector('span').textContent = context().missions.find(mission => mission.id === note.missionId)?.code || (note.missionId ? 'Missão indisponível' : 'Anotação avulsa');
        }
        form.querySelector('[data-note-length]').textContent = `${note.body.length.toLocaleString('pt-BR')} / 20.000 caracteres`;
        const mission = context().missions.find(item => item.id === note.missionId);
        const missionLink = form.querySelector('[data-note-mission-link]');
        missionLink.hidden = !mission;
        if (mission) missionLink.href = `#/arquivo/${mission.id}`;
        // Ao mover uma nota para outra pasta, mantenha o editor aberto no novo contexto.
        if (event.target.name === 'missionId' && filter && (filter === 'avulsas' ? Boolean(note.missionId) : note.missionId !== filter)) {
          location.hash = folderUrl(note.missionId || 'avulsas', id);
        }
      } catch (error) { form.querySelector('[data-note-status]').textContent = error.message; form.querySelector('[data-note-status]').classList.add('note-save-warning'); return false; }
    }
    bindNoteIllustrationControls(form, { onChange: ({ values }) => saveField({ target: { name: 'illustrations', value: values } }) });
    form.querySelectorAll('input,textarea').forEach(input => input.addEventListener('input', saveField));
    form.querySelector('select').addEventListener('change', saveField);
    document.querySelector('[data-download-work-note]').addEventListener('click', () => {
      const title = form.elements.title.value.trim() || 'Anotação sem título';
      const mission = context().missions.find(item => item.id === form.elements.missionId.value);
      const images = noteIllustrations(folder.state.notes.find(note => note.id === id) || {}).map(image => getEvidenceIllustration(image).label);
      const blob = new Blob([`${title}\n${mission ? `${mission.code} · ${mission.title}` : 'Anotação pessoal'}${images.length ? `\nImagens: ${images.join(' · ')}` : ''}${folder.state.notes.find(note => note.id === id)?.tags?.length ? `\nEtiquetas: ${folder.state.notes.find(note => note.id === id).tags.join(', ')}` : ''}\n\n${form.elements.body.value}\n`], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `GMS-${title.replace(/[^\p{L}\p{N} _-]/gu, '').slice(0, 75) || 'anotacao'}.txt`;
      link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    const dialog = document.querySelector('.note-delete-dialog');
    document.querySelector('[data-delete-work-note]').addEventListener('click', () => dialog.showModal());
    document.querySelector('[data-cancel-note-delete]').addEventListener('click', () => dialog.close());
    document.querySelector('[data-confirm-note-delete]').addEventListener('click', () => {
      folder.deleteNote(id); dialog.close();
      const next = folderUrl(filter);
      if (location.hash === next) onChange(); else location.hash = next;
      announce('Anotação enviada para a lixeira.');
    });
  }
  return { dashboard, page, bind, missionTools, missionPage: missionWorkspace.page, contextBar: missionWorkspace.contextBar, currentMissionUrl: missionWorkspace.currentUrl, folderLink: missionWorkspace.folderLink, selectedMission: missionWorkspace.selected, snapshot: () => ({ folder: { version: 1, ...structuredClone(folder.reload()) }, reports: fieldReports.snapshot() }), reload: force => { folder.reload(force); fieldReports.reload(force); } };
}
