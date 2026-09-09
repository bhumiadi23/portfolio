import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import MediaImage from '../common/MediaImage';
import { Sparkles } from 'lucide-react';

export const TiltCardsSection = () => {
  const cards = siteConfig.tiltCards || [];

  return (
    <section className="relative py-20 px-6 bg-gradient-to-b from-[#07050d] via-[#140822] to-[#07050d] text-center">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="space-y-3">
          <span className="text-xs uppercase tracking-widest text-rose-300 font-semibold bg-rose-500/10 px-4 py-1.5 rounded-full border border-rose-500/20">
            Interactive 3D Cards
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            What Makes You Extraordinary
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <TiltCard key={card.id || i} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

const TiltCard = ({ card, index }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -12;
    const rY = ((x - centerX) / centerX) * 12;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }}
      className="glass-panel p-6 rounded-3xl border border-rose-500/20 bg-black/50 text-left transition-transform duration-200 ease-out shadow-2xl relative group overflow-hidden"
    >
      <div className="absolute top-4 right-4 p-2 rounded-full bg-rose-500/10 text-rose-400">
        <Sparkles className="w-4 h-4" />
      </div>

      <div className="h-44 overflow-hidden rounded-2xl mb-4 border border-white/10">
        <MediaImage
          src={card.image}
          alt={card.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <span className="text-xs font-mono font-semibold text-rose-400 uppercase tracking-wider block mb-1">
        {card.subtitle}
      </span>
      <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
      <p className="text-xs text-slate-300 leading-relaxed">{card.description}</p>
    </motion.div>
  );
};

export default TiltCardsSection;
