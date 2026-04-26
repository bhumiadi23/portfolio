/**
 * EVTools — EV-specific tools & calculators section
 *
 * Route: /ev-tools
 *
 * Features:
 *  1. EV vs Petrol 5-year cost comparison
 *  2. Range calculator (battery size, driving style → estimated range)
 *  3. Carbon footprint score comparison
 *  4. Mock charging station map (static markers on styled div)
 *  5. "Should I switch to EV?" AI recommendation widget
 */
import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Fuel, Leaf, MapPin, Bot, ArrowRight, ArrowLeftRight,
  BatteryCharging, Gauge, IndianRupee,
  Wind, Mountain, Car, CheckCircle2,
  XCircle, AlertTriangle, ChevronDown, Sparkles,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import clsx from 'clsx'

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS & TYPES
// ═══════════════════════════════════════════════════════════════════════════
type EVToolTab = 'cost' | 'range' | 'carbon' | 'map' | 'switch'

const TAB_DEFS: { id: EVToolTab; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'cost',   label: 'EV vs Petrol',       icon: ArrowLeftRight },
  { id: 'range',  label: 'Range Calculator',    icon: BatteryCharging },
  { id: 'carbon', label: 'Carbon Footprint',    icon: Leaf },
  { id: 'map',    label: 'Charging Stations',   icon: MapPin, badge: 'BETA' },
  { id: 'switch', label: 'Should I Switch?',    icon: Bot,    badge: 'AI' },
]

// ─── Shared slider ───────────────────────────────────────────────────────────
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

// ─── Stat card ───────────────────────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════════════
// 1. EV VS PETROL 5-YEAR COST COMPARISON
// ═══════════════════════════════════════════════════════════════════════════
function EVvsPetrolCost() {
  // EV defaults
  const [evPrice, setEvPrice] = useState(18)
  const [evRange, setEvRange] = useState(400) // km/charge
  const [evBattery, setEvBattery] = useState(40) // kWh
  const [evChargeRate, setEvChargeRate] = useState(8) // ₹/kWh
  const [kmPerMonth, setKmPerMonth] = useState(1200)

  // Petrol defaults
  const [petrolPrice, setPetrolPrice] = useState(12)
  const [petrolMileage, setPetrolMileage] = useState(18) // kmpl
  const [petrolFuelPrice, setPetrolFuelPrice] = useState(104) // ₹/L

  // Insurance: ~3.5% yr1, stepping down
  const insuranceRate = [0.035, 0.028, 0.022, 0.018, 0.015]
  // Maintenance: EV ~40% less
  const petrolMaintPerYr = petrolPrice < 10 ? 14000 : petrolPrice < 20 ? 20000 : 28000
  const evMaintPerYr = Math.round(petrolMaintPerYr * 0.55)

  const yearlyData = useMemo(() => {
    const annualKm = kmPerMonth * 12
    const evKmPerKwh = evRange / evBattery
    const evFuelPerYr = (annualKm / evKmPerKwh) * evChargeRate
    const petrolFuelPerYr = (annualKm / petrolMileage) * petrolFuelPrice

    const data = []
    for (let yr = 0; yr < 5; yr++) {
      const evInsurance = evPrice * 100000 * insuranceRate[yr]
      const petrolInsurance = petrolPrice * 100000 * insuranceRate[yr]
      const evMaint = evMaintPerYr * (1 + yr * 0.05)
      const petrolMaint = petrolMaintPerYr * (1 + yr * 0.08)

      data.push({
        year: `Year ${yr + 1}`,
        EV: Math.round(evFuelPerYr + evInsurance + evMaint),
        Petrol: Math.round(petrolFuelPerYr + petrolInsurance + petrolMaint),
      })
    }
    return data
  }, [evPrice, evRange, evBattery, evChargeRate, kmPerMonth, petrolPrice, petrolMileage, petrolFuelPrice, evMaintPerYr, petrolMaintPerYr])

  const total5YrEV = yearlyData.reduce((s, y) => s + y.EV, 0)
  const total5YrPetrol = yearlyData.reduce((s, y) => s + y.Petrol, 0)
  const savings = total5YrPetrol - total5YrEV
  const savingsPct = total5YrPetrol > 0 ? Math.round((savings / total5YrPetrol) * 100) : 0
  const annualKm = kmPerMonth * 12
  const costPerKmEV = total5YrEV / (annualKm * 5)
  const costPerKmPetrol = total5YrPetrol / (annualKm * 5)

  // Break-even calculation (price difference / annual savings)
  const priceDiff = (evPrice - petrolPrice) * 100000
  const annualOpSavings = (total5YrPetrol - total5YrEV) / 5
  const breakEvenYears = annualOpSavings > 0 ? priceDiff / annualOpSavings : Infinity

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-display-xs mb-1">EV vs Petrol · 5-Year Running Cost</h2>
        <p className="text-text-muted text-sm">Compare annual operating costs, excluding EMI & depreciation</p>
      </div>

      {/* Config panels */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* EV Config */}
        <div className="glass rounded-2xl p-5 space-y-4 border border-accent/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-accent">Electric Vehicle</p>
          </div>
          <Slider id="ev-price" label="EV Price (ex-showroom)" min={8} max={80} step={0.5}
            value={evPrice} onChange={setEvPrice} suffix="L" />
          <Slider id="ev-battery" label="Battery Capacity" min={15} max={100} step={1}
            value={evBattery} onChange={setEvBattery} suffix=" kWh" />
          <Slider id="ev-range" label="Claimed Range" min={150} max={700} step={10}
            value={evRange} onChange={setEvRange} suffix=" km" />
          <Slider id="ev-charge" label="Charging Cost" min={4} max={18} step={0.5}
            value={evChargeRate} onChange={setEvChargeRate} suffix=" ₹/kWh" />
        </div>

        {/* Petrol Config */}
        <div className="glass rounded-2xl p-5 space-y-4 border border-warm/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-warm/15 flex items-center justify-center">
              <Fuel className="w-4 h-4 text-warm" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-warm">Petrol Vehicle</p>
          </div>
          <Slider id="pet-price" label="Car Price (ex-showroom)" min={5} max={60} step={0.5}
            value={petrolPrice} onChange={setPetrolPrice} suffix="L" color="#FF6B35" />
          <Slider id="pet-mileage" label="Car Mileage" min={8} max={35} step={0.5}
            value={petrolMileage} onChange={setPetrolMileage} suffix=" kmpl" color="#FF6B35" />
          <Slider id="pet-fuel" label="Petrol Price" min={85} max={130} step={1}
            value={petrolFuelPrice} onChange={setPetrolFuelPrice} suffix=" ₹/L" color="#FF6B35" />
        </div>
      </div>

      {/* Shared: km/month */}
      <div className="glass rounded-2xl p-5 max-w-md">
        <Slider id="shared-km" label="Average Monthly Driving" min={500} max={5000} step={100}
          value={kmPerMonth} onChange={setKmPerMonth} suffix=" km" />
      </div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Winner Banner */}
        <div className={clsx(
          'glass rounded-2xl p-6 border-2 text-center',
          savings > 0 ? 'border-accent/40' : 'border-warm/40',
        )}>
          <p className="text-xs uppercase tracking-widest text-text-muted mb-2">
            {savings > 0 ? '⚡ EV saves you more over 5 years' : '⛽ Petrol costs less to run'}
          </p>
          <p className="text-3xl font-black text-text-primary">
            ₹{(Math.abs(savings) / 100000).toFixed(2)}L
            <span className="text-sm text-text-muted font-normal ml-2">
              saved ({Math.abs(savingsPct)}% less)
            </span>
          </p>
          {breakEvenYears < 10 && breakEvenYears > 0 && (
            <p className="text-sm text-text-dim mt-2">
              🔄 EV breaks even on higher purchase price in ~<span className="font-bold text-accent">{breakEvenYears.toFixed(1)} years</span>
            </p>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Zap} label="5yr EV Cost" value={`₹${(total5YrEV / 100000).toFixed(2)}L`}
            sub="Running cost only" color="text-accent" />
          <StatCard icon={Fuel} label="5yr Petrol Cost" value={`₹${(total5YrPetrol / 100000).toFixed(2)}L`}
            sub="Running cost only" color="text-warm" />
          <StatCard icon={Gauge} label="EV ₹/km" value={`₹${costPerKmEV.toFixed(1)}`}
            sub="Fuel + maint + insur" color="text-accent" />
          <StatCard icon={Gauge} label="Petrol ₹/km" value={`₹${costPerKmPetrol.toFixed(1)}`}
            sub="Fuel + maint + insur" color="text-warm" />
        </div>

        {/* Year-by-year chart */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold text-text-primary mb-5 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-accent" />
            Year-by-Year Operating Cost
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={yearlyData} barGap={8} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.4)" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#8B9EC7' }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={v => `₹${(Number(v) / 1000).toFixed(0)}k`}
                tick={{ fontSize: 10, fill: '#8B9EC7' }} axisLine={false} tickLine={false} width={55}
              />
              <Tooltip
                formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, ''] as [string, string]}
                contentStyle={{
                  background: 'rgba(13,27,42,0.97)', border: '1px solid rgba(30,58,95,0.8)',
                  borderRadius: '12px', fontSize: '12px', color: '#F0F4FF',
                }}
              />
              <Bar dataKey="EV" fill="#00D4FF" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Petrol" fill="#FF6B35" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-accent" /> EV
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-warm" /> Petrol
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. RANGE CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════
type DrivingStyle = 'eco' | 'normal' | 'sport'
type TerrainType = 'city' | 'highway' | 'mixed' | 'hilly'

