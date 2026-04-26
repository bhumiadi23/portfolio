import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  motion, AnimatePresence,
  type Variants
} from 'framer-motion'
import {
  Search, ArrowRight, Zap, GitCompare, Bot,
  Star, TrendingUp, Shield, Users, BarChart3,
  Flame, Sparkles, ChevronRight, X
} from 'lucide-react'
import { cars, getFeaturedCars, getEVCars } from '../data/cars'
import CarCard from '../components/car/CarCard'
import CarCarousel from '../components/ui/CarCarousel'
import { useCompare } from '../hooks/useCompare'
import { useSearch } from '../hooks/useSearch'
import type { Car } from '../types/car.types'

// ─── Animation Variants ────────────────────────────────────────────────────
const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.55, ease: EASE_SMOOTH } },
}
const staggerContainer: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
}
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

// ─── Static data ───────────────────────────────────────────────────────────
const PLATFORM_STATS = [
  { icon: BarChart3, value: '500+',  label: 'Cars Tracked',   color: 'text-accent' },
  { icon: Star,      value: '50K+',  label: 'Owner Reviews',  color: 'text-warning' },
  { icon: Bot,       value: 'AI',    label: 'Smart Advisor',  color: 'text-success' },
  { icon: Users,     value: '2L+',   label: 'Monthly Users',  color: 'text-warm' },
  { icon: Shield,    value: '5★',    label: 'Safety Rated',   color: 'text-accent' },
  { icon: GitCompare,value: 'Free',  label: '3-Car Compare',  color: 'text-text-muted' },
]

const QUICK_FILTERS = [
  { label: '🚙 SUV',         segment: 'SUV',       priceMax: 100 },
  { label: '🚘 Sedan',       segment: 'Sedan',     priceMax: 100 },
  { label: '⚡ Electric',    fuel: 'Electric',     priceMax: 100 },
  { label: '💰 Under ₹10L', segment: null,         priceMax: 10  },
  { label: '🏎️ Luxury',     segment: 'Luxury SUV', priceMax: 100 },
  { label: '🛢️ Diesel',     fuel: 'Diesel',       priceMax: 100 },
]

const HERO_TAGLINES = [
  'Compare Cars with Intelligence',
  'Find Your Perfect Drive',
  'Data-Driven Car Buying',
  'Your AI Car Advisor',
]

// Most compared = highest reviewCount
const getMostCompared = () =>
  [...cars].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 6)

// New launches = highest year, then latest id pattern
const getNewLaunches = () =>
  [...cars].filter(c => c.year >= 2024).slice(0, 6)


