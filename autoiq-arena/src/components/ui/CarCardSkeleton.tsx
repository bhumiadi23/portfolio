/**
 * CarCardSkeleton — shimmer placeholder shown while car list is loading.
 * Count prop controls how many skeleton cards to render.
 */
import clsx from 'clsx'

function ShimmerBox({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'rounded-lg bg-surface-light/60 relative overflow-hidden',
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer
                      bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  )
}

export function CarCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden border border-border/40 animate-pulse">
      {/* Image placeholder */}
      <ShimmerBox className="h-44 rounded-none" />

      <div className="p-4 space-y-3">
        {/* Brand + model */}
        <div className="space-y-1.5">
          <ShimmerBox className="h-3 w-16" />
          <ShimmerBox className="h-5 w-32" />
          <ShimmerBox className="h-3 w-24" />
        </div>

        {/* Badges */}
        <div className="flex gap-2">
          <ShimmerBox className="h-6 w-16 rounded-full" />
          <ShimmerBox className="h-6 w-14 rounded-full" />
          <ShimmerBox className="h-6 w-18 rounded-full" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map(i => (
            <ShimmerBox key={i} className="h-14 rounded-xl" />
          ))}
        </div>

        {/* Rating */}
        <ShimmerBox className="h-4 w-28" />

        {/* Price + Actions */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <ShimmerBox className="h-6 w-20" />
          <div className="flex gap-2">
            <ShimmerBox className="w-9 h-9 rounded-xl" />
            <ShimmerBox className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Render `count` skeleton cards in a responsive grid */
export function CarCardSkeletonGrid({ count = 9, cols = 3 }: { count?: number; cols?: 2 | 3 }) {
  return (
    <div className={clsx('grid gap-4', {
      'grid-cols-1 sm:grid-cols-2': cols === 2,
      'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3': cols === 3,
    })}>
      {Array.from({ length: count }).map((_, i) => (
        <CarCardSkeleton key={i} />
      ))}
    </div>
  )
}
