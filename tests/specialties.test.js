import test from 'node:test';
import assert from 'node:assert/strict';
import {specialties,specialtyAbilities,specialtyBonusFields} from '../src/specialties.js';
import {createAgentSheetStore} from '../src/agent-sheet-model.js';
const storage=()=>{const data=new Map();return{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}};
test('all 10 specialties have three skill grants and four exact-level abilities, including long effects',()=>{
 assert.equal(specialties.length,10);assert.equal(specialtyAbilities.length,40);
 for(const s of specialties){assert.equal(specialtyBonusFields(s.name).length,3);assert.deepEqual(s.abilities.map(a=>a.level),[1,3,12,17]);}
 assert.match(specialtyAbilities.find(a=>a.name==='Intoxicação alimentar').description,/Não pode fazer ninguém se apaixonar/);
 assert.equal(specialtyAbilities.find(a=>a.name==='Eu vejo você!').cost,'2 Pontos de Essência');
 assert.equal(specialtyAbilities.find(a=>a.name==='Inspirar pela arte').cost,'10E');
});
test('specialty grants apply once, switch without erasing manual points, and survive reloads',()=>{
 const memory=storage();let store=createAgentSheetStore(memory);
 store.updateField('per_b25_bonus','1'); // manual Diplomacia
 store.updateField('especialidade','Artista');
 for(const name of specialtyBonusFields('Artista'))assert.equal(store.state.fields[name],'1');
 store.updateField('especialidade','Artista');
 for(const name of specialtyBonusFields('Artista'))assert.equal(store.state.fields[name],'1');
 store=createAgentSheetStore(memory);
 store.updateField('especialidade','Investigador');
 assert.equal(store.state.fields.per_b25_bonus,'1');
 assert.equal(store.state.fields.per_b27_bonus,'0');
 for(const name of specialtyBonusFields('Investigador'))assert.equal(store.state.fields[name],'1');
 store.updateField('especialidade','-');
 for(const name of specialtyBonusFields('Investigador'))assert.equal(store.state.fields[name],'0');
 assert.equal(store.state.fields.per_b25_bonus,'1');
});
test('manual changes and ability updates preserve their own provenance and imported fields remain intact',()=>{
 const store=createAgentSheetStore(storage());store.updateField('especialidade','Investigador');
 store.updateField('per_b22_bonus','1'); // user explicitly keeps this as manual training
 const fields={...store.state.fields,habilidade_1_nome:'Faro aguçado'};
 store.replace(fields,store.state.revision,{preserveSpecialtyTracking:true});store.updateField('especialidade','Alquimista');
 assert.equal(store.state.fields.per_b22_bonus,'1');assert.equal(store.state.fields.per_g19_bonus,'0');
 for(const name of specialtyBonusFields('Alquimista'))assert.equal(store.state.fields[name],'1');
});
