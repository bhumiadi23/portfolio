/**
 * Awards — Auto-calculated car awards & badges with premium trophy card UI.
 *
 * Route: /awards
 *
 * Awards auto-computed from the car dataset:
 *  - Best Value Under ₹10L
 *  - Fastest 0-100
 *  - Best Mileage
 *  - Most Reliable (5★ NCAP + most airbags + highest rating)
 *  - Best Family SUV (7-seater, boot space, features, rating)
 *  - EV of the Year
 *  - Feature King (most features)
 *  - People's Choice (highest review count)
 *  - Safety Champion (best safety score)
 */
import { useState, useMemo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Trophy, Star, Award, Crown, Shield, Zap,
  Gauge, Fuel, Heart, Users, Sparkles, ArrowRight,
  ChevronRight, Medal, Car,
} from 'lucide-react'
import { cars } from '../data/cars'
import type { Car as CarType } from '../types/car.types'
import clsx from 'clsx'

// ═══════════════════════════════════════════════════════════════════════════
// AWARD COMPUTATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/** Parse numeric bhp from power string like "120 bhp" */
function parsePower(s: string): number {
  const m = s.match(/([\d.]+)/)
  return m ? Number(m[1]) : 0
}

/** Parse numeric mileage from string "22 kmpl" or "453 km range" */
function parseMileage(s: string): number {
  const m = s.match(/([\d.]+)/)
  return m ? Number(m[1]) : 0
}

/** Compute value-for-money score */
function valueScore(car: CarType): number {
  const mileage = parseMileage(car.mileage)
  const feat = car.features.length
  const safety = car.safety.globalNcap * 8 + car.safety.airbagsCount * 3
  const ratingS = car.rating * 10
  const mileageS = car.isEV ? Math.min(mileage * 0.15, 60) : Math.min(mileage * 2.5, 60)
  const priceEff = Math.max(0, 50 - car.price * 0.8)
  return Math.round(ratingS + mileageS + safety + feat * 1.5 + priceEff)
}

/** Compute safety composite score */
function safetyScore(car: CarType): number {
  return car.safety.globalNcap * 20 +
    car.safety.airbagsCount * 5 +
    (car.safety.abs ? 5 : 0) +
    (car.safety.esp ? 10 : 0) +
    (car.safety.hillAssist ? 5 : 0)
}

/** Compute family SUV composite */
function familyScore(car: CarType): number {
  if (car.segment !== 'SUV') return 0
  return (
    car.seating * 8 +
    car.dimensions.bootSpace * 0.03 +
    car.features.length * 2 +
    car.rating * 10 +
    car.safety.globalNcap * 5 +
    car.safety.airbagsCount * 2
  )
}

/** Compute "reliability" score */
function reliabilityScore(car: CarType): number {
  return safetyScore(car) + car.rating * 12 + car.reviewCount * 0.002
}

// Crude mock 0-100 computation from power/torque and weight estimate
function estimateZeroToHundred(car: CarType): number {
  const power = parsePower(car.engine.power)
  if (power === 0) return 99
  // Rough weight estimate: length * width / 2800 tonnes
  const estWeight = (car.dimensions.length * car.dimensions.width) / 2800
  // Simple approximation: lower is faster
  const pwr = estWeight / (power / 100)
  return Math.max(3.5, Math.min(18, pwr * 2.2 + 2))
}

// ─── Award type definitions ──────────────────────────────────────────────────
interface AwardDef {
  id: string
  title: string
  description: string
  icon: React.ElementType
  emoji: string
  computeWinners: () => { gold: CarType; silver: CarType; bronze: CarType }
  gradient: string
  glowColor: string
}

