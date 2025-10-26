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
      console.error('Auth error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', user.id);

    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Функция для преобразования пустых строк в null
    const emptyToNull = (value: any) => (value === '' ? null : value);

    const {
      first_name,
      last_name,
      middle_name,
      birth_date,
      death_date,
      rank,
      military_unit,
      hometown,
      burial_location,
      memorial_text,
      biography_md,
      hero_photo_url,
    } = body;

    // Валидация обязательных полей
    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: 'Имя и фамилия обязательны' },
        { status: 400 }
      );
    }

    // Создаем карточку
    const { data: fallen, error: fallenError } = await supabase
      .from('fallen')
      .insert({
        owner_id: user.id,
        first_name,
        last_name,
        middle_name: emptyToNull(middle_name),
        birth_date: emptyToNull(birth_date),
        death_date: emptyToNull(death_date),
        rank: emptyToNull(rank),
        military_unit: emptyToNull(military_unit),
        hometown: emptyToNull(hometown),
        burial_location: emptyToNull(burial_location),
        memorial_text: emptyToNull(memorial_text),
        biography_md: emptyToNull(biography_md),
        hero_photo_url: emptyToNull(hero_photo_url),
        status: 'pending', // Карточка идет на модерацию
      })
      .select()
      .single();

    if (fallenError) {
      console.error('Error creating fallen:', fallenError);
      return NextResponse.json(
        { error: 'Не удалось создать карточку' },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: fallen.id, ...fallen });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
