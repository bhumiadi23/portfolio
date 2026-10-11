import React, { useState, useEffect } from 'react';
import { Heart, Menu, X } from 'lucide-react';

export default function Navbar() {

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Letter', href: '#letter-section' },
    { name: 'For You', href: '#what-i-want-you-to-know' },
    { name: 'Our World', href: '#our-little-world' },
    { name: 'Promises', href: '#promise-tree' },
    { name: 'Always', href: '#final-section' },
    { name: 'For Us', href: '#decision-section' },
  ];


  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'py-3 bg-[#FDFBF7]/85 backdrop-blur-md border-b border-rose-100/70 shadow-xs'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo / Personal Title */}
          <a
            href="#"
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
            aria-label="Back to top"
          >
            <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200/80 flex items-center justify-center text-[#BE123C] shadow-xs group-hover:scale-105 transition-transform">
              <Heart className="w-3.5 h-3.5 fill-[#BE123C]/80" />
            </div>
            <span className="font-playfair text-base sm:text-lg font-medium text-[#2D1B28] tracking-tight group-hover:text-[#881337] transition-colors">
              For Annuva <span className="text-[#BE123C]">❤️</span>
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs uppercase tracking-widest text-stone-600 hover:text-[#881337] font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action: Mobile Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile navigation menu"
              className="p-2 rounded-full bg-[#FFFDF9] border border-rose-200/70 text-stone-700 shadow-sm"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FFFDF9]/95 backdrop-blur-xl border-b border-rose-200/70 px-6 py-5 shadow-lg flex flex-col gap-4 animate-fade-in">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-stone-700 hover:text-[#881337] py-1 border-b border-rose-100/50"
              >
                {link.name}
              </a>
            ))}
          </div>
        )}
      </header>
    </>
  );
}

