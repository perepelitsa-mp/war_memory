import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id: fallenId } = params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // photo or video

    // Получаем медиафайлы из галереи
    let query = supabase
      .from('fallen_media')
      .select('*')
      .eq('fallen_id', fallenId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    // Фильтр по типу, если указан
    if (type) {
      query = query.eq('media_type', type)
    }

    const { data: media, error } = await query

    if (error) {
      console.error('Error fetching media:', error)
      return NextResponse.json(
        { error: 'Failed to fetch media' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      media: media || [],
      count: media?.length || 0,
    })
  } catch (error) {
    console.error('Error in media API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
