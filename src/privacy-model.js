export const privacyKey = 'gms-privacy-consent-v1';
export const consentLifetime = 180 * 24 * 60 * 60 * 1000;
export function readConsent(storage, now = Date.now()) {
  try {
    const value = JSON.parse(storage.getItem(privacyKey));
    if (value?.version !== 1 || typeof value.analytics !== 'boolean' || !Number.isFinite(value.at) || value.at > now || now - value.at >= consentLifetime) return null;
    return value;
  } catch { return null; }
}
export function analyticsPath(hash) {
  const route = String(hash || '').split('?')[0];
  if (route.startsWith('#/arquivo/')) return '/arquivo';
  const page = route.replace(/^#\//, '');
  const allowed = ['inicio','conhecimento','agentes','missoes','missoes/relatorios','documentos','alvos','privacidade'];
  return allowed.includes(page) ? `/${page}` : '/area-pessoal';
}
// No raw URL, query, document identifier, search text or custom event leaves this gate.
export function filterAnalytics(event, { consent, origin, hash }) {
  if (!consent || event.type !== 'pageview') return null;
  try { if (new URL(event.url).pathname === '/analytics-initialization') return null; } catch { return null; }
  return { type: 'pageview', url: origin + analyticsPath(hash) };
}
