import { validPersonalDate, validPersonalId } from './personal-records.js';
export const documentHighlightsKey = 'gms-document-highlights-v1';
export function validateDocumentHighlight(value) {
  if (!value || !validPersonalId(value.id) || !validPersonalId(value.recordId) || !validPersonalDate(value.createdAt) || !validPersonalDate(value.updatedAt) ||
    typeof value.block !== 'string' || !/^[a-zA-Z0-9_-]+:\d+$/.test(value.block) ||
    typeof value.quote !== 'string' || !value.quote.trim() || value.quote.length > 4000 ||
    !Number.isSafeInteger(value.start) || value.start < 0 || !Number.isSafeInteger(value.end) || value.end <= value.start || value.end - value.start !== value.quote.length ||
    typeof value.prefix !== 'string' || value.prefix.length > 64 || typeof value.suffix !== 'string' || value.suffix.length > 64 ||
    typeof value.comment !== 'string' || value.comment.length > 6000 || !['destaque', 'duvida', 'atencao'].includes(value.tone)) throw new Error('Este grifo não tem uma referência válida.');
  return Object.fromEntries(['id', 'recordId', 'createdAt', 'updatedAt', 'block', 'quote', 'start', 'end', 'prefix', 'suffix', 'comment', 'tone'].map(key => [key, value[key]]));
}
export function resolveDocumentHighlight(text, item) {
  if (text.slice(item.start, item.end) === item.quote) return { start: item.start, end: item.end };
  const candidates = [];
  for (let index = text.indexOf(item.quote); index >= 0; index = text.indexOf(item.quote, index + 1)) {
    if ((!item.prefix || text.slice(Math.max(0, index - item.prefix.length), index) === item.prefix) && (!item.suffix || text.slice(index + item.quote.length, index + item.quote.length + item.suffix.length) === item.suffix)) candidates.push(index);
  }
  return candidates.length === 1 ? { start: candidates[0], end: candidates[0] + item.quote.length } : null;
}
export const highlightRangesOverlap = (a, b) => a.start < b.end && b.start < a.end;
