import confetti from 'canvas-confetti';

export const triggerConfetti = (options = {}) => {
  const defaults = {
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#f43f5e', '#ec4899', '#a855f7', '#fbbf24', '#ffffff']
  };

  confetti({
    ...defaults,
    ...options
  });
};

export const triggerCelebrationFireworks = () => {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#f43f5e', '#ec4899', '#fbbf24']
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#a855f7', '#38bdf8', '#ffffff']
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

export default triggerConfetti;
