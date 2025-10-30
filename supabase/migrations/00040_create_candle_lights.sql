-- =====================================================
-- Книга Памяти Кавалерово - Виртуальные свечи памяти
-- =====================================================
-- Миграция: 00040_create_candle_lights.sql
-- Описание: Таблица для учёта зажжённых виртуальных свечей
-- Дата: 2025-01-20

CREATE TABLE IF NOT EXISTS public.candle_lights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Связь с карточкой героя
  fallen_id UUID NOT NULL REFERENCES public.fallen(id) ON DELETE CASCADE,

  -- Пользователь, зажёгший свечу
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Один пользователь может зажечь только одну свечу для каждого героя
  UNIQUE(fallen_id, user_id)
);

-- =====================================================
-- Индексы
-- =====================================================

CREATE INDEX idx_candle_lights_fallen ON public.candle_lights(fallen_id);
CREATE INDEX idx_candle_lights_user ON public.candle_lights(user_id);
CREATE INDEX idx_candle_lights_created_at ON public.candle_lights(created_at DESC);

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE public.candle_lights ENABLE ROW LEVEL SECURITY;

-- Все могут видеть зажжённые свечи
CREATE POLICY "Anyone can view candle lights"
  ON public.candle_lights
  FOR SELECT
  USING (true);

-- Только авторизованные могут зажигать свечи
CREATE POLICY "Authenticated users can light candles"
  ON public.candle_lights
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Пользователи могут удалять только свои свечи
CREATE POLICY "Users can delete their own candle lights"
  ON public.candle_lights
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- Комментарии
-- =====================================================

COMMENT ON TABLE public.candle_lights IS 'Виртуальные свечи памяти, зажжённые пользователями';
COMMENT ON COLUMN public.candle_lights.fallen_id IS 'ID героя, для которого зажгли свечу';
COMMENT ON COLUMN public.candle_lights.user_id IS 'ID пользователя, зажёгшего свечу';
