import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, BookOpen, Eye } from 'lucide-react';
import { apologyConfig } from '../data/apologyConfig';

export default function ApologyLetter({ isLetterOpened }) {
  // Allow Annuva to either reveal paragraph by paragraph or read all at once
  const [revealedCount, setRevealedCount] = useState(6); // Default show all once opened, or controlled
  const [readMode, setReadMode] = useState('flow'); // 'flow' (all visible on scroll) or 'step' (one-by-one)

  const letter = apologyConfig.letter;

  return (
    <section
      id="letter-section"
      className="relative min-h-screen py-20 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-center transition-all duration-700"
    >
      {/* Background delicate blush glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-rose-100/35 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="w-full max-w-2xl mx-auto">
        {/* Subtle Section Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#881337] font-semibold bg-rose-50/80 border border-rose-200/60 rounded-full px-4 py-1.5 mb-3"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#BE123C]" />
            <span>The Letter</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-playfair text-2xl sm:text-3xl text-[#2D1B28] font-medium"
          >
            Written with all my heart
          </motion.h2>
          <p className="text-xs text-stone-600 mt-1 font-body">
            Take your time. Read it whenever your heart is ready.
          </p>
        </div>

        {/* Realistic Stationery Paper Letter */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative paper-card rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-14 shadow-2xl border border-[#E8DCCF] overflow-hidden"
        >
          {/* Subtle paper fold crease effect across the middle */}
          <div
            className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-300/40 to-transparent pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute top-2/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-300/40 to-transparent pointer-events-none"
            aria-hidden="true"
          />

          {/* Letter Header Date / Tag */}
          <div className="flex items-center justify-between border-b border-rose-100/80 pb-5 mb-8">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#BE123C]/70" />
              <span className="text-xs font-mono tracking-wider text-stone-600 uppercase">
                {letter.date}
              </span>
            </div>
            <div className="font-cormorant italic text-sm text-[#881337]/70">
              Only for your eyes
            </div>
          </div>

          {/* Salutation */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <h3 className="font-cormorant text-2xl sm:text-3xl font-semibold text-[#881337] tracking-wide">
              {letter.salutation}
            </h3>
          </motion.div>

          {/* Paragraphs - Unfolding line by line / paragraph by paragraph */}
          <div className="space-y-6 sm:space-y-7 text-stone-800 font-body text-base sm:text-lg leading-relaxed">
            {letter.paragraphs.map((para, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{
                  duration: 0.75,
                  delay: index * 0.12,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className={`transition-all duration-500 font-normal leading-[1.8] sm:leading-[1.85] text-[#33222B] ${
                  index === 4
                    ? 'font-medium text-[#7A1232] bg-rose-50/50 p-3 sm:p-4 rounded-xl border-l-2 border-[#BE123C]'
                    : ''
                }`}
              >
                {para}
              </motion.p>
            ))}
          </div>

          {/* Sign-off & Handwritten Signature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-12 pt-8 border-t border-rose-100/80 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6"
          >
            <div>
              <p className="font-cormorant italic text-lg text-stone-600">
                {letter.signOff}
              </p>
              <p className="font-script text-3xl sm:text-4xl text-[#881337] mt-1 tracking-wide">
                {letter.signature}
              </p>
            </div>

            {/* Delicate wax seal watermark emblem */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="w-10 h-10 rounded-full border border-rose-300/60 bg-rose-50/70 flex items-center justify-center text-[#881337] shadow-sm">
                <Heart className="w-4 h-4 fill-[#BE123C]/80 text-[#BE123C]" />
              </div>
              <span className="text-[11px] font-mono tracking-widest uppercase text-stone-500">
                With Sincerity
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Gentle Navigation Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="text-center mt-12"
        >
          <a
            href="#what-i-want-you-to-know"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-600 hover:text-[#881337] transition-colors py-2 px-4 rounded-full hover:bg-rose-50/80"
          >
            <span>What I want you to know next</span>
            <span className="text-sm">↓</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
