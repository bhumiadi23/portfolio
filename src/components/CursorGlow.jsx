import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    const move = e => {
      el.style.left = e.clientX + 'px';
      el.style.top = e.clientY + 'px';
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}
