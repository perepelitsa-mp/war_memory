-- =====================================================
-- Книга Памяти Кавалерово - Убрать модерацию воспоминаний
-- =====================================================
-- Миграция: 00031_remove_memory_moderation.sql
-- Описание: Изменение дефолтного статуса memory_items с 'pending' на 'approved'
--           Воспоминания теперь публикуются сразу без модерации
-- Дата: 2025-01-26

-- =====================================================
-- Изменение дефолтного статуса для новых воспоминаний
-- =====================================================

-- Изменяем дефолтное значение status на 'approved'
ALTER TABLE public.memory_items
ALTER COLUMN status SET DEFAULT 'approved';

-- Одобряем все существующие воспоминания со статусом 'pending'
UPDATE public.memory_items
SET status = 'approved',
    moderated_at = NOW(),
    moderated_by = created_by,
    moderation_note = 'Автоматическое одобрение при отключении модерации'
WHERE status = 'pending' AND NOT is_deleted;

COMMENT ON COLUMN public.memory_items.status IS
'Статус воспоминания. По умолчанию approved - модерация отключена';

-- =====================================================
-- Добавление функции для мягкого удаления воспоминаний
-- =====================================================

CREATE OR REPLACE FUNCTION public.soft_delete_memory_item(
  p_memory_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_fallen_owner_id UUID;
  v_user_role TEXT;
  v_can_delete BOOLEAN := FALSE;
BEGIN
  -- Получаем владельца карточки для данного воспоминания
  SELECT f.owner_id INTO v_fallen_owner_id
  FROM public.memory_items m
  JOIN public.fallen f ON m.fallen_id = f.id
  WHERE m.id = p_memory_id AND NOT m.is_deleted;

  IF v_fallen_owner_id IS NULL THEN
    RAISE EXCEPTION 'Memory item not found or already deleted';
  END IF;

  -- Получаем роль пользователя
  SELECT role INTO v_user_role
  FROM public.users
  WHERE id = p_user_id AND NOT is_deleted;

  -- Проверяем права: владелец карточки или админ/модератор
  IF p_user_id = v_fallen_owner_id THEN
    v_can_delete := TRUE;
  ELSIF v_user_role IN ('superadmin', 'admin', 'moderator') THEN
    v_can_delete := TRUE;
  END IF;

  IF NOT v_can_delete THEN
    RAISE EXCEPTION 'Insufficient permissions to delete this memory item';
  END IF;

  -- Выполняем мягкое удаление
  UPDATE public.memory_items
  SET is_deleted = TRUE,
      deleted_at = NOW(),
      deleted_by = p_user_id
  WHERE id = p_memory_id;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.soft_delete_memory_item IS
'Мягкое удаление воспоминания. Доступно владельцу карточки и администраторам';

-- =====================================================
-- Добавление функции для мягкого удаления комментариев
-- =====================================================

CREATE OR REPLACE FUNCTION public.soft_delete_comment(
  p_comment_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_fallen_owner_id UUID;
  v_user_role TEXT;
  v_can_delete BOOLEAN := FALSE;
BEGIN
  -- Получаем владельца карточки для данного комментария
  SELECT f.owner_id INTO v_fallen_owner_id
  FROM public.comments c
  JOIN public.fallen f ON c.fallen_id = f.id
  WHERE c.id = p_comment_id AND NOT c.is_deleted;

  IF v_fallen_owner_id IS NULL THEN
    RAISE EXCEPTION 'Comment not found or already deleted';
  END IF;

  -- Получаем роль пользователя
  SELECT role INTO v_user_role
  FROM public.users
  WHERE id = p_user_id AND NOT is_deleted;

  -- Проверяем права: владелец карточки или админ/модератор
  IF p_user_id = v_fallen_owner_id THEN
    v_can_delete := TRUE;
  ELSIF v_user_role IN ('superadmin', 'admin', 'moderator') THEN
    v_can_delete := TRUE;
  END IF;

  IF NOT v_can_delete THEN
    RAISE EXCEPTION 'Insufficient permissions to delete this comment';
  END IF;

  -- Выполняем мягкое удаление
  UPDATE public.comments
  SET is_deleted = TRUE,
      deleted_at = NOW(),
      deleted_by = p_user_id
  WHERE id = p_comment_id;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.soft_delete_comment IS
'Мягкое удаление комментария. Доступно владельцу карточки и администраторам';
