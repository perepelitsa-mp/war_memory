import { notFound } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarDays, Flame, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getFullName } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimelineWithForm } from '@/components/fallen/TimelineWithForm'
import { MemoryGallery } from '@/components/fallen/MemoryGallery'
import { MemoryBoard } from '@/components/fallen/MemoryBoard'
import { AwardsSection } from '@/components/fallen/AwardsSection'
import { Comments } from '@/components/fallen/Comments'
import { MemorialTextSection } from '@/components/fallen/MemorialTextSection'
import { BiographySection } from '@/components/fallen/BiographySection'
import { ModeratorsSection } from '@/components/fallen/ModeratorsSection'
import { ProfileEditorNew as ProfileEditor } from '@/components/fallen/ProfileEditorNew'
import { HeroProfileCard } from '@/components/fallen/HeroProfileCard'
import { CandleLightsList } from '@/components/fallen/CandleLightsList'
import { HeroConnections } from '@/components/fallen/HeroConnections'
import { ConnectionModeration } from '@/components/fallen/ConnectionModeration'
import { FlowersList } from '@/components/fallen/FlowersList'
import { CondolenceBook } from '@/components/fallen/CondolenceBook'
import { CondolenceModeration } from '@/components/fallen/CondolenceModeration'
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

const getServiceTypeLabel = (serviceType: string | null) => {
  if (!serviceType) return null
  const labels: Record<string, string> = {
    mobilized: 'Мобилизован',
    volunteer: 'Доброволец',
    pmc: 'ЧВК',
    professional: 'Кадровый военнослужащий',
  }
  return labels[serviceType] || serviceType
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

  // Получаем информацию о текущем пользователе
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const { data: currentUserData } = currentUser
    ? await supabase.from('users').select('role').eq('id', currentUser.id).single()
    : { data: null }

  // Получаем информацию о владельце карточки
  const { data: ownerData } = await supabase
    .from('users')
    .select('id, full_name, email, phone, avatar_url')
    .eq('id', fallData.owner_id)
    .single()

  // Получаем информацию о редакторах
  const editorIds = Array.isArray(fallData.editors) ? fallData.editors : []
  const { data: editorsData } = editorIds.length > 0
    ? await supabase
        .from('users')
        .select('id, full_name, email, phone, avatar_url')
        .in('id', editorIds)
    : { data: [] }

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

  // Загрузка зажжённых свечей памяти
  const { data: candleLightsData } = await supabase
    .from('candle_lights')
    .select(
      `
      id,
      created_at,
      user:users!candle_lights_user_id_fkey(id, full_name, avatar_url)
    `
    )
    .eq('fallen_id', id)
    .order('created_at', { ascending: false })
    .limit(20) // Показываем последние 20 зажжённых свечей

  const candleLights = candleLightsData || []
  const candleCount = candleLights.length
  const currentUserLitCandle = currentUser
    ? candleLights.some((cl: any) => cl.user?.id === currentUser.id)
    : false

  // Загрузка связей героя (родственники, друзья, сослуживцы)
  const { data: connectionsData } = await supabase
    .from('hero_connections')
    .select(
      `
      id,
      connection_type,
      relationship,
      user:users!hero_connections_user_id_fkey(id, full_name, avatar_url, bio)
    `
    )
    .eq('fallen_id', id)
    .eq('status', 'approved')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  const allConnections = connectionsData || []
  const relatives = allConnections.filter((c: any) => c.connection_type === 'relative')
  const friends = allConnections.filter((c: any) => c.connection_type === 'friend')
  const fellowSoldiers = allConnections.filter((c: any) => c.connection_type === 'fellow_soldier')

  // Загрузка виртуальных цветов
  const { data: flowersData } = await supabase
    .from('virtual_flowers')
    .select(
      `
      id,
      flower_type,
      flower_color,
      flower_count,
      message,
      created_at,
      user:users!virtual_flowers_user_id_fkey(id, full_name, avatar_url)
    `
    )
    .eq('fallen_id', id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  const flowers = flowersData || []
  const totalFlowers = flowers.reduce((sum, flower) => sum + (flower.flower_count || 1), 0)

  // Загрузка соболезнований
  const { data: condolencesData } = await supabase
    .from('condolences')
    .select(
      `
      id,
      content,
      relationship_to_hero,
      status,
      created_at,
      author:users!condolences_author_id_fkey(id, full_name, avatar_url)
    `
    )
    .eq('fallen_id', id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  // Разделяем на одобренные и pending
  const allCondolences = condolencesData || []
  const approvedCondolences = allCondolences.filter((c: any) => c.status === 'approved')
  const pendingCondolencesForOwner = allCondolences.filter((c: any) => c.status === 'pending')

  // Если текущий пользователь - автор, добавляем его pending соболезнования
  const userPendingCondolences = currentUser
    ? pendingCondolencesForOwner.filter((c: any) => c.author?.id === currentUser.id)
    : []

  // Для отображения: показываем одобренные + свои pending
  const visibleCondolences = [...approvedCondolences, ...userPendingCondolences]

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
      value: (allGalleryPhotos || []).length,
      icon: Flame,
    },
    {
      label: 'Отзывы и воспоминания',
      value: countNestedComments(commentsTree),
      icon: MessageCircle,
    },
  ]

  // Check if user can edit fields
  const isOwner = currentUser?.id === fallData.owner_id
  const isEditor = currentUser?.id ? editorIds.includes(currentUser.id) : false
  const isModerator = ['moderator', 'admin', 'superadmin'].includes(currentUserData?.role || '')
  const canEditFields = isOwner || isEditor || isModerator

  // Загрузка связей на модерации (только для владельцев, редакторов и модераторов)
  let pendingConnections: any[] = []
  if (canEditFields) {
    const { data: pendingData } = await supabase
      .from('hero_connections')
      .select(
        `
        id,
        connection_type,
        relationship,
        description,
        created_at,
        user:users!hero_connections_user_id_fkey(id, full_name, avatar_url, bio)
      `
      )
      .eq('fallen_id', id)
      .eq('status', 'pending')
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    pendingConnections = pendingData || []
  }

  const profileDetails = [
    {
      label: 'Вид службы',
      value: getServiceTypeLabel(fallData.service_type),
      iconName: 'Shield' as const,
    },
    {
      label: 'Звание',
      value: fallData.rank,
      iconName: 'Shield' as const,
    },
    {
      label: 'Подразделение',
      value: fallData.military_unit,
      iconName: 'AwardIcon' as const,
    },
    {
      label: 'Позывной',
      value: (fallData as any).call_sign,
      iconName: 'Flame' as const,
    },
    {
      label: 'Дата рождения',
      value: safeFormatDate(fallData.birth_date),
      iconName: 'CalendarDays' as const,
    },
    {
      label: 'Дата гибели',
      value: safeFormatDate(fallData.death_date),
      iconName: 'CalendarDays' as const,
    },
    {
      label: 'Родной город',
      value: fallData.hometown,
      iconName: 'MapPin' as const,
    },
    {
      label: 'Место захоронения',
      value: fallData.burial_location,
      iconName: 'MapPin' as const,
    },
    {
      label: 'Дата добавления',
      value: safeFormatDate(fallData.created_at),
      iconName: 'CalendarDays' as const,
    },
  ].filter((item) => Boolean(item.value && `${item.value}`.trim().length > 0))

  return (
    <div className="container space-y-12 py-10 md:space-y-16 md:py-16">


      <section>
        <HeroProfileCard
          heroPhotoUrl={fallData.hero_photo_url}
          fullName={fullName}
          firstName={fallData.first_name}
          lastName={fallData.last_name}
          lifespan={lifespan}
          canEdit={canEditFields}
          fallenId={id}
          candleCount={candleCount}
          candleLit={currentUserLitCandle}
          totalFlowers={totalFlowers}
          isDemo={fallData.is_demo}
          profileDetails={profileDetails}
          birthDate={fallData.birth_date}
          deathDate={fallData.death_date}
          rank={fallData.rank}
          unit={fallData.military_unit}
        />
      </section>

      {/* Редактор профиля */}
      <section>
        <ProfileEditor
          fallenId={id}
          initialData={{
            first_name: fallData.first_name,
            last_name: fallData.last_name,
            middle_name: fallData.middle_name,
            birth_date: fallData.birth_date,
            death_date: fallData.death_date,
            service_type: fallData.service_type,
            service_start_date: fallData.service_start_date,
            service_end_date: fallData.service_end_date,
            rank: fallData.rank,
            military_unit: fallData.military_unit,
            vus_id: (fallData as any).vus_id,
            hometown: fallData.hometown,
            burial_location: fallData.burial_location,
          }}
          canEdit={canEditFields}
          burialCoordinates={(fallData as any).burial_coordinates as { lat: number; lng: number } | undefined}
        />
      </section>

      {/* Секция наград - показываем всегда, чтобы была доступна кнопка добавления */}
      <AwardsSection
        awards={fallenAwards}
        fallenId={id}
        availableAwards={availableAwards}
        canEdit={canEditFields}
      />

      <MemorialTextSection fallenId={id} memorialText={fallData.memorial_text} />

      <BiographySection fallenId={id} biographyMd={fallData.biography_md} />

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

      {/* Модерация соболезнований (только для владельцев, редакторов и модераторов) */}
      {canEditFields && pendingCondolencesForOwner.length > 0 && (
        <section>
          <CondolenceModeration
            fallenId={id}
            pendingCondolences={pendingCondolencesForOwner as any}
          />
        </section>
      )}

      {/* Книга соболезнований */}
      <section>
        <CondolenceBook
          fallenId={id}
          condolences={visibleCondolences as any}
          totalCount={approvedCondolences.length}
          canModerate={canEditFields}
        />
      </section>

      {/* Модерация связей (только для владельцев, редакторов и модераторов) */}
      {canEditFields && pendingConnections.length > 0 && (
        <section>
          <ConnectionModeration fallenId={id} pendingConnections={pendingConnections} />
        </section>
      )}

      {/* Связи героя: родственники, друзья, сослуживцы */}
      <section>
        <HeroConnections
          fallenId={id}
          relatives={relatives as any}
          friends={friends as any}
          fellowSoldiers={fellowSoldiers as any}
          canEdit={canEditFields}
        />
      </section>

      {/* Список зажжённых свечей памяти */}
      <section>
        <CandleLightsList lights={candleLights as any} totalCount={candleCount} />
      </section>

      {/* Список возложенных цветов */}
      <section>
        <FlowersList flowers={flowers as any} totalCount={totalFlowers} />
      </section>
      {ownerData && (
        <ModeratorsSection
          fallenId={id}
          owner={ownerData}
          editors={editorsData || []}
          currentUserId={currentUser?.id || null}
          currentUserRole={currentUserData?.role || 'guest'}
        />
      )}
    </div>
  )
}
