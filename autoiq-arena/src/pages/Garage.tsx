/**
 * Garage — Personal car collection with mileage log, service reminders, notes, and PDF export.
 *
 * Route: /garage
 */
import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Warehouse, Plus, Trash2, Star, StickyNote,
  Gauge, Wrench, Check, X,
  Car, FileDown, AlertTriangle, Bell,
  Clock, CheckCircle2, Edit3,
} from 'lucide-react'
import { useGarage } from '../hooks/useGarage'
import type { GarageCar, ServiceReminder } from '../context/GarageContext'
import clsx from 'clsx'

// ─── Service category config ─────────────────────────────────────────────────
const SERVICE_CATEGORIES: {
  id: ServiceReminder['category']
  label: string
  icon: string
  color: string
}[] = [
  { id: 'oil',       label: 'Oil Change',       icon: '🛢️', color: '#FFB300' },
  { id: 'tyre',      label: 'Tyre Service',     icon: '🔘', color: '#00D4FF' },
  { id: 'brake',     label: 'Brake Pads',       icon: '🛑', color: '#FF3B3B' },
  { id: 'battery',   label: 'Battery',          icon: '🔋', color: '#00E676' },
  { id: 'general',   label: 'General Service',  icon: '🔧', color: '#9C27B0' },
  { id: 'insurance', label: 'Insurance Renewal', icon: '🛡️', color: '#FF6B35' },
  { id: 'puc',       label: 'PUC Certificate',  icon: '📋', color: '#00BCD4' },
]

// ─── Helper: days until date ────────────────────────────────────────────────
function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ─── PDF export (plaintext print-friendly) ──────────────────────────────────
function exportGaragePDF(cars: GarageCar[]) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  let html = `
  <!DOCTYPE html>
  <html><head><title>AutoIQ Garage Summary</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI',system-ui,sans-serif; color:#1a1a2e; padding:32px; background:#fff; }
    h1 { font-size:24px; margin-bottom:4px; color:#0066cc; }
    .subtitle { font-size:12px; color:#666; margin-bottom:24px; }
    .car-section { page-break-inside:avoid; margin-bottom:28px; border:1px solid #ddd; border-radius:12px; padding:20px; }
    .car-header { font-size:18px; font-weight:800; margin-bottom:2px; }
    .car-sub { font-size:12px; color:#666; margin-bottom:12px; }
    .badge { display:inline-block; font-size:10px; padding:2px 8px; border-radius:6px; background:#e8f0fe; color:#0066cc; font-weight:600; margin-right:6px; }
    table { width:100%; border-collapse:collapse; margin:8px 0 16px; font-size:12px; }
    th { text-align:left; padding:6px 8px; background:#f0f4ff; border-bottom:2px solid #ddd; font-weight:700; }
    td { padding:6px 8px; border-bottom:1px solid #eee; }
    .section-title { font-size:13px; font-weight:700; color:#333; margin:12px 0 6px; border-bottom:1px solid #eee; padding-bottom:4px; }
    .notes-box { background:#f9fafb; border:1px solid #eee; border-radius:8px; padding:10px; font-size:12px; color:#555; white-space:pre-wrap; min-height:40px; }
    @media print {
      body { padding:16px; }
      .car-section { break-inside:avoid; }
    }
  </style>
  </head><body>
  <h1>🏠 AutoIQ Arena — Garage Summary</h1>
  <p class="subtitle">Generated on ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} • ${cars.length} car(s) in garage</p>
  `

  for (const car of cars) {
    html += `<div class="car-section">`
    html += `<p class="car-header">${car.brand} ${car.model}</p>`
    html += `<p class="car-sub">${car.variant} · ${car.year} · ${car.fuelType} · ₹${car.price}L</p>`
    html += `<span class="badge">${car.segment}</span>`
    html += `<span class="badge">Rating: ${car.rating}/5</span>`
    html += `<span class="badge">Added: ${formatDate(car.addedAt)}</span>`

    // Mileage log
    if (car.mileageLog.length > 0) {
      html += `<p class="section-title">📊 Mileage Log (${car.mileageLog.length} entries)</p>`
      html += `<table><tr><th>Date</th><th>Km</th><th>Note</th></tr>`
      for (const e of car.mileageLog.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())) {
        html += `<tr><td>${formatDate(e.date)}</td><td>${e.km.toLocaleString('en-IN')} km</td><td>${e.note || '—'}</td></tr>`
      }
      html += `</table>`
    }

    // Service reminders
    if (car.serviceReminders.length > 0) {
      html += `<p class="section-title">🔧 Service Reminders (${car.serviceReminders.length})</p>`
      html += `<table><tr><th>Service</th><th>Due Date</th><th>Status</th></tr>`
      for (const r of car.serviceReminders) {
        const cat = SERVICE_CATEGORIES.find(c => c.id === r.category)
        html += `<tr><td>${cat?.icon || '🔧'} ${r.title}</td><td>${formatDate(r.dueDate)}</td><td>${r.done ? '✅ Done' : '⏳ Pending'}</td></tr>`
      }
      html += `</table>`
    }

    // Notes
    if (car.notes.trim()) {
      html += `<p class="section-title">📝 Notes</p>`
      html += `<div class="notes-box">${car.notes}</div>`
    }

    html += `</div>`
  }

  html += `</body></html>`
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 500)
}

