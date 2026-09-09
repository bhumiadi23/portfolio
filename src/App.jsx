import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { siteConfig } from './data/siteConfig';

/* ─── tiny helpers ─── */
const fire = (opts = {}) => confetti({ particleCount: 75, spread: 85, origin: { y: 0.6 }, colors: ['#f43f5e','#ec4899','#f472b6','#fbbf24','#fff'], ...opts });
const fireworks = () => { const end = Date.now() + 3000; (function f(){ confetti({ particleCount: 5, angle: 60, spread: 65, origin:{x:0}, colors:['#f43f5e','#ec4899','#fbbf24'] }); confetti({ particleCount: 5, angle: 120, spread: 65, origin:{x:1}, colors:['#f472b6','#38bdf8','#fff'] }); if(Date.now()<end) requestAnimationFrame(f); })(); };

/* ─── Shimmering Pink Particle Canvas ─── */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if(!c) return;
    const ctx = c.getContext('2d'); let id;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const stars = Array.from({length:90}, () => ({ x: Math.random()*c.width, y: Math.random()*c.height, r: Math.random()*2+0.5, a: Math.random() }));
    const hearts = Array.from({length:25}, () => ({ x: Math.random()*c.width, y: c.height+Math.random()*100, s: Math.random()*14+6, vy: Math.random()*0.8+0.3, vx: (Math.random()-0.5)*0.4, o: Math.random()*0.6+0.3 }));
    const drawHeart = (x,y,s,o) => { ctx.save(); ctx.translate(x,y); ctx.globalAlpha=o; ctx.fillStyle=`hsla(340,90%,65%,${o})`; ctx.beginPath(); const t=s*0.3; ctx.moveTo(0,t); ctx.bezierCurveTo(0,0,-s/2,0,-s/2,t); ctx.bezierCurveTo(-s/2,(s+t)/2,0,s,0,s); ctx.bezierCurveTo(0,s,s/2,(s+t)/2,s/2,t); ctx.bezierCurveTo(s/2,0,0,0,0,t); ctx.fill(); ctx.restore(); };
    const loop = () => {
      ctx.clearRect(0,0,c.width,c.height);
      stars.forEach(s => { s.a += Math.sin(Date.now()*0.002+s.x)*0.01; ctx.globalAlpha=Math.max(0.15,Math.min(1,s.a)); ctx.fillStyle='#ffb6c1'; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill(); });
      hearts.forEach(h => { h.y -= h.vy; h.x += h.vx + Math.sin(h.y*0.01)*0.3; if(h.y < -20){ h.y=c.height+20; h.x=Math.random()*c.width; } drawHeart(h.x,h.y,h.s,h.o); });
      id = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-0 opacity-80" />;
}

/* ─── Screen wrapper ─── */
function Screen({ id, children }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 25, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -25, scale: 1.03 }}
      transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
      className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center px-4 md:px-6 min-h-0"
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 0 — LOADING
   ═══════════════════════════════════════════ */
