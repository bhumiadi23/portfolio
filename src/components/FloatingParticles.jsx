import React, { useEffect, useRef } from 'react';

/**
 * Subtle Floating Petals & Soft Glowing Particles Canvas
 * - Realistic soft cherry blossom petals and warm glowing dust
 * - Soft romantic drift without overwhelming the screen
 * - Automatically pauses when out of view or if reduced-motion is requested
 */
export default function FloatingParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Subtle particles: glowing micro-sparkles & soft rose petals
    const particleCount = Math.min(window.innerWidth < 768 ? 20 : 36, 45);
    const particles = Array.from({ length: particleCount }, (_, i) => {
      const isPetal = i % 3 === 0;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: isPetal ? Math.random() * 7 + 5 : Math.random() * 2 + 1,
        speedY: isPetal ? Math.random() * 0.5 + 0.3 : Math.random() * 0.3 + 0.15,
        speedX: (Math.random() - 0.5) * 0.4,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.015,
        opacity: isPetal ? Math.random() * 0.35 + 0.15 : Math.random() * 0.45 + 0.2,
        isPetal,
        pulseOffset: Math.random() * Math.PI * 2,
      };
    });

    const drawPetal = (x, y, size, angle, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = opacity;
      
      // Warm blush pink petal
      ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-size / 2, -size / 1.5, -size / 2, -size * 1.5, 0, -size * 2);
      ctx.bezierCurveTo(size / 2, -size * 1.5, size / 2, -size / 1.5, 0, 0);
      ctx.fill();

      // Soft petal vein
      ctx.strokeStyle = 'rgba(190, 18, 60, 0.15)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -size * 1.6);
      ctx.stroke();

      ctx.restore();
    };

    const drawGlowParticle = (x, y, size, opacity) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2.5);
      gradient.addColorStop(0, 'rgba(251, 191, 36, 0.65)'); // Warm candle amber
      gradient.addColorStop(0.5, 'rgba(244, 114, 182, 0.35)'); // Blush pink
      gradient.addColorStop(1, 'rgba(253, 251, 247, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    let lastTime = performance.now();

    const loop = (currentTime) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let p of particles) {
        p.y += p.speedY * (delta * 60);
        p.x += Math.sin(p.y * 0.01 + p.pulseOffset) * 0.4 + p.speedX;
        p.angle += p.angularSpeed;

        // Wrap around smoothly
        if (p.y > canvas.height + 25) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -20) p.x = canvas.width + 10;
        if (p.x > canvas.width + 20) p.x = -10;

        if (p.isPetal) {
          drawPetal(p.x, p.y, p.size, p.angle, p.opacity);
        } else {
          const pulsingOpacity = p.opacity * (0.8 + 0.2 * Math.sin(currentTime * 0.002 + p.pulseOffset));
          drawGlowParticle(p.x, p.y, p.size, pulsingOpacity);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 opacity-75"
      aria-hidden="true"
    />
  );
}
