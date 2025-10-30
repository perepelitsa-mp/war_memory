'use client'

import { Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EditMemorialTextDialog } from './EditMemorialTextDialog'
import { useCanDeleteContent } from '@/hooks/useCanDeleteContent'

interface MemorialTextSectionProps {
  fallenId: string
  memorialText: string | null
}

export function MemorialTextSection({ fallenId, memorialText }: MemorialTextSectionProps) {
  const { canDelete } = useCanDeleteContent(fallenId)

  if (!memorialText && !canDelete) {
    return null
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_minmax(0,320px)]">
      <Card className="border border-border/50 bg-background/70 shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Слова памяти</CardTitle>
            {canDelete && (
              <EditMemorialTextDialog fallenId={fallenId} currentText={memorialText} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {memorialText ? (
            <p className="text-lg leading-relaxed text-foreground/80">{memorialText}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Слова памяти ещё не добавлены. Нажмите «Редактировать», чтобы добавить текст.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border border-primary/30 bg-gradient-to-br from-primary/10 via-background/60 to-background-soft/80 shadow-glow">
        <CardContent className="flex h-full flex-col justify-between gap-6 py-6">
          <div className="space-y-3">
            <Badge
              variant="secondary"
              className="inline-flex w-max items-center gap-2 bg-primary text-primary-foreground"
            >
              <Flame className="h-4 w-4" />
              Огонь памяти
            </Badge>
            <p className="text-sm text-primary/90">
              Оставьте своё воспоминание, чтобы имя героя звучало вечно. Истории близких помогают
              оживить хронику и вдохновляют новые поколения.
            </p>
          </div>
          <a
            href={`/fallen/${fallenId}#comments`}
            className="inline-flex items-center justify-center rounded-full border border-primary/40 bg-primary/20 px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary/30"
          >
            Оставить воспоминание
          </a>
        </CardContent>
      </Card>
    </section>
  )
}
