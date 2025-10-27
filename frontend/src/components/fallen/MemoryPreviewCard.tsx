'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, ImageIcon, Sparkles, ArrowRight } from 'lucide-react'
import type { MemoryItemWithDetails } from '@/types'
import { cn, formatDate, getInitials, truncate } from '@/lib/utils'
import { useMemo } from 'react'

interface MemoryPreviewCardProps {
  memory: MemoryItemWithDetails
  onOpen: (memory: MemoryItemWithDetails) => void
  className?: string
}

const sanitizeText = (text: string) =>
  text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[#>*_~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export function MemoryPreviewCard({ memory, onOpen, className }: MemoryPreviewCardProps) {
  const previewText = useMemo(() => {
    const baseText = sanitizeText(memory.content ?? memory.content_md ?? '')
    if (!baseText) {
      return 'История без текста — добавьте подробности, чтобы её легче было почувствовать.'
    }

    return truncate(baseText, 220)
  }, [memory.content, memory.content_md])

  const additionsCount = useMemo(
    () =>
      (memory.additions || []).filter(
        (addition) => addition.status === 'approved' && !addition.is_deleted
      ).length,
    [memory.additions]
  )
  const commentsCount = memory.comments?.length ?? 0
  const mediaCount = memory.media?.length ?? 0

  const handleOpen = () => {
    onOpen(memory)
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleOpen()
        }
      }}
      className={cn(
        'group flex h-full cursor-pointer flex-col border border-border/40 bg-background/80 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        className
      )}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11 shadow-sm">
            <AvatarImage src={memory.author?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
              {memory.author ? getInitials(memory.author.full_name) : '??'}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              {memory.title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/60">
              <span className="font-medium text-foreground/80">{memory.author?.full_name}</span>
              <span>•</span>
              <span>{formatDate(memory.created_at)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-6">
        <p className="text-sm leading-relaxed text-foreground/80">{previewText}</p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {mediaCount > 0 && (
              <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                <ImageIcon className="h-3.5 w-3.5" />
                {mediaCount} фото
              </Badge>
            )}
            {additionsCount > 0 && (
              <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {additionsCount} дополнений
              </Badge>
            )}
            {commentsCount > 0 && (
              <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                <MessageCircle className="h-3.5 w-3.5" />
                {commentsCount} комментариев
              </Badge>
            )}
          </div>

          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all group-hover:gap-2">
            Читать полностью
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
