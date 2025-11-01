import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Получаем всех погибших героев
    const { data: allFallen, error: fallenError } = await supabase
      .from('fallen')
      .select(`
        id,
        birth_date,
        death_date,
        hometown,
        service_type,
        military_unit,
        created_at
      `)
      .eq('status', 'approved')
      .eq('is_deleted', false)

    if (fallenError) {
      console.error('Error fetching fallen:', fallenError)
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
    }

    const fallen = allFallen || []

    // 1. Статистика по регионам (по hometown)
    const regionStats: Record<string, number> = {}
    fallen.forEach((hero) => {
      if (hero.hometown) {
        regionStats[hero.hometown] = (regionStats[hero.hometown] || 0) + 1
      }
    })

    const byRegion = Object.entries(regionStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Топ-10 регионов

    // 2. Статистика по родам войск (по service_type)
    const serviceTypeLabels: Record<string, string> = {
      mobilized: 'Мобилизованные',
      volunteer: 'Добровольцы',
      pmc: 'ЧВК',
      professional: 'Кадровые военнослужащие',
    }

    const serviceStats: Record<string, number> = {}
    fallen.forEach((hero) => {
      if (hero.service_type) {
        const label = serviceTypeLabels[hero.service_type] || hero.service_type
        serviceStats[label] = (serviceStats[label] || 0) + 1
      }
    })

    const byServiceType = Object.entries(serviceStats)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)

    // 3. Статистика по возрасту на момент гибели
    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56+': 0,
    }

    fallen.forEach((hero) => {
      if (hero.birth_date && hero.death_date) {
        const birthYear = new Date(hero.birth_date).getFullYear()
        const deathYear = new Date(hero.death_date).getFullYear()
        const age = deathYear - birthYear

        if (age >= 18 && age <= 25) ageGroups['18-25']++
        else if (age >= 26 && age <= 35) ageGroups['26-35']++
        else if (age >= 36 && age <= 45) ageGroups['36-45']++
        else if (age >= 46 && age <= 55) ageGroups['46-55']++
        else if (age >= 56) ageGroups['56+']++
      }
    })

    const byAge = Object.entries(ageGroups).map(([range, count]) => ({
      range,
      count,
    }))

    // 4. Динамика по месяцам (по дате гибели)
    const monthlyStats: Record<string, number> = {}
    fallen.forEach((hero) => {
      if (hero.death_date) {
        const date = new Date(hero.death_date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1
      }
    })

    const byMonth = Object.entries(monthlyStats)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-18) // Последние 18 месяцев

    // 5. Самые молодые и старшие герои
    const heroesWithAge = fallen
      .filter((hero) => hero.birth_date && hero.death_date)
      .map((hero) => {
        const birthYear = new Date(hero.birth_date!).getFullYear()
        const deathYear = new Date(hero.death_date!).getFullYear()
        const age = deathYear - birthYear
        return {
          id: hero.id,
          age,
          birthDate: hero.birth_date,
          deathDate: hero.death_date,
        }
      })
      .sort((a, b) => a.age - b.age)

    const youngest = heroesWithAge.slice(0, 5)
    const oldest = heroesWithAge.slice(-5).reverse()

    // 6. Самые награждённые герои
    const { data: awardCounts } = await supabase
      .from('fallen_awards')
      .select('fallen_id')
      .eq('status', 'approved')
      .eq('is_deleted', false)

    const awardCountByFallen: Record<string, number> = {}
    ;(awardCounts || []).forEach((award) => {
      awardCountByFallen[award.fallen_id] = (awardCountByFallen[award.fallen_id] || 0) + 1
    })

    const mostDecorated = Object.entries(awardCountByFallen)
      .map(([fallenId, count]) => ({ fallenId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Получаем детали для самых награждённых
    const decoratedIds = mostDecorated.map((d) => d.fallenId)
    const { data: decoratedHeroes } = decoratedIds.length > 0
      ? await supabase
          .from('fallen')
          .select('id, first_name, last_name, middle_name, hero_photo_url')
          .in('id', decoratedIds)
      : { data: [] }

    const mostDecoratedWithDetails = mostDecorated.map((d) => {
      const hero = (decoratedHeroes || []).find((h) => h.id === d.fallenId)
      return {
        id: d.fallenId,
        count: d.count,
        name: hero
          ? `${hero.last_name || ''} ${hero.first_name || ''} ${hero.middle_name || ''}`.trim()
          : 'Неизвестно',
        photoUrl: hero?.hero_photo_url,
      }
    })

    // Получаем детали для самых молодых и старших
    const youngestIds = youngest.map((h) => h.id)
    const oldestIds = oldest.map((h) => h.id)
    const ageHeroIds = [...youngestIds, ...oldestIds]

    const { data: ageHeroes } = ageHeroIds.length > 0
      ? await supabase
          .from('fallen')
          .select('id, first_name, last_name, middle_name, hero_photo_url')
          .in('id', ageHeroIds)
      : { data: [] }

    const youngestWithDetails = youngest.map((h) => {
      const hero = (ageHeroes || []).find((ah) => ah.id === h.id)
      return {
        id: h.id,
        age: h.age,
        name: hero
          ? `${hero.last_name || ''} ${hero.first_name || ''} ${hero.middle_name || ''}`.trim()
          : 'Неизвестно',
        photoUrl: hero?.hero_photo_url,
      }
    })

    const oldestWithDetails = oldest.map((h) => {
      const hero = (ageHeroes || []).find((ah) => ah.id === h.id)
      return {
        id: h.id,
        age: h.age,
        name: hero
          ? `${hero.last_name || ''} ${hero.first_name || ''} ${hero.middle_name || ''}`.trim()
          : 'Неизвестно',
        photoUrl: hero?.hero_photo_url,
      }
    })

    // 7. Общая статистика
    const totalHeroes = fallen.length
    const withPhotos = fallen.filter((h) => h.hometown).length
    const avgAge =
      heroesWithAge.length > 0
        ? Math.round(heroesWithAge.reduce((sum, h) => sum + h.age, 0) / heroesWithAge.length)
        : 0

    return NextResponse.json({
      overview: {
        totalHeroes,
        totalRegions: Object.keys(regionStats).length,
        avgAge,
      },
      byRegion,
      byServiceType,
      byAge,
      byMonth,
      youngest: youngestWithDetails,
      oldest: oldestWithDetails,
      mostDecorated: mostDecoratedWithDetails,
    })
  } catch (error) {
    console.error('Error in statistics API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
