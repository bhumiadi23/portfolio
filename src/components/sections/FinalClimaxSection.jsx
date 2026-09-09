import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import MediaVideo from '../common/MediaVideo';
import { Heart, Play, Sparkles } from 'lucide-react';

export const FinalClimaxSection = ({ onClimaxComplete }) => {
  const [isPlayingFinal, setIsPlayingFinal] = useState(false);
  const [showLoveReveal, setShowLoveReveal] = useState(false);

  const finalVideo = siteConfig.finalVideo || {};

  const handleOpenHeart = () => {
    setIsPlayingFinal(true);
  };

  const handleVideoEnded = () => {
    setIsPlayingFinal(false);
    setShowLoveReveal(true);
    if (onClimaxComplete) onClimaxComplete();
  };

  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#0d0417] to-[#050308] text-center overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {!isPlayingFinal && !showLoveReveal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>The Grand Finale</span>
            </span>

            <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
              One Last Thing...
            </h2>

            <p className="text-slate-300 text-base md:text-lg font-light italic">
              Before we finish our journey today, I have one final memory to share with you.
            </p>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 35px rgba(244,63,94,0.7)' }}
              whileTap={{ scale: 0.96 }}
              onClick={handleOpenHeart}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white font-bold text-base md:text-xl px-10 py-5 rounded-full shadow-2xl shadow-rose-950/90 border border-rose-400/50 cursor-pointer"
            >
              <Heart className="w-6 h-6 fill-white text-white" />
              <span>Open My Heart ❤️</span>
            </motion.button>
          </motion.div>
        )}

        {/* Video Player Modal/Screen */}
        <AnimatePresence>
          {isPlayingFinal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4"
            >
              <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <MediaVideo
                  src={finalVideo.src}
                  poster={finalVideo.poster}
                  caption="Final Birthday Memory"
                  autoPlay={true}
                  muted={false}
                  className="w-full h-full object-cover"
                />
              </div>

              <button
                onClick={handleVideoEnded}
                className="mt-6 px-6 py-2.5 rounded-full bg-rose-600/80 text-white text-xs font-semibold uppercase tracking-wider hover:bg-rose-600 transition-colors"
              >
                Skip to Final Message →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Staggered Final Love Reveal */}
        {showLoveReveal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="space-y-8 py-10"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-amber-300 font-serif"
            >
              Happy Birthday, {siteConfig.girlfriendName} ❤️
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-xl md:text-3xl text-rose-100 font-light italic font-serif"
            >
              "{siteConfig.finalMessage}"
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8 }}
              className="pt-6"
            >
              <span className="text-3xl md:text-5xl font-serif font-bold text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]">
                I love you.
              </span>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FinalClimaxSection;
