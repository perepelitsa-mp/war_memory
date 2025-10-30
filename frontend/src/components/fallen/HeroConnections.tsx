'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Heart, Shield, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { AddConnectionDialog } from './AddConnectionDialog'

interface ConnectionUser {
  id: string
  full_name: string
  avatar_url: string | null
  bio: string | null
}

interface Connection {
  id: string
  connection_type: 'relative' | 'friend' | 'fellow_soldier'
  relationship: string | null
  user: ConnectionUser
}

interface HeroConnectionsProps {
  fallenId: string
  relatives: Connection[]
  friends: Connection[]
  fellowSoldiers: Connection[]
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

const getInitials = (name: string) => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function ConnectionCard({ connection }: { connection: Connection }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/50 p-3">
      <Avatar className="h-12 w-12 border-2 border-border">
        <AvatarImage src={connection.user.avatar_url || undefined} />
        <AvatarFallback className="text-xs font-semibold">
          {getInitials(connection.user.full_name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <Link
          href={`/users/${connection.user.id}`}
          className="text-sm font-medium hover:underline"
        >
          {connection.user.full_name}
        </Link>
        {connection.relationship && (
          <p className="text-xs text-muted-foreground">
            {relationshipLabels[connection.relationship] || connection.relationship}
          </p>
        )}
        {connection.user.bio && (
          <p className="text-xs text-muted-foreground line-clamp-1">{connection.user.bio}</p>
        )}
      </div>
    </div>
  )
}

export function HeroConnections({
  fallenId,
  relatives,
  friends,
  fellowSoldiers,
}: HeroConnectionsProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const hasConnections = relatives.length > 0 || friends.length > 0 || fellowSoldiers.length > 0

  return (
    <>
      <div className="space-y-6">
        {!hasConnections && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
              <div className="rounded-full bg-primary/10 p-4">
                <UserPlus className="h-8 w-8 text-primary/60" />
              </div>
              <div className="text-center">
                <h3 className="mb-1 font-semibold">Добавьте первую связь</h3>
                <p className="text-sm text-muted-foreground">
                  Расскажите о своей связи с героем
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Родственники */}
        {relatives.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Близкие
                <Badge variant="secondary" className="ml-auto">
                  {relatives.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatives.map((connection) => (
                  <ConnectionCard key={connection.id} connection={connection} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Друзья */}
        {friends.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="h-5 w-5 text-rose-500" />
                Друзья героя
                <Badge variant="secondary" className="ml-auto">
                  {friends.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {friends.map((connection) => (
                  <ConnectionCard key={connection.id} connection={connection} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Сослуживцы */}
        {fellowSoldiers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-blue-500" />
                Сослуживцы
                <Badge variant="secondary" className="ml-auto">
                  {fellowSoldiers.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {fellowSoldiers.map((connection) => (
                  <ConnectionCard key={connection.id} connection={connection} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Кнопка добавления связи */}
        <Button
          onClick={() => setShowAddDialog(true)}
          variant="outline"
          className="w-full gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Добавить связь
        </Button>
      </div>

      <AddConnectionDialog
        fallenId={fallenId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </>
  )
}
