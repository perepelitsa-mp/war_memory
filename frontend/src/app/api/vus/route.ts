import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/vus
 * Получить список одобренных ВУС
 */
export async function GET() {
  const supabase = await createClient()

  const { data: vusList, error } = await supabase
    .from('vus')
    .select('*')
    .eq('is_approved', true)
    .eq('is_deleted', false)
    .order('code', { ascending: true })

  if (error) {
    console.error('Error fetching VUS:', error)
    return NextResponse.json({ error: 'Failed to fetch VUS' }, { status: 500 })
  }

  return NextResponse.json({ vus: vusList })
}

/**
 * POST /api/vus
 * Добавить новый ВУС (требует модерации)
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Проверка авторизации
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { code, name, description } = body

    // Валидация
    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Проверяем, не существует ли уже такой ВУС
    const { data: existingVus } = await supabase
      .from('vus')
      .select('id, is_approved')
      .eq('code', code.trim())
      .eq('is_deleted', false)
      .single()

    if (existingVus) {
      if (existingVus.is_approved) {
        return NextResponse.json(
          { error: 'VUS with this code already exists' },
          { status: 409 }
        )
      } else {
        return NextResponse.json(
          { error: 'VUS with this code is pending approval' },
          { status: 409 }
        )
      }
    }

    // Проверяем, является ли пользователь администратором
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin =
      userData?.role === 'admin' ||
      userData?.role === 'moderator' ||
      userData?.role === 'superadmin'

    // Добавляем новый ВУС
    // Если пользователь админ - автоматически одобряем
    const { data: newVus, error: insertError } = await supabase
      .from('vus')
      .insert({
        code: code.trim(),
        name: name.trim(),
        description: description?.trim() || null,
        created_by: user.id,
        is_approved: isAdmin, // Админы создают сразу одобренные ВУС
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting VUS:', insertError)
      return NextResponse.json(
        { error: 'Failed to create VUS', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        vus: newVus,
        message: isAdmin
          ? 'VUS created successfully'
          : 'VUS submitted for approval',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating VUS:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
