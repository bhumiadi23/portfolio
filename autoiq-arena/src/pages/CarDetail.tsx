import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  ArrowLeft, Star, Zap, Fuel, Shield, GitCompare,
  Check, Heart, Share2, ChevronLeft, ChevronRight,
  Gauge, Cog, Ruler, ShieldCheck, Sparkles, X,
  ThumbsUp, ThumbsDown, Info, MessageSquare, Warehouse
} from 'lucide-react'
import { cars, getCarById } from '../data/cars'
import { formatPrice, formatCC, formatMM } from '../utils/formatters'
import { fuelBadgeColor, segmentIcon } from '../utils/carUtils'
import { useCompare } from '../hooks/useCompare'
import { useGarage } from '../hooks/useGarage'
import clsx from 'clsx'
import type { Car } from '../types/car.types'

// ─── Framer variants ────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// ─── Colour map — maps colour name keywords to hex swatches ─────────────────
const COLOR_MAP: Record<string, string> = {
  white: '#F5F5F5',   black: '#1A1A2E',   silver: '#C0C0C0',
  grey:  '#808080',   gray:  '#808080',   red:    '#CC2200',
  blue:  '#1565C0',   'pearl blue': '#4BA8D8', orange: '#E65100',
  brown: '#5D4037',   gold:  '#FFC107',   green:  '#2E7D32',
  beige: '#D7CCC8',   maroon:'#880E4F',   purple: '#6A1B9A',
  yellow:'#F9A825',   teal:  '#00695C',   cyan:   '#00838F',
  bronze:'#A0522D',   champagne: '#F7E7CE',
}

function getColorHex(colorName: string): string {
  const lower = colorName.toLowerCase()
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return hex
  }
  return '#3A4A6B' // fallback navy
}

// ─── Section tab config ─────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Overview',  icon: Info      },
  { id: 'specs',     label: 'Specs',     icon: Cog       },
  { id: 'features',  label: 'Features',  icon: Sparkles  },
  { id: 'safety',    label: 'Safety',    icon: ShieldCheck},
  { id: 'ratings',   label: 'Ratings',   icon: Star      },
  { id: 'similar',   label: 'Similar',   icon: GitCompare},
]

// ─── Star row ───────────────────────────────────────────────────────────────
function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} className={clsx('w-3.5 h-3.5', i < Math.round(value) ? 'text-warning fill-warning' : 'text-border')} />
      ))}
    </div>
  )
}

// ─── Rating bar ─────────────────────────────────────────────────────────────
function RatingBar({ label, value, color = 'bg-accent' }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-muted w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${(value / 5) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-bold text-text-primary w-6 text-right">{value}</span>
    </div>
  )
}

