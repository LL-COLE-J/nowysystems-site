(() => {
  function initHero() {
    const canvas = document.querySelector('.hero-art');
    if (!(canvas instanceof HTMLCanvasElement)) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const GOLD = [220, 176, 101];
    const PALE = [244, 224, 184];
    const IVORY = [247, 241, 229];
    const VIOLET = [159, 124, 230];
    const DPR_CAP = 2;

    function rng(seed) {
      let s = seed >>> 0;
      return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
      };
    }

    function rgba(color, alpha) {
      return `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
    }

    function cubicPoint(f, t) {
      const m = 1 - t;
      return {
        x: m ** 3 * f.x0 + 3 * m * m * t * f.c1x + 3 * m * t * t * f.c2x + t ** 3 * f.x1,
        y: m ** 3 * f.y0 + 3 * m * m * t * f.c1y + 3 * m * t * t * f.c2y + t ** 3 * f.y1,
      };
    }

    function drawCurve(f, options = {}) {
      const start = options.start ?? f.start;
      const end = options.end ?? f.end;
      const width = options.width ?? f.width;
      const alpha = options.alpha ?? f.alpha;
      const blur = options.blur ?? 0;
      const steps = 84;

      ctx.save();
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = rgba(f.color, alpha);
      ctx.lineWidth = width;
      ctx.shadowColor = rgba(f.color, Math.min(alpha * 1.1, .24));
      ctx.shadowBlur = blur;

      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const t = start + (end - start) * u;
        const p = cubicPoint(f, t);
        const envelope = Math.sin(Math.PI * u);
        const drift = Math.sin((t * f.waveFreq + f.phase) * Math.PI * 2) * f.waveAmp * envelope;
        const y = p.y + drift;
        if (i === 0) ctx.moveTo(p.x, y);
        else ctx.lineTo(p.x, y);
      }

      ctx.stroke();
      ctx.restore();
    }

    function dot(x, y, r, color, alpha, blur = 0) {
      ctx.save();
      ctx.shadowColor = rgba(color, alpha);
      ctx.shadowBlur = blur;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(color, alpha);
      ctx.fill();
      ctx.restore();
    }

    function createFibers(w, h, random) {
      const focusX = w * 1.005;
      const focusY = h * .515;
      const fibers = [];
      const count = 220;

      for (let i = 0; i < count; i++) {
        const band = (i / (count - 1)) * 2 - 1;
        const sign = band < 0 ? -1 : 1;
        const spread = Math.pow(Math.abs(band), .78);
        const colorRoll = random();
        const color = colorRoll < .10 ? VIOLET : colorRoll < .25 ? IVORY : colorRoll < .43 ? PALE : GOLD;
        const x0 = w * (.24 + random() * .31);
        const y0 = focusY + sign * h * spread * (.58 + random() * .28);
        const endEarly = random() < .34;

        fibers.push({
          x0,
          y0,
          c1x: x0 + w * (.13 + random() * .16),
          c1y: y0 + sign * h * (.015 + random() * .11),
          c2x: focusX - w * (.18 + random() * .26),
          c2y: focusY + sign * h * (.025 + random() * .18) * Math.max(.18, spread),
          x1: focusX,
          y1: focusY + (random() - .5) * h * .012,
          color,
          alpha: .045 + random() * .19,
          width: .22 + random() * .72,
          start: random() < .58 ? random() * .28 : 0,
          end: endEarly ? .58 + random() * .32 : .94 + random() * .06,
          waveAmp: .15 + random() * 1.15,
          waveFreq: .55 + random() * 1.2,
          phase: random(),
        });
      }

      return fibers;
    }

    function draw() {
      try {
        const rect = canvas.getBoundingClientRect();
        const parentRect = canvas.parentElement?.getBoundingClientRect();
        const w = Math.max(1, Math.round(rect.width || parentRect?.width || window.innerWidth));
        const h = Math.max(1, Math.round(rect.height || parentRect?.height || 510));
        const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);

        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        const random = rng(901843);
        const focusX = w * 1.005;
        const focusY = h * .515;
        const fibers = createFibers(w, h, random);

        const haze = ctx.createRadialGradient(w * .82, focusY, 0, w * .82, focusY, h * .76);
        haze.addColorStop(0, 'rgba(196,144,72,.035)');
        haze.addColorStop(.42, 'rgba(93,68,45,.018)');
        haze.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = haze;
        ctx.fillRect(0, 0, w, h);

        fibers.filter((_, i) => i % 18 === 0).forEach((f) => {
          drawCurve(f, {
            alpha: .014 + random() * .018,
            width: 4 + random() * 7,
            blur: 18 + random() * 18,
            start: Math.min(.45, f.start + random() * .12),
            end: Math.max(.5, f.end - random() * .08),
          });
        });

        fibers.forEach((f, i) => {
          if (i % 5 === 0) return;
          drawCurve(f, {
            alpha: f.alpha * (.52 + random() * .34),
            width: .18 + random() * .42,
            blur: random() < .18 ? 2 + random() * 3 : 0,
            start: Math.min(.6, f.start + random() * .16),
            end: Math.max(.42, f.end - random() * .16),
          });
        });

        fibers.filter((_, i) => i % 5 === 0).forEach((f) => {
          drawCurve(f, {
            alpha: f.alpha * (.72 + random() * .42),
            width: .45 + random() * .92,
            blur: random() < .13 ? 3 + random() * 5 : 0,
          });

          if (random() < .22) {
            drawCurve(f, {
              alpha: Math.min(.34, f.alpha * 1.2),
              width: .18 + random() * .32,
              blur: 1 + random() * 2,
              start: Math.max(f.start, .2 + random() * .22),
            });
          }
        });

        fibers.forEach((f, i) => {
          if (i % 3 !== 0 || random() > .68) return;
          const count = 1 + Math.floor(random() * 3);
          for (let j = 0; j < count; j++) {
            const t = f.start + (f.end - f.start) * (.2 + Math.pow(random(), .66) * .74);
            const p = cubicPoint(f, t);
            const bright = random() < .16;
            dot(
              p.x,
              p.y + (random() - .5) * 1.5,
              bright ? .85 + random() * 1.3 : .22 + random() * .58,
              f.color,
              bright ? .52 + random() * .32 : .2 + random() * .3,
              bright ? 7 + random() * 11 : 0,
            );
          }
        });

        for (let i = 0; i < 42; i++) {
          const near = random() < .12;
          const color = random() < .10 ? VIOLET : random() < .36 ? IVORY : GOLD;
          dot(
            w * (.44 + random() * .55),
            random() * h,
            near ? 1.7 + random() * 3.2 : .18 + random() * .55,
            color,
            near ? .05 + random() * .09 : .1 + random() * .22,
            near ? 8 + random() * 12 : 0,
          );
        }

        const bloomX = focusX - w * .01;
        const bloomY = focusY + h * .006;
        const bloom = ctx.createRadialGradient(bloomX, bloomY, 0, bloomX, bloomY, h * .18);
        bloom.addColorStop(0, 'rgba(255,255,255,.92)');
        bloom.addColorStop(.035, 'rgba(255,240,208,.55)');
        bloom.addColorStop(.13, 'rgba(224,173,92,.16)');
        bloom.addColorStop(.42, 'rgba(196,137,63,.035)');
        bloom.addColorStop(1, 'rgba(196,137,63,0)');
        ctx.fillStyle = bloom;
        ctx.fillRect(bloomX - h * .21, bloomY - h * .21, h * .42, h * .42);

        dot(focusX - 2, focusY, 1.55, IVORY, .92, 12);
        canvas.dataset.ready = 'true';
      } catch (error) {
        console.error('Hero render failed:', error);
      }
    }

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };

    draw();
    requestAnimationFrame(draw);
    window.addEventListener('load', schedule, { once: true });
    window.addEventListener('resize', schedule, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(canvas.parentElement || canvas);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHero, { once: true });
  } else {
    initHero();
  }
})();
