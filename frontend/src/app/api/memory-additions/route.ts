import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/memory-additions
 * Create a new memory addition (дополнение к воспоминанию)
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
    const { memory_item_id, content_md, media_ids } = body;

    // Валидация
    if (!memory_item_id || !content_md) {
      return NextResponse.json(
        { error: 'Memory item ID and content are required' },
        { status: 400 }
      );
    }

    // Проверяем, что воспоминание существует и не удалено
    const { data: memoryData, error: memoryError } = await supabase
      .from('memory_items')
      .select('id, fallen_id')
      .eq('id', memory_item_id)
      .eq('is_deleted', false)
      .single();

    if (memoryError || !memoryData) {
      return NextResponse.json(
        { error: 'Memory item not found' },
        { status: 404 }
      );
    }

    // Проверяем, что карточка погибшего существует и не удалена
    const { data: fallenData, error: fallenError } = await supabase
      .from('fallen')
      .select('id')
      .eq('id', memoryData.fallen_id)
      .eq('is_deleted', false)
      .single();

    if (fallenError || !fallenData) {
      return NextResponse.json(
        { error: 'Fallen card not found' },
        { status: 404 }
      );
    }

    // Создаем дополнение к воспоминанию (статус 'approved' устанавливается автоматически по умолчанию)
    const { data: addition, error: additionError } = await supabase
      .from('memory_additions')
      .insert({
        memory_item_id,
        content_md: content_md.trim(),
        created_by: user.id,
        status: 'approved', // Явно устанавливаем статус
        media_ids: media_ids && media_ids.length > 0 ? media_ids : null,
      })
      .select()
      .single();

    if (additionError) {
      console.error('Error creating memory addition:', additionError);
      return NextResponse.json(
        { error: 'Failed to create memory addition' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, addition });
  } catch (error) {
    console.error('Unexpected error creating memory addition:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
