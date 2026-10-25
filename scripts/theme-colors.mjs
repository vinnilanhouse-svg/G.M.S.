import valueParser from 'postcss-value-parser';

// Converte somente as cores da interface em tokens com o valor original como
// fallback. Novos componentes entram nos temas sem repetir listas de seletores.
function colorToken(property, lightness, alpha) {
  const named = { '--bg': 'bg', '--panel': 'panel', '--panel-light': 'raised', '--line': 'line', '--text': 'text', '--muted': 'muted', '--accent': 'accent', '--reading-secondary': 'secondary' };
  if (named[property]) return named[property];
  if (property.startsWith('--')) return 'accent';
  if (/^(color|fill|stroke|caret-color|text-decoration-color)$/.test(property)) {
    return lightness < .3 ? 'on-accent' : lightness >= .8 ? 'text' : lightness >= .6 ? 'secondary' : 'muted';
  }
  if (/border|outline|column-rule/.test(property)) return lightness > .5 ? 'accent' : lightness > .38 ? 'line-strong' : 'line';
  if (/shadow|filter/.test(property)) return lightness < .3 ? 'overlay' : 'accent';
  if (alpha < 1 && lightness < .08) return 'overlay';
  return lightness >= .6 ? 'accent-fill' : lightness >= .4 ? 'soft-accent' : lightness >= .24 ? 'selected' : lightness >= .18 ? 'hover' : lightness >= .15 ? 'raised' : lightness >= .12 ? 'panel' : lightness >= .08 ? 'bg' : 'field';
}

export function themeColors() {
  return {
    postcssPlugin: 'gms-interface-palette',
    Declaration(declaration) {
      const file = declaration.source?.input.file || '';
      if (!/[\\/]src[\\/]/.test(file) || /[\\/](access-denied|theme-palettes)\.css$/.test(file)) return;
      for (let parent = declaration.parent; parent; parent = parent.parent) {
        if (parent.type === 'atrule' && parent.name === 'media' && /\bprint\b/.test(parent.params)) return;
      }
      // A visita é idempotente: o PostCSS pode visitar novamente uma declaração.
      if (declaration.value.includes('--theme-')) return;
      const parsed = valueParser(declaration.value);
      let changed = false;
      parsed.walk(node => {
        if (node.type === 'function' && node.value === 'url') return false;
        if (node.type !== 'word') return;
        let color = node.value;
        if (color === 'white') color = '#ffffff';
        if (color === 'black') color = '#000000';
        if (!/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(color)) return;
        let hex = color.slice(1);
        if (hex.length <= 4) hex = [...hex].map(char => char + char).join('');
        const rgb = [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
        const alpha = hex.length === 8 ? parseInt(hex.slice(6), 16) / 255 : 1;
        const token = colorToken(declaration.prop, (Math.max(...rgb) + Math.min(...rgb)) / 2, alpha);
        const base = `var(--theme-${token}, #${hex.slice(0, 6)})`;
        node.value = alpha === 1 ? base : `color-mix(in srgb, ${base} ${Number((alpha * 100).toFixed(5))}%, transparent)`;
        changed = true;
      });
      if (changed) declaration.value = parsed.toString();
    },
  };
}
