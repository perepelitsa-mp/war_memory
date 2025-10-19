-- =====================================================
-- Книга Памяти Кавалерово - Таблица таймлайна жизни
-- =====================================================
-- Миграция: 00005_create_timeline.sql
-- Описание: События жизни погибших (с постмодерацией)
-- Дата: 2025-01-19

CREATE TABLE IF NOT EXISTS public.timeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Связь с карточкой
  fallen_id UUID NOT NULL REFERENCES public.fallen(id) ON DELETE CASCADE,

  -- Дата события
  date_exact DATE, -- точная дата (если известна)
  year INTEGER, -- год (если точная дата неизвестна)

  -- Контент
  title VARCHAR(255) NOT NULL,
  description_md TEXT, -- описание в Markdown

  -- Медиа (опционально)
  media_id UUID REFERENCES public.fallen_media(id),

  -- Модерация (постмодерация владельцем карточки)
  status VARCHAR(50) DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected', 'archived')
  ),
  moderated_by UUID REFERENCES public.users(id),
  moderated_at TIMESTAMPTZ,
  moderation_note TEXT,

  -- Аудит изменений
  created_by UUID NOT NULL REFERENCES public.users(id),
  audit_diff JSONB, -- для хранения истории изменений

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT timeline_date_check CHECK (
    (date_exact IS NOT NULL) OR (year IS NOT NULL)
  )
);

-- =====================================================
-- Индексы
-- =====================================================

CREATE INDEX idx_timeline_fallen ON public.timeline_items(fallen_id) WHERE NOT is_deleted;
CREATE INDEX idx_timeline_status ON public.timeline_items(status) WHERE NOT is_deleted;
CREATE INDEX idx_timeline_date ON public.timeline_items(year, date_exact) WHERE NOT is_deleted;
CREATE INDEX idx_timeline_created_by ON public.timeline_items(created_by) WHERE NOT is_deleted;
CREATE INDEX idx_timeline_moderated_by ON public.timeline_items(moderated_by)
  WHERE NOT is_deleted AND moderated_by IS NOT NULL;

-- Композитный индекс для сортировки событий
CREATE INDEX idx_timeline_fallen_date ON public.timeline_items(fallen_id, year, date_exact)
  WHERE NOT is_deleted AND status = 'approved';

-- =====================================================
-- Комментарии
-- =====================================================

COMMENT ON TABLE public.timeline_items IS 'События жизни погибших (таймлайн)';
COMMENT ON COLUMN public.timeline_items.date_exact IS 'Точная дата события (если известна)';
COMMENT ON COLUMN public.timeline_items.year IS 'Год события (если точная дата неизвестна)';
COMMENT ON COLUMN public.timeline_items.status IS 'Статус модерации: pending, approved, rejected, archived';
COMMENT ON COLUMN public.timeline_items.audit_diff IS 'История изменений (JSONB)';
