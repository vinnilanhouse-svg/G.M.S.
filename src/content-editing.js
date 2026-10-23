// Campos editoriais: códigos, vínculos, imagens e condições de acesso são preservados.
export const editableFields = ['title','summary','status','author','department','date','note','quote','report','reportSections','abilities','profile','timeline','people','locations','evidence'];
const limits = {title:180,summary:6000,status:100,author:240,department:240,date:10,note:16000,quote:4000};
const text = (value, max=16000) => typeof value==='string' && value.length<=max && !value.includes('\u0000');
const keysOnly = (value, keys) => value && typeof value==='object' && !Array.isArray(value) && Object.keys(value).every(key=>keys.includes(key));
const stringList = value => Array.isArray(value) && value.length<=250 && value.every(item=>text(item));

export function validateRecordPatch(record, patch) {
  if(!keysOnly(patch,editableFields))throw new Error('O conteúdo contém campos que não podem ser editados.');
  for(const [key,value] of Object.entries(patch)) {
    if(Object.hasOwn(limits,key)) {
      if(!text(value,limits[key])||(key==='title'&&!value.trim()))throw new Error(`Revise o campo ${key}.`);
      if(key==='date'&&(!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(Date.parse(`${value}T12:00:00Z`))||new Date(`${value}T12:00:00Z`).toISOString().slice(0,10)!==value))throw new Error('Informe uma data válida.');
    } else if(['report','people','locations','evidence'].includes(key)) {
      if(!stringList(value)||(key==='report'&&!value.length))throw new Error('Revise os parágrafos do documento.');
    } else if(key==='reportSections') {
      const report=patch.report||record.report;
      if(!Array.isArray(value)||value.length>100||!value.every((section,index)=>keysOnly(section,['title','start','list'])&&text(section.title,240)&&typeof section.list==='boolean'&&Number.isInteger(section.start)&&section.start>=0&&section.start<report.length&&(index===0?section.start===0:section.start>value[index-1].start)))throw new Error('Revise a organização das seções.');
    } else if(key==='abilities') {
      if(!Array.isArray(value)||value.length!==(record.abilities||[]).length||!value.every((ability,index)=>{
        const original=record.abilities[index];
        return keysOnly(ability,['title','text','stage','variant','details'])&&text(ability.title,240)&&text(ability.text)&&ability.stage===original.stage&&ability.variant===original.variant&&(original.details?Array.isArray(ability.details)&&ability.details.length===original.details.length&&ability.details.every(detail=>keysOnly(detail,['title','text'])&&text(detail.title,240)&&text(detail.text)):ability.details===undefined);
      }))throw new Error('Revise as capacidades sem alterar seus grupos ou variantes.');
    } else if(key==='profile') {
      if(!Array.isArray(value)||value.length>60||!value.every(field=>keysOnly(field,['label','value'])&&text(field.label,240)&&text(field.value,4000)))throw new Error('Revise os dados de identificação.');
    } else if(key==='timeline') {
      if(!Array.isArray(value)||value.length>100||!value.every(item=>keysOnly(item,['date','text'])&&text(item.date,240)&&text(item.text)))throw new Error('Revise a cronologia.');
    }
  }
  if(patch.report&&record.reportSections?.length&&!Object.hasOwn(patch,'reportSections'))throw new Error('As seções devem acompanhar a edição do relatório.');
  if(JSON.stringify(patch).length>180000)throw new Error('O documento ultrapassa o tamanho permitido.');
  return patch;
}

export function applyContentOverrides(records, overrides={}) {
  return records.map(record=>{
    const patch=overrides[record.id];
    if(!patch)return record;
    try {return {...record,...validateRecordPatch(record,patch)};}catch{return record;}
  });
}

export function documentSections(record) {
  return record.reportSections?.length
    ? record.reportSections.map((section,index)=>({...section,paragraphs:record.report.slice(section.start,record.reportSections[index+1]?.start)}))
    : [{title:'Texto do documento',start:0,list:false,paragraphs:record.report}];
}

export function flattenSections(sections, structured) {
  const report=[];
  const reportSections=[];
  for(const section of sections) {
    const paragraphs=section.paragraphs.map(paragraph=>paragraph.trim()).filter(Boolean);
    if(!paragraphs.length)throw new Error('Cada seção precisa de pelo menos um parágrafo.');
    reportSections.push({title:section.title,start:report.length,list:Boolean(section.list)});
    report.push(...paragraphs);
  }
  return structured?{report,reportSections}:{report};
}
