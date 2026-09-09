import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Gift, Heart, RotateCcw } from 'lucide-react';
import { triggerConfetti } from '../common/Confetti';

const PRIZES = [
  "Unlimited Cuddles & Hugs 🤗",
  "A Candlelight Dinner Date 🕯️",
  "Your Favorite Dessert 🍰",
  "A Cozy Movie Night 🍿",
  "A Full Body Massage 💆‍♀️",
  "One Shopping Spree Treat 🛍️",
  "Weekend Getaway Trip 🏖️",
  "Your Special Wish Granted ✨"
];

export const SpinWheelGame = () => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedPrize(null);

    const randomIndex = Math.floor(Math.random() * PRIZES.length);
    const extraRounds = 5 * 360; // 5 full spins
    const segmentAngle = 360 / PRIZES.length;
    const targetDegree = extraRounds + (360 - randomIndex * segmentAngle);

    setRotation((prev) => prev + targetDegree);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedPrize(PRIZES[randomIndex]);
      triggerConfetti({ particleCount: 80, spread: 70 });
    }, 4000);
  };

  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#120822] to-[#07050d] text-center overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Mini-Game #2</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            Wheel of Surprises 🎡
          </h2>
          <p className="text-slate-300 text-xs md:text-sm">
            Spin the wheel to claim your official birthday reward!
          </p>
        </div>

        {/* Wheel & Pointer Container */}
        <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto flex items-center justify-center">
          {/* Pointer */}
          <div className="absolute -top-3 z-30 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-rose-500 filter drop-shadow-[0_0_10px_rgba(244,63,94,0.9)]" />

          {/* Spin Wheel Disk */}
          <div
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none'
            }}
            className="w-full h-full rounded-full border-4 border-rose-500/40 bg-gradient-to-tr from-purple-950 via-rose-950 to-slate-950 shadow-2xl relative overflow-hidden flex items-center justify-center"
          >
            {PRIZES.map((prize, idx) => {
              const angle = (360 / PRIZES.length) * idx;
              return (
                <div
                  key={idx}
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '50% 50%'
                  }}
                  className="absolute inset-0 flex items-start justify-center pt-4"
                >
                  <span className="text-[10px] md:text-xs font-semibold text-rose-100 max-w-[80px] text-center leading-tight font-serif">
                    {prize}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Center Spin Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="absolute z-20 w-20 h-20 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs uppercase tracking-wider shadow-2xl shadow-rose-950 border-2 border-white/40 flex flex-col items-center justify-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            <Gift className="w-5 h-5 fill-white" />
            <span>SPIN</span>
          </button>
        </div>

        {/* Prize Reveal Modal */}
        <AnimatePresence>
          {selectedPrize && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="glass-panel p-8 rounded-3xl border border-rose-500/50 bg-slate-950 max-w-md mx-auto space-y-4 shadow-2xl text-center"
            >
              <Heart className="w-10 h-10 text-rose-500 fill-rose-500 mx-auto animate-bounce" />
              <h3 className="text-2xl font-bold text-white font-serif">
                You Won:
              </h3>
              <p className="text-rose-100 font-serif text-lg font-bold border-y border-rose-500/30 py-3">
                "{selectedPrize}"
              </p>
              <p className="text-xs text-slate-300 italic">
                (Valid anytime you want! Redeem with me ❤️)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default SpinWheelGame;
