import { agentSheetFields, agentSheetSkills, agentSheetSource } from './agent-sheet-schema.js';
import { agentSheetAttributes, calculateAgentSheet, createAgentSheetStore, maxAgentSheetBytes, parseAgentSheet, serializeAgentSheet } from './agent-sheet-model.js';
import { speciesIcons, constructIcons } from './species-icons.js';
import { createAgentSheetRolls } from './agent-sheet-rolls.js';
import './agent-sheet-rolls.css';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const speciesKeys = ['abissais', 'anjo', 'caipora', 'capelobo', 'centauro', 'constructo', 'constructo', 'constructo', 'corpo-seco', 'curupira', 'demonio', 'fada', 'gorgona', 'humano', 'leprechaun', 'lobisomem', 'mumia', 'ogro', 'poltergeist', 'saci', 'salamandra', 'vampiro'];
const speciesVisual = species => {
  const index = agentSheetFields.especie.options.indexOf(species);
  return index === 6 ? constructIcons.metal : index === 7 ? constructIcons.barro : index >= 0 && index < 22 ? speciesIcons[`especie-${speciesKeys[index]}`] : null;
};
const tabs = [['ficha', '01', 'Ficha'], ['habilidades', '02', 'Habilidades e combate'], ['inventario', '03', 'Inventário e histórico'], ['rolagens', '04', 'Central de rolagens']];

