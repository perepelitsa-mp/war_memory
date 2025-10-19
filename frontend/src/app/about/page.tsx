import Link from "next/link"

import { Flame, HeartHandshake, MapPin, PenSquare, Share2, Users } from "lucide-react"

import { Button } from "@/components/ui/button"

const missionHighlights = [
  {
    title: "Голоса семей",
    description:
      "Здесь звучат истории родителей, супругов, детей и друзей, которые делятся памятью о своих героях.",
  },
  {
    title: "Домашние архивы",
    description:
      "Фотографии, переписка и тёплые слова хранятся в одном месте, чтобы их могли увидеть родные и потомки.",
  },
  {
    title: "Карта памяти",
    description:
      "Интерактивная карта помогает отмечать места службы, прощаний и памятные точки, связанные с вашим близким.",
  },
]

const opportunities = [
  {
    title: "Создавайте историю героя",
    description:
      "За несколько шагов добавьте карточку близкого: фото, любимые фразы, семейные истории и знаки отличия.",
    icon: PenSquare,
  },
  {
    title: "Делитесь важными датами",
    description:
      "Фиксируйте дни службы, прощания и памятные события, чтобы другие знали, как жил и что любил ваш герой.",
    icon: Flame,
  },
  {
    title: "Добавляйте семейные истории",
    description:
      "Расскажите о встречах, письмах, привычках и маленьких деталях, которые делают человека живым в памяти.",
    icon: Share2,
  },
  {
    title: "Будьте рядом с сообществом",
    description:
      "Читайте истории других семей, оставляйте слова поддержки и находите тех, кто пережил похожий путь.",
    icon: Users,
  },
  {
    title: "Отмечайте места памяти",
    description:
      "Указывайте на карте места захоронений, мемориальных плит и точек, куда можно прийти, чтобы почтить память.",
    icon: MapPin,
  },
  {
    title: "Сохраняйте семейные ценности",
    description:
      "Загружайте сканы писем, дневников и фронтовых открыток — мы аккуратно сохраним их в цифровом формате.",
    icon: HeartHandshake,
  },
]

const timeline = [
  {
    year: "2023",
    title: "Первые семейные рассказы",
    description:
      "Мы услышали десятки историй от родных и друзей и поняли, как важно создать место для каждого героя.",
  },
  {
    year: "2024",
    title: "Сообщество поддержки",
    description:
      "Появились онлайн-встречи, тёплые чаты и волонтёры, которые помогают оформлять и проверять рассказы.",
  },
  {
    year: "2025",
    title: "Открытая платформа",
    description:
      "Сайт стал доступен всем: запустили карту памяти, хронику событий и простые инструменты для публикации семейных историй.",
  },
]

