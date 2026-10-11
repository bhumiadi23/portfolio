import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FloatingParticles from './components/FloatingParticles';
import OpeningScreen from './components/OpeningScreen';
import ApologyLetter from './components/ApologyLetter';
import WhatIWantYouToKnow from './components/WhatIWantYouToKnow';
import OurLittleWorld from './components/OurLittleWorld';
import PromiseTree from './components/PromiseTree';
import FinalScreen from './components/FinalScreen';
import FinalDecision from './components/FinalDecision';
import BackgroundMusicPlayer from './components/BackgroundMusicPlayer';
import { sendVisitNotification } from './services/notificationService';
import { Heart } from 'lucide-react';

export default function App() {
  const [isLetterOpened, setIsLetterOpened] = useState(false);

  // Silently notify Nestle that Annuva opened the website (fires once per session)
  useEffect(() => {
    sendVisitNotification().catch(() => {});
  }, []);

  const handleOpenLetter = () => {
    setIsLetterOpened(true);
  };


  return (
    <div className="relative min-h-screen bg-[#FDFBF7] text-[#2D1B28] overflow-x-hidden selection:bg-rose-200/50 selection:text-[#881337]">
      {/* Subtle Romantic Canvas Atmosphere */}
      <FloatingParticles />

      {/* Discreet Navigation Bar & Audio Player */}
      <Navbar />

      {/* Main Experience Flow */}
      <main className="relative z-20">
        {/* 1. Opening Screen — “For My Annuva” */}
        <OpeningScreen
          onOpenLetter={handleOpenLetter}
          isLetterOpened={isLetterOpened}
        />

        {/* 2. The Apology Letter */}
        <ApologyLetter isLetterOpened={isLetterOpened} />

        {/* 3. Interactive Section — “What I Want You to Know” */}
        <WhatIWantYouToKnow />

        {/* 4. Our Little World — Memory Timeline */}
        <OurLittleWorld />

        {/* 5. A Little Promise Tree 🌸 */}
        <PromiseTree />

        {/* 6. The Final Screen — “Whenever You're Ready” */}
        <FinalScreen />

        {/* 7. Final Interactive Decision — “Can We Make Things Better? ❤️” */}
        <FinalDecision />
      </main>

      {/* Floating YouTube Romantic Background Music Player (Bottom-Right) */}
      <BackgroundMusicPlayer />

      {/* Subtle Romantic Footer */}

      <footer className="relative z-20 py-8 border-t border-rose-100/70 text-center text-xs text-stone-500 font-body bg-[#FAF5EE]/60">
        <div className="max-w-md mx-auto px-4 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1 text-[#881337]">
            <span>Created with love & sincerity</span>
            <Heart className="w-3 h-3 fill-[#BE123C] text-[#BE123C]" />
            <span>for Annuva</span>
          </div>
          <p className="text-[11px] text-stone-500 font-mono">
            Always yours, Nestle
          </p>
        </div>
      </footer>
    </div>
  );
}
