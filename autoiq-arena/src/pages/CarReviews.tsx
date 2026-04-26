/**
 * CarReviews — community reviews section for a specific car.
 *
 * Route: /reviews/:carId
 *
 * Features:
 *  - Aggregate rating bar chart (5 categories)
 *  - Radar / spider chart for visual overview
 *  - Star rating input (5 categories)
 *  - Written review form with character count
 *  - Review cards with avatar, rating breakdown, helpful votes
 *  - Sort by: recent, highest rated, most helpful
 *  - Common issues tags extracted from reviews
 *  - Review highlights (best/worst)
 *  - Pagination
 */
import {
  useState, useMemo, useCallback,
} from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare,
  Send, AlertTriangle, CheckCircle2,
  BarChart3, PenLine, Filter, Award, TrendingUp,
  ChevronLeft, ChevronRight, Sparkles, Shield, Zap, Gauge, Gem, Armchair,
} from 'lucide-react'
import { getCarById } from '../data/cars'
import { formatPrice } from '../utils/formatters'
import clsx from 'clsx'

// ─── Types ──────────────────────────────────────────────────────────────────
interface RatingCategories {
  reliability:  number
  comfort:      number
  performance:  number
  mileage:      number
  value:        number
}

type SortMode = 'recent' | 'highest' | 'helpful'

interface Review {
  id:           string
  author:       string
  avatarSeed:   number   // used to generate deterministic avatar color
  date:         string
  ownership:    string   // e.g. "6 months"
  variant:      string
  ratings:      RatingCategories
  overall:      number
  title:        string
  body:         string
  helpful:      number
  unhelpful:    number
  issues:       string[]
  verified:     boolean
}

// ─── Seed reviews per car (deterministic from car id) ────────────────────────
const SAMPLE_TITLES = [
  'Absolutely love this car!',
  'Great value for money',
  'Good daily runner, few niggles',
  'Exceeded expectations',
  'Solid performance, needs better feature set',
  'Best in segment, no doubt',
  'Mixed feelings after 10k km',
  'Perfect family car',
  'Highway cruiser extraordinaire',
  'City driving champion',
  'Comfortable but thirsty',
  'Would buy again in a heartbeat',
]

const SAMPLE_BODIES = [
  'Been driving this for a few months and it has been rock solid. The engine is smooth, cabin is quiet, and the ride quality is impressive for its price range.',
  'Initially had some doubts but after extensive city and highway use, I am thoroughly impressed. The AC is powerful and the infotainment works well with both Android Auto and Apple CarPlay.',
  'Build quality is top notch. Paint finish is excellent. The steering is light for city driving but feels composed at highway speeds. Boot space is adequate for road trips.',
  'After owning multiple cars in this segment, this one stands out. The suspension handles Indian roads like a champ. NVH levels are class-leading.',
  'My daily commute is about 50 km and this car sips fuel like nobody\'s business. Clutch is light, gear shifts are smooth, and the seats don\'t tire you out.',
  'Took it on a 2000 km road trip recently. Fantastic highway stability, great fuel efficiency, and the ADAS features made the drive much less stressful.',
  'The car is great but after-sales service could be better in smaller cities. Parts availability for specific variants takes time.',
  'Brilliant ride quality and features for the price. Sunroof, ventilated seats, and connected car tech - you get a lot of car here.',
  'Performance is adequate for city driving but the engine does feel strained during steep mountain climbs with full load. Still, overall a great package.',
  'Interior quality and fit-finish are genuinely premium. The plastics don\'t feel cheap and the leather wrapping is excellent. Audio system is a delight.',
]

const SAMPLE_ISSUES = [
  'Rattling sound from dashboard',
  'Average AC cooling',
  'Stiff suspension on bad roads',
  'Infotainment lag',
  'Paint scratches easily',
  'Window seal whistle at speed',
  'Rear seat comfort',
  'Boot space insufficient',
  'Turbo lag in city',
  'Service cost higher than expected',
  'Weak headlamps',
  'Average ground clearance',
  'Clutch feel too light',
  'Road noise at speed',
  'Tyre quality average',
]

const SAMPLE_AUTHORS = [
  'Rahul S.', 'Priya M.', 'Amit K.', 'Sneha R.', 'Vikram P.',
  'Arun D.', 'Meera J.', 'Karthik N.', 'Divya G.', 'Rohan T.',
  'Pooja B.', 'Nikhil V.', 'Ananya L.', 'Suresh H.', 'Kavita C.',
]

const OWNERSHIPS = [
  '2 months', '3 months', '6 months', '8 months',
  '1 year', '1.5 years', '2 years', '3+ years',
]

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 12345) % 2147483647
    return (s & 0x7fffffff) / 0x7fffffff
  }
}

