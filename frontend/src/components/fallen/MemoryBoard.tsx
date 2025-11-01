'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  BookHeart,
  CalendarClock,
  ImageIcon,
  LayoutGrid,
  List,
  ListFilter,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { MemoryCard } from './MemoryCard'
import { MemoryPreviewCard } from './MemoryPreviewCard'
import { AddMemoryForm } from './AddMemoryForm'
import { EditMemoryForm } from './EditMemoryForm'
import { AddCommentDialog } from './AddCommentDialog'
import { AddMemoryAdditionForm } from './AddMemoryAdditionForm'
import { cn } from '@/lib/utils'
import type { MemoryItemWithDetails } from '@/types'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
  { value: 'comments', label: 'Больше комментариев' },
  { value: 'additions', label: 'Больше дополнений' },
] as const

const SORT_DESCRIPTIONS: Record<SortOption, string> = {
  newest: 'Вверху списка отображаются самые свежие воспоминания',
  oldest: 'Вверху списка отображаются самые ранние записи',
  comments: 'Приоритет у воспоминаний с наибольшим числом комментариев',
  additions: 'Приоритет у воспоминаний с большим количеством дополнений',
}

type SortOption = (typeof SORT_OPTIONS)[number]['value']
type ViewMode = 'grid' | 'list'
type FilterKey = 'onlyWithMedia' | 'onlyWithAdditions' | 'onlyWithComments'

const FILTER_CONFIG: Record<FilterKey, { label: string; icon: LucideIcon }> = {
  onlyWithMedia: {
    label: 'Только с фото',
    icon: ImageIcon,
  },
  onlyWithAdditions: {
    label: 'С дополнениями',
    icon: Sparkles,
  },
  onlyWithComments: {
    label: 'С комментариями',
    icon: MessageCircle,
  },
}

const createDefaultFilters = (): Record<FilterKey, boolean> => ({
  onlyWithMedia: false,
  onlyWithAdditions: false,
  onlyWithComments: false,
})

const countApprovedAdditions = (memory: MemoryItemWithDetails) =>
  (memory.additions || []).filter(
    (addition) => addition.status === 'approved' && !addition.is_deleted
  ).length

