import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import { Mic, Play, Pause, Volume2 } from 'lucide-react';

export const VoiceMessageSection = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);

  const voice = siteConfig.voiceMessage || {};

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setHasError(true));
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration;
    if (total > 0) {
      setProgress((current / total) * 100);
    }
  };

  return (
    <section className="relative py-20 px-6 bg-gradient-to-b from-[#07050d] via-[#10081d] to-[#07050d] text-center">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs uppercase tracking-widest font-semibold">
            <Mic className="w-3.5 h-3.5 text-purple-400" />
            <span>Voice Note</span>
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-serif">
            {voice.title || "A Voice Message For You"}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm">
            {voice.description || "Press play when you're ready to listen."}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 bg-black/50 space-y-4 shadow-2xl">
          <audio
            ref={audioRef}
            src={voice.src}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onError={() => setHasError(true)}
          />

          {hasError ? (
            <div className="text-xs text-rose-300 p-4 rounded-2xl bg-rose-950/30 border border-rose-500/20">
              Add your voice recording to <code className="text-amber-300">public/media/voice/love-message.mp3</code> to hear your voice note here ❤️
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="p-4 rounded-full bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-xl shadow-rose-950/80 hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
              </button>

              {/* Audio Waveform Bars Simulation */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-1 h-8 px-2">
                  {[40, 70, 30, 90, 50, 80, 60, 100, 40, 70, 50, 90, 30, 80].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isPlaying ? 'bg-rose-400 animate-pulse' : 'bg-white/20'
                      }`}
                      style={{ height: `${isPlaying ? Math.min(100, h * 0.9) : 30}%` }}
                    />
                  ))}
                </div>

                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default VoiceMessageSection;
