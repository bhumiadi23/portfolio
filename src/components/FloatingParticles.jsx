import { useEffect, useRef } from 'react';

export default function FloatingParticles({ color = 'rgba(194,24,91,', count = 18 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let raf;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const hearts = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * 200,
      s: Math.random() * 8 + 4,
      vy: Math.random() * 0.5 + 0.2,
      vx: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.25 + 0.05,
      phase: Math.random() * Math.PI * 2,
    }));

    const drawHeart = (x, y, s, o) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = o;
      ctx.fillStyle = `${color}${o})`;
      ctx.beginPath();
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
      ctx.clearRect(0, 0, c.width, c.height);
      const t = Date.now() * 0.001;
      hearts.forEach(h => {
        h.y -= h.vy;
        h.x += h.vx + Math.sin(t + h.phase) * 0.15;
        if (h.y < -20) { h.y = c.height + 20; h.x = Math.random() * c.width; }
        drawHeart(h.x, h.y, h.s, h.o);
      });
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [color, count]);

  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" />;
}
