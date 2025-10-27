import Image from 'next/image'
import { notFound } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Award as AwardIcon, CalendarDays, Flame, MapPin, MessageCircle, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getFullName } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Markdown } from '@/components/ui/markdown'
import { TimelineWithForm } from '@/components/fallen/TimelineWithForm'
import { MemoryGallery } from '@/components/fallen/MemoryGallery'
import { MemoryBoard } from '@/components/fallen/MemoryBoard'
import { AwardsSection } from '@/components/fallen/AwardsSection'
import { Comments } from '@/components/fallen/Comments'
import type {
  Award,
  CommentWithAuthor,
  Fallen,
  MemoryItem,
  MemoryItemWithDetails,
  MemoryAddition,
  TimelineItem,
  FallenAwardWithDetails,
} from '@/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

type CommentRecord = CommentWithAuthor & { replies?: CommentWithAuthor[] }

const DATE_FORMAT = 'dd MMMM yyyy'

const safeFormatDate = (value: string | null, pattern: string = DATE_FORMAT) => {
  if (!value) return '—'
  try {
    return format(typeof value === 'string' ? parseISO(value) : value, pattern, {
      locale: ru,
    })
  } catch {
    return '—'
  }
}

const countNestedComments = (items: CommentRecord[]): number =>
  items.reduce(
    (acc, item) =>
      acc +
      1 +
      (item.replies && item.replies.length > 0 ? countNestedComments(item.replies) : 0),
    0,
  )

