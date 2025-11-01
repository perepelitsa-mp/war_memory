'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookHeart, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Link from 'next/link'
import { AddCondolenceDialog } from './AddCondolenceDialog'

interface Condolence {
  id: string
  content: string
  relationship_to_hero?: string
  status: string
  created_at: string
  author: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

interface CondolenceBookProps {
  fallenId: string
  condolences: Condolence[]
  totalCount: number
  canModerate?: boolean
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function CondolenceBook({ fallenId, condolences, totalCount, canModerate }: CondolenceBookProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <Card className="border-amber-200/50 bg-background/60">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex flex-col gap-1 text-lg sm:flex-row sm:items-center sm:gap-2 sm:text-xl">
            <span className="flex items-center gap-2">
              <BookHeart className="h-5 w-5 text-amber-500" />
              Книга соболезнований
            </span>
            {totalCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                {totalCount} {totalCount === 1 ? 'запись' : totalCount < 5 ? 'записи' : 'записей'}
              </span>
            )}
          </CardTitle>
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="sm"
            className="w-full gap-2 bg-amber-600 hover:bg-amber-700 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Оставить соболезнование</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {condolences.length === 0 ? (
          <div className="py-12 text-center">
            <BookHeart className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Книга соболезнований пока пуста.
              <br />
              Будьте первым, кто оставит слова поддержки.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {condolences.map((condolence) => (
              <div
                key={condolence.id}
                className="relative rounded-lg border border-amber-200/50 bg-background/40 p-3 shadow-sm transition-all hover:bg-background/80 hover:shadow-md sm:p-4"
              >
                {/* Pending badge */}
                {condolence.status === 'pending' && (
                  <div className="absolute right-2 top-2 sm:right-3 sm:top-3">
                    <Badge variant="secondary" className="bg-amber-100 text-[10px] text-amber-800 sm:text-xs">
                      На модерации
                    </Badge>
                  </div>
                )}

                <div className="flex gap-2 sm:gap-3">
                  {/* Аватар */}
                  <Link href={`/users/${condolence.author.id}`}>
                    <Avatar className="h-10 w-10 border-2 border-amber-200 sm:h-12 sm:w-12">
                      <AvatarImage src={condolence.author.avatar_url || undefined} />
                      <AvatarFallback className="bg-amber-100 text-xs text-amber-700 sm:text-sm">
                        {getInitials(condolence.author.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  {/* Содержание */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <Link
                        href={`/users/${condolence.author.id}`}
                        className="text-sm font-semibold hover:underline sm:text-base"
                      >
                        {condolence.author.full_name}
                      </Link>
                      {condolence.relationship_to_hero && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          {condolence.relationship_to_hero}
                        </Badge>
                      )}
                    </div>

                    {/* Текст соболезнования */}
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground sm:text-base">
                        {condolence.content}
                      </p>
                    </div>

                    {/* Дата */}
                    <p className="text-[10px] text-muted-foreground sm:text-xs">
                      {format(new Date(condolence.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Диалог добавления соболезнования */}
      <AddCondolenceDialog
        fallenId={fallenId}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Card>
  )
}
