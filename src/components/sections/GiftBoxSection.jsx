import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import { Gift, Sparkles, Heart } from 'lucide-react';
import { triggerCelebrationFireworks, triggerConfetti } from '../common/Confetti';

export const GiftBoxSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const gift = siteConfig.giftBox || {};

  const handleOpenGift = () => {
    setIsOpen(true);
    triggerCelebrationFireworks();
    triggerConfetti({ particleCount: 100, spread: 80 });
  };

  return (
    <section id="gift" className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#1a0828] to-[#07050d] text-center overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <Gift className="w-3.5 h-3.5 text-rose-400" />
            <span>A Special Surprise</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            Your Virtual Birthday Gift
          </h2>
          <p className="text-slate-400 text-sm">
            Tap the gift box below to unwrap your special message!
          </p>
        </div>

        {!isOpen ? (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            onClick={handleOpenGift}
            className="w-48 h-48 mx-auto rounded-3xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 p-1 cursor-pointer shadow-2xl shadow-rose-950/80 flex items-center justify-center relative group"
          >
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex flex-col items-center justify-center p-4 space-y-3">
              <Gift className="w-16 h-16 text-rose-400 group-hover:scale-125 transition-transform" />
              <span className="text-xs font-semibold text-rose-200">
                Unwrap Me ❤️
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 md:p-12 rounded-3xl border border-rose-500/40 bg-gradient-to-br from-rose-950/80 via-purple-950/80 to-slate-950 space-y-6 shadow-2xl"
          >
            <div className="p-4 rounded-full bg-amber-500/20 text-amber-300 w-14 h-14 mx-auto flex items-center justify-center border border-amber-500/30 animate-bounce">
              <Sparkles className="w-7 h-7" />
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-white font-serif">
              {gift.title || "Your Real Gift Is Waiting!"}
            </h3>

            <p className="text-rose-100 text-base md:text-lg italic font-serif leading-relaxed">
              "{gift.message}"
            </p>

            <span className="block text-xs font-mono text-rose-300/80">
              {gift.subtext}
            </span>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default GiftBoxSection;
