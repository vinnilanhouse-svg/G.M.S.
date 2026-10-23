import test from 'node:test';
import assert from 'node:assert/strict';
import {records} from '../src/data.js';
import {applyContentOverrides,documentSections,flattenSections,validateRecordPatch} from '../src/content-editing.js';
import {createSiteService} from '../src/site-service.js';

test('a edição de missão preserva seções, listas e a ordem dos parágrafos',()=>{
  const record=records.find(record=>record.id==='missao-sol-velado');
  const sections=documentSections(record);
  assert.deepEqual(flattenSections(sections,true),{report:record.report,reportSections:record.reportSections});
  sections[0].paragraphs.push('Nova informação confirmada.');
  const patch=flattenSections(sections,true);
  validateRecordPatch(record,patch);
  assert.equal(patch.reportSections[1].start,record.reportSections[1].start+1);
  assert.ok(patch.report.includes('Nova informação confirmada.'));
  assert.throws(()=>flattenSections([{title:'Seção',paragraphs:['  ']}],true));
});

test('a edição altera texto sem permitir mudanças nos IDs, códigos, acessos ou grupos de habilidades',()=>{
  const record=records.find(record=>record.abilities?.length);
  for(const patch of [{id:'outro'},{code:'INV-000'},{requiredGrant:null},{unlisted:false},{related:[]},{title:''},{date:'2026-02-31'},{report:[]}])assert.throws(()=>validateRecordPatch(record,patch));
  const abilities=structuredClone(record.abilities);
  abilities[0].text='Descrição atualizada.';
  assert.doesNotThrow(()=>validateRecordPatch(record,{abilities}));
  abilities[0].stage='apex';
  assert.throws(()=>validateRecordPatch(record,{abilities}));
  assert.throws(()=>validateRecordPatch(record,JSON.parse('{"__proto__":{"polluted":true}}')));
});

test('sobreposições não modificam a fonte e ignoram dados inválidos sem expor fichas reservadas',()=>{
  const original=records.find(record=>record.id==='agente-morrow-noone');
  const updated=applyContentOverrides(records,{[original.id]:{title:'Nome atualizado',summary:'Texto literal <sem HTML>.'},[records[0].id]:{requiredGrant:null}});
  const result=updated.find(record=>record.id===original.id);
  assert.equal(result.title,'Nome atualizado');
  assert.equal(result.requiredGrant,original.requiredGrant);
  assert.equal(result.unlisted,true);
  assert.equal(original.title,'Morrow Noone');
  assert.equal(updated[0],records[0]);
});

test('uma resposta de sincronização atrasada não desfaz uma publicação mais recente no navegador',()=>{
  const changes=[];
  const service=createSiteService({getName:()=>'',getPage:()=>'',onContent:value=>changes.push(value)});
  service.adopt({revision:2,overrides:{'org-gms':{summary:'Publicação mais recente'}}});
  service.adopt({revision:1,overrides:{'org-gms':{summary:'Resposta atrasada'}}});
  assert.equal(service.content.revision,2);
  assert.equal(service.content.overrides['org-gms'].summary,'Publicação mais recente');
  assert.equal(changes.length,1);
});
