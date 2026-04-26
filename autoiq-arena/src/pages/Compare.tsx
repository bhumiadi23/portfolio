import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  GitCompare, Plus, X, Trophy, Search, Share2,
  Star, Zap, ChevronUp, ExternalLink, Copy
} from 'lucide-react'
import { cars } from '../data/cars'
import { useCompare } from '../hooks/useCompare'
import { formatPrice, formatCC } from '../utils/formatters'
import { fuelBadgeColor } from '../utils/carUtils'
import clsx from 'clsx'
import type { Car } from '../types/car.types'

// ─── Colour palette for up to 4 cars ────────────────────────────────────────
const CAR_COLORS = ['#00D4FF', '#FF6B35', '#00E676', '#FFB300']

// ─── Spec sections + rows ────────────────────────────────────────────────────
interface SpecRow {
  label:     string
  group:     string
  fn:        (c: Car) => string
  numeric?:  (c: Car) => number   // for winner detection
  higherBetter?: boolean          // true = higher wins, false = lower wins
  badge?:    (c: Car) => string   // optional colored badge class
}

const SPEC_ROWS: SpecRow[] = [
  // ── Pricing
  { group: 'Pricing',
    label: 'Ex-Showroom Price',   fn: c => formatPrice(c.price),
    numeric: c => c.price,        higherBetter: false },
  { group: 'Pricing',
    label: 'Price Range',         fn: c => c.priceRange },
  { group: 'Pricing',
    label: 'Variant',             fn: c => c.variant },

  // ── Engine
  { group: 'Engine & Performance',
    label: 'Engine Type',         fn: c => c.engine.type },
  { group: 'Engine & Performance',
    label: 'Displacement',        fn: c => formatCC(c.engine.cc),
    numeric: c => c.engine.cc,    higherBetter: true },
  { group: 'Engine & Performance',
    label: 'Max Power (bhp)',     fn: c => c.engine.power,
    numeric: c => parseFloat(c.engine.power),  higherBetter: true },
  { group: 'Engine & Performance',
    label: 'Max Torque (Nm)',     fn: c => c.engine.torque,
    numeric: c => parseFloat(c.engine.torque), higherBetter: true },
  { group: 'Engine & Performance',
    label: 'Cylinders',           fn: c => String(c.engine.cylinders) },
  { group: 'Engine & Performance',
    label: 'Transmission',        fn: c => c.transmission },
  { group: 'Engine & Performance',
    label: 'Fuel Type',           fn: c => c.fuelType },

  // ── Efficiency
  { group: 'Efficiency',
    label: 'Mileage / Range',     fn: c => c.mileage,
    numeric: c => parseFloat(c.mileage), higherBetter: true },

  // ── Dimensions
  { group: 'Dimensions',
    label: 'Length (mm)',         fn: c => `${c.dimensions.length} mm`,
    numeric: c => c.dimensions.length },
  { group: 'Dimensions',
    label: 'Width (mm)',          fn: c => `${c.dimensions.width} mm`,
    numeric: c => c.dimensions.width },
  { group: 'Dimensions',
    label: 'Height (mm)',         fn: c => `${c.dimensions.height} mm` },
  { group: 'Dimensions',
    label: 'Wheelbase (mm)',      fn: c => `${c.dimensions.wheelbase} mm`,
    numeric: c => c.dimensions.wheelbase, higherBetter: true },
  { group: 'Dimensions',
    label: 'Boot Space (L)',      fn: c => `${c.dimensions.bootSpace} L`,
    numeric: c => c.dimensions.bootSpace, higherBetter: true },
  { group: 'Dimensions',
    label: 'Ground Clearance',   fn: c => `${c.dimensions.groundClearance} mm`,
    numeric: c => c.dimensions.groundClearance, higherBetter: true },
  { group: 'Dimensions',
    label: 'Seating',             fn: c => `${c.seating} persons`,
    numeric: c => c.seating,      higherBetter: true },

  // ── Safety
  { group: 'Safety',
    label: 'Global NCAP',         fn: c => `${c.safety.globalNcap} / 5 ★`,
    numeric: c => c.safety.globalNcap, higherBetter: true },
  { group: 'Safety',
    label: 'Airbags',             fn: c => `${c.safety.airbagsCount} airbags`,
    numeric: c => c.safety.airbagsCount, higherBetter: true },
  { group: 'Safety',
    label: 'ABS + EBD',           fn: c => c.safety.abs ? '✓ Standard' : '✗ N/A' },
  { group: 'Safety',
    label: 'Electronic Stability', fn: c => c.safety.esp ? '✓ Standard' : '✗ N/A' },
  { group: 'Safety',
    label: 'Hill Assist',         fn: c => c.safety.hillAssist ? '✓ Standard' : '✗ N/A' },

  // ── Ratings
  { group: 'Community Ratings',
    label: 'Overall Rating',      fn: c => `${c.rating} / 5`,
    numeric: c => c.rating,       higherBetter: true },
  { group: 'Community Ratings',
    label: 'Total Reviews',       fn: c => c.reviewCount.toLocaleString(),
    numeric: c => c.reviewCount,  higherBetter: true },
]

