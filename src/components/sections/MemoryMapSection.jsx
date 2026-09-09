import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import MediaImage from '../common/MediaImage';
import { MapPin, Navigation, X } from 'lucide-react';

export const MemoryMapSection = () => {
  const [activeLocation, setActiveLocation] = useState(null);
  const places = siteConfig.specialPlaces || [];

  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#10081d] to-[#07050d]">
      <div className="max-w-5xl mx-auto space-y-12 text-center">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs uppercase tracking-widest font-semibold">
            <Navigation className="w-3.5 h-3.5 text-purple-400" />
            <span>Map Of Our Hearts</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            Our Special Places
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Click on any pin on our relationship map to explore the memory created there.
          </p>
        </div>

        {/* Illustrated Map Canvas / Grid Container */}
        <div className="relative w-full h-[400px] md:h-[480px] rounded-3xl border border-rose-500/30 bg-gradient-to-tr from-slate-950 via-purple-950/40 to-slate-950 overflow-hidden shadow-2xl">
          {/* Subtle grid lines background */}
          <div className="absolute inset-0 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

          {/* Location Pins */}
          {places.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setActiveLocation(loc)}
              style={{ left: loc.coords.x, top: loc.coords.y }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center cursor-pointer z-10"
            >
              <div className="p-3 rounded-full bg-rose-600/90 text-white shadow-xl shadow-rose-950/80 group-hover:scale-125 transition-transform animate-bounce">
                <MapPin className="w-5 h-5 fill-white" />
              </div>
              <span className="mt-1 px-3 py-1 rounded-full bg-black/80 border border-white/20 text-[11px] font-semibold text-rose-200 shadow-md">
                {loc.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Location Memory Modal */}
      <AnimatePresence>
        {activeLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLocation(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full glass-panel p-6 rounded-3xl border border-rose-500/40 bg-slate-950 text-left space-y-4 shadow-2xl"
            >
              <button
                onClick={() => setActiveLocation(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="h-52 rounded-2xl overflow-hidden border border-white/10">
                <MediaImage
                  src={activeLocation.photo}
                  alt={activeLocation.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono font-semibold text-rose-400 uppercase">
                  {activeLocation.date}
                </span>
                <h3 className="text-xl font-bold text-white">{activeLocation.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeLocation.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MemoryMapSection;
