'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookHeart, Plus, Sparkles } from 'lucide-react'
import { MemoryCard } from './MemoryCard'
import { AddMemoryForm } from './AddMemoryForm'
import type { MemoryItemWithDetails } from '@/types'

interface MemoryBoardProps {
  memories: MemoryItemWithDetails[]
  fallenId: string
  className?: string
}

export function MemoryBoard({ memories, fallenId, className }: MemoryBoardProps) {
  const [showAddForm, setShowAddForm] = useState(false)

  const approvedMemories =
    memories?.filter((memory) => memory.status === 'approved' && !memory.is_deleted) || []

  const handleAddMemory = () => {
    setShowAddForm(true)
  }

  const handleMemorySuccess = () => {
    // TODO: Обновить список воспоминаний после успешного добавления
    console.log('Memory added successfully - refresh needed')
  }

  const handleAddAddition = (memoryId: string) => {
    // TODO: Открыть форму добавления дополнения к воспоминанию
    console.log('Add addition to memory:', memoryId)
  }

  const handleAddComment = (
    entityType: 'memory' | 'addition',
    entityId: string,
    parentId?: string
  ) => {
    // TODO: Открыть форму добавления комментария
    console.log('Add comment to', entityType, entityId, 'parent:', parentId)
  }

  if (approvedMemories.length === 0) {
    return (
      <>
        <Card className={className}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <BookHeart className="h-5 w-5" />
              </div>
              <CardTitle>Доска памяти</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 rounded-2xl border border-border/40 bg-background-soft/70 px-6 py-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <BookHeart className="h-8 w-8 text-primary" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Здесь будут храниться воспоминания
                </h3>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-foreground/70">
                  Поделитесь своими воспоминаниями о герое. Ваши истории, фотографии и рассказы
                  помогут сохранить живую память о человеке.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <Button onClick={handleAddMemory} size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Добавить первое воспоминание
                </Button>
                <p className="text-xs text-foreground/50">
                  Воспоминания сразу публикуются на странице
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <AddMemoryForm
          open={showAddForm}
          onOpenChange={setShowAddForm}
          fallenId={fallenId}
          onSuccess={handleMemorySuccess}
        />
      </>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <BookHeart className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Доска памяти</CardTitle>
                <p className="mt-1 text-sm text-foreground/60">
                  {approvedMemories.length}{' '}
                  {approvedMemories.length === 1
                    ? 'воспоминание'
                    : approvedMemories.length < 5
                      ? 'воспоминания'
                      : 'воспоминаний'}
                </p>
              </div>
            </div>

            <Button onClick={handleAddMemory} className="gap-2">
              <Plus className="h-4 w-4" />
              Добавить
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {approvedMemories.length > 0 && (
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Поделитесь своей историей
                    </p>
                    <p className="text-xs leading-relaxed text-foreground/70">
                      Вы можете добавить воспоминание, дополнить существующие истории или оставить
                      комментарий. Все материалы сразу публикуются на странице.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {approvedMemories.map((memory) => (
                <MemoryCard
                  key={memory.id}
                  memory={memory}
                  fallenId={fallenId}
                  onAddAddition={handleAddAddition}
                  onAddComment={handleAddComment}
                  onMemoryDeleted={handleMemorySuccess}
                />
              ))}
            </div>

            {approvedMemories.length > 0 && (
              <div className="flex justify-center pt-4">
                <Button onClick={handleAddMemory} variant="outline" size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Добавить воспоминание
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AddMemoryForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        fallenId={fallenId}
        onSuccess={handleMemorySuccess}
      />
    </>
  )
}
