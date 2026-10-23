import test from 'node:test';
import assert from 'node:assert/strict';
import {createDebugShortcut} from '../src/debug-shortcut.js';

const sequence=['ArrowUp','ArrowDown','ArrowRight','ArrowRight','ArrowLeft'];
function key(key,extra={}) { return {key,target:{closest:()=>null},preventDefault(){this.defaultPrevented=true;},...extra}; }

test('a sequência exata abre a depuração e pode ser usada novamente',()=>{
 let calls=0;
 const shortcut=createDebugShortcut({isEnabled:()=>true,onMatch:()=>calls++});
 for(const value of sequence.slice(0,-1))shortcut.handleKeydown(key(value));
 assert.equal(calls,0);
 const final=key('ArrowLeft');shortcut.handleKeydown(final);
 assert.equal(calls,1);assert.equal(final.defaultPrevented,true);
 for(const value of sequence)shortcut.handleKeydown(key(value));
 assert.equal(calls,2);
});

test('sequências incorretas, mudanças de página e teclas mantidas não completam o atalho',()=>{
 let calls=0;
 const shortcut=createDebugShortcut({isEnabled:()=>true,onMatch:()=>calls++});
 for(const value of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft'])shortcut.handleKeydown(key(value));
 assert.equal(calls,0);
 for(const value of sequence.slice(0,3))shortcut.handleKeydown(key(value));
 shortcut.handleKeydown(key('ArrowRight',{repeat:true}));shortcut.handleKeydown(key('ArrowLeft'));
 assert.equal(calls,0);
 for(const value of sequence.slice(0,3))shortcut.handleKeydown(key(value));
 shortcut.reset();
 for(const value of sequence.slice(3))shortcut.handleKeydown(key(value));
 assert.equal(calls,0);
});

test('o atalho não age fora do painel, em campos de edição ou com modificadores',()=>{
 for(const eventOptions of [{target:{closest:()=>({})}},{ctrlKey:true},{shiftKey:true},{altKey:true},{metaKey:true},{isComposing:true}]){
  let calls=0;
  const shortcut=createDebugShortcut({isEnabled:()=>true,onMatch:()=>calls++});
  for(const value of sequence)shortcut.handleKeydown(key(value,eventOptions));
  assert.equal(calls,0);
 }
 let enabled=false;let calls=0;
 const shortcut=createDebugShortcut({isEnabled:()=>enabled,onMatch:()=>calls++});
 for(const value of sequence)shortcut.handleKeydown(key(value));assert.equal(calls,0);
 enabled=true;for(const value of sequence)shortcut.handleKeydown(key(value));assert.equal(calls,1);
});
