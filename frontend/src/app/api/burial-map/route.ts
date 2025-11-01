import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - получить все захоронения с координатами для карты
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Получаем параметры фильтрации из query
    const searchParams = request.nextUrl.searchParams
    const region = searchParams.get('region')
    const city = searchParams.get('city')
    const militaryUnit = searchParams.get('military_unit')

    let query = supabase
      .from('fallen')
      .select(
        `
        id,
        first_name,
        last_name,
        middle_name,
        birth_date,
        death_date,
        rank,
        military_unit,
        hometown,
        burial_location,
        burial_coordinates,
        hero_photo_url
      `
      )
      .eq('status', 'approved')
      .eq('is_deleted', false)
      .not('burial_coordinates', 'is', null)

    // Применяем фильтры
    if (region) {
      query = query.ilike('burial_location', `%${region}%`)
    }

    if (city) {
      query = query.ilike('burial_location', `%${city}%`)
    }

    if (militaryUnit) {
      query = query.ilike('military_unit', `%${militaryUnit}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching burial locations:', error)
      return NextResponse.json({ error: 'Failed to fetch burial locations' }, { status: 500 })
    }

    // Преобразуем данные для карты
    const markers = data.map((fallen) => ({
      id: fallen.id,
      name: `${fallen.last_name} ${fallen.first_name} ${fallen.middle_name || ''}`.trim(),
      coordinates: fallen.burial_coordinates as { lat: number; lng: number },
      burialLocation: fallen.burial_location,
      hometown: fallen.hometown,
      rank: fallen.rank,
      militaryUnit: fallen.military_unit,
      birthDate: fallen.birth_date,
      deathDate: fallen.death_date,
      photoUrl: fallen.hero_photo_url,
    }))

    // Группируем статистику
    const stats = {
      total: markers.length,
      byRegion: {} as Record<string, number>,
      byCity: {} as Record<string, number>,
    }

    markers.forEach((marker) => {
      // Простая группировка по локации
      const location = marker.burialLocation || 'Неизвестно'
      const parts = location.split(',').map((s) => s.trim())

      if (parts.length > 0) {
        const region = parts[parts.length - 1] // Последняя часть - обычно регион
        stats.byRegion[region] = (stats.byRegion[region] || 0) + 1
      }

      if (parts.length > 1) {
        const city = parts[0] // Первая часть - обычно город
        stats.byCity[city] = (stats.byCity[city] || 0) + 1
      }
    })

    return NextResponse.json({
      markers,
      stats,
    })
  } catch (error) {
    console.error('Error in burial-map API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