const GROUPS = [...new Set(SPEC_ROWS.map(r => r.group))]

// ─── Radar chart data builder ────────────────────────────────────────────────
function buildRadarData(compareList: Car[]) {
  const axes = [
    { key: 'power',      label: 'Power',
      val: (c: Car) => Math.min(100, (parseFloat(c.engine.power) / 300) * 100) },
    { key: 'mileage',    label: 'Mileage',
      val: (c: Car) => Math.min(100, (parseFloat(c.mileage) / 35) * 100) },
    { key: 'safety',     label: 'Safety',
      val: (c: Car) => (c.safety.globalNcap / 5) * 100 },
    { key: 'value',      label: 'Value',
      val: (c: Car) => Math.max(0, 100 - (c.price / 100) * 50) },
    { key: 'rating',     label: 'Rating',
      val: (c: Car) => (c.rating / 5) * 100 },
    { key: 'space',      label: 'Space',
      val: (c: Car) => Math.min(100, (c.dimensions.bootSpace / 600) * 100) },
  ]

  return axes.map(axis => {
    const entry: Record<string, string | number> = { axis: axis.label }
    compareList.forEach(car => {
      entry[car.id] = Math.round(axis.val(car))
    })
    return entry
  })
}

// ─── Winner detection ────────────────────────────────────────────────────────
function getWinnerIdx(row: SpecRow, compareList: Car[]): number[] {
  if (!row.numeric || compareList.length < 2) return []
  const vals = compareList.map(c => row.numeric!(c))
  if (vals.some(isNaN)) return []
  const best = row.higherBetter !== false ? Math.max(...vals) : Math.min(...vals)
  // Return all indices that tie at the best value
  return vals.reduce<number[]>((acc, v, i) => {
    if (v === best) acc.push(i)
    return acc
  }, [])
}

