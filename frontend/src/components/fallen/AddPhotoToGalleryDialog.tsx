'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImagePlus, Loader2 } from 'lucide-react'
import { useConfirmDialog } from '@/components/ui/alert-dialog-custom'
import { compressImages } from '@/lib/imageCompression'

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
  const [isCompressing, setIsCompressing] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [compressedFiles, setCompressedFiles] = useState<File[]>([])
  const [caption, setCaption] = useState('')
  const [altText, setAltText] = useState('')
  const [compressionProgress, setCompressionProgress] = useState({ current: 0, total: 0 })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    setSelectedFiles(files)

    if (!files || files.length === 0) {
      setCompressedFiles([])
      return
    }

    // Автоматически сжимаем изображения при выборе
    setIsCompressing(true)
    setCompressionProgress({ current: 0, total: files.length })

    try {
      const filesArray = Array.from(files)
      const compressed = await compressImages(
        filesArray,
        { imageType: 'gallery' },
        (current, total) => {
          setCompressionProgress({ current, total })
        }
      )

      setCompressedFiles(compressed)
    } catch (error) {
      console.error('Error compressing images:', error)
      // Используем исходные файлы если сжатие не удалось
      setCompressedFiles(Array.from(files))
    } finally {
      setIsCompressing(false)
      setCompressionProgress({ current: 0, total: 0 })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (compressedFiles.length === 0) {
      await alert({
        title: 'Выберите фотографии',
        description: 'Выберите хотя бы одну фотографию',
        confirmText: 'Понятно',
        variant: 'warning',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('fallen_id', fallenId)
      formData.append('caption', caption)
      formData.append('alt_text', altText)

      // Добавляем сжатые файлы
      compressedFiles.forEach((file) => {
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
      setCompressedFiles([])
      setCaption('')
      setAltText('')

      // Показываем уведомление об успехе
      await alert({
        title: 'Изображения загружены',
        description: `Успешно загружено ${compressedFiles.length} ${compressedFiles.length === 1 ? 'изображение' : compressedFiles.length < 5 ? 'изображения' : 'изображений'}`,
        confirmText: 'Отлично',
        variant: 'success',
      })

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
        variant: 'error',
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
              disabled={isSubmitting || isCompressing}
            />
            {isCompressing && compressionProgress.total > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  Подготовка изображений: {compressionProgress.current} / {compressionProgress.total}
                </span>
              </div>
            )}
            {!isCompressing && compressedFiles.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Вы можете выбрать несколько фотографий
              </p>
            )}
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
              disabled={isSubmitting || isCompressing}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting || isCompressing} className="flex-1 gap-2">
              {isSubmitting || isCompressing ? (
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
