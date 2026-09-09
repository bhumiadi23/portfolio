import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function BirthdayCake({ name }) {
  const [lit, setLit] = useState(true);
  const [wished, setWished] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    setMicSupported(!!(navigator.mediaDevices?.getUserMedia));
  }, []);

  const blowOut = () => {
    if (!lit) return;
    setLit(false);
    setTimeout(() => {
      setWished(true);
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors: ['#C2185B', '#F8BBD9', '#C9A84C', '#fff'] });
    }, 600);
  };

  const startMic = async () => {
    if (!micSupported || listening) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;
      setListening(true);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const check = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        if (avg > 30) { blowOut(); stream.getTracks().forEach(t => t.stop()); setListening(false); return; }
        rafRef.current = requestAnimationFrame(check);
      };
      check();
    } catch { setMicSupported(false); }
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const candles = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Candles row */}
      <div className="flex gap-4 items-end">
        {candles.map((_, i) => (
          <div key={i} className="flex flex-col items-center cursor-pointer" onClick={blowOut}>
            <AnimatePresence>
              {lit && (
                <motion.div key="flame" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
                  className="relative mb-0.5">
                  <motion.div animate={{ scaleX: [1, 1.2, 0.9, 1.1, 1], scaleY: [1, 0.9, 1.1, 0.95, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-3 h-5 rounded-full"
                    style={{ background: 'linear-gradient(to top, #f97316, #fbbf24, #fff9)', boxShadow: '0 0 12px rgba(251,191,36,0.8)' }} />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="w-2.5 h-10 rounded-sm"
              style={{ background: `hsl(${330 + i * 15}, 70%, 65%)`, boxShadow: 'inset 0 0 4px rgba(0,0,0,0.2)' }} />
          </div>
        ))}
      </div>

      {/* Cake */}
      <div className="flex flex-col items-center">
        {/* Top tier */}
        <div className="w-36 h-10 rounded-t-2xl flex items-center justify-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #C2185B, #880E4F)' }}>
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px)' }} />
          <span className="text-white text-[10px] font-serif font-bold tracking-widest z-10">HAPPY BIRTHDAY</span>
        </div>
        {/* Frosting drip */}
        <div className="w-40 h-3 relative">
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="absolute top-0 w-4 h-3 rounded-b-full"
              style={{ left: `${i * 14}%`, background: '#F8BBD9', height: `${8 + (i % 3) * 4}px` }} />
          ))}
        </div>
        {/* Bottom tier */}
        <div className="w-48 h-16 rounded-b-2xl flex items-center justify-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #6B1A2A, #3E0020)' }}>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(255,255,255,0.05) 6px, rgba(255,255,255,0.05) 12px)' }} />
          <span className="text-[#F8BBD9] text-base font-serif font-bold z-10">{name} ❤️</span>
        </div>
        {/* Plate */}
        <div className="w-56 h-3 rounded-full mt-1" style={{ background: 'linear-gradient(90deg, #F5EFE6, #FDFBF7, #F5EFE6)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
      </div>

      {/* Actions */}
      {lit && (
        <div className="flex flex-col items-center gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={blowOut}
            className="px-6 py-3 rounded-full text-white text-sm font-semibold font-ui shadow-lg"
            style={{ background: 'linear-gradient(135deg, #C2185B, #880E4F)' }}>
            💨 Blow Out Candles
          </motion.button>
          {micSupported && !listening && (
            <button onClick={startMic} className="text-xs text-[#C2185B]/60 font-ui underline">
              Or blow into your mic 🎤
            </button>
          )}
          {listening && <p className="text-xs text-[#C2185B] font-ui animate-pulse">Listening... blow! 🎤</p>}
        </div>
      )}

      <AnimatePresence>
        {wished && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-center space-y-2">
            <p className="text-2xl font-serif text-[#1A0A0F]">Wish granted. ❤️</p>
            <p className="text-sm text-[#C2185B]/70 font-ui italic">May it come true, Annuva.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
