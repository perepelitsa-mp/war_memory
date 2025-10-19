-- =====================================================
-- Книга Памяти Кавалерово - Журнал аудита
-- =====================================================
-- Миграция: 00009_create_audit.sql
-- Описание: Полный аудит всех действий в системе
-- Дата: 2025-01-19

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Таблица и запись
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,

  -- Действие: insert, update, delete, restore
  action VARCHAR(50) NOT NULL CHECK (
    action IN ('insert', 'update', 'delete', 'restore', 'soft_delete')
  ),

  -- Значения до и после
  old_values JSONB,
  new_values JSONB,

  -- Пользователь
  changed_by UUID REFERENCES public.users(id),

  -- Метаданные запроса
  ip_address INET,
  user_agent TEXT,

  -- Timestamp
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Индексы
-- =====================================================

CREATE INDEX idx_audit_table_record ON public.audit_log(table_name, record_id);
CREATE INDEX idx_audit_changed_by ON public.audit_log(changed_by) WHERE changed_by IS NOT NULL;
CREATE INDEX idx_audit_changed_at ON public.audit_log(changed_at DESC);
CREATE INDEX idx_audit_action ON public.audit_log(action);

-- Композитный индекс для поиска истории конкретной записи
CREATE INDEX idx_audit_record_history ON public.audit_log(table_name, record_id, changed_at DESC);

-- =====================================================
-- Комментарии
-- =====================================================

COMMENT ON TABLE public.audit_log IS 'Журнал аудита всех действий';
COMMENT ON COLUMN public.audit_log.action IS 'Действие: insert, update, delete, restore, soft_delete';
COMMENT ON COLUMN public.audit_log.old_values IS 'Значения до изменения (JSONB)';
COMMENT ON COLUMN public.audit_log.new_values IS 'Значения после изменения (JSONB)';
COMMENT ON COLUMN public.audit_log.ip_address IS 'IP адрес пользователя';
COMMENT ON COLUMN public.audit_log.user_agent IS 'User-Agent браузера';
