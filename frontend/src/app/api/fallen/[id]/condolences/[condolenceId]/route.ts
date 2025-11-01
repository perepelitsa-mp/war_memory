import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH - модерировать соболезнование (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; condolenceId: string } }
) {
  try {
    const supabase = await createClient()
    const { id: fallenId, condolenceId } = params

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем роль пользователя
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()

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
        { error: 'Only owners, editors, and moderators can moderate condolences' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, rejection_reason } = body

    if (!status || !['approved', 'rejected', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Обновляем соболезнование
    const updates: any = {
      status,
      moderated_by: user.id,
      moderated_at: new Date().toISOString(),
    }

    if (status === 'rejected' && rejection_reason) {
      updates.rejection_reason = rejection_reason
    }

    const { data, error } = await supabase
      .from('condolences')
      .update(updates)
      .eq('id', condolenceId)
      .eq('fallen_id', fallenId)
      .select()
      .single()

    if (error) {
      console.error('Error updating condolence:', error)
      return NextResponse.json({ error: 'Failed to update condolence' }, { status: 500 })
    }

    // TODO: Отправить уведомление автору соболезнования о результате модерации

    return NextResponse.json({
      success: true,
      condolence: data,
    })
  } catch (error) {
    console.error('Error in condolence PATCH API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - удалить соболезнование (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; condolenceId: string } }
) {
  try {
    const supabase = await createClient()
    const { id: fallenId, condolenceId } = params

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем роль пользователя и соболезнование
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()

    const isModerator = ['moderator', 'admin', 'superadmin'].includes(userData?.role || '')

    const { data: condolence } = await supabase
      .from('condolences')
      .select('author_id')
      .eq('id', condolenceId)
      .single()

    if (!condolence) {
      return NextResponse.json({ error: 'Condolence not found' }, { status: 404 })
    }

    // Проверяем права (автор или модератор/админ)
    const isAuthor = condolence.author_id === user.id

    if (!isAuthor && !isModerator) {
      return NextResponse.json(
        { error: 'Only authors and moderators can delete condolences' },
        { status: 403 }
      )
    }

    // Soft delete
    const { error } = await supabase
      .from('condolences')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
      })
      .eq('id', condolenceId)

    if (error) {
      console.error('Error deleting condolence:', error)
      return NextResponse.json({ error: 'Failed to delete condolence' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Condolence deleted successfully',
    })
  } catch (error) {
    console.error('Error in condolence DELETE API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
