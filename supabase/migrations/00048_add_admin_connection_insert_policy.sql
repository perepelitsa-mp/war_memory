-- =====================================================
-- Книга Памяти Кавалерово - RLS политика INSERT для администраторов
-- =====================================================
-- Миграция: 00048_add_admin_connection_insert_policy.sql
-- Описание: Добавляем политику для создания связей администраторами и владельцами
-- Дата: 2025-01-31

-- Модераторы/Админы/Суперадмины могут создавать связи для любых пользователей
CREATE POLICY "Admins can create connections for any user"
  ON public.hero_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role IN ('moderator', 'admin', 'superadmin')
    )
  );

-- Владельцы и редакторы карточек могут создавать связи для любых пользователей
CREATE POLICY "Owners and editors can create connections for any user"
  ON public.hero_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.fallen f
      WHERE f.id = hero_connections.fallen_id
      AND (
        f.owner_id = auth.uid() OR
        auth.uid() = ANY(f.editors)
      )
    )
  );

COMMENT ON POLICY "Admins can create connections for any user" ON public.hero_connections IS 'Администраторы могут создавать связи для любых пользователей';
COMMENT ON POLICY "Owners and editors can create connections for any user" ON public.hero_connections IS 'Владельцы и редакторы карточек могут создавать связи для любых пользователей';
