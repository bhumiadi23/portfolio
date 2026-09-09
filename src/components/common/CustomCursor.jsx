import React, { useEffect, useState } from 'react';

export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch device
    if (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) {
      setIsTouchDevice(true);
      return;
    }

    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Check if hovering over interactive element
      const target = e.target;
      const isInteractive = target.closest('a, button, input, textarea, [role="button"], video');
      setIsHovered(!!isInteractive);
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      <div 
        className="cursor-dot" 
        style={{ transform: `translate3d(${position.x - 5}px, ${position.y - 5}px, 0)` }} 
      />
      <div 
        className={`cursor-outline ${isHovered ? 'cursor-hover' : ''}`}
        style={{ transform: `translate3d(${position.x - 20}px, ${position.y - 20}px, 0)` }}
      />
    </>
  );
};

export default CustomCursor;
