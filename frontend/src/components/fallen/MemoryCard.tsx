'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Markdown } from '@/components/ui/markdown'
import { Heart, ImageIcon, Plus, MessageCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import type { MemoryItemWithDetails, MemoryAdditionWithDetails, CommentWithAuthor } from '@/types'
import { cn } from '@/lib/utils'
import { useCanDeleteContent } from '@/hooks/useCanDeleteContent'

interface MemoryCardProps {
  memory: MemoryItemWithDetails
  fallenId: string
  onAddAddition?: (memoryId: string) => void
  onAddComment?: (entityType: 'memory' | 'addition', entityId: string, parentId?: string) => void
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
    if (!onDelete || !confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      return
    }

    setIsDeleting(true)
    await onDelete(comment.id)
    setIsDeleting(false)
  }

  return (
    <div className={cn(isNested && 'ml-6 mt-3')}>
      <Card
        className={cn(
          'border border-border/30 bg-background-soft/60 shadow-sm',
          isNested && 'border-l-2 border-l-primary/40'
        )}
      >
        <CardContent className="space-y-3 pt-4">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 shadow-sm">
              <AvatarImage src={comment.author.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {comment.author.full_name}
                </span>
                <span className="text-xs text-foreground/50">{formatDate(comment.created_at)}</span>
              </div>

              <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                {comment.content}
              </p>

              <div className="flex gap-2">
                {canReply && onReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-foreground/60 hover:text-foreground"
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
                    className="h-7 px-2 text-xs text-destructive/60 hover:text-destructive"
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
            <div className="mt-3 space-y-3">
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
}

function AdditionItem({ addition, index, onAddComment, canDelete, onDeleteComment }: AdditionItemProps) {
  const [showComments, setShowComments] = useState(false)

  const initials = addition.author.full_name
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-0 flex h-full flex-col items-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary/40 bg-background text-xs font-semibold text-primary">
          {index + 1}
        </div>
        <div className="w-px flex-1 bg-gradient-to-b from-primary/40 to-transparent" />
      </div>

      <Card className="mb-4 border border-border/40 bg-background-soft/70 shadow-soft">
        <CardContent className="space-y-4 pt-5">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 shadow-sm">
              <AvatarImage src={addition.author.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-foreground/60">
                <span className="font-semibold text-foreground">{addition.author.full_name}</span>
                <span>•</span>
                <span>{formatDate(addition.created_at)}</span>
              </div>
            </div>
          </div>

          {addition.content_md && (
            <Markdown content={addition.content_md} className="prose prose-sm text-foreground/80" />
          )}

          {addition.media && addition.media.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {addition.media.map((media) => (
                <div
                  key={media.id}
                  className="relative aspect-square overflow-hidden rounded-lg border border-border/50 bg-background"
                >
                  {media.file_url ? (
                    <img
                      src={media.file_url}
                      alt={media.alt_text || ''}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-foreground/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
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
                className="h-8 text-xs"
                onClick={() => onAddComment(addition.id)}
              >
                <MessageCircle className="mr-1 h-3 w-3" />
                Написать
              </Button>
            )}
          </div>

          {showComments && addition.comments && addition.comments.length > 0 && (
            <div className="space-y-3 border-t pt-4">
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

export function MemoryCard({ memory, fallenId, onAddAddition, onAddComment, onMemoryDeleted }: MemoryCardProps) {
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
    if (!confirm('Вы уверены, что хотите удалить это воспоминание?')) {
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
      alert(error instanceof Error ? error.message : 'Не удалось удалить воспоминание')
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
      alert(error instanceof Error ? error.message : 'Не удалось удалить комментарий')
    }
  }

  return (
    <Card className="overflow-hidden border border-border/50 bg-gradient-to-br from-background/95 via-background-soft/90 to-background/95 shadow-glow">
      <CardHeader className="border-b border-border/30 bg-background/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 shadow-soft">
              <AvatarImage src={memory.author.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-foreground">
                {memory.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-foreground/60">
                <span className="font-medium text-foreground/80">{memory.author.full_name}</span>
                <span>•</span>
                <span>{formatDate(memory.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="flex items-center gap-1 border border-primary/30 bg-primary/15 text-primary"
            >
              <Heart className="h-3 w-3" />
              Память
            </Badge>
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-destructive/60 hover:text-destructive"
                onClick={handleDeleteMemory}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {memory.content_md && (
          <Markdown content={memory.content_md} className="prose text-foreground/85" />
        )}

        {memory.media && memory.media.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {memory.media.slice(0, 10).map((media) => (
              <div
                key={media.id}
                className="relative aspect-square overflow-hidden rounded-xl border border-border/50 bg-background shadow-sm"
              >
                {media.file_url ? (
                  <img
                    src={media.file_url}
                    alt={media.alt_text || ''}
                    className="h-full w-full object-cover transition hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {approvedAdditions.length > 0 && (
          <div className="space-y-4 rounded-2xl border border-border/40 bg-background/60 p-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground/70">
                Дополнения к воспоминанию
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdditions(!showAdditions)}
                className="h-7 text-xs"
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
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-border/30 pt-4">
          {onAddAddition && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddAddition(memory.id)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Дополнить воспоминание
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="gap-2"
          >
            {showComments ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Комментарии ({memory.comments?.length || 0})
          </Button>
        </div>

        {showComments && (
          <div className="space-y-4 rounded-2xl border border-border/40 bg-background/60 p-6">
            {memory.comments && memory.comments.length > 0 ? (
              <div className="space-y-4">
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
              <p className="text-center text-sm text-foreground/60">
                Пока нет комментариев. Будьте первым!
              </p>
            )}

            {onAddComment && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddComment('memory', memory.id)}
                className="w-full gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Написать комментарий
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
