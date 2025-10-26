-- =====================================================
-- Книга Памяти Кавалерово - Дополнения к воспоминаниям и расширенная система комментариев
-- =====================================================
-- Миграция: 00018_memory_additions_and_comments.sql
-- Описание: Добавление таблицы дополнений к воспоминаниям и обновление комментариев
-- Дата: 2025-01-21

-- =====================================================
-- Таблица дополнений к воспоминаниям
-- =====================================================

CREATE TABLE IF NOT EXISTS public.memory_additions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Связь с воспоминанием
  memory_item_id UUID NOT NULL REFERENCES public.memory_items(id) ON DELETE CASCADE,

  -- Контент дополнения
  content_md TEXT NOT NULL, -- содержание в Markdown (лимит 1000 слов)

  -- Медиа (массив ID из fallen_media)
  media_ids UUID[], -- PostgreSQL array

  -- Модерация (постмодерация владельцем)
  status VARCHAR(50) DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected', 'archived')
  ),
  moderated_by UUID REFERENCES public.users(id),
  moderated_at TIMESTAMPTZ,
  moderation_note TEXT,

  -- Автор
  created_by UUID NOT NULL REFERENCES public.users(id),

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Индексы для memory_additions
-- =====================================================

CREATE INDEX idx_memory_additions_memory_item ON public.memory_additions(memory_item_id) WHERE NOT is_deleted;
CREATE INDEX idx_memory_additions_status ON public.memory_additions(status) WHERE NOT is_deleted;
CREATE INDEX idx_memory_additions_created_by ON public.memory_additions(created_by) WHERE NOT is_deleted;
CREATE INDEX idx_memory_additions_created_at ON public.memory_additions(created_at ASC) WHERE NOT is_deleted;

-- Композитный индекс для отображения одобренных дополнений
CREATE INDEX idx_memory_additions_approved ON public.memory_additions(memory_item_id, created_at ASC)
  WHERE NOT is_deleted AND status = 'approved';

-- =====================================================
-- Обновление таблицы комментариев
-- =====================================================

-- Добавляем поля для привязки комментариев к воспоминаниям и дополнениям
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS memory_item_id UUID REFERENCES public.memory_items(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS memory_addition_id UUID REFERENCES public.memory_additions(id) ON DELETE CASCADE;

-- Добавляем constraint: комментарий должен быть привязан к fallen ИЛИ memory_item ИЛИ memory_addition
ALTER TABLE public.comments
  ADD CONSTRAINT comments_entity_check CHECK (
    (fallen_id IS NOT NULL AND memory_item_id IS NULL AND memory_addition_id IS NULL) OR
    (fallen_id IS NULL AND memory_item_id IS NOT NULL AND memory_addition_id IS NULL) OR
    (fallen_id IS NULL AND memory_item_id IS NULL AND memory_addition_id IS NOT NULL)
  );

-- =====================================================
-- Индексы для комментариев к воспоминаниям
-- =====================================================

CREATE INDEX idx_comments_memory_item ON public.comments(memory_item_id) WHERE NOT is_deleted AND memory_item_id IS NOT NULL;
CREATE INDEX idx_comments_memory_addition ON public.comments(memory_addition_id) WHERE NOT is_deleted AND memory_addition_id IS NOT NULL;

-- Композитные индексы для древовидных комментариев
CREATE INDEX idx_comments_memory_item_tree ON public.comments(memory_item_id, parent_id, created_at)
  WHERE NOT is_deleted AND NOT is_hidden AND memory_item_id IS NOT NULL;

CREATE INDEX idx_comments_memory_addition_tree ON public.comments(memory_addition_id, parent_id, created_at)
  WHERE NOT is_deleted AND NOT is_hidden AND memory_addition_id IS NOT NULL;

-- =====================================================
-- Комментарии
-- =====================================================

COMMENT ON TABLE public.memory_additions IS 'Дополнения к воспоминаниям (timeline-структура)';
COMMENT ON COLUMN public.memory_additions.content_md IS 'Текст дополнения в формате Markdown (до 1000 слов)';
COMMENT ON COLUMN public.memory_additions.media_ids IS 'Массив ID медиа-файлов из fallen_media';
COMMENT ON COLUMN public.memory_additions.status IS 'Статус модерации: pending, approved, rejected, archived';

COMMENT ON COLUMN public.comments.memory_item_id IS 'ID воспоминания (если комментарий к воспоминанию)';
COMMENT ON COLUMN public.comments.memory_addition_id IS 'ID дополнения к воспоминанию (если комментарий к дополнению)';
