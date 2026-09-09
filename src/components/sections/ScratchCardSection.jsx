import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import { Sparkles, Heart } from 'lucide-react';
import { triggerConfetti } from '../common/Confetti';
import HiddenHeart from '../common/HiddenHeart';

export const ScratchCardSection = () => {
  const canvasRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const secretMessage = siteConfig.scratchCardMessage || "You are my favorite person ❤️";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Fill silver/purple overlay
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#334155');
    gradient.addColorStop(0.5, '#475569');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '14px Outfit, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch here with cursor or finger... ✨', canvas.width / 2, canvas.height / 2);

    let isScratching = false;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const scratch = (pos) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
      ctx.fill();

      // Check scratched area ratio
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let clearPixels = 0;
      for (let i = 3; i < imgData.data.length; i += 4) {
        if (imgData.data[i] === 0) clearPixels++;
      }
      if (clearPixels / (imgData.data.length / 4) > 0.45 && !isRevealed) {
        setIsRevealed(true);
        triggerConfetti({ particleCount: 50, spread: 60 });
      }
    };

    const handleStart = (e) => { isScratching = true; scratch(getPos(e)); };
    const handleMove = (e) => { if (isScratching) scratch(getPos(e)); };
    const handleEnd = () => { isScratching = false; };

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    canvas.addEventListener('touchstart', handleStart);
    canvas.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);

      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isRevealed]);

  return (
    <section className="relative py-20 px-6 bg-gradient-to-b from-[#07050d] via-[#120820] to-[#07050d] text-center">
      {/* Hidden Heart #8 */}
      <div className="absolute top-8 right-12">
        <HiddenHeart index={8} />
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs uppercase tracking-widest font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Scratch Card</span>
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-serif">
            Scratch To Reveal
          </h2>
        </div>

        <div className="relative w-full h-48 rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/60 to-purple-950/60 overflow-hidden shadow-2xl flex items-center justify-center p-6 text-center">
          {/* Secret Text Underneath */}
          <div className="relative z-0 space-y-2">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500 mx-auto animate-pulse" />
            <p className="text-lg md:text-xl font-bold text-rose-100 font-serif">
              "{secretMessage}"
            </p>
          </div>

          {/* Canvas Scratch Overlay */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 z-10 w-full h-full cursor-pointer transition-opacity duration-700 ${
              isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          />
        </div>
      </div>
    </section>
  );
};

export default ScratchCardSection;
