import NextDynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import { FallenCard } from '@/components/fallen/FallenCard'
import { HeroesFilter } from '@/components/home/HeroesFilter'
import { FallenCardSkeleton } from '@/components/fallen/FallenCardSkeleton'
import { MemorialCalendar } from '@/components/home/MemorialCalendar'
import { Fallen } from '@/types'

// Dynamic import to prevent hydration errors (uses Math.random on client)
const AnimatedHeroesCarousel = NextDynamic(
  () => import('@/components/home/AnimatedHeroesCarousel').then(mod => ({ default: mod.AnimatedHeroesCarousel })),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <FallenCardSkeleton key={i} />
        ))}
      </div>
    )
  }
)

const HeroMosaic = NextDynamic(
  () => import('@/components/home/HeroMosaic').then(mod => ({ default: mod.HeroMosaic })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-border/40 bg-background-soft/50 p-8">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      </div>
    )
  }
)

export const dynamic = 'force-dynamic'

interface HomePageProps {
  searchParams: {
    search?: string
    city?: string
    unit?: string
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const supabase = await createClient()

  // Check if any filters are active
  const hasActiveFilters = !!(
    searchParams.search ||
    searchParams.city ||
    searchParams.unit
  )

  // Get unique military units for filter
  const { data: allFallen } = await supabase
    .from('fallen')
    .select('military_unit')
    .eq('status', 'approved')
    .eq('is_deleted', false)
    .not('military_unit', 'is', null)

  const uniqueUnits = Array.from(
    new Set((allFallen || []).map((f) => f.military_unit).filter(Boolean))
  ).sort()

  // Get statistics data (UNFILTERED - always shows total counts)
  const { data: allFallenForStats, error: statsError } = await supabase
    .from('fallen')
    .select('hometown')
    .eq('status', 'approved')
    .eq('is_deleted', false)

  const { count: totalFallenCount, error: countError } = await supabase
    .from('fallen')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')
    .eq('is_deleted', false)

  // Build filtered query for display
  let query = supabase
    .from('fallen')
    .select('*')
    .eq('status', 'approved')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  // Apply filters from search params
  if (searchParams.search) {
    const searchTerm = `%${searchParams.search}%`
    query = query.or(
      `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},middle_name.ilike.${searchTerm}`
    )
  }

  if (searchParams.city) {
    query = query.eq('hometown', searchParams.city)
  }

  if (searchParams.unit) {
    query = query.eq('military_unit', searchParams.unit)
  }

  // No limit for carousel - load all heroes for random rotation
  // Filtered results will show all matches

  const { data: fallen, error: fallenError } = await query

  const { count: usersCount, error: usersError } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('is_deleted', false)

  if (fallenError) {
    console.error('Error fetching fallen:', fallenError)
  }

  if (usersError) {
    console.error('Error counting users:', usersError)
  }

  if (statsError) {
    console.error('Error fetching stats:', statsError)
  }

  if (countError) {
    console.error('Error counting fallen:', countError)
  }

  // Filtered list for display
  const fallenList = (fallen || []) as Fallen[]

  // Statistics (UNFILTERED - always shows total)
  const totalHeroesCount = totalFallenCount ?? 0
  const uniqueHometownsCount = new Set(
    (allFallenForStats || []).map((item) => item.hometown).filter(Boolean),
  ).size
  const activeUsersCount = usersCount ?? 0

  return (
    <div className="container py-8 md:py-12">
      {/* Hero Section */}
      <section className="mb-8 text-center sm:mb-12">
        <div className="mx-auto max-w-3xl px-4">
          {/* Logo */}
          <div className="mb-4 flex justify-center sm:mb-6">
            <img
              src="/images/logotype.webp"
              alt="Память героев"
              className="h-32 w-auto object-contain sm:h-40 md:h-48"
            />
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:mb-4 sm:text-4xl md:text-5xl">
            Память героев
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
            Цифровой мемориал собирает истории павших защитников, чтобы память
            жила в каждом доме и оставалась частью нашей общей истории. Страна обязана знать и помнить своих Героев.
          </p>

          {/* Акцентный маркер раздела */}
          <div className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-ribbon-gradient sm:mt-6 sm:h-2 sm:w-32" />
        </div>
      </section>

      {/* Stats */}
      <section className="mb-8 sm:mb-12">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 text-center sm:p-6">
            <div className="text-2xl font-bold text-primary sm:text-3xl">{totalHeroesCount}</div>
            <div className="mt-1 text-xs text-muted-foreground sm:text-sm">героев в мемориале</div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center sm:p-6">
            <div className="text-2xl font-bold text-primary sm:text-3xl">{uniqueHometownsCount}</div>
            <div className="mt-1 text-xs text-muted-foreground sm:text-sm">городов уже поделились историями</div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center sm:p-6">
            <div className="text-2xl font-bold text-primary sm:text-3xl">{activeUsersCount}</div>
            <div className="mt-1 text-xs text-muted-foreground sm:text-sm">зарегистрированных пользователей</div>
          </div>
        </div>
      </section>

      {/* Memorial Calendar - Помним сегодня */}
      <section className="mb-8 sm:mb-12">
        <MemorialCalendar />
      </section>

      {/* Filter */}
      <section className="mb-8">
        <HeroesFilter
          initialSearch={searchParams.search}
          initialCity={searchParams.city}
          initialUnit={searchParams.unit}
          availableUnits={uniqueUnits}
        />
      </section>

      {/* Cards Grid / Animated Carousel */}
      <section>
        <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold sm:text-2xl">
            {hasActiveFilters ? 'Результаты поиска' : 'Истории памяти'}
          </h2>
          {hasActiveFilters && fallenList.length > 0 && (
            <p className="text-xs text-muted-foreground sm:text-sm">
              Найдено: {fallenList.length}
            </p>
          )}
        </div>

        {fallenList.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center sm:p-12">
            <p className="text-base text-muted-foreground sm:text-lg">
              {hasActiveFilters
                ? 'По вашему запросу ничего не найдено.'
                : 'Здесь пока нет опубликованных историй.'}
            </p>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              {hasActiveFilters
                ? 'Попробуйте изменить параметры поиска или сбросить фильтры.'
                : 'Поделитесь историей своей семьи, и она станет частью живого мемориала.'}
            </p>
          </div>
        ) : hasActiveFilters ? (
          // Filtered list view
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {fallenList.map((fallen) => (
              <FallenCard key={fallen.id} fallen={fallen} />
            ))}
          </div>
        ) : (
          // Animated carousel view
          <AnimatedHeroesCarousel heroes={fallenList} maxVisible={4} rotationInterval={3000} />
        )}
      </section>

      {/* Hero Mosaic Section */}
      {!hasActiveFilters && fallenList.length > 0 && (
        <section className="mt-12 sm:mt-16">
          <div className="mb-6 text-center sm:mb-8">
            <h2 className="mb-2 text-2xl font-bold tracking-tight sm:mb-3 sm:text-3xl md:text-4xl">
              Лица Героев
            </h2>
            <p className="mx-auto max-w-2xl px-4 text-xs leading-relaxed text-muted-foreground sm:text-sm md:text-base">
              Интерактивная стена памяти. Каждое фото — это история жизни и подвига.
              Нажмите на фотографию, чтобы узнать больше о герое.
            </p>
            <div className="mx-auto mt-3 h-0.5 w-20 rounded-full bg-ribbon-gradient sm:mt-4 sm:h-1 sm:w-24" />
          </div>

          <HeroMosaic
            heroes={fallenList}
            gridSize={24}
            rotationInterval={3000}
          />
        </section>
      )}

      {/* CTA Section */}
      <section className="relative mt-12 overflow-hidden rounded-2xl border border-border/60 bg-surface/80 p-6 text-center shadow-soft transition-colors sm:mt-16 sm:rounded-3xl sm:p-8 md:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-80 mix-blend-soft-light"
          aria-hidden="true"
        >
          <div className="h-full w-full bg-[radial-gradient(circle_at_15%_10%,hsl(var(--glow)/0.25),transparent_45%),radial-gradient(circle_at_80%_0%,hsl(var(--primary)/0.18),transparent_45%),radial-gradient(circle_at_50%_95%,hsl(var(--secondary)/0.2),transparent_60%)]" />
        </div>

        <div className="relative mx-auto max-w-3xl space-y-3 text-balance sm:space-y-4">
          <h2 className="font-serif text-xl font-semibold text-foreground sm:text-2xl md:text-3xl">
            Помогите сохранить память
          </h2>
          <p className="mx-auto text-xs leading-relaxed text-foreground/70 sm:text-sm md:text-base">
            Если ваш родственник погиб в ходе СВО, вы можете создать карточку памяти. Это поможет
            сохранить историю героя и передать её будущим поколениям.
          </p>
          <a
            href="/fallen/create"
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-xs font-semibold uppercase tracking-[0.15em] text-primary-foreground shadow-glow ring-offset-background transition-all hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-11 sm:px-8 sm:text-sm sm:tracking-[0.2em]"
          >
            Создать карточку героя
          </a>
        </div>
      </section>
    </div>
  )
}
