import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/comments
 * Create a new comment
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
    const { fallen_id, memory_item_id, memory_addition_id, content, parent_id } = body;

    // Валидация - должно быть заполнено ровно одно из: fallen_id, memory_item_id, memory_addition_id
    const targetCount = [fallen_id, memory_item_id, memory_addition_id].filter(Boolean).length;

    if (targetCount !== 1) {
      return NextResponse.json(
        { error: 'Exactly one of fallen_id, memory_item_id, or memory_addition_id is required' },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Проверяем существование целевой сущности
    if (fallen_id) {
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
    }

    if (memory_item_id) {
      const { data: memoryData, error: memoryError } = await supabase
        .from('memory_items')
        .select('id')
        .eq('id', memory_item_id)
        .eq('is_deleted', false)
        .single();

      if (memoryError || !memoryData) {
        return NextResponse.json(
          { error: 'Memory item not found' },
          { status: 404 }
        );
      }
    }

    if (memory_addition_id) {
      const { data: additionData, error: additionError } = await supabase
        .from('memory_additions')
        .select('id')
        .eq('id', memory_addition_id)
        .eq('is_deleted', false)
        .single();

      if (additionError || !additionData) {
        return NextResponse.json(
          { error: 'Memory addition not found' },
          { status: 404 }
        );
      }
    }

    // Если это ответ на комментарий, проверяем родительский комментарий
    if (parent_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id')
        .eq('id', parent_id)
        .eq('is_deleted', false)
        .single();

      if (parentError || !parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }
    }

    // Создаем комментарий
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        fallen_id: fallen_id || null,
        memory_item_id: memory_item_id || null,
        memory_addition_id: memory_addition_id || null,
        content: content.trim(),
        parent_id: parent_id || null,
        author_id: user.id,
      })
      .select()
      .single();

    if (commentError) {
      console.error('Error creating comment:', commentError);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error('Unexpected error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
