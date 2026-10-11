# For My Annuva ❤️ — A Romantic Apology Website

A cinematic, interactive apology and love letter website created by **Nestle** for **Annuva**. Designed with genuine sincerity, respect, and emotional care.

---

## ✨ Features & Experiences

1. **Opening Screen — “For My Annuva”**
   - Soft pulsing glowing heart with warm ivory and cream aesthetic.
   - Cinematic welcome message from Nestle.
   - Interactive 3D animated envelope with a wax-seal heart stamped in ruby tones.
   - Unfolds smoothly upon clicking the seal or the *"Open my letter 💌"* button.

2. **The Apology Letter**
   - Realistic stationery letter on parchment card with deckle borders, realistic paper creases, and soft drop shadows.
   - Unfolds paragraph by paragraph with delicate staggered fade-and-rise animations.
   - Authentic handwritten cursive sign-off: *"Always yours, Your Nestle ❤️"*.

3. **What I Want You to Know**
   - Three interactive cards with custom delicate SVG illustrations:
     - **Card 1: “Your Feelings Matter”** (Cupped Hands & Heart)
     - **Card 2: “I Want to Do Better”** (Budding Sprout with Heart Petals)
     - **Card 3: “You Don't Have to Rush”** (Peaceful Drifting Hourglass)
   - Interactive expansion revealing deeper reflections on patience and care.

4. **Our Little World**
   - Heading: *“Even when we have difficult days, our story means something to me.”*
   - Horizontal memory timeline featuring Polaroid-style photo frames with realistic tape detailing.
   - Interactive lightbox modal to view moments up close.
   - Easily customizable photo placeholders in `src/data/apologyConfig.js`.

5. **A Little Promise Tree 🌸**
   - Interactive blooming cherry blossom tree with delicate organic branches.
   - 5 glowing heart-shaped leaves/buds that blossom into Nestle's commitments when clicked:
     - *“I will try to listen before reacting.”*
     - *“I will respect your feelings, even when we disagree.”*
     - *“I will work on the things that hurt you.”*
     - *“I will show my love through my actions.”*
     - *“I will remember that we're on the same team, even during arguments.”*
   - Progress tracking with blooming floral aura when all commitments are revealed.

6. **The Final Screen — “Whenever You're Ready”**
   - Dreamy transition into soft blush pink and romantic magenta.
   - Central glowing heart with a calm breathing aura.
   - Two private, respectful buttons:
     - *“I read your letter 💗”* — Displays a quiet acknowledgment without pressure.
     - *“I want to talk to you 💌”* — Unveils: *“Whenever you're ready, I'm here to listen. No pressure, no arguments — just us, talking honestly.”*
   - **Privacy Guarantee**: Neither button sends external network requests or logs her response. Completely private and pressure-free.

7. **Final Interactive Decision — “Can We Make Things Better? ❤️”**
   - Displays: *“My Annuva, one last little question… 🥺❤️”* and *“Would you give us a chance to talk, understand each other, and make things better?”*
   - **Button 1: “Yes, let's talk ❤️”**:
     - Triggers heart celebration confetti animation.
     - Sends an email notification to Nestle via EmailJS with the website name, event (*“Annuva clicked Yes”*), and exact date and time.
     - Displays: *“Thank you, my love. ❤️ I'm happy you're willing to talk. I'll do my best to listen, understand you, and make things better.”*
     - Prevents duplicate email notifications during the same visit.
     - Shows a gentle error/retry message if the network request fails.
   - **Button 2: “Not ready yet 💗”**:
     - Displays: *“That's okay, my love. Take all the time you need. ❤️ I respect your feelings, and you don't have to make a decision before you're ready.”*
     - Strictly sends **no** email notification.
     - Allows her to return to the letter or browse peacefully with zero pressure.

8. **Atmosphere & Music**
   - Canvas-based soft cherry blossom petals and glowing particles with subtle drift.
   - Floating audio controller: stays paused by default until Annuva chooses to play.
   - Dual audio engine: plays `/media/music/bg-music.mp3` or seamlessly falls back to a built-in Web Audio API gentle acoustic piano synthesizer.
   - Fully supports `prefers-reduced-motion` for accessibility.

---

## 💌 EmailJS Setup Guide (Free, 2 Minutes)

To receive real email notifications directly in your inbox when Annuva clicks **“Yes, let's talk ❤️”**:

1. Create a free account at [EmailJS](https://www.emailjs.com/).
2. **Add an Email Service**:
   - Go to **Email Services** → **Add New Service** (select Gmail or your preferred provider).
   - Connect your email and copy the **Service ID** (e.g. `service_xxxx`).
3. **Create an Email Template**:
   - Go to **Email Templates** → **Create New Template**.
   - Set Subject: `❤️ Annuva wants to talk! | Apology Website Response`
   - In the Template Content, write:
     ```
     {{message}}

     Website: {{website_name}}
     Event: {{event}}
     Date & Time: {{date_time}}
     ```
   - In the **Settings** / **To Email** field, enter your email address (Nestle's email).
   - Save and copy the **Template ID** (e.g. `template_xxxx`).
4. **Get your Public Key**:
   - Go to **Account** → **API Keys** → Copy your **Public Key** (e.g. `user_xxxx` or `public_xxxx`).
5. **Add to `.env` file** (or Vercel Environment Variables):
   ```env
   VITE_EMAILJS_SERVICE_ID=service_xxxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxxx
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   ```
*(Restart your dev server with `npm run dev` after updating `.env`).*

---


## 🛠️ Tech Stack

- **React 19**
- **Vite 8**
- **Tailwind CSS v4**
- **Framer Motion**
- **Lucide Icons**

---

## 🚀 Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. Open your browser at the local URL (usually `http://localhost:5173`).

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## 🎨 How to Customize Content & Photos

All text, memories, letter paragraphs, and music can be edited in a single file:
👉 **`src/data/apologyConfig.js`**

### To replace photos with your real pictures:
1. Place your photos in the `public/photos/` folder (e.g. `public/photos/our-memory.jpg`).
2. Open `src/data/apologyConfig.js` and update the `memoriesSection.items` array:
   ```javascript
   {
     id: 1,
     title: "Your Custom Title",
     date: "Your Date",
     tag: "Memory",
     image: "/photos/our-memory.jpg",
     note: "Your personal note..."
   }
   ```

---

## 🌐 Deploying to Vercel

### Option 1: Via Vercel Web Dashboard (Recommended)
1. Push this project to your GitHub account:
   ```bash
   git add .
   git commit -m "feat: romantic apology website for Annuva"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** -> **"Project"**.
4. Select your GitHub repository.
5. Vercel automatically detects **Vite**; keep the default settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**. In under a minute, your website will be live with an HTTPS link (e.g., `https://for-annuva.vercel.app`).

### Option 2: Via Vercel CLI
```bash
npm install -g vercel
vercel
```
Follow the interactive prompts to deploy. For production deployment, run:
```bash
vercel --prod
```

### 🔒 Privacy Protection Tip
If you want to keep the deployed link completely private between just the two of you:
- In your Vercel project dashboard, go to **Settings** -> **Deployment Protection**.
- Enable **Vercel Authentication** or **Password Protection** so only you and Annuva can access it.

---

*Made with love, respect, and patience by Nestle ❤️*
