'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthModal } from '@/contexts/AuthModalContext'

interface AddConnectionDialogProps {
  fallenId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const relationshipOptions = [
  { value: 'spouse', label: 'Супруг(а)' },
  { value: 'parent', label: 'Родитель' },
  { value: 'child', label: 'Ребёнок' },
  { value: 'sibling', label: 'Брат/Сестра' },
  { value: 'grandparent', label: 'Дедушка/Бабушка' },
  { value: 'grandchild', label: 'Внук/Внучка' },
  { value: 'uncle_aunt', label: 'Дядя/Тётя' },
  { value: 'nephew_niece', label: 'Племянник/Племянница' },
  { value: 'cousin', label: 'Двоюродный брат/сестра' },
  { value: 'other', label: 'Другое родство' },
]

export function AddConnectionDialog({ fallenId, open, onOpenChange }: AddConnectionDialogProps) {
  const router = useRouter()
  const { openAuthModal } = useAuthModal()
  const [loading, setLoading] = useState(false)
  const [connectionType, setConnectionType] = useState<string>('')
  const [relationship, setRelationship] = useState<string>('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!connectionType) {
      alert('Выберите тип связи')
      return
    }

    if (connectionType === 'relative' && !relationship) {
      alert('Для родственников необходимо указать степень родства')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/fallen/${fallenId}/connections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connection_type: connectionType,
          relationship: connectionType === 'relative' ? relationship : null,
          description,
        }),
      })

      if (response.status === 401) {
        alert('Необходимо авторизоваться')
        openAuthModal()
        return
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ошибка создания связи')
      }

      alert('Связь создана и отправлена на модерацию')
      onOpenChange(false)
      setConnectionType('')
      setRelationship('')
      setDescription('')
      router.refresh()
    } catch (error) {
      console.error('Error creating connection:', error)
      alert(error instanceof Error ? error.message : 'Не удалось создать связь')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить связь с героем</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Тип связи</Label>
            <Select value={connectionType} onValueChange={setConnectionType}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип связи" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relative">Родственник</SelectItem>
                <SelectItem value="friend">Друг</SelectItem>
                <SelectItem value="fellow_soldier">Сослуживец</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {connectionType === 'relative' && (
            <div className="space-y-2">
              <Label>Степень родства</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите степень родства" />
                </SelectTrigger>
                <SelectContent>
                  {relationshipOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Описание (опционально)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Расскажите о вашей связи с героем..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Отправить на модерацию
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
