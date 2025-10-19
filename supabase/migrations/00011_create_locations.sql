-- =====================================================
-- Книга Памяти Кавалерово - Места памяти (карта)
-- =====================================================
-- Миграция: 00011_create_locations.sql
-- Описание: Места захоронений и памятников для отображения на карте
-- Дата: 2025-01-19

CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Связь с карточкой (опционально, может быть общий памятник)
  fallen_id UUID REFERENCES public.fallen(id) ON DELETE CASCADE,

  -- Тип локации
  location_type VARCHAR(50) NOT NULL CHECK (
    location_type IN ('burial', 'monument', 'memorial_plaque', 'memorial_complex')
  ),

  -- Название и описание
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Координаты (для 2GIS)
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,

  -- Адрес
  address TEXT,

  -- Фото места
  photo_url TEXT,

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.users(id),

  -- Автор
  created_by UUID NOT NULL REFERENCES public.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT locations_coordinates_check CHECK (
    latitude BETWEEN -90 AND 90 AND
    longitude BETWEEN -180 AND 180
  )
);

-- =====================================================
-- Индексы
-- =====================================================

CREATE INDEX idx_locations_fallen ON public.locations(fallen_id)
  WHERE NOT is_deleted AND fallen_id IS NOT NULL;

CREATE INDEX idx_locations_type ON public.locations(location_type) WHERE NOT is_deleted;

-- Пространственный индекс для поиска по координатам
CREATE INDEX idx_locations_coords ON public.locations(latitude, longitude) WHERE NOT is_deleted;

CREATE INDEX idx_locations_created_by ON public.locations(created_by) WHERE NOT is_deleted;

-- =====================================================
-- Комментарии
-- =====================================================

COMMENT ON TABLE public.locations IS 'Места памяти для отображения на карте (2GIS)';
COMMENT ON COLUMN public.locations.location_type IS 'Тип: burial, monument, memorial_plaque, memorial_complex';
COMMENT ON COLUMN public.locations.latitude IS 'Широта (от -90 до 90)';
COMMENT ON COLUMN public.locations.longitude IS 'Долгота (от -180 до 180)';
