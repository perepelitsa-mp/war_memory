-- =====================================================
-- Книга Памяти Кавалерово - Исправление constraint для дат
-- =====================================================
-- Миграция: 00029_fix_fallen_dates_check.sql
-- Описание: Исправление constraint fallen_dates_check - разрешить равные даты
-- Дата: 2025-01-26

-- Удаляем старый constraint
ALTER TABLE public.fallen DROP CONSTRAINT IF EXISTS fallen_dates_check;

-- Добавляем новый constraint с <= (меньше или равно)
-- Это позволяет случаи, когда человек родился и умер в один день
ALTER TABLE public.fallen
ADD CONSTRAINT fallen_dates_check
CHECK (
  birth_date IS NULL
  OR death_date IS NULL
  OR birth_date <= death_date
);

COMMENT ON CONSTRAINT fallen_dates_check ON public.fallen IS
'Проверка корректности дат: дата рождения должна быть <= даты смерти (или NULL)';
