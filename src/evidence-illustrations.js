import { constructIcons, speciesIcons } from './species-icons.js';
import { countryIcons, earthCoastline } from './country-icons.js';

export const maxNoteIllustrations = 4;
const speciesNames = {
  'especie-abissais': 'Abissais', 'especie-anjo': 'Anjos', 'especie-caipora': 'Caiporas',
  'especie-capelobo': 'Capelobos', 'especie-centauro': 'Centauros', 'especie-constructo': 'Constructo de Carne',
  'especie-corpo-seco': 'Corpo Seco e Bradador', 'especie-curupira': 'Curupiras', 'especie-demonio': 'Demônios',
  'especie-fada': 'Fadas', 'especie-gorgona': 'Górgonas', 'especie-humano': 'Humanos',
  'especie-leprechaun': 'Leprechauns', 'especie-lobisomem': 'Lobisomens', 'especie-mumia': 'Múmias',
  'especie-ogro': 'Ogros', 'especie-poltergeist': 'Poltergeists', 'especie-saci': 'Sacis',
  'especie-salamandra': 'Salamandras', 'especie-vampiro': 'Vampiros',
};
export const evidenceIllustrations = [
  ...Object.entries(speciesIcons).map(([id, image]) => ({ id, label: speciesNames[id], group: 'criaturas', src: image.src })),
  ...['metal', 'barro'].map(kind => ({ id: `constructo-${kind}`, label: constructIcons[kind].alt, group: 'criaturas', src: constructIcons[kind].src })),
  { id: 'manticora', label: 'Mantícora', group: 'criaturas', src: '/agent-icons/zaratha-manticora.webp' },
  ...countryIcons.map(country => ({ ...country, group: 'paises' })),
  { id: 'planeta-terra', label: 'Planeta Terra', group: 'mundo', earth: true },
];
const byId = new Map(evidenceIllustrations.map(image => [image.id, image]));
export const getEvidenceIllustration = id => byId.get(id);
export const validNoteIllustrations = value => Array.isArray(value) && value.length <= maxNoteIllustrations && new Set(value).size === value.length && value.every(id => typeof id === 'string' && byId.has(id));
export function noteIllustrations(entry) {
  if (!Array.isArray(entry.illustrations)) return [];
  return [...new Set(entry.illustrations.filter(id => typeof id === 'string' && byId.has(id)))].slice(0, maxNoteIllustrations);
}
export function noteIllustrationData(entry) {
  const illustrations = noteIllustrations(entry);
  return illustrations.length ? { illustrations } : {};
}

const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export function evidenceIllustrationMarkup(id, { decorative = false } = {}) {
  const image = byId.get(id); if (!image) return '';
  if (image.src) return `<img class="note-artwork note-artwork-creature" src="${image.src}" alt="${decorative ? '' : esc(image.label)}" width="128" height="128" loading="lazy" decoding="async"${decorative ? ' aria-hidden="true"' : ''}>`;
  const accessible = decorative ? 'aria-hidden="true"' : `role="img" aria-label="${esc(image.label)}"`;
  const drawing = image.earth ? `<circle cx="50" cy="50" r="42"/><path d="${earthCoastline}"/><path class="earth-grid" d="M8 50h84M14 29h72M14 71h72M50 8C24 28 24 72 50 92M50 8C76 28 76 72 50 92"/>` : `<path d="${image.path}"/>`;
  return `<svg class="note-artwork note-artwork-map" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ${accessible}>${drawing}</svg>`;
}

export function noteIllustrationStrip(entry, { className = '' } = {}) {
  const illustrations = noteIllustrations(entry);
  return illustrations.length ? `<span class="note-illustration-strip ${className}" aria-label="Imagens da anotação">${illustrations.map(id => `<span class="note-illustration-tile" title="${esc(byId.get(id).label)}">${evidenceIllustrationMarkup(id)}</span>`).join('')}</span>` : '';
}
