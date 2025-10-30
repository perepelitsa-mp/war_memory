'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Film,
  Image as ImageIcon,
  ImagePlus,
  LayoutGrid,
  MapPin,
  Search,
  Sparkles,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AddPhotoToGalleryDialog } from './AddPhotoToGalleryDialog'
import { useCanDeleteContent } from '@/hooks/useCanDeleteContent'
import { useConfirmDialog } from '@/components/ui/alert-dialog-custom'
import { cn } from '@/lib/utils'

interface FallenMedia {
  id: string
  file_url: string | null
  alt_text?: string | null
  caption?: string | null
  created_at?: string | null
  uploaded_by?: string | null
}

interface MemoryGalleryProps {
  photos: FallenMedia[]
  fallenId: string
}

const MAX_PINNED = 6

const formatDate = (value?: string | null) => {
  if (!value) {
    return null
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' }).format(date)
}

export function MemoryGallery({ photos, fallenId }: MemoryGalleryProps) {
  const { canDelete } = useCanDeleteContent(fallenId)
  const { alert } = useConfirmDialog()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activePinnedIds, setActivePinnedIds] = useState<string[]>([])
  const [fullscreenState, setFullscreenState] = useState<{
    collection: FallenMedia[]
    index: number
  } | null>(null)

  const storageKey = `memory-gallery-pinned-${fallenId}`

  // load pinned ids from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setActivePinnedIds(parsed.filter((id) => typeof id === 'string'))
      }
    } catch (error) {
      console.error('Failed to parse pinned gallery ids:', error)
    }
  }, [storageKey])

  // keep storage in sync
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(storageKey, JSON.stringify(activePinnedIds))
  }, [activePinnedIds, storageKey])

  // remove pinned ids that no longer exist
  useEffect(() => {
    setActivePinnedIds((prev) =>
      prev.filter((id) => photos.some((photo) => photo.id === id)),
    )
  }, [photos])

  const togglePinned = async (photo: FallenMedia) => {
    if (!canDelete) {
      return
    }

    // Check if we're trying to add and already at max
    if (!activePinnedIds.includes(photo.id) && activePinnedIds.length >= MAX_PINNED) {
      await alert({
        title: 'Превышен лимит',
        description: `Можно закрепить не более ${MAX_PINNED} фотографий`,
        confirmText: 'Понятно',
      })
      return
    }

    setActivePinnedIds((prev) => {
      if (prev.includes(photo.id)) {
        return prev.filter((id) => id !== photo.id)
      }
      return [...prev, photo.id]
    })
  }

  const filteredPhotos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) {
      return photos
    }

    return photos.filter((photo) => {
      const caption = photo.caption?.toLowerCase() ?? ''
      const alt = photo.alt_text?.toLowerCase() ?? ''
      return caption.includes(term) || alt.includes(term)
    })
  }, [photos, searchTerm])

  const pinnedSet = new Set(activePinnedIds)
  const existingPinned = photos.filter((photo) => pinnedSet.has(photo.id))
  const fallbackPinned = photos
    .filter((photo) => !pinnedSet.has(photo.id))
    .slice(0, Math.max(0, MAX_PINNED - existingPinned.length))

  const pinnedPhotos = [...existingPinned, ...fallbackPinned].slice(0, MAX_PINNED)
  const extraPhotos = photos.filter((photo) => !pinnedPhotos.some((p) => p.id === photo.id))
  const filteredExtraPhotos = filteredPhotos.filter(
    (photo) => !pinnedPhotos.some((p) => p.id === photo.id),
  )

  const stats = useMemo(() => {
    const total = photos.length
    const lastUpdated = photos.reduce<string | null>((latest, photo) => {
      if (!photo.created_at) return latest
      const ts = new Date(photo.created_at).getTime()
      if (Number.isNaN(ts)) return latest
      if (!latest) return photo.created_at
      return ts > new Date(latest).getTime() ? photo.created_at : latest
    }, null)

    return {
      total,
      lastUpdatedLabel: formatDate(lastUpdated) ?? 'Недавно',
    }
  }, [photos])

  const handleSuccess = () => {
    window.location.reload()
  }

  const openFullscreen = (collection: FallenMedia[], index: number) => {
    setFullscreenState({ collection, index })
  }

  const closeFullscreen = () => {
    setFullscreenState(null)
  }

  const stepFullscreen = (direction: 1 | -1) => {
    setFullscreenState((prev) => {
      if (!prev) return prev
      const { collection, index } = prev
      if (collection.length === 0) return prev
      const nextIndex = ((index + direction) % collection.length + collection.length) % collection.length
      return { collection, index: nextIndex }
    })
  }

  // Keyboard navigation for fullscreen viewer
  useEffect(() => {
    if (!fullscreenState) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeFullscreen()
      } else if (event.key === 'ArrowLeft') {
        stepFullscreen(-1)
      } else if (event.key === 'ArrowRight') {
        stepFullscreen(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fullscreenState])

  if (!photos || photos.length === 0) {
    return (
      <>
        <div className="rounded-3xl border border-dashed border-border/60 bg-background-soft/70 px-10 py-12 text-center shadow-inner">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <ImageIcon className="h-8 w-8 text-primary" />
          </div>
          <div className="mx-auto mt-4 max-w-md space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Здесь пока пусто</h3>
            <p className="text-sm leading-relaxed text-foreground/70">
              Добавьте первую фотографию, чтобы сохранить важные моменты из жизни героя. Галерея
              оживает, когда в ней появляются лица и места, дорогие семье и друзьям.
            </p>
          </div>
          {canDelete && (
            <Button onClick={() => setShowAddDialog(true)} size="lg" className="mt-6 gap-2">
              <ImagePlus className="h-5 w-5" />
              Загрузить фото
            </Button>
          )}
        </div>

        <AddPhotoToGalleryDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          fallenId={fallenId}
          onSuccess={handleSuccess}
        />
      </>
    )
  }

  const hasSearch = searchTerm.trim().length > 0

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-3xl border border-border/40 bg-gradient-to-br from-background/90 via-background-soft/80 to-background/90 p-6 shadow-xl backdrop-blur md:p-8">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-foreground">Закреплённые фотографии</h3>
            <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/10 text-primary">
              {pinnedPhotos.length} / {MAX_PINNED}
            </Badge>
          </div>

          {pinnedPhotos.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pinnedPhotos.map((photo) => {
                const isPinned = activePinnedIds.includes(photo.id)
                return (
                  <div
                    key={photo.id}
                    className="group relative overflow-hidden rounded-2xl border border-border/40 bg-background-soft shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {photo.file_url ? (
                      <button
                        type="button"
                        className="block h-full w-full overflow-hidden text-left"
                        onClick={() => openFullscreen(pinnedPhotos, pinnedPhotos.indexOf(photo))}
                      >
                        <img
                          src={photo.file_url}
                          alt={photo.alt_text || ''}
                          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </button>
                    ) : (
                      <div className="flex h-56 w-full items-center justify-center bg-background">
                        <ImageIcon className="h-8 w-8 text-foreground/30" />
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 text-xs text-white">
                      <p className="line-clamp-2 text-sm font-medium">
                        {photo.caption || photo.alt_text || 'Фотография без подписи'}
                      </p>
                    </div>

                    {isPinned && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-primary/80 px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                        <MapPin className="h-3.5 w-3.5" />
                        
                      </span>
                    )}

                    {canDelete && (
                      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end p-3 opacity-0 transition group-hover:opacity-100">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="pointer-events-auto gap-2 rounded-full bg-primary/90 text-primary-foreground shadow-lg hover:bg-primary"
                          onClick={() => togglePinned(photo)}
                        >
                          <MapPin className="h-4 w-4" />
                          {isPinned ? 'Открепить' : 'Закрепить'}
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-border/50 bg-background-soft/80 px-6 py-12 text-center">
              <p className="text-sm text-foreground/60">
                Выберите до шести фотографий, чтобы закрепить их в начале галереи. Они будут первыми,
                что увидят посетители страницы.
              </p>
              {canDelete && (
                <Button
                  size="sm"
                  className="mt-4 gap-2"
                  onClick={() => setIsGalleryModalOpen(true)}
                >
                  <MapPin className="h-4 w-4" />
                  Выбрать фотографии
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-xl border border-border/50 bg-background/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">Всего снимков</p>
              <p className="text-base font-semibold text-foreground">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">Обновлено</p>
              <p className="text-base font-semibold text-foreground">{stats.lastUpdatedLabel}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Поиск по подписи..."
                className="h-10 pl-9"
              />
            </div>
            {/* <Button
              type="button"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              className="h-10 gap-2"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
              Галерея
            </Button> */}
            <Button
              type="button"
              className="h-10 gap-2"
              onClick={() => setIsGalleryModalOpen(true)}
            >
              <Film className="h-4 w-4" />
              Все фотографии
            </Button>
            {canDelete && (
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2"
                onClick={() => setShowAddDialog(true)}
              >
                <ImagePlus className="h-4 w-4" />
                Загрузить фото
              </Button>
            )}
          </div>
        </div>

        {viewMode === 'grid' && extraPhotos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/10 text-primary">
                Остальные фото
              </Badge>
              {hasSearch && (
                <span className="text-xs text-foreground/60">
                  Найдено {filteredExtraPhotos.length} {filteredExtraPhotos.length === 1 ? 'фотография' : filteredExtraPhotos.length < 5 ? 'фотографии' : 'фотографий'}
                </span>
              )}
            </div>

            {filteredExtraPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {filteredExtraPhotos.slice(0, 12).map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative overflow-hidden rounded-2xl border border-border/40 bg-background-soft shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <button
                      type="button"
                      className="block h-full w-full overflow-hidden text-left"
                      onClick={() =>
                        openFullscreen(filteredExtraPhotos, filteredExtraPhotos.indexOf(photo))
                      }
                    >
                      {photo.file_url ? (
                        <img
                          src={photo.file_url}
                          alt={photo.alt_text || ''}
                          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-48 w-full items-center justify-center bg-background">
                          <ImageIcon className="h-8 w-8 text-foreground/30" />
                        </div>
                      )}
                    </button>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 text-xs text-white">
                      <p className="line-clamp-2 text-sm font-medium">
                        {photo.caption || photo.alt_text || 'Фотография без подписи'}
                      </p>
                    </div>

                    {canDelete && (
                      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end p-3 opacity-0 transition group-hover:opacity-100">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="pointer-events-auto gap-2 rounded-full bg-primary/90 text-primary-foreground shadow-lg hover:bg-primary"
                          onClick={() => togglePinned(photo)}
                        >
                          <MapPin className="h-4 w-4" />
                          Закрепить
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 bg-background-soft/70 px-8 py-10 text-center text-sm text-foreground/70">
                По запросу ничего не найдено. Измените условия поиска, чтобы увидеть другие фотографии.
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={isGalleryModalOpen} onOpenChange={setIsGalleryModalOpen}>
        <DialogContent className="max-h-[80vh] w-full max-w-6xl overflow-y-auto border border-border/40 bg-background/95 p-0">
          <DialogHeader className="space-y-1 px-6 py-6">
            <DialogTitle className="flex items-center justify-between text-lg font-semibold text-foreground">
              <span>Галерея памяти</span>
              <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/10 text-primary">
                {filteredPhotos.length} фото
              </Badge>
            </DialogTitle>
            <p className="text-sm text-foreground/60">
              Нажмите на снимок, чтобы открыть его во весь экран. Авторизованные пользователи могут закреплять фотографии для верхней подборки.
            </p>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Поиск по подписи или описанию..."
                className="h-10 pl-9"
              />
            </div>
          </DialogHeader>

          <div className="grid gap-4 px-6 pb-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPhotos.map((photo) => {
              const isPinned = activePinnedIds.includes(photo.id)
              return (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden rounded-2xl border border-border/40 bg-background-soft shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <button
                    type="button"
                    className="block h-full w-full overflow-hidden text-left"
                    onClick={() =>
                      openFullscreen(filteredPhotos, filteredPhotos.indexOf(photo))
                    }
                  >
                    {photo.file_url ? (
                      <img
                        src={photo.file_url}
                        alt={photo.alt_text || ''}
                        className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center bg-background">
                        <ImageIcon className="h-8 w-8 text-foreground/30" />
                      </div>
                    )}
                  </button>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 text-xs text-white">
                    <p className="line-clamp-2 text-sm font-medium">
                      {photo.caption || photo.alt_text || 'Фотография без подписи'}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-white/70">
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {isPinned ? 'Закреплено' : 'Можно закрепить'}
                      </span>
                      {photo.created_at && (
                        <span>{formatDate(photo.created_at)}</span>
                      )}
                    </div>
                  </div>

                  {canDelete && (
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end p-3 opacity-0 transition group-hover:opacity-100">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="pointer-events-auto gap-2 rounded-full bg-primary/90 text-primary-foreground shadow-lg hover:bg-primary"
                        onClick={() => togglePinned(photo)}
                      >
                        <MapPin className="h-4 w-4" />
                        {isPinned ? 'Открепить' : 'Закрепить'}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      <AddPhotoToGalleryDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        fallenId={fallenId}
        onSuccess={handleSuccess}
      />

      {fullscreenState && fullscreenState.collection.length > 0 && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 backdrop-blur-md animate-in fade-in duration-300">
          {/* Header with close button and counter */}
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-[#FF8C42]/20 to-[#FF6B35]/20 px-4 backdrop-blur-sm">
                <ImageIcon className="h-4 w-4 text-[#FF8C42]" />
                <span className="text-sm font-medium text-white">
                  {fullscreenState.index + 1} / {fullscreenState.collection.length}
                </span>
              </div>
            </div>
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110 active:scale-95"
              onClick={closeFullscreen}
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation buttons */}
          {fullscreenState.collection.length > 1 && (
            <>
              <button
                className="absolute left-6 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-white/15 to-white/5 text-white shadow-2xl backdrop-blur-md transition-all hover:from-white/25 hover:to-white/15 hover:scale-110 active:scale-95"
                onClick={() => stepFullscreen(-1)}
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                className="absolute right-6 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-white/15 to-white/5 text-white shadow-2xl backdrop-blur-md transition-all hover:from-white/25 hover:to-white/15 hover:scale-110 active:scale-95"
                onClick={() => stepFullscreen(1)}
                aria-label="Следующее фото"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          {/* Main content container */}
          <div className="relative mx-auto flex h-full max-h-screen w-full max-w-7xl flex-col items-center justify-center gap-6 px-4 py-24 sm:px-8">
            {/* Image container with fixed aspect ratio */}
            <div className="relative flex w-full flex-1 items-center justify-center">
              <div className="relative max-h-[calc(100vh-16rem)] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] shadow-2xl ring-1 ring-white/10">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#FF8C42]/5 via-transparent to-[#FF6B35]/5" />
                {fullscreenState.collection[fullscreenState.index]?.file_url ? (
                  <img
                    src={fullscreenState.collection[fullscreenState.index]?.file_url ?? ''}
                    alt={fullscreenState.collection[fullscreenState.index]?.alt_text || ''}
                    className="relative h-full w-full object-contain p-2"
                  />
                ) : (
                  <div className="flex h-full min-h-[400px] w-full items-center justify-center">
                    <ImageIcon className="h-24 w-24 text-white/20" />
                  </div>
                )}
              </div>
            </div>

            {/* Caption container */}
            {(fullscreenState.collection[fullscreenState.index]?.caption ||
              fullscreenState.collection[fullscreenState.index]?.alt_text) && (
              <div className="w-full max-w-4xl">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-xl backdrop-blur-md ring-1 ring-white/10">
                  <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#FF8C42] via-[#FF6B35] to-[#FF8C42]" />
                  <p className="text-center text-base leading-relaxed text-white/90">
                    {fullscreenState.collection[fullscreenState.index]?.caption ||
                     fullscreenState.collection[fullscreenState.index]?.alt_text ||
                     'Фотография без подписи'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Keyboard hint */}
          {fullscreenState.collection.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 backdrop-blur-sm">
                <span className="text-xs text-white/50">
                  Используйте клавиши ← → для навигации
                </span>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  )
}
