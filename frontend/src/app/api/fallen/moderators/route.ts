import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Добавление модератора (редактора)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Проверка авторизации
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
    }

    const body = await request.json()
    const { fallen_id, editor_id } = body

    console.log('[POST /api/fallen/moderators] Request:', { fallen_id, editor_id, user: user.id })

    if (!fallen_id || !editor_id) {
      console.log('[POST /api/fallen/moderators] Missing parameters')
      return NextResponse.json(
        { error: 'Не указаны обязательные параметры' },
        { status: 400 }
      )
    }

    // Получаем карточку
    const { data: fallen, error: fallenError } = await supabase
      .from('fallen')
      .select('owner_id, editors')
      .eq('id', fallen_id)
      .single()

    console.log('[POST /api/fallen/moderators] Fallen query:', { fallen, fallenError })

    if (fallenError || !fallen) {
      console.log('[POST /api/fallen/moderators] Fallen not found')
      return NextResponse.json({ error: 'Карточка не найдена' }, { status: 404 })
    }

    // Получаем роль текущего пользователя
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = userData?.role || 'user'
    const isOwner = fallen.owner_id === user.id
    const isAdmin = ['superadmin', 'admin', 'moderator'].includes(userRole)
    const isEditor = Array.isArray(fallen.editors) && fallen.editors.includes(user.id)

    // Проверяем права: владелец, редактор или админ
    if (!isOwner && !isEditor && !isAdmin) {
      return NextResponse.json(
        { error: 'У вас нет прав для добавления модераторов' },
        { status: 403 }
      )
    }

    // Проверяем, что пользователь существует
    const { data: editorUser, error: editorError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('id', editor_id)
      .single()

    if (editorError || !editorUser) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // Проверяем, не является ли пользователь уже владельцем
    if (editor_id === fallen.owner_id) {
      return NextResponse.json(
        { error: 'Владелец карточки не может быть добавлен как модератор' },
        { status: 400 }
      )
    }

    // Проверяем, не добавлен ли уже
    const currentEditors = Array.isArray(fallen.editors) ? fallen.editors : []
    if (currentEditors.includes(editor_id)) {
      return NextResponse.json(
        { error: 'Этот пользователь уже является модератором' },
        { status: 400 }
      )
    }

    // Добавляем редактора
    const updatedEditors = [...currentEditors, editor_id]
    const { error: updateError } = await supabase
      .from('fallen')
      .update({
        editors: updatedEditors,
        updated_at: new Date().toISOString(),
      })
      .eq('id', fallen_id)

    if (updateError) {
      console.error('Error adding moderator:', updateError)
      return NextResponse.json(
        { error: 'Ошибка при добавлении модератора' },
        { status: 500 }
      )
    }

    // Записываем в audit_log
    await supabase.from('audit_log').insert({
      entity_type: 'fallen',
      entity_id: fallen_id,
      action: 'update',
      user_id: user.id,
      changes: {
        editors: {
          action: 'add',
          editor_id: editor_id,
          editor_name: editorUser.full_name,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in moderators POST API:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

// Удаление модератора (редактора)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Проверка авторизации
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
    }

    const body = await request.json()
    const { fallen_id, editor_id } = body

    if (!fallen_id || !editor_id) {
      return NextResponse.json(
        { error: 'Не указаны обязательные параметры' },
        { status: 400 }
      )
    }

    // Получаем карточку
    const { data: fallen, error: fallenError } = await supabase
      .from('fallen')
      .select('owner_id, editors')
      .eq('id', fallen_id)
      .single()

    if (fallenError || !fallen) {
      return NextResponse.json({ error: 'Карточка не найдена' }, { status: 404 })
    }

    // Получаем роль текущего пользователя
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = userData?.role || 'user'
    const isOwner = fallen.owner_id === user.id
    const isAdmin = ['superadmin', 'admin', 'moderator'].includes(userRole)

    // Проверяем права: только владелец или админ могут удалять модераторов
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'У вас нет прав для удаления модераторов' },
        { status: 403 }
      )
    }

    // Удаляем редактора из списка
    const currentEditors = Array.isArray(fallen.editors) ? fallen.editors : []
    const updatedEditors = currentEditors.filter((id) => id !== editor_id)

    const { error: updateError } = await supabase
      .from('fallen')
      .update({
        editors: updatedEditors,
        updated_at: new Date().toISOString(),
      })
      .eq('id', fallen_id)

    if (updateError) {
      console.error('Error removing moderator:', updateError)
      return NextResponse.json(
        { error: 'Ошибка при удалении модератора' },
        { status: 500 }
      )
    }

    // Получаем имя удаленного редактора для лога
    const { data: editorUser } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', editor_id)
      .single()

    // Записываем в audit_log
    await supabase.from('audit_log').insert({
      entity_type: 'fallen',
      entity_id: fallen_id,
      action: 'update',
      user_id: user.id,
      changes: {
        editors: {
          action: 'remove',
          editor_id: editor_id,
          editor_name: editorUser?.full_name || 'Unknown',
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in moderators DELETE API:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
