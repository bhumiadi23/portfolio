import React, { useRef, useEffect, useState } from 'react';
import { useExperience } from '../../context/ExperienceContext';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music } from 'lucide-react';
import MediaImage from '../common/MediaImage';

export const AudioPlayerBar = () => {
  const {
    hasEntered,
    isPlayingMusic,
    setIsPlayingMusic,
    currentSong,
    nextSong,
    prevSong
  } = useExperience();

  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [hasAudioError, setHasAudioError] = useState(false);

  useEffect(() => {
    if (!audioRef.current || !hasEntered) return;

    if (isPlayingMusic) {
      audioRef.current.play().catch(() => {
        setHasAudioError(true);
        setIsPlayingMusic(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlayingMusic, currentSong, hasEntered, setIsPlayingMusic]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => setHasAudioError(true));
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!hasEntered) return null;

  return (
    <div className="fixed top-5 left-5 z-40">
      <audio
        ref={audioRef}
        src={currentSong?.src}
        onEnded={nextSong}
        onError={() => setHasAudioError(true)}
      />

      <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-rose-500/30 p-2 rounded-full shadow-2xl">
        {/* Album Artwork */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
          <MediaImage
            src={currentSong?.cover}
            alt={currentSong?.title}
            className={`w-full h-full object-cover ${isPlayingMusic ? 'animate-spin-slow' : ''}`}
          />
        </div>

        {/* Track Title */}
        <div className="hidden sm:block text-left pr-2 max-w-[130px] overflow-hidden">
          <p className="text-xs font-semibold text-white truncate">
            {currentSong?.title || "Background Music"}
          </p>
          <p className="text-[10px] text-rose-300/80 truncate">
            {currentSong?.artist || "Love Melody"}
          </p>
        </div>

        {/* Visualizer Bars */}
        <div className="flex items-center gap-0.5 h-4 px-1">
          {[60, 100, 40, 80].map((h, i) => (
            <div
              key={i}
              className={`w-0.5 rounded-full transition-all ${
                isPlayingMusic ? 'bg-rose-400 animate-pulse' : 'bg-white/20'
              }`}
              style={{ height: isPlayingMusic ? `${h}%` : '30%' }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={prevSong}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Previous Song"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={togglePlay}
            className="p-2 rounded-full bg-rose-600 text-white shadow-md hover:scale-105 active:scale-95 transition-transform"
            aria-label={isPlayingMusic ? "Pause" : "Play"}
          >
            {isPlayingMusic ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
          </button>
          <button
            onClick={nextSong}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Next Song"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayerBar;
