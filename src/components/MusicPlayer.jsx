import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MusicPlayer({ src, title, artist, mini = false }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  const toggle = () => {
    const a = audioRef.current;
    if (!a || error) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().then(() => setPlaying(true)).catch(() => setError(true)); }
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.currentTime / (a.duration || 1));
    const onLoad = () => setDuration(a.duration);
    const onEnd = () => setPlaying(false);
    const onErr = () => setError(true);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onLoad);
    a.addEventListener('ended', onEnd);
    a.addEventListener('error', onErr);
    return () => { a.removeEventListener('timeupdate', onTime); a.removeEventListener('loadedmetadata', onLoad); a.removeEventListener('ended', onEnd); a.removeEventListener('error', onErr); };
  }, []);

  const seek = e => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    a.currentTime = (x / rect.width) * duration;
  };

  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const bars = Array.from({ length: 24 }, (_, i) => i);

  if (mini) return (
    <button onClick={toggle} aria-label={playing ? 'Pause music' : 'Play music'}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-xl border border-[#C2185B]/30 animate-glow"
      style={{ background: 'linear-gradient(135deg, #C2185B, #880E4F)' }}>
      <audio ref={audioRef} src={src} loop />
      <span className="text-white text-lg">{playing ? '⏸' : '♪'}</span>
    </button>
  );

  return (
    <div className="w-full max-w-sm mx-auto">
      <audio ref={audioRef} src={src} />
      {error && <p className="text-center text-sm text-[#C2185B]/60 font-ui mb-3">Add your song to /media/music/our-song.mp3</p>}

      {/* Waveform */}
      <div className="flex items-end justify-center gap-0.5 h-12 mb-4">
        {bars.map(i => (
          <motion.div key={i}
            animate={playing ? { scaleY: [0.3, Math.random() * 0.7 + 0.3, 0.3] } : { scaleY: 0.3 }}
            transition={{ duration: 0.4 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.04, ease: 'easeInOut' }}
            className="w-1 rounded-full origin-bottom"
            style={{ height: '100%', background: `hsl(${330 + i * 2}, 70%, ${45 + i}%)` }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #C2185B, #880E4F)' }}>
          <span className="text-white text-lg">{playing ? '⏸' : '▶'}</span>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1A0A0F] truncate font-ui">{title}</p>
          <p className="text-xs text-[#C2185B]/70 truncate font-ui">{artist}</p>
          <div className="mt-2 h-1.5 bg-[#C2185B]/15 rounded-full cursor-pointer" onClick={seek} onTouchStart={seek}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg, #C2185B, #880E4F)' }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[#1A0A0F]/40 font-mono">{fmt((audioRef.current?.currentTime) || 0)}</span>
            <span className="text-[10px] text-[#1A0A0F]/40 font-mono">{fmt(duration)}</span>
          </div>
        </div>
      </div>

      {/* Floating notes */}
      <AnimatePresence>
        {playing && ['♪', '♫', '♩', '♬'].map((note, i) => (
          <motion.span key={i}
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{ opacity: [0, 0.7, 0], y: -60, x: (i - 1.5) * 20 }}
            transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, repeatDelay: 1 }}
            className="absolute text-[#C2185B] text-lg pointer-events-none select-none"
            style={{ left: '50%', bottom: '100%' }}>
            {note}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
