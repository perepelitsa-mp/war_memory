import { createClient } from '@/lib/supabase/server';
import { checkAdminAccess } from '@/lib/auth/check-admin';
import { NextRequest, NextResponse } from 'next/server';
import { ModerationAction } from '@/types';

/**
 * POST /api/admin/moderation/moderate
 * Одобрить или отклонить карточку погибшего
 * Доступ: только admin/superadmin/moderator
 */
export async function POST(request: NextRequest) {
  try {
    // Проверка прав доступа
    const { authorized, user, error: authError } = await checkAdminAccess();

    if (!authorized || !user) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Получаем данные из запроса
    const body: ModerationAction = await request.json();
    const { cardId, action, moderationNote } = body;

    // Валидация
    if (!cardId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: cardId, action' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Если отклонение - заметка обязательна
    if (action === 'reject' && !moderationNote?.trim()) {
      return NextResponse.json(
        { error: 'Moderation note is required for rejection' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Проверяем существование карточки
    const { data: card, error: cardError } = await supabase
      .from('fallen')
      .select('id, status, is_deleted')
      .eq('id', cardId)
      .single();

    if (cardError || !card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    if (card.is_deleted) {
      return NextResponse.json(
        { error: 'Card is deleted' },
        { status: 400 }
      );
    }

    if (card.status !== 'pending') {
      return NextResponse.json(
        { error: `Card is not pending. Current status: ${card.status}` },
        { status: 400 }
      );
    }

    // Определяем новый статус
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // Обновляем карточку
    const { data: updatedCard, error: updateError } = await supabase
      .from('fallen')
      .update({
        status: newStatus,
        moderated_by: user.id,
        moderated_at: new Date().toISOString(),
        moderation_note: moderationNote || null,
      })
      .eq('id', cardId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating card:', updateError);
      return NextResponse.json(
        { error: 'Failed to update card' },
        { status: 500 }
      );
    }

    // Триггер audit_trigger_func автоматически создаст запись в audit_log

    return NextResponse.json({
      success: true,
      message: `Карточка успешно ${action === 'approve' ? 'одобрена' : 'отклонена'}`,
      card: updatedCard,
      new_status: newStatus,
    });
  } catch (error) {
    console.error('Unexpected error in moderation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
