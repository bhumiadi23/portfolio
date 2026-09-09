import { useState } from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../data/siteConfig';
import confetti from 'canvas-confetti';

function ReasonCard({ reason, index }) {
  const [flipped, setFlipped] = useState(false);

  const flip = () => {
    setFlipped(f => !f);
    if (!flipped) confetti({ particleCount: 12, spread: 30, origin: { y: 0.6 }, colors: ['#C2185B', '#F8BBD9', '#C9A84C'] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-5%' }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.06 }}
      className="perspective h-32 cursor-pointer"
      onClick={flip}>
      <div className={`relative w-full h-full preserve-3d transition-transform duration-700 ${flipped ? 'rotate-y-180' : ''}`}>
        {/* Front */}
        <div className="absolute inset-0 backface-hidden rounded-2xl flex flex-col items-center justify-center gap-2 border border-[#C2185B]/15 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #FDFBF7, #F5EFE6)' }}>
          <span className="text-xl">💕</span>
          <span className="text-[11px] font-ui font-medium" style={{ color: 'rgba(194,24,91,0.6)' }}>
            Reason #{index + 1}
          </span>
        </div>
        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl flex items-center justify-center p-3 border border-[#C2185B]/25 shadow-md"
          style={{ background: 'linear-gradient(135deg, rgba(62,0,32,0.06), rgba(194,24,91,0.08))' }}>
          <p className="text-[11px] font-ui leading-relaxed text-center" style={{ color: '#3E0020' }}>
            "{reason}"
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Reasons() {
  return (
    <div className="relative py-20 px-6 md:px-10"
      style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #F5EFE6 100%)' }}>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.3em] font-ui mb-3" style={{ color: 'rgba(194,24,91,0.6)' }}>
          reasons i love you
        </p>
        <h2 className="font-serif mb-3" style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)', color: '#1A0A0F' }}>
          Tap each one ❤️
        </h2>
        <p className="text-sm font-ui" style={{ color: 'rgba(26,10,15,0.5)' }}>
          {siteConfig.reasons.length} reasons. And counting.
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {siteConfig.reasons.map((r, i) => (
          <ReasonCard key={i} reason={r} index={i} />
        ))}
      </div>
    </div>
  );
}
