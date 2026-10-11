import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Play, Pause } from 'lucide-react';
import { apologyConfig } from '../data/apologyConfig';

/**
 * Romantic Audio Player:
 * - Plays local MP3 if available
 * - Falls back to an elegant Web Audio API procedural acoustic piano if MP3 fails
 * - Stays strictly paused until visitor explicitly clicks play
 */
export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [useSynth, setUseSynth] = useState(false);
  const [synthNoteIndex, setSynthNoteIndex] = useState(0);

  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const synthTimerRef = useRef(null);

  // Piano chord notes (Hz) for romantic arpeggio (Cmaj9, Am9, Fmaj7, G6)
  const chordNotes = [
    [261.63, 329.63, 392.00, 493.88], // C, E, G, B
    [220.00, 261.63, 329.63, 392.00], // A, C, E, G
    [174.61, 220.00, 261.63, 329.63], // F, A, C, E
    [196.00, 246.94, 293.66, 392.00], // G, B, D, G
  ];

  // Procedural soft piano note
  const playPianoNote = (freq) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Warm acoustic tone with soft lowpass filter
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(freq * 2, ctx.currentTime);

      const harmGain = ctx.createGain();
      harmGain.gain.setValueAtTime(0.12, ctx.currentTime);
      oscHarmonic.connect(harmGain);
      harmGain.connect(filter);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      // Soft gentle attack
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.08);
      // Natural bell-like decay
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      oscHarmonic.start(now);
      osc.stop(now + 3.0);
      oscHarmonic.stop(now + 3.0);
    } catch {
      // AudioContext safe fail
    }
  };

  // Start procedural piano loop
  const startSynthLoop = () => {
    let chordIdx = 0;
    let noteIdx = 0;

    const tick = () => {
      const currentChord = chordNotes[chordIdx];
      const freq = currentChord[noteIdx % currentChord.length];
      playPianoNote(freq);

      noteIdx++;
      if (noteIdx >= currentChord.length) {
        noteIdx = 0;
        chordIdx = (chordIdx + 1) % chordNotes.length;
      }
      synthTimerRef.current = setTimeout(tick, 950);
    };

    tick();
  };

  const stopSynthLoop = () => {
    if (synthTimerRef.current) {
      clearTimeout(synthTimerRef.current);
      synthTimerRef.current = null;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopSynthLoop();
      setIsPlaying(false);
    } else {
      if (useSynth) {
        startSynthLoop();
        setIsPlaying(true);
      } else if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Audio file blocked or not found, fall back to Web Audio synth
            setUseSynth(true);
            startSynthLoop();
            setIsPlaying(true);
          });
      } else {
        setUseSynth(true);
        startSynthLoop();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    return () => {
      stopSynthLoop();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-2">
      <audio
        ref={audioRef}
        src={apologyConfig.music.src}
        loop
        preload="metadata"
        onEnded={() => setIsPlaying(false)}
        onError={() => setUseSynth(true)}
      />

      <div className="relative group">
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#FFFDF9]/90 backdrop-blur-md border border-rose-200/70 shadow-sm hover:shadow-md hover:border-rose-300 text-[#881337] transition-all duration-300 active:scale-95"
        >
          {isPlaying ? (
            <>
              <div className="flex items-end gap-[3px] h-3.5 w-3.5 mr-0.5">
                <span className="w-0.5 bg-[#BE123C] rounded-full animate-[bounce_0.8s_ease-in-out_infinite] h-full" />
                <span className="w-0.5 bg-[#BE123C] rounded-full animate-[bounce_1.1s_ease-in-out_infinite_0.2s] h-3/4" />
                <span className="w-0.5 bg-[#BE123C] rounded-full animate-[bounce_0.9s_ease-in-out_infinite_0.4s] h-full" />
              </div>
              <span className="text-xs font-medium tracking-wide">Playing Piano</span>
              <Pause className="w-3.5 h-3.5 text-[#881337]" />
            </>
          ) : (
            <>
              <Music className="w-3.5 h-3.5 text-rose-400 group-hover:text-[#881337] transition-colors" />
              <span className="text-xs font-medium tracking-wide text-stone-600 group-hover:text-[#881337] transition-colors">
                Play Music ♫
              </span>
              <Play className="w-3.5 h-3.5 text-[#881337] fill-[#881337]" />
            </>
          )}
        </button>

        {/* Small hover tooltip */}
        <div className="absolute right-0 top-full mt-2 hidden group-hover:flex flex-col items-center pointer-events-none transition-opacity duration-200">
          <div className="px-2.5 py-1 text-[11px] font-normal rounded-md bg-[#2D1B28] text-white shadow-lg whitespace-nowrap">
            {isPlaying ? 'Click to pause soft piano' : 'Click to listen to soft piano'}
          </div>
        </div>
      </div>

      {isPlaying && (
        <button
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute music' : 'Mute music'}
          className="p-2 rounded-full bg-[#FFFDF9]/90 backdrop-blur-md border border-rose-200/70 text-[#881337] hover:bg-rose-50 transition-all duration-200 shadow-sm"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}
