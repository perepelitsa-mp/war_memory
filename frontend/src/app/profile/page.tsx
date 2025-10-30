import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { AvatarUpload } from '@/components/profile/AvatarUpload'
import { PasswordChange } from '@/components/profile/PasswordChange'
import { UserConnections } from '@/components/profile/UserConnections'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Shield, Link2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Получаем данные пользователя
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Получаем связи с героями
  const { data: connections } = await supabase
    .from('hero_connections')
    .select(
      `
      id,
      connection_type,
      relationship,
      description,
      status,
      created_at,
      fallen:fallen(id, first_name, last_name, middle_name, hero_photo_url, birth_date, death_date)
    `
    )
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  return (
    <div className="container space-y-8 py-10 md:py-16">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Личный кабинет</h1>
        <p className="text-muted-foreground">
          Управляйте своим профилем и связями с героями мемориала
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Профиль
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AvatarUpload
                currentAvatarUrl={userData?.avatar_url}
                userName={userData?.full_name || 'Пользователь'}
              />
              <ProfileForm
                initialData={{
                  full_name: userData?.full_name || '',
                  phone: userData?.phone || '',
                  bio: userData?.bio || '',
                  show_phone: userData?.show_phone || false,
                  whatsapp_link: userData?.whatsapp_link || '',
                  show_whatsapp: userData?.show_whatsapp || false,
                  telegram_link: userData?.telegram_link || '',
                  show_telegram: userData?.show_telegram || false,
                  vk_link: userData?.vk_link || '',
                  show_vk: userData?.show_vk || false,
                }}
              />
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Безопасность
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PasswordChange />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Connections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Связи с героями
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UserConnections connections={connections || []} />
            </CardContent>
          </Card>

          {/* User Info */}
          <Card className="border-border/40 bg-background/50">
            <CardContent className="space-y-2 pt-6">
              <div className="text-sm">
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{user.email}</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Роль:</span>
                <p className="font-medium capitalize">{userData?.role || 'user'}</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Дата регистрации:</span>
                <p className="font-medium">
                  {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