function LoadingScreen({ onDone }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPct(p => { if(p>=100){ clearInterval(t); setTimeout(onDone, 500); return 100; } return p+2; }), 25);
    return () => clearInterval(t);
  }, [onDone]);
  return (
    <motion.div exit={{ opacity:0, filter:'blur(16px)' }} transition={{ duration:0.8 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#180410]">
      <div className="absolute w-[500px] h-[500px] bg-rose-500/25 rounded-full blur-[160px] animate-pulse" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="text-6xl animate-heartbeat">💖</div>
        <p className="text-pink-200 text-xl font-light italic font-serif">
          {pct < 50 ? 'Creating something beautiful...' : 'Made with love for Annuva'}
        </p>
        <div className="w-72 h-2.5 bg-pink-950/60 rounded-full overflow-hidden p-0.5 border border-pink-400/40">
          <div className="h-full bg-gradient-to-r from-rose-500 via-pink-400 to-amber-300 rounded-full transition-all" style={{width:`${pct}%`}} />
        </div>
        <span className="text-xs font-mono text-pink-300">{pct}%</span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 1 — ENTER
   ═══════════════════════════════════════════ */
function EnterScreen({ onEnter }) {
  return (
    <Screen id="enter">
      <div className="absolute w-[550px] h-[550px] bg-rose-500/25 rounded-full blur-[180px] pointer-events-none animate-pulse" />
      <div className="absolute w-80 h-80 bg-pink-500/20 rounded-full blur-[130px] pointer-events-none" />

      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:1}} className="relative z-10 space-y-6 w-full max-w-xl">
        <motion.span animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 3 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-pink-500/20 border border-pink-400/50 text-pink-200 text-xs md:text-sm uppercase tracking-widest font-bold shadow-lg shadow-rose-950/50">
          ✨ A World Made Just For You
        </motion.span>
        
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-serif text-white">
          Hey, <span className="bg-gradient-to-r from-rose-300 via-pink-200 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(244,63,94,0.8)]">Penguin 🐧</span>...
        </h1>
        <p className="text-sm md:text-base text-pink-300/90 font-serif italic tracking-wider">
          (My Rasmalai 🍯 • Hot Babe 🔥 • My Nestle 🍫 — From your Nestle Consumer 💖)
        </p>
        <p className="text-lg md:text-xl text-pink-100 font-light italic leading-relaxed">
          "I created something special & magical just for you."
        </p>

        <div className="relative pt-6">
          <motion.button
            whileHover={{ scale: 1.08, boxShadow: '0 0 60px rgba(244,63,94,0.9)' }}
            whileTap={{ scale: 0.94 }}
            onClick={onEnter}
            className="relative group overflow-hidden bg-gradient-to-r from-rose-600 via-pink-500 to-rose-500 text-white font-extrabold text-xl md:text-2xl px-12 py-5 rounded-full shadow-[0_0_40px_rgba(244,63,94,0.7)] border-2 border-white/50 cursor-pointer transition-all duration-300"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative z-10 flex items-center gap-3">
              <span className="animate-heartbeat">💖</span> ENTER MY WORLD <span className="animate-heartbeat">💖</span>
            </span>
          </motion.button>
        </div>
      </motion.div>
    </Screen>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 1 — CUPID'S BOW & ARROW (EXACT REPLICA OF USER REFERENCE)
   ═══════════════════════════════════════════ */
function CupidBowGame() {
  const containerRef = useRef(null);
  const [pull, setPull] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [shooting, setShooting] = useState(false);
  const [hit, setHit] = useState(false);
  const [ballFalling, setBallFalling] = useState(false);
  const [screenPink, setScreenPink] = useState(false);
  const [typedLetter, setTypedLetter] = useState('');
  const [videoSrc, setVideoSrc] = useState('/media/videos/final.mp4');
  const [videoError, setVideoError] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const letterText = "Happy Birthday to the woman who makes my heart race, my soul smile, and my future worth dreaming about. I love you more than words can ever express.";

  // Typewriter effect when screen turns pink
  useEffect(() => {
    if (!screenPink) return;
    let i = 0;
    const timer = setInterval(() => {
      if (i <= letterText.length) {
        setTypedLetter(letterText.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 24);
    return () => clearInterval(timer);
  }, [screenPink]);

  // Pointer pull handlers (pull back diagonally toward bottom-left)
  const handlePointerDown = (e) => {
    if (shooting || hit || ballFalling) return;
    setIsPulling(true);
    e.target.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isPulling || shooting || hit || ballFalling) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const originX = rect.width * 0.28;
    const originY = rect.height * 0.72;
    const dx = originX - (e.clientX - rect.left);
    const dy = (e.clientY - rect.top) - originY;
    const dist = Math.max(0, Math.min(85, Math.hypot(dx, dy)));
    setPull(dist);
  };

  const handlePointerUp = () => {
    if (!isPulling) return;
    setIsPulling(false);
    if (pull > 20 && !shooting && !hit && !ballFalling) {
      triggerShoot();
    } else {
      setPull(0);
    }
  };

  const triggerShoot = () => {
    if (shooting || hit || ballFalling) return;
    setShooting(true);
    setPull(0);

    // 1. Arrow flies straight into the heart
    setTimeout(() => {
      setHit(true);
      setShooting(false);
      fire({ particleCount: 70, spread: 70, origin: { x: 0.72, y: 0.26 } });

      // 2. Heart releases and drops a color ball downwards
      setTimeout(() => {
        setBallFalling(true);
      }, 300);

      // 3. When color ball drops, bounces, and rebounds, it bursts and opens the cinematic letter/video page!
      setTimeout(() => {
        fireworks();
        fire({
          particleCount: 220,
          spread: 150,
          origin: { x: 0.5, y: 0.65 },
          colors: ['#ff4081', '#ff80ab', '#ffffff', '#ffd54f', '#ff1744', '#f43f5e']
        });
        setScreenPink(true);
        // Try auto-playing the video if ready
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().then(() => setIsVideoPlaying(true)).catch(() => {});
          }
        }, 500);
      }, 1650);
    }, 600);
  };

  const toggleVideoPlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (isVideoPlaying) {
      v.pause();
      setIsVideoPlaying(false);
    } else {
      v.play().then(() => {
        setIsVideoPlaying(true);
        setVideoError(false);
      }).catch(() => {
        setIsVideoPlaying(false);
      });
    }
  };

  const handleVideoSeek = (e) => {
    const v = videoRef.current;
    if (!v || !videoDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const newTime = Math.max(0, Math.min(videoDuration, (clickX / rect.width) * videoDuration));
    v.currentTime = newTime;
    setVideoProgress(newTime / videoDuration);
  };

  const toggleVideoMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setVideoError(false);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().then(() => setIsVideoPlaying(true)).catch(() => {});
        }
      }, 150);
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const resetGame = () => {
    setHit(false);
    setShooting(false);
    setBallFalling(false);
    setScreenPink(false);
    setPull(0);
    setTypedLetter('');
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Angle of bow aiming toward the heart (approx -42 degrees)
  const angle = -42;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="relative w-full h-[78vh] md:h-[84vh] max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl transition-colors duration-1000 select-none flex flex-col justify-between"
      style={{
        backgroundColor: screenPink ? '#ff7597' : '#fcf8f5',
        fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
      }}
    >
      {/* ─── NORMAL ARENA (MATCHING USER'S PHOTO EXACTLY) ─── */}
      {!screenPink && (
        <div className="relative w-full h-full flex flex-col justify-between p-6 md:p-12">
          {/* Subtle Ambient Pink Glow behind the Heart */}
          <div
            className="absolute right-[12%] md:right-[20%] top-[12%] md:top-[15%] w-72 h-72 md:w-[420px] md:h-[420px] rounded-full pointer-events-none transition-all duration-700"
            style={{
              background: 'radial-gradient(circle, rgba(255, 130, 168, 0.45) 0%, rgba(255, 175, 204, 0.2) 45%, rgba(252, 248, 245, 0) 70%)',
              filter: 'blur(20px)',
            }}
          />

          {/* Top Elegant Serif Text */}
          <div className="w-full text-center pt-2 md:pt-4 z-10">
            <h2 className="text-xl md:text-2xl tracking-[0.08em] text-[#703d47] font-normal italic font-serif">
              The Best Gift Is Loving You
            </h2>
          </div>

          {/* Center-Right: Glowing 3D Heart with White Highlight */}
          <div className="absolute right-[18%] md:right-[26%] top-[18%] md:top-[22%] z-10 flex flex-col items-center">
            <motion.div
              animate={
                hit
                  ? { scale: [1, 1.45, 1.2], rotate: [0, 12, -12, 0] }
                  : { y: [-6, 6, -6], scale: [1, 1.03, 1] }
              }
              transition={
                hit
                  ? { duration: 0.5 }
                  : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
              }
              className="relative cursor-pointer"
              onClick={() => { if (!shooting && !hit) triggerShoot(); }}
            >
              {/* Target Indicator */}
              {hit && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  className="absolute -top-6 -right-6 text-5xl z-30 drop-shadow-lg"
                >
                  🎯
                </motion.div>
              )}

              {/* 3D Heart matching reference photo */}
              <svg
                viewBox="0 0 140 130"
                className="w-32 h-32 md:w-44 md:h-44 filter drop-shadow-[0_20px_40px_rgba(235,51,118,0.45)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <radialGradient id="exactHeartGradient" cx="44%" cy="34%" r="66%">
                    <stop offset="0%" stopColor="#ffa6c1" />
                    <stop offset="28%" stopColor="#ff4081" />
                    <stop offset="70%" stopColor="#d81b60" />
                    <stop offset="100%" stopColor="#880e4f" />
                  </radialGradient>
                </defs>
                {/* Heart Curves */}
                <path
                  d="M70,120 C70,120 12,82 12,42 C12,19 29,8 48,8 C59,8 66,15 70,21 C74,15 81,8 92,8 C111,8 128,19 128,42 C128,82 70,120 70,120 Z"
                  fill="url(#exactHeartGradient)"
                />
                {/* White Gloss Specular Highlight Oval (from reference) */}
                <ellipse
                  cx="44"
                  cy="36"
                  rx="11"
                  ry="7"
                  transform="rotate(-25 44 36)"
                  fill="white"
                  opacity="0.88"
                />
              </svg>
            </motion.div>
          </div>

          {/* Flying Arrow with exact trajectory into the heart */}
          {shooting && (
            <motion.div
              initial={{ left: '16%', top: '74%', opacity: 1, scale: 0.85 }}
              animate={{ left: '68%', top: '27%', opacity: 1, scale: 1.15 }}
              transition={{ duration: 0.65, ease: [0.15, 0.85, 0.35, 1] }}
              className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <svg viewBox="0 0 120 30" className="w-28 h-8 md:w-36 md:h-10" fill="none">
                <line x1="12" y1="15" x2="95" y2="15" stroke="#3e2316" strokeWidth="3" strokeLinecap="round" />
                <polygon points="95,9 116,15 95,21" fill="#f43f5e" stroke="#ffe4e6" strokeWidth="1" />
                <path d="M12 7 L 26 15 L 12 23" stroke="#ff4081" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M6 9 L 18 15 L 6 21" stroke="#ff80ab" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </motion.div>
          )}

          {/* Embedded Arrow in Heart right after hit */}
          {hit && !screenPink && (
            <motion.div
              initial={{ scale: 1.3, opacity: 1 }}
              animate={{ scale: [1.2, 1], rotate: [-45, -42] }}
              className="absolute right-[22%] md:right-[30%] top-[24%] md:top-[28%] z-25 pointer-events-none"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <svg viewBox="0 0 80 25" className="w-20 h-6 md:w-24 md:h-8" fill="none">
                <line x1="10" y1="12" x2="65" y2="12" stroke="#3e2316" strokeWidth="3" strokeLinecap="round" />
                <polygon points="65,7 78,12 65,17" fill="#f43f5e" />
                <path d="M10 6 L 22 12 L 10 18" stroke="#ff4081" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </motion.div>
          )}

          {/* Bottom-Left: Interactive Cupid's Bow with Pull String */}
          <div
            className="absolute left-[6%] md:left-[10%] bottom-[8%] md:bottom-[10%] z-20"
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: 'center center' }}
          >
            <div
              onPointerDown={handlePointerDown}
              className="relative w-40 h-48 md:w-52 md:h-60 cursor-grab active:cursor-grabbing touch-none select-none flex items-center justify-center"
            >
              <svg viewBox="0 0 160 200" className="w-full h-full overflow-visible" fill="none">
                <path
                  d="M50 20 C 120 60, 120 140, 50 180"
                  stroke="#5c2c1a"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <path
                  d="M50 20 C 115 60, 115 140, 50 180"
                  stroke="#874328"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <rect x="94" y="90" width="12" height="20" rx="3" fill="#2d150c" />

                <path
                  d={`M50 20 Q ${50 - pull * 0.9} 100 50 180`}
                  stroke="#e2e8f0"
                  strokeWidth="2"
                />

                {!shooting && !hit && (
                  <g transform={`translate(${-pull * 0.85}, 0)`}>
                    <line x1="30" y1="100" x2="140" y2="100" stroke="#3e2316" strokeWidth="3" strokeLinecap="round" />
                    <polygon points="140,93 158,100 140,107" fill="#f43f5e" stroke="#fff" strokeWidth="1" />
                    <path d="M30 92 L 46 100 L 30 108" stroke="#ff4081" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M22 94 L 36 100 L 22 106" stroke="#ff80ab" strokeWidth="2.5" strokeLinecap="round" />

                    <circle cx="48" cy="100" r="14" fill="white" opacity="0.9" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
                    <text x="48" y="105" textAnchor="middle" fontSize="13">👆</text>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Bottom Centered Subtitle */}
          <div className="w-full text-center pb-2 z-10">
            <button
              onClick={triggerShoot}
              disabled={shooting || hit || ballFalling}
              className="inline-block tracking-[0.3em] text-[11px] md:text-xs text-[#8c5863] uppercase font-serif font-bold transition-all hover:text-[#5c2c1a] active:scale-95 cursor-pointer"
            >
              {isPulling ? 'Release to shoot! 💘' : 'PULL & RELEASE'}
            </button>
          </div>

          {/* COLOR BALL DROPS & REBOUNCES FROM THE HEART */}
          {ballFalling && (
            <motion.div
              initial={{ left: '72%', top: '28%', scale: 0.3, opacity: 0 }}
              animate={{
                // Drop down, bounce up, drop down again to splash open letter
                left: ['72%', '62%', '52%', '50%'],
                top: ['28%', '76%', '46%', '80%'],
                scale: [0.3, 1.2, 1.35, 1.7],
                opacity: [0, 1, 1, 1],
                rotate: [0, 240, 480, 720],
              }}
              transition={{
                duration: 1.4,
                times: [0, 0.5, 0.78, 1],
                ease: ['easeIn', 'easeOut', 'easeIn'],
              }}
              className="absolute z-40 pointer-events-none -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-16 h-16 md:w-22 md:h-22 rounded-full p-1 bg-gradient-to-tr from-yellow-300 via-pink-500 to-indigo-500 shadow-[0_0_40px_rgba(255,255,255,0.95)] filter drop-shadow-[0_8px_25px_rgba(244,63,94,0.9)] flex items-center justify-center animate-spin">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-100 via-rose-400 to-purple-600 flex items-center justify-center relative overflow-hidden shadow-inner">
                  <div className="absolute top-1 left-2 w-5 h-3 rounded-full bg-white/90 blur-[1px] rotate-[-20deg]" />
                  <span className="text-xl md:text-2xl animate-pulse">💖</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ─── FULL-SCREEN SCRIPT OF LOVE (PAGE OPENED BY COLOR BALL SPLASH) ─── */}
      {screenPink && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full h-full flex flex-col justify-between items-center p-6 md:p-14 text-white overflow-y-auto no-scrollbar z-30"
          style={{
            background: 'linear-gradient(145deg, #ff85a2 0%, #ff5d8f 50%, #f43f5e 100%)',
          }}
        >
          {/* Ambient center light halo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-white/20 rounded-full blur-[140px] pointer-events-none" />

          {/* Top Bar */}
          <div className="w-full flex justify-between items-center z-10 pt-2">
            <span className="text-xs uppercase tracking-[0.25em] font-serif text-white/80 font-bold">
              The Best Gift Is Loving You
            </span>
            <button
              onClick={resetGame}
              className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/35 text-white text-xs font-serif tracking-wider uppercase border border-white/40 cursor-pointer shadow transition-all"
            >
              ↺ Shoot Again
            </button>
          </div>

          {/* Center: Cinematic Unfolding Message Box with Photos and Wishes */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="my-auto py-6 max-w-2xl w-full z-10 flex flex-col items-center"
          >
            {/* The Unfolding Glass Card */}
            <div className="relative w-full rounded-3xl p-6 md:p-8 bg-white/20 backdrop-blur-xl border-2 border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.18)] flex flex-col items-center space-y-6">
              
              {/* Floating Heart Ribbon */}
              <div className="flex items-center gap-3">
                <span className="text-2xl animate-bounce">💌</span>
                <span className="text-xs uppercase tracking-[0.3em] text-amber-100 font-serif font-bold">
                  Our Cinematic Script of Love
                </span>
                <span className="text-2xl animate-bounce">💌</span>
              </div>

              <h1 className="text-2xl md:text-4xl font-serif font-bold text-white tracking-wide text-center drop-shadow">
                Happy 17th Birthday Penguin! 🐧🍯👑
              </h1>

              {/* Hidden file input for uploading/selecting custom video */}
              <input
                type="file"
                ref={fileInputRef}
                accept="video/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* CINEMATIC VIDEO PLAYER (EXCLUSIVE FOCUS) */}
              <div className="w-full max-w-xl flex flex-col items-center space-y-3">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-white/60 shadow-2xl bg-black group">
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={toggleVideoPlay}
                    onTimeUpdate={() => {
                      const v = videoRef.current;
                      if (v && v.duration) setVideoProgress(v.currentTime / v.duration);
                    }}
                    onLoadedMetadata={() => {
                      const v = videoRef.current;
                      if (v) setVideoDuration(v.duration);
                    }}
                    onEnded={() => {
                      setIsVideoPlaying(false);
                      fireworks();
                    }}
                    onError={() => {
                      setVideoError(true);
                      setIsVideoPlaying(false);
                    }}
                  />

                  {/* Play/Pause Overlay Button when video is paused */}
                  {!isVideoPlaying && !videoError && (
                    <button
                      onClick={toggleVideoPlay}
                      aria-label="Play Video"
                      className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all cursor-pointer group-hover:bg-black/30"
                    >
                      <motion.div
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.92 }}
                        className="w-16 h-16 rounded-full bg-rose-600/90 border-2 border-white/80 shadow-[0_0_30px_rgba(244,63,94,0.8)] flex items-center justify-center text-white"
                      >
                        <span className="text-2xl ml-1">▶</span>
                      </motion.div>
                    </button>
                  )}

                  {/* Error / Ready for Video Card with Device File Chooser */}
                  {videoError && (
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-950/95 via-slate-950/95 to-rose-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
                      <span className="text-5xl animate-bounce">🎬</span>
                      <h4 className="text-xl font-serif font-bold text-white">Our Special Video</h4>
                      <p className="text-xs text-pink-200/90 max-w-sm font-serif leading-relaxed">
                        Ready to play your video for Annuva! Click below to choose your video file or place it in <span className="underline font-mono">/public/media/videos/final.mp4</span>:
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-2.5 rounded-full bg-white text-rose-600 font-serif font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.7)] hover:bg-rose-50 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span>📁</span> Choose Video File (.mp4 / .mov)
                      </button>
                    </div>
                  )}

                  {/* Controls Bar */}
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    {/* Scrubber */}
                    <div
                      className="h-1.5 bg-white/30 rounded-full cursor-pointer overflow-hidden"
                      onClick={handleVideoSeek}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-100"
                        style={{ width: `${videoProgress * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-white/90 font-mono">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={toggleVideoPlay}
                          className="hover:text-pink-300 transition-colors cursor-pointer text-sm"
                        >
                          {isVideoPlaying ? '⏸' : '▶'}
                        </button>
                        <span>
                          {formatTime(videoRef.current?.currentTime)} / {formatTime(videoDuration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleVideoMute}
                          className="hover:text-pink-300 transition-colors cursor-pointer text-sm"
                        >
                          {isMuted ? '🔇' : '🔊'}
                        </button>
                        <button
                          onClick={handleFullscreen}
                          className="hover:text-pink-300 transition-colors cursor-pointer text-sm"
                          title="Fullscreen"
                        >
                          ⛶
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 text-[10px] uppercase font-serif cursor-pointer flex items-center gap-1"
                          title="Pick video from device"
                        >
                          📁 Change Video
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-pink-100 font-serif italic">
                  Tap video to play / pause • Click ⛶ for full screen view
                </span>
              </div>

              {/* Typewritten Love Note */}
              <div className="w-full bg-white/15 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-white/40 shadow-inner">
                <p className="text-base md:text-xl font-serif italic text-white leading-relaxed text-center drop-shadow">
                  "{typedLetter}"
                  <span className="inline-block w-0.5 h-5 bg-white ml-1 animate-pulse align-middle" />
                </p>
              </div>

              <div className="pt-1 flex flex-col items-center space-y-1">
                <span className="text-xs font-serif italic text-pink-100">Forever & Always Yours,</span>
                <span className="text-xl md:text-2xl font-serif font-extrabold text-amber-200 tracking-wider">
                  Your Nestle Consumer ❤️
                </span>
              </div>
            </div>
          </motion.div>

          {/* Bottom Action Button */}
          <div className="w-full flex justify-center z-10 pb-2">
            <button
              onClick={() => {
                fireworks();
                fire({ particleCount: 160, spread: 140 });
              }}
              className="px-8 py-3.5 rounded-full bg-white text-rose-600 font-serif font-bold text-sm tracking-wider uppercase shadow-[0_0_35px_rgba(255,255,255,0.7)] hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
            >
              🎆 Celebrate With Fireworks 🎆
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 2 — COUNTDOWN TIMER
   ═══════════════════════════════════════════ */
function Countdown() {
  const [t, setT] = useState({d:0,h:0,m:0,s:0});
  const [done, setDone] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(siteConfig.birthdayDate).getTime() - Date.now();
      if(diff<=0){
        if(!done){
          setDone(true);
          fireworks();
          fire({particleCount:150,spread:120});
        }
        setT({d:0,h:0,m:0,s:0});
        return;
      }
      setT({ d:Math.floor(diff/864e5), h:Math.floor(diff%864e5/36e5), m:Math.floor(diff%36e5/6e4), s:Math.floor(diff%6e4/1e3) });
    };
    calc();
    const i=setInterval(calc,1000);
    return ()=>clearInterval(i);
  },[done]);

  const units = [['Days',t.d],['Hours',t.h],['Mins',t.m],['Secs',t.s]];

  return (
    <Screen id="countdown">
      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-200 text-xs md:text-sm uppercase tracking-widest font-bold mb-4">
        🕐 Birthday Countdown
      </span>
      <h2 className="text-3xl md:text-5xl font-bold text-white font-serif mb-8">
        {done ? <span className="text-rose-300">🎉 IT'S 12:00 AM! HAPPY BIRTHDAY PENGUIN! 🎉</span> : "Counting down to Penguin's special day 🐧"}
      </h2>
      <div className="grid grid-cols-4 gap-3 md:gap-4 w-full max-w-md">
        {units.map(([label,val],i) => (
          <motion.div key={label} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{delay:i*0.1}}
            className="glass-pink border border-pink-400/40 rounded-3xl p-4 md:p-6 flex flex-col items-center shadow-2xl bg-pink-950/40">
            <span className="text-4xl md:text-5xl font-bold text-white font-mono drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]">
              {String(val).padStart(2,'0')}
            </span>
            <span className="text-xs uppercase tracking-wider text-pink-200 font-bold mt-2">{label}</span>
          </motion.div>
        ))}
      </div>

      {done ? (
        <button onClick={()=>{fire({particleCount:120,spread:100}); fireworks();}} className="mt-8 px-8 py-4 rounded-full bg-rose-600 border border-white/40 text-white font-extrabold hover:bg-rose-500 active:scale-95 transition-all cursor-pointer shadow-2xl animate-pulse">
          🎆 Launch Celebration Fireworks 🎆
        </button>
      ) : (
        <div className="mt-6 px-6 py-2.5 rounded-full bg-pink-950/80 border border-pink-400/30 text-pink-200/90 text-xs font-mono font-semibold flex items-center gap-2">
          <span>🔒 Fireworks & Crackers unlock at 12:00 AM on 10th September!</span>
        </div>
      )}

      {/* Heartfelt Birthday Letter & Prayer Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="mt-6 w-full max-w-xl glass-pink border border-pink-400/40 rounded-3xl p-6 md:p-8 bg-gradient-to-br from-pink-950/80 via-slate-950/90 to-rose-950/80 shadow-2xl space-y-4 text-left"
      >
        <div className="flex items-center gap-2 border-b border-pink-400/30 pb-3">
          <span className="text-2xl animate-bounce">💖</span>
          <h3 className="text-lg md:text-xl font-serif font-bold text-pink-200 tracking-wide">
            Happyyyy Birthdayyyy myy therapist 🌸
          </h3>
        </div>
        <div className="space-y-3 font-serif text-sm md:text-base leading-relaxed text-pink-50">
          <p>
            Happiest birthday to the girl who has always stayed beside me, no matter what life brings. You're my strongest woman, my biggest comfort and my safest place.
          </p>
          <p className="italic text-pink-200/95">
            I pray that your life is always filled with happiness, peace and endless smiles. I hope my prayers hug you whenever my arms can't.
          </p>
          <p>
            Thank you for always supporting me, understanding me and never giving up on me. I truly can't imagine my life without you.
          </p>
          <p className="text-amber-200/90">
            May this year bring you everything your heart has been silently wishing for. Keep shining, keep smiling and never forget how deeply loved and appreciated you are.
          </p>
          <p className="font-semibold text-rose-200">
            Having you in my life is one of God's biggest blessings and I'll always be thankful for you.
          </p>
        </div>
        <div className="pt-2 border-t border-pink-400/30 text-right">
          <span className="text-xs md:text-sm font-serif italic text-pink-300 font-bold">
            Happy Birthday once again, my favorite person. ❤️
          </span>
        </div>
      </motion.div>
    </Screen>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 3 — CINEMATIC VIDEO TYPEWRITER MEMORY PLAYER
   ═══════════════════════════════════════════ */
function VideoTypewriterScreen() {
  const fullMessage = "Penguin, from the exact moment you entered my life 1 year and 3 months ago, every second has felt like a movie. You're my sweet Rasmalai, my hot babe, and my favorite Nestle chocolate. Your laugh, your smile, the way you care — you are my absolute favorite story.";
  const [typed, setTyped] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullMessage.length) {
        setTyped(fullMessage.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [fullMessage]);

  return (
    <Screen id="videotype">
      <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-200 text-xs md:text-sm uppercase tracking-widest font-bold mb-4">
        🎬 Cinematic Memory Player
      </span>
      <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-6">Our Love Story Movie</h2>

      <div className="relative w-full max-w-xl rounded-3xl overflow-hidden border-2 border-pink-400/50 shadow-2xl bg-gradient-to-br from-pink-950/90 via-slate-950 to-rose-950/90 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-pink-500/30 pb-4 text-xs font-mono text-pink-200">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="font-bold uppercase tracking-wider text-rose-300">PLAYING: ANNUVA_STORY.MOV</span>
          </div>
          <span className="text-pink-300">4K Ultra HD</span>
        </div>

        <div className="min-h-[120px] flex items-center justify-center text-left">
          <p className="text-lg md:text-2xl font-serif italic text-white leading-relaxed">
            "{typed}"<span className="inline-block w-0.5 h-6 bg-pink-300 ml-1 animate-pulse" />
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-pink-500/30 pt-4 text-xs font-mono text-pink-200">
          <button onClick={() => setIsPlaying(!isPlaying)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-100 hover:bg-pink-500/40 transition-all cursor-pointer">
            {isPlaying ? '⏸ Pause Movie' : '▶ Play Movie'}
          </button>
          <span className="italic text-pink-300 font-serif font-semibold">— Directed with ❤️ for Penguin</span>
        </div>
      </div>
    </Screen>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 4 — NAME REVEAL
   ═══════════════════════════════════════════ */
function NameReveal() {
  const letters = Array.from("Annuva");
  return (
    <Screen id="name">
      <p className="text-xl text-pink-100 font-light italic mb-2">Today isn't just another day...</p>
      <p className="text-lg text-pink-200 font-medium mb-6">because someone truly extraordinary was born.</p>
      <div className="flex gap-2 md:gap-4 justify-center flex-wrap">
        {letters.map((ch, i) => (
          <motion.span key={i} initial={{opacity:0,y:40,filter:'blur(10px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} transition={{delay:0.4+i*0.1, duration:0.6}}
            className="text-6xl md:text-9xl font-extrabold bg-gradient-to-b from-amber-100 via-pink-200 to-rose-400 bg-clip-text text-transparent font-serif drop-shadow-[0_0_35px_rgba(244,63,94,0.8)]">
            {ch}
          </motion.span>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.7 }}
        className="text-sm md:text-base text-pink-200/90 font-serif italic mt-5"
      >
        🐧 My Penguin • 🍯 My Rasmalai • 🔥 My Hot Babe • 🍫 My Nestle
      </motion.p>
      <motion.div initial={{scaleX:0}} animate={{scaleX:1}} transition={{delay:1.2,duration:0.8}} className="w-36 h-1.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto rounded-full mt-6" />
    </Screen>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 5 — "OPEN WHEN" POP-UP CARDS
   ═══════════════════════════════════════════ */
function OpenWhenCards() {
  const [active, setActive] = useState(null);
  const notes = [
    {
      title: "Happy Birthday, Gorgeous! ✨",
      message: "Happy birthday, gorgeous! I love you more than anything and I hope you have a truly amazing day."
    },
    {
      title: "As Wonderful As You Are 🌸",
      message: "I hope that your birthday is as wonderful as you are. You mean everything to me, and I hope you know that."
    },
    {
      title: "My Beautiful Rock 💖",
      message: "Happy birthday my beautiful girlfriend! Thank you for being my rock in these tough times and for always being there for me."
    },
    {
      title: "So Grateful For You, My Love 👑",
      message: "Happy birthday, my love! I am so grateful to have you in my life. You make everything so much better and I couldn't imagine my life without you."
    },
  ];
  const icons = ['✨','🌸','💖','👑'];
  return (
    <Screen id="openwhen">
      <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-200 text-xs md:text-sm uppercase tracking-widest font-bold mb-5">
        ✉️ Special Pop-up Letters
      </span>
      <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-6">Open When...</h2>
      <div className="grid grid-cols-2 gap-4 w-full">
        {notes.map((n,i) => (
          <motion.button key={i} whileHover={{scale:1.04,y:-4}} whileTap={{scale:0.96}}
            onClick={() => { setActive(i); fire({particleCount:30,spread:50}); }}
            className="glass-pink border border-pink-400/40 rounded-3xl p-6 text-left space-y-3 hover:border-pink-300 transition-all group cursor-pointer bg-pink-950/50">
            <div className="text-3xl">{icons[i]}</div>
            <h3 className="text-base md:text-lg font-bold text-white group-hover:text-pink-200 transition-colors font-serif">{n.title}</h3>
            <p className="text-xs text-pink-200/90 font-mono font-semibold">Tap to open →</p>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setActive(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4">
            <motion.div initial={{scale:0.75,opacity:0,y:30}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.75,opacity:0,y:30}}
              onClick={e=>e.stopPropagation()} className="relative max-w-md w-full glass-pink p-8 md:p-10 rounded-3xl border border-pink-400/60 text-center space-y-6 shadow-2xl bg-slate-950/90">
              <button onClick={()=>setActive(null)} className="absolute top-4 right-4 text-pink-300 hover:text-white text-2xl cursor-pointer">✕</button>
              <div className="text-5xl animate-heartbeat">{icons[active]}</div>
              <h3 className="text-2xl font-bold text-white font-serif">{notes[active].title}</h3>
              <p className="text-white text-lg leading-relaxed italic font-serif bg-pink-950/70 p-5 rounded-2xl border border-pink-400/40">
                "{notes[active].message}"
              </p>
              <p className="text-sm text-pink-200 font-mono font-bold">With all my love, Your Nestle Consumer ❤️</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 6 — PHOTO REVEAL
   ═══════════════════════════════════════════ */
const PHOTOS = [
  { src: '/photos/photo1.png', caption: 'The way the light finds you... 🌸' },
  { src: '/photos/photo2.jpg', caption: 'That smile that stops my world 💛' },
  { src: '/photos/photo3.png', caption: 'My favorite view, always. 🌊' },
  { src: '/photos/photo4.png', caption: 'Beautiful beyond words ❤️' },
];

function PhotoReveal() {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState([]);

  const reveal = (i) => {
    if (!revealed.includes(i)) {
      setRevealed(r => [...r, i]);
      fire({ particleCount: 30, spread: 50 });
    }
    setIdx(i);
  };

  return (
    <Screen id="photos">
      <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-200 text-xs md:text-sm uppercase tracking-widest font-bold mb-4">
        📸 My Favorite Views Of You
      </span>
      <h2 className="text-3xl font-bold text-white font-serif mb-6">Tap each to reveal ✨</h2>

      <div className="relative w-full aspect-[3/4] max-w-sm mx-auto rounded-3xl overflow-hidden border-2 border-pink-400/50 shadow-2xl shadow-rose-950/70 mb-6 bg-pink-950/50">
        <AnimatePresence mode="wait">
          {revealed.includes(idx) ? (
            <motion.img
              key={`photo-${idx}`}
              src={PHOTOS[idx].src}
              alt={PHOTOS[idx].caption}
              initial={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
              className="w-full h-full object-cover"
            />
          ) : (
            <motion.div
              key={`placeholder-${idx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-950/80 to-rose-950/90"
            >
              <span className="text-6xl mb-4 animate-heartbeat">💖</span>
              <p className="text-pink-100 text-base font-serif italic font-semibold">Tap thumbnail below to reveal</p>
            </motion.div>
          )}
        </AnimatePresence>

        {revealed.includes(idx) && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
            className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-5 pt-12">
            <p className="text-base font-serif italic text-white font-semibold">{PHOTOS[idx].caption}</p>
          </motion.div>
        )}
      </div>

      <div className="flex gap-4 justify-center">
        {PHOTOS.map((p, i) => (
          <motion.button key={i} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => reveal(i)}
            className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${idx === i ? 'border-pink-400 shadow-lg shadow-pink-500/50 scale-105' : revealed.includes(i) ? 'border-pink-500/40' : 'border-white/30'}`}
          >
            {revealed.includes(i) ? (
              <img src={p.src} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-950 to-rose-950 flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </Screen>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 7 — REASONS I LOVE YOU
   ═══════════════════════════════════════════ */
function ReasonsCards() {
  const [flipped, setFlipped] = useState(null);
  const reasons = siteConfig.reasons || [];
  return (
    <Screen id="reasons">
      <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-200 text-xs md:text-sm uppercase tracking-widest font-bold mb-4">
        ❤️ Reasons I Love You
      </span>
      <h2 className="text-3xl font-bold text-white font-serif mb-6">Tap to Reveal Each Reason</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
        {reasons.map((r,i) => (
          <motion.div key={i} whileTap={{scale:0.95}} onClick={() => { setFlipped(flipped===i?null:i); fire({particleCount:20,spread:35}); }}
            className="h-40 cursor-pointer perspective">
            <div className={`relative w-full h-full rounded-3xl transition-transform duration-700 preserve-3d ${flipped===i?'rotate-y-180':''}`}>
              <div className="absolute inset-0 glass-pink border border-pink-400/40 rounded-3xl flex flex-col items-center justify-center gap-2 backface-hidden shadow-xl bg-pink-950/60">
                <span className="text-3xl">💖</span>
                <span className="text-xs font-mono text-pink-200 font-bold">Reason #{i+1}</span>
              </div>
              <div className="absolute inset-0 glass-pink border border-pink-300 bg-gradient-to-br from-rose-900 to-pink-950 rounded-3xl flex items-center justify-center p-4 rotate-y-180 backface-hidden shadow-2xl">
                <p className="text-sm font-medium text-white leading-relaxed font-serif text-center font-semibold">"{r}"</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Screen>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 8 — SCRATCH CARD
   ═══════════════════════════════════════════ */
function ScratchCard() {
  const canvasRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const c = canvasRef.current; if(!c) return;
    const ctx = c.getContext('2d');
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const g = ctx.createLinearGradient(0,0,c.width,c.height);
    g.addColorStop(0,'#881337'); g.addColorStop(1,'#4c0519');
    ctx.fillStyle = g; ctx.fillRect(0,0,c.width,c.height);
    ctx.font = 'bold 16px Outfit,sans-serif'; ctx.fillStyle = '#f472b6'; ctx.textAlign = 'center';
    ctx.fillText('Scratch here ✨', c.width/2, c.height/2);
    let down = false;
    const pos = e => { const r=c.getBoundingClientRect(); const cx=e.touches?e.touches[0].clientX:e.clientX; const cy=e.touches?e.touches[0].clientY:e.clientY; return {x:cx-r.left,y:cy-r.top}; };
    const scratch = p => { ctx.globalCompositeOperation='destination-out'; ctx.beginPath(); ctx.arc(p.x,p.y,24,0,Math.PI*2); ctx.fill();
      const d=ctx.getImageData(0,0,c.width,c.height).data; let cl=0; for(let i=3;i<d.length;i+=4) if(d[i]===0) cl++;
      if(cl/(d.length/4)>0.4 && !revealed){ setRevealed(true); fire({particleCount:65,spread:65}); }
    };
    const s1=e=>{down=true;scratch(pos(e));}; const s2=e=>{if(down)scratch(pos(e));}; const s3=()=>{down=false;};
    c.addEventListener('mousedown',s1); c.addEventListener('mousemove',s2); window.addEventListener('mouseup',s3);
    c.addEventListener('touchstart',s1); c.addEventListener('touchmove',s2); window.addEventListener('touchend',s3);
    return ()=>{ c.removeEventListener('mousedown',s1); c.removeEventListener('mousemove',s2); window.removeEventListener('mouseup',s3);
      c.removeEventListener('touchstart',s1); c.removeEventListener('touchmove',s2); window.removeEventListener('touchend',s3); };
  },[revealed]);
  return (
    <Screen id="scratch">
      <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-200 text-xs md:text-sm uppercase tracking-widest font-bold mb-4">
        ✨ Interactive Scratch Card
      </span>
      <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-6">Scratch To Reveal A Secret</h2>
      <div className="relative w-full h-48 rounded-3xl border border-pink-400/50 bg-gradient-to-br from-pink-950/80 to-rose-950/80 overflow-hidden shadow-2xl flex items-center justify-center p-6">
        <div className="z-0 space-y-2 text-center">
          <div className="text-4xl animate-heartbeat">💖</div>
          <p className="text-xl font-bold text-white font-serif">"{siteConfig.scratchCardMessage}"</p>
        </div>
        <canvas ref={canvasRef} className={`absolute inset-0 z-10 w-full h-full cursor-pointer transition-opacity duration-700 ${revealed?'opacity-0 pointer-events-none':'opacity-100'}`} />
      </div>
    </Screen>
  );
}

/* ─── Vault Photos Sub-Component ─── */
const VAULT_PICS = [
  { src: '/photos/vault1.jpg', label: 'Us ❤️' },
  { src: '/photos/vault2.jpg', label: 'Our Chat 💬' },
];

function VaultPhotos() {
  const [vi, setVi] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div className="space-y-4 pt-3 w-full">
      <div
        onClick={() => setFullscreen(true)}
        className="relative w-full h-80 md:h-96 rounded-3xl overflow-hidden border-2 border-pink-400/50 shadow-2xl cursor-pointer group bg-black/60"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={vi}
            src={VAULT_PICS[vi].src}
            alt={VAULT_PICS[vi].label}
            initial={{ opacity: 0, scale: 1.08, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-contain bg-pink-950/80"
          />
        </AnimatePresence>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 flex justify-between items-center text-sm text-pink-100 font-serif font-bold">
          <span>{VAULT_PICS[vi].label}</span>
          <span className="bg-rose-600/80 px-4 py-1.5 rounded-full border border-white/40 text-xs font-mono group-hover:bg-rose-500 transition-all text-white">
            🔍 Tap to Fullscreen
          </span>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        {VAULT_PICS.map((p, i) => (
          <button
            key={i}
            onClick={() => setVi(i)}
            className={`px-6 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${i === vi ? 'bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-lg shadow-pink-600/50 border border-white/50 scale-105' : 'bg-white/15 text-pink-200 hover:bg-white/25'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreen(false)}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-3"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center"
            >
              <button
                onClick={() => setFullscreen(false)}
                className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-rose-600 text-white flex items-center justify-center text-2xl font-bold shadow-2xl border border-white/40 hover:bg-rose-500 cursor-pointer"
              >
                ✕
              </button>

              <img
                src={VAULT_PICS[vi].src}
                alt={VAULT_PICS[vi].label}
                className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl border border-pink-400/50"
              />

              <p className="mt-4 text-center font-serif text-xl text-pink-200 italic font-semibold">
                {VAULT_PICS[vi].label} — Full View
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 9 — SECRET LOCK (Passcode 1009)
   ═══════════════════════════════════════════ */
function SecretLock() {
  const [code, setCode] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [err, setErr] = useState('');
  const cfg = siteConfig.secretLock;

  const tryUnlock = e => {
    e.preventDefault();
    const clean = code.trim();
    if (clean === cfg.passcode || clean === '1009' || clean === cfg.altPasscode) {
      setUnlocked(true);
      setErr('');
      fire({ particleCount: 90, spread: 80 });
    } else {
      setErr('Passcode is 1009 💕');
      setTimeout(() => setErr(''), 2500);
    }
  };

  return (
    <Screen id="lock">
      <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-200 text-xs md:text-sm uppercase tracking-widest font-bold mb-4">
        🔐 Private Vault
      </span>
      <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-2">Only You Can Unlock This</h2>
      <p className="text-pink-200 text-xs md:text-sm mb-6 font-mono font-semibold">Hint: Enter passcode <span className="text-pink-300 font-bold">1009</span> 💕</p>

      {!unlocked ? (
        <form onSubmit={tryUnlock} className="glass-pink border border-pink-400/50 p-6 md:p-8 rounded-3xl shadow-2xl space-y-5 w-full bg-pink-950/70">
          <div className="text-5xl animate-bounce">🔒</div>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Enter passcode 1009..."
            className="w-full bg-pink-950/90 border-2 border-pink-400/50 rounded-2xl px-6 py-4 text-center text-white placeholder-pink-300/60 font-mono tracking-widest text-2xl focus:outline-none focus:border-pink-300 shadow-inner font-bold"
          />
          {err && <p className="text-sm text-pink-300 font-bold animate-pulse">{err}</p>}
          <button type="submit" className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-500 to-rose-500 text-white font-extrabold text-base shadow-xl active:scale-95 transition-transform cursor-pointer">
            Unlock Vault 🔓
          </button>
        </form>
      ) : (
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="glass-pink border border-pink-400/60 p-6 rounded-3xl shadow-2xl text-center space-y-4 w-full bg-gradient-to-br from-pink-950/80 to-rose-950/90">
          <div className="flex items-center justify-center gap-2 text-pink-200"><span className="text-2xl">🔓</span><h3 className="text-xl font-bold font-serif text-white">Vault Unlocked!</h3></div>
          <p className="text-white text-base italic font-serif leading-relaxed font-normal">"{cfg.unlockedMessage}"</p>

          <VaultPhotos />
        </motion.div>
      )}
    </Screen>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 10 — CHOCOLATE BIRTHDAY CAKE
   ═══════════════════════════════════════════ */
const CELEBRATION_EMOJIS = ['🥳', '🎂', '✨', '🎉', '💖', '🎈', '🎆', '⭐', '💫', '🌸', '👑', '🎀', '🍰', '🍓', '💐', '🥂'];

function BirthdayCake() {
  const [stage, setStage] = useState(0); // 0: platter, 1: tier1, 2: tier2, 3: tier3, 4: candle drop from sky, 5: lit, 6: blown
  const [blown, setBlown] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const [typedMsg, setTypedMsg] = useState('');
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  const fullWish = "HAPPY 17TH BIRTHDAY MY SWEET PENGUIN! 🐧🎉 May all your dreams come true, my Rasmalai & hot babe! Every day with you is pure heaven. Forever & always with you!";

  // Sequential part-by-part assembly animation
  useEffect(() => {
    const t0 = setTimeout(() => { setStage(1); fire({ particleCount: 30, spread: 55 }); }, 500);
    const t1 = setTimeout(() => { setStage(2); fire({ particleCount: 40, spread: 65 }); }, 1500);
    const t2 = setTimeout(() => { setStage(3); fire({ particleCount: 50, spread: 75 }); }, 2500);
    const t3 = setTimeout(() => { setStage(4); fireworks(); }, 3500); // Single luxury candle drops from sky!
    const t4 = setTimeout(() => setStage(5), 4400); // Flame lit and ready to blow

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const blowOut = () => {
    if (blown || stage < 4) return;
    setBlown(true);
    setStage(6);
    setShowMsg(true);
    fireworks();
    fire({ particleCount: 240, spread: 150, origin: { y: 0.6 } });

    const ems = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      emoji: CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)],
      left: Math.random() * 90 + 5,
      delay: Math.random() * 1.5,
      size: Math.random() * 1.8 + 1.2,
    }));
    setFloatingEmojis(ems);
  };

  const rebuildCake = () => {
    setStage(0);
    setBlown(false);
    setShowMsg(false);
    setTypedMsg('');
    setTimeout(() => { setStage(1); fire({ particleCount: 30, spread: 50 }); }, 400);
    setTimeout(() => { setStage(2); fire({ particleCount: 35, spread: 60 }); }, 1400);
    setTimeout(() => { setStage(3); fire({ particleCount: 45, spread: 70 }); }, 2400);
    setTimeout(() => { setStage(4); fireworks(); }, 3400);
    setTimeout(() => setStage(5), 4300);
  };

  useEffect(() => {
    if (!showMsg) return;
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullWish.length) {
        setTypedMsg(fullWish.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 32);
    return () => clearInterval(timer);
  }, [showMsg]);

  return (
    <Screen id="cake">
      {/* Top Header Badge */}
      <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-200 text-xs md:text-sm uppercase tracking-widest font-bold mb-3">
        🎂 Royal Birthday Cake for Penguin
      </span>

      <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-1">
        Penguin's 17th Birthday Celebration Cake 🐧✨
      </h2>

      {/* Assembly Status & Instruction */}
      <p className="text-pink-200 text-xs md:text-sm mb-6 font-semibold min-h-[22px]">
        {stage === 0 && "Preparing the golden cake pedestal... ✨"}
        {stage === 1 && "🍰 Base Chocolate Tier landing for Penguin..."}
        {stage === 2 && "🍓 Stacking Middle Ruby Raspberry Tier..."}
        {stage === 3 && "✨ Stacking Top Golden Cream Tier..."}
        {stage === 4 && "🌠 Golden Birthday Candle descending from the sky!"}
        {stage === 5 && !blown && "Make your 17th Birthday wish, Penguin, then tap blow out! 💨"}
        {stage === 6 && "✨ Your wish is released to the universe, Penguin! ✨"}
      </p>

      {/* Cake Assembly Arena */}
      <div className="relative w-full flex flex-col items-center overflow-visible select-none">
        
        {/* Floating Wish Celebration Emojis */}
        <AnimatePresence>
          {floatingEmojis.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 1, y: 30, scale: 0.5 }}
              animate={{ opacity: 0, y: -280, scale: item.size, x: (Math.random() - 0.5) * 120 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3.5, delay: item.delay, ease: 'easeOut' }}
              className="absolute pointer-events-none z-40 font-bold drop-shadow-[0_0_15px_rgba(244,63,94,0.9)]"
              style={{ left: `${item.left}%`, fontSize: `${item.size}rem` }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ─── SINGLE LUXURY CANDLE FALLING FROM THE SKY ONTO THE TOP TIER ─── */}
        <div className="h-24 flex items-end justify-center">
          {stage >= 4 && (
            <motion.div
              initial={{ y: -450, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 160,
                damping: 13,
                mass: 1.0
              }}
              className="relative z-30 flex flex-col items-center cursor-pointer"
              onClick={blowOut}
            >
              {/* Flame or Smoke */}
              {!blown ? (
                <div className="relative flex items-center justify-center mb-1">
                  {/* Outer Flame Glow Halo */}
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="absolute -inset-2 bg-gradient-to-t from-amber-500 via-rose-500 to-yellow-200 rounded-full blur-md"
                  />
                  {/* Golden Flame */}
                  <motion.div
                    animate={{
                      scaleY: [1, 1.35, 0.9, 1.25, 1],
                      scaleX: [1, 0.9, 1.15, 0.95, 1],
                      rotate: [-2, 3, -3, 2, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 0.4 }}
                    className="relative w-5 h-8 bg-gradient-to-t from-rose-500 via-amber-300 to-white rounded-full shadow-[0_0_25px_rgba(251,191,36,1)] border border-white/80"
                  />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: [1, 0], y: -45, scale: [1, 1.8] }}
                  transition={{ duration: 1.8 }}
                  className="text-2xl font-mono text-slate-200 font-bold mb-1"
                >
                  💨
                </motion.div>
              )}

              {/* Wick */}
              <div className="w-1 h-2.5 bg-neutral-900 rounded-t" />

              {/* Single Luxury Spiral Golden & Rose Candle */}
              <div className="relative w-6 sm:w-7 h-16 sm:h-18 rounded-t-lg rounded-b-sm bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 border-2 border-white/80 shadow-[0_4px_15px_rgba(0,0,0,0.5)] flex flex-col justify-between items-center overflow-hidden">
                {/* Spiral Gold Stripes */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-full h-1.5 bg-gradient-to-r from-rose-400/80 via-white/80 to-rose-400/80 transform -rotate-12 scale-125"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ─── 3-TIER BIGGER LUXURY CAKE STACKED PART-BY-PART ─── */}
        <div className="flex flex-col items-center shadow-2xl">
          
          {/* TIER 3 (TOP TIER - DROPS DOWN 3RD) */}
          {stage >= 3 ? (
            <motion.div
              initial={{ y: -280, opacity: 0, scale: 0.75 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 170, damping: 14 }}
              className="relative z-20 w-52 sm:w-64 md:w-76 h-14 sm:h-16 md:h-18 bg-gradient-to-r from-[#4a1c0d] via-[#2d0f06] to-[#4a1c0d] rounded-t-3xl border-b-4 border-[#240c04] shadow-2xl flex flex-col justify-between items-center overflow-hidden"
            >
              {/* Dripping Vanilla Cream */}
              <div className="w-full h-3.5 bg-gradient-to-r from-amber-100 via-white to-pink-100 rounded-b-xl shadow-md flex justify-around px-2">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-2.5 h-3.5 bg-white rounded-b-full shadow-sm" />
                ))}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs animate-pulse">✨</span>
                <span className="text-xs sm:text-sm font-serif font-black text-amber-200 tracking-widest uppercase drop-shadow">
                  Forever My Love ❤️
                </span>
                <span className="text-xs animate-pulse">✨</span>
              </div>
            </motion.div>
          ) : (
            <div className="w-52 sm:w-64 md:w-76 h-14 sm:h-16 md:h-18 opacity-0 pointer-events-none" />
          )}

          {/* TIER 2 (MIDDLE TIER - DROPS DOWN 2ND) */}
          {stage >= 2 ? (
            <motion.div
              initial={{ y: -300, opacity: 0, scale: 0.85 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 14 }}
              className="relative z-15 w-68 sm:w-84 md:w-98 h-16 sm:h-18 md:h-20 bg-gradient-to-r from-[#701a32] via-[#4a0d1e] to-[#701a32] border-b-4 border-[#330814] shadow-2xl flex flex-col justify-between items-center overflow-hidden"
            >
              {/* Dripping Strawberry Glaze */}
              <div className="w-full h-4 bg-gradient-to-r from-pink-200 via-rose-100 to-pink-200 rounded-b-2xl shadow-md flex justify-around px-3">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-2.5 h-4 bg-pink-100 rounded-b-full shadow-sm" />
                ))}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs">🍓</span>
                <span className="text-sm sm:text-base font-serif font-bold text-pink-100 tracking-wider drop-shadow">
                  Happy 17th Birthday
                </span>
                <span className="text-xs">🍓</span>
              </div>
            </motion.div>
          ) : (
            <div className="w-68 sm:w-84 md:w-98 h-16 sm:h-18 md:h-20 opacity-0 pointer-events-none" />
          )}

          {/* TIER 1 (BASE TIER - DROPS DOWN 1ST - CALLS HER PENGUIN ONCE) */}
          {stage >= 1 ? (
            <motion.div
              initial={{ y: -320, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 14 }}
              className="relative z-10 w-84 sm:w-98 md:w-[460px] h-20 sm:h-22 md:h-24 bg-gradient-to-r from-[#361307] via-[#200902] to-[#361307] rounded-b-2xl border-t-2 border-white/20 shadow-2xl flex flex-col justify-between items-center overflow-hidden"
            >
              {/* Top Golden Caramel Wave */}
              <div className="w-full h-3.5 bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-300 shadow-inner flex justify-around px-4">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className="w-2.5 h-3 bg-amber-200 rounded-b-full shadow-sm" />
                ))}
              </div>
              <div className="flex items-center gap-3 my-auto">
                <span className="text-lg sm:text-xl animate-bounce">🐧</span>
                <span className="text-base sm:text-xl font-serif font-black text-amber-300 tracking-[0.2em] uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  PENGUIN ❤️
                </span>
                <span className="text-lg sm:text-xl animate-bounce">🐧</span>
              </div>
              <div className="w-full h-2 bg-gradient-to-r from-amber-600/60 via-amber-300/80 to-amber-600/60" />
            </motion.div>
          ) : (
            <div className="w-84 sm:w-98 md:w-[460px] h-20 sm:h-22 md:h-24 opacity-0 pointer-events-none" />
          )}

          {/* LUXURY GOLDEN PLATTER STAND */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-5 w-92 sm:w-[440px] md:w-[500px] h-6 sm:h-8 bg-gradient-to-r from-amber-400 via-amber-100 to-amber-500 rounded-b-2xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] border-t-2 border-white/80 flex items-center justify-center"
          >
            <div className="w-44 sm:w-56 h-3 bg-gradient-to-b from-amber-500 to-amber-800 rounded-b-xl shadow-inner" />
          </motion.div>
        </div>

        {/* ─── ACTIONS: BLOW CANDLE & REBUILD BUTTONS ─── */}
        <div className="flex items-center gap-4 mt-6">
          {stage >= 4 && !blown && (
            <motion.button
              whileHover={{ scale: 1.08, boxShadow: '0 0 40px rgba(244,63,94,0.9)' }}
              whileTap={{ scale: 0.94 }}
              onClick={blowOut}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600 text-white font-extrabold text-sm md:text-base uppercase tracking-widest shadow-2xl cursor-pointer border-2 border-white/60 animate-pulse flex items-center gap-3"
            >
              <span>💨</span> BLOW OUT CANDLE <span>💨</span>
            </motion.button>
          )}

          {stage >= 3 && (
            <button
              onClick={rebuildCake}
              className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-pink-100 text-xs font-serif tracking-wider uppercase border border-white/30 transition-all cursor-pointer"
              title="Watch the cake stack and candle drop from the sky again"
            >
              ↺ Rebuild Cake
            </button>
          )}
        </div>
      </div>

      {/* Typewritten 17th Birthday Wish Card */}
      {showMsg && (
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 glass-pink border-2 border-pink-400/60 p-6 md:p-8 rounded-3xl shadow-2xl space-y-3 bg-gradient-to-br from-pink-950/95 via-slate-950/95 to-rose-950/95 w-full max-w-xl"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl animate-bounce">🎂</span>
            <h3 className="text-2xl font-bold text-amber-200 font-serif">A Birthday Wish Blows True ✨</h3>
            <span className="text-2xl animate-bounce">🎂</span>
          </div>
          <p className="text-white text-base md:text-lg font-serif italic leading-relaxed text-center drop-shadow">
            "{typedMsg}"<span className="inline-block w-0.5 h-5 bg-pink-300 ml-1 animate-pulse align-middle" />
          </p>
          <div className="text-center pt-2">
            <span className="text-xs font-serif text-pink-300 font-bold uppercase tracking-widest">
              Forever With All My Love, Your Nestle Consumer ❤️
            </span>
          </div>
        </motion.div>
      )}
    </Screen>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 11 — FINAL LOVE LETTER + GOODBYE
   ═══════════════════════════════════════════ */
