// Ícones vetoriais próprios: apenas contorno, com a cor da paleta ativa.
const drawings = {
 'Alquimista': '<path d="M18 5h12M20 5v14L10 36a5 5 0 0 0 4 7h20a5 5 0 0 0 4-7L28 19V5M15 29h18"/><circle cx="21" cy="35" r="1.5"/><circle cx="29" cy="38" r="1"/><path d="m35 9 2-4 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z"/>',
 'Artista': '<path d="M27 8v25M27 12l13-4v21M27 19l13-4"/><ellipse cx="21" cy="34" rx="6" ry="4"/><ellipse cx="34" cy="30" rx="6" ry="4"/><path d="m6 6 12 5-5 12-7-3V6ZM8 28v12m-4-6h8"/>',
 'Criminoso': '<path d="M7 17c5-3 11-4 17-1 6-3 12-2 17 1l-2 12c-5 5-10 2-15-1-5 3-10 6-15 1L7 17Z"/><path d="M13 21c2-1 5-1 7 1-1 4-5 5-7-1Zm22 0c-2-1-5-1-7 1 1 4 5 5 7-1ZM16 10l5-5m6 0 5 5M15 36l9 7 9-7"/>',
 'Cozinheiro': '<path d="M14 29c-10 0-12-14-2-17 2-9 12-11 17-4 9-2 15 8 10 14-1 4-5 7-9 7M14 25v17h20V25M14 35h20M20 26v5m8-5v5"/>',
 'Investigador': '<circle cx="21" cy="20" r="13"/><path d="m31 30 12 12-4 4-12-12M16 14c7-7 16 4 8 10m-10-4c0-10 15-10 15 0m-10 7c5-1 7-5 5-9m-8 9c-2-2-2-5-1-8m5 1v3"/>',
 'Artes Marciais': '<path d="M13 26V12a4 4 0 0 1 8 0v10M21 18V8a4 4 0 0 1 8 0v14M29 18v-6a4 4 0 0 1 8 0v17l-6 8v7H17v-7L7 27a4 4 0 0 1 6-5l5 4M17 37h14M20 31h11"/>',
 'Atirador de Elite': '<circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="7"/><path d="M24 3v12m0 18v12M3 24h12m18 0h12M24 21v6m-3-3h6"/>',
 'Esgrimista': '<path d="m14 32 6-3L42 6 36 28l-12 8M16 29l10 10M11 32l10 10M16 37 7 46M10 43l-5-5m17-7L38 12"/><path d="M9 29c-7 1-7 11 0 13 6 3 12 0 13-6"/>',
 'Cavaleiro': '<path d="m24 4 17 7v14c0 10-9 16-17 20C16 41 7 35 7 25V11l17-7Z"/><path d="M17 22v-4a7 7 0 0 1 14 0v4M15 22h18l-2 11H17l-2-11ZM21 26v4m6-4v4M24 11v7M20 36h8"/>',
 'Mestre das Sombras': '<path d="M7 37C7 22 13 10 24 4c11 6 17 18 17 33l-17 8L7 37Z"/><path d="M14 24c1-7 5-12 10-15 5 3 9 8 10 15M14 24l10-4 10 4-3 12-7 4-7-4-3-12ZM17 26l4 2m10-2-4 2M21 34h6"/>'
};
export function specialtyIcon(name) {
 const drawing=Object.hasOwn(drawings,name)?drawings[name]:null;
 return drawing?`<svg class="icon specialty-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${drawing}</svg>`:'';
}
