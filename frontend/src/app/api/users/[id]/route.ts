import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - получить публичный профиль пользователя
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id: userId } = params

    // Получаем публичные данные пользователя
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(
        'id, full_name, avatar_url, bio, created_at, phone, show_phone, whatsapp_link, show_whatsapp, telegram_link, show_telegram, vk_link, show_vk'
      )
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Фильтруем данные в соответствии с настройками приватности
    const publicUserData = {
      id: userData.id,
      full_name: userData.full_name,
      avatar_url: userData.avatar_url,
      bio: userData.bio,
      created_at: userData.created_at,
      // Показываем телефон только если разрешено
      phone: userData.show_phone ? userData.phone : null,
      show_phone: userData.show_phone,
      // Показываем WhatsApp только если разрешено
      whatsapp_link: userData.show_whatsapp ? userData.whatsapp_link : null,
      show_whatsapp: userData.show_whatsapp,
      // Показываем Telegram только если разрешено
      telegram_link: userData.show_telegram ? userData.telegram_link : null,
      show_telegram: userData.show_telegram,
      // Показываем VK только если разрешено
      vk_link: userData.show_vk ? userData.vk_link : null,
      show_vk: userData.show_vk,
    }

    // Получаем подтверждённые связи с героями
    const { data: connections } = await supabase
      .from('hero_connections')
      .select(
        `
        id,
        connection_type,
        relationship,
        description,
        created_at,
        fallen:fallen(id, first_name, last_name, middle_name, hero_photo_url, birth_date, death_date)
      `
      )
      .eq('user_id', userId)
      .eq('status', 'approved')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    // Получаем зажжённые свечи
    const { data: candleLights } = await supabase
      .from('candle_lights')
      .select(
        `
        id,
        created_at,
        fallen:fallen(id, first_name, last_name, middle_name, hero_photo_url)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({
      user: publicUserData,
      connections: connections || [],
      candleLights: candleLights || [],
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
