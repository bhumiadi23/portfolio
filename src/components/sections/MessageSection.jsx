import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import { Heart, MessageCircleHeart } from 'lucide-react';
import HiddenHeart from '../common/HiddenHeart';

export const MessageSection = () => {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = siteConfig.mainMessage || "Happy Birthday, my love!";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 35);

    return () => clearInterval(timer);
  }, [fullText]);

  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#160a22] to-[#07050d] text-center overflow-hidden">
      {/* Hidden Heart #3 */}
      <div className="absolute bottom-6 right-8">
        <HiddenHeart index={3} />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-medium mb-8"
        >
          <MessageCircleHeart className="w-4 h-4 text-rose-400" />
          <span>A Note From My Heart</span>
        </motion.div>

        <div className="glass-panel border border-rose-500/20 bg-black/40 p-8 md:p-12 rounded-3xl shadow-2xl relative">
          <div className="absolute top-4 left-4 opacity-15">
            <Heart className="w-16 h-16 text-rose-500 fill-rose-500" />
          </div>

          <p className="text-xl md:text-3xl text-rose-100 font-serif leading-relaxed min-h-[140px] text-left md:text-center">
            {displayedText}
            <span className="inline-block w-1 h-6 bg-rose-400 ml-1 animate-pulse" />
          </p>

          <div className="mt-8 text-right text-sm italic text-rose-300/80 font-medium">
            — With all my love, {siteConfig.yourName} ❤️
          </div>
        </div>
      </div>
    </section>
  );
};

export default MessageSection;
