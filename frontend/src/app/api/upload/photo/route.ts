import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 МБ
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Проверка аутентификации
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем файл и fallenId из FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fallenId = formData.get('fallen_id') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Файл не предоставлен' }, { status: 400 });
    }

    // Валидация типа файла
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Недопустимый тип файла. Разрешены только: JPEG, PNG, WebP' },
        { status: 400 }
      );
    }

    // Валидация размера файла
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Файл слишком большой. Максимальный размер: 1 МБ' },
        { status: 400 }
      );
    }

    // Генерируем уникальное имя файла
    const fileExt = file.name.split('.').pop();
    // Для новых карточек (без fallenId) используем временную папку пользователя
    const fileName = fallenId
      ? `${fallenId}/hero-${Date.now()}.${fileExt}`
      : `temp/${user.id}/hero-${Date.now()}.${fileExt}`;

    // Загружаем файл в Storage
    const { data, error: uploadError } = await supabase.storage
      .from('fallen-photos')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Ошибка загрузки файла' },
        { status: 500 }
      );
    }

    // Получаем публичный URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('fallen-photos').getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: data.path,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