const team = [
  {
    name: "Анна Петрова",
    role: "Куратор историй",
    bio: "Помогает семьям оформить воспоминания, подсказывает, с чего начать рассказ и бережно редактирует тексты.",
  },
  {
    name: "Игорь Смирнов",
    role: "Координатор волонтёров",
    bio: "Связывает волонтёров и семьи, помогает искать данные о службе и отвечает за работу линии поддержки.",
  },
  {
    name: "Людмила Орлова",
    role: "Дизайнер и автор интерфейсов",
    bio: "Придумывает, как сделать публикацию истории простой даже для тех, кто впервые делится воспоминаниями онлайн.",
  },
  {
    name: "Сергей Власов",
    role: "Ведущий разработчик",
    bio: "Заботится о технической стороне сайта, чтобы истории близких людей надёжно хранились и были доступны семье.",
  },
]

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_hsl(var(--glow)/0.28),_transparent_55%),radial-gradient(circle_at_bottom_right,_hsl(var(--primary)/0.22),_transparent_50%)]" />
      <div className="container space-y-16 py-16 md:space-y-20 md:py-24">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface/80 px-6 py-12 shadow-soft md:px-12">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,_hsl(var(--primary)/0.25),_transparent_45%),radial-gradient(circle_at_80%_0%,_hsl(var(--glow)/0.2),_transparent_45%),radial-gradient(circle_at_60%_100%,_rgba(26,26,26,0.25),_transparent_60%)] opacity-80 mix-blend-soft-light" />
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
            <div className="space-y-6 text-balance">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-1 text-xs font-medium uppercase tracking-[0.35em] text-primary">
                Платформа памяти
              </p>
              <div className="space-y-4">
                <h1 className="font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                  Цифровой мемориал в честь героев СВО
                </h1>
                <p className="text-lg text-foreground/75 md:text-xl">
                  Мы объединяем рассказы родных и друзей, чтобы каждый мог рассказать о своём герое, сохранить тёплые слова,
                  фотографии и места памяти.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/fallen/new">Создать карточку памяти</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border/60 text-foreground/80 hover:bg-background/60"
                  asChild
                >
                  <Link href="/map">Просмотреть карту памяти</Link>
                </Button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-primary/20 via-transparent to-background shadow-glow">
              <div className="aspect-[4/3] w-full bg-[radial-gradient(circle_at_20%_20%,_rgba(255,127,0,0.35),_transparent_55%),radial-gradient(circle_at_70%_30%,_rgba(244,185,90,0.28),_transparent_50%),radial-gradient(circle_at_80%_90%,_rgba(17,28,40,0.4),_transparent_60%)]" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/40 to-transparent px-6 pb-6 pt-12 text-sm text-foreground/70">
                «Память — мост между поколениями. Мы строим его вместе» — сообщество мемориала
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_1.2fr]">
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">Для чего создан проект</h2>
            <p className="text-lg leading-relaxed text-foreground/75">
              «Память героев» — это место, где близкие могут рассказать о тех, кого больше нет рядом. Здесь делятся тем, что
              обычно хранится в семейных альбомах: любимыми историями, радостными моментами и словами поддержки.
            </p>
            <p className="text-lg leading-relaxed text-foreground/75">
              Мы помогаем сохранить память простым и ясным языком: подскажем, как оформить рассказ, как добавить фото и
              отметить важные места. Проект живёт благодаря людям, которые делятся своей болью и любовью.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {missionHighlights.map((item) => (
              <div
                key={item.title}
                className="relative overflow-hidden rounded-3xl border border-border/50 bg-background/70 p-6 shadow-soft"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-glow/10 opacity-60" />
                <div className="relative space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-foreground/70">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Opportunities */}
        <section className="space-y-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Что вы можете сделать</p>
              <h2 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">Пути участия</h2>
            </div>
            <Link href="/fallen/new" className="text-sm font-medium text-primary hover:text-primary/80">
              Присоединиться к сообществу
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {opportunities.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-3xl border border-border/50 bg-background/70 p-6 shadow-soft transition hover:-translate-y-1 hover:border-primary/40"
                >
                  <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-foreground/70">{item.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Timeline */}
        <section className="space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">Путь проекта</h2>
            <p className="max-w-2xl text-sm text-foreground/65">
              Мы развиваемся вместе с семьями, слушаем их истории и постоянно делаем площадку удобнее для тех, кто хочет
              поделиться памятью.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="absolute inset-y-8 left-6 w-px bg-gradient-to-b from-primary/60 via-border to-primary/40" />
            <div className="space-y-12 pl-16">
              {timeline.map((item) => (
                <div key={item.year} className="relative">
                  <div className="absolute left-[-3.25rem] top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary/50 bg-background">
                    <span className="text-sm font-semibold text-primary">{item.year}</span>
                  </div>
                  <div className="space-y-3 rounded-2xl border border-border/50 bg-background/70 p-6 shadow-soft">
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-foreground/70">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Люди проекта</p>
              <h2 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">Команда мемориала</h2>
            </div>
            <p className="max-w-xl text-sm text-foreground/65">
              Нас объединяют желание поддержать семьи и вера в то, что рассказы о героях должны звучать громче и теплее.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-3xl border border-border/50 bg-background/70 p-6 shadow-soft transition hover:-translate-y-1 hover:border-primary/40"
              >
                <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary/80">{member.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/70">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface/80 p-10 shadow-glow text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_hsl(var(--primary)/0.25),_transparent_40%),radial-gradient(circle_at_80%_20%,_hsl(var(--glow)/0.2),_transparent_45%)] blur-2xl" />
          <div className="relative space-y-4">
            <h2 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">Присоединяйтесь к хранителям памяти</h2>
            <p className="mx-auto max-w-2xl text-sm text-foreground/70">
              Расскажите о своём герое, поддержите других и помогите сохранить память о людях, которые для нас — больше чем
              строки в учебниках. Вместе мы делаем историю человечной.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/register">Стать участником проекта</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border/60 text-foreground/80 hover:bg-background/60"
                asChild
              >
                <Link href="/contact">Связаться с командой</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
