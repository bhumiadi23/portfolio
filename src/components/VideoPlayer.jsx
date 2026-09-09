import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function VideoPlayer({ src, poster, title, caption, onEnded, autoplay = false, fullscreenOnPlay = false }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => setProgress(v.currentTime / (v.duration || 1));
    const onLoad = () => setDuration(v.duration);
    const onEnd = () => { setPlaying(false); onEnded?.(); };
    const onErr = () => setError(true);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onLoad);
    v.addEventListener('ended', onEnd);
    v.addEventListener('error', onErr);
    if (autoplay) { v.muted = true; v.play().then(() => setPlaying(true)).catch(() => {}); }
    return () => { v.removeEventListener('timeupdate', onTime); v.removeEventListener('loadedmetadata', onLoad); v.removeEventListener('ended', onEnd); v.removeEventListener('error', onErr); };
  }, [autoplay, onEnded]);

  const toggle = () => {
    const v = ref.current;
    if (!v || error) return;
    if (playing) { v.pause(); setPlaying(false); }
    else { v.play().then(() => setPlaying(true)).catch(() => setError(true)); }
    resetHide();
  };

  const resetHide = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  const seek = e => {
    const v = ref.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    v.currentTime = (x / rect.width) * duration;
  };

  const toggleMute = () => { if (ref.current) { ref.current.muted = !muted; setMuted(m => !m); } };

  const goFullscreen = () => {
    const v = ref.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
  };

  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-[#C2185B]/15 relative group"
      onMouseMove={resetHide} onTouchStart={resetHide}>
      {error ? (
        <div className="aspect-video bg-gradient-to-br from-[#F5EFE6] to-[#FDFBF7] flex flex-col items-center justify-center gap-3 border border-[#C2185B]/20">
          <span className="text-4xl">🎬</span>
          <p className="text-sm text-[#C2185B]/60 font-ui text-center px-4">
            {src ? `Add video to ${src}` : 'Video coming soon'}
          </p>
        </div>
      ) : (
        <div className="relative aspect-video bg-black">
          <video ref={ref} src={src} poster={poster} playsInline preload="metadata"
            className="w-full h-full object-cover" onClick={toggle} />

          {/* Poster fallback */}
          {!playing && poster && (
            <div className="absolute inset-0 pointer-events-none">
              <img src={poster} alt="" className="w-full h-full object-cover opacity-60" onError={e => e.target.style.display = 'none'} />
            </div>
          )}

          {/* Play button overlay */}
          {!playing && (
            <button onClick={toggle} aria-label="Play video"
              className="absolute inset-0 flex items-center justify-center z-10">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl"
                style={{ background: 'rgba(194,24,91,0.9)', backdropFilter: 'blur(8px)' }}>
                <span className="text-white text-2xl ml-1">▶</span>
              </motion.div>
            </button>
          )}

          {/* Controls bar */}
          <motion.div animate={{ opacity: showControls || !playing ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 inset-x-0 p-3 z-20"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
            <div className="h-1 bg-white/20 rounded-full cursor-pointer mb-2" onClick={seek} onTouchStart={seek}>
              <div className="h-full rounded-full bg-[#C2185B] transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={toggle} className="text-white text-sm w-8 h-8 flex items-center justify-center">
                  {playing ? '⏸' : '▶'}
                </button>
                <button onClick={toggleMute} className="text-white text-sm w-8 h-8 flex items-center justify-center">
                  {muted ? '🔇' : '🔊'}
                </button>
                <span className="text-white/70 text-xs font-mono">{fmt((ref.current?.currentTime) || 0)} / {fmt(duration)}</span>
              </div>
              <button onClick={goFullscreen} className="text-white text-sm w-8 h-8 flex items-center justify-center">⛶</button>
            </div>
          </motion.div>
        </div>
      )}

      {(title || caption) && (
        <div className="p-4 bg-[#FDFBF7]">
          {title && <p className="font-semibold text-[#1A0A0F] font-serif text-base">{title}</p>}
          {caption && <p className="text-sm text-[#1A0A0F]/60 font-ui mt-1 italic">{caption}</p>}
        </div>
      )}
    </div>
  );
}
