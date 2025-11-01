import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/timeline
 * Создание нового события в хронике жизни героя
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Проверка аутентификации
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const fallenId = formData.get('fallen_id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const dateExact = formData.get('date_exact') as string | null
    const file = formData.get('file') as File | null

    if (!fallenId || !title || !description) {
      return NextResponse.json(
        { error: 'Fallen ID, title, and description are required' },
        { status: 400 }
      )
    }

    // Проверяем, что карточка существует
    const { data: fallenData, error: fallenError } = await supabase
      .from('fallen')
      .select('id')
      .eq('id', fallenId)
      .eq('is_deleted', false)
      .single()

    if (fallenError || !fallenData) {
      return NextResponse.json(
        { error: 'Fallen card not found' },
        { status: 404 }
      )
    }

    let mediaId: string | null = null

    // Если есть файл, загружаем его
    if (file) {
      const maxSize = 5 * 1024 * 1024 // 5 MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Unsupported file type' },
          { status: 400 }
        )
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'File size exceeds 5MB limit' },
          { status: 400 }
        )
      }

      // Загружаем файл в Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${fallenId}/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('fallen-photos')
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        return NextResponse.json(
          { error: 'Failed to upload file' },
          { status: 500 }
        )
      }

      // Получаем публичный URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('fallen-photos').getPublicUrl(uploadData.path)

      // Создаем запись в fallen_media
      const { data: mediaRecord, error: mediaError } = await supabase
        .from('fallen_media')
        .insert({
          fallen_id: fallenId,
          media_type: 'photo',
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
          status: 'approved',
          alt_text: title,
        })
        .select('id')
        .single()

      if (mediaError) {
        console.error('Error creating media record:', mediaError)
        // Удаляем загруженный файл
        await supabase.storage.from('fallen-photos').remove([uploadData.path])
        return NextResponse.json(
          { error: 'Failed to create media record' },
          { status: 500 }
        )
      }

      mediaId = mediaRecord.id
    }

    // Определяем год из даты или используем текущий год
    const year = dateExact ? new Date(dateExact).getFullYear() : new Date().getFullYear()

    // Создаем событие таймлайна со статусом approved (без модерации)
    const { data: timelineItem, error: timelineError } = await supabase
      .from('timeline_items')
      .insert({
        fallen_id: fallenId,
        date_exact: dateExact || null,
        year: year,
        title: title.trim(),
        description_md: description.trim(),
        media_id: mediaId,
        status: 'approved', // Сразу одобряем
        created_by: user.id,
      })
      .select()
      .single()

    if (timelineError) {
      console.error('Error creating timeline item:', timelineError)
      // Если есть медиа, удаляем его
      if (mediaId) {
        await supabase.from('fallen_media').delete().eq('id', mediaId)
        // Удаляем файл из storage
        if (file) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          await supabase.storage.from('fallen-photos').remove([fileName])
        }
      }
      return NextResponse.json(
        { error: 'Failed to create timeline item' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      item: timelineItem,
    })
  } catch (error) {
    console.error('Unexpected error creating timeline item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
