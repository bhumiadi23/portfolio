import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wrench, Calculator, Fuel, TrendingDown, IndianRupee,
  Car, BadgePercent, Gauge
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'
import { calculateEMI, annualFuelCost, estimatedDepreciation } from '../utils/formatters'
import clsx from 'clsx'

// ─── Types & constants ────────────────────────────────────────────────────────
type Tab = 'tco' | 'emi' | 'fuel' | 'depreciation'
type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'CNG'

const FUEL_PRICE_DEFAULTS: Record<FuelType, number> = {
  Petrol:   104,
  Diesel:   91,
  Electric: 8,    // ₹/kWh effective rate
  CNG:      90,
}
const MILEAGE_DEFAULTS: Record<FuelType, number> = {
  Petrol:   16,
  Diesel:   20,
  Electric: 6.5,  // km/kWh (used as km per unit)
  CNG:      22,
}
// Maintenance cost per year (₹) by price bucket
const MAINTENANCE_ANNUAL = (priceLakhs: number) =>
  priceLakhs < 10 ? 14000 : priceLakhs < 20 ? 20000 : priceLakhs < 40 ? 28000 : 38000

// Insurance: % of ex-showroom, stepping down each year
const INSURANCE_RATES = [0.035, 0.028, 0.022, 0.018, 0.015]  // yr 1–5

// Depreciation rates per year (Indian market estimates)
const DEPR_RATES = [0.20, 0.15, 0.12, 0.10, 0.08]

// Chart colour palette
const STACK_COLORS = {
  emi:         '#00D4FF',
  fuel:        '#FFB300',
  insurance:   '#FF6B35',
  maintenance: '#00E676',
  depreciation:'#9C27B0',
}

// ─── Cost engine ─────────────────────────────────────────────────────────────
interface CarConfig {
  name:         string
  price:        number   // lakhs ex-showroom
  fuelType:     FuelType
  kmPerMonth:   number
  downPct:      number   // % down payment
  interestRate: number   // % p.a.
  tenureMonths: number
  fuelPrice:    number   // ₹/litre or ₹/unit
  mileage:      number   // kmpl or km/unit
}

interface YearCost {
  year:        string
  emi:         number
  fuel:        number
  insurance:   number
  maintenance: number
  depreciation:number
}

function computeYearlyCosts(cfg: CarConfig): { yearly: YearCost[]; total: number; totalKm: number } {
  const priceRs      = cfg.price * 100_000
  const loanAmt      = priceRs * (1 - cfg.downPct / 100)
  const emi          = calculateEMI(loanAmt, cfg.interestRate, cfg.tenureMonths)
  const annualEMI    = emi * 12

  const kmPerYear    = cfg.kmPerMonth * 12
  const isEV        = cfg.fuelType === 'Electric'
  const annualFuel   = isEV
    ? (kmPerYear / cfg.mileage) * cfg.fuelPrice          // kWh cost
    : annualFuelCost(cfg.kmPerMonth / 30, cfg.mileage, cfg.fuelPrice)

  const maintenance  = MAINTENANCE_ANNUAL(cfg.price)
  const totalKm      = kmPerYear * 5

  let remaining = priceRs
  const yearly: YearCost[] = []

  for (let yr = 0; yr < 5; yr++) {
    const yrEMI         = yr < (cfg.tenureMonths / 12) ? annualEMI : 0
    const yrInsurance   = priceRs * INSURANCE_RATES[yr]
    const yrMaint       = maintenance * (1 + yr * 0.08) // ~8% inflation rate
    const deprAmt       = remaining * DEPR_RATES[yr]
    remaining          -= deprAmt

    yearly.push({
      year:        `Year ${yr + 1}`,
      emi:         Math.round(yrEMI),
      fuel:        Math.round(annualFuel),
      insurance:   Math.round(yrInsurance),
      maintenance: Math.round(yrMaint),
      depreciation:Math.round(deprAmt),
    })
  }

  const total = yearly.reduce((s, y) =>
    s + y.emi + y.fuel + y.insurance + y.maintenance + y.depreciation, 0)

  return { yearly, total, totalKm }
}

