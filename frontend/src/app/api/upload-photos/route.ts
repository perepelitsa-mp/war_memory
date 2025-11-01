import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/upload-photos
 * Upload photos to Supabase Storage and create fallen_media records
 * Доступ: любой авторизованный пользователь
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Проверяем аутентификацию
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const fallenId = formData.get('fallen_id') as string;
    const files = formData.getAll('photos') as File[];
    const caption = formData.get('caption') as string | null;
    const altText = formData.get('alt_text') as string | null;

    if (!fallenId) {
      return NextResponse.json(
        { error: 'Fallen ID is required' },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Проверяем, что карточка существует и не удалена
    const { data: fallenData, error: fallenError } = await supabase
      .from('fallen')
      .select('id')
      .eq('id', fallenId)
      .eq('is_deleted', false)
      .single();

    if (fallenError || !fallenData) {
      return NextResponse.json(
        { error: 'Fallen card not found' },
        { status: 404 }
      );
    }

    const uploadedMedia: any[] = [];
    const maxSize = 10 * 1024 * 1024; // 10 MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (const file of files) {
      // Валидация файла
      if (!allowedTypes.includes(file.type)) {
        console.warn(`Skipping file ${file.name}: unsupported type ${file.type}`);
        continue;
      }

      if (file.size > maxSize) {
        console.warn(`Skipping file ${file.name}: size ${file.size} exceeds limit`);
        continue;
      }

      // Генерируем уникальное имя файла
      const fileExt = file.name.split('.').pop();
      const fileName = `${fallenId}/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Загружаем файл в Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('fallen-photos')
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        continue;
      }

      // Получаем публичный URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('fallen-photos').getPublicUrl(uploadData.path);

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
          alt_text: altText || file.name,
          caption: caption || null,
        })
        .select('*')
        .single();

      if (mediaError) {
        console.error('Error creating media record:', mediaError);
        // Пытаемся удалить загруженный файл
        await supabase.storage.from('fallen-photos').remove([uploadData.path]);
        continue;
      }

      uploadedMedia.push(mediaRecord);
    }

    if (uploadedMedia.length === 0) {
      return NextResponse.json(
        { error: 'No files were uploaded successfully' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedMedia,
      mediaIds: uploadedMedia.map(m => m.id), // Для обратной совместимости
      count: uploadedMedia.length,
    });
  } catch (error) {
    console.error('Unexpected error uploading photos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
