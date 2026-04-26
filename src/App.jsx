import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Camera, Mail, GitFork, ExternalLink, Code, Cpu, Globe,
  Terminal, Star, GitBranch, Eye, ChevronDown, Zap,
  BookOpen, Trophy, Target, TrendingUp, Award, CheckCircle2,
  GraduationCap, Briefcase, ScrollText, Menu, X, Sun, Moon,
  Download, Shield, Lightbulb, ChevronRight,
  Copy, Check, MessageCircle, CalendarDays, MapPin, Clock,
  Send
} from 'lucide-react';
import './App.css';
import AdiBot from './AdiBot.jsx';

// ─── Typing Animation ──────────────────────────────────────────────────
function TypingText({ texts }) {
  const [currentText, setCurrentText] = useState('');
  const [textIdx, setTextIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    const target = texts[textIdx];
    const speed = isDeleting ? 60 : 110;
    const timer = setTimeout(() => {
      if (!isDeleting && currentText === target) { setTimeout(() => setIsDeleting(true), 1500); return; }
      if (isDeleting && currentText === '') { setIsDeleting(false); setTextIdx(i => (i + 1) % texts.length); return; }
      setCurrentText(isDeleting ? target.slice(0, currentText.length - 1) : target.slice(0, currentText.length + 1));
    }, speed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, textIdx, texts]);
  return <span className="typing-text">{currentText}<span className="cursor-blink">|</span></span>;
}

// ─── Animated Counter ──────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);
  useEffect(() => {
    if (!started) return;
    const num = parseInt(target);
    let current = 0;
    const step = Math.ceil(num / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, num);
      setCount(current);
      if (current >= num) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [started, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Skill Bar ─────────────────────────────────────────────────────────
function SkillBar({ name, level, color }) {
  return (
    <motion.div className="skill-bar-wrap" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
      <div className="skill-bar-header"><span>{name}</span><span style={{ color }}>{level}%</span></div>
      <div className="skill-bar-track">
        <motion.div className="skill-bar-fill" style={{ background: `linear-gradient(to right, ${color}88, ${color})` }}
          initial={{ width: 0 }} whileInView={{ width: `${level}%` }} viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }} />
      </div>
    </motion.div>
  );
}

// ─── Project Card ──────────────────────────────────────────────────────
function ProjectCard({ project, index }) {
  return (
    <motion.div className="project-card glass-panel"
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay: index * 0.1 }} whileHover={{ y: -8, scale: 1.02 }}
      style={{ '--card-color': project.color, borderTop: `3px solid ${project.color}` }}>
      <div className="project-card-header">
        <div className="project-icon" style={{ background: `${project.color}22`, color: project.color }}>{project.icon}</div>
        <span className={`project-status status-${project.status.toLowerCase()}`}>{project.status}</span>
      </div>
      <h3 className="project-name">{project.name}</h3>
      <p className="project-desc">{project.description}</p>
      {project.metrics && (
        <ul className="project-metrics">
          {project.metrics.map((m, i) => (
            <li key={i} className="project-metric-item" style={{ color: project.color }}>
              <span className="metric-dot" style={{ background: project.color }} />{m}
            </li>
          ))}
        </ul>
      )}
      <div className="project-tech">
        {project.tech.map(t => <span key={t} className="tech-tag" style={{ borderColor: `${project.color}55`, color: project.color }}>{t}</span>)}
      </div>
      <div className="project-footer">
        <span className="project-stars"><Star size={14} /> {project.stars}</span>
        <a href={project.link} target="_blank" rel="noreferrer" className="project-link" style={{ color: project.color }}>
          View <ExternalLink size={14} />
        </a>
      </div>
    </motion.div>
  );
}

// ─── Particle Background ───────────────────────────────────────────────
function ParticleBackground() {
  return (
    <div className="particle-bg">
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="particle" style={{
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          width: `${Math.random() * 4 + 1}px`, height: `${Math.random() * 4 + 1}px`,
          animationDelay: `${Math.random() * 8}s`, animationDuration: `${Math.random() * 10 + 8}s`,
          opacity: Math.random() * 0.4 + 0.1,
        }} />
      ))}
    </div>
  );
}

