import { createClient } from '@/lib/supabase/server';
import { checkAdminAccess } from '@/lib/auth/check-admin';
import { NextResponse } from 'next/server';
import { FallenForModeration, ModerationStats } from '@/types';

/**
 * GET /api/admin/moderation/cards
 * Получить список карточек на модерации
 * Доступ: только admin/superadmin/moderator
 */
export async function GET() {
  try {
    // Проверка прав доступа
    const { authorized, error: authError } = await checkAdminAccess();

    if (!authorized) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Получаем карточки на модерации через view
    const { data: cards, error: cardsError } = await supabase
      .from('fallen')
      .select(
        `
        id,
        last_name,
        first_name,
        middle_name,
        birth_date,
        death_date,
        military_unit,
        rank,
        hometown,
        burial_location,
        hero_photo_url,
        memorial_text,
        biography_md,
        proof_document_url,
        relationship,
        status,
        created_at,
        updated_at,
        owner:users!owner_id (
          id,
          full_name,
          email,
          phone,
          avatar_url
        )
      `
      )
      .eq('status', 'pending')
      .eq('is_deleted', false)
      .order('created_at', { ascending: true }); // Старые первыми

    if (cardsError) {
      console.error('Error fetching moderation cards:', cardsError);
      return NextResponse.json(
        { error: 'Failed to fetch cards' },
        { status: 500 }
      );
    }

    // Преобразуем данные в формат FallenForModeration
    const cardsWithMetadata: FallenForModeration[] = (cards || []).map((card) => {
      const daysInQueue = Math.floor(
        (Date.now() - new Date(card.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      let priority: 'normal' | 'high' | 'urgent' = 'normal';
      if (daysInQueue > 6) {
        priority = 'urgent';
      } else if (daysInQueue > 3) {
        priority = 'high';
      }

      return {
        ...card,
        owner: Array.isArray(card.owner) ? card.owner[0] : card.owner,
        days_in_queue: daysInQueue,
        priority,
      } as FallenForModeration;
    });

    // Получаем статистику модерации
    const { data: statsData, error: statsError } = await supabase.rpc(
      'get_moderation_stats'
    );

    const stats: ModerationStats = statsError
      ? {
          total_pending: cards?.length || 0,
          urgent_pending:
            cardsWithMetadata.filter((c) => c.priority === 'urgent').length,
          approved_today: 0,
          approved_this_week: 0,
          rejected_this_week: 0,
          avg_moderation_time_hours: null,
        }
      : (statsData[0] as ModerationStats);

    return NextResponse.json({
      cards: cardsWithMetadata,
      stats,
      total: cardsWithMetadata.length,
    });
  } catch (error) {
    console.error('Unexpected error in moderation cards API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
