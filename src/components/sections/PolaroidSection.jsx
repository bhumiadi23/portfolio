import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import MediaImage from '../common/MediaImage';

export const PolaroidSection = () => {
  const polaroids = siteConfig.polaroids || [];

  return (
    <section className="relative py-20 px-6 bg-gradient-to-b from-[#07050d] via-[#11071d] to-[#07050d] text-center overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="space-y-3">
          <span className="text-xs uppercase tracking-widest text-rose-300 font-semibold bg-rose-500/10 px-4 py-1.5 rounded-full border border-rose-500/20">
            Nostalgic Frames
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            Polaroid Memory Wall
          </h2>
        </div>

        {/* Polaroid Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pt-4">
          {polaroids.map((item, i) => (
            <motion.div
              key={item.id || i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.08, rotate: 0, zIndex: 20 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={{ transform: `rotate(${item.rotate || '0deg'})` }}
              className="bg-stone-100 text-stone-900 p-4 rounded-md shadow-2xl border border-stone-300 transition-all duration-300 group cursor-pointer"
            >
              <div className="aspect-square overflow-hidden bg-stone-200 rounded-sm mb-3">
                <MediaImage
                  src={item.src}
                  alt={item.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="text-left font-serif space-y-1">
                <p className="text-sm font-bold text-stone-900 line-clamp-1">{item.caption}</p>
                <span className="text-[11px] font-sans text-stone-500 block">{item.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PolaroidSection;
