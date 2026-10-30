import test from 'node:test';
import assert from 'node:assert/strict';
import { readConsent, consentLifetime, analyticsPath, filterAnalytics } from '../src/privacy-model.js';
test('consent requires explicit boolean, valid version and fresh timestamp',()=>{
 const now=1800000000000;
 for(const value of [null,{}, {version:1,analytics:'true',at:now},{version:2,analytics:true,at:now},{version:1,analytics:true,at:now+1},{version:1,analytics:true,at:now-consentLifetime}])assert.equal(readConsent({getItem:()=>JSON.stringify(value)},now),null);
 assert.equal(readConsent({getItem(){throw Error('blocked')}},now),null);
 for(const analytics of [false,true])assert.equal(readConsent({getItem:()=>JSON.stringify({version:1,analytics,at:now})},now).analytics,analytics);
});
test('analytics only exposes coarse navigation, never search or record identifiers',()=>{
 for(const hash of ['#/arquivo/dante-walker','#/arquivo/agente-nawan-otaku?code=SECRET'])assert.equal(analyticsPath(hash),'/arquivo');
 for(const hash of ['#/busca?q=nome-pessoal','#/pasta-de-trabalho?nota=private','#/credenciais?code=NAWAN_OTAKU','#/administracao','malformed'])assert.equal(analyticsPath(hash),'/area-pessoal');
 assert.equal(analyticsPath('#/conhecimento?q=secret'),'/conhecimento');
 const options={consent:true,origin:'https://example.test',hash:'#/arquivo/dante-walker'};
 assert.deepEqual(filterAnalytics({type:'pageview',url:'https://example.test/?private=secret#private',payload:{name:'private'}},options),{type:'pageview',url:'https://example.test/arquivo'});
 assert.equal(filterAnalytics({type:'pageview',url:'https://example.test/analytics-initialization'},options),null);
 assert.equal(filterAnalytics({type:'pageview',url:'invalid'},options),null);
 assert.equal(filterAnalytics({type:'event',url:'https://example.test'},options),null);
 assert.equal(filterAnalytics({type:'pageview',url:'https://example.test'},{...options,consent:false}),null);
});
