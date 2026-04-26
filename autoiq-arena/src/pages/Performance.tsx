/**
 * Performance — 0-100 kmph drag race simulator
 *
 * Physics model: v(t) = 100 * (1 - (1-t/T)^1.9)  in km/h
 *   where T = estimated 0-100 time from bhp + estimated mass.
 * Track position: normalized elapsed / T_car  (0 = start, 1 = done)
 * Speedometer: SVG arc gauge, dasharray fill + animated needle.
 */
import {
  useState, useRef, useEffect, useCallback, useMemo,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Play, RotateCcw, Zap, Flag, X, Search, Timer, ChevronDown,
} from 'lucide-react'
import { cars } from '../data/cars'
import clsx from 'clsx'
import type { Car } from '../types/car.types'

// ─── Physics ──────────────────────────────────────────────────────────────────
const parseBhp = (s: string) => Math.max(1, parseInt(s) || 100)

function estimateMassKg(car: Car): number {
  const base: Record<string, number> = {
    Hatchback: 950, Sedan: 1150, SUV: 1450,
    'Luxury SUV': 2100, Coupe: 1550, MUV: 1700,
  }
  const cc  = car.engine.cc > 0 ? car.engine.cc * 0.08 : 0
  const ev  = car.isEV ? 300 : 0
  return Math.round((base[car.segment] ?? 1200) + cc + ev)
}

function estimate0to100(car: Car): number {
  const kW   = parseBhp(car.engine.power) * 0.7457
  const mass = estimateMassKg(car)
  let t = 2.45 * Math.sqrt(mass / kW)
  if (car.fuelType === 'Electric') t *= 0.78
  else if (car.fuelType === 'Hybrid') t *= 0.90
  if (car.segment === 'Coupe') t *= 0.92
  return Math.max(4.0, Math.min(22, parseFloat(t.toFixed(1))))
}

const speedAt = (elapsed: number, T: number): number => {
  if (elapsed >= T) return 100
  return 100 * (1 - Math.pow(1 - elapsed / T, 1.9))
}

// ─── SVG Speedometer ─────────────────────────────────────────────────────────
function Speedometer({
  speed, accentColor, label, t100,
}: { speed: number; accentColor: string; label: string; t100: number }) {
  const cx = 100, cy = 100, r = 70
  const startDeg = 135, totalDeg = 270, maxSpd = 140
  const rad = (d: number) => d * Math.PI / 180

  const sx = cx + r * Math.cos(rad(startDeg))
  const sy = cy + r * Math.sin(rad(startDeg))
  const ex = cx + r * Math.cos(rad(startDeg + totalDeg))
  const ey = cy + r * Math.sin(rad(startDeg + totalDeg))
  const arcPath = `M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${r} ${r} 0 1 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`
  const arcLen  = 2 * Math.PI * r * (totalDeg / 360)
  const frac    = Math.min(speed / maxSpd, 1)
  const filled  = arcLen * frac

  const needleDeg = startDeg + frac * totalDeg
  const nl = 50
  const nx = cx + nl * Math.cos(rad(needleDeg))
  const ny = cy + nl * Math.sin(rad(needleDeg))

  // zone color
  const zoneColor = speed >= 100 ? '#FF3B3B' : speed >= 60 ? '#FFB300' : '#00E676'

  return (
    <svg viewBox="0 0 200 170" className="w-full max-w-[200px] mx-auto">
      {/* track */}
      <path d={arcPath} fill="none" stroke="#0f172a" strokeWidth="14" strokeLinecap="round" />
      {/* zone fill */}
      <path d={arcPath} fill="none" stroke={zoneColor} strokeWidth="14" strokeLinecap="round"
        strokeDasharray={`${filled.toFixed(1)} ${arcLen.toFixed(1)}`} opacity="0.22" />
      {/* accent fill */}
      <path d={arcPath} fill="none" stroke={accentColor} strokeWidth="9" strokeLinecap="round"
        strokeDasharray={`${filled.toFixed(1)} ${arcLen.toFixed(1)}`}
        style={{ transition: 'stroke-dasharray 0.05s linear' }} />

      {/* tick marks + labels */}
      {[0, 20, 40, 60, 80, 100, 120, 140].map(v => {
        const a    = rad(startDeg + (v / maxSpd) * totalDeg)
        const isMj = v % 40 === 0
        const r1   = isMj ? r - 18 : r - 11
        const lx   = cx + (r + 18) * Math.cos(a)
        const ly   = cy + (r + 18) * Math.sin(a) + 4
        return (
          <g key={v}>
            <line
              x1={(cx + r1 * Math.cos(a)).toFixed(1)} y1={(cy + r1 * Math.sin(a)).toFixed(1)}
              x2={(cx + r  * Math.cos(a)).toFixed(1)} y2={(cy + r  * Math.sin(a)).toFixed(1)}
              stroke={v <= Math.round(speed) ? accentColor : '#1e293b'}
              strokeWidth={isMj ? 2.5 : 1.5}
            />
            {isMj && (
              <text x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor="middle" fill="#475569" fontSize="9">
                {v}
              </text>
            )}
          </g>
        )
      })}

      {/* 100 marker red ring */}
      {(() => {
        const a  = rad(startDeg + (100 / maxSpd) * totalDeg)
        const mx = cx + r * Math.cos(a)
        const my = cy + r * Math.sin(a)
        return <circle cx={mx.toFixed(1)} cy={my.toFixed(1)} r="4" fill="#FF3B3B" opacity="0.7" />
      })()}

      {/* needle */}
      <line
        x1={cx} y1={cy} x2={nx.toFixed(1)} y2={ny.toFixed(1)}
        stroke="white" strokeWidth="2.5" strokeLinecap="round"
        style={{ transition: 'x2 0.05s linear, y2 0.05s linear' }}
      />
      <circle cx={cx} cy={cy} r="7" fill={accentColor} />
      <circle cx={cx} cy={cy} r="3" fill="white" />

      {/* digital speed */}
      <text x={cx} y={cy + 18} textAnchor="middle" fill="white"
        fontSize="30" fontWeight="900" fontFamily="monospace">{Math.round(speed)}</text>
      <text x={cx} y={cy + 33} textAnchor="middle" fill="#64748b" fontSize="10">km/h</text>

      {/* label */}
      <text x={cx} y={152} textAnchor="middle" fill={accentColor} fontSize="10" fontWeight="700">
        {label}
      </text>
      <text x={cx} y={164} textAnchor="middle" fill="#64748b" fontSize="9">
        est. {t100}s
      </text>
    </svg>
  )
}

