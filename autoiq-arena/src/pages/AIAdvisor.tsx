/**
 * AI Advisor — powered by Claude claude-3-5-haiku-20241022
 *
 * Architecture:
 *  • Vite dev proxy (`/api/claude` → `https://api.anthropic.com`) handles CORS
 *  • SSE streaming via fetch + ReadableStream — tokens render word by word
 *  • Falls back to a rich demo mode if no API key is configured
 *  • Car recommendations are extracted from Claude's JSON block at the end
 *    of the response, then matched to our local dataset for rich cards
 */
import {
  useState, useRef, useEffect, useCallback, type FormEvent,
} from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Send, Sparkles, Zap, User, AlertCircle, RefreshCw,
  Star, Fuel, GitCompare, ExternalLink, ChevronDown, Key,
} from 'lucide-react'
import { cars } from '../data/cars'
import { useCompare } from '../hooks/useCompare'
import { formatPrice } from '../utils/formatters'
import { fuelBadgeColor } from '../utils/carUtils'
import clsx from 'clsx'
import type { Car } from '../types/car.types'

// ─── Constants ────────────────────────────────────────────────────────────────
const API_KEY    = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined
const MODEL      = 'claude-3-5-haiku-20241022'
const MAX_TOKENS = 1024

// ─── Types ────────────────────────────────────────────────────────────────────
type UseCase = 'City Commute' | 'Highway/Long trips' | 'Family hauler' | 'Performance/Weekend' | 'Off-road/Adventure'
type FuelPref = 'Any' | 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'CNG'
type Priority = 'Best Value' | 'Safety First' | 'Fuel Efficiency' | 'Power & Performance' | 'Feature-rich' | 'Low Maintenance'

interface Prefs {
  budget:   number
  useCase:  UseCase
  fuel:     FuelPref
  seating:  number
  priority: Priority
  extra:    string
}

interface ChatMessage {
  role:      'user' | 'assistant' | 'system'
  content:   string
  streaming?: boolean
  recs?:     Car[]
}

// ─── System prompt ────────────────────────────────────────────────────────────
function buildSystemPrompt(prefs: Prefs): string {
  return `You are AutoIQ Arena's expert car buying advisor for the Indian automobile market.
You have deep knowledge of every car segment — hatchbacks, sedans, SUVs, EVs, luxury vehicles — with a focus on India-specific factors: fuel prices (~₹104/L petrol, ₹91/L diesel), road conditions, service networks, resale value, and finance options.

USER'S PROFILE:
• Budget: ₹${prefs.budget} lakhs (ex-showroom)
• Primary use case: ${prefs.useCase}
• Fuel preference: ${prefs.fuel}
• Minimum seating: ${prefs.seating} persons
• Top priority: ${prefs.priority}
${prefs.extra ? `• Additional context: ${prefs.extra}` : ''}

OUR DATABASE includes: ${cars.map(c => `${c.brand} ${c.model} (${c.segment}, ₹${c.price}L, ${c.fuelType})`).join(', ')}.

RESPONSE RULES:
1. Give warm, specific, personalized advice — never generic lists
2. Mention concrete pros/cons relevant to THIS user's use case
3. Consider TCO (not just sticker price) when relevant
4. After your narrative advice, ALWAYS end your first response with a JSON block:
   \`\`\`json
   {"recommendations": ["exact-car-id-1", "exact-car-id-2", "exact-car-id-3"]}
   \`\`\`
   Use IDs from our database: ${cars.map(c => c.id).join(', ')}
5. For follow-up questions, do NOT repeat the JSON block unless specifically asked
6. Write in a friendly, knowledgeable tone — like a trusted friend who knows cars
7. Keep responses under 280 words for initial recommendations, 120 words for follow-ups`
}

