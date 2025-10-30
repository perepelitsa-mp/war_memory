-- Создание таблицы населенных пунктов РФ и Украины
-- Данные будут загружаться из GeoNames (http://www.geonames.org/)

CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Основная информация
  name TEXT NOT NULL, -- Название (основное, как в источнике)
  name_ru TEXT, -- Русское название
  name_alt TEXT[], -- Альтернативные названия для поиска

  -- Географическая информация
  country_code VARCHAR(2) NOT NULL, -- RU или UA
  region TEXT, -- Область/регион/край
  district TEXT, -- Район

  -- Тип населенного пункта
  feature_code VARCHAR(10), -- PPL (город), PPLA (центр), PPLC (столица), и т.д.
  feature_class VARCHAR(1), -- P = населенный пункт

  -- Дополнительная информация
  population INTEGER DEFAULT 0, -- Для сортировки по важности
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),

  -- Интеграция с GeoNames
  geonameid INTEGER UNIQUE, -- ID из GeoNames для обновлений

  -- Служебные поля
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_settlements_name ON settlements USING gin(to_tsvector('russian', name));
CREATE INDEX IF NOT EXISTS idx_settlements_name_ru ON settlements USING gin(to_tsvector('russian', name_ru));
CREATE INDEX IF NOT EXISTS idx_settlements_country ON settlements(country_code);
CREATE INDEX IF NOT EXISTS idx_settlements_region ON settlements(region);
CREATE INDEX IF NOT EXISTS idx_settlements_population ON settlements(population DESC);
CREATE INDEX IF NOT EXISTS idx_settlements_geonameid ON settlements(geonameid);

-- Составной индекс для поиска по стране и населению
CREATE INDEX IF NOT EXISTS idx_settlements_country_population ON settlements(country_code, population DESC);

-- Комментарии
COMMENT ON TABLE settlements IS 'Справочник населенных пунктов РФ и Украины из GeoNames';
COMMENT ON COLUMN settlements.name IS 'Основное название населенного пункта';
COMMENT ON COLUMN settlements.name_ru IS 'Русское название';
COMMENT ON COLUMN settlements.name_alt IS 'Альтернативные названия для поиска';
COMMENT ON COLUMN settlements.country_code IS 'Код страны: RU (Россия), UA (Украина)';
COMMENT ON COLUMN settlements.region IS 'Область, регион, край';
COMMENT ON COLUMN settlements.district IS 'Район';
COMMENT ON COLUMN settlements.feature_code IS 'Тип: PPL (город), PPLA (админ центр), PPLC (столица)';
COMMENT ON COLUMN settlements.population IS 'Население для сортировки по важности';
COMMENT ON COLUMN settlements.geonameid IS 'ID из GeoNames для синхронизации';

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_settlements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settlements_updated_at_trigger
  BEFORE UPDATE ON settlements
  FOR EACH ROW
  EXECUTE FUNCTION update_settlements_updated_at();