export function createAgentSheet({ icon, onNotice, onChange, storage }) {
  if (!storage) try { storage = globalThis.localStorage; } catch {}
  const store = createAgentSheetStore(storage);
  const rolls = createAgentSheetRolls({ getFields() {
    if (invalid.size) throw new Error('Revise os campos destacados na ficha antes de fazer um teste.');
    store.reload(); return store.state.fields;
  } });
  const invalid = new Map();
  let pendingImport = null;
  let importRevision = 0;
  let reading = 0;
  let values = calculateAgentSheet(store.state.fields);
  const savedMessage = () => store.persisted ? 'Ficha salva neste navegador.' : 'Ficha apenas nesta sessão. Exporte uma cópia antes de sair; o navegador não permitiu salvar.';

  function field(name, { label = agentSheetFields[name].label, compact = false, area = false, check = false } = {}) {
    const spec = agentSheetFields[name];
    const id = `sheet-${name}`;
    const shared = `id="${id}" data-sheet-field="${name}" aria-describedby="error-${id}"`;
    const control = spec.readOnly ? `<output id="${id}" data-sheet-output="${name}" aria-label="${esc(label)}">${esc(values[name])}</output>` : spec.options ? `<select ${shared}>${spec.options.map(option => `<option value="${esc(option)}" ${values[name] === option ? 'selected' : ''}>${esc(option)}</option>`).join('')}</select>` : area || spec.multiline ? `<textarea ${shared} rows="${name === 'historia' ? 12 : 3}">${esc(values[name])}</textarea>` : `<input ${shared} type="text" ${spec.numeric ? 'inputmode="decimal"' : ''} value="${esc(values[name])}" autocomplete="off">`;
    const heading = check ? `<div class="sheet-roll-field-label"><label class="sr-only" for="${id}">${esc(label)}</label>${rolls.trigger(name, label)}</div>` : `<label class="${compact ? 'sr-only' : ''}" for="${id}">${esc(label)}</label>`;
    return `<div class="sheet-field ${spec.readOnly ? 'sheet-field-auto' : ''} ${compact ? 'sheet-field-compact' : ''}">${heading}${control}<span class="sheet-print-value" data-sheet-print="${name}">${esc(values[name])}</span>${!spec.readOnly ? `<span class="sheet-field-error" id="error-${id}" hidden></span>` : ''}</div>`;
  }
  function segments(count, graphic) {
    const filled = Number(values[graphic].replace(/^[vep]/, ''));
    return `<div class="sheet-segments" data-sheet-graphic="${graphic}" style="--segments:${count}" role="img" aria-label="${filled} de ${count} segmentos preenchidos">${Array.from({ length: count }, (_, index) => `<i class="${index < filled ? 'filled' : ''}" aria-hidden="true"></i>`).join('')}</div>`;
  }
  function resource(title, current, maximum, graphic, count, type) {
    return `<section class="sheet-resource" data-sheet-resource="${type}"><h3 ${type === 'essencia' ? 'data-sheet-resource-label' : ''}>${title}</h3><div>${field(current, { label: 'Atual' })}${field(maximum, { label: 'Máximo' })}</div>${segments(count, graphic)}</section>`;
  }
  function skillTable(skills) {
    return `<table class="sheet-skills"><caption class="sr-only">Perícias: base, bônus e total</caption><thead><tr><th>Perícias</th><th>Base</th><th>Bônus</th><th>Total</th></tr></thead><tbody>${skills.map(skill => `<tr><th scope="row">${rolls.trigger(skill.id, skill.label)}</th>${['base', 'bonus', 'total'].map(part => `<td>${field(`${skill.id}_${part}`, { label: `${skill.label} — ${part === 'base' ? 'Base' : part === 'bonus' ? 'Bônus' : 'Total'}`, compact: true })}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  function repeatedRows(kind, count, columns) {
    return `<div class="sheet-entry-rows" data-sheet-rows="${kind}">${Array.from({ length: count }, (_, index) => `<fieldset class="sheet-entry-row sheet-entry-${kind}"><legend>${kind === 'habilidade' ? 'Habilidade' : kind === 'ataque' ? 'Ataque' : 'Item'} ${String(index + 1).padStart(2, '0')}</legend>${columns.map(([key, label, area]) => field(`${kind}_${index + 1}_${key}`, { label, area })).join('')}</fieldset>`).join('')}</div>`;
  }
  function page(query) {
    store.reload(); values = calculateAgentSheet(store.state.fields);
    const requested = new URLSearchParams(query).get('aba');
    const selected = tabs.some(([id]) => id === requested) ? requested : 'ficha';
    return `<section class="agent-sheet" aria-labelledby="agent-sheet-title"><header class="sheet-heading"><div><span class="op-kicker">REGISTRO PESSOAL · SISTEMA MONSTRÃO</span><h1 id="agent-sheet-title">Minha ficha de agente</h1><p>Identificação, capacidades e registros de campo do seu agente.</p></div><span class="sheet-form-code">GMS-FC / 01—03</span></header><div class="sheet-actions"><button type="button" class="op-button" data-export-agent-pdf>${icon('external')}Exportar PDF</button><button type="button" class="op-text-button" data-open-sheet-import>Importar ficha</button><button type="button" class="op-text-button" data-export-agent-sheet>Backup JSON</button></div><div class="sheet-save-line"><span role="status" class="sheet-save-status ${store.persisted ? '' : 'sheet-save-warning'}" data-sheet-save>${savedMessage()}</span><span class="sheet-field-legend"><i></i>EDITÁVEL <b></b>AUTOMÁTICO</span></div><nav class="sheet-tabs" aria-label="Páginas da ficha">${tabs.map(([id, number, title]) => `<a href="#/minha-ficha${id === 'ficha' ? '' : `?aba=${id}`}" ${selected === id ? 'aria-current="page" class="selected"' : ''}><span>${number}</span>${title}</a>`).join('')}</nav><form class="agent-sheet-form" novalidate>
      <section class="sheet-paper" data-sheet-page="ficha" ${selected !== 'ficha' ? 'hidden' : ''}><div class="sheet-paper-heading"><div><span>01 / IDENTIFICAÇÃO E CAPACIDADES</span><h2 data-sheet-character-name>${esc(values.nome || 'Ficha de registo de agente')}</h2></div><small>GMS-FC / 01</small></div><div class="sheet-identification-grid"><div class="sheet-name-fields">${field('nome')}${field('jogador')}</div><div class="sheet-species-fields">${field('especie')}${field('especialidade')}${field('nivel')}</div><div class="sheet-appearance-fields">${['genero', 'idade', 'altura', 'olhos', 'cabelos'].map(name => field(name)).join('')}</div><div class="sheet-affiliation-fields">${['grupo', 'cargo', 'pe_atual', 'pe_proximo'].map(name => field(name)).join('')}</div></div><div class="sheet-resources">${resource('Pontos de Vida', 'vida_atual', 'vida_max', 'grafico_vida', 15, 'vida')}${resource(values.recurso_nome, 'essencia_atual', 'essencia_max', 'grafico_essencia', 16, 'essencia')}</div><p class="sheet-test-hint">Clique no nome de um atributo ou de uma perícia para fazer um teste com d20. <span>Perícias com * exigem treinamento, registrado na coluna Bônus.</span></p><div class="sheet-attribute-layout"><section class="sheet-attributes" aria-labelledby="sheet-attributes-title"><h3 id="sheet-attributes-title">Atributos <small>RÉGUA DE 1 A 20</small></h3>${agentSheetAttributes.map(name => `<div class="sheet-attribute sheet-attribute-${name}">${field(`attr_${name}`, { label: name === 'coracao' ? 'Coração' : name[0].toUpperCase() + name.slice(1), check: true })}<div><div class="sheet-ruler-labels" aria-hidden="true">${Array.from({ length: 20 }, (_, index) => `<span>${String(index + 1).padStart(2, '0')}</span>`).join('')}</div>${segments(20, `grafico_${name}`)}</div></div>`).join('')}</section><aside class="sheet-species-visual"><h3>Imagem do Personagem</h3><div data-sheet-species-image></div><p data-sheet-species-label>${values.especie === '-' ? 'Selecione a Espécie no campo acima' : esc(values.especie)}</p></aside></div><div class="sheet-skill-columns">${skillTable(agentSheetSkills.slice(0, 14))}${skillTable(agentSheetSkills.slice(14))}</div></section>
      <section class="sheet-paper" data-sheet-page="habilidades" ${selected !== 'habilidades' ? 'hidden' : ''}><div class="sheet-paper-heading"><div><span>02 / REGISTRO DE CAPACIDADES</span><h2>Habilidades e capacidade de combate</h2></div><small>GMS-FC / 02</small></div><section class="sheet-form-section"><h3>Habilidades</h3>${repeatedRows('habilidade', agentSheetSource.abilityRows, [['nome', 'Nome'], ['descricao', 'Descrição', true], ['acao', 'Ação'], ['custo', 'Custo']])}</section><section class="sheet-form-section"><h3>Ataques</h3>${repeatedRows('ataque', agentSheetSource.attackRows, [['nome', 'Ataque'], ['dano', 'Dano'], ['atributo', 'Atributo'], ['tipo', 'Tipo']])}</section></section>
      <section class="sheet-paper" data-sheet-page="inventario" ${selected !== 'inventario' ? 'hidden' : ''}><div class="sheet-paper-heading"><div><span>03 / EQUIPAMENTOS E MEMÓRIA</span><h2>Inventário e histórico</h2></div><small>GMS-FC / 03</small></div><section class="sheet-form-section"><div class="sheet-inventory-heading"><h3>Inventário</h3>${field('peso_max', { label: 'Peso Máx.' })}${field('peso_total', { label: 'Peso Total' })}</div>${repeatedRows('item', agentSheetSource.inventoryRows, [['nome', 'Item'], ['descricao', 'Descrição'], ['peso', 'Peso']])}</section><section class="sheet-form-section"><h3>História do Personagem</h3>${field('historia', { label: 'História do Personagem', area: true })}</section></section></form>${rolls.page(selected !== 'rolagens')}<p class="sheet-reference">Ficha Monstrão · Campos e automatizações conforme o documento fornecido · Registro pessoal deste navegador.</p>
      ${rolls.dialog()}<dialog class="sheet-import-dialog" aria-labelledby="sheet-import-title"><div class="folder-dialog-heading"><h2 id="sheet-import-title">Importar ficha de agente</h2><button type="button" class="op-text-button" data-close-sheet-import>Fechar</button></div><p>Selecione o PDF editável da ficha Monstrão ou um backup em JSON exportado por este site. A importação substituirá sua ficha neste navegador. Exporte a atual antes de continuar, caso queira guardá-la.</p><button type="button" class="op-button" data-select-sheet-file>Selecionar arquivo</button><input type="file" accept=".pdf,.json,application/pdf,application/json" data-sheet-import-file hidden><p data-sheet-import-preview class="sheet-import-preview"></p><p data-sheet-import-feedback role="status"></p><button type="button" class="op-button" data-confirm-sheet-import disabled>Usar ficha importada</button></dialog></section>`;
  }
  function status(message = savedMessage(), warning = !store.persisted) {
    const target = document.querySelector('[data-sheet-save]');
    if (target) { target.textContent = message; target.classList.toggle('sheet-save-warning', warning); }
  }
  function refresh({ inputs = false } = {}) {
    const root = document.querySelector('.agent-sheet');
    if (!root) return;
    values = calculateAgentSheet(store.state.fields);
    root.querySelectorAll('[data-sheet-output],[data-sheet-print]').forEach(output => { output.textContent = values[output.dataset.sheetOutput || output.dataset.sheetPrint]; });
    if (inputs) root.querySelectorAll('[data-sheet-field]').forEach(input => { if (input !== document.activeElement && !invalid.has(input.dataset.sheetField)) input.value = store.state.fields[input.dataset.sheetField]; });
    root.querySelector('[data-sheet-character-name]').textContent = values.nome || 'Ficha de registo de agente';
    root.querySelector('[data-sheet-resource-label]').textContent = values.recurso_nome;
    root.querySelector('[data-sheet-resource="essencia"]').classList.toggle('sheet-resource-energy', values.especie === 'Constructo de Metal');
    root.querySelectorAll('[data-sheet-graphic]').forEach(graphic => {
      const filled = Number(values[graphic.dataset.sheetGraphic].replace(/^[vep]/, ''));
      [...graphic.children].forEach((segment, index) => segment.classList.toggle('filled', index < filled));
      graphic.setAttribute('aria-label', `${filled} de ${graphic.children.length} segmentos preenchidos`);
    });
    const imageBox = root.querySelector('[data-sheet-species-image]');
    const visual = speciesVisual(values.especie);
    const image = imageBox.querySelector('img');
    if (visual && image?.getAttribute('src') !== visual.src) imageBox.innerHTML = `<img src="${esc(visual.src)}" alt="Símbolo da espécie ${esc(values.especie)}" width="${visual.width}" height="${visual.height}">`;
    if (!visual) imageBox.replaceChildren();
    root.querySelector('[data-sheet-species-label]').textContent = values.especie === '-' ? 'Selecione a Espécie no campo acima' : values.especie;
  }
  function bind() {
    const root = document.querySelector('.agent-sheet');
    if (!root) return;
    refresh();
    rolls.bind(root);
    root.querySelector('form').addEventListener('submit', event => event.preventDefault());
    root.querySelector('[data-export-agent-pdf]').addEventListener('click', async event => {
      const button = event.currentTarget; button.disabled = true;
      try {
        store.reload(); const fields = structuredClone(store.state.fields);
        status('Preparando o PDF original da ficha…', false);
        const { exportAgentSheetPdf } = await import('./agent-sheet-pdf.js');
        const bytes = await exportAgentSheetPdf(fields, message => status(message, false));
        const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
        const link = document.createElement('a'); link.href = url; link.download = `GMS-ficha-${(fields.nome || 'agente').replace(/[^\p{L}\p{N} _-]/gu, '').slice(0, 70) || 'agente'}.pdf`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        status('PDF original preenchido e preparado para download.', false);
      } catch (error) { status(error.message || 'Não foi possível preparar o PDF. Sua ficha continua salva no navegador.', true); }
      finally { if (button.isConnected) button.disabled = false; }
    });
    root.querySelectorAll('[data-sheet-field]').forEach(input => {
      const name = input.dataset.sheetField;
      const error = root.querySelector(`#error-sheet-${name}`);
      function save() {
        try {
          store.updateField(name, input.value); invalid.delete(name); input.removeAttribute('aria-invalid'); error.hidden = true; refresh(); status();
        } catch (failure) {
          invalid.set(name, input.value); input.setAttribute('aria-invalid', 'true'); error.textContent = failure.message; error.hidden = false; status('Revise o campo destacado. Os cálculos mantêm o último valor válido.', true);
        }
      }
      input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', save);
      input.addEventListener('blur', () => {
        if (invalid.has(name)) {
          input.value = store.state.fields[name]; invalid.delete(name); input.removeAttribute('aria-invalid'); error.hidden = true; status('Valor não aceito pela ficha. O último valor válido foi mantido.', true);
        } else input.value = store.state.fields[name];
      });
    });
    root.querySelector('[data-export-agent-sheet]').addEventListener('click', () => {
      try {
        store.reload(); const text = serializeAgentSheet(store.state);
        const url = URL.createObjectURL(new Blob([text], { type: 'application/json;charset=utf-8' }));
        const link = document.createElement('a'); link.href = url; link.download = `GMS-ficha-${(store.state.fields.nome || 'agente').replace(/[^\p{L}\p{N} _-]/gu, '').slice(0, 70) || 'agente'}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        status('Cópia da ficha preparada para download.', false);
      } catch (error) { status(error.message, true); }
    });
    root.querySelector('[data-print-agent-sheet]')?.addEventListener('click', () => { refresh(); try { window.print(); } catch { status('Não foi possível abrir a impressão. Você pode exportar sua ficha em JSON.', true); } });
    const dialog = root.querySelector('.sheet-import-dialog');
    const picker = dialog.querySelector('[data-sheet-import-file]');
    const confirm = dialog.querySelector('[data-confirm-sheet-import]');
    const feedback = dialog.querySelector('[data-sheet-import-feedback]');
    root.querySelector('[data-open-sheet-import]').addEventListener('click', () => { pendingImport = null; importRevision = store.reload().revision; picker.value = ''; confirm.disabled = true; feedback.textContent = ''; dialog.querySelector('[data-sheet-import-preview]').textContent = ''; dialog.showModal(); });
    dialog.querySelector('[data-close-sheet-import]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-select-sheet-file]').addEventListener('click', () => picker.click());
    dialog.addEventListener('close', () => { reading++; pendingImport = null; });
    picker.addEventListener('change', async () => {
      const epoch = ++reading; pendingImport = null; confirm.disabled = true; dialog.querySelector('[data-sheet-import-preview]').textContent = '';
      const file = picker.files[0]; if (!file) { feedback.textContent = ''; return; }
      feedback.textContent = 'Verificando a ficha…';
      try {
        const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
        let fields;
        if (isPdf) {
          if (file.size > 64 * 1024 * 1024) throw new Error('Selecione um PDF de ficha com até 64 MB.');
          feedback.textContent = 'Lendo os campos do PDF editável…';
          const { importAgentSheetPdf } = await import('./agent-sheet-pdf.js');
          fields = await importAgentSheetPdf(await file.arrayBuffer());
        } else {
          if (file.size > maxAgentSheetBytes) throw new Error('Selecione uma ficha em JSON com até 20 MB.');
          fields = parseAgentSheet(await file.text());
        }
        if (epoch !== reading || !dialog.isConnected || !dialog.open) return;
        pendingImport = fields; dialog.querySelector('[data-sheet-import-preview]').textContent = `${fields.nome || 'Agente sem nome'} · ${fields.especie} · Nível ${fields.nivel}`; feedback.textContent = 'Ficha verificada. Confira a identificação antes de substituir a atual.'; confirm.disabled = false;
      } catch (error) { if (epoch === reading && dialog.isConnected && dialog.open) feedback.textContent = error.message; }
    });
    confirm.addEventListener('click', () => {
      if (!pendingImport) return;
      try { store.replace(pendingImport, importRevision); invalid.clear(); dialog.close(); onChange(); onNotice(store.persisted ? 'Ficha de agente importada neste navegador.' : savedMessage()); }
      catch (error) { feedback.textContent = error.message; }
    });
  }
  function reload() { store.reload(); refresh({ inputs: true }); if (!invalid.size) status(); }
  return { page, bind, reload };
}
