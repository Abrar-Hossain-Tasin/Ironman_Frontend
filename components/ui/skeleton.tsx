import { cn } from '@/lib/utils'

type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-ironman-navy-50',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer-sweep before:bg-shimmer',
        className
      )}
      aria-hidden
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-ironman-navy-100 bg-white p-5 shadow-soft">
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="mt-3 h-8 w-3/5" />
      <Skeleton className="mt-6 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-4/5" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-ironman-navy-100 bg-white">
      <div className="border-b border-ironman-navy-100 bg-ironman-navy-50 px-4 py-3">
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="divide-y divide-ironman-navy-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <TableSkeleton rows={6} />
    </div>
  )
}
