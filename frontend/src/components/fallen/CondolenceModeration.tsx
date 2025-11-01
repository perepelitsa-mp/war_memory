'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { BookHeart, Check, X, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Condolence {
  id: string
  content: string
  relationship_to_hero?: string
  created_at: string
  author: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

interface CondolenceModerationProps {
  fallenId: string
  pendingCondolences: Condolence[]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function CondolenceModeration({ fallenId, pendingCondolences }: CondolenceModerationProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({})
  const [showRejectionInput, setShowRejectionInput] = useState<Record<string, boolean>>({})

  const handleModerate = async (condolenceId: string, status: 'approved' | 'rejected') => {
    setLoading(condolenceId)

    try {
      const body: any = { status }
      if (status === 'rejected' && rejectionReason[condolenceId]) {
        body.rejection_reason = rejectionReason[condolenceId]
      }

      const response = await fetch(`/api/fallen/${fallenId}/condolences/${condolenceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error('Ошибка модерации')
      }

      router.refresh()
    } catch (error) {
      console.error('Error moderating condolence:', error)
      alert('Не удалось модерировать соболезнование')
    } finally {
      setLoading(null)
      setRejectionReason((prev) => {
        const updated = { ...prev }
        delete updated[condolenceId]
        return updated
      })
      setShowRejectionInput((prev) => {
        const updated = { ...prev }
        delete updated[condolenceId]
        return updated
      })
    }
  }

  if (pendingCondolences.length === 0) {
    return null
  }

  return (
    <Card className="border-amber-200/50 bg-background/60">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg sm:text-xl">
          <span className="flex items-center gap-2">
            <BookHeart className="h-5 w-5 text-amber-500" />
            Соболезнования на модерации
          </span>
          <Badge variant="secondary" className="bg-amber-100 text-xs text-amber-800 sm:text-sm">
            {pendingCondolences.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingCondolences.map((condolence) => (
            <div
              key={condolence.id}
              className="rounded-lg border border-amber-200/50 bg-background/40 p-3 shadow-sm sm:p-4"
            >
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
                <div className="flex-1 space-y-3">
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
                    <span className="text-[10px] text-muted-foreground sm:text-xs">
                      {format(new Date(condolence.created_at), 'd MMMM yyyy, HH:mm', {
                        locale: ru,
                      })}
                    </span>
                  </div>

                  {/* Текст */}
                  <div className="prose prose-sm max-w-none rounded bg-muted/50 p-2 sm:p-3">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground sm:text-base">
                      {condolence.content}
                    </p>
                  </div>

                  {/* Поле для причины отклонения */}
                  {showRejectionInput[condolence.id] && (
                    <div className="space-y-2">
                      <Textarea
                        value={rejectionReason[condolence.id] || ''}
                        onChange={(e) =>
                          setRejectionReason((prev) => ({
                            ...prev,
                            [condolence.id]: e.target.value,
                          }))
                        }
                        placeholder="Причина отклонения (опционально)..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  )}

                  {/* Кнопки модерации */}
                  <div className="flex flex-wrap gap-2">
                    {!showRejectionInput[condolence.id] ? (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1 gap-1 bg-green-600 hover:bg-green-700 sm:flex-none sm:gap-2"
                          onClick={() => handleModerate(condolence.id, 'approved')}
                          disabled={loading === condolence.id}
                        >
                          {loading === condolence.id ? (
                            <Loader2 className="h-3 w-3 animate-spin sm:h-4 sm:w-4" />
                          ) : (
                            <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                          <span className="text-xs sm:text-sm">Одобрить</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 gap-1 sm:flex-none sm:gap-2"
                          onClick={() =>
                            setShowRejectionInput((prev) => ({ ...prev, [condolence.id]: true }))
                          }
                          disabled={loading === condolence.id}
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">Отклонить</span>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full gap-1 sm:w-auto sm:gap-2"
                          onClick={() => handleModerate(condolence.id, 'rejected')}
                          disabled={loading === condolence.id}
                        >
                          {loading === condolence.id ? (
                            <Loader2 className="h-3 w-3 animate-spin sm:h-4 sm:w-4" />
                          ) : (
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                          <span className="text-xs sm:text-sm">Подтвердить отклонение</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => {
                            setShowRejectionInput((prev) => {
                              const updated = { ...prev }
                              delete updated[condolence.id]
                              return updated
                            })
                            setRejectionReason((prev) => {
                              const updated = { ...prev }
                              delete updated[condolence.id]
                              return updated
                            })
                          }}
                          disabled={loading === condolence.id}
                        >
                          <span className="text-xs sm:text-sm">Отмена</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
