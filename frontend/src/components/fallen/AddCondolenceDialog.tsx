'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { Loader2, BookHeart } from 'lucide-react'
import { useAuthModal } from '@/contexts/AuthModalContext'

interface AddCondolenceDialogProps {
  fallenId: string
  isOpen: boolean
  onClose: () => void
}

export function AddCondolenceDialog({ fallenId, isOpen, onClose }: AddCondolenceDialogProps) {
  const router = useRouter()
  const { openAuthModal } = useAuthModal()
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [relationshipToHero, setRelationshipToHero] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/fallen/${fallenId}/condolences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          relationship_to_hero: relationshipToHero.trim() || null,
        }),
      })

      if (response.status === 401) {
        openAuthModal()
        return
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ошибка отправки соболезнования')
      }

      // Успешно отправлено
      setContent('')
      setRelationshipToHero('')
      onClose()
      router.refresh()

      alert(
        'Соболезнование отправлено на модерацию.\nОно будет опубликовано после одобрения владельцем карточки.'
      )
    } catch (error: any) {
      console.error('Error submitting condolence:', error)
      alert(error.message || 'Не удалось отправить соболезнование')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setContent('')
      setRelationshipToHero('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <BookHeart className="h-5 w-5 text-amber-500" />
            Оставить соболезнование
          </DialogTitle>
          <DialogDescription className="text-sm">
            Выразите слова поддержки и скорби. Соболезнование будет опубликовано после модерации
            владельцем карточки.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ваша связь с героем */}
          <div className="space-y-2">
            <Label htmlFor="relationship">Ваша связь с героем (опционально)</Label>
            <Input
              id="relationship"
              value={relationshipToHero}
              onChange={(e) => setRelationshipToHero(e.target.value)}
              placeholder="Сослуживец, Друг, Родственник, Земляк..."
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Например: "Сослуживец", "Друг семьи", "Земляк"
            </p>
          </div>

          {/* Текст соболезнования */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Соболезнование <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Выразите искренние слова поддержки и скорби...

Примеры:
• Светлая память. Земля пухом. Соболезнования родным и близким.
• Вечная память герою! Помним, скорбим...
• Царствие Небесное. Покойся с миром, братишка."
              rows={8}
              maxLength={5000}
              className="resize-none text-sm sm:text-base"
              required
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Минимум 10 символов</span>
              <span>
                {content.length}/5000
                {content.length < 10 && content.length > 0 && (
                  <span className="ml-2 text-destructive">Слишком коротко</span>
                )}
              </span>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading || content.trim().length < 10}
              className="w-full bg-amber-600 hover:bg-amber-700 sm:w-auto"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Отправить на модерацию
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
