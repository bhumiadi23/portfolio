import { useState } from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../data/siteConfig';

function TimelineCard({ memory, index }) {
  const isLeft = index % 2 === 0;
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-15%' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col md:flex-row items-center gap-6 md:gap-10 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

      {/* Photo */}
      <div className="w-full md:w-64 flex-shrink-0 aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-[#C2185B]/10">
        {memory.photo && !imgError ? (
          <img src={memory.photo} alt={memory.title} className="w-full h-full object-cover"
            onError={() => setImgError(true)} loading="lazy" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #F5EFE6, #FDFBF7)' }}>
            <span className="text-3xl animate-heartbeat">💕</span>
            <p className="text-xs text-[#C2185B]/50 font-ui">Add photo here</p>
          </div>
        )}
      </div>

      {/* Text */}
      <div className={`flex-1 ${isLeft ? 'md:text-left' : 'md:text-right'} text-left`}>
        <span className="inline-block text-[10px] uppercase tracking-[0.25em] font-ui font-semibold px-3 py-1 rounded-full mb-3"
          style={{ background: 'rgba(194,24,91,0.1)', color: '#C2185B' }}>
          {memory.label}
        </span>
        <h3 className="font-serif text-xl md:text-2xl mb-2" style={{ color: '#1A0A0F' }}>{memory.title}</h3>
        <p className="font-ui text-sm leading-relaxed" style={{ color: 'rgba(26,10,15,0.65)' }}>{memory.text}</p>
      </div>
    </motion.div>
  );
}

export default function StoryTimeline() {
  return (
    <div className="relative py-20 px-6 md:px-10"
      style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #F5EFE6 50%, #FDFBF7 100%)' }}>

      {/* Section header */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-center mb-16">
        <p className="text-xs uppercase tracking-[0.3em] font-ui mb-3" style={{ color: 'rgba(194,24,91,0.6)' }}>
          our story
        </p>
        <h2 className="font-serif" style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)', color: '#1A0A0F' }}>
          The moments that matter
        </h2>
      </motion.div>

      {/* Vertical line */}
      <div className="hidden md:block absolute left-1/2 top-40 bottom-20 w-px -translate-x-1/2"
        style={{ background: 'linear-gradient(to bottom, transparent, #C2185B40, #C2185B40, transparent)' }} />

      <div className="max-w-4xl mx-auto flex flex-col gap-16 md:gap-20">
        {siteConfig.memories.map((m, i) => (
          <TimelineCard key={i} memory={m} index={i} />
        ))}
      </div>
    </div>
  );
}
