'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { ImagePlus, X, Loader2, AlertCircle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MemoryItemWithDetails } from '@/types'
import { useConfirmDialog } from '@/components/ui/alert-dialog-custom'

interface EditMemoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memory: MemoryItemWithDetails
  fallenId: string
  onSuccess?: () => void
}

const MAX_WORDS = 3000
const MAX_PHOTOS = 10

export function EditMemoryForm({ open, onOpenChange, memory, fallenId, onSuccess }: EditMemoryFormProps) {
  const { confirm } = useConfirmDialog()
  const [title, setTitle] = useState(memory.title || '')
  const [content, setContent] = useState(memory.content_md || '')
  const [existingPhotos, setExistingPhotos] = useState<any[]>(memory.media || [])
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([])
  const [newPhotos, setNewPhotos] = useState<File[]>([])
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when memory changes
  useEffect(() => {
    setTitle(memory.title || '')
    setContent(memory.content_md || '')
    setExistingPhotos(memory.media || [])
    setDeletedPhotoIds([])
    setNewPhotos([])
    setNewPhotoPreviews([])
    setError(null)
  }, [memory])

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const isOverLimit = wordCount > MAX_WORDS

  const activeExistingPhotos = existingPhotos.filter(
    (photo) => !deletedPhotoIds.includes(photo.id)
  )
  const totalPhotos = activeExistingPhotos.length + newPhotos.length

  const handleNewPhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remainingSlots = MAX_PHOTOS - totalPhotos

    if (files.length > remainingSlots) {
      setError(`Можно добавить ещё максимум ${remainingSlots} фотографий`)
      return
    }

    const photosToAdd = files.slice(0, remainingSlots)
    setNewPhotos((prev) => [...prev, ...photosToAdd])

    // Создаем превью
    photosToAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewPhotoPreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    setError(null)
  }, [totalPhotos])

  const removeNewPhoto = useCallback((index: number) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index))
    setNewPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const markExistingPhotoForDeletion = useCallback((photoId: string) => {
    setDeletedPhotoIds((prev) => [...prev, photoId])
  }, [])

  const unmarkExistingPhotoForDeletion = useCallback((photoId: string) => {
    setDeletedPhotoIds((prev) => prev.filter((id) => id !== photoId))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Введите заголовок воспоминания')
      return
    }

    if (!content.trim()) {
      setError('Введите описание воспоминания')
      return
    }

    if (isOverLimit) {
      setError(`Превышен лимит слов (${wordCount}/${MAX_WORDS})`)
      return
    }

    setIsSubmitting(true)

    try {
      let newMediaIds: string[] = []

      // Загружаем новые фотографии, если они есть
      if (newPhotos.length > 0) {
        const photoFormData = new FormData()
        photoFormData.append('fallen_id', fallenId)
        newPhotos.forEach((photo) => {
          photoFormData.append('photos', photo)
        })

        const uploadResponse = await fetch('/api/upload-photos', {
          method: 'POST',
          body: photoFormData,
        })

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json()
          throw new Error(uploadError.error || 'Failed to upload photos')
        }

        const uploadData = await uploadResponse.json()
        newMediaIds = uploadData.mediaIds || []
      }

      // Обновляем воспоминание
      const response = await fetch(`/api/memories/${memory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content_md: content.trim(),
          deleted_media_ids: deletedPhotoIds,
          new_media_ids: newMediaIds,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update memory')
      }

      onOpenChange(false)
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении воспоминания. Попробуйте ещё раз.')
      console.error('Error updating memory:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = async () => {
    const hasChanges =
      title !== memory.title ||
      content !== memory.content_md ||
      deletedPhotoIds.length > 0 ||
      newPhotos.length > 0

    if (!hasChanges) {
      onOpenChange(false)
      return
    }

    const confirmed = await confirm({
      title: 'Отменить редактирование',
      description: 'Вы уверены, что хотите отменить редактирование? Все изменения будут потеряны.',
      confirmText: 'Отменить',
      cancelText: 'Продолжить редактирование',
      variant: 'destructive',
    })

    if (confirmed) {
      setTitle(memory.title || '')
      setContent(memory.content_md || '')
      setExistingPhotos(memory.media || [])
      setDeletedPhotoIds([])
      setNewPhotos([])
      setNewPhotoPreviews([])
      setError(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать воспоминание</DialogTitle>
          <DialogDescription>
            Внесите изменения в воспоминание. Вы можете отредактировать текст, удалить или добавить фотографии.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-title">Заголовок</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: «Последний звонок в школе №3»"
              maxLength={200}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-content">Текст воспоминания</Label>
              <span
                className={cn(
                  'text-xs',
                  isOverLimit ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                {wordCount} / {MAX_WORDS} слов
              </span>
            </div>
            <Textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Поделитесь историей, воспоминаниями, важными фактами..."
              className="min-h-[200px]"
              disabled={isSubmitting}
            />
          </div>

          {/* Existing Photos */}
          {existingPhotos.length > 0 && (
            <div className="space-y-2">
              <Label>Текущие фотографии ({activeExistingPhotos.length})</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {existingPhotos.map((photo) => {
                  const isMarkedForDeletion = deletedPhotoIds.includes(photo.id)
                  return (
                    <div
                      key={photo.id}
                      className={cn(
                        'group relative aspect-square overflow-hidden rounded-lg border',
                        isMarkedForDeletion
                          ? 'border-destructive bg-destructive/10 opacity-50'
                          : 'border-border/50 bg-background'
                      )}
                    >
                      {photo.file_url && (
                        <img
                          src={photo.file_url}
                          alt={photo.alt_text || ''}
                          className="h-full w-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        {isMarkedForDeletion ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-7 w-7 bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => unmarkExistingPhotoForDeletion(photo.id)}
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-7 w-7 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => markExistingPhotoForDeletion(photo.id)}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {isMarkedForDeletion && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="rounded-full bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground">
                            Будет удалено
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* New Photos */}
          {newPhotos.length > 0 && (
            <div className="space-y-2">
              <Label>Новые фотографии ({newPhotos.length})</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {newPhotoPreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-border/50 bg-background"
                  >
                    <img
                      src={preview}
                      alt={`Новое фото ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-7 w-7 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => removeNewPhoto(index)}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Photos Button */}
          {totalPhotos < MAX_PHOTOS && (
            <div className="space-y-2">
              <Label>
                {existingPhotos.length > 0 || newPhotos.length > 0
                  ? 'Добавить ещё фотографии'
                  : 'Добавить фотографии'}{' '}
                (осталось мест: {MAX_PHOTOS - totalPhotos})
              </Label>
              <label
                htmlFor="new-photos"
                className={cn(
                  'flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-background/50 px-4 py-8 transition-colors hover:border-primary/50 hover:bg-background/80',
                  isSubmitting && 'pointer-events-none opacity-50'
                )}
              >
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Выберите фотографии (до {MAX_PHOTOS - totalPhotos} шт.)
                </span>
                <input
                  id="new-photos"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleNewPhotoChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting || isOverLimit}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                'Сохранить изменения'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
