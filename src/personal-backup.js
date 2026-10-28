import { escapePersonal as esc, downloadPersonal } from './personal-records.js';
import { importPersonalBackup, maxPersonalBackupBytes, parsePersonalBackup, serializePersonalBackup, snapshotPersonalStorage } from './personal-backup-model.js';
import { commitPersonalStorage } from './personal-storage.js';

const counts = data => `<ul class="backup-summary"><li><strong>${esc(data.sheet.nome || data.name || 'Sem nome')}</strong><span>Identificação e ficha</span></li><li><strong>${data.folder.notes.length}</strong><span>Anotações</span></li><li><strong>${data.reports.length}</strong><span>Relatórios pessoais</span></li><li><strong>${data.highlights.length}</strong><span>Grifos e comentários</span></li><li><strong>${data.folder.documents.length + data.folder.people.length + data.folder.localities.length}</strong><span>Referências</span></li><li><strong>${data.folder.connections.length}</strong><span>Ligações do quadro</span></li></ul>`;
export function createPersonalBackup({ getData, onRestore, storage }) {
  if (!storage) try { storage = localStorage; } catch {}
  let pending, baseline, epoch = 0, lastImport;
  function page() {
    return `<section class="personal-backup" aria-labelledby="personal-backup-title"><header class="experience-heading"><div><span class="op-kicker">ARQUIVO PESSOAL</span><h1 id="personal-backup-title">Salvar meus dados</h1><p>Uma cópia para guardar seu agente e todo o seu trabalho.</p></div></header><p class="experience-notice">Os registros pessoais ficam neste navegador. O backup permite recuperá-los ou levá-los para outro dispositivo.</p><div class="experience-columns"><section class="backup-export"><h2>Exportar backup completo</h2><p>Inclui ficha, credencial com retrato, missão atual, pasta, quadro, lixeira, relatórios, grifos, arquivos salvos e preferências.</p>${counts(getData())}<button type="button" class="op-button" data-export-personal-backup>Exportar backup completo</button><p role="status" data-backup-export-feedback></p></section><section class="backup-import"><h2>Importar backup completo</h2><p>Notas e registros são reunidos com os atuais. Versões diferentes são preservadas como cópias.</p><label for="personal-backup-file">Arquivo JSON do backup completo</label><div class="backup-file-picker"><button type="button" class="op-button" data-select-personal-backup>Selecionar arquivo</button><span data-personal-backup-filename>Nenhum arquivo selecionado</span></div><input id="personal-backup-file" type="file" accept=".json,application/json" hidden><div data-personal-backup-preview></div><label for="personal-backup-policy">Identificação, ficha e credencial</label><select id="personal-backup-policy"><option value="merge">Preservar os dados atuais já preenchidos</option><option value="restore">Restaurar os dados da cópia</option></select><p class="op-local-note">Campos de identidade já preenchidos são preservados na primeira opção. A segunda restaura também a paleta e a preferência de som.</p><button type="button" class="op-button" data-confirm-personal-backup disabled>Importar dados</button><p role="status" data-backup-import-feedback></p><button type="button" class="op-text-button" data-undo-personal-backup ${lastImport ? '' : 'hidden'}>Desfazer última importação desta sessão</button></section></div><details class="experience-details"><summary>Exportações individuais</summary><p>Os PDFs originais da ficha e os relatórios editáveis continuam disponíveis nas suas seções.</p><div class="op-actions"><a class="op-link" href="#/minha-ficha">Ficha de agente →</a><a class="op-link" href="#/pasta-de-trabalho?aba=relatorios">Relatórios pessoais →</a><a class="op-link" href="#/minha-credencial">Credencial →</a></div></details></section>`;
  }
  function bind() {
    const root = document.querySelector('.personal-backup'); if (!root) return;
    root.querySelector('[data-export-personal-backup]').addEventListener('click', () => {
      const feedback = root.querySelector('[data-backup-export-feedback]');
      try { const text = serializePersonalBackup(getData()); downloadPersonal(new Blob([text], { type: 'application/json;charset=utf-8' }), `GMS-backup-completo-${new Date().toLocaleDateString('sv-SE')}.json`); feedback.textContent = 'Backup completo preparado para download.'; } catch (error) { feedback.textContent = error.message; }
    });
    const feedback = root.querySelector('[data-backup-import-feedback]'), confirm = root.querySelector('[data-confirm-personal-backup]');
    root.querySelector('[data-select-personal-backup]').addEventListener('click', () => root.querySelector('#personal-backup-file').click());
    root.querySelector('#personal-backup-file').addEventListener('change', async event => {
      const token = ++epoch; pending = null; confirm.disabled = true; root.querySelector('[data-personal-backup-preview]').textContent = '';
      const file = event.target.files[0]; root.querySelector('[data-personal-backup-filename]').textContent = file?.name || 'Nenhum arquivo selecionado'; if (!file) return;
      feedback.textContent = 'Conferindo o backup…';
      try {
        if (file.size > maxPersonalBackupBytes) throw new Error('Selecione um backup com até 32 MB.');
        const data = parsePersonalBackup(await file.text());
        if (token !== epoch || !root.isConnected) return;
        baseline = snapshotPersonalStorage(storage); pending = data; root.querySelector('[data-personal-backup-preview]').innerHTML = counts(data);
        feedback.textContent = 'Backup verificado. Confira os dados e a opção de identificação antes de importar.'; confirm.disabled = false;
      } catch (error) { if (token === epoch && root.isConnected) feedback.textContent = error.message; }
    });
    confirm.addEventListener('click', () => {
      if (!pending) return;
      try {
        lastImport = importPersonalBackup(storage, pending, { current: getData(), expected: baseline, restoreIdentity: root.querySelector('#personal-backup-policy').value === 'restore' });
        pending = null; confirm.disabled = true; onRestore('Backup importado. Seus registros foram reunidos.');
      } catch (error) { feedback.textContent = error.message; }
    });
    root.querySelector('[data-undo-personal-backup]').addEventListener('click', () => {
      if (!lastImport) return;
      try { commitPersonalStorage(storage, lastImport.before, lastImport.after); lastImport = null; onRestore('Importação desfeita. Os dados anteriores foram restaurados.'); }
      catch (error) { feedback.textContent = error.message; }
    });
  }
  return { page, bind };
}
