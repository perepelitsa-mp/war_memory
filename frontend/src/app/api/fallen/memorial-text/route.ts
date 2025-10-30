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
    const { fallen_id, memorial_text } = body

    if (!fallen_id) {
      return NextResponse.json({ error: 'Не указан ID карточки' }, { status: 400 })
    }

    // Получаем карточку и проверяем права доступа
    const { data: fallen, error: fallenError } = await supabase
      .from('fallen')
      .select('owner_id, memorial_text')
      .eq('id', fallen_id)
      .single()

    if (fallenError || !fallen) {
      return NextResponse.json({ error: 'Карточка не найдена' }, { status: 404 })
    }

    const oldMemorialText = fallen.memorial_text

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

    // Обновляем memorial_text
    const { data: updatedFallen, error: updateError } = await supabase
      .from('fallen')
      .update({
        memorial_text: memorial_text || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', fallen_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating memorial text:', updateError)
      return NextResponse.json(
        { error: 'Ошибка при обновлении текста памяти' },
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
        memorial_text: {
          old: oldMemorialText,
          new: memorial_text,
        },
      },
    })

    return NextResponse.json({ success: true, data: updatedFallen })
  } catch (error) {
    console.error('Error in memorial-text API:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
