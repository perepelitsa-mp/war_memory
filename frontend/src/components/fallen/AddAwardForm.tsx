'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Award as AwardIcon, Medal, Star, Shield, Loader2 } from 'lucide-react'
import type { Award } from '@/types'
import { cn } from '@/lib/utils'
import { useConfirmDialog } from '@/components/ui/alert-dialog-custom'

interface AddAwardFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fallenId: string
  availableAwards: Award[]
  onSuccess?: () => void
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

export function AddAwardForm({
  open,
  onOpenChange,
  fallenId,
  availableAwards,
  onSuccess,
}: AddAwardFormProps) {
  const { alert } = useConfirmDialog()
  const [selectedAward, setSelectedAward] = useState<Award | null>(null)
  const [citation, setCitation] = useState('')
  const [awardedDate, setAwardedDate] = useState('')
  const [decreeNumber, setDecreeNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedAward) {
      await alert({
        title: 'Выберите награду',
        description: 'Необходимо выбрать награду из списка',
        confirmText: 'Понятно',
      })
      return
    }

    if (!citation.trim()) {
      await alert({
        title: 'Укажите основание',
        description: 'Укажите за что награждён',
        confirmText: 'Понятно',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Отправка на сервер
      console.log('Добавление награды:', {
        fallen_id: fallenId,
        award_id: selectedAward.id,
        citation: citation.trim(),
        awarded_date: awardedDate || null,
        decree_number: decreeNumber.trim() || null,
      })

      // Имитация запроса
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Сброс формы
      setSelectedAward(null)
      setCitation('')
      setAwardedDate('')
      setDecreeNumber('')

      onOpenChange(false)
      onSuccess?.()

      await alert({
        title: 'Успешно',
        description: 'Награда успешно добавлена!',
        confirmText: 'Отлично',
      })
    } catch (error) {
      console.error('Ошибка при добавлении награды:', error)
      await alert({
        title: 'Ошибка',
        description: 'Не удалось добавить награду. Попробуйте ещё раз.',
        confirmText: 'Закрыть',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Medal className="h-6 w-6 text-primary" />
            Добавить награду
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Выбор награды */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Выберите награду *</Label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-[400px] overflow-y-auto rounded-lg border border-border/50 bg-background-soft/30 p-4">
              {availableAwards.map((award) => {
                const Icon = getAwardIcon(award.award_type)
                const typeName = getAwardTypeName(award.award_type)
                const isSelected = selectedAward?.id === award.id

                return (
                  <button
                    key={award.id}
                    type="button"
                    onClick={() => setSelectedAward(award)}
                    className={cn(
                      'group relative flex flex-col items-center gap-3 rounded-xl border p-4 text-center transition-all hover:border-primary/50 hover:shadow-md',
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-glow'
                        : 'border-border/40 bg-background/60'
                    )}
                  >
                    {/* Тип награды */}
                    <Badge
                      variant="secondary"
                      className="absolute right-2 top-2 text-xs"
                    >
                      {typeName}
                    </Badge>

                    {/* Иконка/изображение */}
                    <div className="relative flex h-16 w-16 items-center justify-center">
                      {award.image_url ? (
                        <img
                          src={award.image_url}
                          alt={award.name}
                          className="h-full w-full object-contain transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/15">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Название */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold leading-tight text-foreground">
                        {award.short_name || award.name}
                      </h4>
                    </div>

                    {/* Индикатор выбора */}
                    {isSelected && (
                      <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Описание выбранной награды */}
          {selectedAward && selectedAward.description && (
            <div className="rounded-lg border border-border/50 bg-background-soft/50 p-4">
              <p className="text-sm text-foreground/70">{selectedAward.description}</p>
            </div>
          )}

          {/* Цитата - за что награждён */}
          <div className="space-y-2">
            <Label htmlFor="citation" className="text-base font-semibold">
              За что награждён *
            </Label>
            <Textarea
              id="citation"
              value={citation}
              onChange={(e) => setCitation(e.target.value)}
              placeholder="Например: За мужество, отвагу и самоотверженность, проявленные при исполнении воинского долга"
              rows={4}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Укажите за какие заслуги или подвиги была вручена награда
            </p>
          </div>

          {/* Дата награждения */}
          <div className="space-y-2">
            <Label htmlFor="awarded_date" className="text-base font-semibold">
              Дата награждения
            </Label>
            <Input
              id="awarded_date"
              type="date"
              value={awardedDate}
              onChange={(e) => setAwardedDate(e.target.value)}
            />
          </div>

          {/* Номер указа/приказа */}
          <div className="space-y-2">
            <Label htmlFor="decree_number" className="text-base font-semibold">
              Номер указа/приказа
            </Label>
            <Input
              id="decree_number"
              type="text"
              value={decreeNumber}
              onChange={(e) => setDecreeNumber(e.target.value)}
              placeholder="Например: Указ Президента РФ №123 от 15.09.2023"
            />
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !selectedAward || !citation.trim()}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Добавление...
                </>
              ) : (
                'Добавить награду'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
