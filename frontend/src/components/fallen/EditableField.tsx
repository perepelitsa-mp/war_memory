'use client'

import { useState } from 'react'
import { Check, Pencil, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useConfirmDialog } from '@/components/ui/alert-dialog-custom'
import { cn } from '@/lib/utils'

interface EditableFieldProps {
  label: string
  value: string | null | undefined
  fieldName: string
  fallenId: string
  canEdit: boolean
  type?: 'text' | 'date' | 'textarea' | 'select'
  selectOptions?: { value: string; label: string }[]
  onUpdate?: () => void
  className?: string
}

export function EditableField({
  label,
  value,
  fieldName,
  fallenId,
  canEdit,
  type = 'text',
  selectOptions = [],
  onUpdate,
  className,
}: EditableFieldProps) {
  const { alert } = useConfirmDialog()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (editValue === (value || '')) {
      setIsEditing(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/fallen/${fallenId}/update-field`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field: fieldName,
          value: editValue || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Не удалось обновить поле')
      }

      setIsEditing(false)
      if (onUpdate) {
        onUpdate()
      } else {
        // Reload page if no custom update handler
        window.location.reload()
      }
    } catch (error) {
      console.error('Error updating field:', error)
      await alert({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить поле',
        confirmText: 'Закрыть',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value || '')
    setIsEditing(false)
  }

  if (!canEdit) {
    return (
      <div className={cn('space-y-1', className)}>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base text-foreground">{value || '—'}</p>
      </div>
    )
  }

  if (!isEditing) {
    return (
      <div className={cn('group space-y-1', className)}>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex items-start gap-2">
          <p className="flex-1 text-base text-foreground">{value || '—'}</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex items-start gap-2">
        {type === 'textarea' ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            disabled={isLoading}
            className="flex-1"
            rows={4}
          />
        ) : type === 'select' ? (
          <Select
            value={editValue}
            onValueChange={setEditValue}
            disabled={isLoading}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Выберите значение" />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
        )}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
            onClick={handleSave}
            disabled={isLoading}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
