import {validateRecordPatch} from './content-editing.js';

export const localEditsKey='gms-local-edits-v1';
export function readLocalEdits(storage) {
  try {
    const document=JSON.parse(storage.getItem(localEditsKey)||'null');
    if(document&&Number.isInteger(document.revision)&&document.revision>=0&&document.overrides&&typeof document.overrides==='object'&&!Array.isArray(document.overrides))return document;
  } catch {}
  return {revision:0,overrides:{}};
}
export function saveLocalEdit(storage,record,patch,{revision,reset=false}={}) {
  const current=readLocalEdits(storage);
  if(current.revision!==revision)throw new Error('Outra aba alterou as edições locais. Atualize os dados antes de salvar; seu texto continua no editor.');
  if(!reset)validateRecordPatch(record,patch);
  const overrides={...current.overrides};
  if(reset)delete overrides[record.id];else overrides[record.id]=patch;
  const next={revision:current.revision+1,overrides};
  try {storage.setItem(localEditsKey,JSON.stringify(next));}
  catch {throw new Error('O navegador não permitiu salvar. Seu texto continua no editor; verifique o espaço disponível e as permissões de armazenamento.');}
  return next;
}
