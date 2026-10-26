import { defaultEvidencePositions, evidenceConnections, evidenceNodes } from './evidence-board-model.js';
import { evidenceIllustrationMarkup, getEvidenceIllustration, noteIllustrations } from './evidence-illustrations.js';
import { evidenceViewBounds } from './evidence-viewport.js';

const labels = { notes: 'ANOTAÇÃO', documents: 'DOCUMENTO', people: 'PESSOA DE INTERESSE', localities: 'LOCALIDADE' };
export function corkBoardModel(state, records, { missionId = '', positions } = {}) {
  const known = new Map(records.filter(record => !record.unlisted).map(record => [record.id, record]));
  const nodes = evidenceNodes(state, missionId); const fallback = defaultEvidencePositions(nodes); const layout = positions || fallback;
  const mission = known.get(missionId);
  return {
    title: mission ? `${mission.code} · ${mission.title}` : missionId === 'avulsas' ? 'REGISTROS SEM MISSÃO VINCULADA' : 'CADERNO PESSOAL · ANÁLISE DE CAMPO',
    nodes: nodes.map(node => {
      const record = known.get(node.entry.recordId);
      return { ref: node.ref, kind: node.kind, position: { ...(layout.get(node.ref) || fallback.get(node.ref)) }, title: node.kind === 'documents' ? record?.title || 'Documento indisponível' : node.entry.title?.trim() || node.entry.name?.trim() || 'Anotação sem título',
        code: record?.code || labels[node.kind], body: [node.entry.role, node.entry.reference, node.entry.body].filter(Boolean).join('\n'), tags: node.entry.tags || [],
        images: node.kind === 'notes' ? noteIllustrations(node.entry).map(id => ({ id })) : node.kind === 'people' && record?.image ? [{ src: record.image.thumbnail || record.image.src }] : [],
      };
    }),
    links: evidenceConnections(state, missionId).map((link, index) => ({ ...link, number: `L${String(index + 1).padStart(2, '0')}` })),
  };
}

