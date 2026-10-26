import test from 'node:test';
import assert from 'node:assert/strict';
import { corkBoardModel, wrapBoardText } from '../src/evidence-board-export.js';
import { codexAnnotation, codexAnnotations } from '../src/codex-annotations.js';
import { createWorkFolder } from '../src/work-folder.js';
import { records } from '../src/data.js';

test('a cópia visual usa o filtro e as posições atuais, preserva imagens e exclui fichas reservadas', () => {
  const folder = createWorkFolder(); const note = folder.addNote('missao-ultimo-sinal', ['pais-egito', 'especie-mumia']); folder.updateNote(note, 'title', 'Pistas');
  const doc = folder.addDocument('oculto', 'missao-ultimo-sinal'); folder.addLocality({ name: 'Sem missão' });
  folder.saveConnection({ from: `notes:${note}`, to: `documents:${doc}`, label: 'Conferir' });
  const model = corkBoardModel(folder.state, [{ id: 'oculto', title: 'Nome reservado', image: { src: '/segredo.png' }, unlisted: true }], { missionId: 'missao-ultimo-sinal', positions: new Map([[`notes:${note}`, { x: 300, y: 200 }]]) });
  assert.equal(model.nodes.length, 2); assert.equal(model.links.length, 1);
  assert.deepEqual(model.nodes.find(node => node.ref === `notes:${note}`).position, { x: 300, y: 200 });
  assert.deepEqual(model.nodes.find(node => node.ref === `notes:${note}`).images.map(image => image.id), ['pais-egito', 'especie-mumia']);
  assert.ok(model.nodes.every(node => Number.isFinite(node.position.x)));
  assert.doesNotMatch(JSON.stringify(model), /Nome reservado|segredo.png/);
});

test('textos longos e palavras sem espaços cabem nos cartões com reticências', () => {
  const measure = text => text.length * 6;
  const lines = wrapBoardText('Uma palavraextremamentelongasemespacos para conferir o limite do papel.', measure, 66, 3);
  assert.equal(lines.length, 3); assert.ok(lines.every(line => measure(line) <= 66)); assert.ok(lines.at(-1).endsWith('…'));
  assert.deepEqual(wrapBoardText('Rá\nVigília', measure, 100, 3), ['Rá', 'Vigília']);
});

test('anotações de C.O.D.E.X usam registros e referências existentes, sem revelar entradas reservadas', () => {
  for (const [id, annotation] of Object.entries(codexAnnotations)) {
    const record = records.find(record => record.id === id); assert.ok(record, id); assert.ok(!record.unlisted);
    for (const target of annotation.references) assert.ok(records.some(record => record.id === target && !record.unlisted), target);
    assert.match(codexAnnotation(record, records), /NOTA DO ARQUIVISTA/);
  }
  const record = records.find(record => record.id === 'missao-ultimo-sinal');
  assert.equal(codexAnnotation({ ...record, unlisted: true }, records), '');
  assert.doesNotMatch(codexAnnotation(record, records.filter(record => record.id !== 'missao-sol-velado')), /href="#\/arquivo\/missao-sol-velado"/);
});
