import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/memories
 * Create a new memory item
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

    const body = await request.json();
    const { fallen_id, title, content_md } = body;

    // Валидация
    if (!fallen_id || !title || !content_md) {
      return NextResponse.json(
        { error: 'Fallen ID, title and content are required' },
        { status: 400 }
      );
    }

    // Проверяем, что карточка существует и не удалена
    const { data: fallenData, error: fallenError } = await supabase
      .from('fallen')
      .select('id')
      .eq('id', fallen_id)
      .eq('is_deleted', false)
      .single();

    if (fallenError || !fallenData) {
      return NextResponse.json(
        { error: 'Fallen card not found' },
        { status: 404 }
      );
    }

    // Создаем воспоминание (статус 'approved' устанавливается автоматически по умолчанию)
    const { data: memory, error: memoryError } = await supabase
      .from('memory_items')
      .insert({
        fallen_id,
        title: title.trim(),
        content_md: content_md.trim(),
        created_by: user.id,
        status: 'approved', // Явно устанавливаем статус
      })
      .select()
      .single();

    if (memoryError) {
      console.error('Error creating memory:', memoryError);
      return NextResponse.json(
        { error: 'Failed to create memory' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, memory });
  } catch (error) {
    console.error('Unexpected error creating memory:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
