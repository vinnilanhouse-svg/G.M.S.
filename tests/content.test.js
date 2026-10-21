import test from 'node:test';
import assert from 'node:assert/strict';
import {records,notices} from '../src/data.js';

test('o acervo tem identificadores únicos e todos os vínculos apontam para arquivos existentes',()=>{
 const ids=new Set(records.map(r=>r.id));
 assert.equal(ids.size,records.length);
 assert.equal(new Set(records.map(r=>r.code)).size,records.length);
 for(const r of records){
  assert.ok(r.title&&r.summary&&r.report.length,`Conteúdo ausente: ${r.id}`);
  assert.ok(['investigacao','verbete','documento','agente','missao','relatorio','alvo'].includes(r.kind));
  assert.ok(['Público','Restrito','Censurado'].includes(r.access));
  assert.match(r.date,/^\d{4}-\d{2}-\d{2}$/);
  for(const id of r.related)assert.ok(ids.has(id),`${r.id}: vínculo inválido ${id}`);
 }
 for(const n of notices)assert.ok(ids.has(n.related));
});

test('as 20 espécies têm fonte e capacidades narrativas sem notação de regras',()=>{
 const species=records.filter(r=>r.category==='Espécies');
 assert.equal(species.length,20);
 for(const r of species){
  assert.ok(r.source&&r.sourceSection&&r.sourceUrl,`Fonte ausente: ${r.id}`);
  assert.ok(r.abilities.length>=3);
  const text=r.abilities.map(a=>a.title+' '+a.text).join(' ');
  assert.doesNotMatch(text,/\b\d+d\d+\b|pontos de (?:vida|essência)|ação bônus|teste de (?:alma|corpo|mente)|\bPV\b|por turno/i,r.id);
 }
});

test('casos de demonstração não são apresentados como acontecimentos oficiais',()=>{
 const cases=records.filter(r=>r.kind==='investigacao');
 assert.ok(cases.length);
 for(const r of cases){assert.equal(r.demo,true);assert.match(r.report[0],/NÃO CANÔNICO/);assert.equal(r.source,false);}
 assert.ok(records.some(r=>r.access==='Público'));
 assert.ok(records.some(r=>r.access==='Restrito'));
 assert.ok(records.some(r=>r.access==='Censurado'&&r.report.some(p=>p.includes('████'))));
});


test('relatórios pertencem a missões e os vínculos operacionais usam os tipos corretos',()=>{
 const get=id=>records.find(r=>r.id===id);
 for(const r of records){
  if(r.kind==='relatorio'){
   assert.equal(get(r.missionId)?.kind,'missao',`${r.id}: missão ausente`);
   assert.ok(r.related.includes(r.missionId));
  }
  for(const id of r.agentIds||[])assert.equal(get(id)?.kind,'agente');
  for(const id of r.targetIds||[])assert.equal(get(id)?.kind,'alvo');
 }
 for(const kind of ['agente','missao','relatorio','alvo']){
  const examples=records.filter(r=>r.kind===kind);
  assert.ok(examples.length,`Sem exemplo navegável de ${kind}`);
  for(const r of examples){assert.equal(r.demo,true);assert.match(r.report[0],/NÃO CANÔNICO/);}
 }
});
