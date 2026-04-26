/**
 * CarQuiz — animated personality quiz that matches users to their perfect car.
 *
 * Flow: Intro → Q1..Q6 (animated transitions) → Result (confetti reveal)
 * Scoring: each answer adds weighted tags to a profile → matched against car db
 */
import {
  useState, useEffect, useMemo, useCallback,
} from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, RotateCcw, GitCompare, ExternalLink, Star,
  CheckCircle2, ChevronRight, Sparkles, Trophy, Zap,
} from 'lucide-react'
import { cars } from '../data/cars'
import { useCompare } from '../hooks/useCompare'
import { formatPrice } from '../utils/formatters'
import clsx from 'clsx'
import type { Car } from '../types/car.types'

// ─── Quiz data ────────────────────────────────────────────────────────────────
interface QuizOption {
  id:     string
  label:  string
  icon:   string
  desc:   string
  tags:   string[]     // scoring tags matched against car.tags + derived traits
  scores: Record<string, number>  // dimension → weight
}

interface QuizQuestion {
  id:       string
  number:   number
  question: string
  sub:      string
  options:  QuizOption[]
}

type Dimension = 'value' | 'performance' | 'space' | 'efficiency' | 'safety' | 'ev' | 'offroad' | 'budget_low' | 'budget_mid' | 'budget_high' | 'luxury'

