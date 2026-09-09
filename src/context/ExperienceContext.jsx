import React, { createContext, useContext, useState } from 'react';
import { siteConfig } from '../data/siteConfig';
import { triggerConfetti } from '../components/common/Confetti';

const ExperienceContext = createContext(null);

export const ExperienceProvider = ({ children }) => {
  const [hasEntered, setHasEntered] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [foundHearts, setFoundHearts] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [showHeartSurpriseModal, setShowHeartSurpriseModal] = useState(false);

  const totalHeartsCount = siteConfig.hiddenHearts?.length || 10;

  const discoverHeart = (heartIndex) => {
    if (foundHearts.includes(heartIndex)) return;

    const updated = [...foundHearts, heartIndex];
    setFoundHearts(updated);
    triggerConfetti({ particleCount: 30, spread: 50 });

    const msg = siteConfig.hiddenHearts[heartIndex] || "You found a secret heart! ❤️";
    setToastMessage(`Heart ${updated.length}/${totalHeartsCount} found: ${msg}`);

    setTimeout(() => {
      setToastMessage(null);
    }, 3500);

    if (updated.length === totalHeartsCount) {
      setTimeout(() => {
        setShowHeartSurpriseModal(true);
      }, 1000);
    }
  };

  const currentSong = siteConfig.musicTracks?.[currentSongIndex] || siteConfig.musicTracks?.[0];

  const nextSong = () => {
    if (!siteConfig.musicTracks?.length) return;
    setCurrentSongIndex((prev) => (prev + 1) % siteConfig.musicTracks.length);
  };

  const prevSong = () => {
    if (!siteConfig.musicTracks?.length) return;
    setCurrentSongIndex((prev) => (prev - 1 + siteConfig.musicTracks.length) % siteConfig.musicTracks.length);
  };

  return (
    <ExperienceContext.Provider
      value={{
        hasEntered,
        setHasEntered,
        isPlayingMusic,
        setIsPlayingMusic,
        currentSong,
        currentSongIndex,
        nextSong,
        prevSong,
        foundHearts,
        discoverHeart,
        totalHeartsCount,
        toastMessage,
        setToastMessage,
        showHeartSurpriseModal,
        setShowHeartSurpriseModal
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperience = () => {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    throw new Error('useExperience must be used within an ExperienceProvider');
  }
  return ctx;
};

export default ExperienceContext;
