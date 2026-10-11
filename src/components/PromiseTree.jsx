import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, CheckCircle2, Shield, Eye } from 'lucide-react';
import { apologyConfig } from '../data/apologyConfig';

export default function PromiseTree() {
  const { promiseTree } = apologyConfig;
  const [unlockedPromises, setUnlockedPromises] = useState([1]); // First unlocked as an invitation
  const [selectedPromiseId, setSelectedPromiseId] = useState(1);

  const togglePromise = (id) => {
    if (!unlockedPromises.includes(id)) {
      setUnlockedPromises((prev) => [...prev, id]);
    }
    setSelectedPromiseId(id);
  };

  const currentPromise = promiseTree.promises.find((p) => p.id === selectedPromiseId) || promiseTree.promises[0];
  const isAllUnlocked = unlockedPromises.length === promiseTree.promises.length;

  return (
    <section id="promise-tree" className="relative py-24 px-4 sm:px-6 md:px-8 overflow-hidden">
      {/* Background radial warmth */}
      <div
        className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-rose-100/35 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto">
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#881337] font-semibold bg-rose-50/80 border border-rose-200/60 rounded-full px-4 py-1.5 mb-3"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#BE123C]" />
            <span>Commitments & Growth</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-playfair text-3xl sm:text-4xl text-[#2D1B28] font-medium tracking-tight mb-4"
          >
            {promiseTree.heading}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-stone-700 text-sm sm:text-base font-body leading-relaxed mb-4"
          >
            {promiseTree.subheading}
          </motion.p>

          {/* Progress Indicator */}
          <div className="inline-flex items-center gap-3 bg-[#FFFDF9] border border-rose-200/70 rounded-full px-4 py-1.5 shadow-sm">
            <span className="text-xs font-mono text-stone-600">
              Bloom Progress:
            </span>
            <span className="text-xs font-mono font-semibold text-[#881337]">
              {unlockedPromises.length} of {promiseTree.promises.length} Blossoms
            </span>
            <div className="w-16 h-1.5 bg-rose-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-[#BE123C] transition-all duration-500 rounded-full"
                style={{
                  width: `${(unlockedPromises.length / promiseTree.promises.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Tree & Commitment Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left / Center: Interactive Tree Art Canvas */}
          <div className="lg:col-span-7 relative flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[440px] aspect-[4/4.2] rounded-3xl bg-gradient-to-b from-[#FFFDF9] to-[#FAF4EC] border border-rose-100/80 p-4 shadow-xl flex items-center justify-center overflow-hidden">
              {/* Soft Tree Background Ambient Glow */}
              <div
                className={`absolute inset-0 transition-opacity duration-1000 bg-radial from-rose-200/40 via-pink-100/10 to-transparent ${
                  isAllUnlocked ? 'opacity-100' : 'opacity-40'
                }`}
              />

              {/* Organic Blossom Tree SVG */}
              <svg
                viewBox="0 0 400 420"
                className="w-full h-full text-stone-700 select-none"
                style={{ filter: 'drop-shadow(0 4px 10px rgba(136, 19, 55, 0.08))' }}
              >
                {/* Tree Trunk & Organic Branches */}
                <path
                  d="M200 390 C195 330 190 280 198 230 C202 205 180 180 160 160 C140 140 115 130 95 135"
                  stroke="#5C382C"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M198 230 C208 200 230 180 255 160 C275 145 300 135 320 140"
                  stroke="#5C382C"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M198 210 C198 170 195 130 200 95"
                  stroke="#5C382C"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M165 165 C155 125 140 110 125 90"
                  stroke="#5C382C"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M245 165 C260 135 275 120 285 95"
                  stroke="#5C382C"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M198 135 C185 115 175 105 160 90"
                  stroke="#5C382C"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M200 120 C215 105 228 95 240 85"
                  stroke="#5C382C"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Gentle background cherry blossom clusters */}
                <g opacity={0.75}>
                  <circle cx="100" cy="125" r="7" fill="#FBCFE8" />
                  <circle cx="112" cy="118" r="6" fill="#F472B6" />
                  <circle cx="85" cy="138" r="5" fill="#FDA4AF" />
                  <circle cx="310" cy="130" r="7" fill="#FBCFE8" />
                  <circle cx="325" cy="140" r="6" fill="#F472B6" />
                  <circle cx="205" cy="85" r="7" fill="#FDA4AF" />
                  <circle cx="190" cy="80" r="6" fill="#FBCFE8" />
                  <circle cx="150" cy="95" r="6" fill="#F472B6" />
                  <circle cx="250" cy="90" r="6" fill="#FDA4AF" />
                  <circle cx="130" cy="85" r="5" fill="#FBCFE8" />
                  <circle cx="270" cy="95" r="5" fill="#F472B6" />
                </g>

                {/* Additional blossoms that bloom when all promises are clicked */}
                {isAllUnlocked && (
                  <g className="animate-fade-in" opacity={0.9}>
                    <circle cx="140" cy="150" r="8" fill="#FB7185" />
                    <circle cx="170" cy="130" r="7" fill="#F43F5E" />
                    <circle cx="230" cy="135" r="8" fill="#FB7185" />
                    <circle cx="260" cy="150" r="7" fill="#F43F5E" />
                    <circle cx="200" cy="160" r="9" fill="#FDA4AF" />
                  </g>
                )}
              </svg>

              {/* 5 Interactive Glowing Heart-Shaped Leaves / Blossoms */}
              {promiseTree.promises.map((p) => {
                const isUnlocked = unlockedPromises.includes(p.id);
                const isSelected = selectedPromiseId === p.id;

                return (
                  <div
                    key={p.id}
                    style={{ left: p.leafPosition.x, top: p.leafPosition.y }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                  >
                    <button
                      onClick={() => togglePromise(p.id)}
                      aria-label={`Promise ${p.id}: ${p.text}`}
                      className={`relative group flex items-center justify-center transition-transform duration-300 ${
                        isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                      }`}
                    >
                      {/* Pulse ring if unlocked */}
                      {isUnlocked && (
                        <span className="absolute -inset-1.5 rounded-full bg-rose-400/30 animate-ping opacity-60" />
                      )}

                      {/* Leaf / Bud Body */}
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border ${
                          isUnlocked
                            ? 'bg-gradient-to-tr from-[#9F1239] to-[#BE123C] border-rose-200 text-white'
                            : 'bg-[#FFFDF9] border-rose-300/80 text-rose-400 hover:border-[#BE123C]'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 transition-transform ${
                            isUnlocked
                              ? 'fill-white text-white scale-110'
                              : 'fill-rose-100 text-rose-400 group-hover:scale-110'
                          }`}
                        />
                      </div>

                      {/* Tiny Number Badge */}
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#FFFDF9] border border-rose-200 text-[10px] font-mono text-[#881337] flex items-center justify-center shadow-xs">
                        {p.id}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-stone-600 font-mono text-center">
              Tap any glowing heart bud on the tree to reveal each commitment
            </p>
          </div>

          {/* Right: Unveiled Commitment Card */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPromise.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="bg-[#FFFDF9] rounded-3xl p-7 sm:p-8 border border-rose-200/80 shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#BE123C] bg-rose-50 px-3 py-1 rounded-full border border-rose-100 font-medium">
                    Commitment #{currentPromise.id}
                  </span>
                  <span className="text-xs font-mono text-stone-500">
                    {unlockedPromises.includes(currentPromise.id) ? '✓ Bloomed' : 'Click leaf to bloom'}
                  </span>
                </div>

                <h3 className="font-playfair text-xl sm:text-2xl text-[#2D1B28] font-medium leading-snug mb-4">
                  “{currentPromise.text}”
                </h3>

                <p className="font-body text-stone-700 text-sm sm:text-base leading-relaxed mb-6 bg-rose-50/50 p-4 rounded-2xl border border-rose-100/60">
                  {currentPromise.detail}
                </p>

                {/* All promises quick-select pills */}
                <div className="pt-4 border-t border-rose-100">
                  <div className="text-xs text-stone-600 font-mono mb-2 uppercase tracking-wider">
                    All Commitments:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {promiseTree.promises.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => togglePromise(p.id)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 ${
                          selectedPromiseId === p.id
                            ? 'bg-[#881337] text-white shadow-sm'
                            : unlockedPromises.includes(p.id)
                            ? 'bg-rose-100/70 text-[#881337] hover:bg-rose-200/70'
                            : 'bg-stone-100 text-stone-600 hover:bg-rose-50'
                        }`}
                      >
                        #{p.id}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Respectful Note from Prompt Requirements */}
            <div className="mt-6 p-4 rounded-2xl bg-rose-50/60 border border-rose-200/50 text-left">
              <p className="text-xs text-stone-700 font-body leading-relaxed">
                <strong className="text-[#881337] font-semibold">Important note: </strong>
                {promiseTree.note}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
