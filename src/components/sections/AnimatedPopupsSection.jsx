import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import { Mail, Heart, Sparkles, X, Sun, Moon, Smile } from 'lucide-react';
import { triggerConfetti } from '../common/Confetti';

const POPUP_NOTES = [
  {
    id: 1,
    icon: Sun,
    title: "Open When You Smile ☀️",
    badge: "For Your Morning",
    message: "Your smile outshines the sun Annuva. Never stop smiling because it brings pure warmth into my life every single day."
  },
  {
    id: 2,
    icon: Moon,
    title: "Open When You Miss Me 🌌",
    badge: "For Quiet Evenings",
    message: "Whenever you miss me, close your eyes and remember that I am holding your hand in spirit. You are always in my heart."
  },
  {
    id: 3,
    icon: Heart,
    title: "Open When You Need A Hug 🤗",
    badge: "Warm Embrace",
    message: "Consider this an official voucher for 1,000 warm tight hugs! I will always be right here by your side."
  },
  {
    id: 4,
    icon: Sparkles,
    title: "Open On Your Birthday 🎂",
    badge: "Special Celebration",
    message: `Happy Birthday my sweet Annuva! Celebrating 1 year & 3 months with you has been the best part of my life.`
  }
];

export const AnimatedPopupsSection = () => {
  const [activePopup, setActivePopup] = useState(null);

  const handleOpenPopup = (popup) => {
    setActivePopup(popup);
    triggerConfetti({ particleCount: 30, spread: 50 });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 text-center">
      <div className="space-y-2">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Interactive Surprise Pop-ups</span>
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
          Open When... Letters ✉️❤️
        </h2>
        <p className="text-slate-300 text-xs md:text-sm">
          Tap on any letter envelope below to pop open a special message for Annuva!
        </p>
      </div>

      {/* Pop-up Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {POPUP_NOTES.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleOpenPopup(item)}
              className="glass-panel p-6 rounded-3xl border border-rose-500/30 bg-gradient-to-br from-black/70 via-rose-950/30 to-black/70 cursor-pointer text-left space-y-3 shadow-xl relative overflow-hidden group hover:border-rose-500/60 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                  {item.badge}
                </span>
                <div className="p-2 rounded-full bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white font-serif group-hover:text-rose-300 transition-colors">
                {item.title}
              </h3>

              <div className="flex items-center gap-1.5 text-xs text-rose-300 font-medium pt-1">
                <Mail className="w-3.5 h-3.5" />
                <span>Tap to pop open →</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Animated Full Pop-up Modal */}
      <AnimatePresence>
        {activePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePopup(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full glass-panel p-8 rounded-3xl border border-rose-500/50 bg-slate-950 text-center space-y-5 shadow-2xl"
            >
              <button
                onClick={() => setActivePopup(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-4 rounded-full bg-rose-500/20 text-rose-400 w-14 h-14 mx-auto flex items-center justify-center border border-rose-500/40 animate-pulse">
                <Heart className="w-7 h-7 fill-rose-500 text-rose-500" />
              </div>

              <h3 className="text-xl font-bold text-white font-serif">
                {activePopup.title}
              </h3>

              <p className="text-rose-100 text-base leading-relaxed italic font-serif bg-gradient-to-br from-rose-950/60 to-purple-950/60 p-5 rounded-2xl border border-rose-500/30">
                "{activePopup.message}"
              </p>

              <div className="text-xs font-mono text-rose-300/80">
                With all my love, Aditya ❤️
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedPopupsSection;
