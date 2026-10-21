import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, basename } from 'node:path';

// Exporta o build como um único HTML que funciona sem servidor e sem internet.
const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
let html = await readFile(resolve(dist, 'index.html'), 'utf8');
const script = html.match(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/);
const stylesheet = html.match(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/);
if (!script || !stylesheet) throw new Error('Execute npm run build antes de exportar.');
let js = await readFile(resolve(dist, 'assets', basename(script[1])), 'utf8');
let css = await readFile(resolve(dist, 'assets', basename(stylesheet[1])), 'utf8');
const urls = [...new Set([...css.matchAll(/url\(([^)]+)\)/g)].map(m => m[1].replace(/["']/g, '')))];
for (const url of urls) {
  if (url.startsWith('data:')) continue;
  const bytes = await readFile(resolve(dist, 'assets', basename(url)));
  const mime = url.endsWith('.woff2') ? 'font/woff2' : 'font/woff';
  css = css.replaceAll(url, `data:${mime};base64,${bytes.toString('base64')}`);
}
// Inclui as imagens importadas pelo JavaScript, mantendo a prévia independente.
const jsAssets = [...new Set([...js.matchAll(/["'](\/(?:assets|species|species-icons|agent-icons)\/[^"']+\.(?:png|webp|jpg|svg))["']/g)].map(m => m[1]))];
for (const url of jsAssets) {
  const bytes = await readFile(resolve(dist, url.slice(1)));
  const mime = url.endsWith('.svg') ? 'image/svg+xml' : url.endsWith('.webp') ? 'image/webp' : url.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
  js = js.replaceAll(url, `data:${mime};base64,${bytes.toString('base64')}`);
}
const favicon = await readFile(resolve(root, 'public/favicon.svg'));
html = html.replace(script[0], () => `<script type="module">${js.replaceAll('</script', '<\\/script')}</script>`);
html = html.replace(stylesheet[0], () => `<style>${css}</style>`);
html = html.replace('href="/favicon.svg"', `href="data:image/svg+xml;base64,${favicon.toString('base64')}"`);
const output = resolve(root, 'preview');
await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'arquivo-gms.html'), html);
console.log('Prévia independente criada: preview/arquivo-gms.html');
