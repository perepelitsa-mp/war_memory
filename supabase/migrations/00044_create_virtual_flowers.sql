-- =====================================================
-- Книга Памяти Кавалерово - Виртуальные цветы
-- =====================================================
-- Миграция: 00044_create_virtual_flowers.sql
-- Описание: Таблица для виртуальных цветов на карточках героев
-- Дата: 2025-01-20

-- Создаём таблицу виртуальных цветов
CREATE TABLE IF NOT EXISTS public.virtual_flowers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Связь с героем и пользователем
  fallen_id UUID NOT NULL REFERENCES public.fallen(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Тип цветов
  flower_type VARCHAR(50) NOT NULL CHECK (flower_type IN (
    'roses',           -- Розы
    'carnations',      -- Гвоздики
    'lilies',          -- Лилии
    'chrysanthemums',  -- Хризантемы
    'tulips',          -- Тюльпаны
    'mixed'            -- Смешанный букет
  )),

  -- Цвет букета
  flower_color VARCHAR(30) CHECK (flower_color IN (
    'red',
    'white',
    'pink',
    'yellow',
    'purple',
    'mixed'
  )),

  -- Количество цветов в букете
  flower_count INTEGER DEFAULT 1 CHECK (flower_count >= 1 AND flower_count <= 99),

  -- Сообщение к цветам (опционально)
  message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Один пользователь может возложить цветы несколько раз
  -- (в отличие от свечи, которую можно зажечь только один раз)
  -- Поэтому UNIQUE constraint не нужен

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.users(id)
);

-- =====================================================
-- Индексы
-- =====================================================

CREATE INDEX idx_virtual_flowers_fallen ON public.virtual_flowers(fallen_id) WHERE NOT is_deleted;
CREATE INDEX idx_virtual_flowers_user ON public.virtual_flowers(user_id) WHERE NOT is_deleted;
CREATE INDEX idx_virtual_flowers_created ON public.virtual_flowers(created_at DESC) WHERE NOT is_deleted;

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE public.virtual_flowers ENABLE ROW LEVEL SECURITY;

-- Все могут видеть возложенные цветы
CREATE POLICY "Anyone can view flowers"
  ON public.virtual_flowers
  FOR SELECT
  USING (NOT is_deleted);

-- Авторизованные пользователи могут возлагать цветы
CREATE POLICY "Authenticated users can lay flowers"
  ON public.virtual_flowers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Пользователи могут удалять свои цветы
CREATE POLICY "Users can delete their own flowers"
  ON public.virtual_flowers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Модераторы/Админы могут удалять любые цветы
CREATE POLICY "Moderators can delete any flowers"
  ON public.virtual_flowers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role IN ('moderator', 'admin', 'superadmin')
    )
  );

-- =====================================================
-- Комментарии
-- =====================================================

COMMENT ON TABLE public.virtual_flowers IS 'Виртуальные цветы, возложенные пользователями на карточках героев';
COMMENT ON COLUMN public.virtual_flowers.flower_type IS 'Тип цветов: розы, гвоздики, лилии, хризантемы, тюльпаны, смешанный';
COMMENT ON COLUMN public.virtual_flowers.flower_color IS 'Цвет букета: красный, белый, розовый, жёлтый, фиолетовый, смешанный';
COMMENT ON COLUMN public.virtual_flowers.flower_count IS 'Количество цветов в букете (1-99)';
COMMENT ON COLUMN public.virtual_flowers.message IS 'Сообщение к цветам (опционально)';
