-- =====================================================
-- Книга Памяти Кавалерово - Row Level Security (RLS)
-- =====================================================
-- Миграция: 00012_create_rls_policies.sql
-- Описание: Политики безопасности на уровне строк
-- Дата: 2025-01-19

-- =====================================================
-- 1. ТАБЛИЦА users
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Чтение: все могут видеть активных пользователей (кроме удаленных)
CREATE POLICY "Public read active users"
  ON public.users FOR SELECT
  USING (NOT is_deleted);

-- Обновление: только сам пользователь или админы
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (
    id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
      AND NOT is_deleted
    )
  );

-- =====================================================
-- 2. ТАБЛИЦА fallen
-- =====================================================

ALTER TABLE public.fallen ENABLE ROW LEVEL SECURITY;

-- Чтение: все видят только approved карточки (или свои/редакторские)
CREATE POLICY "Public read approved fallen"
  ON public.fallen FOR SELECT
  USING (
    (status = 'approved' AND NOT is_deleted)
    OR
    owner_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.editors
      WHERE fallen_id = id
      AND user_id = auth.uid()
      AND NOT is_deleted
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator', 'superadmin')
      AND NOT is_deleted
    )
  );

-- Создание: только авторизованные пользователи
CREATE POLICY "Authenticated users can create fallen"
  ON public.fallen FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND owner_id = auth.uid()
  );

-- Обновление: владелец, редакторы или админы
CREATE POLICY "Owner and editors can update fallen"
  ON public.fallen FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.editors
      WHERE fallen_id = id
      AND user_id = auth.uid()
      AND NOT is_deleted
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator', 'superadmin')
      AND NOT is_deleted
    )
  );

-- =====================================================
-- 3. ТАБЛИЦА editors
-- =====================================================

ALTER TABLE public.editors ENABLE ROW LEVEL SECURITY;

-- Чтение: владелец карточки, сам редактор или админы
CREATE POLICY "Editors read policy"
  ON public.editors FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.fallen
      WHERE fallen.id = editors.fallen_id
      AND fallen.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator', 'superadmin')
    )
  );

-- Создание: только владелец карточки может приглашать редакторов
CREATE POLICY "Owner can invite editors"
  ON public.editors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.fallen
      WHERE id = editors.fallen_id
      AND owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- 4. ТАБЛИЦА fallen_media
-- =====================================================

ALTER TABLE public.fallen_media ENABLE ROW LEVEL SECURITY;

-- Чтение: все видят approved медиа из approved карточек
CREATE POLICY "Public read approved media"
  ON public.fallen_media FOR SELECT
  USING (
    (status = 'approved' AND NOT is_deleted)
    AND
    EXISTS (
      SELECT 1 FROM public.fallen
      WHERE id = fallen_media.fallen_id
      AND status = 'approved'
      AND NOT is_deleted
    )
  );

-- Создание: владелец, редакторы карточки или админы
CREATE POLICY "Authorized users can upload media"
  ON public.fallen_media FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND
    (
      EXISTS (
        SELECT 1 FROM public.fallen
        WHERE id = fallen_media.fallen_id
        AND owner_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM public.editors
        WHERE fallen_id = fallen_media.fallen_id
        AND user_id = auth.uid()
        AND NOT is_deleted
      )
    )
  );

-- =====================================================
-- 5. ТАБЛИЦА timeline_items
-- =====================================================

ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;

-- Чтение: все видят approved события из approved карточек
CREATE POLICY "Public read approved timeline"
  ON public.timeline_items FOR SELECT
  USING (
    (status = 'approved' AND NOT is_deleted)
    OR
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.fallen
      WHERE id = timeline_items.fallen_id
      AND (owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.editors
        WHERE fallen_id = timeline_items.fallen_id
        AND user_id = auth.uid()
      ))
    )
  );

-- Создание: любой авторизованный пользователь (на модерации)
CREATE POLICY "Authenticated can create timeline"
  ON public.timeline_items FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

-- =====================================================
-- 6. ТАБЛИЦА memory_items
-- =====================================================

ALTER TABLE public.memory_items ENABLE ROW LEVEL SECURITY;

-- Чтение: все видят approved воспоминания из approved карточек
CREATE POLICY "Public read approved memory"
  ON public.memory_items FOR SELECT
  USING (
    (status = 'approved' AND NOT is_deleted)
    OR
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.fallen
      WHERE id = memory_items.fallen_id
      AND (owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.editors
        WHERE fallen_id = memory_items.fallen_id
        AND user_id = auth.uid()
      ))
    )
  );

-- Создание: любой авторизованный пользователь (на модерации)
CREATE POLICY "Authenticated can create memory"
  ON public.memory_items FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

-- =====================================================
-- 7. ТАБЛИЦА comments
-- =====================================================

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Чтение: все видят не скрытые комментарии из approved карточек
CREATE POLICY "Public read visible comments"
  ON public.comments FOR SELECT
  USING (
    (NOT is_hidden AND NOT is_deleted)
    AND
    EXISTS (
      SELECT 1 FROM public.fallen
      WHERE id = comments.fallen_id
      AND status = 'approved'
      AND NOT is_deleted
    )
  );

-- Создание: авторизованные пользователи
CREATE POLICY "Authenticated can comment"
  ON public.comments FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
  );

-- Обновление: автор или владелец карточки
CREATE POLICY "Author or owner can update comment"
  ON public.comments FOR UPDATE
  USING (
    author_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.fallen
      WHERE id = comments.fallen_id
      AND owner_id = auth.uid()
    )
  );

-- =====================================================
-- 8. ТАБЛИЦА moderation_queue
-- =====================================================

ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

-- Чтение: только админы и модераторы
CREATE POLICY "Moderators read queue"
  ON public.moderation_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator', 'superadmin')
    )
  );

-- =====================================================
-- 9. ТАБЛИЦА audit_log
-- =====================================================

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Чтение: только админы
CREATE POLICY "Admins read audit"
  ON public.audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- 10. ТАБЛИЦА notifications
-- =====================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Чтение: только получатель уведомления
CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

-- =====================================================
-- 11. ТАБЛИЦА locations
-- =====================================================

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Чтение: все видят активные локации
CREATE POLICY "Public read locations"
  ON public.locations FOR SELECT
  USING (NOT is_deleted);

-- Создание: авторизованные пользователи
CREATE POLICY "Authenticated can create locations"
  ON public.locations FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );
