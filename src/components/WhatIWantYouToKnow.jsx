import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Clock, Compass, ShieldCheck } from 'lucide-react';
import { apologyConfig } from '../data/apologyConfig';

export default function WhatIWantYouToKnow() {
  const [activeCard, setActiveCard] = useState(null);

  // SVG Custom Delicate Illustrations
  const renderIllustration = (type) => {
    switch (type) {
      case 'heartHands':
        // Delicate cupped hands holding a soft heart
        return (
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg
              viewBox="0 0 64 64"
              className="w-14 h-14 text-rose-500 fill-none stroke-current"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Soft cupped hands */}
              <path d="M12 40 C14 48, 24 54, 32 54 C40 54, 50 48, 52 40" stroke="#881337" opacity="0.4" />
              <path d="M16 36 C18 44, 26 50, 32 50 C38 50, 46 44, 48 36" stroke="#BE123C" opacity="0.6" />
              {/* Floating Heart */}
              <path
                d="M32 36 C32 36 22 28 22 20 C22 15 26 12 30 14 C32 15 32 17 32 17 C32 17 32 15 34 14 C38 12 42 15 42 20 C42 28 32 36 32 36 Z"
                fill="url(#heartGrad1)"
                stroke="#BE123C"
              />
              <defs>
                <linearGradient id="heartGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#BE123C" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 rounded-full bg-rose-300/20 blur-md pointer-events-none animate-soft-pulse" />
          </div>
        );

      case 'sprout':
        // Sprouting branch of growth with heart blossom
        return (
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg
              viewBox="0 0 64 64"
              className="w-14 h-14 text-pink-600 fill-none stroke-current"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Gentle stem */}
              <path d="M32 54 C32 42, 30 32, 32 20" stroke="#881337" opacity="0.5" />
              {/* Side delicate leaves */}
              <path d="M32 40 C24 38, 20 32, 22 26 C28 26, 32 32, 32 40" stroke="#BE123C" fill="#FCE7F3" fillOpacity="0.6" />
              <path d="M32 32 C40 30, 44 24, 42 18 C36 18, 32 24, 32 32" stroke="#BE123C" fill="#FCE7F3" fillOpacity="0.6" />
              {/* Top budding heart */}
              <path
                d="M32 20 C32 20 25 14 25 9 C25 5.5 28 3.5 31 5 C32 5.5 32 7 32 7 C32 7 32 5.5 33 5 C36 3.5 39 5.5 39 9 C39 14 32 20 32 20 Z"
                fill="#F472B6"
                stroke="#BE123C"
              />
            </svg>
            <div className="absolute inset-0 rounded-full bg-amber-200/20 blur-md pointer-events-none animate-soft-pulse" />
          </div>
        );

      case 'hourglass':
        // Peaceful hourglass with gentle drifting time & heart
        return (
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg
              viewBox="0 0 64 64"
              className="w-14 h-14 text-purple-600 fill-none stroke-current"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Hourglass outer curve */}
              <path d="M20 14 L44 14" stroke="#881337" strokeWidth="2.5" />
              <path d="M20 50 L44 50" stroke="#881337" strokeWidth="2.5" />
              <path d="M22 14 C22 28, 42 36, 42 50" stroke="#BE123C" opacity="0.6" />
              <path d="M42 14 C42 28, 22 36, 22 50" stroke="#BE123C" opacity="0.6" />
              {/* Center tranquil heart */}
              <path
                d="M32 35 C32 35 27 30 27 27 C27 24.5 29 23 31 24 C32 24.5 32 25.5 32 25.5 C32 25.5 32 24.5 33 24 C35 23 37 24.5 37 27 C37 30 32 35 32 35 Z"
                fill="#C084FC"
                fillOpacity="0.6"
                stroke="#881337"
              />
            </svg>
            <div className="absolute inset-0 rounded-full bg-purple-200/20 blur-md pointer-events-none animate-soft-pulse" />
          </div>
        );

      default:
        return <Heart className="w-8 h-8 text-[#BE123C]" />;
    }
  };

  return (
    <section
      id="what-i-want-you-to-know"
      className="relative py-24 px-4 sm:px-6 md:px-8 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#881337] font-semibold bg-rose-50/80 border border-rose-200/60 rounded-full px-4 py-1.5 mb-3"
          >
            <Heart className="w-3.5 h-3.5 text-[#BE123C]" />
            <span>Reminders For You</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-playfair text-3xl sm:text-4xl text-[#2D1B28] font-medium tracking-tight mb-4"
          >
            What I Want You to Know
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-stone-700 text-sm sm:text-base font-body leading-relaxed"
          >
            Three things that stay true, beyond any bad moment or disagreement.
          </motion.p>
        </div>

        {/* 3 Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {apologyConfig.keyCards.map((card, idx) => {
            const isSelected = activeCard === card.id;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{
                  duration: 0.7,
                  delay: idx * 0.16,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onClick={() => setActiveCard(isSelected ? null : card.id)}
                className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between cursor-pointer transition-all duration-500 border ${
                  isSelected
                    ? 'bg-[#FFFDF9] border-[#BE123C]/50 shadow-2xl -translate-y-2 ring-1 ring-[#BE123C]/20'
                    : 'bg-[#FFFDF9]/85 hover:bg-[#FFFDF9] border-rose-200/60 shadow-md hover:shadow-xl hover:-translate-y-1.5'
                }`}
              >
                {/* Top illustration & card index */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    {renderIllustration(card.iconType)}
                    <span className="text-xs font-mono font-medium tracking-wider text-rose-400 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                      0{idx + 1}
                    </span>
                  </div>

                  {/* Card Title */}
                  <h3 className="font-playfair text-xl sm:text-2xl font-medium text-[#2D1B28] mb-4">
                    {card.title}
                  </h3>

                  {/* Quote / Main Text */}
                  <p className="font-body text-stone-700 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    “{card.quote}”
                  </p>
                </div>

                {/* Bottom interactive reflection */}
                <div className="pt-4 border-t border-rose-100/70 mt-auto">
                  <div className="flex items-center justify-between text-xs text-[#881337] font-medium">
                    <span>{isSelected ? 'My Promise to You' : 'Tap to reflect'}</span>
                    <span className="text-base transition-transform duration-300">
                      {isSelected ? '−' : '+'}
                    </span>
                  </div>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 text-xs sm:text-sm text-stone-700 italic bg-rose-50/70 p-3 rounded-xl border border-rose-200/50">
                          {card.reflection}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
