import React, { useState } from 'react';
import { BookOpen, Image, Music, Gift, Heart, Sparkles, Menu, X } from 'lucide-react';

export const FloatingNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Story', href: '#story', icon: BookOpen },
    { label: 'Memories', href: '#gallery', icon: Image },
    { label: 'Songs', href: '#music', icon: Music },
    { label: 'Reasons', href: '#reasons', icon: Heart },
    { label: 'Surprise', href: '#gift', icon: Gift },
    { label: 'Cake', href: '#cake', icon: Sparkles },
  ];

  const scrollTo = (href) => {
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      {/* Desktop & Expanded Floating Bar */}
      <div className="hidden md:flex items-center gap-1 bg-black/60 backdrop-blur-xl border border-rose-500/20 px-4 py-2 rounded-full shadow-2xl shadow-rose-950/50">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => scrollTo(item.href)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200"
            >
              <Icon className="w-3.5 h-3.5 text-rose-400" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Floating Toggle */}
      <div className="md:hidden relative">
        {isOpen && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex flex-col gap-2 bg-black/80 backdrop-blur-xl border border-rose-500/30 p-3 rounded-2xl shadow-2xl min-w-[160px] animate-in fade-in slide-in-from-bottom-3 duration-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => scrollTo(item.href)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-rose-500/20 transition-colors"
                >
                  <Icon className="w-4 h-4 text-rose-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-rose-600/90 text-white px-4 py-2.5 rounded-full shadow-lg shadow-rose-900/50 backdrop-blur-md active:scale-95 transition-transform"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span className="text-xs font-semibold tracking-wide">Explore</span>
        </button>
      </div>
    </div>
  );
};

export default FloatingNav;
