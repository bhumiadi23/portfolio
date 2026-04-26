import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Car, GitCompare, Bot, Wrench, Users, Settings,
  Database, Home, Search, Sun, Moon, Zap, ChevronRight, Warehouse, IndianRupee, Trophy
} from 'lucide-react'
import clsx from 'clsx'
import { useTheme } from '../../hooks/useTheme'
import { useSearch } from '../../hooks/useSearch'
import type { Car as CarType } from '../../types/car.types'

// ─── Nav link definitions ──────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/',           label: 'Home',        icon: Home,        end: true  },
  { to: '/cars',       label: 'Cars',        icon: Database,    end: false },
  { to: '/compare',    label: 'Compare',     icon: GitCompare,  end: false },
  { to: '/tools',      label: 'Tools',       icon: Wrench,      end: false },
  { to: '/finance',    label: 'Finance',     icon: IndianRupee, end: false },
  { to: '/awards',     label: 'Awards',      icon: Trophy,      end: false },
  { to: '/enthusiast', label: 'Enthusiast',  icon: Settings,    end: false },
  { to: '/ev-tools',   label: 'EV Hub',      icon: Zap,         end: false },
  { to: '/garage',     label: 'My Garage',   icon: Warehouse,   end: false },
  { to: '/ai-advisor', label: 'AI Advisor',  icon: Bot,         end: false },
  { to: '/community',  label: 'Community',   icon: Users,       end: false },
]

// ─── Framer Motion variants ────────────────────────────────────────────────
const drawerVariants = {
  closed: { x: '-100%', opacity: 0 },
  open:   { x: '0%',   opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
  exit:   { x: '-100%', opacity: 0, transition: { duration: 0.22, ease: 'easeIn' as const } },
}

const searchBarVariants = {
  collapsed: { width: 0, opacity: 0, marginLeft: 0 },
  expanded:  { width: 260, opacity: 1, marginLeft: 8,
               transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
}

const dropdownVariants = {
  hidden: { opacity: 0, y: -6, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.18 } },
  exit:   { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.14 } },
}

