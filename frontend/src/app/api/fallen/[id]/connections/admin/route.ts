import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

// POST - административное добавление родственника
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { id: fallenId } = await context.params

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { user_id, connection_type, relationship, description } = body

    // Валидация
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    if (!connection_type || !['relative', 'friend', 'fellow_soldier'].includes(connection_type)) {
      return NextResponse.json({ error: 'Invalid connection type' }, { status: 400 })
    }

    if (connection_type === 'relative' && !relationship) {
      return NextResponse.json(
        { error: 'Relationship is required for relatives' },
        { status: 400 }
      )
    }

    // Получаем карточку героя
    const { data: fallen, error: fallenError } = await supabase
      .from('fallen')
      .select('owner_id, editors')
      .eq('id', fallenId)
      .single()

    if (fallenError || !fallen) {
      return NextResponse.json({ error: 'Fallen card not found' }, { status: 404 })
    }

    // Проверяем права доступа
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin =
      userData?.role === 'admin' ||
      userData?.role === 'moderator' ||
      userData?.role === 'superadmin'
    const isOwner = fallen.owner_id === user.id
    const isEditor = fallen.editors && (fallen.editors as string[]).includes(user.id)

    if (!isAdmin && !isOwner && !isEditor) {
      return NextResponse.json(
        { error: 'Only admins, moderators, owners and editors can add connections' },
        { status: 403 }
      )
    }

    // Проверяем, нет ли уже связи
    const { data: existing } = await supabase
      .from('hero_connections')
      .select('id')
      .eq('user_id', user_id)
      .eq('fallen_id', fallenId)
      .eq('is_deleted', false)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Connection already exists' }, { status: 400 })
    }

    // Создаём связь со статусом approved
    const { data: newConnection, error } = await supabase
      .from('hero_connections')
      .insert({
        user_id,
        fallen_id: fallenId,
        connection_type,
        relationship: connection_type === 'relative' ? relationship : null,
        description,
        created_by: user.id,
        status: 'approved', // Сразу утверждено, так как добавлено администратором
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating connection:', error)
      return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      connection: newConnection,
      message: 'Connection created successfully',
    })
  } catch (error) {
    console.error('Error in admin connections POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