function generateReviews(carId: string): Review[] {
  let seed = 0
  for (let i = 0; i < carId.length; i++) seed += carId.charCodeAt(i) * (i + 1)
  const rng = seededRandom(seed)

  const count = 8 + Math.floor(rng() * 5)
  const reviews: Review[] = []

  for (let i = 0; i < count; i++) {
    const r = () => 2.5 + Math.round(rng() * 2.5 * 10) / 10
    const ratings: RatingCategories = {
      reliability: r(), comfort: r(), performance: r(), mileage: r(), value: r(),
    }
    const overall = parseFloat(
      ((ratings.reliability + ratings.comfort + ratings.performance + ratings.mileage + ratings.value) / 5).toFixed(1)
    )

    const issueCount = rng() < 0.3 ? 0 : rng() < 0.6 ? 1 : Math.floor(rng() * 3) + 1
    const issues: string[] = []
    for (let j = 0; j < issueCount; j++) {
      const issue = SAMPLE_ISSUES[Math.floor(rng() * SAMPLE_ISSUES.length)]
      if (!issues.includes(issue)) issues.push(issue)
    }

    const months = [1, 2, 3, 4, 6, 8, 10, 12]
    const m = months[Math.floor(rng() * months.length)]

    reviews.push({
      id:         `review-${carId}-${i}`,
      author:     SAMPLE_AUTHORS[Math.floor(rng() * SAMPLE_AUTHORS.length)],
      avatarSeed: Math.floor(rng() * 360),
      date:       `2024-${String(m).padStart(2, '0')}-${String(Math.floor(rng() * 28) + 1).padStart(2, '0')}`,
      ownership:  OWNERSHIPS[Math.floor(rng() * OWNERSHIPS.length)],
      variant:    rng() > 0.5 ? 'Top Variant' : 'Mid Variant',
      ratings,
      overall,
      title:      SAMPLE_TITLES[Math.floor(rng() * SAMPLE_TITLES.length)],
      body:       SAMPLE_BODIES[Math.floor(rng() * SAMPLE_BODIES.length)],
      helpful:    Math.floor(rng() * 60),
      unhelpful:  Math.floor(rng() * 8),
      issues,
      verified:   rng() > 0.3,
    })
  }
  return reviews
}

// ─── Category metadata ───────────────────────────────────────────────────────
const CATEGORIES: { key: keyof RatingCategories; label: string; icon: typeof Shield; color: string; gradient: string }[] = [
  { key: 'reliability',  label: 'Reliability',  icon: Shield,   color: '#00D4FF', gradient: 'from-cyan-500 to-blue-500' },
  { key: 'comfort',      label: 'Comfort',      icon: Armchair, color: '#00E676', gradient: 'from-green-400 to-emerald-500' },
  { key: 'performance',  label: 'Performance',  icon: Zap,      color: '#FF6B35', gradient: 'from-orange-400 to-red-500' },
  { key: 'mileage',      label: 'Mileage',      icon: Gauge,    color: '#FFB300', gradient: 'from-yellow-400 to-amber-500' },
  { key: 'value',        label: 'Value for ₹',  icon: Gem,      color: '#9C27B0', gradient: 'from-purple-400 to-violet-500' },
]

// ─── Star input ──────────────────────────────────────────────────────────────
function StarInput({
  value, onChange, size = 'md',
}: { value: number; onChange: (v: number) => void; size?: 'sm' | 'md' }) {
  const [hover, setHover] = useState(0)
  const s = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-125 active:scale-95"
        >
          <Star className={clsx(
            s, 'transition-all duration-200',
            (hover || value) >= n
              ? 'text-warning fill-warning drop-shadow-[0_0_6px_rgba(255,179,0,0.5)]'
              : 'text-border hover:text-warning/40',
          )} />
        </button>
      ))}
    </div>
  )
}

// ─── Progress Ring (SVG circle) ──────────────────────────────────────────────
function ProgressRing({ value, max = 5, size = 120, stroke = 8, color }: {
  value: number; max?: number; size?: number; stroke?: number; color: string
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(value / max, 1)

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference * (1 - pct) }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  )
}

