import test from 'node:test';
import assert from 'node:assert/strict';
import {rollAbilityExpression} from '../src/agent-sheet-rolls.js';
test('ability dice draw each face independently and add the fixed modifier exactly once',()=>{
 let calls=0;
 const source={getRandomValues(array){array[0]=[0,7][calls++];return array;}};
 assert.deepEqual(rollAbilityExpression('2D8+3',source),{count:2,sides:8,modifier:3,faces:[1,8],result:12});
 assert.equal(calls,2);
 assert.throws(()=>rollAbilityExpression('99D8',source));assert.equal(calls,2);
 assert.throws(()=>rollAbilityExpression('1D8',{}),/gerador seguro/);
});
