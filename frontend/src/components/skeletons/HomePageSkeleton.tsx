import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FallenCardSkeleton } from '@/components/fallen/FallenCardSkeleton'

export function HomePageSkeleton() {
  return (
    <div className="container py-8 md:py-12">
      {/* Hero Section Skeleton */}
      <section className="mb-8 text-center sm:mb-12">
        <div className="mx-auto max-w-3xl px-4 space-y-3 sm:space-y-4">
          <Skeleton className="h-10 w-3/4 mx-auto sm:h-12 md:h-14" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full mx-auto sm:h-5" />
            <Skeleton className="h-4 w-5/6 mx-auto sm:h-5" />
            <Skeleton className="h-4 w-4/6 mx-auto sm:h-5" />
          </div>
          <Skeleton className="h-1.5 w-24 mx-auto rounded-full sm:h-2 sm:w-32" />
        </div>
      </section>

      {/* Stats Section Skeleton */}
      <section className="mb-8 sm:mb-12">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border bg-card">
              <CardContent className="p-4 text-center sm:p-6">
                <Skeleton className="h-8 w-24 mx-auto mb-2 sm:h-10 sm:w-32" />
                <Skeleton className="h-3 w-full mx-auto sm:h-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Memorial Calendar Skeleton */}
      <section className="mb-8 sm:mb-12">
        <Card className="border border-amber-200/50 bg-background/60">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48 sm:h-7 sm:w-64" />
                  <Skeleton className="h-4 w-64 sm:w-80" />
                </div>
              </div>

              {/* Calendar Items */}
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border/40 bg-background-soft/70 p-3 sm:p-4">
                    <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full sm:h-16 sm:w-16" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 sm:h-5" />
                      <Skeleton className="h-3 w-1/2 sm:h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Filter Section Skeleton */}
      <section className="mb-8">
        <Card className="border-border/50 bg-background/80 shadow-soft">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Search Input */}
              <Skeleton className="h-10 w-full rounded-lg sm:h-11" />

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24 rounded-full sm:h-9 sm:w-32" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Cards Grid Section Skeleton */}
      <section>
        <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-48 sm:h-8 sm:w-64" />
          <Skeleton className="h-4 w-32 sm:h-5 sm:w-40" />
        </div>

        {/* Grid of Fallen Cards */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <FallenCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Hero Mosaic Section Skeleton */}
      <section className="mt-12 sm:mt-16">
        <div className="mb-6 text-center sm:mb-8 space-y-3 sm:space-y-4">
          <Skeleton className="h-8 w-64 mx-auto sm:h-10 sm:w-80 md:h-12" />
          <div className="mx-auto max-w-2xl px-4 space-y-2">
            <Skeleton className="h-3 w-full mx-auto sm:h-4" />
            <Skeleton className="h-3 w-5/6 mx-auto sm:h-4" />
          </div>
          <Skeleton className="h-0.5 w-20 mx-auto rounded-full sm:h-1 sm:w-24" />
        </div>

        {/* Mosaic Grid */}
        <Card className="overflow-hidden rounded-2xl border border-border/40 bg-background-soft/50 sm:rounded-3xl">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-6 gap-1 sm:gap-2 md:grid-cols-8 lg:grid-cols-12">
              {[...Array(72)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-sm" />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section Skeleton */}
      <section className="relative mt-12 overflow-hidden rounded-2xl border border-border/60 bg-surface/80 p-6 text-center shadow-soft sm:mt-16 sm:rounded-3xl sm:p-8 md:p-12">
        <div className="relative mx-auto max-w-3xl space-y-3 sm:space-y-4">
          <Skeleton className="h-7 w-64 mx-auto sm:h-8 sm:w-80 md:h-10" />
          <div className="mx-auto space-y-2">
            <Skeleton className="h-3 w-full mx-auto sm:h-4" />
            <Skeleton className="h-3 w-5/6 mx-auto sm:h-4" />
            <Skeleton className="h-3 w-4/6 mx-auto sm:h-4" />
          </div>
          <Skeleton className="h-10 w-48 mx-auto rounded-full sm:h-11 sm:w-56" />
        </div>
      </section>
    </div>
  )
}
