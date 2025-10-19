import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatLifespan, getFullName, truncate } from '@/lib/utils'
import { Fallen } from '@/types'

interface FallenCardProps {
  fallen: Fallen
}

export function FallenCard({ fallen }: FallenCardProps) {
  const fullName = getFullName(fallen.last_name, fallen.first_name, fallen.middle_name)
  const lifespan = formatLifespan(fallen.birth_date, fallen.death_date)

  return (
    <Link href={`/fallen/${fallen.id}`}>
      <Card className="memorial-card h-full overflow-hidden transition-colors">
        {/* Hero Photo */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-background-soft">
          {fallen.hero_photo_url ? (
            <Image
              src={fallen.hero_photo_url}
              alt={fullName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--surface)/0.8),hsl(var(--background-soft)/0.6))] transition-colors">
              <span className="text-6xl font-bold text-foreground/20">
                {fallen.first_name[0]}{fallen.last_name[0]}
              </span>
            </div>
          )}

          {/* DEMO Badge */}
          {fallen.is_demo && (
            <div className="absolute top-2 right-2">
              <Badge variant="demo">DEMO</Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <h3 className="text-xl font-semibold leading-tight line-clamp-2">
            {fullName}
          </h3>
          <p className="text-sm text-muted-foreground">{lifespan}</p>
        </CardHeader>

        <CardContent className="pb-4">
          {/* Военные данные */}
          <div className="space-y-1 text-sm">
            {fallen.rank && (
              <p className="text-muted-foreground">
                <span className="font-medium">Звание:</span> {fallen.rank}
              </p>
            )}
            {fallen.military_unit && (
              <p className="text-muted-foreground line-clamp-1">
                <span className="font-medium">Подразделение:</span>{' '}
                {fallen.military_unit}
              </p>
            )}
            {fallen.hometown && (
              <p className="text-muted-foreground">
                <span className="font-medium">Место:</span> {fallen.hometown}
              </p>
            )}
          </div>

          {/* Memorial Text */}
          {fallen.memorial_text && (
            <p className="mt-3 text-sm text-foreground/70 line-clamp-3 transition-colors">
              {truncate(fallen.memorial_text, 150)}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
