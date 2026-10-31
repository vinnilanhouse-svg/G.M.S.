import specialties from './specialties.json' with {type:'json'};
import {agentSheetSkills} from './agent-sheet-schema.js';
export {specialties};
export const specialtyAbilities=specialties.flatMap(s=>s.abilities);
const normalize = value=>value.normalize('NFD').replace(/\p{M}/gu,'').replace(/^\*/,'').toLowerCase().replace('performance','performace');
export function specialtyBonusFields(name){
 const specialty=specialties.find(s=>s.name===name);
 return specialty?specialty.skills.map(label=>`${agentSheetSkills.find(skill=>normalize(skill.label)===normalize(label)).id}_bonus`):[];
}
export function applySpecialtyBonuses(fields,tracked=[]){
 const next={...fields},wanted=specialtyBonusFields(fields.especialidade),automatic=[];
 for(const name of tracked)if(!wanted.includes(name)&&next[name]==='1')next[name]='0';
 for(const name of wanted){
  if(Number(next[name])===0){next[name]='1';automatic.push(name);}
  else if(tracked.includes(name)&&next[name]==='1')automatic.push(name);
 }
 return {fields:next,automatic};
}
