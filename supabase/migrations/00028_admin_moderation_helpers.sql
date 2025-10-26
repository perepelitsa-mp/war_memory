-- =====================================================
-- Книга Памяти Кавалерово - Хелперы для админ-панели модерации
-- =====================================================
-- Миграция: 00028_admin_moderation_helpers.sql
-- Описание: View и функции для упрощения работы админ-панели модерации
-- Дата: 2025-01-26

-- =====================================================
-- 1. VIEW для карточек на модерации с деталями
-- =====================================================

CREATE OR REPLACE VIEW admin_moderation_cards AS
SELECT
  f.id,
  f.last_name,
  f.first_name,
  f.middle_name,
  f.birth_date,
  f.death_date,
  f.military_unit,
  f.rank,
  f.hometown,
  f.burial_location,
  f.hero_photo_url,
  f.memorial_text,
  f.biography_md,
  f.proof_document_url,
  f.relationship,
  f.status,
  f.created_at,
  f.updated_at,
  -- Владелец карточки
  u.id AS owner_id,
  u.full_name AS owner_name,
  u.email AS owner_email,
  u.phone AS owner_phone,
  u.avatar_url AS owner_avatar_url,
  -- Количество дней в очереди модерации
  EXTRACT(DAY FROM (NOW() - f.created_at))::INTEGER AS days_in_queue,
  -- Приоритет (старые карточки - выше приоритет)
  CASE
    WHEN EXTRACT(DAY FROM (NOW() - f.created_at)) > 6 THEN 'urgent'
    WHEN EXTRACT(DAY FROM (NOW() - f.created_at)) > 3 THEN 'high'
    ELSE 'normal'
  END AS priority
FROM
  public.fallen f
  INNER JOIN public.users u ON f.owner_id = u.id
WHERE
  f.is_deleted = false
  AND u.is_deleted = false
  AND f.status = 'pending';

COMMENT ON VIEW admin_moderation_cards IS 'Карточки на модерации с деталями владельца и приоритетом';

-- =====================================================
-- 2. Функция для получения статистики модерации
-- =====================================================

CREATE OR REPLACE FUNCTION get_moderation_stats()
RETURNS TABLE(
  total_pending INTEGER,
  urgent_pending INTEGER,
  approved_today INTEGER,
  approved_this_week INTEGER,
  rejected_this_week INTEGER,
  avg_moderation_time_hours NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Всего на модерации
    (SELECT COUNT(*)::INTEGER FROM public.fallen WHERE status = 'pending' AND NOT is_deleted),

    -- Срочных (>6 дней)
    (SELECT COUNT(*)::INTEGER FROM public.fallen
     WHERE status = 'pending'
     AND NOT is_deleted
     AND EXTRACT(DAY FROM (NOW() - created_at)) > 6),

    -- Одобрено сегодня
    (SELECT COUNT(*)::INTEGER FROM public.fallen
     WHERE status = 'approved'
     AND NOT is_deleted
     AND moderated_at >= CURRENT_DATE),

    -- Одобрено за неделю
    (SELECT COUNT(*)::INTEGER FROM public.fallen
     WHERE status = 'approved'
     AND NOT is_deleted
     AND moderated_at >= CURRENT_DATE - INTERVAL '7 days'),

    -- Отклонено за неделю
    (SELECT COUNT(*)::INTEGER FROM public.fallen
     WHERE status = 'rejected'
     AND NOT is_deleted
     AND moderated_at >= CURRENT_DATE - INTERVAL '7 days'),

    -- Среднее время модерации (в часах)
    (SELECT ROUND(AVG(EXTRACT(EPOCH FROM (moderated_at - created_at)) / 3600), 1)
     FROM public.fallen
     WHERE status IN ('approved', 'rejected')
     AND NOT is_deleted
     AND moderated_at >= CURRENT_DATE - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_moderation_stats IS 'Статистика работы модерации за различные периоды';

-- =====================================================
-- 3. Функция для модерации карточки (одобрение/отклонение)
-- =====================================================

CREATE OR REPLACE FUNCTION moderate_fallen_card(
  p_card_id UUID,
  p_action VARCHAR(20), -- 'approve' или 'reject'
  p_moderation_note TEXT DEFAULT NULL,
  p_moderator_id UUID DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  card_id UUID,
  new_status VARCHAR(50)
) AS $$
DECLARE
  v_new_status VARCHAR(50);
  v_moderator_id UUID;
  v_card_exists BOOLEAN;
BEGIN
  -- Определяем модератора (из параметра или из auth.uid())
  v_moderator_id := COALESCE(p_moderator_id, auth.uid());

  -- Проверяем существование карточки и её статус
  SELECT EXISTS(
    SELECT 1 FROM public.fallen
    WHERE id = p_card_id
    AND NOT is_deleted
    AND status = 'pending'
  ) INTO v_card_exists;

  IF NOT v_card_exists THEN
    RETURN QUERY SELECT
      false,
      'Карточка не найдена или не находится на модерации'::TEXT,
      p_card_id,
      NULL::VARCHAR(50);
    RETURN;
  END IF;

  -- Определяем новый статус
  IF p_action = 'approve' THEN
    v_new_status := 'approved';
  ELSIF p_action = 'reject' THEN
    v_new_status := 'rejected';
  ELSE
    RETURN QUERY SELECT
      false,
      'Неверное действие. Допустимы: approve, reject'::TEXT,
      p_card_id,
      NULL::VARCHAR(50);
    RETURN;
  END IF;

  -- Обновляем карточку
  UPDATE public.fallen
  SET
    status = v_new_status,
    moderated_by = v_moderator_id,
    moderated_at = NOW(),
    moderation_note = p_moderation_note
  WHERE id = p_card_id;

  -- Возвращаем результат
  RETURN QUERY SELECT
    true,
    'Карточка успешно ' ||
    CASE WHEN p_action = 'approve' THEN 'одобрена' ELSE 'отклонена' END::TEXT,
    p_card_id,
    v_new_status;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION moderate_fallen_card IS 'Функция для одобрения или отклонения карточки погибшего';

-- =====================================================
-- 4. Индексы для оптимизации запросов модерации
-- =====================================================

-- Индекс для быстрого получения pending карточек с сортировкой по дате
CREATE INDEX IF NOT EXISTS idx_fallen_pending_created
  ON public.fallen(created_at DESC)
  WHERE status = 'pending' AND NOT is_deleted;

-- Индекс для статистики одобренных карточек
CREATE INDEX IF NOT EXISTS idx_fallen_moderated_at
  ON public.fallen(moderated_at DESC)
  WHERE moderated_at IS NOT NULL AND NOT is_deleted;

-- Композитный индекс для статистики по статусу и дате модерации
CREATE INDEX IF NOT EXISTS idx_fallen_status_moderated
  ON public.fallen(status, moderated_at DESC)
  WHERE status IN ('approved', 'rejected') AND NOT is_deleted;

-- =====================================================
-- 5. RLS политики для view
-- =====================================================

-- View наследует политики от базовых таблиц,
-- но добавим явную проверку для доступа только админам/суперадминам
-- (Это делается на уровне приложения через API routes)

-- =====================================================
-- Готово!
-- =====================================================
