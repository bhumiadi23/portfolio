/**
 * Presentation — Hackathon demo-ready landing page for AutoIQ Arena.
 *
 * Route: /presentation
 *
 * Sections:
 *  1. Hero — product visual, "Built in 72 hours" badge, primary CTAs
 *  2. Animated stats counter (50+ features, 20 cars, AI-powered)
 *  3. Six key feature highlights
 *  4. Tech stack grid
 *  5. Team credits
 */
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import {
  Car, Bot, GitCompare, Wrench, Zap, Trophy,
  Github, ExternalLink, Clock, Star, Users,
  TrendingUp, Shield, IndianRupee, Gauge,
  ChevronRight, Sparkles, Award,
} from 'lucide-react'

// ─── Section fade-in variant ──────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] } },
}
const stagger = {
  show: { transition: { staggerChildren: 0.12 } },
}

// ─── Animated counter ─────────────────────────────────────────────────────
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { stiffness: 80, damping: 20 })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (isInView) mv.set(target)
  }, [isInView, target, mv])

  useEffect(() => {
    return spring.on('change', v => setDisplay(Math.round(v)))
  }, [spring])

  return (
    <span ref={ref} className="tabular-nums">
      {display}{suffix}
    </span>
  )
}

// ─── Feature cards ────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Bot,
    title: 'AI-Powered Advisor',
    desc: 'Claude AI recommends cars based on your lifestyle, budget, and priorities with conversational follow-ups.',
    gradient: 'from-violet-500 to-purple-600',
    glow: '#9C27B0',
  },
  {
    icon: GitCompare,
    title: 'Side-by-Side Compare',
    desc: 'Compare up to 4 cars across 30+ spec categories with visual diff highlighting and winner badges.',
    gradient: 'from-cyan-400 to-blue-500',
    glow: '#00D4FF',
  },
  {
    icon: IndianRupee,
    title: 'Financial Dashboard',
    desc: 'EMI calculator, 5-year cost race chart, resale timeline, and budget finder — all in one hub.',
    gradient: 'from-amber-400 to-orange-500',
    glow: '#FFB300',
  },
  {
    icon: Zap,
    title: 'EV Hub & Tools',
    desc: 'Range calculator, EV-vs-Petrol 5-year cost comparison, carbon score, and charging station map.',
    gradient: 'from-emerald-400 to-teal-500',
    glow: '#00E676',
  },
  {
    icon: Gauge,
    title: 'Drag Race Simulator',
    desc: 'Physics-based 0–100 km/h race with real-time SVG speedometer and dual-lane track animation.',
    gradient: 'from-rose-400 to-red-500',
    glow: '#FF3B3B',
  },
  {
    icon: Trophy,
    title: 'Auto Awards Engine',
    desc: 'Computed live from dataset: Best Value, EV of Year, Safety Champion, and 6 more data-driven trophies.',
    gradient: 'from-yellow-400 to-amber-500',
    glow: '#FFD700',
  },
]

// ─── Tech stack ───────────────────────────────────────────────────────────
const TECH = [
  { name: 'React 18',       color: '#61DAFB', emoji: '⚛️' },
  { name: 'TypeScript',     color: '#3178C6', emoji: '🔷' },
  { name: 'Vite',           color: '#646CFF', emoji: '⚡' },
  { name: 'Tailwind CSS',   color: '#38BDF8', emoji: '🎨' },
  { name: 'Framer Motion',  color: '#FF0055', emoji: '🎞️' },
  { name: 'Recharts',       color: '#FF6B35', emoji: '📊' },
  { name: 'React Router',   color: '#CA4245', emoji: '🔗' },
  { name: 'Claude AI',      color: '#D97706', emoji: '🤖' },
  { name: 'Lucide Icons',   color: '#6366F1', emoji: '✨' },
  { name: 'localStorage',   color: '#22C55E', emoji: '💾' },
]

