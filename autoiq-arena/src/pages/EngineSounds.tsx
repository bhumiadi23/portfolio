/**
 * EngineSounds — Web Audio API engine synthesizer
 *
 * Sound graph:
 *   oscillators (1x + harmonics 2x/3x/4x) → gainMix
 *   lfoOscillator → lfoGain → gainMix.gain  (AM modulation)
 *   gainMix → distortion (WaveShaper) → filter (BiquadFilter)
 *          → masterGain → analyser → AudioContext.destination
 *
 * EV path: sine oscillator at (1000 + rpm * 0.4) Hz, very low gain
 */
import {
  useState, useRef, useEffect, useCallback, type FC,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Square, Volume2, Zap, Activity, RotateCcw, ChevronDown,
} from 'lucide-react'
import { cars } from '../data/cars'
import clsx from 'clsx'
import type { Car } from '../types/car.types'

// ─── Sound profile per car archetype ─────────────────────────────────────────
interface SoundProfile {
  label:       string      // display label
  emoji:       string
  cylinders:   number      // affects firing frequency
  waveType:    OscillatorType
  harmonics:   { mult: number; gain: number }[]
  lfoBase:     number      // LFO Hz at idle (~1000 RPM)
  lfoDepth:    number      // 0-1 AM modulation depth
  distortion:  number      // 0-400
  masterGain:  number      // 0-1
  filterFreq:  number      // lowpass cutoff Hz
  maxRPM:      number
  isEV:        boolean
  accentColor: string
}

function makeCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 256
  const curve = new Float32Array(n) as Float32Array<ArrayBuffer>
  const deg   = Math.PI / 180
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x))
  }
  return curve
}

// RPM → fundamental frequency (4-stroke firing: rpm * cylinders / 120)
// We multiply by 1.5 to push into audible range since sub-100Hz is hard to hear
function rpmToFreq(rpm: number, cylinders: number, mult = 1): number {
  return (rpm * cylinders / 120) * mult
}

