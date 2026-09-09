import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../data/siteConfig';
import confetti from 'canvas-confetti';

export default function RandomLoveGenerator() {
  const [msg, setMsg] = useState(null);
  const [key, setKey] = useState(0);

  const generate = () => {
    const msgs = siteConfig.randomMessages;
    const next = msgs[Math.floor(Math.random() * msgs.length)];
    setMsg(next);
    setKey(k => k + 1);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 }, colors: ['#C2185B', '#F8BBD9', '#C9A84C'] });
  };

  return (
    <div className="relative py-20 px-6 flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #F5EFE6 0%, #FDFBF7 100%)' }}>

      <div className="max-w-md w-full mx-auto text-center">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.3em] font-ui mb-3" style={{ color: 'rgba(194,24,91,0.6)' }}>
          random love generator
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-serif mb-8" style={{ fontSize: 'clamp(1.8rem, 6vw, 2.8rem)', color: '#1A0A0F' }}>
          Need a reminder?
        </motion.h2>

        <AnimatePresence mode="wait">
          {msg && (
            <motion.div key={key}
              initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 p-6 rounded-3xl border border-[#C2185B]/20 shadow-lg"
              style={{ background: 'linear-gradient(135deg, rgba(194,24,91,0.05), rgba(62,0,32,0.04))' }}>
              <p className="font-serif text-lg md:text-xl leading-relaxed" style={{ color: '#1A0A0F' }}>
                "{msg}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={generate}
          className="px-8 py-4 rounded-full text-white font-semibold font-ui text-sm shadow-xl animate-glow"
          style={{ background: 'linear-gradient(135deg, #C2185B, #880E4F)' }}>
          Tell me something ❤️
        </motion.button>
      </div>
    </div>
  );
}
