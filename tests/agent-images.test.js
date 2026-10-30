import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {agentRecords} from '../src/agents.js';
import {privateAgentRecords} from '../src/private-agents.js';
const agents=[...agentRecords,...privateAgentRecords];

test('os retratos cadastrados nas fichas de agentes são locais, próprios e têm legendas de arquivo de pessoal',async()=>{
 const illustrated=agents.filter(r=>r.image);
 assert.ok(illustrated.length>0);
 assert.ok(agentRecords.every(r=>r.image));
 assert.ok(privateAgentRecords.find(r=>r.id==='agente-morrow-noone').image);
 assert.ok(agents.filter(r=>r.kind==='agente'&&!r.image).every(r=>r.unlisted&&r.status==='Cadastro incompleto'));
 assert.equal(new Set(illustrated.map(r=>r.image.src)).size,illustrated.length);
 for(const r of illustrated){
  assert.equal(r.image.src,`/agents/${r.id}.webp`);
  assert.ok(r.image.alt.includes(r.title));
  assert.equal(r.image.caption,'Arquivo de Pessoal · G.M.S.');
  assert.equal(r.image.width/r.image.height,2/3);
  const bytes=await readFile(new URL(`../public${r.image.src}`,import.meta.url));
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.ok(bytes.length<350_000);
 }
});
