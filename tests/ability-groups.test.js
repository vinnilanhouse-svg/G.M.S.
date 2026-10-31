import test from 'node:test';
import assert from 'node:assert/strict';
import {abilityGroups,abilitiesForGroup,constructGroups} from '../src/ability-groups.js';
test('each construct composition has exactly its own abilities and the shared traits',()=>{
 assert.equal(abilityGroups('species').length,22);assert.ok(!abilityGroups('species').includes('Constructos'));
 for(const [group,variant]of Object.entries(constructGroups)){
  assert.ok(abilityGroups('species').includes(group));const abilities=abilitiesForGroup('species',group);
  assert.equal(abilities.length,7);assert.ok(abilities.every(a=>!a.variant||a.variant===variant));
  assert.equal(abilities.filter(a=>a.name==='Receita da vovó').length,1);
  for(const common of ['Tudo menos fogo','Força é tudo','Auto Destruição'])assert.ok(abilities.some(a=>a.name===common));
 }
 assert.ok(abilitiesForGroup('species','Constructo de Carne').some(a=>a.name==='Power Bank'));
 assert.ok(abilitiesForGroup('species','Constructo de Metal').some(a=>a.name==='Upgrade'));
 assert.ok(abilitiesForGroup('species','Constructo de Barro').some(a=>a.name==='Capatazes'));
 assert.equal(abilityGroups('specialty').length,10);
 assert.equal(abilitiesForGroup('specialty','Investigador').length,4);
});
