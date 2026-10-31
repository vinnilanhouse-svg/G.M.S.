import {abilityCatalog} from './ability-picker.js';
export const constructGroups={'Constructo de Carne':'Carne','Constructo de Barro':'Barro','Constructo de Metal':'Metal'};
export function abilityGroups(type){
 return [...new Set(abilityCatalog.filter(a=>Boolean(a.specialty)===(type==='specialty')).map(a=>a.species))].flatMap(name=>type==='species'&&name==='Constructos'?Object.keys(constructGroups):[name]);
}
export function abilitiesForGroup(type,name){
 const variant=type==='species'?constructGroups[name]:null;
 return abilityCatalog.filter(a=>Boolean(a.specialty)===(type==='specialty')&&(variant?a.species==='Constructos'&&(!a.variant||a.variant===variant):a.species===name));
}
