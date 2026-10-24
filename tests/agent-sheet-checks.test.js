import test from 'node:test';
import assert from 'node:assert/strict';
import { createAgentSheetStore } from '../src/agent-sheet-model.js';
import { agentSheetSkills } from '../src/agent-sheet-schema.js';
import { describeAgentCheck, resolveAgentCheck } from '../src/agent-sheet-checks.js';

const fields = () => createAgentSheetStore().state.fields;

test('o teste usa o valor atual do atributo e igualdade dá crítico, sem crítico automático no 1', () => {
  const source = { ...fields(), attr_corpo: '12' };
  const check = describeAgentCheck(source, 'attr_corpo');
  assert.equal(check.target, 12); assert.equal(check.label, 'Corpo');
  assert.equal(resolveAgentCheck(check, 1).outcome, 'success');
  assert.equal(resolveAgentCheck(check, 11).success, true);
  assert.equal(resolveAgentCheck(check, 12).outcome, 'critical-success');
  assert.equal(resolveAgentCheck(check, 13).outcome, 'failure');
  assert.equal(resolveAgentCheck(check, 20).outcome, 'failure');
  assert.deepEqual(source, { ...fields(), attr_corpo: '12' });
});

test('perícias usam base mais bônus e Sorte acompanha seu valor próprio e o bônus Leprechaun', () => {
  const source = { ...fields(), attr_mente: '8', per_g19_bonus: '1', per_g19_total: '999', per_g30_base: '10', especie: 'Leprechaun' };
  const investigation = describeAgentCheck(source, 'per_g19');
  assert.equal(investigation.target, 9); assert.match(investigation.breakdown, /Base 8 \+ Bônus 1 = Total 9/);
  assert.equal(resolveAgentCheck(investigation, 9).outcome, 'critical-success');
  assert.equal(resolveAgentCheck(investigation, 10).success, false);
  assert.equal(describeAgentCheck(source, 'per_g30').target, 15);
  source.especie = 'Humano'; assert.equal(describeAgentCheck(source, 'per_g30').target, 10);
  source.per_g19_bonus = '-2'; assert.equal(describeAgentCheck(source, 'per_g19').target, 6);
  assert.match(describeAgentCheck(source, 'per_g19').breakdown, /Base 8 − Bônus 2 = Total 6/);
});

test('perícias marcadas com asterisco exigem treinamento e não geram teste enquanto não o tiverem', () => {
  for (const skill of agentSheetSkills) {
    const check = describeAgentCheck(fields(), skill.id);
    assert.equal(Boolean(check.blocked), skill.label.startsWith('*'), skill.label);
    if (check.blocked) assert.throws(() => resolveAgentCheck(check, 1), /exige treinamento/);
    const trained = describeAgentCheck({ ...fields(), [`${skill.id}_bonus`]: '1' }, skill.id);
    assert.equal(trained.blocked, '', skill.label);
  }
});

test('o 20 natural é falha crítica nos três testes de ataque, com prioridade mesmo quando o total é 20 ou maior', () => {
  for (const id of ['per_g20', 'per_g21', 'per_g26']) {
    const check = describeAgentCheck({ ...fields(), attr_corpo: '19', attr_alma: '19', attr_agilidade: '19', [`${id}_bonus`]: '1' }, id);
    assert.equal(check.target, 20);
    assert.equal(resolveAgentCheck(check, 19).success, true);
    assert.equal(resolveAgentCheck(check, 20).outcome, 'critical-failure');
    assert.equal(resolveAgentCheck({ ...check, target: 21 }, 20).success, false);
  }
  const general = describeAgentCheck({ ...fields(), attr_corpo: '20' }, 'attr_corpo');
  assert.equal(resolveAgentCheck(general, 20).outcome, 'critical-success');
});

test('valores nulos, negativos, fracionários e além de 20 são comparados sem arredondar ou inventar regras adicionais', () => {
  const check = describeAgentCheck(fields(), 'attr_corpo');
  for (const target of [0, -1, 2.5, 20, 21]) {
    for (let result = 1; result <= 20; result++) {
      const evaluation = resolveAgentCheck({ ...check, target }, result);
      assert.equal(evaluation.success, result <= target);
      assert.equal(evaluation.outcome === 'critical-success', result === target);
    }
  }
  assert.equal(describeAgentCheck({ ...fields(), attr_corpo: '' }, 'attr_corpo').target, 0);
  for (const result of [0, 21, 1.5, NaN, '3']) assert.throws(() => resolveAgentCheck(check, result), /avaliar/);
  assert.throws(() => describeAgentCheck(fields(), '__proto__'), /teste disponível/);
});
