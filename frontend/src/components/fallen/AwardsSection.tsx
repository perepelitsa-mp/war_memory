'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Award as AwardIcon, Medal, Star, Shield, Plus } from 'lucide-react'
import { AddAwardForm } from './AddAwardForm'
import type { Award, FallenAwardWithDetails } from '@/types'
import { cn } from '@/lib/utils'

interface AwardsSectionProps {
  awards: FallenAwardWithDetails[]
  fallenId: string
  availableAwards: Award[]
  className?: string
}

const getAwardIcon = (type: string) => {
  switch (type) {
    case 'title':
      return Star
    case 'order':
      return Shield
    case 'medal':
      return Medal
    case 'badge':
      return AwardIcon
    default:
      return Medal
  }
}

const getAwardTypeName = (type: string) => {
  switch (type) {
    case 'title':
      return 'Звание'
    case 'order':
      return 'Орден'
    case 'medal':
      return 'Медаль'
    case 'badge':
      return 'Знак отличия'
    default:
      return 'Награда'
  }
}

export function AwardsSection({
  awards,
  fallenId,
  availableAwards,
  className,
}: AwardsSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false)

  // Сортируем награды по sort_order (от большего к меньшему)
  const sortedAwards = awards
    ? [...awards].sort((a, b) => (b.award.sort_order || 0) - (a.award.sort_order || 0))
    : []

  const handleAddSuccess = () => {
    // TODO: Обновить список наград после добавления
    console.log('Награда добавлена, обновление списка...')
  }

  return (
    <section className={className}>
      <Card className="border border-border/50 bg-background/70 shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Medal className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Награды и отличия</CardTitle>
                <p className="mt-1 text-sm text-foreground/60">
                  {sortedAwards.length > 0
                    ? `${sortedAwards.length} ${
                        sortedAwards.length === 1
                          ? 'награда'
                          : sortedAwards.length < 5
                            ? 'награды'
                            : 'наград'
                      }`
                    : 'Награды не добавлены'}
                </p>
              </div>
            </div>

            {/* Кнопка добавления награды */}
            <Button onClick={() => setShowAddForm(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Добавить награду
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {sortedAwards.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/50 bg-background-soft/30 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Medal className="h-8 w-8 text-primary/60" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground/70">Награды пока не добавлены</p>
                <p className="text-xs text-muted-foreground">
                  Нажмите кнопку "Добавить награду" чтобы добавить информацию о наградах
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedAwards.map((fallenAward) => {
                const Icon = getAwardIcon(fallenAward.award.award_type)
                const typeName = getAwardTypeName(fallenAward.award.award_type)

                return (
                  <div
                    key={fallenAward.id}
                    className={cn(
                      'group relative flex flex-col items-center gap-4 rounded-2xl border border-border/40 bg-gradient-to-br from-background/95 via-background-soft/90 to-background/95 p-6 text-center transition-all hover:border-primary/40 hover:shadow-glow',
                      fallenAward.award.award_type === 'title' &&
                        'border-primary/50 bg-gradient-to-br from-primary/5 via-background-soft/90 to-background/95'
                    )}
                  >
                    {/* Тип награды */}
                    <Badge
                      variant="secondary"
                      className="absolute right-3 top-3 border border-border/30 bg-background/80 text-xs"
                    >
                      {typeName}
                    </Badge>

                    {/* Изображение награды */}
                    <div className="relative flex h-24 w-24 items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent opacity-0 blur-xl transition-opacity group-hover:opacity-100" />

                      {fallenAward.award.image_url ? (
                        <img
                          src={fallenAward.award.image_url}
                          alt={fallenAward.award.name}
                          className="relative h-full w-full object-contain transition-transform group-hover:scale-110"
                          onError={(e) => {
                            // Fallback к иконке если изображение не загрузилось
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const iconContainer = target.nextElementSibling as HTMLElement
                            if (iconContainer) {
                              iconContainer.style.display = 'flex'
                            }
                          }}
                        />
                      ) : null}

                      {/* Fallback иконка */}
                      <div className="hidden h-full w-full items-center justify-center rounded-full bg-primary/15">
                        <Icon className="h-12 w-12 text-primary" />
                      </div>
                    </div>

                    {/* Название награды */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold leading-tight text-foreground">
                        {fallenAward.award.short_name || fallenAward.award.name}
                      </h3>
                    </div>

                    {/* Описание за что награждён */}
                    {fallenAward.citation && (
                      <p className="text-xs leading-relaxed text-foreground/70">
                        {fallenAward.citation}
                      </p>
                    )}

                    {/* Дополнительная информация */}
                    {(fallenAward.awarded_date || fallenAward.decree_number) && (
                      <div className="mt-auto space-y-1 border-t border-border/30 pt-3 text-xs text-foreground/50">
                        {fallenAward.awarded_date && (
                          <p>
                            Награждён:{' '}
                            {new Date(fallenAward.awarded_date).toLocaleDateString('ru-RU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        )}
                        {fallenAward.decree_number && (
                          <p className="truncate" title={`Указ ${fallenAward.decree_number}`}>
                            Указ {fallenAward.decree_number}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Форма добавления награды */}
      <AddAwardForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        fallenId={fallenId}
        availableAwards={availableAwards}
        onSuccess={handleAddSuccess}
      />
    </section>
  )
}
