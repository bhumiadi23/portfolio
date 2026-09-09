import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Trophy } from 'lucide-react';
import { triggerConfetti } from '../common/Confetti';

const INITIAL_BALLOONS = [
  { id: 1, color: 'from-rose-500 to-pink-600', text: 'Love ❤️', speed: 4, left: 15 },
  { id: 2, color: 'from-purple-500 to-indigo-600', text: 'Joy ✨', speed: 5, left: 35 },
  { id: 3, color: 'from-amber-400 to-orange-500', text: 'Smile 😊', speed: 3.5, left: 55 },
  { id: 4, color: 'from-pink-500 to-rose-600', text: 'Magic 🌟', speed: 4.5, left: 75 },
];

export const PopBalloonsGame = () => {
  const [poppedCount, setPoppedCount] = useState(0);
  const [poppedIds, setPoppedIds] = useState([]);

  const handlePop = (id) => {
    if (poppedIds.includes(id)) return;

    setPoppedIds((prev) => [...prev, id]);
    const nextCount = poppedCount + 1;
    setPoppedCount(nextCount);
    triggerConfetti({ particleCount: 25, spread: 50 });
  };

  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#10071c] to-[#07050d] text-center overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Mini-Game #3</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            Pop The Birthday Balloons 🎈
          </h2>
          <p className="text-slate-300 text-xs md:text-sm">
            Tap the floating balloons to pop them and collect love points! Popped: <span className="font-mono text-rose-400 font-bold">{poppedCount}</span>
          </p>
        </div>

        {/* Balloon Canvas Box */}
        <div className="relative h-80 rounded-3xl border border-rose-500/30 bg-black/60 shadow-2xl overflow-hidden backdrop-blur-md">
          {INITIAL_BALLOONS.map((b) => {
            if (poppedIds.includes(b.id)) return null;

            return (
              <motion.div
                key={b.id}
                initial={{ y: 280 }}
                animate={{ y: [-20, 280] }}
                transition={{ repeat: Infinity, duration: b.speed, ease: 'linear' }}
                onClick={() => handlePop(b.id)}
                style={{ left: `${b.left}%` }}
                className={`absolute cursor-pointer w-16 h-20 md:w-20 md:h-24 rounded-full bg-gradient-to-t ${b.color} shadow-2xl flex flex-col items-center justify-center text-white font-bold text-xs border border-white/30 transform -translate-x-1/2 hover:scale-110 active:scale-90 transition-transform`}
              >
                <Heart className="w-4 h-4 fill-white mb-1" />
                <span>{b.text}</span>
                {/* String */}
                <div className="absolute -bottom-4 w-0.5 h-4 bg-white/40" />
              </motion.div>
            );
          })}

          {poppedIds.length === INITIAL_BALLOONS.length && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-3"
            >
              <Sparkles className="w-10 h-10 text-amber-300 animate-bounce" />
              <h3 className="text-2xl font-bold text-white font-serif">
                All Balloons Popped! 🎉
              </h3>
              <p className="text-rose-200 text-sm italic font-serif">
                "Every balloon popped carries a warm birthday kiss for you ❤️"
              </p>
              <button
                onClick={() => setPoppedIds([])}
                className="text-xs text-rose-400 font-mono underline"
              >
                Reset Balloons ↻
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PopBalloonsGame;
