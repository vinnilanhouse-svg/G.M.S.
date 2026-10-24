import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { agentSheetFields, agentSheetSkills } from '../src/agent-sheet-schema.js';
import { agentSheetKey, calculateAgentSheet, createAgentSheetStore, editableAgentSheetFields, parseAgentSheet, readAgentSheet, serializeAgentSheet, validateAgentSheetValue } from '../src/agent-sheet-model.js';

// Oráculo independente: os scripts AcroForm originais são executados somente
// neste teste, em um contexto isolado. A aplicação não avalia código do PDF.
const pdf = JSON.parse(readFileSync(new URL('./fixtures/agent-sheet-pdf.json', import.meta.url), 'utf8'));
const scripts = Object.fromEntries(Object.entries(pdf.calculations).map(([name, text]) => [name, new vm.Script(text)]));
function pdfCalculate(input) {
  const values = Object.fromEntries(Object.entries(pdf.fields).map(([name, spec]) => [name, spec.defaultValue]));
  Object.assign(values, input);
  const context = vm.createContext({ event: {}, getField(name) { return Object.hasOwn(values, name) ? { get value() { return values[name]; }, set value(value) { values[name] = String(value); } } : null; } });
  for (const name of pdf.calculationOrder) { context.event = { value: values[name] }; scripts[name].runInContext(context, { timeout: 100 }); values[name] = String(context.event.value); }
  return values;
}
function storage() { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; }

test('a definição conserva os 286 campos, 215 entradas editáveis, opções e 28 perícias do PDF', () => {
  assert.equal(Object.keys(agentSheetFields).length, 286);
  assert.equal(editableAgentSheetFields.length, 215);
  assert.equal(agentSheetSkills.length, 28);
  assert.deepEqual(agentSheetFields, pdf.fields);
  assert.equal(agentSheetFields.per_g30_base.readOnly, false);
  assert.equal(agentSheetFields.per_g30_bonus.readOnly, true);
  assert.equal(agentSheetFields.especialidade.options.length, 11);
  assert.equal(agentSheetFields.especie.options.length, 23);
});

test('todos os resultados calculados e gráficos coincidem com o JavaScript original em espécies e níveis distintos', () => {
  const initial = createAgentSheetStore(storage()).state.fields;
  assert.deepEqual(calculateAgentSheet(initial), pdfCalculate(initial));
  for (const [speciesIndex, species] of agentSheetFields.especie.options.entries()) {
    for (const level of [1, 7, 20]) {
      const fields = { ...initial, especie: species, nivel: String(level), attr_corpo: String(speciesIndex % 3 === 0 ? 0 : speciesIndex % 3 === 1 ? 2.5 : 20), attr_agilidade: '0.5', attr_mente: '13.7', attr_coracao: '9', attr_alma: '4.5', vida_atual: speciesIndex % 2 ? '300' : '0', essencia_atual: speciesIndex % 2 ? '0' : '150', per_g30_base: '-2.5' };
      for (const skill of agentSheetSkills) if (!agentSheetFields[`${skill.id}_bonus`].readOnly) fields[`${skill.id}_bonus`] = String((speciesIndex % 7) - 3.5);
      for (let index = 1; index <= 26; index++) fields[`item_${index}_peso`] = index % 2 ? '0.1' : '0.2';
      assert.deepEqual(calculateAgentSheet(fields), pdfCalculate(fields), `${species}, nível ${level}`);
    }
  }
  for (let level = 1; level <= 20; level++) {
    const fields = { ...initial, nivel: String(level) };
    assert.deepEqual(calculateAgentSheet(fields), pdfCalculate(fields), `curva de experiência no nível ${level}`);
  }
});

test('a validação numérica segue os scripts originais, incluindo decimais, vírgulas, campos vazios e bônus negativos', () => {
  for (const [name, source] of Object.entries(pdf.validations)) {
    const script = new vm.Script(source);
    for (const value of ['', '  ', '0', '-1', '1', '2.5', '2,5', '20', '21', 'NaN', 'Infinity', '1e2', '1,2,3', '0x10']) {
      const context = vm.createContext({ event: { value, rc: true } }); script.runInContext(context, { timeout: 100 });
      if (!context.event.rc) assert.throws(() => validateAgentSheetValue(name, value), undefined, `${name}: ${value}`);
      else assert.equal(validateAgentSheetValue(name, value), String(context.event.value), `${name}: ${value}`);
    }
  }
});

