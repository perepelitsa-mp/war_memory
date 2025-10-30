'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Users, Heart, Shield } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface Connection {
  id: string
  connection_type: string
  relationship: string | null
  description: string | null
  status: string
  created_at: string
  fallen: {
    id: string
    first_name: string
    last_name: string
    middle_name: string | null
    hero_photo_url: string | null
    birth_date: string | null
    death_date: string | null
  }
}

interface UserConnectionsProps {
  connections: Connection[]
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

const connectionIcons = {
  relative: Users,
  friend: Heart,
  fellow_soldier: Shield,
}

const connectionLabels = {
  relative: 'Родственник',
  friend: 'Друг',
  fellow_soldier: 'Сослуживец',
}

export function UserConnections({ connections }: UserConnectionsProps) {
  if (connections.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        <p>У вас пока нет связей с героями</p>
      </div>
    )
  }

  const getFullName = (fallen: Connection['fallen']) => {
    return [fallen.last_name, fallen.first_name, fallen.middle_name]
      .filter(Boolean)
      .join(' ')
  }

  return (
    <div className="space-y-3">
      {connections.map((connection) => {
        const Icon = connectionIcons[connection.connection_type as keyof typeof connectionIcons]
        const fullName = getFullName(connection.fallen)

        return (
          <Link
            key={connection.id}
            href={`/fallen/${connection.fallen.id}`}
            className="block rounded-lg border border-border/40 bg-background/50 p-3 transition-colors hover:bg-background/80"
          >
            <div className="flex items-start gap-3">
              {connection.fallen.hero_photo_url ? (
                <Image
                  src={connection.fallen.hero_photo_url}
                  alt={fullName}
                  width={48}
                  height={64}
                  className="h-16 w-12 rounded object-cover"
                />
              ) : (
                <div className="flex h-16 w-12 items-center justify-center rounded bg-gradient-to-br from-background-soft to-surface text-xs font-semibold text-foreground/30">
                  {connection.fallen.first_name[0]}
                  {connection.fallen.last_name[0]}
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <p className="text-sm font-medium leading-tight">{fullName}</p>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 text-xs font-normal"
                  >
                    <Icon className="h-3 w-3" />
                    {connectionLabels[connection.connection_type as keyof typeof connectionLabels]}
                  </Badge>

                  {connection.relationship && (
                    <Badge variant="secondary" className="text-xs font-normal">
                      {relationshipLabels[connection.relationship]}
                    </Badge>
                  )}

                  <Badge
                    variant={
                      connection.status === 'approved'
                        ? 'default'
                        : connection.status === 'pending'
                          ? 'outline'
                          : 'destructive'
                    }
                    className="text-xs"
                  >
                    {connection.status === 'approved'
                      ? 'Подтверждена'
                      : connection.status === 'pending'
                        ? 'На модерации'
                        : 'Отклонена'}
                  </Badge>
                </div>

                {connection.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {connection.description}
                  </p>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
