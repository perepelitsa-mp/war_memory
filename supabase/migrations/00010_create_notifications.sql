-- =====================================================
-- Книга Памяти Кавалерово - Очередь уведомлений
-- =====================================================
-- Миграция: 00010_create_notifications.sql
-- Описание: Очередь уведомлений (email, telegram)
-- Дата: 2025-01-19

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Получатель
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Тип уведомления
  type VARCHAR(50) NOT NULL CHECK (
    type IN (
      'moderation_pending',
      'moderation_approved',
      'moderation_rejected',
      'new_memory',
      'new_timeline',
      'new_comment',
      'editor_invited',
      'reminder_moderation'
    )
  ),

  -- Контент
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Связанная сущность
  entity_type VARCHAR(50),
  entity_id UUID,

  -- Канал отправки
  channel VARCHAR(20) NOT NULL CHECK (
    channel IN ('email', 'telegram')
  ),

  -- Статус отправки
  status VARCHAR(50) DEFAULT 'pending' CHECK (
    status IN ('pending', 'sent', 'failed')
  ),

  -- Отправка
  sent_at TIMESTAMPTZ,
  error_message TEXT,

  -- Метаданные (для хранения дополнительных данных)
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Индексы
-- =====================================================

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_status ON public.notifications(status);
CREATE INDEX idx_notifications_channel ON public.notifications(channel);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Индекс для очереди отправки (pending notifications)
CREATE INDEX idx_notifications_pending ON public.notifications(created_at)
  WHERE status = 'pending';

-- =====================================================
-- Комментарии
-- =====================================================

COMMENT ON TABLE public.notifications IS 'Очередь уведомлений (email, telegram)';
COMMENT ON COLUMN public.notifications.type IS 'Тип уведомления';
COMMENT ON COLUMN public.notifications.channel IS 'Канал: email или telegram';
COMMENT ON COLUMN public.notifications.status IS 'Статус: pending, sent, failed';
COMMENT ON COLUMN public.notifications.metadata IS 'Дополнительные данные (JSONB)';