// ─── Claude streaming call ────────────────────────────────────────────────────
async function streamClaude(
  messages: { role: string; content: string }[],
  systemPrompt: string,
  onToken: (t: string) => void,
  onDone:  ()        => void,
  onError: (e: string) => void,
) {
  try {
    const res = await fetch('/api/claude/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-api-key':       API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      MODEL,
        max_tokens: MAX_TOKENS,
        stream:     true,
        system:     systemPrompt,
        messages:   messages.map(m => ({ role: m.role, content: m.content })),
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      onError(`API error ${res.status}: ${body.slice(0, 200)}`)
      return
    }

    const reader = res.body?.getReader()
    if (!reader) { onError('No response body'); return }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue
        try {
          const evt = JSON.parse(data)
          if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
            onToken(evt.delta.text)
          }
          if (evt.type === 'message_stop') {
            onDone()
            return
          }
        } catch { /* ignore bad JSON lines */ }
      }
    }
    onDone()
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Unknown error')
  }
}

// ─── Extract car IDs from Claude's JSON block ─────────────────────────────────
function extractRecommendations(text: string): Car[] {
  const match = text.match(/```json\s*({[\s\S]*?})\s*```/)
  if (!match) return []
  try {
    const parsed = JSON.parse(match[1]) as { recommendations?: string[] }
    const ids    = parsed.recommendations ?? []
    return ids
      .map(id => cars.find(c => c.id === id))
      .filter(Boolean) as Car[]
  } catch { return [] }
}

// Strip the JSON block from visible text
function stripJsonBlock(text: string): string {
  return text.replace(/```json[\s\S]*?```/g, '').trim()
}

