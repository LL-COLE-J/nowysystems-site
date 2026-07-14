(() => {
  const stage = document.querySelector('.render-lock-stage');
  const image = document.querySelector('.render-lock-image');
  if (!(stage instanceof HTMLElement) || !(image instanceof HTMLImageElement)) return;

  const fail = (message) => {
    stage.dataset.error = 'true';
    const status = stage.querySelector('.render-lock-status');
    if (status) status.textContent = message;
  };

  fetch('assets/render-lock.b64?v=1', { cache: 'force-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`Asset request failed: ${response.status}`);
      return response.text();
    })
    .then((encoded) => {
      const clean = encoded.replace(/\s+/g, '');
      if (!clean.startsWith('UklG') || clean.length < 100000) {
        throw new Error('Approved render asset is incomplete.');
      }

      image.addEventListener('load', () => {
        stage.dataset.ready = 'true';
      }, { once: true });

      image.addEventListener('error', () => {
        fail('Approved render could not be displayed.');
      }, { once: true });

      image.src = `data:image/webp;base64,${clean}`;
    })
    .catch((error) => {
      console.error('Render-lock load failed:', error);
      fail('Approved render is unavailable.');
    });
})();
