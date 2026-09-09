import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import MediaVideo from '../common/MediaVideo';
import { Heart, Lock, Unlock } from 'lucide-react';
import HiddenHeart from '../common/HiddenHeart';

export const MissMeSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const data = siteConfig.missMeVideo || {};

  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#1a0826] to-[#07050d] text-center overflow-hidden">
      {/* Hidden Heart #6 */}
      <div className="absolute top-10 left-10">
        <HiddenHeart index={6} />
      </div>

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>A Secret Capsule</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            Watch This When You Miss Me
          </h2>

          <p className="text-slate-300 text-sm md:text-base font-light italic">
            Save this for a quiet evening or whenever you want to feel me close by.
          </p>
        </motion.div>

        {!isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-panel p-10 rounded-3xl border border-rose-500/30 bg-black/50 shadow-2xl flex flex-col items-center space-y-6"
          >
            <div className="p-5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>

            <p className="text-base text-rose-200/90 font-medium">
              "For the moments you miss my voice and my hug..."
            </p>

            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold px-8 py-3.5 rounded-full shadow-xl shadow-rose-950/80 hover:scale-105 active:scale-95 transition-all"
            >
              <Unlock className="w-4 h-4" />
              <span>Open It ❤️</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 glass-panel p-6 rounded-3xl border border-rose-500/40 bg-black/70 shadow-2xl"
          >
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <MediaVideo
                src={data.src}
                poster={data.poster}
                caption="For when you miss me..."
                autoPlay={true}
                muted={false}
                className="w-full aspect-video"
              />
            </div>

            <div className="p-4 bg-rose-950/30 border border-rose-500/20 rounded-2xl text-rose-100 text-sm md:text-base italic leading-relaxed font-serif">
              "{data.message}"
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default MissMeSection;
