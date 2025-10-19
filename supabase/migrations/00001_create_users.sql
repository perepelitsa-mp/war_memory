-- =====================================================
-- Книга Памяти Кавалерово - Таблица пользователей
-- =====================================================
-- Миграция: 00001_create_users.sql
-- Описание: Создание таблицы users для хранения данных пользователей
-- Дата: 2025-01-19

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Основная информация
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,

  -- VK Integration
  vk_id BIGINT UNIQUE,
  vk_access_token TEXT,
  vk_profile_url TEXT,

  -- Роли: superadmin, admin, moderator, owner, editor, user, guest
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('superadmin', 'admin', 'moderator', 'owner', 'editor', 'user', 'guest')),

  -- Notifications
  telegram_chat_id BIGINT,
  telegram_username VARCHAR(255),
  email_verified BOOLEAN DEFAULT false,
  notification_preferences JSONB DEFAULT '{"email": true, "telegram": false}'::jsonb,

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

-- Индекс по email (только для активных пользователей)
CREATE INDEX idx_users_email ON public.users(email) WHERE NOT is_deleted;

-- Индекс по VK ID (для OAuth)
CREATE INDEX idx_users_vk_id ON public.users(vk_id) WHERE NOT is_deleted AND vk_id IS NOT NULL;

-- Индекс по ролям (для фильтрации админов, модераторов и т.д.)
CREATE INDEX idx_users_role ON public.users(role) WHERE NOT is_deleted;

-- Индекс по telegram_chat_id (для отправки уведомлений)
CREATE INDEX idx_users_telegram_chat_id ON public.users(telegram_chat_id)
  WHERE NOT is_deleted AND telegram_chat_id IS NOT NULL;

-- Индекс по created_at (для сортировки)
CREATE INDEX idx_users_created_at ON public.users(created_at DESC) WHERE NOT is_deleted;

-- =====================================================
-- Комментарии
-- =====================================================

COMMENT ON TABLE public.users IS 'Таблица пользователей системы';
COMMENT ON COLUMN public.users.id IS 'Уникальный идентификатор пользователя';
COMMENT ON COLUMN public.users.email IS 'Email пользователя (для авторизации)';
COMMENT ON COLUMN public.users.full_name IS 'Полное имя пользователя (ФИО)';
COMMENT ON COLUMN public.users.phone IS 'Номер телефона (опционально)';
COMMENT ON COLUMN public.users.vk_id IS 'VK ID для OAuth авторизации';
COMMENT ON COLUMN public.users.role IS 'Роль пользователя в системе';
COMMENT ON COLUMN public.users.telegram_chat_id IS 'Chat ID для отправки уведомлений в Telegram';
COMMENT ON COLUMN public.users.notification_preferences IS 'Настройки уведомлений (JSONB)';
COMMENT ON COLUMN public.users.is_deleted IS 'Флаг мягкого удаления';
