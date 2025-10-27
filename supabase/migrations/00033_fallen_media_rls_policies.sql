-- =====================================================
-- Книга Памяти Кавалерово - RLS политики для fallen_media
-- =====================================================
-- Миграция: 00033_fallen_media_rls_policies.sql
-- Описание: Создание RLS политик для таблицы fallen_media
--           Разрешает авторизованным пользователям загружать фото
-- Дата: 2025-01-26

-- =====================================================
-- RLS политики для fallen_media
-- =====================================================

-- Политика: Все могут читать утверждённые медиа
CREATE POLICY "Anyone can view approved media"
ON public.fallen_media FOR SELECT
TO public
USING (
  status = 'approved'
  AND NOT is_deleted
);

-- Политика: Авторизованные пользователи могут загружать медиа
CREATE POLICY "Authenticated users can upload media"
ON public.fallen_media FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = uploaded_by
  AND NOT is_deleted
);

-- Политика: Владелец может обновлять своё медиа
CREATE POLICY "Users can update own media"
ON public.fallen_media FOR UPDATE
TO authenticated
USING (auth.uid() = uploaded_by)
WITH CHECK (auth.uid() = uploaded_by);

-- Политика: Владелец может удалять своё медиа (soft delete)
CREATE POLICY "Users can delete own media"
ON public.fallen_media FOR UPDATE
TO authenticated
USING (auth.uid() = uploaded_by)
WITH CHECK (
  auth.uid() = uploaded_by
  AND is_deleted = true
);

-- Политика: Администраторы могут управлять любым медиа
CREATE POLICY "Admins can manage all media"
ON public.fallen_media FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('superadmin', 'admin', 'moderator')
    AND NOT is_deleted
  )
);

COMMENT ON POLICY "Anyone can view approved media" ON public.fallen_media IS
'Публичный доступ к утверждённым и не удалённым медиафайлам';

COMMENT ON POLICY "Authenticated users can upload media" ON public.fallen_media IS
'Авторизованные пользователи могут загружать медиафайлы';

COMMENT ON POLICY "Admins can manage all media" ON public.fallen_media IS
'Администраторы имеют полный доступ ко всем медиафайлам';
