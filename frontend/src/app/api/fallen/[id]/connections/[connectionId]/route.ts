import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH - модерировать связь (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; connectionId: string } }
) {
  try {
    const supabase = await createClient()
    const { id: fallenId, connectionId } = params

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем роль пользователя
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isModerator = ['moderator', 'admin', 'superadmin'].includes(userData?.role || '')

    // Проверяем права (владелец, редактор или модератор/админ)
    const { data: fallen } = await supabase
      .from('fallen')
      .select('owner_id, editors')
      .eq('id', fallenId)
      .single()

    if (!fallen) {
      return NextResponse.json({ error: 'Fallen not found' }, { status: 404 })
    }

    const isOwner = fallen.owner_id === user.id
    const isEditor = Array.isArray(fallen.editors) && fallen.editors.includes(user.id)

    if (!isOwner && !isEditor && !isModerator) {
      return NextResponse.json(
        { error: 'Only owners, editors, and moderators can moderate connections' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Обновляем связь
    const { data, error } = await supabase
      .from('hero_connections')
      .update({
        status,
        moderated_by: user.id,
        moderated_at: new Date().toISOString(),
      })
      .eq('id', connectionId)
      .eq('fallen_id', fallenId)
      .select()
      .single()

    if (error) {
      console.error('Error updating connection:', error)
      return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      connection: data,
    })
  } catch (error) {
    console.error('Error in connection PATCH API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - удалить связь
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; connectionId: string } }
) {
  try {
    const supabase = await createClient()
    const { id: fallenId, connectionId } = params

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем роль пользователя
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isModerator = ['moderator', 'admin', 'superadmin'].includes(userData?.role || '')

    // Получаем связь
    const { data: connection } = await supabase
      .from('hero_connections')
      .select('user_id')
      .eq('id', connectionId)
      .single()

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    // Проверяем права (владелец связи, владелец/редактор карточки или модератор/админ)
    const isConnectionOwner = connection.user_id === user.id

    let canDelete = isConnectionOwner || isModerator

    if (!canDelete) {
      const { data: fallen } = await supabase
        .from('fallen')
        .select('owner_id, editors')
        .eq('id', fallenId)
        .single()

      if (fallen) {
        const isOwner = fallen.owner_id === user.id
        const isEditor = Array.isArray(fallen.editors) && fallen.editors.includes(user.id)
        canDelete = isOwner || isEditor
      }
    }

    if (!canDelete) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Soft delete
    const { error } = await supabase
      .from('hero_connections')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
      })
      .eq('id', connectionId)

    if (error) {
      console.error('Error deleting connection:', error)
      return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Connection deleted successfully',
    })
  } catch (error) {
    console.error('Error in connection DELETE API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
