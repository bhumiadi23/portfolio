import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import MediaImage from '../common/MediaImage';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';

export const HorizontalStorySection = () => {
  const containerRef = useRef(null);
  const events = siteConfig.timeline || [];

  return (
    <section className="relative py-24 bg-gradient-to-b from-[#07050d] via-[#140621] to-[#07050d] text-center overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 space-y-4 mb-8">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Horizontal Story Experience</span>
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
          Swipe & Explore Our Story ➡️
        </h2>
        <p className="text-slate-400 text-xs md:text-sm">
          Scroll horizontally or drag across to relive our favorite memories side-by-side.
        </p>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={containerRef}
        className="flex items-center gap-6 overflow-x-auto snap-x snap-mandatory px-6 md:px-20 py-8 no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {events.map((ev, idx) => (
          <motion.div
            key={ev.id || idx}
            whileHover={{ y: -10, scale: 1.02 }}
            className="flex-shrink-0 w-80 md:w-96 snap-center glass-panel p-6 rounded-3xl border border-rose-500/30 bg-black/60 shadow-2xl text-left space-y-4 relative group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                {ev.date}
              </span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            </div>

            <div className="h-52 rounded-2xl overflow-hidden border border-white/10">
              <MediaImage
                src={ev.image}
                alt={ev.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <h3 className="text-xl font-bold text-white font-serif group-hover:text-rose-300 transition-colors">
              {ev.title}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
              {ev.description}
            </p>

            <div className="pt-2 flex items-center justify-between text-[11px] font-semibold text-rose-300/80">
              <span>{ev.tag || "Chapter " + (idx + 1)}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HorizontalStorySection;
