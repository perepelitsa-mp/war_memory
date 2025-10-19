-- =====================================================
-- Книга Памяти Кавалерово - Таблица карточек погибших
-- =====================================================
-- Миграция: 00002_create_fallen.sql
-- Описание: Создание таблицы fallen для хранения карточек погибших
-- Дата: 2025-01-19

CREATE TABLE IF NOT EXISTS public.fallen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Основная информация
  last_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),

  -- Даты
  birth_date DATE,
  death_date DATE,

  -- Служба
  military_unit VARCHAR(255),
  rank VARCHAR(100),

  -- Место
  hometown VARCHAR(255), -- посёлок/город
  burial_location VARCHAR(500),

  -- Контент
  hero_photo_url TEXT, -- главное фото (портрет)
  memorial_text TEXT CHECK (
    memorial_text IS NULL OR
    (char_length(memorial_text) >= 100 AND char_length(memorial_text) <= 1000)
  ),
  biography_md TEXT, -- Markdown

  -- Владение
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,

  -- Статус: pending (ожидает модерации), approved (одобрено), rejected (отклонено), archived (архив), blocked (заблокировано)
  status VARCHAR(50) DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected', 'archived', 'blocked')
  ),

  -- Демо-карточка (для примеров)
  is_demo BOOLEAN DEFAULT false,

  -- Модерация
  moderated_by UUID REFERENCES public.users(id),
  moderated_at TIMESTAMPTZ,
  moderation_note TEXT,

  -- Справка (документ подтверждения родства)
  proof_document_url TEXT, -- URL файла в MinIO
  relationship VARCHAR(50) CHECK (
    relationship IS NULL OR
    relationship IN ('супруг', 'супруга', 'родитель', 'ребёнок', 'брат', 'сестра', 'бабушка', 'дедушка', 'опекун')
  ),

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT fallen_dates_check CHECK (birth_date IS NULL OR death_date IS NULL OR birth_date < death_date)
);

-- =====================================================
-- Индексы
-- =====================================================

-- Индекс по владельцу
CREATE INDEX idx_fallen_owner ON public.fallen(owner_id) WHERE NOT is_deleted;

-- Индекс по статусу (для фильтрации)
CREATE INDEX idx_fallen_status ON public.fallen(status) WHERE NOT is_deleted;

-- Индекс по посёлку/городу
CREATE INDEX idx_fallen_hometown ON public.fallen(hometown) WHERE NOT is_deleted AND hometown IS NOT NULL;

-- Индекс по дате смерти (для сортировки и фильтров)
CREATE INDEX idx_fallen_death_date ON public.fallen(death_date) WHERE NOT is_deleted AND death_date IS NOT NULL;

-- Индекс по дате рождения
CREATE INDEX idx_fallen_birth_date ON public.fallen(birth_date) WHERE NOT is_deleted AND birth_date IS NOT NULL;

-- Индекс по военному подразделению
CREATE INDEX idx_fallen_military_unit ON public.fallen(military_unit) WHERE NOT is_deleted AND military_unit IS NOT NULL;

-- Индекс по модератору (для статистики модерации)
CREATE INDEX idx_fallen_moderated_by ON public.fallen(moderated_by) WHERE NOT is_deleted AND moderated_by IS NOT NULL;

-- Индекс по is_demo (для отображения демо-карточек)
CREATE INDEX idx_fallen_is_demo ON public.fallen(is_demo) WHERE NOT is_deleted AND is_demo = true;

-- Полнотекстовый поиск с триграммами по ФИО (для поиска с учетом опечаток)
CREATE INDEX idx_fallen_fullname_trgm ON public.fallen
  USING gin (
    (
      COALESCE(last_name, '') || ' ' ||
      COALESCE(first_name, '') || ' ' ||
      COALESCE(middle_name, '')
    ) gin_trgm_ops
  )
  WHERE NOT is_deleted;

-- Композитный индекс для каталога (status + created_at)
CREATE INDEX idx_fallen_catalog ON public.fallen(status, created_at DESC)
  WHERE NOT is_deleted AND status = 'approved';

-- =====================================================
-- Комментарии
-- =====================================================

COMMENT ON TABLE public.fallen IS 'Таблица карточек погибших в СВО';
COMMENT ON COLUMN public.fallen.id IS 'Уникальный идентификатор карточки';
COMMENT ON COLUMN public.fallen.owner_id IS 'ID родственника, создавшего карточку';
COMMENT ON COLUMN public.fallen.status IS 'Статус модерации: pending, approved, rejected, archived, blocked';
COMMENT ON COLUMN public.fallen.is_demo IS 'Демо-карточка (для примеров)';
COMMENT ON COLUMN public.fallen.memorial_text IS 'Памятный текст (400-600 символов)';
COMMENT ON COLUMN public.fallen.biography_md IS 'Биография в формате Markdown';
COMMENT ON COLUMN public.fallen.proof_document_url IS 'Справка, подтверждающая родство';
COMMENT ON COLUMN public.fallen.relationship IS 'Степень родства создателя карточки';
COMMENT ON COLUMN public.fallen.is_deleted IS 'Флаг мягкого удаления';
