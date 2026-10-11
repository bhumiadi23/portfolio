import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircleHeart, Check, Sparkles } from 'lucide-react';
import { apologyConfig } from '../data/apologyConfig';

export default function FinalScreen() {
  const [activeResponse, setActiveResponse] = useState(null); // 'read' or 'talk'
  const { finalScreen } = apologyConfig;

  return (
    <section
      id="final-section"
      className="relative min-h-screen py-24 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-center text-center overflow-hidden bg-gradient-to-b from-[#FDFBF7] via-[#FAF3EC] to-[#FCEEF3]"
    >
      {/* Dreamy cream-and-pink ambient background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-gradient-to-tr from-pink-300/30 via-rose-200/30 to-amber-100/25 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-2xl mx-auto flex flex-col items-center">
        {/* Glowing Heart with breathing aura */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 rounded-full bg-rose-400/35 blur-xl animate-soft-pulse" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FFFDF9] border border-rose-200/80 shadow-lg flex items-center justify-center">
            <Heart className="w-8 h-8 sm:w-9 sm:h-9 text-[#BE123C] fill-[#BE123C] animate-soft-pulse" />
          </div>
        </motion.div>

        {/* Heading: “I'm sorry, my Annuva. ❤️” */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-playfair text-3xl sm:text-4xl md:text-5xl font-medium text-[#2D1B28] tracking-tight mb-6"
        >
          {finalScreen.heading}
        </motion.h2>

        {/* Paragraph 1 */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="font-body text-base sm:text-lg text-stone-700/90 font-normal leading-relaxed max-w-xl mb-6 text-balance"
        >
          {finalScreen.message1}
        </motion.p>

        {/* Paragraph 2 */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-cormorant italic text-xl sm:text-2xl text-[#881337] font-medium leading-relaxed max-w-lg mb-12"
        >
          “{finalScreen.message2}”
        </motion.p>

        {/* The Two Respectful Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10"
        >
          {/* Button 1: “I read your letter 💗” */}
          <button
            onClick={() => setActiveResponse(activeResponse === 'read' ? null : 'read')}
            className={`w-full sm:w-auto px-7 py-3.5 rounded-full text-sm sm:text-base font-medium transition-all duration-300 flex items-center justify-center gap-2.5 shadow-md active:scale-98 ${
              activeResponse === 'read'
                ? 'bg-rose-100 text-[#881337] border border-rose-300 shadow-inner'
                : 'bg-[#FFFDF9] text-[#881337] border border-rose-200/90 hover:bg-rose-50/80 hover:border-rose-300 hover:shadow-lg'
            }`}
          >
            <Heart className="w-4 h-4 fill-rose-300 text-[#BE123C]" />
            <span>{finalScreen.button1}</span>
          </button>

          {/* Button 2: “I want to talk to you 💌” */}
          <button
            onClick={() => setActiveResponse(activeResponse === 'talk' ? null : 'talk')}
            className={`w-full sm:w-auto px-7 py-3.5 rounded-full text-sm sm:text-base font-medium transition-all duration-300 flex items-center justify-center gap-2.5 shadow-md active:scale-98 ${
              activeResponse === 'talk'
                ? 'bg-[#881337] text-white shadow-inner'
                : 'bg-gradient-to-r from-[#881337] via-[#9F1239] to-[#BE123C] text-white shadow-rose-900/20 hover:shadow-xl hover:shadow-rose-900/30 hover:scale-[1.02]'
            }`}
          >
            <MessageCircleHeart className="w-4 h-4 text-rose-200" />
            <span>{finalScreen.button2}</span>
          </button>
        </motion.div>

        {/* Response Revelation Card (Private, Pressure-Free) */}
        <AnimatePresence mode="wait">
          {activeResponse && (
            <motion.div
              key={activeResponse}
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.96 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-lg bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-xl mb-10 text-left relative overflow-hidden"
            >
              {/* Soft decorative accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-300 via-[#BE123C] to-rose-300" />

              {activeResponse === 'read' ? (
                <div>
                  <div className="flex items-center gap-2 text-[#881337] mb-2 font-medium">
                    <Check className="w-4 h-4 text-[#BE123C]" />
                    <span className="text-xs font-mono uppercase tracking-wider">
                      Thank You
                    </span>
                  </div>
                  <h4 className="font-playfair text-lg sm:text-xl text-[#2D1B28] font-medium mb-3">
                    {finalScreen.response1.title}
                  </h4>
                  <p className="font-body text-sm sm:text-base text-stone-700 leading-relaxed">
                    {finalScreen.response1.body}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-[#881337] mb-2 font-medium">
                    <Sparkles className="w-4 h-4 text-[#BE123C]" />
                    <span className="text-xs font-mono uppercase tracking-wider">
                      Safe Space
                    </span>
                  </div>
                  <h4 className="font-playfair text-lg sm:text-xl text-[#2D1B28] font-medium mb-3">
                    {finalScreen.response2.title}
                  </h4>
                  <p className="font-body text-sm sm:text-base text-stone-700 leading-relaxed bg-rose-50/70 p-4 rounded-2xl border border-rose-100">
                    “{finalScreen.response2.body}”
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intimate Sign-off */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-6 text-center border-t border-rose-200/60 pt-8 w-full max-w-sm"
        >
          <p className="font-cormorant italic text-base text-stone-600">
            With patience, honesty, and all my love,
          </p>
          <p className="font-script text-3xl text-[#881337] mt-1">
            Nestle ❤️
          </p>
        </motion.div>
      </div>
    </section>
  );
}
