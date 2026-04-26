import { Link } from 'react-router-dom'
import { Star, Zap, Fuel, GitCompare, Check } from 'lucide-react'
import clsx from 'clsx'
import type { Car } from '../../types/car.types'
import { formatPrice } from '../../utils/formatters'
import { fuelBadgeColor } from '../../utils/carUtils'

interface CarCardProps {
  car: Car
  onCompare?: (car: Car) => void
  isInCompare?: boolean
  canAddMore?: boolean
}

export default function CarCard({ car, onCompare, isInCompare = false, canAddMore = true }: CarCardProps) {
  const img = car.images[0]

  return (
    <article
      id={`car-card-${car.id}`}
      className="group relative glass rounded-2xl overflow-hidden border border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-card-hover animate-fade-in"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
        {car.isEV && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/20 text-success border border-success/30 backdrop-blur-sm">
            <Zap className="w-3 h-3" /> EV
          </span>
        )}
        {car.isPopular && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warm/20 text-warm border border-warm/30 backdrop-blur-sm">
            🔥 Popular
          </span>
        )}
      </div>

      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-secondary">
        <img
          src={img}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={e => {
            const t = e.target as HTMLImageElement
            t.src = `https://via.placeholder.com/400x220/0D1B2A/00D4FF?text=${encodeURIComponent(car.brand + ' ' + car.model)}`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand + Model */}
        <div className="mb-2">
          <p className="text-xs text-text-muted font-semibold tracking-widest uppercase">{car.brand}</p>
          <h3 className="text-base font-bold text-text-primary leading-tight">{car.model}</h3>
          <p className="text-xs text-text-muted mt-0.5 truncate">{car.variant}</p>
        </div>

        {/* Fuel + Segment badges */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          <span className={clsx('stat-chip', fuelBadgeColor(car.fuelType))}>
            <Fuel className="w-3 h-3" />
            {car.fuelType}
          </span>
          <span className="stat-chip">{car.segment}</span>
          <span className="stat-chip">{car.transmission}</span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 rounded-xl bg-surface/60 border border-border/40">
            <p className="text-[10px] text-text-dim uppercase tracking-wide">Power</p>
            <p className="text-xs font-bold text-text-primary font-mono mt-0.5">{car.engine.power.replace(' bhp', '')}</p>
            <p className="text-[9px] text-text-dim">bhp</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-surface/60 border border-border/40">
            <p className="text-[10px] text-text-dim uppercase tracking-wide">{car.isEV ? 'Range' : 'Mileage'}</p>
            <p className="text-xs font-bold text-text-primary font-mono mt-0.5">{car.mileage.split(' ')[0]}</p>
            <p className="text-[9px] text-text-dim">{car.isEV ? 'km' : 'kmpl'}</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-surface/60 border border-border/40">
            <p className="text-[10px] text-text-dim uppercase tracking-wide">Safety</p>
            <p className="text-xs font-bold text-text-primary font-mono mt-0.5">{car.safety.globalNcap}</p>
            <p className="text-[9px] text-text-dim">★ NCAP</p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-4">
          <Star className="w-3.5 h-3.5 text-warning fill-warning" />
          <span className="text-sm font-bold text-text-primary">{car.rating}</span>
          <span className="text-xs text-text-dim">({car.reviewCount.toLocaleString()} reviews)</span>
        </div>

        {/* Price + Actions */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] text-text-dim uppercase tracking-wide">Ex-showroom</p>
            <p className="text-base font-black text-accent">{formatPrice(car.price)}</p>
          </div>
          <div className="flex gap-1.5">
            <button
              id={`compare-btn-${car.id}`}
              onClick={() => onCompare?.(car)}
              disabled={!canAddMore && !isInCompare}
              className={clsx(
                'p-2 rounded-xl border transition-all duration-200',
                isInCompare
                  ? 'bg-accent/20 border-accent/40 text-accent'
                  : 'bg-surface border-border/60 text-text-muted hover:border-accent/40 hover:text-accent',
                !canAddMore && !isInCompare && 'opacity-40 cursor-not-allowed'
              )}
              aria-label={isInCompare ? 'Remove from compare' : 'Add to compare'}
              title={isInCompare ? 'In compare list' : 'Add to compare'}
            >
              {isInCompare ? <Check className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
            </button>
            <Link
              to={`/cars/${car.id}`}
              id={`view-detail-${car.id}`}
              className="btn btn-primary btn-sm flex-1 text-xs py-2 px-3"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
