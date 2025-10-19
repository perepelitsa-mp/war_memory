-- =====================================================
-- Книга Памяти Кавалерово - Триггеры
-- =====================================================
-- Миграция: 00013_create_triggers.sql
-- Описание: Триггеры для автоматического обновления и аудита
-- Дата: 2025-01-19

-- =====================================================
-- 1. Функция для обновления updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. Применить триггер updated_at ко всем таблицам
-- =====================================================

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fallen_updated_at
  BEFORE UPDATE ON public.fallen
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_updated_at
  BEFORE UPDATE ON public.timeline_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memory_updated_at
  BEFORE UPDATE ON public.memory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. Функция для аудита изменений
-- =====================================================

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Получить текущего пользователя из JWT
  current_user_id := auth.uid();

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (
      table_name,
      record_id,
      action,
      new_values,
      changed_by
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id,
      'insert',
      row_to_json(NEW),
      current_user_id
    );
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Проверить, был ли это soft delete
    IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
      INSERT INTO public.audit_log (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        changed_by
      ) VALUES (
        TG_TABLE_NAME,
        NEW.id,
        'soft_delete',
        row_to_json(OLD),
        row_to_json(NEW),
        current_user_id
      );
    ELSE
      INSERT INTO public.audit_log (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        changed_by
      ) VALUES (
        TG_TABLE_NAME,
        NEW.id,
        'update',
        row_to_json(OLD),
        row_to_json(NEW),
        current_user_id
      );
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (
      table_name,
      record_id,
      action,
      old_values,
      changed_by
    ) VALUES (
      TG_TABLE_NAME,
      OLD.id,
      'delete',
      row_to_json(OLD),
      current_user_id
    );
    RETURN OLD;

  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. Применить аудит-триггеры к таблицам
-- =====================================================

CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_fallen_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.fallen
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_editors_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.editors
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_timeline_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.timeline_items
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_memory_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.memory_items
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_comments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_locations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

-- =====================================================
-- 5. Триггер для автоматического создания записи в moderation_queue
-- =====================================================

CREATE OR REPLACE FUNCTION create_moderation_queue_on_fallen_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Автоматически создать запись в очереди модерации при создании карточки
  IF NEW.status = 'pending' THEN
    INSERT INTO public.moderation_queue (
      entity_type,
      entity_id,
      priority,
      status
    ) VALUES (
      'fallen',
      NEW.id,
      'normal',
      'pending'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER moderation_queue_on_fallen_insert
  AFTER INSERT ON public.fallen
  FOR EACH ROW
  EXECUTE FUNCTION create_moderation_queue_on_fallen_insert();

-- =====================================================
-- 6. Триггер для создания уведомлений
-- =====================================================

CREATE OR REPLACE FUNCTION create_notification_on_moderation()
RETURNS TRIGGER AS $$
BEGIN
  -- Когда карточка одобрена - уведомить владельца
  IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      entity_type,
      entity_id,
      channel,
      status
    ) VALUES (
      NEW.owner_id,
      'moderation_approved',
      'Карточка одобрена',
      'Ваша карточка была одобрена модератором и теперь видна всем пользователям.',
      'fallen',
      NEW.id,
      'email',
      'pending'
    );

    -- Telegram уведомление (если включено)
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      entity_type,
      entity_id,
      channel,
      status
    )
    SELECT
      NEW.owner_id,
      'moderation_approved',
      'Карточка одобрена',
      'Ваша карточка была одобрена модератором.',
      'fallen',
      NEW.id,
      'telegram',
      'pending'
    FROM public.users
    WHERE id = NEW.owner_id
    AND (notification_preferences->>'telegram')::boolean = true;

  -- Когда карточка отклонена
  ELSIF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      entity_type,
      entity_id,
      channel,
      status
    ) VALUES (
      NEW.owner_id,
      'moderation_rejected',
      'Карточка отклонена',
      'К сожалению, ваша карточка была отклонена. Причина: ' || COALESCE(NEW.moderation_note, 'не указана'),
      'fallen',
      NEW.id,
      'email',
      'pending'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_on_moderation
  AFTER UPDATE ON public.fallen
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION create_notification_on_moderation();

-- =====================================================
-- 7. Триггер для уведомлений о новых воспоминаниях
-- =====================================================

CREATE OR REPLACE FUNCTION notify_owner_on_new_memory()
RETURNS TRIGGER AS $$
BEGIN
  -- Уведомить владельца карточки о новом воспоминании
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    entity_type,
    entity_id,
    channel,
    status
  )
  SELECT
    f.owner_id,
    'new_memory',
    'Новое воспоминание',
    'Пользователь добавил новое воспоминание к карточке. Требуется модерация.',
    'memory',
    NEW.id,
    'email',
    'pending'
  FROM public.fallen f
  WHERE f.id = NEW.fallen_id
  AND f.owner_id != NEW.created_by; -- Не уведомлять себя

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_new_memory
  AFTER INSERT ON public.memory_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_owner_on_new_memory();

-- =====================================================
-- 8. Триггер для уведомлений о новых событиях таймлайна
-- =====================================================

CREATE OR REPLACE FUNCTION notify_owner_on_new_timeline()
RETURNS TRIGGER AS $$
BEGIN
  -- Уведомить владельца карточки о новом событии
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    entity_type,
    entity_id,
    channel,
    status
  )
  SELECT
    f.owner_id,
    'new_timeline',
    'Новое событие в таймлайне',
    'Пользователь добавил новое событие в таймлайн. Требуется модерация.',
    'timeline',
    NEW.id,
    'email',
    'pending'
  FROM public.fallen f
  WHERE f.id = NEW.fallen_id
  AND f.owner_id != NEW.created_by; -- Не уведомлять себя

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_new_timeline
  AFTER INSERT ON public.timeline_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_owner_on_new_timeline();

-- =====================================================
-- Завершение миграции
-- =====================================================

COMMENT ON FUNCTION update_updated_at_column() IS 'Автоматическое обновление поля updated_at';
COMMENT ON FUNCTION audit_trigger_func() IS 'Логирование всех изменений в audit_log';
COMMENT ON FUNCTION create_moderation_queue_on_fallen_insert() IS 'Создание записи в очереди модерации при создании карточки';
COMMENT ON FUNCTION create_notification_on_moderation() IS 'Уведомления при изменении статуса модерации';
