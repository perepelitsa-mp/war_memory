import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - получить все цветы для героя
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id: fallenId } = params

    // Получаем цветы с информацией о пользователях
    const { data: flowersData, error } = await supabase
      .from('virtual_flowers')
      .select(
        `
        id,
        flower_type,
        flower_color,
        flower_count,
        message,
        created_at,
        user:users!virtual_flowers_user_id_fkey(id, full_name, avatar_url)
      `
      )
      .eq('fallen_id', fallenId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching flowers:', error)
      return NextResponse.json({ error: 'Failed to fetch flowers' }, { status: 500 })
    }

    // Подсчитываем общее количество цветов
    const totalCount = flowersData?.reduce((sum, flower) => sum + (flower.flower_count || 1), 0) || 0

    return NextResponse.json({
      flowers: flowersData || [],
      totalCount,
    })
  } catch (error) {
    console.error('Error in flowers GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - возложить цветы
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id: fallenId } = params

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { flower_type, flower_color, flower_count, message } = body

    // Валидация
    if (!flower_type || !['roses', 'carnations', 'lilies', 'chrysanthemums', 'tulips', 'mixed'].includes(flower_type)) {
      return NextResponse.json({ error: 'Invalid flower type' }, { status: 400 })
    }

    if (flower_color && !['red', 'white', 'pink', 'yellow', 'purple', 'mixed'].includes(flower_color)) {
      return NextResponse.json({ error: 'Invalid flower color' }, { status: 400 })
    }

    const count = parseInt(flower_count) || 1
    if (count < 1 || count > 99) {
      return NextResponse.json({ error: 'Flower count must be between 1 and 99' }, { status: 400 })
    }

    // Проверяем, не возлагал ли пользователь уже цветы этому герою
    const { data: existingFlowers, error: checkError } = await supabase
      .from('virtual_flowers')
      .select('id')
      .eq('fallen_id', fallenId)
      .eq('user_id', user.id)
      .single()

    if (existingFlowers) {
      return NextResponse.json(
        { error: 'Вы уже возлагали цветы этому герою' },
        { status: 409 }
      )
    }

    // Создаём запись о возложении цветов
    const { data, error } = await supabase
      .from('virtual_flowers')
      .insert({
        fallen_id: fallenId,
        user_id: user.id,
        flower_type,
        flower_color: flower_color || 'mixed',
        flower_count: count,
        message: message || null,
      })
      .select(
        `
        id,
        flower_type,
        flower_color,
        flower_count,
        message,
        created_at,
        user:users!virtual_flowers_user_id_fkey(id, full_name, avatar_url)
      `
      )
      .single()

    if (error) {
      console.error('Error laying flowers:', error)
      // Проверяем, не нарушение ли это уникального ограничения
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Вы уже возлагали цветы этому герою' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: 'Failed to lay flowers' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      flower: data,
    })
  } catch (error) {
    console.error('Error in flowers POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
