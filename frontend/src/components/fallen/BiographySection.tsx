'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Markdown } from '@/components/ui/markdown'
import { EditBiographyDialog } from './EditBiographyDialog'
import { useCanDeleteContent } from '@/hooks/useCanDeleteContent'

interface BiographySectionProps {
  fallenId: string
  biographyMd: string | null
}

export function BiographySection({ fallenId, biographyMd }: BiographySectionProps) {
  const { canDelete } = useCanDeleteContent(fallenId)

  if (!biographyMd && !canDelete) {
    return null
  }

  return (
    <section>
      <Card className="border border-border/50 bg-background/70 shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Биография</CardTitle>
            {canDelete && (
              <EditBiographyDialog fallenId={fallenId} currentBiography={biographyMd} />
            )}
          </div>
        </CardHeader>
        <CardContent className="prose prose-memorial max-w-none text-foreground/90 prose-p:text-foreground/80 prose-headings:text-foreground">
          {biographyMd ? (
            <Markdown content={biographyMd} />
          ) : (
            <p className="text-sm text-muted-foreground italic not-prose">
              Биография ещё не добавлена. Нажмите «Редактировать», чтобы добавить текст.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
