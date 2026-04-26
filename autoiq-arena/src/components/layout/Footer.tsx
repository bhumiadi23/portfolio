import { Link } from 'react-router-dom'
import { Car, Github, Twitter, Youtube, Mail } from 'lucide-react'

const footerLinks = {
  Platform: [
    { label: 'Car Database', to: '/cars' },
    { label: 'Compare Cars', to: '/compare' },
    { label: 'AI Advisor', to: '/ai-advisor' },
  ],
  Tools: [
    { label: 'EMI Calculator', to: '/tools' },
    { label: 'Fuel Cost', to: '/tools#fuel' },
    { label: 'Depreciation', to: '/tools#depreciation' },
  ],
  Community: [
    { label: 'Reviews', to: '/community' },
    { label: 'Forum', to: '/community#forum' },
    { label: 'Leaderboard', to: '/community#leaderboard' },
  ],
}

const socials = [
  { icon: Github,  href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Mail,    href: '#', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-secondary/60 mt-20">
      <div className="section-wrapper py-12">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent-gradient flex items-center justify-center shadow-glow-sm">
                <Car className="w-5 h-5 text-primary" strokeWidth={2.5} />
              </div>
              <div>
                <span className="block text-sm font-black tracking-widest text-accent uppercase">AutoIQ Arena</span>
                <span className="block text-[10px] text-text-muted tracking-widest">India's Premier Car Intelligence Platform</span>
              </div>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs">
              Compare, analyze, and choose your perfect car with real data, AI-powered recommendations, and a passionate community.
            </p>
            {/* Socials */}
            <div className="flex gap-3 mt-5">
              {socials.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-surface border border-border/60 flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/40 transition-all duration-200"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h6 className="text-xs font-bold tracking-widest uppercase text-text-muted mb-4">{group}</h6>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-text-secondary hover:text-accent transition-colors duration-200 no-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="divider mb-6" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-dim">
          <span>© 2024 AutoIQ Arena. Built for India's car enthusiasts.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-text-muted transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-text-muted transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
