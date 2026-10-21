import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {records} from '../src/data.js';

test('as 20 espécies têm imagens e miniaturas locais correspondentes às seções da fonte',async()=>{
 const species=records.filter(record=>record.category==='Espécies');
 assert.equal(species.length,20);
 assert.equal(new Set(species.map(record=>record.image?.src)).size,20);
 for(const record of species){
  const image=record.image;
  assert.ok(image,record.id);
  assert.equal(image.src,`/species/${record.id}.webp`);
  assert.equal(image.thumbnail,`/species/${record.id}-thumb.webp`);
  assert.ok(image.alt.includes(record.title));
  assert.equal(image.sourceSection,record.sourceSection);
  assert.ok(image.width>0&&image.width<=1200&&image.height>0&&image.height<=1200);
  assert.ok(image.thumbnailWidth>0&&image.thumbnailWidth<=480&&image.thumbnailHeight>0&&image.thumbnailHeight<=480);
  for(const field of ['src','thumbnail']){
   const path=new URL(`../public${image[field]}`,import.meta.url);
   const bytes=await readFile(path);
   assert.equal(bytes.toString('ascii',0,4),'RIFF');
   assert.equal(bytes.toString('ascii',8,12),'WEBP');
   assert.ok((await stat(path)).size<(field==='thumbnail'?100_000:600_000),image[field]);
  }
 }
});
