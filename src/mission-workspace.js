import { escapePersonal as esc } from './personal-records.js';
import { workFolderUrl } from './work-folder-sections.js';
import { fieldReportUrl } from './field-reports.js';
import { missionObjectives } from './mission-progress.js';
import { personalMissionStages } from './work-folder.js';

export function missionWorkspaceUrl(id = '', tab = 'ordem') {
  const params = new URLSearchParams({ ...(id ? { missao: id } : {}), ...(tab !== 'ordem' ? { aba: tab } : {}) });
  return '#/minha-missao' + (params.size ? `?${params}` : '');
}
export function createMissionWorkspace({ folder, getRecords, reports, icon, onChange, onNotice }) {
  const drafts = new Map();
  const missions = () => getRecords().filter(record => record.kind === 'missao' && !record.unlisted);
  const selected = () => { folder.reload(); return missions().find(item => item.id === folder.state.missionId); };
  const notice = () => folder.persisted ? 'Salvo automaticamente neste navegador.' : 'Rascunho nesta sessão. Exporte seus dados antes de sair.';
  const currentUrl = () => missionWorkspaceUrl(selected()?.id);
  const folderLink = (tab = 'anotacoes') => workFolderUrl(selected()?.id || '', '', tab);
  function contextBar(page) {
    if (!['minha-ficha', 'minha-credencial', 'meu-agente', 'pasta-de-trabalho'].includes(page)) return '';
    const mission = selected(); if (!mission) return '';
    return `<aside class="mission-context" aria-label="Missão em acompanhamento"><span>${icon('flag')}Em acompanhamento</span><a href="${missionWorkspaceUrl(mission.id)}">${esc(mission.code)} · ${esc(mission.title)} ${icon('arrow')}</a></aside>`;
  }
  function progressContent(mission) {
    const entry = folder.state.progress.filter(item => item.missionId === mission.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    if (!entry) return `<div class="experience-empty"><h2>Prepare seu acompanhamento</h2><p>Copie os objetivos da ordem para marcar seus avanços pessoais.</p><button type="button" class="op-button" data-workspace-start>Iniciar acompanhamento</button></div>`;
    const stages = personalMissionStages;
    return `<form class="mission-workspace-progress" data-workspace-progress="${esc(entry.id)}"><div class="experience-heading"><div><h2>Seus objetivos</h2><p data-workspace-objective-count>${entry.objectives.filter(item => item.done).length} de ${entry.objectives.length} concluídos</p></div><div><label for="workspace-stage">Minha etapa</label><select id="workspace-stage" name="stage">${stages.map(stage => `<option ${entry.stage === stage ? 'selected' : ''}>${stage}</option>`).join('')}</select></div></div><ul class="workspace-objectives">${entry.objectives.map(item => `<li><label><input type="checkbox" data-workspace-objective="${esc(item.id)}" ${item.done ? 'checked' : ''}><span>${esc(item.text)}</span></label></li>`).join('') || '<li>Acrescente objetivos no andamento pessoal da pasta.</li>'}</ul><label for="workspace-pending">O que ainda precisa ser resolvido?</label><textarea id="workspace-pending" name="pending" rows="4" maxlength="10000">${esc(entry.pending)}</textarea><p role="status" data-workspace-save>${notice()}</p><a class="op-link" href="${workFolderUrl(mission.id, '', 'andamento')}">Editar objetivos e rascunho de retorno →</a></form>`;
  }
  function notesContent(mission) {
    const notes = folder.state.notes.filter(note => note.missionId === mission.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const draft = drafts.get(mission.id) || { title: '', body: '' };
    return `<div class="experience-heading"><div><h2>Anotações da missão</h2><p>As mesmas notas da sua pasta de trabalho.</p></div><a class="op-link" href="${workFolderUrl(mission.id)}">Abrir na pasta →</a></div><details class="experience-details workspace-new-note" ${draft.body || draft.title ? 'open' : ''}><summary>Nova anotação</summary><form data-workspace-note><label for="workspace-note-title">Título</label><input id="workspace-note-title" name="title" maxlength="120" value="${esc(draft.title)}"><label for="workspace-note-body">Anotação</label><textarea id="workspace-note-body" name="body" maxlength="20000" rows="4" required>${esc(draft.body)}</textarea><button type="submit" class="op-button">Adicionar anotação</button><p role="status" data-workspace-note-feedback></p></form></details><div class="workspace-records">${notes.map(note => `<article><h3>${esc(note.title || 'Anotação sem título')}</h3><p>${esc(note.body.slice(0, 360))}${note.body.length > 360 ? '…' : ''}</p><a class="op-link" href="${workFolderUrl(mission.id, note.id)}">Editar anotação →</a></article>`).join('') || '<p class="experience-empty">Nenhuma anotação nesta missão.</p>'}</div>`;
  }
  function reportsContent(mission) {
    const archive = getRecords().filter(item => item.kind === 'relatorio' && item.missionId === mission.id && !item.unlisted);
    const personal = reports.forMission(mission.id);
    return `<div class="experience-heading"><div><h2>Relatórios da missão</h2><p>Documentos do acervo e seus registros pessoais.</p></div><button type="button" class="op-button" data-workspace-new-report>Novo relatório</button></div><div class="workspace-records">${[...archive.map(item => ({ ...item, label: 'Acervo institucional', url: `#/arquivo/${item.id}` })), ...personal.map(item => ({ ...item, label: 'Meu relatório', url: fieldReportUrl(item.id, mission.id) }))].map(item => `<article><small>${item.label} · ${esc(item.code)}</small><h3><a href="${item.url}">${esc(item.title)}</a></h3><a class="op-link" href="${item.url}">${item.label === 'Meu relatório' ? 'Editar relatório' : 'Consultar documento'} →</a></article>`).join('') || '<p class="experience-empty">Nenhum relatório registrado nesta missão.</p>'}</div>`;
  }
  function orderContent(mission) {
    const sections = mission.reportSections?.length ? mission.reportSections : [{ title: 'Ordem de missão', start: 0 }];
    return `<div class="experience-heading"><h2>Ordem de missão</h2><a class="op-link" href="#/arquivo/${esc(mission.id)}">Consultar documento completo →</a></div><div class="workspace-order">${sections.map((section, index) => { const text = mission.report.slice(section.start, sections[index + 1]?.start); return `<section><h3>${esc(section.title)}</h3>${section.list ? `<ul>${text.map(item => `<li>${esc(item)}</li>`).join('')}</ul>` : text.map(item => `<p>${esc(item)}</p>`).join('')}</section>`; }).join('')}</div>`;
  }
  function page(query) {
    folder.reload(); const params = new URLSearchParams(query); const requested = params.get('missao');
    const mission = missions().find(item => item.id === (requested || folder.state.missionId));
    if (mission && requested && folder.state.missionId !== requested) folder.selectMission(requested);
    const tabs = [['ordem', 'Ordem'], ['objetivos', 'Objetivos'], ['anotacoes', 'Anotações'], ['relatorios', 'Relatórios']];
    const tab = tabs.some(([id]) => id === params.get('aba')) ? params.get('aba') : 'ordem';
    if (mission && !requested) history.replaceState(null, '', missionWorkspaceUrl(mission.id, tab));
    return `<section class="mission-workspace" aria-labelledby="mission-workspace-title" ${mission ? `data-workspace-mission="${esc(mission.id)}"` : ''}><header class="experience-heading"><div><span class="op-kicker">OPERAÇÃO EM ACOMPANHAMENTO</span><h1 id="mission-workspace-title">Minha missão</h1><p>Ordem, objetivos, anotações e relatórios em um só lugar.</p></div><div class="workspace-mission-picker"><label for="workspace-mission">Missão atual</label><select id="workspace-mission"><option value="">Selecionar missão</option>${missions().map(item => `<option value="${esc(item.id)}" ${mission?.id === item.id ? 'selected' : ''}>${esc(item.code)} · ${esc(item.title)}</option>`).join('')}${requested && !mission ? `<option selected value="${esc(requested)}">Missão indisponível</option>` : ''}</select></div></header>${mission ? `<div class="workspace-mission-summary"><div><small>${esc(mission.code)}</small><h2>${esc(mission.title)}</h2><p>${esc(mission.summary)}</p></div><span>Situação no arquivo<strong>${esc(mission.status)}</strong></span></div><nav class="workspace-mission-tabs" aria-label="Conteúdo da missão">${tabs.map(([id, label]) => `<a href="${missionWorkspaceUrl(mission.id, id)}" ${id === tab ? 'aria-current="page" class="selected"' : ''}>${label}</a>`).join('')}</nav><div class="workspace-mission-content">${tab === 'objetivos' ? progressContent(mission) : tab === 'anotacoes' ? notesContent(mission) : tab === 'relatorios' ? reportsContent(mission) : orderContent(mission)}</div>` : `<div class="experience-empty"><h2>${requested ? 'Missão indisponível neste terminal' : 'Escolha sua missão'}</h2><p>Selecione uma operação para continuar o trabalho. Os seus registros anteriores continuam na pasta.</p><a class="op-link" href="#/missoes">Consultar todas as missões →</a></div>`}</section>`;
  }
  function bind() {
    const root = document.querySelector('.mission-workspace'); if (!root) return;
    root.querySelector('#workspace-mission').addEventListener('change', event => { folder.selectMission(event.target.value); location.hash = missionWorkspaceUrl(event.target.value); if (!event.target.value) onChange(); });
    const mission = missions().find(item => item.id === root.dataset.workspaceMission); if (!mission) return;
    root.querySelector('[data-workspace-start]')?.addEventListener('click', () => { try { folder.startProgress(mission.id, missionObjectives(mission)); onChange(); onNotice(notice()); } catch (error) { onNotice(error.message); } });
    const progress = root.querySelector('[data-workspace-progress]');
    if (progress) {
      const feedback = progress.querySelector('[data-workspace-save]');
      progress.addEventListener('submit', event => event.preventDefault());
      progress.querySelectorAll('[name]').forEach(input => input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', () => { try { folder.updateProgress(progress.dataset.workspaceProgress, input.name, input.value); feedback.textContent = notice(); } catch (error) { feedback.textContent = error.message; } }));
      progress.querySelectorAll('[data-workspace-objective]').forEach(input => input.addEventListener('change', () => { try { folder.toggleObjective(progress.dataset.workspaceProgress, input.dataset.workspaceObjective, input.checked); const entry = folder.state.progress.find(item => item.id === progress.dataset.workspaceProgress); progress.querySelector('[data-workspace-objective-count]').textContent = `${entry.objectives.filter(item => item.done).length} de ${entry.objectives.length} concluídos`; feedback.textContent = notice(); } catch (error) { feedback.textContent = error.message; input.checked = !input.checked; } }));
    }
    const noteForm = root.querySelector('[data-workspace-note]');
    if (noteForm) {
      noteForm.addEventListener('input', () => drafts.set(mission.id, { title: noteForm.elements.title.value, body: noteForm.elements.body.value }));
      noteForm.addEventListener('submit', event => {
        event.preventDefault();
        try {
          if (!noteForm.elements.body.value.trim()) throw new Error('Escreva sua anotação.');
          folder.transaction('Adicionar anotação à missão', () => { const id = folder.addNote(mission.id); folder.updateNote(id, 'title', noteForm.elements.title.value); folder.updateNote(id, 'body', noteForm.elements.body.value); });
          drafts.delete(mission.id); onChange(); onNotice(notice());
        } catch (error) { noteForm.querySelector('[data-workspace-note-feedback]').textContent = error.message; }
      });
    }
    root.querySelector('[data-workspace-new-report]')?.addEventListener('click', () => { try { const id = reports.createForMission(mission.id); location.hash = fieldReportUrl(id, mission.id); } catch (error) { onNotice(error.message); } });
  }
  return { page, bind, currentUrl, folderLink, contextBar, selected };
}
