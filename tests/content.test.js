import test from 'node:test';
import assert from 'node:assert/strict';
import {records} from '../src/data.js';

test('o acervo tem identificadores únicos e todos os vínculos apontam para arquivos existentes',()=>{
 const ids=new Set(records.map(r=>r.id));
 assert.equal(ids.size,records.length);
 assert.equal(new Set(records.map(r=>r.code)).size,records.length);
 for(const r of records){
  assert.ok(r.title&&r.summary&&r.report.length,`Conteúdo ausente: ${r.id}`);
  assert.ok(['investigacao','verbete','documento','agente','missao','relatorio','alvo'].includes(r.kind));
  assert.ok(['Público','Restrito','Censurado'].includes(r.access));
  assert.match(r.date,/^\d{4}-\d{2}-\d{2}$/);
  for(const id of [...r.related,...(r.notableMembers||[])])assert.ok(ids.has(id),`${r.id}: vínculo inválido ${id}`);
 }
});

test('as 20 espécies têm fonte e capacidades narrativas sem notação de regras',()=>{
 const species=records.filter(r=>r.category==='Espécies');
 assert.equal(species.length,20);
 for(const r of species){
  assert.ok(r.source&&r.sourceSection&&r.sourceUrl,`Fonte ausente: ${r.id}`);
  assert.ok(r.abilities.length>=3);
  const text=r.abilities.flatMap(a=>[a.title,a.text,...(a.details||[]).flatMap(d=>[d.title,d.text])]).join(' ');
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
 for(const kind of ['missao','relatorio','alvo']){
  const examples=records.filter(r=>r.kind===kind&&r.demo);
  assert.ok(examples.length,`Sem exemplo navegável de ${kind}`);
  for(const r of examples){assert.equal(r.demo,true);assert.match(r.report[0],/NÃO CANÔNICO/);}
 }
});

test('cada espécie distingue habilidades iniciais, adquiridas e um único ápice',()=>{
 for(const r of records.filter(r=>r.category==='Espécies')){
  assert.equal(r.abilities.filter(a=>a.stage==='initial').length,3,r.id);
  assert.equal(r.abilities.filter(a=>a.stage==='acquired').length,r.id==='especie-constructo'?9:3,r.id);
  assert.equal(r.abilities.filter(a=>a.stage==='apex').length,1,r.id);
  for(const a of r.abilities){
   assert.ok(['initial','acquired','apex'].includes(a.stage),r.id);
   assert.ok(a.title&&a.text,r.id);
   for(const d of a.details||[])assert.ok(d.title&&d.text,r.id);
  }
 }
 const constructs=records.find(r=>r.id==='especie-constructo').abilities;
 for(const material of ['Carne','Metal','Barro']){
  assert.equal(constructs.filter(a=>a.stage==='acquired'&&a.variant===material).length,3);
  assert.ok(constructs[0].details.some(d=>d.title===material));
 }
 const get=(id,title)=>records.find(r=>r.id===id).abilities.find(a=>a.title===title);
 assert.equal(get('especie-fada','Quatro Estações').details.length,4);
 assert.equal(get('especie-mumia','As Pragas').details.length,6);
 assert.equal(get('especie-vampiro','Linha de sangue').details.length,5);
 assert.equal(get('especie-leprechaun','Você Acredita em Duendes?').details.length,2);
});

test('os seis agentes fornecidos têm fichas próprias e vínculos coerentes com suas histórias',()=>{
 const get=id=>records.find(r=>r.id===id);
 const agentIds=['agente-miguel','agente-patrick','agente-babdin','agente-ze-teixeira','agente-belias','agente-suzan-popov'];
 for(const id of agentIds){
  const agent=get(id);
  assert.equal(agent.kind,'agente',id);
  assert.equal(agent.demo,false,id);
  assert.ok(agent.report.length>=4,id);
  assert.ok(!agent.related.some(id=>id.includes('-demo-')),id);
  const species=records.find(r=>r.notableMembers?.includes(id));
  assert.ok(species,id);
  assert.ok(agent.related.includes(species.id),id);
 }
 assert.equal(get('agente-patrick').status,'Desaparecido');
 assert.ok(get('agente-belias').profile.some(f=>f.value.includes('████')));
 assert.doesNotMatch(JSON.stringify(get('agente-belias')),/Raulson/i);
 assert.ok(get('agente-miguel').profile.some(f=>f.value==='Draconato'));
 assert.ok(get('agente-miguel').profile.some(f=>f.value==='Salamandra'));
 assert.ok(get('agente-babdin').profile.some(f=>f.value==='Gênio'));
 assert.ok(get('agente-babdin').profile.some(f=>f.value==='Centauro'));
 assert.ok(!get('agente-demo-001'));
 const zaratha=get('agente-zaratha-khimer-atros');
 assert.equal(zaratha.icon.src,'/agent-icons/zaratha-manticora.webp');
 assert.equal(zaratha.kind,'agente');
 assert.equal(zaratha.demo,false);
 assert.ok(zaratha.profile.some(f=>f.label==='Espécie'&&f.value==='Mantícora'));
 assert.ok(!zaratha.related.some(id=>id.startsWith('especie-')));
 assert.ok(!records.some(r=>r.category==='Espécies'&&r.notableMembers?.includes(zaratha.id)));
});
