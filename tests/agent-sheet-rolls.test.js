import test from 'node:test';
import assert from 'node:assert/strict';
import { agentDice, rollAgentDie, createAgentSheetRolls } from '../src/agent-sheet-rolls.js';

function samples(...values) {
  let calls = 0;
  return { get calls() { return calls; }, getRandomValues(array) { assert.ok(array instanceof Uint32Array); assert.equal(array.length, 1); assert.ok(calls < values.length, 'a rolagem não deve pedir amostras extras'); array[0] = values[calls++]; return array; } };
}

test('os sete dados aceitam todas as faces e os limites da faixa aleatória', () => {
  assert.deepEqual(agentDice, [4, 6, 8, 10, 12, 20, 100]);
  for (const sides of agentDice) {
    for (let face = 1; face <= sides; face++) assert.equal(rollAgentDie(sides, samples(face - 1)), face);
    const limit = 2 ** 32 - 2 ** 32 % sides;
    assert.equal(rollAgentDie(sides, samples(limit - 1)), sides);
  }
});

test('amostras excedentes são rejeitadas para não favorecer faces no d6, d10, d12, d20 e d100', () => {
  for (const sides of [6, 10, 12, 20, 100]) {
    const limit = 2 ** 32 - 2 ** 32 % sides;
    const source = samples(limit, 2 ** 32 - 1, sides - 1);
    assert.equal(rollAgentDie(sides, source), sides);
    assert.equal(source.calls, 3);
  }
  for (const sides of [4, 8]) assert.equal(rollAgentDie(sides, samples(2 ** 32 - 1)), sides);
});

test('cada rolagem consulta novamente o gerador e falhas não geram resultados simulados', () => {
  const source = samples(0, 5, 2);
  assert.deepEqual([rollAgentDie(6, source), rollAgentDie(6, source), rollAgentDie(6, source)], [1, 6, 3]);
  assert.throws(() => rollAgentDie(20, null), /gerador seguro/);
  assert.throws(() => rollAgentDie(20, {}), /gerador seguro/);
  const broken = { getRandomValues() { throw new Error('Gerador indisponível'); } };
  assert.throws(() => rollAgentDie(20, broken), /Gerador indisponível/);
  for (const invalid of [0, 1, 3, 7, 99, 101, 6.5, NaN, Infinity, '20']) assert.throws(() => rollAgentDie(invalid, source), /dados disponíveis/);
  assert.equal(source.calls, 3);
});

test('os dados rolam com a fonte segura real e o painel inicial não sorteia resultados ao abrir', () => {
  for (const sides of agentDice) {
    const value = rollAgentDie(sides);
    assert.ok(Number.isInteger(value) && value >= 1 && value <= sides);
  }
  const panel = createAgentSheetRolls().page(false);
  assert.match(panel, /Nenhuma rolagem registrada/);
  assert.equal((panel.match(/data-roll-die=/g) || []).length, 7);
  assert.match(panel, /data-repeat-roll disabled/);
});