// ─── Demo mode response ───────────────────────────────────────────────────────
function buildDemoResponse(prefs: Prefs): { text: string; recs: Car[] } {
  const scored = cars
    .map(c => {
      let s = c.rating * 10
      if (c.price > prefs.budget * 1.1) s -= (c.price - prefs.budget) * 6
      if (prefs.fuel !== 'Any' && c.fuelType !== prefs.fuel) s -= 8
      if (c.isEV && prefs.fuel === 'Electric') s += 15
      if (c.seating < prefs.seating) s -= 15
      if (prefs.priority === 'Safety First' && c.safety.globalNcap >= 5) s += 12
      if (prefs.priority === 'Fuel Efficiency') s += parseFloat(c.mileage) * 0.8
      if (prefs.priority === 'Power & Performance') s += parseInt(c.engine.power) * 0.08
      if (prefs.priority === 'Best Value') s += Math.max(0, prefs.budget - c.price) * 0.4
      return { car: c, score: s }
    })
    .sort((a, b) => b.score - a.score)
    .filter(x => x.car.price <= prefs.budget * 1.15)
    .slice(0, 3)
    .map(x => x.car)

  const [r1, r2, r3] = scored

  const text = `Great news! Based on your ₹${prefs.budget}L budget and **${prefs.useCase}** use case, I've found some excellent options for you. 🚗

**Top pick: ${r1?.brand} ${r1?.model}** — at ₹${r1?.price}L, this is arguably the best value in your segment. With ${r1?.engine.power} and ${r1?.mileage} mileage, it strikes the perfect balance for ${prefs.useCase.toLowerCase().includes('city') ? 'city stop-go traffic' : 'your driving needs'}.

${r2 ? `**Runner-up: ${r2.brand} ${r2.model}** — If you prioritize ${prefs.priority === 'Best Value' ? 'a slightly bigger boot and more premium feel' : 'better mileage'}, this is worth a look at ₹${r2.price}L.` : ''}

${r3 ? `**Dark horse: ${r3.brand} ${r3.model}** — Often overlooked but the ${r3.rating}/5 rating from ${r3.reviewCount.toLocaleString()} owners speaks volumes. At ₹${r3.price}L it's ${r3.price < prefs.budget ? 'well within budget' : 'slightly over but worth stretching for'}.` : ''}

My recommendation: **test-drive the ${r1?.brand} ${r1?.model} first** — I think it'll tick most of your boxes. Feel free to ask me anything specific about these picks!

> ⚠️ *Demo mode — connect a Claude API key for real AI-powered advice.*`

  return { text, recs: scored }
}

// ─── Mini recommendation card ─────────────────────────────────────────────────
function RecCard({ car, onCompare, isInCompare, canAddMore }: {
  car: Car; onCompare: (c: Car) => void; isInCompare: boolean; canAddMore: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden border border-border/50 hover:border-accent/30 transition-all group"
    >
      <div className="relative h-36 overflow-hidden bg-secondary">
        <img src={car.images[0]} alt={car.model}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => {
            (e.target as HTMLImageElement).src =
              `https://via.placeholder.com/400x144/0D1B2A/00D4FF?text=${car.brand}`
          }} />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 to-transparent" />
        {car.isPopular && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-warm/20 border border-warm/30 text-warm backdrop-blur-sm">
            🔥 Popular
          </span>
        )}
        <div className="absolute bottom-2 left-3">
          <p className="text-[10px] text-accent/80 font-bold uppercase tracking-widest">{car.brand}</p>
          <p className="text-sm font-black text-text-primary leading-tight">{car.model}</p>
        </div>
      </div>
      <div className="p-3 space-y-2.5">
        {/* Fuel + segment */}
        <div className="flex gap-1.5 flex-wrap">
          <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border font-bold flex items-center gap-1', fuelBadgeColor(car.fuelType))}>
            <Fuel className="w-2.5 h-2.5" />{car.fuelType}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-border/50 text-text-muted">{car.segment}</span>
        </div>
        {/* Key specs */}
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {[
            { label: 'Power', value: car.engine.power.replace(' bhp',''), unit: 'bhp' },
            { label: car.isEV ? 'Range' : 'Mileage', value: car.mileage.split(' ')[0], unit: car.isEV ? 'km' : 'kmpl' },
            { label: 'Safety', value: car.safety.globalNcap, unit: '★ NCAP' },
          ].map(s => (
            <div key={s.label} className="bg-surface/60 rounded-lg p-1.5">
              <p className="text-[9px] text-text-dim uppercase">{s.label}</p>
              <p className="text-xs font-black text-text-primary font-mono">{s.value}</p>
              <p className="text-[8px] text-text-dim">{s.unit}</p>
            </div>
          ))}
        </div>
        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-warning fill-warning" />
          <span className="text-xs font-bold text-text-primary">{car.rating}</span>
          <span className="text-[10px] text-text-dim">({car.reviewCount.toLocaleString()})</span>
        </div>
        {/* Price + actions */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-black text-accent">{formatPrice(car.price)}</p>
          <div className="flex gap-1.5 items-center">
            <button
              onClick={() => onCompare(car)}
              disabled={!canAddMore && !isInCompare}
              title={isInCompare ? 'In compare' : 'Add to compare'}
              className={clsx('w-7 h-7 rounded-lg flex items-center justify-center border transition-all text-[10px]',
                isInCompare ? 'bg-accent/15 border-accent/40 text-accent' : 'bg-surface border-border/60 text-text-muted hover:border-accent/40'
              )}
            >
              <GitCompare className="w-3.5 h-3.5" />
            </button>
            <Link to={`/cars/${car.id}`}
              className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-accent text-primary hover:scale-105 transition-transform no-underline flex items-center gap-1">
              Details <ExternalLink className="w-2.5 h-2.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.span key={i} className="w-2 h-2 rounded-full bg-accent/60"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
    </div>
  )
}

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
function MarkdownText({ text }: { text: string }) {
  // Bold **text**, line breaks
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/g)
  return (
    <span>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**'))
          return <strong key={i} className="text-text-primary font-bold">{p.slice(2, -2)}</strong>
        if (p === '\n') return <br key={i} />
        // blockquote
        if (p.startsWith('> '))
          return <span key={i} className="block mt-1.5 pl-2 border-l-2 border-accent/30 text-text-dim text-[11px] italic">{p.slice(2)}</span>
        return <span key={i}>{p}</span>
      })}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const USE_CASES: UseCase[]  = ['City Commute', 'Highway/Long trips', 'Family hauler', 'Performance/Weekend', 'Off-road/Adventure']
