'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Markdown } from '@/components/ui/markdown'
import { PhotoSlider } from '@/components/fallen/PhotoSlider'
import { Heart, ImageIcon, Plus, MessageCircle, ChevronDown, ChevronUp, Trash2, Pencil } from 'lucide-react'
import type { MemoryItemWithDetails, MemoryAdditionWithDetails, CommentWithAuthor } from '@/types'
import { cn } from '@/lib/utils'
import { useCanDeleteContent } from '@/hooks/useCanDeleteContent'
import { useConfirmDialog } from '@/components/ui/alert-dialog-custom'

interface MemoryCardProps {
  memory: MemoryItemWithDetails
  fallenId: string
  onAddAddition?: (memoryId: string) => void
  onAddComment?: (entityType: 'memory' | 'addition', entityId: string, parentId?: string) => void
  onEditMemory?: (memory: MemoryItemWithDetails) => void
  onMemoryDeleted?: () => void
}

interface MemoryCommentProps {
  comment: CommentWithAuthor
  depth?: number
  onReply?: (commentId: string) => void
  canDelete?: boolean
  onDelete?: (commentId: string) => void
}

function MemoryComment({ comment, depth = 0, onReply, canDelete, onDelete }: MemoryCommentProps) {
  const { confirm } = useConfirmDialog()
  const [isDeleting, setIsDeleting] = useState(false)
  const maxDepth = 3
  const isNested = depth > 0
  const canReply = depth < maxDepth

  const initials = comment.author.full_name
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleDelete = async () => {
    if (!onDelete) {
      return
    }

    const confirmed = await confirm({
      title: 'Удалить комментарий',
      description: 'Вы уверены, что хотите удалить этот комментарий?',
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      variant: 'destructive',
    })

    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    await onDelete(comment.id)
    setIsDeleting(false)
  }

  return (
    <div className={cn(isNested && 'ml-4 mt-2.5 sm:ml-6 sm:mt-3')}>
      <Card
        className={cn(
          'border border-border/30 bg-background-soft/60 shadow-sm',
          isNested && 'border-l-2 border-l-primary/40'
        )}
      >
        <CardContent className="space-y-2.5 pt-3 sm:space-y-3 sm:pt-4">
          <div className="flex gap-2 sm:gap-3">
            <Avatar className="h-7 w-7 flex-shrink-0 shadow-sm sm:h-8 sm:w-8">
              <AvatarImage src={comment.author.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary sm:text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="truncate text-sm font-semibold text-foreground">
                  {comment.author.full_name}
                </span>
                <span className="flex-shrink-0 text-[11px] text-foreground/50 sm:text-xs">{formatDate(comment.created_at)}</span>
              </div>

              <p className="break-words text-sm leading-relaxed text-foreground/95 whitespace-pre-wrap">
                {comment.content}
              </p>

              <div className="flex gap-1.5 sm:gap-2">
                {canReply && onReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] text-foreground/60 hover:text-foreground sm:text-xs"
                    onClick={() => onReply(comment.id)}
                  >
                    <MessageCircle className="mr-1 h-3 w-3" />
                    Ответить
                  </Button>
                )}
                {canDelete && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] text-destructive/60 hover:text-destructive sm:text-xs"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Удалить
                  </Button>
                )}
              </div>
            </div>
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2.5 space-y-2.5 sm:mt-3 sm:space-y-3">
              {comment.replies.map((reply) => (
                <MemoryComment
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  onReply={onReply}
                  canDelete={canDelete}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface AdditionItemProps {
  addition: MemoryAdditionWithDetails
  index: number
  onAddComment?: (additionId: string) => void
  canDelete?: boolean
  onDeleteComment?: (commentId: string) => void
  onDeleteAddition?: (additionId: string) => void
}

function AdditionItem({ addition, index, onAddComment, canDelete, onDeleteComment, onDeleteAddition }: AdditionItemProps) {
  const { confirm } = useConfirmDialog()
  const [showComments, setShowComments] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteAddition = async () => {
    if (!onDeleteAddition) {
      return
    }

    const confirmed = await confirm({
      title: 'Удалить дополнение',
      description: 'Вы уверены, что хотите удалить это дополнение?',
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      variant: 'destructive',
    })

    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    await onDeleteAddition(addition.id)
    setIsDeleting(false)
  }

  const initials = addition.author.full_name
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative pl-6 sm:pl-8">
      <div className="absolute left-0 top-0 flex h-full flex-col items-center">
        <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary/40 bg-background text-[10px] font-semibold text-primary sm:h-6 sm:w-6 sm:text-xs">
          {index + 1}
        </div>
        <div className="w-px flex-1 bg-gradient-to-b from-primary/40 to-transparent" />
      </div>

      <Card className="mb-3 border border-border/40 bg-background-soft/70 shadow-soft sm:mb-4">
        <CardContent className="space-y-3 pt-4 sm:space-y-4 sm:pt-5">
          <div className="flex items-start gap-2 sm:gap-3">
            <Avatar className="h-7 w-7 shadow-sm sm:h-8 sm:w-8">
              <AvatarImage src={addition.author.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary sm:text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-foreground/60 sm:gap-2">
                  <span className="truncate font-semibold text-foreground">{addition.author.full_name}</span>
                  <span className="flex-shrink-0">•</span>
                  <span className="flex-shrink-0 text-[11px] sm:text-xs">{formatDate(addition.created_at)}</span>
                </div>
                {canDelete && onDeleteAddition && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 flex-shrink-0 p-0 text-destructive/60 hover:text-destructive"
                    onClick={handleDeleteAddition}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {addition.content_md && (
            <Markdown content={addition.content_md} className="prose prose-sm text-foreground/95" />
          )}

          {addition.media && addition.media.length > 0 && (
            <PhotoSlider photos={addition.media} />
          )}

          <div className="flex items-center gap-2 border-t pt-2.5 sm:pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] sm:h-8 sm:text-xs"
              onClick={() => setShowComments(!showComments)}
            >
              {showComments ? (
                <ChevronUp className="mr-1 h-3 w-3" />
              ) : (
                <ChevronDown className="mr-1 h-3 w-3" />
              )}
              Комментарии ({addition.comments?.length || 0})
            </Button>
            {onAddComment && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] sm:h-8 sm:text-xs"
                onClick={() => onAddComment(addition.id)}
              >
                <MessageCircle className="mr-1 h-3 w-3" />
                Написать
              </Button>
            )}
          </div>

          {showComments && addition.comments && addition.comments.length > 0 && (
            <div className="space-y-2.5 border-t pt-3 sm:space-y-3 sm:pt-4">
              {addition.comments.map((comment) => (
                <MemoryComment
                  key={comment.id}
                  comment={comment}
                  canDelete={canDelete}
                  onDelete={onDeleteComment}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function MemoryCard({ memory, fallenId, onAddAddition, onAddComment, onEditMemory, onMemoryDeleted }: MemoryCardProps) {
  const { confirm, alert } = useConfirmDialog()
  const [showComments, setShowComments] = useState(false)
  const [showAdditions, setShowAdditions] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const { canDelete } = useCanDeleteContent(fallenId)

  const initials = memory.author.full_name
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const approvedAdditions = memory.additions?.filter(
    (add) => add.status === 'approved' && !add.is_deleted
  ) || []

  const handleDeleteMemory = async () => {
    const confirmed = await confirm({
      title: 'Удалить воспоминание',
      description: 'Вы уверены, что хотите удалить это воспоминание?',
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      variant: 'destructive',
    })

    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/memories/${memory.id}/delete`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete memory')
      }

      // Обновляем страницу для отображения изменений
      window.location.reload()
    } catch (error) {
      console.error('Error deleting memory:', error)
      await alert({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить воспоминание',
        confirmText: 'Закрыть',
        variant: 'error',
      })
      setIsDeleting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/delete`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete comment')
      }

      // Обновляем страницу для отображения изменений
      window.location.reload()
    } catch (error) {
      console.error('Error deleting comment:', error)
      await alert({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить комментарий',
        confirmText: 'Закрыть',
        variant: 'error',
      })
    }
  }

  const handleDeleteAddition = async (additionId: string) => {
    try {
      const response = await fetch(`/api/memory-additions/${additionId}/delete`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete addition')
      }

      // Обновляем страницу для отображения изменений
      window.location.reload()
    } catch (error) {
      console.error('Error deleting addition:', error)
      await alert({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить дополнение',
        confirmText: 'Закрыть',
        variant: 'error',
      })
    }
  }

  return (
    <Card className="overflow-hidden border border-border/50 bg-gradient-to-br from-background/95 via-background-soft/90 to-background/95 shadow-glow">
      <CardHeader className="border-b border-border/30 bg-background/50 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-2 sm:gap-3">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shadow-soft">
              <AvatarImage src={memory.author.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary sm:text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-1">
              <CardTitle className="text-base font-semibold text-foreground sm:text-lg break-words">
                {memory.title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-1 text-xs text-foreground/60 sm:gap-2">
                <span className="font-medium text-foreground/80 truncate">{memory.author.full_name}</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-[11px] sm:text-xs">{formatDate(memory.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 self-start">
            <Badge
              variant="secondary"
              className="flex items-center gap-1 border border-primary/30 bg-primary/15 text-primary text-xs h-6 px-2"
            >
              <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">Память</span>
            </Badge>
            {canDelete && onEditMemory && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-foreground/60 hover:text-foreground sm:h-8 sm:w-8"
                onClick={() => onEditMemory(memory)}
                disabled={isDeleting}
              >
                <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive/60 hover:text-destructive sm:h-8 sm:w-8"
                onClick={handleDeleteMemory}
                disabled={isDeleting}
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 sm:space-y-6 sm:p-6">
        {memory.content_md && (
          <Markdown content={memory.content_md} className="prose prose-sm sm:prose text-foreground" />
        )}

        {memory.media && memory.media.length > 0 && (
          <PhotoSlider photos={memory.media.slice(0, 10)} />
        )}

        {approvedAdditions.length > 0 && (
          <div className="space-y-3 rounded-2xl border border-border/40 bg-background/60 p-4 sm:space-y-4 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground/70 sm:text-sm">
                Дополнения к воспоминанию
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdditions(!showAdditions)}
                className="h-7 flex-shrink-0 text-xs"
              >
                {showAdditions ? (
                  <ChevronUp className="mr-1 h-3 w-3" />
                ) : (
                  <ChevronDown className="mr-1 h-3 w-3" />
                )}
                {showAdditions ? 'Скрыть' : 'Показать'} ({approvedAdditions.length})
              </Button>
            </div>

            {showAdditions && (
              <div className="space-y-2">
                {approvedAdditions.map((addition, index) => (
                  <AdditionItem
                    key={addition.id}
                    addition={addition}
                    index={index}
                    onAddComment={
                      onAddComment ? (id) => onAddComment('addition', id) : undefined
                    }
                    canDelete={canDelete}
                    onDeleteComment={handleDeleteComment}
                    onDeleteAddition={handleDeleteAddition}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-border/30 pt-3 sm:pt-4">
          {onAddAddition && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddAddition(memory.id)}
              className="h-8 gap-1.5 text-xs sm:h-9 sm:gap-2 sm:text-sm"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Дополнить воспоминание</span>
              <span className="sm:hidden">Дополнить</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="h-8 gap-1.5 text-xs sm:h-9 sm:gap-2 sm:text-sm"
          >
            {showComments ? (
              <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
            Комментарии ({memory.comments?.length || 0})
          </Button>
        </div>

        {showComments && (
          <div className="space-y-3 rounded-2xl border border-border/40 bg-background/60 p-4 sm:space-y-4 sm:p-6">
            {memory.comments && memory.comments.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {memory.comments
                  .filter((comment) => !comment.parent_id)
                  .map((comment) => (
                    <MemoryComment
                      key={comment.id}
                      comment={comment}
                      onReply={
                        onAddComment ? (id) => onAddComment('memory', memory.id, id) : undefined
                      }
                      canDelete={canDelete}
                      onDelete={handleDeleteComment}
                    />
                  ))}
              </div>
            ) : (
              <p className="text-center text-xs text-foreground/60 sm:text-sm">
                Пока нет комментариев. Будьте первым!
              </p>
            )}

            {onAddComment && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddComment('memory', memory.id)}
                className="h-8 w-full gap-1.5 text-xs sm:h-9 sm:gap-2 sm:text-sm"
              >
                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Написать комментарий
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
