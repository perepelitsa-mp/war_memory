'use client'

import { useState, useCallback } from 'react'
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
import { ImagePlus, X, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConfirmDialog } from '@/components/ui/alert-dialog-custom'
import { compressImages } from '@/lib/imageCompression'

interface AddMemoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fallenId: string
  onSuccess?: () => void
}

const MAX_WORDS = 3000
const MAX_PHOTOS = 10

export function AddMemoryForm({ open, onOpenChange, fallenId, onSuccess }: AddMemoryFormProps) {
  const { confirm } = useConfirmDialog()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const isOverLimit = wordCount > MAX_WORDS

  const handlePhotoChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remainingSlots = MAX_PHOTOS - photos.length

    if (files.length > remainingSlots) {
      setError(`Можно добавить ещё максимум ${remainingSlots} фотографий`)
      return
    }

    const filesToCompress = files.slice(0, remainingSlots)

    // Сжимаем изображения перед созданием превью
    setCompressing(true)
    let compressedPhotos: File[]
    try {
      compressedPhotos = await compressImages(filesToCompress, { imageType: 'gallery' })
    } catch (error) {
      console.error('Error compressing memory photos:', error)
      setError('Не удалось подготовить некоторые изображения. Попробуйте другие файлы.')
      setCompressing(false)
      return
    } finally {
      setCompressing(false)
    }

    setPhotos((prev) => [...prev, ...compressedPhotos])

    // Создаем превью из сжатых файлов
    compressedPhotos.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    setError(null)
  }, [photos.length])

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
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
      let mediaIds: string[] = []

      // Сначала загружаем фотографии, если они есть
      if (photos.length > 0) {
        const photoFormData = new FormData()
        photoFormData.append('fallen_id', fallenId)
        photos.forEach((photo) => {
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
        mediaIds = uploadData.mediaIds || []
      }

      // Затем создаем воспоминание с ID загруженных фото
      const response = await fetch('/api/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fallen_id: fallenId,
          title: title.trim(),
          content_md: content.trim(),
          media_ids: mediaIds,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create memory')
      }

      // Сброс формы
      setTitle('')
      setContent('')
      setPhotos([])
      setPhotoPreviews([])
      onOpenChange(false)

      // Обновляем страницу для отображения нового воспоминания
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении воспоминания. Попробуйте ещё раз.')
      console.error('Error submitting memory:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (
      !title &&
      !content &&
      photos.length === 0
    ) {
      onOpenChange(false)
      return
    }

    const confirmed = await confirm({
      title: 'Отменить добавление воспоминания',
      description: 'Вы уверены? Все введённые данные будут потеряны.',
      confirmText: 'Отменить',
      cancelText: 'Продолжить редактирование',
      variant: 'destructive',
    })

    if (confirmed) {
      setTitle('')
      setContent('')
      setPhotos([])
      setPhotoPreviews([])
      setError(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Добавить воспоминание</DialogTitle>
          <DialogDescription>
            Поделитесь своими воспоминаниями о герое. Ваша история будет сразу опубликована на
            странице.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Заголовок <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Например: 'Наша служба вместе' или 'Воспоминания из детства'"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/255 символов
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">
              Описание воспоминания <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Напишите ваше воспоминание... Вы можете использовать Markdown для форматирования."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              disabled={isSubmitting}
              className={cn(isOverLimit && 'border-destructive focus-visible:ring-destructive')}
              required
            />
            <div className="flex items-center justify-between text-xs">
              <p className="text-muted-foreground">Поддерживается форматирование Markdown</p>
              <p
                className={cn(
                  'font-medium',
                  isOverLimit ? 'text-destructive' : 'text-muted-foreground',
                )}
              >
                {wordCount}/{MAX_WORDS} слов
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Фотографии (до {MAX_PHOTOS})</Label>

            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                    <img
                      src={preview}
                      alt={`Фото ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute right-2 top-2 rounded-full bg-destructive/90 p-1 text-destructive-foreground opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photos.length < MAX_PHOTOS && (
              <div>
                <input
                  type="file"
                  id="photos"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={isSubmitting || compressing}
                />
                <Label
                  htmlFor="photos"
                  className={cn(
                    'flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background-soft/50 px-6 py-8 text-sm transition-colors hover:border-primary hover:bg-background-soft',
                    (isSubmitting || compressing) && 'cursor-not-allowed opacity-50',
                  )}
                >
                  {compressing ? (
                    <>
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      <span className="text-muted-foreground">
                        Загрузка изображений...
                      </span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Добавить фотографии ({photos.length}/{MAX_PHOTOS})
                      </span>
                    </>
                  )}
                </Label>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting || isOverLimit || compressing}>
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
