'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Calendar, Cake, Flame } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface MemorialPerson {
  id: string
  first_name: string
  last_name: string
  middle_name?: string
  hero_photo_url?: string
  birth_date: string
  death_date: string
  rank?: string
  dateType: 'birthday' | 'memorial'
  age?: number
  yearsAgo?: number
}

export function MemorialCalendar() {
  const [birthdays, setBirthdays] = useState<MemorialPerson[]>([])
  const [memorialDays, setMemorialDays] = useState<MemorialPerson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMemorialCalendar()
  }, [])

  const loadMemorialCalendar = async () => {
    try {
      const response = await fetch('/api/memorial-calendar')
      if (!response.ok) throw new Error('Failed to load memorial calendar')

      const data = await response.json()
      setBirthdays(data.birthdays || [])
      setMemorialDays(data.memorialDays || [])
    } catch (error) {
      console.error('Error loading memorial calendar:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (firstName: string, lastName: string): string => {
    return `${lastName[0]}${firstName[0]}`.toUpperCase()
  }

  const getFullName = (person: MemorialPerson): string => {
    return [person.last_name, person.first_name, person.middle_name].filter(Boolean).join(' ')
  }

  const totalEvents = birthdays.length + memorialDays.length

  if (loading) {
    return null // Или скелетон-loader
  }

  if (totalEvents === 0) {
    return null // Не показываем блок, если нет событий
  }

  const today = new Date()

  return (
    <Card className="border-amber-200/50 bg-background/60">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg sm:text-xl">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500" />
            Помним сегодня
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {format(today, 'd MMMM', { locale: ru })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Дни рождения */}
        {birthdays.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-500">
              <Cake className="h-4 w-4" />
              День рождения
            </h3>
            <div className="space-y-2">
              {birthdays.map((person) => (
                <Link
                  key={person.id}
                  href={`/fallen/${person.id}`}
                  className="block rounded-lg border border-amber-200/50 bg-background/40 p-2 transition-all hover:bg-background/80 hover:shadow-md sm:p-3"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar className="h-10 w-10 border-2 border-amber-200 sm:h-12 sm:w-12">
                      <AvatarImage src={person.hero_photo_url || undefined} />
                      <AvatarFallback className="bg-amber-100 text-xs text-amber-700 sm:text-sm">
                        {getInitials(person.first_name, person.last_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold sm:text-base">{getFullName(person)}</p>
                      {person.rank && (
                        <p className="truncate text-xs text-muted-foreground sm:text-sm">{person.rank}</p>
                      )}
                      <p className="text-[10px] text-amber-500 sm:text-xs">
                        {person.age ? `${person.age} ${person.age === 1 ? 'год' : person.age < 5 ? 'года' : 'лет'}` : 'День рождения'}
                      </p>
                    </div>

                    <Badge variant="secondary" className="flex-shrink-0 bg-amber-100 text-[10px] text-amber-800 sm:text-xs">
                      <Cake className="mr-0.5 h-2.5 w-2.5 sm:mr-1 sm:h-3 sm:w-3" />
                      <span className="hidden sm:inline">{format(new Date(person.birth_date), 'd MMMM', { locale: ru })}</span>
                      <span className="sm:hidden">{format(new Date(person.birth_date), 'd MMM', { locale: ru })}</span>
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Годовщины гибели */}
        {memorialDays.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Flame className="h-4 w-4 text-orange-500" />
              Годовщина гибели
            </h3>
            <div className="space-y-2">
              {memorialDays.map((person) => (
                <Link
                  key={person.id}
                  href={`/fallen/${person.id}`}
                  className="block rounded-lg border border-border bg-background/40 p-2 transition-all hover:bg-background/80 hover:shadow-md sm:p-3"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar className="h-10 w-10 border-2 border-border sm:h-12 sm:w-12">
                      <AvatarImage src={person.hero_photo_url || undefined} />
                      <AvatarFallback className="bg-muted text-xs text-muted-foreground sm:text-sm">
                        {getInitials(person.first_name, person.last_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold sm:text-base">{getFullName(person)}</p>
                      {person.rank && (
                        <p className="truncate text-xs text-muted-foreground sm:text-sm">{person.rank}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground sm:text-xs">
                        {person.yearsAgo
                          ? `${person.yearsAgo} ${person.yearsAgo === 1 ? 'год' : person.yearsAgo < 5 ? 'года' : 'лет'} со дня гибели`
                          : 'День памяти'}
                      </p>
                    </div>

                    <Badge variant="secondary" className="flex-shrink-0 text-[10px] sm:text-xs">
                      <Flame className="mr-0.5 h-2.5 w-2.5 text-orange-500 sm:mr-1 sm:h-3 sm:w-3" />
                      <span className="hidden sm:inline">{format(new Date(person.death_date), 'd MMMM', { locale: ru })}</span>
                      <span className="sm:hidden">{format(new Date(person.death_date), 'd MMM', { locale: ru })}</span>
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Информационный текст */}
        <p className="text-center text-xs text-muted-foreground">
          Сегодня мы вспоминаем {totalEvents}{' '}
          {totalEvents === 1 ? 'героя' : totalEvents < 5 ? 'героев' : 'героев'}
        </p>
      </CardContent>
    </Card>
  )
}
