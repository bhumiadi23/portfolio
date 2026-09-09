import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Trophy, RotateCcw, Star, Gift, Crown, Flame } from 'lucide-react';
import { triggerConfetti } from '../common/Confetti';

const CARD_ICONS = [
  { id: 'heart', icon: Heart, label: 'Pure Love' },
  { id: 'sparkles', icon: Sparkles, label: 'Magic' },
  { id: 'star', icon: Star, label: 'My Star' },
  { id: 'gift', icon: Gift, label: 'Surprise' },
  { id: 'crown', icon: Crown, label: 'My Queen' },
  { id: 'flame', icon: Flame, label: 'Passion' },
];

export const MemoryMatchGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initializeGame = () => {
    const deck = [...CARD_ICONS, ...CARD_ICONS]
      .map((item, index) => ({
        uniqueId: index,
        ...item
      }))
      .sort(() => Math.random() - 0.5);
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setIsWon(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].id === cards[secondIdx].id) {
        const newMatched = [...matched, firstIdx, secondIdx];
        setMatched(newMatched);
        setFlipped([]);
        triggerConfetti({ particleCount: 30, spread: 50 });

        if (newMatched.length === cards.length) {
          setIsWon(true);
          triggerConfetti({ particleCount: 100, spread: 90 });
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#160621] to-[#07050d] text-center overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Mini-Game #1</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            Love Memory Match 🧩
          </h2>
          <p className="text-slate-300 text-xs md:text-sm">
            Flip cards to find matching pairs of love icons! Moves: <span className="font-mono text-rose-400 font-bold">{moves}</span>
          </p>
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {cards.map((card, idx) => {
            const isFlipped = flipped.includes(idx) || matched.includes(idx);
            const Icon = card.icon;

            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCardClick(idx)}
                className="h-28 cursor-pointer perspective-1000"
              >
                <div
                  className={`relative w-full h-full rounded-2xl transition-transform duration-500 transform-style-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Card Front (Hidden State) */}
                  <div className="absolute inset-0 glass-panel border border-rose-500/30 bg-black/60 rounded-2xl flex flex-col items-center justify-center space-y-1 backface-hidden shadow-xl">
                    <Heart className="w-6 h-6 text-rose-500/50 fill-rose-500/20" />
                    <span className="text-[10px] text-rose-300/60 font-mono">Flip</span>
                  </div>

                  {/* Card Back (Revealed State) */}
                  <div className="absolute inset-0 glass-panel border border-rose-500/50 bg-gradient-to-br from-rose-950 to-purple-950 rounded-2xl flex flex-col items-center justify-center space-y-2 rotate-y-180 backface-hidden shadow-2xl">
                    <Icon className="w-8 h-8 text-rose-300 animate-bounce" />
                    <span className="text-xs font-semibold text-rose-100">{card.label}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Game Won Modal */}
        <AnimatePresence>
          {isWon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="glass-panel p-8 rounded-3xl border border-rose-500/50 bg-slate-950 max-w-md mx-auto space-y-4 shadow-2xl text-center"
            >
              <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
              <h3 className="text-2xl font-bold text-white font-serif">
                You Won The Memory Game! 🎉
              </h3>
              <p className="text-rose-200 text-sm italic font-serif">
                "You matched every single memory in just {moves} moves! You hold the key to my whole heart."
              </p>
              <button
                onClick={initializeGame}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-600 text-white font-semibold text-xs tracking-wider uppercase hover:bg-rose-500 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again ↻</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default MemoryMatchGame;
