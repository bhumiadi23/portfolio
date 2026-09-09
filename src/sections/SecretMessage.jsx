import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../data/siteConfig';
import confetti from 'canvas-confetti';

export default function SecretMessage() {
  const [code, setCode] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');
  const cfg = siteConfig.secretLock;

  const tryUnlock = e => {
    e.preventDefault();
    if (code.trim().toLowerCase() === cfg.passcode.toLowerCase()) {
      setUnlocked(true);
      setError('');
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 }, colors: ['#C2185B', '#F8BBD9', '#C9A84C', '#fff'] });
    } else {
      setError(cfg.invalidMessage);
      setTimeout(() => setError(''), 2500);
    }
  };

  return (
    <div className="relative py-20 px-6 flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #3E0020 0%, #6B1A2A 100%)' }}>

      <div className="max-w-sm w-full mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.3em] font-ui mb-3 text-[#F8BBD9]/50">
            secret vault
          </p>
          <h2 className="font-serif text-white mb-2" style={{ fontSize: 'clamp(1.8rem, 6vw, 2.8rem)' }}>
            There's a secret here.
          </h2>
          <p className="text-sm font-ui text-[#F8BBD9]/60">
            Only you can unlock it.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!unlocked ? (
            <motion.form key="form" onSubmit={tryUnlock}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-3xl p-6 border border-white/10 space-y-4"
              style={{ background: 'rgba(253,251,247,0.07)', backdropFilter: 'blur(20px)' }}>
              <div className="text-center text-4xl">🔒</div>
              <p className="text-center text-xs font-ui text-[#F8BBD9]/50">{cfg.hint}</p>
              <input type="text" value={code} onChange={e => setCode(e.target.value)}
                placeholder="Enter code..."
                className="w-full rounded-2xl px-5 py-3 text-center font-ui tracking-widest text-lg border border-white/15 focus:outline-none focus:border-[#C2185B]"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#FDFBF7' }}
                autoComplete="off" />
              <AnimatePresence>
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-center text-xs font-ui text-[#F8BBD9]/70">{error}</motion.p>
                )}
              </AnimatePresence>
              <button type="submit"
                className="w-full py-3 rounded-2xl text-white font-semibold font-ui text-sm shadow-lg"
                style={{ background: 'linear-gradient(135deg, #C2185B, #880E4F)' }}>
                Unlock 🔓
              </button>
            </motion.form>
          ) : (
            <motion.div key="unlocked"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl p-8 border border-[#C2185B]/30 text-center space-y-4"
              style={{ background: 'rgba(253,251,247,0.1)', backdropFilter: 'blur(20px)' }}>
              <div className="text-4xl animate-heartbeat">🔓</div>
              <h3 className="font-serif text-xl text-white">Unlocked ❤️</h3>
              <p className="font-cormorant italic text-lg leading-relaxed text-[#F8BBD9]">
                "{cfg.unlockedMessage}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
