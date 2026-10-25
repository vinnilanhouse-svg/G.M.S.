export const terminalThemeKey = 'gms-terminal-theme-v1';

function palette(id, code, label, scheme, colors) {
  return Object.freeze({ id, code, label, scheme, colors: Object.freeze({ ...colors, 'accent-fill': colors.accent, 'soft-accent': colors.accent, 'line-strong': colors['control-line'] }) });
}

export const terminalThemes = Object.freeze([
  palette('azul', 'AZUL', 'Azul', 'dark', {
    bg: '#101928', field: '#0c1420', panel: '#182438', raised: '#1f3049', hover: '#293d59', selected: '#304661',
    text: '#eff5ff', secondary: '#cbd9ed', muted: '#aabed9', accent: '#a9caff', line: '#3e5570', 'control-line': '#7c9abd', 'on-accent': '#0f1929', overlay: '#05080d',
  }),
  palette('verde', 'VERDE', 'Verde', 'dark', {
    bg: '#101d16', field: '#0b150f', panel: '#18291e', raised: '#213727', hover: '#2b4532', selected: '#304a37',
    text: '#eff8ed', secondary: '#cee0cd', muted: '#afc9ab', accent: '#afe0a5', line: '#455f49', 'control-line': '#86a87c', 'on-accent': '#12230f', overlay: '#040b06',
  }),
  palette('rosa', 'ROSA', 'Rosa', 'dark', {
    bg: '#211520', field: '#170d16', panel: '#2d1c2a', raised: '#392638', hover: '#493146', selected: '#50364b',
    text: '#fff1fb', secondary: '#efd2e7', muted: '#d6b1cd', accent: '#edb2d7', line: '#6e4966', 'control-line': '#b286a8', 'on-accent': '#301327', overlay: '#0b0409',
  }),
  palette('vermelho', 'VERMELHO', 'Vermelho', 'dark', {
    bg: '#211316', field: '#170b0e', panel: '#2d1a1f', raised: '#38232a', hover: '#492d34', selected: '#503239',
    text: '#fff0ef', secondary: '#efd0cd', muted: '#d9aba8', accent: '#f3a5a0', line: '#6e434a', 'control-line': '#bb7e83', 'on-accent': '#301116', overlay: '#0d0407',
  }),
  palette('laranja', 'LARANJA', 'Laranja', 'dark', {
    bg: '#20170f', field: '#171008', panel: '#2a1e13', raised: '#342718', hover: '#433121', selected: '#4c3826',
    text: '#fff4e8', secondary: '#ead6bd', muted: '#d0b99d', accent: '#efbc86', line: '#65513c', 'control-line': '#b58e64', 'on-accent': '#2c1a0a', overlay: '#0c0804',
  }),
  palette('branco', 'BRANCO', 'Branco', 'light', {
    bg: '#f3f4f4', field: '#fbfcfc', panel: '#ffffff', raised: '#e9ecec', hover: '#e0e5e4', selected: '#d9dddf',
    text: '#17201d', secondary: '#30403d', muted: '#4d5b58', accent: '#31383b', line: '#9ca6a7', 'control-line': '#657175', 'on-accent': '#ffffff', overlay: '#06090c',
  }),
  palette('preto', 'PRETO', 'Preto', 'dark', {
    bg: '#08090a', field: '#050607', panel: '#111315', raised: '#191c1f', hover: '#24292d', selected: '#30363b',
    text: '#f3f5f7', secondary: '#d4d9dd', muted: '#aeb8bf', accent: '#d2dbe2', line: '#424b52', 'control-line': '#82929e', 'on-accent': '#11181e', overlay: '#000000',
  }),
  palette('roxo', 'ROXO', 'Roxo', 'dark', {
    bg: '#191522', field: '#100d18', panel: '#241f30', raised: '#2f283f', hover: '#3c3350', selected: '#443a58',
    text: '#f8f1ff', secondary: '#ddd1ed', muted: '#c2afd6', accent: '#c8adf0', line: '#5d4f74', 'control-line': '#9e87bc', 'on-accent': '#211333', overlay: '#07040d',
  }),
]);

const findTheme = id => terminalThemes.find(theme => theme.id === id);
export function readTerminalTheme(storage) {
  try { return findTheme(storage.getItem(terminalThemeKey))?.id || ''; } catch { return ''; }
}

export function createTerminalTheme({ storage, root = globalThis.document?.documentElement, meta = globalThis.document?.querySelector('meta[name="theme-color"]') } = {}) {
  if (!storage) try { storage = globalThis.localStorage; } catch {}
  let id = readTerminalTheme(storage);
  let persisted = true;
  function apply() {
    const theme = findTheme(id);
    const keys = Object.keys(terminalThemes[0].colors);
    for (const key of keys) {
      if (theme) root?.style.setProperty(`--theme-${key}`, theme.colors[key]);
      else root?.style.removeProperty(`--theme-${key}`);
    }
    if (root) {
      if (theme) { root.dataset.gmsTheme = theme.id; root.dataset.gmsScheme = theme.scheme; }
      else { delete root.dataset.gmsTheme; delete root.dataset.gmsScheme; }
    }
    meta?.setAttribute('content', theme?.colors.bg || '#171b19');
  }
  apply();
  return {
    get id() { return id; },
    get label() { return findTheme(id)?.label || 'Padrão G.M.S.'; },
    get persisted() { return persisted; },
    select(next) {
      if (next !== '' && !findTheme(next)) throw new Error('Paleta de terminal inválida.');
      id = next; apply();
      try { if (id) storage.setItem(terminalThemeKey, id); else storage.removeItem(terminalThemeKey); persisted = true; } catch { persisted = false; }
      return persisted;
    },
    reload() { id = readTerminalTheme(storage); apply(); },
  };
}