function RangeCalculator() {
  const [battery, setBattery] = useState(40) // kWh
  const [style, setStyle] = useState<DrivingStyle>('normal')
  const [terrain, setTerrain] = useState<TerrainType>('mixed')
  const [acOn, setAcOn] = useState(true)
  const [passengers, setPassengers] = useState(2)
  const [temperature, setTemperature] = useState(30) // °C

  // Efficiency factors (km/kWh base, then modified)
  const baseEfficiency = battery <= 25 ? 7.5 : battery <= 50 ? 6.8 : battery <= 75 ? 5.2 : 4.5

  const styleFactors: Record<DrivingStyle, number> = { eco: 1.2, normal: 1.0, sport: 0.75 }
  const terrainFactors: Record<TerrainType, number> = { city: 1.1, highway: 0.9, mixed: 1.0, hilly: 0.7 }
  const acFactor = acOn ? 0.88 : 1.0
  const passengerFactor = 1 - (passengers - 1) * 0.025
  const tempFactor = temperature < 10 ? 0.8 : temperature > 40 ? 0.85 : temperature < 20 ? 0.9 : 1.0

  const effectiveEfficiency = baseEfficiency * styleFactors[style] * terrainFactors[terrain]
    * acFactor * passengerFactor * tempFactor
  const estimatedRange = Math.round(battery * effectiveEfficiency)
  const idealRange = Math.round(battery * baseEfficiency * 1.15)
  const rangePct = Math.min((estimatedRange / idealRange) * 100, 100)

  // Battery visualization segments
  const batteryLevel = Math.round(rangePct)
  const batteryColor = batteryLevel > 60 ? '#00E676' : batteryLevel > 30 ? '#FFB300' : '#FF3B3B'

  // Stats breakdown
  const chargeTime50kw = ((battery * 0.8) / 50).toFixed(1) // 10-80% on 50kW DC
  const chargeTimeHome = ((battery * 0.8) / 3.3).toFixed(1) // 10-80% home 3.3kW

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-display-xs mb-1">EV Range Estimator</h2>
        <p className="text-text-muted text-sm">Input driving conditions to estimate your real-world range</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Controls */}
        <div className="glass rounded-2xl p-6 space-y-5 border border-accent/20">
          <Slider id="range-battery" label="Battery Capacity" min={15} max={120} step={1}
            value={battery} onChange={setBattery} suffix=" kWh" />

          {/* Driving Style */}
          <div>
            <p className="text-sm font-semibold text-text-secondary mb-2">Driving Style</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'eco' as DrivingStyle, label: 'Eco', icon: Leaf, color: '#00E676' },
                { id: 'normal' as DrivingStyle, label: 'Normal', icon: Car, color: '#00D4FF' },
                { id: 'sport' as DrivingStyle, label: 'Sport', icon: Zap, color: '#FF6B35' },
              ]).map(s => (
                <button key={s.id} onClick={() => setStyle(s.id)}
                  className={clsx(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-bold transition-all',
                    style === s.id
                      ? 'border-current bg-opacity-10'
                      : 'border-border/40 text-text-muted hover:border-accent/30'
                  )}
                  style={style === s.id ? { color: s.color, backgroundColor: `${s.color}10` } : {}}
                >
                  <s.icon className="w-5 h-5" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Terrain */}
          <div>
            <p className="text-sm font-semibold text-text-secondary mb-2">Terrain Type</p>
            <div className="grid grid-cols-4 gap-2">
              {([
                { id: 'city' as TerrainType, label: 'City', icon: '🏙️' },
                { id: 'highway' as TerrainType, label: 'Highway', icon: '🛣️' },
                { id: 'mixed' as TerrainType, label: 'Mixed', icon: '🔄' },
                { id: 'hilly' as TerrainType, label: 'Hilly', icon: '⛰️' },
              ]).map(t => (
                <button key={t.id} onClick={() => setTerrain(t.id)}
                  className={clsx(
                    'flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all',
                    terrain === t.id
                      ? 'bg-accent/15 border-accent/40 text-accent'
                      : 'border-border/40 text-text-muted hover:border-accent/30'
                  )}>
                  <span className="text-lg">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Extra factors */}
          <div className="grid grid-cols-2 gap-4">
            <Slider id="range-temp" label="Temperature" min={0} max={50} step={1}
              value={temperature} onChange={setTemperature} suffix="°C" />
            <Slider id="range-passengers" label="Passengers" min={1} max={5} step={1}
              value={passengers} onChange={setPassengers} suffix="" />
          </div>

          {/* AC toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface/30">
            <span className="flex items-center gap-2 text-sm text-text-secondary">
              <Wind className="w-4 h-4 text-accent" /> Air Conditioning
            </span>
            <button onClick={() => setAcOn(a => !a)}
              className={clsx(
                'relative w-11 h-6 rounded-full border-2 transition-all duration-200',
                acOn ? 'bg-accent border-accent' : 'bg-surface border-border/60',
              )}>
              <span className={clsx(
                'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200',
                acOn ? 'left-[22px]' : 'left-0.5',
              )} />
            </button>
          </div>
        </div>

        {/* Results panel */}
        <div className="space-y-5">
          {/* Range display */}
          <motion.div
            key={estimatedRange}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="glass rounded-2xl p-6 text-center border border-accent/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ background: `radial-gradient(circle at 50% 80%, ${batteryColor}20, transparent 70%)` }} />

            <p className="text-[10px] text-text-dim uppercase tracking-widest mb-3">Estimated Real-World Range</p>

            {/* Battery visualization */}
            <div className="w-36 h-20 mx-auto mb-4 relative">
              {/* Battery body */}
              <div className="absolute inset-0 rounded-2xl border-2 border-border/50 overflow-hidden">
                <motion.div
                  className="absolute bottom-0 left-0 right-0 rounded-b-xl"
                  style={{ backgroundColor: batteryColor }}
                  initial={{ height: 0 }}
                  animate={{ height: `${batteryLevel}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <BatteryCharging className="w-8 h-8 text-white/80" />
                </div>
              </div>
              {/* Battery terminal */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-10 h-2 rounded-t-md bg-border/50" />
            </div>

            <motion.p
              key={estimatedRange}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl font-black font-mono text-text-primary"
            >
              {estimatedRange}
              <span className="text-lg text-text-dim ml-1">km</span>
            </motion.p>
            <p className="text-xs text-text-dim mt-1">
              vs {idealRange} km ideal ({Math.round(rangePct)}% of ideal)
            </p>

            {/* Efficiency */}
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div>
                <p className="text-[10px] text-text-dim uppercase">Efficiency</p>
                <p className="font-black text-accent font-mono">{effectiveEfficiency.toFixed(1)} km/kWh</p>
              </div>
              <div className="w-px h-8 bg-border/30" />
              <div>
                <p className="text-[10px] text-text-dim uppercase">Battery Used</p>
                <p className="font-black text-warning font-mono">{battery} kWh</p>
              </div>
            </div>
          </motion.div>

          {/* Charging time cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-[10px] text-text-dim uppercase tracking-widest mb-1">⚡ DC Fast (50kW)</p>
              <p className="text-xl font-black text-accent font-mono">{chargeTime50kw} hrs</p>
              <p className="text-[10px] text-text-dim">10% → 80%</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-[10px] text-text-dim uppercase tracking-widest mb-1">🏠 Home (3.3kW)</p>
              <p className="text-xl font-black text-warning font-mono">{chargeTimeHome} hrs</p>
              <p className="text-[10px] text-text-dim">10% → 80%</p>
            </div>
          </div>

          {/* Impact factors breakdown */}
          <div className="glass rounded-xl p-4">
            <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Range Impact Factors</p>
            {([
              { label: 'Driving Style', impact: styleFactors[style], icon: '🏎️' },
              { label: 'Terrain', impact: terrainFactors[terrain], icon: '🗺️' },
              { label: 'AC', impact: acFactor, icon: '❄️' },
              { label: 'Temperature', impact: tempFactor, icon: '🌡️' },
              { label: 'Load', impact: passengerFactor, icon: '👥' },
            ]).map(f => {
              const pct = Math.round((f.impact - 1) * 100)
              const isNeg = pct < 0
              return (
                <div key={f.label} className="flex items-center gap-3 py-1.5">
                  <span className="text-sm">{f.icon}</span>
                  <span className="text-xs text-text-muted flex-1">{f.label}</span>
                  <span className={clsx(
                    'text-xs font-bold font-mono px-2 py-0.5 rounded-md',
                    isNeg ? 'text-danger bg-danger/10' : pct > 0 ? 'text-success bg-success/10' : 'text-text-dim bg-surface/40',
                  )}>
                    {pct > 0 ? '+' : ''}{pct}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. CARBON FOOTPRINT COMPARISON
// ═══════════════════════════════════════════════════════════════════════════
function CarbonFootprint() {
  const [annualKm, setAnnualKm] = useState(15000)
  const [years, setYears] = useState(5)

  // CO2 per km (grams)
  const emissions = {
    petrol: 120,      // g/km (Indian avg for ~15kmpl car)
    diesel: 110,
    cng: 80,
    hybrid: 70,
    ev: 30,           // Grid emission factor for India ~0.7 kgCO2/kWh, 6km/kWh = ~117g/km but improving
  }

  const totalData = useMemo(() => {
    return Object.entries(emissions).map(([fuel, gPerKm]) => ({
      fuel: fuel.toUpperCase(),
      total: Math.round((gPerKm * annualKm * years) / 1000), // kg
      perYear: Math.round((gPerKm * annualKm) / 1000),
      perKm: gPerKm,
      color: fuel === 'ev' ? '#00D4FF' : fuel === 'hybrid' ? '#00E676'
        : fuel === 'cng' ? '#FFB300' : fuel === 'diesel' ? '#9C27B0' : '#FF6B35',
    }))
  }, [annualKm, years])

  const evData = totalData.find(d => d.fuel === 'EV')!
  const petrolData = totalData.find(d => d.fuel === 'PETROL')!
  const co2SavedKg = petrolData.total - evData.total
  const treesEquiv = Math.round(co2SavedKg / 21) // ~21kg CO2 per tree/year

  // Pie chart data
  const pieData = totalData.map(d => ({ name: d.fuel, value: d.total, color: d.color }))

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-display-xs mb-1">Carbon Footprint Comparison</h2>
        <p className="text-text-muted text-sm">See how much CO₂ each fuel type emits over your ownership period</p>
      </div>

      {/* Controls */}
      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
        <div className="glass rounded-2xl p-5">
          <Slider id="carbon-km" label="Annual Driving Distance" min={5000} max={50000} step={1000}
            value={annualKm} onChange={setAnnualKm} suffix=" km" />
        </div>
        <div className="glass rounded-2xl p-5">
          <Slider id="carbon-years" label="Ownership Period" min={1} max={10} step={1}
            value={years} onChange={setYears} suffix=" yrs" />
        </div>
      </div>

      {/* Impact banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border border-success/30 text-center"
        style={{ background: 'rgba(0,230,118,0.04)' }}
      >
        <Leaf className="w-8 h-8 text-success mx-auto mb-3" />
        <p className="text-sm text-text-muted mb-1">By choosing EV over Petrol, you save</p>
        <p className="text-4xl font-black text-success font-mono">{(co2SavedKg / 1000).toFixed(1)} tonnes CO₂</p>
        <p className="text-sm text-text-dim mt-2">
          That's equivalent to planting <span className="font-bold text-success">{treesEquiv} trees</span> 🌳
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold text-text-primary mb-5 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-success" />
            Total CO₂ Emissions ({years} years)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={totalData} barSize={40} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.4)" horizontal={false} />
              <XAxis type="number"
                tickFormatter={v => `${(Number(v) / 1000).toFixed(1)}t`}
                tick={{ fontSize: 10, fill: '#8B9EC7' }} axisLine={false} tickLine={false}
              />
              <YAxis dataKey="fuel" type="category"
                tick={{ fontSize: 11, fill: '#8B9EC7' }} axisLine={false} tickLine={false} width={65}
              />
              <Tooltip
                formatter={(v) => [`${Number(v).toLocaleString('en-IN')} kg CO₂`, ''] as [string, string]}
                contentStyle={{
                  background: 'rgba(13,27,42,0.97)', border: '1px solid rgba(30,58,95,0.8)',
                  borderRadius: '12px', fontSize: '12px', color: '#F0F4FF',
                }}
              />
              <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                {totalData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart + cards */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold text-text-primary mb-4">Emission Share</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${Number(v).toLocaleString('en-IN')} kg`, ''] as [string, string]}
                  contentStyle={{
                    background: 'rgba(13,27,42,0.97)', border: '1px solid rgba(30,58,95,0.8)',
                    borderRadius: '12px', fontSize: '12px', color: '#F0F4FF',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {totalData.map(d => (
                <span key={d.fuel} className="flex items-center gap-1.5 text-[11px] text-text-muted">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.fuel}
                </span>
              ))}
            </div>
          </div>

          {/* Per km cards */}
          <div className="grid grid-cols-2 gap-3">
            {totalData.filter(d => ['EV', 'PETROL'].includes(d.fuel)).map(d => (
              <div key={d.fuel} className="glass rounded-xl p-4 text-center">
                <p className="text-[10px] text-text-dim uppercase tracking-widest mb-1">{d.fuel} per km</p>
                <p className="text-2xl font-black font-mono" style={{ color: d.color }}>{d.perKm}g</p>
                <p className="text-[10px] text-text-dim">CO₂/km</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. MOCK CHARGING STATION MAP
// ═══════════════════════════════════════════════════════════════════════════
interface ChargingStation {
  id: string
  name: string
  operator: string
  type: 'DC Fast' | 'AC Level 2' | 'Tesla SC'
  power: string
  available: number
  total: number
  x: number // % position on map
  y: number
  city: string
  address: string
  pricePerUnit: number
}

const STATIONS: ChargingStation[] = [
  { id: 's1', name: 'Tata Power EZ Charge', operator: 'Tata Power', type: 'DC Fast', power: '50 kW', available: 3, total: 4, x: 28, y: 32, city: 'Delhi', address: 'Connaught Place, Delhi', pricePerUnit: 18 },
  { id: 's2', name: 'Ather Grid Station', operator: 'Ather', type: 'AC Level 2', power: '7.4 kW', available: 2, total: 2, x: 72, y: 24, city: 'Delhi', address: 'Saket Mall, Delhi', pricePerUnit: 12 },
  { id: 's3', name: 'EESL Charging Hub', operator: 'EESL', type: 'DC Fast', power: '60 kW', available: 1, total: 3, x: 45, y: 55, city: 'Mumbai', address: 'BKC, Mumbai', pricePerUnit: 16 },
  { id: 's4', name: 'Fortum Charge Point', operator: 'Fortum', type: 'DC Fast', power: '50 kW', available: 2, total: 2, x: 18, y: 68, city: 'Mumbai', address: 'Andheri East, Mumbai', pricePerUnit: 15 },
  { id: 's5', name: 'Tata Power EZ Charge', operator: 'Tata Power', type: 'AC Level 2', power: '22 kW', available: 4, total: 6, x: 82, y: 48, city: 'Bangalore', address: 'Koramangala, Bangalore', pricePerUnit: 14 },
  { id: 's6', name: 'MG eStation', operator: 'MG Motors', type: 'DC Fast', power: '50 kW', available: 0, total: 2, x: 55, y: 78, city: 'Bangalore', address: 'Whitefield, Bangalore', pricePerUnit: 17 },
  { id: 's7', name: 'ChargeZone Hub', operator: 'ChargeZone', type: 'DC Fast', power: '120 kW', available: 2, total: 3, x: 35, y: 42, city: 'Pune', address: 'Hinjewadi IT Park, Pune', pricePerUnit: 20 },
  { id: 's8', name: 'Kazam EV Station', operator: 'Kazam', type: 'AC Level 2', power: '7.4 kW', available: 1, total: 2, x: 65, y: 62, city: 'Hyderabad', address: 'HITEC City, Hyderabad', pricePerUnit: 11 },
  { id: 's9', name: 'Statiq Charging Point', operator: 'Statiq', type: 'DC Fast', power: '30 kW', available: 2, total: 2, x: 48, y: 28, city: 'Gurugram', address: 'Cyber Hub, Gurugram', pricePerUnit: 16 },
  { id: 's10', name: 'Jio-bp Pulse', operator: 'Jio-bp', type: 'DC Fast', power: '60 kW', available: 3, total: 4, x: 22, y: 85, city: 'Chennai', address: 'OMR Road, Chennai', pricePerUnit: 15 },
  { id: 's11', name: 'ElectricPe Hub', operator: 'ElectricPe', type: 'AC Level 2', power: '22 kW', available: 2, total: 4, x: 78, y: 72, city: 'Kolkata', address: 'Salt Lake, Kolkata', pricePerUnit: 13 },
  { id: 's12', name: 'BPCL e-Fast', operator: 'BPCL', type: 'DC Fast', power: '50 kW', available: 1, total: 2, x: 40, y: 15, city: 'Chandigarh', address: 'Sector 17, Chandigarh', pricePerUnit: 14 },
]

function ChargingMap() {
  const [selected, setSelected] = useState<ChargingStation | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCity, setFilterCity] = useState<string>('all')

  const cities = [...new Set(STATIONS.map(s => s.city))].sort()
  const types = [...new Set(STATIONS.map(s => s.type))]

  const filtered = STATIONS.filter(s =>
    (filterType === 'all' || s.type === filterType) &&
    (filterCity === 'all' || s.city === filterCity)
  )

  const totalAvailable = filtered.reduce((s, st) => s + st.available, 0)
  const totalPorts = filtered.reduce((s, st) => s + st.total, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-display-xs mb-1">EV Charging Stations</h2>
        <p className="text-text-muted text-sm">
          Find charging points near you <span className="text-warning text-xs">(Mock data — for demonstration)</span>
        </p>
      </div>

      {/* Filters + stats */}
      <div className="flex flex-wrap items-center gap-3">
        {/* City filter */}
        <div className="relative">
          <select
            value={filterCity}
            onChange={e => setFilterCity(e.target.value)}
            className="appearance-none bg-surface/50 border border-border/40 rounded-xl px-4 py-2 pr-8
              text-sm text-text-primary outline-none focus:border-accent/60 transition-colors cursor-pointer"
          >
            <option value="all">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim pointer-events-none" />
        </div>

        {/* Type pills */}
        <div className="flex gap-2">
          <button onClick={() => setFilterType('all')}
            className={clsx('px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
              filterType === 'all' ? 'bg-accent/15 border-accent text-accent' : 'border-border/40 text-text-muted hover:border-accent/30')}>
            All Types
          </button>
          {types.map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={clsx('px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                filterType === t ? 'bg-accent/15 border-accent text-accent' : 'border-border/40 text-text-muted hover:border-accent/30')}>
              {t}
            </button>
          ))}
        </div>

        {/* Quick stats */}
        <div className="ml-auto flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success" /> {totalAvailable} available
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {filtered.length} stations
          </span>
          <span>{totalPorts} total ports</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Map area */}
        <div className="glass rounded-2xl border border-border/40 relative overflow-hidden"
          style={{ minHeight: '480px' }}>
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          {/* Gradient background to simulate map */}
          <div className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 40% 40%, rgba(0,212,255,0.04) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(0,230,118,0.03) 0%, transparent 50%)',
            }}
          />

          {/* City labels (pseudo map) */}
          {([
            { name: 'Delhi NCR', x: 35, y: 25 },
            { name: 'Mumbai', x: 30, y: 60 },
            { name: 'Bangalore', x: 70, y: 65 },
            { name: 'Hyderabad', x: 62, y: 55 },
            { name: 'Chennai', x: 25, y: 82 },
            { name: 'Kolkata', x: 78, y: 68 },
            { name: 'Pune', x: 35, y: 48 },
            { name: 'Chandigarh', x: 40, y: 12 },
          ]).map(city => (
            <span key={city.name}
              className="absolute text-[10px] text-text-dim/50 font-semibold pointer-events-none"
              style={{ left: `${city.x}%`, top: `${city.y}%`, transform: 'translate(-50%, -50%)' }}>
              {city.name}
            </span>
          ))}

          {/* Station markers */}
          {filtered.map(station => {
            const isSelected = selected?.id === station.id
            const avail = station.available > 0
            return (
              <motion.button
                key={station.id}
                onClick={() => setSelected(isSelected ? null : station)}
                className="absolute z-10"
                style={{ left: `${station.x}%`, top: `${station.y}%`, transform: 'translate(-50%, -50%)' }}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Pulse ring for available stations */}
                {avail && (
                  <span className="absolute inset-0 rounded-full animate-ping opacity-20"
                    style={{ backgroundColor: avail ? '#00E676' : '#FF3B3B' }} />
                )}
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg transition-all',
                  isSelected ? 'border-accent bg-accent/30 scale-125' :
                    avail ? 'border-success/60 bg-success/20' : 'border-danger/60 bg-danger/20',
                )}>
                  <Zap className={clsx(
                    'w-3.5 h-3.5',
                    avail ? 'text-success' : 'text-danger',
                  )} />
                </div>
                {/* Tooltip */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 glass-strong rounded-xl p-3 border border-accent/30 text-left z-20"
                  >
                    <p className="text-xs font-bold text-accent truncate">{station.name}</p>
                    <p className="text-[10px] text-text-dim">{station.address}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={clsx('text-[10px] font-bold', avail ? 'text-success' : 'text-danger')}>
                        {station.available}/{station.total} open
                      </span>
                      <span className="text-[10px] text-text-dim">· {station.power}</span>
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-2 h-2 rotate-45 bg-[rgba(13,27,42,0.97)] border-r border-b border-accent/30" />
                  </motion.div>
                )}
              </motion.button>
            )
          })}

          {/* Map legend */}
          <div className="absolute bottom-4 left-4 glass rounded-xl p-3 text-[10px] space-y-1.5">
            <p className="font-bold text-text-muted uppercase tracking-widest text-[9px]">Legend</p>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-success/30 border border-success/60" />
              <span className="text-text-muted">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-danger/30 border border-danger/60" />
              <span className="text-text-muted">Occupied / Offline</span>
            </div>
          </div>
        </div>

        {/* Station list */}
        <div className="space-y-3 max-h-[480px] overflow-y-auto no-scrollbar pr-1">
          <p className="text-xs font-bold text-accent uppercase tracking-widest sticky top-0 bg-primary py-2 z-10">
            Nearby Stations ({filtered.length})
          </p>
          {filtered.map(station => {
            const avail = station.available > 0
            const isSelected = selected?.id === station.id
            return (
              <motion.button
                key={station.id}
                onClick={() => setSelected(isSelected ? null : station)}
                className={clsx(
                  'w-full glass rounded-xl p-4 text-left border transition-all',
                  isSelected ? 'border-accent/40 bg-accent/5' : 'border-border/30 hover:border-accent/20',
                )}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">{station.name}</p>
                    <p className="text-[10px] text-text-dim mt-0.5">{station.address}</p>
                  </div>
                  <span className={clsx(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0',
                    avail ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger',
                  )}>
                    {station.available}/{station.total}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted">
                  <span className="flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> {station.type}
                  </span>
                  <span>{station.power}</span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-2.5 h-2.5" /> ₹{station.pricePerUnit}/kWh
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. "SHOULD I SWITCH TO EV?" AI RECOMMENDATION
// ═══════════════════════════════════════════════════════════════════════════
function ShouldISwitchEV() {
  const [dailyKm, setDailyKm] = useState(40)
  const [budget, setBudget] = useState(18)
  const [chargingAccess, setChargingAccess] = useState<'home' | 'public' | 'both' | 'none'>('home')
  const [drivingType, setDrivingType] = useState<'city' | 'highway' | 'mixed'>('city')
  const [currentFuel, setCurrentFuel] = useState(105)
  const [longTrips, setLongTrips] = useState(false)
  const [envPriority, setEnvPriority] = useState(true)
  const [showResult, setShowResult] = useState(false)

  const generateRecommendation = useCallback(() => {
    setShowResult(true)
  }, [])

  // Score calculation
  const score = useMemo(() => {
    let s = 50 // base

    // Daily km: EVs great for <80km/day
    if (dailyKm <= 60) s += 15
    else if (dailyKm <= 100) s += 8
    else s -= 5

    // Budget: EVs start at ~10L
    if (budget >= 15) s += 12
    else if (budget >= 10) s += 5
    else s -= 10

    // Charging access
    if (chargingAccess === 'both') s += 15
    else if (chargingAccess === 'home') s += 12
    else if (chargingAccess === 'public') s += 5
    else s -= 15

    // Driving type
    if (drivingType === 'city') s += 10
    else if (drivingType === 'mixed') s += 5
    else s -= 3

    // Fuel price sensitivity
    if (currentFuel >= 110) s += 8
    else if (currentFuel >= 100) s += 4

    // Long trips
    if (longTrips) s -= 8

    // Environment priority
    if (envPriority) s += 8

    return Math.min(100, Math.max(0, s))
  }, [dailyKm, budget, chargingAccess, drivingType, currentFuel, longTrips, envPriority])

  const verdict = score >= 75 ? 'Strongly Recommended' :
    score >= 55 ? 'Good Fit' :
      score >= 40 ? 'Consider Carefully' : 'Not Ideal Yet'

  const verdictColor = score >= 75 ? '#00E676' :
    score >= 55 ? '#00D4FF' :
      score >= 40 ? '#FFB300' : '#FF3B3B'

  const verdictIcon = score >= 75 ? CheckCircle2 :
    score >= 55 ? Zap :
      score >= 40 ? AlertTriangle : XCircle

  const VerdictIcon = verdictIcon

  // Pro/con factors
  const pros = useMemo(() => {
    const p: string[] = []
    if (dailyKm <= 80) p.push('Your daily commute is well within EV range')
    if (chargingAccess === 'home' || chargingAccess === 'both') p.push('Home charging makes overnight charging convenient')
    if (drivingType === 'city') p.push('City driving maximizes EV efficiency with regen braking')
    if (currentFuel >= 110) p.push('High fuel prices make EV running costs significantly lower')
    if (envPriority) p.push('EVs produce zero tailpipe emissions, reducing your carbon footprint')
    if (budget >= 15) p.push('Your budget covers many excellent EV options in the market')
    if (!longTrips) p.push('No long-distance requirements means range anxiety is minimal')
    return p
  }, [dailyKm, chargingAccess, drivingType, currentFuel, envPriority, budget, longTrips])

  const cons = useMemo(() => {
    const c: string[] = []
    if (dailyKm > 100) c.push('High daily km may require frequent charging')
    if (chargingAccess === 'none') c.push('No charging access is a major hurdle — consider installing home charger')
    if (chargingAccess === 'public') c.push('Relying only on public charging can be inconvenient')
    if (drivingType === 'highway') c.push('Highway driving at high speeds reduces EV efficiency')
    if (budget < 12) c.push('Limited EV options under ₹12L — Tiago EV is your best bet')
    if (longTrips) c.push('Long trips require planning around charging stops')
    if (currentFuel < 95) c.push('Low fuel prices reduce the cost advantage of EVs')
    return c
  }, [dailyKm, chargingAccess, drivingType, budget, longTrips, currentFuel])

  // EV suggestions based on budget
  const suggestions = useMemo(() => {
    if (budget < 12) return ['Tata Tiago EV']
    if (budget < 18) return ['Tata Nexon EV', 'MG Comet EV']
    if (budget < 25) return ['Tata Nexon EV Max', 'MG ZS EV', 'Hyundai Kona']
    return ['BYD Atto 3', 'MG ZS EV', 'BMW iX1', 'Tata Nexon EV Max AWD']
  }, [budget])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-display-xs mb-1 flex items-center gap-2">
          Should I Switch to EV?
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-bold border border-accent/30">
            AI Powered
          </span>
        </h2>
        <p className="text-text-muted text-sm">Answer a few questions and get a personalized recommendation</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Questionnaire */}
        <div className="glass rounded-2xl p-6 space-y-6 border border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-black text-accent uppercase tracking-widest">Your Profile</h3>
          </div>

          <Slider id="switch-km" label="Daily Commute Distance" min={5} max={200} step={5}
            value={dailyKm} onChange={setDailyKm} suffix=" km" />

          <Slider id="switch-budget" label="Car Budget" min={6} max={60} step={0.5}
            value={budget} onChange={setBudget} suffix="L" />

          <Slider id="switch-fuel" label="Current Petrol Price" min={85} max={130} step={1}
            value={currentFuel} onChange={setCurrentFuel} suffix=" ₹/L" color="#FF6B35" />

          {/* Charging Access */}
          <div>
            <p className="text-sm font-semibold text-text-secondary mb-2">Charging Access</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([
                { id: 'home' as const, label: 'Home', icon: '🏠' },
                { id: 'public' as const, label: 'Public Only', icon: '🔌' },
                { id: 'both' as const, label: 'Both', icon: '⚡' },
                { id: 'none' as const, label: 'None', icon: '❌' },
              ]).map(opt => (
                <button key={opt.id} onClick={() => setChargingAccess(opt.id)}
                  className={clsx(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all',
                    chargingAccess === opt.id
                      ? 'bg-accent/15 border-accent/40 text-accent'
                      : 'border-border/40 text-text-muted hover:border-accent/30',
                  )}>
                  <span className="text-lg">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Driving type */}
          <div>
            <p className="text-sm font-semibold text-text-secondary mb-2">Primary Driving Type</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'city' as const, label: 'City', icon: '🏙️' },
                { id: 'highway' as const, label: 'Highway', icon: '🛣️' },
                { id: 'mixed' as const, label: 'Mixed', icon: '🔄' },
              ]).map(opt => (
                <button key={opt.id} onClick={() => setDrivingType(opt.id)}
                  className={clsx(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all',
                    drivingType === opt.id
                      ? 'bg-accent/15 border-accent/40 text-accent'
                      : 'border-border/40 text-text-muted hover:border-accent/30',
                  )}>
                  <span className="text-lg">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle questions */}
          <div className="space-y-3">
            {([
              { label: 'Do you take frequent long trips (>300km)?', value: longTrips, set: setLongTrips, icon: Mountain },
              { label: 'Is environmental impact a priority?', value: envPriority, set: setEnvPriority, icon: Leaf },
            ]).map(q => (
              <div key={q.label} className="flex items-center justify-between p-3 rounded-xl bg-surface/30">
                <span className="flex items-center gap-2 text-sm text-text-secondary">
                  <q.icon className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-xs">{q.label}</span>
                </span>
                <button onClick={() => q.set(!q.value)}
                  className={clsx(
                    'relative w-11 h-6 rounded-full border-2 transition-all duration-200',
                    q.value ? 'bg-accent border-accent' : 'bg-surface border-border/60',
                  )}>
                  <span className={clsx(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200',
                    q.value ? 'left-[22px]' : 'left-0.5',
                  )} />
                </button>
              </div>
            ))}
          </div>

          {/* Generate button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateRecommendation}
            className="btn btn-primary btn-lg w-full gap-2"
          >
            <Bot className="w-5 h-5" />
            Get AI Recommendation
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Result panel */}
        <div className="space-y-5">
          <AnimatePresence mode="wait">
            {showResult ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16 }}
                className="space-y-5"
              >
                {/* Score card */}
                <div className="glass rounded-2xl p-6 text-center border-2 relative overflow-hidden"
                  style={{ borderColor: `${verdictColor}40` }}>
                  <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${verdictColor}15, transparent 70%)` }} />

                  <VerdictIcon className="w-10 h-10 mx-auto mb-3" style={{ color: verdictColor }} />
                  <p className="text-xs uppercase tracking-widest text-text-dim mb-2">EV Suitability Score</p>

                  {/* Score circle */}
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <svg width="140" height="140" className="transform -rotate-90">
                      <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                      <motion.circle
                        cx="70" cy="70" r="58"
                        fill="none" stroke={verdictColor} strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 58}
                        initial={{ strokeDashoffset: 2 * Math.PI * 58 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 58 * (1 - score / 100) }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        key={score}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-4xl font-black font-mono"
                        style={{ color: verdictColor }}
                      >
                        {score}
                      </motion.span>
                      <span className="text-[10px] text-text-dim">/100</span>
                    </div>
                  </div>

                  <p className="text-lg font-black" style={{ color: verdictColor }}>{verdict}</p>
                </div>

                {/* Pros */}
                {pros.length > 0 && (
                  <div className="glass rounded-xl p-4 space-y-2.5">
                    <p className="text-xs font-bold text-success uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Why EV Works for You
                    </p>
                    {pros.map((p, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-2 text-xs text-text-secondary"
                      >
                        <CheckCircle2 className="w-3 h-3 text-success shrink-0 mt-0.5" />
                        {p}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Cons */}
                {cons.length > 0 && (
                  <div className="glass rounded-xl p-4 space-y-2.5">
                    <p className="text-xs font-bold text-warning uppercase tracking-widest flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Things to Consider
                    </p>
                    {cons.map((c, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 + 0.3 }}
                        className="flex items-start gap-2 text-xs text-text-secondary"
                      >
                        <AlertTriangle className="w-3 h-3 text-warning shrink-0 mt-0.5" />
                        {c}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Suggested EVs */}
                <div className="glass rounded-xl p-4">
                  <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Recommended EVs for You
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map(car => (
                      <span key={car}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                        ⚡ {car}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Monthly savings estimate */}
                <div className="glass rounded-xl p-4 text-center border border-success/20"
                  style={{ background: 'rgba(0,230,118,0.04)' }}>
                  <p className="text-[10px] text-text-dim uppercase tracking-widest mb-1">Estimated Monthly Fuel Savings</p>
                  <p className="text-2xl font-black text-success font-mono">
                    ₹{Math.round((dailyKm * 30 / 16 * currentFuel) - (dailyKm * 30 / 6.5 * 8)).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-text-dim mt-1">vs petrol at ₹{currentFuel}/L (assuming 16 kmpl)</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-10 text-center border border-border/30"
              >
                <Bot className="w-12 h-12 text-accent/30 mx-auto mb-4" />
                <p className="text-sm font-bold text-text-muted">Answer the questions and click</p>
                <p className="text-sm font-bold text-accent mt-1">"Get AI Recommendation"</p>
                <p className="text-xs text-text-dim mt-3">
                  Our AI analyzes your driving habits, budget, and charging access to give you a personalized EV readiness score.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EV TOOLS PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function EVTools() {
  const [activeTab, setActiveTab] = useState<EVToolTab>('cost')

  return (
    <div className="page-enter section-wrapper py-10 pb-20">
      {/* Page Header */}
      <div className="mb-8">
        <span className="section-tag mb-3 inline-flex">
          <Zap className="w-3.5 h-3.5" /> EV Tools
        </span>
        <h1 className="text-display-md">
          Electric Vehicle <span className="gradient-text">Hub</span>
        </h1>
        <p className="text-text-muted mt-1 max-w-2xl">
          Everything you need to evaluate, compare, and plan your switch to electric. 
          Cost calculators, range estimators, carbon footprint analysis, and AI-powered recommendations.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex glass rounded-xl p-1 mb-10 gap-1 overflow-x-auto no-scrollbar w-fit max-w-full">
        {TAB_DEFS.map(tab => (
          <button
            key={tab.id}
            id={`ev-tab-${tab.id}`}
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
              <span className={clsx(
                'absolute -top-1.5 -right-1.5 text-[9px] font-black px-1 py-0.5 rounded-full leading-none',
                tab.badge === 'AI' ? 'bg-accent text-primary' : 'bg-warm text-white',
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tool panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'cost'   && <EVvsPetrolCost />}
          {activeTab === 'range'  && <RangeCalculator />}
          {activeTab === 'carbon' && <CarbonFootprint />}
          {activeTab === 'map'    && <ChargingMap />}
          {activeTab === 'switch' && <ShouldISwitchEV />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
