// As seções e fichas usam hash. Um caminho externo desconhecido também é um erro,
// mesmo quando o servidor entrega index.html como fallback da aplicação.
export function isArchivePath({ protocol, pathname }) {
  return protocol === 'file:' || pathname === '/' || pathname === '/index.html';
}

export function resolveRoute(hash, sections) {
  const [rawPath, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const path = rawPath.replace(/\/$/, '') || 'inicio';
  const [page, id] = path.split('/');
  if (Object.hasOwn(sections, path) || (page === 'arquivo' && id && path.split('/').length === 2)) {
    return { page, id, query };
  }
  return { page: 'perdido', query };
}

// Chamado somente na inicialização, nunca a cada renderização ou troca de aba.
export function shouldShowEntryDetour(random = Math.random) {
  return random() < 0.01;
}
