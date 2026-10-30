// Alternate portraits remain part of the currently authorized record only.
export function bindAlternatePortraits(records) {
  document.querySelectorAll('[data-alternate-portrait]').forEach(figure => {
    const record = records.find(item => item.id === figure.dataset.alternatePortrait);
    if (!record?.image || !record.alternateImage) return;
    const photo = figure.querySelector('[data-view-image]');
    const image = photo.querySelector('img');
    const toggle = figure.querySelector('[data-toggle-portrait]');
    const preload = new Image(); preload.src = record.alternateImage.src;
    let alternate = false;
    function show(value) {
      alternate = value;
      const current = value ? record.alternateImage : record.image;
      image.src = current.src; image.alt = current.alt;
      photo.dataset.portraitVariant = value ? 'alternate' : 'normal';
      toggle.setAttribute('aria-pressed', String(value));
      toggle.textContent = value ? 'Ver foto normal' : 'Ver versão carbonizada';
    }
    photo.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse' && matchMedia('(hover: hover) and (pointer: fine)').matches) show(true); });
    photo.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse' && matchMedia('(hover: hover) and (pointer: fine)').matches) show(false); });
    toggle.addEventListener('click', () => show(!alternate));
  });
}
