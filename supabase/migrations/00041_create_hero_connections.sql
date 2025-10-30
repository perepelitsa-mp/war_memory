-- =====================================================
-- Книга Памяти Кавалерово - Связи пользователей с героями
-- =====================================================
-- Миграция: 00041_create_hero_connections.sql
-- Описание: Таблица для связей пользователей с героями (родственники, друзья, сослуживцы)
-- Дата: 2025-01-20

-- Добавляем поле bio в таблицу users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;

COMMENT ON COLUMN public.users.bio IS 'Информация о пользователе';

-- Создаём таблицу связей
CREATE TABLE IF NOT EXISTS public.hero_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Связь пользователя с героем
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  fallen_id UUID NOT NULL REFERENCES public.fallen(id) ON DELETE CASCADE,

  -- Тип связи
  connection_type VARCHAR(20) NOT NULL CHECK (connection_type IN ('relative', 'friend', 'fellow_soldier')),

  -- Степень родства (только для родственников)
  relationship VARCHAR(50) CHECK (
    relationship IS NULL OR
    relationship IN (
      'spouse',           -- супруг(а)
      'parent',           -- родитель
      'child',            -- ребёнок
      'sibling',          -- брат/сестра
      'grandparent',      -- дедушка/бабушка
      'grandchild',       -- внук/внучка
      'uncle_aunt',       -- дядя/тётя
      'nephew_niece',     -- племянник/племянница
      'cousin',           -- двоюродный брат/сестра
      'other'             -- другое родство
    )
  ),

  -- Описание связи (опционально)
  description TEXT,

  -- Статус связи (для модерации владельцем карточки)
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  -- Кто создал связь
  created_by UUID NOT NULL REFERENCES public.users(id),

  -- Кто модерировал (владелец или редактор карточки)
  moderated_by UUID REFERENCES public.users(id),
  moderated_at TIMESTAMPTZ,

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Один пользователь может иметь только одну связь с героем
  UNIQUE(user_id, fallen_id)
);

-- =====================================================
-- Индексы
-- =====================================================

CREATE INDEX idx_hero_connections_user ON public.hero_connections(user_id) WHERE NOT is_deleted;
CREATE INDEX idx_hero_connections_fallen ON public.hero_connections(fallen_id) WHERE NOT is_deleted;
CREATE INDEX idx_hero_connections_type ON public.hero_connections(connection_type) WHERE NOT is_deleted;
CREATE INDEX idx_hero_connections_status ON public.hero_connections(status) WHERE NOT is_deleted;

-- =====================================================
-- Триггер для updated_at
-- =====================================================

CREATE TRIGGER set_hero_connections_updated_at
  BEFORE UPDATE ON public.hero_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE public.hero_connections ENABLE ROW LEVEL SECURITY;

-- Все могут видеть подтверждённые связи
CREATE POLICY "Anyone can view approved connections"
  ON public.hero_connections
  FOR SELECT
  USING (status = 'approved' AND NOT is_deleted);

-- Пользователи могут видеть свои связи
CREATE POLICY "Users can view their own connections"
  ON public.hero_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Владельцы и редакторы могут видеть все связи для своих карточек
CREATE POLICY "Owners and editors can view connections for their fallen"
  ON public.hero_connections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.fallen f
      WHERE f.id = hero_connections.fallen_id
      AND (
        f.owner_id = auth.uid() OR
        auth.uid() = ANY(f.editors)
      )
    )
  );

-- Авторизованные пользователи могут создавать связи
CREATE POLICY "Authenticated users can create connections"
  ON public.hero_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() = created_by
  );

-- Пользователи могут обновлять свои связи (только описание)
CREATE POLICY "Users can update their own connections"
  ON public.hero_connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Владельцы и редакторы могут модерировать связи
CREATE POLICY "Owners and editors can moderate connections"
  ON public.hero_connections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.fallen f
      WHERE f.id = hero_connections.fallen_id
      AND (
        f.owner_id = auth.uid() OR
        auth.uid() = ANY(f.editors)
      )
    )
  );

-- Пользователи могут удалять свои связи
CREATE POLICY "Users can delete their own connections"
  ON public.hero_connections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- Комментарии
-- =====================================================

COMMENT ON TABLE public.hero_connections IS 'Связи пользователей с героями (родственники, друзья, сослуживцы)';
COMMENT ON COLUMN public.hero_connections.connection_type IS 'Тип связи: relative (родственник), friend (друг), fellow_soldier (сослуживец)';
COMMENT ON COLUMN public.hero_connections.relationship IS 'Степень родства (только для родственников)';
COMMENT ON COLUMN public.hero_connections.status IS 'Статус для модерации: pending, approved, rejected';
