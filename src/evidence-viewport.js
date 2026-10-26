export const clampEvidenceZoom = value => Math.max(.02, Math.min(2, Number.isFinite(value) ? value : 1));
export function evidenceViewBounds(positions) {
  const points = [...positions.values()];
  if (!points.length) return { x: 0, y: 0, width: 250, height: 180 };
  const x = Math.min(...points.map(point => point.x)); const y = Math.min(...points.map(point => point.y));
  return { x, y, width: Math.max(...points.map(point => point.x + 250)) - x, height: Math.max(...points.map(point => point.y + 180)) - y };
}
export function fitEvidenceZoom(bounds, width, height) {
  return clampEvidenceZoom(Math.min(1, Math.max(1, width - 60) / bounds.width, Math.max(1, height - 60) / bounds.height));
}

export function createEvidenceViewport({ root, viewport, stage, canvas, getPositions, saved, onView }) {
  let zoom = clampEvidenceZoom(saved?.zoom ?? 1);
  let size = { width: 1040, height: 530 }; let ready = false; let disposed = false;
  let padding = { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 };
  const center = () => ({ x: (viewport.scrollLeft + viewport.clientWidth / 2 - padding.x) / zoom, y: (viewport.scrollTop + viewport.clientHeight / 2 - padding.y) / zoom });
  function remember() { if (ready && !disposed) onView({ zoom, ...center() }); }
  function layout() {
    padding = { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 };
    stage.style.width = `${size.width * zoom + padding.x * 2}px`; stage.style.height = `${size.height * zoom + padding.y * 2}px`;
    canvas.style.left = `${padding.x}px`; canvas.style.top = `${padding.y}px`; canvas.style.transform = `scale(${zoom})`;
    const reset = root.querySelector('[data-evidence-zoom="reset"]');
    reset.textContent = `${Math.round(zoom * 100)}%`; reset.setAttribute('aria-label', `Zoom ${Math.round(zoom * 100)}%. Restaurar para 100%.`);
    root.querySelector('[data-evidence-zoom="out"]').disabled = zoom <= .02;
    root.querySelector('[data-evidence-zoom="in"]').disabled = zoom >= 2;
  }
  function lookAt(point) {
    viewport.scrollLeft = padding.x + point.x * zoom - viewport.clientWidth / 2;
    viewport.scrollTop = padding.y + point.y * zoom - viewport.clientHeight / 2;
    savedView = center();
    remember();
  }
  function setZoom(value) { const point = center(); zoom = clampEvidenceZoom(value); layout(); lookAt(point); }
  function fit() {
    const bounds = evidenceViewBounds(getPositions());
    zoom = fitEvidenceZoom(bounds, viewport.clientWidth, viewport.clientHeight); layout();
    lookAt({ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 });
  }
  function setSize(width, height) {
    const point = ready ? center() : null;
    size = { width, height }; layout();
    if (!ready) { ready = true; if (saved) lookAt(saved); else fit(); }
    else lookAt(point);
  }
  function resize() { if (!ready || disposed) return; const view = savedView; layout(); lookAt(view); }
  let savedView = saved || { x: 0, y: 0 };
  const onScroll = () => { savedView = center(); remember(); };
  viewport.addEventListener('scroll', onScroll, { passive: true });
  const onClick = event => {
    const button = event.target.closest('[data-evidence-zoom],[data-evidence-fit]'); if (!button || button.disabled) return;
    if (button.hasAttribute('data-evidence-fit')) fit();
    else setZoom(button.dataset.evidenceZoom === 'reset' ? 1 : zoom + (button.dataset.evidenceZoom === 'in' ? .1 : -.1));
    savedView = center();
  };
  root.addEventListener('click', onClick);
  const observer = globalThis.ResizeObserver ? new ResizeObserver(resize) : null;
  observer?.observe(viewport); if (!observer) window.addEventListener('resize', resize);
  return {
    get zoom() { return zoom; }, setSize, fit,
    dispose() { if (viewport.isConnected) remember(); disposed = true; observer?.disconnect(); window.removeEventListener('resize', resize); viewport.removeEventListener('scroll', onScroll); root.removeEventListener('click', onClick); },
  };
}
