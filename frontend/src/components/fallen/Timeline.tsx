'use client';

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Loader2,
  Pencil,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import type { TimelineItem } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type ExtendedTimelineItem = TimelineItem & {
  local_image_preview?: string | null;
  is_local?: boolean;
  media?: {
    id: string;
    file_url: string | null;
    alt_text?: string | null;
  } | null;
};

interface TimelineProps {
  items: ExtendedTimelineItem[];
  canManage?: boolean;
  onEdit?: (item: ExtendedTimelineItem) => void;
  onDelete?: (item: ExtendedTimelineItem) => void;
  deletingId?: string | null;
}

interface TimelineItemCardProps extends TimelineProps {
  item: ExtendedTimelineItem;
  index: number;
}

const PREVIEW_LENGTH = 260;

const toPlainText = (value: string) =>
  value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[#>*_~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getYearFromItem = (item: ExtendedTimelineItem): number | null => {
  if (item.date_exact) {
    const parsed = new Date(item.date_exact);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.getFullYear();
    }
  }

  if (typeof item.year === "number") {
    return item.year;
  }

  if (item.created_at) {
    const parsed = new Date(item.created_at);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.getFullYear();
    }
  }

  return null;
};

const getDescriptionCandidate = (item: ExtendedTimelineItem) => {
  if (typeof (item as Record<string, unknown>).description === "string") {
    return (item as Record<string, unknown>).description as string;
  }

  return "";
};

function TimelineItemCard({
  item,
  index,
  canManage,
  onEdit,
  onDelete,
  deletingId,
}: TimelineItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const rawDescription = item.description_md ?? getDescriptionCandidate(item);
  const plainText = useMemo(() => toPlainText(rawDescription), [rawDescription]);

  const isLongDescription = plainText.length > PREVIEW_LENGTH;
  const displayDescription =
    isExpanded || !isLongDescription
      ? plainText
      : `${plainText.slice(0, PREVIEW_LENGTH).trimEnd()}...`;

  const yearBadge = getYearFromItem(item);
  const hasMedia = Boolean(item.local_image_preview || item.media?.file_url);
  const isPending = item.status !== "approved" || item.is_local;
  const dateLabel = item.date_exact
    ? formatDate(item.date_exact)
    : yearBadge
      ? `${yearBadge} год`
      : "Дата не указана";
  const isDeleting = deletingId === item.id;

  return (
    <div className={cn("relative pl-14", index === 0 && "pt-2")}>
      <div className="absolute left-0 top-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/40 bg-gradient-to-br from-background to-background-soft shadow-md">
        <span className="text-xs font-bold text-primary">
          {yearBadge ?? String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <Card className="group border border-border/40 bg-gradient-to-br from-background/95 to-background-soft/90 shadow-soft transition-all hover:border-primary/30 hover:shadow-md">
        <CardContent className="space-y-4 pt-5 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <Calendar className="h-3.5 w-3.5" />
                <span>{dateLabel}</span>
              </div>

              {hasMedia && (
                <Badge
                  variant="secondary"
                  className="gap-1 border border-primary/20 bg-primary/10 text-[0.65rem] text-primary"
                >
                  <ImageIcon className="h-3 w-3" />
                  Фото
                </Badge>
              )}

              {isPending && (
                <Badge
                  variant="secondary"
                  className="gap-1 border border-warning/40 bg-warning/15 text-[0.65rem] text-warning"
                >
                  <ShieldAlert className="h-3 w-3" />
                  На модерации
                </Badge>
              )}
            </div>

            {canManage && (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-foreground/60 hover:text-foreground"
                  onClick={() => onEdit?.(item)}
                  title="Редактировать событие"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive/60 hover:text-destructive"
                  onClick={() => onDelete?.(item)}
                  disabled={isDeleting}
                  title="Удалить событие"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>

          <h3 className="text-base font-semibold leading-snug text-foreground">{item.title}</h3>

          {plainText && (
            <div className="space-y-2">
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                {displayDescription}
              </p>
              {isLongDescription && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="h-7 px-2 text-xs text-primary hover:text-primary"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="mr-1 h-3 w-3" />
                      Свернуть
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-1 h-3 w-3" />
                      Читать полностью
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {hasMedia && (
            <div className="overflow-hidden rounded-xl border border-border/50 bg-background">
              <Image
                src={item.local_image_preview || item.media?.file_url || ""}
                alt={item.media?.alt_text || `Фотография события «${item.title}»`}
                width={720}
                height={480}
                className="h-full w-full max-h-60 object-cover transition-transform group-hover:scale-[1.02]"
                unoptimized
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function Timeline({ items, canManage, onEdit, onDelete, deletingId }: TimelineProps) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-border/40 bg-background-soft/80 px-6 py-8 text-center text-sm text-foreground/70">
        Пока нет событий. Поделитесь важными вехами жизни героя, чтобы история зазвучала полнее.
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-border/60 to-primary/20" />

      {items.map((item, index) => (
        <TimelineItemCard
          key={`${item.id}-${index}`}
          item={item}
          index={index}
          canManage={canManage}
          onEdit={onEdit}
          onDelete={onDelete}
          deletingId={deletingId}
        />
      ))}
    </div>
  );
}
