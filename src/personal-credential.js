import { createPersonalRecords, downloadPersonal, escapePersonal as esc } from './personal-records.js';
import { credentialFields, newPersonalCredential, personalCredentialKey, validatePersonalCredential } from './personal-credential-model.js';
import { readAgentSheet } from './agent-sheet-model.js';
import logoUrl from './assets/gms-logo.png';
import './personal-credential.css';

export function createPersonalCredential({ getAgentName, icon, storage }) {
  if (!storage) try { storage = globalThis.localStorage; } catch {}
  const store = createPersonalRecords(personalCredentialKey, validatePersonalCredential, storage);
  let current, imageEpoch = 0, drawingEpoch = 0;
  const status = () => store.persisted ? 'Credencial salva neste navegador.' : 'Credencial apenas nesta sessão. Exporte uma cópia antes de sair; o navegador não permitiu salvar.';
  function page() {
    current = store.reload()[0] || store.add(newPersonalCredential(readAgentSheet(storage).fields, getAgentName()));
    return `<section class="personal-credential" aria-labelledby="personal-credential-title"><div class="op-section-heading"><div><span class="op-kicker">IDENTIFICAÇÃO FUNCIONAL</span><h1 id="personal-credential-title">Minha credencial</h1><p>O seu registro de identificação na G.M.S.</p></div><a href="#/minha-ficha" class="op-link">Consultar minha ficha ${icon('arrow')}</a></div><div class="credential-personal-layout"><div><div class="credential-art" role="img" aria-label="Credencial pessoal da G.M.S." aria-busy="true"><p>Preparando credencial…</p></div><div class="op-actions credential-downloads"><button type="button" class="op-button" data-credential-png>Exportar imagem PNG</button><button type="button" class="op-button" data-credential-pdf>Exportar PDF</button></div><p class="op-local-note">Identificação narrativa pessoal. Não libera arquivos nem altera seu nome de acesso ao terminal.</p></div><form class="personal-credential-editor"><div class="op-actions"><button type="button" class="op-text-button" data-credential-from-sheet>Preencher com minha ficha</button></div>${Object.entries(credentialFields).filter(([key]) => key !== 'photo').map(([key, [label, max]]) => `<label for="credential-personal-${key}">${label}</label><input id="credential-personal-${key}" name="${key}" type="${key === 'issued' ? 'date' : 'text'}" value="${esc(current[key])}" maxlength="${max}">`).join('')}<label for="credential-personal-photo">Retrato do agente</label><input id="credential-personal-photo" type="file" accept="image/png,image/jpeg,image/webp"><p class="op-local-note">PNG, JPG ou WebP, até 8 MB. A imagem fica apenas neste navegador.</p><button type="button" class="op-text-button" data-credential-remove-photo ${current.photo ? '' : 'disabled'}>Remover retrato</button><p role="status" class="personal-save-status" data-personal-credential-status>${status()}</p></form></div></section>`;
  }
  function bind() {
    const root = document.querySelector('.personal-credential'); if (!root) return;
    let base = structuredClone(current); const invalid = new Set(); let art;
    const feedback = root.querySelector('[data-personal-credential-status]');
    const say = (text, error = false) => { feedback.textContent = text; feedback.classList.toggle('personal-warning', error); };
    const controls = root.querySelectorAll('[data-credential-png],[data-credential-pdf]');
    async function draw() {
      const epoch = ++drawingEpoch; controls.forEach(button => { button.disabled = true; });
      try {
        const { credentialCanvas } = await import('./personal-credential-art.js'); const canvas = await credentialCanvas(current);
        if (epoch !== drawingEpoch || !root.isConnected) return;
        art = canvas; const target = root.querySelector('.credential-art'); target.replaceChildren(canvas); target.setAttribute('aria-busy', 'false'); target.setAttribute('aria-label', `Credencial de ${current.name || 'agente'}, ${current.registry}`); controls.forEach(button => { button.disabled = invalid.size > 0; });
      } catch (error) { if (root.isConnected && epoch === drawingEpoch) say(error.message, true); }
    }
    function update(patch) {
      const expected = Object.fromEntries(Object.keys(patch).map(key => [key, base[key]]));
      current = store.update('personal-agent', patch, expected);
      for (const key of Object.keys(patch)) base[key] = current[key];
      root.querySelector('[data-credential-remove-photo]').disabled = !current.photo;
      say(status(), !store.persisted); void draw();
    }
    root.querySelector('form').addEventListener('submit', event => event.preventDefault());
    root.querySelectorAll('.personal-credential-editor input[name]').forEach(input => input.addEventListener('input', () => {
      try { update({ [input.name]: input.value }); invalid.delete(input.name); input.removeAttribute('aria-invalid'); }
      catch (error) { invalid.add(input.name); input.setAttribute('aria-invalid', 'true'); controls.forEach(button => { button.disabled = true; }); say(error.message, true); }
    }));
    root.querySelector('[data-credential-from-sheet]').addEventListener('click', () => {
      try {
        const fields = readAgentSheet(storage).fields;
        const patch = { name: (fields.nome || getAgentName()).slice(0, 100), species: fields.especie === '-' ? '' : fields.especie, role: (fields.cargo || current.role).slice(0, 100) };
        update(patch); for (const key of Object.keys(patch)) { root.querySelector(`[name="${key}"]`).value = current[key]; invalid.delete(key); root.querySelector(`[name="${key}"]`).removeAttribute('aria-invalid'); }
      } catch (error) { say(error.message, true); }
    });
    root.querySelector('#credential-personal-photo').addEventListener('change', async event => {
      const file = event.target.files[0]; if (!file) return; const epoch = ++imageEpoch;
      say('Preparando o retrato…');
      try { const { readCredentialPortrait } = await import('./personal-credential-art.js'); const photo = await readCredentialPortrait(file); if (epoch === imageEpoch && root.isConnected) update({ photo }); }
      catch (error) { if (epoch === imageEpoch && root.isConnected) say(error.message, true); } finally { event.target.value = ''; }
    });
    root.querySelector('[data-credential-remove-photo]').addEventListener('click', () => { try { imageEpoch++; update({ photo: '' }); } catch (error) { say(error.message, true); } });
    for (const kind of ['png', 'pdf']) root.querySelector(`[data-credential-${kind}]`).addEventListener('click', async event => {
      const button = event.currentTarget; button.disabled = true;
      try {
        if (invalid.size) throw new Error('Confira os campos destacados antes de exportar.');
        const { credentialCanvas, canvasPng, credentialPdf } = await import('./personal-credential-art.js');
        const saved = store.reload()[0]; if (!saved) throw new Error('Reabra a credencial antes de exportar.');
        const blob = await canvasPng(await credentialCanvas(saved));
        downloadPersonal(kind === 'png' ? blob : new Blob([await credentialPdf(blob)], { type: 'application/pdf' }), `GMS-credencial.${kind}`); say('Credencial preparada para download.');
      } catch (error) { say(error.message, true); } finally { button.disabled = invalid.size > 0; }
    });
    void draw();
  }
  return { page, bind };
}
