import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import { Lock, Unlock, KeyRound, AlertCircle } from 'lucide-react';
import { triggerConfetti } from '../common/Confetti';
import HiddenHeart from '../common/HiddenHeart';

export const SecretLockSection = () => {
  const [inputCode, setInputCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const secretConfig = siteConfig.secretLock || {};

  const handleUnlock = (e) => {
    e.preventDefault();
    if (inputCode.trim() === secretConfig.passcode) {
      setIsUnlocked(true);
      setErrorMsg('');
      triggerConfetti({ particleCount: 80, spread: 70 });
    } else {
      setErrorMsg(secretConfig.invalidMessage || "Incorrect code, try again!");
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  return (
    <section className="relative py-20 px-6 bg-gradient-to-b from-[#07050d] via-[#140a22] to-[#07050d] text-center">
      {/* Hidden Heart #9 */}
      <div className="absolute bottom-6 right-10">
        <HiddenHeart index={9} />
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <KeyRound className="w-3.5 h-3.5 text-rose-400" />
            <span>Private Vault</span>
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-serif">
            Only You Can Unlock This
          </h2>
          <p className="text-slate-400 text-xs md:text-sm">
            {secretConfig.hint || "Enter our secret code..."}
          </p>
        </div>

        {!isUnlocked ? (
          <form onSubmit={handleUnlock} className="glass-panel p-8 rounded-3xl border border-rose-500/30 bg-black/50 space-y-6 shadow-2xl">
            <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 w-14 h-14 mx-auto flex items-center justify-center border border-rose-500/30">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Enter secret code..."
                className="w-full bg-slate-900/80 border border-rose-500/30 rounded-2xl px-5 py-3 text-center text-rose-100 placeholder-slate-500 font-mono tracking-widest text-lg focus:outline-none focus:border-rose-500 transition-colors"
              />
              {errorMsg && (
                <p className="text-xs text-rose-400 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold text-sm shadow-xl shadow-rose-950/80 hover:opacity-90 active:scale-98 transition-all"
            >
              Unlock Secret Message 🔓
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 rounded-3xl border border-rose-500/40 bg-gradient-to-br from-rose-950/60 to-purple-950/60 space-y-4 shadow-2xl text-left"
          >
            <div className="flex items-center gap-3 text-rose-300">
              <Unlock className="w-6 h-6" />
              <h3 className="text-xl font-bold font-serif">Vault Unlocked! ❤️</h3>
            </div>
            <p className="text-rose-100 text-sm leading-relaxed italic font-serif">
              "{secretConfig.unlockedMessage}"
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default SecretLockSection;
