'use client'

import { useState } from 'react'
import { Upload, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface AvatarUploadProps {
  currentAvatarUrl: string | null
  userName: string
}

export function AvatarUpload({ currentAvatarUrl, userName }: AvatarUploadProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5 МБ')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)

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
          <Button disabled={uploading} asChild>
            <span className="cursor-pointer gap-2">
              <Upload className="h-4 w-4" />
              {uploading ? 'Загрузка...' : 'Загрузить фото'}
            </span>
          </Button>
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <p className="text-xs text-muted-foreground">
          JPG, PNG или WebP. Макс. 5 МБ.
        </p>
      </div>
    </div>
  )
}
