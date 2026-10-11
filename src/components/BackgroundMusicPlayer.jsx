import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Heart, AlertCircle, ExternalLink } from 'lucide-react';

const YOUTUBE_VIDEO_ID = 'k6BnSIs3XUQ';
const SONG_LABEL = 'A song for you, Annuva ❤️';
const SONG_SUBTITLE = 'Phir Le Aya Dil';

export default function BackgroundMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const playerRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize YouTube IFrame Player API
  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      try {
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch {
            // ignore
          }
        }

        playerRef.current = new window.YT.Player('yt-bg-audio-container', {
          height: '200',
          width: '200',
          videoId: YOUTUBE_VIDEO_ID,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: YOUTUBE_VIDEO_ID,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (isMounted) {
                setIsReady(true);
                setHasError(false);
                // Attempt immediate autoplay
                try {
                  event.target.playVideo();
                } catch {
                  // browser blocked autoplay before user gesture
                }
              }
            },
            onStateChange: (event) => {
              if (!isMounted) return;
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (
                event.data === window.YT.PlayerState.PAUSED ||
                event.data === window.YT.PlayerState.ENDED
              ) {
                setIsPlaying(false);
                // If ended, loop again
                if (event.data === window.YT.PlayerState.ENDED && playerRef.current) {
                  try {
                    playerRef.current.playVideo();
                  } catch {
                    // ignore
                  }
                }
              }
            },

            onError: (event) => {
              console.warn('[YouTube Player Error]:', event.data);
              if (isMounted) {
                setHasError(true);
                setIsPlaying(false);
                setErrorMessage('Unable to embed audio directly.');
              }
            },
          },
        });
      } catch (err) {
        console.error('[YouTube Player Init Exception]:', err);
        if (isMounted) {
          setHasError(true);
        }
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Load YouTube IFrame API script dynamically if not present
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      // Chain onto existing or new onYouTubeIframeAPIReady callback
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        if (isMounted) initPlayer();
      };
    }

    return () => {
      isMounted = false;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Guarantee automatic playback on the first user interaction anywhere on the screen
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        try {
          const state = typeof playerRef.current.getPlayerState === 'function' ? playerRef.current.getPlayerState() : -1;
          if (state !== window.YT?.PlayerState?.PLAYING) {
            playerRef.current.playVideo();
            setIsPlaying(true);
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('click', handleFirstInteraction, { capture: true, once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { capture: true, once: true });
    window.addEventListener('pointerdown', handleFirstInteraction, { capture: true, once: true });
    window.addEventListener('keydown', handleFirstInteraction, { capture: true, once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction, { capture: true });
      window.removeEventListener('touchstart', handleFirstInteraction, { capture: true });
      window.removeEventListener('pointerdown', handleFirstInteraction, { capture: true });
      window.removeEventListener('keydown', handleFirstInteraction, { capture: true });
    };
  }, []);

  // Handle Play/Pause explicitly initiated by user interaction
  const togglePlay = () => {

    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch (err) {
      console.warn('[Playback toggle failed]:', err);
      setHasError(true);
    }
  };

  // Handle Mute/Unmute
  const toggleMute = () => {
    if (!playerRef.current) return;

    try {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (err) {
      console.warn('[Mute toggle failed]:', err);
    }
  };

  return (
    <>
      {/* 
        Hidden Off-Screen YouTube IFrame Container:
        Kept physically alive in the DOM with a small non-zero size so mobile 
        browsers do not suspend background audio execution.
      */}
      <div
        style={{
          position: 'fixed',
          bottom: '-300px',
          right: '-300px',
          width: '200px',
          height: '200px',
          opacity: '0.01',
          pointerEvents: 'none',
          zIndex: -1,
        }}
        aria-hidden="true"
      >
        <div id="yt-bg-audio-container" />
      </div>

      {/* Floating Romantic Music Player in Bottom-Right Corner */}
      <aside
        ref={containerRef}
        aria-label="Background music player"
        className="fixed bottom-5 right-5 z-50 transition-all duration-300 max-w-[calc(100vw-2.5rem)]"
      >
        {/* Error Fallback: "Play our song ❤️" */}
        {hasError ? (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FFFDF9]/95 backdrop-blur-xl border border-rose-300 shadow-xl text-[#881337]">
            <AlertCircle className="w-4 h-4 text-[#BE123C]" />
            <a
              href={`https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium hover:underline flex items-center gap-1.5"
            >
              <span>Play our song ❤️</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ) : (
          /* Normal Romantic Player Pill */
          <div
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-[#FFFDF9]/92 backdrop-blur-xl border border-rose-200/80 shadow-xl shadow-rose-950/10 text-[#2D1B28] transition-all duration-300 ${
              isPlaying ? 'ring-2 ring-rose-300/60 bg-[#FFFDF9]' : 'hover:border-rose-300 hover:shadow-2xl'
            }`}
          >
            {/* Animated Music Icon / Equalizer */}
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-rose-50 border border-rose-200/70 text-[#BE123C] flex-shrink-0">
              {isPlaying ? (
                <div className="flex items-end gap-[2.5px] h-3.5 w-3.5">
                  <span className="w-[2.5px] bg-[#BE123C] rounded-full animate-[bounce_0.8s_ease-in-out_infinite] h-full" />
                  <span className="w-[2.5px] bg-[#BE123C] rounded-full animate-[bounce_1.1s_ease-in-out_infinite_0.2s] h-3/4" />
                  <span className="w-[2.5px] bg-[#BE123C] rounded-full animate-[bounce_0.9s_ease-in-out_infinite_0.4s] h-full" />
                </div>
              ) : (
                <Music className="w-3.5 h-3.5 text-rose-500 animate-gentle-float" />
              )}
            </div>

            {/* Label and Subtitle */}
            <div className="flex flex-col text-left pr-1 select-none">
              <span className="text-xs font-semibold text-[#881337] tracking-tight leading-tight whitespace-nowrap">
                {SONG_LABEL}
              </span>
              <span className="text-[10px] text-stone-500 font-mono tracking-wider leading-none">
                {isPlaying ? '♪ Phir Le Aya Dil' : 'Tap play to listen ♫'}
              </span>
            </div>

            {/* Controls: Play / Pause */}
            <button
              onClick={togglePlay}
              disabled={!isReady && !playerRef.current}
              aria-label={isPlaying ? 'Pause song' : 'Play song'}
              className="p-2 rounded-full bg-gradient-to-r from-[#881337] to-[#BE123C] text-white hover:scale-105 active:scale-95 shadow-md shadow-rose-900/20 transition-all flex items-center justify-center flex-shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-white" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
              )}
            </button>

            {/* Controls: Mute / Unmute (visible when playing) */}
            {isPlaying && (
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute music' : 'Mute music'}
                className="p-1.5 rounded-full bg-rose-50 border border-rose-200 text-[#881337] hover:bg-rose-100 transition-colors flex items-center justify-center flex-shrink-0"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-stone-500" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
