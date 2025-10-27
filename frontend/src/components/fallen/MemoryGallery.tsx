'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ImagePlus, Image } from "lucide-react"
import { PhotoSlider } from './PhotoSlider'
import { AddPhotoToGalleryDialog } from './AddPhotoToGalleryDialog'
import { useCanDeleteContent } from '@/hooks/useCanDeleteContent'

interface FallenMedia {
  id: string
  file_url: string | null
  alt_text?: string | null
  caption?: string | null
}

interface MemoryGalleryProps {
  photos: FallenMedia[]
  fallenId: string
}

export function MemoryGallery({ photos, fallenId }: MemoryGalleryProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const { canDelete } = useCanDeleteContent(fallenId)

  const handleSuccess = () => {
    window.location.reload()
  }

  if (!photos || photos.length === 0) {
    return (
      <>
        <div className="rounded-2xl border border-border/40 bg-background-soft/70 px-6 py-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Image className="h-8 w-8 text-primary" />
          </div>
          <p className="mt-4 text-sm text-foreground/70">
            Фотографии появятся здесь, когда будут добавлены в галерею.
          </p>
          {canDelete && (
            <Button
              onClick={() => setShowAddDialog(true)}
              className="mt-4 gap-2"
            >
              <ImagePlus className="h-4 w-4" />
              Добавить первую фотографию
            </Button>
          )}
        </div>

        <AddPhotoToGalleryDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          fallenId={fallenId}
          onSuccess={handleSuccess}
        />
      </>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <PhotoSlider photos={photos} />

        {canDelete && (
          <div className="flex justify-center">
            <Button
              onClick={() => setShowAddDialog(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <ImagePlus className="h-4 w-4" />
              Добавить фотографии
            </Button>
          </div>
        )}
      </div>

      <AddPhotoToGalleryDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        fallenId={fallenId}
        onSuccess={handleSuccess}
      />
    </>
  )
}