import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

// PUT /api/fallen/[id]/burial-location - Обновить место захоронения
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { id: fallenId } = await context.params

    // Проверяем авторизацию
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
    }

    // Получаем данные из запроса
    const body = await request.json()
    const { coordinates, location } = body

    // Валидация координат
    if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
      return NextResponse.json(
        { error: 'Неверный формат координат. Ожидается: {lat: number, lng: number}' },
        { status: 400 }
      )
    }

    if (coordinates.lat < -90 || coordinates.lat > 90) {
      return NextResponse.json({ error: 'Широта должна быть от -90 до 90' }, { status: 400 })
    }

    if (coordinates.lng < -180 || coordinates.lng > 180) {
      return NextResponse.json({ error: 'Долгота должна быть от -180 до 180' }, { status: 400 })
    }

    // Валидация местоположения
    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      return NextResponse.json(
        { error: 'Укажите описание места захоронения' },
        { status: 400 }
      )
    }

    // Получаем карточку героя
    const { data: fallen, error: fetchError } = await supabase
      .from('fallen')
      .select('owner_id, editors')
      .eq('id', fallenId)
      .eq('is_deleted', false)
      .single()

    if (fetchError || !fallen) {
      return NextResponse.json({ error: 'Карточка не найдена' }, { status: 404 })
    }

    // Получаем роль пользователя
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = userData?.role === 'admin' || userData?.role === 'superadmin'

    // Проверяем права доступа (владелец, редактор или администратор)
    const isOwner = fallen.owner_id === user.id
    const isEditor = fallen.editors && (fallen.editors as string[]).includes(user.id)

    if (!isOwner && !isEditor && !isAdmin) {
      console.log('Access denied:', { isOwner, isEditor, isAdmin, role: userData?.role })
      return NextResponse.json(
        { error: 'Только владелец, редакторы или администраторы могут изменять место захоронения' },
        { status: 403 }
      )
    }

    console.log('Access granted:', { isOwner, isEditor, isAdmin, role: userData?.role })

    // Обновляем координаты и место захоронения
    const { data: updated, error: updateError } = await supabase
      .from('fallen')
      .update({
        burial_coordinates: coordinates,
        burial_location: location.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', fallenId)
      .select('id, burial_coordinates, burial_location')
      .single()

    if (updateError) {
      console.error('Error updating burial location:', updateError)
      return NextResponse.json(
        { error: 'Ошибка при обновлении места захоронения' },
        { status: 500 }
      )
    }

    // Записываем в audit log
    await supabase.from('audit_log').insert({
      user_id: user.id,
      action: 'update_burial_location',
      entity_type: 'fallen',
      entity_id: fallenId,
      changes: {
        burial_coordinates: coordinates,
        burial_location: location.trim(),
      },
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Место захоронения успешно обновлено',
    })
  } catch (error) {
    console.error('Error in burial-location route:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

// GET /api/fallen/[id]/burial-location - Получить место захоронения
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { id: fallenId } = await context.params

    const { data, error } = await supabase
      .from('fallen')
      .select('id, burial_coordinates, burial_location')
      .eq('id', fallenId)
      .eq('is_deleted', false)
      .eq('status', 'approved')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Карточка не найдена' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in burial-location GET route:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
