'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, AlertCircle } from 'lucide-react'
import { useConfirmDialog } from '@/components/ui/alert-dialog-custom'

interface AddCommentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fallenId?: string
  memoryItemId?: string
  memoryAdditionId?: string
  parentId?: string
  onSuccess?: () => void
}

const MAX_LENGTH = 2000

export function AddCommentDialog({
  open,
  onOpenChange,
  fallenId,
  memoryItemId,
  memoryAdditionId,
  parentId,
  onSuccess,
}: AddCommentDialogProps) {
  const { confirm } = useConfirmDialog()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!content.trim()) {
      setError('Введите текст комментария')
      return
    }

    if (content.length > MAX_LENGTH) {
      setError(`Превышен лимит символов (${content.length}/${MAX_LENGTH})`)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fallen_id: fallenId || null,
          memory_item_id: memoryItemId || null,
          memory_addition_id: memoryAdditionId || null,
          content: content.trim(),
          parent_id: parentId || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create comment')
      }

      // Сброс формы
      setContent('')
      onOpenChange(false)

      // Обновляем страницу для отображения нового комментария
      window.location.reload()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ошибка при сохранении комментария. Попробуйте ещё раз.'
      )
      console.error('Error submitting comment:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (!content) {
      onOpenChange(false)
      return
    }

    const confirmed = await confirm({
      title: 'Отменить добавление комментария',
      description: 'Вы уверены? Все введённые данные будут потеряны.',
      confirmText: 'Отменить',
      cancelText: 'Продолжить редактирование',
      variant: 'destructive',
    })

    if (confirmed) {
      setContent('')
      setError(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Добавить комментарий</DialogTitle>
          <DialogDescription>
            {parentId ? 'Ответьте на комментарий' : 'Оставьте свой комментарий к воспоминанию'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">
              Текст комментария <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Напишите ваш комментарий..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              disabled={isSubmitting}
              maxLength={MAX_LENGTH}
              required
            />
            <p className="text-xs text-muted-foreground">
              {content.length}/{MAX_LENGTH} символов
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Публикация...
                </>
              ) : (
                'Опубликовать'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
