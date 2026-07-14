(() => {
  const stage = document.querySelector('.render-lock-stage');
  const image = document.querySelector('.render-lock-image');
  if (!(stage instanceof HTMLElement) || !(image instanceof HTMLImageElement)) return;

  const status = stage.querySelector('.render-lock-status');
  const fail = (message, error) => {
    stage.dataset.error = 'true';
    if (status) status.textContent = message;
    if (error) console.error('Render-lock load failed:', error);
  };

  const assetUrl = 'https://raw.githubusercontent.com/LL-COLE-J/nowysystems-site/main/assets/render-lock.b64';

  fetch(assetUrl, { cache: 'no-store', mode: 'cors' })
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
        stage.dataset.error = 'false';
        if (status) status.textContent = '';
      }, { once: true });

      image.addEventListener('error', () => {
        fail('Approved render could not be displayed.');
      }, { once: true });

      image.src = `data:image/webp;base64,${clean}`;
    })
    .catch((error) => {
      fail('Approved render is unavailable.', error);
    });
})();