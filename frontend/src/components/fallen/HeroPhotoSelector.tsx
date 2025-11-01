'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Check, ImageIcon, Upload, X, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { compressImage } from '@/lib/imageCompression'

interface FallenMedia {
  id: string
  file_url: string | null
  alt_text?: string | null
  caption?: string | null
}

interface HeroPhotoSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPhotoUrl: string | null
  fallenId: string
  onSelect: (photoUrl: string) => void
}

export function HeroPhotoSelector({
  open,
  onOpenChange,
  currentPhotoUrl,
  fallenId,
  onSelect,
}: HeroPhotoSelectorProps) {
  const [photos, setPhotos] = useState<FallenMedia[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [selectedUrl, setSelectedUrl] = useState<string | null>(currentPhotoUrl)
  const [activeTab, setActiveTab] = useState<string>('gallery')

  // Загрузка фото из галереи
  useEffect(() => {
    if (!open) {
      // Сбрасываем состояние при закрытии
      setPhotos([])
      setSelectedUrl(currentPhotoUrl)
      setActiveTab('gallery') // Сбрасываем на вкладку галереи
      return
    }

    // Устанавливаем текущее фото при открытии
    setSelectedUrl(currentPhotoUrl)

    const fetchPhotos = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/fallen/${fallenId}/media?type=photo`)
        if (response.ok) {
          const data = await response.json()
          console.log('Loaded photos:', data.media?.length || 0, data.media)
          setPhotos(data.media || [])
        } else {
          console.error('Failed to fetch photos:', response.status)
        }
      } catch (error) {
        console.error('Ошибка загрузки фото:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [open, fallenId, currentPhotoUrl])

  // Загрузка нового фото
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    // Сжимаем изображение перед загрузкой
    setCompressing(true)
    let compressedFile: File
    try {
      compressedFile = await compressImage(file, { imageType: 'hero' })
    } catch (error) {
      console.error('Error compressing image:', error)
      alert('Не удалось подготовить изображение. Попробуйте другой файл.')
      setCompressing(false)
      return
    } finally {
      setCompressing(false)
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('photos', compressedFile) // API ожидает 'photos' (множественное число)
      formData.append('fallen_id', fallenId) // API ожидает 'fallen_id' (snake_case)
      formData.append('caption', 'Фотография профиля')

      const response = await fetch('/api/upload-photos', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка загрузки')
      }

      const data = await response.json()

      // API теперь возвращает массив uploaded с полными данными
      if (!data.uploaded || data.uploaded.length === 0) {
        throw new Error('Не удалось загрузить фото')
      }

      const newPhoto = data.uploaded[0]
      const newPhotoUrl = newPhoto.file_url

      if (newPhotoUrl && newPhoto) {
        setSelectedUrl(newPhotoUrl)
        // Обновляем список фото
        setPhotos((prev) => [
          {
            id: newPhoto.id,
            file_url: newPhotoUrl,
            caption: newPhoto.caption || 'Фотография профиля',
          },
          ...prev,
        ])
        // Переключаемся на вкладку галереи, чтобы показать загруженное фото
        setActiveTab('gallery')
      }
    } catch (error) {
      console.error('Ошибка загрузки фото:', error)
      alert('Не удалось загрузить фото')
    } finally {
      setUploading(false)
    }
  }

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Выбор фотографии профиля</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery">Из галереи</TabsTrigger>
            <TabsTrigger value="upload">Загрузить новое</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-4">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Загрузка фотографий...</p>
                </div>
              ) : photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Нет фотографий в галерее</p>
                  <p className="text-sm text-muted-foreground">
                    Загрузите новое фото во вкладке &quot;Загрузить новое&quot;
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setSelectedUrl(photo.file_url)}
                      className={cn(
                        'relative aspect-[3/4] overflow-hidden rounded-lg border-2 transition-all hover:scale-105',
                        selectedUrl === photo.file_url
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {photo.file_url && (
                        <Image
                          src={photo.file_url}
                          alt={photo.alt_text || 'Фото'}
                          fill
                          className="object-cover"
                        />
                      )}
                      {selectedUrl === photo.file_url && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="rounded-full bg-primary p-2">
                            <Check className="h-6 w-6 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg p-8 space-y-4">
              {compressing || uploading ? (
                <>
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <p className="text-sm font-medium">Загрузка изображения...</p>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium">
                      Перетащите изображение сюда или нажмите кнопку
                    </p>
                  </div>
                  <label htmlFor="photo-upload">
                    <Button type="button" disabled={uploading || compressing} asChild>
                      <span className="cursor-pointer">Выбрать файл</span>
                    </Button>
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading || compressing}
                  />
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSelect} disabled={!selectedUrl}>
            Выбрать фото
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