// ─── Radar Chart (SVG spider) ────────────────────────────────────────────────
function RadarChart({ ratings, size = 200 }: {
  ratings: Record<string, number>; size?: number
}) {
  const center = size / 2
  const maxR = size * 0.38
  const keys = CATEGORIES.map(c => c.key)
  const angleStep = (Math.PI * 2) / keys.length

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2
    const r = (value / 5) * maxR
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) }
  }

  // grid rings
  const rings = [1, 2, 3, 4, 5]

  // value polygon
  const points = keys.map((k, i) => {
    const p = getPoint(i, ratings[k] || 0)
    return `${p.x},${p.y}`
  }).join(' ')

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Grid rings */}
      {rings.map(ring => {
        const ringPoints = keys.map((_, i) => {
          const p = getPoint(i, ring)
          return `${p.x},${p.y}`
        }).join(' ')
        return (
          <polygon
            key={ring}
            points={ringPoints}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        )
      })}

      {/* Axis lines */}
      {keys.map((_, i) => {
        const p = getPoint(i, 5)
        return (
          <line
            key={i}
            x1={center} y1={center}
            x2={p.x} y2={p.y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        )
      })}

      {/* Value polygon */}
      <motion.polygon
        points={points}
        fill="rgba(0,212,255,0.15)"
        stroke="#00D4FF"
        strokeWidth={2}
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        style={{ transformOrigin: `${center}px ${center}px` }}
      />

      {/* Data points */}
      {keys.map((k, i) => {
        const p = getPoint(i, ratings[k] || 0)
        return (
          <motion.circle
            key={k}
            cx={p.x} cy={p.y} r={4}
            fill={CATEGORIES[i].color}
            stroke="#0A0F1E"
            strokeWidth={2}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
          />
        )
      })}

      {/* Labels */}
      {keys.map((k, i) => {
        const p = getPoint(i, 6.2)
        const cat = CATEGORIES[i]
        return (
          <text
            key={k}
            x={p.x} y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[10px] font-bold fill-text-muted"
          >
            {cat.label}
          </text>
        )
      })}
    </svg>
  )
}