export default async function FallenDetailPage({ params }: PageProps) {
  const { id } = params
  const supabase = await createClient()

  const { data: fallen, error } = await supabase
    .from('fallen')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single()

  if (error || !fallen || fallen.status !== 'approved') {
    notFound()
  }

  const fallData = fallen as Fallen
  const fullName = getFullName(fallData.last_name, fallData.first_name, fallData.middle_name)
  const birthYear = fallData.birth_date ? new Date(fallData.birth_date).getFullYear() : null
  const deathYear = fallData.death_date ? new Date(fallData.death_date).getFullYear() : null
  const lifespan =
    birthYear && deathYear
      ? `${birthYear} — ${deathYear}`
      : birthYear
        ? `${birthYear} —`
        : deathYear
          ? `— ${deathYear}`
          : '—'

  const { data: timelineItems } = await supabase
    .from('timeline_items')
    .select(`
      *,
      media:fallen_media(*)
    `)
    .eq('fallen_id', id)
    .eq('status', 'approved')
    .eq('is_deleted', false)
    .order('year', { ascending: true })
    .order('date_exact', { ascending: true })

  const { data: memoryItems } = await supabase
    .from('memory_items')
    .select('*')
    .eq('fallen_id', id)
    .eq('status', 'approved')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  // Загрузка воспоминаний с полной детализацией для доски памяти
  const { data: memoryItemsDetailed } = await supabase
    .from('memory_items')
    .select(
      `
      *,
      author:users!memory_items_created_by_fkey(id, full_name, avatar_url)
    `,
    )
    .eq('fallen_id', id)
    .eq('status', 'approved')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  // Загрузка дополнений к воспоминаниям
  const memoryIds = (memoryItemsDetailed || []).map((m: any) => m.id)
  const { data: memoryAdditions } = memoryIds.length > 0
    ? await supabase
        .from('memory_additions')
        .select(
          `
          *,
          author:users!memory_additions_created_by_fkey(id, full_name, avatar_url)
        `,
        )
        .in('memory_item_id', memoryIds)
        .eq('status', 'approved')
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
    : { data: [] as any[] }

  const { data: comments } = await supabase
    .from('comments')
    .select(
      `
      *,
      author:users!comments_author_id_fkey(id, full_name, avatar_url)
    `,
    )
    .eq('fallen_id', id)
    .eq('is_deleted', false)
    .eq('is_hidden', false)
    .order('created_at', { ascending: true })

  // Загрузка комментариев к воспоминаниям и дополнениям
  const additionIds = (memoryAdditions || []).map((a: any) => a.id)
  const allEntityIds = [...memoryIds, ...additionIds]
  const { data: memoryComments } = allEntityIds.length > 0
    ? await supabase
        .from('comments')
        .select(
          `
          *,
          author:users!comments_author_id_fkey(id, full_name, avatar_url)
        `,
        )
        .or(
          memoryIds.length > 0 && additionIds.length > 0
            ? `memory_item_id.in.(${memoryIds.join(',')}),memory_addition_id.in.(${additionIds.join(',')})`
            : memoryIds.length > 0
              ? `memory_item_id.in.(${memoryIds.join(',')})`
              : `memory_addition_id.in.(${additionIds.join(',')})`,
        )
        .eq('is_deleted', false)
        .eq('is_hidden', false)
        .order('created_at', { ascending: true })
    : { data: [] as any[] }

  // Собираем все media_ids из воспоминаний и дополнений
  const allMediaIds = [
    ...(memoryItemsDetailed || [])
      .filter((m: any) => m.media_ids && Array.isArray(m.media_ids))
      .flatMap((m: any) => m.media_ids),
    ...(memoryAdditions || [])
      .filter((a: any) => a.media_ids && Array.isArray(a.media_ids))
      .flatMap((a: any) => a.media_ids),
  ]

  // Загрузка медиафайлов
  const { data: mediaFiles } = allMediaIds.length > 0
    ? await supabase
        .from('fallen_media')
        .select('*')
        .in('id', allMediaIds)
        .eq('is_deleted', false)
        .eq('status', 'approved')
    : { data: [] as any[] }

  // Создаём мапу медиафайлов по ID для быстрого доступа
  const mediaMap = new Map((mediaFiles || []).map((m) => [m.id, m]))

  // Загрузка ВСЕХ фотографий для галереи (fallen_media напрямую связанные с fallen)
  const { data: allGalleryPhotos } = await supabase
    .from('fallen_media')
    .select('*')
    .eq('fallen_id', id)
    .eq('is_deleted', false)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  // Загрузка наград героя
  const { data: fallenAwardsData } = await supabase
    .from('fallen_awards')
    .select(`
      *,
      award:awards(*)
    `)
    .eq('fallen_id', id)
    .eq('status', 'approved')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  const fallenAwards: FallenAwardWithDetails[] = (fallenAwardsData || [])
    .filter((fa) => fa.award)
    .map((fa) => ({
      ...fa,
      award: fa.award as Award,
    }))
    .sort((a, b) => (b.award.sort_order || 0) - (a.award.sort_order || 0))

  // Загрузка всех доступных наград для выбора
  const { data: allAwardsData } = await supabase
    .from('awards')
    .select('*')
    .order('sort_order', { ascending: false })

  const availableAwards: Award[] = allAwardsData || []

  const buildCommentsTree = (flatComments: CommentWithAuthor[] = []): CommentRecord[] => {
    const map = new Map<string, CommentRecord>()
    const roots: CommentRecord[] = []

    flatComments.forEach((comment) => {
      map.set(comment.id, { ...comment, replies: [] })
    })

    flatComments.forEach((comment) => {
      const node = map.get(comment.id)!
      if (comment.parent_id) {
        const parent = map.get(comment.parent_id)
        if (parent) {
          parent.replies = parent.replies || []
          parent.replies.push(node)
        }
      } else {
        roots.push(node)
      }
    })

    return roots
  }

  const timeline = (timelineItems || []) as TimelineItem[]
  const memories = (memoryItems || []) as MemoryItem[]
  const commentsTree = buildCommentsTree(comments || [])

  // Построение структуры данных для доски памяти
  const memoriesWithDetails: MemoryItemWithDetails[] = (memoryItemsDetailed || []).map(
    (memory: any) => {
      const memoryAdditionsForItem = (memoryAdditions || [])
        .filter((add: any) => add.memory_item_id === memory.id)
        .map((add: any) => {
          const additionComments = (memoryComments || [])
            .filter((c: any) => c.memory_addition_id === add.id)
            .map((c: any) => c as CommentWithAuthor)
          return {
            ...add,
            comments: buildCommentsTree(additionComments),
            media: (add.media_ids || []).map((id: string) => mediaMap.get(id)).filter(Boolean),
          }
        })

      const itemComments = (memoryComments || [])
        .filter((c: any) => c.memory_item_id === memory.id)
        .map((c: any) => c as CommentWithAuthor)

      return {
        ...memory,
        additions: memoryAdditionsForItem,
        comments: buildCommentsTree(itemComments),
        media: (memory.media_ids || []).map((id: string) => mediaMap.get(id)).filter(Boolean),
      } as MemoryItemWithDetails
    },
  )

  const stats = [
    {
      label: 'Годы жизни',
      value: lifespan,
      icon: CalendarDays,
    },
    {
      label: 'Хроника событий',
      value: timeline.length,
      icon: Flame,
    },
    {
      label: 'Галерея памяти',
      value: memories.length,
      icon: Flame,
    },
    {
      label: 'Отзывы и воспоминания',
      value: countNestedComments(commentsTree),
      icon: MessageCircle,
    },
  ]

  const profileDetails = [
    {
      label: 'Звание',
      value: fallData.rank,
      icon: Shield,
    },
    {
      label: 'Подразделение',
      value: fallData.military_unit,
      icon: AwardIcon,
    },
    {
      label: 'Позывной',
      value: fallData.call_sign,
      icon: Flame,
    },
    {
      label: 'Дата рождения',
      value: safeFormatDate(fallData.birth_date),
      icon: CalendarDays,
    },
    {
      label: 'Дата гибели',
      value: safeFormatDate(fallData.death_date),
      icon: CalendarDays,
    },
    {
      label: 'Родной город',
      value: fallData.hometown,
      icon: MapPin,
    },
    {
      label: 'Место захоронения',
      value: fallData.burial_location,
      icon: MapPin,
    },
    {
      label: 'Дата добавления',
      value: safeFormatDate(fallData.created_at),
      icon: CalendarDays,
    },
  ].filter((item) => Boolean(item.value && `${item.value}`.trim().length > 0))

  return (
    <div className="container space-y-12 py-10 md:space-y-16 md:py-16">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface/80 px-6 py-8 shadow-soft transition-colors md:px-12 md:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80 mix-blend-soft-light"
          style={{
            backgroundImage:
              'radial-gradient(circle at 10% 10%, hsla(var(--glow), 0.3), transparent 40%), radial-gradient(circle at 80% 0%, hsla(var(--primary), 0.22), transparent 45%), radial-gradient(circle at 50% 100%, hsla(var(--secondary), 0.2), transparent 60%)',
          }}
        />

        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,360px)_1fr] lg:items-start">
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-background-soft/80 shadow-glow">
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
              {fallData.hero_photo_url ? (
                <Image
                  src={fallData.hero_photo_url}
                  alt={fullName}
                  width={720}
                  height={960}
                  className="h-full w-full object-cover"
                  priority
                />
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--surface)/0.85),hsl(var(--background-soft)/0.65))]">
                  <span className="text-6xl font-semibold tracking-wide text-foreground/20">
                    {fallData.first_name[0]}
                    {fallData.last_name[0]}
                  </span>
                </div>
              )}
            </div>

            {fallData.is_demo && (
              <Badge
                variant="secondary"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary/15 text-sm font-medium text-primary"
              >
                Демонстрационная карточка
              </Badge>
            )}
          </div>

          <div className="flex flex-col gap-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/70 px-4 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <Flame className="h-4 w-4 text-primary" />
                Цифровой мемориал
              </div>
              <div className="space-y-2">
                <h1 className="text-balance font-serif text-4xl font-semibold leading-tight md:text-5xl">
                  {fullName}
                </h1>
                <p className="text-lg text-muted-foreground">{lifespan}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {stats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={stat.label}
                      className="flex items-center gap-3 rounded-2xl border border-border/50 bg-background/60 px-4 py-3 text-sm transition-colors"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {stat.label}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {typeof stat.value === 'number' ? stat.value : stat.value || '—'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {profileDetails.length > 0 && (
              <Card className="border border-border/50 bg-background/70 shadow-soft">
                <CardHeader className="pb-4">
                  <CardTitle>Профиль героя</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  {profileDetails.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="flex items-start gap-3">
                        <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {item.label}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Секция наград - показываем всегда, чтобы была доступна кнопка добавления */}
      <AwardsSection
        awards={fallenAwards}
        fallenId={id}
        availableAwards={availableAwards}
      />

      {fallData.memorial_text && (
        <section className="grid gap-6 lg:grid-cols-[1fr_minmax(0,320px)]">
          <Card className="border border-border/50 bg-background/70 shadow-soft">
            <CardHeader>
              <CardTitle>Слова памяти</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed text-foreground/80">
                {fallData.memorial_text}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-primary/30 bg-gradient-to-br from-primary/10 via-background/60 to-background-soft/80 shadow-glow">
            <CardContent className="flex h-full flex-col justify-between gap-6 py-6">
              <div className="space-y-3">
                <Badge variant="secondary" className="inline-flex w-max items-center gap-2 bg-primary text-primary-foreground">
                  <Flame className="h-4 w-4" />
                  Огонь памяти
                </Badge>
                <p className="text-sm text-primary/90">
                  Оставьте своё воспоминание, чтобы имя героя звучало вечно. Истории близких
                  помогают оживить хронику и вдохновляют новые поколения.
                </p>
              </div>
              <a
                href={`/fallen/${id}#comments`}
                className="inline-flex items-center justify-center rounded-full border border-primary/40 bg-primary/20 px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary/30"
              >
                Оставить воспоминание
              </a>
            </CardContent>
          </Card>
        </section>
      )}

      {fallData.biography_md && (
        <section>
          <Card className="border border-border/50 bg-background/70 shadow-soft">
            <CardHeader>
              <CardTitle>Биография</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-memorial max-w-none text-foreground/90 prose-p:text-foreground/80 prose-headings:text-foreground">
              <Markdown content={fallData.biography_md} />
            </CardContent>
          </Card>
        </section>
      )}

      <section>
        <TimelineWithForm items={timeline} fallenId={id} />
      </section>

      <section>
        <MemoryBoard memories={memoriesWithDetails} fallenId={id} />
      </section>

      <section>
        <Card className="border border-border/50 bg-background/80 shadow-soft backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground">Галерея памяти</CardTitle>
          </CardHeader>
          <CardContent>
            <MemoryGallery photos={allGalleryPhotos || []} fallenId={id} />
          </CardContent>
        </Card>
      </section>

      <section >
        <Card className="border border-border/50 bg-background/80 shadow-soft backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Свидетельства близких</CardTitle>
          </CardHeader>
          <CardContent>
            <Comments comments={commentsTree} fallenId={id} />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
