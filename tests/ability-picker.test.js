import test from 'node:test';
import assert from 'node:assert/strict';
import {abilityCatalog,diceExpressions,parseAbilityDice,abilityActions} from '../src/ability-picker.js';
test('manual catalog covers 20 species and retains costs, actions and original conditional mechanics',()=>{
 assert.equal(new Set(abilityCatalog.map(a=>a.species)).size,20);
 assert.equal(new Set(abilityCatalog.map(a=>a.id)).size,abilityCatalog.length);
 const water=abilityCatalog.find(a=>a.name==='Toma uma Aguinha aí');
 assert.equal(water.cost,'5E');assert.equal(water.action,'Ação Bônus');assert.match(water.description,/1D8/);
 const claws=abilityCatalog.find(a=>a.name==='Corta essa unha aí');
 assert.deepEqual(diceExpressions(claws.description),['2D12','1D8']);assert.match(claws.action,/Ação Bônus/);
 for(const variant of ['Carne','Metal','Barro'])assert.ok(abilityCatalog.some(a=>a.species==='Constructos'&&a.variant===variant));
 const passive=abilityCatalog.find(a=>a.name==='Cuidado, corpo molhado');
 assert.equal(passive.cost,'Consulte a descrição');assert.deepEqual(diceExpressions(passive.description),[]);
});
test('dice expressions preserve modifiers and reject unsafe, unsupported or excessive rolls',()=>{
 assert.deepEqual(parseAbilityDice('2D8+3'),{count:2,sides:8,modifier:3});
 assert.deepEqual(parseAbilityDice('1d100-2'),{count:1,sides:100,modifier:-2});
 assert.deepEqual(diceExpressions('1D8 CURA // 2D8 Dano; +2D6; 1D8+Corpo'),['1D8','2D8','2D6','1D8+CORPO']);
 for(const expr of ['0D8','31D8','1D7','1D8+Corpo','1D8;alert(1)','1D8+2D6','InfinityD20'])assert.throws(()=>parseAbilityDice(expr));
 const markup=abilityActions(1,{habilidade_1_descricao:'[Ação // 1D8 CURA // 2D8 Dano]'});
 assert.match(markup,/Rolar 1D8/);assert.match(markup,/Rolar 2D8/);assert.doesNotMatch(markup,/data-sheet-check/);
});

test('explicit attribute and skill tests are offered without adding checks to passive traits',()=>{
 assert.match(abilityActions(1,{habilidade_1_descricao:'Com um Teste de Alma, você invoca uma criatura.'}),/data-sheet-check="attr_alma"/);
 assert.match(abilityActions(1,{habilidade_1_descricao:'Faça um Teste de Luta.'}),/data-sheet-check="per_g20"/);
 assert.doesNotMatch(abilityActions(1,{habilidade_1_descricao:'Você Falha automaticamente em todos os Testes de Alma.'}),/data-sheet-check/);
});

test('multi-paragraph powers preserve seasonal effects, plagues and vampire options',()=>{
 const fairy=abilityCatalog.filter(a=>a.species==='Fada').map(a=>a.description).join(' ');
 assert.match(fairy,/Primavera/);assert.match(fairy,/Inverno/);assert.match(fairy,/2D12\+2/);
 const mummy=abilityCatalog.filter(a=>a.species==='Múmia').map(a=>a.description).join(' ');
 assert.match(mummy,/Os Gafanhotos/);assert.match(mummy,/3d6\+4/);
 const vampire=abilityCatalog.filter(a=>a.species==='Vampiro').map(a=>a.description).join(' ');
 assert.match(vampire,/Forma de morcego/);assert.match(vampire,/Dois é bom/);
 const leprechaun=abilityCatalog.filter(a=>a.species==='Leprechaun'&&a.stage==='apex');
 assert.equal(leprechaun.length,1);assert.match(leprechaun[0].description,/Fora de Batalha/);assert.equal(leprechaun[0].cost,'30E');
});
