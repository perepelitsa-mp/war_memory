"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Filter,
  ImageIcon,
  Milestone,
  Plus,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";

import type { TimelineItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Timeline, ExtendedTimelineItem } from "@/components/fallen/Timeline";
import { cn } from "@/lib/utils";
import { useCanDeleteContent } from "@/hooks/useCanDeleteContent";
import { useConfirmDialog } from "@/components/ui/alert-dialog-custom";

const MAX_WORDS = 500;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Константы для сворачивания хроники
const INITIAL_ITEMS_TO_SHOW = 5;
const MIN_ITEMS_FOR_COLLAPSE = 7;

export type TimelineWithFormProps = {
  items: TimelineItem[];
  fallenId: string;
  className?: string;
};

type FormState = {
  date: string;
  title: string;
  description: string;
  file: File | null;
};

const initialForm: FormState = {
  date: "",
  title: "",
  description: "",
  file: null,
};

const formatNumber = (value: number) => new Intl.NumberFormat("ru-RU").format(value);

const sortTimelineItems = (items: ExtendedTimelineItem[]) =>
  [...items].sort((a, b) => {
    const dateA = a.date_exact ? new Date(a.date_exact).getTime() : a.year ? a.year : 0;
    const dateB = b.date_exact ? new Date(b.date_exact).getTime() : b.year ? b.year : 0;
    return dateA - dateB;
  });

const countWords = (text: string) =>
  text.trim().length === 0 ? 0 : text.trim().split(/\s+/).filter(Boolean).length;

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

const getEventTimestamp = (item: ExtendedTimelineItem): number | null => {
  const source = item.updated_at ?? item.created_at;
  if (!source) {
    return null;
  }

  const parsed = new Date(source);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
};

const getDescriptionCandidate = (item: ExtendedTimelineItem) => {
  if (typeof (item as Record<string, unknown>).description === "string") {
    return (item as Record<string, unknown>).description as string;
  }

  return "";
};