function getProfile(car: Car): SoundProfile {
  const { segment, fuelType, engine } = car

  if (fuelType === 'Electric' || (car.isEV === true)) {
    return {
      label: 'Electric Whine', emoji: '⚡', cylinders: 0,
      waveType: 'sine', harmonics: [{ mult: 2, gain: 0.08 }],
      lfoBase: 0, lfoDepth: 0, distortion: 0, masterGain: 0.04,
      filterFreq: 6000, maxRPM: 12000, isEV: true, accentColor: '#00E676',
    }
  }
  if (fuelType === 'Diesel') {
    return {
      label: 'Diesel Rumble', emoji: '🛢️', cylinders: engine.cylinders || 4,
      waveType: 'sawtooth', harmonics: [
        { mult: 2, gain: 0.55 }, { mult: 3, gain: 0.35 },
        { mult: 4, gain: 0.2 }, { mult: 6, gain: 0.1 },
      ],
      lfoBase: (engine.cylinders || 4) * 7, lfoDepth: 0.45,
      distortion: 180, masterGain: 0.18,
      filterFreq: 900, maxRPM: 4500, isEV: false, accentColor: '#FFB300',
    }
  }
  if (fuelType === 'Hybrid') {
    return {
      label: 'Hybrid Hum', emoji: '🔋', cylinders: engine.cylinders || 4,
      waveType: 'sine', harmonics: [
        { mult: 2, gain: 0.3 }, { mult: 3, gain: 0.12 },
      ],
      lfoBase: (engine.cylinders || 4) * 7, lfoDepth: 0.1,
      distortion: 20, masterGain: 0.07,
      filterFreq: 2200, maxRPM: 6000, isEV: false, accentColor: '#64FFDA',
    }
  }
  // Petrol variants by segment
  if (segment === 'Luxury SUV' || (segment === 'Sedan' && engine.cc > 2000)) {
    return {
      label: 'Silky V6', emoji: '👑', cylinders: 6,
      waveType: 'sawtooth', harmonics: [
        { mult: 2, gain: 0.5 }, { mult: 3, gain: 0.3 },
        { mult: 4, gain: 0.18 }, { mult: 6, gain: 0.08 },
      ],
      lfoBase: 6 * 9, lfoDepth: 0.18, distortion: 60,
      masterGain: 0.13, filterFreq: 2000, maxRPM: 7000,
      isEV: false, accentColor: '#9C27B0',
    }
  }
  if (segment === 'Coupe') {
    return {
      label: 'Racing Growl', emoji: '🏎️', cylinders: 6,
      waveType: 'sawtooth', harmonics: [
        { mult: 2, gain: 0.7 }, { mult: 3, gain: 0.5 },
        { mult: 4, gain: 0.35 }, { mult: 5, gain: 0.2 },
        { mult: 6, gain: 0.1 },
      ],
      lfoBase: 6 * 9, lfoDepth: 0.3, distortion: 280,
      masterGain: 0.2, filterFreq: 4000, maxRPM: 8000,
      isEV: false, accentColor: '#FF3B3B',
    }
  }
  if (segment === 'SUV' || segment === 'MUV') {
    return {
      label: 'SUV Roar', emoji: '🚙', cylinders: engine.cylinders || 4,
      waveType: 'sawtooth', harmonics: [
        { mult: 2, gain: 0.55 }, { mult: 3, gain: 0.28 },
        { mult: 4, gain: 0.14 },
      ],
      lfoBase: (engine.cylinders || 4) * 8, lfoDepth: 0.25, distortion: 100,
      masterGain: 0.15, filterFreq: 1400, maxRPM: 6500,
      isEV: false, accentColor: '#FF6B35',
    }
  }
  if (segment === 'Sedan') {
    return {
      label: 'Petrol Purr', emoji: '🚗', cylinders: engine.cylinders || 4,
      waveType: 'sawtooth', harmonics: [
        { mult: 2, gain: 0.5 }, { mult: 3, gain: 0.25 }, { mult: 4, gain: 0.12 },
      ],
      lfoBase: (engine.cylinders || 4) * 8, lfoDepth: 0.2, distortion: 70,
      masterGain: 0.13, filterFreq: 1800, maxRPM: 7000,
      isEV: false, accentColor: '#00D4FF',
    }
  }
  // Hatchback (default)
  return {
    label: '4-Cyl Buzz', emoji: '🏙️', cylinders: engine.cylinders || 4,
    waveType: 'sawtooth', harmonics: [
      { mult: 2, gain: 0.6 }, { mult: 3, gain: 0.3 }, { mult: 4, gain: 0.15 },
    ],
    lfoBase: (engine.cylinders || 4) * 8, lfoDepth: 0.22, distortion: 85,
    masterGain: 0.12, filterFreq: 1600, maxRPM: 6500,
    isEV: false, accentColor: '#00D4FF',
  }
}

// ─── Audio engine (imperative Web Audio management) ──────────────────────────
interface AudioNodes {
  oscs:       OscillatorNode[]
  lfo:        OscillatorNode | null
  lfoGain:    GainNode | null
  gainMix:    GainNode
  distortion: WaveShaperNode
  filter:     BiquadFilterNode
  master:     GainNode
  analyser:   AnalyserNode
}

