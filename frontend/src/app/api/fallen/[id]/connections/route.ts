import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - получить все связи для героя
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id: fallenId } = params

    // Получаем все подтверждённые связи
    const { data: connections, error } = await supabase
      .from('hero_connections')
      .select(
        `
        id,
        connection_type,
        relationship,
        description,
        status,
        created_at,
        user:users!hero_connections_user_id_fkey(id, full_name, avatar_url, bio)
      `
      )
      .eq('fallen_id', fallenId)
      .eq('status', 'approved')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching connections:', error)
      return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 })
    }

    // Группируем связи по типу
    const relatives = connections?.filter((c: any) => c.connection_type === 'relative') || []
    const friends = connections?.filter((c: any) => c.connection_type === 'friend') || []
    const fellowSoldiers =
      connections?.filter((c: any) => c.connection_type === 'fellow_soldier') || []

    return NextResponse.json({
      relatives,
      friends,
      fellowSoldiers,
      total: connections?.length || 0,
    })
  } catch (error) {
    console.error('Error in connections API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - создать связь с героем
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id: fallenId } = params

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { connection_type, relationship, description } = body

    // Валидация
    if (!connection_type || !['relative', 'friend', 'fellow_soldier'].includes(connection_type)) {
      return NextResponse.json({ error: 'Invalid connection type' }, { status: 400 })
    }

    if (connection_type === 'relative' && !relationship) {
      return NextResponse.json(
        { error: 'Relationship is required for relatives' },
        { status: 400 }
      )
    }

    // Проверяем, нет ли уже связи
    const { data: existing } = await supabase
      .from('hero_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('fallen_id', fallenId)
      .eq('is_deleted', false)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Connection already exists' },
        { status: 400 }
      )
    }

    // Создаём связь
    const { data: newConnection, error } = await supabase
      .from('hero_connections')
      .insert({
        user_id: user.id,
        fallen_id: fallenId,
        connection_type,
        relationship: connection_type === 'relative' ? relationship : null,
        description,
        created_by: user.id,
        status: 'pending', // Требуется подтверждение владельцем карточки
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
      message: 'Connection created and awaiting approval',
    })
  } catch (error) {
    console.error('Error in connections POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