// ─── Slider input helper ──────────────────────────────────────────────────────
function SliderRow({
  id, label, min, max, step, value, onChange, suffix = '',
}: {
  id: string; label: string; min: number; max: number; step: number
  value: number; onChange: (v: number) => void; suffix?: string
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label htmlFor={id} className="text-sm font-semibold text-text-secondary">{label}</label>
        <span className="text-sm font-black text-accent font-mono">{value}{suffix}</span>
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

// ─── Fuel type pills ──────────────────────────────────────────────────────────
function FuelPills({
  value, onChange,
}: { value: FuelType; onChange: (f: FuelType) => void }) {
  const types: FuelType[] = ['Petrol', 'Diesel', 'Electric', 'CNG']
  const icons: Record<FuelType, string> = { Petrol: '⛽', Diesel: '🛢️', Electric: '⚡', CNG: '🌿' }
  return (
    <div className="flex gap-2 flex-wrap">
      {types.map(f => (
        <button key={f} onClick={() => onChange(f)}
          className={clsx(
            'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
            value === f
              ? 'bg-accent/15 border-accent text-accent'
              : 'bg-surface/40 border-border/50 text-text-muted hover:border-accent/40'
          )}>
          {icons[f]} {f}
        </button>
      ))}
    </div>
  )
}

// ─── Custom tooltip for bar chart ────────────────────────────────────────────
function BarchartTooltip({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; fill: string }[]; label?: string
}) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + (p.value || 0), 0)
  return (
    <div className="glass-strong rounded-xl border border-border/60 p-3 text-xs min-w-[180px]">
      <p className="font-black text-text-primary mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
            <span className="capitalize text-text-muted">{p.name}</span>
          </span>
          <span className="font-bold text-text-primary font-mono">
            ₹{(p.value / 100_000).toFixed(2)}L
          </span>
        </div>
      ))}
      <div className="border-t border-border/40 mt-2 pt-2 flex justify-between font-black">
        <span className="text-text-muted">Total</span>
        <span className="text-accent font-mono">₹{(total / 100_000).toFixed(2)}L</span>
      </div>
    </div>
  )
}

// ─── CarConfig form ───────────────────────────────────────────────────────────
function CarConfigPanel({
  cfg, onChange, accent, label,
}: { cfg: CarConfig; onChange: (c: Partial<CarConfig>) => void; accent: string; label: string }) {
  return (
    <div className="glass rounded-2xl p-5 space-y-5 border" style={{ borderColor: `${accent}30` }}>
      {/* Car name */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: accent }}>
          {label}
        </p>
        <input
          type="text" value={cfg.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="Car name (e.g., Hyundai Creta)"
          className="input h-9 text-sm"
        />
      </div>

      {/* Fuel type */}
      <div>
        <p className="text-xs font-semibold text-text-muted mb-2">Fuel Type</p>
        <FuelPills
          value={cfg.fuelType}
          onChange={f => onChange({
            fuelType: f,
            fuelPrice: FUEL_PRICE_DEFAULTS[f],
            mileage: MILEAGE_DEFAULTS[f],
          })}
        />
      </div>

      {/* Sliders */}
      <SliderRow id={`${label}-price`} label="Ex-Showroom Price" min={3} max={100} step={0.5}
        value={cfg.price} onChange={v => onChange({ price: v })} suffix="L" />
      <SliderRow id={`${label}-kmmon`} label="Avg km/month" min={500} max={5000} step={100}
        value={cfg.kmPerMonth} onChange={v => onChange({ kmPerMonth: v })} suffix=" km" />
      <SliderRow id={`${label}-down`} label="Down Payment" min={10} max={60} step={5}
        value={cfg.downPct} onChange={v => onChange({ downPct: v })} suffix="%" />
      <SliderRow id={`${label}-rate`} label="Loan Interest" min={6} max={18} step={0.25}
        value={cfg.interestRate} onChange={v => onChange({ interestRate: v })} suffix="%" />
      <SliderRow id={`${label}-tenure`} label="Loan Tenure" min={12} max={84} step={12}
        value={cfg.tenureMonths} onChange={v => onChange({ tenureMonths: v })} suffix=" mo" />
      <SliderRow id={`${label}-fp`}
        label={cfg.fuelType === 'Electric' ? 'Electricity Rate (₹/kWh)' : `${cfg.fuelType} Price (₹/L)`}
        min={cfg.fuelType === 'Electric' ? 4 : 70} max={cfg.fuelType === 'Electric' ? 15 : 135} step={1}
        value={cfg.fuelPrice} onChange={v => onChange({ fuelPrice: v })} suffix={cfg.fuelType === 'Electric' ? ' ₹' : ' ₹'} />
      <SliderRow id={`${label}-ml`}
        label={cfg.fuelType === 'Electric' ? 'Range (km/kWh)' : 'Car Mileage (kmpl)'}
        min={4} max={40} step={0.5}
        value={cfg.mileage} onChange={v => onChange({ mileage: v })} suffix={cfg.fuelType === 'Electric' ? ' km/u' : ' km'} />
    </div>
  )
}