// ─── Car picker dialog ────────────────────────────────────────────────────────
function CarPickerModal({
  onSelect, onClose, exclude,
}: { onSelect: (car: Car) => void; onClose: () => void; exclude: string[] }) {
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const filtered = useMemo(() =>
    cars.filter(c =>
      !exclude.includes(c.id) &&
      `${c.brand} ${c.model} ${c.segment} ${c.fuelType}`.toLowerCase().includes(q.toLowerCase())
    ), [q, exclude])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="glass-strong rounded-2xl w-full max-w-md border border-border/60 shadow-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-accent" />
            <h3 className="font-bold text-text-primary">Add a Car</h3>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              ref={inputRef}
              id="car-picker-search"
              type="text"
              placeholder="Search brand, model, type…"
              value={q}
              onChange={e => setQ(e.target.value)}
              className="input pl-9 h-10 text-sm"
            />
          </div>
        </div>

        {/* Results */}
        <div className="px-3 pb-4 max-h-80 overflow-y-auto no-scrollbar space-y-0.5">
          {filtered.length === 0 ? (
            <p className="text-center text-text-muted text-sm py-8">No cars found</p>
          ) : (
            filtered.map((car, i) => (
              <motion.button
                key={car.id}
                onClick={() => { onSelect(car); onClose() }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                           hover:bg-surface/60 hover:border-accent/20 border border-transparent
                           transition-all text-left"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.025 }}
              >
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-secondary shrink-0">
                  <img src={car.images[0]} alt={car.model}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        `https://via.placeholder.com/44x44/0D1B2A/00D4FF?text=${car.brand[0]}`
                    }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">{car.brand} {car.model}</p>
                  <p className="text-xs text-text-muted">{car.segment} · {car.fuelType} · {car.priceRange}</p>
                </div>
                <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border font-bold', fuelBadgeColor(car.fuelType))}>
                  {car.fuelType === 'Electric' ? '⚡' : '⛽'} {car.fuelType}
                </span>
              </motion.button>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Share toast ─────────────────────────────────────────────────────────────
function ShareToast({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                 px-5 py-3 glass-strong rounded-full border border-accent/40 shadow-card
                 text-sm font-semibold text-accent flex items-center gap-2"
    >
      <Copy className="w-4 h-4" /> Shareable link copied!
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPARE PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function Compare() {
  const { compareList, addToCompare, removeFromCompare, clearCompare } = useCompare()
  const [pickerOpen, setPickerOpen]  = useState(false)
  const [shareToast, setShareToast]  = useState(false)
  const [showBackTop, setShowBackTop] = useState(false)
  const [searchParams]               = useSearchParams()
  const navigate                     = useNavigate()
  const stickyHeaderRef              = useRef<HTMLDivElement>(null)

  // ── Restore compare list from URL ?cars=id1,id2,id3 ───────────────────
  useEffect(() => {
    const ids = searchParams.get('cars')?.split(',').filter(Boolean) ?? []
    if (ids.length === 0) return
    if (compareList.length > 0) return  // already have cars, don't override
    ids.forEach(id => {
      const car = cars.find(c => c.id === id)
      if (car) addToCompare(car)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Share: encode current compare list in URL ─────────────────────────
  const handleShare = useCallback(() => {
    const ids = compareList.map(c => c.id).join(',')
    const url = `${window.location.origin}/compare?cars=${ids}`
    navigator.clipboard.writeText(url).catch(() => {})
    setShareToast(true)
    navigate(`/compare?cars=${ids}`, { replace: true })
  }, [compareList, navigate])

  // ── Back-to-top on scroll ─────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setShowBackTop(window.scrollY > 500)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const radarData    = useMemo(() => buildRadarData(compareList), [compareList])
  const groupedSpecs = useMemo(() =>
    GROUPS.map(g => ({ group: g, rows: SPEC_ROWS.filter(r => r.group === g) })),
  [])

  const MAX_CARS = 4
  const canAdd   = compareList.length < MAX_CARS

  // ─── Empty state ────────────────────────────────────────────────────────
  if (compareList.length === 0) {
    return (
      <div className="page-enter section-wrapper py-16">
        <div className="text-center">
          <span className="section-tag mb-4 inline-flex">
            <GitCompare className="w-3.5 h-3.5" /> Compare
          </span>
          <h1 className="text-display-md mb-3">Compare Cars</h1>
          <p className="text-text-muted mb-10">
            Side-by-side specs, radar chart, and winner highlights for up to 4 vehicles.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-14 max-w-lg mx-auto"
          >
            <Trophy className="w-14 h-14 text-text-dim mx-auto mb-5" />
            <h2 className="text-xl font-bold mb-2 text-text-primary">No cars selected yet</h2>
            <p className="text-text-muted text-sm mb-8">
              Add up to 4 cars to get a full comparison with green winner highlights and a radar chart.
            </p>
            <div className="flex flex-col gap-3">
              <button
                id="open-picker-empty"
                onClick={() => setPickerOpen(true)}
                className="btn btn-primary btn-md gap-2 w-full"
              >
                <Plus className="w-4 h-4" /> Add Your First Car
              </button>
              <Link to="/cars" className="btn btn-secondary btn-md gap-2 w-full no-underline">
                <Search className="w-4 h-4" /> Browse Car Database
              </Link>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {pickerOpen && (
            <CarPickerModal
              key="picker"
              onSelect={addToCompare}
              onClose={() => setPickerOpen(false)}
              exclude={compareList.map(c => c.id)}
            />
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="page-enter min-h-screen">

      {/* ─── Page header ──────────────────────────────────────────────── */}
      <div className="section-wrapper pt-8 pb-4">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="section-tag mb-3 inline-flex">
              <GitCompare className="w-3.5 h-3.5" /> Compare
            </span>
            <h1 className="text-display-md">Car Comparison</h1>
            <p className="text-text-muted text-sm mt-1">
              Comparing <span className="text-accent font-bold">{compareList.length}</span> of {MAX_CARS} cars
            </p>
          </div>
          <div className="flex items-center gap-2">
            {compareList.length >= 2 && (
              <button
                id="share-compare-btn"
                onClick={handleShare}
                className="btn btn-secondary btn-sm gap-2"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            )}
            <button
              onClick={clearCompare}
              className="btn btn-ghost btn-sm gap-1.5 text-danger hover:bg-danger/10 hover:text-danger"
            >
              <X className="w-4 h-4" /> Clear All
            </button>
          </div>
        </div>
      </div>

      {/* ─── Sticky car headers ───────────────────────────────────────── */}
      <div
        ref={stickyHeaderRef}
        className="sticky top-[72px] z-30 bg-primary/95 backdrop-blur-md border-b border-border/40 shadow-nav"
      >
        <div className="section-wrapper py-3">
          <div className="grid gap-3"
            style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)` }}
          >
            {/* Label column */}
            <div className="flex items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Specs</span>
            </div>

            {/* Car columns */}
            {compareList.map((car, idx) => (
              <div key={car.id} className="relative group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl overflow-hidden shrink-0"
                    style={{ boxShadow: `0 0 0 2px ${CAR_COLORS[idx]}` }}
                  >
                    <img src={car.images[0]} alt={car.model}
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          `https://via.placeholder.com/40x40/0D1B2A/00D4FF?text=${car.brand[0]}`
                      }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest truncate"
                       style={{ color: CAR_COLORS[idx] }}>
                      {car.brand}
                    </p>
                    <p className="text-sm font-black text-text-primary truncate">{car.model}</p>
                    <p className="text-[10px] text-text-muted truncate">{formatPrice(car.price)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link to={`/cars/${car.id}`}
                      className="w-6 h-6 rounded-lg flex items-center justify-center
                                 text-text-dim hover:text-accent transition-colors"
                      title="View details" aria-label="View car details">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      id={`remove-car-${car.id}`}
                      onClick={() => removeFromCompare(car.id)}
                      aria-label={`Remove ${car.model}`}
                      className="w-6 h-6 rounded-lg flex items-center justify-center
                                 text-text-dim hover:text-danger hover:bg-danger/10 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add car slot — only if room */}
            {canAdd && (
              <div className="flex items-center">
                <button
                  id="add-car-btn"
                  onClick={() => setPickerOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold
                             border-2 border-dashed border-border/50 text-text-muted
                             hover:border-accent/50 hover:text-accent transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Car
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Main content ──────────────────────────────────────────────── */}
      <div className="section-wrapper py-8 space-y-10">

        {/* ── Radar Chart ───────────────────────────────────────────────── */}
        {compareList.length >= 2 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            id="radar-section"
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-5 h-5 text-accent" />
              <div>
                <h2 className="text-lg font-black text-text-primary">Performance Radar</h2>
                <p className="text-xs text-text-muted">Normalized scores across 6 categories (0–100)</p>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  key={compareList.map(c => c.id).join('-')}
                  data={radarData}
                  margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
                >
                  <PolarGrid stroke="rgba(30,58,95,0.6)" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fill: '#8B9EC7', fontSize: 12, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={30} domain={[0, 100]} tick={false} axisLine={false}
                  />
                  {compareList.map((car, idx) => (
                    <Radar
                      key={car.id}
                      name={`${car.brand} ${car.model}`}
                      dataKey={car.id}
                      stroke={CAR_COLORS[idx]}
                      fill={CAR_COLORS[idx]}
                      fillOpacity={0.12}
                      strokeWidth={2}
                      dot={{ r: 4, fill: CAR_COLORS[idx], strokeWidth: 0 }}
                      isAnimationActive={true}
                      animationEasing="ease-out"
                      animationDuration={1000}
                    />
                  ))}
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(13,27,42,0.97)',
                      border: '1px solid rgba(30,58,95,0.8)',
                      borderRadius: '12px',
                      color: '#F0F4FF',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`${val ?? ''}`, ''] as [string, string]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                    formatter={(value) => (
                      <span style={{ color: '#B8CCF0' }}>{value}</span>
                    )}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Score summary chips */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border/30">
              {compareList.map((car, idx) => {
                const score = Math.round(
                  radarData.reduce((acc, row) => acc + (Number(row[car.id]) || 0), 0) / radarData.length
                )
                return (
                  <div key={car.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
                    style={{ borderColor: `${CAR_COLORS[idx]}40`, background: `${CAR_COLORS[idx]}10` }}>
                    <span className="text-xs font-bold" style={{ color: CAR_COLORS[idx] }}>
                      {car.brand} {car.model}
                    </span>
                    <span className="text-xs font-black text-text-primary">{score}/100</span>
                  </div>
                )
              })}
            </div>
          </motion.section>
        )}

        {/* ── Spec table ─────────────────────────────────────────────────── */}
        {compareList.length >= 2 ? (
          <div className="space-y-4">
            {groupedSpecs.map(({ group, rows }) => (
              <motion.div
                key={group}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
                className="glass rounded-2xl overflow-hidden border border-border/30"
              >
                {/* Group header */}
                <div className="flex items-center gap-2 px-5 py-3 bg-accent/[0.06] border-b border-border/40">
                  <span className="text-xs font-black uppercase tracking-widest text-accent">{group}</span>
                </div>

                {/* Rows */}
                {rows.map((row, rowIdx) => {
                  const winnerIdxs = getWinnerIdx(row, compareList)
                  return (
                    <div
                      key={row.label}
                      className={clsx(
                        'grid border-b border-border/20 last:border-0 transition-colors duration-150',
                        rowIdx % 2 === 0 ? 'bg-transparent' : 'bg-surface/20',
                      )}
                      style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)` }}
                    >
                      {/* Spec label */}
                      <div className="px-5 py-3.5 flex items-center">
                        <span className="text-sm text-text-muted">{row.label}</span>
                      </div>

                      {/* Values */}
                      {compareList.map((car, ci) => {
                        const isWinner = winnerIdxs.includes(ci)
                        const val      = row.fn(car)
                        const isBool   = val === '✓ Standard' || val === '✗ N/A'
                        const isPos    = val === '✓ Standard'
                        return (
                          <div
                            key={car.id}
                            className={clsx(
                              'px-5 py-3.5 flex items-center justify-center text-sm font-semibold font-mono',
                              isWinner && 'bg-success/[0.08]',
                            )}
                          >
                            <span className={clsx(
                              isBool
                                ? isPos ? 'text-success' : 'text-danger/70'
                                : isWinner ? 'text-success font-black' : 'text-text-primary'
                            )}>
                              {val}
                              {isWinner && !isBool && (
                                <motion.span
                                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                                  className="inline-flex items-center justify-center ml-1.5
                                             w-4 h-4 rounded-full bg-success text-primary text-[8px] font-black"
                                >
                                  ✓
                                </motion.span>
                              )}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </motion.div>
            ))}
          </div>
        ) : (
          /* ── Prompt to add second car ─────────────────────────────────── */
          <div className="text-center py-16 glass rounded-2xl border border-dashed border-border/50">
            <GitCompare className="w-12 h-12 text-text-dim mx-auto mb-4" />
            <h3 className="text-display-xs mb-2">Add one more car</h3>
            <p className="text-text-muted text-sm mb-6">
              You need at least 2 cars to see the comparison table and radar chart.
            </p>
            <button
              id="add-second-car-btn"
              onClick={() => setPickerOpen(true)}
              className="btn btn-primary btn-md gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" /> Add a Car
            </button>
          </div>
        )}

        {/* ── Add car CTA (bottom) ──────────────────────────────────────── */}
        {canAdd && compareList.length >= 2 && (
          <div className="text-center">
            <button
              id="add-car-bottom-btn"
              onClick={() => setPickerOpen(true)}
              className="btn btn-secondary btn-md gap-2"
            >
              <Plus className="w-4 h-4" />
              Add {compareList.length === 3 ? 'One More Car' : 'Another Car'}
              <span className="text-text-dim text-xs">({MAX_CARS - compareList.length} slot{MAX_CARS - compareList.length > 1 ? 's' : ''} left)</span>
            </button>
          </div>
        )}

        {/* ── Pros & Cons side-by-side ──────────────────────────────────── */}
        {compareList.length >= 2 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-black text-text-primary">Pros & Cons</h2>
            </div>
            <div className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${compareList.length}, 1fr)` }}>
              {compareList.map((car, idx) => (
                <div key={car.id}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3 truncate"
                     style={{ color: CAR_COLORS[idx] }}>
                    {car.brand} {car.model}
                  </p>
                  <div className="space-y-1.5 mb-4">
                    {car.pros.slice(0, 4).map(p => (
                      <div key={p} className="flex items-start gap-2 text-xs text-text-secondary">
                        <span className="w-4 h-4 rounded-full bg-success/20 text-success border border-success/30
                                         flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5">+</span>
                        {p}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    {car.cons.slice(0, 3).map(c => (
                      <div key={c} className="flex items-start gap-2 text-xs text-text-secondary">
                        <span className="w-4 h-4 rounded-full bg-danger/20 text-danger border border-danger/30
                                         flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5">−</span>
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Overall winner banner ─────────────────────────────────────── */}
        {compareList.length >= 2 && (() => {
          const scores = compareList.map(car => {
            return radarData.reduce((acc, row) => acc + (Number(row[car.id]) || 0), 0)
          })
          const maxScore = Math.max(...scores)
          const winnerIdx = scores.indexOf(maxScore)
          const winner = compareList[winnerIdx]
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6 border-2 border-success/30 bg-success/[0.03] text-center"
            >
              <Trophy className="w-10 h-10 text-warning mx-auto mb-3" />
              <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Overall Winner</p>
              <h2 className="text-2xl font-black text-text-primary mb-1">
                {winner.brand} {winner.model}
              </h2>
              <p className="text-sm text-text-muted mb-4">
                Scored highest across performance, mileage, safety, value, and community ratings.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link to={`/cars/${winner.id}`}
                  className="btn btn-primary btn-sm gap-2 no-underline">
                  <ExternalLink className="w-3.5 h-3.5" /> View Full Details
                </Link>
                <button onClick={handleShare} className="btn btn-secondary btn-sm gap-2">
                  <Share2 className="w-3.5 h-3.5" /> Share Comparison
                </button>
              </div>
            </motion.div>
          )
        })()}

      </div>

      {/* ── Car picker modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {pickerOpen && (
          <CarPickerModal
            key="picker"
            onSelect={addToCompare}
            onClose={() => setPickerOpen(false)}
            exclude={compareList.map(c => c.id)}
          />
        )}
      </AnimatePresence>

      {/* ── Share toast ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {shareToast && <ShareToast key="toast" onDone={() => setShareToast(false)} />}
      </AnimatePresence>

      {/* ── Back to top ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showBackTop && (
          <motion.button
            key="back-top"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-6 z-40 w-10 h-10 rounded-xl
                       bg-accent text-primary flex items-center justify-center shadow-glow-sm
                       hover:scale-110 transition-transform"
            aria-label="Back to top"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Bottom padding for sticky header */}
      <div className="h-12" />
    </div>
  )
}
