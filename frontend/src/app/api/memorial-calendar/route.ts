import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - получить героев с важными датами на сегодня
export async function GET() {
  try {
    const supabase = await createClient()
    const today = new Date()
    const todayMonth = today.getMonth() + 1 // 1-12
    const todayDay = today.getDate() // 1-31

    // Получаем героев, у которых сегодня день рождения или день гибели
    const { data: fallen, error } = await supabase
      .from('fallen')
      .select('id, first_name, last_name, middle_name, hero_photo_url, birth_date, death_date, rank')
      .eq('status', 'approved')
      .eq('is_deleted', false)
      .not('birth_date', 'is', null)
      .not('death_date', 'is', null)

    if (error) {
      console.error('Error fetching fallen:', error)
      return NextResponse.json({ error: 'Failed to fetch memorial calendar' }, { status: 500 })
    }

    // Фильтруем на клиенте (так как Postgres date functions могут различаться)
    const birthdays: any[] = []
    const memorialDays: any[] = []

    fallen?.forEach((person) => {
      if (person.birth_date) {
        const birthDate = new Date(person.birth_date)
        if (birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay) {
          const age = today.getFullYear() - birthDate.getFullYear()
          birthdays.push({
            ...person,
            age,
            dateType: 'birthday',
          })
        }
      }

      if (person.death_date) {
        const deathDate = new Date(person.death_date)
        if (deathDate.getMonth() + 1 === todayMonth && deathDate.getDate() === todayDay) {
          const yearsAgo = today.getFullYear() - deathDate.getFullYear()
          memorialDays.push({
            ...person,
            yearsAgo,
            dateType: 'memorial',
          })
        }
      }
    })

    return NextResponse.json({
      today: {
        date: today.toISOString(),
        month: todayMonth,
        day: todayDay,
      },
      birthdays,
      memorialDays,
      total: birthdays.length + memorialDays.length,
    })
  } catch (error) {
    console.error('Error in memorial calendar API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