// ─── Summary badge row ────────────────────────────────────────────────────────
function SummaryBadge({
  label, value, sub, color = 'text-accent', icon: Icon,
}: { label: string; value: string; sub?: string; color?: string; icon?: React.ElementType }) {
  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-text-dim">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </div>
      <p className={`text-xl font-black font-mono ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-text-muted">{sub}</p>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TCO CALCULATOR PANEL
// ═══════════════════════════════════════════════════════════════════════════
function TCOCalculator() {
  const [compareMode, setCompareMode] = useState(false)

  const defaultCfg = (name = 'Car A', price = 15, fuelType: FuelType = 'Petrol'): CarConfig => ({
    name,
    price,
    fuelType,
    kmPerMonth:   1200,
    downPct:      20,
    interestRate: 8.5,
    tenureMonths: 60,
    fuelPrice:    FUEL_PRICE_DEFAULTS[fuelType],
    mileage:      MILEAGE_DEFAULTS[fuelType],
  })

  const [cfgA, setCfgA] = useState<CarConfig>(defaultCfg('Hyundai Creta', 19.65, 'Petrol'))
  const [cfgB, setCfgB] = useState<CarConfig>(defaultCfg('Maruti Swift', 8.29, 'Petrol'))

  const resultA = useMemo(() => computeYearlyCosts(cfgA), [cfgA])
  const resultB = useMemo(() => computeYearlyCosts(cfgB), [cfgB])

  // Stacked bars for a single car chart
  type StackKey = keyof typeof STACK_COLORS

  function SingleCarChart({ data }: { data: YearCost[] }) {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }} barSize={36}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.4)" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#8B9EC7' }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={v => `₹${(v / 100_000).toFixed(1)}L`}
            tick={{ fontSize: 10, fill: '#8B9EC7' }} axisLine={false} tickLine={false} width={62}
          />
          <Tooltip content={<BarchartTooltip />} />
          <Legend iconType="circle" iconSize={8}
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            formatter={v => <span className="text-text-muted capitalize">{v}</span>}
          />
          {(Object.keys(STACK_COLORS) as StackKey[]).map(key => (
            <Bar key={key} dataKey={key} name={key} stackId="a" fill={STACK_COLORS[key]}
              radius={key === 'depreciation' ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // Comparison chart — grouped bars (total per year, per car)
  const compareChartData = resultA.yearly.map((yr, i) => {
    const totalA = yr.emi + yr.fuel + yr.insurance + yr.maintenance + yr.depreciation
    const totalB = resultB.yearly[i].emi + resultB.yearly[i].fuel + resultB.yearly[i].insurance + resultB.yearly[i].maintenance + resultB.yearly[i].depreciation
    return { year: yr.year, [cfgA.name || 'Car A']: totalA, [cfgB.name || 'Car B']: totalB }
  })

  const pctDiff = resultA.total > 0
    ? Math.round(Math.abs(resultA.total - resultB.total) / resultA.total * 100)
    : 0
  const cheaper = resultA.total <= resultB.total ? (cfgA.name || 'Car A') : (cfgB.name || 'Car B')

  return (
    <div className="space-y-8">
      {/* Mode switcher */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-display-xs">5-Year True Ownership Cost</h2>
          <p className="text-text-muted text-sm mt-0.5">
            All costs: EMI, fuel, insurance, maintenance, depreciation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">Single car</span>
          <button
            id="compare-mode-toggle"
            onClick={() => setCompareMode(m => !m)}
            className={clsx(
              'relative w-11 h-6 rounded-full border-2 transition-all duration-200',
              compareMode ? 'bg-accent border-accent' : 'bg-surface border-border/60'
            )}
            aria-label="Toggle compare mode"
          >
            <span className={clsx(
              'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200',
              compareMode ? 'left-[22px]' : 'left-0.5'
            )} />
          </button>
          <span className="text-sm text-text-muted">Compare 2 cars</span>
        </div>
      </div>

      {/* Config panels */}
      <div className={clsx('grid gap-6', compareMode ? 'lg:grid-cols-2' : 'max-w-xl')}>
        <CarConfigPanel
          label="Car A" cfg={cfgA}
          onChange={p => setCfgA(c => ({ ...c, ...p }))}
          accent="#00D4FF"
        />
        <AnimatePresence>
          {compareMode && (
            <motion.div
              key="car-b"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CarConfigPanel
                label="Car B" cfg={cfgB}
                onChange={p => setCfgB(c => ({ ...c, ...p }))}
                accent="#FF6B35"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Single car results ── */}
      {!compareMode && (
        <motion.div key="single" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Summary badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryBadge icon={IndianRupee} label="5-Year Total Cost"
              value={`₹${(resultA.total / 100_000).toFixed(2)}L`}
              sub="All-in ownership" color="text-accent" />
            <SummaryBadge icon={Gauge} label="Cost per km"
              value={`₹${(resultA.total / resultA.totalKm).toFixed(1)}`}
              sub={`over ${(resultA.totalKm / 1000).toFixed(0)}k km`} color="text-warning" />
            <SummaryBadge icon={Car} label="Monthly Budget Needed"
              value={`₹${Math.round(resultA.total / 60).toLocaleString('en-IN')}`}
              sub="avg over 5 years" color="text-success" />
            <SummaryBadge icon={TrendingDown} label="Total Depreciation"
              value={`₹${(resultA.yearly.reduce((s, y) => s + y.depreciation, 0) / 100_000).toFixed(2)}L`}
              sub="estimated resale loss" color="text-danger" />
          </div>

          {/* Cost breakdown bar chart */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <IndianRupee className="w-4 h-4 text-accent" />
              <h3 className="font-bold text-text-primary">Year-by-Year Cost Breakdown</h3>
            </div>
            <SingleCarChart data={resultA.yearly} />
          </div>

          {/* Per-component breakdown table */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border/40 flex items-center gap-2">
              <BadgePercent className="w-4 h-4 text-accent" />
              <h3 className="font-bold text-sm text-text-primary">5-Year Breakdown by Component</h3>
            </div>
            {([
              { key: 'emi',          label: 'EMI Payments',      icon: '💳', color: STACK_COLORS.emi          },
              { key: 'fuel',         label: 'Fuel / Electricity', icon: '⛽', color: STACK_COLORS.fuel         },
              { key: 'insurance',    label: 'Insurance',          icon: '🛡️', color: STACK_COLORS.insurance    },
              { key: 'maintenance',  label: 'Maintenance',        icon: '🔧', color: STACK_COLORS.maintenance  },
              { key: 'depreciation', label: 'Depreciation',       icon: '📉', color: STACK_COLORS.depreciation },
            ] as { key: StackKey; label: string; icon: string; color: string }[]).map(({ key, label, icon, color }, i) => {
              const total5 = resultA.yearly.reduce((s, y) => s + (y[key] as number), 0)
              const pct = Math.round((total5 / resultA.total) * 100)
              return (
                <div key={key}
                  className={clsx('flex items-center gap-4 px-5 py-3.5 border-b border-border/20 last:border-0',
                    i % 2 === 0 ? 'bg-transparent' : 'bg-surface/20')}>
                  <span className="text-base shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-secondary">{label}</span>
                      <span className="font-black text-text-primary font-mono">
                        ₹{(total5 / 100_000).toFixed(2)}L
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-text-muted w-10 text-right shrink-0">{pct}%</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ── Compare two cars results ── */}
      {compareMode && (
        <motion.div key="compare" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Winner badge */}
          <div className={clsx(
            'glass rounded-2xl p-5 border-2 text-center',
            resultA.total <= resultB.total ? 'border-accent/40' : 'border-warm/40'
          )}>
            <p className="text-xs uppercase tracking-widest text-text-muted mb-1">💰 Cheaper to own</p>
            <p className="text-2xl font-black text-text-primary">{cheaper}</p>
            <p className="text-sm text-text-muted mt-1">
              saves <span className="text-success font-bold">
                ₹{(Math.abs(resultA.total - resultB.total) / 100_000).toFixed(2)}L
              </span> over 5 years ({pctDiff}% less)
            </p>
          </div>

          {/* Side-by-side summary */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { cfg: cfgA, result: resultA, accent: '#00D4FF' },
              { cfg: cfgB, result: resultB, accent: '#FF6B35' },
            ].map(({ cfg, result, accent }) => (
              <div key={accent} className="glass rounded-2xl p-5 space-y-3">
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>
                  {cfg.name || 'Car'}
                </p>
                <div>
                  <p className="text-[10px] text-text-dim uppercase tracking-widest">5-Year Total</p>
                  <p className="text-3xl font-black font-mono" style={{ color: accent }}>
                    ₹{(result.total / 100_000).toFixed(2)}L
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: '₹/km', value: `₹${(result.total / result.totalKm).toFixed(1)}` },
                    { label: 'Monthly avg', value: `₹${Math.round(result.total / 60).toLocaleString('en-IN')}` },
                    { label: 'Fuel 5yr', value: `₹${(result.yearly.reduce((s, y) => s + y.fuel, 0) / 100_000).toFixed(1)}L` },
                    { label: 'Depr 5yr', value: `₹${(result.yearly.reduce((s, y) => s + y.depreciation, 0) / 100_000).toFixed(1)}L` },
                  ].map(r => (
                    <div key={r.label} className="bg-surface/40 rounded-lg px-2 py-1.5">
                      <p className="text-text-dim">{r.label}</p>
                      <p className="font-bold text-text-primary">{r.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Stacked bar chart per car */}
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { cfg: cfgA, result: resultA, accent: '#00D4FF' },
              { cfg: cfgB, result: resultB, accent: '#FF6B35' },
            ].map(({ cfg, result, accent }) => (
              <div key={accent} className="glass rounded-2xl p-5">
                <p className="text-sm font-bold mb-4" style={{ color: accent }}>{cfg.name || 'Car'}</p>
                <SingleCarChart data={result.yearly} />
              </div>
            ))}
          </div>

          {/* Grouped total-cost-per-year chart */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold text-text-primary mb-5">Total Cost per Year — Side by Side</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={compareChartData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }} barSize={28} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.4)" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#8B9EC7' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={v => `₹${(v / 100_000).toFixed(1)}L`}
                  tick={{ fontSize: 10, fill: '#8B9EC7' }} axisLine={false} tickLine={false} width={62}
                />
                <Tooltip
                  formatter={(v) => [`₹${(Number(v ?? 0) / 100_000).toFixed(2)}L`, ''] as [string, string]}
                  contentStyle={{
                    background: 'rgba(13,27,42,0.97)', border: '1px solid rgba(30,58,95,0.8)',
                    borderRadius: '12px', fontSize: '12px', color: '#F0F4FF',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={v => <span className="text-text-muted">{v}</span>} />
                <Bar dataKey={cfgA.name || 'Car A'} fill="#00D4FF" radius={[4, 4, 0, 0]} />
                <Bar dataKey={cfgB.name || 'Car B'} fill="#FF6B35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN TOOLS PAGE
// ═══════════════════════════════════════════════════════════════════════════
type TabDef = { id: Tab; label: string; icon: React.ElementType; badge?: string }

export default function Tools() {
  const [activeTab, setActiveTab] = useState<Tab>('tco')

  // EMI state
  const [emiPrice, setEmiPrice]         = useState(15)
  const [downPct, setDownPct]           = useState(20)
  const [interestRate, setInterestRate] = useState(8.5)
  const [tenure, setTenure]             = useState(60)

  // Fuel cost state
  const [kmPerDay, setKmPerDay]     = useState(40)
  const [carMileage, setCarMileage] = useState(18)
  const [fuelPrice, setFuelPrice]   = useState(105)

  // Depreciation state
  const [deprPrice, setDeprPrice] = useState(15)
  const [deprYears, setDeprYears] = useState(3)

  // Computed — EMI
  const loanAmount    = emiPrice * (1 - downPct / 100)
  const emi           = calculateEMI(loanAmount * 100000, interestRate, tenure)
  const totalPayable  = emi * tenure
  const totalInterest = totalPayable - loanAmount * 100000

  // Computed — Fuel
  const yearlyFuel   = annualFuelCost(kmPerDay, carMileage, fuelPrice)
  const monthlyFuel  = yearlyFuel / 12

  // Computed — Depreciation
  const depr = estimatedDepreciation(deprPrice, deprYears)

  const TABS: TabDef[] = [
    { id: 'tco',         label: 'Ownership Cost',  icon: IndianRupee,  badge: 'NEW' },
    { id: 'emi',         label: 'EMI Calculator',  icon: Calculator },
    { id: 'fuel',        label: 'Fuel Cost',        icon: Fuel },
    { id: 'depreciation',label: 'Depreciation',    icon: TrendingDown },
  ]

  return (
    <div className="page-enter section-wrapper py-10 pb-20">
      {/* Page header */}
      <div className="mb-8">
        <span className="section-tag mb-3 inline-flex"><Wrench className="w-3.5 h-3.5" /> Tools</span>
        <h1 className="text-display-md">Car Finance Tools</h1>
        <p className="text-text-muted mt-1 max-w-xl">
          Calculate EMI, fuel costs, depreciation, and full 5-year ownership cost to make smarter buying decisions.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex glass rounded-xl p-1 mb-10 gap-1 overflow-x-auto no-scrollbar w-fit max-w-full">
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`tools-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap relative',
              activeTab === tab.id
                ? 'bg-accent text-primary shadow-glow-sm'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            <tab.icon className="w-4 h-4 shrink-0" />
            {tab.label}
            {tab.badge && (
              <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black px-1 py-0.5 rounded-full bg-warm text-white leading-none">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TCO Calculator */}
      {activeTab === 'tco' && <TCOCalculator />}

      {/* EMI Calculator */}
      {activeTab === 'emi' && (
        <section id="emi-section" className="grid lg:grid-cols-2 gap-8" aria-label="EMI Calculator">
          <div className="glass rounded-2xl p-6 space-y-5">
            <h2 className="text-display-xs">EMI Calculator</h2>
            {[
              { id: 'emi-price',  label: `Car Price`,     min: 3,  max: 100, step: 0.5,  val: emiPrice,      set: setEmiPrice,      suffix: 'L' },
              { id: 'emi-down',   label: `Down Payment`,  min: 10, max: 80,  step: 5,    val: downPct,        set: setDownPct,       suffix: '%' },
              { id: 'emi-rate',   label: `Interest Rate`, min: 6,  max: 18,  step: 0.25, val: interestRate,   set: setInterestRate,  suffix: '% p.a.' },
              { id: 'emi-tenure', label: `Tenure`,        min: 12, max: 84,  step: 12,   val: tenure,         set: setTenure,        suffix: ' months' },
            ].map(s => (
              <SliderRow key={s.id} id={s.id} label={s.label} min={s.min} max={s.max} step={s.step}
                value={s.val} onChange={s.set} suffix={s.suffix} />
            ))}
          </div>
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <p className="text-xs text-text-dim uppercase tracking-widest mb-1">Monthly EMI</p>
              <p className="text-4xl font-black text-accent">₹{Math.round(emi).toLocaleString('en-IN')}</p>
            </div>
            {([
              { label: 'Loan Amount',   value: `₹${loanAmount.toFixed(2)}L` },
              { label: 'Down Payment',  value: `₹${(emiPrice * downPct / 100).toFixed(2)}L` },
              { label: 'Total Payable', value: `₹${(totalPayable / 100000).toFixed(2)}L` },
              { label: 'Total Interest',value: `₹${(totalInterest / 100000).toFixed(2)}L` },
              { label: 'Tenure',        value: `${tenure} months (${(tenure / 12).toFixed(1)} yrs)` },
            ]).map(r => (
              <div key={r.label} className="glass rounded-xl px-5 py-3.5 flex justify-between items-center">
                <span className="text-sm text-text-muted">{r.label}</span>
                <span className="text-sm font-bold text-text-primary font-mono">{r.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fuel Cost */}
      {activeTab === 'fuel' && (
        <section id="fuel-section" className="grid lg:grid-cols-2 gap-8" aria-label="Fuel Cost Calculator">
          <div className="glass rounded-2xl p-6 space-y-5">
            <h2 className="text-display-xs">Annual Fuel Cost</h2>
            {[
              { id: 'fuel-km',     label: 'Daily Driving',  min: 5,  max: 200, step: 5,   val: kmPerDay,   set: setKmPerDay,   suffix: ' km/day' },
              { id: 'fuel-mileage',label: 'Car Mileage',    min: 8,  max: 35,  step: 0.5, val: carMileage, set: setCarMileage, suffix: ' kmpl' },
              { id: 'fuel-price',  label: 'Fuel Price',     min: 85, max: 130, step: 1,   val: fuelPrice,  set: setFuelPrice,  suffix: ' ₹/L' },
            ].map(s => (
              <SliderRow key={s.id} id={s.id} label={s.label} min={s.min} max={s.max} step={s.step}
                value={s.val} onChange={s.set} suffix={s.suffix} />
            ))}
          </div>
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <p className="text-xs text-text-dim uppercase tracking-widest mb-1">Annual Fuel Cost</p>
              <p className="text-4xl font-black text-accent">₹{Math.round(yearlyFuel).toLocaleString('en-IN')}</p>
            </div>
            {([
              { label: 'Monthly Cost', value: `₹${Math.round(monthlyFuel).toLocaleString('en-IN')}` },
              { label: 'Yearly KMs',   value: `${(kmPerDay * 365).toLocaleString('en-IN')} km` },
              { label: 'Fuel per Year',value: `${((kmPerDay * 365) / carMileage).toFixed(0)} litres` },
              { label: '5-Year Cost',  value: `₹${(yearlyFuel * 5 / 100000).toFixed(2)}L` },
            ]).map(r => (
              <div key={r.label} className="glass rounded-xl px-5 py-3.5 flex justify-between items-center">
                <span className="text-sm text-text-muted">{r.label}</span>
                <span className="text-sm font-bold text-text-primary font-mono">{r.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Depreciation */}
      {activeTab === 'depreciation' && (
        <section id="depreciation-section" className="grid lg:grid-cols-2 gap-8" aria-label="Depreciation Calculator">
          <div className="glass rounded-2xl p-6 space-y-5">
            <h2 className="text-display-xs">Depreciation Estimator</h2>
            {[
              { id: 'depr-price', label: 'Car Price',          min: 3, max: 100, step: 0.5, val: deprPrice, set: setDeprPrice, suffix: 'L' },
              { id: 'depr-years', label: 'Years of Ownership', min: 1, max: 10,  step: 1,   val: deprYears, set: setDeprYears, suffix: ' yrs' },
            ].map(s => (
              <SliderRow key={s.id} id={s.id} label={s.label} min={s.min} max={s.max} step={s.step}
                value={s.val} onChange={s.set} suffix={s.suffix} />
            ))}
          </div>
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <p className="text-xs text-text-dim uppercase tracking-widest mb-1">Estimated Resale Value</p>
              <p className="text-4xl font-black text-accent">₹{depr.value}L</p>
            </div>
            {([
              { label: 'Original Price', value: `₹${deprPrice}L` },
              { label: 'Depreciation',   value: `${depr.percent}%` },
              { label: 'Value Lost',     value: `₹${(deprPrice - depr.value).toFixed(2)}L` },
              { label: 'Per Year Avg',   value: `₹${((deprPrice - depr.value) / deprYears).toFixed(2)}L` },
            ]).map(r => (
              <div key={r.label} className="glass rounded-xl px-5 py-3.5 flex justify-between items-center">
                <span className="text-sm text-text-muted">{r.label}</span>
                <span className="text-sm font-bold text-text-primary font-mono">{r.value}</span>
              </div>
            ))}
            <p className="text-xs text-text-dim p-2">* Estimates ~15% annual depreciation. Actual resale varies.</p>
          </div>
        </section>
      )}
    </div>
  )
}