function computeAwards(): AwardDef[] {
  return [
    {
      id: 'best-value-10l',
      title: 'Best Value Under ₹10L',
      description: 'Highest value-for-money score among cars priced under ₹10 lakhs',
      icon: Trophy,
      emoji: '💎',
      gradient: 'from-amber-400 via-yellow-300 to-orange-400',
      glowColor: '#FFD700',
      computeWinners: () => {
        const pool = cars.filter(c => c.price <= 10).sort((a, b) => valueScore(b) - valueScore(a))
        return { gold: pool[0], silver: pool[1], bronze: pool[2] }
      },
    },
    {
      id: 'fastest-0-100',
      title: 'Fastest 0-100 km/h',
      description: 'Estimated fastest acceleration based on power-to-weight ratio',
      icon: Gauge,
      emoji: '⚡',
      gradient: 'from-cyan-400 via-blue-400 to-indigo-500',
      glowColor: '#00D4FF',
      computeWinners: () => {
        const sorted = [...cars].sort((a, b) => estimateZeroToHundred(a) - estimateZeroToHundred(b))
        return { gold: sorted[0], silver: sorted[1], bronze: sorted[2] }
      },
    },
    {
      id: 'best-mileage',
      title: 'Best Mileage',
      description: 'Highest fuel efficiency (kmpl) among non-EV vehicles',
      icon: Fuel,
      emoji: '⛽',
      gradient: 'from-emerald-400 via-green-400 to-teal-500',
      glowColor: '#00E676',
      computeWinners: () => {
        const sorted = cars.filter(c => !c.isEV).sort((a, b) => parseMileage(b.mileage) - parseMileage(a.mileage))
        return { gold: sorted[0], silver: sorted[1], bronze: sorted[2] }
      },
    },
    {
      id: 'most-reliable',
      title: 'Most Reliable',
      description: 'Composite of NCAP rating, airbag count, user rating, and review volume',
      icon: Shield,
      emoji: '🛡️',
      gradient: 'from-violet-400 via-purple-400 to-fuchsia-500',
      glowColor: '#9C27B0',
      computeWinners: () => {
        const sorted = [...cars].sort((a, b) => reliabilityScore(b) - reliabilityScore(a))
        return { gold: sorted[0], silver: sorted[1], bronze: sorted[2] }
      },
    },
    {
      id: 'best-family-suv',
      title: 'Best Family SUV',
      description: 'SUVs ranked by seating, boot space, features, safety, and user rating',
      icon: Users,
      emoji: '👨‍👩‍👧‍👦',
      gradient: 'from-orange-400 via-rose-400 to-pink-500',
      glowColor: '#FF6B35',
      computeWinners: () => {
        const sorted = cars.filter(c => c.segment === 'SUV').sort((a, b) => familyScore(b) - familyScore(a))
        return { gold: sorted[0], silver: sorted[1], bronze: sorted[2] }
      },
    },
    {
      id: 'ev-of-year',
      title: 'EV of the Year',
      description: 'Best electric vehicle by range, features, safety, and overall rating',
      icon: Zap,
      emoji: '🔋',
      gradient: 'from-sky-400 via-cyan-300 to-emerald-400',
      glowColor: '#00BCD4',
      computeWinners: () => {
        const sorted = cars.filter(c => c.isEV).sort((a, b) => {
          const rangeA = parseMileage(a.mileage)
          const rangeB = parseMileage(b.mileage)
          const scoreA = rangeA * 0.05 + a.features.length * 2 + safetyScore(a) * 0.5 + a.rating * 15
          const scoreB = rangeB * 0.05 + b.features.length * 2 + safetyScore(b) * 0.5 + b.rating * 15
          return scoreB - scoreA
        })
        return { gold: sorted[0], silver: sorted[1], bronze: sorted[2] }
      },
    },
    {
      id: 'feature-king',
      title: 'Feature King',
      description: 'Car with the most features packed in',
      icon: Crown,
      emoji: '👑',
      gradient: 'from-yellow-400 via-amber-400 to-orange-500',
      glowColor: '#FFB300',
      computeWinners: () => {
        const sorted = [...cars].sort((a, b) => b.features.length - a.features.length)
        return { gold: sorted[0], silver: sorted[1], bronze: sorted[2] }
      },
    },
    {
      id: 'peoples-choice',
      title: "People's Choice",
      description: 'Most reviewed car — the voice of the community',
      icon: Heart,
      emoji: '❤️',
      gradient: 'from-rose-400 via-pink-400 to-red-500',
      glowColor: '#FF3B3B',
      computeWinners: () => {
        const sorted = [...cars].sort((a, b) => b.reviewCount - a.reviewCount)
        return { gold: sorted[0], silver: sorted[1], bronze: sorted[2] }
      },
    },
    {
      id: 'safety-champion',
      title: 'Safety Champion',
      description: 'Highest composite safety score: NCAP stars, airbags, ESP, ABS, hill assist',
      icon: Shield,
      emoji: '🏅',
      gradient: 'from-blue-400 via-indigo-400 to-violet-500',
      glowColor: '#3F51B5',
      computeWinners: () => {
        const sorted = [...cars].sort((a, b) => safetyScore(b) - safetyScore(a))
        return { gold: sorted[0], silver: sorted[1], bronze: sorted[2] }
      },
    },
  ]
}

