import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function useWindowSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const h = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', h, { passive: true });
    return () => window.removeEventListener('resize', h);
  }, []);
  return size;
}

export default function CupidScene({ onComplete }) {
  const canvasRef = useRef(null);
  const { w, h } = useWindowSize();
  const [phase, setPhase] = useState('idle'); // idle | dragging | flying | exploding | wish
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const arrowRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const dragRef = useRef(null);
  const [drag, setDrag] = useState(null);

  const isMobile = w < 640;
  const bowX = isMobile ? w / 2 : w * 0.15;
  const bowY = h - 120;
  const heartX = w / 2;
  const heartY = Math.min(h * 0.25, 180);

  const drawHeart = useCallback((ctx, x, y, s, color, alpha = 1) => {
    ctx.save();
    ctx.globalAlpha = alpha;
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
  }, []);

  const spawnExplosion = useCallback((cx, cy) => {
    const colors = ['#C2185B', '#F8BBD9', '#880E4F', '#C9A84C', '#fff', '#E91E63', '#FF4081', '#FCE4EC'];
    particlesRef.current = Array.from({ length: 180 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 3;
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        s: Math.random() * 16 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        isHeart: Math.random() > 0.4,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.25,
      };
    });
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    c.width = w; c.height = h;

    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      const now = Date.now();

      if (phase === 'idle' || phase === 'dragging') {
        // Pulsing glowing heart target
        const pulse = 1 + Math.sin(now * 0.003) * 0.07;
        ctx.save();
        ctx.shadowColor = '#C2185B';
        ctx.shadowBlur = 35 + Math.sin(now * 0.003) * 12;
        drawHeart(ctx, heartX - 35 * pulse, heartY - 35 * pulse, 70 * pulse, '#C2185B', 0.92);
        ctx.restore();

        // Bow arc
        ctx.save();
        ctx.strokeStyle = '#6B1A2A';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(bowX, bowY, 55, -Math.PI * 0.72, Math.PI * 0.72);
        ctx.stroke();

        // Bowstring
        const d = dragRef.current;
        const pullX = d ? d.x : bowX;
        const pullY = d ? d.y : bowY;
        ctx.beginPath();
        ctx.moveTo(bowX, bowY - 55);
        ctx.lineTo(pullX, pullY);
        ctx.lineTo(bowX, bowY + 55);
        ctx.strokeStyle = d ? '#C2185B' : '#880E4F';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Arrow when dragging
        if (d) {
          const dx = heartX - d.x, dy = heartY - d.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const nx = dx / len, ny = dy / len;
          const ex = d.x + nx * 70, ey = d.y + ny * 70;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(ex, ey);
          ctx.strokeStyle = '#C9A84C';
          ctx.lineWidth = 3.5;
          ctx.stroke();
          drawHeart(ctx, ex - 7, ey - 7, 14, '#C2185B', 1);
        }
        ctx.restore();
      }

      // Flying arrow
      if (phase === 'flying') {
        const a = arrowRef.current;
        a.x += a.vx; a.y += a.vy;
        const angle = Math.atan2(a.vy, a.vx);
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(angle);
        ctx.strokeStyle = '#C9A84C';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-28, 0);
        ctx.lineTo(12, 0);
        ctx.stroke();
        ctx.restore();
        drawHeart(ctx, a.x - 7, a.y - 7, 14, '#C2185B', 1);

        const dx = heartX - a.x, dy = heartY - a.y;
        if (Math.sqrt(dx * dx + dy * dy) < 35) {
          spawnExplosion(heartX, heartY);
          setPhase('exploding');
        }
      }

      // Explosion
      if (phase === 'exploding') {
        particlesRef.current.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.vy += 0.18;
          p.alpha -= 0.016; p.rot += p.rotV;
          if (p.alpha <= 0) return;
          if (p.isHeart) {
            drawHeart(ctx, p.x - p.s / 2, p.y - p.s / 2, p.s, p.color, p.alpha);
          } else {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
            ctx.restore();
          }
        });
        particlesRef.current = particlesRef.current.filter(p => p.alpha > 0);
        if (particlesRef.current.length === 0) setPhase('wish');
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(rafRef.current);
  }, [w, h, phase, drawHeart, spawnExplosion, bowX, bowY, heartX, heartY]);

  const getPos = e => {
    const c = canvasRef.current;
    const rect = c.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const onDown = e => {
    if (phase !== 'idle') return;
    const p = getPos(e);
    dragRef.current = p;
    setDrag(p);
    setPhase('dragging');
  };
  const onMove = e => {
    if (phase !== 'dragging') return;
    e.preventDefault();
    const p = getPos(e);
    dragRef.current = p;
    setDrag(p);
  };
  const onUp = () => {
    if (phase !== 'dragging') return;
    const d = dragRef.current;
    if (!d) return;
    const dx = heartX - d.x, dy = heartY - d.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = Math.min(len * 0.14, 20);
    arrowRef.current = { x: d.x, y: d.y, vx: (dx / len) * speed, vy: (dy / len) * speed };
    dragRef.current = null;
    setDrag(null);
    setPhase('flying');
  };

  return (
    <div className="section-full relative select-none overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FDFBF7 0%, #F5EFE6 60%, #FDFBF7 100%)' }}>

      {/* Instructions */}
      <AnimatePresence>
        {phase === 'idle' && (
          <motion.div key="inst"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-8 inset-x-0 flex flex-col items-center gap-2 z-10 pointer-events-none">
            <p className="text-[11px] uppercase tracking-[0.3em] font-ui" style={{ color: 'rgba(194,24,91,0.5)' }}>
              a little something for you
            </p>
            <p className="text-sm font-ui font-semibold" style={{ color: '#6B1A2A' }}>
              🏹 Pull the bowstring &amp; release
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <canvas ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none"
        style={{ cursor: phase === 'idle' || phase === 'dragging' ? 'crosshair' : 'default' }}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp} />

      {/* Skip */}
      {(phase === 'idle' || phase === 'dragging') && (
        <button onClick={() => { spawnExplosion(heartX, heartY); setPhase('exploding'); }}
          className="absolute bottom-6 right-6 z-10 text-xs font-ui px-4 py-2 rounded-full border"
          style={{ color: 'rgba(194,24,91,0.5)', borderColor: 'rgba(194,24,91,0.2)' }}>
          Skip →
        </button>
      )}

      {/* HAPPY BIRTHDAY wish screen — auto advances to HeartTree */}
      <AnimatePresence>
        {phase === 'wish' && (
          <motion.div key="wish"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 px-6 text-center"
            style={{ background: 'linear-gradient(135deg, #3E0020 0%, #880E4F 40%, #C2185B 70%, #880E4F 100%)' }}>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-white/70 text-xs uppercase tracking-[0.35em] font-ui">
              make a wish...
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, scale: 0.7, filter: 'blur(20px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ delay: 0.7, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-white leading-tight"
              style={{ fontSize: 'clamp(2.8rem, 12vw, 6rem)', textShadow: '0 0 60px rgba(255,255,255,0.3)' }}>
              HAPPY<br />BIRTHDAY
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}
              className="font-cormorant italic text-white/80"
              style={{ fontSize: 'clamp(1.3rem, 5vw, 2rem)' }}>
              Annuva ❤️
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
              className="text-white/50 font-cormorant italic text-lg">
              to someone worth celebrating
            </motion.p>

            {/* Floating hearts on this screen */}
            {Array.from({ length: 10 }, (_, i) => (
              <motion.span key={i}
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{ opacity: [0, 0.8, 0], y: -120, x: (Math.random() - 0.5) * 80 }}
                transition={{ delay: 1 + i * 0.2, duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                className="absolute text-2xl pointer-events-none select-none"
                style={{ left: `${15 + i * 8}%`, bottom: '20%' }}>
                ❤️
              </motion.span>
            ))}

            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.8 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="mt-4 px-10 py-4 rounded-full text-white font-semibold font-ui text-sm shadow-2xl border border-white/25"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>
              See what's next ✨
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
