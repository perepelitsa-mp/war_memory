-- =====================================================
-- Книга Памяти Кавалерово - Исправление RLS для notifications
-- =====================================================
-- Миграция: 00030_fix_notifications_rls.sql
-- Описание: Добавление политики INSERT для notifications
-- Дата: 2025-01-26

-- =====================================================
-- Политика для создания уведомлений
-- =====================================================

-- Разрешаем создание уведомлений через триггеры
-- Триггерные функции запускаются с SECURITY DEFINER,
-- поэтому они должны иметь возможность создавать уведомления
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Альтернативно, если нужно ограничить создание только триггерами/функциями:
-- WITH CHECK (
--   auth.uid() IS NOT NULL
--   OR current_setting('request.jwt.claim.role', true) = 'service_role'
-- );

COMMENT ON POLICY "System can create notifications" ON public.notifications IS
'Разрешает создание уведомлений системой (триггерами и функциями)';
