import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Heart, Shield, Flame, Calendar, Phone, MessageSquare, Send } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
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

const getFullName = (fallen: any) => {
  return [fallen.last_name, fallen.first_name, fallen.middle_name].filter(Boolean).join(' ')
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = params
  const supabase = await createClient()

  // Получаем публичные данные пользователя
  const { data: userData, error } = await supabase
    .from('users')
    .select(
      'id, full_name, avatar_url, bio, created_at, phone, show_phone, whatsapp_link, show_whatsapp, telegram_link, show_telegram, vk_link, show_vk'
    )
    .eq('id', id)
    .single()

  if (error || !userData) {
    notFound()
  }

  // Получаем подтверждённые связи с героями
  const { data: connections } = await supabase
    .from('hero_connections')
    .select(
      `
      id,
      connection_type,
      relationship,
      description,
      created_at,
      fallen:fallen(id, first_name, last_name, middle_name, hero_photo_url, birth_date, death_date)
    `
    )
    .eq('user_id', id)
    .eq('status', 'approved')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  // Получаем зажжённые свечи
  const { data: candleLights } = await supabase
    .from('candle_lights')
    .select(
      `
      id,
      created_at,
      fallen:fallen(id, first_name, last_name, middle_name, hero_photo_url)
    `
    )
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  const allConnections = connections || []
  const relatives = allConnections.filter((c: any) => c.connection_type === 'relative')
  const friends = allConnections.filter((c: any) => c.connection_type === 'friend')
  const fellowSoldiers = allConnections.filter((c: any) => c.connection_type === 'fellow_soldier')

  return (
    <div className="container space-y-8 py-10 md:py-16">
      {/* Header */}
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        <Avatar className="h-32 w-32 border-4 border-border">
          <AvatarImage src={userData.avatar_url || undefined} />
          <AvatarFallback className="text-3xl font-bold">
            {getInitials(userData.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{userData.full_name}</h1>
          {userData.bio && <p className="text-lg text-muted-foreground">{userData.bio}</p>}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              На сайте с {format(new Date(userData.created_at), 'd MMMM yyyy', { locale: ru })}
            </div>
            {connections && connections.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {connections.length} {connections.length === 1 ? 'связь' : 'связей'}
              </div>
            )}
            {candleLights && candleLights.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-500" />
                {candleLights.length} {candleLights.length === 1 ? 'свеча' : 'свечей'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      {(userData.show_phone || userData.show_whatsapp || userData.show_telegram || userData.show_vk) && (
        <Card>
          <CardHeader>
            <CardTitle>Контактная информация</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userData.show_phone && userData.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a href={`tel:${userData.phone}`} className="text-sm hover:underline">
                    {userData.phone}
                  </a>
                </div>
              )}
              {userData.show_whatsapp && userData.whatsapp_link && (
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                  <a
                    href={userData.whatsapp_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                  >
                    WhatsApp
                  </a>
                </div>
              )}
              {userData.show_telegram && userData.telegram_link && (
                <div className="flex items-center gap-3">
                  <Send className="h-5 w-5 text-blue-500" />
                  <a
                    href={userData.telegram_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                  >
                    Telegram
                  </a>
                </div>
              )}
              {userData.show_vk && userData.vk_link && (
                <div className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.45 14.88h-1.4c-.46 0-.6-.37-1.42-1.19-.72-.69-1.04-.78-1.22-.78-.25 0-.32.07-.32.41v1.08c0 .29-.09.46-.86.46-1.27 0-2.68-.77-3.67-2.2-1.5-2.06-1.91-3.6-1.91-3.92 0-.18.07-.35.41-.35h1.4c.31 0 .42.14.54.47.59 1.73 1.59 3.25 2 3.25.15 0 .22-.07.22-.45v-1.74c-.05-.93-.54-1.01-.54-1.34 0-.15.12-.3.31-.3h2.19c.26 0 .35.14.35.44v2.36c0 .26.11.35.19.35.15 0 .27-.09.54-.36 1.03-1.16 1.77-2.94 1.77-2.94.09-.2.23-.35.54-.35h1.4c.34 0 .41.17.34.44-.16.78-.73 1.81-1.5 2.87l-.64.88c-.14.19-.19.29 0 .51.14.16.6.59.91.95.55.6 1.08 1.31 1.2 1.73.12.42-.07.64-.49.64z" />
                  </svg>
                  <a
                    href={userData.vk_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                  >
                    ВКонтакте
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connections */}
      {allConnections.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Связи с героями</h2>

          {/* Родственники */}
          {relatives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Родственники
                  <Badge variant="secondary" className="ml-auto">
                    {relatives.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {relatives.map((connection: any) => (
                    <Link
                      key={connection.id}
                      href={`/fallen/${connection.fallen.id}`}
                      className="group block"
                    >
                      <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/50 p-3 transition-colors hover:bg-background/80">
                        {connection.fallen.hero_photo_url ? (
                          <Image
                            src={connection.fallen.hero_photo_url}
                            alt={getFullName(connection.fallen)}
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
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium group-hover:underline">
                            {getFullName(connection.fallen)}
                          </p>
                          {connection.relationship && (
                            <p className="text-xs text-muted-foreground">
                              {relationshipLabels[connection.relationship]}
                            </p>
                          )}
                          {connection.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {connection.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Друзья */}
          {friends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Друзья героев
                  <Badge variant="secondary" className="ml-auto">
                    {friends.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {friends.map((connection: any) => (
                    <Link
                      key={connection.id}
                      href={`/fallen/${connection.fallen.id}`}
                      className="group block"
                    >
                      <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/50 p-3 transition-colors hover:bg-background/80">
                        {connection.fallen.hero_photo_url ? (
                          <Image
                            src={connection.fallen.hero_photo_url}
                            alt={getFullName(connection.fallen)}
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
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium group-hover:underline">
                            {getFullName(connection.fallen)}
                          </p>
                          {connection.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {connection.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Сослуживцы */}
          {fellowSoldiers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Сослуживцы
                  <Badge variant="secondary" className="ml-auto">
                    {fellowSoldiers.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {fellowSoldiers.map((connection: any) => (
                    <Link
                      key={connection.id}
                      href={`/fallen/${connection.fallen.id}`}
                      className="group block"
                    >
                      <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/50 p-3 transition-colors hover:bg-background/80">
                        {connection.fallen.hero_photo_url ? (
                          <Image
                            src={connection.fallen.hero_photo_url}
                            alt={getFullName(connection.fallen)}
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
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium group-hover:underline">
                            {getFullName(connection.fallen)}
                          </p>
                          {connection.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {connection.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Зажжённые свечи */}
      {candleLights && candleLights.length > 0 && (
        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-500" />
              Зажжённые свечи памяти
              <Badge variant="secondary" className="ml-auto">
                {candleLights.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {candleLights.map((candle: any) => (
                <Link
                  key={candle.id}
                  href={`/fallen/${candle.fallen.id}`}
                  className="group block"
                >
                  <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/50 p-3 transition-colors hover:bg-background/80">
                    {candle.fallen.hero_photo_url ? (
                      <Image
                        src={candle.fallen.hero_photo_url}
                        alt={getFullName(candle.fallen)}
                        width={40}
                        height={53}
                        className="h-14 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-10 items-center justify-center rounded bg-gradient-to-br from-background-soft to-surface text-xs font-semibold text-foreground/30">
                        {candle.fallen.first_name[0]}
                        {candle.fallen.last_name[0]}
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium group-hover:underline line-clamp-2">
                        {getFullName(candle.fallen)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(candle.created_at), 'd MMM yyyy', { locale: ru })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {allConnections.length === 0 && (!candleLights || candleLights.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="rounded-full bg-primary/10 p-4">
              <Users className="h-8 w-8 text-primary/60" />
            </div>
            <div className="text-center">
              <h3 className="mb-1 font-semibold">Нет активности</h3>
              <p className="text-sm text-muted-foreground">
                Пользователь пока не добавил связей с героями
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