// ─── Medal colours ──────────────────────────────────────────────────────────
const MEDAL_CONFIG = {
  gold:   { bg: '#FFD700', text: '#1a1a2e', label: '🥇 Gold',   ring: 'rgba(255,215,0,0.4)',  glow: '0 0 28px rgba(255,215,0,0.35)' },
  silver: { bg: '#C0C0C0', text: '#1a1a2e', label: '🥈 Silver', ring: 'rgba(192,192,192,0.4)', glow: '0 0 20px rgba(192,192,192,0.25)' },
  bronze: { bg: '#CD7F32', text: '#1a1a2e', label: '🥉 Bronze', ring: 'rgba(205,127,50,0.4)',  glow: '0 0 20px rgba(205,127,50,0.25)' },
} as const

type MedalTier = keyof typeof MEDAL_CONFIG

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ─── Winner card (gold/silver/bronze) ──────────────────────────────────────
function WinnerCard({ car, tier }: { car: CarType; tier: MedalTier }) {
  const medal = MEDAL_CONFIG[tier]
  const isGold = tier === 'gold'

  return (
    <Link to={`/cars/${car.id}`} className="block no-underline group">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.92 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        whileHover={{ y: -4, scale: 1.02 }}
        className={clsx(
          'glass rounded-2xl overflow-hidden border-2 transition-all relative',
          isGold ? 'col-span-full sm:col-span-1' : '',
        )}
        style={{
          borderColor: medal.ring,
          boxShadow: isGold ? medal.glow : 'none',
        }}
      >
        {/* Medal badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md"
          style={{ background: `${medal.bg}E6`, color: medal.text }}>
          <span className="text-xs font-black">{medal.label}</span>
        </div>

        {/* Image */}
        <div className={clsx(
          'overflow-hidden bg-secondary',
          isGold ? 'aspect-[16/10]' : 'aspect-video',
        )}>
          <img
            src={car.images[0]}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={e => {
              (e.target as HTMLImageElement).src =
                `https://via.placeholder.com/400x225/0D1B2A/00D4FF?text=${encodeURIComponent(car.brand)}`
            }}
          />
          {/* Gold special overflow glow */}
          {isGold && (
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
          )}
        </div>

        {/* Info */}
        <div className={clsx('p-4', isGold && 'relative')}>
          <p className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: medal.bg }}>{car.brand}</p>
          <h4 className={clsx('font-black text-text-primary truncate', isGold ? 'text-lg' : 'text-sm')}>
            {car.model}
          </h4>
          <p className="text-xs text-text-muted truncate mb-2">{car.variant}</p>

          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-text-primary">₹{car.price}L</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-warning fill-warning" />
              <span className="text-xs font-bold text-warning">{car.rating}</span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/30">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-bold">
              {car.mileage}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface text-text-dim font-bold">
              {car.fuelType}
            </span>
            {car.safety.globalNcap >= 5 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-bold">
                ⭐ 5★ NCAP
              </span>
            )}
          </div>

          {/* View link */}
          <div className="flex items-center gap-1 mt-3 text-xs font-semibold group-hover:gap-2 transition-all"
            style={{ color: medal.bg }}>
            View Details <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

