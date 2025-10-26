import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { itemId, itemType, action, cardId } = body;

    // Валидация
    if (!itemId || !itemType || !action || !cardId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['timeline', 'memory', 'comment'].includes(itemType)) {
      return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
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

    // Выполняем модерацию в зависимости от типа элемента
    let result;
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    switch (itemType) {
      case 'timeline':
        result = await supabase
          .from('timeline_items')
          .update({ status: newStatus })
          .eq('id', itemId)
          .eq('fallen_id', cardId)
          .select();
        break;

      case 'memory':
        result = await supabase
          .from('memory_items')
          .update({ status: newStatus })
          .eq('id', itemId)
          .eq('fallen_id', cardId)
          .select();
        break;

      case 'comment':
        // Для комментариев: если reject - скрываем, если approve - показываем
        const isHidden = action === 'reject';
        result = await supabase
          .from('comments')
          .update({ is_hidden: isHidden })
          .eq('id', itemId)
          .eq('fallen_id', cardId)
          .select();
        break;

      default:
        return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
    }

    if (result.error) {
      console.error('Error moderating item:', result.error);
      return NextResponse.json({ error: 'Failed to moderate item' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Item ${action}ed successfully`,
      data: result.data,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
