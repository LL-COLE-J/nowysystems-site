(() => {
  const canvas = document.querySelector('.hero-art');
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const DPR_CAP = 2;
  const GOLD = [218, 179, 108];
  const IVORY = [245, 239, 226];
  const VIOLET = [159, 124, 230];

  function rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function rgba(c, a) {
    return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  }

  function draw() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const random = rng(982451653);
    const focusX = w * 1.01;
    const focusY = h * 0.505;
    const startX = w * 0.22;

    const halo = ctx.createRadialGradient(focusX, focusY, 0, focusX, focusY, h * 0.55);
    halo.addColorStop(0, 'rgba(255,248,232,.42)');
    halo.addColorStop(.035, 'rgba(229,190,119,.18)');
    halo.addColorStop(.22, 'rgba(196,152,85,.06)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);

    const lineCount = 190;
    for (let i = 0; i < lineCount; i++) {
      const t = i / (lineCount - 1);
      const topHalf = t < 0.5;
      const spread = topHalf ? (0.5 - t) / 0.5 : (t - 0.5) / 0.5;
      const sign = topHalf ? -1 : 1;
      const y0 = focusY + sign * spread * h * (0.62 + random() * 0.22);
      const x0 = startX + random() * w * 0.19;
      const bend = (0.12 + random() * 0.16) * w;
      const c1x = x0 + w * (0.22 + random() * 0.08);
      const c2x = focusX - bend;
      const c1y = y0 + sign * h * (0.015 + random() * 0.10) * spread;
      const c2y = focusY + sign * h * (0.08 + random() * 0.20) * spread;

      const paletteRoll = random();
      const color = paletteRoll < 0.12 ? VIOLET : paletteRoll < 0.36 ? IVORY : GOLD;
      const alpha = 0.12 + random() * 0.52;
      const width = 0.35 + random() * 1.15;

      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, focusX, focusY);
      ctx.strokeStyle = rgba(color, alpha);
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.stroke();

      if (random() < 0.68) {
        const dotCount = 1 + Math.floor(random() * 4);
        for (let d = 0; d < dotCount; d++) {
          const u = 0.18 + random() * 0.76;
          const mt = 1 - u;
          const px = mt * mt * mt * x0 + 3 * mt * mt * u * c1x + 3 * mt * u * u * c2x + u * u * u * focusX;
          const py = mt * mt * mt * y0 + 3 * mt * mt * u * c1y + 3 * mt * u * u * c2y + u * u * u * focusY;
          const r = 0.45 + random() * 1.55;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fillStyle = rgba(color, 0.35 + random() * 0.6);
          ctx.fill();
        }
      }
    }

    for (let i = 0; i < 160; i++) {
      const x = w * (0.34 + random() * 0.65);
      const y = random() * h;
      const r = random() < 0.88 ? 0.35 + random() * 0.65 : 1.1 + random() * 1.6;
      const color = random() < 0.16 ? VIOLET : random() < 0.5 ? IVORY : GOLD;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(color, 0.18 + random() * 0.58);
      ctx.fill();
    }

    const flare = ctx.createRadialGradient(focusX, focusY, 0, focusX, focusY, 62);
    flare.addColorStop(0, 'rgba(255,255,255,.95)');
    flare.addColorStop(.08, 'rgba(255,244,216,.58)');
    flare.addColorStop(.28, 'rgba(218,179,108,.16)');
    flare.addColorStop(1, 'rgba(218,179,108,0)');
    ctx.fillStyle = flare;
    ctx.fillRect(focusX - 70, focusY - 70, 140, 140);
  }

  const resize = new ResizeObserver(draw);
  resize.observe(canvas);
  window.addEventListener('load', draw, { once: true });
})();
