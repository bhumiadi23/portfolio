import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingParticles from '../components/FloatingParticles';

export default function Intro({ onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1800);
    const t2 = setTimeout(() => setPhase(2), 3400);
    const t3 = setTimeout(() => setPhase(3), 5000);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  return (
    <div className="section-full flex flex-col items-center justify-center relative"
      style={{ background: 'linear-gradient(160deg, #FDFBF7 0%, #F5EFE6 50%, #FDFBF7 100%)' }}>
      <FloatingParticles color="rgba(194,24,91," count={14} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(194,24,91,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6">
        {phase >= 0 && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm uppercase tracking-[0.3em] font-ui"
            style={{ color: 'rgba(194,24,91,0.6)' }}>
            a little something for you
          </motion.p>
        )}

        <AnimatePresence>
          {phase >= 1 && (
            <motion.h1 key="name"
              initial={{ opacity: 0, scale: 0.85, filter: 'blur(20px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif leading-none select-none"
              style={{
                fontSize: 'clamp(4rem, 18vw, 9rem)',
                background: 'linear-gradient(135deg, #6B1A2A 0%, #C2185B 40%, #880E4F 70%, #C9A84C 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 30px rgba(194,24,91,0.25))',
              }}>
              Annuva
            </motion.h1>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase >= 2 && (
            <motion.p key="by" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.5, y: 0 }}
              transition={{ duration: 1 }}
              className="text-xs tracking-[0.25em] uppercase font-ui"
              style={{ color: '#6B1A2A' }}>
              made by Nestle
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase >= 3 && (
            <motion.button key="btn"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={onComplete}
              className="mt-4 px-10 py-4 rounded-full text-white font-semibold font-ui text-sm tracking-wide shadow-xl animate-glow"
              style={{ background: 'linear-gradient(135deg, #C2185B, #880E4F)' }}>
              Enter ❤️
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