function startAudio(
  ctx:     AudioContext,
  profile: SoundProfile,
  rpm:     number,
): AudioNodes {
  const analyser   = ctx.createAnalyser()
  analyser.fftSize = 2048

  const master = ctx.createGain()
  master.gain.value = profile.masterGain
  master.connect(analyser)
  analyser.connect(ctx.destination)

  const filter  = ctx.createBiquadFilter()
  filter.type   = 'lowpass'
  filter.frequency.value = profile.filterFreq
  filter.Q.value         = 1.2
  filter.connect(master)

  const distortion   = ctx.createWaveShaper()
  distortion.curve   = makeCurve(profile.distortion)
  distortion.oversample = '2x'
  distortion.connect(filter)

  const gainMix = ctx.createGain()
  gainMix.gain.value = 1
  gainMix.connect(distortion)

  const oscs: OscillatorNode[] = []

  if (profile.isEV) {
    // EV: high-pitch electric whine
    const evFreq = 1000 + rpm * 0.4
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = evFreq
    const g = ctx.createGain(); g.gain.value = 1
    o.connect(g); g.connect(gainMix)
    o.start(); oscs.push(o)
    // subtle harmonic
    const o2 = ctx.createOscillator()
    o2.type = 'sine'
    o2.frequency.value = evFreq * 2
    const g2 = ctx.createGain(); g2.gain.value = 0.08
    o2.connect(g2); g2.connect(gainMix)
    o2.start(); oscs.push(o2)
  } else {
    const fundamental = rpmToFreq(rpm, profile.cylinders, 1.8)
    // Main oscillator
    const o0 = ctx.createOscillator()
    o0.type = profile.waveType
    o0.frequency.value = fundamental
    const g0 = ctx.createGain(); g0.gain.value = 1
    o0.connect(g0); g0.connect(gainMix)
    o0.start(); oscs.push(o0)
    // Harmonic oscillators
    for (const h of profile.harmonics) {
      const oh = ctx.createOscillator()
      oh.type = profile.waveType
      oh.frequency.value = fundamental * h.mult
      const gh = ctx.createGain(); gh.gain.value = h.gain
      oh.connect(gh); gh.connect(gainMix)
      oh.start(); oscs.push(oh)
    }
  }

  // LFO amplitude modulation (engine firing rhythm)
  let lfo:     OscillatorNode | null = null
  let lfoGain: GainNode        | null = null

  if (profile.lfoDepth > 0) {
    lfo = ctx.createOscillator()
    lfo.type            = 'sine'
    lfo.frequency.value = profile.lfoBase

    lfoGain = ctx.createGain()
    lfoGain.gain.value  = profile.lfoDepth

    lfo.connect(lfoGain)
    lfoGain.connect(gainMix.gain)
    lfo.start()
    // offset gainMix base so LFO doesn't go below 0
    gainMix.gain.value = 1 - profile.lfoDepth * 0.5
  }

  return { oscs, lfo, lfoGain, gainMix, distortion, filter, master, analyser }
}

function stopAudio(nodes: AudioNodes) {
  try {
    nodes.oscs.forEach(o => { o.stop(); o.disconnect() })
    nodes.lfo?.stop(); nodes.lfo?.disconnect()
    nodes.lfoGain?.disconnect()
    nodes.gainMix.disconnect()
    nodes.distortion.disconnect()
    nodes.filter.disconnect()
    nodes.master.disconnect()
    nodes.analyser.disconnect()
  } catch { /* nodes may already be stopped */ }
}

function updateRPM(nodes: AudioNodes, profile: SoundProfile, rpm: number) {
  if (profile.isEV) {
    const evFreq = 1000 + rpm * 0.4
    nodes.oscs[0]?.frequency.setTargetAtTime(evFreq, nodes.oscs[0].context.currentTime, 0.1)
    nodes.oscs[1]?.frequency.setTargetAtTime(evFreq * 2, nodes.oscs[1].context.currentTime, 0.1)
  } else {
    const fundamental = rpmToFreq(rpm, profile.cylinders, 1.8)
    nodes.oscs[0]?.frequency.setTargetAtTime(fundamental, nodes.oscs[0].context.currentTime, 0.05)
    profile.harmonics.forEach((h, i) => {
      nodes.oscs[i + 1]?.frequency.setTargetAtTime(
        fundamental * h.mult, nodes.oscs[i + 1].context.currentTime, 0.05,
      )
    })
    if (nodes.lfo) {
      const lfoFreq = profile.lfoBase * (rpm / 1000)
      nodes.lfo.frequency.setTargetAtTime(lfoFreq, nodes.lfo.context.currentTime, 0.1)
    }
  }
}

// ─── Waveform canvas ──────────────────────────────────────────────────────────
interface WaveformProps { analyser: AnalyserNode | null; color: string; playing: boolean }