function FinalScreen() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 2800)
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <Screen id="final">
      <div className="w-full max-w-2xl mx-auto py-2 space-y-5 text-center flex flex-col items-center">
        {phase >= 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs md:text-sm uppercase tracking-[0.25em] text-pink-300 font-serif font-bold"
          >
            Before you go... 💌
          </motion.p>
        )}

        {phase >= 1 && (
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-4xl font-bold text-white font-serif tracking-wide drop-shadow"
          >
            A Letter Straight From My Heart ✨
          </motion.h2>
        )}

        {phase >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full glass-pink border-2 border-pink-400/50 rounded-3xl p-6 md:p-9 bg-gradient-to-br from-pink-950/90 via-slate-950/95 to-rose-950/90 shadow-[0_20px_60px_rgba(0,0,0,0.5)] space-y-4 text-left font-serif"
          >
            <div className="flex items-center justify-between border-b border-pink-400/30 pb-3">
              <span className="text-xl md:text-2xl font-serif font-bold text-pink-200">
                Hey baby ❤️
              </span>
              <span className="text-xl animate-pulse">👑</span>
            </div>

            <div className="space-y-3.5 text-sm md:text-base leading-relaxed text-pink-50 font-normal">
              <p>
                I just wanted to tell you how much I love you. I don't let you know enough how much I appreciate you. You mean everything to me.
              </p>
              <p className="italic text-pink-200/90">
                I'm sorry if I worry you or I make you upset sometimes. I never mean to do that. You are my one and only and never want that to change.
              </p>
              <p className="font-medium text-amber-200/95">
                You are an amazing girlfriend and I know you'll be an even more amazing wife someday. I don't imagine my future without you. You make everything better.
              </p>
              <p>
                I love every single thing about you. I love the way you smile, I love when you're being silly, and I especially love when you get tired and you act all cute.
              </p>
              <p className="italic text-pink-100">
                You have made everything about my life better, and I couldn't thank you enough. I don't deserve someone like you, I don't know how I got so lucky.
              </p>
              <p className="font-semibold text-rose-200 pt-1">
                And just know that I'm here to stay, I'm not gonna leave you, I want to be with you for a very long time. I love you so much and I hope you always know that.
              </p>
            </div>

            <div className="pt-3 border-t border-pink-400/30 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-widest text-pink-300 font-mono font-bold">
                Forever & Always Yours,
              </span>
              <span className="text-lg md:text-xl font-serif font-black text-amber-200 tracking-wider">
                Your Nestle Consumer ❤️
              </span>
            </div>
          </motion.div>
        )}

        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-2 flex flex-col items-center gap-3"
          >
            <div className="text-3xl md:text-5xl font-serif font-bold text-pink-300 drop-shadow-[0_0_35px_rgba(244,63,94,0.9)]">
              I love you, Penguin. 🐧❤️
            </div>
            <p className="text-xs md:text-sm text-pink-300/80 font-serif italic">
              My sweet Rasmalai • My hot babe • My Nestle forever
            </p>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                fireworks();
                fire({ particleCount: 150, spread: 120 });
              }}
              className="mt-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600 hover:from-rose-500 hover:to-pink-600 text-white text-xs md:text-sm font-bold uppercase tracking-widest shadow-2xl active:scale-95 transition-all cursor-pointer border border-white/50"
            >
              Replay Our Story ↻
            </button>
          </motion.div>
        )}
      </div>
    </Screen>
  );
}

