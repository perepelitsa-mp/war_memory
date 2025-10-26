-- =====================================================
-- Книга Памяти Кавалерово - Таблицы наград
-- =====================================================
-- Миграция: 00020_create_awards.sql
-- Описание: Справочник наград РФ и связь наград с погибшими
-- Дата: 2025-01-21

-- =====================================================
-- Таблица справочника наград РФ
-- =====================================================

CREATE TABLE IF NOT EXISTS public.awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Основная информация
  name VARCHAR(255) NOT NULL UNIQUE,
  short_name VARCHAR(100),
  award_type VARCHAR(50) NOT NULL CHECK (
    award_type IN ('medal', 'order', 'title', 'badge')
  ),

  -- Изображение награды
  image_url TEXT NOT NULL, -- URL изображения награды

  -- Описание
  description TEXT,

  -- Статус награды
  status VARCHAR(50) DEFAULT 'active' CHECK (
    status IN ('active', 'archived', 'historical')
  ),

  -- Порядок сортировки (чем выше значение, тем важнее награда)
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Таблица наград погибших
-- =====================================================

CREATE TABLE IF NOT EXISTS public.fallen_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Связи
  fallen_id UUID NOT NULL REFERENCES public.fallen(id) ON DELETE CASCADE,
  award_id UUID NOT NULL REFERENCES public.awards(id) ON DELETE CASCADE,

  -- Описание за что награждён
  citation TEXT, -- За что был награждён

  -- Дата награждения
  awarded_date DATE,

  -- Номер указа/приказа
  decree_number VARCHAR(255),

  -- Модерация
  status VARCHAR(50) DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected')
  ),
  moderated_by UUID REFERENCES public.users(id),
  moderated_at TIMESTAMPTZ,

  -- Автор записи
  created_by UUID NOT NULL REFERENCES public.users(id),

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Уникальность: одна награда один раз для одного погибшего
  UNIQUE(fallen_id, award_id)
);

-- =====================================================
-- Индексы
-- =====================================================

-- Индексы для awards
CREATE INDEX idx_awards_type ON public.awards(award_type) WHERE status = 'active';
CREATE INDEX idx_awards_sort_order ON public.awards(sort_order DESC) WHERE status = 'active';

-- Индексы для fallen_awards
CREATE INDEX idx_fallen_awards_fallen ON public.fallen_awards(fallen_id) WHERE NOT is_deleted;
CREATE INDEX idx_fallen_awards_award ON public.fallen_awards(award_id) WHERE NOT is_deleted;
CREATE INDEX idx_fallen_awards_status ON public.fallen_awards(status) WHERE NOT is_deleted;
CREATE INDEX idx_fallen_awards_created_by ON public.fallen_awards(created_by) WHERE NOT is_deleted;

-- Композитный индекс для отображения наград погибшего
CREATE INDEX idx_fallen_awards_approved ON public.fallen_awards(fallen_id, created_at DESC)
  WHERE NOT is_deleted AND status = 'approved';

-- =====================================================
-- Комментарии
-- =====================================================

COMMENT ON TABLE public.awards IS 'Справочник наград РФ';
COMMENT ON COLUMN public.awards.award_type IS 'Тип награды: medal, order, title, badge';
COMMENT ON COLUMN public.awards.image_url IS 'URL изображения награды';
COMMENT ON COLUMN public.awards.sort_order IS 'Порядок сортировки (выше = важнее)';

COMMENT ON TABLE public.fallen_awards IS 'Награды погибших героев';
COMMENT ON COLUMN public.fallen_awards.citation IS 'За что был награждён';
COMMENT ON COLUMN public.fallen_awards.decree_number IS 'Номер указа/приказа о награждении';
