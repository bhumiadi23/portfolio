import { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Search, SlidersHorizontal, X, ChevronDown,
  GridIcon, List, LayoutGrid, ArrowUpDown,
  Star, Fuel, Zap
} from 'lucide-react'
import { cars, getAllBrands } from '../data/cars'
import CarCard from '../components/car/CarCard'
import { CarCardSkeletonGrid } from '../components/ui/CarCardSkeleton'
import { useCompare } from '../hooks/useCompare'
import { useFilter } from '../hooks/useFilter'
import { filterCars, sortCars, fuelBadgeColor, segmentIcon } from '../utils/carUtils'
import type { Segment, FuelType, Transmission, Car } from '../types/car.types'
import clsx from 'clsx'

// ─── Constants ─────────────────────────────────────────────────────────────
const SEGMENTS:      Segment[]      = ['Hatchback', 'Sedan', 'SUV', 'Luxury SUV', 'MUV']
const FUEL_TYPES:    FuelType[]     = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']
const TRANSMISSIONS: Transmission[] = ['Manual', 'Automatic', 'CVT', 'AMT', 'DCT']
const SEATING_OPTS:  number[]       = [5, 6, 7]
const PAGE_SIZE = 9

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'rating',     label: '⭐ Top Rated'     },
  { value: 'newest',     label: '🆕 Newest First'  },
  { value: 'price-asc',  label: '💰 Price: Low→High'},
  { value: 'price-desc', label: '💰 Price: High→Low'},
  { value: 'mileage',    label: '⛽ Best Mileage'   },
  { value: 'power',      label: '⚡ Most Powerful'  },
]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } },
}