// ─── Car picker ───────────────────────────────────────────────────────────────
function CarPicker({
  value, onChange, accentColor, label, disabled,
}: {
  value: Car | null
  onChange: (c: Car) => void
  accentColor: string
  label: string
  disabled?: boolean
}) {
  const [open, setOpen]     = useState(false)
  const [query, setQuery]   = useState('')
  const inputRef            = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() =>
    cars.filter(c => `${c.brand} ${c.model}`.toLowerCase().includes(query.toLowerCase())),
    [query])

  const pick = (c: Car) => { onChange(c); setOpen(false); setQuery('') }

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80)
  }, [open])

  return (
    <div className="relative flex-1">
      {/* Trigger */}
      <button
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={clsx(
          'w-full glass rounded-2xl border-2 p-4 text-left flex items-center gap-3 transition-all',
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-opacity-80',
          open ? '' : '',
        )}
        style={{ borderColor: `${accentColor}50` }}
      >
        {value ? (
          <>
            <img src={value.images[0]} alt={value.model}
              className="w-14 h-10 object-cover rounded-lg shrink-0"
              onError={e => {
                (e.target as HTMLImageElement).src =
                  `https://via.placeholder.com/56x40/0D1B2A/00D4FF?text=${value.brand[0]}`
              }} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                {value.brand}
              </p>
              <p className="font-black text-text-primary truncate">{value.model}</p>
              <p className="text-[10px] text-text-dim">{value.engine.power} · {estimate0to100(value)}s to 100</p>
            </div>
            <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
          </>
        ) : (
          <>
            <div className="w-14 h-10 rounded-lg glass border border-border/40 flex items-center justify-center shrink-0">
              <span className="text-xl">🚗</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-text-muted">{label}</p>
              <p className="text-xs text-text-dim">Select a car</p>
            </div>
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 glass-strong rounded-2xl border border-border/60 shadow-2xl overflow-hidden"
          >
            {/* Search */}
            <div className="p-3 border-b border-border/40 flex items-center gap-2">
              <Search className="w-4 h-4 text-text-muted shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search cars..."
                className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder-text-dim"
              />
              {query && (
                <button onClick={() => setQuery('')}>
                  <X className="w-3.5 h-3.5 text-text-muted" />
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-text-dim text-sm py-6">No cars found</p>
              ) : (
                filtered.map(c => {
                  const t = estimate0to100(c)
                  const isSelected = value?.id === c.id
                  return (
                    <button
                      key={c.id}
                      onClick={() => pick(c)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface/60 transition-colors text-left',
                        isSelected ? 'bg-surface/40' : '',
                      )}
                    >
                      <img src={c.images[0]} alt={c.model}
                        className="w-10 h-7 object-cover rounded shrink-0"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            `https://via.placeholder.com/40x28/0D1B2A/00D4FF?text=${c.brand[0]}`
                        }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-text-primary truncate">
                          {c.brand} {c.model}
                        </p>
                        <p className="text-[10px] text-text-dim">{c.segment} · {c.engine.power}</p>
                      </div>
                      <span className="text-xs font-mono font-bold shrink-0"
                        style={{ color: accentColor }}>{t}s</span>
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Track lane ───────────────────────────────────────────────────────────────
function TrackLane({
  car, progress, speed, accentColor, finishPct, done,
}: {
  car: Car | null; progress: number; speed: number
  accentColor: string; finishPct: number; done: boolean
}) {
  const carPct = Math.min(progress, 1) * finishPct * 100

  return (
    <div className="relative h-16 rounded-xl overflow-hidden flex items-center"
      style={{
        background: 'linear-gradient(to bottom, #0d1117 0%, #161b22 50%, #0d1117 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(255,255,255,0.05)',
      }}>
      {/* Asphalt grain overlay */}
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg,transparent,transparent 9.95%,rgba(255,255,255,0.04) 9.95%,rgba(255,255,255,0.04) 10%)' }} />

      {/* Center dash line */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px"
        style={{ backgroundImage: 'repeating-linear-gradient(to right, rgba(255,255,255,0.15) 0,rgba(255,255,255,0.15) 12px, transparent 12px, transparent 24px)' }} />

      {/* Finish line */}
      <div className="absolute top-0 bottom-0 w-1 z-10"
        style={{ left: `${finishPct * 100}%`, background: done ? accentColor : 'rgba(255,255,255,0.25)' }}>
        <Flag className="absolute -top-0.5 -left-3 w-4 h-4 text-white" />
      </div>

      {/* Speed streak */}
      {car && speed > 5 && (
        <div className="absolute top-1/2 -translate-y-1/2 h-0.5 pointer-events-none rounded-l-full"
          style={{
            right: `${100 - carPct + 2}%`,
            width: `${Math.min(speed * 0.5, carPct * 0.9)}%`,
            background: `linear-gradient(to left, ${accentColor}80, transparent)`,
            opacity: speed / 120,
            transition: 'right 0.05s linear, width 0.05s linear, opacity 0.05s linear'
          }} />
      )}

      {/* Car */}
      <div
        className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1 z-20"
        style={{ left: `${carPct}%`, transform: 'translate(-50%, -50%)', transition: 'left 0.05s linear' }}
      >
        {car ? (
          <div className="flex flex-col items-center gap-0.5">
            <div className="text-2xl leading-none"
              style={{ filter: `drop-shadow(0 0 6px ${accentColor})` }}>
              {car.isEV ? '⚡' : car.segment === 'Coupe' ? '🏎️' : car.segment === 'SUV' || car.segment === 'Luxury SUV' ? '🚙' : '🚗'}
            </div>
            <div className="text-[8px] font-black whitespace-nowrap px-1.5 py-0.5 rounded"
              style={{ background: `${accentColor}25`, color: accentColor }}>
              {car.brand} {car.model}
            </div>
          </div>
        ) : (
          <div className="w-10 h-7 rounded border border-dashed border-border/40 flex items-center justify-center text-text-dim text-xs">
            ?
          </div>
        )}
      </div>

      {/* Done checkered flag */}
      {done && (
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xl z-20"
        >
          🏁
        </motion.div>
      )}
    </div>
  )
}

// ─── Countdown overlay ────────────────────────────────────────────────────────
function CountdownOverlay({ count }: { count: number | 'GO!' }) {
  return (
    <motion.div
      key={String(count)}
      initial={{ scale: 2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
    >
      <div className="text-7xl font-black"
        style={{ color: count === 'GO!' ? '#00E676' : '#00D4FF', textShadow: `0 0 40px currentColor` }}>
        {count}
      </div>
    </motion.div>
  )
}

// ─── Result card ──────────────────────────────────────────────────────────────
function ResultCard({
  car1, car2, t100_1, t100_2,
  accentColor1, accentColor2, onReset,
}: {
  car1: Car; car2: Car
  t100_1: number; t100_2: number
  accentColor1: string; accentColor2: string
  onReset: () => void
}) {
  const tie    = Math.abs(t100_1 - t100_2) < 0.1
  const winner = tie ? null : t100_1 < t100_2 ? car1 : car2
  const loser  = tie ? null : t100_1 < t100_2 ? car2 : car1
  const lTime  = tie ? t100_2 : Math.max(t100_1, t100_2)
  const diff   = Math.abs(t100_1 - t100_2)
  const wColor = winner?.id === car1.id ? accentColor1 : accentColor2

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="glass rounded-2xl border-2 overflow-hidden"
      style={{ borderColor: `${wColor}50` }}
    >
      {/* Winner header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/30"
        style={{ background: `${wColor}10` }}>
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-3xl"
        >
          🏆
        </motion.div>
        <div>
          {tie ? (
            <p className="font-black text-xl text-text-primary">Its a Tie!</p>
          ) : (
            <>
              <p className="text-xs uppercase tracking-widest font-bold" style={{ color: wColor }}>
                Winner
              </p>
              <p className="font-black text-xl text-text-primary">
                {winner?.brand} {winner?.model}
              </p>
            </>
          )}
        </div>
        <Trophy className="w-5 h-5 ml-auto" style={{ color: wColor }} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-px bg-border/20">
        {[
          { car: car1, time: t100_1, color: accentColor1, isWinner: t100_1 <= t100_2 || tie },
          { car: car2, time: t100_2, color: accentColor2, isWinner: t100_2 <= t100_1 || tie },
        ].map(({ car, time, color, isWinner }) => (
          <div key={car.id} className="bg-primary/80 p-5 text-center">
            {isWinner && !tie && (
              <span className="inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full mb-2"
                style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
                Winner ✓
              </span>
            )}
            <p className="text-xs text-text-muted mb-1">{car.brand} {car.model}</p>
            <p className="text-3xl font-black font-mono" style={{ color }}>
              {time.toFixed(1)}s
            </p>
            <p className="text-xs text-text-dim mt-1">0 – 100 km/h</p>
            <div className="mt-3 space-y-1 text-left">
              <p className="text-[10px] text-text-dim">
                {parseBhp(car.engine.power)} bhp · {estimateMassKg(car)} kg
              </p>
              <p className="text-[10px] text-text-dim">{car.engine.power} · {car.fuelType}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Margin */}
      {!tie && winner && loser && (
        <div className="px-6 py-4 text-center border-t border-border/30">
          <p className="text-sm text-text-muted">
            <span className="font-black text-text-primary">{winner.brand} {winner.model}</span>
            {' '}wins by{' '}
            <span className="font-black" style={{ color: wColor }}>{diff.toFixed(1)}s</span>
            {' '}({((diff / lTime) * 100).toFixed(0)}% faster)
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 pb-5 flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 btn btn-secondary btn-md gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Race Again
        </button>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
type Phase = 'setup' | 'countdown' | 'racing' | 'done'

const CAR1_COLOR = '#00D4FF'
const CAR2_COLOR = '#FF6B35'

interface RaceDisplay {
  time:    number
  speed1:  number
  speed2:  number
  prog1:   number   // 0-1 fraction toward finish
  prog2:   number
  done1:   boolean
  done2:   boolean
}

export default function Performance() {
  const [phase,   setPhase]   = useState<Phase>('setup')
  const [car1,    setCar1]    = useState<Car | null>(
    () => cars.find(c => c.id === 'maruti-swift-2024') ?? null
  )
  const [car2,    setCar2]    = useState<Car | null>(
    () => cars.find(c => c.id === 'hyundai-creta-2024') ?? null
  )
  const [countdown, setCountdown] = useState<number | null>(null)
  const [race,    setRace]    = useState<RaceDisplay>({
    time:0, speed1:0, speed2:0, prog1:0, prog2:0, done1:false, done2:false,
  })

  const rafRef   = useRef<number>()
  const startRef = useRef<number>()
  const cdRef    = useRef<ReturnType<typeof setTimeout>>()

  const t100_1 = useMemo(() => car1 ? estimate0to100(car1) : 10, [car1])
  const t100_2 = useMemo(() => car2 ? estimate0to100(car2) : 10, [car2])

  // Finish line sits where the FASTER car stops (the slower car crosses it later)
  const raceDuration = Math.max(t100_1, t100_2) + 0.6
  const finishPct    = 0.82  // 82% of track width = finish line

  // ── Animation tick ──────────────────────────────────────────────────────────
  const tick = useCallback((now: number) => {
    if (!startRef.current) startRef.current = now
    const elapsed = (now - startRef.current) / 1000

    const s1 = speedAt(elapsed, t100_1)
    const s2 = speedAt(elapsed, t100_2)
    const p1 = Math.min(elapsed / t100_1, 1)
    const p2 = Math.min(elapsed / t100_2, 1)
    const d1 = s1 >= 100
    const d2 = s2 >= 100

    setRace({ time: elapsed, speed1: s1, speed2: s2, prog1: p1, prog2: p2, done1: d1, done2: d2 })

    if (elapsed >= raceDuration) {
      setPhase('done')
    } else {
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [t100_1, t100_2, raceDuration])

  // ── Start countdown → race ───────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    if (!car1 || !car2) return
    setPhase('countdown')
    setRace({ time:0, speed1:0, speed2:0, prog1:0, prog2:0, done1:false, done2:false })
    setCountdown(3)

    let c = 3
    const step = () => {
      c--
      if (c > 0) {
        setCountdown(c)
        cdRef.current = setTimeout(step, 900)
      } else {
        setCountdown(null)
        setPhase('racing')
        startRef.current = undefined
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    cdRef.current = setTimeout(step, 900)
  }, [car1, car2, tick])

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current ?? 0)
    clearTimeout(cdRef.current)
    setPhase('setup')
    setRace({ time:0, speed1:0, speed2:0, prog1:0, prog2:0, done1:false, done2:false })
    setCountdown(null)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current ?? 0)
      clearTimeout(cdRef.current)
    }
  }, [])

  const isSetup   = phase === 'setup'
  const isRunning = phase === 'racing' || phase === 'countdown'
  const isDone    = phase === 'done'

  // Timer display
  const timerStr = race.time.toFixed(2)

  return (
    <div className="page-enter min-h-screen pb-20">
      {/* Header */}
      <div className="section-wrapper pt-8 pb-6">
        <span className="section-tag mb-3 inline-flex">
          <Zap className="w-3.5 h-3.5" /> Race Simulator
        </span>
        <h1 className="text-display-md">0 – 100 Simulator</h1>
        <p className="text-text-muted text-sm mt-1 max-w-xl">
          Physics-based drag race. Select two cars, hit Start, see who dominates the sprint.
        </p>
      </div>

      <div className="section-wrapper space-y-6">

        {/* ── Car selectors ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch gap-4">
          <CarPicker
            label="Car 1 — Cyan Lane"
            value={car1}
            onChange={setCar1}
            accentColor={CAR1_COLOR}
            disabled={isRunning}
          />

          {/* VS badge */}
          <div className="flex items-center justify-center shrink-0">
            <div className="w-12 h-12 rounded-full glass border-2 border-border/40 flex items-center justify-center text-sm font-black text-text-muted">
              VS
            </div>
          </div>

          <CarPicker
            label="Car 2 — Orange Lane"
            value={car2}
            onChange={setCar2}
            accentColor={CAR2_COLOR}
            disabled={isRunning}
          />
        </div>

        {/* ── Pre-race stats row ────────────────────────────────────────────── */}
        {(car1 || car2) && isSetup && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { car: car1, t100: t100_1, color: CAR1_COLOR },
              { car: car2, t100: t100_2, color: CAR2_COLOR },
            ].map(({ car, t100, color }, idx) => car ? (
              <div key={idx} className="glass rounded-xl border border-border/40 p-4 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: '0-100', value: `${t100}s`, unit: '' },
                  { label: 'Power', value: parseBhp(car.engine.power), unit: 'bhp' },
                  { label: 'Weight', value: estimateMassKg(car), unit: 'kg' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-[10px] text-text-dim uppercase">{s.label}</p>
                    <p className="font-black text-sm font-mono" style={{ color }}>
                      {s.value}{s.unit}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div key={idx} className="glass rounded-xl border border-dashed border-border/30 p-4 flex items-center justify-center text-sm text-text-dim">
                No car selected
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Track ────────────────────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden border border-border/40">
          {/* Track label */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border/30 bg-surface/40">
            <Timer className="w-4 h-4 text-text-muted" />
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Race Track</span>
            {(isRunning || isDone) && (
              <span className="ml-auto font-black font-mono text-xl text-text-primary">
                {timerStr}s
              </span>
            )}
          </div>

          <div className="p-4 space-y-3 relative">
            {/* Countdown overlay */}
            <AnimatePresence>
              {phase === 'countdown' && countdown !== null && (
                <CountdownOverlay count={countdown} key={countdown} />
              )}
              {phase === 'countdown' && countdown === null && (
                <CountdownOverlay count="GO!" key="go" />
              )}
            </AnimatePresence>

            {/* Lane 1 */}
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: CAR1_COLOR }} />
              <div className="flex-1">
                <TrackLane
                  car={car1} progress={race.prog1} speed={race.speed1}
                  accentColor={CAR1_COLOR} finishPct={finishPct} done={race.done1}
                />
              </div>
            </div>

            {/* Lane 2 */}
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: CAR2_COLOR }} />
              <div className="flex-1">
                <TrackLane
                  car={car2} progress={race.prog2} speed={race.speed2}
                  accentColor={CAR2_COLOR} finishPct={finishPct} done={race.done2}
                />
              </div>
            </div>

            {/* Track legend */}
            <div className="flex items-center gap-4 text-[10px] text-text-dim pt-1">
              <span className="flex items-center gap-1"><Flag className="w-3 h-3" />Finish = 100 km/h reached</span>
              <span>Streak width = speed</span>
            </div>
          </div>
        </div>

        {/* ── Speedometers + timer ──────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="glass rounded-2xl border border-border/40 p-3">
            <Speedometer
              speed={race.speed1}
              accentColor={CAR1_COLOR}
              label={car1 ? `${car1.brand} ${car1.model}` : 'Car 1'}
              t100={t100_1}
            />
          </div>

          {/* Center timer */}
          <div className="text-center space-y-4">
            <motion.div
              animate={isRunning ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-4xl font-black font-mono text-text-primary"
            >
              {timerStr}s
            </motion.div>
            <p className="text-xs text-text-dim uppercase tracking-widest">Elapsed</p>

            {/* Race status dots */}
            <div className="flex justify-center gap-3">
              {[
                { done: race.done1, color: CAR1_COLOR, label: car1?.model ?? 'Car 1' },
                { done: race.done2, color: CAR2_COLOR, label: car2?.model ?? 'Car 2' },
              ].map(({ done, color, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-2.5 h-2.5 rounded-full border-2 transition-all"
                    style={{
                      borderColor: color,
                      background: done ? color : 'transparent',
                      boxShadow: done ? `0 0 8px ${color}` : 'none',
                    }} />
                  <span className="text-text-dim">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl border border-border/40 p-3">
            <Speedometer
              speed={race.speed2}
              accentColor={CAR2_COLOR}
              label={car2 ? `${car2.brand} ${car2.model}` : 'Car 2'}
              t100={t100_2}
            />
          </div>
        </div>

        {/* ── CTA buttons ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-4">
          {isSetup && (
            <motion.button
              id="start-race-btn"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={startCountdown}
              disabled={!car1 || !car2}
              className={clsx(
                'btn btn-primary btn-lg gap-3 px-10',
                (!car1 || !car2) && 'opacity-50 cursor-not-allowed',
              )}
            >
              <Play className="w-5 h-5 fill-current" />
              Start Race
            </motion.button>
          )}

          {(isRunning || isDone) && (
            <button
              id="reset-race-btn"
              onClick={reset}
              className="btn btn-ghost btn-md gap-2 text-text-muted hover:text-text-primary"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>

        {/* ── Result card ───────────────────────────────────────────────────── */}
        <AnimatePresence>
          {isDone && car1 && car2 && (
            <ResultCard
              car1={car1} car2={car2}
              t100_1={t100_1} t100_2={t100_2}
              accentColor1={CAR1_COLOR} accentColor2={CAR2_COLOR}
              onReset={reset}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
