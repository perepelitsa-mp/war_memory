-- =====================================================
-- Книга Памяти Кавалерово - ВУС (Военно-учётная специальность)
-- =====================================================
-- Миграция: 00049_create_vus_table.sql
-- Описание: Справочник военно-учётных специальностей и добавление поля в fallen
-- Дата: 2025-01-31

-- =====================================================
-- Таблица справочника ВУС
-- =====================================================

CREATE TABLE IF NOT EXISTS public.vus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Код ВУС (например: 100182, 021101)
  code VARCHAR(10) NOT NULL UNIQUE,

  -- Название специальности
  name VARCHAR(255) NOT NULL,

  -- Полное описание
  description TEXT,

  -- Кто добавил (для отслеживания пользовательских добавлений)
  created_by UUID REFERENCES public.users(id),

  -- Одобрено администратором (пользовательские ВУС требуют модерации)
  is_approved BOOLEAN DEFAULT false,

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Добавление поля vus_id в таблицу fallen
-- =====================================================

ALTER TABLE public.fallen
  ADD COLUMN IF NOT EXISTS vus_id UUID REFERENCES public.vus(id);

-- =====================================================
-- Индексы
-- =====================================================

CREATE INDEX idx_vus_code ON public.vus(code) WHERE NOT is_deleted;
CREATE INDEX idx_vus_approved ON public.vus(is_approved) WHERE NOT is_deleted;
CREATE INDEX idx_vus_created_by ON public.vus(created_by) WHERE NOT is_deleted;
CREATE INDEX idx_fallen_vus ON public.fallen(vus_id) WHERE NOT is_deleted;

-- =====================================================
-- RLS политики для таблицы vus
-- =====================================================

ALTER TABLE public.vus ENABLE ROW LEVEL SECURITY;

-- Все могут читать одобренные ВУС
CREATE POLICY "Everyone can view approved VUS" ON public.vus
  FOR SELECT
  USING (is_approved = true AND NOT is_deleted);

-- Авторизованные пользователи могут создавать ВУС (но они требуют одобрения)
CREATE POLICY "Authenticated users can insert VUS" ON public.vus
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
  );

-- Только администраторы могут одобрять и обновлять ВУС
CREATE POLICY "Only admins can update VUS" ON public.vus
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin', 'moderator')
    )
  );

-- Администраторы могут удалять ВУС (soft delete)
CREATE POLICY "Only admins can delete VUS" ON public.vus
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- Заполнение справочника стандартными ВУС
-- =====================================================

INSERT INTO public.vus (code, name, description, is_approved, created_by) VALUES
  ('021101', 'Стрелок', 'Стрелок мотострелковых (пехотных, десантно-штурмовых) подразделений', true, NULL),
  ('100182', 'Командир отделения мотострелковых войск', 'Командир отделения мотострелковых подразделений', true, NULL),
  ('113194', 'Оператор-наводчик БМП', 'Оператор-наводчик боевой машины пехоты', true, NULL),
  ('021202', 'Гранатометчик', 'Гранатометчик противотанковых подразделений', true, NULL),
  ('113203', 'Механик-водитель БМП', 'Механик-водитель боевой машины пехоты', true, NULL),
  ('113302', 'Механик-водитель БТР', 'Механик-водитель бронетранспортера', true, NULL),
  ('021401', 'Снайпер', 'Снайпер мотострелковых подразделений', true, NULL),
  ('113504', 'Наводчик орудия танка', 'Наводчик орудия танка', true, NULL),
  ('113603', 'Механик-водитель танка', 'Механик-водитель танка', true, NULL),
  ('182001', 'Парашютист-десантник', 'Парашютист-десантник ВДВ', true, NULL),
  ('350200', 'Инженер-сапер', 'Инженер-сапер инженерных подразделений', true, NULL),
  ('350300', 'Понтонер', 'Понтонер инженерных подразделений', true, NULL),
  ('461100', 'Наводчик-оператор ПТРК', 'Наводчик-оператор противотанкового ракетного комплекса', true, NULL),
  ('510100', 'Радиотелеграфист', 'Радиотелеграфист подразделений связи', true, NULL),
  ('520101', 'Оператор БПЛА', 'Оператор беспилотных летательных аппаратов', true, NULL),
  ('611000', 'Водитель автомобиля', 'Водитель автомобиля категории C', true, NULL),
  ('630100', 'Медик', 'Санитар медицинских подразделений', true, NULL),
  ('021000', 'Пулеметчик', 'Пулеметчик мотострелковых подразделений', true, NULL),
  ('113700', 'Командир танка', 'Командир танка', true, NULL),
  ('350400', 'Саперы разминирования', 'Сапер подразделений разминирования', true, NULL)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- Комментарии
-- =====================================================

COMMENT ON TABLE public.vus IS 'Справочник военно-учётных специальностей';
COMMENT ON COLUMN public.vus.code IS 'Код ВУС (6 цифр)';
COMMENT ON COLUMN public.vus.name IS 'Название специальности';
COMMENT ON COLUMN public.vus.is_approved IS 'Одобрено администратором (пользовательские ВУС)';
COMMENT ON COLUMN public.fallen.vus_id IS 'Военно-учётная специальность погибшего';
