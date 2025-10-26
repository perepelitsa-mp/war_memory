-- =====================================================
-- Книга Памяти Кавалерово - Исправление поля fallen_id в comments
-- =====================================================
-- Миграция: 00019_fix_comments_fallen_id.sql
-- Описание: Делаем fallen_id nullable для поддержки комментариев к воспоминаниям
-- Дата: 2025-01-21

-- Удаляем constraint NOT NULL для fallen_id
ALTER TABLE public.comments ALTER COLUMN fallen_id DROP NOT NULL;

-- Комментарий
COMMENT ON COLUMN public.comments.fallen_id IS 'ID карточки погибшего (если комментарий к карточке)';
