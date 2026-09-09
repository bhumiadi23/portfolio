import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../data/siteConfig';
import confetti from 'canvas-confetti';

// Fixed positions (% based) so they don't shift on resize
const POSITIONS = [
  { top: '8%', left: '12%' },
  { top: '15%', right: '8%' },
  { top: '32%', left: '5%' },
  { top: '28%', right: '15%' },
  { top: '50%', left: '18%' },
  { top: '55%', right: '6%' },
  { top: '68%', left: '8%' },
  { top: '72%', right: '20%' },
  { top: '85%', left: '25%' },
  { top: '88%', right: '10%' },
];

export default function HeartHunt({ onAllFound }) {
  const [found, setFound] = useState(new Set());
  const [popup, setPopup] = useState(null);
  const messages = siteConfig.hiddenHeartMessages;
  const total = messages.length;

  const findHeart = (i) => {
    if (found.has(i)) return;
    const next = new Set(found).add(i);
    setFound(next);
    setPopup({ index: i, msg: messages[i] });
    confetti({ particleCount: 25, spread: 40, origin: { y: 0.5 }, colors: ['#C2185B', '#F8BBD9', '#C9A84C'] });
    if (next.size === total) {
      setTimeout(() => { confetti({ particleCount: 150, spread: 100, origin: { y: 0.4 } }); onAllFound?.(); }, 800);
    }
    setTimeout(() => setPopup(null), 2800);
  };

  return (
    <div className="relative py-20 px-6" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #FDFBF7 0%, #F5EFE6 100%)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-center mb-8 relative z-10">
        <p className="text-xs uppercase tracking-[0.3em] font-ui mb-3" style={{ color: 'rgba(194,24,91,0.6)' }}>
          heart hunt
        </p>
        <h2 className="font-serif mb-2" style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)', color: '#1A0A0F' }}>
          Find all 10 hearts
        </h2>
        <p className="text-sm font-ui" style={{ color: 'rgba(26,10,15,0.5)' }}>
          They're hiding somewhere on this page...
        </p>
      </motion.div>

      {/* Floating counter */}
      <div className="fixed bottom-6 left-6 z-40 px-4 py-2 rounded-full shadow-lg border border-[#C2185B]/20 font-ui text-sm font-semibold"
        style={{ background: 'rgba(253,251,247,0.9)', backdropFilter: 'blur(12px)', color: '#C2185B' }}>
        ❤️ {found.size} / {total}
      </div>

      {/* Hidden hearts */}
      {POSITIONS.map((pos, i) => (
        <motion.button key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={found.has(i) ? { opacity: 0.3, scale: 0.7 } : { opacity: 1, scale: 1 }}
          whileHover={!found.has(i) ? { scale: 1.3 } : {}}
          whileTap={!found.has(i) ? { scale: 0.9 } : {}}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.1 }}
          onClick={() => findHeart(i)}
          className="absolute cursor-pointer select-none"
          style={{ ...pos, fontSize: '1.5rem', lineHeight: 1 }}
          aria-label={`Hidden heart ${i + 1}`}>
          {found.has(i) ? '🤍' : '❤️'}
        </motion.button>
      ))}

      {/* Popup message */}
      <AnimatePresence>
        {popup && (
          <motion.div key={popup.index}
            initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-xs w-full mx-4 p-6 rounded-3xl text-center shadow-2xl border border-[#C2185B]/25"
            style={{ background: 'rgba(253,251,247,0.97)', backdropFilter: 'blur(20px)' }}>
            <div className="text-3xl mb-3 animate-heartbeat">❤️</div>
            <p className="text-xs font-ui uppercase tracking-wider mb-2" style={{ color: 'rgba(194,24,91,0.6)' }}>
              Heart #{popup.index + 1} found!
            </p>
            <p className="font-serif text-lg" style={{ color: '#1A0A0F' }}>"{popup.msg}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All found celebration */}
      <AnimatePresence>
        {found.size === total && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 mt-16 max-w-md mx-auto text-center p-8 rounded-3xl border border-[#C2185B]/25 shadow-xl"
            style={{ background: 'linear-gradient(135deg, rgba(194,24,91,0.06), rgba(62,0,32,0.04))' }}>
            <div className="text-4xl mb-4 animate-heartbeat">❤️</div>
            <h3 className="font-serif text-2xl mb-2" style={{ color: '#1A0A0F' }}>
              Tu ne saare hearts dhundh liye!
            </h3>
            <p className="font-cormorant italic text-lg" style={{ color: '#C2185B' }}>
              You found all my love. ❤️
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
