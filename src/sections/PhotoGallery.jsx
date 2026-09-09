import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../data/siteConfig';

const ROTATIONS = [-4, 2, -2, 5, -3, 1, -5, 3];

function PolaroidCard({ photo, index, onClick }) {
  const [imgError, setImgError] = useState(false);
  const rot = ROTATIONS[index % ROTATIONS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: rot }}
      whileInView={{ opacity: 1, y: 0, rotate: rot }}
      viewport={{ once: true, margin: '-5%' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ rotate: 0, scale: 1.06, y: -8, zIndex: 10 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(index)}
      className="polaroid cursor-pointer"
      style={{ transformOrigin: 'center bottom' }}>
      <div className="w-full aspect-square overflow-hidden bg-[#F5EFE6]">
        {!imgError ? (
          <img src={photo.src} alt={photo.caption} className="w-full h-full object-cover"
            onError={() => setImgError(true)} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl animate-heartbeat">💕</span>
          </div>
        )}
      </div>
      <p className="mt-2 text-center text-xs font-ui text-[#6B1A2A]/70 italic leading-tight">{photo.caption}</p>
    </motion.div>
  );
}

export default function PhotoGallery() {
  const [lightbox, setLightbox] = useState(null);
  const photos = siteConfig.photos;

  return (
    <div className="relative py-20 px-4 md:px-10"
      style={{ background: 'linear-gradient(180deg, #F5EFE6 0%, #FDFBF7 100%)' }}>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-center mb-14">
        <p className="text-xs uppercase tracking-[0.3em] font-ui mb-3" style={{ color: 'rgba(194,24,91,0.6)' }}>
          memory wall
        </p>
        <h2 className="font-serif" style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)', color: '#1A0A0F' }}>
          My favorite views of you
        </h2>
      </motion.div>

      {/* Polaroid grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
        {photos.map((p, i) => (
          <PolaroidCard key={i} photo={p} index={i} onClick={setLightbox} />
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div key="lb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(26,10,15,0.92)', backdropFilter: 'blur(12px)' }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }} transition={{ ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
              className="polaroid max-w-sm w-full">
              <div className="w-full aspect-square overflow-hidden bg-[#F5EFE6]">
                <img src={photos[lightbox]?.src} alt="" className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }} />
              </div>
              <p className="mt-3 text-center text-sm font-ui text-[#6B1A2A] italic">{photos[lightbox]?.caption}</p>
              <button onClick={() => setLightbox(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-[#6B1A2A]/60 hover:text-[#C2185B] text-lg">
                ✕
              </button>
            </motion.div>

            {/* Prev/Next */}
            <button onClick={e => { e.stopPropagation(); setLightbox(l => (l - 1 + photos.length) % photos.length); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white text-xl"
              style={{ background: 'rgba(194,24,91,0.3)' }}>‹</button>
            <button onClick={e => { e.stopPropagation(); setLightbox(l => (l + 1) % photos.length); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white text-xl"
              style={{ background: 'rgba(194,24,91,0.3)' }}>›</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
