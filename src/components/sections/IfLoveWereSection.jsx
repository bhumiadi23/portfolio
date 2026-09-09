import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import { Sparkles, Heart } from 'lucide-react';

export const IfLoveWereSection = () => {
  const items = siteConfig.ifLoveWere || [];
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <section className="relative py-20 px-6 bg-gradient-to-b from-[#07050d] via-[#140722] to-[#07050d]">
      <div className="max-w-5xl mx-auto space-y-12 text-center">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Romantic Metaphors</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            If Our Love Were...
          </h2>
          <p className="text-slate-400 text-sm">
            Click on any card to see what our connection feels like.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setActiveIndex(activeIndex === i ? null : i)}
              className="glass-panel p-8 rounded-3xl border border-rose-500/20 bg-black/40 text-left cursor-pointer hover:border-rose-500/40 transition-all duration-300 shadow-xl group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white font-serif group-hover:text-rose-300 transition-colors">
                  {item.category}
                </h3>
                <div className="p-2 rounded-full bg-rose-500/10 text-rose-400">
                  <Heart className="w-4 h-4" />
                </div>
              </div>

              <p className="text-sm text-rose-100/90 leading-relaxed font-serif italic">
                "{item.answer}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IfLoveWereSection;
