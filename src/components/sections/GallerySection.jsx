import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import MediaImage from '../common/MediaImage';
import { X, Image as ImageIcon, ZoomIn } from 'lucide-react';
import HiddenHeart from '../common/HiddenHeart';

export const GallerySection = () => {
  const [activePhoto, setActivePhoto] = useState(null);
  const photos = siteConfig.photos || [];

  return (
    <section id="gallery" className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#150a24] to-[#07050d]">
      {/* Hidden Heart #5 */}
      <div className="absolute top-10 right-10">
        <HiddenHeart index={5} />
      </div>

      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
            <span>Captured Moments</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            Memory Photo Gallery
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto">
            Click on any photo to open full view and relive the magic.
          </p>
        </div>

        {/* Masonry / Grid Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setActivePhoto(photo)}
              className="group relative rounded-2xl overflow-hidden cursor-pointer border border-white/10 bg-black/40 shadow-xl"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <MediaImage
                  src={photo.src}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
                <div className="flex items-center justify-between text-white mb-1">
                  <h3 className="font-bold text-lg text-rose-200">{photo.title}</h3>
                  <ZoomIn className="w-5 h-5 text-rose-400" />
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">{photo.caption}</p>
                <span className="text-[10px] font-mono text-rose-400 mt-2 font-medium uppercase">
                  {photo.date}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-slate-950 border border-rose-500/30 rounded-3xl overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 p-3 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-h-[70vh] overflow-hidden flex items-center justify-center bg-black">
                <MediaImage
                  src={activePhoto.src}
                  alt={activePhoto.title}
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>

              <div className="p-6 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-rose-300 font-serif">{activePhoto.title}</h3>
                  <span className="text-xs font-mono text-slate-400">{activePhoto.date}</span>
                </div>
                <p className="text-sm text-slate-300">{activePhoto.caption}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;