test('trocar nível ou espécie não reabastece recursos atuais e não aplica bônus de especialidade inexistentes no PDF', () => {
  const fields = createAgentSheetStore(storage()).state.fields;
  const metal = calculateAgentSheet({ ...fields, especie: 'Constructo de Metal', especialidade: 'Alquimista', nivel: '10', attr_coracao: '7', attr_alma: '20' });
  assert.equal(metal.vida_atual, '25'); assert.equal(metal.essencia_atual, '5');
  assert.equal(metal.essencia_max, '27'); assert.equal(metal.recurso_nome, 'Pontos de Energia');
  assert.equal(metal.per_b20_bonus, '0');
  const leprechaun = calculateAgentSheet({ ...fields, especie: 'Leprechaun' });
  assert.equal(leprechaun.per_g30_total, '15');
  assert.equal(calculateAgentSheet({ ...fields, nivel: '1' }).pe_proximo, '0');
  assert.equal(calculateAgentSheet({ ...fields, nivel: '20' }).pe_proximo, '0');
});

test('salvamento conserva todos os campos e alterações de outras abas sem modificar identificação ou credenciais', () => {
  const disk = storage(); disk.setItem('gms-agent-name-v1', 'Agente do terminal'); disk.setItem('gms-saved', '["org-gms"]');
  const first = createAgentSheetStore(disk); const second = createAgentSheetStore(disk);
  first.updateField('nome', 'Nome da criatura'); second.updateField('habilidade_11_descricao', 'Habilidade com\nmais de uma linha.');
  first.updateField('item_26_peso', '2,75');
  const restored = readAgentSheet(disk);
  assert.equal(restored.fields.nome, 'Nome da criatura'); assert.match(restored.fields.habilidade_11_descricao, /\nmais/); assert.equal(restored.fields.item_26_peso, '2.75');
  assert.equal(disk.getItem('gms-agent-name-v1'), 'Agente do terminal'); assert.equal(disk.getItem('gms-saved'), '["org-gms"]');
  const before = disk.getItem(agentSheetKey);
  assert.throws(() => first.updateField('vida_max', '999'), /não pode/); assert.throws(() => first.updateField('__proto__', 'x'), /não pode/);
  assert.throws(() => first.updateField('nivel', '21'), /inteiro/); assert.equal(disk.getItem(agentSheetKey), before);
});

test('a cópia JSON recupera somente os campos editáveis, valida a ficha inteira e protege alterações concorrentes', () => {
  const disk = storage(); const folder = createAgentSheetStore(disk); folder.updateField('historia', '<script>Texto literal</script>');
  const exported = serializeAgentSheet(folder.state); const imported = parseAgentSheet(exported);
  assert.deepEqual(imported, folder.state.fields); assert.equal(imported.vida_max, undefined);
  const other = createAgentSheetStore(storage()); other.replace(imported, 0); assert.equal(other.state.fields.historia, '<script>Texto literal</script>');
  const oldRevision = folder.state.revision; folder.updateField('nome', 'Alteração mais recente');
  assert.throws(() => folder.replace(imported, oldRevision), /outra aba/);
  const bad = JSON.parse(exported); bad.fields.item_26_peso = '-1'; assert.throws(() => parseAgentSheet(JSON.stringify(bad)), /maior ou igual/);
  assert.throws(() => parseAgentSheet('{quebrado'), /Não foi possível/);
  assert.equal(folder.state.fields.nome, 'Alteração mais recente');
});

test('a ficha continua recuperável por exportação quando o navegador bloqueia o armazenamento', () => {
  const sheet = createAgentSheetStore(); sheet.updateField('nome', 'Rascunho em memória'); sheet.updateField('attr_corpo', '4'); sheet.reload();
  assert.equal(sheet.persisted, false); assert.equal(sheet.state.fields.nome, 'Rascunho em memória');
  assert.equal(calculateAgentSheet(sheet.state.fields).vida_max, '29');
  assert.equal(parseAgentSheet(serializeAgentSheet(sheet.state)).nome, 'Rascunho em memória');
});
