import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';

export const LoadingSection = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 800);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    const phaseTimer = setTimeout(() => {
      setPhase(2);
    }, 2000);

    return () => {
      clearInterval(timer);
      clearTimeout(phaseTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 1 } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07050d] text-white overflow-hidden px-4"
    >
      {/* Background glowing ambient light */}
      <div className="absolute w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md text-center">
        {/* Animated Heart Icon */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          className="mb-8 p-4 rounded-full bg-gradient-to-tr from-rose-500/20 to-purple-500/20 border border-rose-500/40 shadow-2xl shadow-rose-900/40"
        >
          <Heart className="w-12 h-12 text-rose-500 fill-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
        </motion.div>

        {/* Text sequence */}
        <AnimatePresence mode="wait">
          {phase === 1 ? (
            <motion.p
              key="phase1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg md:text-xl font-light tracking-wide text-rose-200/90 mb-8 font-serif italic"
            >
              Something special is waiting for you...
            </motion.p>
          ) : (
            <motion.p
              key="phase2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg md:text-xl font-medium tracking-wide text-white mb-8 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Made with ❤️ just for you</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </motion.p>
          )}
        </AnimatePresence>

        {/* Progress Bar & Percentage */}
        <div className="w-64 space-y-3">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs font-mono text-slate-400 tracking-wider">
            {progress}%
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingSection;
