import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, Heart, X, Sparkles } from 'lucide-react';
import { triggerConfetti } from '../common/Confetti';

const LOVE_NOTES = [
  { id: 1, title: 'Morning Thought ☀️', text: 'You are the first thing on my mind every single morning when I wake up.', bg: 'from-pink-900/60 to-rose-950/80', rotate: '-4deg' },
  { id: 2, title: 'Random Kiss 💋', text: 'Consider this an official digital voucher for 100 warm kisses anytime today!', bg: 'from-purple-900/60 to-indigo-950/80', rotate: '3deg' },
  { id: 3, title: 'Cute Fact 🥰', text: 'Did you know that hearing your voice instantly makes any bad day 10x better?', bg: 'from-rose-900/60 to-amber-950/80', rotate: '-2deg' },
  { id: 4, title: 'Forever Promise 🔒', text: 'I promise to support your big dreams, stand by you, and make you laugh every single day.', bg: 'from-amber-900/60 to-rose-950/80', rotate: '5deg' },
];

export const LoveNotesWall = () => {
  const [activeNote, setActiveNote] = useState(null);

  const handleOpenNote = (note) => {
    setActiveNote(note);
    triggerConfetti({ particleCount: 20, spread: 40 });
  };

  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-[#07050d] via-[#12071f] to-[#07050d] text-center overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <StickyNote className="w-3.5 h-3.5 text-rose-400" />
            <span>Interactive Love Notes</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
            Unfold My Sticky Notes 📝❤️
          </h2>
          <p className="text-slate-300 text-xs md:text-sm">
            Tap on any floating note to unfold the hidden personal message inside.
          </p>
        </div>

        {/* Floating Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {LOVE_NOTES.map((note) => (
            <motion.div
              key={note.id}
              whileHover={{ scale: 1.08, rotate: '0deg', zIndex: 20 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOpenNote(note)}
              style={{ transform: `rotate(${note.rotate})` }}
              className={`p-6 rounded-3xl border border-rose-500/30 bg-gradient-to-br ${note.bg} shadow-2xl cursor-pointer text-left space-y-3 relative group transition-transform duration-300`}
            >
              <div className="flex items-center justify-between text-rose-200">
                <span className="text-xs font-bold font-serif">{note.title}</span>
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400 group-hover:scale-125 transition-transform" />
              </div>
              <p className="text-xs text-rose-100/80 line-clamp-2 italic font-serif">
                "{note.text}"
              </p>
              <span className="text-[10px] font-mono text-amber-300 block pt-2">
                Tap to unfold →
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Note Unfold Modal */}
      <AnimatePresence>
        {activeNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveNote(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full glass-panel p-8 rounded-3xl border border-rose-500/50 bg-slate-950 text-left space-y-4 shadow-2xl"
            >
              <button
                onClick={() => setActiveNote(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-amber-300 text-xs font-mono font-semibold uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Unfolded Love Note</span>
              </div>

              <h3 className="text-xl font-bold text-white font-serif">{activeNote.title}</h3>

              <p className="text-rose-100 text-base leading-relaxed italic font-serif bg-rose-950/30 p-4 rounded-2xl border border-rose-500/20">
                "{activeNote.text}"
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default LoveNotesWall;
