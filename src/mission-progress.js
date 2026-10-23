import { personalMissionStages } from './work-folder.js';
import { workFolderTabs, workFolderUrl } from './work-folder-sections.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const progressUrl = (missionId, id = '') => workFolderUrl(missionId, '', 'andamento') + (id ? `&registro=${encodeURIComponent(id)}` : '');
const updated = value => new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export function missionObjectives(mission) {
  const sections = mission.reportSections || [];
  return sections.flatMap((section, index) => section.list && /objetiv/i.test(section.title) ? mission.report.slice(section.start, sections[index + 1]?.start) : []).slice(0, 100).map(text => text.length > 2000 ? text.slice(0, 1999) + '…' : text);
}

export function createMissionProgress({ folder, getMissions, icon, renderTransfer, onChange, onNotice }) {
  const objectiveDrafts = new Map();
  const notice = () => folder.persisted ? 'Andamento salvo neste navegador.' : 'Rascunho somente nesta sessão. Exporte a pasta antes de sair.';
  function summary(missionId) {
    const entry = folder.state.progress.filter(item => item.missionId === missionId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    return `<a class="personal-progress-summary" href="${progressUrl(missionId, entry?.id)}"><span>${icon('flag')}Andamento pessoal</span>${entry ? `<strong>${esc(entry.stage)}</strong><small>${entry.objectives.filter(item => item.done).length} de ${entry.objectives.length} objetivos concluídos</small>` : '<small>Organizar objetivos, pendências e retorno</small>'}${icon('arrow')}</a>`;
  }
  function page(query) {
    const params = new URLSearchParams(query);
    const requested = params.get('missao');
    const missions = getMissions();
    const missionId = requested || folder.state.missionId;
    const mission = missions.find(item => item.id === missionId);
    const versions = folder.state.progress.filter(entry => entry.missionId === missionId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const entry = versions.find(item => item.id === params.get('registro')) || versions[0];
    if (mission && entry && (params.get('registro') !== entry.id || requested !== missionId)) history.replaceState(null, '', progressUrl(missionId, entry.id));
    return `<section class="work-folder" aria-labelledby="work-folder-title"><div class="op-section-heading"><div><span class="op-kicker">CADERNO DE OPERAÇÕES</span><h1 id="work-folder-title">Pasta de trabalho</h1><p>Prepare sua atuação. Registre os avanços. Organize o retorno.</p></div></div>${renderTransfer(mission?.id || requested || '')}<p class="folder-storage-notice">${icon('lock')}O andamento é pessoal e fica salvo neste navegador. A situação oficial da missão permanece no arquivo.</p>${workFolderTabs(folder.state, mission?.id || requested || '', 'andamento', icon)}<div class="progress-heading"><div><span class="op-kicker">ACOMPANHAMENTO DO AGENTE</span><h2>Andamento pessoal</h2></div><div><label for="progress-mission">Missão em acompanhamento</label><select id="progress-mission" data-progress-mission><option value="">Selecione uma missão</option>${missions.map(item => `<option value="${esc(item.id)}" ${mission?.id === item.id ? 'selected' : ''}>${esc(item.code)} · ${esc(item.title)}</option>`).join('')}</select></div></div>
      ${!mission ? `<div class="op-empty progress-empty">${icon('flag')}<h3>${missionId ? 'Missão indisponível neste terminal.' : 'Escolha uma missão para começar.'}</h3><p>O acompanhamento reúne seus objetivos, as questões em aberto e o rascunho do relatório de retorno.</p></div>` : `<div class="progress-mission-reference"><a class="op-link" href="#/arquivo/${esc(mission.id)}">${esc(mission.code)} · ${esc(mission.title)} ${icon('arrow')}</a><span>Situação no arquivo: <strong>${esc(mission.status)}</strong></span></div>${!entry ? `<div class="op-empty progress-empty">${icon('clipboard')}<h3>Abra seu acompanhamento desta missão.</h3><p>Os objetivos da ordem serão copiados para seu caderno. Você poderá marcar o que concluiu e acrescentar objetivos pessoais.</p><button type="button" class="op-button" data-start-progress="${esc(mission.id)}">Iniciar andamento pessoal</button></div>` : `${versions.length > 1 ? `<label class="progress-version-label" for="progress-version">Versão do acompanhamento</label><select class="progress-version" id="progress-version" data-progress-version>${versions.map((item, index) => `<option value="${esc(item.id)}" ${item.id === entry.id ? 'selected' : ''}>${index + 1} · ${esc(item.stage)} · ${esc(updated(item.updatedAt))}</option>`).join('')}</select>` : ''}<form class="mission-progress-editor" data-progress-record="${esc(entry.id)}" data-progress-mission-id="${esc(mission.id)}"><div class="progress-stage-row"><div><label for="progress-stage">Sua etapa atual</label><select id="progress-stage" name="stage">${personalMissionStages.map(stage => `<option ${entry.stage === stage ? 'selected' : ''}>${stage}</option>`).join('')}</select></div><span class="note-save-status" role="status" data-progress-save>${esc(notice())}</span></div><section class="progress-objectives" aria-labelledby="progress-objectives-title"><div class="op-section-heading"><h3 id="progress-objectives-title">Objetivos da missão</h3><span class="progress-objective-count">${entry.objectives.filter(item => item.done).length} / ${entry.objectives.length} concluídos</span></div><p class="progress-help">Lista pessoal baseada na ordem de missão. Consulte a ordem para o texto integral.</p><ul>${entry.objectives.map(item => `<li class="${item.done ? 'is-complete' : ''}"><label><input type="checkbox" data-progress-objective="${esc(item.id)}" ${item.done ? 'checked' : ''}><span>${esc(item.text)}</span></label><button type="button" class="op-text-button" data-remove-progress-objective="${esc(item.id)}" aria-label="Remover objetivo: ${esc(item.text)}">Remover</button></li>`).join('') || '<li class="progress-no-objectives">Nenhum objetivo registrado. Acrescente o primeiro abaixo.</li>'}</ul><div class="progress-add-objective"><label for="progress-new-objective">Acrescentar objetivo pessoal</label><div><input id="progress-new-objective" maxlength="2000" placeholder="O que ainda precisa ser feito?"><button type="button" class="op-button" data-add-progress-objective>Adicionar objetivo</button></div></div></section><section class="progress-writing"><label for="progress-pending">Questões pendentes</label><p>Registre dúvidas, informações a confirmar e apoio necessário.</p><textarea id="progress-pending" name="pending" maxlength="10000" rows="5" placeholder="O que ainda precisa ser esclarecido?">${esc(entry.pending)}</textarea></section><section class="progress-writing"><label for="progress-return">Relatório de retorno — rascunho pessoal</label><p>Organize os acontecimentos, os resultados e o que precisa ser comunicado à G.M.S.</p><textarea id="progress-return" name="returnReport" maxlength="20000" rows="9" placeholder="Descreva sua atuação e os resultados observados…">${esc(entry.returnReport)}</textarea></section><p class="progress-updated">Última alteração: <time data-progress-updated datetime="${esc(entry.updatedAt)}">${esc(updated(entry.updatedAt))}</time> · Incluído na exportação da pasta.</p></form>`}`}</section>`;
  }

  function bind() {
    document.querySelector('[data-progress-mission]')?.addEventListener('change', event => { location.hash = progressUrl(event.target.value); });
    document.querySelector('[data-progress-version]')?.addEventListener('change', event => { location.hash = progressUrl(document.querySelector('[data-progress-mission]').value, event.target.value); });
    document.querySelector('[data-start-progress]')?.addEventListener('click', event => {
      try {
        const mission = getMissions().find(item => item.id === event.currentTarget.dataset.startProgress);
        if (!mission) return;
        const id = folder.startProgress(mission.id, missionObjectives(mission));
        history.replaceState(null, '', progressUrl(mission.id, id)); onChange(); onNotice(notice());
      } catch (error) { onNotice(error.message); }
    });
    const form = document.querySelector('[data-progress-record]');
    if (!form) return;
    const id = form.dataset.progressRecord;
    const draftInput = form.querySelector('#progress-new-objective');
    draftInput.value = objectiveDrafts.get(id) || '';
    draftInput.addEventListener('input', () => objectiveDrafts.set(id, draftInput.value));
    form.addEventListener('submit', event => event.preventDefault());
    function feedback(error) {
      form.querySelector('[data-progress-save]').textContent = error?.message || notice();
      form.querySelector('[data-progress-save]').classList.toggle('note-save-warning', Boolean(error) || !folder.persisted);
      const time = form.querySelector('[data-progress-updated]');
      const entry = folder.state.progress.find(item => item.id === id);
      if (entry) { time.textContent = updated(entry.updatedAt); time.dateTime = entry.updatedAt; }
    }
    form.querySelectorAll('textarea,[name="stage"]').forEach(input => input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', event => {
      try { folder.updateProgress(id, event.target.name, event.target.value); feedback(); } catch (error) { feedback(error); }
    }));
    form.querySelectorAll('[data-progress-objective]').forEach(input => input.addEventListener('change', event => {
      try {
        const objective = event.target.dataset.progressObjective;
        folder.toggleObjective(id, objective, event.target.checked); onChange();
        document.querySelector(`[data-progress-objective="${objective}"]`)?.focus({ preventScroll: true });
      } catch (error) { feedback(error); }
    }));
    form.querySelectorAll('[data-remove-progress-objective]').forEach(button => button.addEventListener('click', () => {
      try { folder.removeObjective(id, button.dataset.removeProgressObjective); onChange(); } catch (error) { feedback(error); }
    }));
    function addObjective() {
      try { folder.addObjective(id, form.querySelector('#progress-new-objective').value); objectiveDrafts.delete(id); onChange(); document.querySelector('#progress-new-objective')?.focus({ preventScroll: true }); }
      catch (error) { feedback(error); }
    }
    form.querySelector('[data-add-progress-objective]').addEventListener('click', addObjective);
    form.querySelector('#progress-new-objective').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); addObjective(); } });
  }
  return { page, bind, summary };
}
