'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flower2 } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Link from 'next/link'

interface Flower {
  id: string
  flower_type: string
  flower_color: string
  flower_count: number
  message?: string
  created_at: string
  user: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

interface FlowersListProps {
  flowers: Flower[]
  totalCount: number
}

const FLOWER_EMOJI_MAP: Record<string, string> = {
  roses: '🌹',
  carnations: '💐',
  lilies: '🌸',
  chrysanthemums: '🌼',
  tulips: '🌷',
  mixed: '💐',
}

const FLOWER_NAME_MAP: Record<string, string> = {
  roses: 'розы',
  carnations: 'гвоздики',
  lilies: 'лилии',
  chrysanthemums: 'хризантемы',
  tulips: 'тюльпаны',
  mixed: 'смешанный букет',
}

const COLOR_NAME_MAP: Record<string, string> = {
  red: 'красные',
  white: 'белые',
  pink: 'розовые',
  yellow: 'жёлтые',
  purple: 'фиолетовые',
  mixed: 'разноцветные',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function FlowersList({ flowers, totalCount }: FlowersListProps) {
  if (flowers.length === 0) {
    return null
  }

  return (
    <Card className="border-amber-200/50 bg-background/60">
      <CardHeader>
        <CardTitle className="flex flex-col items-start gap-2 text-lg sm:flex-row sm:items-center sm:text-xl">
          <span className="flex items-center gap-2">
            <Flower2 className="h-5 w-5 text-amber-500" />
            Возложенные цветы
          </span>
          <span className="text-sm font-normal text-muted-foreground sm:ml-auto">
            {totalCount} {totalCount === 1 ? 'цветок' : totalCount < 5 ? 'цветка' : 'цветов'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {flowers.slice(0, 20).map((flower) => (
            <div
              key={flower.id}
              className="flex gap-2 rounded-lg border border-amber-200/50 bg-background/40 p-2 transition-all hover:bg-background/80 sm:gap-3 sm:p-3"
            >
              {/* Аватар пользователя */}
              <Link href={`/users/${flower.user.id}`}>
                <Avatar className="h-8 w-8 border-2 border-amber-200 sm:h-10 sm:w-10">
                  <AvatarImage src={flower.user.avatar_url || undefined} />
                  <AvatarFallback className="bg-amber-100 text-[10px] text-amber-700 sm:text-xs">
                    {getInitials(flower.user.full_name)}
                  </AvatarFallback>
                </Avatar>
              </Link>

              {/* Информация */}
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <Link
                    href={`/users/${flower.user.id}`}
                    className="text-sm font-medium hover:underline sm:text-base"
                  >
                    {flower.user.full_name}
                  </Link>
                  <span className="text-xs text-muted-foreground sm:text-sm">
                    возложил{flower.user.full_name.endsWith('а') ? 'а' : ''}
                  </span>
                  <span className="text-lg sm:text-xl">{FLOWER_EMOJI_MAP[flower.flower_type]}</span>
                </div>

                <p className="text-xs text-muted-foreground sm:text-sm">
                  {flower.flower_count}{' '}
                  {COLOR_NAME_MAP[flower.flower_color]}{' '}
                  {FLOWER_NAME_MAP[flower.flower_type]}
                </p>

                {flower.message && (
                  <p className="text-xs italic text-muted-foreground sm:text-sm">
                    "{flower.message}"
                  </p>
                )}

                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  {format(new Date(flower.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                </p>
              </div>
            </div>
          ))}

          {flowers.length > 20 && (
            <p className="text-center text-sm text-muted-foreground">
              Показано 20 из {flowers.length} возложений
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
