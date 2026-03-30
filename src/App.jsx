import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Camera, Mail, GitFork, ExternalLink, Code, Cpu, Globe,
  Terminal, Star, GitBranch, Eye, ChevronDown, Zap,
  BookOpen, Trophy, Target, TrendingUp, Award, CheckCircle2
} from 'lucide-react';
import './App.css';

// ─── Typing Animation ────────────────────────────────────────────────────────
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

// ─── Skill Bar ────────────────────────────────────────────────────────────────
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

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ project, index }) {
  return (
    <motion.div className="project-card glass-panel"
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay: index * 0.12 }} whileHover={{ y: -8, scale: 1.02 }}
      style={{ '--card-color': project.color, borderTop: `3px solid ${project.color}` }}>
      <div className="project-card-header">
        <div className="project-icon" style={{ background: `${project.color}22`, color: project.color }}>{project.icon}</div>
        <span className={`project-status status-${project.status.toLowerCase()}`}>{project.status}</span>
      </div>
      <h3 className="project-name">{project.name}</h3>
      <p className="project-desc">{project.description}</p>
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

// ─── Particle Background ──────────────────────────────────────────────────────
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

// ─── Contact Form ─────────────────────────────────────────────────────────────
function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const inp = { width: '100%', padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: 'white', fontSize: '0.95rem', outline: 'none', transition: 'border 0.3s' };
  const onFocus = (e) => { e.target.style.borderColor = 'rgba(168,85,247,0.6)'; };
  const onBlur  = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; };
  if (sent) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#a78bfa' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
      <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Message sent!</h3>
      <p style={{ color: 'var(--text-muted)' }}>I'll get back to you soon.</p>
    </div>
  );
  return (
    <form onSubmit={(e) => { e.preventDefault(); window.location.href = `mailto:adityakumarroy401@gmail.com?subject=Contact from ${form.name}&body=${encodeURIComponent(form.message + '\n\nFrom: ' + form.email)}`; setSent(true); }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <h3 style={{ color: 'white', fontSize: '1.3rem' }}>Send a Message</h3>
      <input type="text" placeholder="Your name" required value={form.name} onChange={set('name')} style={inp} onFocus={onFocus} onBlur={onBlur} />
      <input type="email" placeholder="Your email" required value={form.email} onChange={set('email')} style={inp} onFocus={onFocus} onBlur={onBlur} />
      <textarea placeholder="Your message" required rows={5} value={form.message} onChange={set('message')} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} onFocus={onFocus} onBlur={onBlur} />
      <motion.button type="submit" whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(139,92,246,0.5)' }} whileTap={{ scale: 0.97 }}
        style={{ padding: '0.9rem', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <Mail size={18} /> Send Message
      </motion.button>
    </form>
  );
}

// ─── Platform Stat Card ───────────────────────────────────────────────────────
function PlatformCard({ platform, index }) {
  return (
    <motion.a href={platform.url} target="_blank" rel="noreferrer"
      className="platform-card glass-panel"
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -6, boxShadow: `0 16px 40px ${platform.color}25` }}
      style={{ borderTop: `3px solid ${platform.color}` }}>
      {/* Header */}
      <div className="platform-header">
        <div className="platform-icon-wrap" style={{ background: `${platform.color}18`, color: platform.color }}>
          {platform.icon}
        </div>
        <div>
          <h3 className="platform-name" style={{ color: platform.color }}>{platform.name}</h3>
          <p className="platform-handle">{platform.handle}</p>
        </div>
        <ExternalLink size={14} className="platform-link-arrow" style={{ color: platform.color }} />
      </div>

      {/* Main stat */}
      <div className="platform-main-stat">
        <span className="platform-main-val" style={{ color: platform.color }}>{platform.mainStat}</span>
        <span className="platform-main-label">{platform.mainLabel}</span>
      </div>

      {/* Sub stats */}
      <div className="platform-sub-stats">
        {platform.subStats.map((s, i) => (
          <div key={i} className="platform-sub-stat">
            <span className="sub-stat-val" style={{ color: s.color || 'white' }}>{s.val}</span>
            <span className="sub-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Difficulty bars if present */}
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

      {/* Badges */}
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

// ─── Hero Avatar (CSS animated, no 3D) ───────────────────────────────────────
function HeroAvatar() {
  return (
    <div className="hero-avatar-section">
      <div className="avatar-glow-ring" />
      <motion.div
        className="avatar-image-wrap"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img
          src="https://api.dicebear.com/8.x/avataaars/svg?seed=Aditya&backgroundColor=b6e3f4&clotheType=Hoodie&clotheColor=3C4F5C&eyeType=Happy&facialHairType=BeardMedium&hairColor=Black&topType=ShortHairShortFlat&accessories=Prescription02&style=circle"
          alt="Aditya Avatar"
          className="avatar-img"
        />
      </motion.div>
      {/* Floating orbs */}
      <motion.div className="avatar-orb avatar-orb-1" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
        <div className="orb-dot" style={{ background: '#a855f7' }} />
      </motion.div>
      <motion.div className="avatar-orb avatar-orb-2" animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}>
        <div className="orb-dot" style={{ background: '#22d3ee' }} />
      </motion.div>
      <motion.div className="avatar-orb avatar-orb-3" animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
        <div className="orb-dot" style={{ background: '#ec4899' }} />
      </motion.div>
      {/* Tech chips floating around */}
      <motion.div className="tech-chip chip-a" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>React</motion.div>
      <motion.div className="tech-chip chip-b" animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>Python</motion.div>
      <motion.div className="tech-chip chip-c" animate={{ y: [0, -6, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}>C++</motion.div>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const myProjects = [
  {
    id: 1, name: 'Healthcare Triage Bot',
    description: 'AI-powered triage system using LLM-driven guided conversations, rule-based red-flag detection, and differential diagnosis pipelines.',
    tech: ['Python', 'LLM', 'FastAPI', 'React'], color: '#ec4899', icon: <Cpu size={24} />, link: 'https://github.com/bhumiadi23', stars: 12, status: 'Live'
  },
  {
    id: 2, name: 'Full Stack Portfolio',
    description: 'This very site! Built with React, Vite, Framer Motion for animations, and live GitHub API integration.',
    tech: ['React', 'Framer Motion', 'Vite', 'CSS'], color: '#8b5cf6', icon: <Globe size={24} />, link: 'https://github.com/bhumiadi23', stars: 8, status: 'Live'
  },
  {
    id: 3, name: 'Traffic Engineering Report',
    description: 'Comprehensive 10-page technical report on PHF, PCU, traffic volume studies, speed studies, and travel time analysis.',
    tech: ['Data Analysis', 'Python', 'Matplotlib'], color: '#f59e0b', icon: <BookOpen size={24} />, link: 'https://github.com/bhumiadi23', stars: 5, status: 'Complete'
  },
  {
    id: 4, name: 'Competitive DSA Engine',
    description: 'Optimized solutions for LeetCode, Codeforces, and HackerRank — covering graph algorithms, DP, and greedy strategies.',
    tech: ['C++', 'Python', 'Algorithms'], color: '#22c55e', icon: <Terminal size={24} />, link: 'https://leetcode.com/u/GreedyX/', stars: 20, status: 'Active'
  }
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
  {
    name: 'LeetCode', handle: '@GreedyX',
    url: 'https://leetcode.com/u/GreedyX/', color: '#FFA116',
    icon: <Trophy size={22} />, mainStat: '200+', mainLabel: 'Problems Solved',
    subStats: [
      { val: 'Top 15%', label: 'Global Rank', color: '#FFA116' },
      { val: '~50', label: 'Day Streak', color: '#22c55e' },
    ],
    difficulties: [
      { label: 'Easy',   color: '#22c55e', solved: 90,  total: 856  },
      { label: 'Medium', color: '#FFA116', solved: 95,  total: 1794 },
      { label: 'Hard',   color: '#ef4444', solved: 18,  total: 790  },
    ],
    badges: ['50 Days Badge', 'Problem Solver', 'Dynamic Programming']
  },
  {
    name: 'HackerRank', handle: '@bhumiadi_23',
    url: 'https://www.hackerrank.com/profile/bhumiadi_23', color: '#00EA64',
    icon: <Award size={22} />, mainStat: '5★', mainLabel: 'Problem Solving',
    subStats: [
      { val: '5★', label: 'Python', color: '#00EA64' },
      { val: '5★', label: 'C++', color: '#00EA64' },
      { val: '4★', label: 'SQL', color: '#facc15' },
    ],
    badges: ['Gold Badge', 'Python', 'C++', 'Data Structures']
  },
  {
    name: 'GeeksForGeeks', handle: '@adityakummle9',
    url: 'https://www.geeksforgeeks.org/profile/adityakummle9', color: '#2F8D46',
    icon: <Code size={22} />, mainStat: '150+', mainLabel: 'Problems Solved',
    subStats: [
      { val: '1500+', label: 'Coding Score', color: '#2F8D46' },
      { val: 'Top 5%', label: 'Institute Rank', color: '#22c55e' },
    ],
    badges: ['Problem of the Day', 'DSA', 'Arrays & Strings']
  },
  {
    name: 'CodeChef', handle: '@bhumiadi_23',
    url: 'https://www.codechef.com/users/bhumiadi_23', color: '#ECCA7E',
    icon: <Target size={22} />, mainStat: '1600+', mainLabel: 'Rating',
    subStats: [
      { val: '3★', label: 'Division', color: '#ECCA7E' },
      { val: '80+', label: 'Problems', color: 'white' },
    ],
    badges: ['3★ Coder', 'Compete', 'Long Challenges']
  },
  {
    name: 'Codeforces', handle: '@bhumiadi_23',
    url: 'https://codeforces.com/profile/bhumiadi_23', color: '#1F8ACB',
    icon: <TrendingUp size={22} />, mainStat: '900+', mainLabel: 'Rating',
    subStats: [
      { val: 'Newbie', label: 'Current Rank', color: '#999' },
      { val: '40+', label: 'Contests', color: '#1F8ACB' },
    ],
    badges: ['Contestant', 'Div. 2', 'Div. 3']
  },
];

const photos = [
  { id: 1, url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', title: 'Office Vibes' },
  { id: 2, url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', title: 'Late Night Coding' },
  { id: 3, url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', title: 'The Bugs We Made' },
  { id: 4, url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', title: 'More Code' },
];

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 0.4], [0, 180]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.25], [1, 0.94]);

  const [navScrolled, setNavScrolled] = useState(false);
  const [githubData, setGithubData] = useState(null);
  const [githubRepos, setGithubRepos] = useState([]);

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

  return (
    <div className="app-container">
      <ParticleBackground />

      {/* ── Navigation ── */}
      <motion.nav className={`nav-header ${navScrolled ? 'nav-scrolled' : ''}`}
        initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease: 'easeOut' }}>
        <motion.div className="logo" whileHover={{ scale: 1.05 }}>
          <span className="logo-bracket">&lt;</span>ADITYA<span className="logo-bracket">/&gt;</span>
        </motion.div>
        <div className="nav-links">
          {['About', 'Projects', 'Skills', 'Socials', 'Contact'].map(link => (
            <motion.a key={link} className="nav-link" href={`#${link.toLowerCase()}`} whileHover={{ y: -2 }}>{link}</motion.a>
          ))}
        </div>
        <motion.a href="mailto:adityakumarroy401@gmail.com" className="nav-cta"
          whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(139,92,246,0.5)' }} whileTap={{ scale: 0.95 }}>
          Hire Me ✦
        </motion.a>
      </motion.nav>

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
            I build <TypingText texts={['Full-Stack Apps.', 'AI Solutions.', 'DSA Algorithms.', 'Awesome UIs.', 'Web Experiences.']} />
          </motion.div>
          <motion.p className="hero-desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            A passionate developer crafting scalable web apps, AI-powered systems,
            and competitive programming solutions. Currently exploring the frontiers of
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
              { label: 'Projects Built', value: '15+' },
              { label: 'Problems Solved', value: '400+' },
              { label: 'Tech Stack', value: '10+' },
            ].map(s => (
              <div key={s.label} className="hero-stat">
                <span className="hero-stat-value">{s.value}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Avatar Section */}
        <motion.div className="hero-avatar-outer"
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, type: 'spring', bounce: 0.3 }}>
          <HeroAvatar />
        </motion.div>

        <motion.a href="#projects" className="scroll-indicator" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <ChevronDown size={28} />
        </motion.a>
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

        {/* Live GitHub Repos */}
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
              {['React', 'TypeScript', 'Python', 'C++', 'Node.js', 'FastAPI', 'MongoDB', 'PostgreSQL', 'Docker', 'Git', 'Vite', 'Three.js'].map(b => (
                <motion.span key={b} className="tech-badge" whileHover={{ scale: 1.1, y: -3 }}>{b}</motion.span>
              ))}
            </div>
          </motion.div>
          <div className="skills-right">
            {skills.map(s => <SkillBar key={s.name} {...s} />)}
          </div>
        </div>
      </section>

      {/* ── Socials / Coding Platforms ── */}
      <section className="section" id="socials">
        <motion.div className="section-header" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="section-eyebrow"><GitFork size={16} /> Online Presence</span>
          <h2 className="section-title">Find Me <span>Everywhere</span></h2>
        </motion.div>

        {/* GitHub + LinkedIn row */}
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

        {/* Coding Platforms Full Cards */}
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

      {/* ── Contact Section ── */}
      <section className="section section-contact" id="contact">
        <div className="contact-layout">
          <motion.div className="contact-left" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="section-eyebrow"><Mail size={16} /> Contact</span>
            <h2 className="section-title">Let's <span>Work Together</span></h2>
            <p className="section-desc">Got a project idea? Want to collaborate? Or just say hi? I'm always open to new opportunities.</p>

            <div className="contact-info-items">
              <div className="contact-info-item"><Mail size={18} /><span>adityakumarroy401@gmail.com</span></div>
              <div className="contact-info-item"><Globe size={18} /><span>linkedin.com/in/aditya-roy23</span></div>
            </div>

            {/* Avatar in contact */}
            <div className="contact-avatar-wrap">
              <motion.img
                src="https://api.dicebear.com/8.x/avataaars/svg?seed=Aditya&backgroundColor=b6e3f4&clotheType=Hoodie&clotheColor=3C4F5C&eyeType=Happy&facialHairType=BeardMedium&hairColor=Black&topType=ShortHairShortFlat&accessories=Prescription02&style=circle"
                alt="Aditya"
                className="contact-avatar-img"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <p className="canvas-caption">* That's me 🧑‍💻 — always ready to build</p>
            </div>
          </motion.div>

          <motion.div className="contact-right" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="glass-panel form-wrap" style={{ padding: '2rem' }}>
              <ContactForm />
            </div>
          </motion.div>
        </div>
      </section>

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
