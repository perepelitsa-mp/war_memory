'use client'

import { useState } from 'react'
import { Upload, User, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { compressImage } from '@/lib/imageCompression'

interface AvatarUploadProps {
  currentAvatarUrl: string | null
  userName: string
}

export function AvatarUpload({ currentAvatarUrl, userName }: AvatarUploadProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [compressing, setCompressing] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    // Сжимаем изображение перед загрузкой
    setCompressing(true)
    let compressedFile: File
    try {
      compressedFile = await compressImage(file, { imageType: 'avatar' })
    } catch (error) {
      console.error('Error compressing avatar:', error)
      alert('Не удалось подготовить изображение. Попробуйте другой файл.')
      setCompressing(false)
      return
    } finally {
      setCompressing(false)
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', compressedFile)

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Ошибка загрузки аватара')
      }

      router.refresh()
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Не удалось загрузить аватар')
    } finally {
      setUploading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="flex items-center gap-6">
      <Avatar className="h-24 w-24 border-2 border-border">
        <AvatarImage src={currentAvatarUrl || undefined} />
        <AvatarFallback className="bg-primary/10 text-lg font-semibold">
          {getInitials(userName)}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <label htmlFor="avatar-upload">
          <Button disabled={uploading || compressing} asChild>
            <span className="cursor-pointer gap-2">
              {compressing || uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {compressing || uploading ? 'Загрузка...' : 'Загрузить фото'}
            </span>
          </Button>
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading || compressing}
        />
        <p className="text-xs text-muted-foreground">
          JPG, PNG или WebP
        </p>
      </div>
    </div>
  )
}
