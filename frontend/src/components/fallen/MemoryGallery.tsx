import { MemoryItem } from "@/types";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";
import { Heart, ImageOff, User } from "lucide-react";

interface MemoryGalleryProps {
  items: MemoryItem[];
}

export function MemoryGallery({ items }: MemoryGalleryProps) {
  if (!items || items.length === 0) {
    return (
      <p className="rounded-2xl border border-border/40 bg-background-soft/70 px-6 py-8 text-center text-sm text-foreground/70">
        Воспоминания и фотографии появятся здесь, когда семья поделится историями.
      </p>
    );
  }

  const approvedItems = items.filter((item) => item.status === "approved" && !item.is_deleted);

  if (approvedItems.length === 0) {
    return (
      <p className="rounded-2xl border border-border/40 bg-background-soft/70 px-6 py-8 text-center text-sm text-foreground/70">
        Пока нет опубликованных воспоминаний. Добавьте первое.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {approvedItems.map((item) => (
        <Card key={item.id} className="overflow-hidden border border-border/40 bg-background-soft/85 shadow-soft">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">{item.title}</CardTitle>
              <Badge variant="secondary" className="flex items-center gap-1 border border-primary/30 bg-primary/15 text-primary">
                <Heart className="h-3 w-3" />
                Память
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground/60">
              <User className="h-4 w-4" />
              <span>Добавлено {formatDate(item.created_at)}</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {item.content_md ? (
              <Markdown content={item.content_md} className="prose prose-sm text-foreground/80" />
            ) : null}

            {item.media_ids && item.media_ids.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {item.media_ids.map((mediaId) => (
                  <div
                    key={mediaId}
                    className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-background"
                  >
                    <ImageOff className="h-6 w-6 text-foreground/30" />
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}