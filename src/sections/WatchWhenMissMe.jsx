import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPlayer from '../components/VideoPlayer';
import { siteConfig } from '../data/siteConfig';

export default function WatchWhenMissMe() {
  const [opened, setOpened] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <div className="relative py-20 px-6 flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #F5EFE6 0%, #FDFBF7 100%)' }}>

      <div className="max-w-md w-full mx-auto">
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.div key="card"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-3xl p-10 text-center border border-[#C2185B]/20 shadow-xl"
              style={{ background: 'linear-gradient(135deg, rgba(62,0,32,0.04), rgba(194,24,91,0.06))' }}>
              <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-6">🎬</motion.div>
              <p className="text-xs uppercase tracking-[0.25em] font-ui mb-3" style={{ color: 'rgba(194,24,91,0.6)' }}>
                for when you need it
              </p>
              <h3 className="font-serif text-2xl md:text-3xl mb-3" style={{ color: '#1A0A0F' }}>
                Don't open this unless you miss me.
              </h3>
              <p className="text-sm font-ui mb-8" style={{ color: 'rgba(26,10,15,0.5)' }}>
                (You probably already do. 😏)
              </p>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setOpened(true)}
                className="px-8 py-3 rounded-full text-white font-semibold font-ui text-sm shadow-lg"
                style={{ background: 'linear-gradient(135deg, #C2185B, #880E4F)' }}>
                Open it
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="video"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <VideoPlayer src={siteConfig.missMeVideo} poster={siteConfig.photos?.[0]?.src}
                title="For when you miss me" caption="Dekh le. Main hoon na. ❤️"
                onEnded={() => setDone(true)} />
              <AnimatePresence>
                {done && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 text-center">
                    <p className="font-serif text-xl text-[#1A0A0F]">See?</p>
                    <p className="font-cormorant italic text-lg mt-1" style={{ color: '#C2185B' }}>
                      Distance doesn't change how much you mean to me.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