export function TimelineWithForm({ items, fallenId, className }: TimelineWithFormProps) {
  const router = useRouter();
  const { canDelete } = useCanDeleteContent(fallenId);
  const { confirm, alert } = useConfirmDialog();

  const [timelineItems, setTimelineItems] = useState<ExtendedTimelineItem[]>(() =>
    sortTimelineItems(items as ExtendedTimelineItem[]),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDecade, setSelectedDecade] = useState<string>("all");
  const [onlyWithMedia, setOnlyWithMedia] = useState(false);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExtendedTimelineItem | null>(null);
  const [removeExistingMedia, setRemoveExistingMedia] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewIsObjectUrl, setPreviewIsObjectUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timelineBlockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimelineItems(sortTimelineItems(items as ExtendedTimelineItem[]));
  }, [items]);

  useEffect(() => {
    return () => {
      if (previewIsObjectUrl && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, [previewIsObjectUrl, previewUrl]);

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file =
      event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;
    event.target.value = "";

    if (previewIsObjectUrl && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (!file) {
      const existingPreview =
        editingItem && !removeExistingMedia
          ? editingItem.local_image_preview || editingItem.media?.file_url || null
          : null;
      setPreviewUrl(existingPreview);
      setPreviewIsObjectUrl(false);
      setForm((prev) => ({ ...prev, file: null }));
      if (!editingItem) {
        setRemoveExistingMedia(false);
      }
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError("Поддерживаются только изображения JPG, PNG или WEBP.");
      setPreviewUrl(
        editingItem
          ? editingItem.local_image_preview || editingItem.media?.file_url || null
          : null,
      );
      setPreviewIsObjectUrl(false);
      setForm((prev) => ({ ...prev, file: null }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Размер изображения не должен превышать 5 МБ.");
      setPreviewUrl(
        editingItem
          ? editingItem.local_image_preview || editingItem.media?.file_url || null
          : null,
      );
      setPreviewIsObjectUrl(false);
      setForm((prev) => ({ ...prev, file: null }));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setPreviewIsObjectUrl(true);
    setForm((prev) => ({ ...prev, file }));
    setRemoveExistingMedia(true);
    setError(null);
  };

  const restoreExistingMedia = () => {
    if (previewIsObjectUrl && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const existingPreview =
      editingItem?.local_image_preview || editingItem?.media?.file_url || null;
    setPreviewUrl(existingPreview);
    setPreviewIsObjectUrl(false);
    setRemoveExistingMedia(false);
    setForm((prev) => ({ ...prev, file: null }));
  };

  const removeMediaCompletely = () => {
    if (previewIsObjectUrl && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewIsObjectUrl(false);
    setRemoveExistingMedia(true);
    setForm((prev) => ({ ...prev, file: null }));
  };

  const resetForm = () => {
    if (previewIsObjectUrl && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setForm(initialForm);
    setError(null);
    setPreviewUrl(null);
    setPreviewIsObjectUrl(false);
    setRemoveExistingMedia(false);
    setEditingItem(null);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleStartCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleStartEdit = (item: ExtendedTimelineItem) => {
    if (previewIsObjectUrl && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setEditingItem(item);
    setForm({
      date: item.date_exact ? item.date_exact.slice(0, 10) : "",
      title: item.title ?? "",
      description: item.description_md ?? getDescriptionCandidate(item),
      file: null,
    });
    setRemoveExistingMedia(false);
    setPreviewUrl(item.local_image_preview || item.media?.file_url || null);
    setPreviewIsObjectUrl(false);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const words = countWords(form.description);
    if (words > MAX_WORDS) {
      setError(`Описание не должно превышать ${MAX_WORDS} слов.`);
      return;
    }

    if (!form.title.trim()) {
      setError("Укажите название события.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());

      if (form.date) {
        formData.append("date_exact", form.date);
      }

      if (form.file) {
        formData.append("file", form.file);
      }

      if (editingItem) {
        formData.append("remove_media", removeExistingMedia ? "true" : "false");
      } else {
        formData.append("fallen_id", fallenId);
      }

      const endpoint = editingItem ? `/api/timeline/${editingItem.id}` : "/api/timeline";
      const method = editingItem ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Не удалось сохранить событие.");
      }

      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }

      setSuccessMessage(
        editingItem
          ? "Запись обновлена. Благодарим за дополнение истории!"
          : "Запись добавлена в хронику. Спасибо, что делитесь историей!",
      );
      successTimeoutRef.current = setTimeout(() => {
        setSuccessMessage(null);
        successTimeoutRef.current = null;
      }, 6000);

      closeDialog();
      router.refresh();
    } catch (submitError) {
      console.error("Error saving timeline item:", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Не удалось сохранить событие. Попробуйте позже.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: ExtendedTimelineItem) => {
    const confirmed = await confirm({
      title: "Удалить событие",
      description: "Удалить событие из хроники? Его всегда можно добавить заново при необходимости.",
      confirmText: "Удалить",
      cancelText: "Отмена",
      variant: "destructive",
    });

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(item.id);
      const response = await fetch(`/api/timeline/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Не удалось удалить событие.");
      }

      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }

      setSuccessMessage("Запись удалена из хроники.");
      successTimeoutRef.current = setTimeout(() => {
        setSuccessMessage(null);
        successTimeoutRef.current = null;
      }, 6000);

      router.refresh();
    } catch (deleteError) {
      console.error("Error deleting timeline item:", deleteError);
      await alert({
        title: "Ошибка",
        description:
          deleteError instanceof Error
            ? deleteError.message
            : "Не удалось удалить событие. Попробуйте позже.",
        confirmText: "Закрыть",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const currentWordCount = useMemo(() => countWords(form.description), [form.description]);
  const isWordLimitExceeded = currentWordCount > MAX_WORDS;

  const stats = useMemo(() => {
    if (timelineItems.length === 0) {
      return {
        total: 0,
        withMedia: 0,
        periodLabel: "Пока нет записей",
        latestLabel: null as string | null,
      };
    }

    const years = timelineItems
      .map((item) => getYearFromItem(item))
      .filter((value): value is number => typeof value === "number");
    const earliestYear = years.length ? Math.min(...years) : null;
    const latestYear = years.length ? Math.max(...years) : null;

    const periodLabel =
      earliestYear && latestYear
        ? earliestYear === latestYear
          ? `${earliestYear} год`
          : `${earliestYear}-${latestYear}`
        : "Годы не указаны";

    const latestTimestamp = timelineItems.reduce<number | null>((acc, item) => {
      const ts = getEventTimestamp(item);
      if (ts === null) {
        return acc;
      }
      if (acc === null || ts > acc) {
        return ts;
      }
      return acc;
    }, null);

    return {
      total: timelineItems.length,
      withMedia: timelineItems.filter((item) =>
        Boolean(item.local_image_preview || item.media?.file_url),
      ).length,
      periodLabel,
      latestLabel: latestTimestamp
        ? new Intl.DateTimeFormat("ru-RU", { dateStyle: "long" }).format(
            new Date(latestTimestamp),
          )
        : null,
    };
  }, [timelineItems]);

  const decadeOptions = useMemo(() => {
    const map = new Map<number, string>();

    timelineItems.forEach((item) => {
      const year = getYearFromItem(item);
      if (!year) {
        return;
      }

      const decadeStart = Math.floor(year / 10) * 10;
      map.set(decadeStart, `${decadeStart}-${decadeStart + 9}`);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([value, label]) => ({
        value: value.toString(),
        label,
      }));
  }, [timelineItems]);

  const filteredItems = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return timelineItems.filter((item) => {
      if (onlyWithMedia && !(item.local_image_preview || item.media?.file_url)) {
        return false;
      }

      if (selectedDecade !== "all") {
        const year = getYearFromItem(item);
        const decadeStart = Number(selectedDecade);

        if (!year || year < decadeStart || year > decadeStart + 9) {
          return false;
        }
      }

      if (!search) {
        return true;
      }

      const haystack = [item.title, item.description_md, getDescriptionCandidate(item)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [timelineItems, searchTerm, selectedDecade, onlyWithMedia]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 || selectedDecade !== "all" || onlyWithMedia;

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDecade("all");
    setOnlyWithMedia(false);
  };

  // Логика сворачивания хроники
  const shouldShowCollapseButton = filteredItems.length > MIN_ITEMS_FOR_COLLAPSE;
  const visibleItems = useMemo(() => {
    if (hasActiveFilters || isTimelineExpanded || !shouldShowCollapseButton) {
      return filteredItems;
    }
    return filteredItems.slice(0, INITIAL_ITEMS_TO_SHOW);
  }, [filteredItems, hasActiveFilters, isTimelineExpanded, shouldShowCollapseButton]);

  const handleExpandTimeline = () => {
    setIsTimelineExpanded(true);
  };

  const handleCollapseTimeline = () => {
    setIsTimelineExpanded(false);
    // Плавная прокрутка к началу блока хроники
    setTimeout(() => {
      timelineBlockRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <Card
      ref={timelineBlockRef}
      className={cn("border border-border/50 bg-background/80 shadow-soft backdrop-blur-sm", className)}
    >
      <CardHeader className="space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary sm:h-10 sm:w-10 sm:rounded-xl">
                <CalendarClock className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-foreground sm:text-xl md:text-2xl">
                  Хроника жизни героя
                </CardTitle>
                <p className="mt-0.5 max-w-xl text-xs text-foreground/60 sm:mt-1 sm:text-sm">
                  Собирайте ключевые вехи пути: детство, учебу, службу, волонтёрство и совместные
                  победы. История станет понятной и живой для будущих поколений.
                </p>
              </div>
            </div>

            {canDelete && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleStartCreate} className="h-9 gap-1.5 text-sm sm:h-10 sm:gap-2 sm:text-base">
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Добавить событие
                </Button>
              </div>
            )}
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 lg:gap-4">
            {[
              { icon: Milestone, label: "Записей", value: formatNumber(stats.total) },
              { icon: ImageIcon, label: "С фото", value: formatNumber(stats.withMedia) },
              { icon: CalendarClock, label: "Период хроники", value: stats.periodLabel },
              {
                icon: Sparkles,
                label: "Последнее обновление",
                value: stats.latestLabel ?? "Ждём первую запись",
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-lg border border-border/40 bg-background-soft/70 p-2.5 sm:rounded-xl sm:p-3"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary sm:h-9 sm:w-9">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <div className="min-w-0 space-y-0.5 sm:space-y-1">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-foreground/50 sm:text-xs">
                      {label}
                    </p>
                    <p className="truncate text-xs font-semibold text-foreground sm:text-sm">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {successMessage && (
          <div className="rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
            {successMessage}
          </div>
        )}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Название или детали события..."
              className="h-10 pl-9"
            />
          </div>

          {decadeOptions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                Период
              </span>
              <Button
                variant={selectedDecade === "all" ? "default" : "ghost"}
                size="sm"
                className={cn("h-8 px-3 text-xs", selectedDecade === "all" && "shadow-sm")}
                onClick={() => setSelectedDecade("all")}
              >
                Все годы
              </Button>
              {decadeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedDecade === option.value ? "default" : "ghost"}
                  size="sm"
                  className={cn("h-8 px-3 text-xs", selectedDecade === option.value && "shadow-sm")}
                  onClick={() => setSelectedDecade(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={onlyWithMedia ? "secondary" : "outline"}
            size="sm"
            className={cn(
              "h-8 rounded-full px-3 text-xs",
              onlyWithMedia && "border-primary bg-primary/10 text-primary hover:bg-primary/15",
            )}
            onClick={() => setOnlyWithMedia((prev) => !prev)}
          >
            <ImageIcon className="mr-1 h-3.5 w-3.5" />
            Только с фото
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full px-3 text-xs text-foreground/60 hover:text-foreground"
              onClick={resetFilters}
            >
              <Filter className="mr-1 h-3.5 w-3.5" />
              Сбросить фильтры
            </Button>
          )}
        </div>

        {filteredItems.length > 0 ? (
          <>
            <Timeline
              items={visibleItems}
              canManage={canDelete}
              onEdit={canDelete ? handleStartEdit : undefined}
              onDelete={canDelete ? handleDelete : undefined}
              deletingId={deletingId}
            />

            {shouldShowCollapseButton && !hasActiveFilters && (
              <div className="mt-6 flex justify-center">
                {!isTimelineExpanded ? (
                  <Button
                    onClick={handleExpandTimeline}
                    variant="outline"
                    className="h-10 gap-2 border-primary/30 bg-background/60 text-sm font-medium text-primary hover:bg-primary/10 hover:text-primary sm:h-11 sm:gap-2.5 sm:text-base"
                  >
                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                    Показать все {formatNumber(filteredItems.length)} событий хроники
                  </Button>
                ) : (
                  <Button
                    onClick={handleCollapseTimeline}
                    variant="outline"
                    className="h-10 gap-2 border-border/40 bg-background/60 text-sm font-medium text-foreground/70 hover:bg-background-soft hover:text-foreground sm:h-11 sm:gap-2.5 sm:text-base"
                  >
                    <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    Свернуть хронику
                  </Button>
                )}
              </div>
            )}
          </>
        ) : timelineItems.length > 0 ? (
          <div className="space-y-3 rounded-xl border border-dashed border-border/60 bg-background-soft/70 px-4 py-8 text-center sm:space-y-4 sm:rounded-2xl sm:px-8 sm:py-12">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-12 sm:w-12">
              <Filter className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-base font-semibold text-foreground sm:text-lg">По параметрам ничего не найдено</h3>
              <p className="mx-auto max-w-md text-xs leading-relaxed text-foreground/70 sm:text-sm">
                Измените период или отключите фильтры, чтобы увидеть весь путь героя.
              </p>
            </div>
            <div className="flex justify-center">
              <Button onClick={resetFilters} className="h-9 gap-1.5 text-sm sm:h-10 sm:gap-2 sm:text-base">
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Сбросить фильтры
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-dashed border-border/60 bg-background-soft/70 px-4 py-8 text-center sm:space-y-4 sm:rounded-2xl sm:px-8 sm:py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-16 sm:w-16 sm:rounded-2xl">
              <Milestone className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-base font-semibold text-foreground sm:text-lg">
                Начните хронику жизни героя
              </h3>
              <p className="mx-auto max-w-md text-xs leading-relaxed text-foreground/70 sm:text-sm">
                Опишите первые шаги и важные события. Каждая веха помогает наполнить историю живыми
                деталями.
              </p>
            </div>
            {canDelete ? (
              <div className="flex justify-center">
                <Button onClick={handleStartCreate} size="lg" className="h-10 gap-1.5 text-sm sm:h-11 sm:gap-2 sm:text-base">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  Добавить первую запись
                </Button>
              </div>
            ) : (
              <p className="text-xs text-foreground/50 sm:text-sm">
                Когда появятся воспоминания, хроника станет доступна для просмотра.
              </p>
            )}
          </div>
        )}
      </CardContent>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-border/40 bg-background/95 p-0">
          <DialogHeader className="space-y-2 border-b border-border/40 px-6 py-6">
            <DialogTitle className="text-xl font-semibold text-foreground">
              {editingItem ? "Редактировать событие" : "Новая запись в хронике"}
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground/70">
              Опишите событие так, чтобы читатель ощутил атмосферу момента. Добавьте точную дату и
              фотографии, если они есть.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
                Дата события (если известна)
                <Input
                  type="date"
                  value={form.date}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => handleFieldChange("date", event.target.value)}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
                Заголовок
                <Input
                  type="text"
                  required
                  minLength={3}
                  maxLength={140}
                  value={form.title}
                  onChange={(event) => handleFieldChange("title", event.target.value)}
                  placeholder="Например: Первые шаги в музыке"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
              Подробности события
              <Textarea
                required
                minLength={20}
                className={cn(
                  "min-h-[160px] rounded-2xl border border-border/60 bg-background px-3 py-3 text-sm leading-relaxed text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40",
                  isWordLimitExceeded && "border-destructive/60 focus:ring-destructive/40",
                )}
                value={form.description}
                onChange={(event) => handleFieldChange("description", event.target.value)}
                placeholder="Что происходило? Кто был рядом? Чем это событие важно для героя и его окружения?"
              />
              <span
                className={cn(
                  "text-xs text-muted-foreground",
                  isWordLimitExceeded && "text-destructive",
                )}
              >
                {currentWordCount} / {MAX_WORDS} слов
              </span>
            </label>

            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
                Фотография (до 5 МБ)
                <div className="relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-background/60 px-4 py-6 text-center transition hover:border-primary/60">
                  <Upload className="h-6 w-6 text-primary" />
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Перетащите файл сюда или выберите на устройстве.</p>
                    <p>Поддерживаемые форматы: JPG, PNG, WEBP.</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={handleFileChange}
                  />
                </div>
              </label>

              {(previewUrl || (editingItem && removeExistingMedia)) && (
                <div className="space-y-2">
                  {previewUrl && (
                    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background-soft">
                      <img
                        src={previewUrl}
                        alt="Предпросмотр выбранной фотографии"
                        className="h-full w-full max-h-72 object-cover"
                      />
                    </div>
                  )}

                  {editingItem && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/70">
                      {form.file ? (
                        <>
                          <span>Выбрано новое фото. Текущее будет заменено.</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={restoreExistingMedia}
                          >
                            Отменить замену
                          </Button>
                        </>
                      ) : removeExistingMedia ? (
                        <>
                          <span>Фото будет удалено после сохранения.</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={restoreExistingMedia}
                          >
                            Вернуть фото
                          </Button>
                        </>
                      ) : previewUrl ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={removeMediaCompletely}
                        >
                          Удалить фото
                        </Button>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={closeDialog}
                className="sm:min-w-[140px]"
              >
                Отменить
              </Button>
              <Button
                type="submit"
                className="sm:min-w-[180px]"
                disabled={isSubmitting || isWordLimitExceeded}
              >
                {isSubmitting
                  ? "Сохраняем..."
                  : editingItem
                    ? "Сохранить изменения"
                    : "Добавить событие"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
