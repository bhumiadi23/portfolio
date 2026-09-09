import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeartTree() {
  const canvasRef = useRef(null);
  const [textPhase, setTextPhase] = useState(0);
  // 0=hidden, 1=subtitle, 2=title, 3=tagline

  useEffect(() => {
    const t1 = setTimeout(() => setTextPhase(1), 800);
    const t2 = setTimeout(() => setTextPhase(2), 2200);
    const t3 = setTimeout(() => setTextPhase(3), 3800);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let raf;

    const resize = () => {
      c.width = c.offsetWidth;
      c.height = c.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Seeded random for stable tree shape
    let seed = 137;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      return (seed >>> 0) / 0xffffffff;
    };

    // Pre-generate all branches
    const branches = [];
    const heartSpots = [];

    const genBranches = (x, y, angle, len, depth, parentDepth) => {
      if (depth === 0 || len < 3) return;
      const ex = x + Math.cos(angle) * len;
      const ey = y + Math.sin(angle) * len;
      branches.push({ x1: x, y1: y, x2: ex, y2: ey, depth, order: branches.length });

      // Heart spots at branch tips (depth 1-4)
      if (depth <= 4) {
        const count = depth <= 2 ? 3 : 1;
        for (let i = 0; i < count; i++) {
          heartSpots.push({
            x: ex + (rand() - 0.5) * 12,
            y: ey + (rand() - 0.5) * 12,
            s: 5 + rand() * 9,
            delay: rand(),
            alpha: 0,
            color: `hsl(${320 + rand() * 40}, ${65 + rand() * 25}%, ${48 + rand() * 22}%)`,
          });
        }
      }

      const spread = 0.38 + rand() * 0.22;
      genBranches(ex, ey, angle - spread, len * 0.67, depth - 1, depth);
      genBranches(ex, ey, angle + spread, len * 0.67, depth - 1, depth);
      if (depth > 4) genBranches(ex, ey, angle + (rand() - 0.5) * 0.15, len * 0.74, depth - 1, depth);
    };

    const W = () => c.width, H = () => c.height;
    const baseX = () => W() / 2;
    const baseY = () => H() - 10;
    const trunkLen = () => Math.min(H() * 0.38, 200);

    genBranches(baseX(), baseY(), -Math.PI / 2, trunkLen(), 9, 9);

    // Floating petals
    const petals = Array.from({ length: 25 }, () => ({
      x: rand() * 800,
      y: rand() * 600,
      vx: (rand() - 0.5) * 0.6,
      vy: rand() * 0.5 + 0.15,
      s: rand() * 6 + 3,
      alpha: rand() * 0.35 + 0.08,
      phase: rand() * Math.PI * 2,
    }));

    const totalBranches = branches.length;
    let treeProgress = 0;   // 0→1: branches drawing
    let heartProgress = 0;  // 0→1: hearts blooming
    let petalActive = false;

    const drawHeart = (x, y, s, alpha, color) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.translate(x, y);
      const t = s * 0.35;
      ctx.moveTo(0, t);
      ctx.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, t);
      ctx.bezierCurveTo(-s / 2, (s + t) / 2, 0, s, 0, s);
      ctx.bezierCurveTo(0, s, s / 2, (s + t) / 2, s / 2, t);
      ctx.bezierCurveTo(s / 2, 0, 0, 0, 0, t);
      ctx.fill();
      ctx.restore();
    };

    const loop = () => {
      const cw = c.width, ch = c.height;
      ctx.clearRect(0, 0, cw, ch);

      // Ground line
      const grd = ctx.createLinearGradient(0, ch - 20, 0, ch);
      grd.addColorStop(0, 'rgba(107,26,42,0.25)');
      grd.addColorStop(1, 'rgba(107,26,42,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, ch - 20, cw, 20);

      // Grow branches
      treeProgress = Math.min(treeProgress + 0.006, 1);
      const visible = Math.floor(treeProgress * totalBranches);

      branches.slice(0, visible).forEach(b => {
        ctx.save();
        const thickness = Math.max(0.8, b.depth * 1.4);
        ctx.strokeStyle = `hsl(${8 + (9 - b.depth) * 6}, 38%, ${18 + b.depth * 5}%)`;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
        ctx.stroke();
        ctx.restore();
      });

      // Bloom hearts after 55% branches drawn
      if (treeProgress > 0.55) {
        heartProgress = Math.min(heartProgress + 0.005, 1);
        petalActive = true;
        const t = Date.now() * 0.001;

        heartSpots.forEach((h, i) => {
          if (heartProgress > h.delay * 0.9) {
            h.alpha = Math.min(h.alpha + 0.025, 0.88 + Math.sin(t + i * 0.7) * 0.08);
          }
          if (h.alpha > 0) {
            const wobble = Math.sin(t * 0.9 + i * 0.6) * 1.8;
            drawHeart(h.x - h.s / 2 + wobble, h.y - h.s / 2, h.s, h.alpha, h.color);
          }
        });
      }

      // Floating petals
      if (petalActive) {
        const t = Date.now() * 0.001;
        petals.forEach(p => {
          p.y -= p.vy;
          p.x += p.vx + Math.sin(t + p.phase) * 0.35;
          if (p.y < -20) { p.y = ch + 10; p.x = rand() * cw; }
          if (p.x < -10) p.x = cw + 10;
          if (p.x > cw + 10) p.x = -10;
          drawHeart(p.x, p.y, p.s, p.alpha, '#C2185B');
        });
      }

      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="section-full relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #F5EFE6 100%)' }}>

      {/* Full-screen canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ display: 'block' }} />

      {/* Overlay text — bottom-left on desktop, bottom-center on mobile */}
      <div className="absolute inset-0 flex flex-col justify-end pb-16 px-8 md:px-16 pointer-events-none z-10">
        <div className="max-w-md">
          <AnimatePresence>
            {textPhase >= 1 && (
              <motion.p key="sub"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-xs uppercase tracking-[0.3em] font-ui mb-3"
                style={{ color: 'rgba(194,24,91,0.6)' }}>
                and... make it count
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {textPhase >= 2 && (
              <motion.h2 key="title"
                initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif leading-tight mb-3"
                style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', color: '#1A0A0F' }}>
                Happy<br />Birthday
              </motion.h2>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {textPhase >= 3 && (
              <motion.p key="tag"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="font-cormorant italic"
                style={{ fontSize: 'clamp(1.1rem, 4vw, 1.6rem)', color: '#C2185B' }}>
                here's to a year that blooms ❤️
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
