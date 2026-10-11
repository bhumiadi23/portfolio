/**
 * Configuration & Content for Annuva's Apology Website
 * Crafted with love, respect, and sincerity by Nestle
 */

export const apologyConfig = {
  // Names
  recipientName: "Annuva",
  senderName: "Nestle",
  nickname: "my Annuva",

  // 1. Opening Screen
  opening: {
    badge: "A message from my heart",
    greeting: "Hey, my Annuva… ❤️",
    message:
      "I know things haven't been okay between us, and I have something I want to tell you. Not to win an argument, not to prove myself right, but because you and your feelings matter to me.",
    buttonText: "Open my letter 💌",
    hintText: "Click the seal to read what I've written for you",
  },

  // 2. The Apology Letter (Exact requested words)
  letter: {
    date: "From Nestle to Annuva",
    salutation: "My Annuva,",
    paragraphs: [
      "I know we had a fight, and I know that saying sorry cannot instantly make everything okay. But I still want to tell you how truly sorry I am.",
      "I'm sorry for the things I said or did that hurt you. I'm sorry if I made you feel misunderstood, unappreciated, or as if your feelings didn't matter enough. You never deserved to feel that way because of me.",
      "Sometimes, in the heat of a moment, I forget that the person on the other side of the argument is someone I love more than I can explain. I don't want my anger, ego, or careless words to become the reason you feel sad.",
      "I'm not writing this to pressure you to forgive me immediately. You have every right to feel what you feel, and I want to listen to you instead of simply defending myself.",
      "I love you, Annuva. And I want to become better at showing that love — not only through sweet words, but through my actions, patience, and the way I treat you.",
      "I'm sorry, my love. Whenever you're ready, I want to listen, understand, and make things right with you.",
    ],
    signOff: "Always yours,",
    signature: "Your Nestle ❤️",
  },

  // 3. Interactive Section: "What I Want You to Know"
  keyCards: [
    {
      id: "feelings",
      title: "Your Feelings Matter",
      quote:
        "I don't want you to feel that you have to hide your sadness just to keep us okay. I want to understand how you feel, even when it is difficult for me to hear.",
      themeColor: "from-rose-50 to-pink-100/60",
      accentColor: "#BE123C",
      borderAccent: "border-rose-200/80",
      iconType: "heartHands",
      reflection:
        "Your tears and silence aren't burdens to me. They matter, and they deserve gentle ears.",
    },
    {
      id: "better",
      title: "I Want to Do Better",
      quote:
        "I know that love isn't only about saying beautiful things. It's also about listening, controlling my reactions, respecting your feelings, and learning from my mistakes.",
      themeColor: "from-amber-50/70 to-rose-50/70",
      accentColor: "#9F1239",
      borderAccent: "border-pink-200/80",
      iconType: "sprout",
      reflection:
        "Growth isn't an excuse for hurting you. It's my daily responsibility to you.",
    },
    {
      id: "rush",
      title: "You Don't Have to Rush",
      quote:
        "You don't owe me an instant smile or immediate forgiveness. Take the time you need. I'll respect your feelings and give you the space you need.",
      themeColor: "from-purple-50/60 to-pink-50/60",
      accentColor: "#881337",
      borderAccent: "border-rose-200/80",
      iconType: "hourglass",
      reflection:
        "Take all the breathing room you need. I will be right here, waiting patiently.",
    },
  ],

  // 4. Our Little World: Memory Timeline
  memoriesSection: {
    heading: "Even when we have difficult days, our story means something to me.",
    subheading:
      "A quiet corner reminding us of the softness, laughter, and depth of what we share.",
    placeholderNotice:
      "Replace these placeholder moments with your real photos in src/data/apologyConfig.js",
    items: [
      {
        id: 1,
        title: "Quiet Smiles & Easy Conversations",
        date: "A quiet afternoon we shared",
        tag: "Comfort",
        image: "/photos/photo1.png",
        fallbackImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
        note: "Those moments when the world outside fades and it's just the sound of your laughter.",
      },
      {
        id: 2,
        title: "The Little Things That Remind Me of You",
        date: "Every simple day",
        tag: "Fondness",
        image: "/photos/photo2.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80",
        note: "A song, a quiet street, a warmth that makes me instantly wish you were right by my side.",
      },
      {
        id: 3,
        title: "Moments Where Time Stood Still",
        date: "Under evening skies",
        tag: "Connection",
        image: "/photos/photo3.png",
        fallbackImage: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
        note: "The peace that comes when you look at me and everything feels gentle and safe.",
      },
      {
        id: 4,
        title: "The Warmth We Built Together",
        date: "Written in our hearts",
        tag: "Home",
        image: "/photos/photo4.png",
        fallbackImage: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=800&q=80",
        note: "Our journey is made of real days, real vulnerability, and a bond worth fighting for.",
      },
    ],
  },

  // 5. A Little Promise Tree 🌸
  promiseTree: {
    heading: "A Little Promise Tree 🌸",
    subheading:
      "Tap each glowing heart-shaped bud to reveal my commitments to you. These are not promises to erase what happened, but commitments I will carry forward.",
    note: "Promises alone cannot undo pain — they are markers of the partner I am working to be for you.",
    promises: [
      {
        id: 1,
        text: "I will try to listen before reacting.",
        detail: "Taking a deep breath, setting aside defensiveness, and hearing your pain first.",
        leafPosition: { x: "28%", y: "42%" },
      },
      {
        id: 2,
        text: "I will respect your feelings, even when we disagree.",
        detail: "Because how you feel is never invalid or secondary, even in the middle of a conflict.",
        leafPosition: { x: "42%", y: "24%" },
      },
      {
        id: 3,
        text: "I will work on the things that hurt you.",
        detail: "Owning my mistakes, catching reckless patterns, and genuinely reshaping them.",
        leafPosition: { x: "58%", y: "22%" },
      },
      {
        id: 4,
        text: "I will show my love through my actions.",
        detail: "Backing up my words with calm patience, gentle care, and daily respect.",
        leafPosition: { x: "72%", y: "38%" },
      },
      {
        id: 5,
        text: "I will remember that we're on the same team, even during arguments.",
        detail: "It is you and me together against the misunderstanding, never you against me.",
        leafPosition: { x: "50%", y: "48%" },
      },
    ],
  },

  // 6. The Final Screen: "Whenever You're Ready"
  finalScreen: {
    heading: "I'm sorry, my Annuva. ❤️",
    message1:
      "I'm not asking you to forget what happened. I'm asking for the chance to understand you better, learn from this, and show you that my love can be kinder, calmer, and more thoughtful.",
    message2:
      "No matter how difficult a moment becomes, I want us to learn how to understand each other better.",
    button1: "I read your letter 💗",
    button2: "I want to talk to you 💌",
    response1: {
      title: "Thank you for taking the time to read this, Annuva.",
      body: "Knowing that you gave my words your time means everything to me. You don't have to reply or say anything right now. Take all the time and peace you need.",
    },
    response2: {
      title: "I'm right here whenever you're ready.",
      body: "Whenever you're ready, I'm here to listen. No pressure, no arguments — just us, talking honestly.",
    },
  },

  // 7. Final Interactive Apology Decision: "Can We Make Things Better? ❤️"
  decision: {
    title: "My Annuva, one last little question… 🥺❤️",
    subtitle:
      "Would you give us a chance to talk, understand each other, and make things better?",
    yesButtonText: "Yes, let's talk ❤️",
    noButtonText: "Not ready yet 💗",
    yesSuccessMessage:
      "Thank you, my love. ❤️ I'm happy you're willing to talk. I'll do my best to listen, understand you, and make things better.",
    noMessage:
      "That's okay, my love. Take all the time you need. ❤️ I respect your feelings, and you don't have to make a decision before you're ready.",
    websiteName: "A Romantic Apology Website for Annuva",
    eventName: "Annuva clicked Yes",
  },

  // Audio / Music Settings
  music: {
    title: "Soft Piano Reflection",
    artist: "Gentle Instrumental",
    src: "/media/music/bg-music.mp3",
  },
};

