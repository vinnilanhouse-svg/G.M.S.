// Coleções pessoais independentes do acervo. Alterações em outra aba não são
// sobrescritas: a comparação ocorre apenas nos campos que o editor modificou.
export const personalId = () => crypto.randomUUID();
export const escapePersonal = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const validPersonalId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
export const validPersonalDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
export function createPersonalRecords(key, validate, storage) {
  if (!storage) try { storage = globalThis.localStorage; } catch {}
  let items = [];
  let persisted = true;
  function read() {
    try {
      const value = JSON.parse(storage?.getItem(key) || 'null');
      if (value?.version !== 1 || !Array.isArray(value.items)) return [];
      const ids = new Set();
      return value.items.flatMap(item => {
        try { const clean = validate(item); if (ids.has(clean.id)) return []; ids.add(clean.id); return [clean]; } catch { return []; }
      });
    } catch { return []; }
  }
  function reload(force = false) { if (force) persisted = true; if (persisted) items = read(); return structuredClone(items); }
  function write(next) {
    items = next;
    try { storage.setItem(key, JSON.stringify({ version: 1, items })); persisted = true; } catch { persisted = false; }
  }
  reload();
  return {
    get items() { return structuredClone(items); },
    get persisted() { return persisted; },
    reload,
    add(input) {
      const item = validate(input); const current = reload();
      if (current.some(entry => entry.id === item.id)) throw new Error('Este registro já existe. Abra a versão salva.');
      write([item, ...current]); return structuredClone(item);
    },
    update(id, patch, expected = {}) {
      const current = reload(); const item = current.find(entry => entry.id === id);
      if (!item) throw new Error('Este registro foi removido em outra aba. Reabra a página.');
      if (Object.entries(expected).some(([field, value]) => JSON.stringify(item[field]) !== JSON.stringify(value))) throw new Error('Este campo mudou em outra aba. Seu texto continua no editor; copie-o e reabra o registro antes de salvar.');
      const next = validate({ ...item, ...patch, id, createdAt: item.createdAt, updatedAt: new Date().toISOString() });
      write(current.map(entry => entry.id === id ? next : entry)); return structuredClone(next);
    },
    remove(id, expected) {
      const current = reload(); const item = current.find(entry => entry.id === id);
      if (expected && item && JSON.stringify(item) !== JSON.stringify(expected)) throw new Error('Este registro mudou em outra aba. Reabra a página antes de removê-lo.');
      write(current.filter(entry => entry.id !== id));
    },
  };
}

export function downloadPersonal(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
