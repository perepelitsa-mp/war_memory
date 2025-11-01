import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: { id: string }
}

/**
 * POST /api/fallen/[id]/awards
 * Добавить награду к карточке погибшего
 * Доступно только владельцам, редакторам, модераторам и админам
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = params
  const supabase = await createClient()

  // Проверка авторизации
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Получаем данные о пользователе
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Получаем данные о карточке погибшего
  const { data: fallen } = await supabase
    .from('fallen')
    .select('owner_id, editors')
    .eq('id', id)
    .eq('is_deleted', false)
    .single()

  if (!fallen) {
    return NextResponse.json({ error: 'Fallen not found' }, { status: 404 })
  }

  // Проверяем права доступа
  const isAdmin =
    userData?.role === 'admin' ||
    userData?.role === 'moderator' ||
    userData?.role === 'superadmin'
  const isOwner = fallen.owner_id === user.id
  const isEditor = fallen.editors && (fallen.editors as string[]).includes(user.id)

  if (!isAdmin && !isOwner && !isEditor) {
    return NextResponse.json(
      { error: 'Only admins, moderators, owners and editors can add awards' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { award_id, citation, awarded_date, decree_number } = body

    // Валидация
    if (!award_id) {
      return NextResponse.json({ error: 'award_id is required' }, { status: 400 })
    }

    if (!citation || !citation.trim()) {
      return NextResponse.json({ error: 'citation is required' }, { status: 400 })
    }

    // Проверяем, существует ли награда в справочнике
    const { data: award } = await supabase
      .from('awards')
      .select('id')
      .eq('id', award_id)
      .single()

    if (!award) {
      return NextResponse.json({ error: 'Award not found' }, { status: 404 })
    }

    // Проверяем, не добавлена ли уже такая награда
    const { data: existingAward } = await supabase
      .from('fallen_awards')
      .select('id')
      .eq('fallen_id', id)
      .eq('award_id', award_id)
      .eq('is_deleted', false)
      .single()

    if (existingAward) {
      return NextResponse.json(
        { error: 'This award has already been added' },
        { status: 409 }
      )
    }

    // Добавляем награду
    // Для владельцев и редакторов - статус "approved" (они модерируют свои карточки)
    // Для админов/модераторов - тоже "approved"
    const { data: newAward, error: insertError } = await supabase
      .from('fallen_awards')
      .insert({
        fallen_id: id,
        award_id,
        citation: citation.trim(),
        awarded_date: awarded_date || null,
        decree_number: decree_number?.trim() || null,
        status: 'approved',
        created_by: user.id,
      })
      .select(
        `
        *,
        award:awards(*)
      `
      )
      .single()

    if (insertError) {
      console.error('Error inserting award:', insertError)
      return NextResponse.json(
        { error: 'Failed to add award', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, award: newAward }, { status: 201 })
  } catch (error) {
    console.error('Error adding award:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
