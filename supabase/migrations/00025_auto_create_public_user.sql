-- =====================================================
-- Книга Памяти Кавалерово - Автоматическое создание записи в public.users
-- =====================================================
-- Миграция: 00025_auto_create_public_user.sql
-- Описание: Триггер для автоматического создания записи в public.users
--           при регистрации пользователя через Supabase Auth
-- Дата: 2025-01-23

-- Функция-обработчик для создания записи в public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    phone,
    role,
    email_verified,
    notification_preferences,
    is_deleted,
    avatar_url,
    vk_id,
    vk_access_token,
    vk_profile_url,
    telegram_chat_id,
    telegram_username,
    deleted_at,
    deleted_by,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''), -- Берем из metadata
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone'), -- Берем phone из auth.users или metadata
    'user', -- По умолчанию роль user
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false), -- Проверка подтверждения email
    '{"email": true, "telegram": false}'::jsonb, -- Настройки по умолчанию
    false, -- Не удален
    NULL, -- avatar_url
    NULL, -- vk_id
    NULL, -- vk_access_token
    NULL, -- vk_profile_url
    NULL, -- telegram_chat_id
    NULL, -- telegram_username
    NULL, -- deleted_at
    NULL, -- deleted_by
    NOW(), -- created_at
    NOW() -- updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = COALESCE(EXCLUDED.phone, public.users.phone),
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.users.full_name),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер на создание нового пользователя в auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Комментарии
COMMENT ON FUNCTION public.handle_new_user() IS
  'Автоматически создает запись в public.users при регистрации через Supabase Auth';
