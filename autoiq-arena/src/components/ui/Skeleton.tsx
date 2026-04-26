/**
 * Skeleton — reusable shimmering placeholder for loading states.
 *
 * Usage:
 *   <Skeleton className="h-6 w-32" />
 *   <Skeleton className="h-48 w-full rounded-2xl" />
 */
import clsx from 'clsx'

interface SkeletonProps {
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function Skeleton({ className, as: Tag = 'div' }: SkeletonProps) {
  return <Tag className={clsx('skeleton', className)} aria-hidden="true" />
}

/** Pre-built card skeleton for the car grid */
export function CarCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3 w-28" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-7 w-16 rounded-lg" />
          <Skeleton className="h-7 w-16 rounded-lg" />
          <Skeleton className="h-7 w-16 rounded-lg" />
        </div>
        <div className="flex justify-between items-center pt-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

/** Full-page loader skeleton shown while lazy route chunks are fetching */
export function PageLoader() {
  return (
    <div className="section-wrapper py-12 space-y-8 animate-pulse-glow" aria-label="Loading page…">
      {/* Hero area */}
      <div className="space-y-4 max-w-xl">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-11 w-36 rounded-xl" />
          <Skeleton className="h-11 w-28 rounded-xl" />
        </div>
      </div>

      {/* Card grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CarCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
