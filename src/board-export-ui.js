import './board-export.css';

export function createBoardExport({ folder, getRecords }) {
  let dispose = () => {};
  function bind({ root, filter, positions }) {
    dispose();
    if (!root) { dispose = () => {}; return; }
    const dialog = document.createElement('dialog'); dialog.className = 'board-export-dialog'; dialog.setAttribute('aria-labelledby', 'board-export-title');
    dialog.innerHTML = `<div class="folder-dialog-heading"><div><span class="op-kicker">CÓPIA VISUAL DO ARQUIVO</span><h2 id="board-export-title">Exportar quadro de evidências</h2></div><button type="button" class="op-text-button" data-close-board-export>Fechar</button></div><p>Quadro de cortiça, cartões de papel, alfinetes e linhas. A exportação enquadra todas as evidências do filtro atual.</p><div class="board-export-preview" data-board-export-preview></div><p class="board-export-feedback" role="status" data-board-export-feedback></p><div class="op-actions"><button type="button" class="op-button" data-download-board-export="png" disabled>Baixar imagem (.png)</button><button type="button" class="op-button" data-download-board-export="pdf" disabled>Baixar PDF</button></div><p class="op-local-note">Os cartões apresentam um resumo. A cópia JSON da pasta preserva os textos completos e permite importá-los novamente.</p>`;
    root.append(dialog);
    let generation = 0, objectUrl = '', artifact, core, model;
    const output = dialog.querySelector('[data-board-export-feedback]');
    const buttons = [...dialog.querySelectorAll('[data-download-board-export]')];
    const clear = () => { generation++; if (objectUrl) URL.revokeObjectURL(objectUrl); objectUrl = ''; artifact = null; dialog.querySelector('[data-board-export-preview]').replaceChildren(); };
    dispose = () => { clear(); if (dialog.open) dialog.close(); dialog.remove(); };
    root.querySelector('[data-open-board-export]').addEventListener('click', async () => {
      clear(); const version = generation; buttons.forEach(button => button.disabled = true); output.textContent = 'Montando a cópia do quadro…'; dialog.showModal();
      const snapshot = structuredClone(folder.reload()); const layout = structuredClone(positions);
      try {
        core = await import('./evidence-board-export.js'); model = core.corkBoardModel(snapshot, getRecords(), { missionId: filter, positions: layout });
        const result = await core.renderCorkBoard(model);
        if (generation !== version || !dialog.isConnected || !dialog.open) return;
        artifact = result; objectUrl = URL.createObjectURL(result.blob);
        const image = new Image(); image.src = objectUrl; image.alt = 'Prévia do quadro em cortiça, com evidências presas por alfinetes e conectadas por fios vermelhos.'; image.width = result.canvas.width; image.height = result.canvas.height;
        dialog.querySelector('[data-board-export-preview]').append(image);
        output.textContent = result.missingImages ? `Quadro preparado. ${result.missingImages} imagens não puderam ser carregadas; os registros foram mantidos.` : `${model.nodes.length} evidências e ${model.links.length} ligações. Imagem e PDF usam esta mesma aparência.`;
        buttons.forEach(button => button.disabled = false);
      } catch (error) { if (generation === version && dialog.isConnected) output.textContent = `Não foi possível preparar o quadro. ${error.message}`; }
    });
    dialog.querySelector('[data-close-board-export]').addEventListener('click', () => dialog.close()); dialog.addEventListener('close', clear);
    buttons.forEach(button => button.addEventListener('click', async () => {
      if (!artifact) return; const version = generation; buttons.forEach(item => item.disabled = true);
      try {
        output.textContent = button.dataset.downloadBoardExport === 'pdf' ? 'Preparando o PDF…' : 'Preparando a imagem…';
        const blob = button.dataset.downloadBoardExport === 'pdf' ? await core.corkBoardPdf(artifact.blob, model.title) : artifact.blob;
        if (generation !== version || !dialog.isConnected || !dialog.open) return;
        const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `GMS-quadro-de-evidencias.${button.dataset.downloadBoardExport}`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
        output.textContent = 'Arquivo preparado para download.';
      } catch (error) { if (generation === version && dialog.isConnected) output.textContent = error.message; }
      finally { if (generation === version && dialog.isConnected) buttons.forEach(item => item.disabled = false); }
    }));
  }
  return { bind };
}
