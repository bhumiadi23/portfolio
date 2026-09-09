import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Stars, Sparkles, Heart } from 'lucide-react';
import { triggerCelebrationFireworks, triggerConfetti } from '../common/Confetti';

const STARS = [
  { id: 1, x: 20, y: 30, label: 'Star 1' },
  { id: 2, x: 40, y: 20, label: 'Star 2' },
  { id: 3, x: 60, y: 30, label: 'Star 3' },
  { id: 4, x: 75, y: 55, label: 'Star 4' },
  { id: 5, x: 50, y: 80, label: 'Star 5' },
  { id: 6, x: 25, y: 55, label: 'Star 6' },
];

export const ConstellationCanvas = () => {
  const [connectedIds, setConnectedIds] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleStarClick = (id) => {
    if (connectedIds.includes(id)) return;

    const updated = [...connectedIds, id];
    setConnectedIds(updated);
    triggerConfetti({ particleCount: 15, spread: 30 });

    if (updated.length === STARS.length) {
      setIsCompleted(true);
      triggerCelebrationFireworks();
    }
  };

  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#10071c] to-[#07050d] text-center overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <Stars className="w-3.5 h-3.5 text-amber-300" />
            <span>Interactive Starlight Canvas</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            Connect The Constellation 🌌✨
          </h2>
          <p className="text-slate-300 text-xs md:text-sm">
            Tap the glowing stars one by one to reveal our secret heart constellation in the night sky!
          </p>
        </div>

        {/* Starlight Box */}
        <div className="relative h-96 rounded-3xl border border-rose-500/30 bg-slate-950 shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Subtle star background */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

          {/* SVG Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connectedIds.map((id, index) => {
              if (index === 0) return null;
              const prevStar = STARS.find((s) => s.id === connectedIds[index - 1]);
              const currStar = STARS.find((s) => s.id === id);
              if (!prevStar || !currStar) return null;

              return (
                <line
                  key={index}
                  x1={`${prevStar.x}%`}
                  y1={`${prevStar.y}%`}
                  x2={`${currStar.x}%`}
                  y2={`${currStar.y}%`}
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
              );
            })}
          </svg>

          {/* Glowing Stars */}
          {STARS.map((star) => {
            const isConnected = connectedIds.includes(star.id);

            return (
              <button
                key={star.id}
                onClick={() => handleStarClick(star.id)}
                style={{ left: `${star.x}%`, top: `${star.y}%` }}
                className={`absolute p-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  isConnected
                    ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,1)] scale-125'
                    : 'bg-amber-400/20 text-amber-300 border border-amber-400/50 animate-pulse hover:scale-125'
                }`}
              >
                <Sparkles className="w-5 h-5 fill-current" />
              </button>
            );
          })}

          {/* Completion Overlay */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-3"
            >
              <Heart className="w-12 h-12 text-rose-500 fill-rose-500 animate-bounce" />
              <h3 className="text-2xl font-bold text-white font-serif">
                Heart Constellation Revealed! ❤️
              </h3>
              <p className="text-rose-200 text-sm italic font-serif">
                "Even among billions of stars in the cosmos, our hearts align perfectly."
              </p>
              <button
                onClick={() => {
                  setConnectedIds([]);
                  setIsCompleted(false);
                }}
                className="text-xs text-rose-400 font-mono underline"
              >
                Draw Constellation Again ↻
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ConstellationCanvas;
