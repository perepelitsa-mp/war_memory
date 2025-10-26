import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/comments/[id]/delete
 * Soft delete a comment
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

    const commentId = params.id;

    // Вызываем функцию мягкого удаления
    const { data, error } = await supabase.rpc('soft_delete_comment', {
      p_comment_id: commentId,
      p_user_id: user.id,
    });

    if (error) {
      console.error('Error deleting comment:', error);

      // Проверяем, является ли это ошибкой прав доступа
      if (error.message.includes('Insufficient permissions')) {
        return NextResponse.json(
          { error: 'У вас нет прав для удаления этого комментария' },
          { status: 403 }
        );
      }

      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Комментарий не найден' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Не удалось удалить комментарий' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error deleting comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