const QUIZ: QuizQuestion[] = [
  {
    id: 'style', number: 1,
    question: "What's your driving personality?",
    sub: "Be honest - we won't judge! 😄",
    options: [
      { id: 'city-zen',  label: 'City Zen',       icon: '🏙️', desc: 'Calm, smooth, stress-free. I basically live in traffic.',        tags: ['City Car','Fuel Efficient'],   scores: { value:2, efficiency:2 } },
      { id: 'thrill',    label: 'Thrill Seeker',  icon: '🏎️', desc: "I take every on-ramp like it's a podium lap.",                   tags: ['Sporty','Turbo Power'],        scores: { performance:3 } },
      { id: 'practical', label: 'Practical Pro',  icon: '📦', desc: 'My car is a tool. Reliability and utility above all.',           tags: ['Best Value','Reliable'],       scores: { value:3, efficiency:1 } },
      { id: 'explorer',  label: 'Weekend Explorer',icon: '⛰️', desc: "Trails, mountains, monsoon roads - I go where others don't.",   tags: ['Off-road','Adventure'],        scores: { offroad:3, space:1 } },
    ],
  },
  {
    id: 'budget', number: 2,
    question: "What's your budget range?",
    sub: 'Your total ex-showroom budget',
    options: [
      { id: 'b-low',    label: 'Under ₹10L',   icon: '💚', desc: 'Smart spender. Great cars exist here!',  tags: [], scores: { budget_low:3, value:1 } },
      { id: 'b-mid',    label: '₹10L – ₹20L',  icon: '💛', desc: 'The sweet spot — most popular segment.',  tags: [], scores: { budget_mid:3 } },
      { id: 'b-mid2',   label: '₹20L – ₹35L',  icon: '🟠', desc: 'Premium, packed with features.',         tags: [], scores: { budget_mid:2, luxury:1 } },
      { id: 'b-high',   label: 'Above ₹35L',   icon: '💎', desc: 'Never compromise on quality.',            tags: [], scores: { budget_high:3, luxury:3 } },
    ],
  },
  {
    id: 'family', number: 3,
    question: 'How many people ride with you?',
    sub: 'Think typical daily or weekend trips',
    options: [
      { id: 'solo',     label: 'Just me',        icon: '🧑',    desc: 'Solo rider, full control of the aux cord.',  tags: ['City Car'],    scores: { value:1 } },
      { id: 'couple',   label: 'Me + partner',   icon: '👫',    desc: 'Date nights and weekend getaways.',          tags: [],              scores: { value:1, efficiency:1 } },
      { id: 'family4',  label: 'Family of 4–5',  icon: '👨‍👩‍👧‍👦', desc: 'School runs, family trips, groceries.',      tags: ['Family Car'],  scores: { space:2, safety:2 } },
      { id: 'family7',  label: 'Crew of 6–7+',   icon: '🚐',   desc: 'The whole gang comes along every time.',     tags: ['7-Seater'],    scores: { space:3 } },
    ],
  },
  {
    id: 'terrain', number: 4,
    question: 'What roads do you drive most?',
    sub: 'Think about your daily and weekend routes',
    options: [
      { id: 'city-rd',  label: 'City streets',   icon: '🛣️',  desc: 'Potholes, traffic jams, parking nightmares.', tags: ['City Car'],       scores: { efficiency:2, value:1 } },
      { id: 'highway',  label: 'Highways',        icon: '🚀',  desc: 'Open roads, long tours, peaceful cruising.',  tags: [],                 scores: { performance:1, efficiency:2 } },
      { id: 'mixed',    label: 'Mixed bag',       icon: '🗺️', desc: 'A bit of everything. Need an all-rounder.',   tags: ['All-Rounder'],    scores: { value:2, space:1 } },
      { id: 'offrd',    label: 'Off-road/ Hills', icon: '⛰️',  desc: 'High clearance, 4WD — the rougher the better.', tags: ['Off-road','SUV'], scores: { offroad:3 } },
    ],
  },
  {
    id: 'priority', number: 5,
    question: 'What matters most to you?',
    sub: "Pick the one thing you'd never compromise on",
    options: [
      { id: 'safe',     label: 'Safety ratings', icon: '🛡️', desc: '5-star NCAP or nothing. My family is everything.', tags: ['Safe'],    scores: { safety:3 } },
      { id: 'eff',      label: 'Fuel economy',   icon: '⛽', desc: 'Every paisa counts at the petrol pump.',           tags: ['Fuel Efficient'], scores: { efficiency:3 } },
      { id: 'feat',     label: 'Tech features',  icon: '📱', desc: 'Ambient lighting, ADAS, 360 camera — the works.',  tags: ['Feature Rich'],   scores: { value:1, luxury:1 } },
      { id: 'perf',     label: 'Performance',    icon: '⚡', desc: 'Bhp, torque, 0-100 time.',                         tags: ['Sporty'],          scores: { performance:3 } },
    ],
  },
  {
    id: 'fuel', number: 6,
    question: "What's your fuel preference?",
    sub: 'The future is electric — but ICE is still king in India',
    options: [
      { id: 'petrol',   label: 'Petrol',    icon: '⛽', desc: 'Smooth, quiet, widely available.',     tags: [],       scores: { value:1, efficiency:1 } },
      { id: 'diesel',   label: 'Diesel',    icon: '🛢️', desc: 'High mileage for long-distance drivers.', tags: [],    scores: { efficiency:2 } },
      { id: 'electric', label: 'Electric',  icon: '⚡', desc: 'Future is here. Low running cost.',    tags: [],       scores: { ev:4, efficiency:2 } },
      { id: 'any-fuel', label: "Any / CNG", icon: '🌿', desc: 'Open to all. Just give me the best deal.', tags: [],  scores: { value:2 } },
    ],
  },
]

// ─── Scoring engine ───────────────────────────────────────────────────────────
type DimScores = Record<Dimension, number>
type Answers   = Record<string, string>  // questionId → optionId

function buildProfile(answers: Answers): DimScores {
  const dims: DimScores = { value:0, performance:0, space:0, efficiency:0, safety:0, ev:0, offroad:0, budget_low:0, budget_mid:0, budget_high:0, luxury:0 }
  QUIZ.forEach(q => {
    const optId = answers[q.id]
    const opt   = q.options.find(o => o.id === optId)
    if (!opt) return
    Object.entries(opt.scores).forEach(([dim, weight]) => {
      dims[dim as Dimension] = (dims[dim as Dimension] || 0) + weight
    })
  })
  return dims
}

