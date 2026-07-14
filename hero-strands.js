(() => {
  const canvas = document.querySelector('.hero-art');
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const DPR_CAP = 2;
  const GOLD = [220, 176, 101];
  const PALE_GOLD = [246, 220, 168];
  const IVORY = [248, 242, 230];
  const VIOLET = [166, 126, 235];

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

  function cubicPoint(f, t) {
    const m = 1 - t;
    return {
      x: m ** 3 * f.x0 + 3 * m * m * t * f.c1x + 3 * m * t * t * f.c2x + t ** 3 * f.x1,
      y: m ** 3 * f.y0 + 3 * m * m * t * f.c1y + 3 * m * t * t * f.c2y + t ** 3 * f.y1,
    };
  }

  function drawFiber(target, f, opts = {}) {
    const {
      alpha = f.alpha,
      width = f.width,
      blur = 0,
      start = f.start,
      end = f.end,
      dash = null,
    } = opts;

    const steps = 74;
    target.save();
    target.beginPath();
    target.lineCap = 'round';
    target.lineJoin = 'round';
    target.strokeStyle = rgba(f.color, alpha);
    target.lineWidth = width;
    target.shadowColor = rgba(f.color, Math.min(alpha * 1.35, 0.5));
    target.shadowBlur = blur;
    if (dash) target.setLineDash(dash);

    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const t = start + (end - start) * u;
      const p = cubicPoint(f, t);
      const envelope = Math.sin(Math.PI * u);
      const wobble = Math.sin((t * f.waveFreq + f.phase) * Math.PI * 2) * f.waveAmp * envelope;
      const x = p.x;
      const y = p.y + wobble;
      if (i === 0) target.moveTo(x, y);
      else target.lineTo(x, y);
    }

    target.stroke();
    target.restore();
  }

  function drawGlowDot(target, x, y, r, color, alpha, blur = 0) {
    target.save();
    target.shadowColor = rgba(color, alpha);
    target.shadowBlur = blur;
    target.beginPath();
    target.arc(x, y, r, 0, Math.PI * 2);
    target.fillStyle = rgba(color, alpha);
    target.fill();
    target.restore();
  }

  function buildFibers(w, h, random, count) {
    const focusX = w * 1.006;
    const focusY = h * 0.515;
    const fibers = [];

    for (let i = 0; i < count; i++) {
      const normalized = i / Math.max(1, count - 1);
      const band = normalized * 2 - 1;
      const edgeBias = Math.sign(band) * Math.pow(Math.abs(band), 0.72);
      const y0 = focusY + edgeBias * h * (0.72 + random() * 0.22);
      const x0 = w * (0.18 + random() * 0.34);
      const sweep = w * (0.25 + random() * 0.19);
      const side = y0 < focusY ? -1 : 1;
      const paletteRoll = random();
      const color = paletteRoll < 0.12 ? VIOLET : paletteRoll < 0.29 ? IVORY : paletteRoll < 0.47 ? PALE_GOLD : GOLD;

      fibers.push({
        x0,
        y0,
        x1: focusX,
        y1: focusY + (random() - 0.5) * h * 0.012,
        c1x: x0 + w * (0.15 + random() * 0.18),
        c1y: y0 + side * h * (0.01 + random() * 0.16),
        c2x: focusX - sweep,
        c2y: focusY + side * h * (0.035 + random() * 0.26) * Math.min(1, Math.abs(band) + 0.16),
        color,
        alpha: 0.09 + random() * 0.42,
        width: 0.42 + random() * 1.8,
        start: random() < 0.44 ? random() * 0.24 : 0,
        end: random() < 0.24 ? 0.72 + random() * 0.27 : 1,
        waveAmp: 0.15 + random() * 1.85,
        waveFreq: 0.7 + random() * 1.7,
        phase: random(),
      });
    }

    return fibers;
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

    const random = rng(4271987);
    const focusX = w * 1.006;
    const focusY = h * 0.515;
    const fibers = buildFibers(w, h, random, 360);

    // Atmospheric haze behind the fibers.
    const haze = ctx.createRadialGradient(w * 0.78, focusY, 0, w * 0.78, focusY, h * 0.78);
    haze.addColorStop(0, 'rgba(184,137,72,.055)');
    haze.addColorStop(0.38, 'rgba(86,65,45,.028)');
    haze.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, w, h);

    // Broad ghost ribbons create body and depth.
    fibers.filter((_, i) => i % 9 === 0).forEach((f) => {
      drawFiber(ctx, f, {
        alpha: 0.035 + random() * 0.045,
        width: 3.5 + random() * 7.5,
        blur: 16 + random() * 22,
      });
    });

    // Hairline ghost fibers, often broken or fading early.
    fibers.filter((_, i) => i % 3 !== 0).forEach((f) => {
      drawFiber(ctx, f, {
        alpha: f.alpha * (0.24 + random() * 0.35),
        width: 0.25 + random() * 0.58,
        blur: random() < 0.25 ? 3 : 0,
        start: Math.min(0.58, f.start + random() * 0.13),
        end: Math.max(0.45, f.end - random() * 0.15),
      });
    });

    // Main fibers: fewer, thicker, irregular and camera-like.
    fibers.filter((_, i) => i % 3 === 0).forEach((f) => {
      const focusBoost = f.end > 0.92 ? 1 : 0.72;
      drawFiber(ctx, f, {
        alpha: f.alpha * focusBoost,
        width: f.width * (0.9 + random() * 1.55),
        blur: random() < 0.18 ? 5 + random() * 7 : 0,
      });

      // A subtle luminous core on select fibers.
      if (random() < 0.34) {
        drawFiber(ctx, f, {
          alpha: Math.min(0.62, f.alpha * 1.12),
          width: 0.32 + random() * 0.78,
          blur: 1.5 + random() * 3.5,
          start: Math.max(f.start, 0.08 + random() * 0.2),
        });
      }
    });

    // Attached particles and twinkles. Density rises toward clarity.
    fibers.forEach((f, i) => {
      if (i % 2 !== 0 && random() > 0.46) return;
      const count = 1 + Math.floor(random() * 5);
      for (let d = 0; d < count; d++) {
        const proximity = Math.pow(random(), 0.62);
        const t = f.start + (f.end - f.start) * (0.16 + proximity * 0.82);
        const p = cubicPoint(f, t);
        const sizeRoll = random();
        const r = sizeRoll < 0.78 ? 0.35 + random() * 0.85 : 1.2 + random() * 2.2;
        const glow = sizeRoll > 0.78 ? 8 + random() * 15 : random() < 0.16 ? 5 : 0;
        const alpha = 0.28 + random() * 0.66;
        drawGlowDot(ctx, p.x, p.y + (random() - 0.5) * 2.2, r, f.color, alpha, glow);
      }
    });

    // Sparse foreground bokeh gives depth-of-field imperfection.
    for (let i = 0; i < 90; i++) {
      const x = w * (0.38 + random() * 0.61);
      const y = random() * h;
      const color = random() < 0.12 ? VIOLET : random() < 0.34 ? IVORY : GOLD;
      const near = random() < 0.18;
      const r = near ? 2.1 + random() * 4.6 : 0.25 + random() * 1.1;
      drawGlowDot(ctx, x, y, r, color, near ? 0.08 + random() * 0.16 : 0.16 + random() * 0.4, near ? 10 + random() * 16 : 0);
    }

    // Asymmetric bloom; intentionally offset to avoid a synthetic perfect center.
    const bloomX = focusX - w * 0.012;
    const bloomY = focusY + h * 0.008;
    const bloom = ctx.createRadialGradient(bloomX, bloomY, 0, bloomX, bloomY, h * 0.23);
    bloom.addColorStop(0, 'rgba(255,255,255,.98)');
    bloom.addColorStop(0.035, 'rgba(255,239,202,.72)');
    bloom.addColorStop(0.12, 'rgba(225,177,95,.25)');
    bloom.addColorStop(0.38, 'rgba(201,145,70,.07)');
    bloom.addColorStop(1, 'rgba(201,145,70,0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(bloomX - h * 0.25, bloomY - h * 0.25, h * 0.5, h * 0.5);

    // Tiny white-hot core and horizontal light leak.
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const leak = ctx.createLinearGradient(focusX - w * 0.16, focusY, focusX, focusY);
    leak.addColorStop(0, 'rgba(255,224,166,0)');
    leak.addColorStop(0.72, 'rgba(255,229,181,.12)');
    leak.addColorStop(1, 'rgba(255,255,255,.7)');
    ctx.fillStyle = leak;
    ctx.fillRect(focusX - w * 0.18, focusY - 1.2, w * 0.18, 2.4);
    drawGlowDot(ctx, focusX - 2, focusY, 2.2, IVORY, 0.96, 18);
    ctx.restore();
  }

  const resize = new ResizeObserver(draw);
  resize.observe(canvas);
  window.addEventListener('load', draw, { once: true });
})();
