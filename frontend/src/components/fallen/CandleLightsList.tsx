'use client'

import { Flame, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface CandleLight {
  id: string
  created_at: string
  user: {
    id: string
    full_name: string
    avatar_url: string | null
  }
}

interface CandleLightsListProps {
  lights: CandleLight[]
  totalCount: number
}

export function CandleLightsList({ lights, totalCount }: CandleLightsListProps) {
  if (totalCount === 0) {
    return null
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ')
    return parts
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase()
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy, HH:mm', { locale: ru })
    } catch {
      return dateString
    }
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Flame className="h-5 w-5 text-amber-500" />
          <span>
            Зажжённые свечи памяти
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({totalCount})
            </span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lights.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="rounded-full bg-amber-500/10 p-4">
              <Flame className="h-8 w-8 text-amber-500/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/70">
                Зажгите первую свечу памяти
              </p>
              <p className="text-xs text-muted-foreground">
                Станьте первым, кто почтит память героя
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {lights.map((light) => (
              <div
                key={light.id}
                className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/50 p-3 transition-colors hover:bg-background/80"
              >
                <Avatar className="h-10 w-10 border-2 border-amber-500/20">
                  <AvatarImage src={light.user.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-xs font-semibold text-foreground">
                    {getInitials(light.user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium leading-tight">{light.user.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(light.created_at)}
                  </p>
                </div>
                <Flame className="h-4 w-4 text-amber-500/70" />
              </div>
            ))}

            {totalCount > lights.length && (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border/40 bg-background/30 py-3 text-xs text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  И ещё {totalCount - lights.length}{' '}
                  {totalCount - lights.length === 1
                    ? 'человек'
                    : totalCount - lights.length < 5
                      ? 'человека'
                      : 'человек'}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
