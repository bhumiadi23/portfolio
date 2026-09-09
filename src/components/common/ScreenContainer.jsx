import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Heart, Grid } from 'lucide-react';

const CHAPTER_NAMES = [
  "1. Reveal & Countdown",
  "2. Love Quiz & Trivia",
  "3. Wheel of Surprises",
  "4. Starlight Constellation",
  "5. Pop Birthday Balloons",
  "6. Love Memory Match",
  "7. Love Notes & Scratch Card",
  "8. Secret Passcode Lock",
  "9. Cake & Blow Candles 🎂",
  "10. Letter & Grand Finale ❤️"
];

export const ScreenContainer = ({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onPrev, 
  onJumpToStep,
  children,
  showNextButton = true,
  nextButtonText = "Next Chapter ❤️" 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center py-4 px-4 text-center overflow-x-hidden">
      {/* Top Header Progress Ticker & Direct Jump Menu */}
      <div className="w-full max-w-2xl flex items-center justify-between z-30 px-2 py-2">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 bg-black/70 backdrop-blur-xl px-3 py-1.5 rounded-full border border-rose-500/30 text-rose-200 text-xs font-mono font-semibold shadow-lg hover:border-rose-500 transition-colors"
        >
          <Grid className="w-3.5 h-3.5 text-rose-400" />
          <span>Chapter {currentStep} of {totalSteps}</span>
        </button>

        {/* Level Menu Popup */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-14 left-4 z-40 bg-slate-950/95 backdrop-blur-2xl border border-rose-500/40 p-3 rounded-2xl shadow-2xl text-left space-y-1 min-w-[220px]"
            >
              <div className="text-[10px] uppercase font-mono tracking-widest text-slate-400 px-2 pb-1 border-b border-white/10">
                Jump to Chapter
              </div>
              {CHAPTER_NAMES.map((name, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (onJumpToStep) onJumpToStep(idx + 1);
                    setShowMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    currentStep === idx + 1
                      ? 'bg-rose-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-rose-500/20'
                  }`}
                >
                  {name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <button
              key={i}
              onClick={() => onJumpToStep && onJumpToStep(i + 1)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i + 1 === currentStep
                  ? 'w-5 bg-rose-500'
                  : i + 1 < currentStep
                  ? 'w-2 bg-rose-500/50'
                  : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Interactive Screen Area */}
      <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center my-2 z-10 overflow-y-auto max-h-[calc(100vh-130px)] px-2 no-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 1.02 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Control Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between z-30 px-2 pt-2">
        {currentStep > 1 ? (
          <button
            onClick={onPrev}
            className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 transition-colors shadow-lg active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 text-rose-400" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {showNextButton && currentStep < totalSteps && (
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(244,63,94,0.7)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white font-bold text-xs md:text-sm px-6 py-2.5 rounded-full shadow-2xl shadow-rose-950 border border-rose-400/50 cursor-pointer"
          >
            <span>{nextButtonText}</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ScreenContainer;
