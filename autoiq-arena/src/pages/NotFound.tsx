import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Database, GitCompare, Bot, Home, Wrench } from 'lucide-react'

const suggestions = [
  { label: 'Home',          to: '/',           icon: Home       },
  { label: 'Browse Cars',   to: '/cars',       icon: Database   },
  { label: 'Compare',       to: '/compare',    icon: GitCompare },
  { label: 'AI Advisor',    to: '/ai-advisor', icon: Bot        },
  { label: 'Tools',         to: '/tools',      icon: Wrench     },
]

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center section-wrapper py-24 text-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00D4FF 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="glass rounded-3xl p-10 sm:p-14 max-w-lg w-full space-y-8 border border-border/40 relative z-10"
      >
        {/* Giant 404 */}
        <div>
          <motion.p
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.6, type: 'spring', stiffness: 120 }}
            className="text-[6rem] sm:text-[8rem] font-black leading-none select-none gradient-text"
          >
            404
          </motion.p>
          <h1 className="text-display-sm mt-1 mb-2">Page Not Found</h1>
          <p className="text-text-muted text-sm leading-relaxed">
            Looks like you took a wrong turn at the pit lane.
            <br />This page doesn't exist or has been moved.
          </p>
        </div>

        {/* Suggestion links */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-dim font-bold mb-3">Helpful shortcuts</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {suggestions.map((s, i) => (
              <motion.div
                key={s.to}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.06 }}
              >
                <Link
                  to={s.to}
                  className="flex flex-col items-center gap-2 px-3 py-3 rounded-xl
                             border border-border/50 hover:border-accent/40 bg-surface/40
                             text-xs font-semibold text-text-secondary hover:text-accent
                             transition-all duration-200 no-underline group card-hover"
                >
                  <s.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {s.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <Link to="/" className="btn btn-primary btn-md w-full gap-2 no-underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </motion.div>
    </div>
  )
}
