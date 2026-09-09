import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../data/siteConfig';
import confetti from 'canvas-confetti';

export default function ScratchCard() {
  const canvasRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.offsetWidth, H = c.offsetHeight;
    c.width = W; c.height = H;

    // Draw scratch overlay
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#6B1A2A');
    g.addColorStop(0.5, '#C2185B');
    g.addColorStop(1, '#880E4F');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.font = `bold ${Math.min(W * 0.05, 16)}px DM Sans, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Scratch here ✨', W / 2, H / 2);

    let isDown = false;

    const getPos = e => {
      const r = c.getBoundingClientRect();
      const src = e.touches ? e.touches[0] : e;
      return { x: src.clientX - r.left, y: src.clientY - r.top };
    };

    const scratch = ({ x, y }) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 24, 0, Math.PI * 2);
      ctx.fill();
      // Check coverage
      const data = ctx.getImageData(0, 0, W, H).data;
      let cleared = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] === 0) cleared++;
      const p = Math.round((cleared / (data.length / 4)) * 100);
      setPct(p);
      if (p > 45 && !revealed) {
        setRevealed(true);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 }, colors: ['#C2185B', '#F8BBD9', '#C9A84C', '#fff'] });
      }
    };

    const down = e => { isDown = true; scratch(getPos(e)); };
    const move = e => { if (!isDown) return; e.preventDefault(); scratch(getPos(e)); };
    const up = () => { isDown = false; };

    c.addEventListener('mousedown', down);
    c.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    c.addEventListener('touchstart', down, { passive: false });
    c.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);

    return () => {
      c.removeEventListener('mousedown', down);
      c.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      c.removeEventListener('touchstart', down);
      c.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [revealed]);

  return (
    <div className="relative py-20 px-6 flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #F5EFE6 0%, #FDFBF7 100%)' }}>

      <div className="max-w-sm w-full mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.3em] font-ui mb-3" style={{ color: 'rgba(194,24,91,0.6)' }}>
            scratch card
          </p>
          <h2 className="font-serif mb-2" style={{ fontSize: 'clamp(1.8rem, 6vw, 2.8rem)', color: '#1A0A0F' }}>
            There's something underneath...
          </h2>
          <p className="text-sm font-ui" style={{ color: 'rgba(26,10,15,0.5)' }}>
            Scratch to reveal ✨
          </p>
        </motion.div>

        {/* Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#C2185B]/15"
          style={{ height: '160px' }}>
          {/* Hidden message underneath */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6"
            style={{ background: 'linear-gradient(135deg, #FDFBF7, #F5EFE6)' }}>
            <span className="text-3xl animate-heartbeat">❤️</span>
            <p className="font-serif text-center text-base md:text-lg leading-snug" style={{ color: '#1A0A0F' }}>
              "{siteConfig.scratchCardMessage}"
            </p>
          </div>
          {/* Scratch overlay */}
          <canvas ref={canvasRef} className="scratch absolute inset-0 w-full h-full"
            style={{ opacity: revealed ? 0 : 1, transition: 'opacity 0.8s', pointerEvents: revealed ? 'none' : 'auto' }} />
        </div>

        {/* Progress */}
        {!revealed && (
          <div className="mt-3 h-1 bg-[#C2185B]/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #C2185B, #880E4F)' }} />
          </div>
        )}

        <AnimatePresence>
          {revealed && (
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="mt-4 text-center text-sm font-ui" style={{ color: 'rgba(194,24,91,0.7)' }}>
              ✨ Revealed!
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