export default function Home() {
  const featured     = getFeaturedCars()
  const evCars       = getEVCars()
  const mostCompared = getMostCompared()
  const newLaunches  = getNewLaunches()

  const { addToCompare, isInCompare, canAddMore } = useCompare()
  const { query, setQuery, results, clearSearch, hasResults } = useSearch()
  const navigate = useNavigate()

  // rotating hero tagline
  const [taglineIdx, setTaglineIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTaglineIdx(i => (i + 1) % HERO_TAGLINES.length), 3500)
    return () => clearInterval(t)
  }, [])

  // quick filter selection
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const handleQuickFilter = (f: typeof QUICK_FILTERS[0]) => {
    setActiveFilter(f.label)
    const params = new URLSearchParams()
    if (f.segment) params.set('segment', f.segment)
    if ((f as any).fuel) params.set('fuel', (f as any).fuel)
    if (f.priceMax < 100) params.set('priceMax', String(f.priceMax))
    navigate(`/cars?${params.toString()}`)
  }

  const handleSearchSelect = (car: Car) => {
    clearSearch()
    navigate(`/cars/${car.id}`)
  }

  return (
    <div className="overflow-x-hidden">

      {/* ════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">

        {/* Layered background */}
        <div className="absolute inset-0 bg-hero-mesh pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Glowing orbs */}
          <motion.div
            className="absolute top-16 right-[8%] w-[520px] h-[520px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-10 left-[5%] w-[380px] h-[380px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="section-wrapper relative z-10 pt-16 pb-24">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {/* Badge */}
            <motion.div variants={fadeUp}>
              <span className="section-tag mb-8 inline-flex">
                <Zap className="w-3.5 h-3.5" />
                India's #1 Car Intelligence Platform
              </span>
            </motion.div>

            {/* Animated headline */}
            <motion.div variants={fadeUp} className="mb-6 min-h-[3.5rem] sm:min-h-[4.5rem] lg:min-h-[5rem]">
              <h1 className="text-balance">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={taglineIdx}
                    className="gradient-text block"
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    {HERO_TAGLINES[taglineIdx]}
                  </motion.span>
                </AnimatePresence>
              </h1>
            </motion.div>

            <motion.p variants={fadeUp} className="text-lg text-text-muted leading-relaxed mb-10 max-w-xl mx-auto">
              Real specs, AI-powered recommendations, and community reviews — from ₹5L to ₹70L, every car covered.
            </motion.p>

            {/* ── Search bar ── */}
            <motion.div variants={fadeUp} className="relative max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                <input
                  id="hero-search"
                  type="text"
                  placeholder="Search brand, model, or segment…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="input pl-12 pr-12 h-14 text-base rounded-2xl shadow-glow-sm
                             focus:shadow-glow-accent transition-shadow duration-300"
                  autoComplete="off"
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search dropdown */}
              <AnimatePresence>
                {hasResults && (
                  <motion.div
                    id="search-dropdown"
                    className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-2xl
                               border border-border/60 shadow-card z-50 overflow-hidden"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0,  scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    {results.map((car, i) => (
                      <motion.button
                        key={car.id}
                        onClick={() => handleSearchSelect(car)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left
                                   hover:bg-surface/60 transition-colors border-b border-border/20 last:border-0"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <img
                          src={car.images[0]}
                          alt={car.model}
                          className="w-10 h-10 rounded-lg object-cover bg-secondary shrink-0"
                          onError={e => {
                            (e.target as HTMLImageElement).src =
                              `https://via.placeholder.com/40x40/0D1B2A/00D4FF?text=${car.brand[0]}`
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate">
                            {car.brand} {car.model}
                          </p>
                          <p className="text-xs text-text-muted">{car.segment} · {car.fuelType}</p>
                        </div>
                        <span className="text-sm font-bold text-accent shrink-0">{car.priceRange}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Quick filter pills ── */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap gap-2 justify-center mb-10"
              id="quick-filters"
            >
              {QUICK_FILTERS.map(f => (
                <motion.button
                  key={f.label}
                  id={`quick-filter-${f.label.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => handleQuickFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200
                    ${activeFilter === f.label
                      ? 'bg-accent text-primary border-accent shadow-glow-sm'
                      : 'bg-surface/50 border-border/60 text-text-secondary hover:border-accent/50 hover:text-accent backdrop-blur-sm'
                    }`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {f.label}
                </motion.button>
              ))}
            </motion.div>

            {/* ── CTA Buttons ── */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link to="/cars" className="btn btn-primary btn-lg">
                  Explore All Cars <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link to="/ai-advisor" className="btn btn-outline btn-lg">
                  <Bot className="w-5 h-5" /> Ask AI Advisor
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* down indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-5 h-8 rounded-full border border-border/60 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-accent rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════ */}
      <section className="border-y border-border/50 bg-secondary/40 backdrop-blur-sm">
        <motion.div
          className="section-wrapper py-5"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 divide-x divide-border/30">
            {PLATFORM_STATS.map((s) => (
              <motion.div
                key={s.label}
                variants={scaleIn}
                className="flex flex-col items-center gap-1 px-2 text-center"
              >
                <s.icon className={`w-4 h-4 ${s.color} mb-0.5`} />
                <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-text-dim uppercase tracking-wider font-semibold">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          FEATURED CARS CAROUSEL
      ════════════════════════════════════════ */}
      <section className="section-wrapper py-16">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <span className="section-tag mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Editor's Picks
              </span>
              <h2>Featured Cars</h2>
              <p className="text-text-muted mt-1">Handpicked by our experts — the best in every segment.</p>
            </div>
            <Link to="/cars" className="btn btn-ghost btn-sm text-accent hover:text-accent gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div variants={fadeUp}>
            <CarCarousel cardWidth={292}>
              {featured.map(car => (
                <CarCard
                  key={car.id}
                  car={car}
                  onCompare={addToCompare}
                  isInCompare={isInCompare(car.id)}
                  canAddMore={canAddMore}
                />
              ))}
            </CarCarousel>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          MOST COMPARED
      ════════════════════════════════════════ */}
      <section className="py-14 border-t border-border/40 bg-secondary/30">
        <div className="section-wrapper">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="flex items-end justify-between mb-8 flex-wrap gap-4">
              <div>
                <span className="section-tag mb-3">
                  <GitCompare className="w-3.5 h-3.5" /> Most Compared
                </span>
                <h2>What India is Comparing</h2>
                <p className="text-text-muted mt-1">The cars buyers put head-to-head most often.</p>
              </div>
              <Link to="/compare" className="btn btn-secondary btn-sm gap-2">
                <GitCompare className="w-4 h-4" /> Open Comparator
              </Link>
            </motion.div>

            <motion.div variants={fadeUp}>
              <CarCarousel cardWidth={292}>
                {mostCompared.map((car, i) => (
                  <div key={car.id} className="relative">
                    {/* rank badge */}
                    <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black
                      bg-accent/20 border border-accent/40 text-accent backdrop-blur-sm">
                      #{i + 1}
                    </div>
                    <CarCard
                      car={car}
                      onCompare={addToCompare}
                      isInCompare={isInCompare(car.id)}
                      canAddMore={canAddMore}
                    />
                  </div>
                ))}
              </CarCarousel>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          NEW LAUNCHES
      ════════════════════════════════════════ */}
      <section className="section-wrapper py-16">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <span className="section-tag mb-3">
                <Flame className="w-3.5 h-3.5" /> Fresh Arrivals
              </span>
              <h2>New Launches 2024</h2>
              <p className="text-text-muted mt-1">Just launched or refreshed — straight from the showroom.</p>
            </div>
            <Link to="/cars" className="btn btn-ghost btn-sm text-accent gap-1">
              All 2024 Cars <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Grid for new launches — 3 col hero layout */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {newLaunches.map((car, i) => (
              <motion.div
                key={car.id}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* Featured hero card for first item */}
                {i === 0 ? (
                  <Link
                    to={`/cars/${car.id}`}
                    id={`new-launch-hero-${car.id}`}
                    className="block sm:col-span-2 glass rounded-2xl overflow-hidden border border-border/50
                               hover:border-accent/30 transition-all duration-300 hover:shadow-card-hover no-underline"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img src={car.images[0]} alt={car.model}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            `https://via.placeholder.com/800x300/0D1B2A/00D4FF?text=${car.brand}`
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
                          bg-warm/25 border border-warm/40 text-warm backdrop-blur-sm mb-2">
                          🆕 New Launch
                        </span>
                        <p className="text-xs text-accent font-bold uppercase tracking-widest">{car.brand}</p>
                        <h3 className="text-xl font-black text-text-primary">{car.model} <span className="text-accent">{car.variant}</span></h3>
                        <p className="text-sm text-text-muted mt-0.5">Starting {car.priceRange}</p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <CarCard
                    car={car}
                    onCompare={addToCompare}
                    isInCompare={isInCompare(car.id)}
                    canAddMore={canAddMore}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          EV SPOTLIGHT
      ════════════════════════════════════════ */}
      <section className="py-14 border-t border-border/40"
        style={{ background: 'linear-gradient(135deg, rgba(0,230,118,0.04) 0%, rgba(0,212,255,0.04) 100%)' }}
      >
        <div className="section-wrapper">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="flex items-end justify-between mb-8 flex-wrap gap-4">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest
                  bg-success/10 text-success border border-success/20 mb-3">
                  <Zap className="w-3.5 h-3.5" /> Electric Vehicles
                </span>
                <h2>Go Electric</h2>
                <p className="text-text-muted mt-1">India's best EVs — range, charging, and cost of ownership compared.</p>
              </div>
              <Link to="/cars?fuel=Electric" className="btn btn-sm bg-success/15 border border-success/30 text-success hover:bg-success/25 gap-2">
                <Zap className="w-4 h-4" /> All EVs
              </Link>
            </motion.div>

            <motion.div variants={fadeUp}>
              <CarCarousel cardWidth={292}>
                {evCars.map(car => (
                  <CarCard
                    key={car.id}
                    car={car}
                    onCompare={addToCompare}
                    isInCompare={isInCompare(car.id)}
                    canAddMore={canAddMore}
                  />
                ))}
              </CarCarousel>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURE HIGHLIGHTS
      ════════════════════════════════════════ */}
      <section className="section-wrapper py-16 border-t border-border/40">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="text-center mb-10">
            <span className="section-tag mb-4">Platform</span>
            <h2>Everything You Need to Buy Smart</h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid sm:grid-cols-3 gap-5"
          >
            {[
              {
                icon: GitCompare,
                title: 'Side-by-Side Compare',
                desc: 'Compare up to 3 cars across 30+ specs — power, mileage, safety, dimensions — in one clear table.',
                link: '/compare', cta: 'Start Comparing',
                accent: 'accent',
              },
              {
                icon: Bot,
                title: 'AI Advisor',
                desc: 'Tell us your budget, lifestyle, and priorities. Our AI scores every car and recommends the best match.',
                link: '/ai-advisor', cta: 'Ask AI Now',
                accent: 'success',
              },
              {
                icon: TrendingUp,
                title: 'Finance Tools',
                desc: 'Calculate real EMI, 5-year fuel costs, and resale depreciation before signing on the dotted line.',
                link: '/tools', cta: 'Use Tools',
                accent: 'warning',
              },
            ].map(f => (
              <motion.div
                key={f.title}
                variants={scaleIn}
                whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300 } }}
                className="glass rounded-2xl p-6 group hover:border-accent/30 transition-all duration-300 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-${f.accent}/10 border border-${f.accent}/20
                                 flex items-center justify-center mb-4 group-hover:bg-${f.accent}/20 transition-colors`}>
                  <f.icon className={`w-6 h-6 text-${f.accent}`} />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed mb-5">{f.desc}</p>
                <Link
                  to={f.link}
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold text-${f.accent} hover:opacity-80 transition-opacity`}
                >
                  {f.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════ */}
      <section className="section-wrapper pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl p-10 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(0,102,255,0.08) 50%, rgba(255,107,53,0.06) 100%)',
            border: '1px solid rgba(0,212,255,0.2)',
          }}
        >
          {/* decorative blobs */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-warm/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <Sparkles className="w-8 h-8 text-accent mx-auto mb-4" />
            <h2 className="text-display-md mb-3">
              Still unsure? Let AI decide.
            </h2>
            <p className="text-text-muted max-w-md mx-auto mb-8">
              Answer 5 quick questions about your budget and lifestyle — our AI will shortlist the top 3 cars for you.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/ai-advisor" id="cta-ai-advisor-btn" className="btn btn-primary btn-xl">
                <Bot className="w-6 h-6" /> Start AI Advisor — It's Free
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

    </div>
  )
}
