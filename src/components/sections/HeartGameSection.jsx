import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trophy, Sparkles } from 'lucide-react';
import { triggerConfetti } from '../common/Confetti';

export const HeartGameSection = () => {
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState([
    { id: 1, x: 20, y: 30 },
    { id: 2, x: 70, y: 25 },
    { id: 3, x: 45, y: 60 }
  ]);
  const [unlocked, setUnlocked] = useState(false);

  const handleHeartClick = (id, e) => {
    e.stopPropagation();
    const newScore = score + 1;
    setScore(newScore);
    triggerConfetti({ particleCount: 20, spread: 40 });

    // Remove clicked heart and generate new position
    setHearts((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              id: Math.random(),
              x: Math.floor(Math.random() * 80) + 10,
              y: Math.floor(Math.random() * 70) + 15
            }
          : h
      )
    );

    if (newScore >= 10 && !unlocked) {
      setUnlocked(true);
      triggerConfetti({ particleCount: 100, spread: 90 });
    }
  };

  return (
    <section className="relative py-20 px-6 bg-gradient-to-b from-[#07050d] via-[#160621] to-[#07050d] text-center overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Mini Game</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            Catch My Love
          </h2>
          <p className="text-slate-400 text-sm">
            Tap the floating hearts to gather love points! Goal: 10 points 💕
          </p>
        </div>

        {/* Game Box */}
        <div className="relative h-80 rounded-3xl border border-rose-500/30 bg-black/60 shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Score Counter */}
          <div className="absolute top-4 left-6 z-20 flex items-center gap-2 bg-rose-950/60 px-4 py-1.5 rounded-full border border-rose-500/30">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span className="text-xs font-mono font-bold text-rose-200">
              Love Score: {score} / 10
            </span>
          </div>

          {/* Floating Target Hearts */}
          {hearts.map((h) => (
            <motion.button
              key={h.id}
              onClick={(e) => handleHeartClick(h.id, e)}
              animate={{ y: [0, -15, 0], scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2 + Math.random(), ease: 'easeInOut' }}
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              className="absolute p-3 rounded-full bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 border border-rose-500/40 shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
            >
              <Heart className="w-7 h-7 fill-rose-500 text-rose-500" />
            </motion.button>
          ))}

          {/* Unlocked Secret Message */}
          <AnimatePresence>
            {unlocked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4"
              >
                <div className="p-4 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-bounce">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white font-serif">
                  You Found All My Love! ❤️
                </h3>
                <p className="text-rose-200 text-sm md:text-base max-w-md italic">
                  "No matter how many hearts appear, every single one belongs exclusively to you."
                </p>
                <button
                  onClick={() => setScore(0)}
                  className="text-xs text-rose-400 underline font-mono"
                >
                  Play Again ↻
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default HeartGameSection;
