-- =====================================================
-- Книга Памяти Кавалерово - Очередь модерации
-- =====================================================
-- Миграция: 00008_create_moderation.sql
-- Описание: Очередь премодерации карточек и жалоб
-- Дата: 2025-01-19

CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Тип сущности: 'fallen', 'report', 'memory', 'timeline'
  entity_type VARCHAR(50) NOT NULL CHECK (
    entity_type IN ('fallen', 'report', 'memory', 'timeline', 'media')
  ),

  -- ID сущности (например, ID карточки погибшего)
  entity_id UUID NOT NULL,

  -- Приоритет
  priority VARCHAR(20) DEFAULT 'normal' CHECK (
    priority IN ('low', 'normal', 'high', 'urgent')
  ),

  -- Статус
  status VARCHAR(50) DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_review', 'resolved')
  ),

  -- Назначение модератору
  assigned_to UUID REFERENCES public.users(id),
  assigned_at TIMESTAMPTZ,

  -- Разрешение
  resolved_by UUID REFERENCES public.users(id),
  resolved_at TIMESTAMPTZ,
  resolution TEXT, -- описание решения

  -- Дополнительные данные (JSONB для гибкости)
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Индексы
-- =====================================================

CREATE INDEX idx_moderation_status ON public.moderation_queue(status);
CREATE INDEX idx_moderation_entity ON public.moderation_queue(entity_type, entity_id);
CREATE INDEX idx_moderation_assigned_to ON public.moderation_queue(assigned_to)
  WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_moderation_priority ON public.moderation_queue(priority, created_at)
  WHERE status = 'pending';
CREATE INDEX idx_moderation_created_at ON public.moderation_queue(created_at DESC);

-- =====================================================
-- Комментарии
-- =====================================================

COMMENT ON TABLE public.moderation_queue IS 'Очередь премодерации карточек и жалоб';
COMMENT ON COLUMN public.moderation_queue.entity_type IS 'Тип сущности: fallen, report, memory, timeline, media';
COMMENT ON COLUMN public.moderation_queue.priority IS 'Приоритет: low, normal, high, urgent';
COMMENT ON COLUMN public.moderation_queue.status IS 'Статус: pending, in_review, resolved';
COMMENT ON COLUMN public.moderation_queue.metadata IS 'Дополнительные данные (JSONB)';
