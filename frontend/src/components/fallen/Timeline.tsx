import Image from "next/image";

import { TimelineItem } from "@/types";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ImageIcon } from "lucide-react";

export type ExtendedTimelineItem = TimelineItem & {
  local_image_preview?: string | null;
  is_local?: boolean;
};

interface TimelineProps {
  items: ExtendedTimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-border/40 bg-background-soft/80 px-6 py-8 text-center text-sm text-foreground/70">
        В хронику ещё не добавлены события. Расскажите о первом тёплом воспоминании героя.
      </div>
    );
  }

  return (
    <div className="relative space-y-8">
      <div className="pointer-events-none absolute left-[17px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-border to-primary/30" />

      {items.map((item, index) => (
        <div key={`${item.id}-${index}`} className="relative pl-14">
          <div className="absolute left-0 top-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary/60 bg-background shadow-soft">
            <Calendar className="h-4 w-4 text-primary" />
          </div>

          <Card className="border border-border/40 bg-background-soft/85 shadow-soft">
            <CardContent className="space-y-3 pt-6 pb-5 text-sm text-foreground/80">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-primary">
                <span>
                  {item.date_exact ? formatDate(item.date_exact) : item.year ? `${item.year} год` : "Дата не указана"}
                </span>
                {(item.status !== "approved" || item.is_local) && (
                  <Badge variant="secondary" className="border border-warning/30 bg-warning/15 text-[0.7rem] text-warning">
                    На проверке
                  </Badge>
                )}
              </div>

              <h3 className="text-base font-semibold text-foreground">{item.title}</h3>

              {item.description_md && (
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/75">
                  {item.description_md}
                </p>
              )}

              {item.local_image_preview ? (
                <div className="overflow-hidden rounded-2xl border border-border/50 bg-background">
                  <Image
                    src={item.local_image_preview}
                    alt={`Изображение события ${item.title}`}
                    width={720}
                    height={480}
                    className="h-full w-full max-h-72 object-cover"
                    unoptimized
                  />
                </div>
              ) : null}

              {!item.local_image_preview && item.media_id && (
                <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-background/70 px-3 py-2 text-xs text-foreground/60">
                  <ImageIcon className="h-4 w-4" />
                  Изображение появится после модерации архива.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}