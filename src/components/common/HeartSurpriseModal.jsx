import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExperience } from '../../context/ExperienceContext';
import { Heart, Sparkles, X, Trophy } from 'lucide-react';
import { triggerCelebrationFireworks } from './Confetti';

export const HeartSurpriseModal = () => {
  const { showHeartSurpriseModal, setShowHeartSurpriseModal } = useExperience();

  if (!showHeartSurpriseModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowHeartSurpriseModal(false)}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-md w-full glass-panel p-8 rounded-3xl border border-rose-500/50 bg-slate-950 text-center space-y-6 shadow-2xl"
        >
          <button
            onClick={() => setShowHeartSurpriseModal(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-4 rounded-full bg-rose-500/20 text-rose-400 w-16 h-16 mx-auto flex items-center justify-center border border-rose-500/40 animate-bounce">
            <Trophy className="w-8 h-8 text-amber-300" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold text-rose-300 uppercase tracking-widest">
              Ultimate Secret Unlocked (10/10 Hearts)
            </span>
            <h3 className="text-2xl font-bold text-white font-serif">
              You Found Every Hidden Heart! ❤️
            </h3>
          </div>

          <p className="text-rose-100 text-sm italic font-serif leading-relaxed">
            "You explored every tiny corner of this little world made just for you. You win my whole heart forever and ever."
          </p>

          <button
            onClick={() => {
              triggerCelebrationFireworks();
              setShowHeartSurpriseModal(false);
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold text-sm shadow-xl shadow-rose-950/80 hover:opacity-90 active:scale-98 transition-all"
          >
            Claim Your Reward Fireworks 🎆
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HeartSurpriseModal;