// ─── Contact Form ──────────────────────────────────────────────────────
function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState(false);

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.message.trim()) errs.message = 'Message is required';
    return errs;
  };

  const getInpStyle = (field) => ({
    width: '100%', padding: '0.9rem 1rem',
    background: errors[field] ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)',
    border: `1px solid ${errors[field] ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: '12px', color: 'white', fontSize: '0.95rem', outline: 'none',
    transition: 'border 0.3s', fontFamily: 'inherit',
  });

  const onFocus = (e) => { e.target.style.borderColor = 'rgba(168,85,247,0.6)'; };
  const onBlur  = (e, field) => { if (!errors[field]) e.target.style.borderColor = 'rgba(255,255,255,0.12)'; };

  if (sent) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#a78bfa' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
      <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Message sent!</h3>
      <p style={{ color: 'var(--text-muted)' }}>I'll get back to you soon — expect a reply within 24h!</p>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {toast && (
          <motion.div className="toast-notif"
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
            transition={{ type: 'spring', bounce: 0.3 }}>
            <CheckCircle2 size={18} style={{ color: '#22c55e', flexShrink: 0 }} />
            <span>Message sent! I'll reply within 24h 🚀</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={(e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        window.location.href = `mailto:adityakumarroy401@gmail.com?subject=Contact from ${form.name}&body=${encodeURIComponent(form.message + '\n\nFrom: ' + form.email)}`;
        setSent(true);
        setToast(true);
        setTimeout(() => setToast(false), 4000);
      }} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <h3 style={{ color: 'white', fontSize: '1.3rem' }}>Send a Message</h3>
        <div>
          <input type="text" placeholder="Your name" value={form.name} onChange={set('name')}
            style={getInpStyle('name')} onFocus={onFocus} onBlur={(e) => onBlur(e, 'name')} />
          {errors.name && <p className="input-error">{errors.name}</p>}
        </div>
        <div>
          <input type="email" placeholder="Your email" value={form.email} onChange={set('email')}
            style={getInpStyle('email')} onFocus={onFocus} onBlur={(e) => onBlur(e, 'email')} />
          {errors.email && <p className="input-error">{errors.email}</p>}
        </div>
        <div>
          <textarea placeholder="Your message" rows={5} value={form.message} onChange={set('message')}
            style={{ ...getInpStyle('message'), resize: 'vertical' }}
            onFocus={onFocus} onBlur={(e) => onBlur(e, 'message')} />
          {errors.message && <p className="input-error">{errors.message}</p>}
        </div>
        <motion.button type="submit"
          whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(139,92,246,0.5)' }} whileTap={{ scale: 0.97 }}
          style={{ padding: '0.9rem', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'inherit' }}>
          <Send size={18} /> Send Message
        </motion.button>
      </form>
    </>
  );
}

// ─── Copy Button ────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };
  return (
    <motion.button className={`copy-btn${copied ? ' copy-btn-done' : ''}`} onClick={copy}
      title="Copy to clipboard" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      {copied ? <><Check size={12} /> Copied!</> : <Copy size={12} />}
    </motion.button>
  );
}



// ─── Platform Stat Card ────────────────────────────────────────────────
function PlatformCard({ platform, index }) {
  return (
    <motion.a href={platform.url} target="_blank" rel="noreferrer"
      className="platform-card glass-panel"
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -6, boxShadow: `0 16px 40px ${platform.color}25` }}
      style={{ borderTop: `3px solid ${platform.color}` }}>
      <div className="platform-header">
        <div className="platform-icon-wrap" style={{ background: `${platform.color}18`, color: platform.color }}>{platform.icon}</div>
        <div>
          <h3 className="platform-name" style={{ color: platform.color }}>{platform.name}</h3>
          <p className="platform-handle">{platform.handle}</p>
        </div>
        <ExternalLink size={14} className="platform-link-arrow" style={{ color: platform.color }} />
      </div>
      <div className="platform-main-stat">
        <span className="platform-main-val" style={{ color: platform.color }}>{platform.mainStat}</span>
        <span className="platform-main-label">{platform.mainLabel}</span>
      </div>
      <div className="platform-sub-stats">
        {platform.subStats.map((s, i) => (
          <div key={i} className="platform-sub-stat">
            <span className="sub-stat-val" style={{ color: s.color || 'white' }}>{s.val}</span>
            <span className="sub-stat-label">{s.label}</span>
          </div>
        ))}
      </div>
      {platform.difficulties && (
        <div className="platform-difficulties">
          {platform.difficulties.map((d, i) => (
            <div key={i} className="diff-row">
              <span className="diff-label" style={{ color: d.color }}>{d.label}</span>
              <div className="diff-track">
                <motion.div className="diff-fill" style={{ background: d.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(d.solved / d.total) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 + i * 0.15 }} />
              </div>
              <span className="diff-count" style={{ color: d.color }}>{d.solved}/{d.total}</span>
            </div>
          ))}
        </div>
      )}
      {platform.badges && (
        <div className="platform-badges">
          {platform.badges.map((b, i) => (
            <span key={i} className="platform-badge" style={{ borderColor: `${platform.color}44`, color: platform.color }}>{b}</span>
          ))}
        </div>
      )}
    </motion.a>
  );
}


// ─── Prompt Terminal ────────────────────────────────────────────────────────
const PROMPT_LINES = [
  { type: 'cmd', text: 'whoami' },
  { type: 'out', text: 'Aditya Roy  —  Full Stack Developer 👨‍💻' },
  { type: 'cmd', text: 'skills' },
  { type: 'out', text: 'React  ·  Python  ·  Node.js  ·  AI/ML  ·  C++' },
  { type: 'cmd', text: 'stats' },
  { type: 'out', text: '600+ problems  ·  CGPA 8.33  ·  15+ certs  ·  SAIL intern' },
  { type: 'cmd', text: 'status' },
  { type: 'out', text: '✅  Open to Work 🚀  —  Drop a message!' },
];

function HeroTerminal() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible < PROMPT_LINES.length) {
      const delay = PROMPT_LINES[visible]?.type === 'cmd' ? 600 : 320;
      const t = setTimeout(() => setVisible(v => v + 1), delay);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setVisible(0), 3200);
      return () => clearTimeout(t);
    }
  }, [visible]);

  return (
    <div className="hero-terminal-wrap">
      <div className="terminal-glow-blob" />
      <motion.div className="terminal-window"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.7, type: 'spring', bounce: 0.3 }}>

        {/* Title bar */}
        <div className="terminal-bar">
          <span className="term-dot term-red" />
          <span className="term-dot term-yellow" />
          <span className="term-dot term-green" />
          <span className="terminal-title">aditya@portfolio: ~</span>
          <span className="terminal-lang">zsh</span>
        </div>

        {/* Prompt body */}
        <div className="terminal-body terminal-prompt-body">
          {PROMPT_LINES.slice(0, visible).map((line, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18 }}
              className={line.type === 'cmd' ? 'prompt-cmd-row' : 'prompt-out-row'}>
              {line.type === 'cmd' ? (
                <>
                  <span className="prompt-sign">❯</span>
                  <span className="prompt-cmd">{line.text}</span>
                  {i === visible - 1 && <span className="term-cursor" />}
                </>
              ) : (
                <span className="prompt-out">{line.text}</span>
              )}
            </motion.div>
          ))}
          {/* idle cursor when done */}
          {visible === 0 && (
            <div className="prompt-cmd-row">
              <span className="prompt-sign">❯</span>
              <span className="term-cursor" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Floating stat cards */}
      <motion.div className="term-stat-card term-stat-1"
        animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        <span className="term-stat-icon">🏆</span>
        <div><div className="term-stat-val">600+</div><div className="term-stat-label">Problems</div></div>
      </motion.div>
      <motion.div className="term-stat-card term-stat-2"
        animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
        <span className="term-stat-icon">⭐</span>
        <div><div className="term-stat-val">8.33</div><div className="term-stat-label">CGPA</div></div>
      </motion.div>
      <motion.div className="term-stat-card term-stat-3"
        animate={{ y: [0, -6, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}>
        <span className="term-stat-icon">📜</span>
        <div><div className="term-stat-val">15+</div><div className="term-stat-label">Certs</div></div>
      </motion.div>
    </div>
  );
}


// ─── Data ──────────────────────────────────────────────────────────────
const myProjects = [
  {
    id: 1, name: 'Healthcare Triage Bot',
    description: 'LLM-powered triage pipeline with rule-based red-flag detection and differential diagnosis.',
    metrics: ['92% classification accuracy on 5K+ samples', 'Reduced triage time by ~40%', '100+ concurrent simulated users handled'],
    tech: ['Python', 'LLM', 'FastAPI', 'React'], color: '#ec4899', icon: <Cpu size={24} />, link: 'https://github.com/bhumiadi23', stars: 12, status: 'Live'
  },
  {
    id: 2, name: 'Gait Analysis AI System',
    description: 'Hybrid ML pipeline combining OpenCV feature extraction with Scikit-learn classifiers for biomechanical pattern detection.',
    metrics: ['~93% accuracy achieved', 'Processed 2K+ gait samples', 'Reduced manual analysis time by 60%'],
    tech: ['Python', 'OpenCV', 'Scikit-learn', 'NLP'], color: '#a855f7', icon: <Zap size={24} />, link: 'https://github.com/bhumiadi23', stars: 15, status: 'Complete'
  },
  {
    id: 3, name: 'Full Stack Portfolio',
    description: 'Production-grade portfolio with live GitHub API, scroll animations, AdiBot AI assistant, dark/light mode, and mobile-first responsive design.',
    metrics: ['<1.5s load time on Vite build', 'Live GitHub API integration', '15+ sections fully responsive'],
    tech: ['React', 'Framer Motion', 'Vite', 'CSS'], color: '#8b5cf6', icon: <Globe size={24} />, link: 'https://github.com/bhumiadi23/portfolio', stars: 8, status: 'Live'
  },
  {
    id: 4, name: 'Expense Tracker App',
    description: 'Full-featured finance tracker with Chart.js visualizations, budget alerts, savings rate analytics, and persistent local storage.',
    metrics: ['5+ chart types integrated', 'Zero backend — pure frontend PWA', 'Tracks unlimited categories in real-time'],
    tech: ['React', 'Chart.js', 'CSS', 'LocalStorage'], color: '#22d3ee', icon: <TrendingUp size={24} />, link: 'https://github.com/bhumiadi23/portfolio/tree/main/expense-tracker', stars: 10, status: 'Live'
  },
  {
    id: 5, name: 'SmartQ Platform',
    description: 'Scalable queue system with modular REST APIs, real-time token booking, PayPal checkout, and async concurrent request handling.',
    metrics: ['Handles 200+ concurrent users', 'REST API with async FastAPI backend', 'PayPal payment integration live'],
    tech: ['React', 'Node.js', 'MongoDB', 'PayPal API'], color: '#f59e0b', icon: <Target size={24} />, link: 'https://github.com/bhumiadi23', stars: 18, status: 'Live'
  },
  {
    id: 6, name: 'CSV Comparator Tool',
    description: 'Industrial-grade CSV validation tool built at SAIL for Computerized System Validation in a large-scale steel manufacturing environment.',
    metrics: ['Deployed in production at SAIL plant', 'Reduced manual validation time by 70%', 'Handles 10K+ row datasets'],
    tech: ['HTML5', 'JavaScript', 'Python', 'CSV'], color: '#64748b', icon: <BookOpen size={24} />, link: 'https://github.com/bhumiadi23', stars: 6, status: 'Complete'
  },
  {
    id: 7, name: 'Cybersecurity Research',
    description: 'Active bug bounty hunting and network vulnerability research using ethical hacking tools and intrusion detection techniques.',
    metrics: ['Multiple vulnerabilities responsibly disclosed', 'Network traffic analysis on 3+ lab environments', 'Kali Linux power user for 1+ year'],
    tech: ['Kali Linux', 'Wireshark', 'Nmap', 'Python'], color: '#22c55e', icon: <Shield size={24} />, link: 'https://github.com/bhumiadi23', stars: 9, status: 'Active'
  },
  {
    id: 8, name: 'Traffic Engineering Report',
    description: '10-page technical report on PHF, PCU, traffic volume, speed, and travel time studies with full statistical data visualization.',
    metrics: ['10+ data collection methods analyzed', 'Statistical models applied to real-world data', 'Published as academic research document'],
    tech: ['Data Analysis', 'Python', 'Matplotlib', 'Excel'], color: '#e11d48', icon: <BookOpen size={24} />, link: 'https://github.com/bhumiadi23', stars: 5, status: 'Complete'
  },
  {
    id: 9, name: 'Competitive DSA Engine',
    description: '400+ optimized solutions across LeetCode, Codeforces, HackerRank covering graphs, DP, greedy, binary search, and segment trees.',
    metrics: ['400+ problems solved across 5 platforms', 'Top 15% globally on LeetCode', '3★ CodeChef · 40+ rated contests'],
    tech: ['C++', 'Python', 'Algorithms', 'Data Structures'], color: '#fb923c', icon: <Terminal size={24} />, link: 'https://leetcode.com/u/GreedyX/', stars: 20, status: 'Active'
  },
  {
    id: 10, name: 'AutoIQ Arena',
    description: 'Smart car comparison platform powered by AI. Compare EVs and internal combustion cars side-by-side with full specifications and recommendations.',
    metrics: ['20+ car database', 'AI-powered insights', 'Responsive glassmorphism UI'],
    tech: ['React', 'TypeScript', 'TailwindCSS', 'Framer Motion'], color: '#3b82f6', icon: <Zap size={24} />, link: 'https://github.com/bhumiadi23/portfolio/tree/main/autoiq-arena', stars: 14, status: 'Live'
  },
  {
    id: 11, name: 'DevPulse Analytics',
    description: 'Coding analytics and productivity dashboard for developers to track performance, code quality, and activity trends.',
    metrics: ['Real-time activity tracking', 'Beautiful data visualizations', 'Developer productivity insights'],
    tech: ['React', 'Vite', 'Recharts', 'Framer Motion'], color: '#10b981', icon: <TrendingUp size={24} />, link: 'https://github.com/bhumiadi23/portfolio/tree/main/devpulse', stars: 22, status: 'Active'
  },
  {
    id: 12, name: 'Second Brain AI',
    description: 'Intelligent knowledge management system with semantic search and an AI assistant that understands your personal notes and documents.',
    metrics: ['Context-aware semantic search', 'Vector embeddings integration', 'Automated document summarization'],
    tech: ['React', 'Node.js', 'Express', 'LLM API'], color: '#8b5cf6', icon: <Lightbulb size={24} />, link: 'https://github.com/bhumiadi23/portfolio/tree/main/second-brain-ai', stars: 19, status: 'Active'
  },
  {
    id: 13, name: 'SwiftShare Ecosystem',
    description: 'Microservices-based peer-to-peer file sharing platform using WebRTC for high-speed, secure, and limitless data transfer.',
    metrics: ['Microservices architecture', 'Real-time WebRTC signaling', 'Zero-knowledge end-to-end encryption'],
    tech: ['React', 'WebRTC', 'Node.js', 'Microservices'], color: '#ef4444', icon: <Globe size={24} />, link: 'https://github.com/bhumiadi23/portfolio/tree/main/swiftshare', stars: 35, status: 'Complete'
  },
];

const skills = [
  { name: 'React / Next.js', level: 88, color: '#61dafb' },
  { name: 'Python / FastAPI', level: 85, color: '#3b82f6' },
  { name: 'C++ / DSA', level: 82, color: '#f59e0b' },
  { name: 'Node.js / Express', level: 78, color: '#22c55e' },
  { name: 'SQL / MongoDB', level: 75, color: '#ec4899' },
  { name: 'Three.js / WebGL', level: 70, color: '#a78bfa' },
];

const platforms = [
  { name: 'LeetCode', handle: '@GreedyX', url: 'https://leetcode.com/u/GreedyX/', color: '#FFA116', icon: <Trophy size={22} />, mainStat: '200+', mainLabel: 'Problems Solved', subStats: [{ val: 'Top 15%', label: 'Global Rank', color: '#FFA116' }, { val: '~50', label: 'Day Streak', color: '#22c55e' }], difficulties: [{ label: 'Easy', color: '#22c55e', solved: 90, total: 856 }, { label: 'Medium', color: '#FFA116', solved: 95, total: 1794 }, { label: 'Hard', color: '#ef4444', solved: 18, total: 790 }], badges: ['50 Days Badge', 'Problem Solver', 'Dynamic Programming'] },
  { name: 'HackerRank', handle: '@bhumiadi_23', url: 'https://www.hackerrank.com/profile/bhumiadi_23', color: '#00EA64', icon: <Award size={22} />, mainStat: '5★', mainLabel: 'Problem Solving', subStats: [{ val: '5★', label: 'Python', color: '#00EA64' }, { val: '5★', label: 'C++', color: '#00EA64' }, { val: '4★', label: 'SQL', color: '#facc15' }], badges: ['Gold Badge', 'Python', 'C++', 'Data Structures'] },
  { name: 'GeeksForGeeks', handle: '@adityakummle9', url: 'https://www.geeksforgeeks.org/profile/adityakummle9', color: '#2F8D46', icon: <Code size={22} />, mainStat: '150+', mainLabel: 'Problems Solved', subStats: [{ val: '1500+', label: 'Coding Score', color: '#2F8D46' }, { val: 'Top 5%', label: 'Institute Rank', color: '#22c55e' }], badges: ['Problem of the Day', 'DSA', 'Arrays & Strings'] },
  { name: 'CodeChef', handle: '@bhumiadi_23', url: 'https://www.codechef.com/users/bhumiadi_23', color: '#ECCA7E', icon: <Target size={22} />, mainStat: '1600+', mainLabel: 'Rating', subStats: [{ val: '3★', label: 'Division', color: '#ECCA7E' }, { val: '80+', label: 'Problems', color: 'white' }], badges: ['3★ Coder', 'Compete', 'Long Challenges', '50 Days Gold Streak'] },
  { name: 'Codeforces', handle: '@bhumiadi_23', url: 'https://codeforces.com/profile/bhumiadi_23', color: '#1F8ACB', icon: <TrendingUp size={22} />, mainStat: '900+', mainLabel: 'Rating', subStats: [{ val: 'Newbie', label: 'Current Rank', color: '#999' }, { val: '40+', label: 'Contests', color: '#1F8ACB' }], badges: ['Contestant', 'Div. 2', 'Div. 3'] },
];

const photos = [
  { id: 1, url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', title: 'Office Vibes' },
  { id: 2, url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', title: 'Late Night Coding' },
  { id: 3, url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', title: 'The Bugs We Made' },
  { id: 4, url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', title: 'More Code' },
];

const certifications = [
  { name: 'Claude with the Anthropic API', issuer: 'Anthropic', date: 'Apr 2026', color: '#d97706', icon: '🤖' },
  { name: 'IBM Machine Learning Professional', issuer: 'IBM', date: 'Jan 2026', color: '#1F8ACB', icon: '🧠' },
  { name: 'Introduction to Generative AI & LLMs', issuer: 'Google Cloud', date: 'Feb 2026', color: '#4285F4', icon: '✨' },
  { name: 'AWS Cloud Support Associate', issuer: 'Amazon Web Services', date: '2026', color: '#FF9900', icon: '☁️' },
  { name: 'Google Data Analytics Professional', issuer: 'Google', date: '2026', color: '#34A853', icon: '📊' },
  { name: 'Self Driving Car Specialization', issuer: 'Coursera', date: 'Oct 2025', color: '#0056D2', icon: '🚗' },
  { name: 'Airbus Supply Chain Specialist', issuer: 'Airbus Beyond', date: 'Mar 2026', color: '#00205B', icon: '✈️' },
  { name: 'Problem Solving (Intermediate)', issuer: 'HackerRank', date: 'Feb 2026', color: '#00EA64', icon: '⚡' },
  { name: 'Software Engineer Intern', issuer: 'HackerRank', date: 'Feb 2026', color: '#00EA64', icon: '💻' },
  { name: 'Meta Social Media Marketing', issuer: 'Meta', date: 'Feb 2026', color: '#1877F2', icon: '📱' },
  { name: 'Web Design & Development', issuer: 'Skill India Digital Hub', date: 'Feb 2026', color: '#FF6B35', icon: '🌐' },
  { name: 'Graphs Camp Certificate', issuer: 'AlgoUniversity', date: 'Oct 2025', color: '#7c3aed', icon: '🔗' },
  { name: 'Innovation by Design', issuer: 'NPTEL', date: 'Feb 2025', color: '#ec4899', icon: '💡' },
  { name: 'Excel Basics for Data Analysis', issuer: 'Coursera', date: 'Feb 2026', color: '#217346', icon: '📈' },
  { name: 'CSV Comparator', issuer: 'Steel Authority of India', date: 'Jun 2025', color: '#64748b', icon: '🏭' },
];

const achievements = [
  { text: 'Solved 130+ problems on LeetCode across DSA, Algorithms & Dynamic Programming', icon: '🏆', color: '#FFA116' },
  { text: 'Codeforces rating ~1300 with consistent participation in rated competitive programming contests', icon: '📊', color: '#1F8ACB' },
  { text: 'CodeChef 3★ rated with active contest participation and steady rating growth', icon: '⭐', color: '#ECCA7E' },
  { text: 'Awarded CodeChef Gold Streak Badge for maintaining a 50-day coding streak', icon: '🔥', color: '#FFD700' },
  { text: 'Achieved ~93% accuracy in a research-based gait analysis system using a hybrid AI approach', icon: '🤖', color: '#a855f7' },
  { text: 'Engaged in Bug Bounty hunting and independent Cybersecurity research & exploration', icon: '🛡️', color: '#22c55e' },
];

// ─── Main App ──────────────────────────────────────────────────────────
export default function App() {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 0.4], [0, 180]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.25], [1, 0.94]);

  const [navScrolled, setNavScrolled] = useState(false);
  const [githubData, setGithubData] = useState(null);
  const [githubRepos, setGithubRepos] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch('https://api.github.com/users/bhumiadi23'),
          fetch('https://api.github.com/users/bhumiadi23/repos?sort=updated&per_page=6')
        ]);
        setGithubData(await userRes.json());
        setGithubRepos(await reposRes.json());
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  const navItems = ['About', 'Experience', 'Projects', 'Skills', 'Certifications', 'Socials', 'Contact'];

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      <ParticleBackground />

      {/* ── Navigation ── */}
      <motion.nav className={`nav-header ${navScrolled ? 'nav-scrolled' : ''}`}
        initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease: 'easeOut' }}>
        <motion.div className="logo" whileHover={{ scale: 1.05 }}>
          <span className="logo-bracket">&lt;</span>ADITYA<span className="logo-bracket">/&gt;</span>
        </motion.div>
        <div className="nav-links">
          {navItems.map(link => (
            <motion.a key={link} className="nav-link" href={`#${link.toLowerCase()}`} whileHover={{ y: -2 }}>{link}</motion.a>
          ))}
        </div>
        <div className="nav-right-group">
          <motion.button className="theme-toggle" onClick={() => setDarkMode(d => !d)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label="Toggle theme">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
          <motion.a href="https://www.linkedin.com/in/aditya-roy23" target="_blank" rel="noreferrer" className="nav-cta"
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(139,92,246,0.5)' }} whileTap={{ scale: 0.95 }}>
            <Download size={14} /> Resume
          </motion.a>
          <motion.button className="hamburger-btn" onClick={() => setMobileMenuOpen(o => !o)} whileTap={{ scale: 0.9 }} aria-label="Menu">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </motion.button>
        </div>
      </motion.nav>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div className="mobile-menu" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {navItems.map(link => (
              <a key={link} className="mobile-nav-link" href={`#${link.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)}>{link}</a>
            ))}
            <a href="https://www.linkedin.com/in/aditya-roy23" target="_blank" rel="noreferrer" className="mobile-nav-link mobile-cta">
              <Download size={16} /> Download Resume
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Section ── */}
      <section className="hero-section" id="about">
        <motion.div className="hero-content" style={{ y: yHero, opacity: opacityHero, scale: scaleHero }}>
          <motion.div className="hero-badge" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <span className="badge-dot" /> Available for work
          </motion.div>
          <motion.h1 className="hero-title" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, type: 'spring', bounce: 0.3 }}>
            Hi, I'm <span className="gradient-text">Aditya</span>
          </motion.h1>
          <motion.div className="hero-subtitle" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
            I build <TypingText texts={['Full-Stack Apps.', 'AI Solutions.', 'DSA Algorithms.', 'Scalable Systems.', 'Web Experiences.']} />
          </motion.div>
          <motion.p className="hero-desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            A passionate developer crafting scalable web apps, AI-powered systems,
            and competitive programming solutions. Exploring the frontiers of
            Full-Stack and Machine Learning.
          </motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, type: 'spring' }}>
            <motion.a href="#projects" className="btn-primary" whileHover={{ scale: 1.06, boxShadow: '0 0 30px rgba(139,92,246,0.55)' }} whileTap={{ scale: 0.95 }}>
              <Zap size={18} /> View My Work
            </motion.a>
            <motion.a href="#contact" className="btn-ghost" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
              <Mail size={18} /> Get in Touch
            </motion.a>
            <motion.a href="https://github.com/bhumiadi23" target="_blank" rel="noreferrer" className="btn-icon"
              whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
              <GitBranch size={20} />
            </motion.a>
          </motion.div>
          <motion.div className="hero-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
            {[
              { label: 'Projects Built',  value: '20',  suffix: '+' },
              { label: 'Problems Solved', value: '600', suffix: '+' },
              { label: 'Certifications', value: '15',  suffix: '+' },
            ].map(s => (
              <div key={s.label} className="hero-stat">
                <span className="hero-stat-value"><AnimatedCounter target={s.value} suffix={s.suffix} /></span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className="hero-avatar-outer"
          initial={{ opacity: 0, scale: 0.9, x: 40 }} animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8, type: 'spring', bounce: 0.25 }}>
          <HeroTerminal />
        </motion.div>

        <motion.a href="#experience" className="scroll-indicator" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <ChevronDown size={28} />
        </motion.a>
      </section>

      {/* ── Education & Experience ── */}
      <section className="section section-exp" id="experience">
        <motion.div className="section-header" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="section-eyebrow"><Briefcase size={16} /> My Journey</span>
          <h2 className="section-title">Education & <span>Experience</span></h2>
        </motion.div>

        <div className="timeline">
          {/* SAIL Internship */}
          <motion.div className="timeline-item" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <div className="timeline-dot" style={{ background: '#64748b', boxShadow: '0 0 16px #64748b88' }}>
              <Briefcase size={14} />
            </div>
            <div className="timeline-line" />
            <div className="timeline-card glass-panel">
              <div className="timeline-card-header">
                <div>
                  <h3 className="timeline-title">Summer Intern</h3>
                  <p className="timeline-org" style={{ color: '#64748b' }}>Steel Authority of India Limited (SAIL)</p>
                </div>
                <span className="timeline-badge" style={{ background: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.3)' }}>Internship</span>
              </div>
              <p className="timeline-meta">📍 Bokaro Steel City, India &nbsp;·&nbsp; May 2025 – Jun 2025 (2 months)</p>
              <p className="timeline-desc">Vocational training at one of India's largest steel plants. Gained hands-on experience in industrial operations, computerized system validation (CSV), and safety protocols in a large-scale manufacturing environment.</p>
              <div className="timeline-tags">
                {['Industrial Operations', 'CSV', 'HTML5', 'Safety Protocols'].map(t => (
                  <span key={t} className="timeline-tag">{t}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Education */}
          <motion.div className="timeline-item" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }}>
            <div className="timeline-dot" style={{ background: '#a855f7', boxShadow: '0 0 16px #a855f788' }}>
              <GraduationCap size={14} />
            </div>
            <div className="timeline-card glass-panel">
              <div className="timeline-card-header">
                <div>
                  <h3 className="timeline-title">B.Tech in Computer Science & Engineering</h3>
                  <p className="timeline-org" style={{ color: '#a855f7' }}>C.V. Raman Global University</p>
                </div>
                <span className="timeline-badge" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)' }}>Current</span>
              </div>
              <p className="timeline-meta">📍 Bhubaneswar, Odisha &nbsp;·&nbsp; 2023 – 2027</p>
              <p className="timeline-desc">Pursuing B.Tech in CSE with a strong focus on algorithms, data structures, full-stack development, and AI/ML. Active member of the coding community with consistent academic performance.</p>
              <div className="timeline-cgpa">
                <span className="cgpa-label">CGPA</span>
                <span className="cgpa-value">8.33 / 10</span>
                <div className="cgpa-bar-track">
                  <motion.div className="cgpa-bar-fill" initial={{ width: 0 }} whileInView={{ width: '83.3%' }} viewport={{ once: true }} transition={{ duration: 1.2, ease: 'easeOut' }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Projects Section ── */}
      <section className="section" id="projects">
        <motion.div className="section-header" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="section-eyebrow"><Code size={16} /> Featured Work</span>
          <h2 className="section-title">My <span>Projects</span></h2>
          <p className="section-desc">Things I've built that I'm proud of 🚀</p>
        </motion.div>
        <div className="projects-grid">
          {myProjects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
        </div>

        {githubRepos.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginTop: '5rem' }}>
            <h3 className="sub-section-title"><GitBranch size={22} /> Latest GitHub Repos</h3>
            <div className="github-repos-grid">
              {githubRepos.map((repo, i) => (
                <motion.a key={repo.id} href={repo.html_url} target="_blank" rel="noreferrer"
                  className="repo-card glass-panel"
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }} whileHover={{ y: -5, borderColor: 'var(--accent)' }}>
                  <div className="repo-name">{repo.name}</div>
                  {repo.description && <p className="repo-desc">{repo.description}</p>}
                  <div className="repo-meta">
                    {repo.language && <span className="repo-lang">● {repo.language}</span>}
                    <span><Star size={12} /> {repo.stargazers_count}</span>
                    <span><Eye size={12} /> {repo.watchers_count}</span>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </section>

      {/* ── Skills Section ── */}
      <section className="section section-skills" id="skills">
        <div className="skills-layout">
          <motion.div className="skills-left" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="section-eyebrow"><Cpu size={16} /> Tech Stack</span>
            <h2 className="section-title">My <span>Skills</span></h2>
            <p className="section-desc">Constantly learning, constantly building. Here's what I'm working with right now:</p>
            <div className="badge-cloud">
              {['React', 'TypeScript', 'Python', 'C++', 'Node.js', 'FastAPI', 'MongoDB', 'PostgreSQL', 'Docker', 'Git', 'Vite', 'Three.js', 'NLP', 'Scikit-learn', 'Kali Linux'].map(b => (
                <motion.span key={b} className="tech-badge" whileHover={{ scale: 1.1, y: -3 }}>{b}</motion.span>
              ))}
            </div>
          </motion.div>
          <div className="skills-right">
            {skills.map(s => <SkillBar key={s.name} {...s} />)}
          </div>
        </div>
      </section>

      {/* ── Certifications Section ── */}
      <section className="section section-certs" id="certifications">
        <motion.div className="section-header" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="section-eyebrow"><ScrollText size={16} /> Verified Learning</span>
          <h2 className="section-title">My <span>Certifications</span></h2>
          <p className="section-desc">Continuously upskilling across AI, Cloud, Web, and more</p>
        </motion.div>

        <div className="certs-grid">
          {certifications.map((cert, i) => (
            <motion.div key={i} className="cert-card glass-panel"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05 }} whileHover={{ y: -5, scale: 1.02 }}
              style={{ borderLeft: `3px solid ${cert.color}` }}>
              <div className="cert-icon">{cert.icon}</div>
              <div className="cert-info">
                <h4 className="cert-name">{cert.name}</h4>
                <p className="cert-issuer" style={{ color: cert.color }}>{cert.issuer}</p>
                <p className="cert-date">{cert.date}</p>
              </div>
              <CheckCircle2 size={16} className="cert-check" style={{ color: cert.color }} />
            </motion.div>
          ))}
        </div>

        {/* Achievements */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginTop: '5rem' }}>
          <h3 className="sub-section-title"><Trophy size={22} /> Key Achievements</h3>
          <div className="achievements-list">
            {achievements.map((ach, i) => (
              <motion.div key={i} className="achievement-item glass-panel"
                initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} whileHover={{ x: 6 }}>
                <span className="achievement-icon">{ach.icon}</span>
                <p className="achievement-text">{ach.text}</p>
                <ChevronRight size={16} style={{ color: ach.color, flexShrink: 0 }} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Socials / Coding Platforms ── */}
      <section className="section" id="socials">
        <motion.div className="section-header" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="section-eyebrow"><GitFork size={16} /> Online Presence</span>
          <h2 className="section-title">Find Me <span>Everywhere</span></h2>
        </motion.div>

        <div className="socials-grid" style={{ marginBottom: '4rem' }}>
          <motion.div className="glass-panel social-card" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            whileHover={{ y: -8 }} style={{ borderTop: '3px solid #a855f7' }}>
            {githubData ? (
              <>
                <div className="social-card-header">
                  <img src={githubData.avatar_url} alt="GitHub" className="social-avatar" />
                  <div><h3>{githubData.name || githubData.login}</h3><p style={{ color: 'var(--text-muted)' }}>@{githubData.login}</p></div>
                  <a href={githubData.html_url} target="_blank" rel="noreferrer" className="social-follow-btn">Follow <ExternalLink size={13} /></a>
                </div>
                <div className="social-stats">
                  <div className="social-stat"><span className="social-stat-val">{githubData.followers}</span><span>Followers</span></div>
                  <div className="social-stat"><span className="social-stat-val">{githubData.public_repos}</span><span>Repos</span></div>
                  <div className="social-stat"><span className="social-stat-val">{githubData.following}</span><span>Following</span></div>
                </div>
                {githubData.bio && <p className="social-bio">{githubData.bio}</p>}
              </>
            ) : <div className="loading-shimmer">Loading GitHub data…</div>}
          </motion.div>

          <motion.div className="glass-panel social-card" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            whileHover={{ y: -8 }} transition={{ delay: 0.15 }} style={{ borderTop: '3px solid #0ea5e9' }}>
            <div className="social-card-header">
              <img src="https://ui-avatars.com/api/?name=Aditya+Roy&background=0D8ABC&color=fff&size=128" alt="LinkedIn" className="social-avatar" style={{ border: '2px solid #0ea5e9' }} />
              <div><h3>Aditya Roy</h3><p style={{ color: '#0ea5e9' }}>Full Stack Developer</p></div>
              <a href="https://www.linkedin.com/in/aditya-roy23" target="_blank" rel="noreferrer"
                className="social-follow-btn" style={{ background: 'rgba(14,165,233,0.15)', color: '#0ea5e9' }}>
                Connect <ExternalLink size={13} />
              </a>
            </div>
            <div className="social-stats">
              <div className="social-stat"><span className="social-stat-val" style={{ color: '#0ea5e9' }}>500+</span><span>Connections</span></div>
              <div className="social-stat"><span className="social-stat-val" style={{ color: '#0ea5e9' }}>Open</span><span>to Work</span></div>
            </div>
            <div className="social-quote">"Passionate about building scalable web applications and exploring modern technologies. Actively working on Python, React, and Full-Stack development."</div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h3 className="sub-section-title"><Trophy size={22} /> Competitive Coding</h3>
          <div className="platforms-grid">
            {platforms.map((p, i) => <PlatformCard key={p.name} platform={p} index={i} />)}
          </div>
        </motion.div>
      </section>

      {/* ── Photo Dump ── */}
      <section className="section" id="photos">
        <motion.div className="section-header" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="section-eyebrow"><Camera size={16} /> Gallery</span>
          <h2 className="section-title">The <span>Photo Dump</span></h2>
        </motion.div>
        <div className="photo-grid">
          {photos.map((photo, i) => (
            <motion.div key={photo.id} className="photo-card"
              initial={{ opacity: 0, y: 30, rotate: -3 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, type: 'spring', bounce: 0.3 }}
              whileHover={{ scale: 1.04, zIndex: 10, rotate: 1 }}>
              <img src={photo.url} alt={photo.title} />
              <div className="photo-card-caption"><span className="photo-card-title">{photo.title}</span></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Why Hire Me + System Design + Tech Depth ── */}
      <section className="section section-why" id="whyhire">
        <motion.div className="section-header" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="section-eyebrow"><Lightbulb size={16} /> Recruiter View</span>
          <h2 className="section-title">Why <span>Hire Me?</span></h2>
        </motion.div>

        <div className="why-grid">
          {/* Why Hire Me */}
          <motion.div className="why-card glass-panel" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}>
            <div className="why-card-icon" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>💡</div>
            <h3 className="why-card-title">Why Hire Me</h3>
            <ul className="why-list">
              {['Strong DSA foundation (400+ problems, Top 15% LeetCode)', 'Real-world projects with measurable impact metrics', 'Full-stack + AI/ML + Cybersecurity — rare combo', 'Fast learner: 15+ certifications in 2 years', 'SAIL industrial experience — team-ready', 'Consistent: 50-day coding streak maintained'].map((item, i) => (
                <li key={i} className="why-item"><CheckCircle2 size={15} style={{ color: '#a855f7', flexShrink: 0 }} />{item}</li>
              ))}
            </ul>
          </motion.div>

          {/* System Design */}
          <motion.div className="why-card glass-panel" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <div className="why-card-icon" style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee' }}>🏗️</div>
            <h3 className="why-card-title">System Design Thinking</h3>
            <ul className="why-list">
              {['Designed scalable SmartQ queue system for 200+ concurrent users', 'Modular REST API architecture with async FastAPI', 'Async queue processing with MongoDB as persistent store', 'Decoupled frontend/backend with JWT auth flow', 'Applied Docker for environment containerization', 'Designed LLM prompt pipelines for structured AI outputs'].map((item, i) => (
                <li key={i} className="why-item"><ChevronRight size={15} style={{ color: '#22d3ee', flexShrink: 0 }} />{item}</li>
              ))}
            </ul>
          </motion.div>

          {/* Tech Depth */}
          <motion.div className="why-card glass-panel" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <div className="why-card-icon" style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c' }}>🔬</div>
            <h3 className="why-card-title">Tech Depth Proof</h3>
            <ul className="why-list">
              {['Implemented JWT authentication & API rate limiting', 'Built OpenCV pipelines for real-time feature extraction', 'Applied NLP: tokenization, embeddings, HuggingFace transformers', 'Designed ML pipelines: preprocessing → training → evaluation', 'Vulnerability scanning with Nmap + Wireshark traffic analysis', 'React state management with Context API & hooks'].map((item, i) => (
                <li key={i} className="why-item"><ChevronRight size={15} style={{ color: '#fb923c', flexShrink: 0 }} />{item}</li>
              ))}
            </ul>
          </motion.div>

          {/* Work Ready */}
          <motion.div className="why-card glass-panel" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <div className="why-card-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>💼</div>
            <h3 className="why-card-title">Work Readiness</h3>
            <ul className="why-list">
              {['Git workflows: PRs, branching, code reviews', 'API design, integration & debugging experience', 'Clean, modular, documented code (PEP8 / ESLint)', 'Agile-aware: sprint planning & task tracking', 'Team collaboration at SAIL (on-site, 2 months)', 'Problem solving: constraints → brute force → optimal'].map((item, i) => (
                <li key={i} className="why-item"><CheckCircle2 size={15} style={{ color: '#22c55e', flexShrink: 0 }} />{item}</li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ── Contact Section ── */}
      <section className="section section-contact" id="contact">
        <div className="contact-layout">
          <motion.div className="contact-left" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>

            {/* Availability Badge */}
            <motion.div className="contact-avail-badge"
              animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
              <span className="avail-dot" />
              <span>Available for Work</span>
              <span className="avail-sub">· Responds in ~24h</span>
            </motion.div>

            <span className="section-eyebrow"><Mail size={16} /> Contact</span>
            <h2 className="section-title">Let's <span>Work Together</span></h2>
            <p className="section-desc">Got a project idea? Want to collaborate? Or just say hi? I'm always open to new opportunities.</p>

            {/* Location Chips */}
            <div className="contact-chips">
              <span className="contact-chip"><MapPin size={13} /> India · Open to Remote</span>
              <span className="contact-chip"><Clock size={13} /> IST (UTC +5:30)</span>
            </div>

            {/* Stats Row */}
            <div className="contact-stats-row">
              <div className="contact-stat"><span className="cstat-ico">⚡</span><span className="cstat-lbl">Avg. 24h reply</span></div>
              <div className="contact-stat"><span className="cstat-ico">🌐</span><span className="cstat-lbl">Remote-friendly</span></div>
              <div className="contact-stat"><span className="cstat-ico">💼</span><span className="cstat-lbl">Open to Full-time</span></div>
            </div>

            {/* Contact Info with Copy */}
            <div className="contact-info-items">
              <div className="contact-info-item">
                <Mail size={17} />
                <span>adityakumarroy401@gmail.com</span>
                <CopyButton text="adityakumarroy401@gmail.com" />
              </div>
              <div className="contact-info-item">
                <Globe size={17} />
                <span>linkedin.com/in/aditya-roy23</span>
                <CopyButton text="https://linkedin.com/in/aditya-roy23" />
              </div>
            </div>

            {/* Social Links Grid */}
            <div className="contact-socials-grid">
              {[
                { icon: <GitBranch size={19} />, label: 'GitHub',   url: 'https://github.com/bhumiadi23',                         color: '#e2e8f0' },
                { icon: <ExternalLink size={19} />, label: 'LinkedIn', url: 'https://linkedin.com/in/aditya-roy23',                color: '#0ea5e9' },
                { icon: <Trophy size={19} />,  label: 'LeetCode', url: 'https://leetcode.com/u/GreedyX/',                     color: '#FFA116' },
                { icon: <Code size={19} />,    label: 'GFG',      url: 'https://geeksforgeeks.org/profile/adityakummle9',     color: '#2F8D46' },
              ].map(s => (
                <motion.a key={s.label} href={s.url} target="_blank" rel="noreferrer"
                  className="contact-social-btn"
                  style={{ '--sc': s.color }}
                  whileHover={{ scale: 1.07, boxShadow: `0 0 22px ${s.color}44` }}
                  whileTap={{ scale: 0.95 }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <span>{s.label}</span>
                </motion.a>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="contact-action-btns">
              <motion.a href="https://calendly.com" target="_blank" rel="noreferrer"
                className="contact-action-btn contact-action-primary"
                whileHover={{ scale: 1.05, boxShadow: '0 0 28px rgba(139,92,246,0.5)' }} whileTap={{ scale: 0.95 }}>
                <CalendarDays size={16} /> Schedule a Call
              </motion.a>
              <motion.button className="contact-action-btn contact-action-ghost"
                onClick={() => document.querySelector('.adibot-fab')?.click()}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <MessageCircle size={16} /> Chat with AdiBot
              </motion.button>
            </div>

          </motion.div>

          {/* Right: Form with gradient border */}
          <motion.div className="contact-right" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="form-glow-wrapper">
              <div className="glass-panel form-wrap" style={{ padding: '2rem', borderRadius: '19px', border: 'none', background: 'rgba(9,9,11,0.97)' }}>
                <ContactForm />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── AdiBot ── */}
      <AdiBot />

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo"><span className="logo-bracket">&lt;</span>ADITYA<span className="logo-bracket">/&gt;</span></div>
          <p className="footer-sub">Built with React, Framer Motion & lots of ☕</p>
          <div className="footer-links">
            <a href="https://github.com/bhumiadi23" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/aditya-roy23" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="mailto:adityakumarroy401@gmail.com">Email</a>
          </div>
          <p className="footer-copy">© 2026 Aditya Roy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
