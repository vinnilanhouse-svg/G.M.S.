import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSearch, recordSearchText, searchPreview } from '../src/search-preview.js';

test('search preview finds body/ability content with accent-insensitive matching and original text', () => {
  const record = {code:'ESP-123',title:'Espécie', summary:'Registro', report:['Antes. '.repeat(60)+'A investigação encontrou relíquias no túmulo. '+ 'Depois. '.repeat(60)], abilities:[{title:'Ápice',details:[{title:'Visão',text:'Percebe inscrições.'}]}]};
  assert.ok(normalizeSearch(recordSearchText(record)).includes('percebe inscricoes'));
  const preview = searchPreview(record,'RELIQUIAS');
  assert.equal(preview.match,'relíquias');
  assert.ok(preview.before.includes('encontrou'));
  assert.ok(preview.after.includes('túmulo'));
  assert.equal(preview.leading,true); assert.equal(preview.trailing,true);
  assert.ok((preview.before+preview.match+preview.after).length<=230);
});
test('preview handles Unicode, punctuation and literal HTML without creating markup', () => {
  const record = {title:'🗃 Arquivo',report:['Ação <img src=x onerror=alert(1)> e informações.']};
  assert.equal(searchPreview(record,'acao').match,'Ação');
  assert.equal(searchPreview(record,'<img').match,'<img');
  assert.equal(searchPreview(record,'🗃').match,'🗃');
  assert.equal(searchPreview(record,'ausente').match,'');
  assert.equal(searchPreview({},'').before,'');
});
