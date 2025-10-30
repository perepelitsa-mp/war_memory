'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Heart, Shield, Check, X, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ConnectionUser {
  id: string
  full_name: string
  avatar_url: string | null
  bio: string | null
}

interface PendingConnection {
  id: string
  connection_type: 'relative' | 'friend' | 'fellow_soldier'
  relationship: string | null
  description: string | null
  user: ConnectionUser
  created_at: string
}

interface ConnectionModerationProps {
  fallenId: string
  pendingConnections: PendingConnection[]
}

const relationshipLabels: Record<string, string> = {
  spouse: 'Супруг(а)',
  parent: 'Родитель',
  child: 'Ребёнок',
  sibling: 'Брат/Сестра',
  grandparent: 'Дедушка/Бабушка',
  grandchild: 'Внук/Внучка',
  uncle_aunt: 'Дядя/Тётя',
  nephew_niece: 'Племянник/Племянница',
  cousin: 'Двоюродный брат/сестра',
  other: 'Другое родство',
}

const connectionTypeLabels = {
  relative: 'Родственник',
  friend: 'Друг',
  fellow_soldier: 'Сослуживец',
}

const connectionIcons = {
  relative: Users,
  friend: Heart,
  fellow_soldier: Shield,
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function ConnectionModeration({
  fallenId,
  pendingConnections,
}: ConnectionModerationProps) {
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)

  if (pendingConnections.length === 0) {
    return null
  }

  const handleModerate = async (connectionId: string, status: 'approved' | 'rejected') => {
    setProcessing(connectionId)

    try {
      const response = await fetch(`/api/fallen/${fallenId}/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Ошибка модерации')
      }

      router.refresh()
    } catch (error) {
      console.error('Error moderating connection:', error)
      alert('Не удалось выполнить модерацию')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          Связи на модерации
          <Badge variant="outline" className="ml-auto border-orange-500/30 text-orange-600">
            {pendingConnections.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingConnections.map((connection) => {
            const Icon = connectionIcons[connection.connection_type]

            return (
              <div
                key={connection.id}
                className="flex flex-col gap-3 rounded-lg border border-border/40 bg-background/50 p-4"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 border-2 border-border">
                    <AvatarImage src={connection.user.avatar_url || undefined} />
                    <AvatarFallback className="text-xs font-semibold">
                      {getInitials(connection.user.full_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{connection.user.full_name}</p>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-xs font-normal"
                      >
                        <Icon className="h-3 w-3" />
                        {connectionTypeLabels[connection.connection_type]}
                      </Badge>

                      {connection.relationship && (
                        <Badge variant="secondary" className="text-xs font-normal">
                          {relationshipLabels[connection.relationship]}
                        </Badge>
                      )}
                    </div>

                    {connection.description && (
                      <p className="text-xs text-muted-foreground">{connection.description}</p>
                    )}

                    {connection.user.bio && (
                      <p className="text-xs text-muted-foreground/70 italic line-clamp-1">
                        {connection.user.bio}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Добавлено: {new Date(connection.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleModerate(connection.id, 'approved')}
                    disabled={processing === connection.id}
                    size="sm"
                    className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                    Одобрить
                  </Button>
                  <Button
                    onClick={() => handleModerate(connection.id, 'rejected')}
                    disabled={processing === connection.id}
                    size="sm"
                    variant="destructive"
                    className="flex-1 gap-1.5"
                  >
                    <X className="h-4 w-4" />
                    Отклонить
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
