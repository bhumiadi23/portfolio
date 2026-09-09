import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import { Mail, MailOpen } from 'lucide-react';
import { triggerConfetti } from '../common/Confetti';

export const FutureLetterSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const letter = siteConfig.futureLetter || {};

  const handleOpen = () => {
    setIsOpen(true);
    triggerConfetti({ particleCount: 50, spread: 60 });
  };

  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#160824] to-[#07050d]">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <Mail className="w-3.5 h-3.5 text-rose-400" />
            <span>Time Capsule</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            {letter.title || "A Letter From Us, In The Future"}
          </h2>
        </div>

        {!isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            onClick={handleOpen}
            className="glass-panel p-12 rounded-3xl border border-rose-500/30 bg-black/50 hover:border-rose-500/60 cursor-pointer shadow-2xl transition-all flex flex-col items-center space-y-4 group"
          >
            <div className="p-6 rounded-full bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
              <Mail className="w-12 h-12" />
            </div>
            <span className="text-sm font-semibold text-rose-200">
              Click to Open Envelope ✉️
            </span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 md:p-12 rounded-3xl border border-rose-500/40 bg-[#0f0a17] text-left shadow-2xl space-y-6 relative"
          >
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-4">
              <span className="text-xs font-mono text-rose-400 uppercase tracking-widest">
                Confidential & Eternal
              </span>
              <MailOpen className="w-5 h-5 text-rose-400" />
            </div>

            <div className="whitespace-pre-line text-rose-100 text-sm md:text-base leading-relaxed font-serif">
              {letter.content}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FutureLetterSection;
