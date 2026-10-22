import test from 'node:test';
import assert from 'node:assert/strict';
import {agentNameStorageKey,normalizeAgentName,readAgentName,saveAgentName} from '../src/agent-identity.js';

test('a identificação preserva acentos e limita o nome, recusando conteúdo vazio',()=>{
 assert.equal(normalizeAgentName('  Ana   Cláudia  '),'Ana Cláudia');
 assert.equal(normalizeAgentName('Jose\u0301'),'José');
 assert.equal(normalizeAgentName('x'.repeat(100)).length,60);
 for(const value of [null,undefined,123,'',' \n\t '])assert.equal(normalizeAgentName(value),'');
});

test('o nome é recuperado na próxima visita sem alterar credenciais ou favoritos',()=>{
 const values=new Map([['gms-access-v1','["arquivo-reservado"]'],['gms-saved','["org-gms"]']]);
 const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
 assert.equal(readAgentName(storage),'');
 assert.equal(saveAgentName(storage,' Agente Aurora '),true);
 assert.equal(values.get(agentNameStorageKey),'Agente Aurora');
 assert.equal(readAgentName(storage),'Agente Aurora');
 assert.equal(values.get('gms-access-v1'),'["arquivo-reservado"]');
 assert.equal(values.get('gms-saved'),'["org-gms"]');
 assert.equal(saveAgentName(storage,'   '),false);
 assert.equal(readAgentName(storage),'Agente Aurora');
});

test('armazenamento indisponível não impede identificar o agente nesta sessão',()=>{
 const unavailable={getItem(){throw new Error('Blocked');},setItem(){throw new Error('Blocked');}};
 assert.equal(readAgentName(unavailable),'');
 assert.equal(saveAgentName(unavailable,'Agente Aurora'),false);
 assert.equal(readAgentName(undefined),'');
});
