-- =====================================================
-- Книга Памяти Кавалерово - Фикс INSERT политики для moderation_queue
-- =====================================================
-- Миграция: 00026_fix_moderation_queue_insert.sql
-- Описание: Добавляем политику INSERT чтобы триггер мог создавать записи
-- Дата: 2025-01-23

-- Разрешаем authenticated пользователям создавать записи в moderation_queue
-- Это нужно для триггера который срабатывает при создании карточки
CREATE POLICY "Allow insert for authenticated users" ON public.moderation_queue
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Комментарий
COMMENT ON POLICY "Allow insert for authenticated users" ON public.moderation_queue IS
'Разрешает authenticated пользователям вставлять записи в очередь модерации (для триггеров)';
