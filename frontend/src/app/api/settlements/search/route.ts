import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * API для поиска населенных пунктов
 * GET /api/settlements/search?q=москва&country=RU&limit=10
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const country = searchParams.get('country') || '' // RU, UA, или пусто для всех
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    if (query.length < 2) {
      return NextResponse.json(
        { error: 'Минимум 2 символа для поиска' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Базовый запрос
    let queryBuilder = supabase
      .from('settlements')
      .select('id, name, name_ru, country_code, region, population')
      .or(`name_ru.ilike.%${query}%,name.ilike.%${query}%`)
      .order('population', { ascending: false })
      .limit(limit)

    // Фильтр по стране
    if (country && (country === 'RU' || country === 'UA')) {
      queryBuilder = queryBuilder.eq('country_code', country)
    }

    const { data, error } = await queryBuilder

    if (error) {
      console.error('Ошибка поиска населенных пунктов:', error)
      return NextResponse.json(
        { error: 'Ошибка поиска' },
        { status: 500 }
      )
    }

    // Форматирование результатов
    const results = (data || []).map((settlement) => ({
      id: settlement.id,
      value: settlement.name_ru || settlement.name,
      label: settlement.name_ru || settlement.name,
      description: settlement.region
        ? `${settlement.region}, ${settlement.country_code === 'RU' ? 'Россия' : 'Украина'}`
        : settlement.country_code === 'RU'
          ? 'Россия'
          : 'Украина',
      country: settlement.country_code,
      population: settlement.population,
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Ошибка API settlements/search:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
