'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageIcon, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeroPhotoSelector } from './HeroPhotoSelector'
import { VirtualCandle } from './VirtualCandle'
import { useRouter } from 'next/navigation'
import { useConfirmDialog } from '@/components/ui/alert-dialog-custom'

interface HeroPhotoBlockProps {
  heroPhotoUrl: string | null
  fullName: string
  firstName: string
  lastName: string
  canEdit: boolean
  fallenId: string
  candleCount?: number
  candleLit?: boolean
}

export function HeroPhotoBlock({
  heroPhotoUrl,
  fullName,
  firstName,
  lastName,
  canEdit,
  fallenId,
  candleCount = 0,
  candleLit = false,
}: HeroPhotoBlockProps) {
  const router = useRouter()
  const { alert } = useConfirmDialog()
  const [showPhotoSelector, setShowPhotoSelector] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handlePhotoSelect = async (photoUrl: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/fallen/${fallenId}/update-field`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'hero_photo_url', value: photoUrl }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ошибка обновления фото')
      }

      await alert({
        title: 'Фото обновлено',
        description: 'Фотография профиля успешно изменена.',
      })

      router.refresh()
    } catch (error) {
      console.error('Ошибка обновления фото:', error)
      await alert({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить фото.',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <div
        className="relative overflow-hidden rounded-3xl border border-border/50 bg-background-soft/80 shadow-glow group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
        {heroPhotoUrl ? (
          <Image
            src={heroPhotoUrl}
            alt={fullName}
            width={720}
            height={960}
            className="h-full w-full object-cover"
            priority
          />
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--surface)/0.85),hsl(var(--background-soft)/0.65))]">
            <span className="text-6xl font-semibold tracking-wide text-foreground/20">
              {firstName[0]}
              {lastName[0]}
            </span>
          </div>
        )}

        {/* Виртуальная свеча памяти */}
        <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
          <VirtualCandle
            fallenId={fallenId}
            initialCount={candleCount}
            initialLit={candleLit}
            compact
          />
        </div>

        {/* Кнопка редактирования - показывается при наведении, если есть права */}
        {canEdit && (
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            } flex items-center justify-center`}
          >
            <Button
              onClick={() => setShowPhotoSelector(true)}
              disabled={isUpdating}
              className="gap-2"
              size="lg"
            >
              {heroPhotoUrl ? (
                <>
                  <Pencil className="h-4 w-4" />
                  Изменить фото
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4" />
                  Выбрать фото
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Диалог выбора фото */}
      <HeroPhotoSelector
        open={showPhotoSelector}
        onOpenChange={setShowPhotoSelector}
        currentPhotoUrl={heroPhotoUrl}
        fallenId={fallenId}
        onSelect={handlePhotoSelect}
      />
    </>
  )
}
