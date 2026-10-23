import { maxWorkFolderBackupBytes, parseWorkFolderBackup, selectWorkFolderData, serializeWorkFolderBackup, workFolderCounts, workFolderReadableText } from './work-folder-backup.js';
import './work-folder-transfer.css';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export function createWorkFolderTransfer({ folder, getRecords, icon, onNotice, onChange }) {
  function render(filter) {
    return `<div class="folder-transfer-toolbar" aria-label="Transferência da pasta de trabalho"><button type="button" class="op-button" data-open-folder-export>${icon('external')}Exportar pasta</button><button type="button" class="op-text-button" data-open-folder-import>Importar pasta</button><span>Guarde uma cópia ou leve seus registros para outro navegador.</span></div>
      <dialog class="folder-transfer-dialog" aria-labelledby="folder-export-title" data-folder-export-dialog><div class="folder-dialog-heading"><h2 id="folder-export-title">Exportar pasta de trabalho</h2><button type="button" class="op-text-button" data-close-transfer>Fechar</button></div><p>Baixe seu andamento pessoal, anotações, documentos, pessoas de interesse e localidades, com as observações e os vínculos com o acervo.</p><label for="folder-export-scope">Conteúdo da exportação</label><select id="folder-export-scope"><option value="">Pasta completa</option>${filter ? `<option value="${esc(filter)}">Somente os registros do filtro atual</option>` : ''}</select><p class="folder-transfer-counts" role="status" data-export-counts></p><div class="folder-export-options"><button type="button" class="op-button" data-export-folder="json">Baixar cópia de segurança (.json)</button><p>Use este arquivo para importar sua pasta depois.</p><button type="button" class="op-button" data-export-folder="txt">Baixar versão para leitura (.txt)</button><p>Texto organizado para consultar ou compartilhar.</p></div><p role="status" class="folder-transfer-feedback" data-export-feedback></p></dialog>
      <dialog class="folder-transfer-dialog" aria-labelledby="folder-import-title" data-folder-import-dialog><div class="folder-dialog-heading"><h2 id="folder-import-title">Importar pasta de trabalho</h2><button type="button" class="op-text-button" data-close-transfer>Fechar</button></div><p>Selecione a cópia em JSON gerada pela exportação da pasta.</p><label for="folder-import-file">Arquivo de cópia de segurança</label><div class="folder-file-picker"><button type="button" class="op-button" data-select-import-file>Selecionar arquivo</button><span data-import-filename>Nenhum arquivo selecionado</span></div><input id="folder-import-file" type="file" accept=".json,application/json" hidden><p class="op-local-note">Seus registros atuais serão mantidos. Versões diferentes do mesmo registro serão adicionadas como cópias.</p><p class="folder-transfer-counts" role="status" data-import-counts></p><p role="status" class="folder-transfer-feedback" data-import-feedback></p><button type="button" class="op-button" data-import-folder disabled>Adicionar à minha pasta</button></dialog>`;
  }

  function bind() {
    const exportDialog = document.querySelector('[data-folder-export-dialog]');
    const importDialog = document.querySelector('[data-folder-import-dialog]');
    if (!exportDialog || !importDialog) return;
    let exportState;
    let pendingImport = null;
    let readVersion = 0;
    const scope = exportDialog.querySelector('#folder-export-scope');
    const exportFeedback = exportDialog.querySelector('[data-export-feedback]');
    const importFeedback = importDialog.querySelector('[data-import-feedback]');
    const importButton = importDialog.querySelector('[data-import-folder]');
    function updateCounts() {
      exportDialog.querySelector('[data-export-counts]').textContent = workFolderCounts(selectWorkFolderData(exportState, scope.value));
    }
    document.querySelector('[data-open-folder-export]').addEventListener('click', () => {
      exportState = structuredClone(folder.reload()); scope.value = ''; exportFeedback.textContent = ''; updateCounts(); exportDialog.showModal();
    });
    scope.addEventListener('change', updateCounts);
    document.querySelector('[data-open-folder-import]').addEventListener('click', () => {
      pendingImport = null; importButton.disabled = true; importFeedback.textContent = ''; importDialog.querySelector('[data-import-counts]').textContent = ''; importDialog.querySelector('input').value = ''; importDialog.querySelector('[data-import-filename]').textContent = 'Nenhum arquivo selecionado'; importDialog.showModal();
    });
    for (const dialog of [exportDialog, importDialog]) dialog.querySelector('[data-close-transfer]').addEventListener('click', () => dialog.close());
    exportDialog.querySelectorAll('[data-export-folder]').forEach(button => button.addEventListener('click', () => {
      try {
        const format = button.dataset.exportFolder;
        const options = { missionFilter: scope.value };
        const text = format === 'json' ? serializeWorkFolderBackup(exportState, options) : workFolderReadableText(exportState, getRecords(), options);
        const blob = new Blob([text], { type: format === 'json' ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const now = new Date();
        const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
        const link = document.createElement('a'); link.href = url; link.download = `GMS-pasta-de-trabalho-${scope.value ? 'missao-' : ''}${stamp}.${format}`; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        exportFeedback.textContent = format === 'json' ? 'Cópia de segurança preparada para download.' : 'Versão para leitura preparada para download.';
        exportFeedback.classList.remove('is-error');
      } catch (error) { exportFeedback.textContent = error.message; exportFeedback.classList.add('is-error'); }
    }));
    importDialog.querySelector('[data-select-import-file]').addEventListener('click', () => importDialog.querySelector('input').click());
    importDialog.addEventListener('close', () => { readVersion++; pendingImport = null; });
    importDialog.querySelector('input').addEventListener('change', async event => {
      const version = ++readVersion;
      pendingImport = null; importButton.disabled = true; importFeedback.classList.remove('is-error');
      importDialog.querySelector('[data-import-counts]').textContent = '';
      const file = event.target.files[0];
      importDialog.querySelector('[data-import-filename]').textContent = file?.name || 'Nenhum arquivo selecionado';
      if (!file) { importFeedback.textContent = ''; return; }
      importFeedback.textContent = 'Lendo a cópia da pasta…';
      try {
        if (file.size > maxWorkFolderBackupBytes) throw new Error('Escolha uma cópia em JSON com até 20 MB.');
        const parsed = parseWorkFolderBackup(await file.text());
        if (version !== readVersion || !importDialog.isConnected || !importDialog.open) return;
        pendingImport = parsed;
        importDialog.querySelector('[data-import-counts]').textContent = workFolderCounts(parsed);
        importFeedback.textContent = `Arquivo verificado: ${file.name}`;
        importButton.disabled = false;
      } catch (error) {
        if (version !== readVersion || !importDialog.isConnected || !importDialog.open) return;
        importFeedback.textContent = error.message; importFeedback.classList.add('is-error');
      }
    });
    importButton.addEventListener('click', () => {
      if (!pendingImport) return;
      try {
        const result = folder.importData(pendingImport);
        importDialog.close(); onChange();
        const message = result.added ? `${result.added} ${result.added === 1 ? 'registro adicionado' : 'registros adicionados'} à pasta.${result.copied ? ` ${result.copied} ${result.copied === 1 ? 'versão diferente preservada como cópia' : 'versões diferentes preservadas como cópias'}.` : ''}` : 'Os registros desta cópia já estão na sua pasta.';
        onNotice(result.persisted ? message : 'Pasta importada apenas nesta sessão. O navegador não permitiu salvar; exporte uma cópia antes de sair.');
      } catch (error) { importFeedback.textContent = error.message; importFeedback.classList.add('is-error'); }
    });
  }
  return { render, bind };
}
