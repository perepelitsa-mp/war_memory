-- =====================================================
-- Книга Памяти Кавалерово - Убрать модерацию дополнений к воспоминаниям
-- =====================================================
-- Миграция: 00032_remove_addition_moderation.sql
-- Описание: Изменение дефолтного статуса memory_additions с 'pending' на 'approved'
--           Дополнения к воспоминаниям теперь публикуются сразу без модерации
-- Дата: 2025-01-26

-- =====================================================
-- Изменение дефолтного статуса для новых дополнений
-- =====================================================

-- Изменяем дефолтное значение status на 'approved'
ALTER TABLE public.memory_additions
ALTER COLUMN status SET DEFAULT 'approved';

-- Одобряем все существующие дополнения со статусом 'pending'
UPDATE public.memory_additions
SET status = 'approved',
    moderated_at = NOW(),
    moderated_by = created_by,
    moderation_note = 'Автоматическое одобрение при отключении модерации'
WHERE status = 'pending' AND NOT is_deleted;

COMMENT ON COLUMN public.memory_additions.status IS
'Статус дополнения к воспоминанию. По умолчанию approved - модерация отключена';

-- =====================================================
-- Добавление функции для мягкого удаления дополнений
-- =====================================================

CREATE OR REPLACE FUNCTION public.soft_delete_memory_addition(
  p_addition_id UUID,
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
  -- Получаем владельца карточки для данного дополнения
  SELECT f.owner_id INTO v_fallen_owner_id
  FROM public.memory_additions ma
  JOIN public.memory_items m ON ma.memory_item_id = m.id
  JOIN public.fallen f ON m.fallen_id = f.id
  WHERE ma.id = p_addition_id AND NOT ma.is_deleted;

  IF v_fallen_owner_id IS NULL THEN
    RAISE EXCEPTION 'Memory addition not found or already deleted';
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
    RAISE EXCEPTION 'Insufficient permissions to delete this memory addition';
  END IF;

  -- Выполняем мягкое удаление
  UPDATE public.memory_additions
  SET is_deleted = TRUE,
      deleted_at = NOW(),
      deleted_by = p_user_id
  WHERE id = p_addition_id;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.soft_delete_memory_addition IS
'Мягкое удаление дополнения к воспоминанию. Доступно владельцу карточки и администраторам';
