/**
 * FinancialDashboard — Car Financial Hub
 *
 * Route: /finance
 *
 * Features:
 *  1. Budget input → affordable car grid
 *  2. Side-by-side EMI comparison (up to 3 cars)
 *  3. 5-year cost race animated bar chart
 *  4. "Best value for money" AI badge
 *  5. Resale value timeline chart
 *  6. Monthly budget breakdown donut chart
 */
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  IndianRupee, Wallet, Star, TrendingDown, Trophy,
  Sparkles, ChevronDown,
  BarChart3, PieChart as PieChartIcon,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
  Area, AreaChart,
} from 'recharts'
import { cars } from '../data/cars'
import { calculateEMI } from '../utils/formatters'
import clsx from 'clsx'
import type { Car as CarType } from '../types/car.types'

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS & TYPES
// ═══════════════════════════════════════════════════════════════════════════
type DashTab = 'budget' | 'emi' | 'cost-race' | 'resale' | 'breakdown'

const TAB_DEFS: { id: DashTab; label: string; icon: React.ElementType }[] = [
  { id: 'budget',    label: 'Budget Finder',    icon: Wallet },
  { id: 'emi',       label: 'EMI Compare',      icon: IndianRupee },
  { id: 'cost-race', label: '5-Year Cost Race', icon: BarChart3 },
  { id: 'resale',    label: 'Resale Value',     icon: TrendingDown },
  { id: 'breakdown', label: 'Budget Breakdown', icon: PieChartIcon },
]

// Cost config per fuel type
const FUEL_PRICES: Record<string, number> = { Petrol: 104, Diesel: 91, Electric: 8, CNG: 90, Hybrid: 97 }
const INSURANCE_RATES = [0.035, 0.028, 0.022, 0.018, 0.015]
const DEPR_RATES = [0.20, 0.15, 0.12, 0.10, 0.08]
const MAINTENANCE_ANNUAL = (p: number) => p < 10 ? 14000 : p < 20 ? 20000 : p < 40 ? 28000 : 38000

// 3-car compare slot colours
const SLOT_COLORS = ['#00D4FF', '#FF6B35', '#00E676']
const SLOT_LABELS = ['Car A', 'Car B', 'Car C']

// Extract numeric mileage from string
function parseMileage(car: CarType): number {
  if (car.isEV) {
    const match = car.mileage.match(/(\d+)/)
    return match ? Number(match[1]) / 40 : 6 // rough km/kWh
  }
  const m = car.mileage.match(/([\d.]+)/)
  return m ? Number(m[1]) : 15
}

// Get fuel price for car
function getFuelPrice(car: CarType): number {
  return FUEL_PRICES[car.fuelType] || 104
}

// Compute 5-year yearly costs for a car
function computeCosts(car: CarType, kmPerMonth: number, downPct: number, rate: number, tenure: number) {
  const priceRs = car.price * 100_000
  const loanAmt = priceRs * (1 - downPct / 100)
  const emi = calculateEMI(loanAmt, rate, tenure)
  const annualEMI = emi * 12
  const mileage = parseMileage(car)
  const fuelPrice = getFuelPrice(car)
  const kmPerYear = kmPerMonth * 12
  const annualFuel = car.isEV
    ? (kmPerYear / mileage) * fuelPrice
    : (kmPerYear / mileage) * fuelPrice
  const maint = MAINTENANCE_ANNUAL(car.price) * (car.isEV ? 0.55 : 1)
  let remaining = priceRs
  const yearly = []
  for (let yr = 0; yr < 5; yr++) {
    const yrEMI = yr < tenure / 12 ? annualEMI : 0
    const yrInsurance = priceRs * INSURANCE_RATES[yr]
    const yrMaint = maint * (1 + yr * 0.08)
    const deprAmt = remaining * DEPR_RATES[yr]
    remaining -= deprAmt
    yearly.push({
      year: `Year ${yr + 1}`,
      emi: Math.round(yrEMI),
      fuel: Math.round(annualFuel),
      insurance: Math.round(yrInsurance),
      maintenance: Math.round(yrMaint),
      depreciation: Math.round(deprAmt),
      resaleValue: Math.round(remaining),
    })
  }
  const total = yearly.reduce((s, y) => s + y.emi + y.fuel + y.insurance + y.maintenance + y.depreciation, 0)
  return { yearly, total, emi: Math.round(emi), resaleValue: Math.round(remaining), totalKm: kmPerYear * 5 }
}

