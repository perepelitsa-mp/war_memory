-- =====================================================
-- Книга Памяти Кавалерово - Добавление полей уведомлений
-- =====================================================
-- Миграция: 00014_add_notification_fields.sql
-- Описание: Добавление отдельных полей для уведомлений в таблицу users
-- Дата: 2025-01-19

-- Добавляем отдельные поля для уведомлений для совместимости
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS notification_telegram BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT true;

-- Обновляем существующих пользователей
UPDATE public.users
SET
  notification_telegram = (notification_preferences->>'telegram')::boolean,
  notification_email = (notification_preferences->>'email')::boolean
WHERE notification_preferences IS NOT NULL;

-- Комментарии
COMMENT ON COLUMN public.users.notification_telegram IS 'Уведомления через Telegram';
COMMENT ON COLUMN public.users.notification_email IS 'Уведомления через Email';
