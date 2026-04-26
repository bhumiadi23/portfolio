import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarCarouselProps {
  children: React.ReactNode[]
  cardWidth?: number  // px
}

export default function CarCarousel({ children, cardWidth = 280 }: CarCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const GAP = 16

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current
    if (!el) return
    const amount = (cardWidth + GAP) * 2
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }

  const onScroll = () => {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }

  return (
    <div className="relative group/carousel">
      {/* Scroll buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20
                     w-10 h-10 rounded-full glass-strong border border-border/60
                     flex items-center justify-center shadow-card
                     text-text-muted hover:text-accent hover:border-accent/40 transition-all
                     opacity-0 group-hover/carousel:opacity-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20
                     w-10 h-10 rounded-full glass-strong border border-border/60
                     flex items-center justify-center shadow-card
                     text-text-muted hover:text-accent hover:border-accent/40 transition-all
                     opacity-0 group-hover/carousel:opacity-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none" />

      {/* Scrollable track */}
      <motion.div
        ref={trackRef}
        onScroll={onScroll}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-2 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={trackRef}
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {children.map((child, i) => (
          <div
            key={i}
            style={{ minWidth: cardWidth, scrollSnapAlign: 'start' }}
          >
            {child}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