// ─── Spec table section ──────────────────────────────────────────────────────
function SpecSection({ title, icon: Icon, rows }: {
  title: string
  icon: React.ElementType
  rows: { label: string; value: string; highlight?: boolean }[]
}) {
  return (
    <div className="mb-1">
      <div className="flex items-center gap-2 px-5 py-3 bg-accent/[0.08] border-b border-border/40">
        <Icon className="w-4 h-4 text-accent" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-accent">{title}</h3>
      </div>
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={clsx(
            'flex items-center justify-between px-5 py-3 border-b border-border/20 last:border-0',
            i % 2 === 0 ? 'bg-transparent' : 'bg-surface/20',
            row.highlight && 'bg-accent/5'
          )}
        >
          <span className="text-sm text-text-muted">{row.label}</span>
          <span className={clsx('text-sm font-semibold font-mono', row.highlight ? 'text-accent' : 'text-text-primary')}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function CarDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const car = getCarById(id || '')
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare()
  const { addToGarage, removeFromGarage, isInGarage } = useGarage()

  // ── Gallery state ────────────────────────────────────────────────────────
  const [activeImg, setActiveImg]     = useState(0)
  const [savedCar, setSavedCar]       = useState(false)
  const [shareToast, setShareToast]   = useState(false)
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const [activeTab, setActiveTab]     = useState('overview')

  // Sticky tab logic
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const tabBarRef   = useRef<HTMLDivElement>(null)

  // ── Similar cars ─────────────────────────────────────────────────────────
  const similarCars = useMemo(() => {
    if (!car) return []
    return cars
      .filter(c => c.id !== car.id && (c.segment === car.segment || Math.abs(c.price - car.price) < 8))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4)
  }, [car])

  // ── Derived rating categories (seeded from real rating) ──────────────────
  const ratingCategories = useMemo(() => {
    if (!car) return []
    const base = car.rating
    const jitter = (n: number) => Math.min(5, Math.max(2.5, parseFloat((base + n).toFixed(1))))
    return [
      { label: 'Performance',  value: jitter(0.2),  color: 'bg-accent' },
      { label: 'Comfort',      value: jitter(-0.1), color: 'bg-success' },
      { label: 'Fuel Economy', value: jitter(0.1),  color: 'bg-warning' },
      { label: 'Value for ₹', value: jitter(0.15), color: 'bg-warm' },
      { label: 'After-Sales',  value: jitter(-0.2), color: 'bg-purple-400' },
    ]
  }, [car])

  // ── Infinite carousel keyboard nav ───────────────────────────────────────
  const totalImages = car?.images.length ?? 1
  const prevImg = useCallback(() => setActiveImg(i => (i - 1 + totalImages) % totalImages), [totalImages])
  const nextImg = useCallback(() => setActiveImg(i => (i + 1) % totalImages), [totalImages])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevImg()
      if (e.key === 'ArrowRight') nextImg()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prevImg, nextImg])

  // ── Scroll-spy for tabs ──────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveTab(entry.target.id)
        }
      },
      { threshold: 0.35, rootMargin: '-80px 0px 0px 0px' }
    )
    Object.values(sectionRefs.current).forEach(el => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [car])

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id]
    if (el) {
      const offset = tabBarRef.current?.offsetHeight ?? 60
      const top = el.getBoundingClientRect().top + window.scrollY - offset - 16
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    setShareToast(true)
    setTimeout(() => setShareToast(false), 2500)
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (!car) {
    return (
      <div className="section-wrapper py-24 text-center">
        <div className="glass rounded-3xl p-16 max-w-md mx-auto">
          <h1 className="text-display-md mb-3">Car Not Found</h1>
          <p className="text-text-muted mb-8">The car you're looking for doesn't exist in our database.</p>
          <Link to="/cars" className="btn btn-primary btn-md">← Back to Database</Link>
        </div>
      </div>
    )
  }

  const inCompare = isInCompare(car.id)
  const inGarage = isInGarage(car.id)
  const activeColorHex = activeColor ? getColorHex(activeColor) : null

  // Spec table data
  const engineSpecs = [
    { label: 'Engine Type',    value: car.engine.type, highlight: true },
    { label: 'Displacement',   value: formatCC(car.engine.cc)          },
    { label: 'Max Power',      value: car.engine.power, highlight: true },
    { label: 'Max Torque',     value: car.engine.torque                },
    { label: 'Cylinders',      value: String(car.engine.cylinders)     },
    { label: 'Transmission',   value: car.transmission, highlight: true },
    { label: 'Fuel Type',      value: car.fuelType                     },
    { label: car.isEV ? 'Range' : 'Mileage', value: car.mileage, highlight: true },
  ]
  const dimensionSpecs = [
    { label: 'Length',           value: formatMM(car.dimensions.length)          },
    { label: 'Width',            value: formatMM(car.dimensions.width)           },
    { label: 'Height',           value: formatMM(car.dimensions.height)          },
    { label: 'Wheelbase',        value: formatMM(car.dimensions.wheelbase)       },
    { label: 'Boot Space',       value: `${car.dimensions.bootSpace} L`          },
    { label: 'Ground Clearance', value: formatMM(car.dimensions.groundClearance) },
    { label: 'Seating',          value: `${car.seating} persons`                 },
  ]
  const safetySpecs = [
    { label: 'Global NCAP Rating', value: `${car.safety.globalNcap} / 5 ★`, highlight: true },
    { label: 'Airbags',            value: `${car.safety.airbagsCount} airbags` },
    { label: 'ABS + EBD',          value: car.safety.abs ? '✓ Standard' : '✗ Not Available' },
    { label: 'Electronic Stability', value: car.safety.esp ? '✓ Standard' : '✗ Not Available' },
    { label: 'Hill Assist',        value: car.safety.hillAssist ? '✓ Standard' : '✗ Not Available' },
  ]

  return (
    <div className="page-enter min-h-screen">

      {/* ─────────────────────────────────────────────────────────
          BREADCRUMB
      ───────────────────────────────────────────────────────── */}
      <div className="section-wrapper pt-6 pb-2 flex items-center gap-2 text-xs text-text-muted">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-accent transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <span>/</span>
        <Link to="/cars" className="hover:text-accent transition-colors no-underline">Car Database</Link>
        <span>/</span>
        <span className="text-text-primary">{car.brand} {car.model}</span>
      </div>

      {/* ─────────────────────────────────────────────────────────
          HERO: GALLERY + INFO PANEL
      ───────────────────────────────────────────────────────── */}
      <section
        id="overview"
        ref={el => { sectionRefs.current['overview'] = el }}
        className="section-wrapper pb-0 pt-4"
      >
        <div className="grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-8 items-start">

          {/* ── LEFT: Gallery ─────────────────────────────────── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden bg-secondary aspect-video group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={car.images[activeImg] ?? car.images[0]}
                  alt={`${car.brand} ${car.model} view ${activeImg + 1}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.35 }}
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      `https://via.placeholder.com/800x450/0D1B2A/00D4FF?text=${encodeURIComponent(car.brand + ' ' + car.model)}`
                  }}
                  style={activeColorHex ? { filter: `sepia(0.3) hue-rotate(var(--color-tint, 0deg))` } : undefined}
                />
              </AnimatePresence>

              {/* Overlay badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {car.isEV && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
                                   bg-success/25 border border-success/40 text-success backdrop-blur-sm">
                    <Zap className="w-3.5 h-3.5" /> Electric
                  </span>
                )}
                {car.isPopular && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold
                                   bg-warm/25 border border-warm/40 text-warm backdrop-blur-sm">
                    🔥 Popular
                  </span>
                )}
              </div>

              {/* Image counter */}
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-xs font-mono text-white">
                {activeImg + 1} / {car.images.length}
              </div>

              {/* Nav arrows */}
              {car.images.length > 1 && (
                <>
                  <button onClick={prevImg} aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2
                               w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center
                               text-white hover:bg-accent/80 transition-all
                               opacity-0 group-hover:opacity-100 duration-200">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={nextImg} aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center
                               text-white hover:bg-accent/80 transition-all
                               opacity-0 group-hover:opacity-100 duration-200">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {car.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {car.images.map((src, i) => (
                  <button
                    key={i}
                    id={`thumb-${i}`}
                    onClick={() => setActiveImg(i)}
                    className={clsx(
                      'shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200',
                      activeImg === i
                        ? 'border-accent shadow-glow-sm scale-105'
                        : 'border-border/40 hover:border-accent/40 opacity-70 hover:opacity-100'
                    )}
                  >
                    <img src={src} alt={`View ${i + 1}`} className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          `https://via.placeholder.com/80x56/0D1B2A/00D4FF?text=${i + 1}`
                      }} />
                  </button>
                ))}
              </div>
            )}

            {/* Colour picker */}
            <div className="glass rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">
                🎨 Available Colors
              </p>
              <div className="flex flex-wrap gap-2">
                {car.colors.map(color => {
                  const hex = getColorHex(color)
                  return (
                    <button
                      key={color}
                      id={`color-${color.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => setActiveColor(c => c === color ? null : color)}
                      title={color}
                      className={clsx(
                        'group relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border',
                        activeColor === color
                          ? 'border-accent text-accent bg-accent/10 shadow-glow-sm'
                          : 'border-border/50 text-text-muted hover:border-accent/30 hover:text-text-primary'
                      )}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                      {color}
                      {activeColor === color && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  )
                })}
              </div>
              {activeColor && (
                <p className="text-xs text-text-dim mt-2">
                  Viewing: <span className="text-accent font-semibold">{activeColor}</span>
                  <button onClick={() => setActiveColor(null)} className="ml-2 hover:text-danger transition-colors">
                    <X className="w-3 h-3 inline" />
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* ── RIGHT: Info Panel ────────────────────────────── */}
          <div className="lg:sticky lg:top-24 space-y-4">
            {/* Brand + title */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-accent mb-1">
                {car.brand} · {car.segment} · {car.year}
              </p>
              <h1 className="text-3xl font-black text-text-primary leading-tight">{car.model}</h1>
              <p className="text-text-muted mt-0.5 text-sm">{car.variant}</p>
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <StarRating value={car.rating} />
                <span className="text-base font-black text-warning ml-1">{car.rating}</span>
              </div>
              <span className="text-text-dim text-xs">({car.reviewCount.toLocaleString()} reviews)</span>
              <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-semibold ml-auto', fuelBadgeColor(car.fuelType))}>
                {car.fuelType === 'Electric' ? '⚡' : '⛽'} {car.fuelType}
              </span>
            </div>

            {/* Price card */}
            <div className="glass rounded-2xl p-5 border border-accent/20">
              <p className="text-[10px] text-text-dim uppercase tracking-widest mb-1">Ex-Showroom Price</p>
              <p className="text-3xl font-black text-accent">{formatPrice(car.price)}</p>
              <p className="text-xs text-text-muted mt-1">Variant Range: {car.priceRange}</p>

              {/* Quick stat grid */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/30">
                {[
                  { label: 'Power',    value: car.engine.power,                       icon: Gauge },
                  { label: car.isEV ? 'Range' : 'Mileage', value: car.mileage,       icon: Fuel  },
                  { label: 'Safety',   value: `${car.safety.globalNcap}★ NCAP`,      icon: Shield},
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <s.icon className="w-4 h-4 text-accent mx-auto mb-1" />
                    <p className="text-[10px] text-text-dim uppercase tracking-wider">{s.label}</p>
                    <p className="text-xs font-bold text-text-primary font-mono mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id={`detail-compare-btn-${car.id}`}
                onClick={() => inCompare ? removeFromCompare(car.id) : addToCompare(car)}
                disabled={!canAddMore && !inCompare}
                className={clsx(
                  'btn btn-md gap-2',
                  inCompare ? 'btn-warm' : 'btn-primary',
                  !canAddMore && !inCompare && 'opacity-50 cursor-not-allowed'
                )}
              >
                {inCompare
                  ? <><Check className="w-4 h-4" /> In Compare List</>
                  : <><GitCompare className="w-4 h-4" /> Add to Compare</>}
              </button>
              <button
                id={`detail-garage-btn-${car.id}`}
                onClick={() => inGarage ? removeFromGarage(car.id) : addToGarage(car)}
                className={clsx(
                  'btn btn-md gap-2',
                  inGarage ? 'btn-warm' : 'btn-secondary',
                )}
              >
                {inGarage
                  ? <><Check className="w-4 h-4" /> In Garage</>
                  : <><Warehouse className="w-4 h-4" /> Add to Garage</>}
              </button>
              <button
                id="save-car-btn"
                onClick={() => setSavedCar(s => !s)}
                className={clsx('btn btn-secondary btn-sm gap-2', savedCar && 'text-danger border-danger/30')}
              >
                <Heart className={clsx('w-4 h-4', savedCar && 'fill-danger text-danger')} />
                {savedCar ? 'Saved' : 'Save'}
              </button>
              <button
                id="share-car-btn"
                onClick={handleShare}
                className="btn btn-secondary btn-sm gap-2"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
              {inCompare && (
                <Link to="/compare" className="btn btn-outline btn-sm gap-1.5 col-span-2 text-center no-underline">
                  View Full Comparison →
                </Link>
              )}
              {inGarage && (
                <Link to="/garage" className="btn btn-outline btn-sm gap-1.5 col-span-2 text-center no-underline border-warm text-warm hover:bg-warm hover:text-white">
                  Open My Garage →
                </Link>
              )}
            </div>

            {/* Segment + tags */}
            <div className="flex flex-wrap gap-1.5">
              <span className="stat-chip">{segmentIcon(car.segment)} {car.segment}</span>
              <span className="stat-chip">{car.transmission}</span>
              <span className="stat-chip"><Shield className="w-3 h-3" /> {car.safety.airbagsCount} Airbags</span>
              {car.tags.map(t => (
                <span key={t} className="stat-chip text-accent border-accent/20 bg-accent/5">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          STICKY SECTION NAV TABS
      ───────────────────────────────────────────────────────── */}
      <div
        ref={tabBarRef}
        className="sticky top-16 z-30 bg-primary/90 backdrop-blur-md border-b border-border/40"
      >
        <div className="section-wrapper">
          <nav className="flex gap-1 overflow-x-auto no-scrollbar py-1" aria-label="Car detail sections">
            {TABS.map(tab => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => scrollToSection(tab.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-accent text-primary shadow-glow-sm'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          SPECS SECTION
      ───────────────────────────────────────────────────────── */}
      <section
        id="specs"
        ref={el => { sectionRefs.current['specs'] = el }}
        className="section-wrapper py-12"
      >
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-6">
            <Cog className="w-5 h-5 text-accent" />
            <h2 className="text-display-xs">Full Specifications</h2>
          </div>

          <div className="glass rounded-2xl overflow-hidden border border-border/30">
            <SpecSection title="Engine & Performance" icon={Gauge} rows={engineSpecs} />
            <SpecSection title="Dimensions & Space"   icon={Ruler}  rows={dimensionSpecs} />
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          FEATURES SECTION
      ───────────────────────────────────────────────────────── */}
      <section
        id="features"
        ref={el => { sectionRefs.current['features'] = el }}
        className="section-wrapper pb-12"
      >
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-display-xs">Features & Equipment</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Key features grid */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-sm font-bold mb-4 text-text-primary">Key Features</h3>
              <div className="grid grid-cols-1 gap-2">
                {car.features.map(f => (
                  <div key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span className="text-sm text-text-secondary">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pros & Cons */}
            <div className="space-y-4">
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-success" />
                  <span className="text-success">What Owners Love</span>
                </h3>
                <ul className="space-y-2.5">
                  {car.pros.map(p => (
                    <li key={p} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="w-4 h-4 rounded-full bg-success/20 border border-success/40 text-success
                                       flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">+</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <ThumbsDown className="w-4 h-4 text-danger" />
                  <span className="text-danger">Reported Drawbacks</span>
                </h3>
                <ul className="space-y-2.5">
                  {car.cons.map(c => (
                    <li key={c} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="w-4 h-4 rounded-full bg-danger/20 border border-danger/40 text-danger
                                       flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">−</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          SAFETY SECTION
      ───────────────────────────────────────────────────────── */}
      <section
        id="safety"
        ref={el => { sectionRefs.current['safety'] = el }}
        className="section-wrapper pb-12"
      >
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <h2 className="text-display-xs">Safety & Ratings</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* NCAP visual */}
            <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <Shield className="w-12 h-12 text-accent mb-3" />
              <p className="text-5xl font-black text-accent mb-2">{car.safety.globalNcap}</p>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={clsx('w-6 h-6',
                    i <= car.safety.globalNcap ? 'text-warning fill-warning' : 'text-border')} />
                ))}
              </div>
              <p className="text-sm text-text-muted">Global NCAP Safety Rating</p>
            </div>

            {/* Safety specs table */}
            <div className="glass rounded-2xl overflow-hidden border border-border/30">
              <SpecSection title="Safety Equipment" icon={ShieldCheck} rows={safetySpecs} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          OWNER RATINGS SECTION
      ───────────────────────────────────────────────────────── */}
      <section
        id="ratings"
        ref={el => { sectionRefs.current['ratings'] = el }}
        className="section-wrapper pb-12"
      >
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-5 h-5 text-accent" />
            <h2 className="text-display-xs">Owner Ratings</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Overall score */}
            <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <p className="text-xs text-text-dim uppercase tracking-widest mb-3">Overall Score</p>
              <p className="text-7xl font-black text-accent">{car.rating}</p>
              <StarRating value={car.rating} />
              <p className="text-sm text-text-muted mt-3">Based on {car.reviewCount.toLocaleString()} owner reviews</p>

              {/* Rating distribution bars */}
              <div className="w-full mt-5 space-y-1.5">
                {[5,4,3,2,1].map(stars => {
                  const pct = stars === 5 ? 42 : stars === 4 ? 31 : stars === 3 ? 15 : stars === 2 ? 8 : 4
                  return (
                    <div key={stars} className="flex items-center gap-2 text-xs">
                      <span className="w-8 text-text-muted text-right">{stars}★</span>
                      <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-warning rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: (5 - stars) * 0.08 }}
                        />
                      </div>
                      <span className="w-8 text-text-dim">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="glass rounded-2xl p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-5">Category Breakdown</p>
              <div className="space-y-4">
                {ratingCategories.map(cat => (
                  <RatingBar key={cat.label} label={cat.label} value={cat.value} color={cat.color} />
                ))}
              </div>

              {/* Verdict badge */}
              <div className="mt-6 pt-5 border-t border-border/30 text-center">
                <div className={clsx(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border',
                  car.rating >= 4.3 ? 'bg-success/15 border-success/40 text-success' :
                  car.rating >= 3.8 ? 'bg-accent/15 border-accent/40 text-accent' :
                  'bg-warning/15 border-warning/40 text-warning'
                )}>
                  {car.rating >= 4.3 ? '⭐ Editor\'s Choice' :
                   car.rating >= 3.8 ? '👍 Recommended' : '📊 Average Ratings'}
                </div>
              </div>

              {/* Community Reviews CTA */}
              <Link
                to={`/reviews/${car.id}`}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                  border border-accent/30 bg-accent/5 text-accent text-sm font-bold
                  hover:bg-accent/10 hover:border-accent/50 transition-all no-underline"
              >
                <MessageSquare className="w-4 h-4" />
                Read {car.reviewCount.toLocaleString()} Community Reviews
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          SIMILAR CARS SECTION
      ───────────────────────────────────────────────────────── */}
      <section
        id="similar"
        ref={el => { sectionRefs.current['similar'] = el }}
        className="section-wrapper pb-16"
      >
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-3">
                <GitCompare className="w-5 h-5 text-accent" />
                <h2 className="text-display-xs">Similar Cars</h2>
              </div>
              <p className="text-text-muted text-sm mt-1 ml-8">
                Same segment or similar price range — popular alternatives to the {car.model}.
              </p>
            </div>
            <Link to="/compare" className="btn btn-secondary btn-sm gap-2 no-underline">
              <GitCompare className="w-4 h-4" /> Compare All
            </Link>
          </div>

          {similarCars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarCars.map(similar => (
                <SimilarCarCard key={similar.id} car={similar} />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-10 text-center text-text-muted">
              No similar cars found in our database.
            </div>
          )}
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          STICKY BOTTOM BAR (mobile)
      ───────────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden
                      border-t border-border/50 bg-secondary/95 backdrop-blur-md p-3">
        <div className="flex gap-2 max-w-screen-sm mx-auto">
          <div className="flex-1">
            <p className="text-xs text-text-dim">Ex-Showroom</p>
            <p className="text-base font-black text-accent">{formatPrice(car.price)}</p>
          </div>
          <button
            onClick={() => inGarage ? removeFromGarage(car.id) : addToGarage(car)}
            className={clsx('btn btn-sm px-3', inGarage ? 'btn-warm' : 'btn-secondary')}
          >
            <Warehouse className="w-4 h-4" />
          </button>
          <button
            onClick={() => inCompare ? removeFromCompare(car.id) : addToCompare(car)}
            disabled={!canAddMore && !inCompare}
            className={clsx('btn btn-sm gap-1.5', inCompare ? 'btn-warm' : 'btn-secondary')}
          >
            <GitCompare className="w-4 h-4" />
            {inCompare ? 'In Compare' : 'Compare'}
          </button>
          <button onClick={() => setSavedCar(s => !s)}
            className={clsx('btn btn-sm px-3', savedCar && 'text-danger')}>
            <Heart className={clsx('w-4 h-4', savedCar && 'fill-danger')} />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          SHARE TOAST
      ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50
                       px-5 py-3 glass-strong rounded-full border border-accent/40 shadow-card
                       text-sm font-semibold text-accent flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom padding for mobile sticky bar */}
      <div className="h-20 lg:hidden" />
    </div>
  )
}

// ─── Compact Similar Car Card ─────────────────────────────────────────────
function SimilarCarCard({ car }: { car: Car }) {
  const { addToCompare, isInCompare, canAddMore } = useCompare()
  const inCompare = isInCompare(car.id)

  return (
    <Link
      to={`/cars/${car.id}`}
      id={`similar-car-${car.id}`}
      className="block no-underline group"
    >
      <div className="glass rounded-xl overflow-hidden border border-border/50
                      hover:border-accent/30 hover:shadow-card-hover transition-all duration-300">
        <div className="aspect-video overflow-hidden bg-secondary">
          <img
            src={car.images[0]}
            alt={car.model}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => {
              (e.target as HTMLImageElement).src =
                `https://via.placeholder.com/300x169/0D1B2A/00D4FF?text=${car.brand}`
            }}
          />
        </div>
        <div className="p-3">
          <p className="text-[10px] text-accent font-bold uppercase tracking-widest">{car.brand}</p>
          <h4 className="text-sm font-black text-text-primary truncate">{car.model}</h4>
          <p className="text-xs text-text-muted truncate">{car.variant}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-black text-text-primary">₹{car.price}L</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-warning fill-warning" />
              <span className="text-xs font-bold text-warning">{car.rating}</span>
            </div>
          </div>
          <button
            onClick={e => { e.preventDefault(); addToCompare(car) }}
            disabled={!canAddMore && !inCompare}
            className={clsx(
              'mt-2 w-full btn btn-ghost btn-sm text-xs py-1',
              inCompare ? 'text-accent' : 'text-text-muted',
              !canAddMore && !inCompare && 'opacity-40'
            )}
          >
            {inCompare ? '✓ In Compare' : '+ Compare'}
          </button>
        </div>
      </div>
    </Link>
  )
}
