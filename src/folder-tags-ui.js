import { cleanFolderTags, folderSearchUrl } from './work-folder-search.js';
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export function folderTagsField(entry = {}, prefix = 'folder') {
  return `<div class="folder-tags-field"><label for="${esc(prefix)}-tags">Etiquetas</label><input id="${esc(prefix)}-tags" name="tags" value="${esc(cleanFolderTags(entry.tags).join(', '))}" maxlength="270" placeholder="Ex.: Vigília, Rá, desaparecimentos" autocomplete="off"><p>Separe por vírgulas. Até 8 etiquetas, com 32 caracteres cada.</p></div>`;
}
export function folderTagChips(tags, missionId = '') {
  return tags?.length ? `<div class="folder-tag-chips" aria-label="Etiquetas">${cleanFolderTags(tags).map(tag => `<a href="${esc(folderSearchUrl({ tag, missionId }))}">${esc(tag)}</a>`).join('')}</div>` : '';
}
