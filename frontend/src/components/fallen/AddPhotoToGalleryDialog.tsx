'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImagePlus, Loader2 } from 'lucide-react'
import { useConfirmDialog } from '@/components/ui/alert-dialog-custom'

interface AddPhotoToGalleryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fallenId: string
  onSuccess?: () => void
}

export function AddPhotoToGalleryDialog({
  open,
  onOpenChange,
  fallenId,
  onSuccess,
}: AddPhotoToGalleryDialogProps) {
  const { alert } = useConfirmDialog()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [caption, setCaption] = useState('')
  const [altText, setAltText] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFiles || selectedFiles.length === 0) {
      await alert({
        title: 'Выберите фотографии',
        description: 'Выберите хотя бы одну фотографию',
        confirmText: 'Понятно',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('fallen_id', fallenId)
      formData.append('caption', caption)
      formData.append('alt_text', altText)

      // Добавляем все выбранные файлы
      Array.from(selectedFiles).forEach((file) => {
        formData.append('photos', file)
      })

      const response = await fetch('/api/upload-photos', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Не удалось загрузить фотографии')
      }

      // Очистка формы
      setSelectedFiles(null)
      setCaption('')
      setAltText('')
      onOpenChange(false)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error uploading photos:', error)
      await alert({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить фотографии',
        confirmText: 'Закрыть',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5" />
            Добавить фотографии в галерею
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="photos">Фотографии *</Label>
            <Input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Вы можете выбрать несколько фотографий
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Подпись (необязательно)</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Краткое описание фотографии..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alt_text">Alt-текст (необязательно)</Label>
            <Input
              id="alt_text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Описание для доступности"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" />
                  Добавить
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
