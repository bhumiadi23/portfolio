import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import { useExperience } from '../../context/ExperienceContext';
import { Heart, Sparkles } from 'lucide-react';
import HiddenHeart from '../common/HiddenHeart';

export const EnterSection = ({ onEnter }) => {
  const { setHasEntered, setIsPlayingMusic } = useExperience();

  const handleEnterClick = () => {
    setHasEntered(true);
    setIsPlayingMusic(true);
    if (onEnter) onEnter();
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-gradient-to-b from-[#07050d] via-[#120a1f] to-[#07050d]">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-rose-600/15 via-purple-600/15 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Hidden Heart #0 */}
      <div className="absolute top-8 left-8">
        <HiddenHeart index={0} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="relative z-10 max-w-2xl"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold mb-6"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {siteConfig.introSubheading || "A Special World"}
        </motion.span>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4 font-serif">
          Hey, <span className="bg-gradient-to-r from-rose-400 via-pink-300 to-amber-300 bg-clip-text text-transparent">{siteConfig.girlfriendName}</span>...
        </h1>

        <p className="text-lg md:text-2xl text-slate-300 font-light italic mb-10 max-w-lg mx-auto">
          "I made something special just for you."
        </p>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 35px rgba(244,63,94,0.6)' }}
          whileTap={{ scale: 0.96 }}
          onClick={handleEnterClick}
          className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white font-semibold text-base md:text-lg px-8 py-4 rounded-full shadow-2xl shadow-rose-950/80 border border-rose-400/40 cursor-pointer overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <span>ENTER MY WORLD</span>
            <Heart className="w-5 h-5 fill-white text-white group-hover:scale-125 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.button>
      </motion.div>
    </section>
  );
};

export default EnterSection;
