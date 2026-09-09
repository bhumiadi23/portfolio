import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import { triggerCelebrationFireworks, triggerConfetti } from '../common/Confetti';
import { Sparkles, Gift, Clock } from 'lucide-react';
import HiddenHeart from '../common/HiddenHeart';

export const CountdownSection = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isBirthday, setIsBirthday] = useState(false);

  useEffect(() => {
    const targetDate = new Date(siteConfig.birthdayDate).getTime();

    const calculate = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setIsBirthday(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setIsBirthday(false);
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerCelebration = () => {
    triggerCelebrationFireworks();
    triggerConfetti({ particleCount: 100, spread: 90 });
  };

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <section className="relative py-20 px-6 bg-gradient-to-b from-[#07050d] via-[#140b24] to-[#07050d] text-center overflow-hidden">
      {/* Hidden Heart #2 */}
      <div className="absolute top-6 left-6">
        <HiddenHeart index={2} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-medium mb-6"
        >
          <Clock className="w-3.5 h-3.5 text-rose-400" />
          <span>The Birthday Countdown</span>
        </motion.div>

        <h2 className="text-3xl md:text-5xl font-bold text-white mb-10 font-serif">
          {isBirthday ? (
            <span className="text-rose-400">IT'S YOUR SPECIAL DAY TODAY! 🎉❤️</span>
          ) : (
            `Counting down to ${siteConfig.girlfriendName}'s Special Day`
          )}
        </h2>

        {/* Countdown Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
          {timeUnits.map((unit, i) => (
            <motion.div
              key={unit.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel border border-rose-500/20 bg-rose-950/20 rounded-2xl p-6 flex flex-col items-center justify-center shadow-xl shadow-rose-950/30 backdrop-blur-md"
            >
              <span className="text-4xl md:text-6xl font-bold bg-gradient-to-b from-white via-rose-100 to-rose-300 bg-clip-text text-transparent font-mono">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-xs uppercase tracking-wider text-rose-300/70 font-semibold mt-2">
                {unit.label}
              </span>
            </motion.div>
          ))}
        </div>

        <button
          onClick={handleTriggerCelebration}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs md:text-sm font-semibold tracking-wide transition-all active:scale-95 shadow-lg shadow-rose-950/50"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Celebrate Early with Fireworks! 🎆</span>
        </button>
      </div>
    </section>
  );
};

export default CountdownSection;
