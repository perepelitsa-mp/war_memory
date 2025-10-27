'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Photo {
  id: string
  file_url: string | null
  alt_text?: string | null
  caption?: string | null
}

interface PhotoSliderProps {
  photos: Photo[]
  className?: string
  initialIndex?: number
  onIndexChange?: (index: number) => void
}

export function PhotoSlider({
  photos,
  className,
  initialIndex = 0,
  onIndexChange,
}: PhotoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.min(Math.max(initialIndex, 0), Math.max(photos.length - 1, 0)),
  )
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!photos || photos.length === 0) {
    return null
  }

  const updateIndex = (value: number) => {
    const nextIndex = ((value % photos.length) + photos.length) % photos.length
    setCurrentIndex(nextIndex)
    onIndexChange?.(nextIndex)
  }

  if (currentIndex >= photos.length && photos.length > 0) {
    setCurrentIndex(photos.length - 1)
  }

  useEffect(() => {
    setCurrentIndex((prev) => {
      const bounded = Math.min(Math.max(initialIndex, 0), Math.max(photos.length - 1, 0))
      if (prev === bounded) {
        return prev
      }
      onIndexChange?.(bounded)
      return bounded
    })
  }, [initialIndex, photos.length, onIndexChange])

  const goToPrevious = () => {
    updateIndex(currentIndex === 0 ? photos.length - 1 : currentIndex - 1)
  }

  const goToNext = () => {
    updateIndex(currentIndex === photos.length - 1 ? 0 : currentIndex + 1)
  }

  const goToIndex = (index: number) => {
    updateIndex(index)
  }

  const openFullscreen = () => {
    setIsFullscreen(true)
  }

  const closeFullscreen = () => {
    setIsFullscreen(false)
  }

  const currentPhoto = photos[currentIndex]

  return (
    <>
      <div className={cn('relative w-full', className)}>
        {/* Main photo display */}
        <div className="relative aspect-video overflow-hidden rounded-xl border border-border/50 bg-background shadow-md">
          {currentPhoto?.file_url ? (
            <img
              src={currentPhoto.file_url}
              alt={currentPhoto.alt_text || ''}
              className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
              onClick={openFullscreen}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-12 w-12 text-foreground/30" />
            </div>
          )}

          {/* Navigation buttons - only show if more than 1 photo */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-background/80 shadow-lg backdrop-blur-sm hover:bg-background/90"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-background/80 shadow-lg backdrop-blur-sm hover:bg-background/90"
                onClick={goToNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Photo counter */}
          {photos.length > 1 && (
            <div className="absolute bottom-3 right-3 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold shadow-md backdrop-blur-sm">
              {currentIndex + 1} / {photos.length}
            </div>
          )}

          {/* Caption overlay */}
          {currentPhoto?.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-sm text-white">
              {currentPhoto.caption}
            </div>
          )}
        </div>

        {/* Thumbnail navigation - only show if more than 1 photo */}
        {photos.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => goToIndex(index)}
                className={cn(
                  'relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                  index === currentIndex
                    ? 'border-primary shadow-lg'
                    : 'border-border/50 opacity-60 hover:opacity-100',
                )}
              >
                {photo.file_url ? (
                  <img
                    src={photo.file_url}
                    alt={photo.alt_text || ''}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-background">
                    <ImageIcon className="h-4 w-4 text-foreground/30" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={closeFullscreen}
        >
          <button
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation()
              closeFullscreen()
            }}
          >
            <X className="h-6 w-6" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <div className="relative flex h-screen w-screen items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            {currentPhoto?.file_url ? (
              <img
                src={currentPhoto.file_url}
                alt={currentPhoto.alt_text || ''}
                className="max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] object-contain"
              />
            ) : (
              <div className="flex h-96 w-96 items-center justify-center">
                <ImageIcon className="h-24 w-24 text-white/30" />
              </div>
            )}

            {currentPhoto?.caption && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 p-4 text-center text-white rounded-lg">
                {currentPhoto.caption}
              </div>
            )}

            {photos.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                {currentIndex + 1} / {photos.length}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
