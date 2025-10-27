"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Filter,
  ImageIcon,
  Milestone,
  Plus,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";

import { TimelineItem } from "@/types";
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

const MAX_WORDS = 500;

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

export function TimelineWithForm({ items, fallenId, className }: TimelineWithFormProps) {
  const router = useRouter();
  const { canDelete } = useCanDeleteContent(fallenId);

  const [timelineItems, setTimelineItems] = useState<ExtendedTimelineItem[]>(() =>
    sortTimelineItems(items as ExtendedTimelineItem[]),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDecade, setSelectedDecade] = useState<string>("all");
  const [onlyWithMedia, setOnlyWithMedia] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTimelineItems(sortTimelineItems(items as ExtendedTimelineItem[]));
  }, [items]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, [previewUrl]);

  const handleInputChange = (field: keyof FormState, value: string | File | null) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "file") {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      if (value instanceof File) {
        const url = URL.createObjectURL(value);
        setPreviewUrl(url);
      }
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      formData.append("fallen_id", fallenId);
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());

      if (form.date) {
        formData.append("date_exact", form.date);
      }

      if (form.file) {
        formData.append("file", form.file);
      }

      const response = await fetch("/api/timeline", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Не удалось добавить запись.");
      }

      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }

      setSuccessMessage("Запись добавлена в хронику. Спасибо, что делитесь историей!");
      successTimeoutRef.current = setTimeout(() => {
        setSuccessMessage(null);
        successTimeoutRef.current = null;
      }, 6000);

      closeDialog();
      router.refresh();
    } catch (submitError) {
      console.error("Error creating timeline item:", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Не удалось добавить запись. Попробуйте ещё раз позже.",
      );
    } finally {
      setIsSubmitting(false);
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

      const descriptionCandidate =
        typeof (item as Record<string, unknown>).description === "string"
          ? ((item as Record<string, unknown>).description as string)
          : "";

      const haystack = [item.title, item.description_md, descriptionCandidate]
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

  return (
    <Card
      className={cn("border border-border/50 bg-background/80 shadow-soft backdrop-blur-sm", className)}
    >
      <CardHeader className="space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Хроника жизни героя
                </CardTitle>
                <p className="mt-1 max-w-xl text-sm text-foreground/60">
                  Собирайте ключевые вехи пути: детство, учебу, службу, волонтерство и совместные
                  победы. История станет понятной и живой для будущих поколений.
                </p>
              </div>
            </div>

            {canDelete && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Добавить событие
                </Button>
              </div>
            )}
          </div>

          <div className="grid w-full grid-cols-2 gap-3 sm:max-w-sm">
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
                className="rounded-xl border border-border/40 bg-background-soft/70 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-foreground">{value}</p>
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
          <Timeline items={filteredItems} />
        ) : timelineItems.length > 0 ? (
          <div className="space-y-4 rounded-2xl border border-dashed border-border/60 bg-background-soft/70 px-8 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Filter className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">По параметрам ничего не найдено</h3>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-foreground/70">
                Измените период или отключите фильтры, чтобы увидеть весь путь героя.
              </p>
            </div>
            <div className="flex justify-center">
              <Button onClick={resetFilters} className="gap-2">
                <Filter className="h-4 w-4" />
                Сбросить фильтры
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 rounded-2xl border border-dashed border-border/60 bg-background-soft/70 px-8 py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Milestone className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Начните хронику жизни героя
              </h3>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-foreground/70">
                Опишите первые шаги и важные события. Каждая веха помогает наполнить историю живыми
                деталями.
              </p>
            </div>
            {canDelete ? (
              <div className="flex justify-center">
                <Button onClick={() => setIsDialogOpen(true)} size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Добавить первую запись
                </Button>
              </div>
            ) : (
              <p className="text-sm text-foreground/50">
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
              Новая запись в хронике
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
                  onChange={(event) => handleInputChange("date", event.target.value)}
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
                  onChange={(event) => handleInputChange("title", event.target.value)}
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
                onChange={(event) => handleInputChange("description", event.target.value)}
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
                    onChange={(event) =>
                      handleInputChange(
                        "file",
                        event.target.files && event.target.files.length > 0
                          ? event.target.files[0]
                          : null,
                      )
                    }
                  />
                </div>
              </label>
              {previewUrl && (
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-background-soft">
                  <img
                    src={previewUrl}
                    alt="Предпросмотр выбранной фотографии"
                    className="h-full w-full max-h-72 object-cover"
                  />
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
                {isSubmitting ? "Сохраняем..." : "Добавить событие"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
