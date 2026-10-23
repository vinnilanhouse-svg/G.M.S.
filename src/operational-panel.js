import { createWorkFolder, operationalMissions } from './work-folder.js';
import { createWorkFolderSections, workFolderTabs, workFolderUrl as folderUrl } from './work-folder-sections.js';

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
  const folderSections = createWorkFolderSections({ folder, getRecords, getMissions: () => context().missions, icon, onNotice, onChange });

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
      <aside class="my-mission" aria-labelledby="my-mission-title"><span class="op-kicker">ACOMPANHAMENTO PESSOAL</span><h3 id="my-mission-title">Sua missão</h3>${mission ? `<div class="op-card-meta"><span>${esc(mission.code)}</span>${status(mission)}</div><h4><a href="#/arquivo/${esc(mission.id)}">${esc(mission.title)}</a></h4><p>${esc(mission.summary)}</p><div class="my-mission-links"><a href="#/arquivo/${esc(mission.id)}">${icon('flag')}Ordem de missão ${icon('arrow')}</a><a href="#/missoes/relatorios?missao=${encodeURIComponent(mission.id)}">${icon('clipboard')}Relatórios ${icon('arrow')}</a><a href="${folderUrl(mission.id)}">${icon('folder')}Anotações da missão <span>${missionNotes.length}</span></a></div>` : `<div class="my-mission-empty">${icon('flag')}<p>Nenhuma missão em acompanhamento.</p><p>Escolha a operação que está acompanhando para reunir seus documentos e anotações aqui.</p></div>`}<label for="personal-mission">${mission ? 'Trocar missão' : 'Selecionar missão'}</label><select id="personal-mission" data-personal-mission>${options(mission?.id || '')}</select>${mission ? '<button type="button" class="op-text-button" data-unfollow-mission>Remover do acompanhamento</button>' : ''}<p class="op-local-note">Sua seleção fica salva neste navegador.</p></aside></div>
    </section>
    <section class="work-folder-preview" aria-labelledby="folder-preview-title"><div class="op-section-heading"><div><span class="op-kicker">CADERNO PESSOAL</span><h2 id="folder-preview-title">Pasta de trabalho</h2></div><a class="op-link" href="${folderUrl()}">Abrir pasta ${icon('arrow')}</a></div><div class="folder-preview-content"><div><p>Observações de campo, pistas e perguntas para a próxima etapa.</p>${notes.length ? `<ul>${notes.slice(0, 3).map(note => `<li><a href="${folderUrl('', note.id)}">${icon('file')}<span>${esc(noteTitle(note))}</span>${icon('arrow')}</a></li>`).join('')}</ul>` : '<p class="op-local-note">Nenhuma anotação registrada. Seu caderno começa aqui.</p>'}</div><button type="button" class="op-button" data-new-work-note>${icon('file')}Nova anotação</button></div><p class="op-local-note">${folder.state.notes.length} ${folder.state.notes.length === 1 ? 'anotação' : 'anotações'} · Caderno pessoal salvo neste navegador.</p></section>`;
  }

  function missionTools(mission) {
    return `<div class="mission-personal-tools"><div>${icon('folder')}<span>Seu acompanhamento</span></div><div class="op-actions">${missionAction(mission)}<a class="op-link" href="${folderUrl(mission.id)}">Anotações desta missão ${icon('arrow')}</a></div></div>`;
  }

  function page(query) {
    folder.reload();
    const params = new URLSearchParams(query);
    const filter = params.get('missao') || '';
    const sectionPage = folderSections.page(params.get('aba'), filter);
    if (sectionPage) return sectionPage;
    const missions = context().missions;
    const filtered = folder.state.notes.filter(note => !filter || (filter === 'avulsas' ? !note.missionId : note.missionId === filter)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const note = filtered.find(item => item.id === params.get('nota')) || filtered[0];
    // Fixe a nota aberta para que uma nova anotação de outra aba não troque o editor.
    if (note && note.id !== params.get('nota')) history.replaceState(null, '', folderUrl(filter, note.id));
    const linkedMission = missions.find(mission => mission.id === note?.missionId);
    const knownFilter = filter === 'avulsas' || missions.some(mission => mission.id === filter);
    return `<section class="work-folder" aria-labelledby="work-folder-title"><div class="op-section-heading"><div><span class="op-kicker">ARQUIVO PESSOAL DO AGENTE</span><h1 id="work-folder-title">Pasta de trabalho</h1><p>Registre o que encontrou. Guarde o que ainda precisa investigar.</p></div><button type="button" class="op-button" data-new-work-note>${icon('file')}Nova anotação</button></div><p class="folder-storage-notice">${icon('lock')}Registros pessoais, salvos apenas neste navegador. ${folder.persisted ? 'Você também pode baixar uma cópia de cada anotação.' : esc(memoryNotice())}</p>
      ${workFolderTabs(folder.state, filter, 'anotacoes', icon)}
      <div class="folder-layout"><aside class="folder-index" aria-label="Índice de anotações"><label for="folder-filter">Filtrar por missão</label><select id="folder-filter" data-folder-filter><option value="">Todas as anotações</option><option value="avulsas" ${filter === 'avulsas' ? 'selected' : ''}>Sem missão vinculada</option>${missions.map(mission => `<option value="${esc(mission.id)}" ${filter === mission.id ? 'selected' : ''}>${esc(mission.code)} · ${esc(mission.title)}</option>`).join('')}${filter && !knownFilter ? '<option selected value="indisponivel">Missão indisponível</option>' : ''}</select><p class="folder-count">${filtered.length} ${filtered.length === 1 ? 'ANOTAÇÃO' : 'ANOTAÇÕES'}</p><nav class="folder-notes" aria-label="Anotações">${filtered.map(item => `<a href="${folderUrl(filter, item.id)}" class="folder-note ${item.id === note?.id ? 'selected' : ''}" ${item.id === note?.id ? 'aria-current="true"' : ''} data-note-link="${esc(item.id)}"><strong>${esc(noteTitle(item))}</strong><span>${esc(missions.find(mission => mission.id === item.missionId)?.code || (item.missionId ? 'Missão indisponível' : 'Anotação avulsa'))}</span><time datetime="${esc(item.updatedAt)}">${esc(noteDate(item.updatedAt))}</time></a>`).join('') || '<p class="folder-no-notes">Nenhuma anotação nesta pasta.</p>'}</nav><a class="op-link folder-saved-link" href="#/favoritos">${icon('bookmark')}Consultar arquivos salvos ${icon('arrow')}</a></aside>
      ${note ? `<form class="note-editor" data-work-note="${esc(note.id)}"><div class="note-editor-heading"><span class="op-kicker">ANOTAÇÃO DE CAMPO</span><span role="status" class="note-save-status" data-note-status>${esc(memoryNotice())}</span></div><label for="note-title">Título da anotação</label><input id="note-title" name="title" maxlength="120" placeholder="Dê um título à anotação" value="${esc(note.title)}" autocomplete="off"><label for="note-mission">Missão vinculada</label><select id="note-mission" name="missionId">${options(note.missionId)}${note.missionId && !linkedMission ? '<option selected value="indisponivel">Missão indisponível</option>' : ''}</select><a class="op-link note-mission-link" data-note-mission-link ${linkedMission ? `href="#/arquivo/${esc(linkedMission.id)}"` : 'hidden'}>Consultar ordem de missão ${icon('arrow')}</a><label for="note-body">Suas anotações</label><textarea id="note-body" name="body" maxlength="20000" placeholder="Registre pistas, observações, hipóteses e questões em aberto…">${esc(note.body)}</textarea><div class="note-editor-foot"><span data-note-length>${note.body.length.toLocaleString('pt-BR')} / 20.000 caracteres</span><span data-note-save-mode>${folder.persisted ? 'Alterações salvas automaticamente' : 'Rascunho somente nesta sessão'}</span></div><div class="note-editor-actions"><button type="button" class="op-button" data-download-work-note>${icon('file')}Baixar anotação</button><button type="button" class="op-text-button" data-delete-work-note>Excluir anotação</button></div></form>` : `<div class="op-empty folder-empty">${icon('folder')}<h2>Seu caderno está aberto.</h2><p>Crie uma anotação para registrar suas observações${filter && knownFilter && filter !== 'avulsas' ? ' sobre esta missão' : ''}.</p><button type="button" class="op-button" data-new-work-note>Nova anotação</button></div>`}</div>
      <dialog class="note-delete-dialog" aria-labelledby="note-delete-title"><h2 id="note-delete-title">Excluir esta anotação?</h2><p>O texto será removido da sua pasta de trabalho. Você pode baixar uma cópia antes de excluir.</p><div class="op-actions"><button type="button" class="op-button" data-cancel-note-delete>Manter anotação</button><button type="button" class="op-button" data-confirm-note-delete>Excluir anotação</button></div></dialog></section>`;
  }

  function bind() {
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
    const tab = ['documentos', 'pessoas', 'localidades'].includes(params.get('aba')) ? params.get('aba') : 'anotacoes';
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
    if (focusNewNote) { form.elements.namedItem('title').focus({ preventScroll: true }); focusNewNote = false; }
    form.addEventListener('submit', event => event.preventDefault());
    function saveField(event) {
      try {
        folder.updateNote(id, event.target.name, event.target.value);
        form.querySelector('[data-note-status]').textContent = memoryNotice();
        form.querySelector('[data-note-status]').classList.toggle('note-save-warning', !folder.persisted);
        form.querySelector('[data-note-save-mode]').textContent = folder.persisted ? 'Alterações salvas automaticamente' : 'Rascunho somente nesta sessão';
        const note = folder.state.notes.find(item => item.id === id);
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
      } catch (error) { form.querySelector('[data-note-status]').textContent = error.message; form.querySelector('[data-note-status]').classList.add('note-save-warning'); }
    }
    form.querySelectorAll('input,textarea').forEach(input => input.addEventListener('input', saveField));
    form.querySelector('select').addEventListener('change', saveField);
    document.querySelector('[data-download-work-note]').addEventListener('click', () => {
      const title = form.elements.title.value.trim() || 'Anotação sem título';
      const mission = context().missions.find(item => item.id === form.elements.missionId.value);
      const blob = new Blob([`${title}\n${mission ? `${mission.code} · ${mission.title}` : 'Anotação pessoal'}\n\n${form.elements.body.value}\n`], { type: 'text/plain;charset=utf-8' });
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
      announce('Anotação excluída.');
    });
  }
  return { dashboard, page, bind, missionTools, reload: () => folder.reload() };
}
