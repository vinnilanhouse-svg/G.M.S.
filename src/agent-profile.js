import { escapePersonal as esc } from './personal-records.js';
import { agentNameStorageKey } from './agent-identity.js';
import { agentSheetKey } from './agent-sheet-model.js';
import { personalCredentialKey } from './personal-credential-model.js';
import { agentProfileKey } from './agent-profile-model.js';

export function profileNavigation(active) {
  const tabs = [['perfil', '#/meu-agente', 'Perfil'], ['ficha', '#/minha-ficha', 'Ficha completa'], ['campo', '#/minha-ficha?aba=campo', 'Em campo'], ['credencial', '#/minha-credencial', 'Credencial']];
  return `<nav class="profile-navigation" aria-label="Meu agente">${tabs.map(([key, url, label]) => `<a href="${url}" ${key === active ? 'aria-current="page" class="selected"' : ''}>${label}</a>`).join('')}</nav>`;
}
export function createAgentProfile({ getData, onSave, storage }) {
  if (!storage) try { storage = localStorage; } catch {}
  let baseline;
  function page() {
    const data = getData(), credential = data.credential;
    try { baseline = Object.fromEntries([agentNameStorageKey, agentSheetKey, personalCredentialKey, agentProfileKey].map(key => [key, storage.getItem(key)])); } catch { baseline = {}; }
    const name = data.name || data.sheet.nome || credential?.name || '';
    const names = [['access', 'Acesso ao terminal', data.name], ['sheet', 'Ficha de agente', data.sheet.nome], ['credential', 'Credencial', credential?.name || '']];
    const matched = new Set(names.map(([, , value]) => value).filter(Boolean)).size <= 1;
    return `${profileNavigation('perfil')}<section class="agent-profile" aria-labelledby="agent-profile-title"><header class="experience-heading"><div><span class="op-kicker">IDENTIFICAÇÃO FUNCIONAL</span><h1 id="agent-profile-title">Meu agente</h1><p>Nome de acesso, ficha e credencial reunidos no seu perfil.</p></div><a class="op-button" href="#/minha-ficha?aba=campo">Abrir visão de campo →</a></header><div class="profile-summary"><div><span>Agente</span><strong>${esc(data.sheet.nome || credential?.name || data.name || 'Sem identificação')}</strong></div><div><span>Espécie</span><strong>${esc(data.sheet.especie === '-' ? credential?.species || 'Não informada' : data.sheet.especie)}</strong></div><div><span>Matrícula</span><strong>${esc(credential?.registry || 'Preencha sua credencial')}</strong></div></div><div class="experience-columns"><form class="profile-identification-form"><h2>Identificação</h2><label for="profile-agent-name">Nome de acesso</label><input id="profile-agent-name" name="name" value="${esc(name)}" maxlength="60" autocomplete="off" required><label class="experience-checkbox"><input type="checkbox" name="syncName" ${data.profile.syncName ? 'checked' : ''}><span>Usar esse nome no acesso, na ficha e na credencial</span></label><p class="op-local-note">Quando ativada, a sincronização também acompanha as próximas alterações de nome na ficha ou credencial. Os demais campos continuam independentes.</p><button type="submit" class="op-button">Salvar identificação</button><p role="status" data-profile-feedback></p></form><section class="profile-names"><h2>Seus registros</h2><p>${matched ? 'As identificações preenchidas usam o mesmo nome.' : 'Você pode escolher um dos nomes abaixo para sincronizar seus registros.'}</p><ul>${names.map(([source, label, value]) => `<li><div><span>${label}</span><strong>${esc(value || 'Ainda não preenchido')}</strong></div>${value && !matched ? `<button type="button" class="op-text-button" data-profile-name="${esc(value)}">Usar este nome</button>` : ''}</li>`).join('')}</ul><a href="#/salvar-meus-dados" class="op-link">Salvar uma cópia de todos os meus dados →</a></section></div></section>`;
  }
  function bind() {
    const form = document.querySelector('.profile-identification-form'); if (!form) return;
    const feedback = form.querySelector('[data-profile-feedback]');
    document.querySelectorAll('[data-profile-name]').forEach(button => button.addEventListener('click', () => {
      const name = button.dataset.profileName;
      if (name.length > 60) { feedback.textContent = 'Este nome tem mais de 60 caracteres. Digite uma versão de identificação no campo ao lado.'; return; }
      form.elements.name.value = name; form.elements.syncName.checked = true; form.elements.name.focus();
    }));
    form.addEventListener('submit', event => {
      event.preventDefault();
      try { onSave(form.elements.name.value, form.elements.syncName.checked, baseline); }
      catch (error) { feedback.textContent = error.message; }
    });
  }
  return { page, bind };
}