const FUEL_PREFS: FuelPref[] = ['Any', 'Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']
const PRIORITIES: Priority[] = ['Best Value', 'Safety First', 'Fuel Efficiency', 'Power & Performance', 'Feature-rich', 'Low Maintenance']

const USE_CASE_ICONS: Record<UseCase, string> = {
  'City Commute':          '🏙️',
  'Highway/Long trips':    '🛣️',
  'Family hauler':         '👨‍👩‍👧‍👦',
  'Performance/Weekend':   '🏎️',
  'Off-road/Adventure':    '⛰️',
}

export default function AIAdvisor() {
  const { addToCompare, isInCompare, canAddMore } = useCompare()

  // Form state
  const [prefs, setPrefs] = useState<Prefs>({
    budget:   15,
    useCase:  'City Commute',
    fuel:     'Any',
    seating:  5,
    priority: 'Best Value',
    extra:    '',
  })

  // Chat state
  const [messages,   setMessages]   = useState<ChatMessage[]>([])
  const [inputText,  setInputText]  = useState('')
  const [streaming,  setStreaming]  = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [formVisible, setFormVisible] = useState(true)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [runtimeKey,  setRuntimeKey]  = useState('')

  const chatEndRef  = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLInputElement>(null)
  const abortRef    = useRef(false)

  const effectiveKey = runtimeKey || API_KEY || ''
  const keyReady     = Boolean(effectiveKey && effectiveKey !== 'your_anthropic_api_key_here')

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Start conversation ─────────────────────────────────────────────────────
  const startAdvice = useCallback(async (e?: FormEvent) => {
    e?.preventDefault()
    setError(null)
    setFormVisible(false)

    if (!keyReady) {
      // Demo mode
      const { text, recs } = buildDemoResponse(prefs)
      const userMsg: ChatMessage = {
        role: 'user',
        content: `Budget ₹${prefs.budget}L · ${prefs.useCase} · ${prefs.fuel} · ${prefs.seating} seats · ${prefs.priority}`,
      }
      setMessages([userMsg])
      // Simulate typing
      setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])
      let built = ''
      for (const word of text.split(' ')) {
        await new Promise<void>(r => setTimeout(r, 18))
        built += (built ? ' ' : '') + word
        setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: built } : m))
      }
      setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, streaming: false, recs } : m))
      return
    }

    // Real Claude call
    const userContent = `Budget: ₹${prefs.budget}L | Use case: ${prefs.useCase} | Fuel: ${prefs.fuel} | Min seating: ${prefs.seating} | Priority: ${prefs.priority}${prefs.extra ? ` | Additional context: ${prefs.extra}` : ''}`
    const userMsg: ChatMessage = { role: 'user', content: userContent }
    setMessages([userMsg])
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])
    setStreaming(true)
    abortRef.current = false

    let fullText = ''
    const sysPrompt = buildSystemPrompt(prefs)

    await streamClaude(
      [{ role: 'user', content: userContent }],
      sysPrompt,
      token => {
        if (abortRef.current) return
        fullText += token
        setMessages(prev => prev.map((m, i) => i === prev.length - 1
          ? { ...m, content: fullText } : m))
      },
      () => {
        const recs = extractRecommendations(fullText)
        const clean = stripJsonBlock(fullText)
        setMessages(prev => prev.map((m, i) => i === prev.length - 1
          ? { ...m, content: clean, streaming: false, recs } : m))
        setStreaming(false)
        setTimeout(() => inputRef.current?.focus(), 100)
      },
      err => {
        setError(err)
        setMessages(prev => prev.filter((_, i) => i !== prev.length - 1))
        setStreaming(false)
      },
    )
  }, [prefs, keyReady])

  // ── Follow-up message ──────────────────────────────────────────────────────
  const sendFollowUp = useCallback(async () => {
    const text = inputText.trim()
    if (!text || streaming) return
    setInputText('')
    setError(null)

    const newUserMsg: ChatMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, newUserMsg])
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])
    setStreaming(true)

    const history = [...messages, newUserMsg]
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))

    if (!keyReady) {
      // Demo follow-up
      await new Promise<void>(r => setTimeout(r, 600))
      const demoReply = `Great question! For your ₹${prefs.budget}L budget with **${prefs.useCase}** focus, the key difference comes down to your day-to-day priorities. If fuel efficiency matters most, go for the option with best mileage. For safety, look for 5-star NCAP ratings. Would you like me to compare any two specific cars from the recommendations?`
      let built = ''
      for (const word of demoReply.split(' ')) {
        await new Promise<void>(r => setTimeout(r, 22))
        built += (built ? ' ' : '') + word
        setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: built } : m))
      }
      setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, streaming: false } : m))
      setStreaming(false)
      return
    }

    let fullText = ''
    await streamClaude(
      history,
      buildSystemPrompt(prefs),
      token => {
        fullText += token
        setMessages(prev => prev.map((m, i) => i === prev.length - 1
          ? { ...m, content: fullText } : m))
      },
      () => {
        setMessages(prev => prev.map((m, i) => i === prev.length - 1
          ? { ...m, content: stripJsonBlock(fullText), streaming: false } : m))
        setStreaming(false)
      },
      err => {
        setError(err)
        setMessages(prev => prev.filter((_, i) => i !== prev.length - 1))
        setStreaming(false)
      },
    )
  }, [inputText, streaming, messages, prefs, keyReady])

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = () => {
    setMessages([])
    setFormVisible(true)
    setError(null)
    setStreaming(false)
    abortRef.current = true
  }

  // ── Latest rec cards ───────────────────────────────────────────────────────
  const recCards = [...messages].reverse().find(m => m.recs?.length)?.recs ?? []

  return (
    <div className="page-enter min-h-screen">

      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <div className="section-wrapper pt-8 pb-6">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="section-tag mb-3 inline-flex">
              <Bot className="w-3.5 h-3.5" /> AI Advisor
            </span>
            <h1 className="text-display-md flex items-center gap-3">
              Your Car Advisor
              <span className="text-base font-semibold px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent">
                {keyReady ? '🟢 Claude AI' : '🔵 Demo mode'}
              </span>
            </h1>
            <p className="text-text-muted text-sm mt-1 max-w-lg">
              {keyReady
                ? 'Powered by Claude — streaming real AI advice for the Indian car market.'
                : 'Running in demo mode. Add a Claude API key in .env.local for real AI advice.'}
            </p>
          </div>
          {!formVisible && (
            <button onClick={reset}
              className="btn btn-ghost btn-sm gap-2 text-text-muted hover:text-text-primary">
              <RefreshCw className="w-4 h-4" /> New Session
            </button>
          )}
        </div>

        {/* API Key banner (if not configured) */}
        {!keyReady && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 glass rounded-xl border border-warning/30 p-4 flex items-start gap-3"
          >
            <Key className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-warning mb-1">Claude API key not configured</p>
              <p className="text-xs text-text-muted mb-3">
                Add <code className="bg-surface px-1 rounded text-accent">VITE_ANTHROPIC_API_KEY</code> to <code className="bg-surface px-1 rounded text-accent">.env.local</code> and restart the dev server,
                or paste your key below for this session only (not stored).
              </p>
              <div className="flex gap-2 max-w-sm">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="input h-9 text-xs flex-1"
                />
                <button
                  onClick={() => { setRuntimeKey(apiKeyInput); setApiKeyInput('') }}
                  disabled={!apiKeyInput.startsWith('sk-')}
                  className="btn btn-primary btn-sm h-9 px-3"
                >
                  Use Key
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="section-wrapper pb-20 grid lg:grid-cols-[420px_1fr] gap-8 items-start">

        {/* ── Left: Form or Collapsed Prefs ───────────────────────────────── */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {formVisible ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                onSubmit={startAdvice}
                className="glass rounded-2xl p-6 space-y-5 border border-border/40"
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <h2 className="font-black text-lg text-text-primary">Your Preferences</h2>
                </div>

                {/* Budget */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label htmlFor="budget" className="text-sm font-semibold text-text-secondary">Budget</label>
                    <span className="text-sm font-black text-accent font-mono">₹{prefs.budget}L</span>
                  </div>
                  <input id="budget" type="range" min={5} max={80} step={1} value={prefs.budget}
                    onChange={e => setPrefs(p => ({ ...p, budget: Number(e.target.value) }))}
                    className="w-full accent-[#00D4FF] cursor-pointer" />
                  <div className="flex justify-between text-[10px] text-text-dim mt-0.5">
                    <span>₹5L</span><span>₹80L</span>
                  </div>
                </div>

                {/* Use case */}
                <div>
                  <p className="text-sm font-semibold text-text-secondary mb-2">Primary Use Case</p>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {USE_CASES.map(u => (
                      <button key={u} type="button" onClick={() => setPrefs(p => ({ ...p, useCase: u }))}
                        className={clsx('px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5',
                          prefs.useCase === u
                            ? 'bg-accent/15 border-accent text-accent'
                            : 'bg-surface/40 border-border/50 text-text-muted hover:border-accent/40'
                        )}>
                        <span>{USE_CASE_ICONS[u]}</span>
                        <span className="truncate">{u}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fuel */}
                <div>
                  <p className="text-sm font-semibold text-text-secondary mb-2">Fuel Preference</p>
                  <div className="flex flex-wrap gap-1.5">
                    {FUEL_PREFS.map(f => (
                      <button key={f} type="button" onClick={() => setPrefs(p => ({ ...p, fuel: f }))}
                        className={clsx('px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                          prefs.fuel === f
                            ? 'bg-accent/15 border-accent text-accent'
                            : 'bg-surface/40 border-border/50 text-text-muted hover:border-accent/40'
                        )}>
                        {f === 'Electric' ? '⚡ ' : f === 'Hybrid' ? '🔋 ' : ''}{f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <p className="text-sm font-semibold text-text-secondary mb-2">Top Priority</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRIORITIES.map(p => (
                      <button key={p} type="button" onClick={() => setPrefs(prev => ({ ...prev, priority: p }))}
                        className={clsx('px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all text-left',
                          prefs.priority === p
                            ? 'bg-accent/15 border-accent text-accent'
                            : 'bg-surface/40 border-border/50 text-text-muted hover:border-accent/40'
                        )}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seating */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label htmlFor="seating" className="text-sm font-semibold text-text-secondary">Min. Seating</label>
                    <span className="text-sm font-black text-accent">{prefs.seating} persons</span>
                  </div>
                  <input id="seating" type="range" min={2} max={9} step={1} value={prefs.seating}
                    onChange={e => setPrefs(p => ({ ...p, seating: Number(e.target.value) }))}
                    className="w-full accent-[#00D4FF] cursor-pointer" />
                </div>

                {/* Extra context */}
                <div>
                  <label htmlFor="extra" className="text-sm font-semibold text-text-secondary mb-1.5 block">
                    Anything else? <span className="text-text-dim font-normal">(optional)</span>
                  </label>
                  <textarea id="extra" rows={2}
                    value={prefs.extra}
                    onChange={e => setPrefs(p => ({ ...p, extra: e.target.value }))}
                    placeholder="e.g., first car, want sunroof, park in tight spots, drive in Rajasthan heat…"
                    className="input text-sm resize-none leading-relaxed py-2.5"
                  />
                </div>

                <button type="submit" id="find-cars-btn"
                  className="btn btn-primary btn-lg w-full gap-2">
                  <Zap className="w-5 h-5" />
                  {keyReady ? 'Ask Claude AI' : 'Find My Perfect Car'}
                </button>
              </motion.form>
            ) : (
              <motion.div key="prefs-collapsed"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass rounded-2xl border border-border/40 overflow-hidden"
              >
                <button
                  onClick={() => setFormVisible(v => !v)}
                  className="w-full flex items-centers justify-between px-5 py-4 text-left hover:bg-surface/40 transition-colors"
                >
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Your preferences</p>
                    <p className="text-sm font-bold text-text-primary">
                      ₹{prefs.budget}L · {prefs.useCase} · {prefs.fuel} · {prefs.priority}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-text-muted shrink-0 mt-1" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rec cards */}
          {recCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 px-1">
                <Sparkles className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-black text-text-primary">Recommended Cars</h3>
              </div>
              <div className="grid gap-3">
                {recCards.map((car, i) => (
                  <motion.div key={car.id}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}>
                    <RecCard car={car} onCompare={addToCompare}
                      isInCompare={isInCompare(car.id)} canAddMore={canAddMore} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Right: Chat window ───────────────────────────────────────────── */}
        <div className="glass rounded-2xl border border-border/40 flex flex-col"
          style={{ height: 'min(700px, calc(100vh - 180px))' }}>

          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/30">
            <div className="w-8 h-8 rounded-xl bg-accent-gradient flex items-center justify-center shadow-glow-sm">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-black text-text-primary">AutoIQ Advisor</p>
              <p className="text-[10px] text-text-muted">
                {streaming ? (
                  <span className="text-accent animate-pulse">● Thinking…</span>
                ) : messages.length > 0 ? (
                  `${messages.filter(m => m.role === 'assistant').length} response${messages.filter(m => m.role === 'assistant').length !== 1 ? 's' : ''}`
                ) : 'Ready to help'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-accent-gradient flex items-center justify-center mb-4 shadow-glow-accent">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-black text-text-primary mb-2">
                  {keyReady ? 'Ask Claude anything' : 'AI Car Advisor'}
                </h3>
                <p className="text-sm text-text-muted max-w-xs">
                  Fill in your preferences on the left and I'll find your perfect car match — with detailed reasoning.
                </p>
                <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
                  {[
                    "What's the best car under \u20b915L for city use?",
                    'Compare Creta vs Seltos for a family of 5',
                    'Best EV options under \u20b925L in India?',
                  ].map(q => (
                    <button key={q} onClick={() => { setInputText(q) }}
                      className="text-xs px-3 py-2 rounded-xl glass border border-border/40 hover:border-accent/40 text-text-muted hover:text-text-primary transition-all text-left">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={clsx('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-accent-gradient flex items-center justify-center shrink-0 mt-0.5 shadow-glow-sm">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    <div className={clsx('max-w-[85%] rounded-2xl text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-accent/15 border border-accent/30 text-text-primary px-4 py-3'
                        : 'glass border border-border/40 text-text-secondary px-4 py-3'
                    )}>
                      {msg.role === 'assistant' && msg.content === '' && msg.streaming
                        ? <TypingDots />
                        : <MarkdownText text={msg.content} />
                      }
                      {msg.streaming && msg.content !== '' && (
                        <span className="inline-block w-0.5 h-3.5 bg-accent ml-0.5 animate-pulse rounded-full align-middle" />
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-surface border border-border/60 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-text-muted" />
                      </div>
                    )}
                  </motion.div>
                ))}
                {error && (
                  <div className="flex items-start gap-2 text-danger text-sm glass rounded-xl p-3 border border-danger/30">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border/30 px-4 py-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                id="ai-chat-input"
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (messages.length === 0) startAdvice()
                    else sendFollowUp()
                  }
                }}
                placeholder={
                  messages.length === 0
                    ? 'Ask anything about cars…'
                    : 'Ask a follow-up question…'
                }
                disabled={streaming}
                className="input h-10 text-sm flex-1"
              />
              <button
                id="send-chat-btn"
                onClick={messages.length === 0 ? startAdvice : sendFollowUp}
                disabled={streaming || (!inputText.trim() && messages.length > 0)}
                className="btn btn-primary btn-sm h-10 px-4 shrink-0"
              >
                {streaming
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-text-dim mt-2 text-center">
              {keyReady
                ? `Powered by ${MODEL} · Streaming response`
                : 'Demo mode — connect Claude API key for real AI responses'}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