// ─── Award section (1 award with 3 winners) ───────────────────────────────
function AwardSection({ award, idx }: { award: AwardDef; idx: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const winners = useMemo(() => award.computeWinners(), [award])
  const [expanded, setExpanded] = useState(true)

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
      className="relative"
    >
      {/* Glow background */}
      <div className="absolute -inset-4 rounded-3xl opacity-[0.04] blur-3xl pointer-events-none"
        style={{ background: award.glowColor }} />

      {/* Award header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full glass rounded-2xl p-5 mb-4 flex items-center gap-4
          border border-border/30 hover:border-accent/30 transition-all cursor-pointer relative overflow-hidden group"
      >
        {/* Number badge */}
        <div className="absolute -top-2 -left-2 w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black text-text-dim opacity-20">
          #{idx + 1}
        </div>

        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${award.gradient} flex items-center justify-center shrink-0 shadow-lg`}
          style={{ boxShadow: `0 4px 20px ${award.glowColor}30` }}>
          <span className="text-2xl">{award.emoji}</span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 text-left">
          <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
            {award.title}
            <Sparkles className="w-4 h-4 text-warning opacity-60" />
          </h3>
          <p className="text-xs text-text-muted mt-0.5">{award.description}</p>
        </div>

        {/* Winner preview */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="w-10 h-8 rounded-lg overflow-hidden bg-secondary border-2"
            style={{ borderColor: MEDAL_CONFIG.gold.bg }}>
            <img src={winners.gold.images[0]} alt={winners.gold.model}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x32/0D1B2A/FFD700' }}
            />
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-warning">{winners.gold.brand}</p>
            <p className="text-[10px] text-text-dim">{winners.gold.model}</p>
          </div>
        </div>

        <ChevronRight className={clsx(
          'w-5 h-5 text-text-dim transition-transform shrink-0',
          expanded && 'rotate-90'
        )} />
      </button>

      {/* Winners grid */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="grid sm:grid-cols-3 gap-4"
        >
          <WinnerCard car={winners.gold}   tier="gold"   />
          <WinnerCard car={winners.silver} tier="silver" />
          <WinnerCard car={winners.bronze} tier="bronze" />
        </motion.div>
      )}
    </motion.section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TROPHY STATS BANNER
// ═══════════════════════════════════════════════════════════════════════════
function TrophyStats({ awards }: { awards: AwardDef[] }) {
  // Count unique gold winners
  const goldWinners = new Set(awards.map(a => a.computeWinners().gold.id))
  // Most decorated brand
  const brandCounts: Record<string, number> = {}
  awards.forEach(a => {
    const g = a.computeWinners()
    ;[g.gold, g.silver, g.bronze].forEach(c => {
      brandCounts[c.brand] = (brandCounts[c.brand] || 0) + 1
    })
  })
  const topBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10"
    >
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-text-dim">
          <Trophy className="w-3 h-3" /> Total Awards
        </div>
        <p className="text-2xl font-black text-warning font-mono mt-1">{awards.length}</p>
      </div>
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-text-dim">
          <Medal className="w-3 h-3" /> Cars Analysed
        </div>
        <p className="text-2xl font-black text-accent font-mono mt-1">{cars.length}</p>
      </div>
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-text-dim">
          <Crown className="w-3 h-3" /> Gold Winners
        </div>
        <p className="text-2xl font-black text-text-primary font-mono mt-1">{goldWinners.size}</p>
      </div>
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-text-dim">
          <Award className="w-3 h-3" /> Top Brand
        </div>
        <p className="text-lg font-black text-text-primary mt-1 truncate">{topBrand?.[0] || '—'}</p>
        <p className="text-[10px] text-text-dim">{topBrand?.[1] || 0} medals</p>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function Awards() {
  const awards = useMemo(() => computeAwards(), [])

  return (
    <div className="page-enter section-wrapper py-10 pb-20">
      {/* Page header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warning via-warm to-danger
            flex items-center justify-center mx-auto mb-5 shadow-lg"
          style={{ boxShadow: '0 8px 32px rgba(255,179,0,0.25)' }}
        >
          <Trophy className="w-8 h-8 text-primary" />
        </motion.div>
        <span className="section-tag mb-3 inline-flex">
          <Award className="w-3.5 h-3.5" /> AutoIQ Awards 2024
        </span>
        <h1 className="text-display-md">
          Car <span className="gradient-text">Awards</span> & Badges
        </h1>
        <p className="text-text-muted mt-2 max-w-xl mx-auto">
          Auto-calculated from real vehicle data — NCAP ratings, engine specs, features, pricing, and community reviews
          power these awards. No bias, pure data.
        </p>
      </div>

      {/* Stats banner */}
      <TrophyStats awards={awards} />

      {/* Awards list */}
      <div className="space-y-12">
        {awards.map((award, idx) => (
          <AwardSection key={award.id} award={award} idx={idx} />
        ))}
      </div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass rounded-3xl p-8 mt-16 text-center border border-accent/20"
      >
        <h2 className="text-display-xs mb-2">Think we missed a category?</h2>
        <p className="text-text-muted text-sm mb-6 max-w-md mx-auto">
          All awards are computed live from our car database.
          Add more cars and categories will automatically update.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/cars" className="btn btn-primary btn-md gap-2 no-underline">
            <Car className="w-5 h-5" /> Browse All Cars
          </Link>
          <Link to="/compare" className="btn btn-secondary btn-md gap-2 no-underline">
            <Gauge className="w-5 h-5" /> Compare Cars
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
