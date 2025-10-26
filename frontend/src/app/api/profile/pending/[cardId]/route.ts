import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const supabase = await createClient();
    const { cardId } = params;

    // Получаем текущего пользователя
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Проверяем, что пользователь является владельцем карточки
    const { data: card, error: cardError } = await supabase
      .from('fallen')
      .select('id, owner_id')
      .eq('id', cardId)
      .single();

    if (cardError || !card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    if (card.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Получаем pending события таймлайна
    const { data: timelineItems, error: timelineError } = await supabase
      .from('timeline_items')
      .select(
        `
        id,
        year,
        date_exact,
        title,
        description_md,
        created_by,
        created_at,
        users:created_by (
          id,
          full_name,
          email
        )
      `
      )
      .eq('fallen_id', cardId)
      .eq('status', 'pending')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (timelineError) {
      console.error('Error fetching timeline items:', timelineError);
    }

    // Получаем pending воспоминания
    const { data: memoryItems, error: memoryError } = await supabase
      .from('memory_items')
      .select(
        `
        id,
        title,
        content_md,
        media_type,
        created_by,
        created_at,
        users:created_by (
          id,
          full_name,
          email
        )
      `
      )
      .eq('fallen_id', cardId)
      .eq('status', 'pending')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (memoryError) {
      console.error('Error fetching memory items:', memoryError);
    }

    // Получаем новые комментарии
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(
        `
        id,
        content,
        parent_id,
        created_at,
        author_id,
        users:author_id (
          id,
          full_name,
          email
        )
      `
      )
      .eq('fallen_id', cardId)
      .eq('is_deleted', false)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }

    return NextResponse.json({
      timeline: timelineItems || [],
      memory: memoryItems || [],
      comments: comments || [],
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