function scoreCar(car: Car, dims: DimScores, answers: Answers): number {
  let score = 0

  // Budget fit
  const budgetOpt = answers['budget']
  if (budgetOpt === 'b-low'  && car.price <= 10)             score += 25
  if (budgetOpt === 'b-mid'  && car.price > 10 && car.price <= 20) score += 25
  if (budgetOpt === 'b-mid2' && car.price > 20 && car.price <= 35) score += 25
  if (budgetOpt === 'b-high' && car.price > 35)              score += 25
  // Penalty for over budget
  const maxBudget = budgetOpt === 'b-low' ? 10 : budgetOpt === 'b-mid' ? 20 : budgetOpt === 'b-mid2' ? 35 : 100
  if (car.price > maxBudget * 1.15) score -= 20

  // Fuel type
  const fuelOpt = answers['fuel']
  if (fuelOpt === 'electric' && car.isEV)              score += 20
  if (fuelOpt === 'electric' && !car.isEV)             score -= 10
  if (fuelOpt === 'diesel'   && car.fuelType==='Diesel')  score += 15
  if (fuelOpt === 'petrol'   && car.fuelType==='Petrol')  score += 10
  if (fuelOpt === 'any-fuel' && car.fuelType==='CNG')      score += 12

  // Family / seating
  const famOpt = answers['family']
  if (famOpt === 'family7' && car.seating >= 7) score += 20
  if (famOpt === 'family7' && car.seating < 7)  score -= 15
  if (famOpt === 'family4' && car.seating >= 5) score += 10

  // Terrain
  const terr = answers['terrain']
  if (terr === 'offrd' && car.segment === 'SUV')           score += 15
  if (terr === 'offrd' && car.dimensions.groundClearance > 195) score += 10

  // Priority
  const pri = answers['priority']
  if (pri === 'safe' && car.safety.globalNcap >= 5) score += 18
  if (pri === 'safe' && car.safety.globalNcap <= 2) score -= 10
  if (pri === 'eff')  score += parseFloat(car.mileage) * 0.5
  if (pri === 'perf') score += parseInt(car.engine.power) * 0.05
  if (pri === 'feat') score += car.features.length * 0.3

  // EV dimension bonus
  if (dims.ev > 2 && car.isEV) score += 15

  // Rating bonus
  score += car.rating * 5

  return Math.round(score)
}

function matchPercentage(score: number, maxScore: number): number {
  return Math.min(99, Math.round((score / Math.max(maxScore, 1)) * 100))
}

function buildReasoning(car: Car, answers: Answers): string[] {
  const reasons: string[] = []

  const budgetOpt  = answers['budget']
  const maxBudget  = budgetOpt === 'b-low' ? 10 : budgetOpt === 'b-mid' ? 20 : budgetOpt === 'b-mid2' ? 35 : 100
  if (car.price <= maxBudget) reasons.push(`Fits your ₹${maxBudget}L budget at ${formatPrice(car.price)}`)

  const fuelOpt = answers['fuel']
  if (fuelOpt === 'electric' && car.isEV) reasons.push(`Electric — low running cost, future-proof`)
  if (fuelOpt === 'diesel' && car.fuelType === 'Diesel') reasons.push(`Diesel engine, great for long-distance driving`)
  if (fuelOpt === 'petrol' && car.fuelType === 'Petrol') reasons.push(`Petrol engine — smooth city performance`)

  const pri = answers['priority']
  if (pri === 'safe' && car.safety.globalNcap >= 4) reasons.push(`${car.safety.globalNcap}-star NCAP safety — top of class`)
  if (pri === 'eff') reasons.push(`${car.mileage} — excellent fuel efficiency`)
  if (pri === 'perf') reasons.push(`${car.engine.power} — punchy performance`)
  if (pri === 'feat') reasons.push(`${car.features.length} premium features including ${car.features.slice(0,2).join(', ')}`)

  const terr = answers['terrain']
  if (terr === 'offrd' && car.dimensions.groundClearance > 180) reasons.push(`${car.dimensions.groundClearance}mm ground clearance — built for rough terrain`)
  if (terr === 'city-rd') reasons.push(`Compact and nimble — perfect for city navigation`)

  const famOpt = answers['family']
  if (famOpt === 'family4' && car.seating >= 5) reasons.push(`${car.seating}-seater — comfortable for the whole family`)
  if (famOpt === 'family7' && car.seating >= 7) reasons.push(`${car.seating} seats — everyone comes along`)

  reasons.push(`Rated ${car.rating}/5 by ${car.reviewCount.toLocaleString()} owners`)

  return reasons.slice(0, 4)
}