const getTimestamp = (value?: string | null) => {
  if (!value) {
    return 0
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

const formatNumber = (value: number) => new Intl.NumberFormat('ru-RU').format(value)

interface MemoryBoardProps {
  memories: MemoryItemWithDetails[]
  fallenId: string
  className?: string
}

export function MemoryBoard({ memories, fallenId, className }: MemoryBoardProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [showAdditionForm, setShowAdditionForm] = useState(false)
  const [commentParentId, setCommentParentId] = useState<string | undefined>(undefined)
  const [commentEntityType, setCommentEntityType] = useState<'memory' | 'addition' | undefined>(
    undefined
  )
  const [commentEntityId, setCommentEntityId] = useState<string | undefined>(undefined)
  const [additionTargetId, setAdditionTargetId] = useState<string | undefined>(undefined)
  const [memoryForEdit, setMemoryForEdit] = useState<MemoryItemWithDetails | undefined>(undefined)
  const [viewMemory, setViewMemory] = useState<MemoryItemWithDetails | undefined>(undefined)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filters, setFilters] = useState<Record<FilterKey, boolean>>(() => createDefaultFilters())

  const approvedMemories = useMemo(
    () => (memories || []).filter((memory) => memory.status === 'approved' && !memory.is_deleted),
    [memories]
  )

  const stats = useMemo(() => {
    const total = approvedMemories.length
    const withMedia = approvedMemories.filter((memory) => (memory.media?.length ?? 0) > 0).length
    const additionsTotal = approvedMemories.reduce(
      (acc, memory) => acc + countApprovedAdditions(memory),
      0
    )
    const commentsTotal = approvedMemories.reduce(
      (acc, memory) => acc + (memory.comments?.length ?? 0),
      0
    )
    const latestTimestamp = approvedMemories.reduce<number | null>((latest, memory) => {
      const timestamp = getTimestamp(memory.updated_at ?? memory.created_at)
      if (!timestamp) {
        return latest
      }

      if (latest === null || timestamp > latest) {
        return timestamp
      }

      return latest
    }, null)

    return {
      total,
      withMedia,
      additionsTotal,
      commentsTotal,
      latestDateLabel:
        latestTimestamp && latestTimestamp > 0
          ? new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' }).format(
              new Date(latestTimestamp)
            )
          : null,
    }
  }, [approvedMemories])

  const preparedMemories = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase()

    const filtered = approvedMemories.filter((memory) => {
      if (filters.onlyWithMedia && !(memory.media && memory.media.length)) {
        return false
      }

      if (filters.onlyWithAdditions && countApprovedAdditions(memory) === 0) {
        return false
      }

      if (filters.onlyWithComments && !(memory.comments && memory.comments.length)) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      const haystack = [
        memory.title,
        memory.content,
        memory.content_md,
        memory.author?.full_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedQuery)
    })

    const sorted = filtered.slice().sort((a, b) => {
      if (sortOption === 'oldest') {
        return (
          getTimestamp(a.updated_at ?? a.created_at) - getTimestamp(b.updated_at ?? b.created_at)
        )
      }

      if (sortOption === 'comments') {
        return (b.comments?.length ?? 0) - (a.comments?.length ?? 0)
      }

      if (sortOption === 'additions') {
        return countApprovedAdditions(b) - countApprovedAdditions(a)
      }

      return (
        getTimestamp(b.updated_at ?? b.created_at) - getTimestamp(a.updated_at ?? a.created_at)
      )
    })

    return sorted
  }, [approvedMemories, filters, searchTerm, sortOption])

  const hasApprovedMemories = approvedMemories.length > 0
  const hasPreparedMemories = preparedMemories.length > 0
  const hasActiveFilters =
    searchTerm.trim().length > 0 || Object.values(filters).some((isActive) => isActive)

  const toggleFilter = (key: FilterKey) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleResetFilters = () => {
    setFilters(createDefaultFilters())
    setSearchTerm('')
  }

  const handleAddMemory = () => {
    setShowAddForm(true)
  }

  const handleMemorySuccess = () => {
    window.location.reload()
  }

  const handleAddAddition = (memoryId: string) => {
    setAdditionTargetId(memoryId)
    setShowAdditionForm(true)
  }

  const handleEditMemory = (memory: MemoryItemWithDetails) => {
    setMemoryForEdit(memory)
    setShowEditForm(true)
  }

  const handleOpenMemory = (memory: MemoryItemWithDetails) => {
    setViewMemory(memory)
    setIsViewModalOpen(true)
  }

  const handleAddComment = (
    entityType: 'memory' | 'addition',
    entityId: string,
    parentId?: string
  ) => {
    setCommentEntityType(entityType)
    setCommentEntityId(entityId)
    setCommentParentId(parentId)
    setShowCommentDialog(true)
  }

  return (
    <>
      <Card id="comments"
        className={cn(
          'border border-border/40 bg-background/80 shadow-xl backdrop-blur-sm',
          className
        )}
      >
        <CardHeader className="space-y-6" >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <BookHeart className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">Доска памяти</CardTitle>
                  <p className="mt-1 text-sm text-foreground/60">
                    Тёплые истории семьи, сослуживцев и друзей живут здесь навсегда.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="max-w-2xl text-sm leading-relaxed text-foreground/70">
                  Делитесь важными моментами, добавляйте снимки и подписи. Упорядоченные воспоминания
                  помогают близким лучше почувствовать человека, которого мы чтём.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleAddMemory} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Добавить воспоминание
                  </Button>
                  {hasApprovedMemories && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setViewMode((mode) => (mode === 'grid' ? 'list' : 'grid'))}
                    >
                      <Sparkles className="h-4 w-4" />
                      Сменить представление
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 sm:max-w-sm">
              {[
                {
                  icon: BookHeart,
                  label: 'Воспоминания',
                  value: formatNumber(stats.total),
                },
                {
                  icon: ImageIcon,
                  label: 'С фото',
                  value: formatNumber(stats.withMedia),
                },
                {
                  icon: MessageCircle,
                  label: 'Комментарии',
                  value: formatNumber(stats.commentsTotal),
                },
                {
                  icon: CalendarClock,
                  label: 'Последнее обновление',
                  value: stats.latestDateLabel ?? 'Ждём первый рассказ',
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border/40 bg-background-soft/70 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-foreground">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {hasApprovedMemories && (
            <div className="space-y-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Поиск по названию, автору или содержанию..."
                    className="h-10 pl-9"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                    Сортировка
                  </span>
                  {SORT_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={sortOption === option.value ? 'default' : 'ghost'}
                      size="sm"
                      className={cn(
                        'h-8 px-3 text-xs',
                        sortOption === option.value && 'shadow-sm'
                      )}
                      onClick={() => setSortOption(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background-soft/70 p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 w-9 rounded-full px-0"
                    onClick={() => setViewMode('grid')}
                    aria-pressed={viewMode === 'grid'}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 w-9 rounded-full px-0"
                    onClick={() => setViewMode('list')}
                    aria-pressed={viewMode === 'list'}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {Object.entries(FILTER_CONFIG).map(([key, config]) => {
                  const filterKey = key as FilterKey
                  const Icon = config.icon

                  return (
                    <Button
                      key={filterKey}
                      variant={filters[filterKey] ? 'secondary' : 'outline'}
                      size="sm"
                      className={cn(
                        'h-8 rounded-full px-3 text-xs',
                        filters[filterKey] &&
                          'border-primary bg-primary/10 text-primary hover:bg-primary/15'
                      )}
                      onClick={() => toggleFilter(filterKey)}
                    >
                      <Icon className="mr-1 h-3 w-3" />
                      {config.label}
                    </Button>
                  )
                })}

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-full px-3 text-xs text-foreground/60 hover:text-foreground"
                    onClick={handleResetFilters}
                  >
                    <ListFilter className="mr-1 h-3 w-3" />
                    Сбросить
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {hasPreparedMemories ? (
            <>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-foreground/60">
                  Показано {preparedMemories.length} из {approvedMemories.length} воспоминаний
                </p>
                <p className="text-xs text-foreground/50">{SORT_DESCRIPTIONS[sortOption]}</p>
              </div>

              {/* <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Совет по оформлению</p>
                    <p className="text-xs leading-relaxed text-foreground/70">
                      Уже собрано {formatNumber(stats.additionsTotal)} дополнений и{' '}
                      {formatNumber(stats.commentsTotal)} комментариев — добавляйте ёмкий заголовок,
                      конкретные детали и подписи к фото, чтобы ваш рассказ хотелось перечитывать.
                    </p>
                  </div>
                </div>
              </div> */}

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {preparedMemories.map((memory) => (
                    <MemoryPreviewCard key={memory.id} memory={memory} onOpen={handleOpenMemory} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {preparedMemories.map((memory) => (
                    <MemoryPreviewCard key={memory.id} memory={memory} onOpen={handleOpenMemory} />
                  ))}
                </div>
              )}

              <div className="flex justify-center pt-2">
                <Button onClick={handleAddMemory} variant="outline" size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Поделиться ещё одним воспоминанием
                </Button>
              </div>
            </>
          ) : hasApprovedMemories ? (
            <div className="space-y-6 rounded-2xl border border-dashed border-border/60 bg-background-soft/70 px-8 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ListFilter className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">По запросу ничего не найдено</h3>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-foreground/70">
                  Попробуйте изменить поисковую фразу или отключите часть фильтров, чтобы увидеть
                  все воспоминания.
                </p>
              </div>
              <div className="flex justify-center">
                <Button onClick={handleResetFilters} className="gap-2">
                  <ListFilter className="h-4 w-4" />
                  Сбросить фильтры
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 rounded-2xl border border-dashed border-border/60 bg-background-soft/70 px-8 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookHeart className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Начните историю памяти</h3>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-foreground/70">
                  Здесь ещё нет опубликованных рассказов. Добавьте первое воспоминание, чтобы сохранить
                  тепло и голос близких людей.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <Button onClick={handleAddMemory} size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Поделиться воспоминанием
                </Button>
                <p className="text-xs text-foreground/50">
                  Каждый рассказ проходит модерацию перед публикацией
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isViewModalOpen}
        onOpenChange={(open) => {
          setIsViewModalOpen(open)
          if (!open) {
            setViewMemory(undefined)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border border-border/40 bg-background p-0">
          {viewMemory && (
            <MemoryCard
              memory={viewMemory}
              fallenId={fallenId}
              onAddAddition={handleAddAddition}
              onAddComment={handleAddComment}
              onEditMemory={handleEditMemory}
              onMemoryDeleted={handleMemorySuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <AddMemoryForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        fallenId={fallenId}
        onSuccess={handleMemorySuccess}
      />

      <AddCommentDialog
        open={showCommentDialog}
        onOpenChange={setShowCommentDialog}
        memoryItemId={commentEntityType === 'memory' ? commentEntityId : undefined}
        memoryAdditionId={commentEntityType === 'addition' ? commentEntityId : undefined}
        parentId={commentParentId}
        onSuccess={handleMemorySuccess}
      />

      <AddMemoryAdditionForm
        open={showAdditionForm}
        onOpenChange={(open) => {
          setShowAdditionForm(open)
          if (!open) {
            setAdditionTargetId(undefined)
          }
        }}
        memoryId={additionTargetId || ''}
        fallenId={fallenId}
        onSuccess={handleMemorySuccess}
      />

      {memoryForEdit && (
        <EditMemoryForm
          open={showEditForm}
          onOpenChange={(open) => {
            setShowEditForm(open)
            if (!open) {
              setMemoryForEdit(undefined)
            }
          }}
          memory={memoryForEdit}
          fallenId={fallenId}
          onSuccess={handleMemorySuccess}
        />
      )}
    </>
  )
}
