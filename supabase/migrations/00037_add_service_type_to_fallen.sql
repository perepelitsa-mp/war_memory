-- Add service_type field to fallen table
-- Вид службы: мобилизован, доброволец, ЧВК, кадровый военнослужащий

CREATE TYPE service_type_enum AS ENUM (
  'mobilized',      -- Мобилизован
  'volunteer',      -- Доброволец
  'pmc',           -- ЧВК (Private Military Company)
  'professional'   -- Кадровый военнослужащий
);

ALTER TABLE fallen
ADD COLUMN IF NOT EXISTS service_type service_type_enum DEFAULT NULL;

COMMENT ON COLUMN fallen.service_type IS 'Вид службы: мобилизован, доброволец, ЧВК, кадровый военнослужащий';

-- Create an index for filtering by service type
CREATE INDEX IF NOT EXISTS idx_fallen_service_type ON fallen(service_type) WHERE NOT is_deleted;
