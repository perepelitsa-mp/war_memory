"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload, X } from "lucide-react";

import { TimelineItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timeline, ExtendedTimelineItem } from "@/components/fallen/Timeline";
import { cn } from "@/lib/utils";

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

const sortTimelineItems = (items: ExtendedTimelineItem[]) =>
  [...items].sort((a, b) => {
    const dateA = a.date_exact ? new Date(a.date_exact).getTime() : a.year ? a.year : 0;
    const dateB = b.date_exact ? new Date(b.date_exact).getTime() : b.year ? b.year : 0;
    return dateA - dateB;
  });

const countWords = (text: string) =>
  text.trim().length === 0 ? 0 : text.trim().split(/\s+/).filter(Boolean).length;

export function TimelineWithForm({ items, fallenId, className }: TimelineWithFormProps) {
  const router = useRouter();
  const [timelineItems, setTimelineItems] = useState<ExtendedTimelineItem[]>(() =>
    sortTimelineItems(items),
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTimelineItems(sortTimelineItems(items));
  }, [items]);

  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
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

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const words = countWords(form.description);
    if (words > MAX_WORDS) {
      setError(`Описание превышает лимит в ${MAX_WORDS} слов.`);
      return;
    }

    if (!form.title.trim()) {
      setError("Укажите заголовок события.");
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const eventDate = form.date ? new Date(form.date) : now;

      const optimisticItem: ExtendedTimelineItem = {
        id: `local-${Date.now()}`,
        fallen_id: fallenId,
        date_exact: form.date ? eventDate.toISOString() : null,
        year: form.date ? eventDate.getFullYear() : now.getFullYear(),
        title: form.title.trim(),
        description_md: form.description.trim(),
        media_id: null,
        status: "pending",
        moderated_by: null,
        moderated_at: null,
        moderation_note: null,
        created_by: "local",
        audit_diff: null,
        is_deleted: false,
        deleted_at: null,
        deleted_by: null,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        local_image_preview: previewUrl,
        is_local: true,
      };

      setTimelineItems((previous) => sortTimelineItems([...previous, optimisticItem]));
      setSuccessMessage(
        "Событие сохранено и появится в хронике после проверки модератором.",
      );
      setTimeout(() => setSuccessMessage(null), 6000);
      closeModal();
      router.refresh();
    } catch (submitError) {
      setError("Не удалось сохранить событие. Попробуйте ещё раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentWordCount = useMemo(() => countWords(form.description), [form.description]);
  const isWordLimitExceeded = currentWordCount > MAX_WORDS;

  return (
    <Card className={cn(
      "flex h-full flex-col border border-border/50 bg-background/80 shadow-soft backdrop-blur-sm",
      className,
    )}>
      <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-foreground">Хроника событий</CardTitle>
          <p className="text-sm text-foreground/70">
            Записывайте важные даты, чтобы дорога героя была понятной и близкой семье.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2" size="sm">
          <Plus className="h-4 w-4" />
          Добавить событие
        </Button>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6 overflow-hidden">
        {successMessage ? (
          <div className="rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
            {successMessage}
          </div>
        ) : null}

        <div className="max-h-[520px] space-y-6 overflow-y-auto pr-2 scrollbar-soft">
          <Timeline items={timelineItems} />
        </div>
      </CardContent>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-12 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-3xl border border-border/60 bg-background shadow-glow">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full border border-border/40 bg-background-soft p-2 text-muted-foreground transition hover:text-foreground"
              onClick={closeModal}
              aria-label="Закрыть окно добавления события"
            >
              <X className="h-4 w-4" />
            </button>

            <form className="space-y-6 px-6 py-8 md:px-10" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">Новое событие</h2>
                <p className="text-sm text-foreground/70">
                  Расскажите о важном моменте из жизни героя: где это произошло, кто был рядом и как вы
                  запомнили тот день.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
                  Дата события (по желанию)
                  <input
                    type="date"
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={form.date}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(event) => handleInputChange("date", event.target.value)}
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
                  Заголовок
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={140}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={form.title}
                    onChange={(event) => handleInputChange("title", event.target.value)}
                    placeholder="Например, Награждение орденом Мужества"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
                Описание
                <textarea
                  required
                  minLength={20}
                  className={cn(
                    "min-h-[160px] w-full rounded-2xl border border-border/60 bg-background px-3 py-3 text-sm leading-relaxed text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40",
                    isWordLimitExceeded && "border-destructive/60 focus:ring-destructive/40",
                  )}
                  value={form.description}
                  onChange={(event) => handleInputChange("description", event.target.value)}
                  placeholder="Опишите, что чувствовали вы и герой, почему этот момент так важен для вашей семьи."
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
                      <p>Перетащите файл сюда или выберите на устройстве</p>
                      <p>Поддерживаемые форматы: JPG, PNG, WEBP</p>
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
                      alt="Предпросмотр изображения"
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
                  onClick={closeModal}
                  className="sm:min-w-[140px]"
                >
                  Отменить
                </Button>
                <Button
                  type="submit"
                  className="sm:min-w-[180px]"
                  disabled={isSubmitting || isWordLimitExceeded}
                >
                  {isSubmitting ? "Сохраняем..." : "Сохранить событие"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}