// ═══════════════════════════════════════════════════════════════════════════
// CAR CARD (in garage grid)
// ═══════════════════════════════════════════════════════════════════════════
function GarageCarCard({
  car, onSelect, isSelected,
}: {
  car: GarageCar
  onSelect: () => void
  isSelected: boolean
}) {
  const { removeFromGarage } = useGarage()
  const pendingServices = car.serviceReminders.filter(r => !r.done)
  const overdue = pendingServices.filter(r => daysUntil(r.dueDate) < 0)
  const upcoming = pendingServices.filter(r => daysUntil(r.dueDate) >= 0 && daysUntil(r.dueDate) <= 7)
  const lastMileage = car.mileageLog.length > 0
    ? car.mileageLog.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={clsx(
        'glass rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group',
        isSelected ? 'border-accent shadow-card-hover' : 'border-border/30 hover:border-accent/30',
      )}
      onClick={onSelect}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-secondary">
        <img
          src={car.image}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => {
            (e.target as HTMLImageElement).src =
              `https://via.placeholder.com/400x225/0D1B2A/00D4FF?text=${encodeURIComponent(car.brand)}`
          }}
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {overdue.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-danger/90 text-white flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {overdue.length} overdue
            </span>
          )}
          {upcoming.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning/90 text-primary flex items-center gap-1">
              <Bell className="w-3 h-3" /> {upcoming.length} due soon
            </span>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <button
            onClick={e => { e.stopPropagation(); removeFromGarage(car.carId) }}
            className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center
              text-text-muted hover:text-danger hover:bg-danger/20 transition-all opacity-0 group-hover:opacity-100"
            title="Remove from garage"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] text-accent font-bold uppercase tracking-widest">{car.brand}</p>
        <h3 className="text-base font-black text-text-primary truncate">{car.model}</h3>
        <p className="text-xs text-text-muted truncate">{car.variant} · {car.year}</p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-black text-text-primary">₹{car.price}L</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-warning fill-warning" />
            <span className="text-xs font-bold text-warning">{car.rating}</span>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30 text-[10px] text-text-dim">
          <span className="flex items-center gap-1">
            <Gauge className="w-3 h-3" />
            {lastMileage ? `${lastMileage.km.toLocaleString('en-IN')} km` : 'No logs'}
          </span>
          <span className="flex items-center gap-1">
            <Wrench className="w-3 h-3" />
            {pendingServices.length} pending
          </span>
          {car.notes && (
            <span className="flex items-center gap-1">
              <StickyNote className="w-3 h-3" /> Notes
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CAR DETAIL PANEL (right side when a car is selected)
// ═══════════════════════════════════════════════════════════════════════════
type DetailTab = 'mileage' | 'service' | 'notes'

function CarDetailPanel({ car }: { car: GarageCar }) {
  const {
    updateNotes, addMileageEntry, removeMileageEntry,
    addServiceReminder, removeServiceReminder, toggleServiceDone,
  } = useGarage()

  const [tab, setTab] = useState<DetailTab>('mileage')

  // Mileage form
  const [mlDate, setMlDate] = useState(new Date().toISOString().split('T')[0])
  const [mlKm, setMlKm] = useState('')
  const [mlNote, setMlNote] = useState('')

  // Service form
  const [srTitle, setSrTitle] = useState('')
  const [srDate, setSrDate] = useState('')
  const [srCat, setSrCat] = useState<ServiceReminder['category']>('general')
  const [showSrForm, setShowSrForm] = useState(false)

  // Notes
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesText, setNotesText] = useState(car.notes)
  const notesRef = useRef<HTMLTextAreaElement>(null)

  // Sorted mileage log
  const sortedLog = useMemo(() =>
    [...car.mileageLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [car.mileageLog]
  )

  const handleAddMileage = () => {
    if (!mlKm || Number(mlKm) <= 0) return
    addMileageEntry(car.carId, { date: mlDate, km: Number(mlKm), note: mlNote || undefined })
    setMlKm('')
    setMlNote('')
  }

  const handleAddService = () => {
    if (!srTitle.trim() || !srDate) return
    addServiceReminder(car.carId, {
      title: srTitle.trim(),
      dueDate: srDate,
      category: srCat,
      done: false,
    })
    setSrTitle('')
    setSrDate('')
    setShowSrForm(false)
  }

  const handleSaveNotes = () => {
    updateNotes(car.carId, notesText)
    setEditingNotes(false)
  }

  const pendingReminders = car.serviceReminders.filter(r => !r.done)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  const doneReminders = car.serviceReminders.filter(r => r.done)

  const DETAIL_TABS: { id: DetailTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'mileage', label: 'Mileage Log', icon: Gauge, badge: car.mileageLog.length || undefined },
    { id: 'service', label: 'Service', icon: Wrench, badge: pendingReminders.length || undefined },
    { id: 'notes',   label: 'Notes', icon: StickyNote },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Car header */}
      <div className="glass rounded-2xl p-5 border border-accent/20">
        <div className="flex items-start gap-4">
          <div className="w-16 h-12 rounded-xl overflow-hidden bg-secondary shrink-0">
            <img src={car.image} alt={car.model} className="w-full h-full object-cover"
              onError={e => {
                (e.target as HTMLImageElement).src = `https://via.placeholder.com/64x48/0D1B2A/00D4FF?text=${car.brand[0]}`
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-text-primary truncate">{car.brand} {car.model}</h3>
            <p className="text-xs text-text-muted">{car.variant} · {car.year} · {car.fuelType}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-text-dim">
              <span className="font-bold text-accent">₹{car.price}L</span>
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-warning fill-warning" />{car.rating}
              </span>
              <span>Added {formatDate(car.addedAt)}</span>
            </div>
          </div>
          <Link to={`/cars/${car.carId}`} className="btn btn-ghost btn-sm text-xs no-underline shrink-0">
            View →
          </Link>
        </div>
      </div>

      {/* Detail tabs */}
      <div className="flex glass rounded-xl p-1 gap-1">
        {DETAIL_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all relative',
              tab === t.id ? 'bg-accent text-primary' : 'text-text-muted hover:text-text-primary',
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.badge && t.badge > 0 && (
              <span className="absolute -top-1 -right-0.5 w-4 h-4 rounded-full bg-warm text-white text-[9px] font-black flex items-center justify-center">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── MILEAGE LOG ── */}
      <AnimatePresence mode="wait">
        {tab === 'mileage' && (
          <motion.div key="mileage" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            {/* Add entry form */}
            <div className="glass rounded-xl p-4 space-y-3 border border-accent/15">
              <p className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-1.5">
                <Plus className="w-3 h-3" /> Add Mileage Entry
              </p>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input type="date" value={mlDate} onChange={e => setMlDate(e.target.value)}
                  className="input h-9 text-xs" />
                <input type="number" value={mlKm} onChange={e => setMlKm(e.target.value)}
                  placeholder="Km reading"
                  className="input h-9 text-xs" min={0} />
                <button onClick={handleAddMileage}
                  className="btn btn-primary btn-sm h-9 px-3" disabled={!mlKm}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <input type="text" value={mlNote} onChange={e => setMlNote(e.target.value)}
                placeholder="Optional note (e.g., Road trip to Goa)"
                className="input h-8 text-xs" />
            </div>

            {/* Log entries */}
            {sortedLog.length > 0 ? (
              <div className="glass rounded-xl overflow-hidden">
                <div className="px-4 py-2 border-b border-border/30 flex items-center justify-between">
                  <p className="text-xs font-bold text-text-muted">{sortedLog.length} entries</p>
                  {sortedLog.length >= 2 && (
                    <p className="text-[10px] text-text-dim">
                      Total: {(sortedLog[0].km - sortedLog[sortedLog.length - 1].km).toLocaleString('en-IN')} km tracked
                    </p>
                  )}
                </div>
                {sortedLog.map((entry, i) => (
                  <div key={entry.id}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 border-b border-border/20 last:border-0',
                      i % 2 === 0 ? 'bg-transparent' : 'bg-surface/20',
                    )}>
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Gauge className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-primary font-mono">{entry.km.toLocaleString('en-IN')} km</p>
                      <p className="text-[10px] text-text-dim">{formatDate(entry.date)}{entry.note && ` · ${entry.note}`}</p>
                    </div>
                    <button onClick={() => removeMileageEntry(car.carId, entry.id)}
                      className="text-text-dim hover:text-danger transition-colors shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass rounded-xl p-8 text-center">
                <Gauge className="w-8 h-8 text-accent/20 mx-auto mb-2" />
                <p className="text-sm text-text-muted">No mileage entries yet</p>
                <p className="text-xs text-text-dim mt-1">Add odometer readings to track your car's usage</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── SERVICE REMINDERS ── */}
        {tab === 'service' && (
          <motion.div key="service" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            {/* Add button */}
            {!showSrForm ? (
              <button onClick={() => setShowSrForm(true)}
                className="w-full glass rounded-xl p-3 border border-dashed border-accent/30
                  text-accent text-xs font-semibold flex items-center justify-center gap-2
                  hover:bg-accent/5 transition-colors">
                <Plus className="w-4 h-4" /> Add Service Reminder
              </button>
            ) : (
              <div className="glass rounded-xl p-4 space-y-3 border border-accent/20">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-accent uppercase tracking-widest">New Reminder</p>
                  <button onClick={() => setShowSrForm(false)} className="text-text-dim hover:text-danger">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input type="text" value={srTitle} onChange={e => setSrTitle(e.target.value)}
                  placeholder="Service title (e.g., Oil Change)" className="input h-9 text-xs" />
                <input type="date" value={srDate} onChange={e => setSrDate(e.target.value)} className="input h-9 text-xs" />
                {/* Category pills */}
                <div className="flex flex-wrap gap-1.5">
                  {SERVICE_CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setSrCat(cat.id)}
                      className={clsx(
                        'px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all',
                        srCat === cat.id
                          ? 'border-accent/40 bg-accent/15 text-accent'
                          : 'border-border/40 text-text-muted hover:border-accent/20',
                      )}>
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
                <button onClick={handleAddService}
                  className="btn btn-primary btn-sm w-full gap-1" disabled={!srTitle.trim() || !srDate}>
                  <Plus className="w-4 h-4" /> Add Reminder
                </button>
              </div>
            )}

            {/* Pending */}
            {pendingReminders.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-warning uppercase tracking-widest flex items-center gap-1.5 px-1">
                  <Clock className="w-3 h-3" /> Pending ({pendingReminders.length})
                </p>
                {pendingReminders.map(r => {
                  const days = daysUntil(r.dueDate)
                  const cat = SERVICE_CATEGORIES.find(c => c.id === r.category)
                  const isOverdue = days < 0
                  const isDueSoon = days >= 0 && days <= 7
                  return (
                    <div key={r.id} className={clsx(
                      'glass rounded-xl p-3 border flex items-center gap-3',
                      isOverdue ? 'border-danger/30 bg-danger/5' :
                        isDueSoon ? 'border-warning/30 bg-warning/5' :
                          'border-border/30',
                    )}>
                      <span className="text-lg shrink-0">{cat?.icon || '🔧'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text-primary truncate">{r.title}</p>
                        <p className="text-[10px] text-text-dim">
                          Due {formatDate(r.dueDate)}
                          {isOverdue && <span className="text-danger font-bold ml-1">({Math.abs(days)}d overdue!)</span>}
                          {isDueSoon && !isOverdue && <span className="text-warning font-bold ml-1">({days}d left)</span>}
                        </p>
                      </div>
                      <button onClick={() => toggleServiceDone(car.carId, r.id)}
                        className="w-7 h-7 rounded-lg border border-success/30 flex items-center justify-center
                          text-text-dim hover:text-success hover:bg-success/10 transition-all" title="Mark done">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeServiceReminder(car.carId, r.id)}
                        className="text-text-dim hover:text-danger transition-colors" title="Delete">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Done */}
            {doneReminders.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-success uppercase tracking-widest flex items-center gap-1.5 px-1">
                  <CheckCircle2 className="w-3 h-3" /> Completed ({doneReminders.length})
                </p>
                {doneReminders.map(r => {
                  const cat = SERVICE_CATEGORIES.find(c => c.id === r.category)
                  return (
                    <div key={r.id} className="glass rounded-xl p-3 border border-border/20 flex items-center gap-3 opacity-60">
                      <span className="text-lg shrink-0">{cat?.icon || '🔧'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text-primary truncate line-through">{r.title}</p>
                        <p className="text-[10px] text-text-dim">Was due {formatDate(r.dueDate)}</p>
                      </div>
                      <button onClick={() => toggleServiceDone(car.carId, r.id)}
                        className="text-success" title="Mark undone">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeServiceReminder(car.carId, r.id)}
                        className="text-text-dim hover:text-danger transition-colors" title="Delete">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Empty */}
            {car.serviceReminders.length === 0 && (
              <div className="glass rounded-xl p-8 text-center">
                <Wrench className="w-8 h-8 text-accent/20 mx-auto mb-2" />
                <p className="text-sm text-text-muted">No service reminders</p>
                <p className="text-xs text-text-dim mt-1">Add reminders for oil changes, tyre rotation, insurance renewal, etc.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── NOTES ── */}
        {tab === 'notes' && (
          <motion.div key="notes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="glass rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-1.5">
                  <StickyNote className="w-3 h-3" /> Personal Notes
                </p>
                {!editingNotes ? (
                  <button onClick={() => { setEditingNotes(true); setNotesText(car.notes); setTimeout(() => notesRef.current?.focus(), 100) }}
                    className="text-xs text-accent flex items-center gap-1 hover:underline">
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={handleSaveNotes} className="text-xs text-success font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Save
                    </button>
                    <button onClick={() => setEditingNotes(false)} className="text-xs text-text-dim">Cancel</button>
                  </div>
                )}
              </div>
              {editingNotes ? (
                <textarea
                  ref={notesRef}
                  value={notesText}
                  onChange={e => setNotesText(e.target.value)}
                  placeholder="Add personal notes about this car... (e.g., dealer contact, delivery date, accessories purchased)"
                  className="input text-sm min-h-[120px] resize-y"
                />
              ) : (
                <div className="min-h-[80px]">
                  {car.notes ? (
                    <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">{car.notes}</p>
                  ) : (
                    <div className="text-center py-6">
                      <StickyNote className="w-8 h-8 text-accent/20 mx-auto mb-2" />
                      <p className="text-sm text-text-muted">No notes yet</p>
                      <p className="text-xs text-text-dim mt-1">Click "Edit" to add personal notes</p>
                    </div>
                  )}
                </div>
              )}
              <p className="text-[10px] text-text-dim">{car.notes.length} characters</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GARAGE PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function Garage() {
  const { cars, count } = useGarage()
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null)

  const selectedCar = useMemo(() =>
    cars.find(c => c.carId === selectedCarId) || null,
    [cars, selectedCarId]
  )

  // Stats
  const totalMileageEntries = cars.reduce((s, c) => s + c.mileageLog.length, 0)
  const totalPendingServices = cars.reduce((s, c) => s + c.serviceReminders.filter(r => !r.done).length, 0)
  const totalOverdue = cars.reduce((s, c) => s + c.serviceReminders.filter(r => !r.done && daysUntil(r.dueDate) < 0).length, 0)

  return (
    <div className="page-enter section-wrapper py-10 pb-20">
      {/* Page Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="section-tag mb-3 inline-flex">
            <Warehouse className="w-3.5 h-3.5" /> My Garage
          </span>
          <h1 className="text-display-md">
            Personal <span className="gradient-text">Garage</span>
          </h1>
          <p className="text-text-muted mt-1 max-w-xl">
            Your saved cars with mileage tracking, service reminders, and personal notes. All data stored locally in your browser.
          </p>
        </div>

        {count > 0 && (
          <button
            onClick={() => exportGaragePDF(cars)}
            className="btn btn-secondary btn-sm gap-2"
          >
            <FileDown className="w-4 h-4" /> Export PDF
          </button>
        )}
      </div>

      {/* Quick Stats */}
      {count > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-text-dim">
              <Car className="w-3 h-3" /> Cars in Garage
            </div>
            <p className="text-xl font-black text-accent font-mono mt-1">{count}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-text-dim">
              <Gauge className="w-3 h-3" /> Mileage Entries
            </div>
            <p className="text-xl font-black text-text-primary font-mono mt-1">{totalMileageEntries}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-text-dim">
              <Wrench className="w-3 h-3" /> Pending Services
            </div>
            <p className="text-xl font-black text-warning font-mono mt-1">{totalPendingServices}</p>
          </div>
          <div className={clsx('glass rounded-xl p-4', totalOverdue > 0 && 'border border-danger/30')}>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-text-dim">
              <AlertTriangle className="w-3 h-3" /> Overdue
            </div>
            <p className={clsx('text-xl font-black font-mono mt-1', totalOverdue > 0 ? 'text-danger' : 'text-success')}>
              {totalOverdue}
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      {count > 0 ? (
        <div className="grid lg:grid-cols-[1fr_420px] gap-8">
          {/* Cars grid */}
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">
              {count} car{count > 1 ? 's' : ''} in your garage
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {cars.map(car => (
                  <GarageCarCard
                    key={car.carId}
                    car={car}
                    isSelected={selectedCarId === car.carId}
                    onSelect={() => setSelectedCarId(
                      selectedCarId === car.carId ? null : car.carId
                    )}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Detail panel */}
          <div className="lg:sticky lg:top-24 self-start">
            <AnimatePresence mode="wait">
              {selectedCar ? (
                <CarDetailPanel key={selectedCar.carId} car={selectedCar} />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-10 text-center border border-border/30"
                >
                  <Car className="w-12 h-12 text-accent/20 mx-auto mb-4" />
                  <p className="text-sm font-bold text-text-muted">Select a car to manage</p>
                  <p className="text-xs text-text-dim mt-1">
                    Click on any car to view its mileage log, service reminders, and notes
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-16 max-w-lg mx-auto text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Warehouse className="w-10 h-10 text-accent/40" />
          </div>
          <h2 className="text-display-xs mb-2">Your Garage is Empty</h2>
          <p className="text-text-muted text-sm mb-8">
            Browse cars and add them to your personal garage to track mileage, set service reminders, and keep notes.
          </p>
          <Link to="/cars" className="btn btn-primary btn-md gap-2 no-underline">
            <Car className="w-5 h-5" /> Browse Cars
          </Link>
        </motion.div>
      )}
    </div>
  )
}
