const clone = value => structuredClone(value);
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const same = (a, b) => a === b || JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const withoutTime = entry => entry && Object.fromEntries(Object.entries(entry).filter(([key]) => key !== 'updatedAt'));
const conflict = () => new Error('Este registro mudou desde a ação original. Atualize o quadro; as alterações atuais foram preservadas.');

export function createWorkFolderHistory(collections, apply) {
  const undo = []; const redo = [];
  function record(before, after, label) {
    const changes = [];
    for (const kind of collections) {
      const previous = new Map((before[kind] || []).map((entry, index) => [entry.id, { entry, index }]));
      const next = new Map((after[kind] || []).map((entry, index) => [entry.id, { entry, index }]));
      for (const id of new Set([...previous.keys(), ...next.keys()])) {
        const a = previous.get(id); const b = next.get(id);
        if (same(a?.entry, b?.entry)) continue;
        if (!a || !b) changes.push({ kind, id, before: clone(a || null), after: clone(b || null) });
        else {
          const fields = [...new Set([...Object.keys(a.entry), ...Object.keys(b.entry)])].filter(key => key !== 'updatedAt' && !same(a.entry[key], b.entry[key]));
          if (fields.length) changes.push({ kind, id, fields, before: clone(a), after: clone(b) });
        }
      }
    }
    if (!changes.length) return;
    undo.push({ label, changes }); if (undo.length > 50) undo.shift(); redo.length = 0;
  }
  function move(from, to, reverse) {
    const command = from.at(-1); if (!command) return false;
    apply(current => {
      const next = { ...current };
      for (const change of command.changes) {
        const expected = reverse ? change.after : change.before;
        const desired = reverse ? change.before : change.after;
        const entries = [...next[change.kind]]; const index = entries.findIndex(entry => entry.id === change.id); const actual = entries[index];
        if (change.fields) {
          if (!actual || change.fields.some(field => !same(actual[field], expected.entry[field]))) throw conflict();
          const updated = { ...actual };
          for (const field of change.fields) {
            if (Object.hasOwn(desired.entry, field)) updated[field] = clone(desired.entry[field]); else delete updated[field];
          }
          if (expected.entry.updatedAt !== desired.entry.updatedAt) updated.updatedAt = new Date().toISOString();
          entries[index] = updated;
        } else if (expected) {
          if (!actual || !same(withoutTime(actual), withoutTime(expected.entry))) throw conflict();
          if (desired) entries[index] = clone(desired.entry); else entries.splice(index, 1);
        } else {
          if (actual || !desired) throw conflict();
          entries.splice(Math.min(desired.index, entries.length), 0, clone(desired.entry));
        }
        next[change.kind] = entries;
      }
      return next;
    });
    from.pop(); to.push(command); return true;
  }
  return {
    clear() { undo.length = 0; redo.length = 0; },
    record, undo: () => move(undo, redo, true), redo: () => move(redo, undo, false),
    get undoLabel() { return undo.at(-1)?.label || ''; }, get redoLabel() { return redo.at(-1)?.label || ''; },
    forget(ids) {
      for (const stack of [undo, redo]) for (let index = stack.length - 1; index >= 0; index--) if (stack[index].changes.some(change => ids[change.kind]?.has(change.id))) stack.splice(index, 1);
    },
  };
}
