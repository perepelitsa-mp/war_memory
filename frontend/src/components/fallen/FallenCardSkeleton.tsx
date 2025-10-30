import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function FallenCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      {/* Hero Photo Skeleton */}
      <Skeleton className="aspect-[4/5] w-full" />

      <CardHeader className="pb-3">
        {/* Name Skeleton */}
        <Skeleton className="h-7 w-3/4" />
        {/* Lifespan Skeleton */}
        <Skeleton className="mt-2 h-4 w-1/2" />
      </CardHeader>

      <CardContent className="pb-4">
        {/* Military Data Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Memorial Text Skeleton */}
        <div className="mt-3 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </CardContent>
    </Card>
  )
}
