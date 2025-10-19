-- =====================================================
-- Книга Памяти Кавалерово - Таблица комментариев
-- =====================================================
-- Миграция: 00007_create_comments.sql
-- Описание: Древовидные комментарии к карточкам
-- Дата: 2025-01-19

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Связь с карточкой
  fallen_id UUID NOT NULL REFERENCES public.fallen(id) ON DELETE CASCADE,

  -- Древовидность (parent_id = NULL для корневого комментария)
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,

  -- Контент
  content TEXT NOT NULL,

  -- Автор
  author_id UUID NOT NULL REFERENCES public.users(id),

  -- Модерация (скрытие владельцем карточки)
  is_hidden BOOLEAN DEFAULT false,
  hidden_by UUID REFERENCES public.users(id),
  hidden_at TIMESTAMPTZ,
  hidden_reason TEXT,

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

CREATE INDEX idx_comments_fallen ON public.comments(fallen_id) WHERE NOT is_deleted;
CREATE INDEX idx_comments_parent ON public.comments(parent_id) WHERE NOT is_deleted AND parent_id IS NOT NULL;
CREATE INDEX idx_comments_author ON public.comments(author_id) WHERE NOT is_deleted;
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC) WHERE NOT is_deleted;

-- Композитный индекс для отображения комментариев к карточке
CREATE INDEX idx_comments_fallen_tree ON public.comments(fallen_id, parent_id, created_at)
  WHERE NOT is_deleted AND NOT is_hidden;

-- =====================================================
-- Комментарии
-- =====================================================

COMMENT ON TABLE public.comments IS 'Комментарии к карточкам (древовидные)';
COMMENT ON COLUMN public.comments.parent_id IS 'ID родительского комментария (NULL для корневого)';
COMMENT ON COLUMN public.comments.is_hidden IS 'Скрыт владельцем карточки';
