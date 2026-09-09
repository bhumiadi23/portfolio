import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function MemoryCard({ photo, caption, label, onClick }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [imgError, setImgError] = useState(false);

  const onMove = e => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const x = ((cy - rect.top) / rect.height - 0.5) * 12;
    const y = -((cx - rect.left) / rect.width - 0.5) * 12;
    setTilt({ x, y });
  };

  const onLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div ref={ref}
      style={{ rotateX: tilt.x, rotateY: tilt.y, transformStyle: 'preserve-3d' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseMove={onMove} onMouseLeave={onLeave}
      onTouchMove={onMove} onTouchEnd={onLeave}
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden cursor-pointer shadow-xl border border-[#C2185B]/10 aspect-[3/4] group"
      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>

      {photo && !imgError ? (
        <img src={photo} alt={caption || 'Memory'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)} loading="lazy" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #F5EFE6, #FDFBF7)' }}>
          <span className="text-4xl mb-2 animate-heartbeat">💕</span>
          <p className="text-xs text-[#C2185B]/50 font-ui text-center px-3">{caption || 'A memory'}</p>
        </div>
      )}

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(to top, rgba(62,0,32,0.7) 0%, transparent 50%)' }} />

      {caption && (
        <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white text-xs font-serif italic">{caption}</p>
        </div>
      )}

      {label && (
        <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-[10px] font-semibold font-ui uppercase tracking-wider"
          style={{ background: 'rgba(194,24,91,0.85)', color: 'white' }}>
          {label}
        </div>
      )}
    </motion.div>
  );
}
