'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Markdown } from '@/components/ui/markdown'

interface EditBiographyDialogProps {
  fallenId: string
  currentBiography: string | null
}

export function EditBiographyDialog({ fallenId, currentBiography }: EditBiographyDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [biography, setBiography] = useState(currentBiography || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/fallen/biography', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fallen_id: fallenId,
          biography_md: biography.trim() || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Ошибка при обновлении')
      }

      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          Редактировать
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Редактировать биографию</DialogTitle>
          <DialogDescription>
            Биография героя в формате Markdown. Поддерживаются заголовки, списки, выделение текста и т.д.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden space-y-4">
          <Tabs defaultValue="edit" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Редактирование</TabsTrigger>
              <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="flex-1 overflow-hidden flex flex-col mt-4">
              <div className="space-y-2 flex-1 flex flex-col overflow-hidden">
                <Label htmlFor="biography">Текст биографии (Markdown)</Label>
                <Textarea
                  id="biography"
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  placeholder="# Заголовок&#10;&#10;Текст биографии...&#10;&#10;## Подзаголовок&#10;&#10;- Список&#10;- Элементов"
                  className="flex-1 font-mono text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {biography.length} символов
                </p>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="flex-1 overflow-auto mt-4 border rounded-lg p-6 bg-background">
              {biography.trim() ? (
                <div className="prose prose-memorial max-w-none text-foreground/90 prose-p:text-foreground/80 prose-headings:text-foreground">
                  <Markdown content={biography} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-8">
                  Введите текст для предпросмотра
                </p>
              )}
            </TabsContent>
          </Tabs>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
