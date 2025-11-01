'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { useConfirmDialog } from '@/components/ui/alert-dialog-custom'

interface Vus {
  id: string
  code: string
  name: string
  description?: string
}

interface VusSelectorProps {
  value?: string | null
  onChange: (vusId: string | null) => void
  disabled?: boolean
}

export function VusSelector({ value, onChange, disabled = false }: VusSelectorProps) {
  const { alert } = useConfirmDialog()
  const [vusList, setVusList] = useState<Vus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Форма для добавления нового ВУС
  const [newVusCode, setNewVusCode] = useState('')
  const [newVusName, setNewVusName] = useState('')
  const [newVusDescription, setNewVusDescription] = useState('')

  // Загрузка списка ВУС
  useEffect(() => {
    loadVusList()
  }, [])

  const loadVusList = async () => {
    try {
      const response = await fetch('/api/vus')
      const data = await response.json()

      if (response.ok) {
        setVusList(data.vus || [])
      } else {
        console.error('Failed to load VUS:', data.error)
      }
    } catch (error) {
      console.error('Error loading VUS:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNewVus = async () => {
    if (!newVusCode.trim()) {
      await alert({
        title: 'Укажите код ВУС',
        description: 'Код ВУС обязателен для заполнения',
        confirmText: 'Понятно',
        variant: 'warning',
      })
      return
    }

    if (!newVusName.trim()) {
      await alert({
        title: 'Укажите название',
        description: 'Название специальности обязательно для заполнения',
        confirmText: 'Понятно',
        variant: 'warning',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/vus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: newVusCode.trim(),
          name: newVusName.trim(),
          description: newVusDescription.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          await alert({
            title: 'ВУС уже существует',
            description: data.error || 'ВУС с таким кодом уже есть в справочнике',
            confirmText: 'Понятно',
            variant: 'warning',
          })
          return
        }

        throw new Error(data.error || 'Failed to create VUS')
      }

      // Сброс формы
      setNewVusCode('')
      setNewVusName('')
      setNewVusDescription('')
      setShowAddDialog(false)

      // Обновляем список
      await loadVusList()

      // Если ВУС был одобрен автоматически, выбираем его
      if (data.vus.is_approved) {
        onChange(data.vus.id)
        await alert({
          title: 'ВУС добавлен',
          description: 'Новая специальность успешно добавлена в справочник',
          confirmText: 'Отлично',
          variant: 'success',
        })
      } else {
        await alert({
          title: 'ВУС отправлен на модерацию',
          description:
            'Новая специальность будет доступна после проверки администратором',
          confirmText: 'Понятно',
          variant: 'info',
        })
      }
    } catch (error) {
      console.error('Error creating VUS:', error)
      await alert({
        title: 'Ошибка',
        description:
          error instanceof Error ? error.message : 'Не удалось добавить ВУС',
        confirmText: 'Закрыть',
        variant: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Загрузка списка ВУС...
      </div>
    )
  }

  const handleValueChange = (newValue: string) => {
    if (newValue === '__none__') {
      onChange(null)
    } else {
      onChange(newValue)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select
          value={value || '__none__'}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Выберите ВУС" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="__none__">Не указано</SelectItem>
            {vusList.map((vus) => (
              <SelectItem key={vus.id} value={vus.id}>
                {vus.code} - {vus.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowAddDialog(true)}
          disabled={disabled}
          title="Добавить новый ВУС"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Отображение описания выбранного ВУС */}
      {value && vusList.find((v) => v.id === value)?.description && (
        <p className="text-xs text-muted-foreground">
          {vusList.find((v) => v.id === value)?.description}
        </p>
      )}

      {/* Диалог добавления нового ВУС */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить новый ВУС</DialogTitle>
            <DialogDescription>
              Если нужной специальности нет в списке, вы можете добавить её самостоятельно.
              {' Администраторы создают ВУС сразу, остальные пользователи отправляют на модерацию.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Код ВУС */}
            <div className="space-y-2">
              <Label htmlFor="vus_code">
                Код ВУС <span className="text-destructive">*</span>
              </Label>
              <Input
                id="vus_code"
                type="text"
                value={newVusCode}
                onChange={(e) => setNewVusCode(e.target.value)}
                placeholder="Например: 021101"
                maxLength={10}
                required
              />
              <p className="text-xs text-muted-foreground">
                6-значный код военно-учётной специальности
              </p>
            </div>

            {/* Название */}
            <div className="space-y-2">
              <Label htmlFor="vus_name">
                Название <span className="text-destructive">*</span>
              </Label>
              <Input
                id="vus_name"
                type="text"
                value={newVusName}
                onChange={(e) => setNewVusName(e.target.value)}
                placeholder="Например: Стрелок"
                maxLength={255}
                required
              />
            </div>

            {/* Описание */}
            <div className="space-y-2">
              <Label htmlFor="vus_description">Описание (необязательно)</Label>
              <Textarea
                id="vus_description"
                value={newVusDescription}
                onChange={(e) => setNewVusDescription(e.target.value)}
                placeholder="Полное описание специальности"
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Кнопки */}
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleAddNewVus}
                disabled={isSubmitting || !newVusCode.trim() || !newVusName.trim()}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Добавление...
                  </>
                ) : (
                  'Добавить'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false)
                  setNewVusCode('')
                  setNewVusName('')
                  setNewVusDescription('')
                }}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
