-- =====================================================
-- Книга Памяти Кавалерово - RLS политики для модераторов
-- =====================================================
-- Миграция: 00043_add_moderator_connection_policies.sql
-- Описание: Добавляем RLS политики для модераторов, админов и суперадминов
-- Дата: 2025-01-20

-- Модераторы/Админы/Суперадмины могут видеть все связи
CREATE POLICY "Moderators can view all connections"
  ON public.hero_connections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role IN ('moderator', 'admin', 'superadmin')
    )
  );

-- Модераторы/Админы/Суперадмины могут модерировать любые связи
CREATE POLICY "Moderators can moderate all connections"
  ON public.hero_connections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role IN ('moderator', 'admin', 'superadmin')
    )
  );

-- Модераторы/Админы/Суперадмины могут удалять любые связи
CREATE POLICY "Moderators can delete all connections"
  ON public.hero_connections
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role IN ('moderator', 'admin', 'superadmin')
    )
  );

COMMENT ON POLICY "Moderators can view all connections" ON public.hero_connections IS 'Модераторы, админы и суперадмины видят все связи';
COMMENT ON POLICY "Moderators can moderate all connections" ON public.hero_connections IS 'Модераторы, админы и суперадмины могут модерировать любые связи';
COMMENT ON POLICY "Moderators can delete all connections" ON public.hero_connections IS 'Модераторы, админы и суперадмины могут удалять любые связи';
