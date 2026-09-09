import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import MediaImage from '../common/MediaImage';
import { ChevronLeft, ChevronRight, Heart, Sparkles } from 'lucide-react';

export const HorizontalCarousel = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const events = siteConfig.timeline || [];

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % events.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + events.length) % events.length);
  };

  const currentEv = events[activeIdx] || events[0];

  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#140621] to-[#07050d] text-center overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Story Carousel</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            Our Chapters Side-By-Side 📖
          </h2>
        </div>

        {/* Carousel Card Container */}
        <div className="relative max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="glass-panel p-8 rounded-3xl border border-rose-500/40 bg-black/70 shadow-2xl text-left space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                  {currentEv.date}
                </span>
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              </div>

              <div className="h-64 rounded-2xl overflow-hidden border border-white/10">
                <MediaImage
                  src={currentEv.image}
                  alt={currentEv.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-2xl font-bold text-white font-serif">{currentEv.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{currentEv.description}</p>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <button
            onClick={handlePrev}
            className="absolute left-2 md:-left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-rose-600/90 text-white shadow-xl hover:scale-110 active:scale-95 transition-transform"
            aria-label="Previous story card"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 md:-right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-rose-600/90 text-white shadow-xl hover:scale-110 active:scale-95 transition-transform"
            aria-label="Next story card"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {events.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === activeIdx ? 'w-8 bg-rose-500' : 'w-2.5 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HorizontalCarousel;
