import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Sparkles } from 'lucide-react';

// ─── Bot Knowledge Base ────────────────────────────────────────────────────────
const BOT_NAME = "AdiBot";

const MOODS = {
  happy:    { emoji: '😊', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  excited:  { emoji: '🤩', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  thinking: { emoji: '🤔', color: '#22d3ee', bg: 'rgba(34,211,238,0.15)' },
  cool:     { emoji: '😎', color: '#22c55e', bg: 'rgba(34,197,94,0.15)'  },
  proud:    { emoji: '🏆', color: '#FFA116', bg: 'rgba(255,161,22,0.15)' },
  wave:     { emoji: '👋', color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
};

const RESPONSES = [
  {
    triggers: ['hi', 'hello', 'hey', 'sup', 'yo', 'hola', 'greet', 'start'],
    mood: 'wave',
    replies: [
      "Hey there! 👋 I'm AdiBot, Aditya's personal portfolio assistant! Ask me anything about his skills, projects, experience, or how to contact him!",
      "Hello! 🌟 Welcome to Aditya's portfolio! I know everything about him — his projects, skills, certifications, and more. What would you like to know?",
    ],
    chips: ['🚀 Projects', '🛠 Skills', '🎓 Education', '📬 Contact'],
  },
  {
    triggers: ['project', 'work', 'built', 'made', 'create', 'app', 'website'],
    mood: 'excited',
    replies: [
      "Oh, Aditya's projects are 🔥! His top ones include:\n\n• **Healthcare Triage Bot** — LLM-powered AI triage\n• **Gait Analysis AI** — 93% accuracy hybrid model\n• **SmartQ Platform** — Real-time queue + PayPal\n• **Expense Tracker** — Glassmorphism + Chart.js\n• **CSV Comparator** — Built at SAIL internship\n\nHe's built 9+ projects total! Want details on any?",
      "Aditya is a builder at heart! 🛠️ He's built AI systems, full-stack apps, and even industrial tools during his SAIL internship. Scroll up to see all 9 projects in the Projects section!",
    ],
    chips: ['🤖 AI Projects', '💻 Web Apps', '🧠 ML Projects'],
  },
  {
    triggers: ['skill', 'tech', 'language', 'stack', 'know', 'use', 'can'],
    mood: 'cool',
    replies: [
      "Aditya's tech stack is impressive! 💪\n\n**Frontend:** React, Next.js, Vite, CSS\n**Backend:** Python, FastAPI, Node.js, Express\n**AI/ML:** NLP, Scikit-learn, HuggingFace, Neural Networks\n**Databases:** MongoDB, MySQL, Neo4j\n**Security:** Kali Linux, Wireshark, Nmap\n**Tools:** Docker, Git, Linux, Bash",
      "He's proficient in 10+ technologies! 🚀 From React on the frontend to FastAPI backends, and even cybersecurity tools like Kali Linux. He's a true full-stack engineer!",
    ],
    chips: ['⚛️ React', '🐍 Python', '🔐 Cybersecurity', '🧠 ML/AI'],
  },
  {
    triggers: ['education', 'college', 'university', 'degree', 'study', 'cgpa', 'gpa', 'grade'],
    mood: 'proud',
    replies: [
      "🎓 Aditya is currently pursuing:\n\n**B.Tech in Computer Science & Engineering**\n📍 C.V. Raman Global University, Bhubaneswar\n📅 2023 – 2027\n⭐ CGPA: **8.33 / 10**\n\nHe's consistently maintained strong academics while also being active in competitive programming and building real projects!",
    ],
    chips: ['🏛 University', '📊 CGPA', '🗓 Batch 2027'],
  },
  {
    triggers: ['internship', 'experience', 'job', 'work experience', 'sail', 'industrial'],
    mood: 'proud',
    replies: [
      "🏭 Aditya interned at **Steel Authority of India Limited (SAIL)**!\n\n📍 Bokaro Steel City, India\n📅 May – June 2025 (2 months)\n🔧 Role: Summer Intern\n\nHe worked on vocational training, Computerized System Validation (CSV), and even built a CSV Comparator tool during his time there. SAIL is one of India's biggest steel plants!",
    ],
    chips: ['🏭 About SAIL', '🔧 What he did', '📄 Certificate'],
  },
  {
    triggers: ['certificate', 'certification', 'certified', 'course', 'learn'],
    mood: 'excited',
    replies: [
      "Aditya has 15+ certifications! 📜 Some highlights:\n\n🤖 Claude API — Anthropic\n🧠 IBM Machine Learning Professional\n☁️ Google Generative AI & LLMs\n🌩 AWS Cloud Support Associate\n📊 Google Data Analytics\n🚗 Self-Driving Car — Coursera\n✈️ Airbus Supply Chain Specialist\n⚡ HackerRank Problem Solving (Intermediate)\n\n...and many more! He's always learning.",
    ],
    chips: ['🧠 ML Certs', '☁️ Cloud Certs', '💻 Dev Certs'],
  },
  {
    triggers: ['leetcode', 'competitive', 'coding', 'hackerrank', 'gfg', 'codeforces', 'codechef', 'dsa', 'algorithm'],
    mood: 'proud',
    replies: [
      "Aditya is a competitive programming beast! 🏆\n\n**LeetCode:** 200+ problems, Top 15% globally, 50-day streak\n**HackerRank:** 5★ in Python, C++, Problem Solving\n**CodeChef:** 3★, 1600+ rating\n**GeeksForGeeks:** 150+ problems, Top 5% institute rank\n**Codeforces:** 40+ contests participated\n\nHe's solved 400+ problems across all platforms! 💪",
    ],
    chips: ['🟡 LeetCode', '🟢 HackerRank', '🔵 Codeforces'],
  },
  {
    triggers: ['contact', 'email', 'reach', 'hire', 'connect', 'linkedin', 'message'],
    mood: 'happy',
    replies: [
      "Want to connect with Aditya? Here's how! 📬\n\n📧 **Email:** adityakumarroy401@gmail.com\n💼 **LinkedIn:** linkedin.com/in/aditya-roy23\n🐙 **GitHub:** github.com/bhumiadi23\n\nHe's currently **open to work** and always happy to collaborate on exciting projects! Scroll to the Contact section to send him a message directly 🚀",
    ],
    chips: ['📧 Email him', '💼 LinkedIn', '🐙 GitHub'],
  },
  {
    triggers: ['who', 'about', 'aditya', 'tell me', 'yourself', 'introduce'],
    mood: 'happy',
    replies: [
      "Meet Aditya Roy! 🙋‍♂️\n\nHe's a **B.Tech CSE student** at C.V. Raman Global University (2023–27) with a CGPA of 8.33. He's a passionate **Full-Stack Developer**, **AI/ML enthusiast**, and **competitive programmer**.\n\nHe's interned at SAIL, built 9+ real projects, earned 15+ certifications, and solved 400+ coding problems. He's also into cybersecurity and bug bounty hunting! 🛡️",
    ],
    chips: ['🚀 His Projects', '🛠 His Skills', '📜 Certifications'],
  },
  {
    triggers: ['ai', 'machine learning', 'ml', 'deep learning', 'nlp', 'neural'],
    mood: 'excited',
    replies: [
      "AI/ML is Aditya's passion! 🤖✨\n\nHe's worked with:\n• **NLP** & HuggingFace Transformers\n• **Supervised/Unsupervised Learning**\n• **Neural Networks** & Deep Learning\n• **Scikit-learn** for ML pipelines\n• **Feature Engineering** & model optimization\n\nHe's also certified in **IBM Machine Learning**, **Google Generative AI**, and the **Anthropic Claude API**! He even built a healthcare triage bot using LLMs 🏥",
    ],
    chips: ['🏥 Triage Bot', '🚗 Self-Driving Car', '🧠 Gait AI'],
  },
  {
    triggers: ['cybersecurity', 'security', 'hack', 'bug bounty', 'kali', 'cyber'],
    mood: 'cool',
    replies: [
      "Aditya is also into cybersecurity! 🛡️\n\nHe's actively involved in:\n• **Bug Bounty Hunting** — finding vulnerabilities\n• **Network Traffic Analysis** with Wireshark\n• **Vulnerability Assessment** with Nmap\n• **Ethical Hacking** principles\n• **Kali Linux** power user\n\nCybersecurity is his side hustle! 💪",
    ],
    chips: ['🐛 Bug Bounty', '🔍 Tools he uses'],
  },
  {
    triggers: ['github', 'repo', 'repository', 'open source', 'code'],
    mood: 'cool',
    replies: [
      "Check out Aditya's GitHub 🐙\n\n**github.com/bhumiadi23**\n\nYou can see his latest repos live on the Projects section of this portfolio — it's connected to the GitHub API in real time! His pinned repos include competitive coding solutions, web apps, and AI projects.",
    ],
    chips: ['🐙 View GitHub', '📂 Latest Repos'],
  },
];

const FALLBACK = {
  mood: 'thinking',
  replies: [
    "Hmm, I'm not sure about that one! 🤔 But I know a lot about Aditya! Try asking me about his projects, skills, education, internship, certifications, or how to contact him!",
    "I didn't quite catch that! 😅 Try asking: 'What are his projects?', 'What skills does he have?', or 'How can I contact him?'",
  ],
  chips: ['🚀 Projects', '🛠 Skills', '📬 Contact', '🎓 Education'],
};

function getResponse(input) {
  const lower = input.toLowerCase();
  for (const r of RESPONSES) {
    if (r.triggers.some(t => lower.includes(t))) {
      return {
        mood: r.mood,
        text: r.replies[Math.floor(Math.random() * r.replies.length)],
        chips: r.chips,
      };
    }
  }
  return {
    mood: FALLBACK.mood,
    text: FALLBACK.replies[Math.floor(Math.random() * FALLBACK.replies.length)],
    chips: FALLBACK.chips,
  };
}

// ─── Message Component ────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isBot = msg.role === 'bot';
  const mood = MOODS[msg.mood] || MOODS.happy;

  // Render markdown-like bold **text**
  const renderText = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((p, i) =>
      i % 2 === 1 ? <strong key={i} style={{ color: 'white' }}>{p}</strong> : p
    );
  };

  return (
    <motion.div
      className={`bot-msg-row ${isBot ? 'bot-msg-left' : 'bot-msg-right'}`}
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.3 }}
    >
      {isBot && (
        <motion.div
          className="bot-avatar-small"
          style={{ background: mood.bg, border: `2px solid ${mood.color}44` }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {mood.emoji}
        </motion.div>
      )}
      <div className={`bot-bubble ${isBot ? 'bot-bubble-bot' : 'bot-bubble-user'}`}
        style={isBot ? { borderColor: `${mood.color}33` } : {}}>
        {msg.text.split('\n').map((line, i) => (
          <p key={i} style={{ margin: line === '' ? '0.3rem 0' : 0, lineHeight: 1.7 }}>
            {renderText(line)}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator({ mood }) {
  const m = MOODS[mood] || MOODS.thinking;
  return (
    <motion.div className="bot-msg-row bot-msg-left" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bot-avatar-small" style={{ background: m.bg, border: `2px solid ${m.color}44` }}>
        <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
          {m.emoji}
        </motion.span>
      </div>
      <div className="bot-bubble bot-bubble-bot bot-typing">
        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0 }}>●</motion.span>
        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.2 }}>●</motion.span>
        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.4 }}>●</motion.span>
      </div>
    </motion.div>
  );
}

