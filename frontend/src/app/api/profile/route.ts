import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - получить профиль текущего пользователя
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем данные пользователя из таблицы users
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    // Получаем связи пользователя с героями
    const { data: connections } = await supabase
      .from('hero_connections')
      .select(
        `
        id,
        connection_type,
        relationship,
        description,
        status,
        fallen:fallen(id, first_name, last_name, middle_name, hero_photo_url, birth_date, death_date)
      `
      )
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      user: userData,
      connections: connections || [],
      email: user.email,
    })
  } catch (error) {
    console.error('Error in profile API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - обновить профиль
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('[Profile API] Received body:', body)

    const {
      full_name,
      bio,
      phone,
      show_phone,
      whatsapp_link,
      show_whatsapp,
      telegram_link,
      show_telegram,
      vk_link,
      show_vk,
    } = body

    // Обновляем данные пользователя
    const updates: any = {}
    if (full_name !== undefined) updates.full_name = full_name
    if (bio !== undefined) updates.bio = bio
    if (phone !== undefined) updates.phone = phone
    if (show_phone !== undefined) updates.show_phone = show_phone
    if (whatsapp_link !== undefined) updates.whatsapp_link = whatsapp_link
    if (show_whatsapp !== undefined) updates.show_whatsapp = show_whatsapp
    if (telegram_link !== undefined) updates.telegram_link = telegram_link
    if (show_telegram !== undefined) updates.show_telegram = show_telegram
    if (vk_link !== undefined) updates.vk_link = vk_link
    if (show_vk !== undefined) updates.show_vk = show_vk

    console.log('[Profile API] Updates to apply:', updates)

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, user: data })
  } catch (error) {
    console.error('Error in profile PATCH API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
