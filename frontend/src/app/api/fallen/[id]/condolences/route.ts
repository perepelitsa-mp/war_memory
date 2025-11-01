import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - получить соболезнования для героя
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id: fallenId } = params

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Получаем одобренные соболезнования
    let query = supabase
      .from('condolences')
      .select(
        `
        id,
        content,
        relationship_to_hero,
        status,
        created_at,
        author:users!condolences_author_id_fkey(id, full_name, avatar_url)
      `
      )
      .eq('fallen_id', fallenId)
      .eq('is_deleted', false)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    const { data: approvedData, error: approvedError } = await query

    if (approvedError) {
      console.error('Error fetching approved condolences:', approvedError)
      return NextResponse.json({ error: 'Failed to fetch condolences' }, { status: 500 })
    }

    // Если пользователь авторизован, получаем также его pending соболезнования
    let pendingCondolences: any[] = []
    if (user) {
      const { data: pendingData } = await supabase
        .from('condolences')
        .select(
          `
          id,
          content,
          relationship_to_hero,
          status,
          created_at,
          author:users!condolences_author_id_fkey(id, full_name, avatar_url)
        `
        )
        .eq('fallen_id', fallenId)
        .eq('is_deleted', false)
        .eq('author_id', user.id)
        .eq('status', 'pending')

      pendingCondolences = pendingData || []
    }

    // Объединяем approved и pending
    const allCondolences = [...(approvedData || []), ...pendingCondolences]

    return NextResponse.json({
      condolences: allCondolences,
      totalCount: (approvedData || []).length,
    })
  } catch (error) {
    console.error('Error in condolences GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - создать соболезнование
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
    const { content, relationship_to_hero } = body

    // Валидация
    if (!content || content.trim().length < 10 || content.trim().length > 5000) {
      return NextResponse.json(
        { error: 'Condolence must be between 10 and 5000 characters' },
        { status: 400 }
      )
    }

    // Создаём соболезнование
    const { data, error } = await supabase
      .from('condolences')
      .insert({
        fallen_id: fallenId,
        author_id: user.id,
        content: content.trim(),
        relationship_to_hero: relationship_to_hero || null,
        status: 'pending',
      })
      .select(
        `
        id,
        content,
        relationship_to_hero,
        status,
        created_at,
        author:users!condolences_author_id_fkey(id, full_name, avatar_url)
      `
      )
      .single()

    if (error) {
      console.error('Error creating condolence:', error)
      return NextResponse.json({ error: 'Failed to create condolence' }, { status: 500 })
    }

    // TODO: Отправить уведомление владельцу карточки о новом соболезновании

    return NextResponse.json({
      success: true,
      condolence: data,
    })
  } catch (error) {
    console.error('Error in condolences POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
