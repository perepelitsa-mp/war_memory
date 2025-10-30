-- Add service dates fields to fallen table
-- Даты службы: начало и окончание службы

ALTER TABLE fallen
ADD COLUMN IF NOT EXISTS service_start_date DATE DEFAULT NULL;

ALTER TABLE fallen
ADD COLUMN IF NOT EXISTS service_end_date DATE DEFAULT NULL;

COMMENT ON COLUMN fallen.service_start_date IS 'Дата начала службы';
COMMENT ON COLUMN fallen.service_end_date IS 'Дата окончания службы (дата гибели или демобилизации)';

-- Add a check constraint to ensure service_end_date is after service_start_date
ALTER TABLE fallen
ADD CONSTRAINT check_service_dates
CHECK (
  service_end_date IS NULL OR
  service_start_date IS NULL OR
  service_end_date >= service_start_date
);

-- Create indexes for filtering and sorting by service dates
CREATE INDEX IF NOT EXISTS idx_fallen_service_start_date ON fallen(service_start_date) WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_fallen_service_end_date ON fallen(service_end_date) WHERE NOT is_deleted;
