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
  for (const credential of credentials.filter(credential => !credential.effect)) {
    assert.ok(records.some(record => record.requiredGrant === credential.id));
    if (credential.route.startsWith('#/arquivo/')) {
      const target = records.find(record => record.id === credential.route.split('/').at(-1));
      assert.equal(target?.requiredGrant, credential.id);
    }
  }
});

test('PAPÃO aciona somente o efeito temporário, sem persistir nem liberar registros',()=>{
 const credential=findCredential('PAPÃO');
 assert.equal(credential.effect,'access-denied');
 assert.equal(credential.entryOnly,true);
 assert.equal(credential.route,'#/inicio');
 assert.equal(findCredential(' papão ')?.id,credential.id);
 assert.equal(findCredential('PAPA\u0303O')?.id,credential.id);
 assert.equal(findCredential('PAPAO'),undefined);
 assert.ok(!records.some(record=>record.requiredGrant===credential.id));
 assert.deepEqual(visibleRecords(records,new Set([credential.id])),visibleRecords(records,new Set()));
 assert.deepEqual([...readActiveCredentials(JSON.stringify(['arquivo-reservado',credential.id]))],['arquivo-reservado']);
});

test('NOME_ERRO exige maiúsculas e abre a identificação sem conceder nem guardar autorização',()=>{
 const credential=findCredential('NOME_ERRO');
 assert.equal(credential.effect,'rename-agent');
 assert.equal(credential.entryOnly,true);
 assert.equal(findCredential(' NOME_ERRO ')?.id,credential.id);
 for(const code of ['nome_erro','Nome_Erro','NOME_ERO','NOME ERRO','NOME_ERRO_extra'])assert.equal(findCredential(code),undefined);
 assert.deepEqual(visibleRecords(records,new Set([credential.id])),visibleRecords(records,new Set()));
 assert.deepEqual([...readActiveCredentials(JSON.stringify(['arquivo-reservado',credential.id]))],['arquivo-reservado']);
});

test('NATHALISM0 permite a consulta de Morrow sem publicar a ficha nem guardar sua autorização',()=>{
 const credential=findCredential('NATHALISM0');
 assert.equal(credential.id,'morrow-noone');
 assert.equal(credential.entryOnly,true);
 assert.equal(findCredential(' NATHALISM0 ')?.id,credential.id);
 for(const code of ['nathalism0','Nathalism0','Nathalismo','NathalismO','Nathalism','Nathalism01'])assert.equal(findCredential(code),undefined);
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

test('GAMREBELLO abre somente Wanderley e mantém as duas fichas reservadas fora do acervo público',()=>{
 const credential=findCredential('GAMREBELLO');
 assert.equal(credential.id,'wanderley');
 assert.equal(credential.entryOnly,true);
 assert.equal(credential.route,'#/arquivo/agente-wanderley');
 assert.equal(findCredential(' GAMREBELLO ')?.id,credential.id);
 for(const code of ['gamrebello','Gamrebello','GAMREBELO','GAMREBELLO-extra'])assert.equal(findCredential(code),undefined);
 const target=records.find(r=>r.id==='agente-wanderley');
 assert.equal(target.title,'Wanderley');
 assert.equal(target.unlisted,true);
 const original=visibleRecords(records,new Set());
 assert.ok(!original.some(r=>r.id===target.id));
 const withAccess=visibleRecords(records,new Set([credential.id]));
 assert.ok(withAccess.some(r=>r.id===target.id));
 assert.ok(!withAccess.some(r=>r.id==='agente-morrow-noone'));
 assert.ok(!visibleRecords(records,new Set(['morrow-noone'])).some(r=>r.id===target.id));
 assert.deepEqual(listedRecords(withAccess),listedRecords(original));
 assert.ok(!records.some(r=>r.notableMembers?.includes(target.id)||r.related.includes(target.id)));
 assert.deepEqual([...readActiveCredentials(JSON.stringify(['arquivo-reservado',credential.id]))],['arquivo-reservado']);
});
