import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Проверка авторизации
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
    }

    const body = await request.json()
    const { fallen_id, biography_md } = body

    if (!fallen_id) {
      return NextResponse.json({ error: 'Не указан ID карточки' }, { status: 400 })
    }

    // Получаем карточку и проверяем права доступа
    const { data: fallen, error: fallenError } = await supabase
      .from('fallen')
      .select('owner_id, biography_md')
      .eq('id', fallen_id)
      .single()

    if (fallenError || !fallen) {
      return NextResponse.json({ error: 'Карточка не найдена' }, { status: 404 })
    }

    const oldBiographyMd = fallen.biography_md

    // Получаем роль пользователя
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = userData?.role || 'user'
    const isOwner = fallen.owner_id === user.id
    const isAdmin = ['superadmin', 'admin', 'moderator'].includes(userRole)

    // Проверяем права: владелец или админ/модератор
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'У вас нет прав для редактирования этой карточки' },
        { status: 403 }
      )
    }

    // Обновляем biography_md
    const { data: updatedFallen, error: updateError } = await supabase
      .from('fallen')
      .update({
        biography_md: biography_md || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', fallen_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating biography:', updateError)
      return NextResponse.json(
        { error: 'Ошибка при обновлении биографии' },
        { status: 500 }
      )
    }

    // Записываем в audit_log
    await supabase.from('audit_log').insert({
      entity_type: 'fallen',
      entity_id: fallen_id,
      action: 'update',
      user_id: user.id,
      changes: {
        biography_md: {
          old: oldBiographyMd,
          new: biography_md,
        },
      },
    })

    return NextResponse.json({ success: true, data: updatedFallen })
  } catch (error) {
    console.error('Error in biography API:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
