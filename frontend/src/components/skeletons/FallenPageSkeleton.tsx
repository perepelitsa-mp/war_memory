import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function FallenPageSkeleton() {
  return (
    <div className="container space-y-8 py-8 sm:space-y-10 sm:py-10 md:space-y-12 md:py-12 lg:space-y-16 lg:py-16">
      {/* Hero Profile Card Skeleton */}
      <section>
        <Card className="overflow-hidden border border-border/50 bg-gradient-to-br from-background/95 via-background-soft/90 to-background/95 shadow-glow">
          <div className="relative">
            {/* Background gradient */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-transparent to-background opacity-60" />

            <div className="grid gap-6 p-4 sm:gap-8 sm:p-6 md:grid-cols-[300px_1fr] md:gap-10 md:p-8 lg:grid-cols-[350px_1fr]">
              {/* Hero Photo Skeleton */}
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="aspect-[3/4] w-full max-w-[300px] rounded-2xl" />
                <div className="flex w-full gap-2">
                  <Skeleton className="h-10 flex-1 rounded-xl" />
                  <Skeleton className="h-10 flex-1 rounded-xl" />
                </div>
              </div>

              {/* Hero Info Skeleton */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Skeleton className="h-8 w-3/4 sm:h-10 md:h-12" />
                  <Skeleton className="h-6 w-1/4" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-border/40 bg-background/60">
                      <CardContent className="p-3 sm:p-4">
                        <Skeleton className="mb-2 h-4 w-full" />
                        <Skeleton className="h-6 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Details Grid */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Skeleton className="mt-1 h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Profile Editor Skeleton */}
      <section>
        <Card className="border-border/50 bg-background/80 shadow-soft">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Awards Section Skeleton */}
      <section>
        <Card className="border-border/50 bg-background/80 shadow-soft">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-border/40 bg-background-soft/70">
                  <CardContent className="flex flex-col items-center gap-3 p-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Memorial Text Skeleton */}
      <section>
        <Card className="border-border/50 bg-background/80 shadow-soft">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </section>

      {/* Biography Skeleton */}
      <section>
        <Card className="border-border/50 bg-background/80 shadow-soft">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </section>

      {/* Timeline Skeleton */}
      <section>
        <Card className="border-border/50 bg-background/80 shadow-soft">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full max-w-2xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="border-border/40 bg-background-soft/70">
                  <CardContent className="p-3">
                    <Skeleton className="mb-2 h-4 w-full" />
                    <Skeleton className="h-5 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="relative pl-10 sm:pl-14">
                  <Skeleton className="absolute left-0 top-2 h-8 w-8 rounded-full sm:h-10 sm:w-10" />
                  <Card className="border-border/40 bg-background/95">
                    <CardContent className="space-y-3 p-4 sm:p-5">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-5 w-3/4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Memory Board Skeleton */}
      <section>
        <Card className="border-border/50 bg-background/80 shadow-soft">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="border-border/40 bg-gradient-to-br from-background/95 to-background-soft/90">
                <CardHeader className="border-b border-border/30 p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Skeleton className="aspect-video w-full rounded-xl" />
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Gallery Skeleton */}
      <section>
        <Card className="border-border/50 bg-background/80 shadow-soft">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Comments Skeleton */}
      <section>
        <Card className="border-border/50 bg-background/80 shadow-soft">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-border/30 bg-background-soft/60">
                <CardContent className="space-y-3 pt-4">
                  <div className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Condolence Book Skeleton */}
      <section>
        <Card className="border-border/50 bg-background/80 shadow-soft">
          <CardHeader>
            <Skeleton className="h-6 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="border-border/30 bg-background-soft/60">
                <CardContent className="space-y-3 pt-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Hero Connections Skeleton */}
      <section>
        <Card className="border-border/50 bg-background/80 shadow-soft">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-border/40 bg-background-soft/70">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Candles and Flowers Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Candles */}
        <Card className="border-border/50 bg-background/80 shadow-soft">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Flowers */}
        <Card className="border-border/50 bg-background/80 shadow-soft">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Moderators Section Skeleton */}
      <section>
        <Card className="border-border/50 bg-background/80 shadow-soft">
          <CardHeader>
            <Skeleton className="h-6 w-56" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border/40 bg-background-soft/70 p-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
