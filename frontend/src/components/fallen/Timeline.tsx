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

interface TimelineItemCardProps {
  item: ExtendedTimelineItem;
  index: number;
  canManage?: boolean;
  onEdit?: (item: ExtendedTimelineItem) => void;
  onDelete?: (item: ExtendedTimelineItem) => void;
  deletingId?: string | null;
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
    <div className={cn("relative pl-10 sm:pl-14", index === 0 && "pt-2")}>
      <div className="absolute left-0 top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/40 bg-gradient-to-br from-background to-background-soft shadow-md sm:h-10 sm:w-10">
        <span className="text-[0.65rem] font-bold text-primary sm:text-xs">
          {yearBadge ?? String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <Card className="group border border-border/40 bg-gradient-to-br from-background/95 to-background-soft/90 shadow-soft transition-all hover:border-primary/30 hover:shadow-md">
        <CardContent className="space-y-3 px-3 py-3 sm:space-y-4 sm:px-5 sm:py-5">
          <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1 text-[0.65rem] font-medium text-primary sm:gap-1.5 sm:text-xs">
                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>{dateLabel}</span>
              </div>

              {hasMedia && (
                <Badge
                  variant="secondary"
                  className="gap-0.5 border border-primary/20 bg-primary/10 text-[0.6rem] text-primary sm:gap-1 sm:text-[0.65rem]"
                >
                  <ImageIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  Фото
                </Badge>
              )}

              {isPending && (
                <Badge
                  variant="secondary"
                  className="gap-0.5 border border-warning/40 bg-warning/15 text-[0.6rem] text-warning sm:gap-1 sm:text-[0.65rem]"
                >
                  <ShieldAlert className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  На модерации
                </Badge>
              )}
            </div>

            {canManage && (
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-foreground/60 hover:text-foreground sm:h-8 sm:w-8"
                  onClick={() => onEdit?.(item)}
                  title="Редактировать событие"
                >
                  <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive/60 hover:text-destructive sm:h-8 sm:w-8"
                  onClick={() => onDelete?.(item)}
                  disabled={isDeleting}
                  title="Удалить событие"
                >
                  {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" /> : <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                </Button>
              </div>
            )}
          </div>

          <h3 className="text-sm font-semibold leading-snug text-foreground sm:text-base">{item.title}</h3>

          {plainText && (
            <div className="space-y-1.5 sm:space-y-2">
              <p className="whitespace-pre-line text-xs leading-relaxed text-foreground/80 sm:text-sm">
                {displayDescription}
              </p>
              {isLongDescription && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="h-6 px-1.5 text-[0.65rem] text-primary hover:text-primary sm:h-7 sm:px-2 sm:text-xs"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="mr-0.5 h-2.5 w-2.5 sm:mr-1 sm:h-3 sm:w-3" />
                      Свернуть
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-0.5 h-2.5 w-2.5 sm:mr-1 sm:h-3 sm:w-3" />
                      Читать полностью
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {hasMedia && (
            <div className="overflow-hidden rounded-lg border border-border/50 bg-background sm:rounded-xl">
              <Image
                src={item.local_image_preview || item.media?.file_url || ""}
                alt={item.media?.alt_text || `Фотография события «${item.title}»`}
                width={720}
                height={480}
                className="h-full w-full max-h-48 object-cover transition-transform group-hover:scale-[1.02] sm:max-h-56 md:max-h-60"
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
    <div className="relative space-y-4 sm:space-y-6">
      <div className="pointer-events-none absolute left-[15px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-border/60 to-primary/20 sm:left-[19px]" />

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
