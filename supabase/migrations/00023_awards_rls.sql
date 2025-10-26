-- =====================================================
-- Книга Памяти Кавалерово - RLS политики для наград
-- =====================================================
-- Миграция: 00023_awards_rls.sql
-- Описание: RLS политики для таблиц awards и fallen_awards
-- Дата: 2025-01-21

-- =====================================================
-- RLS политики для таблицы awards
-- =====================================================

-- Включаем RLS
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

-- Все могут читать активные награды
CREATE POLICY "Awards are viewable by everyone" ON public.awards
  FOR SELECT
  USING (status = 'active');

-- Только администраторы могут создавать/редактировать награды
CREATE POLICY "Only admins can insert awards" ON public.awards
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Only admins can update awards" ON public.awards
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- RLS политики для таблицы fallen_awards
-- =====================================================

-- Включаем RLS
ALTER TABLE public.fallen_awards ENABLE ROW LEVEL SECURITY;

-- Все могут читать одобренные награды погибших
CREATE POLICY "Approved awards are viewable by everyone" ON public.fallen_awards
  FOR SELECT
  USING (status = 'approved' AND NOT is_deleted);

-- Владельцы и редакторы карточки могут добавлять награды
CREATE POLICY "Owners and editors can insert awards" ON public.fallen_awards
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.fallen
      WHERE fallen.id = fallen_awards.fallen_id
      AND (
        fallen.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.editors
          WHERE editors.fallen_id = fallen.id
          AND editors.user_id = auth.uid()
          AND NOT editors.is_deleted
        )
        OR EXISTS (
          SELECT 1 FROM public.users
          WHERE users.id = auth.uid()
          AND users.role IN ('admin', 'superadmin', 'moderator')
        )
      )
    )
  );

-- Владельцы, редакторы и модераторы могут обновлять награды
CREATE POLICY "Owners, editors and moderators can update awards" ON public.fallen_awards
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.fallen
      WHERE fallen.id = fallen_awards.fallen_id
      AND (
        fallen.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.editors
          WHERE editors.fallen_id = fallen.id
          AND editors.user_id = auth.uid()
          AND NOT editors.is_deleted
        )
        OR EXISTS (
          SELECT 1 FROM public.users
          WHERE users.id = auth.uid()
          AND users.role IN ('admin', 'superadmin', 'moderator')
        )
      )
    )
  );

-- Владельцы и администраторы могут удалять награды (soft delete)
CREATE POLICY "Owners and admins can delete awards" ON public.fallen_awards
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.fallen
      WHERE fallen.id = fallen_awards.fallen_id
      AND (
        fallen.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.users
          WHERE users.id = auth.uid()
          AND users.role IN ('admin', 'superadmin')
        )
      )
    )
  );