export function wrapBoardText(text, measure, width, maximum = 4) {
  const lines = []; let line = '';
  for (const paragraph of String(text || '').split('\n')) {
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (measure(word) > width) {
        if (line) { lines.push(line); line = ''; }
        for (const char of word) { if (line && measure(line + char) > width) { lines.push(line); line = ''; } line += char; }
      } else if (line && measure(`${line} ${word}`) > width) { lines.push(line); line = word; }
      else line = line ? `${line} ${word}` : word;
    }
    if (line) { lines.push(line); line = ''; }
  }
  if (lines.length > maximum) {
    lines.length = maximum;
    while (lines.at(-1) && measure(lines.at(-1) + '…') > width) lines[maximum - 1] = lines.at(-1).slice(0, -1);
    lines[maximum - 1] += '…';
  }
  return lines;
}
function seeded(value) { let seed = 2166136261; for (const char of value) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619); return () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; }; }
function lines(ctx, text, x, y, width, maximum, lineHeight) {
  const wrapped = wrapBoardText(text, value => ctx.measureText(value).width, width, maximum);
  wrapped.forEach((line, index) => ctx.fillText(line, x, y + lineHeight * index)); return wrapped.length;
}
async function loadPicture(picture) {
  let url; let revoke = false;
  if (picture.id) {
    const item = getEvidenceIllustration(picture.id);
    if (item.src) url = item.src;
    else { const svg = evidenceIllustrationMarkup(picture.id).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" style="color:#3e493c" ').replace(/(<svg[^>]+>)/, '$1<style>.earth-grid{opacity:.3;stroke-width:.8}</style>'); url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })); revoke = true; }
  } else {
    const resolved = new URL(picture.src, location.href);
    if (resolved.origin !== location.origin && resolved.protocol !== 'data:') return null;
    url = picture.src;
  }
  try { const image = new Image(); image.src = url; await image.decode(); return image; }
  catch { return null; }
  finally { if (revoke) URL.revokeObjectURL(url); }
}

export async function renderCorkBoard(model) {
  if (!model.nodes.length) throw new Error('Adicione uma evidência antes de exportar o quadro.');
  await document.fonts.ready;
  const bounds = evidenceViewBounds(new Map(model.nodes.map(node => [node.ref, node.position])));
  const canvas = document.createElement('canvas');
  canvas.width = Math.min(3200, Math.max(1800, Math.ceil(bounds.width * 2 + 650)));
  canvas.height = Math.min(2400, Math.max(1200, Math.ceil(bounds.height * 2 + 300)));
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Este navegador não disponibilizou a exportação em imagem.');
  const { width: w, height: h } = canvas; const random = seeded('GMS-CORTICA-1');
  const wood = ctx.createLinearGradient(0, 0, w, h); wood.addColorStop(0, '#795032'); wood.addColorStop(.5, '#3f281b'); wood.addColorStop(1, '#926340');
  ctx.fillStyle = wood; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#b78b54'; ctx.fillRect(38, 38, w - 76, h - 76);
  ctx.save(); ctx.beginPath(); ctx.rect(38, 38, w - 76, h - 76); ctx.clip();
  for (let index = 0; index < w * h / 160; index++) {
    ctx.fillStyle = random() > .5 ? `rgba(67,40,19,${.08 + random() * .19})` : `rgba(246,216,165,${.08 + random() * .24})`;
    const x = random() * w, y = random() * h; ctx.fillRect(x, y, 1 + random() * 6, 1 + random() * 3);
  }
  const shade = ctx.createRadialGradient(w / 2, h / 2, h * .15, w / 2, h / 2, w * .7); shade.addColorStop(0, '#00000000'); shade.addColorStop(1, '#34221165'); ctx.fillStyle = shade; ctx.fillRect(38, 38, w - 76, h - 76); ctx.restore();
  for (let index = 0; index < 9; index++) { ctx.strokeStyle = index % 2 ? '#bb8b5340' : '#21130c55'; ctx.lineWidth = 1; ctx.strokeRect(4 + index * 3, 4 + index * 3, w - 8 - index * 6, h - 8 - index * 6); }
  ctx.shadowColor = '#27190d77'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5; ctx.fillStyle = '#263028'; ctx.fillRect(76, 65, w - 152, 110); ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#e2dec8'; ctx.font = 'bold 24px "IBM Plex Mono", monospace'; ctx.fillText('G.M.S. / QUADRO DE EVIDÊNCIAS', 102, 106);
  ctx.font = '17px "DM Sans", sans-serif'; lines(ctx, model.title, 102, 142, w - 215, 1, 20);
  const legendWidth = Math.min(520, w * .24); const availableWidth = w - legendWidth - 210;
  const scale = Math.min(2.2, availableWidth / bounds.width, (h - 330) / bounds.height);
  const origin = { x: 80 + (availableWidth - bounds.width * scale) / 2 - bounds.x * scale, y: 220 + (h - 330 - bounds.height * scale) / 2 - bounds.y * scale };
  const pins = new Map();
  let missingImages = 0;
  const pictures = new Map(await Promise.all(model.nodes.map(async node => [node.ref, await Promise.all(node.images.map(async picture => { const image = await loadPicture(picture); if (!image) missingImages++; return image; }))])));
  for (const node of model.nodes) {
    const rng = seeded(node.ref); const angle = (rng() - .5) * .055;
    const x = origin.x + (node.position.x + 125) * scale, y = origin.y + (node.position.y + 90) * scale;
    pins.set(node.ref, { x: x + Math.sin(angle) * 78 * scale, y: y - Math.cos(angle) * 78 * scale, angle, cx: x, cy: y });
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale, scale);
    ctx.shadowColor = '#35220c66'; ctx.shadowBlur = 7; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 5;
    ctx.fillStyle = node.kind === 'notes' ? '#eee1aa' : node.kind === 'documents' ? '#f0ead9' : '#e4dfcc'; ctx.fillRect(-125, -90, 250, 180); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#7f705333'; ctx.lineWidth = .5;
    for (let line = 0; line < 11; line++) { ctx.beginPath(); ctx.moveTo(-115, -52 + line * 12); ctx.lineTo(115, -52 + line * 12); ctx.stroke(); }
    ctx.fillStyle = '#5c594d'; ctx.font = '8px "IBM Plex Mono", monospace'; lines(ctx, node.code, -110, -67, 215, 1, 10);
    ctx.fillStyle = '#282a25'; ctx.font = 'bold 14px Georgia, serif'; const titleLines = lines(ctx, node.title, -110, -43, 218, 2, 16);
    let cursor = -43 + titleLines * 16 + 5;
    const images = pictures.get(node.ref);
    if (images.length) {
      images.forEach((image, index) => { if (image) { ctx.fillStyle = '#f9f6e9'; ctx.fillRect(-110 + index * 47, cursor - 2, 43, 37); const ratio = Math.min(39 / image.naturalWidth, 33 / image.naturalHeight); ctx.drawImage(image, -108 + index * 47 + (39 - image.naturalWidth * ratio) / 2, cursor + (33 - image.naturalHeight * ratio) / 2, image.naturalWidth * ratio, image.naturalHeight * ratio); } });
      cursor += 46;
    }
    ctx.fillStyle = '#353930'; ctx.font = '10.5px "DM Sans", sans-serif'; lines(ctx, node.body || 'Sem observações adicionais.', -110, cursor, 216, Math.max(1, Math.min(4, Math.floor((57 - cursor) / 13))), 13);
    ctx.font = '7px "IBM Plex Mono", monospace'; ctx.fillStyle = '#6b6252'; lines(ctx, node.tags.join(' / '), -110, 68, 214, 1, 8);
    ctx.fillStyle = '#5d594c'; ctx.fillText(labels[node.kind], -110, 80); ctx.restore();
  }
  // Fios passam sobre o papel e terminam sob as cabeças dos alfinetes.
  for (const link of model.links) {
    const a = pins.get(link.from), b = pins.get(link.to); if (!a || !b) continue;
    const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2 + 24;
    ctx.save(); ctx.shadowColor = '#35201977'; ctx.shadowBlur = 3; ctx.shadowOffsetY = 2; ctx.strokeStyle = '#96312d'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(midX, midY, b.x, b.y); ctx.stroke(); ctx.shadowColor = 'transparent'; ctx.strokeStyle = '#d47b5a88'; ctx.lineWidth = .7; ctx.stroke();
    ctx.fillStyle = '#eee1bb'; ctx.fillRect(midX - 22, (a.y + b.y) / 2 + 4, 44, 21); ctx.fillStyle = '#6b2e27'; ctx.font = '11px "IBM Plex Mono", monospace'; ctx.fillText(link.number, midX - 17, (a.y + b.y) / 2 + 19); ctx.restore();
  }
  function pin(x, y, color = '#962f30', radius = 8) {
    ctx.save(); ctx.shadowColor = '#1f190a88'; ctx.shadowBlur = 5; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 3;
    const shine = ctx.createRadialGradient(x - radius / 3, y - radius / 3, 1, x, y, radius); shine.addColorStop(0, '#f5d7b5'); shine.addColorStop(.3, color); shine.addColorStop(1, '#432d27'); ctx.fillStyle = shine; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  for (const point of pins.values()) pin(point.x, point.y, '#962f30', Math.max(5, 5 * scale));
  const legendX = w - legendWidth - 72, legendY = 220;
  ctx.save(); ctx.shadowColor = '#35220c66'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6; ctx.fillStyle = '#ede4ca'; ctx.fillRect(legendX, legendY, legendWidth, h - 320); ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#363b32'; ctx.font = 'bold 16px "IBM Plex Mono", monospace'; ctx.fillText('ÍNDICE DE LIGAÇÕES', legendX + 25, legendY + 43);
  ctx.font = '13px "DM Sans", sans-serif'; let cursor = legendY + 82;
  if (!model.links.length) ctx.fillText('Nenhuma ligação registrada.', legendX + 25, cursor);
  for (let index = 0; index < model.links.length; index++) {
    if (cursor + 100 > h - 130) { ctx.fillText(`+ ${model.links.length - index} ligações no arquivo`, legendX + 25, cursor); break; }
    const link = model.links[index]; ctx.fillStyle = '#8b302a'; ctx.font = 'bold 12px "IBM Plex Mono", monospace'; ctx.fillText(`${link.number} / ${link.status === 'hipotese' ? 'HIPÓTESE' : 'CONFIRMADA PELO AGENTE'}`, legendX + 25, cursor); cursor += 22;
    ctx.fillStyle = '#363b32'; ctx.font = '15px "DM Sans", sans-serif'; const count = lines(ctx, link.label, legendX + 25, cursor, legendWidth - 50, 3, 21); cursor += count * 21 + 23;
  }
  ctx.restore(); pin(legendX + legendWidth / 2, legendY + 13, '#8a6a2b', 9);
  ctx.fillStyle = '#ead5b3'; ctx.font = '12px "IBM Plex Mono", monospace'; ctx.fillText(`${model.nodes.length} EVIDÊNCIAS · ${model.links.length} LIGAÇÕES / CÓPIA DO QUADRO PESSOAL`, 80, h - 65);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png')); if (!blob) throw new Error('Não foi possível gerar a imagem. Tente novamente.');
  return { canvas, blob, missingImages };
}

export async function corkBoardPdf(blob, title) {
  const { PDFDocument } = await import('pdf-lib');
  const pdf = await PDFDocument.create(); pdf.setTitle(`Arquivo GMS — ${title}`); pdf.setAuthor('G.M.S. · Arquivo Central');
  const image = await pdf.embedPng(await blob.arrayBuffer());
  const width = 1190.55; const height = width * image.height / image.width;
  const page = pdf.addPage([width, height]); page.drawImage(image, { x: 0, y: 0, width, height });
  return new Blob([await pdf.save()], { type: 'application/pdf' });
}
