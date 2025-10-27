import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * PUT /api/memories/[id]
 * Update a memory item
 * Доступ: автор воспоминания, владелец карточки, администраторы
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Проверяем аутентификацию
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const memoryId = params.id
    const body = await request.json()
    const { title, content_md, deleted_media_ids, new_media_ids } = body

    // Валидация
    if (!title || !content_md) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Получаем воспоминание
    const { data: memory, error: memoryError } = await supabase
      .from('memory_items')
      .select('*')
      .eq('id', memoryId)
      .eq('is_deleted', false)
      .single()

    if (memoryError || !memory) {
      console.error('Memory not found:', memoryError)
      return NextResponse.json(
        { error: 'Memory not found' },
        { status: 404 }
      )
    }

    // Получаем информацию о карточке fallen
    const { data: fallen, error: fallenError } = await supabase
      .from('fallen')
      .select('owner_id')
      .eq('id', memory.fallen_id)
      .single()

    if (fallenError || !fallen) {
      console.error('Fallen card not found:', fallenError)
      return NextResponse.json(
        { error: 'Fallen card not found' },
        { status: 404 }
      )
    }

    // Получаем роль пользователя
    const { data: publicUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    // Если пользователь не найден в таблице users, это не критично
    // Он всё равно может быть автором воспоминания
    const isAdmin = publicUser ? ['superadmin', 'admin', 'moderator'].includes(publicUser.role || '') : false
    const isOwner = fallen.owner_id === user.id
    const isAuthor = memory.created_by === user.id

    // Проверяем права доступа
    if (!isAdmin && !isOwner && !isAuthor) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to edit this memory' },
        { status: 403 }
      )
    }

    // Обрабатываем удаление фотографий
    if (deleted_media_ids && Array.isArray(deleted_media_ids) && deleted_media_ids.length > 0) {
      await supabase
        .from('fallen_media')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: user.id,
        } as any)
        .in('id', deleted_media_ids)
        .eq('fallen_id', memory.fallen_id)
    }

    // Формируем обновленный массив media_ids
    let updatedMediaIds = memory.media_ids || []

    // Удаляем ID помеченных на удаление фото
    if (deleted_media_ids && Array.isArray(deleted_media_ids)) {
      updatedMediaIds = updatedMediaIds.filter((id: string) => !deleted_media_ids.includes(id))
    }

    // Добавляем новые media_ids
    if (new_media_ids && Array.isArray(new_media_ids) && new_media_ids.length > 0) {
      updatedMediaIds = [...updatedMediaIds, ...new_media_ids]
    }

    // Обновляем воспоминание
    console.log('Updating memory:', {
      memoryId,
      userId: user.id,
      isAdmin,
      isOwner,
      isAuthor,
      updatedMediaIds,
    })

    const { data: updatedMemory, error: updateError } = await supabase
      .from('memory_items')
      .update({
        title: title.trim(),
        content_md: content_md.trim(),
        media_ids: updatedMediaIds.length > 0 ? updatedMediaIds : null,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', memoryId)
      .select()
      .single()

    console.log('Update result:', { data: updatedMemory, error: updateError })

    if (updateError || !updatedMemory) {
      console.error('Error updating memory:', updateError)
      return NextResponse.json(
        { error: 'Failed to update memory. Check permissions.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, memory: updatedMemory })
  } catch (error) {
    console.error('Unexpected error updating memory:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
