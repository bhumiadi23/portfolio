import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExperience } from '../../context/ExperienceContext';
import { Heart } from 'lucide-react';

export const ToastNotification = () => {
  const { toastMessage } = useExperience();

  if (!toastMessage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-black/80 backdrop-blur-xl border border-rose-500/40 px-5 py-3 rounded-full shadow-2xl text-white text-xs md:text-sm font-medium shadow-rose-950/80 pointer-events-none"
      >
        <div className="p-1.5 rounded-full bg-rose-500/20 text-rose-400">
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
        </div>
        <span>{toastMessage}</span>
      </motion.div>
    </AnimatePresence>
  );
};

export default ToastNotification;