// Value-for-money score
function valueScore(car: CarType): number {
  const mileage = parseMileage(car)
  const featureCount = car.features.length
  const safetyScore = car.safety.globalNcap * 8 + car.safety.airbagsCount * 3
  const ratingScore = car.rating * 10
  const mileageScore = Math.min(mileage * 2.5, 60)
  const priceEfficiency = Math.max(0, 50 - car.price * 0.8)
  return Math.round(ratingScore + mileageScore + safetyScore + featureCount * 1.5 + priceEfficiency)
}

// ─── Shared slider ─────────────────────────────────────────────────────────────
function Slider({
  id, label, min, max, step, value, onChange, suffix = '', color = '#00D4FF',
}: {
  id: string; label: string; min: number; max: number; step: number
  value: number; onChange: (v: number) => void; suffix?: string; color?: string
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label htmlFor={id} className="text-sm font-semibold text-text-secondary">{label}</label>
        <span className="text-sm font-black font-mono" style={{ color }}>{value}{suffix}</span>
      </div>
      <input
        id={id} type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[#00D4FF] h-1.5 rounded-full cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-text-dim mt-0.5">
        <span>{min}{suffix}</span><span>{max}{suffix}</span>
      </div>
    </div>
  )
}

// ─── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = 'text-accent', icon: Icon }: {
  label: string; value: string; sub?: string; color?: string; icon?: React.ElementType
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4 flex flex-col gap-1"
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-text-dim">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </div>
      <p className={`text-xl font-black font-mono ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-text-muted">{sub}</p>}
    </motion.div>
  )
}

// ─── Car select dropdown ───────────────────────────────────────────────────────
function CarSelect({
  value, onChange, color = '#00D4FF', label, exclude = [],
}: {
  value: string; onChange: (id: string) => void; color?: string; label: string; exclude?: string[]
}) {
  const available = cars.filter(c => !exclude.includes(c.id))
  return (
    <div className="relative">
      <label className="text-[10px] uppercase tracking-widest text-text-dim mb-1 block font-bold" style={{ color }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none w-full bg-surface/50 border border-border/40 rounded-xl px-4 py-2.5 pr-8
          text-sm text-text-primary outline-none focus:border-accent/60 transition-colors cursor-pointer"
      >
        <option value="">Select a car…</option>
        {available.map(c => (
          <option key={c.id} value={c.id}>
            {c.brand} {c.model} — ₹{c.price}L
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 bottom-3 w-3.5 h-3.5 text-text-dim pointer-events-none" />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. BUDGET FINDER
// ═══════════════════════════════════════════════════════════════════════════
function BudgetFinder() {
  const [budget, setBudget] = useState(15) // lakhs
  const [maxEmi, setMaxEmi] = useState(25000)
  const [downPct, setDownPct] = useState(20)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(60)
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'value'>('value')

  const affordableCars = useMemo(() => {
    return cars
      .filter(c => c.price <= budget)
      .filter(c => {
        const loan = c.price * 100_000 * (1 - downPct / 100)
        const emi = calculateEMI(loan, rate, tenure)
        return emi <= maxEmi
      })
      .map(c => {
        const loan = c.price * 100_000 * (1 - downPct / 100)
        const emi = calculateEMI(loan, rate, tenure)
        const vs = valueScore(c)
        return { ...c, emi: Math.round(emi), valueScore: vs }
      })
      .sort((a, b) =>
        sortBy === 'price' ? a.price - b.price :
        sortBy === 'rating' ? b.rating - a.rating :
        b.valueScore - a.valueScore
      )
  }, [budget, maxEmi, downPct, rate, tenure, sortBy])

  const bestValue = affordableCars[0]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-display-xs mb-1">Budget Car Finder</h2>
        <p className="text-text-muted text-sm">Input your budget and we'll show all cars you can afford</p>
      </div>

      {/* Config */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-5 space-y-4 border border-accent/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-accent" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-accent">Your Budget</p>
          </div>
          <Slider id="budget-max" label="Max Car Price" min={3} max={80} step={0.5}
            value={budget} onChange={setBudget} suffix="L" />
          <Slider id="budget-emi" label="Max Monthly EMI" min={5000} max={80000} step={1000}
            value={maxEmi} onChange={setMaxEmi} suffix="" />
        </div>
        <div className="glass rounded-2xl p-5 space-y-4 border border-border/30">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Loan Parameters</p>
          <Slider id="budget-down" label="Down Payment" min={0} max={100} step={5}
            value={downPct} onChange={setDownPct} suffix="%" />
          <Slider id="budget-rate" label="Interest Rate" min={5} max={15} step={0.25}
            value={rate} onChange={setRate} suffix="%" />
          <Slider id="budget-tenure" label="Tenure" min={12} max={84} step={6}
            value={tenure} onChange={setTenure} suffix=" mo" />
        </div>
      </div>

      {/* Results header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-muted">
          Found <span className="text-accent font-bold">{affordableCars.length}</span> cars within your budget
        </p>
        <div className="flex gap-2">
          {(['value', 'price', 'rating'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={clsx('px-3 py-1 rounded-lg text-xs font-bold border transition-all',
                sortBy === s ? 'bg-accent/15 border-accent text-accent' : 'border-border/40 text-text-muted'
              )}>
              {s === 'value' ? '💎 Best Value' : s === 'price' ? '💰 Price' : '⭐ Rating'}
            </button>
          ))}
        </div>
      </div>

      {/* Car grid */}
      {affordableCars.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {affordableCars.map((car, i) => (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={`/cars/${car.id}`} className="block no-underline group">
                <div className={clsx(
                  'glass rounded-xl overflow-hidden border transition-all duration-300',
                  bestValue?.id === car.id && sortBy === 'value'
                    ? 'border-warning/50 ring-1 ring-warning/20'
                    : 'border-border/30 hover:border-accent/30'
                )}>
                  {/* Badge */}
                  {bestValue?.id === car.id && sortBy === 'value' && (
                    <div className="bg-gradient-to-r from-warning/90 to-warm/90 px-3 py-1.5 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Best Value for Money</span>
                      <Sparkles className="w-3 h-3 text-primary ml-auto" />
                    </div>
                  )}
                  <div className="aspect-video overflow-hidden bg-secondary">
                    <img src={car.images[0]} alt={car.model}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          `https://via.placeholder.com/300x170/0D1B2A/00D4FF?text=${encodeURIComponent(car.brand)}`
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-accent font-bold uppercase tracking-widest">{car.brand}</p>
                    <h4 className="text-sm font-black text-text-primary truncate">{car.model}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-black text-text-primary">₹{car.price}L</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-warning fill-warning" />
                        <span className="text-xs font-bold text-warning">{car.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                      <span className="text-xs text-text-dim">
                        EMI: <span className="font-bold text-accent">₹{car.emi.toLocaleString('en-IN')}</span>/mo
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-bold">
                        Score: {car.valueScore}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <Wallet className="w-10 h-10 text-accent/20 mx-auto mb-3" />
          <p className="text-text-muted">No cars found within this budget range</p>
          <p className="text-xs text-text-dim mt-1">Try increasing your budget or EMI limit</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. EMI COMPARISON (3 cars side-by-side)
// ═══════════════════════════════════════════════════════════════════════════
function EMICompare() {
  const [carIds, setCarIds] = useState<string[]>(['', '', ''])
  const [downPct, setDownPct] = useState(20)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(60)

  const selectedCars = carIds.map(id => cars.find(c => c.id === id)).filter(Boolean) as CarType[]

  const emiData = useMemo(() => {
    return selectedCars.map(car => {
      const priceRs = car.price * 100_000
      const loan = priceRs * (1 - downPct / 100)
      const emi = calculateEMI(loan, rate, tenure)
      const totalPaid = emi * tenure
      const interest = totalPaid - loan
      return {
        car,
        emi: Math.round(emi),
        loan: Math.round(loan),
        totalPaid: Math.round(totalPaid),
        interest: Math.round(interest),
        downPayment: Math.round(priceRs * downPct / 100),
      }
    })
  }, [selectedCars, downPct, rate, tenure])

  const updateCarId = (idx: number, id: string) => {
    const next = [...carIds]
    next[idx] = id
    setCarIds(next)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-display-xs mb-1">EMI Comparison</h2>
        <p className="text-text-muted text-sm">Compare monthly EMIs for up to 3 cars side-by-side</p>
      </div>

      {/* Car selectors */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <CarSelect
            key={i}
            value={carIds[i]}
            onChange={id => updateCarId(i, id)}
            color={SLOT_COLORS[i]}
            label={SLOT_LABELS[i]}
            exclude={carIds.filter((_, j) => j !== i && carIds[j])}
          />
        ))}
      </div>

      {/* Loan params */}
      <div className="glass rounded-2xl p-5 grid sm:grid-cols-3 gap-4">
        <Slider id="emi-down" label="Down Payment" min={0} max={100} step={5}
          value={downPct} onChange={setDownPct} suffix="%" />
        <Slider id="emi-rate" label="Interest Rate" min={5} max={15} step={0.25}
          value={rate} onChange={setRate} suffix="%" />
        <Slider id="emi-tenure" label="Loan Tenure" min={12} max={84} step={6}
          value={tenure} onChange={setTenure} suffix=" mo" />
      </div>

      {/* EMI cards */}
      {emiData.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-4">
          {emiData.map((d, i) => (
            <motion.div
              key={d.car.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-5 border-2 space-y-4"
              style={{ borderColor: `${SLOT_COLORS[i]}30` }}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-9 rounded-lg overflow-hidden bg-secondary shrink-0">
                  <img src={d.car.images[0]} alt={d.car.model} className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).src = `https://via.placeholder.com/48x36/0D1B2A/00D4FF?text=${d.car.brand[0]}`
                    }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: SLOT_COLORS[i] }}>
                    {d.car.brand}
                  </p>
                  <p className="text-sm font-black text-text-primary truncate">{d.car.model}</p>
                </div>
              </div>

              {/* EMI big number */}
              <div className="text-center py-3 rounded-xl" style={{ background: `${SLOT_COLORS[i]}08` }}>
                <p className="text-[10px] text-text-dim uppercase tracking-widest">Monthly EMI</p>
                <p className="text-3xl font-black font-mono" style={{ color: SLOT_COLORS[i] }}>
                  ₹{d.emi.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs">
                {[
                  { l: 'Ex-Showroom', v: `₹${(d.car.price).toFixed(2)}L` },
                  { l: 'Down Payment', v: `₹${(d.downPayment / 100000).toFixed(2)}L` },
                  { l: 'Loan Amount', v: `₹${(d.loan / 100000).toFixed(2)}L` },
                  { l: 'Total Interest', v: `₹${(d.interest / 100000).toFixed(2)}L` },
                  { l: 'Total Payable', v: `₹${(d.totalPaid / 100000).toFixed(2)}L` },
                ].map(r => (
                  <div key={r.l} className="flex justify-between items-center py-1 border-b border-border/20 last:border-0">
                    <span className="text-text-muted">{r.l}</span>
                    <span className="font-bold text-text-primary font-mono">{r.v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Visual comparison bar */}
      {emiData.length >= 2 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold text-text-primary mb-5 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-accent" /> EMI Visual Comparison
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={emiData.map((d, i) => ({
              name: `${d.car.brand} ${d.car.model}`,
              EMI: d.emi,
              fill: SLOT_COLORS[i],
            }))} barSize={60}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.4)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8B9EC7' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `₹${(Number(v) / 1000).toFixed(0)}k`}
                tick={{ fontSize: 10, fill: '#8B9EC7' }} axisLine={false} tickLine={false} width={55} />
              <Tooltip
                formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}/mo`, ''] as [string, string]}
                contentStyle={{
                  background: 'rgba(13,27,42,0.97)', border: '1px solid rgba(30,58,95,0.8)',
                  borderRadius: '12px', fontSize: '12px', color: '#F0F4FF',
                }}
              />
              <Bar dataKey="EMI" radius={[8, 8, 0, 0]}>
                {emiData.map((_, i) => (
                  <Cell key={i} fill={SLOT_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. 5-YEAR COST RACE CHART
// ═══════════════════════════════════════════════════════════════════════════
function CostRace() {
  const [carIds, setCarIds] = useState<string[]>(['', '', ''])
  const [kmPerMonth, setKmPerMonth] = useState(1200)
  const [downPct, setDownPct] = useState(20)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(60)
  const [animKey, setAnimKey] = useState(0)

  const selectedCars = carIds.map(id => cars.find(c => c.id === id)).filter(Boolean) as CarType[]

  const raceData = useMemo(() => {
    if (selectedCars.length === 0) return { chartData: [], costDetails: [] }

    const costDetails = selectedCars.map(car => computeCosts(car, kmPerMonth, downPct, rate, tenure))

    // Build cumulative cost data per year
    const chartData = Array.from({ length: 5 }, (_, yr) => {
      const row: Record<string, string | number> = { year: `Year ${yr + 1}` }
      selectedCars.forEach((car, i) => {
        const cumulative = costDetails[i].yearly.slice(0, yr + 1)
          .reduce((s, y) => s + y.emi + y.fuel + y.insurance + y.maintenance + y.depreciation, 0)
        row[`${car.brand} ${car.model}`] = Math.round(cumulative)
      })
      return row
    })

    return { chartData, costDetails }
  }, [selectedCars, kmPerMonth, downPct, rate, tenure])

  // Find cheapest car
  const cheapestIdx = useMemo(() => {
    if (raceData.costDetails.length === 0) return -1
    let min = Infinity, idx = 0
    raceData.costDetails.forEach((d, i) => { if (d.total < min) { min = d.total; idx = i } })
    return idx
  }, [raceData])

  // Determine best value
  const bestValueIdx = useMemo(() => {
    if (selectedCars.length === 0) return -1
    let bestScore = -1, idx = 0
    selectedCars.forEach((car, i) => {
      const vs = valueScore(car)
      const costEfficiency = 100 - (raceData.costDetails[i]?.total || 0) / 100000
      const combined = vs + costEfficiency
      if (combined > bestScore) { bestScore = combined; idx = i }
    })
    return idx
  }, [selectedCars, raceData])

  const triggerAnimation = () => setAnimKey(k => k + 1)

  const updateCarId = (idx: number, id: string) => {
    const next = [...carIds]
    next[idx] = id
    setCarIds(next)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-display-xs mb-1">5-Year Cost Race</h2>
        <p className="text-text-muted text-sm">See which car costs less to own over 5 years — animated cumulative cost comparison</p>
      </div>

      {/* Car selectors */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <CarSelect key={i} value={carIds[i]} onChange={id => updateCarId(i, id)}
            color={SLOT_COLORS[i]} label={SLOT_LABELS[i]}
            exclude={carIds.filter((_, j) => j !== i && carIds[j])} />
        ))}
      </div>

      {/* Config */}
      <div className="glass rounded-2xl p-5 grid sm:grid-cols-4 gap-4">
        <Slider id="race-km" label="Monthly Driving" min={500} max={5000} step={100}
          value={kmPerMonth} onChange={setKmPerMonth} suffix=" km" />
        <Slider id="race-down" label="Down Payment" min={0} max={100} step={5}
          value={downPct} onChange={setDownPct} suffix="%" />
        <Slider id="race-rate" label="Interest Rate" min={5} max={15} step={0.25}
          value={rate} onChange={setRate} suffix="%" />
        <Slider id="race-tenure" label="Loan Tenure" min={12} max={84} step={6}
          value={tenure} onChange={setTenure} suffix=" mo" />
      </div>

      {selectedCars.length >= 2 && (
        <>
          {/* AI Value Badge */}
          {bestValueIdx >= 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-5 border-2 border-warning/30 flex flex-wrap items-center gap-4"
              style={{ background: 'rgba(255,179,0,0.04)' }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning to-warm flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Sparkles className="w-4 h-4 text-warning" />
                  <p className="text-xs font-black uppercase tracking-widest text-warning">AI Best Value for Money</p>
                </div>
                <p className="text-lg font-black text-text-primary">
                  {selectedCars[bestValueIdx].brand} {selectedCars[bestValueIdx].model}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Best combination of running cost, features, safety, and rating among selected cars
                </p>
              </div>
              <div className="shrink-0 text-center">
                <p className="text-3xl font-black text-warning font-mono">{valueScore(selectedCars[bestValueIdx])}</p>
                <p className="text-[10px] text-text-dim uppercase">Value Score</p>
              </div>
            </motion.div>
          )}

          {/* Race chart */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-text-primary flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent" /> Cumulative Ownership Cost
              </h3>
              <button onClick={triggerAnimation}
                className="btn btn-ghost btn-sm text-xs gap-1">
                ▶ Replay
              </button>
            </div>
            <ResponsiveContainer width="100%" height={340} key={animKey}>
              <BarChart data={raceData.chartData} barGap={6} barSize={selectedCars.length <= 2 ? 36 : 26}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.4)" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#8B9EC7' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={v => `₹${(Number(v) / 100000).toFixed(1)}L`}
                  tick={{ fontSize: 10, fill: '#8B9EC7' }} axisLine={false} tickLine={false} width={60}
                />
                <Tooltip
                  formatter={(v) => [`₹${(Number(v) / 100000).toFixed(2)}L`, ''] as [string, string]}
                  contentStyle={{
                    background: 'rgba(13,27,42,0.97)', border: '1px solid rgba(30,58,95,0.8)',
                    borderRadius: '12px', fontSize: '12px', color: '#F0F4FF',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#8B9EC7' }} />
                {selectedCars.map((car, i) => (
                  <Bar key={car.id} dataKey={`${car.brand} ${car.model}`} fill={SLOT_COLORS[i]}
                    radius={[6, 6, 0, 0]} animationDuration={1200} animationBegin={i * 200} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {selectedCars.map((car, i) => (
              <div key={car.id} className="glass rounded-xl p-4 border" style={{ borderColor: `${SLOT_COLORS[i]}30` }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: SLOT_COLORS[i] }} />
                  <p className="text-sm font-black text-text-primary truncate">{car.brand} {car.model}</p>
                  {i === cheapestIdx && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-success/15 text-success text-[10px] font-bold">Cheapest</span>
                  )}
                </div>
                <p className="text-2xl font-black font-mono" style={{ color: SLOT_COLORS[i] }}>
                  ₹{(raceData.costDetails[i].total / 100000).toFixed(2)}L
                </p>
                <p className="text-xs text-text-dim">Total 5-year cost · ₹{raceData.costDetails[i].emi.toLocaleString('en-IN')}/mo EMI</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. RESALE VALUE TIMELINE
// ═══════════════════════════════════════════════════════════════════════════
function ResaleTimeline() {
  const [carIds, setCarIds] = useState<string[]>(['', '', ''])

  const selectedCars = carIds.map(id => cars.find(c => c.id === id)).filter(Boolean) as CarType[]

  const timelineData = useMemo(() => {
    if (selectedCars.length === 0) return []
    return Array.from({ length: 6 }, (_, yr) => {
      const row: Record<string, string | number> = { year: yr === 0 ? 'New' : `Year ${yr}` }
      selectedCars.forEach((car) => {
        let val = car.price * 100_000
        for (let y = 0; y < yr; y++) val *= (1 - DEPR_RATES[Math.min(y, 4)])
        row[`${car.brand} ${car.model}`] = Math.round(val)
      })
      return row
    })
  }, [selectedCars])

  const updateCarId = (idx: number, id: string) => {
    const next = [...carIds]
    next[idx] = id
    setCarIds(next)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-display-xs mb-1">Resale Value Timeline</h2>
        <p className="text-text-muted text-sm">Compare how different cars depreciate over 5 years</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <CarSelect key={i} value={carIds[i]} onChange={id => updateCarId(i, id)}
            color={SLOT_COLORS[i]} label={SLOT_LABELS[i]}
            exclude={carIds.filter((_, j) => j !== i && carIds[j])} />
        ))}
      </div>

      {selectedCars.length >= 1 && (
        <>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold text-text-primary mb-5 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-accent" /> Depreciation Curve
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={timelineData}>
                <defs>
                  {selectedCars.map((_, i) => (
                    <linearGradient key={i} id={`resale-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SLOT_COLORS[i]} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={SLOT_COLORS[i]} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.4)" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#8B9EC7' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `₹${(Number(v) / 100000).toFixed(0)}L`}
                  tick={{ fontSize: 10, fill: '#8B9EC7' }} axisLine={false} tickLine={false} width={55} />
                <Tooltip
                  formatter={(v) => [`₹${(Number(v) / 100000).toFixed(2)}L`, ''] as [string, string]}
                  contentStyle={{
                    background: 'rgba(13,27,42,0.97)', border: '1px solid rgba(30,58,95,0.8)',
                    borderRadius: '12px', fontSize: '12px', color: '#F0F4FF',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#8B9EC7' }} />
                {selectedCars.map((car, i) => (
                  <Area key={car.id} type="monotone" dataKey={`${car.brand} ${car.model}`}
                    stroke={SLOT_COLORS[i]} fill={`url(#resale-grad-${i})`}
                    strokeWidth={2.5} dot={{ r: 4, fill: SLOT_COLORS[i] }}
                    animationDuration={1200} animationBegin={i * 200} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Resale summary */}
          <div className="grid sm:grid-cols-3 gap-4">
            {selectedCars.map((car, i) => {
              const newPrice = car.price * 100_000
              let val = newPrice
              for (let y = 0; y < 5; y++) val *= (1 - DEPR_RATES[y])
              const pctRetained = Math.round((val / newPrice) * 100)
              const lost = newPrice - val
              return (
                <div key={car.id} className="glass rounded-xl p-4 border" style={{ borderColor: `${SLOT_COLORS[i]}30` }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: SLOT_COLORS[i] }}>
                    {car.brand} {car.model}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <p className="text-[10px] text-text-dim uppercase">Resale (5yr)</p>
                      <p className="text-lg font-black font-mono" style={{ color: SLOT_COLORS[i] }}>
                        ₹{(val / 100000).toFixed(1)}L
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-dim uppercase">Value Lost</p>
                      <p className="text-lg font-black text-danger font-mono">₹{(lost / 100000).toFixed(1)}L</p>
                    </div>
                  </div>
                  {/* Retention bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-text-dim mb-1">
                      <span>Value Retained</span>
                      <span className="font-bold" style={{ color: SLOT_COLORS[i] }}>{pctRetained}%</span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: SLOT_COLORS[i] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pctRetained}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. MONTHLY BUDGET BREAKDOWN DONUT
// ═══════════════════════════════════════════════════════════════════════════
function BudgetBreakdown() {
  const [carId, setCarId] = useState('')
  const [kmPerMonth, setKmPerMonth] = useState(1200)
  const [downPct, setDownPct] = useState(20)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(60)
  const [salary, setSalary] = useState(60000)

  const car = cars.find(c => c.id === carId)

  const breakdown = useMemo(() => {
    if (!car) return null
    const costs = computeCosts(car, kmPerMonth, downPct, rate, tenure)
    const yr1 = costs.yearly[0]
    const monthlyEMI = costs.emi
    const monthlyFuel = Math.round(yr1.fuel / 12)
    const monthlyInsurance = Math.round(yr1.insurance / 12)
    const monthlyMaint = Math.round(yr1.maintenance / 12)
    const totalMonthly = monthlyEMI + monthlyFuel + monthlyInsurance + monthlyMaint
    const salaryPct = salary > 0 ? Math.round((totalMonthly / salary) * 100) : 0

    return {
      emi: monthlyEMI,
      fuel: monthlyFuel,
      insurance: monthlyInsurance,
      maintenance: monthlyMaint,
      total: totalMonthly,
      salaryPct,
      remaining: Math.max(0, salary - totalMonthly),
    }
  }, [car, kmPerMonth, downPct, rate, tenure, salary])

  const pieData = breakdown ? [
    { name: 'EMI', value: breakdown.emi, color: '#00D4FF' },
    { name: 'Fuel', value: breakdown.fuel, color: '#FFB300' },
    { name: 'Insurance', value: breakdown.insurance, color: '#FF6B35' },
    { name: 'Maintenance', value: breakdown.maintenance, color: '#00E676' },
    { name: 'Remaining', value: breakdown.remaining, color: '#2A3A5C' },
  ] : []

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-display-xs mb-1">Monthly Budget Breakdown</h2>
        <p className="text-text-muted text-sm">See how a car fits into your monthly income</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <CarSelect value={carId} onChange={setCarId} color="#00D4FF" label="Select Your Car" />
          <div className="glass rounded-2xl p-5 space-y-4 border border-accent/20">
            <Slider id="bd-salary" label="Monthly Income" min={15000} max={500000} step={5000}
              value={salary} onChange={setSalary} suffix="" />
            <Slider id="bd-km" label="Monthly Driving" min={500} max={5000} step={100}
              value={kmPerMonth} onChange={setKmPerMonth} suffix=" km" />
            <Slider id="bd-down" label="Down Payment" min={0} max={100} step={5}
              value={downPct} onChange={setDownPct} suffix="%" />
            <Slider id="bd-rate" label="Interest Rate" min={5} max={15} step={0.25}
              value={rate} onChange={setRate} suffix="%" />
            <Slider id="bd-tenure" label="Loan Tenure" min={12} max={84} step={6}
              value={tenure} onChange={setTenure} suffix=" mo" />
          </div>
        </div>

        {/* Donut + stats */}
        {breakdown && car ? (
          <div className="space-y-4">
            {/* Salary impact banner */}
            <div className={clsx(
              'glass rounded-2xl p-5 border-2 text-center',
              breakdown.salaryPct <= 30 ? 'border-success/30' :
              breakdown.salaryPct <= 50 ? 'border-warning/30' : 'border-danger/30',
            )}>
              <p className="text-xs text-text-dim uppercase tracking-widest mb-1">Total Car Cost as % of Income</p>
              <p className={clsx('text-4xl font-black font-mono',
                breakdown.salaryPct <= 30 ? 'text-success' :
                breakdown.salaryPct <= 50 ? 'text-warning' : 'text-danger'
              )}>
                {breakdown.salaryPct}%
              </p>
              <p className="text-xs text-text-muted mt-1">
                {breakdown.salaryPct <= 30 ? '✅ Comfortable — within financial advisor recommendations' :
                 breakdown.salaryPct <= 50 ? '⚠️ Manageable but tight — consider reducing loan amount' :
                 '🚨 Over budget — this car may strain your finances'}
              </p>
            </div>

            {/* Donut chart */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-accent" /> Monthly Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={70} outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                    animationDuration={1200}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, ''] as [string, string]}
                    contentStyle={{
                      background: 'rgba(13,27,42,0.97)', border: '1px solid rgba(30,58,95,0.8)',
                      borderRadius: '12px', fontSize: '12px', color: '#F0F4FF',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label via absolute */}
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {pieData.filter(d => d.name !== 'Remaining').map(d => (
                  <span key={d.name} className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}: ₹{d.value.toLocaleString('en-IN')}
                  </span>
                ))}
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={IndianRupee} label="Total Monthly" value={`₹${breakdown.total.toLocaleString('en-IN')}`}
                sub={`${car.brand} ${car.model}`} color="text-accent" />
              <StatCard icon={Wallet} label="Remaining" value={`₹${breakdown.remaining.toLocaleString('en-IN')}`}
                sub="After car expenses" color={breakdown.remaining > 0 ? 'text-success' : 'text-danger'} />
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <PieChartIcon className="w-10 h-10 text-accent/20 mx-auto mb-3" />
            <p className="text-text-muted">Select a car to see your monthly budget breakdown</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function FinancialDashboard() {
  const [activeTab, setActiveTab] = useState<DashTab>('budget')

  const renderTab = () => {
    switch (activeTab) {
      case 'budget':    return <BudgetFinder />
      case 'emi':       return <EMICompare />
      case 'cost-race': return <CostRace />
      case 'resale':    return <ResaleTimeline />
      case 'breakdown': return <BudgetBreakdown />
    }
  }

  return (
    <div className="page-enter section-wrapper py-10 pb-20">
      {/* Header */}
      <div className="mb-8">
        <span className="section-tag mb-3 inline-flex">
          <IndianRupee className="w-3.5 h-3.5" /> Financial Hub
        </span>
        <h1 className="text-display-md">
          Car <span className="gradient-text">Finance</span> Dashboard
        </h1>
        <p className="text-text-muted mt-1 max-w-2xl">
          All your car money tools in one place — EMI calculator, budget finder, 5-year cost comparison, resale projections, and monthly budget analysis.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex glass rounded-2xl p-1.5 gap-1 mb-8 overflow-x-auto no-scrollbar">
        {TAB_DEFS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center',
              activeTab === tab.id
                ? 'bg-accent text-primary shadow-glow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-surface/50',
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {renderTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
