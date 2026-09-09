import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle2, XCircle, Trophy, RotateCcw, Heart } from 'lucide-react';
import { triggerConfetti, triggerCelebrationFireworks } from '../common/Confetti';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Where did we first realize how special our connection was?",
    options: ["On our late night coffee talk", "During our first road trip", "The moment our eyes met", "Over our favorite meal"],
    correctIndex: 0,
    explanation: "Correct! We talked for hours until time completely stood still. ❤️"
  },
  {
    id: 2,
    question: "What is my absolute favorite thing about your smile?",
    options: ["How it lights up the whole room", "The cute crinkle around your eyes", "How genuine and warm it is", "All of the above!"],
    correctIndex: 3,
    explanation: "Spot on! Every single thing about your smile outshines the sun! ✨"
  },
  {
    id: 3,
    question: "Out of 8 billion people on Earth, who is my soulmate?",
    options: ["Definitely you ❤️", "You, in every lifetime!", "No doubt, only you!", "All of the above!"],
    correctIndex: 3,
    explanation: "Correct! You are my one and only soulmate forever. 💖"
  }
];

export const LoveQuizGame = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore((s) => s + 1);
      triggerConfetti({ particleCount: 30, spread: 50 });
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx((c) => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      triggerCelebrationFireworks();
    }
  };

  const restartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setIsAnswered(false);
    setIsFinished(false);
  };

  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#140822] to-[#07050d] text-center overflow-hidden">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Interactive Mini-Game #4</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            Our Love Story Quiz ❓❤️
          </h2>
          <p className="text-slate-300 text-xs md:text-sm">
            Test how well you know our favorite memories & relationship trivia!
          </p>
        </div>

        {!isFinished ? (
          <div className="glass-panel p-8 rounded-3xl border border-rose-500/30 bg-black/60 shadow-2xl text-left space-y-6">
            <div className="flex items-center justify-between text-xs font-mono text-rose-300 border-b border-white/10 pb-4">
              <span>Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}</span>
              <span>Score: {score}</span>
            </div>

            <h3 className="text-lg md:text-xl font-bold text-white font-serif">
              {currentQ.question}
            </h3>

            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                let btnStyle = "bg-slate-900/80 border-rose-500/20 text-slate-200 hover:border-rose-500/50";
                if (isAnswered) {
                  if (idx === currentQ.correctIndex) {
                    btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200";
                  } else if (idx === selectedOption) {
                    btnStyle = "bg-rose-950/80 border-rose-500 text-rose-200";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && idx === currentQ.correctIndex && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                    {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-2"
              >
                <p className="text-xs text-rose-200 italic bg-rose-950/40 p-3 rounded-xl border border-rose-500/20">
                  {currentQ.explanation}
                </p>
                <button
                  onClick={handleNext}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold text-xs tracking-wider uppercase shadow-xl hover:opacity-90 active:scale-98 transition-all"
                >
                  {currentIdx + 1 === QUIZ_QUESTIONS.length ? "Finish Quiz 🎉" : "Next Question →"}
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 rounded-3xl border border-rose-500/50 bg-slate-950 text-center space-y-6 shadow-2xl"
          >
            <Trophy className="w-14 h-14 text-amber-400 mx-auto animate-bounce" />
            <h3 className="text-2xl md:text-3xl font-bold text-white font-serif">
              Quiz Complete! Score: {score}/{QUIZ_QUESTIONS.length} 🏆
            </h3>
            <p className="text-rose-200 text-sm italic font-serif leading-relaxed">
              "You know my heart better than anyone else in the world. You scored 100% in my love book!"
            </p>
            <button
              onClick={restartQuiz}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-600 text-white font-semibold text-xs tracking-wider uppercase hover:bg-rose-500 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz ↻</span>
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default LoveQuizGame;
