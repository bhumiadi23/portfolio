import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../data/siteConfig';

export default function FutureLetter() {
  const [opened, setOpened] = useState(false);
  const letter = siteConfig.futureLetter;

  return (
    <div className="relative py-20 px-6 flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #FDFBF7 0%, #F5EFE6 100%)' }}>

      <div className="max-w-lg w-full mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] font-ui mb-3" style={{ color: 'rgba(194,24,91,0.6)' }}>
            a letter
          </p>
          <h2 className="font-serif mb-2" style={{ fontSize: 'clamp(1.8rem, 6vw, 2.8rem)', color: '#1A0A0F' }}>
            {letter.title}
          </h2>
        </motion.div>

        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.div key="envelope"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-6">
              {/* Envelope SVG */}
              <motion.div whileHover={{ y: -4 }} className="cursor-pointer" onClick={() => setOpened(true)}>
                <svg width="200" height="140" viewBox="0 0 200 140" fill="none">
                  {/* Envelope body */}
                  <rect x="5" y="30" width="190" height="105" rx="8" fill="#F5EFE6" stroke="#C2185B" strokeWidth="1.5" strokeOpacity="0.3" />
                  {/* Flap closed */}
                  <motion.path d="M5 30 L100 85 L195 30" fill="#FDFBF7" stroke="#C2185B" strokeWidth="1.5" strokeOpacity="0.3" />
                  {/* Bottom fold lines */}
                  <path d="M5 135 L70 80" stroke="#C2185B" strokeWidth="1" strokeOpacity="0.2" />
                  <path d="M195 135 L130 80" stroke="#C2185B" strokeWidth="1" strokeOpacity="0.2" />
                  {/* Wax seal */}
                  <circle cx="100" cy="85" r="14" fill="#C2185B" opacity="0.9" />
                  <text x="100" y="90" textAnchor="middle" fill="white" fontSize="14">❤</text>
                </svg>
              </motion.div>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setOpened(true)}
                className="px-8 py-3 rounded-full text-white font-semibold font-ui text-sm shadow-lg"
                style={{ background: 'linear-gradient(135deg, #C2185B, #880E4F)' }}>
                Open ✉️
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="letter"
              initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.8 }}
              className="rounded-3xl p-8 md:p-10 shadow-2xl border border-[#C2185B]/15"
              style={{ background: '#FDFBF7', backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(194,24,91,0.06) 27px, rgba(194,24,91,0.06) 28px)' }}>
              <pre className="font-cormorant text-base md:text-lg leading-relaxed whitespace-pre-wrap"
                style={{ color: '#1A0A0F', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                {letter.content}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
