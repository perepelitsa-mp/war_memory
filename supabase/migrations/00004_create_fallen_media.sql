-- =====================================================
-- Книга Памяти Кавалерово - Таблица медиа-файлов
-- =====================================================
-- Миграция: 00004_create_fallen_media.sql
-- Описание: Галерея фото и видео для карточек
-- Дата: 2025-01-19

CREATE TABLE IF NOT EXISTS public.fallen_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Связь с карточкой
  fallen_id UUID NOT NULL REFERENCES public.fallen(id) ON DELETE CASCADE,

  -- Тип медиа
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('photo', 'video')),

  -- Файлы
  file_url TEXT NOT NULL, -- URL в MinIO
  thumbnail_url TEXT, -- URL миниатюры

  -- Метаданные
  caption TEXT, -- подпись к фото/видео
  alt_text TEXT, -- alt для доступности

  file_size BIGINT, -- размер в байтах
  mime_type VARCHAR(100),

  -- Размеры (для фото)
  width INTEGER,
  height INTEGER,

  -- Модерация
  status VARCHAR(50) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),

  -- Автор загрузки
  uploaded_by UUID NOT NULL REFERENCES public.users(id),

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Индексы
-- =====================================================

CREATE INDEX idx_media_fallen ON public.fallen_media(fallen_id) WHERE NOT is_deleted;
CREATE INDEX idx_media_type ON public.fallen_media(media_type) WHERE NOT is_deleted;
CREATE INDEX idx_media_status ON public.fallen_media(status) WHERE NOT is_deleted;
CREATE INDEX idx_media_uploaded_by ON public.fallen_media(uploaded_by) WHERE NOT is_deleted;
CREATE INDEX idx_media_created_at ON public.fallen_media(created_at DESC) WHERE NOT is_deleted;

-- =====================================================
-- Комментарии
-- =====================================================

COMMENT ON TABLE public.fallen_media IS 'Галерея фото и видео для карточек';
COMMENT ON COLUMN public.fallen_media.media_type IS 'Тип медиа: photo или video';
COMMENT ON COLUMN public.fallen_media.file_url IS 'URL файла в MinIO';
COMMENT ON COLUMN public.fallen_media.caption IS 'Подпись к фото/видео';
COMMENT ON COLUMN public.fallen_media.alt_text IS 'Альтернативный текст для доступности';
