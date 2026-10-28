// Escrita de várias partes do perfil com verificação de concorrência e rollback.
// As chaves permitidas são decididas pelo chamador; não há importação arbitrária
// de localStorage, credenciais de consulta ou configurações administrativas.
export function commitPersonalStorage(storage, changes, expected = {}) {
  const keys = Object.keys(changes);
  const before = Object.fromEntries(keys.map(key => [key, storage.getItem(key)]));
  for (const [key, value] of Object.entries(expected)) if (storage.getItem(key) !== value) throw new Error('Seus dados mudaram em outra aba. Confira a versão atual e tente novamente.');
  const written = [];
  try {
    for (const key of keys) {
      if (storage.getItem(key) !== before[key]) throw new Error('Seus dados mudaram em outra aba.');
      if (changes[key] === null) storage.removeItem(key); else storage.setItem(key, changes[key]);
      written.push(key);
    }
  } catch (error) {
    let recovered = true;
    for (const key of written.reverse()) {
      try {
        if (storage.getItem(key) !== changes[key]) { recovered = false; continue; }
        if (before[key] === null) storage.removeItem(key); else storage.setItem(key, before[key]);
      } catch { recovered = false; }
    }
    throw new Error(recovered ? 'Não foi possível salvar a alteração completa. Os dados anteriores foram preservados. Confira o espaço do navegador e tente novamente.' : 'A gravação foi interrompida e outra aba pode ter alterado seus dados. Exporte uma cópia e confira os registros antes de continuar.', { cause: error });
  }
  return { before, after: { ...changes } };
}
