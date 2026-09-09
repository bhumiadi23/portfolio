import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const LINES = [
  { text: 'Annuva...', delay: 0.5, size: 'clamp(2.5rem, 10vw, 5rem)', serif: true },
  { text: 'Thank you for being you.', delay: 2.2, size: 'clamp(1.2rem, 4vw, 1.8rem)', serif: false },
  { text: 'Thank you for choosing me.', delay: 4, size: 'clamp(1.2rem, 4vw, 1.8rem)', serif: false },
  { text: 'Thank you for all the little things you do.', delay: 5.8, size: 'clamp(1rem, 3.5vw, 1.4rem)', serif: false },
  { text: "Even the things I don't always say thank you for.", delay: 7.5, size: 'clamp(0.9rem, 3vw, 1.2rem)', serif: false, italic: true },
  { text: 'Happy Birthday ❤️', delay: 9.5, size: 'clamp(1.8rem, 6vw, 3rem)', serif: true, color: '#C2185B' },
  { text: 'I love you.', delay: 11.5, size: 'clamp(2rem, 7vw, 3.5rem)', serif: true, color: '#C2185B' },
  { text: '— Nestle', delay: 13.5, size: 'clamp(1rem, 3.5vw, 1.4rem)', serif: false, italic: true },
];

function FireworksCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let raf;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const particles = [];
    const colors = ['#C2185B', '#F8BBD9', '#C9A84C', '#fff', '#E91E63', '#FF4081', '#880E4F'];

    const burst = (x, y) => {
      for (let i = 0; i < 60; i++) {
        const angle = (Math.PI * 2 * i) / 60;
        const speed = Math.random() * 4 + 1;
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, alpha: 1, color: colors[Math.floor(Math.random() * colors.length)], r: Math.random() * 3 + 1 });
      }
    };

    let lastBurst = 0;
    const loop = (ts) => {
      ctx.clearRect(0, 0, c.width, c.height);
      if (ts - lastBurst > 1200) {
        burst(Math.random() * c.width, Math.random() * c.height * 0.6);
        lastBurst = ts;
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.alpha -= 0.015;
        if (p.alpha <= 0) { particles.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(loop);
    };
    loop(0);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" />;
}

export default function FinalReveal({ onReplay }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [showReplay, setShowReplay] = useState(false);

  useEffect(() => {
    LINES.forEach((line, i) => {
      setTimeout(() => setVisibleLines(v => [...v, i]), line.delay * 1000);
    });
    setTimeout(() => {
      setShowReplay(true);
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.4 }, colors: ['#C2185B', '#F8BBD9', '#C9A84C', '#fff'] });
    }, 15500);
  }, []);

  return (
    <div className="section-full flex flex-col items-center justify-center relative px-6 py-20"
      style={{ background: '#0A0005' }}>
      <FireworksCanvas />

      {/* Floating hearts */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 12 }, (_, i) => (
          <motion.div key={i}
            initial={{ y: '110vh', x: `${Math.random() * 100}vw`, opacity: 0 }}
            animate={{ y: '-10vh', opacity: [0, 0.6, 0] }}
            transition={{ duration: 6 + Math.random() * 4, delay: 14 + Math.random() * 4, repeat: Infinity, repeatDelay: Math.random() * 3 }}
            className="absolute text-2xl" style={{ color: '#C2185B' }}>
            ❤️
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col gap-6">
        {LINES.map((line, i) => (
          <AnimatePresence key={i}>
            {visibleLines.includes(i) && (
              <motion.p
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className={`${line.serif ? 'font-serif' : 'font-ui'} ${line.italic ? 'italic' : ''} leading-tight`}
                style={{ fontSize: line.size, color: line.color || 'rgba(253,251,247,0.9)' }}>
                {line.text}
              </motion.p>
            )}
          </AnimatePresence>
        ))}

        <AnimatePresence>
          {showReplay && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="mt-8 flex flex-col items-center gap-4">
              <p className="text-sm font-ui text-white/40">Want to experience it again?</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={onReplay}
                className="px-8 py-3 rounded-full font-semibold font-ui text-sm border border-[#C2185B]/40 text-[#F8BBD9] hover:bg-[#C2185B]/20 transition-colors">
                Replay Our Story ↻
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