// ─── FilterChip ────────────────────────────────────────────────────────────
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                 bg-accent/15 text-accent border border-accent/35 whitespace-nowrap"
    >
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove filter ${label}`}
        className="hover:text-white transition-colors ml-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.span>
  )
}

// ─── PriceRangeSlider ──────────────────────────────────────────────────────
function PriceRangeSlider({
  min, max, onMin, onMax,
}: { min: number; max: number; onMin: (v: number) => void; onMax: (v: number) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-accent">₹{min}L</span>
        <span className="text-accent">₹{max}L</span>
      </div>
      <div className="space-y-2">
        <div>
          <label className="text-[10px] text-text-dim uppercase tracking-wider">Min Price</label>
          <input type="range" min={0} max={70} step={1} value={min}
            onChange={e => onMin(Math.min(Number(e.target.value), max - 1))}
            className="w-full accent-[#00D4FF] mt-1" />
        </div>
        <div>
          <label className="text-[10px] text-text-dim uppercase tracking-wider">Max Price</label>
          <input type="range" min={0} max={70} step={1} value={max}
            onChange={e => onMax(Math.max(Number(e.target.value), min + 1))}
            className="w-full accent-[#00D4FF] mt-1" />
        </div>
      </div>
    </div>
  )
}

// ─── FilterSection ─────────────────────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border/40 pb-4 last:border-0 last:pb-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-1 text-xs font-bold
                   uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors mb-3"
      >
        {title}
        <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function CarDatabase() {
  const [searchParams] = useSearchParams()
  const {
    filters, toggleSegment, toggleFuel, toggleTransmission, toggleSeating,
    setPriceRange, toggleBrand, setSearch, setSortBy, resetFilters, activeFilterCount,
  } = useFilter()

  const { addToCompare, isInCompare, canAddMore } = useCompare()

  // Simulated initial load — shows skeletons for 800 ms
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Apply URL query params on mount
  useEffect(() => {
    const seg = searchParams.get('segment') as Segment | null
    const fuel = searchParams.get('fuel') as FuelType | null
    const priceMax = searchParams.get('priceMax')
    if (seg) toggleSegment(seg)
    if (fuel) toggleFuel(fuel)
    if (priceMax) setPriceRange(0, Number(priceMax))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const brands = useMemo(() => getAllBrands(), [])

  // Filter + sort pipeline
  const results = useMemo(() => {
    const filtered = filterCars(cars, filters)
    return sortCars(filtered, filters.sortBy)
  }, [filters])

  // Pagination
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(results.length / PAGE_SIZE)
  const paged = useMemo(() => results.slice(0, page * PAGE_SIZE), [results, page])

  // Reset to page 1 when filters change
  useEffect(() => setPage(1), [filters])

  // Grid layout toggle
  const [gridCols, setGridCols] = useState<2 | 3 | 'list'>(3)

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Sort dropdown
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Active filter tags
  const filterTags = useMemo(() => {
    const tags: { label: string; remove: () => void }[] = []
    filters.segment.forEach(s => tags.push({ label: `${segmentIcon(s)} ${s}`, remove: () => toggleSegment(s) }))
    filters.fuelType.forEach(f => tags.push({ label: f, remove: () => toggleFuel(f) }))
    filters.transmission.forEach(t => tags.push({ label: t, remove: () => toggleTransmission(t) }))
    filters.brands.forEach(b => tags.push({ label: b, remove: () => toggleBrand(b) }))
    filters.seating.forEach(s => tags.push({ label: `${s} Seats`, remove: () => toggleSeating(s) }))
    if (filters.priceMin > 0 || filters.priceMax < 100)
      tags.push({ label: `₹${filters.priceMin}L–₹${filters.priceMax}L`, remove: () => setPriceRange(0, 100) })
    if (filters.search)
      tags.push({ label: `"${filters.search}"`, remove: () => setSearch('') })
    return tags
  }, [filters, toggleSegment, toggleFuel, toggleTransmission, toggleBrand, toggleSeating, setPriceRange, setSearch])

  // ── Sidebar content (shared between mobile/desktop) ──────────────────────
  const SidebarContent = () => (
    <div className="space-y-5">

      {/* Reset */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-text-primary">Filters</h2>
        {activeFilterCount > 0 && (
          <button onClick={resetFilters}
            className="text-xs text-accent hover:text-accent/80 font-semibold flex items-center gap-1">
            <X className="w-3 h-3" /> Clear All ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <PriceRangeSlider
          min={filters.priceMin} max={filters.priceMax}
          onMin={v => setPriceRange(v, filters.priceMax)}
          onMax={v => setPriceRange(filters.priceMin, v)}
        />
      </FilterSection>

      {/* Body Type */}
      <FilterSection title="Body Type">
        <div className="flex flex-wrap gap-1.5">
          {SEGMENTS.map(s => (
            <button key={s} id={`filter-segment-${s.toLowerCase().replace(' ', '-')}`}
              onClick={() => toggleSegment(s)}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-150',
                filters.segment.includes(s)
                  ? 'bg-accent text-primary border-accent'
                  : 'border-border/60 text-text-muted hover:border-accent/40 hover:text-text-primary'
              )}>
              {segmentIcon(s)} {s}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Fuel Type */}
      <FilterSection title="Fuel Type">
        <div className="space-y-1.5">
          {FUEL_TYPES.map(f => (
            <label key={f} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" id={`filter-fuel-${f.toLowerCase()}`}
                checked={filters.fuelType.includes(f)}
                onChange={() => toggleFuel(f)}
                className="w-3.5 h-3.5 rounded accent-[#00D4FF]" />
              <span className={clsx(
                'text-xs px-2 py-0.5 rounded-full border font-semibold',
                filters.fuelType.includes(f) ? fuelBadgeColor(f) : 'text-text-muted border-transparent'
              )}>
                {f === 'Electric' ? '⚡' : f === 'Diesel' ? '🛢️' : f === 'Hybrid' ? '🌿' : '⛽'} {f}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Transmission */}
      <FilterSection title="Transmission">
        <div className="flex flex-wrap gap-1.5">
          {TRANSMISSIONS.map(t => (
            <button key={t} id={`filter-trans-${t.toLowerCase()}`}
              onClick={() => toggleTransmission(t)}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-150',
                filters.transmission.includes(t)
                  ? 'bg-accent text-primary border-accent'
                  : 'border-border/60 text-text-muted hover:border-accent/40 hover:text-text-primary'
              )}>
              {t}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Seating */}
      <FilterSection title="Seating Capacity">
        <div className="flex gap-2">
          {SEATING_OPTS.map(n => (
            <button key={n} id={`filter-seats-${n}`}
              onClick={() => toggleSeating(n)}
              className={clsx(
                'flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150',
                filters.seating.includes(n)
                  ? 'bg-accent text-primary border-accent'
                  : 'border-border/60 text-text-muted hover:border-accent/40'
              )}>
              {n}👤
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Brand" defaultOpen={false}>
        <div className="max-h-44 overflow-y-auto no-scrollbar space-y-1 pr-1">
          {brands.map(b => (
            <label key={b} className="flex items-center gap-2 cursor-pointer group py-0.5">
              <input type="checkbox" id={`filter-brand-${b.toLowerCase().replace(' ', '-')}`}
                checked={filters.brands.includes(b)}
                onChange={() => toggleBrand(b)}
                className="w-3.5 h-3.5 rounded accent-[#00D4FF]" />
              <span className={clsx(
                'text-xs transition-colors',
                filters.brands.includes(b) ? 'text-accent font-semibold' : 'text-text-muted group-hover:text-text-primary'
              )}>
                {b}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  )

  return (
    <div className="page-enter min-h-screen">
      <div className="section-wrapper py-8">

        {/* ── Top bar ────────────────────────────────────────────── */}
        <div className="mb-6">
          <span className="section-tag mb-3"><Star className="w-3.5 h-3.5" /> Database</span>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-display-md">Car Database</h1>
              <p className="text-text-muted mt-0.5">
                <span className="text-accent font-bold">{results.length}</span> cars found
              </p>
            </div>
          </div>
        </div>

        {/* ── Search + controls ──────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 items-center mb-5">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              id="db-search"
              type="text"
              placeholder="Search brand, model…"
              value={filters.search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 pr-9 h-10 text-sm"
            />
            {filters.search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile filter button */}
          <button id="open-filters-btn" onClick={() => setSidebarOpen(true)}
            className="lg:hidden btn btn-secondary btn-sm gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFilterCount > 0 && <span className="badge-accent">{activeFilterCount}</span>}
          </button>

          {/* Sort dropdown */}
          <div ref={sortRef} className="relative ml-auto">
            <button id="sort-btn" onClick={() => setSortOpen(o => !o)}
              className="btn btn-secondary btn-sm gap-2 min-w-[160px] justify-between">
              <ArrowUpDown className="w-4 h-4 shrink-0" />
              <span className="text-xs">{SORT_OPTIONS.find(o => o.value === filters.sortBy)?.label ?? 'Sort'}</span>
              <ChevronDown className={clsx('w-3.5 h-3.5 shrink-0 transition-transform', sortOpen && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-1.5 w-48 glass-strong rounded-xl border border-border/60
                             shadow-card z-40 overflow-hidden py-1"
                >
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.value} id={`sort-${opt.value}`}
                      onClick={() => { setSortBy(opt.value as any); setSortOpen(false) }}
                      className={clsx(
                        'w-full text-left px-4 py-2 text-xs font-semibold transition-colors',
                        filters.sortBy === opt.value
                          ? 'bg-accent/15 text-accent'
                          : 'text-text-secondary hover:bg-surface/50 hover:text-text-primary'
                      )}>
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Grid toggle */}
          <div className="hidden sm:flex items-center gap-1 glass rounded-lg p-1">
            {([2, 3] as const).map(n => (
              <button key={n} id={`grid-cols-${n}`} onClick={() => setGridCols(n)}
                className={clsx('w-7 h-7 rounded flex items-center justify-center transition-all',
                  gridCols === n ? 'bg-accent text-primary' : 'text-text-muted hover:text-text-primary')}>
                {n === 2 ? <LayoutGrid className="w-3.5 h-3.5" /> : <GridIcon className="w-3.5 h-3.5" />}
              </button>
            ))}
            <button id="grid-list" onClick={() => setGridCols('list')}
              className={clsx('w-7 h-7 rounded flex items-center justify-center transition-all',
                gridCols === 'list' ? 'bg-accent text-primary' : 'text-text-muted hover:text-text-primary')}>
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Active filter tags ─────────────────────────────────── */}
        <AnimatePresence>
          {filterTags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mb-5"
              id="active-filters"
            >
              {filterTags.map(tag => (
                <FilterChip key={tag.label} label={tag.label} onRemove={tag.remove} />
              ))}
              {filterTags.length > 1 && (
                <button onClick={resetFilters}
                  className="text-xs text-text-dim hover:text-danger font-semibold px-2 py-1 transition-colors">
                  Clear All
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Layout: sidebar + grid ─────────────────────────────── */}
        <div className="flex gap-6">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 xl:w-64 shrink-0">
            <div className="glass rounded-2xl p-5 sticky top-24 space-y-5">
              <SidebarContent />
            </div>
          </aside>

          {/* Car Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <CarCardSkeletonGrid count={PAGE_SIZE} cols={gridCols === 'list' ? 3 : gridCols} />
            ) : results.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-24 glass rounded-2xl"
              >
                <Fuel className="w-12 h-12 text-text-dim mx-auto mb-4" />
                <h3 className="text-display-xs mb-2">No cars match your filters</h3>
                <p className="text-text-muted mb-6">Try removing some filters or searching differently.</p>
                <button onClick={resetFilters} className="btn btn-primary btn-md">
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  key={JSON.stringify(filters)}
                  className={clsx('gap-4', {
                    'grid grid-cols-1 sm:grid-cols-2': gridCols === 2,
                    'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3': gridCols === 3,
                    'flex flex-col': gridCols === 'list',
                  })}
                >
                  <AnimatePresence mode="popLayout">
                    {paged.map(car => (
                      <motion.div
                        key={car.id}
                        variants={fadeUp}
                        layout
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        {gridCols === 'list'
                          ? <ListCard car={car} onCompare={addToCompare} isInCompare={isInCompare(car.id)} canAddMore={canAddMore} />
                          : <CarCard car={car} onCompare={addToCompare} isInCompare={isInCompare(car.id)} canAddMore={canAddMore} />
                        }
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Load More / Pagination */}
                {page < totalPages && (
                  <div className="mt-10 text-center">
                    <p className="text-sm text-text-muted mb-4">
                      Showing <span className="text-text-primary font-semibold">{paged.length}</span> of{' '}
                      <span className="text-accent font-bold">{results.length}</span> cars
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                          <button
                            key={p}
                            id={`page-${p}`}
                            onClick={() => setPage(p)}
                            className={clsx(
                              'w-8 h-8 rounded-lg text-xs font-bold transition-all',
                              p <= page
                                ? 'bg-accent text-primary'
                                : 'glass text-text-muted hover:text-accent'
                            )}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <button
                        id="load-more-btn"
                        onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                        className="btn btn-secondary btn-sm"
                      >
                        Load More ({results.length - paged.length} remaining)
                      </button>
                    </div>
                  </div>
                )}

                {page >= totalPages && results.length > PAGE_SIZE && (
                  <p className="text-center text-xs text-text-dim mt-8">
                    All {results.length} cars loaded ✓
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Sidebar Drawer ────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 glass-strong border-r border-border/50
                         overflow-y-auto no-scrollbar p-5"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-text-primary">Filters</h2>
                <button onClick={() => setSidebarOpen(false)} className="btn btn-ghost btn-sm p-1.5">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SidebarContent />
              <div className="pt-5 border-t border-border/40 mt-5">
                <button onClick={() => setSidebarOpen(false)} className="btn btn-primary w-full btn-md">
                  Show {results.length} Cars
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── List View Card ─────────────────────────────────────────────────────────
interface ListCardProps {
  car: Car
  onCompare: (car: Car) => void
  isInCompare: boolean
  canAddMore: boolean
}

function ListCard({ car, onCompare, isInCompare, canAddMore }: ListCardProps) {
  return (
    <div className="glass rounded-xl border border-border/50 hover:border-accent/30 transition-all
                    flex items-center gap-0 overflow-hidden group">
      {/* Image */}
      <div className="w-44 h-28 shrink-0 overflow-hidden">
        <img src={car.images[0]} alt={car.model}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/176x112/0D1B2A/00D4FF?text=${car.brand}` }} />
      </div>
      {/* Body */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <p className="text-[10px] text-accent font-bold uppercase tracking-widest">{car.brand}</p>
        <h3 className="text-base font-black text-text-primary truncate">{car.model} <span className="text-text-muted text-xs font-normal">{car.variant}</span></h3>
        <div className="flex gap-2 mt-1.5 flex-wrap">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${fuelBadgeColor(car.fuelType)}`}>{car.fuelType}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-border/50 text-text-muted">{car.segment}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-border/50 text-text-muted">{car.transmission}</span>
        </div>
        <div className="flex gap-4 mt-2 text-xs text-text-muted">
          <span>⚡ {car.engine.power}</span>
          <span>⛽ {car.mileage}</span>
          <span>👤 {car.seating} seats</span>
        </div>
      </div>
      {/* Right */}
      <div className="shrink-0 px-4 py-3 text-right flex flex-col items-end gap-2">
        <p className="text-lg font-black text-text-primary">₹{car.price}L</p>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-warning" />
          <span className="text-xs font-bold text-warning">{car.rating}</span>
          <span className="text-[10px] text-text-dim">({car.reviewCount.toLocaleString()})</span>
        </div>
        <div className="flex gap-2 mt-1">
          <button onClick={() => onCompare(car)}
            className={clsx('btn btn-ghost btn-sm text-xs py-1 px-2.5',
              isInCompare ? 'text-accent border-accent/40' : 'text-text-muted',
              !canAddMore && !isInCompare && 'opacity-40 cursor-not-allowed')}>
            {isInCompare ? '✓ Added' : '+ Compare'}
          </button>
          <Link to={`/cars/${car.id}`} className="btn btn-primary btn-sm text-xs py-1 px-3 no-underline">
            Details
          </Link>
        </div>
      </div>
    </div>
  )
}
