import test from 'node:test';
import assert from 'node:assert/strict';
import { records } from '../src/data.js';
import { credentials, findCredential, readActiveCredentials, visibleRecords, listedRecords } from '../src/permissions.js';

test('a validação aceita variações de caixa e espaços externos, mas não códigos parciais ou inválidos', () => {
  assert.equal(findCredential(' gms-arquivo ')?.id, 'arquivo-reservado');
  assert.equal(findCredential('gMs-InTeL')?.id, 'inteligencia');
  for (const code of ['', '   ', 'GMS', 'GMS-ARQUIVO-extra', 'código inválido', null]) {
    assert.equal(findCredential(code), undefined);
  }
  assert.equal(new Set(credentials.map(c => c.id)).size, credentials.length);
  assert.equal(new Set(credentials.map(c => c.code)).size, credentials.length);
});

test('a leitura de autorizações tolera dados ausentes ou corrompidos e descarta IDs desconhecidos', () => {
  for (const raw of [null, '', '{broken', '{}', '123', '"arquivo-reservado"']) {
    assert.deepEqual([...readActiveCredentials(raw)], []);
  }
  assert.deepEqual([...readActiveCredentials('["arquivo-reservado","arquivo-reservado","desconhecido"]')], ['arquivo-reservado']);
});

test('o conteúdo adicional fica ausente do acervo até a credencial correspondente ser ativada', () => {
  const original = visibleRecords(records, new Set());
  assert.ok(original.every(record => !record.requiredGrant));
  assert.ok(original.some(record => record.access === 'Restrito'));
  const archiveAccess = new Set(['arquivo-reservado']);
  const archive = visibleRecords(records, archiveAccess);
  assert.equal(archive.filter(record => record.collection === 'reservado').length, 2);
  assert.ok(!archive.some(record => record.requiredGrant === 'inteligencia'));
  const all = visibleRecords(records, new Set(credentials.map(c => c.id)));
  assert.equal(all.length, records.length);
  archiveAccess.delete('arquivo-reservado');
  assert.deepEqual(visibleRecords(records, archiveAccess), original);
});

test('todo registro condicionado possui uma credencial válida e os destinos individuais existem', () => {
  for (const record of records.filter(record => record.requiredGrant)) {
    assert.ok(credentials.some(c => c.id === record.requiredGrant), record.id);
    if(record.demo)assert.match(record.report[0],/NÃO CANÔNICO/);
  }
  for (const credential of credentials) {
    assert.ok(records.some(record => record.requiredGrant === credential.id));
    if (credential.route.startsWith('#/arquivo/')) {
      const target = records.find(record => record.id === credential.route.split('/').at(-1));
      assert.equal(target?.requiredGrant, credential.id);
    }
  }
});

test('Nathalism0 permite a consulta de Morrow sem publicar a ficha nem guardar sua autorização',()=>{
 const credential=findCredential('Nathalism0');
 assert.equal(credential.id,'morrow-noone');
 assert.equal(credential.entryOnly,true);
 assert.equal(findCredential(' nathalism0 ')?.id,credential.id);
 for(const code of ['Nathalismo','NathalismO','Nathalism','Nathalism01'])assert.equal(findCredential(code),undefined);
 const target=records.find(r=>r.id==='agente-morrow-noone');
 assert.equal(target.title,'Morrow Noone');
 assert.equal(target.requiredGrant,credential.id);
 assert.equal(target.unlisted,true);
 assert.ok(!visibleRecords(records,new Set()).some(r=>r.id===target.id));
 const withAccess=visibleRecords(records,new Set([credential.id]));
 assert.ok(withAccess.some(r=>r.id===target.id));
 assert.deepEqual(listedRecords(withAccess),listedRecords(visibleRecords(records,new Set())));
 assert.ok(!readActiveCredentials(JSON.stringify([credential.id])).has(credential.id));
 assert.deepEqual([...readActiveCredentials(JSON.stringify(['arquivo-reservado',credential.id]))],['arquivo-reservado']);
});
