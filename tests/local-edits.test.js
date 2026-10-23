import test from 'node:test';
import assert from 'node:assert/strict';
import {records} from '../src/data.js';
import {readLocalEdits,saveLocalEdit,localEditsKey} from '../src/local-edits.js';
import {createSiteService} from '../src/site-service.js';

function memoryStorage(){const values=new Map([['gms-agent-name-v1','Agente'],['gms-access-v1','[]'],['gms-saved','[]']]);return {values,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};}
const record=records.find(record=>record.id==='org-gms');

test('edições locais persistem após recarregar sem modificar identificação, credenciais ou favoritos',()=>{
  const storage=memoryStorage();
  const document=saveLocalEdit(storage,record,{summary:'Resumo revisado neste navegador.'},{revision:0});
  assert.equal(document.revision,1);
  assert.equal(readLocalEdits(storage).overrides[record.id].summary,'Resumo revisado neste navegador.');
  assert.equal(storage.getItem('gms-agent-name-v1'),'Agente');
  assert.equal(storage.getItem('gms-access-v1'),'[]');assert.equal(storage.getItem('gms-saved'),'[]');
  saveLocalEdit(storage,record,null,{revision:1,reset:true});
  assert.equal(readLocalEdits(storage).overrides[record.id],undefined);
});

test('uma aba desatualizada não sobrescreve o conteúdo local salvo por outra aba',()=>{
  const storage=memoryStorage();
  saveLocalEdit(storage,record,{summary:'Edição mais recente'},{revision:0});
  assert.throws(()=>saveLocalEdit(storage,record,{summary:'Edição atrasada'},{revision:0}),/Outra aba/);
  assert.equal(readLocalEdits(storage).overrides[record.id].summary,'Edição mais recente');
});

test('armazenamento bloqueado não é apresentado como salvamento e campos de acesso não podem ser alterados',()=>{
  const blocked={getItem(){throw new Error('Bloqueado');},setItem(){throw new Error('Bloqueado');}};
  assert.deepEqual(readLocalEdits(blocked),{revision:0,overrides:{}});
  assert.throws(()=>saveLocalEdit(blocked,record,{summary:'Texto'},{revision:0}),/não permitiu salvar/);
  const storage=memoryStorage();
  assert.throws(()=>saveLocalEdit(storage,record,{unlisted:false},{revision:0}));
  storage.setItem(localEditsKey,'{inválido');
  assert.equal(readLocalEdits(storage).revision,0);
});

test('publicar um documento pode substituir sua cópia local sem apagar edições de outros documentos',()=>{
  const storage=memoryStorage();const changes=[];
  const service=createSiteService({storage,onContent:value=>changes.push(value)});
  const other=records.find(record=>record.id==='especie-abissais');
  service.saveLocal(record,{summary:'Cópia local'},{revision:0});
  service.saveLocal(other,{summary:'Outra cópia local'},{revision:1});
  service.adopt({revision:1,overrides:{[record.id]:{summary:'Versão compartilhada'}}});
  assert.equal(changes.at(-1)[record.id].summary,'Cópia local');
  service.clearLocal(record);
  service.adopt({revision:2,overrides:{[record.id]:{summary:'Publicação nova'}}});
  assert.equal(changes.at(-1)[record.id].summary,'Publicação nova');
  assert.equal(changes.at(-1)[other.id].summary,'Outra cópia local');
});

test('uma publicação concluída continua sendo exibida se o navegador bloquear a remoção da cópia local',()=>{
  const storage=memoryStorage();const changes=[];
  const service=createSiteService({storage,onContent:value=>changes.push(value)});
  service.saveLocal(record,{summary:'Cópia anterior'},{revision:0});
  storage.setItem=()=>{throw new Error('Bloqueado');};
  assert.equal(service.clearLocal(record),false);
  service.adopt({revision:1,overrides:{[record.id]:{summary:'Publicação concluída'}}});
  assert.equal(changes.at(-1)[record.id].summary,'Publicação concluída');
});
