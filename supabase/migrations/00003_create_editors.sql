-- =====================================================
-- Книга Памяти Кавалерово - Таблица редакторов
-- =====================================================
-- Миграция: 00003_create_editors.sql
-- Описание: Таблица для связи многие-ко-многим между fallen и users (редакторы)
-- Дата: 2025-01-19

CREATE TABLE IF NOT EXISTS public.editors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Связи
  fallen_id UUID NOT NULL REFERENCES public.fallen(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Приглашение
  invited_by UUID REFERENCES public.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.users(id),

  -- Уникальность: один пользователь = один редактор для конкретной карточки
  CONSTRAINT editors_unique_fallen_user UNIQUE(fallen_id, user_id)
);

-- =====================================================
-- Индексы
-- =====================================================

CREATE INDEX idx_editors_fallen ON public.editors(fallen_id) WHERE NOT is_deleted;
CREATE INDEX idx_editors_user ON public.editors(user_id) WHERE NOT is_deleted;
CREATE INDEX idx_editors_invited_by ON public.editors(invited_by) WHERE NOT is_deleted AND invited_by IS NOT NULL;

-- =====================================================
-- Комментарии
-- =====================================================

COMMENT ON TABLE public.editors IS 'Таблица редакторов карточек (многие-ко-многим)';
COMMENT ON COLUMN public.editors.fallen_id IS 'ID карточки погибшего';
COMMENT ON COLUMN public.editors.user_id IS 'ID пользователя-редактора';
COMMENT ON COLUMN public.editors.invited_by IS 'Кто пригласил редактора';