// ─── ThemeToggle button ────────────────────────────────────────────────────
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.button
      id="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center
                 border border-border/60 bg-surface/40 text-text-muted
                 hover:border-accent/40 hover:text-accent transition-all duration-200"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span key="moon"
            initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 30, opacity: 0 }} transition={{ duration: 0.2 }}>
            <Moon className="w-4 h-4" />
          </motion.span>
        ) : (
          <motion.span key="sun"
            initial={{ rotate: 30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -30, opacity: 0 }} transition={{ duration: 0.2 }}>
            <Sun className="w-4 h-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// ─── Search bar ────────────────────────────────────────────────────────────
function SearchBar({ onClose }: { onClose: () => void }) {
  const { query, setQuery, results, clearSearch, hasResults } = useSearch()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Auto-focus on mount
  useEffect(() => { inputRef.current?.focus() }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        clearSearch(); onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [clearSearch, onClose])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { clearSearch(); onClose() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [clearSearch, onClose])

  const handleSelect = (car: CarType) => {
    clearSearch(); onClose()
    navigate(`/cars/${car.id}`)
  }

  return (
    <div ref={containerRef} className="relative">
      <motion.div
        variants={searchBarVariants}
        initial="collapsed"
        animate="expanded"
        exit="collapsed"
        className="overflow-hidden"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            ref={inputRef}
            id="navbar-search-input"
            type="text"
            placeholder="Search cars…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input pl-9 pr-9 h-9 text-sm rounded-xl"
          />
          {query && (
            <button
              onClick={() => { clearSearch(); onClose() }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Dropdown results */}
      <AnimatePresence>
        {hasResults && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden" animate="show" exit="exit"
            id="navbar-search-results"
            className="absolute right-0 top-full mt-2 w-80 glass-strong rounded-2xl
                       border border-border/60 shadow-card z-50 overflow-hidden"
          >
            {results.slice(0, 6).map((car, i) => (
              <motion.button
                key={car.id}
                onClick={() => handleSelect(car)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left
                           hover:bg-accent/[0.08] transition-colors border-b border-border/20 last:border-0"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                  <img src={car.images[0]} alt={car.model}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        `https://via.placeholder.com/40x40/0D1B2A/00D4FF?text=${car.brand[0]}`
                    }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">
                    {car.brand} {car.model}
                  </p>
                  <p className="text-xs text-text-muted truncate">{car.segment} · {car.fuelType}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-black text-accent">{car.priceRange}</p>
                </div>
              </motion.button>
            ))}
            <button
              onClick={() => { navigate(`/cars?search=${encodeURIComponent(query)}`); clearSearch(); onClose() }}
              className="w-full flex items-center justify-between px-4 py-3
                         text-xs text-accent font-semibold hover:bg-accent/[0.08] transition-colors"
            >
              <span>View all results for "{query}"</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN NAVBAR
// ═══════════════════════════════════════════════════════════════
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { isDark } = useTheme()

  const closeSearch = useCallback(() => setSearchOpen(false), [])

  // Close mobile drawer on route change
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header
        className={clsx(
          'sticky top-0 z-50 glass-strong shadow-nav transition-colors duration-300',
          !isDark && 'border-b border-border/30'
        )}
      >
        <div className="section-wrapper h-[72px] flex items-center justify-between gap-3">

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 no-underline group"
            aria-label="AutoIQ Arena Home"
          >
            <motion.div
              className="w-9 h-9 rounded-xl bg-accent-gradient flex items-center justify-center shadow-glow-sm"
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <Car className="w-5 h-5 text-primary" strokeWidth={2.5} />
            </motion.div>
            <div className="leading-none">
              <span className="block text-sm font-black tracking-widest text-accent uppercase">AutoIQ</span>
              <span className="block text-[10px] font-semibold tracking-[0.25em] text-text-muted uppercase">Arena</span>
            </div>
          </Link>

          {/* ── Desktop Nav Links ────────────────────────────── */}
          <nav
            className="hidden lg:flex items-center gap-0.5 flex-1 justify-center"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                className={({ isActive }) =>
                  clsx(
                    'relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-accent bg-accent/10'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    {item.label}
                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-dot"
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── Desktop Right Controls ───────────────────────── */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {/* Expanding search */}
            <AnimatePresence mode="wait" initial={false}>
              {searchOpen ? (
                <SearchBar key="search-open" onClose={closeSearch} />
              ) : (
                <motion.button
                  key="search-icon"
                  id="search-toggle-btn"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Open search"
                  className="w-9 h-9 rounded-xl flex items-center justify-center
                             border border-border/60 bg-surface/40 text-text-muted
                             hover:border-accent/40 hover:text-accent transition-all"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <Search className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Divider */}
            <div className="w-px h-6 bg-border/50 mx-1" />

            {/* CTAs */}
            <Link to="/compare" className="btn btn-secondary btn-sm gap-1.5 whitespace-nowrap">
              <GitCompare className="w-3.5 h-3.5" /> Compare
            </Link>
            <Link to="/ai-advisor" className="btn btn-primary btn-sm gap-1.5 whitespace-nowrap">
              <Bot className="w-3.5 h-3.5" /> Ask AI
            </Link>
          </div>

          {/* ── Mobile Right Controls ────────────────────────── */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              id="mobile-search-btn"
              onClick={() => setSearchOpen(o => !o)}
              aria-label="Search"
              className="w-9 h-9 rounded-xl flex items-center justify-center
                         border border-border/60 bg-surface/40 text-text-muted
                         hover:border-accent/40 hover:text-accent transition-all"
            >
              {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>

            <ThemeToggle />

            <button
              id="mobile-menu-toggle"
              className="w-9 h-9 rounded-xl flex items-center justify-center
                         border border-border/60 bg-surface/40 text-text-muted
                         hover:border-accent/40 hover:text-accent transition-all"
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span key="x"
                    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                    <X className="w-4 h-4" />
                  </motion.span>
                ) : (
                  <motion.span key="menu"
                    initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                    <Menu className="w-4 h-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* ── Mobile Search Bar (below nav bar) ─────────────── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="lg:hidden overflow-hidden border-t border-border/30"
            >
              <div className="px-4 py-3">
                <SearchBar onClose={closeSearch} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MOBILE DRAWER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={closeMobile}
              aria-hidden="true"
            />

            {/* Slide-in drawer */}
            <motion.nav
              key="drawer"
              id="mobile-menu"
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="exit"
              aria-label="Mobile navigation"
              className="fixed left-0 top-0 bottom-0 z-50 w-72 lg:hidden
                         glass-strong border-r border-border/50 flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 h-[72px] border-b border-border/30 shrink-0">
                <Link to="/" onClick={closeMobile} className="flex items-center gap-2.5 no-underline">
                  <div className="w-8 h-8 rounded-xl bg-accent-gradient flex items-center justify-center">
                    <Car className="w-4 h-4 text-primary" strokeWidth={2.5} />
                  </div>
                  <div className="leading-none">
                    <span className="block text-xs font-black tracking-widest text-accent uppercase">AutoIQ</span>
                    <span className="block text-[9px] font-semibold tracking-[0.25em] text-text-muted uppercase">Arena</span>
                  </div>
                </Link>
                <button
                  onClick={closeMobile}
                  aria-label="Close menu"
                  className="w-8 h-8 rounded-xl flex items-center justify-center
                             border border-border/60 bg-surface/40 text-text-muted hover:text-danger transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nav items */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-1">
                {NAV_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={closeMobile}
                      id={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150',
                          isActive
                            ? 'bg-accent/15 text-accent border border-accent/25'
                            : 'text-text-muted hover:text-text-primary hover:bg-surface/60'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className={clsx(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                            isActive ? 'bg-accent/20' : 'bg-surface/60'
                          )}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <span>{item.label}</span>
                          {isActive && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </motion.div>
                ))}
              </div>

              {/* Drawer footer */}
              <motion.div
                className="px-3 pb-6 pt-3 border-t border-border/30 space-y-2 shrink-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  to="/compare" onClick={closeMobile}
                  className="btn btn-secondary btn-md w-full gap-2 no-underline"
                >
                  <GitCompare className="w-4 h-4" /> Compare Cars
                </Link>
                <Link
                  to="/ai-advisor" onClick={closeMobile}
                  className="btn btn-primary btn-md w-full gap-2 no-underline"
                >
                  <Zap className="w-4 h-4" /> Ask AI Advisor
                </Link>
              </motion.div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
