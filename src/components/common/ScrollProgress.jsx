import React, { useEffect, useState } from 'react';

export const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const strokeDashoffset = 100 - scrollProgress;

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-rose-500/20 shadow-lg">
      <span className="text-[11px] font-mono font-semibold text-rose-300">
        {Math.round(scrollProgress)}%
      </span>
      <div className="relative w-6 h-6">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-white/10"
            strokeWidth="4"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-rose-500 transition-all duration-150 ease-out"
            strokeDasharray="100, 100"
            strokeDashoffset={strokeDashoffset}
            strokeWidth="4"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
      </div>
    </div>
  );
};

export default ScrollProgress;
