import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../data/siteConfig';

export default function FinalVideo({ onComplete }) {
  const [phase, setPhase] = useState('teaser'); // teaser | fading | playing | done

  const open = () => setPhase('fading');

  return (
    <div className="relative section-full flex items-center justify-center"
      style={{ background: '#0A0005' }}>

      <AnimatePresence mode="wait">
        {phase === 'teaser' && (
          <motion.div key="teaser"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center px-6 space-y-6">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-xs uppercase tracking-[0.3em] font-ui text-[#F8BBD9]/40">
              one last thing...
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="font-serif text-white" style={{ fontSize: 'clamp(2rem, 8vw, 4rem)' }}>
              Open my heart ❤️
            </motion.h2>
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={open}
              className="px-10 py-4 rounded-full text-white font-semibold font-ui text-sm shadow-2xl animate-glow"
              style={{ background: 'linear-gradient(135deg, #C2185B, #880E4F)' }}>
              OPEN
            </motion.button>
          </motion.div>
        )}

        {phase === 'fading' && (
          <motion.div key="fade"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            onAnimationComplete={() => setPhase('playing')}
            className="absolute inset-0 bg-black" />
        )}

        {phase === 'playing' && (
          <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-black">
            <video
              src={siteConfig.finalVideo}
              autoPlay playsInline
              className="w-full h-full object-contain"
              onEnded={() => { setPhase('done'); onComplete?.(); }}
              onError={() => { setPhase('done'); onComplete?.(); }}
            />
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center px-6">
            <p className="font-cormorant italic text-[#F8BBD9]/60 text-lg">
              Add your final video to /public/media/videos/final.mp4
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
