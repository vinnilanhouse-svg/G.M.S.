// Chuva de códigos restrita à tela PAPÃO; todos os recursos são descartados ao sair.
const GLYPHS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%<>/{}';
const FRAME_MS = 50;

export function startDeniedVisuals(screen) {
  const canvas = screen.querySelector('.denied-code-rain');
  const context = canvas?.getContext('2d');
  if (!context) return () => {};

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0;
  let height = 0;
  let fontSize = 18;
  let columns = [];
  let frame;
  let previousFrame = 0;
  let disposed = false;
  const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

  function seed() {
    context.clearRect(0, 0, width, height);
    for (const column of columns) {
      const length = 9 + Math.floor(Math.random() * 16);
      for (let index = length; index >= 0; index--) {
        context.globalAlpha = (1 - index / (length + 1)) * 0.65;
        context.fillStyle = index === 0 ? '#ef9994' : '#b63849';
        context.fillText(glyph(), column.x, column.y - index * fontSize);
      }
    }
    context.globalAlpha = 1;
  }

  function resize() {
    if (disposed) return;
    const nextWidth = screen.clientWidth;
    const nextHeight = screen.clientHeight;
    if (nextWidth === width && nextHeight === height) return;
    width = nextWidth;
    height = nextHeight;
    const scale = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    fontSize = width < 600 ? 15 : 18;
    context.font = `13px "IBM Plex Mono", monospace`;
    context.textBaseline = 'top';
    columns = Array.from({ length: Math.ceil(width / fontSize) }, (_, index) => ({
      x: index * fontSize,
      y: Math.floor(Math.random() * height / fontSize) * fontSize,
      stepMs: 70 + Math.random() * 110,
      nextStep: 0,
    }));
    seed();
  }

  function animate(now) {
    if (disposed || motion.matches) return;
    if (now - previousFrame >= FRAME_MS) {
      previousFrame = now;
      // Apaga os rastros sem adicionar um fundo opaco ao canvas.
      context.globalCompositeOperation = 'destination-out';
      context.fillStyle = 'rgba(0, 0, 0, 0.09)';
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = 'source-over';
      for (const column of columns) {
        if (now < column.nextStep) continue;
        column.nextStep = now + column.stepMs;
        context.fillStyle = Math.random() < 0.08 ? '#f0aaa0' : '#c94655';
        context.fillText(glyph(), column.x, column.y);
        column.y += fontSize;
        if (column.y > height + fontSize * 3) column.y = -Math.random() * height * 0.45;
      }
    }
    frame = requestAnimationFrame(animate);
  }

  function onMotionChange() {
    cancelAnimationFrame(frame);
    if (disposed) return;
    seed();
    previousFrame = 0;
    if (!motion.matches) frame = requestAnimationFrame(animate);
  }

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(screen);
  motion.addEventListener('change', onMotionChange);
  if (!motion.matches) frame = requestAnimationFrame(animate);

  return () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    motion.removeEventListener('change', onMotionChange);
  };
}
