import test from 'node:test';
import assert from 'node:assert/strict';
import { isArchivePath, resolveRoute, shouldShowEntryDetour } from '../src/routing.js';

const sections = { inicio: 'Painel', agentes: 'Agentes', missoes: 'Missões', 'missoes/relatorios': 'Relatórios', busca: 'Busca' };

test('as rotas reconhecem seções, fichas e parâmetros sem aceitar caminhos inexistentes', () => {
  assert.deepEqual(resolveRoute('', sections), {page: 'inicio', id: undefined, query: ''});
  assert.equal(resolveRoute('#/agentes/', sections).page, 'agentes');
  assert.deepEqual(resolveRoute('#/missoes/relatorios?missao=sol-velado', sections), {page: 'missoes', id: 'relatorios', query: 'missao=sol-velado'});
  assert.deepEqual(resolveRoute('#/arquivo/agente-morrow-noone', sections), {page: 'arquivo', id: 'agente-morrow-noone', query: ''});
  for (const hash of ['#/sumiu', '#/inicio/extra', '#/arquivo', '#/arquivo/agente-codex/extra', '#/missoes/inventada', '#/constructor', '#/toString']) {
    assert.equal(resolveRoute(hash, sections).page, 'perdido', hash);
  }
});

test('endereços desconhecidos são erros também fora do hash, preservando a prévia local', () => {
  for (const pathname of ['/', '/index.html']) assert.equal(isArchivePath({protocol: 'https:', pathname}), true);
  for (const pathname of ['/perdi-o-caminho', '/inicio', '/arquivo/inexistente']) assert.equal(isArchivePath({protocol: 'https:', pathname}), false);
  assert.equal(isArchivePath({protocol: 'file:', pathname: '/downloads/arquivo-gms.html'}), true);
});

test('o desvio de entrada tem chance de 1% com um único sorteio por avaliação', () => {
  for (const [value, expected] of [[0, true], [0.009999, true], [0.01, false], [0.5, false], [0.999999, false]]) {
    let calls = 0;
    assert.equal(shouldShowEntryDetour(() => {calls++; return value;}), expected);
    assert.equal(calls, 1);
  }
});
