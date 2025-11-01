-- =====================================================
-- Книга Памяти Кавалерово - Книга соболезнований
-- =====================================================
-- Миграция: 00045_create_condolences.sql
-- Описание: Отдельная книга соболезнований (отличается от комментариев)
-- Дата: 2025-01-20

-- Создаём таблицу соболезнований
CREATE TABLE IF NOT EXISTS public.condolences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Связь с героем
  fallen_id UUID NOT NULL REFERENCES public.fallen(id) ON DELETE CASCADE,

  -- Автор
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Текст соболезнования
  content TEXT NOT NULL CHECK (length(content) >= 10 AND length(content) <= 5000),

  -- Связь автора с героем (опционально)
  relationship_to_hero VARCHAR(100), -- "Сослуживец", "Друг", "Родственник", "Земляк", etc.

  -- Статус модерации
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),

  -- Модерация
  moderated_by UUID REFERENCES public.users(id),
  moderated_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Индексы
-- =====================================================

CREATE INDEX idx_condolences_fallen ON public.condolences(fallen_id) WHERE NOT is_deleted;
CREATE INDEX idx_condolences_author ON public.condolences(author_id) WHERE NOT is_deleted;
CREATE INDEX idx_condolences_status ON public.condolences(status) WHERE NOT is_deleted;
CREATE INDEX idx_condolences_created ON public.condolences(created_at DESC) WHERE NOT is_deleted;

-- =====================================================
-- Триггер для updated_at
-- =====================================================

CREATE TRIGGER set_condolences_updated_at
  BEFORE UPDATE ON public.condolences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE public.condolences ENABLE ROW LEVEL SECURITY;

-- Все могут видеть одобренные соболезнования
CREATE POLICY "Anyone can view approved condolences"
  ON public.condolences
  FOR SELECT
  USING (status = 'approved' AND NOT is_deleted);

-- Авторы могут видеть свои соболезнования
CREATE POLICY "Authors can view their own condolences"
  ON public.condolences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

-- Владельцы и редакторы могут видеть все соболезнования для своих карточек
CREATE POLICY "Owners and editors can view all condolences for their fallen"
  ON public.condolences
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.fallen f
      WHERE f.id = condolences.fallen_id
      AND (
        f.owner_id = auth.uid() OR
        auth.uid() = ANY(f.editors)
      )
    )
  );

-- Модераторы/Админы могут видеть все соболезнования
CREATE POLICY "Moderators can view all condolences"
  ON public.condolences
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role IN ('moderator', 'admin', 'superadmin')
    )
  );

-- Авторизованные пользователи могут создавать соболезнования
CREATE POLICY "Authenticated users can create condolences"
  ON public.condolences
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
  );

-- Авторы могут обновлять свои соболезнования (только если pending)
CREATE POLICY "Authors can update their own pending condolences"
  ON public.condolences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id AND status = 'pending')
  WITH CHECK (auth.uid() = author_id);

-- Владельцы и редакторы могут модерировать соболезнования
CREATE POLICY "Owners and editors can moderate condolences"
  ON public.condolences
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.fallen f
      WHERE f.id = condolences.fallen_id
      AND (
        f.owner_id = auth.uid() OR
        auth.uid() = ANY(f.editors)
      )
    )
  );

-- Модераторы/Админы могут модерировать любые соболезнования
CREATE POLICY "Moderators can moderate all condolences"
  ON public.condolences
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role IN ('moderator', 'admin', 'superadmin')
    )
  );

-- Авторы могут удалять свои соболезнования
CREATE POLICY "Authors can delete their own condolences"
  ON public.condolences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- =====================================================
-- Комментарии
-- =====================================================

COMMENT ON TABLE public.condolences IS 'Книга соболезнований для карточек героев (отдельно от комментариев)';
COMMENT ON COLUMN public.condolences.content IS 'Текст соболезнования (10-5000 символов)';
COMMENT ON COLUMN public.condolences.relationship_to_hero IS 'Связь автора с героем (сослуживец, друг, родственник, земляк и т.д.)';
COMMENT ON COLUMN public.condolences.status IS 'Статус модерации: pending, approved, rejected, archived';
COMMENT ON COLUMN public.condolences.rejection_reason IS 'Причина отклонения (если отклонено)';