const Waveform: FC<WaveformProps> = ({ analyser, color, playing }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      const W = canvas.width  = canvas.offsetWidth  * window.devicePixelRatio
      const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = 'rgba(13,27,42,0.6)'
      ctx.fillRect(0, 0, W, H)

      if (!playing || !analyser) {
        // idle flat line
        ctx.beginPath()
        ctx.strokeStyle = `${color}40`
        ctx.lineWidth   = 2 * window.devicePixelRatio
        ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2)
        ctx.stroke()
        return
      }

      const bufferLength = analyser.fftSize
      const dataArray    = new Uint8Array(bufferLength)
      analyser.getByteTimeDomainData(dataArray)

      ctx.beginPath()
      ctx.lineWidth   = 2.5 * window.devicePixelRatio
      ctx.strokeStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur  = 12

      const sliceWidth = W / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * H) / 2
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        x += sliceWidth
      }
      ctx.lineTo(W, H / 2)
      ctx.stroke()

      // Fill gradient below the wave
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath()
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, `${color}30`)
      grad.addColorStop(1, `${color}00`)
      ctx.fillStyle = grad
      ctx.fill()
    }

    draw()
    return () => { cancelAnimationFrame(rafRef.current) }
  }, [analyser, color, playing])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-xl"
      style={{ display: 'block' }}
    />
  )
}

// ─── RPM Meter ────────────────────────────────────────────────────────────────
function RPMGauge({ rpm, maxRPM, color }: { rpm: number; maxRPM: number; color: string }) {
  const pct = rpm / maxRPM
  const circumference = 2 * Math.PI * 40
  const stroke        = circumference * (1 - pct)

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <motion.circle
          cx="50" cy="50" r="40"
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: stroke }}
          transition={{ duration: 0.1 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-black font-mono leading-none" style={{ color }}>
          {Math.round(rpm / 100) / 10}k
        </span>
        <span className="text-[9px] text-text-dim leading-none mt-0.5">RPM</span>
      </div>
    </div>
  )
}

// ─── Sound card (grid item) ───────────────────────────────────────────────────
interface SoundCardProps {
  car:       Car
  profile:   SoundProfile
  isPlaying: boolean
  onPlay:    () => void
  onStop:    () => void
}

