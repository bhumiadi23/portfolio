import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import { Heart, Feather } from 'lucide-react';

export const LoveLetterSection = () => {
  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#150720] to-[#07050d] text-center">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-3"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <Feather className="w-3.5 h-3.5 text-rose-400" />
            <span>Handwritten Words</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            A Letter To My Queen
          </h2>
        </motion.div>

        {/* Paper texture container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-8 md:p-14 rounded-3xl border border-rose-500/30 bg-stone-950/80 text-left shadow-2xl space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-6 right-8 text-rose-500/20">
            <Heart className="w-24 h-24" />
          </div>

          <div className="space-y-4 font-serif leading-relaxed text-rose-100/90 text-base md:text-lg">
            <p className="font-bold text-xl text-rose-200">
              Dearest {siteConfig.girlfriendName},
            </p>

            <p>
              Words often fail to describe how deeply you have enriched my life. From the first moment we met, your smile felt like finding home after a long journey.
            </p>

            <p>
              Thank you for every shared joke, every quiet glance across the room, every tight hug when I needed it most, and for loving me so unconditionally. You make every ordinary day feel like a magical adventure.
            </p>

            <p>
              On your birthday, I wish you endless laughter, peace, health, and all the love in the universe. I am forever grateful to walk beside you.
            </p>

            <div className="pt-6 border-t border-rose-500/20 flex flex-col items-end space-y-1 text-right">
              <span className="text-sm italic text-rose-300">Forever and always,</span>
              <span className="font-bold text-lg text-white font-serif">
                {siteConfig.yourName} ❤️
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LoveLetterSection;
