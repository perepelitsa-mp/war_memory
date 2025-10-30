-- Добавляем колонку editors в таблицу fallen
-- Это массив UUID пользователей, которые могут редактировать карточку

ALTER TABLE fallen
ADD COLUMN IF NOT EXISTS editors uuid[] DEFAULT '{}';

COMMENT ON COLUMN fallen.editors IS 'Массив UUID пользователей-редакторов, которые имеют права редактирования карточки';