const SoundCard: FC<SoundCardProps> = ({ car, profile, isPlaying, onPlay, onStop }) => (
  <motion.div
    layout
    whileHover={{ y: -4 }}
    className={clsx(
      'glass rounded-2xl overflow-hidden border-2 transition-colors duration-300 cursor-pointer group',
      isPlaying ? 'border-[var(--accent)] shadow-glow-sm' : 'border-border/40 hover:border-border/80',
    )}
    style={isPlaying ? { '--accent': profile.accentColor } as React.CSSProperties : {}}
  >
    {/* Car image */}
    <div className="relative h-32 overflow-hidden bg-secondary">
      <img
        src={car.images[0]} alt={car.model}
        className={clsx('w-full h-full object-cover transition-transform duration-500',
          isPlaying ? 'scale-105' : 'group-hover:scale-105')}
        onError={e => {
          (e.target as HTMLImageElement).src =
            `https://via.placeholder.com/400x128/0D1B2A/00D4FF?text=${car.brand}`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 to-transparent" />

      {/* Playing indicator */}
      {isPlaying && (
        <div className="absolute top-2 right-2 flex gap-1 items-end h-5">
          {[1, 2, 3, 2, 1].map((h, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full"
              style={{ backgroundColor: profile.accentColor }}
              animate={{ height: [`${h * 4}px`, `${h * 8}px`, `${h * 4}px`] }}
              transition={{ duration: 0.4, delay: i * 0.07, repeat: Infinity }}
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-2 left-3">
        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: profile.accentColor }}>
          {car.brand}
        </p>
        <p className="text-sm font-black text-white leading-tight">{car.model}</p>
      </div>
    </div>

    {/* Info */}
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
          style={{ color: profile.accentColor, borderColor: `${profile.accentColor}40`, background: `${profile.accentColor}12` }}>
          {profile.emoji} {profile.label}
        </span>
        <span className="text-[10px] text-text-dim font-mono">{car.engine.cc > 0 ? `${car.engine.cc}cc` : 'Electric'}</span>
      </div>
      <p className="text-[10px] text-text-dim">
        {car.engine.cylinders > 0 ? `${car.engine.cylinders}-cyl` : 'Motor'} · {car.engine.power} · {car.segment}
      </p>

      {/* Play/Stop */}
      <button
        id={`play-${car.id}`}
        onClick={isPlaying ? onStop : onPlay}
        className={clsx(
          'w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black transition-all',
          isPlaying
            ? 'bg-danger/15 border border-danger/40 text-danger hover:bg-danger/25'
            : 'bg-surface hover:opacity-80 border border-border/50 text-text-primary',
        )}
        style={!isPlaying ? { background: `${profile.accentColor}18`, borderColor: `${profile.accentColor}40`, color: profile.accentColor } : {}}
      >
        {isPlaying
          ? <><Square className="w-3.5 h-3.5" /> Stop</>
          : <><Play  className="w-3.5 h-3.5 fill-current" /> Play Engine</>
        }
      </button>
    </div>
  </motion.div>
)

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const IDLE_RPM = 1000
const SEGMENT_FILTERS = ['All', 'Hatchback', 'Sedan', 'SUV', 'MUV', 'Luxury SUV', 'Coupe', 'Electric']

export default function EngineSounds() {
  const [playingId,      setPlayingId]      = useState<string | null>(null)
  const [rpm,            setRpmState]       = useState(IDLE_RPM)
  const [isRevving,      setIsRevving]      = useState(false)
  const [segFilter,      setSegFilter]      = useState('All')
  const [showBanner,     setShowBanner]     = useState(true)

  const ctxRef       = useRef<AudioContext | null>(null)
  const nodesRef     = useRef<AudioNodes | null>(null)
  const profileRef   = useRef<SoundProfile | null>(null)
  const revIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const rpmRef       = useRef(IDLE_RPM)

  // Keep rpmRef in sync
  useEffect(() => { rpmRef.current = rpm }, [rpm])

  // AudioContext — lazy init on first user gesture
  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
      setShowBanner(false)
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  // Stop current audio
  const stopCurrent = useCallback(() => {
    if (nodesRef.current) {
      stopAudio(nodesRef.current)
      nodesRef.current = null
    }
    if (revIntervalRef.current) {
      clearInterval(revIntervalRef.current)
      revIntervalRef.current = null
    }
    setPlayingId(null)
    setRpmState(IDLE_RPM)
    setIsRevving(false)
  }, [])

  // Play a car
  const playCar = useCallback((car: Car) => {
    const ctx     = getCtx()
    if (nodesRef.current) {
      stopAudio(nodesRef.current)
      if (revIntervalRef.current) clearInterval(revIntervalRef.current)
      setIsRevving(false)
    }
    const profile         = getProfile(car)
    profileRef.current    = profile
    const nodes           = startAudio(ctx, profile, IDLE_RPM)
    nodesRef.current      = nodes
    setPlayingId(car.id)
    setRpmState(IDLE_RPM)
  }, [getCtx])

  // RPM slider change
  const handleRPMChange = useCallback((newRPM: number) => {
    setRpmState(newRPM)
    if (nodesRef.current && profileRef.current) {
      updateRPM(nodesRef.current, profileRef.current, newRPM)
    }
  }, [])

  // Rev it up!
  const revItUp = useCallback(() => {
    if (!nodesRef.current || !profileRef.current) return
    if (isRevving) return
    const profile = profileRef.current
    const target  = Math.round(profile.maxRPM * 0.88)
    setIsRevving(true)

    const start   = rpmRef.current
    const step    = 60         // ms per step
    const rise    = 1400 / step  // steps to rise
    let   tick    = 0

    const iv = setInterval(() => {
      tick++
      if (tick <= rise) {
        const newRPM = Math.round(start + (target - start) * (tick / rise) ** 0.6)
        setRpmState(newRPM)
        if (nodesRef.current && profileRef.current) updateRPM(nodesRef.current, profileRef.current, newRPM)
      } else if (tick <= rise + 8) {
        // hold at peak
      } else {
        // fall back to idle
        const fallPct = (tick - rise - 8) / 20
        const newRPM  = Math.round(target - (target - IDLE_RPM) * Math.min(fallPct, 1))
        setRpmState(newRPM)
        if (nodesRef.current && profileRef.current) updateRPM(nodesRef.current, profileRef.current, newRPM)
        if (fallPct >= 1) {
          clearInterval(iv)
          revIntervalRef.current = null
          setIsRevving(false)
        }
      }
    }, step)
    revIntervalRef.current = iv
  }, [isRevving])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCurrent()
      ctxRef.current?.close()
    }
  }, [stopCurrent])

  // Current playing car + profile
  const playingCar     = cars.find(c => c.id === playingId)
  const playingProfile = playingCar ? getProfile(playingCar) : null
  const analyserNode   = nodesRef.current?.analyser ?? null

  // Filter cars
  const filtered = cars.filter(c => {
    if (segFilter === 'All')      return true
    if (segFilter === 'Electric') return c.isEV === true || c.fuelType === 'Electric'
    return c.segment === segFilter
  })

  return (
    <div className="page-enter min-h-screen pb-20">
      {/* Header */}
      <div className="section-wrapper pt-8 pb-6">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="section-tag mb-3 inline-flex">
              <Activity className="w-3.5 h-3.5" /> Engine Sounds
            </span>
            <h1 className="text-display-md flex items-center gap-3">
              Engine Sound Library
            </h1>
            <p className="text-text-muted text-sm mt-1 max-w-xl">
              Web Audio synthesized engine sounds — hear how each car archetype sounds at any RPM.
            </p>
          </div>
        </div>

        {/* Audio permission banner */}
        <AnimatePresence>
          {showBanner && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mt-4 glass rounded-xl border border-accent/30 p-4 flex items-center gap-3"
            >
              <Volume2 className="w-5 h-5 text-accent shrink-0" />
              <p className="text-sm text-text-secondary flex-1">
                <span className="font-bold text-accent">Click any Play button</span> to activate the audio engine. Make sure your volume is on!
              </p>
              <button onClick={() => setShowBanner(false)} className="text-text-dim hover:text-text-primary">
                <ChevronDown className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* NOW PLAYING panel */}
      <AnimatePresence>
        {playingCar && playingProfile && (
          <motion.div
            key="now-playing"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="section-wrapper mb-6"
          >
            <div
              className="rounded-2xl border-2 overflow-hidden"
              style={{ borderColor: `${playingProfile.accentColor}50`, background: `${playingProfile.accentColor}08` }}
            >
              <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: `${playingProfile.accentColor}30` }}>
                {/* Animated sound bars */}
                <div className="flex gap-0.5 items-end h-5">
                  {[3, 5, 4, 6, 4, 3].map((h, i) => (
                    <motion.div key={i} className="w-1 rounded-full"
                      style={{ backgroundColor: playingProfile.accentColor }}
                      animate={{ height: [`${h * 3}px`, `${h * 5}px`, `${h * 3}px`] }}
                      transition={{ duration: 0.35, delay: i * 0.06, repeat: Infinity }}
                    />
                  ))}
                </div>
                <span className="text-sm font-black" style={{ color: playingProfile.accentColor }}>
                  NOW PLAYING
                </span>
                <span className="text-sm font-bold text-text-primary">
                  {playingCar.brand} {playingCar.model} &mdash; {playingProfile.emoji} {playingProfile.label}
                </span>
                <button onClick={stopCurrent} className="ml-auto flex items-center gap-1.5 text-xs text-danger hover:text-danger/80 font-semibold">
                  <Square className="w-3.5 h-3.5" /> Stop
                </button>
              </div>

              <div className="grid md:grid-cols-[1fr_auto_auto] gap-6 p-5 items-center">
                {/* Waveform */}
                <div className="h-28 rounded-xl overflow-hidden bg-primary/50 border border-border/30">
                  <Waveform analyser={analyserNode} color={playingProfile.accentColor} playing={!!playingId} />
                </div>

                {/* RPM Gauge */}
                <div className="flex flex-col items-center gap-2">
                  <RPMGauge rpm={rpm} maxRPM={playingProfile.maxRPM} color={playingProfile.accentColor} />
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-3 min-w-[200px]">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-muted">RPM</span>
                      <span className="font-black font-mono" style={{ color: playingProfile.accentColor }}>{rpm.toLocaleString()}</span>
                    </div>
                    <input
                      id="rpm-slider"
                      type="range"
                      min={IDLE_RPM}
                      max={playingProfile.maxRPM}
                      step={100}
                      value={rpm}
                      onChange={e => handleRPMChange(Number(e.target.value))}
                      className="w-full cursor-pointer"
                      style={{ accentColor: playingProfile.accentColor }}
                    />
                    <div className="flex justify-between text-[10px] text-text-dim mt-0.5">
                      <span>Idle</span>
                      <span>{(playingProfile.maxRPM / 1000).toFixed(0)}k RPM</span>
                    </div>
                  </div>

                  <motion.button
                    id="rev-btn"
                    onClick={revItUp}
                    disabled={isRevving}
                    whileHover={!isRevving ? { scale: 1.04 } : {}}
                    whileTap={!isRevving ? { scale: 0.96 } : {}}
                    className={clsx(
                      'flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black border-2 transition-all',
                      isRevving ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-110',
                    )}
                    style={{
                      background: isRevving ? 'transparent' : `${playingProfile.accentColor}20`,
                      borderColor: playingProfile.accentColor,
                      color: playingProfile.accentColor,
                    }}
                  >
                    {isRevving
                      ? <><RotateCcw className="w-4 h-4 animate-spin" /> Revving...</>
                      : <><Zap className="w-4 h-4" /> Rev it Up!</>
                    }
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Car grid */}
      <div className="section-wrapper">
        {/* Segment filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {SEGMENT_FILTERS.map(seg => (
            <button key={seg} onClick={() => setSegFilter(seg)}
              className={clsx(
                'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                segFilter === seg
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'bg-surface/40 border-border/50 text-text-muted hover:border-accent/40',
              )}>
              {seg === 'Electric' ? '⚡ ' : ''}{seg}
              <span className="ml-1.5 text-[10px] opacity-60">
                ({seg === 'All'
                  ? cars.length
                  : seg === 'Electric'
                    ? cars.filter(c => c.isEV || c.fuelType === 'Electric').length
                    : cars.filter(c => c.segment === seg).length})
              </span>
            </button>
          ))}
        </div>

        <motion.div layout className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(car => {
              const profile = getProfile(car)
              return (
                <motion.div
                  key={car.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.2 }}
                >
                  <SoundCard
                    car={car}
                    profile={profile}
                    isPlaying={playingId === car.id}
                    onPlay={() => playCar(car)}
                    onStop={stopCurrent}
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty */}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-text-dim">
            <p className="text-4xl mb-3">🔇</p>
            <p className="font-semibold">No cars in this category</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="section-wrapper mt-10">
        <h2 className="text-sm font-black text-text-muted uppercase tracking-widest mb-4">Sound Archetypes</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { emoji: '🏙️', label: '4-Cyl Buzz',    desc: 'Hatchbacks — light, zippy character',    color: '#00D4FF' },
            { emoji: '🚗', label: 'Petrol Purr',    desc: 'Sedans — smooth, refined note',          color: '#00D4FF' },
            { emoji: '🚙', label: 'SUV Roar',       desc: 'SUVs — throaty, road-eating rumble',     color: '#FF6B35' },
            { emoji: '🛢️', label: 'Diesel Rumble',  desc: 'Diesels — low, chugging authority',      color: '#FFB300' },
            { emoji: '👑', label: 'Silky V6',       desc: 'Luxury — refined, effortless power',     color: '#9C27B0' },
            { emoji: '🏎️', label: 'Racing Growl',   desc: 'Sports — aggressive, spine-tingling',    color: '#FF3B3B' },
            { emoji: '🔋', label: 'Hybrid Hum',     desc: 'Hybrids — quiet yet alert',              color: '#64FFDA' },
            { emoji: '⚡', label: 'Electric Whine', desc: 'EVs — jet-like, futuristic silence',     color: '#00E676' },
          ].map(a => (
            <div key={a.label} className="glass rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-xl shrink-0 mt-0.5">{a.emoji}</span>
              <div>
                <p className="text-xs font-bold" style={{ color: a.color }}>{a.label}</p>
                <p className="text-[10px] text-text-dim mt-0.5">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-text-dim mt-4 text-center">
          All sounds are synthesized in real-time using the Web Audio API — no pre-recorded files.
          Oscillators, LFO modulation, distortion, and filtering are tuned per car archetype.
        </p>
      </div>
    </div>
  )
}
