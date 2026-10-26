import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { records } from '../src/data.js';
import { evidenceIllustrations, evidenceIllustrationMarkup, getEvidenceIllustration, noteIllustrations } from '../src/evidence-illustrations.js';
import { countryIcons } from '../src/country-icons.js';
import { createWorkFolder, readWorkFolder, workFolderKey } from '../src/work-folder.js';
import { parseWorkFolderBackup, serializeWorkFolderBackup, workFolderReadableText } from '../src/work-folder-backup.js';

function storage() {
  const data = new Map();
  return { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value) };
}

test('o catálogo cobre todas as espécies, as três variantes de Constructos e a Mantícora, com imagens locais', async () => {
  for (const record of records.filter(record => record.category === 'Espécies')) assert.ok(getEvidenceIllustration(record.id), record.id);
  for (const id of ['especie-constructo', 'constructo-metal', 'constructo-barro', 'manticora']) assert.ok(getEvidenceIllustration(id));
  assert.equal(new Set(evidenceIllustrations.map(image => image.id)).size, evidenceIllustrations.length);
  const constructs = ['especie-constructo', 'constructo-metal', 'constructo-barro'].map(id => getEvidenceIllustration(id).src);
  assert.equal(new Set(constructs).size, 3);
  for (const image of evidenceIllustrations.filter(image => image.src)) {
    const bytes = await readFile(new URL(`../public${image.src}`, import.meta.url));
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  }
});

test('há exatamente vinte países distintos e a Terra, com vetores locais em contorno que acompanham a paleta', () => {
  assert.equal(countryIcons.length, 20);
  assert.equal(new Set(countryIcons.map(country => country.iso)).size, 20);
  for (const image of evidenceIllustrations.filter(image => image.group !== 'criaturas')) {
    const html = evidenceIllustrationMarkup(image.id);
    assert.match(html, /stroke="currentColor"/); assert.match(html, /fill="none"/);
    assert.match(html, /role="img" aria-label=/); assert.doesNotMatch(html, /https?:|<image|<script/);
    if (image.path) {
      const coordinates = image.path.match(/-?\d+(?:\.\d+)?/g).map(Number);
      assert.ok(coordinates.every(number => number >= 8 && number <= 92), image.label);
    }
  }
  assert.match(evidenceIllustrationMarkup('planeta-terra'), /<circle/);
  assert.equal(evidenceIllustrationMarkup('https://outro-site/imagem.svg'), '');
});

test('imagens das notas persistem, podem ser substituídas/removidas e não apagam textos, posições ou ligações', () => {
  const disk = storage(); const folder = createWorkFolder(disk);
  const id = folder.addNote('missao-ultimo-sinal', ['especie-lobisomem', 'pais-brasil']);
  folder.updateNote(id, 'title', 'Avistamento'); folder.updateNote(id, 'body', 'Vestígios em investigação.');
  const location = folder.addLocality({ name: 'Mata', missionId: 'missao-ultimo-sinal' });
  folder.saveConnection({ from: `notes:${id}`, to: `localities:${location}`, label: 'Vestígios no local' });
  folder.moveEvidence(`notes:${id}`, { x: 88, y: 100 });
  const otherTab = createWorkFolder(disk); otherTab.updateNote(id, 'body', 'Texto atualizado em outra aba.');
  folder.setNoteIllustrations(id, ['planeta-terra', 'pais-egito', 'especie-mumia', 'constructo-metal']);
  const restored = createWorkFolder(disk);
  assert.deepEqual(restored.state.notes[0].illustrations, ['planeta-terra', 'pais-egito', 'especie-mumia', 'constructo-metal']);
  assert.equal(restored.state.notes[0].body, 'Texto atualizado em outra aba.');
  assert.deepEqual(restored.state.notes[0].position, { x: 88, y: 100 });
  assert.equal(restored.state.connections.length, 1);
  restored.setNoteIllustrations(id, []); assert.equal(restored.state.notes[0].illustrations, undefined);
  assert.equal(restored.state.notes[0].title, 'Avistamento'); assert.equal(restored.state.connections.length, 1);
});

test('JSON recupera as imagens e o TXT identifica seus nomes; cópias antigas continuam compatíveis', () => {
  const folder = createWorkFolder(storage()); const id = folder.addNote('', ['especie-abissais', 'pais-japao', 'planeta-terra']);
  const original = serializeWorkFolderBackup(folder.state);
  const restored = createWorkFolder(storage()); restored.importData(parseWorkFolderBackup(original));
  assert.deepEqual(restored.state.notes[0].illustrations, folder.state.notes[0].illustrations);
  assert.match(workFolderReadableText(folder.state, []), /Imagens: Abissais · Japão · Planeta Terra/);
  assert.equal(restored.importData(parseWorkFolderBackup(original)).added, 0);
  const old = JSON.parse(original); delete old.data.notes[0].illustrations;
  assert.equal(parseWorkFolderBackup(JSON.stringify(old)).notes[0].id, id);
  assert.equal(parseWorkFolderBackup(JSON.stringify(old)).notes[0].illustrations, undefined);
});

test('IDs desconhecidos, URLs, repetições e mais de quatro imagens são recusados sem perder notas', () => {
  const disk = storage(); const folder = createWorkFolder(disk); const id = folder.addNote();
  folder.updateNote(id, 'body', 'Texto a preservar.');
  for (const images of [['inexistente'], ['https://exemplo.com/a.png'], ['pais-brasil', 'pais-brasil'], ['pais-brasil','pais-egito','pais-japao','planeta-terra','especie-mumia'], 'pais-brasil']) {
    const before = structuredClone(folder.state);
    assert.throws(() => folder.setNoteIllustrations(id, images), /quatro/);
    assert.deepEqual(folder.state, before);
    const backup = JSON.parse(serializeWorkFolderBackup(folder.state)); backup.data.notes[0].illustrations = images;
    assert.throws(() => parseWorkFolderBackup(JSON.stringify(backup)), /imagens de anotação inválidas/);
  }
  const damaged = JSON.parse(disk.getItem(workFolderKey)); damaged.notes[0].illustrations = ['inexistente', 'pais-brasil'];
  disk.setItem(workFolderKey, JSON.stringify(damaged));
  assert.equal(readWorkFolder(disk).notes[0].body, 'Texto a preservar.');
  assert.deepEqual(readWorkFolder(disk).notes[0].illustrations, ['pais-brasil']);
  assert.deepEqual(noteIllustrations({ illustrations: null }), []);
  folder.deleteNote(id); assert.throws(() => folder.setNoteIllustrations(id, ['pais-brasil']), /excluída/);
});

test('notas ilustradas continuam recuperáveis quando o navegador bloqueia o armazenamento', () => {
  const folder = createWorkFolder(); const id = folder.addNote('', ['planeta-terra']);
  folder.setNoteIllustrations(id, ['pais-portugal', 'constructo-barro']); folder.reload();
  assert.equal(folder.persisted, false);
  const recovered = createWorkFolder(storage()); recovered.importData(parseWorkFolderBackup(serializeWorkFolderBackup(folder.state)));
  assert.deepEqual(recovered.state.notes[0].illustrations, ['pais-portugal', 'constructo-barro']);
});
