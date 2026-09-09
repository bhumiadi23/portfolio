import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Video as VideoIcon, Heart } from 'lucide-react';

export const MediaVideo = ({ 
  src, 
  poster, 
  caption, 
  autoPlay = false, 
  loop = true, 
  muted: initialMuted = true,
  className = '' 
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setHasError(true));
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    if (total > 0) {
      setProgress((current / total) * 100);
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  if (hasError || !src) {
    return (
      <div className={`relative flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-purple-950/60 to-rose-950/40 border border-purple-500/30 rounded-2xl text-center overflow-hidden min-h-[260px] ${className}`}>
        <div className="p-4 mb-3 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 animate-pulse">
          <Heart className="w-8 h-8" />
        </div>
        <span className="text-sm font-semibold text-purple-200 mb-1">
          {caption || "Special Memory Video"}
        </span>
        <p className="text-xs text-slate-400 max-w-md">
          Add your personal video to <code className="text-rose-300">public/media/videos/</code> to see your memory here ❤️
        </p>
      </div>
    );
  }

  return (
    <div className={`relative group overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black/40 ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={isMuted}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onError={() => setHasError(true)}
        onClick={togglePlay}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Control Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">
        {caption && (
          <div className="text-xs text-rose-200/90 font-medium tracking-wide drop-shadow-md">
            {caption}
          </div>
        )}

        <div className="space-y-2 pointer-events-auto">
          {/* Progress bar */}
          <div 
            className="w-full h-1 bg-white/20 rounded-full cursor-pointer overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              if (videoRef.current) {
                videoRef.current.currentTime = pos * videoRef.current.duration;
              }
            }}
          >
            <div className="h-full bg-gradient-to-r from-rose-500 to-purple-500" style={{ width: `${progress}%` }} />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <button 
                onClick={togglePlay} 
                className="p-2 rounded-full bg-white/10 hover:bg-rose-500/80 transition-colors backdrop-blur-md"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>
              <button 
                onClick={toggleMute} 
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <button 
              onClick={toggleFullscreen}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md"
              aria-label="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaVideo;
