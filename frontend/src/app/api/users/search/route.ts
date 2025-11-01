import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - поиск пользователей по имени
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
    }

    // Поиск пользователей по имени
    const { data: users, error } = await supabase
      .from('users')
      .select('id, full_name, avatar_url, phone, bio')
      .ilike('full_name', `%${query.trim()}%`)
      .eq('is_deleted', false)
      .limit(20)
      .order('full_name', { ascending: true })

    if (error) {
      console.error('Error searching users:', error)
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
    }

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('Error in users search API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
