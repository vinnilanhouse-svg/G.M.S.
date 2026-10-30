// Only index records supplied by the public/authorized catalog.
export const normalizeSearch = value => String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
export function recordSearchText(record) {
  return [record.code, record.title, record.summary, record.category, ...(record.report || []),
    ...(record.abilities || []).flatMap(a => [a.title, a.text, a.variant, ...(a.details || []).flatMap(d => [d.title, d.text])]),
    ...(record.profile || []).map(f => f.value), ...(record.timeline || []).flatMap(t => [t.title, t.text, t.description])].filter(Boolean).join(' ');
}
export function searchPreview(record, query, limit = 230) {
  const text = recordSearchText(record).replace(/\s+/g, ' ').trim();
  const needle = normalizeSearch(query).trim();
  // Keep normalized character positions mapped to the original Unicode string.
  let normalized = ''; const offsets = [];
  for (let i = 0; i < text.length;) {
    const char = String.fromCodePoint(text.codePointAt(i));
    const part = normalizeSearch(char);
    for (let j = 0; j < part.length; j++) offsets.push(i);
    normalized += part; i += char.length;
  }
  const index = needle ? normalized.indexOf(needle) : -1;
  const match = index >= 0 ? offsets[index] : 0;
  let start = Math.max(0, match - 65);
  if (start) { const space = text.indexOf(' ', start); if (space >= 0 && space < match) start = space + 1; }
  let end = Math.min(text.length, start + limit);
  if (end < text.length) { const space = text.lastIndexOf(' ', end); if (space > start + limit / 2) end = space; }
  const snippet = text.slice(start, end);
  const local = index >= 0 ? match - start : -1;
  const matchEnd = index >= 0 ? (offsets[index + needle.length] ?? text.length) - start : -1;
  return { before: local >= 0 ? snippet.slice(0, local) : snippet, match: local >= 0 ? snippet.slice(local, Math.min(matchEnd, snippet.length)) : '', after: local >= 0 ? snippet.slice(matchEnd) : '', leading: start > 0, trailing: end < text.length };
}
