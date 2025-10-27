-- Обновление RLS политик для таблицы comments
-- Добавляем поддержку комментариев к memory_items и memory_additions

-- Удаляем старую политику чтения
DROP POLICY IF EXISTS "Public read visible comments" ON comments;

-- Создаём новую политику чтения, которая проверяет все три типа комментариев
CREATE POLICY "Public read visible comments"
  ON comments
  FOR SELECT
  TO public
  USING (
    NOT is_hidden
    AND NOT is_deleted
    AND (
      -- Комментарии к карточкам погибших
      (
        fallen_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM fallen
          WHERE fallen.id = comments.fallen_id
            AND fallen.status = 'approved'
            AND NOT fallen.is_deleted
        )
      )
      OR
      -- Комментарии к элементам памяти
      (
        memory_item_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM memory_items
          WHERE memory_items.id = comments.memory_item_id
            AND memory_items.status = 'approved'
            AND NOT memory_items.is_deleted
        )
      )
      OR
      -- Комментарии к дополнениям памяти
      (
        memory_addition_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM memory_additions
          WHERE memory_additions.id = comments.memory_addition_id
            AND memory_additions.status = 'approved'
            AND NOT memory_additions.is_deleted
        )
      )
    )
  );

-- Удаляем старую политику вставки
DROP POLICY IF EXISTS "Authenticated can comment" ON comments;

-- Создаём новую политику вставки с WITH CHECK
CREATE POLICY "Authenticated can comment"
  ON comments
  FOR INSERT
  TO public
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
    AND (
      -- Можно комментировать одобренные карточки погибших
      (
        fallen_id IS NOT NULL
        AND memory_item_id IS NULL
        AND memory_addition_id IS NULL
        AND EXISTS (
          SELECT 1
          FROM fallen
          WHERE fallen.id = comments.fallen_id
            AND fallen.status = 'approved'
            AND NOT fallen.is_deleted
        )
      )
      OR
      -- Можно комментировать одобренные элементы памяти
      (
        memory_item_id IS NOT NULL
        AND fallen_id IS NULL
        AND memory_addition_id IS NULL
        AND EXISTS (
          SELECT 1
          FROM memory_items
          WHERE memory_items.id = comments.memory_item_id
            AND memory_items.status = 'approved'
            AND NOT memory_items.is_deleted
        )
      )
      OR
      -- Можно комментировать одобренные дополнения памяти
      (
        memory_addition_id IS NOT NULL
        AND fallen_id IS NULL
        AND memory_item_id IS NULL
        AND EXISTS (
          SELECT 1
          FROM memory_additions
          WHERE memory_additions.id = comments.memory_addition_id
            AND memory_additions.status = 'approved'
            AND NOT memory_additions.is_deleted
        )
      )
    )
  );

-- Обновляем политику UPDATE для поддержки всех типов комментариев
DROP POLICY IF EXISTS "Author or owner can update comment" ON comments;

CREATE POLICY "Author or owner can update comment"
  ON comments
  FOR UPDATE
  TO public
  USING (
    author_id = auth.uid()
    OR
    -- Владелец карточки погибшего может обновлять комментарии к ней
    (
      fallen_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM fallen
        WHERE fallen.id = comments.fallen_id
          AND fallen.owner_id = auth.uid()
      )
    )
    OR
    -- Автор элемента памяти может обновлять комментарии к нему
    (
      memory_item_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM memory_items
        WHERE memory_items.id = comments.memory_item_id
          AND memory_items.created_by = auth.uid()
      )
    )
    OR
    -- Автор дополнения памяти может обновлять комментарии к нему
    (
      memory_addition_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM memory_additions
        WHERE memory_additions.id = comments.memory_addition_id
          AND memory_additions.created_by = auth.uid()
      )
    )
  );

COMMENT ON POLICY "Public read visible comments" ON comments IS
  'Позволяет читать видимые комментарии к одобренным карточкам погибших, элементам памяти и дополнениям';

COMMENT ON POLICY "Authenticated can comment" ON comments IS
  'Аутентифицированные пользователи могут комментировать одобренные карточки, элементы памяти и дополнения';

COMMENT ON POLICY "Author or owner can update comment" ON comments IS
  'Автор комментария или владелец/создатель сущности может обновлять комментарий';
