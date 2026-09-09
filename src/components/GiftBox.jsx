import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function GiftBox({ message, subtext }) {
  const [phase, setPhase] = useState('idle'); // idle | shaking | open

  const handleTap = () => {
    if (phase === 'open') return;
    if (phase === 'idle') {
      setPhase('shaking');
      setTimeout(() => setPhase('open'), 1200);
      setTimeout(() => {
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 }, colors: ['#C2185B', '#F8BBD9', '#C9A84C', '#fff', '#880E4F'] });
      }, 1200);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div onClick={handleTap} className="cursor-pointer select-none"
        animate={phase === 'shaking' ? { rotate: [0, -8, 8, -6, 6, -4, 4, 0], scale: [1, 1.05, 1.05, 1.05, 1.05, 1.05, 1.05, 1] } : {}}
        transition={{ duration: 1.2 }}>

        <div className="relative w-40 h-36">
          {/* Lid */}
          <motion.div
            animate={phase === 'open' ? { y: -60, rotate: -15, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-0 inset-x-0 h-12 rounded-t-xl z-10 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #C2185B, #880E4F)' }}>
            {/* Ribbon horizontal */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 bg-[#C9A84C]/80" />
            {/* Bow */}
            <div className="relative z-10 flex gap-1">
              <div className="w-5 h-5 rounded-full border-4 border-[#C9A84C]" style={{ transform: 'rotate(-30deg)' }} />
              <div className="w-5 h-5 rounded-full border-4 border-[#C9A84C]" style={{ transform: 'rotate(30deg)' }} />
            </div>
          </motion.div>

          {/* Box body */}
          <div className="absolute bottom-0 inset-x-0 h-28 rounded-b-xl rounded-t-sm"
            style={{ background: 'linear-gradient(135deg, #880E4F, #6B1A2A)' }}>
            <div className="absolute inset-x-0 top-0 bottom-0 flex items-center justify-center">
              <div className="w-3 h-full bg-[#C9A84C]/60" />
            </div>
          </div>

          {/* Light burst on open */}
          <AnimatePresence>
            {phase === 'open' && (
              <motion.div initial={{ scale: 0, opacity: 1 }} animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.8), rgba(194,24,91,0.4), transparent)' }} />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {phase === 'idle' && (
        <p className="text-sm text-[#C2185B]/60 font-ui animate-pulse">Tap to open 🎁</p>
      )}

      <AnimatePresence>
        {phase === 'open' && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center space-y-3 max-w-xs">
            <p className="text-xl font-serif text-[#1A0A0F]">{message}</p>
            <p className="text-sm text-[#C2185B] font-ui italic">{subtext}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