// ─── Stats ────────────────────────────────────────────────────────────────
const STATS = [
  { value: 50, suffix: '+', label: 'Features Built', icon: Sparkles, color: '#00D4FF' },
  { value: 20, suffix: '',  label: 'Cars in Database', icon: Car,      color: '#FFB300' },
  { value: 15, suffix: '+', label: 'Tool Pages',      icon: Wrench,   color: '#00E676' },
  { value: 72, suffix: 'h', label: 'Time to Ship 🔥', icon: Clock,    color: '#FF6B35' },
]

// ─── Team members (update as needed) ─────────────────────────────────────
const TEAM = [
  { name: 'Aditya',   role: 'Full-Stack Dev & Product Lead', avatar: '👨‍💻', linkedin: '#' },
]

// ═══════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function Presentation() {
  return (
    <div className="overflow-hidden pb-24">

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 pt-24 pb-12 overflow-hidden">
        {/* Ambient background blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, #00D4FF 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-8 blur-3xl"
            style={{ background: 'radial-gradient(circle, #FF6B35 0%, transparent 70%)' }} />
          {/* Orbit ring - decorative */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-accent/5 animate-spin-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-accent/3 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '20s' }} />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 max-w-4xl mx-auto space-y-6"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/30 text-warning text-sm font-bold animate-pulse-glow">
              <Clock className="w-4 h-4" />
              Built in 72 Hours · IQ Hackathon 2024
            </div>
          </motion.div>

          {/* Title */}
          <motion.div variants={fadeUp}>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none">
              <span className="gradient-text">AutoIQ</span>{' '}
              <span className="text-text-primary">Arena</span>
            </h1>
            <p className="mt-4 text-xl sm:text-2xl text-text-muted font-medium max-w-2xl mx-auto">
              India's smartest car intelligence platform — compare, simulate, finance, and decide with data + AI.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/"
              className="btn btn-primary btn-lg gap-2 no-underline animate-pulse-glow"
            >
              <ExternalLink className="w-5 h-5" />
              Enter Live Demo
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-lg gap-2 no-underline"
            >
              <Github className="w-5 h-5" />
              View Source
            </a>
          </motion.div>

          {/* Quick links */}
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2 pt-2">
            {[
              { label: 'AI Advisor', to: '/ai-advisor' },
              { label: 'Race Sim', to: '/race' },
              { label: 'EV Hub', to: '/ev-tools' },
              { label: 'Finance', to: '/finance' },
              { label: 'Awards', to: '/awards' },
            ].map(l => (
              <Link
                key={l.to}
                to={l.to}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-surface border border-border/60 text-text-muted hover:text-accent hover:border-accent/40 transition-all no-underline"
              >
                {l.label} <ChevronRight className="w-3 h-3" />
              </Link>
            ))}
          </motion.div>

          {/* Mock browser frame — product showcase */}
          <motion.div
            variants={fadeUp}
            className="mt-10 glass rounded-2xl border border-border/60 overflow-hidden shadow-2xl max-w-3xl mx-auto"
            style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.1)' }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-surface/80 border-b border-border/40">
              <div className="w-3 h-3 rounded-full bg-danger/70" />
              <div className="w-3 h-3 rounded-full bg-warning/70" />
              <div className="w-3 h-3 rounded-full bg-success/70" />
              <div className="flex-1 mx-4 px-3 py-1 rounded-md bg-primary/60 text-[11px] text-text-dim font-mono text-center">
                autoiq-arena.app/cars
              </div>
            </div>
            {/* App preview grid */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-secondary/40 min-h-[200px]">
              {[
                { img: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/130591/swift-exterior-right-front-three-quarter-64.jpeg', name: 'Swift ZXi+', price: '₹8.29L' },
                { img: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/130591/nexon-ev-exterior-right-front-three-quarter-10.jpeg', name: 'Nexon EV', price: '₹19.94L' },
                { img: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/130591/creta-exterior-right-front-three-quarter-6.jpeg', name: 'Creta SX(O)', price: '₹19.2L' },
              ].map((car, i) => (
                <div key={i} className="glass rounded-xl overflow-hidden group">
                  <div className="h-24 overflow-hidden">
                    <img
                      src={car.img}
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          `https://placehold.co/300x200/0D1B2A/00D4FF?text=${encodeURIComponent(car.name)}`
                      }}
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] font-bold text-text-primary truncate">{car.name}</p>
                    <p className="text-[10px] text-accent font-mono">{car.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── 2. STATS COUNTER ──────────────────────────────────────────────── */}
      <section className="section-wrapper py-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="glass rounded-2xl p-6 text-center border border-border/30 card-hover"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `${stat.color}20`, boxShadow: `0 0 20px ${stat.color}20` }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <p className="text-4xl font-black font-mono" style={{ color: stat.color }}>
                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-xs text-text-muted mt-1 font-semibold tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── 3. FEATURE HIGHLIGHTS ──────────────────────────────────────────── */}
      <section className="section-wrapper py-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="section-tag mb-3 inline-flex"><Award className="w-3.5 h-3.5" /> Key Features</span>
          <h2 className="text-display-md">Everything you need <span className="gradient-text">in one arena</span></h2>
          <p className="text-text-muted mt-2 max-w-xl mx-auto">Six core pillars that make AutoIQ Arena the most comprehensive car intelligence platform built in India.</p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map((feat) => (
            <motion.div
              key={feat.title}
              variants={fadeUp}
              className="glass rounded-2xl p-6 border border-border/30 card-hover group relative overflow-hidden"
            >
              {/* Background glow */}
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-[0.07] blur-2xl group-hover:opacity-[0.14] transition-opacity duration-500"
                style={{ background: feat.glow }}
              />
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-4 shadow-lg`}
                style={{ boxShadow: `0 4px 16px ${feat.glow}30` }}
              >
                <feat.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-black text-text-primary mb-2">{feat.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── 4. TECH STACK ────────────────────────────────────────────────── */}
      <section className="section-wrapper py-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="section-tag mb-3 inline-flex"><Sparkles className="w-3.5 h-3.5" /> Tech Stack</span>
          <h2 className="text-display-sm">Built with modern <span className="gradient-text">web tech</span></h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3"
        >
          {TECH.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl border border-border/40 card-hover"
            >
              <span className="text-xl">{t.emoji}</span>
              <span
                className="text-sm font-bold"
                style={{ color: t.color }}
              >
                {t.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── 5. TEAM CREDITS ──────────────────────────────────────────────── */}
      <section className="section-wrapper py-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="section-tag mb-3 inline-flex"><Users className="w-3.5 h-3.5" /> The Team</span>
          <h2 className="text-display-sm">Made with <span className="gradient-text-warm">❤️</span></h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-5"
        >
          {TEAM.map((member) => (
            <motion.a
              key={member.name}
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              variants={fadeUp}
              className="glass rounded-2xl p-6 border border-border/30 card-hover text-center w-52 no-underline group"
            >
              <div className="text-5xl mb-3 animate-float inline-block">{member.avatar}</div>
              <p className="font-black text-text-primary text-lg group-hover:text-accent transition-colors">{member.name}</p>
              <p className="text-xs text-text-muted mt-1">{member.role}</p>
            </motion.a>
          ))}
        </motion.div>
      </section>

      {/* ── 6. CTA FOOTER ────────────────────────────────────────────────── */}
      <section className="section-wrapper py-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="glass rounded-3xl p-10 text-center border border-accent/20 relative overflow-hidden"
          style={{ boxShadow: '0 0 60px rgba(0,212,255,0.05)' }}
        >
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(0,212,255,0.04)_0%,_transparent_70%)]" />
          <div className="relative z-10">
            <p className="text-5xl mb-4">🏆</p>
            <h2 className="text-display-sm mb-2">
              Ready to explore the <span className="gradient-text">Arena?</span>
            </h2>
            <p className="text-text-muted max-w-md mx-auto mb-8">
              Every car. Every cost. Every decision — powered by data and AI. All built from scratch in 72 hours.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/" className="btn btn-primary btn-lg gap-2 no-underline">
                <Car className="w-5 h-5" /> Enter AutoIQ Arena
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-lg gap-2 no-underline"
              >
                <Github className="w-5 h-5" /> GitHub Repo
              </a>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-text-dim">
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-warning" /> React + TypeScript</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-success" /> 0 External APIs (except Claude)</span>
              <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-accent" /> 15+ Pages Built</span>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
