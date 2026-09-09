import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const TARGET = 10;

function spawnHeart(w, h) {
  return {
    id: Math.random(),
    x: Math.random() * (w - 60) + 30,
    y: h + 40,
    vy: -(Math.random() * 2 + 1.5),
    vx: (Math.random() - 0.5) * 1.2,
    s: Math.random() * 20 + 24,
    phase: Math.random() * Math.PI * 2,
    color: ['#C2185B', '#E91E63', '#F06292', '#880E4F', '#C9A84C'][Math.floor(Math.random() * 5)],
  };
}

export default function CatchHearts() {
  const [active, setActive] = useState(false);
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [bursts, setBursts] = useState([]);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const heartsRef = useRef([]);
  const lastSpawn = useRef(0);

  const start = () => { setActive(true); setScore(0); setWon(false); setHearts([]); heartsRef.current = []; };

  const catchHeart = useCallback((id, x, y) => {
    heartsRef.current = heartsRef.current.filter(h => h.id !== id);
    setHearts([...heartsRef.current]);
    setBursts(b => [...b, { id: Math.random(), x, y }]);
    setTimeout(() => setBursts(b => b.slice(1)), 600);
    setScore(s => {
      const next = s + 1;
      if (next >= TARGET) {
        setWon(true);
        setActive(false);
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.4 }, colors: ['#C2185B', '#F8BBD9', '#C9A84C', '#fff'] });
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!active) return;
    const el = containerRef.current;
    if (!el) return;
    const W = el.offsetWidth, H = el.offsetHeight;

    const loop = (ts) => {
      // Spawn
      if (ts - lastSpawn.current > 800) {
        heartsRef.current = [...heartsRef.current, spawnHeart(W, H)];
        lastSpawn.current = ts;
      }
      // Move
      heartsRef.current = heartsRef.current.map(h => ({
        ...h,
        x: h.x + h.vx + Math.sin(ts * 0.001 + h.phase) * 0.4,
        y: h.y + h.vy,
      })).filter(h => h.y > -80);
      setHearts([...heartsRef.current]);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  return (
    <div className="relative py-20 px-6" style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #F5EFE6 100%)' }}>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.3em] font-ui mb-3" style={{ color: 'rgba(194,24,91,0.6)' }}>
          mini game
        </p>
        <h2 className="font-serif mb-2" style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)', color: '#1A0A0F' }}>
          Catch my love ❤️
        </h2>
        <p className="text-sm font-ui" style={{ color: 'rgba(26,10,15,0.5)' }}>
          Tap {TARGET} hearts to unlock a surprise
        </p>
      </motion.div>

      {/* Score */}
      <div className="text-center mb-4">
        <span className="font-serif text-3xl" style={{ color: '#C2185B' }}>{score}</span>
        <span className="font-ui text-sm ml-1" style={{ color: 'rgba(26,10,15,0.4)' }}>/ {TARGET}</span>
      </div>

      {/* Game area */}
      <div ref={containerRef} className="relative mx-auto rounded-3xl overflow-hidden border border-[#C2185B]/15"
        style={{ height: '320px', maxWidth: '480px', background: 'linear-gradient(135deg, rgba(194,24,91,0.04), rgba(62,0,32,0.03))' }}>

        {!active && !won && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={start}
              className="px-8 py-4 rounded-full text-white font-semibold font-ui shadow-xl"
              style={{ background: 'linear-gradient(135deg, #C2185B, #880E4F)' }}>
              Start Game ❤️
            </motion.button>
          </div>
        )}

        {hearts.map(h => (
          <motion.button key={h.id}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            onClick={() => catchHeart(h.id, h.x, h.y)}
            className="absolute select-none cursor-pointer"
            style={{ left: h.x - h.s / 2, top: h.y - h.s / 2, fontSize: h.s, lineHeight: 1, color: h.color, background: 'none', border: 'none', padding: 0 }}>
            ❤️
          </motion.button>
        ))}

        {/* Burst particles */}
        {bursts.map(b => (
          <motion.div key={b.id} initial={{ scale: 0, opacity: 1 }} animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute pointer-events-none text-2xl"
            style={{ left: b.x - 12, top: b.y - 12 }}>
            💥
          </motion.div>
        ))}
      </div>

      {/* Win state */}
      <AnimatePresence>
        {won && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mt-8 max-w-sm mx-auto text-center p-8 rounded-3xl border border-[#C2185B]/20 shadow-xl"
            style={{ background: 'linear-gradient(135deg, rgba(194,24,91,0.06), rgba(62,0,32,0.04))' }}>
            <div className="text-4xl mb-4 animate-heartbeat">❤️</div>
            <h3 className="font-serif text-2xl mb-2" style={{ color: '#1A0A0F' }}>
              You caught my heart ❤️
            </h3>
            <p className="font-cormorant italic text-lg mb-4" style={{ color: '#C2185B' }}>
              Aur main? Main toh pehle se hi tera hoon.
            </p>
            <button onClick={start} className="text-xs font-ui underline" style={{ color: 'rgba(194,24,91,0.6)' }}>
              Play again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
