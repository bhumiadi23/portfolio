import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, Image as ImageIcon, X, Heart } from 'lucide-react';
import { apologyConfig } from '../data/apologyConfig';

export default function OurLittleWorld() {
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const scrollContainerRef = useRef(null);

  const { memoriesSection } = apologyConfig;

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section id="our-little-world" className="relative py-24 px-4 sm:px-6 md:px-8 overflow-hidden">
      {/* Delicate background glow */}
      <div
        className="absolute top-1/2 left-1/4 w-[450px] h-[450px] bg-rose-100/30 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#881337] font-semibold bg-rose-50/80 border border-rose-200/60 rounded-full px-4 py-1.5 mb-3"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#BE123C]" />
            <span>Our Little World</span>
          </motion.div>

          {/* Heading from requirements */}
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-playfair text-2xl sm:text-3xl md:text-4xl text-[#2D1B28] font-medium tracking-tight mb-4 leading-snug"
          >
            “{memoriesSection.heading}”
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-stone-700 text-sm sm:text-base font-body leading-relaxed"
          >
            {memoriesSection.subheading}
          </motion.p>
        </div>

        {/* Timeline Navigation Controls */}
        <div className="flex items-center justify-between mb-6 px-2">
          <span className="text-xs uppercase tracking-widest text-stone-600 font-mono">
            Memories & Moments
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              aria-label="Scroll memories left"
              className="p-2.5 rounded-full bg-[#FFFDF9] border border-rose-200/70 text-stone-700 hover:text-[#881337] hover:border-rose-300 shadow-sm transition-all duration-200 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Scroll memories right"
              className="p-2.5 rounded-full bg-[#FFFDF9] border border-rose-200/70 text-stone-700 hover:text-[#881337] hover:border-rose-300 shadow-sm transition-all duration-200 active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Timeline Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-8 pt-2 px-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {memoriesSection.items.map((memory, index) => {
            const hasError = imageErrors[memory.id];
            const imgSrc = hasError ? memory.fallbackImage : memory.image;

            return (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => setSelectedMemory(memory)}
                className="flex-shrink-0 w-72 sm:w-80 snap-center cursor-pointer group"
              >
                {/* Polaroid Frame */}
                <div className="bg-[#FFFDF9] rounded-2xl p-4 shadow-lg border border-rose-100/80 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:border-rose-300/80">
                  {/* Decorative tape at the top */}
                  <div
                    className="w-16 h-4 bg-rose-200/40 rounded-sm mx-auto -mt-6 mb-3 shadow-xs border-dashed border-t border-b border-rose-300/50"
                    aria-hidden="true"
                  />

                  {/* Photo area */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-rose-50/50 mb-4">
                    <img
                      src={imgSrc}
                      alt={memory.title}
                      onError={() => handleImageError(memory.id)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="text-white text-xs font-medium flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 fill-rose-300 text-rose-300" />
                        Click to enlarge
                      </span>
                    </div>
                  </div>

                  {/* Caption & Date */}
                  <div className="px-1 text-left">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#BE123C] bg-rose-50 px-2 py-0.5 rounded">
                        {memory.tag}
                      </span>
                      <span className="text-[11px] text-stone-600 font-mono">
                        {memory.date}
                      </span>
                    </div>

                    <h3 className="font-playfair text-base sm:text-lg text-[#2D1B28] font-medium mb-1.5 group-hover:text-[#881337] transition-colors">
                      {memory.title}
                    </h3>

                    <p className="font-body text-xs text-stone-700 line-clamp-2 leading-relaxed">
                      {memory.note}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Discreet customization note for Nestle */}
        <div className="mt-6 text-center">
          <p className="text-xs text-stone-500 font-mono inline-flex items-center gap-2 bg-stone-100/80 px-4 py-1.5 rounded-full border border-stone-200/60">
            <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
            <span>Customize photos anytime in <code>src/data/apologyConfig.js</code></span>
          </p>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMemory(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200 overflow-hidden"
            >
              <button
                onClick={() => setSelectedMemory(null)}
                aria-label="Close modal"
                className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-600 hover:text-black hover:bg-stone-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 mb-5">
                <img
                  src={
                    imageErrors[selectedMemory.id]
                      ? selectedMemory.fallbackImage
                      : selectedMemory.image
                  }
                  alt={selectedMemory.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#BE123C] bg-rose-50 px-2.5 py-0.5 rounded-full">
                    {selectedMemory.tag}
                  </span>
                  <span className="text-xs font-mono text-stone-600">
                    {selectedMemory.date}
                  </span>
                </div>

                <h3 className="font-playfair text-xl sm:text-2xl text-[#2D1B28] font-medium mb-3">
                  {selectedMemory.title}
                </h3>

                <p className="font-body text-sm sm:text-base text-stone-700 leading-relaxed">
                  {selectedMemory.note}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
