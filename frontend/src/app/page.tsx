import { createClient } from '@/lib/supabase/server'
import { FallenCard } from '@/components/fallen/FallenCard'
import { Fallen } from '@/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: fallen, error: fallenError } = await supabase
    .from('fallen')
    .select('*')
    .eq('status', 'approved')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(12)

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

  const fallenList = (fallen || []) as Fallen[]
  const uniqueHometownsCount = new Set(
    fallenList.map((item) => item.hometown).filter(Boolean),
  ).size

  const activeUsersCount = usersCount ?? 0

  return (
    <div className="container py-8 md:py-12">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Память героев
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            Цифровой мемориал собирает истории павших защитников, чтобы память
            жила в каждом доме и оставалась частью нашей общей истории.
          </p>

          {/* Акцентный маркер раздела */}
          <div className="mx-auto mt-6 h-2 w-32 rounded-full bg-ribbon-gradient" />
        </div>
      </section>

      {/* Stats */}
      <section className="mb-12">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 text-center">
            <div className="text-3xl font-bold text-primary">{fallenList.length}</div>
            <div className="mt-1 text-sm text-muted-foreground">карточек памяти в базе</div>
          </div>
          <div className="rounded-lg border bg-card p-6 text-center">
            <div className="text-3xl font-bold text-primary">{uniqueHometownsCount}</div>
            <div className="mt-1 text-sm text-muted-foreground">городов уже поделились историями</div>
          </div>
          <div className="rounded-lg border bg-card p-6 text-center">
            <div className="text-3xl font-bold text-primary">{activeUsersCount}</div>
            <div className="mt-1 text-sm text-muted-foreground">зарегистрированных пользователей</div>
          </div>
        </div>
      </section>

      {/* Cards Grid */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Последние истории</h2>
          {/* TODO: добавить фильтры и поиск по героям */}
        </div>

        {fallenList.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-lg text-muted-foreground">
              Здесь пока нет опубликованных историй.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Поделитесь историей своей семьи, и она станет частью живого мемориала.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {fallenList.map((fallen) => (
              <FallenCard key={fallen.id} fallen={fallen} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="relative mt-16 overflow-hidden rounded-3xl border border-border/60 bg-surface/80 p-8 text-center shadow-soft transition-colors md:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-80 mix-blend-soft-light"
          aria-hidden="true"
        >
          <div className="h-full w-full bg-[radial-gradient(circle_at_15%_10%,hsl(var(--glow)/0.25),transparent_45%),radial-gradient(circle_at_80%_0%,hsl(var(--primary)/0.18),transparent_45%),radial-gradient(circle_at_50%_95%,hsl(var(--secondary)/0.2),transparent_60%)]" />
        </div>

        <div className="relative mx-auto max-w-3xl space-y-4 text-balance">
          <h2 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
            Помогите сохранить память
          </h2>
          <p className="mx-auto text-sm leading-relaxed text-foreground/70 md:text-base">
            Если ваш родственник погиб в ходе СВО, вы можете создать карточку памяти. Это поможет
            сохранить историю героя и передать её будущим поколениям.
          </p>
          <a
            href="/fallen/create"
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground shadow-glow ring-offset-background transition-all hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Создать карточку героя
          </a>
        </div>
      </section>
    </div>
  )
}
