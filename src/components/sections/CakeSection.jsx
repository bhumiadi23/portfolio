import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import { Sparkles, Wind, Flame } from 'lucide-react';
import { triggerCelebrationFireworks, triggerConfetti } from '../common/Confetti';
import FireworksCanvas from '../common/FireworksCanvas';

export const CakeSection = () => {
  const [candlesLit, setCandlesLit] = useState(true);
  const [showFireworks, setShowFireworks] = useState(false);

  const handleBlowOut = () => {
    if (!candlesLit) return;
    setCandlesLit(false);
    setShowFireworks(true);
    triggerCelebrationFireworks();
    triggerConfetti({ particleCount: 120, spread: 100 });
  };

  return (
    <section id="cake" className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#12071d] to-[#07050d] text-center overflow-hidden">
      <FireworksCanvas active={showFireworks} />

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Make A Wish</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            The Birthday Cake
          </h2>
          <p className="text-slate-400 text-sm">
            {candlesLit ? "Make a wish and blow out the candles! 🕯️" : "Your wish has been sent into the stars ✨"}
          </p>
        </div>

        {/* Cake Container */}
        <div className="relative py-12 flex flex-col items-center justify-center">
          {/* Candles Row */}
          <div className="flex items-center justify-center gap-6 mb-2">
            {[1, 2, 3].map((id) => (
              <div key={id} className="relative flex flex-col items-center cursor-pointer" onClick={handleBlowOut}>
                {/* Flame */}
                {candlesLit && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="w-4 h-6 bg-gradient-to-t from-amber-500 via-yellow-300 to-white rounded-full shadow-[0_0_15px_rgba(251,191,36,0.9)] mb-1"
                  />
                )}
                {/* Candle Stick */}
                <div className="w-3 h-14 bg-gradient-to-b from-pink-300 to-rose-500 rounded-sm border border-white/20" />
              </div>
            ))}
          </div>

          {/* Cake Layers */}
          <div className="w-56 h-12 bg-gradient-to-r from-rose-500 via-pink-400 to-rose-500 rounded-t-2xl border-b-4 border-rose-700 shadow-xl flex items-center justify-center">
            <span className="text-xs font-serif font-bold text-white tracking-widest">
              HAPPY BIRTHDAY
            </span>
          </div>
          <div className="w-72 h-16 bg-gradient-to-r from-purple-800 via-rose-900 to-purple-800 rounded-b-2xl border-t-2 border-white/20 shadow-2xl flex items-center justify-center">
            <span className="text-sm font-serif font-bold text-rose-200">
              {siteConfig.girlfriendName} ❤️
            </span>
          </div>

          {/* Blow Out Button */}
          {candlesLit && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBlowOut}
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-600/90 text-white font-semibold text-xs uppercase tracking-wider shadow-xl shadow-rose-950/80 cursor-pointer"
            >
              <Wind className="w-4 h-4" />
              <span>Blow Out Candles 💨</span>
            </motion.button>
          )}
        </div>

        {/* Wish Revealed Message */}
        {!candlesLit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 rounded-3xl border border-rose-500/40 bg-black/80 space-y-3"
          >
            <h3 className="text-2xl font-bold text-amber-300 font-serif">
              HAPPY BIRTHDAY, {siteConfig.girlfriendName.toUpperCase()}! 🎉❤️
            </h3>
            <p className="text-rose-100 text-sm md:text-base italic font-serif">
              May all your dreams, happiness, and secret wishes come true today and always.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CakeSection;