/* ═══════════════════════════════════════════
   MAIN APP — SCREEN-BY-SCREEN CONTROLLER
   ═══════════════════════════════════════════ */
const TOTAL = 12;

/* ═══════════════════════════════════════════
   PER-SLIDE SONG MAPPING (A DISTINCT SONG FOR EACH SCREEN)
   ═══════════════════════════════════════════ */
const SLIDE_SONGS = {
  1: { title: "Reel Audio 1", artist: "ReelAudio-34851", src: "/media/music/ReelAudio-34851.mp3" },
  2: { title: "Reel Audio 2", artist: "ReelAudio-49812", src: "/media/music/ReelAudio-49812.mp3" },
  3: { title: "Reel Audio 3", artist: "ReelAudio-88628", src: "/media/music/ReelAudio-88628.mp3" },
  4: { title: "Reel Audio 4", artist: "ReelAudio-51970", src: "/media/music/ReelAudio-51970.mp3" },
  5: { title: "Reel Audio 5", artist: "ReelAudio-30371", src: "/media/music/ReelAudio-30371.mp3" },
  6: { title: "Reel Audio 6", artist: "ReelAudio-71448", src: "/media/music/ReelAudio-71448.mp3" },
  7: { title: "Reel Audio 7", artist: "ReelAudio-99589", src: "/media/music/ReelAudio-99589.mp3" },
  8: { title: "Reel Audio 8", artist: "ReelAudio-39412", src: "/media/music/ReelAudio-39412.mp3" },
  9: { title: "Reel Audio 9", artist: "ReelAudio-11107", src: "/media/music/ReelAudio-11107.mp3" },
  10: { title: "Reel Audio 10", artist: "ReelAudio-63465", src: "/media/music/ReelAudio-63465.mp3" },
  11: { title: "My Queen 👑", artist: "KD Desirock", src: "/media/music/my-queen.mp3" },
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [entered, setEntered] = useState(false);
  const [step, setStep] = useState(0);

  // Playlist State & Background Audio (Plays all the time across the entire experience)
  const [playlist, setPlaylist] = useState(
    siteConfig.playlist || [
      { title: "Reel Audio 1", artist: "ReelAudio-34851", src: "/media/music/ReelAudio-34851.mp3" },
      { title: "Reel Audio 2", artist: "ReelAudio-49812", src: "/media/music/ReelAudio-49812.mp3" },
      { title: "Reel Audio 3", artist: "ReelAudio-88628", src: "/media/music/ReelAudio-88628.mp3" },
      { title: "Reel Audio 4", artist: "ReelAudio-51970", src: "/media/music/ReelAudio-51970.mp3" },
      { title: "Reel Audio 5", artist: "ReelAudio-30371", src: "/media/music/ReelAudio-30371.mp3" },
      { title: "Reel Audio 6", artist: "ReelAudio-71448", src: "/media/music/ReelAudio-71448.mp3" },
      { title: "Reel Audio 7", artist: "ReelAudio-99589", src: "/media/music/ReelAudio-99589.mp3" },
      { title: "Reel Audio 8", artist: "ReelAudio-39412", src: "/media/music/ReelAudio-39412.mp3" },
      { title: "Reel Audio 9", artist: "ReelAudio-11107", src: "/media/music/ReelAudio-11107.mp3" },
      { title: "Reel Audio 10", artist: "ReelAudio-63465", src: "/media/music/ReelAudio-63465.mp3" },
      { title: "My Queen 👑", artist: "KD Desirock", src: "/media/music/my-queen.mp3" }
    ]
  );
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const bgAudioRef = useRef(null);
  const [isBgMusicPlaying, setIsBgMusicPlaying] = useState(false);
  const [isBgMuted, setIsBgMuted] = useState(false);
  const [bgMusicSrc, setBgMusicSrc] = useState(siteConfig.playlist?.[0]?.src || '/media/music/ReelAudio-34851.mp3');
  const [songTitle, setSongTitle] = useState(siteConfig.playlist?.[0]?.title || 'Reel Audio 1');
  const [songArtist, setSongArtist] = useState(siteConfig.playlist?.[0]?.artist || 'ReelAudio-34851');
  const musicFileInputRef = useRef(null);

  // Automatically play that slide's specific song whenever the user moves to a new screen/slide
  useEffect(() => {
    if (!entered || !step) return;
    const slideTrack = SLIDE_SONGS[step];
    if (slideTrack) {
      setBgMusicSrc(slideTrack.src);
      setSongTitle(slideTrack.title);
      setSongArtist(slideTrack.artist);
      setTimeout(() => {
        if (bgAudioRef.current) {
          bgAudioRef.current.currentTime = 0;
          bgAudioRef.current.play().then(() => setIsBgMusicPlaying(true)).catch(() => {});
        }
      }, 50);
    }
  }, [step, entered]);

  // Auto-play audio on first click or touch interaction anywhere
  useEffect(() => {
    const playOnInteraction = () => {
      if (bgAudioRef.current && bgAudioRef.current.paused) {
        bgAudioRef.current.play().then(() => {
          setIsBgMusicPlaying(true);
        }).catch(() => {});
      }
    };

    window.addEventListener('click', playOnInteraction, { once: true });
    window.addEventListener('touchstart', playOnInteraction, { once: true });
    return () => {
      window.removeEventListener('click', playOnInteraction);
      window.removeEventListener('touchstart', playOnInteraction);
    };
  }, []);

  const next = () => setStep(s => Math.min(TOTAL - 1, s+1));
  const prev = () => setStep(s => Math.max(1, s-1));

  const handleEnterClick = () => {
    setEntered(true);
    setStep(1);
    if (bgAudioRef.current && bgAudioRef.current.paused) {
      bgAudioRef.current.play().then(() => setIsBgMusicPlaying(true)).catch(() => {});
    }
  };

  const screens = {
    1: <CupidBowGame />,
    2: <Countdown />,
    3: <VideoTypewriterScreen />,
    4: <NameReveal />,
    5: <OpenWhenCards />,
    6: <PhotoReveal />,
    7: <ReasonsCards />,
    8: <ScratchCard />,
    9: <SecretLock />,
    10: <BirthdayCake />,
    11: <FinalScreen />,
  };

  return (
    <div className="relative h-screen w-screen bg-[#180410] text-white overflow-hidden font-sans">
      <Particles />

      {/* Global Background Audio Element (Strictly loops current slide's song; never plays another song) */}
      <audio
        ref={bgAudioRef}
        src={bgMusicSrc}
        loop
        preload="auto"
        onPlay={() => setIsBgMusicPlaying(true)}
        onPause={() => setIsBgMusicPlaying(false)}
      />



      <AnimatePresence>
        {loading && <LoadingScreen onDone={()=>setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <div className="relative z-10 h-full w-full flex flex-col">
          {!entered ? (
            <div className="flex-1 flex items-center justify-center">
              <EnterScreen onEnter={handleEnterClick} />
            </div>
          ) : (
            <>
              {/* Top progress bar */}
              <div className="flex items-center justify-between px-6 pt-4 pb-2 z-20">
                <span className="text-xs font-mono font-bold text-pink-200 bg-pink-950/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-pink-400/30 shadow-lg">
                  {step} / {TOTAL - 1}
                </span>
                <div className="flex gap-1.5">
                  {Array.from({length: TOTAL-1}).map((_,i) => (
                    <button key={i} onClick={()=>setStep(i+1)} className={`h-2.5 rounded-full transition-all cursor-pointer ${i+1===step?'w-6 bg-pink-400 shadow-[0_0_10px_rgba(244,63,94,0.8)]':i+1<step?'w-2.5 bg-pink-500/50':'w-2.5 bg-white/20'}`} />
                  ))}
                </div>
              </div>

              {/* Content area */}
              <div className="flex-1 flex items-center justify-center overflow-y-auto no-scrollbar px-3 py-2">
                <AnimatePresence mode="wait">
                  {screens[step]}
                </AnimatePresence>
              </div>

              {/* Bottom nav */}
              <div className="flex items-center justify-between px-6 pb-5 pt-2 z-20">
                {step > 1 ? (
                  <button onClick={prev} className="text-xs font-bold text-pink-200 px-5 py-2.5 rounded-full bg-pink-950/80 backdrop-blur-md border border-pink-400/40 active:scale-95 transition-transform cursor-pointer hover:bg-pink-900">
                    ← Back
                  </button>
                ) : <div/>}
                {step < TOTAL - 1 ? (
                  <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={next}
                    className="flex items-center gap-2 bg-gradient-to-r from-rose-600 via-pink-500 to-rose-500 text-white font-extrabold text-xs px-7 py-3 rounded-full shadow-xl shadow-rose-950 border border-pink-300 animate-glow cursor-pointer">
                    {step === TOTAL - 2 ? 'Grand Finale ❤️' : 'Next ❤️'} →
                  </motion.button>
                ) : <div/>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
