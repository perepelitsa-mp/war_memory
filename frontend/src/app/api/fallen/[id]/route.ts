import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Получаем текущего пользователя
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Проверяем, что пользователь владелец карточки
    const { data: fallen, error: checkError } = await supabase
      .from('fallen')
      .select('id, owner_id')
      .eq('id', id)
      .single();

    if (checkError || !fallen) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    if (fallen.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Функция для преобразования пустых строк в null
    const emptyToNull = (value: any) => (value === '' ? null : value);

    // Удаляем поле call_sign если оно пришло, и преобразуем пустые строки в null
    const { call_sign, ...rest } = body;
    const updateData = Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [key, typeof value === 'string' ? emptyToNull(value) : value])
    );

    // Обновляем карточку
    const { data: updated, error: updateError } = await supabase
      .from('fallen')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating fallen:', updateError);
      return NextResponse.json(
        { error: 'Не удалось обновить карточку' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, fallen: updated });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
