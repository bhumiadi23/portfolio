import React, { useState } from 'react';
import { Heart, Image as ImageIcon } from 'lucide-react';

export const MediaImage = ({ src, alt, className = '', ...props }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div 
        className={`relative flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-900/40 via-pink-950/30 to-slate-900/60 border border-rose-500/20 rounded-2xl backdrop-blur-md text-center overflow-hidden min-h-[200px] ${className}`}
        {...props}
      >
        <div className="absolute inset-0 bg-radial-gradient from-rose-500/10 to-transparent pointer-events-none" />
        <div className="p-3 mb-2 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 animate-pulse">
          <Heart className="w-6 h-6" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-rose-300/80 mb-1">
          {alt || "Memory Photo"}
        </span>
        <span className="text-xs text-slate-400">
          Your photo here ❤️
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "Memory"}
      onError={() => setError(true)}
      className={className}
      loading="lazy"
      {...props}
    />
  );
};

export default MediaImage;