// ─── Confetti component ───────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#00D4FF','#FF6B35','#00E676','#FFB300','#9C27B0','#FF3B3B','#FAFAFA']

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id:    i,
      x:     Math.random() * 100,
      delay: Math.random() * 2,
      dur:   2.5 + Math.random() * 2,
      size:  6 + Math.random() * 10,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rot:   Math.random() * 360,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
    })), [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left:   `${p.x}%`,
            top:    '-20px',
            width:  p.size,
            height: p.shape === 'circle' ? p.size : p.size * 0.6,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            background: p.color,
          }}
          initial={{ y: -20, rotate: p.rot, opacity: 1 }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 40 : 900,
            rotate: p.rot + 720,
            opacity: [1, 1, 0],
          }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-text-muted mb-2">
        <span>Question {current} of {total}</span>
        <span className="text-accent font-semibold">{Math.round(pct)}% complete</span>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-accent-gradient"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>
      <div className="flex gap-1 mt-2">
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            className={clsx('flex-1 h-1 rounded-full', i < current ? 'bg-accent' : 'bg-surface')}
            animate={{ backgroundColor: i < current ? '#00D4FF' : '#111827' }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Option card ──────────────────────────────────────────────────────────────
function OptionCard({
  opt, selected, onSelect,
}: { opt: QuizOption; selected: boolean; onSelect: () => void }) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        'w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden',
        selected
          ? 'border-accent bg-accent/10 shadow-glow-sm'
          : 'border-border/50 hover:border-accent/50 glass',
      )}
    >
      {selected && (
        <motion.div
          className="absolute inset-0 bg-accent/5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        />
      )}
      <div className="flex items-start gap-3 relative">
        <span className="text-3xl shrink-0 mt-0.5">{opt.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={clsx(
              'font-black text-sm',
              selected ? 'text-accent' : 'text-text-primary'
            )}>
              {opt.label}
            </p>
            {selected && (
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
              </motion.span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{opt.desc}</p>
        </div>
      </div>
    </motion.button>
  )
}

// ─── Match result card ────────────────────────────────────────────────────────
function ResultCarCard({
  car, pct, rank, reasons, onCompare, inCompare, canMore,
}: {
  car: Car; pct: number; rank: number; reasons: string[]
  onCompare: (c: Car) => void; inCompare: boolean; canMore: boolean
}) {
  const isTop = rank === 1
  const ringColor = isTop ? '#FFB300' : rank === 2 ? '#8B9EC7' : '#FF6B35'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 + 0.3, duration: 0.4 }}
      className={clsx(
        'glass rounded-2xl overflow-hidden border-2',
        isTop ? 'border-warning/60' : 'border-border/30',
      )}
    >
      {isTop && (
        <div className="flex items-center gap-2 px-4 py-2 bg-warning/10 border-b border-warning/30">
          <Trophy className="w-4 h-4 text-warning" />
          <span className="text-xs font-black text-warning uppercase tracking-widest">Your Perfect Match</span>
        </div>
      )}

      <div className="relative h-40 overflow-hidden bg-secondary">
        <img src={car.images[0]} alt={car.model}
          className="w-full h-full object-cover"
          onError={e => {
            (e.target as HTMLImageElement).src =
              `https://via.placeholder.com/400x160/0D1B2A/00D4FF?text=${car.brand}`
          }} />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 to-transparent" />

        {/* Match % badge */}
        <div className="absolute top-3 right-3">
          <motion.div
            className="w-14 h-14 rounded-full flex flex-col items-center justify-center border-4"
            style={{ borderColor: ringColor, background: 'rgba(13,27,42,0.9)' }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: rank * 0.1 + 0.5, type: 'spring', stiffness: 200 }}
          >
            <span className="text-lg font-black leading-none" style={{ color: ringColor }}>{pct}</span>
            <span className="text-[9px] text-text-dim leading-none">% match</span>
          </motion.div>
        </div>

        <div className="absolute bottom-2 left-3">
          <p className="text-[10px] text-accent font-bold uppercase tracking-widest">{car.brand}</p>
          <p className="text-base font-black text-white leading-tight">{car.model}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-lg font-black text-accent">{formatPrice(car.price)}</p>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-warning fill-warning" />
            <span className="text-sm font-bold">{car.rating}</span>
            <span className="text-xs text-text-dim">({car.reviewCount.toLocaleString()})</span>
          </div>
        </div>

        {/* Reasons */}
        <div className="space-y-1.5">
          {reasons.map((r, i) => (
            <motion.div key={i} className="flex items-start gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rank * 0.1 + 0.6 + i * 0.08 }}
            >
              <span className="w-4 h-4 rounded-full bg-success/20 text-success border border-success/30
                               flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">✓</span>
              <span className="text-xs text-text-secondary leading-relaxed">{r}</span>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onCompare(car)}
            disabled={!canMore && !inCompare}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all',
              inCompare
                ? 'bg-accent/15 border-accent/40 text-accent'
                : 'border-border/60 text-text-muted hover:border-accent/40 hover:text-accent'
            )}
          >
            <GitCompare className="w-3.5 h-3.5" />
            {inCompare ? 'Added' : 'Compare'}
          </button>
          <Link to={`/cars/${car.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-accent text-primary text-xs font-black hover:scale-105 transition-transform no-underline">
            View Details <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN QUIZ PAGE
// ═══════════════════════════════════════════════════════════════════════════════
type Phase = 'intro' | 'quiz' | 'loading' | 'result'

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
}

export default function CarQuiz() {
  const { addToCompare, isInCompare, canAddMore } = useCompare()

  const [phase,   setPhase]   = useState<Phase>('intro')
  const [qIdx,    setQIdx]    = useState(0)
  const [dir,     setDir]     = useState(1)   // slide direction
  const [answers, setAnswers] = useState<Answers>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  const currentQ = QUIZ[qIdx]

  // ── Compute results ──────────────────────────────────────────────────────────
  const results = useMemo(() => {
    if (phase !== 'result') return []
    const dims  = buildProfile(answers)
    const scored = cars.map(car => ({
      car,
      score:  scoreCar(car, dims, answers),
    })).sort((a, b) => b.score - a.score)
    const max = scored[0]?.score ?? 1
    return scored.slice(0, 3).map(s => ({
      car:     s.car,
      score:   s.score,
      pct:     matchPercentage(s.score, max),
      reasons: buildReasoning(s.car, answers),
    }))
  }, [phase, answers])

  // Pre-select saved answer when navigating back
  useEffect(() => {
    setSelected(answers[currentQ?.id] ?? null)
  }, [qIdx, answers, currentQ?.id])

  // Trigger confetti on result
  useEffect(() => {
    if (phase === 'result') {
      setTimeout(() => setShowConfetti(true), 300)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }, [phase])

  // ── Navigation ───────────────────────────────────────────────────────────────
  const pickAnswer = useCallback((optId: string) => {
    setSelected(optId)
    setAnswers(prev => ({ ...prev, [currentQ.id]: optId }))
  }, [currentQ?.id])

  const goNext = useCallback(() => {
    if (!selected) return
    if (qIdx < QUIZ.length - 1) {
      setDir(1)
      setQIdx(q => q + 1)
    } else {
      setPhase('loading')
      setTimeout(() => setPhase('result'), 2000)
    }
  }, [selected, qIdx])

  const goBack = useCallback(() => {
    if (qIdx > 0) {
      setDir(-1)
      setQIdx(q => q - 1)
    } else {
      setPhase('intro')
    }
  }, [qIdx])

  const restart = useCallback(() => {
    setAnswers({})
    setSelected(null)
    setQIdx(0)
    setDir(1)
    setPhase('intro')
  }, [])

  const topCar = results[0]?.car

  // ── Render phases ─────────────────────────────────────────────────────────────
  return (
    <div className="page-enter min-h-screen">
      <AnimatePresence mode="wait">

        {/* ── INTRO ─────────────────────────────────────────────────────────── */}
        {phase === 'intro' && (
          <motion.div key="intro"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="section-wrapper py-16 text-center"
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-7xl mb-6 inline-block"
            >
              🚗
            </motion.div>
            <span className="section-tag mb-4 inline-flex">
              <Sparkles className="w-3.5 h-3.5" /> Car Personality Quiz
            </span>
            <h1 className="text-display-lg mb-4">Find Your Perfect Car Match</h1>
            <p className="text-text-muted text-lg max-w-lg mx-auto mb-10">
              6 quick questions. Our algorithm analyses your lifestyle, budget, and priorities to find your ideal car from 20+ models.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
              {[
                { icon: '⚡', label: '2 minutes', sub: 'Quick and fun' },
                { icon: '🎯', label: '20+ cars', sub: 'Matched to you' },
                { icon: '🏆', label: 'Match %', sub: 'Personalized score' },
              ].map(f => (
                <div key={f.label} className="glass rounded-2xl p-5 text-center">
                  <span className="text-3xl mb-2 block">{f.icon}</span>
                  <p className="font-black text-text-primary">{f.label}</p>
                  <p className="text-xs text-text-muted">{f.sub}</p>
                </div>
              ))}
            </div>

            <motion.button
              id="start-quiz-btn"
              onClick={() => setPhase('quiz')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary btn-lg gap-3 px-10"
            >
              <Zap className="w-5 h-5" />
              Start the Quiz
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* ── QUIZ ──────────────────────────────────────────────────────────── */}
        {phase === 'quiz' && (
          <motion.div key="quiz"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="section-wrapper py-10"
          >
            <div className="max-w-2xl mx-auto">
              {/* Progress */}
              <div className="mb-8">
                <ProgressBar current={qIdx + 1} total={QUIZ.length} />
              </div>

              {/* Question */}
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={qIdx}
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-widest text-accent font-bold mb-2">
                      Question {currentQ.number}
                    </p>
                    <h2 className="text-2xl font-black text-text-primary mb-1">
                      {currentQ.question}
                    </h2>
                    <p className="text-text-muted text-sm">{currentQ.sub}</p>
                  </div>

                  {/* Options grid */}
                  <div className="grid sm:grid-cols-2 gap-3 mb-8">
                    {currentQ.options.map((opt, i) => (
                      <motion.div key={opt.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <OptionCard
                          opt={opt}
                          selected={selected === opt.id}
                          onSelect={() => pickAnswer(opt.id)}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Nav buttons */}
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={goBack}
                      className="btn btn-ghost btn-md gap-2 text-text-muted hover:text-text-primary"
                    >
                      ← {qIdx === 0 ? 'Back to Intro' : 'Previous'}
                    </button>

                    <motion.button
                      id="next-question-btn"
                      onClick={goNext}
                      disabled={!selected}
                      whileHover={selected ? { scale: 1.03 } : {}}
                      whileTap={selected ? { scale: 0.97 } : {}}
                      className={clsx(
                        'btn btn-lg gap-2 px-8',
                        selected ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'
                      )}
                    >
                      {qIdx === QUIZ.length - 1 ? (
                        <><Sparkles className="w-4 h-4" /> Reveal My Match</>
                      ) : (
                        <>Next <ArrowRight className="w-4 h-4" /></>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ── LOADING ───────────────────────────────────────────────────────── */}
        {phase === 'loading' && (
          <motion.div key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="section-wrapper py-32 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 mx-auto mb-8 rounded-full border-4 border-accent/20 border-t-accent"
            />
            <h2 className="text-2xl font-black mb-3">Analysing your personality…</h2>
            <div className="space-y-2 max-w-xs mx-auto">
              {[
                'Scoring 20 car profiles…',
                'Matching your preferences…',
                'Calculating compatibility…',
              ].map((t, i) => (
                <motion.p key={t} className="text-sm text-text-muted"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.5 }}
                >
                  {t}
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── RESULT ────────────────────────────────────────────────────────── */}
        {phase === 'result' && (
          <motion.div key="result"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="section-wrapper py-10 pb-20"
          >
            {/* Confetti */}
            <AnimatePresence>
              {showConfetti && <Confetti key="confetti" />}
            </AnimatePresence>

            {/* Hero result */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="text-6xl mb-4 inline-block"
              >
                🏆
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span className="section-tag mb-3 inline-flex">
                  <Sparkles className="w-3.5 h-3.5" /> Your Results
                </span>
                <h1 className="text-display-md mb-2">
                  {topCar ? `${topCar.brand} ${topCar.model}` : 'Your Perfect Match!'}
                </h1>
                <p className="text-text-muted max-w-md mx-auto">
                  Based on your answers, here are your top 3 car matches — ranked by compatibility.
                </p>
              </motion.div>
            </div>

            {/* Top match hero stats */}
            {topCar && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass rounded-2xl border-2 border-warning/40 p-5 mb-8 max-w-2xl mx-auto"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-5 h-5 text-warning" />
                  <h2 className="font-black text-lg">You and the {topCar.brand} {topCar.model}</h2>
                  <span className="ml-auto text-2xl font-black text-warning">{results[0]?.pct}% match</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Price', value: formatPrice(topCar.price) },
                    { label: 'Mileage', value: topCar.mileage.split(' ')[0] + (topCar.isEV ? ' km range' : ' kmpl') },
                    { label: 'Safety', value: `${topCar.safety.globalNcap}/5 ★` },
                    { label: 'Power', value: topCar.engine.power },
                  ].map(s => (
                    <div key={s.label} className="bg-surface/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-text-dim">{s.label}</p>
                      <p className="text-sm font-black text-text-primary font-mono mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 3 result cards */}
            <div className="grid md:grid-cols-3 gap-5 mb-10">
              {results.map((r, i) => (
                <ResultCarCard key={r.car.id}
                  car={r.car} pct={r.pct} rank={i + 1} reasons={r.reasons}
                  onCompare={addToCompare} inCompare={isInCompare(r.car.id)} canMore={canAddMore}
                />
              ))}
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/compare"
                id="compare-alternatives-btn"
                className="btn btn-primary btn-lg gap-2 no-underline"
              >
                <GitCompare className="w-5 h-5" />
                Compare with Alternatives
              </Link>
              <Link
                to="/cars"
                className="btn btn-secondary btn-lg gap-2 no-underline"
              >
                Browse All Cars
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={restart}
                className="btn btn-ghost btn-md gap-2 text-text-muted hover:text-text-primary"
              >
                <RotateCcw className="w-4 h-4" /> Retake Quiz
              </button>
            </motion.div>

            {/* Answer summary */}
            <motion.details
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-10 max-w-2xl mx-auto"
            >
              <summary className="cursor-pointer text-sm text-text-muted hover:text-text-primary transition-colors select-none flex items-center gap-2">
                <ChevronRight className="w-4 h-4" /> View your answers
              </summary>
              <div className="mt-3 glass rounded-xl p-4 grid sm:grid-cols-2 gap-3">
                {QUIZ.map(q => {
                  const optId = answers[q.id]
                  const opt   = q.options.find(o => o.id === optId)
                  return (
                    <div key={q.id} className="flex items-center gap-2.5 text-sm">
                      <span className="text-lg">{opt?.icon ?? '?'}</span>
                      <div>
                        <p className="text-[10px] text-text-dim uppercase tracking-wider">{q.question.replace('?','')}</p>
                        <p className="font-semibold text-text-secondary">{opt?.label ?? '—'}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.details>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
