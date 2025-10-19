-- =====================================================
-- Базовые расширения для проекта
-- =====================================================
-- Миграция: 00000_init_extensions.sql (обновлена)
-- Описание: установка необходимых расширений
-- Дата: 2025-01-19

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pgcrypto;