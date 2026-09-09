import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../data/siteConfig';

export default function VoiceMessage({ onEnded }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.currentTime / (a.duration || 1));
    const onLoad = () => setDuration(a.duration);
    const onEnd = () => { setPlaying(false); setDone(true); onEnded?.(); };
    const onErr = () => setError(true);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onLoad);
    a.addEventListener('ended', onEnd);
    a.addEventListener('error', onErr);
    return () => { a.removeEventListener('timeupdate', onTime); a.removeEventListener('loadedmetadata', onLoad); a.removeEventListener('ended', onEnd); a.removeEventListener('error', onErr); };
  }, [onEnded]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a || error) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().then(() => setPlaying(true)).catch(() => setError(true)); }
  };

  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const bars = Array.from({ length: 32 }, (_, i) => i);

  return (
    <div className="relative py-20 px-6 flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #FDFBF7 0%, #F5EFE6 100%)' }}>

      <div className="max-w-sm w-full mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] font-ui mb-3" style={{ color: 'rgba(194,24,91,0.6)' }}>
            voice message
          </p>
          <h2 className="font-serif mb-2" style={{ fontSize: 'clamp(1.8rem, 6vw, 2.8rem)', color: '#1A0A0F' }}>
            Press play when you're ready.
          </h2>
          {error && <p className="text-sm font-ui mt-2" style={{ color: 'rgba(194,24,91,0.5)' }}>
            Add your voice note to /public/media/voice/message.mp3
          </p>}
        </motion.div>

        <audio ref={audioRef} src={siteConfig.voiceMessage} />

        {/* Waveform */}
        <div className="flex items-end justify-center gap-0.5 h-14 mb-6">
          {bars.map(i => (
            <motion.div key={i}
              animate={playing ? { scaleY: [0.2, Math.random() * 0.8 + 0.2, 0.2] } : { scaleY: 0.2 }}
              transition={{ duration: 0.3 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.03, ease: 'easeInOut' }}
              className="w-1.5 rounded-full origin-bottom"
              style={{ height: '100%', background: `hsl(${330 + i * 1.5}, 65%, ${45 + i * 0.5}%)` }} />
          ))}
        </div>

        {/* Progress */}
        <div className="h-1.5 bg-[#C2185B]/15 rounded-full mb-3 cursor-pointer"
          onClick={e => {
            const a = audioRef.current;
            if (!a || !duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            a.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
          }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg, #C2185B, #880E4F)' }} />
        </div>
        <div className="flex justify-between text-[10px] font-mono mb-6" style={{ color: 'rgba(26,10,15,0.4)' }}>
          <span>{fmt((audioRef.current?.currentTime) || 0)}</span>
          <span>{fmt(duration)}</span>
        </div>

        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggle}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl shadow-xl mx-auto animate-glow"
          style={{ background: 'linear-gradient(135deg, #C2185B, #880E4F)' }}>
          {playing ? '⏸' : '▶'}
        </motion.button>

        <AnimatePresence>
          {done && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="mt-8 font-cormorant italic text-xl" style={{ color: '#C2185B' }}>
              Okay... now for the last surprise.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
