import { Skeleton } from '@/components/ui/skeleton'
import { FallenCardSkeleton } from '@/components/fallen/FallenCardSkeleton'

export default function Loading() {
  return (
    <div className="container py-8 md:py-12">
      {/* Hero Section Skeleton */}
      <section className="mb-12 text-center">
        <div className="mx-auto max-w-3xl">
          <Skeleton className="mx-auto mb-4 h-12 w-2/3 md:h-14" />
          <Skeleton className="mx-auto h-6 w-full md:h-7" />
          <Skeleton className="mx-auto mt-2 h-6 w-5/6 md:h-7" />

          {/* Акцентный маркер */}
          <Skeleton className="mx-auto mt-6 h-2 w-32 rounded-full" />
        </div>
      </section>

      {/* Stats Skeleton */}
      <section className="mb-12">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border bg-card p-6 text-center">
              <Skeleton className="mx-auto h-9 w-16" />
              <Skeleton className="mx-auto mt-2 h-4 w-32" />
            </div>
          ))}
        </div>
      </section>

      {/* Filter Skeleton */}
      <section className="mb-8">
        <div className="rounded-lg border border-border/50 bg-card/50 p-4 shadow-sm backdrop-blur-sm sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-full sm:w-32" />
            </div>
          </div>
        </div>
      </section>

      {/* Cards Grid Skeleton */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <FallenCardSkeleton key={i} />
          ))}
        </div>

        {/* Indicator Skeleton */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-1.5 w-1.5 rounded-full" />
            ))}
          </div>
          <Skeleton className="ml-2 h-4 w-32" />
        </div>
      </section>

      {/* CTA Section Skeleton */}
      <section className="relative mt-16 overflow-hidden rounded-3xl border border-border/60 bg-surface/80 p-8 text-center shadow-soft md:p-12">
        <div className="relative mx-auto max-w-3xl space-y-4">
          <Skeleton className="mx-auto h-8 w-64 md:h-9" />
          <Skeleton className="mx-auto h-5 w-full" />
          <Skeleton className="mx-auto h-5 w-5/6" />
          <Skeleton className="mx-auto mt-4 h-11 w-56 rounded-full" />
        </div>
      </section>
    </div>
  )
}
