import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { 
  Settings, Wrench, Zap, Maximize, TrendingUp, 
  ChevronDown, AlertCircle
} from 'lucide-react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts'
import { cars } from '../data/cars'
import clsx from 'clsx'

type DashTab = 'tyre' | 'mods' | 'dyno'

const TAB_DEFS: { id: DashTab; label: string; icon: React.ElementType }[] = [
  { id: 'tyre', label: 'Tyre Upgrade Calculator', icon: Maximize },
  { id: 'mods', label: 'Mod Planner', icon: Wrench },
  { id: 'dyno', label: 'Dyno Chart Viewer', icon: TrendingUp },
]

// ═══════════════════════════════════════════════════════════════════════════
// 1. TYRE SIZE CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════

function calculateTyreDiameter(width: number, aspect: number, rim: number) {
  // sidewall height in mm
  const sidewall = (width * aspect) / 100
  // complete diameter in mm
  return (rim * 25.4) + (sidewall * 2)
}

function TyreSizeCalculator() {
  const [width, setWidth] = useState<number>(205)
  const [aspect, setAspect] = useState<number>(55)
  const [rim, setRim] = useState<number>(16)

  const currentDiameter = useMemo(() => calculateTyreDiameter(width, aspect, rim), [width, aspect, rim])

  // Simple recommendations logic: keeping total diameter close to original
  const upgrades = useMemo(() => {
    const results = []
    
    // +1 Inch Upgrade
    for (let w = width - 10; w <= width + 30; w += 10) {
      for (let a = aspect - 15; a <= aspect + 5; a += 5) {
        if (a < 30 || a > 80) continue
        const dia = calculateTyreDiameter(w, a, rim + 1)
        const diff = ((dia - currentDiameter) / currentDiameter) * 100
        if (Math.abs(diff) < 2.5) { // Recommended within 2.5% or 3% diff
          results.push({ w, a, r: rim + 1, type: '+1 Upgrade', diff })
        }
      }
    }

    // +2 Inch Upgrade
    for (let w = width; w <= width + 40; w += 10) {
      for (let a = aspect - 20; a <= aspect; a += 5) {
         if (a < 30 || a > 80) continue
        const dia = calculateTyreDiameter(w, a, rim + 2)
        const diff = ((dia - currentDiameter) / currentDiameter) * 100
        if (Math.abs(diff) < 2.5) {
          results.push({ w, a, r: rim + 2, type: '+2 Upgrade', diff })
        }
      }
    }
    
    // De-dupe and best sort
    const unique = new Map()
    results.forEach(val => {
      const key = `${val.w}/${val.a} R${val.r}`
      if (!unique.has(key) || Math.abs(unique.get(key).diff) > Math.abs(val.diff)) {
         unique.set(key, val)
      }
    })
    
    // Return best 6 upgrades (3 for +1, 3 for +2 ideally) sorted by least difference
    return Array.from(unique.values()).sort((a,b) => Math.abs(a.diff) - Math.abs(b.diff)).slice(0, 6)
  }, [width, aspect, rim, currentDiameter])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-display-xs mb-1">Tyre Up-size Calculator</h2>
        <p className="text-text-muted text-sm">Find compatible wheel and tyre combinations within safety tolerances (&#60; 3% variance).</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 border border-border/30 shadow-lg space-y-6">
          <h3 className="font-bold flex items-center gap-2">
            <Maximize className="w-4 h-4 text-accent" /> Original OEM Size
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
             <div>
                <label className="text-xs text-text-dim font-bold tracking-widest uppercase mb-1 block">Width (mm)</label>
                <input type="number" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full bg-surface border border-border/40 rounded-lg px-3 py-2 text-primary font-mono text-center focus:border-accent outline-none" inputMode="numeric" />
             </div>
             <div>
                <label className="text-xs text-text-dim font-bold tracking-widest uppercase mb-1 block">Aspect Ratio</label>
                <input type="number" value={aspect} onChange={e => setAspect(Number(e.target.value))} className="w-full bg-surface border border-border/40 rounded-lg px-3 py-2 text-primary font-mono text-center focus:border-accent outline-none" inputMode="numeric" />
             </div>
             <div>
                <label className="text-xs text-text-dim font-bold tracking-widest uppercase mb-1 block">Rim (inch)</label>
                <input type="number" value={rim} onChange={e => setRim(Number(e.target.value))} className="w-full bg-surface border border-border/40 rounded-lg px-3 py-2 text-primary font-mono text-center focus:border-accent outline-none" inputMode="numeric" />
             </div>
          </div>

          <div className="bg-primary border border-accent/20 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent opacity-50" />
             <p className="text-xs text-text-muted uppercase tracking-widest relative z-10">Total Diameter</p>
             <p className="text-4xl font-black text-accent font-mono mt-1 relative z-10">{currentDiameter.toFixed(1)} <span className="text-lg text-text-dim">mm</span></p>
             <p className="text-xs text-text-dim mt-2 font-mono">{width} / {aspect} R{rim}</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-border/30 h-full flex flex-col">
           <h3 className="font-bold flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-success" /> Recommended Upgrades
          </h3>
          {upgrades.length > 0 ? (
            <div className="flex-1 grid grid-cols-2 gap-3">
              {upgrades.map((u, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={clsx(
                    "p-4 rounded-xl border relative overflow-hidden group hover:border-success/40 transition-colors bg-secondary/80",
                     Math.abs(u.diff) < 1.0 ? "border-success/30" : "border-border/30"
                  )}
                >
                  <p className="text-[10px] font-bold tracking-widest uppercase text-text-dim">{u.type}</p>
                  <p className="text-lg font-black font-mono text-text-primary mt-1 group-hover:text-success transition-colors">
                    {u.w}/{u.a} R{u.r}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                     <p className="text-xs font-mono text-text-muted">Dia: {calculateTyreDiameter(u.w, u.a, u.r).toFixed(1)}</p>
                     <p className={clsx(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded",
                        Math.abs(u.diff) < 1.0 ? "bg-success/20 text-success" : 
                        Math.abs(u.diff) < 2.0 ? "bg-warning/20 text-warning" : "bg-danger/20 text-danger"
                     )}>
                        {u.diff > 0 ? '+' : ''}{u.diff.toFixed(2)}%
                     </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
               <AlertCircle className="w-8 h-8 text-text-dim mb-3" />
               <p className="text-sm font-bold text-text-muted">No safe upgrades found.</p>
               <p className="text-xs text-text-dim mt-1">Try adjusting the base dimensions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. MOD PLANNER
// ═══════════════════════════════════════════════════════════════════════════

type ModDef = {
  id: string
  name: string
  desc: string
  effects: { pwr: number; hnd: number; brk: number; sty: number }
  price: number // approx cost ₹
}

const AVAILABLE_MODS: ModDef[] = [
  { id: 'ecu', name: 'Stage 1 ECU Remap', desc: 'Optimized fuel and boost maps for more power.', effects: { pwr: 20, hnd: 0, brk: 0, sty: 0 }, price: 25000 },
  { id: 'exhaust', name: 'Performance Exhaust', desc: 'Free-flow cat-back system for sound and slight power bump.', effects: { pwr: 5, hnd: 0, brk: 0, sty: 15 }, price: 40000 },
  { id: 'intake', name: 'Cold Air Intake', desc: 'Better breathing for sharper throttle response.', effects: { pwr: 4, hnd: 0, brk: 0, sty: 5 }, price: 15000 },
  { id: 'suspension', name: 'Coilover Suspension', desc: 'Lower ride height and stiffer spring rates for handling.', effects: { pwr: 0, hnd: 30, brk: 5, sty: 20 }, price: 80000 },
  { id: 'brakes', name: 'Big Brake Kit', desc: 'Larger rotors and multi-piston calipers for stopping power.', effects: { pwr: 0, hnd: 5, brk: 35, sty: 10 }, price: 120000 },
  { id: 'tyres', name: 'Performance Tyres', desc: 'Sticky compound for better grip all around.', effects: { pwr: 0, hnd: 20, brk: 20, sty: 5 }, price: 45000 },
]

function ModPlanner() {
  const [carId, setCarId] = useState<string>('hyundai-i20-2024')
  const [selectedMods, setSelectedMods] = useState<Set<string>>(new Set())

  const selectedCar = useMemo(() => cars.find(c => c.id === carId) || cars[0], [carId])
  
  const toggleMod = (id: string) => {
    const next = new Set(selectedMods)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedMods(next)
  }

  const radarData = useMemo(() => {
    // Base stats (mock logic for demo purposes based on car segment & power)
    let basePwr = 40, baseHnd = 50, baseBrk = 50, baseSty = 50;
    if (selectedCar.engine.power) {
       const bhp = Number(selectedCar.engine.power.match(/[\d.]+/)?.[0] || 100)
       basePwr = Math.min(100, (bhp / 300) * 100)
    }
    if (selectedCar.segment === 'SUV') {
       baseHnd = 30; baseSty = 60;
    } else if (selectedCar.segment === 'Sedan') {
       baseHnd = 60; baseSty = 50;
    } else {
       baseHnd = 70; baseSty = 40;
    }

    let pwrMod = 0, hndMod = 0, brkMod = 0, styMod = 0
    let totalCost = 0

    selectedMods.forEach(modId => {
      const mod = AVAILABLE_MODS.find(m => m.id === modId)
      if (mod) {
        pwrMod += mod.effects.pwr
        hndMod += mod.effects.hnd
        brkMod += mod.effects.brk
        styMod += mod.effects.sty
        totalCost += mod.price
      }
    })

    return {
      data: [
        { subject: 'Power', Base: basePwr, Tuned: Math.min(100, basePwr + pwrMod), fullMark: 100 },
        { subject: 'Handling', Base: baseHnd, Tuned: Math.min(100, baseHnd + hndMod), fullMark: 100 },
        { subject: 'Braking', Base: baseBrk, Tuned: Math.min(100, baseBrk + brkMod), fullMark: 100 },
        { subject: 'Style', Base: baseSty, Tuned: Math.min(100, baseSty + styMod), fullMark: 100 },
      ],
      totalCost
    }
  }, [selectedCar, selectedMods])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-display-xs mb-1">Project Car Mod Planner</h2>
        <p className="text-text-muted text-sm">Select a base vehicle, add modifications, and visualise the estimated gains.</p>
      </div>

      <div className="glass rounded-xl p-4 flex items-center relative z-20">
         <div className="w-16 h-12 bg-secondary rounded overflow-hidden mr-4 shadow-inner">
            <img src={selectedCar.images[0]} alt="car" className="w-full h-full object-cover" />
         </div>
         <div className="flex-1">
            <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Base Vehicle</p>
            <select 
               value={carId} onChange={(e) => setCarId(e.target.value)}
               className="appearance-none bg-transparent text-lg font-black text-text-primary focus:outline-none cursor-pointer w-full pr-8"
            >
               {cars.map(c => <option key={c.id} value={c.id} className="bg-primary">{c.brand} {c.model} {c.variant}</option>)}
            </select>
         </div>
         <ChevronDown className="absolute right-6 w-5 h-5 text-text-dim pointer-events-none" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
         <div className="space-y-4">
             <h3 className="font-bold flex items-center gap-2 mb-2">
                <Wrench className="w-4 h-4 text-warning" /> Available Upgrades
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {AVAILABLE_MODS.map(mod => {
                 const isSel = selectedMods.has(mod.id)
                 return (
                   <div 
                      key={mod.id} 
                      onClick={() => toggleMod(mod.id)}
                      className={clsx(
                        "p-4 rounded-xl border cursor-pointer transition-all duration-300 relative overflow-hidden group",
                        isSel ? "border-warning bg-warning/5" : "border-border/30 bg-surface/50 hover:border-warning/50"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                         <p className="text-sm font-black text-text-primary pr-4 leading-tight">{mod.name}</p>
                         <div className={clsx("w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors", isSel ? "border-warning bg-warning" : "border-border/50")}>
                            {isSel && <Check className="w-2.5 h-2.5 text-primary" />}
                         </div>
                      </div>
                      <p className="text-[10px] text-text-dim mb-3 line-clamp-2">{mod.desc}</p>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        {mod.effects.pwr > 0 && <span className="text-[10px] bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded font-mono">+Pwr</span>}
                        {mod.effects.hnd > 0 && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono">+Hnd</span>}
                        {mod.effects.brk > 0 && <span className="text-[10px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded font-mono">+Brk</span>}
                        <span className="text-[10px] font-bold text-warning ml-auto">₹{(mod.price/1000).toFixed(0)}k</span>
                      </div>
                   </div>
                 )
               })}
             </div>
         </div>

         <div className="glass rounded-2xl p-6 border border-border/30 lg:sticky top-24">
            <h3 className="font-bold flex items-center gap-2 mb-6">
              <Zap className="w-4 h-4 text-accent" /> Estimated Performance Impact
            </h3>
            
            <div className="h-64 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData.data}>
                     <PolarGrid stroke="#2A3A5C" />
                     <PolarAngleAxis dataKey="subject" tick={{ fill: '#8B9EC7', fontSize: 12, fontWeight: 700 }} />
                     <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                     <Radar name="Base" dataKey="Base" stroke="#3F51B5" fill="#3F51B5" fillOpacity={0.2} />
                     <Radar name="Tuned" dataKey="Tuned" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.5} />
                     <Legend wrapperStyle={{ fontSize: '12px', color: '#8B9EC7' }} />
                     <Tooltip 
                        contentStyle={{ background: '#0D1B2A', border: '1px solid #1E3A5F', borderRadius: '8px', color: '#F0F4FF' }}
                     />
                  </RadarChart>
               </ResponsiveContainer>
            </div>

            <div className="mt-6 pt-4 border-t border-border/30 flex justify-between items-center">
               <div>
                 <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest">Est. Mods Cost</p>
                 <p className="text-xl font-black font-mono text-warning">₹{radarData.totalCost.toLocaleString('en-IN')}</p>
               </div>
               <div className="text-right">
                 <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest">Mods Selected</p>
                 <p className="text-xl font-black font-mono text-text-primary">{selectedMods.size}</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}

// Helper generic check icon
function Check(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"></polyline></svg>
}


// ═══════════════════════════════════════════════════════════════════════════
// 3. DYNO CHART VIEWER
// ═══════════════════════════════════════════════════════════════════════════

function DynoChart() {
  const [peakHP, setPeakHP] = useState<number>(150)
  const [peakTQ, setPeakTQ] = useState<number>(250)
  const [redline, setRedline] = useState<number>(6500)

  // Generate smooth polynomial-like curve data based on peak HP & TQ
  const chartData = useMemo(() => {
    const data = []
    
    // Simple heuristic for an NA engine curve shape
    // Torque peaks midway, HP peaks late.
    const peakTQ_RPM = Math.round(redline * 0.6)
    const peakHP_RPM = Math.round(redline * 0.85)

    for (let rpm = 1000; rpm <= redline; rpm += 200) {
      // Torque curve: Bell curve centered at peak TQ RPM
      const tqDrop = Math.pow((rpm - peakTQ_RPM) / (peakTQ_RPM * 0.8), 2)
      let tq = peakTQ * Math.max(0.6, Math.exp(-tqDrop)) // Don't drop below 60% of peak too early

      // HP = TQ * RPM / 5252
      let hp = (tq * rpm) / 5252
      
      // Scaling factor to ensure we hit the requested peak HP roughly around peak HP RPM
      const maxHPCalc = (peakTQ * peakHP_RPM) / 5252
      const correction = peakHP / maxHPCalc
      
      data.push({
        rpm: rpm,
        hp: Math.round(hp * correction),
        torque: Math.round(tq * correction)
      })
    }
    return data
  }, [peakHP, peakTQ, redline])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-display-xs mb-1">Dyno Graph Simulator</h2>
        <p className="text-text-muted text-sm">Input peak engine specs to render a realistic, dynamic horsepower and torque curve.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 items-start">
         
         <div className="glass rounded-2xl p-6 border border-border/30 space-y-5 lg:col-span-1">
            <div>
               <label className="text-[10px] text-accent uppercase font-bold tracking-widest block mb-1">Peak Horsepower (BHP)</label>
               <input type="range" min={50} max={1000} step={10} value={peakHP} onChange={e => setPeakHP(Number(e.target.value))} className="w-full accent-accent h-1.5 bg-surface rounded-full" />
               <p className="text-right text-sm font-mono font-bold mt-1 text-text-primary">{peakHP} BHP</p>
            </div>
            <div>
               <label className="text-[10px] text-warning uppercase font-bold tracking-widest block mb-1">Peak Torque (Nm)</label>
               <input type="range" min={50} max={1200} step={10} value={peakTQ} onChange={e => setPeakTQ(Number(e.target.value))} className="w-full accent-warning h-1.5 bg-surface rounded-full" />
               <p className="text-right text-sm font-mono font-bold mt-1 text-text-primary">{peakTQ} Nm</p>
            </div>
            <div>
               <label className="text-[10px] text-danger uppercase font-bold tracking-widest block mb-1">Redline (RPM)</label>
               <input type="range" min={4000} max={9000} step={500} value={redline} onChange={e => setRedline(Number(e.target.value))} className="w-full accent-danger h-1.5 bg-surface rounded-full" />
               <p className="text-right text-sm font-mono font-bold mt-1 text-text-primary">{redline} RPM</p>
            </div>
         </div>

         <div className="glass rounded-2xl p-6 border border-border/30 lg:col-span-3">
             <h3 className="font-bold flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-accent" /> Power Curve
            </h3>
            
            <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.3)" />
                     <XAxis 
                       dataKey="rpm" 
                       type="number" 
                       domain={[1000, 'dataMax']}
                       tick={{ fill: '#8B9EC7', fontSize: 12 }} 
                       tickFormatter={(v) => `${v}`}
                       label={{ value: 'Engine Speed (RPM)', position: 'bottom', fill: '#8B9EC7', fontSize: 12 }}
                     />
                     <YAxis 
                        yAxisId="left" 
                        stroke="#00D4FF" 
                        tick={{ fill: '#00D4FF', fontSize: 12 }} 
                        domain={[0, 'auto']}
                        label={{ value: 'Horsepower (BHP)', angle: -90, position: 'insideLeft', fill: '#00D4FF', fontSize: 12 }}
                     />
                     <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="#FFB300" 
                        tick={{ fill: '#FFB300', fontSize: 12 }} 
                        domain={[0, 'auto']}
                        label={{ value: 'Torque (Nm)', angle: 90, position: 'insideRight', fill: '#FFB300', fontSize: 12 }}
                     />
                     <Tooltip 
                        contentStyle={{ background: 'rgba(13,27,42,0.9)', border: '1px solid #1E3A5F', borderRadius: '8px', color: '#F0F4FF' }}
                        labelFormatter={(lbl) => `${lbl} RPM`}
                     />
                     <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                     
                     <Line yAxisId="left" type="monotone" dataKey="hp" name="Horsepower" stroke="#00D4FF" strokeWidth={3} dot={false} activeDot={{ r: 6 }} animationDuration={1000} />
                     <Line yAxisId="right" type="monotone" dataKey="torque" name="Torque" stroke="#FFB300" strokeWidth={3} dot={false} activeDot={{ r: 6 }} animationDuration={1000} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>

      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE VIEW
// ═══════════════════════════════════════════════════════════════════════════

export default function EnthusiastTools() {
  const [activeTab, setActiveTab] = useState<DashTab>('tyre')

  return (
    <div className="page-enter section-wrapper py-10 pb-20">
      {/* Header */}
      <div className="mb-8">
        <span className="section-tag mb-3 inline-flex">
          <Wrench className="w-3.5 h-3.5" /> Enthusiast Tools
        </span>
        <h1 className="text-display-md">
          Performance & <span className="gradient-text">Mods</span>
        </h1>
        <p className="text-text-muted mt-1 max-w-2xl">
          Advanced calculators for automotive enthusiasts to plan upgrades, visualise gains, and ensure mechanical safety.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex glass rounded-2xl p-1.5 gap-1 mb-8 overflow-x-auto no-scrollbar">
        {TAB_DEFS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center',
              activeTab === tab.id
                ? 'bg-accent/10 text-accent ring-1 ring-accent/30 shadow-glow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-surface/50',
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
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
          {activeTab === 'tyre' && <TyreSizeCalculator />}
          {activeTab === 'mods' && <ModPlanner />}
          {activeTab === 'dyno' && <DynoChart />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
