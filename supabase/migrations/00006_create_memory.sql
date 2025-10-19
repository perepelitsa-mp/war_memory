-- =====================================================
-- Книга Памяти Кавалерово - Таблица материалов памяти
-- =====================================================
-- Миграция: 00006_create_memory.sql
-- Описание: Истории и материалы памяти (фото, видео, тексты)
-- Дата: 2025-01-19

CREATE TABLE IF NOT EXISTS public.memory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Связь с карточкой
  fallen_id UUID NOT NULL REFERENCES public.fallen(id) ON DELETE CASCADE,

  -- Контент
  title VARCHAR(255) NOT NULL,
  content_md TEXT, -- содержание в Markdown

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
-- Индексы
-- =====================================================

CREATE INDEX idx_memory_fallen ON public.memory_items(fallen_id) WHERE NOT is_deleted;
CREATE INDEX idx_memory_status ON public.memory_items(status) WHERE NOT is_deleted;
CREATE INDEX idx_memory_created_by ON public.memory_items(created_by) WHERE NOT is_deleted;
CREATE INDEX idx_memory_moderated_by ON public.memory_items(moderated_by)
  WHERE NOT is_deleted AND moderated_by IS NOT NULL;
CREATE INDEX idx_memory_created_at ON public.memory_items(created_at DESC) WHERE NOT is_deleted;

-- Композитный индекс для отображения одобренных воспоминаний
CREATE INDEX idx_memory_fallen_approved ON public.memory_items(fallen_id, created_at DESC)
  WHERE NOT is_deleted AND status = 'approved';

-- =====================================================
-- Комментарии
-- =====================================================

COMMENT ON TABLE public.memory_items IS 'Материалы памяти (истории, фото, видео)';
COMMENT ON COLUMN public.memory_items.content_md IS 'Текст в формате Markdown';
COMMENT ON COLUMN public.memory_items.media_ids IS 'Массив ID медиа-файлов из fallen_media';
COMMENT ON COLUMN public.memory_items.status IS 'Статус модерации: pending, approved, rejected, archived';
