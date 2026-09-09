import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import { RotateCcw, Heart, Stars } from 'lucide-react';

export const FinalScreenSection = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative py-28 px-6 bg-gradient-to-b from-[#050308] via-[#080210] to-[#030105] text-center overflow-hidden">
      {/* Background ambient stars */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 w-12 h-12 mx-auto flex items-center justify-center border border-rose-500/30">
            <Stars className="w-6 h-6 text-amber-300" />
          </div>

          <p className="text-xs uppercase tracking-widest font-mono text-slate-400">
            Before you leave...
          </p>

          <h3 className="text-2xl md:text-4xl font-bold text-white font-serif">
            Thank you for being part of my life.
          </h3>

          <p className="text-lg md:text-2xl text-rose-200 font-serif italic">
            Happy Birthday, {siteConfig.girlfriendName}.
          </p>

          <div className="pt-2 text-rose-400 font-serif font-bold text-2xl">
            I love you. ❤️
          </div>

          <div className="text-sm font-sans text-slate-400 font-medium">
            — {siteConfig.yourName}
          </div>
        </motion.div>

        <div className="pt-10">
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-rose-600 text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay Our Story ↻</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalScreenSection;
