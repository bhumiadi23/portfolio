import React from 'react';
import { Heart } from 'lucide-react';
import { useExperience } from '../../context/ExperienceContext';

export const HiddenHeart = ({ index, className = '' }) => {
  const { foundHearts, discoverHeart } = useExperience();
  const isFound = foundHearts.includes(index);

  return (
    <button
      onClick={() => discoverHeart(index)}
      className={`inline-flex items-center justify-center p-1.5 rounded-full transition-all duration-300 transform hover:scale-125 ${
        isFound 
          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-500/30 cursor-default'
          : 'opacity-40 hover:opacity-100 text-pink-300/60 hover:text-rose-400 animate-pulse'
      } ${className}`}
      aria-label={`Hidden heart ${index + 1}`}
      title={isFound ? "Found Heart! ❤️" : "Click me! Secret heart ✨"}
    >
      <Heart className={`w-4 h-4 ${isFound ? 'fill-rose-500 text-rose-500' : ''}`} />
    </button>
  );
};

export default HiddenHeart;