// ─── Main AdiBot Component ────────────────────────────────────────────────────
export default function AdiBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 0, role: 'bot', mood: 'wave', text: "Hey! 👋 I'm AdiBot — Aditya's personal assistant! Ask me anything about his skills, projects, or experience. I'm here to help!" },
  ]);
  const [chips, setChips] = useState(['🚀 Projects', '🛠 Skills', '🎓 Education', '📬 Contact']);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [typingMood, setTypingMood] = useState('thinking');
  const [currentMood, setCurrentMood] = useState('wave');
  const [pulse, setPulse] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Pulse the button periodically when closed
  useEffect(() => {
    if (open) return;
    const t = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1200);
    }, 5000);
    return () => clearInterval(t);
  }, [open]);

  const sendMessage = (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput('');
    setMessages(m => [...m, { id: Date.now(), role: 'user', text: userText }]);
    setChips([]);
    const resp = getResponse(userText);
    setTypingMood(resp.mood);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setCurrentMood(resp.mood);
      setMessages(m => [...m, { id: Date.now() + 1, role: 'bot', mood: resp.mood, text: resp.text }]);
      setChips(resp.chips || []);
    }, 1200 + Math.random() * 600);
  };

  const mood = MOODS[currentMood] || MOODS.happy;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="adibot-fab"
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        style={{ background: `linear-gradient(135deg, ${mood.color}cc, ${mood.color})` }}
        animate={pulse && !open ? { scale: [1, 1.12, 1], boxShadow: [`0 0 0 0 ${mood.color}44`, `0 0 0 14px ${mood.color}00`] } : {}}
        transition={{ duration: 0.8 }}
        aria-label="Open AdiBot"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}
              style={{ fontSize: '1.4rem' }}>
              {mood.emoji}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {!open && pulse && (
          <motion.div className="adibot-tooltip" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            Ask me anything! ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div className="adibot-window"
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
          >
            {/* Header */}
            <div className="adibot-header" style={{ borderBottom: `2px solid ${mood.color}44` }}>
              <motion.div className="adibot-header-avatar"
                style={{ background: mood.bg, border: `2px solid ${mood.color}` }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              >
                {mood.emoji}
              </motion.div>
              <div>
                <div className="adibot-header-name">
                  {BOT_NAME} <Sparkles size={14} style={{ color: mood.color }} />
                </div>
                <div className="adibot-header-status">
                  <span className="adibot-online-dot" style={{ background: '#22c55e' }} />
                  Always online · Knows everything about Aditya
                </div>
              </div>
              <motion.button className="adibot-close-btn" onClick={() => setOpen(false)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <X size={16} />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="adibot-messages">
              {messages.map(m => <MessageBubble key={m.id} msg={m} />)}
              {typing && <TypingIndicator mood={typingMood} />}
              <div ref={bottomRef} />
            </div>

            {/* Quick Reply Chips */}
            <AnimatePresence>
              {chips.length > 0 && (
                <motion.div className="adibot-chips" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {chips.map((chip, i) => (
                    <motion.button key={chip} className="adibot-chip" onClick={() => sendMessage(chip)}
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.07 }} whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.95 }}
                      style={{ borderColor: `${mood.color}44`, color: mood.color, background: mood.bg }}>
                      {chip}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="adibot-input-row">
              <input
                ref={inputRef}
                className="adibot-input"
                placeholder="Ask me about Aditya..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                style={{ borderColor: `${mood.color}33` }}
              />
              <motion.button className="adibot-send" onClick={() => sendMessage()}
                style={{ background: `linear-gradient(135deg, ${mood.color}cc, ${mood.color})` }}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                disabled={!input.trim() && !typing}>
                <Send size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
