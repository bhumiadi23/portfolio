# ❤️ Her Birthday — A Little World Made Just For Her

A premium, cinematic, highly interactive personalized birthday web application and interactive love story experience designed for your girlfriend.

---

## 🌟 Features Overview

- **Cinematic Preloader & Loading Screen**: Heartbeat pulse, animated progress indicator, floating particle background.
- **Interactive Landing ("Enter My World")**: Autoplay-compliant audio initializer & full-screen invitation.
- **Kinetic Name Reveal**: Cinematic blur, glow, and letter-by-letter reveal for `[HER_NAME]`.
- **Live Birthday Countdown**: Days, Hours, Minutes, Seconds ticker targeting `birthdayDate`; automatically triggers fireworks and confetti upon completion.
- **Hero Video & Memory Videos**: Fullscreen video section with custom glassmorphism controls (play/pause, mute/unmute, progress bar, fullscreen, and fallback posters).
- **Interactive Story Timeline**: Responsive alternating cards (vertical on mobile) with custom date badges, photos/videos, and glowing scroll lines.
- **Masonry Memory Gallery & Lightbox**: Image zoom hover effects, captions, lazy loading, and full-screen view.
- **Polaroid Wall**: Scattered Polaroid cards with subtle random rotations that straighten and elevate on hover/tap.
- **3D Tilt Memory Cards**: Mouse-tracking 3D tilt effects with parallax layers.
- **"Watch This When You Miss Me"**: Hidden video section with custom unlock CTA and emotional personal message.
- **"Reasons I Love You" & Random Love Message**: Interactive flip cards + "Give me a random reason ❤️" modal generator.
- **"Catch My Love" Mini-Game**: Interactive floating hearts game with particle explosion physics, love score counter, and unlockable secret reward at 10 points.
- **Digital Canvas Scratch Card**: Interactive canvas overlay allowing her to scratch off the overlay to reveal a hidden love note.
- **Secret Passcode Lock**: Password entry input ("There's something here that only you can unlock") with unlock animation and custom hint/messages.
- **Hidden Hearts Collector (10/10)**: 10 hidden interactive mini-hearts scattered across sections with a floating counter and secret celebration modal.
- **Interactive Memory Map**: Custom map layout showcasing key relationship milestones & location cards.
- **"If Our Love Were..." Grid**: Romantic flip cards exploring analogies (movie, song, season, place).
- **Future Letter & Envelope**: Interactive 3D opening envelope revealing handwritten-style letter.
- **Virtual 3D Gift Box**: Shake & unwrap animation with light burst particles revealing customized surprise message.
- **Interactive Birthday Cake & Candle Blowing**: SVG/Canvas birthday cake with lit candle flames. Supports candle tap/click or blowing out candles to dim lights, launch fireworks & confetti!
- **Handwritten Love Letter & Voice Note**: Romantic full-width letter section + custom voice recording audio player with waveform visualizer.
- **Cinematic Final Video Climax & Staggered Love Reveal**: Screen-fade to black video player leading into grand multi-line staggered text reveal ("Happy Birthday, [HER_NAME] ❤️... I love you.").
- **Starry Finale Screen**: Dark starry sky finale with author signature (`— [YOUR_NAME]`) and "Replay our story ↻" scroll-to-top CTA.
- **Full Mobile Optimization & Media Fallbacks**: Touch-friendly tap targets, zero horizontal overflow, and built-in fallback components so missing media files never crash the app!

---

## 🚀 Quick Setup Instructions

### STEP 1: Install Node.js
Ensure Node.js (v18 or higher) is installed on your machine.

### STEP 2: Install Dependencies
Open your terminal in the project directory and run:
```bash
npm install
```

### STEP 3: Run Development Server
Start the local development server:
```bash
npm run dev
```

### STEP 4: Open Local Development URL
Open the URL shown in your terminal (usually `http://localhost:5173`) in your browser.

---

## 🎨 Personalization Guide

### STEP 5: Edit Central Configuration
All names, dates, messages, secret codes, and reasons are centralized in **ONE file**:
```
src/data/siteConfig.js
```

Open `src/data/siteConfig.js` and edit the placeholders:
- `girlfriendName`: Her real name (e.g., "Sophia")
- `nickname`: Her cute nickname (e.g., "Princess", "Sunshine")
- `yourName`: Your name (e.g., "Alex")
- `birthdayDate`: Her upcoming birthday date (e.g., `"2026-10-15T00:00:00"`)
- `relationshipStartDate`: The date you started dating (e.g., `"2023-04-12"`)
- `mainMessage`: Your main birthday message
- `reasons`: Array of reasons why you love her
- `randomMessages`: Array of random quick love notes
- `secretLock`: Passcode and secret message
- `futureLetter`: Your future letter content

### STEP 6: Replace Media Files
Place your real photos, videos, music, and voice recording inside the `public/media/` directory:

```
public/
  media/
    photos/
      photo-01.jpg
      photo-02.jpg
      photo-03.jpg
      photo-04.jpg
      photo-05.jpg
      photo-06.jpg
    videos/
      intro.mp4
      memory-01.mp4
      memory-02.mp4
      final-video.mp4
    music/
      song-01.mp3
      song-02.mp3
    voice/
      love-message.mp3
```

> **Note**: If you don't have a specific photo or video yet, don't worry! The site automatically displays romantic glowing placeholder cards so it will never crash or break.

---

## 📦 Build & Deployment

### STEP 7: Build for Production
When you are ready to deploy, run:
```bash
npm run build
```
This generates a production-optimized static bundle in the `dist/` directory.

### STEP 8: Deploy
Deploy the contents of the `dist/` directory to any static web hosting provider:
- **Vercel**: Import project and hit Deploy
- **Netlify**: Drag and drop the `dist/` folder
- **GitHub Pages**: Deploy static `dist/` branch

---

## ❤️ Made with Love
This experience was built with React, Vite, Tailwind CSS, Framer Motion, and GSAP.
