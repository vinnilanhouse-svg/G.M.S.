import test from 'node:test';
import assert from 'node:assert/strict';
import postcss from 'postcss';
import { themeColors } from '../scripts/theme-colors.mjs';
import { terminalThemes, terminalThemeKey, readTerminalTheme, createTerminalTheme } from '../src/terminal-theme.js';
import { findCredential, readActiveCredentials, visibleRecords } from '../src/permissions.js';
import { records } from '../src/data.js';

function disk() { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) }; }
function terminal() { const styles = new Map([['--unrelated', 'kept']]); return { dataset: {}, style: { setProperty: (key, value) => styles.set(key, value), removeProperty: key => styles.delete(key) }, styles }; }
const transform = async (css, name = 'style.css') => (await postcss([themeColors()]).process(css, { from: `/workspace/G.M.S./src/${name}` })).css;

test('as oito credenciais de cor só alteram a aparência e não se tornam autorizações', () => {
  assert.deepEqual(terminalThemes.map(theme => theme.code), ['AZUL', 'VERDE', 'ROSA', 'VERMELHO', 'LARANJA', 'BRANCO', 'PRETO', 'ROXO']);
  for (const theme of terminalThemes) {
    const credential = findCredential(` ${theme.code.toLowerCase()} `);
    assert.equal(credential.effect, 'change-theme'); assert.equal(credential.theme, theme.id); assert.equal(credential.entryOnly, true);
    assert.deepEqual([...readActiveCredentials(JSON.stringify(['arquivo-reservado', credential.id]))], ['arquivo-reservado']);
    assert.deepEqual(visibleRecords(records, new Set([credential.id])), visibleRecords(records, new Set()));
    assert.equal(findCredential(`${theme.code}-extra`), undefined);
  }
});

test('a paleta é lembrada, sincronizada e restaurada sem mudar dados do agente ou outras variáveis', () => {
  const storage = disk(); const root = terminal(); const meta = { setAttribute(key, value) { this[key] = value; } };
  storage.setItem('gms-agent-name-v1', 'Agente'); storage.setItem('gms-access-v1', '["arquivo-reservado"]');
  const theme = createTerminalTheme({ storage, root, meta }); assert.equal(theme.id, '');
  assert.equal(theme.select('azul'), true); assert.equal(storage.getItem(terminalThemeKey), 'azul');
  assert.equal(root.dataset.gmsTheme, 'azul'); assert.equal(meta.content, terminalThemes[0].colors.bg);
  assert.equal(readTerminalTheme(storage), 'azul');
  storage.setItem(terminalThemeKey, 'branco'); theme.reload(); assert.equal(root.dataset.gmsScheme, 'light');
  assert.equal(theme.label, 'Branco');
  assert.throws(() => theme.select('__proto__'), /inválida/); assert.equal(theme.id, 'branco');
  theme.select(''); assert.equal(root.dataset.gmsTheme, undefined); assert.equal(root.styles.has('--theme-bg'), false);
  assert.equal(root.styles.get('--unrelated'), 'kept'); assert.equal(meta.content, '#171b19');
  assert.equal(storage.getItem('gms-agent-name-v1'), 'Agente'); assert.equal(storage.getItem('gms-access-v1'), '["arquivo-reservado"]');
});

test('preferências inválidas são ignoradas e o tema permanece utilizável quando o armazenamento é bloqueado', () => {
  for (const invalid of ['', 'AZUL', '{}', 'não-existe', 'url(javascript:alert(1))']) { const storage = disk(); storage.setItem(terminalThemeKey, invalid); assert.equal(readTerminalTheme(storage), ''); }
  const storage = { getItem() { throw new Error(); }, setItem() { throw new Error(); }, removeItem() { throw new Error(); } };
  const root = terminal(); const theme = createTerminalTheme({ storage, root });
  assert.equal(theme.select('roxo'), false); assert.equal(theme.persisted, false); assert.equal(root.dataset.gmsTheme, 'roxo');
  theme.select(''); assert.equal(root.dataset.gmsTheme, undefined);
});

test('textos das oito paletas têm contraste de leitura e controles têm bordas visíveis', () => {
  const luminance = hex => {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
    return .2126 * r + .7152 * g + .0722 * b;
  };
  const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
  for (const theme of terminalThemes) {
    const colors = theme.colors;
    for (const text of ['text', 'secondary', 'muted']) for (const surface of ['bg', 'field', 'panel', 'raised', 'hover', 'selected']) assert.ok(contrast(colors[text], colors[surface]) >= 4.5, `${theme.id}: ${text}/${surface}`);
    assert.ok(contrast(colors['on-accent'], colors['accent-fill']) >= 4.5, theme.id);
    assert.ok(contrast(colors['control-line'], colors.field) >= 3, theme.id);
  }
});

test('o processamento abrange superfícies e textos, preserva cores originais como fallback e transparências', async () => {
  const css = await transform('.pane{color:#edf1e8;background:#171b19;border:1px solid #647d4f;box-shadow:0 2px 8px #0009}.veil{background:#070d06d9}.icon{--resource-color:#93cbd0}');
  assert.match(css, /color:var\(--theme-text, #edf1e8\)/); assert.match(css, /background:var\(--theme-bg, #171b19\)/);
  assert.match(css, /color-mix\(in srgb, var\(--theme-overlay, #000000\) 60%, transparent\)/);
  assert.match(css, /85\.09804%/); assert.match(css, /--resource-color:var\(--theme-accent, #93cbd0\)/);
  assert.equal(await transform(css), css);
});

test('impressão, imagens em URLs, paletas e o efeito PAPÃO preservam seus valores próprios', async () => {
  const css = '@media print{.sheet{color:black;background:white;border:1px solid #999}}';
  assert.equal(await transform(css), css);
  const image = '.picture{background:url("data:image/svg+xml,<svg fill=\'#fff\'/>")}';
  assert.equal(await transform(image), image);
  const denied = '.denied{color:#ffe5df;background:#190d0f}';
  assert.equal(await transform(denied, 'access-denied.css'), denied);
  assert.equal(await transform(denied, 'theme-palettes.css'), denied);
});
