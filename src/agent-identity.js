// A identificação é local ao navegador e não concede credenciais de acesso.
export const agentNameStorageKey = 'gms-agent-name-v1';
const MAX_NAME_LENGTH = 60;

export function normalizeAgentName(value) {
  return typeof value === 'string'
    ? value.normalize('NFC').replace(/\s+/gu, ' ').trim().slice(0, MAX_NAME_LENGTH)
    : '';
}

export function readAgentName(storage) {
  try {
    return normalizeAgentName(storage.getItem(agentNameStorageKey));
  } catch {
    return '';
  }
}

export function saveAgentName(storage, value) {
  const name = normalizeAgentName(value);
  if (!name) return false;
  try {
    storage.setItem(agentNameStorageKey, name);
    return true;
  } catch {
    return false;
  }
}

export function requestAgentIdentification(logo, onConfirm) {
  const dialog = document.createElement('dialog');
  dialog.className = 'agent-identification';
  dialog.setAttribute('aria-labelledby', 'agent-identification-title');
  dialog.innerHTML = `
    <div class="agent-identification-brand"><img class="gms-mark" alt="" width="76" height="76"><span>GMS / ARQUIVO CENTRAL</span></div>
    <h2 id="agent-identification-title">Acesso de agente solicitado</h2>
    <p class="agent-identification-prompt">Identifique-se</p>
    <form novalidate>
      <label for="agent-identification-name">Nome do agente</label>
      <input id="agent-identification-name" name="agentName" type="text" maxlength="60" placeholder="Digite seu nome" autocomplete="name" aria-describedby="agent-identification-feedback" required autofocus>
      <p id="agent-identification-feedback" class="agent-identification-feedback" role="status"></p>
      <button type="submit">Confirmar identificação</button>
    </form>`;
  dialog.querySelector('img').src = logo;
  document.body.append(dialog);
  document.body.classList.add('agent-identification-open');
  const input = dialog.querySelector('input');
  const feedback = dialog.querySelector('#agent-identification-feedback');
  let submitted = false;

  dialog.addEventListener('cancel', event => event.preventDefault());
  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    feedback.textContent = '';
  });
  dialog.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    if (submitted) return;
    const name = normalizeAgentName(input.value);
    if (!name) {
      input.setAttribute('aria-invalid', 'true');
      feedback.textContent = 'Digite seu nome para continuar.';
      input.focus();
      return;
    }
    submitted = true;
    let persisted = false;
    try { persisted = saveAgentName(localStorage, name); } catch { /* Navegador sem armazenamento disponível. */ }
    dialog.close();
    dialog.remove();
    document.body.classList.remove('agent-identification-open');
    onConfirm({name, persisted});
  });
  dialog.showModal();
  input.focus({preventScroll: true});
}
