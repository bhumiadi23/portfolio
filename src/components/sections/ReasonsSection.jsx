import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import { Heart, Sparkles, Shuffle, X } from 'lucide-react';
import HiddenHeart from '../common/HiddenHeart';

export const ReasonsSection = () => {
  const [flippedIndex, setFlippedIndex] = useState(null);
  const [randomMessage, setRandomMessage] = useState(null);
  const reasons = siteConfig.reasons || [];
  const randomMessages = siteConfig.randomMessages || [];

  const handleRandomClick = () => {
    const random = randomMessages[Math.floor(Math.random() * randomMessages.length)];
    setRandomMessage(random);
  };

  return (
    <section id="reasons" className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#150720] to-[#07050d]">
      {/* Hidden Heart #7 */}
      <div className="absolute bottom-10 left-10">
        <HiddenHeart index={7} />
      </div>

      <div className="max-w-6xl mx-auto space-y-12 text-center">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>Endless Appreciation</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            Reasons Why I Love You
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Tap on any card to flip and discover why you mean the world to me.
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setFlippedIndex(flippedIndex === i ? null : i)}
              className="h-48 cursor-pointer perspective-1000"
            >
              <div
                className={`relative w-full h-full rounded-2xl transition-transform duration-700 transform-style-3d ${
                  flippedIndex === i ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Side */}
                <div className="absolute inset-0 glass-panel p-6 rounded-2xl border border-rose-500/20 bg-black/50 flex flex-col items-center justify-center space-y-3 backface-hidden shadow-xl">
                  <div className="p-3 rounded-full bg-rose-500/10 text-rose-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-rose-300 uppercase tracking-wider">
                    Reason #{i + 1}
                  </span>
                  <span className="text-xs text-slate-400">Tap to reveal ❤️</span>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 glass-panel p-6 rounded-2xl border border-rose-500/40 bg-gradient-to-br from-rose-950/80 to-purple-950/80 flex items-center justify-center text-center rotate-y-180 backface-hidden shadow-2xl">
                  <p className="text-sm font-medium text-rose-100 leading-relaxed font-serif">
                    "{reason}"
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Random Love Button */}
        <div className="pt-4">
          <button
            onClick={handleRandomClick}
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-rose-600 to-pink-600 text-white font-semibold text-sm shadow-xl shadow-rose-950/80 hover:scale-105 active:scale-95 transition-all"
          >
            <Shuffle className="w-4 h-4" />
            <span>Give Me A Random Reason ❤️</span>
          </button>
        </div>
      </div>

      {/* Random Message Modal */}
      <AnimatePresence>
        {randomMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRandomMessage(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full glass-panel p-8 rounded-3xl border border-rose-500/40 bg-slate-950 text-center space-y-4 shadow-2xl"
            >
              <button
                onClick={() => setRandomMessage(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 w-12 h-12 mx-auto flex items-center justify-center">
                <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
              </div>

              <h3 className="text-xl font-bold text-white font-serif">Just For You</h3>
              <p className="text-rose-100 text-base italic leading-relaxed font-serif">
                "{randomMessage}"
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ReasonsSection;