// ─── Rating bar (aggregate) ──────────────────────────────────────────────────
function RatingBar({ label, value, color, icon: Icon }: {
  label: string; value: number; color: string; icon: typeof Shield
}) {
  const pct = (value / 5) * 100
  return (
    <div className="flex items-center gap-3 group">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
        style={{ backgroundColor: `${color}15` }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <span className="text-xs text-text-muted w-20 shrink-0 font-medium">{label}</span>
      <div className="flex-1 h-2.5 bg-surface/80 rounded-full overflow-hidden relative">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-y-0 w-12 rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
          initial={{ left: '-3rem' }}
          animate={{ left: '100%' }}
          transition={{ duration: 1.5, delay: 1, ease: 'easeInOut' }}
        />
      </div>
      <span className="text-xs font-black font-mono w-8 text-right" style={{ color }}>
        {value.toFixed(1)}
      </span>
    </div>
  )
}

// ─── Rating distribution (1–5 star histogram) ────────────────────────────────
function RatingHistogram({ reviews }: { reviews: Review[] }) {
  const dist = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    reviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.overall)))
      counts[star - 1]++
    })
    return counts
  }, [reviews])
  const max = Math.max(...dist, 1)
  const total = reviews.length

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map(star => {
        const count = dist[star - 1]
        const pctOfTotal = total > 0 ? Math.round((count / total) * 100) : 0
        return (
          <div key={star} className="flex items-center gap-2 group">
            <span className="text-xs text-text-muted w-3 text-right font-mono">{star}</span>
            <Star className="w-3.5 h-3.5 text-warning fill-warning" />
            <div className="flex-1 h-2.5 bg-surface/80 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: star >= 4
                    ? 'linear-gradient(90deg, #00E676, #00C853)'
                    : star >= 3
                      ? 'linear-gradient(90deg, #FFB300, #FF8F00)'
                      : 'linear-gradient(90deg, #FF5252, #FF1744)'
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(count / max) * 100}%` }}
                transition={{ duration: 0.7, delay: (5 - star) * 0.1 }}
              />
            </div>
            <span className="text-[11px] text-text-dim w-10 text-right font-mono">
              {pctOfTotal}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Review card ─────────────────────────────────────────────────────────────
function ReviewCard({ review, onVote, votedSet }: {
  review: Review
  onVote: (id: string, dir: 'up' | 'down') => void
  votedSet: Set<string>
}) {
  const [expanded, setExpanded] = useState(false)
  const hue = review.avatarSeed
  const hasVoted = votedSet.has(review.id)

  // Sentiment color
  const sentimentColor = review.overall >= 4 ? '#00E676'
    : review.overall >= 3 ? '#FFB300' : '#FF3B3B'
  const sentimentBg = review.overall >= 4 ? 'rgba(0,230,118,0.08)'
    : review.overall >= 3 ? 'rgba(255,179,0,0.08)' : 'rgba(255,59,59,0.08)'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl border border-border/40 overflow-hidden hover:border-accent/20 transition-colors duration-300"
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-5 pb-3">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0 ring-2 ring-white/10"
          style={{
            background: `linear-gradient(135deg, hsl(${hue},65%,45%), hsl(${(hue + 40) % 360},65%,35%))`,
          }}
        >
          {review.author.split(' ').map(w => w[0]).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-text-primary">{review.author}</span>
            {review.verified && (
              <span className="flex items-center gap-0.5 text-[10px] text-success font-semibold
                bg-success/10 px-1.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-dim mt-0.5">
            {review.variant} · Owned for {review.ownership} · {review.date}
          </p>
        </div>

        {/* Overall rating badge */}
        <div className="shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: sentimentBg, color: sentimentColor }}>
            <Star className="w-4 h-4 fill-current" />
            <span className="font-black text-lg">{review.overall.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="px-5 pb-2">
        <p className="font-bold text-text-primary text-[15px]">{review.title}</p>
      </div>

      {/* Category stars (compact row) */}
      <div className="px-5 pb-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {CATEGORIES.map(cat => (
          <div key={cat.key} className="flex items-center gap-1.5">
            <cat.icon className="w-3 h-3" style={{ color: cat.color }} />
            <span className="text-[10px] text-text-dim">{cat.label}</span>
            <div className="flex gap-px">
              {[1, 2, 3, 4, 5].map(n => (
                <Star
                  key={n}
                  className={clsx(
                    'w-2.5 h-2.5',
                    n <= Math.round(review.ratings[cat.key]) ? 'text-warning fill-warning' : 'text-border/50'
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="px-5 pb-3">
        <p className={clsx(
          'text-sm text-text-secondary leading-relaxed',
          !expanded && 'line-clamp-3',
        )}>
          {review.body}
        </p>
        {review.body.length > 160 && (
          <button onClick={() => setExpanded(e => !e)}
            className="text-xs text-accent font-semibold mt-1.5 hover:underline inline-flex items-center gap-1">
            {expanded ? '↑ Show less' : '↓ Read more'}
          </button>
        )}
      </div>

      {/* Issues */}
      {review.issues.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {review.issues.map(issue => (
            <span key={issue} className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full
              bg-warning/8 text-warning border border-warning/20 font-medium">
              <AlertTriangle className="w-2.5 h-2.5" /> {issue}
            </span>
          ))}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-4 px-5 py-3 border-t border-border/20 bg-surface/10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onVote(review.id, 'up')}
          disabled={hasVoted}
          className={clsx(
            'flex items-center gap-1.5 text-xs font-medium transition-all duration-200 rounded-lg px-3 py-1.5',
            hasVoted
              ? 'text-success/60 cursor-default'
              : 'text-text-muted hover:text-success hover:bg-success/10',
          )}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          Helpful ({review.helpful})
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onVote(review.id, 'down')}
          disabled={hasVoted}
          className={clsx(
            'flex items-center gap-1.5 text-xs font-medium transition-all duration-200 rounded-lg px-3 py-1.5',
            hasVoted
              ? 'text-danger/60 cursor-default'
              : 'text-text-muted hover:text-danger hover:bg-danger/10',
          )}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          ({review.unhelpful})
        </motion.button>
        {hasVoted && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] text-text-dim ml-auto italic"
          >
            Thanks for your feedback
          </motion.span>
        )}
      </div>
    </motion.div>
  )
}

// ─── Review Highlights ──────────────────────────────────────────────────────
function ReviewHighlights({ reviews }: { reviews: Review[] }) {
  if (reviews.length < 2) return null

  const bestReview = [...reviews].sort((a, b) => b.overall - a.overall)[0]
  const mostHelpful = [...reviews].sort((a, b) => b.helpful - a.helpful)[0]

  const highlights = [
    { label: 'Highest Rated', review: bestReview, icon: Award, color: '#FFB300', bg: 'rgba(255,179,0,0.08)' },
    { label: 'Most Helpful', review: mostHelpful, icon: ThumbsUp, color: '#00E676', bg: 'rgba(0,230,118,0.08)' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {highlights.map(h => (
        <motion.div
          key={h.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl border border-border/30 p-4 hover:border-accent/20 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ backgroundColor: h.bg }}>
              <h.icon className="w-3.5 h-3.5" style={{ color: h.color }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: h.color }}>
              {h.label}
            </span>
          </div>
          <p className="text-xs font-bold text-text-primary mb-1 line-clamp-1">
            "{h.review.title}"
          </p>
          <div className="flex items-center gap-2 text-[10px] text-text-dim">
            <span>by {h.review.author}</span>
            <span>·</span>
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-warning fill-warning" />
              <span className="font-bold text-warning">{h.review.overall.toFixed(1)}</span>
            </div>
            {h.label === 'Most Helpful' && (
              <>
                <span>·</span>
                <span className="text-success font-semibold">{h.review.helpful} found helpful</span>
              </>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const MAX_BODY = 800
const REVIEWS_PER_PAGE = 5

export default function CarReviews() {
  const { carId } = useParams<{ carId: string }>()
  const navigate  = useNavigate()
  const car       = getCarById(carId ?? '')

  // ── Reviews state (localStorage-persisted additions) ────────────────────────
  const [baseReviews] = useState(() => generateReviews(carId ?? ''))
  const [userReviews, setUserReviews] = useState<Review[]>([])
  const allReviews = useMemo(() => [...userReviews, ...baseReviews], [userReviews, baseReviews])

  const [sortMode, setSortMode] = useState<SortMode>('recent')
  const [currentPage, setCurrentPage] = useState(1)

  const sorted = useMemo(() => {
    const copy = [...allReviews]
    switch (sortMode) {
      case 'recent':  return copy.sort((a, b) => b.date.localeCompare(a.date))
      case 'highest': return copy.sort((a, b) => b.overall - a.overall)
      case 'helpful': return copy.sort((a, b) => b.helpful - a.helpful)
    }
  }, [allReviews, sortMode])

  // Pagination
  const totalPages = Math.ceil(sorted.length / REVIEWS_PER_PAGE)
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * REVIEWS_PER_PAGE
    return sorted.slice(start, start + REVIEWS_PER_PAGE)
  }, [sorted, currentPage])

  // Reset page when sort changes
  const handleSortChange = useCallback((mode: SortMode) => {
    setSortMode(mode)
    setCurrentPage(1)
  }, [])

  // ── Aggregate stats ─────────────────────────────────────────────────────────
  const avg = useMemo(() => {
    if (allReviews.length === 0) return { reliability: 0, comfort: 0, performance: 0, mileage: 0, value: 0, overall: 0 }
    const sum = { reliability: 0, comfort: 0, performance: 0, mileage: 0, value: 0, overall: 0 }
    allReviews.forEach(r => {
      sum.reliability  += r.ratings.reliability
      sum.comfort      += r.ratings.comfort
      sum.performance  += r.ratings.performance
      sum.mileage      += r.ratings.mileage
      sum.value        += r.ratings.value
      sum.overall      += r.overall
    })
    const n = allReviews.length
    return {
      reliability:  parseFloat((sum.reliability / n).toFixed(1)),
      comfort:      parseFloat((sum.comfort / n).toFixed(1)),
      performance:  parseFloat((sum.performance / n).toFixed(1)),
      mileage:      parseFloat((sum.mileage / n).toFixed(1)),
      value:        parseFloat((sum.value / n).toFixed(1)),
      overall:      parseFloat((sum.overall / n).toFixed(1)),
    }
  }, [allReviews])

  // ── Common issues ──────────────────────────────────────────────────────────
  const commonIssues = useMemo(() => {
    const freq: Record<string, number> = {}
    allReviews.forEach(r => r.issues.forEach(i => { freq[i] = (freq[i] || 0) + 1 }))
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [allReviews])

  // ── Helpful vote (local) ───────────────────────────────────────────────────
  const [voted, setVoted] = useState<Set<string>>(new Set())
  const handleVote = useCallback((id: string, dir: 'up' | 'down') => {
    if (voted.has(id)) return
    setVoted(prev => new Set(prev).add(id))
    // mutate matching review
    setUserReviews(prev => prev.map(r => r.id === id
      ? { ...r, helpful: r.helpful + (dir === 'up' ? 1 : 0), unhelpful: r.unhelpful + (dir === 'down' ? 1 : 0) }
      : r
    ))
  }, [voted])

  // ── New review form ────────────────────────────────────────────────────────
  const [showForm,  setShowForm]  = useState(false)
  const [formRatings, setFormRatings] = useState<RatingCategories>({
    reliability: 0, comfort: 0, performance: 0, mileage: 0, value: 0,
  })
  const [formTitle, setFormTitle] = useState('')
  const [formBody,  setFormBody]  = useState('')
  const [formOwn,   setFormOwn]   = useState('6 months')
  const [submitted, setSubmitted] = useState(false)

  const formOverall = useMemo(() => {
    const { reliability, comfort, performance, mileage, value } = formRatings
    const total = reliability + comfort + performance + mileage + value
    return total > 0 ? parseFloat((total / 5).toFixed(1)) : 0
  }, [formRatings])

  const filledCategories = Object.values(formRatings).filter(v => v > 0).length

  const canSubmit = formTitle.trim().length >= 5 &&
    formBody.trim().length >= 20 &&
    Object.values(formRatings).every(v => v > 0)

  const submitReview = useCallback(() => {
    if (!canSubmit) return
    const review: Review = {
      id:         `user-review-${Date.now()}`,
      author:     'You',
      avatarSeed: Math.floor(Math.random() * 360),
      date:       new Date().toISOString().slice(0, 10),
      ownership:  formOwn,
      variant:    car?.variant ?? 'Unknown',
      ratings:    { ...formRatings },
      overall:    formOverall,
      title:      formTitle,
      body:       formBody,
      helpful:    0,
      unhelpful:  0,
      issues:     [],
      verified:   false,
    }
    setUserReviews(prev => [review, ...prev])
    setFormRatings({ reliability: 0, comfort: 0, performance: 0, mileage: 0, value: 0 })
    setFormTitle('')
    setFormBody('')
    setShowForm(false)
    setSubmitted(true)
    setCurrentPage(1)
    setTimeout(() => setSubmitted(false), 3000)
  }, [canSubmit, formOwn, formRatings, formOverall, formTitle, formBody, car?.variant])

  // ── Sentiment label ────────────────────────────────────────────────────────
  const sentimentLabel = avg.overall >= 4.5 ? 'Excellent'
    : avg.overall >= 4 ? 'Very Good'
      : avg.overall >= 3.5 ? 'Good'
        : avg.overall >= 3 ? 'Average'
          : avg.overall >= 2 ? 'Below Average' : 'Poor'

  const sentimentColor = avg.overall >= 4 ? '#00E676'
    : avg.overall >= 3 ? '#FFB300' : '#FF3B3B'

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!car) {
    return (
      <div className="section-wrapper py-24 text-center">
        <div className="glass rounded-3xl p-16 max-w-md mx-auto">
          <h1 className="text-display-md mb-3">Car Not Found</h1>
          <p className="text-text-muted mb-8">
            The car you are looking for is not in our database.
          </p>
          <Link to="/cars" className="btn btn-primary btn-md no-underline">
            ← Back to Database
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter min-h-screen pb-20">
      {/* ── Breadcrumb + car header ───────────────────────────────────────── */}
      <div className="section-wrapper pt-6 pb-2 flex items-center gap-2 text-xs text-text-muted">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-accent transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <span>/</span>
        <Link to="/cars" className="hover:text-accent transition-colors no-underline text-text-muted">Cars</Link>
        <span>/</span>
        <Link to={`/cars/${car.id}`} className="hover:text-accent transition-colors no-underline text-text-muted">
          {car.brand} {car.model}
        </Link>
        <span>/</span>
        <span className="text-text-primary font-semibold">Reviews</span>
      </div>

      {/* ── Car summary bar ───────────────────────────────────────────────── */}
      <div className="section-wrapper pb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-border/40 p-5 flex items-center gap-5 flex-wrap"
        >
          <img
            src={car.images[0]} alt={car.model}
            className="w-24 h-16 object-cover rounded-xl shrink-0 ring-1 ring-border/30"
            onError={e => {
              (e.target as HTMLImageElement).src =
                `https://via.placeholder.com/96x64/0D1B2A/00D4FF?text=${car.brand}`
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-accent font-bold uppercase tracking-widest">{car.brand}</p>
            <h1 className="text-xl font-black text-text-primary leading-tight">{car.model} {car.variant}</h1>
            <p className="text-xs text-text-dim mt-0.5">{formatPrice(car.price)} · {car.segment} · {car.fuelType}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-warning/30"
              style={{ background: 'rgba(255,179,0,0.08)' }}>
              <Star className="w-5 h-5 text-warning fill-warning" />
              <span className="font-black text-lg text-warning">{avg.overall.toFixed(1)}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold" style={{ color: sentimentColor }}>{sentimentLabel}</p>
              <p className="text-xs text-text-dim">{allReviews.length} reviews</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="section-wrapper">
        <div className="grid lg:grid-cols-[340px_1fr] gap-8">

          {/* ═══════════════ LEFT SIDEBAR — Aggregate ═══════════════════════ */}
          <div className="space-y-6">

            {/* Overall rating hero with progress ring */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl border border-border/40 p-6 text-center relative overflow-hidden"
            >
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 opacity-30 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 20%, ${sentimentColor}10, transparent 70%)` }}
              />

              <p className="text-[10px] text-text-dim uppercase tracking-[0.2em] mb-4 relative z-10">
                Community Rating
              </p>

              <div className="relative inline-flex items-center justify-center mb-4">
                <ProgressRing value={avg.overall} color={sentimentColor} size={140} stroke={10} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-text-primary font-mono">{avg.overall.toFixed(1)}</span>
                  <span className="text-xs text-text-dim">/5.0</span>
                </div>
              </div>

              <div className="flex justify-center gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} className={clsx(
                    'w-5 h-5',
                    n <= Math.round(avg.overall) ? 'text-warning fill-warning' : 'text-border/40'
                  )} />
                ))}
              </div>
              <p className="text-sm font-bold" style={{ color: sentimentColor }}>{sentimentLabel}</p>
              <p className="text-xs text-text-dim mt-1">
                Based on <span className="font-bold text-text-primary">{allReviews.length}</span> owner reviews
              </p>
            </motion.div>

            {/* Radar chart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl border border-border/40 p-5"
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-accent" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-accent">Performance Radar</h3>
              </div>
              <RadarChart ratings={avg} size={220} />
            </motion.div>

            {/* Category breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl border border-border/40 p-5 space-y-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-accent" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-accent">Rating Breakdown</h3>
              </div>
              {CATEGORIES.map(cat => (
                <RatingBar
                  key={cat.key}
                  label={cat.label}
                  value={avg[cat.key as keyof typeof avg]}
                  color={cat.color}
                  icon={cat.icon}
                />
              ))}
            </motion.div>

            {/* Star distribution histogram */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl border border-border/40 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-accent" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-accent">Rating Distribution</h3>
              </div>
              <RatingHistogram reviews={allReviews} />
            </motion.div>

            {/* Common issues */}
            {commonIssues.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass rounded-2xl border border-border/40 p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-warning">Common Issues</h3>
                </div>
                <div className="space-y-2">
                  {commonIssues.map(([issue, count], index) => {
                    const maxCount = commonIssues[0][1] as number
                    const severity = (count as number) / (maxCount as number)
                    const barColor = severity >= 0.8 ? '#FF5252'
                      : severity >= 0.5 ? '#FFB300' : '#4a5f8a'
                    return (
                      <motion.div
                        key={issue}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-text-secondary truncate">{issue}</span>
                            <span className="text-[10px] font-bold font-mono ml-2 shrink-0"
                              style={{ color: barColor }}>
                              {count}×
                            </span>
                          </div>
                          <div className="h-1 bg-surface/80 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: barColor }}
                              initial={{ width: 0 }}
                              animate={{ width: `${severity * 100}%` }}
                              transition={{ duration: 0.6, delay: 0.7 + index * 0.05 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* ═══════════════ RIGHT — Reviews list ═══════════════════════════ */}
          <div className="space-y-5">

            {/* Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-accent" />
                <h2 className="text-lg font-black text-text-primary">Owner Reviews</h2>
                <span className="text-xs text-text-dim bg-surface/50 px-2 py-0.5 rounded-full font-mono">
                  {allReviews.length}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Sort:</span>
                  {(['recent', 'highest', 'helpful'] as SortMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => handleSortChange(mode)}
                      className={clsx(
                        'px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all capitalize',
                        sortMode === mode
                          ? 'bg-accent/15 border-accent/40 text-accent'
                          : 'border-border/40 text-text-muted hover:border-accent/30 hover:text-text-secondary',
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Write review button */}
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowForm(f => !f)}
                  id="write-review-btn"
                  className={clsx(
                    'btn btn-sm gap-1.5',
                    showForm ? 'btn-secondary' : 'btn-primary',
                  )}
                >
                  <PenLine className="w-3.5 h-3.5" />
                  {showForm ? 'Cancel' : 'Write Review'}
                </motion.button>
              </div>
            </div>

            {/* ── Submission success toast ──────────────────────────────────── */}
            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="glass rounded-xl border border-success/30 p-4 flex items-center gap-3"
                  style={{ background: 'rgba(0,230,118,0.06)' }}
                >
                  <div className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-success">Review submitted!</span>
                    <p className="text-[11px] text-text-dim">Your review is now visible to the community.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Write review form ────────────────────────────────────────── */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="glass rounded-2xl border-2 border-accent/30 p-6 space-y-6 relative overflow-hidden">
                    {/* Gradient top border effect */}
                    <div className="absolute top-0 left-0 right-0 h-0.5"
                      style={{ background: 'linear-gradient(90deg, #00D4FF, #0066FF, #9C27B0, #FF6B35)' }}
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-black text-accent uppercase tracking-widest">Write Your Review</h3>
                      </div>
                      {/* Progress indicator */}
                      <div className="flex items-center gap-2 text-xs text-text-dim">
                        <span>{filledCategories}/5 rated</span>
                        <div className="w-16 h-1.5 bg-surface/80 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-accent transition-all duration-300"
                            style={{ width: `${(filledCategories / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category ratings */}
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                      {CATEGORIES.map(cat => (
                        <div key={cat.key} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-surface/20 hover:bg-surface/30 transition-colors">
                          <span className="flex items-center gap-2 text-sm text-text-secondary">
                            <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                            {cat.label}
                          </span>
                          <StarInput
                            value={formRatings[cat.key]}
                            onChange={v => setFormRatings(prev => ({ ...prev, [cat.key]: v }))}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Overall preview */}
                    <AnimatePresence>
                      {formOverall > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-warning/20"
                          style={{ background: 'rgba(255,179,0,0.06)' }}
                        >
                          <Star className="w-5 h-5 text-warning fill-warning" />
                          <span className="text-lg font-black text-warning">{formOverall.toFixed(1)}</span>
                          <span className="text-xs text-text-dim">Overall Rating</span>
                          <div className="ml-auto flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(n => (
                              <Star key={n} className={clsx(
                                'w-3.5 h-3.5',
                                n <= Math.round(formOverall) ? 'text-warning fill-warning' : 'text-border/40'
                              )} />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Ownership */}
                    <div>
                      <label className="text-xs text-text-muted block mb-2 font-medium">Ownership Duration</label>
                      <div className="flex flex-wrap gap-2">
                        {OWNERSHIPS.map(o => (
                          <button
                            key={o}
                            type="button"
                            onClick={() => setFormOwn(o)}
                            className={clsx(
                              'px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all',
                              formOwn === o
                                ? 'bg-accent/15 border-accent/40 text-accent'
                                : 'border-border/40 text-text-muted hover:border-accent/30',
                            )}
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="text-xs text-text-muted block mb-2 font-medium">Review Title</label>
                      <input
                        value={formTitle}
                        onChange={e => setFormTitle(e.target.value)}
                        placeholder="Summarize your experience..."
                        maxLength={100}
                        className="w-full bg-surface/50 rounded-xl border border-border/40 px-4 py-3
                          text-sm text-text-primary outline-none focus:border-accent/60 transition-all
                          placeholder-text-dim focus:ring-1 focus:ring-accent/20"
                      />
                      <div className="flex justify-between mt-1.5">
                        <p className="text-[10px] text-text-dim">Min 5 characters</p>
                        <p className={clsx(
                          'text-[10px] font-mono',
                          formTitle.length >= 5 ? 'text-success' : 'text-text-dim',
                        )}>{formTitle.length}/100</p>
                      </div>
                    </div>

                    {/* Body */}
                    <div>
                      <label className="text-xs text-text-muted block mb-2 font-medium">Your Review</label>
                      <textarea
                        value={formBody}
                        onChange={e => setFormBody(e.target.value.slice(0, MAX_BODY))}
                        placeholder="Share details about your ownership experience..."
                        rows={5}
                        className="w-full bg-surface/50 rounded-xl border border-border/40 px-4 py-3
                          text-sm text-text-primary outline-none focus:border-accent/60 transition-all
                          placeholder-text-dim resize-none focus:ring-1 focus:ring-accent/20"
                      />
                      <div className="flex justify-between mt-1.5">
                        <p className={clsx(
                          'text-[10px]',
                          formBody.length >= 20 ? 'text-success' : 'text-text-dim',
                        )}>
                          {formBody.length >= 20 ? '✓ Minimum reached' : `Min 20 characters (${20 - formBody.length} more)`}
                        </p>
                        <p className={clsx(
                          'text-[10px] font-mono',
                          formBody.length >= MAX_BODY ? 'text-danger' :
                          formBody.length >= MAX_BODY * 0.9 ? 'text-warning' : 'text-text-dim',
                        )}>{formBody.length}/{MAX_BODY}</p>
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[10px] text-text-dim max-w-xs">
                        {!canSubmit && 'Fill all ratings, title (5+ chars), review (20+ chars)'}
                      </p>
                      <motion.button
                        whileHover={canSubmit ? { scale: 1.04 } : {}}
                        whileTap={canSubmit ? { scale: 0.96 } : {}}
                        onClick={submitReview}
                        disabled={!canSubmit}
                        id="submit-review-btn"
                        className={clsx(
                          'btn btn-lg gap-2',
                          canSubmit ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed',
                        )}
                      >
                        <Send className="w-4 h-4" /> Submit Review
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Review highlights ───────────────────────────────────────── */}
            <ReviewHighlights reviews={allReviews} />

            {/* ── Review cards ─────────────────────────────────────────────── */}
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {paginatedReviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <ReviewCard review={review} onVote={handleVote} votedSet={voted} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ── Pagination ──────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 pt-4"
              >
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={clsx(
                    'w-9 h-9 rounded-xl flex items-center justify-center transition-all border',
                    currentPage === 1
                      ? 'border-border/20 text-border cursor-not-allowed'
                      : 'border-border/40 text-text-muted hover:border-accent/40 hover:text-accent hover:bg-accent/5',
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={clsx(
                      'w-9 h-9 rounded-xl text-xs font-bold transition-all border',
                      currentPage === page
                        ? 'bg-accent/15 border-accent/40 text-accent'
                        : 'border-border/40 text-text-muted hover:border-accent/30 hover:text-text-secondary',
                    )}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={clsx(
                    'w-9 h-9 rounded-xl flex items-center justify-center transition-all border',
                    currentPage === totalPages
                      ? 'border-border/20 text-border cursor-not-allowed'
                      : 'border-border/40 text-text-muted hover:border-accent/40 hover:text-accent hover:bg-accent/5',
                  )}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <span className="text-xs text-text-dim ml-3">
                  Page {currentPage} of {totalPages}
                </span>
              </motion.div>
            )}

            {allReviews.length === 0 && (
              <div className="text-center py-16 text-text-dim">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-bold">No reviews yet</p>
                <p className="text-sm">Be the first to review this car!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
