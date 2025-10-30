'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface ProfileFormProps {
  initialData: {
    full_name: string
    phone: string
    bio: string
    show_phone?: boolean
    whatsapp_link?: string
    show_whatsapp?: boolean
    telegram_link?: string
    show_telegram?: boolean
    vk_link?: string
    show_vk?: boolean
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(initialData)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Ошибка обновления профиля')
      }

      alert('Профиль успешно обновлен')
      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Не удалось обновить профиль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">ФИО</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          placeholder="Иванов Иван Иванович"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Телефон</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+7 (999) 123-45-67"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">О себе</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Расскажите немного о себе..."
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="space-y-4 rounded-lg border border-border/50 bg-background/50 p-4">
        <h3 className="text-sm font-semibold">Настройки приватности</h3>

        {/* Show phone toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="show_phone"
            checked={formData.show_phone || false}
            onChange={(e) => setFormData({ ...formData, show_phone: e.target.checked })}
            className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
          />
          <Label htmlFor="show_phone" className="cursor-pointer text-sm font-normal">
            Показывать номер телефона в профиле
          </Label>
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label htmlFor="whatsapp_link">WhatsApp</Label>
          <Input
            id="whatsapp_link"
            value={formData.whatsapp_link || ''}
            onChange={(e) => setFormData({ ...formData, whatsapp_link: e.target.value })}
            placeholder="https://wa.me/79123456789"
          />
          <p className="text-xs text-muted-foreground">
            Укажите ссылку вида: https://wa.me/79123456789 (код страны + номер без +)
          </p>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show_whatsapp"
              checked={formData.show_whatsapp || false}
              onChange={(e) => setFormData({ ...formData, show_whatsapp: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
            <Label htmlFor="show_whatsapp" className="cursor-pointer text-sm font-normal">
              Показывать WhatsApp в профиле
            </Label>
          </div>
        </div>

        {/* Telegram */}
        <div className="space-y-2">
          <Label htmlFor="telegram_link">Telegram</Label>
          <Input
            id="telegram_link"
            value={formData.telegram_link || ''}
            onChange={(e) => setFormData({ ...formData, telegram_link: e.target.value })}
            placeholder="https://t.me/username"
          />
          <p className="text-xs text-muted-foreground">
            Укажите ссылку вида: https://t.me/username (ваш username в Telegram)
          </p>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show_telegram"
              checked={formData.show_telegram || false}
              onChange={(e) => setFormData({ ...formData, show_telegram: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
            <Label htmlFor="show_telegram" className="cursor-pointer text-sm font-normal">
              Показывать Telegram в профиле
            </Label>
          </div>
        </div>

        {/* VK */}
        <div className="space-y-2">
          <Label htmlFor="vk_link">ВКонтакте</Label>
          <Input
            id="vk_link"
            value={formData.vk_link || ''}
            onChange={(e) => setFormData({ ...formData, vk_link: e.target.value })}
            placeholder="https://vk.com/id123456"
          />
          <p className="text-xs text-muted-foreground">
            Укажите ссылку на ваш профиль: https://vk.com/id123456 или https://vk.com/username
          </p>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show_vk"
              checked={formData.show_vk || false}
              onChange={(e) => setFormData({ ...formData, show_vk: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
            <Label htmlFor="show_vk" className="cursor-pointer text-sm font-normal">
              Показывать ВКонтакте в профиле
            </Label>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Сохранить изменения
      </Button>
    </form>
  )
}
