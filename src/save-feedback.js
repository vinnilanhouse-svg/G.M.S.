export function beginSave(target) {
  if (!target) return;
  target.dataset.saveState = 'saving';
  target.textContent = 'Salvando…';
}
export function finishSave(target, persisted, error = '') {
  if (!target) return;
  target.dataset.saveState = persisted && !error ? 'saved' : 'error';
  target.textContent = error || (persisted
    ? `Salvo neste dispositivo · ${new Date().toLocaleTimeString('pt-BR')}`
    : 'Não foi possível salvar neste dispositivo. Alterações apenas nesta sessão; exporte uma cópia antes de sair.');
}
