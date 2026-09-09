import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import MediaVideo from '../common/MediaVideo';
import { Film } from 'lucide-react';

export const HeroVideoSection = () => {
  const heroVideo = siteConfig.heroVideo || {};

  return (
    <section className="relative py-16 px-6 bg-gradient-to-b from-[#07050d] via-[#10081d] to-[#07050d] text-center">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-3"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs uppercase tracking-widest font-medium">
            <Film className="w-3.5 h-3.5 text-purple-400" />
            <span>Cinematic Highlights</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            A Glimpse Into Our World
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl border border-rose-500/20 max-w-4xl mx-auto"
        >
          <MediaVideo
            src={heroVideo.src}
            poster={heroVideo.poster}
            caption={heroVideo.caption}
            className="w-full aspect-video min-h-[300px]"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroVideoSection;
