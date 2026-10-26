import logoUrl from './assets/gms-logo.png';
const loadImage = src => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('Não foi possível carregar o retrato ou emblema.')); image.src = src; });

// A arte é desenhada a partir dos dados do agente e nunca consome o gerador dos dados.
export async function credentialCanvas(item) {
  const canvas = document.createElement('canvas'); canvas.width = 1100; canvas.height = 700;
  const ctx = canvas.getContext('2d'); const logo = await loadImage(logoUrl);
  ctx.fillStyle = '#eeeede'; ctx.fillRect(0, 0, 1100, 700);
  ctx.strokeStyle = '#a1a38f'; ctx.lineWidth = 1;
  for (let i = -700; i < 1100; i += 22) { ctx.beginPath(); ctx.moveTo(i, 700); ctx.lineTo(i + 700, 0); ctx.stroke(); }
  ctx.fillStyle = '#f7f5eafa'; ctx.fillRect(24, 24, 1052, 652);
  ctx.fillStyle = '#273320'; ctx.fillRect(24, 24, 1052, 125);
  ctx.fillStyle = '#f2f1e2'; ctx.font = 'bold 37px Georgia'; ctx.fillText('G.M.S.', 64, 79);
  ctx.font = '15px monospace'; ctx.fillText('GLOBAL MONSTER SECURITY', 65, 112);
  ctx.textAlign = 'right'; ctx.font = 'bold 22px monospace'; ctx.fillText('CREDENCIAL DE AGENTE', 1030, 79);
  ctx.font = '14px monospace'; ctx.fillText('IDENTIFICAÇÃO FUNCIONAL / ARQUIVO CENTRAL', 1030, 111); ctx.textAlign = 'left';
  ctx.strokeStyle = '#7c846b'; ctx.strokeRect(60, 182, 254, 337);
  ctx.fillStyle = '#e2e4d4'; ctx.fillRect(65, 187, 244, 327);
  if (item.photo) {
    const portrait = await loadImage(item.photo); const scale = Math.max(244 / portrait.width, 327 / portrait.height);
    ctx.save(); ctx.beginPath(); ctx.rect(65, 187, 244, 327); ctx.clip(); ctx.drawImage(portrait, 65 + (244 - portrait.width * scale) / 2, 187 + (327 - portrait.height * scale) / 2, portrait.width * scale, portrait.height * scale); ctx.restore();
  } else { ctx.globalAlpha = .63; ctx.drawImage(logo, 76, 239, 222, 222); ctx.globalAlpha = 1; }
  function fitted(text, x, y, maxWidth, size, face = 'Georgia') {
    let fittedSize = size; ctx.font = `${fittedSize}px ${face}`;
    while (ctx.measureText(text).width > maxWidth && fittedSize > 13) ctx.font = `${--fittedSize}px ${face}`;
    // Limites de entrada garantem que a escala mínima mantém todos os campos visíveis.
    ctx.fillText(text, x, y, maxWidth);
  }
  function line(label, value, x, y, maxWidth = 650) {
    ctx.fillStyle = '#515c43'; ctx.font = '13px monospace'; ctx.fillText(label, x, y);
    ctx.fillStyle = '#20271d'; fitted(value || 'NÃO INFORMADO', x, y + 32, maxWidth, 24);
  }
  line('NOME DO AGENTE', item.name, 351, 195); line('CODINOME', item.codename, 351, 277);
  line('ESPÉCIE', item.species, 351, 359, 340); line('MATRÍCULA', item.registry, 741, 359, 280);
  line('CARGO / FUNÇÃO', item.role, 351, 441); line('DEPARTAMENTO', item.department, 351, 523);
  ctx.fillStyle = '#35412a'; fitted(item.registry, 64, 553, 252, 22, 'monospace');
  ctx.globalAlpha = .1; ctx.drawImage(logo, 837, 161, 190, 190); ctx.globalAlpha = 1;
  ctx.strokeStyle = '#969d85'; ctx.beginPath(); ctx.moveTo(60, 590); ctx.lineTo(1038, 590); ctx.stroke();
  ctx.fillStyle = '#4d5941'; ctx.font = '13px monospace'; ctx.fillText(`EMISSÃO ${item.issued.split('-').reverse().join('/')}`, 64, 620);
  ctx.textAlign = 'right'; ctx.fillText('GMS / REGISTRO PESSOAL', 1036, 620); ctx.textAlign = 'left';
  ctx.fillStyle = '#59614e'; ctx.font = '12px monospace'; ctx.fillText('IDENTIFICAÇÃO NARRATIVA · CLASSIFICAÇÕES DE ACESSO CONFORME O ARQUIVO', 64, 651);
  return canvas;
}
export const canvasPng = canvas => new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Não foi possível preparar a imagem.')), 'image/png'));
export async function credentialPdf(blob) {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const document = await PDFDocument.create(); const page = document.addPage([595.28, 841.89]);
  const font = await document.embedFont(StandardFonts.Courier); const image = await document.embedPng(await blob.arrayBuffer());
  page.drawText('G.M.S. / IDENTIFICACAO DO AGENTE', { x: 46, y: 780, size: 11, font, color: rgb(.2, .26, .16) });
  page.drawImage(image, { x: 46, y: 375, width: 503, height: 503 * 700 / 1100 });
  page.drawText('CREDENCIAL PESSOAL / ARQUIVO CENTRAL', { x: 46, y: 345, size: 9, font });
  document.setTitle('Credencial pessoal - G.M.S.'); document.setCreator('Arquivo GMS'); return document.save();
}

export async function readCredentialPortrait(file) {
  if (file.size > 8 * 1024 * 1024) throw new Error('Escolha uma imagem PNG, JPG ou WebP de até 8 MB.');
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const jpeg = header[0] === 255 && header[1] === 216;
  const png = header[0] === 137 && header[1] === 80 && header[2] === 78 && header[3] === 71;
  const webp = String.fromCharCode(...header.slice(0, 4)) === 'RIFF' && String.fromCharCode(...header.slice(8, 12)) === 'WEBP';
  if (!jpeg && !png && !webp) throw new Error('Use um retrato nos formatos PNG, JPG ou WebP.');
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    if (image.naturalWidth * image.naturalHeight > 25000000) throw new Error('Use uma imagem de até 25 megapixels.');
    const canvas = document.createElement('canvas'); canvas.width = 360; canvas.height = 480;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#e2e4d4'; ctx.fillRect(0, 0, 360, 480);
    const scale = Math.max(360 / image.naturalWidth, 480 / image.naturalHeight);
    ctx.drawImage(image, (360 - image.naturalWidth * scale) / 2, 0, image.naturalWidth * scale, image.naturalHeight * scale);
    return canvas.toDataURL('image/jpeg', .88);
  } finally { URL.revokeObjectURL(url); }
}
