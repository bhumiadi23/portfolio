import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import HiddenHeart from '../common/HiddenHeart';

export const NameRevealSection = () => {
  const letters = Array.from(siteConfig.girlfriendName || "My Love");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.6
      }
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(10px)', scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }
    }
  };

  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-20 bg-gradient-to-b from-[#07050d] via-[#10071c] to-[#07050d] overflow-hidden">
      {/* Hidden Heart #1 */}
      <div className="absolute top-10 right-10">
        <HiddenHeart index={1} />
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-lg md:text-2xl text-slate-300 font-light italic"
        >
          Today isn't just another day...
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-base md:text-xl text-rose-300/80 font-medium tracking-wide"
        >
          because someone truly extraordinary was born.
        </motion.p>

        {/* Big Glow Letter-by-Letter Reveal */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="pt-6 flex flex-wrap justify-center items-center gap-1 md:gap-3"
        >
          {letters.map((char, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="text-5xl md:text-8xl font-extrabold tracking-tight bg-gradient-to-b from-amber-200 via-rose-300 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(244,63,94,0.6)] font-serif"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 1.2 }}
          className="w-32 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent mx-auto rounded-full"
        />
      </div>
    </section>
  );
};

export default NameRevealSection;
