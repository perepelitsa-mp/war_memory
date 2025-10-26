import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Получаем текущего пользователя
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем карточки пользователя (где он владелец)
    const { data: cards, error: cardsError } = await supabase
      .from('fallen')
      .select(
        `
        id,
        first_name,
        last_name,
        middle_name,
        birth_date,
        death_date,
        rank,
        hero_photo_url,
        status,
        created_at
      `
      )
      .eq('owner_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (cardsError) {
      console.error('Error fetching cards:', cardsError);
      return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
    }

    // Для каждой карточки получаем счетчики pending элементов
    const cardsWithCounts = await Promise.all(
      (cards || []).map(async (card) => {
        // Подсчитываем pending события таймлайна
        const { count: timelineCount } = await supabase
          .from('timeline_items')
          .select('*', { count: 'exact', head: true })
          .eq('fallen_id', card.id)
          .eq('status', 'pending')
          .eq('is_deleted', false);

        // Подсчитываем pending воспоминания
        const { count: memoryCount } = await supabase
          .from('memory_items')
          .select('*', { count: 'exact', head: true })
          .eq('fallen_id', card.id)
          .eq('status', 'pending')
          .eq('is_deleted', false);

        // Подсчитываем новые комментарии (не скрытые, не удаленные)
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('fallen_id', card.id)
          .eq('is_deleted', false)
          .eq('is_hidden', false);

        return {
          ...card,
          pendingCounts: {
            timeline: timelineCount || 0,
            memory: memoryCount || 0,
            comments: commentsCount || 0,
            total: (timelineCount || 0) + (memoryCount || 0) + (commentsCount || 0),
          },
        };
      })
    );

    return NextResponse.json({ cards: cardsWithCounts });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
