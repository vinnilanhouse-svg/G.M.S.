import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {agentRecords} from '../src/agents.js';
import {privateAgentRecords} from '../src/private-agents.js';
const agents=[...agentRecords,...privateAgentRecords];

test('as fichas públicas e reservadas dos agentes têm retratos locais próprios e legendas de arquivo de pessoal',async()=>{
 assert.equal(agents.length,9);
 assert.equal(new Set(agents.map(r=>r.image?.src)).size,9);
 for(const r of agents){
  assert.equal(r.image.src,`/agents/${r.id}.webp`);
  assert.ok(r.image.alt.includes(r.title));
  assert.equal(r.image.caption,'Arquivo de Pessoal · G.M.S.');
  assert.equal(r.image.width/r.image.height,2/3);
  const bytes=await readFile(new URL(`../public${r.image.src}`,import.meta.url));
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.ok(bytes.length<350_000);
 }
});
