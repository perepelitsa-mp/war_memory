import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/memory-additions/[id]/delete
 * Soft delete a memory addition
 * Доступ: владелец карточки или admin/superadmin/moderator
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const additionId = params.id;

    // Вызываем функцию мягкого удаления
    const { data, error } = await supabase.rpc('soft_delete_memory_addition', {
      p_addition_id: additionId,
      p_user_id: user.id,
    });

    if (error) {
      console.error('Error deleting memory addition:', error);

      // Проверяем, является ли это ошибкой прав доступа
      if (error.message.includes('Insufficient permissions')) {
        return NextResponse.json(
          { error: 'У вас нет прав для удаления этого дополнения' },
          { status: 403 }
        );
      }

      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Дополнение не найдено' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Не удалось удалить дополнение' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error deleting memory addition:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
