import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MailOpen, ArrowDown } from 'lucide-react';
import { apologyConfig } from '../data/apologyConfig';

export default function OpeningScreen({ onOpenLetter, isLetterOpened }) {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = () => {
    if (isLetterOpened) {
      // If already open, just scroll down smoothly
      const letterElement = document.getElementById('letter-section');
      if (letterElement) {
        letterElement.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setIsOpening(true);
    setTimeout(() => {
      onOpenLetter();
      setTimeout(() => {
        const letterElement = document.getElementById('letter-section');
        if (letterElement) {
          letterElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 550);
    }, 450);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-16 text-center overflow-hidden">
      {/* Soft ambient background gradient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[540px] h-[340px] sm:h-[540px] bg-gradient-to-tr from-pink-200/40 via-rose-100/30 to-amber-100/20 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-xl mx-auto flex flex-col items-center">
        {/* Tiny Glowing Heart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="relative mb-6"
        >
          <div className="absolute inset-0 rounded-full bg-rose-400/30 blur-md animate-soft-pulse" />
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFFDF9] border border-rose-200/70 shadow-sm flex items-center justify-center">
            <Heart className="w-5 h-5 text-[#BE123C] fill-[#BE123C] animate-soft-pulse" />
          </div>
        </motion.div>

        {/* Delicate Badge */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#881337] font-medium bg-rose-100/60 border border-rose-200/50 rounded-full px-4 py-1 mb-5"
        >
          {apologyConfig.opening.badge}
        </motion.span>

        {/* Heading: Hey, my Annuva… ❤️ */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="font-playfair text-3xl sm:text-4xl md:text-5xl font-medium text-[#2D1B28] tracking-tight mb-5 leading-tight"
        >
          {apologyConfig.opening.greeting}
        </motion.h1>

        {/* Emotional Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45 }}
          className="font-body text-base sm:text-lg text-stone-700/90 font-normal leading-relaxed max-w-lg mb-10 text-balance"
        >
          {apologyConfig.opening.message}
        </motion.p>

        {/* Animated Envelope with Wax-Seal Heart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="relative mb-8 cursor-pointer select-none group"
          onClick={handleOpen}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpen();
            }
          }}
          aria-label="Click to open letter"
        >
          {/* Envelope Exterior */}
          <div className="relative w-64 sm:w-72 h-44 sm:h-48 rounded-xl bg-[#FAF5EE] border border-rose-200/60 shadow-xl overflow-visible transition-transform duration-500 group-hover:-translate-y-1 group-hover:shadow-2xl">
            {/* Paper Texture lines inside */}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-100/50 to-transparent rounded-xl" />

            {/* Letter peek preview inside envelope */}
            <motion.div
              animate={
                isLetterOpened || isOpening
                  ? { y: -70, opacity: 1 }
                  : { y: 0, opacity: 0.9 }
              }
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-4 right-4 top-3 bottom-4 bg-[#FFFDF9] border border-rose-100/70 rounded-t-lg shadow-sm px-4 py-3 text-left overflow-hidden pointer-events-none"
            >
              <div className="w-12 h-1.5 bg-rose-200/60 rounded-full mb-2" />
              <div className="w-3/4 h-1.5 bg-rose-100/80 rounded-full mb-1.5" />
              <div className="w-1/2 h-1.5 bg-rose-100/70 rounded-full" />
              <div className="mt-3 font-script text-base text-[#BE123C]/60">
                My Annuva...
              </div>
            </motion.div>

            {/* Envelope Flap Triangles (Front Bottom & Sides) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              {/* Bottom fold */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F5EDE1] to-[#FAF5EE] border-t border-rose-100/70 [clip-path:polygon(0%_100%,_50%_40%,_100%_100%)] shadow-inner" />
              {/* Left fold */}
              <div className="absolute top-0 bottom-0 left-0 w-28 bg-[#F4EBE0]/80 [clip-path:polygon(0%_0%,_0%_100%,_80%_50%)]" />
              {/* Right fold */}
              <div className="absolute top-0 bottom-0 right-0 w-28 bg-[#F4EBE0]/80 [clip-path:polygon(100%_0%,_100%_100%,_20%_50%)]" />
            </div>

            {/* Top Flap (Animated 3D Flip) */}
            <motion.div
              animate={
                isLetterOpened || isOpening
                  ? { rotateX: -160, y: -4 }
                  : { rotateX: 0, y: 0 }
              }
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'top center' }}
              className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#F2E7D8] to-[#EFE2D1] border-b border-rose-200/50 [clip-path:polygon(0%_0%,_100%_0%,_50%_95%)] shadow-md z-20 pointer-events-none"
            />

            {/* Wax Seal Heart in the center */}
            <motion.div
              animate={
                isLetterOpened || isOpening
                  ? { scale: 0.75, opacity: 0, y: -25 }
                  : { scale: 1, opacity: 1, y: 0 }
              }
              transition={{ duration: 0.4 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full wax-seal flex items-center justify-center relative shadow-lg">
                <Heart className="w-5 h-5 text-rose-100 fill-rose-100/90 drop-shadow-sm" />
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#BE123C]" />
                </span>
              </div>
            </motion.div>
          </div>

          <p className="mt-3 text-xs text-stone-500 font-normal tracking-wide transition-opacity duration-300 group-hover:text-[#881337]">
            {isLetterOpened
              ? "Your letter is unfolded below ↓"
              : apologyConfig.opening.hintText}
          </p>
        </motion.div>

        {/* Primary Action Button: Open my letter 💌 */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <button
            onClick={handleOpen}
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#881337] via-[#9F1239] to-[#BE123C] text-white font-medium text-sm sm:text-base shadow-lg shadow-rose-900/20 hover:shadow-xl hover:shadow-rose-900/30 transition-all duration-300 hover:scale-[1.02] active:scale-98"
          >
            <MailOpen className="w-4 h-4 text-rose-200 group-hover:rotate-12 transition-transform duration-300" />
            <span>{isLetterOpened ? 'Read My Letter Again 💌' : apologyConfig.opening.buttonText}</span>
            <ArrowDown className="w-4 h-4 text-rose-200/80 group-hover:translate-y-0.5 transition-transform duration-300" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
