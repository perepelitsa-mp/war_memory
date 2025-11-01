'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ImageIcon,
  Pencil,
  QrCode,
  CalendarDays,
  Shield,
  MapPin,
  Award as AwardIcon,
  ChevronDown,
  ChevronUp,
  Flame,
  LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HeroPhotoSelector } from './HeroPhotoSelector'
import { VirtualCandle } from './VirtualCandle'
import { FlowerTribute } from './FlowerTribute'
import { QRCodePrint } from './QRCodePrint'
import { useRouter } from 'next/navigation'
import { useConfirmDialog } from '@/components/ui/alert-dialog-custom'
import { cn } from '@/lib/utils'

// Маппинг названий иконок на компоненты
const ICON_MAP: Record<string, LucideIcon> = {
  CalendarDays,
  Shield,
  MapPin,
  AwardIcon,
  Flame,
}

type IconName = keyof typeof ICON_MAP

interface HeroProfileCardProps {
  heroPhotoUrl: string | null
  fullName: string
  firstName: string
  lastName: string
  lifespan: string
  canEdit: boolean
  fallenId: string
  candleCount?: number
  candleLit?: boolean
  totalFlowers?: number
  isDemo?: boolean | null
  profileDetails: Array<{
    label: string
    value: string | null
    iconName: IconName
  }>
  // Для QR-кода
  birthDate?: string | null
  deathDate?: string | null
  rank?: string | null
  unit?: string | null
}

export function HeroProfileCard({
  heroPhotoUrl,
  fullName,
  firstName,
  lastName,
  lifespan,
  canEdit,
  fallenId,
  candleCount = 0,
  candleLit = false,
  totalFlowers = 0,
  isDemo = false,
  profileDetails,
  birthDate,
  deathDate,
  rank,
  unit,
}: HeroProfileCardProps) {
  const router = useRouter()
  const { alert } = useConfirmDialog()
  const [showPhotoSelector, setShowPhotoSelector] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showAllDetails, setShowAllDetails] = useState(false)

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
        variant: 'success',
      })

      router.refresh()
    } catch (error) {
      console.error('Ошибка обновления фото:', error)
      await alert({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить фото.',
        variant: 'error',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Разделяем детали на основные и дополнительные
  const mainDetails = profileDetails.slice(0, 4)
  const extraDetails = profileDetails.slice(4)
  const visibleDetails = showAllDetails ? profileDetails : mainDetails

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-background/95 via-surface/90 to-background/95 shadow-2xl backdrop-blur-sm">
        {/* Декоративный фон */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, hsla(var(--primary), 0.15), transparent 50%), radial-gradient(circle at 80% 80%, hsla(var(--secondary), 0.1), transparent 50%)',
          }}
        />

        <div className="relative grid gap-6 p-6 md:grid-cols-[280px_1fr] md:gap-8 md:p-8">
          {/* Левая колонка: Фото и действия */}
          <div className="space-y-4">
            {/* Фото героя */}
            <div
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-background-soft shadow-lg"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              {heroPhotoUrl ? (
                <Image
                  src={heroPhotoUrl}
                  alt={fullName}
                  width={560}
                  height={720}
                  className="aspect-[3/4] w-full object-cover"
                  priority
                />
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center bg-gradient-to-br from-surface/80 to-background-soft/60">
                  <span className="text-5xl font-bold tracking-wide text-foreground/15">
                    {firstName[0]}
                    {lastName[0]}
                  </span>
                </div>
              )}

              {/* Кнопка редактирования */}
              {canEdit && (
                <div
                  className={cn(
                    'absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300',
                    isHovered ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  <Button
                    onClick={() => setShowPhotoSelector(true)}
                    disabled={isUpdating}
                    size="lg"
                    className="gap-2"
                  >
                    {heroPhotoUrl ? (
                      <>
                        <Pencil className="h-4 w-4" />
                        Изменить
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

              {/* Свеча памяти в углу фото */}
              <div className="absolute right-3 top-3 z-10">
                <VirtualCandle
                  fallenId={fallenId}
                  initialCount={candleCount}
                  initialLit={candleLit}
                  compact
                />
              </div>
            </div>

            {/* Демонстрационный бейдж */}
            {isDemo && (
              <Badge
                variant="secondary"
                className="w-full justify-center rounded-full bg-primary/10 py-2 text-xs font-medium text-primary"
              >
                Демонстрационная карточка
              </Badge>
            )}

            {/* Действия: Цветы и QR-код */}
            <div className="grid grid-cols-2 gap-2">
              <FlowerTribute fallenId={fallenId} totalFlowers={totalFlowers} compact />
              <QRCodePrint
                fallenId={fallenId}
                falleName={fullName}
                birthDate={birthDate}
                deathDate={deathDate}
                rank={rank}
                unit={unit}
              />
            </div>
          </div>

          {/* Правая колонка: Информация */}
          <div className="flex flex-col gap-6">
            {/* Заголовок */}
            <div className="space-y-3">

              <h1 className="font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl">
                {fullName}
              </h1>

              <p className="text-lg font-medium text-muted-foreground">{lifespan}</p>
            </div>

            {/* Основные детали профиля */}
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleDetails.map((detail, index) => {
                const Icon = ICON_MAP[detail.iconName]
                return (
                  <div
                    key={`${detail.label}-${index}`}
                    className="flex items-start gap-3 rounded-xl border border-border/40 bg-background/50 px-4 py-3 transition-colors hover:bg-background/70"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {detail.label}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                        {detail.value || '—'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Кнопка показать/скрыть дополнительные детали */}
            {extraDetails.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllDetails(!showAllDetails)}
                className="self-start gap-2 text-muted-foreground hover:text-foreground"
              >
                {showAllDetails ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Скрыть детали
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Показать все детали ({extraDetails.length})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
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
