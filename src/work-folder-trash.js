import { workFolderTabs } from './work-folder-sections.js';
import { noteIllustrationStrip } from './evidence-illustrations.js';
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export function createWorkFolderTrash({ folder, getMissions, renderTransfer, icon, onChange, onNotice }) {
  function page(filter) {
    const entries = folder.state.trash.filter(item => !filter || (filter === 'avulsas' ? !item.missionId : item.missionId === filter));
    return `<section class="work-folder folder-trash-page" aria-labelledby="work-folder-title"><div class="op-section-heading"><div><span class="op-kicker">RECUPERAÇÃO DE REGISTROS</span><h1 id="work-folder-title">Pasta de trabalho</h1><p>Recupere anotações removidas do seu caderno.</p></div></div>${renderTransfer(filter)}${workFolderTabs(folder.state, filter, 'lixeira', icon)}<div class="folder-section-heading"><div><h2>Lixeira de anotações</h2><p>Os textos, imagens, etiquetas e vínculos ficam guardados aqui até você restaurar ou excluir definitivamente.</p></div><div class="folder-section-filter"><label for="folder-filter">Filtrar por missão</label><select id="folder-filter" data-folder-filter><option value="">Todas as anotações</option><option value="avulsas" ${filter === 'avulsas' ? 'selected' : ''}>Sem missão vinculada</option>${getMissions().map(mission => `<option value="${esc(mission.id)}" ${mission.id === filter ? 'selected' : ''}>${esc(mission.code)} · ${esc(mission.title)}</option>`).join('')}${filter && filter !== 'avulsas' && !getMissions().some(mission => mission.id === filter) ? `<option selected value="${esc(filter)}">Missão indisponível</option>` : ''}</select></div></div><p class="folder-storage-notice">${icon('lock')}A lixeira fica neste navegador e integra a cópia de segurança em JSON. Não há exclusão automática.</p><div class="folder-entry-grid">${entries.map(item => `<article class="folder-entry-card"><div class="folder-entry-top"><span>REMOVIDA EM ${esc(new Date(item.deletedAt).toLocaleDateString('pt-BR'))}</span></div><h3>${esc(item.note.title || 'Anotação sem título')}</h3>${noteIllustrationStrip(item.note)}<p class="op-local-note">${esc(getMissions().find(mission => mission.id === item.missionId)?.title || (item.missionId ? 'Missão indisponível' : 'Anotação avulsa'))}${item.note.tags?.length ? ` · ${esc(item.note.tags.join(', '))}` : ''}</p><details class="trash-note-preview"><summary>Ler anotação</summary><p>${esc(item.note.body || 'Sem texto registrado.')}</p></details><p class="op-local-note">${item.connections.length} ${item.connections.length === 1 ? 'ligação arquivada' : 'ligações arquivadas'}</p><div class="op-actions"><button type="button" class="op-button" data-restore-note="${esc(item.id)}">Restaurar anotação</button><button type="button" class="op-text-button" data-delete-note-forever="${esc(item.id)}">Excluir definitivamente</button></div></article>`).join('') || '<div class="op-empty folder-section-empty"><h3>A lixeira está vazia neste filtro.</h3><p>As anotações removidas da pasta aparecerão aqui para recuperação.</p></div>'}</div><dialog class="folder-entry-delete-dialog" data-trash-delete-dialog aria-labelledby="trash-delete-title"><h2 id="trash-delete-title">Excluir definitivamente esta anotação?</h2><p>O texto e seus anexos serão removidos da lixeira. Esta exclusão não poderá ser desfeita.</p><div class="op-actions"><button type="button" class="op-button" data-cancel-trash-delete>Manter na lixeira</button><button type="button" class="op-text-button" data-confirm-trash-delete>Excluir definitivamente</button></div></dialog></section>`;
  }
  function bind() {
    const root = document.querySelector('.folder-trash-page'); if (!root) return;
    let deleting = ''; const dialog = root.querySelector('[data-trash-delete-dialog]');
    root.querySelectorAll('[data-restore-note]').forEach(button => button.addEventListener('click', () => {
      try {
        const result = folder.restoreNote(button.dataset.restoreNote); onChange();
        onNotice(folder.persisted ? `Anotação restaurada.${result.unavailableLinks ? ' Alguns vínculos apontavam para registros que já não estão disponíveis.' : ''}` : 'Anotação restaurada nesta sessão. Exporte a pasta para guardar uma cópia.');
      } catch (error) { onNotice(error.message); }
    }));
    root.querySelectorAll('[data-delete-note-forever]').forEach(button => button.addEventListener('click', () => { deleting = button.dataset.deleteNoteForever; dialog.showModal(); }));
    root.querySelector('[data-cancel-trash-delete]').addEventListener('click', () => dialog.close());
    root.querySelector('[data-confirm-trash-delete]').addEventListener('click', () => {
      try { folder.permanentlyDeleteNote(deleting); dialog.close(); onChange(); onNotice(folder.persisted ? 'Anotação excluída definitivamente.' : 'Exclusão apenas nesta sessão; o navegador não permitiu salvar.'); }
      catch (error) { onNotice(error.message); }
    });
  }
  return { page, bind };
}
