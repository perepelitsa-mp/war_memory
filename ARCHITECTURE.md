# Архитектура проекта "Книга Памяти Кавалерово"

## 1. Обзор проекта

### Цель
Создание социального проекта для сохранения памяти о погибших в СВО уроженцах города Кавалерово с возможностью масштабирования на другие города РФ.

### Ключевые принципы
- ✅ Soft delete для всех данных (is_deleted, deleted_at, deleted_by)
- ✅ Премодерация создания карточек администраторами
- ✅ Постмодерация материалов владельцами карточек
- ✅ Полный аудит действий (audit_log)
- ✅ Юрисдикция РФ (VPS + MinIO в РФ)
- ✅ Этичный дизайн в стиле георгиевской ленты
- ✅ Только родственники создают карточки

---

## 2. Технический стек

### Frontend
- **Framework**: Next.js 14 (App Router)
- **React**: Server Components + Client Components
- **Styling**: Tailwind CSS 3.x
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **State**: React Context + Zustand (для сложных состояний)
- **HTTP Client**: Supabase Client JS
- **Maps**: 2GIS API
- **Social**: VK SDK для OAuth и шаринга

### Backend
- **BaaS**: Supabase (self-hosted)
  - PostgreSQL 15
  - PostgREST (автоматический REST API)
  - GoTrue (аутентификация)
  - Realtime (подписки на изменения)
  - Storage API
- **Object Storage**: MinIO (S3-совместимое)
- **Search**: PostgreSQL pg_trgm + unaccent extensions
- **Email**: Nodemailer + бесплатный SMTP (Gmail SMTP или Brevo)
- **Telegram Bot**: Telegraf.js

### Infrastructure
- **Hosting**: VPS в РФ (4GB RAM, расширяемое SSD)
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Environment Management**: Один docker-compose.yml + .env файлы для dev/prod
- **Monitoring**: Sentry (бесплатный tier)
- **Backups**: pg_dump + MinIO versioning

---

## 3. Архитектура инфраструктуры

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Nginx     │ (Reverse Proxy, только prod)
                    │   :80,:443  │
                    └──────┬──────┘
                           │
        ┏━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━┓
        ┃                                    ┃
   ┌────▼─────┐                        ┌────▼─────┐
   │ Next.js  │◄──────────────────────►│ Supabase │
   │  :3000   │  Supabase Client JS    │  Stack   │
   └────┬─────┘                        └────┬─────┘
        │                                   │
        │                              ┌────▼──────┐
        │                              │PostgreSQL │
        │                              │   :5432   │
        │                              └────┬──────┘
        │                                   │
        │                              ┌────▼──────┐
        │                              │ PostgREST │
        │                              │   :3001   │
        │                              └───────────┘
        │                                   │
        │                              ┌────▼──────┐
        │                              │  GoTrue   │
        │                              │   :9999   │
        │                              └───────────┘
        │                                   │
        └──────────────────────────────┬────┘
                                       │
                                  ┌────▼──────┐
                                  │   MinIO   │
                                  │   :9000   │
                                  └───────────┘
                                       │
                                  ┌────▼──────┐
                                  │ Telegram  │
                                  │    Bot    │
                                  └───────────┘
```

### Docker Compose Services

**Единый файл** (`docker-compose.yml`) с управлением через переменные окружения:

- `postgres` - PostgreSQL 15
- `supabase-studio` - Supabase UI (порт 3010, только dev)
- `supabase-auth` - GoTrue
- `supabase-rest` - PostgREST
- `supabase-realtime` - Realtime subscriptions
- `supabase-storage` - Storage API
- `minio` - Object storage
- `telegram-bot` - Telegram notifications
- `nginx` - Reverse proxy с SSL (только prod)

**Запуск:**
```bash
# Development
docker-compose --env-file .env.development up

# Production
docker-compose --env-file .env.production up -d
```

---

## 4. Схема базы данных (PostgreSQL)

### 4.1 Таблица `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,

  -- VK Integration
  vk_id BIGINT UNIQUE,
  vk_access_token TEXT,

  -- Role: superadmin, admin, moderator, owner, editor, user, guest
  role VARCHAR(50) DEFAULT 'user',

  -- Notifications
  telegram_chat_id BIGINT,
  email_verified BOOLEAN DEFAULT false,
  notification_preferences JSONB DEFAULT '{"email": true, "telegram": false}',

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email) WHERE NOT is_deleted;
CREATE INDEX idx_users_vk_id ON users(vk_id) WHERE NOT is_deleted;
CREATE INDEX idx_users_role ON users(role) WHERE NOT is_deleted;
```

### 4.2 Таблица `fallen` (карточки погибших)

```sql
CREATE TABLE fallen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Основная информация
  last_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),

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
  memorial_text TEXT CHECK (char_length(memorial_text) BETWEEN 400 AND 600),
  biography_md TEXT, -- Markdown

  -- Владение
  owner_id UUID NOT NULL REFERENCES users(id), -- родственник-создатель

  -- Статус
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, archived, blocked
  is_demo BOOLEAN DEFAULT false, -- демо-карточка

  -- Модерация
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMPTZ,
  moderation_note TEXT,

  -- Справка (документ подтверждения родства)
  proof_document_url TEXT,
  relationship VARCHAR(50), -- супруг, родитель, ребёнок, брат/сестра, бабушка/дедушка, опекун

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fallen_owner ON fallen(owner_id) WHERE NOT is_deleted;
CREATE INDEX idx_fallen_status ON fallen(status) WHERE NOT is_deleted;
CREATE INDEX idx_fallen_hometown ON fallen(hometown) WHERE NOT is_deleted;
CREATE INDEX idx_fallen_death_date ON fallen(death_date) WHERE NOT is_deleted;

-- Full-text search with trigrams
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE INDEX idx_fallen_fullname_trgm ON fallen
  USING gin ((last_name || ' ' || first_name || ' ' || COALESCE(middle_name, '')) gin_trgm_ops)
  WHERE NOT is_deleted;
```

### 4.3 Таблица `editors` (редакторы карточек)

```sql
CREATE TABLE editors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fallen_id UUID NOT NULL REFERENCES fallen(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id),

  UNIQUE(fallen_id, user_id)
);

CREATE INDEX idx_editors_fallen ON editors(fallen_id) WHERE NOT is_deleted;
CREATE INDEX idx_editors_user ON editors(user_id) WHERE NOT is_deleted;
```

### 4.4 Таблица `timeline_items` (события жизни)

```sql
CREATE TABLE timeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fallen_id UUID NOT NULL REFERENCES fallen(id) ON DELETE CASCADE,

  -- Дата события
  date_exact DATE,
  year INTEGER,

  title VARCHAR(255) NOT NULL,
  description_md TEXT,

  media_id UUID REFERENCES fallen_media(id),

  -- Модерация
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, archived
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMPTZ,
  moderation_note TEXT,

  -- Аудит
  created_by UUID NOT NULL REFERENCES users(id),
  audit_diff JSONB,

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_fallen ON timeline_items(fallen_id) WHERE NOT is_deleted;
CREATE INDEX idx_timeline_status ON timeline_items(status) WHERE NOT is_deleted;
CREATE INDEX idx_timeline_date ON timeline_items(year, date_exact) WHERE NOT is_deleted;
```

### 4.5 Таблица `memory_items` (материалы памяти)

```sql
CREATE TABLE memory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fallen_id UUID NOT NULL REFERENCES fallen(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  content_md TEXT,

  media_ids UUID[], -- массив ID из fallen_media

  -- Модерация
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, archived
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMPTZ,
  moderation_note TEXT,

  -- Аудит
  created_by UUID NOT NULL REFERENCES users(id),

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_memory_fallen ON memory_items(fallen_id) WHERE NOT is_deleted;
CREATE INDEX idx_memory_status ON memory_items(status) WHERE NOT is_deleted;
```

### 4.6 Таблица `fallen_media` (галерея фото/видео)

```sql
CREATE TABLE fallen_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fallen_id UUID NOT NULL REFERENCES fallen(id) ON DELETE CASCADE,

  media_type VARCHAR(20) NOT NULL, -- photo, video
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,

  caption TEXT,
  alt_text TEXT,

  file_size BIGINT, -- bytes
  mime_type VARCHAR(100),

  -- Модерация
  status VARCHAR(50) DEFAULT 'approved', -- pending, approved, rejected

  uploaded_by UUID NOT NULL REFERENCES users(id),

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_fallen ON fallen_media(fallen_id) WHERE NOT is_deleted;
CREATE INDEX idx_media_type ON fallen_media(media_type) WHERE NOT is_deleted;
```

### 4.7 Таблица `comments` (комментарии)

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fallen_id UUID NOT NULL REFERENCES fallen(id) ON DELETE CASCADE,

  parent_id UUID REFERENCES comments(id), -- для древовидности

  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),

  -- Модерация
  is_hidden BOOLEAN DEFAULT false,
  hidden_by UUID REFERENCES users(id),
  hidden_at TIMESTAMPTZ,
  hidden_reason TEXT,

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_fallen ON comments(fallen_id) WHERE NOT is_deleted;
CREATE INDEX idx_comments_parent ON comments(parent_id) WHERE NOT is_deleted;
CREATE INDEX idx_comments_author ON comments(author_id) WHERE NOT is_deleted;
```

### 4.8 Таблица `moderation_queue` (очередь премодерации)

```sql
CREATE TABLE moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  entity_type VARCHAR(50) NOT NULL, -- 'fallen', 'report'
  entity_id UUID NOT NULL,

  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_review, resolved

  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,

  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  resolution TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moderation_status ON moderation_queue(status);
CREATE INDEX idx_moderation_entity ON moderation_queue(entity_type, entity_id);
```

### 4.9 Таблица `audit_log` (аудит действий)

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,

  action VARCHAR(50) NOT NULL, -- insert, update, delete, restore

  old_values JSONB,
  new_values JSONB,

  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),

  ip_address INET,
  user_agent TEXT
);

CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_changed_by ON audit_log(changed_by);
CREATE INDEX idx_audit_changed_at ON audit_log(changed_at);
```

### 4.10 Таблица `notifications` (очередь уведомлений)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id),

  type VARCHAR(50) NOT NULL, -- moderation_pending, moderation_approved, new_memory, etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  entity_type VARCHAR(50),
  entity_id UUID,

  channel VARCHAR(20) NOT NULL, -- email, telegram
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed

  sent_at TIMESTAMPTZ,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
```

### 4.11 Таблица `locations` (места памяти для карты)

```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fallen_id UUID REFERENCES fallen(id) ON DELETE CASCADE,

  location_type VARCHAR(50) NOT NULL, -- burial, monument, memorial_plaque

  title VARCHAR(255) NOT NULL,
  description TEXT,

  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,

  address TEXT,

  photo_url TEXT,

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id),

  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_locations_fallen ON locations(fallen_id) WHERE NOT is_deleted;
CREATE INDEX idx_locations_coords ON locations(latitude, longitude) WHERE NOT is_deleted;
```

---

## 5. Row Level Security (RLS) Policies

### Пример для таблицы `fallen`:

```sql
-- Включить RLS
ALTER TABLE fallen ENABLE ROW LEVEL SECURITY;

-- Политика чтения: все видят только approved карточки (или свои)
CREATE POLICY "Public read approved fallen"
  ON fallen FOR SELECT
  USING (
    (status = 'approved' AND NOT is_deleted)
    OR
    owner_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM editors
      WHERE fallen_id = id
      AND user_id = auth.uid()
      AND NOT is_deleted
    )
  );

-- Политика создания: только авторизованные
CREATE POLICY "Authenticated users can create fallen"
  ON fallen FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Политика обновления: владелец или редактор
CREATE POLICY "Owner and editors can update fallen"
  ON fallen FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM editors
      WHERE fallen_id = id
      AND user_id = auth.uid()
      AND NOT is_deleted
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator', 'superadmin')
    )
  );
```

*(Аналогичные политики для всех таблиц)*

---

## 6. Триггеры для аудита и soft delete

```sql
-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Применить ко всем таблицам
CREATE TRIGGER update_fallen_updated_at BEFORE UPDATE ON fallen
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для аудита
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'update', row_to_json(OLD), row_to_json(NEW), auth.uid());
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_values, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'delete', row_to_json(OLD), auth.uid());
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'insert', row_to_json(NEW), auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Применить аудит к таблицам
CREATE TRIGGER audit_fallen AFTER INSERT OR UPDATE OR DELETE ON fallen
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

---

## 7. API Endpoints (PostgREST)

### Автоматические REST endpoints от PostgREST:

| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/fallen` | Список карточек (с фильтрами) |
| GET | `/fallen?id=eq.{uuid}` | Одна карточка |
| POST | `/fallen` | Создать карточку (требует auth) |
| PATCH | `/fallen?id=eq.{uuid}` | Обновить карточку |
| DELETE | `/fallen?id=eq.{uuid}` | Soft delete карточки |
| GET | `/timeline_items?fallen_id=eq.{uuid}` | События таймлайна |
| POST | `/memory_items` | Добавить память |
| GET | `/comments?fallen_id=eq.{uuid}` | Комментарии |

### Кастомные Next.js API Routes:

| Route | Описание |
|-------|----------|
| `/api/auth/vk` | VK OAuth callback |
| `/api/upload` | Загрузка медиа в MinIO |
| `/api/pdf/[fallenId]` | Генерация PDF карточки |
| `/api/moderation/approve` | Одобрение премодерации |
| `/api/moderation/reject` | Отклонение премодерации |
| `/api/notifications/send` | Отправка уведомлений |

---

## 8. Структура проекта

```
war_memory/
├── .github/
│   └── workflows/
│       ├── ci-dev.yml           # CI для dev
│       └── ci-prod.yml          # CI для prod
│
├── docs/
│   ├── ARCHITECTURE.md          # Этот документ
│   ├── DATABASE.md              # Схема БД
│   ├── API.md                   # API спецификация
│   ├── DEPLOYMENT.md            # Инструкции по деплою
│   └── ROADMAP.md               # План разработки
│
├── frontend/
│   ├── app/                     # Next.js App Router
│   │   ├── (public)/
│   │   │   ├── page.tsx         # Главная (каталог)
│   │   │   ├── fallen/[id]/page.tsx  # Карточка погибшего
│   │   │   └── about/page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── fallen/new/page.tsx
│   │   │   └── moderation/page.tsx
│   │   ├── api/                 # API Routes
│   │   │   ├── auth/vk/route.ts
│   │   │   ├── upload/route.ts
│   │   │   └── pdf/[id]/route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui компоненты
│   │   ├── fallen/
│   │   │   ├── FallenCard.tsx
│   │   │   ├── FallenHero.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── MemoryGallery.tsx
│   │   │   └── Comments.tsx
│   │   ├── map/
│   │   │   └── LocationMap.tsx  # 2GIS карта
│   │   ├── moderation/
│   │   │   └── ModerationQueue.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        # Supabase browser client
│   │   │   └── server.ts        # Supabase server client
│   │   ├── minio.ts             # MinIO client
│   │   ├── vk.ts                # VK API wrapper
│   │   └── utils.ts
│   │
│   ├── hooks/
│   │   ├── useFallen.ts
│   │   ├── useTimeline.ts
│   │   └── useModeration.ts
│   │
│   ├── types/
│   │   ├── database.types.ts    # Generated from Supabase
│   │   └── index.ts
│   │
│   ├── public/
│   │   ├── images/
│   │   └── favicon.ico
│   │
│   ├── .env.development
│   ├── .env.production
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── supabase/
│   ├── migrations/
│   │   ├── 20250101000000_create_users.sql
│   │   ├── 20250101000001_create_fallen.sql
│   │   ├── 20250101000002_create_timeline.sql
│   │   ├── 20250101000003_create_memory.sql
│   │   ├── 20250101000004_create_media.sql
│   │   ├── 20250101000005_create_comments.sql
│   │   ├── 20250101000006_create_moderation.sql
│   │   ├── 20250101000007_create_audit.sql
│   │   ├── 20250101000008_create_notifications.sql
│   │   ├── 20250101000009_create_locations.sql
│   │   ├── 20250101000010_create_rls_policies.sql
│   │   └── 20250101000011_create_triggers.sql
│   │
│   ├── functions/               # Edge Functions (если нужны)
│   ├── seed.sql                 # Демо-данные
│   └── config.toml              # Supabase config
│
├── telegram-bot/
│   ├── src/
│   │   ├── bot.ts               # Telegraf bot
│   │   ├── commands/
│   │   │   ├── start.ts
│   │   │   └── subscribe.ts
│   │   ├── handlers/
│   │   │   └── notifications.ts
│   │   └── utils/
│   │       └── supabase.ts
│   ├── .env
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── docker/
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── ssl/
│   └── minio/
│       └── config/
│
├── scripts/
│   ├── backup.sh                # Бэкап БД и MinIO
│   ├── restore.sh               # Восстановление
│   └── seed-demo.ts             # Создание демо-карточек
│
├── docker-compose.yml           # Единая конфигурация
├── .env.development             # Dev переменные
├── .env.production              # Prod переменные
├── .env.example
├── .gitignore
├── README.md
├── LICENSE
└── package.json                 # Root workspace
```

---

## 9. Docker Compose конфигурация

### Единый файл (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: war_memory_postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-war_memory}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./supabase/migrations:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: ${RESTART_POLICY:-unless-stopped}

  supabase-studio:
    image: supabase/studio:latest
    container_name: war_memory_studio
    ports:
      - "${STUDIO_PORT:-3010}:3000"
    environment:
      SUPABASE_URL: http://localhost:${KONG_HTTP_PORT:-8000}
      SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
    profiles:
      - dev
    restart: ${RESTART_POLICY:-unless-stopped}

  supabase-auth:
    image: supabase/gotrue:latest
    container_name: war_memory_auth
    ports:
      - "${GOTRUE_PORT:-9999}:9999"
    environment:
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgres://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-war_memory}
      GOTRUE_SITE_URL: ${SITE_URL:-http://localhost:3000}
      GOTRUE_JWT_SECRET: ${JWT_SECRET}
      GOTRUE_JWT_EXP: 3600
      GOTRUE_EXTERNAL_VK_ENABLED: ${VK_OAUTH_ENABLED:-true}
      GOTRUE_EXTERNAL_VK_CLIENT_ID: ${VK_CLIENT_ID}
      GOTRUE_EXTERNAL_VK_SECRET: ${VK_CLIENT_SECRET}
      GOTRUE_EXTERNAL_VK_REDIRECT_URI: ${VK_REDIRECT_URI}
    depends_on:
      postgres:
        condition: service_healthy
    restart: ${RESTART_POLICY:-unless-stopped}

  supabase-rest:
    image: postgrest/postgrest:latest
    container_name: war_memory_rest
    ports:
      - "${POSTGREST_PORT:-3001}:3000"
    environment:
      PGRST_DB_URI: postgres://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-war_memory}
      PGRST_DB_SCHEMA: ${PGRST_DB_SCHEMA:-public}
      PGRST_DB_ANON_ROLE: ${PGRST_DB_ANON_ROLE:-anon}
      PGRST_JWT_SECRET: ${JWT_SECRET}
      PGRST_DB_USE_LEGACY_GUCS: "false"
    depends_on:
      postgres:
        condition: service_healthy
    restart: ${RESTART_POLICY:-unless-stopped}

  minio:
    image: minio/minio:latest
    container_name: war_memory_minio
    command: server /data --console-address ":9001"
    ports:
      - "${MINIO_PORT:-9000}:9000"
      - "${MINIO_CONSOLE_PORT:-9001}:9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
    restart: ${RESTART_POLICY:-unless-stopped}

  telegram-bot:
    build: ./telegram-bot
    container_name: war_memory_telegram_bot
    environment:
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}
      SUPABASE_URL: http://supabase-rest:3000
      SUPABASE_KEY: ${SUPABASE_ANON_KEY}
      DATABASE_URL: postgres://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-war_memory}
    depends_on:
      - supabase-rest
      - postgres
    restart: ${RESTART_POLICY:-unless-stopped}

  nginx:
    image: nginx:alpine
    container_name: war_memory_nginx
    ports:
      - "${NGINX_HTTP_PORT:-80}:80"
      - "${NGINX_HTTPS_PORT:-443}:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - supabase-rest
      - supabase-auth
    profiles:
      - prod
    restart: ${RESTART_POLICY:-unless-stopped}

volumes:
  postgres_data:
    driver: local
  minio_data:
    driver: local
```

### Управление окружениями

**Development** (`.env.development`):
```bash
# Environment
NODE_ENV=development
RESTART_POLICY=no

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=war_memory
POSTGRES_PORT=5432

# Supabase
SUPABASE_ANON_KEY=your-anon-key-here
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters
SITE_URL=http://localhost:3000

# PostgREST
POSTGREST_PORT=3001
PGRST_DB_SCHEMA=public
PGRST_DB_ANON_ROLE=anon

# MinIO
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

# VK OAuth
VK_OAUTH_ENABLED=true
VK_CLIENT_ID=your-vk-app-id
VK_CLIENT_SECRET=your-vk-app-secret
VK_REDIRECT_URI=http://localhost:3000/api/auth/vk/callback

# Telegram
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Studio (only dev)
STUDIO_PORT=3010
```

**Production** (`.env.production`):
```bash
# Environment
NODE_ENV=production
RESTART_POLICY=unless-stopped

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE
POSTGRES_DB=war_memory
POSTGRES_PORT=5432

# Supabase
SUPABASE_ANON_KEY=your-production-anon-key
JWT_SECRET=your-production-super-secret-jwt-token-with-at-least-32-characters
SITE_URL=https://yourdomain.ru

# PostgREST
POSTGREST_PORT=3001
PGRST_DB_SCHEMA=public
PGRST_DB_ANON_ROLE=anon

# MinIO
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=STRONG_PASSWORD_HERE

# VK OAuth
VK_OAUTH_ENABLED=true
VK_CLIENT_ID=your-production-vk-app-id
VK_CLIENT_SECRET=your-production-vk-app-secret
VK_REDIRECT_URI=https://yourdomain.ru/api/auth/vk/callback

# Telegram
TELEGRAM_BOT_TOKEN=your-production-telegram-bot-token

# Nginx
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

**Запуск:**
```bash
# Development
docker-compose --env-file .env.development up

# Production
docker-compose --env-file .env.production --profile prod up -d
```

---

## 10. GitHub Actions CI/CD

### `.github/workflows/ci-dev.yml`

```yaml
name: CI Development

on:
  push:
    branches: [develop]
  pull_request:
    branches: [develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run linter
        working-directory: ./frontend
        run: npm run lint

      - name: Run tests
        working-directory: ./frontend
        run: npm run test
```

### `.github/workflows/ci-prod.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.7.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Copy .env.production to VPS
        run: |
          echo "${{ secrets.ENV_PRODUCTION }}" > .env.production
          scp -o StrictHostKeyChecking=no .env.production ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }}:/opt/war_memory/

      - name: Deploy to VPS
        run: |
          ssh -o StrictHostKeyChecking=no ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} '
            cd /opt/war_memory &&
            git pull origin main &&
            docker-compose --env-file .env.production --profile prod down &&
            docker-compose --env-file .env.production --profile prod up -d --build
          '

      - name: Run migrations
        run: |
          ssh ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} '
            cd /opt/war_memory &&
            docker-compose --env-file .env.production exec -T postgres \
              psql -U postgres -d war_memory -f /docker-entrypoint-initdb.d/latest.sql
          '

      - name: Health check
        run: |
          sleep 10
          curl -f https://yourdomain.ru/api/health || exit 1
```

---

## 11. Roadmap разработки (4 недели MVP)

### **Неделя 1: Инфраструктура и база**

**День 1-2: Настройка окружения**
- ✅ Настроить Docker Compose (единый файл)
- ✅ Развернуть Supabase self-hosted
- ✅ Настроить MinIO
- ✅ Создать базовую структуру Next.js
- ✅ Настроить GitHub репозиторий

**День 3-4: База данных**
- ✅ Создать все миграции (users, fallen, timeline, memory, media, comments, moderation, audit, notifications, locations)
- ✅ Настроить RLS политики
- ✅ Создать триггеры для аудита
- ✅ Заполнить seed данные

**День 5-7: Аутентификация**
- ✅ Настроить GoTrue (Email auth)
- ✅ Интеграция VK OAuth
- ✅ Страницы login/register
- ✅ Middleware для защиты роутов
- ✅ Создание первого суперадмина

---

### **Неделя 2: Карточки и модерация**

**День 8-9: Создание карточек**
- ✅ Форма создания карточки (только для родственников)
- ✅ Загрузка справки о родстве
- ✅ Валидация полей (Zod schema)
- ✅ Отправка в премодерацию

**День 10-11: Админ-панель премодерации**
- ✅ Модерационная очередь (dashboard)
- ✅ Действия: approve, reject, archive
- ✅ Просмотр справки о родстве
- ✅ Уведомления владельцам

**День 12-14: Публичные карточки**
- ✅ Страница карточки (`/fallen/[id]`)
- ✅ Hero-фото, ФИО, даты, биография
- ✅ Галерея фото (загрузка в MinIO)
- ✅ Каталог карточек (`/`)
- ✅ Поиск по ФИО (pg_trgm)
- ✅ Фильтры (год, посёлок)

---

### **Неделя 3: Память и уведомления**

**День 15-16: Модуль "Память"**
- ✅ CRUD для memory_items
- ✅ Постмодерация владельцем
- ✅ Отображение на странице карточки
- ✅ Уведомления владельцу о новой памяти

**День 17-18: Система уведомлений**
- ✅ Email отправка (Nodemailer + Gmail SMTP)
- ✅ Telegram bot (Telegraf)
- ✅ Команда /subscribe в боте
- ✅ Напоминания о непромодерированных материалах (3-й и 6-й день)

**День 19-20: Комментарии**
- ✅ Древовидные комментарии
- ✅ Ответы на комментарии
- ✅ Скрытие комментариев владельцем
- ✅ Soft delete

**День 21: PDF экспорт**
- ✅ Генерация PDF карточки (puppeteer или react-pdf)
- ✅ Кнопка "Скачать PDF"

---

### **Неделя 4: Таймлайн и финализация**

**День 22-23: Таймлайн жизни**
- ✅ CRUD для timeline_items
- ✅ Модерация событий владельцем
- ✅ Отображение вертикальной лентой
- ✅ Сортировка по годам
- ✅ Прикрепление фото к событиям

**День 24: Карта памяти**
- ✅ Интеграция 2GIS API
- ✅ Отображение мест захоронений
- ✅ Метки памятников
- ✅ Попапы с информацией

**День 25: VK интеграция**
- ✅ Open Graph метатеги для шаринга
- ✅ Кнопка "Поделиться в VK"
- ✅ Превью карточек в VK

**День 26-27: Админ-панель**
- ✅ Статистика (кол-во карточек, пользователей, материалов)
- ✅ Отчёты модерации
- ✅ Управление ролями
- ✅ Приглашение редакторов

**День 28: Оптимизация и тестирование**
- ✅ Оптимизация запросов (индексы, кеширование)
- ✅ Image optimization (WebP, responsive)
- ✅ SEO (sitemap, robots.txt)
- ✅ Тестирование на mobile
- ✅ Деплой на production VPS
- ✅ Настройка CI/CD

---

## 12. Дизайн система (георгиевская лента)

### Цветовая палитра

```css
:root {
  /* Primary colors */
  --color-orange: #FF7F00;      /* Оранжевый георгиевской ленты */
  --color-black: #1A1A1A;       /* Глубокий черный */
  --color-gray-dark: #4A4A4A;   /* Темно-серый */
  --color-gray: #8A8A8A;        /* Средний серый */
  --color-gray-light: #E0E0E0;  /* Светло-серый */
  --color-white: #FFFFFF;       /* Белый */

  /* Semantic colors */
  --color-danger: #DC2626;      /* Красный (удаление) */
  --color-success: #16A34A;     /* Зеленый (одобрено) */
  --color-warning: #F59E0B;     /* Желтый (ожидает) */
  --color-demo: #EF4444;        /* Красный для DEMO тега */
}
```

### Типографика

```css
:root {
  --font-sans: 'Inter', -apple-system, system-ui, sans-serif;
  --font-serif: 'PT Serif', Georgia, serif; /* Для биографий */
}

/* Заголовки */
h1 { font-size: 2.5rem; font-weight: 700; color: var(--color-black); }
h2 { font-size: 2rem; font-weight: 600; }
h3 { font-size: 1.5rem; font-weight: 600; }

/* Контраст AA+ */
body { font-size: 16px; line-height: 1.6; color: var(--color-gray-dark); }
```

### UI компоненты (shadcn/ui)

- Button: Primary (оранжевый), Secondary (серый), Ghost
- Card: минимализм, тонкие границы
- Input/Textarea: четкие границы, фокус на оранжевом
- Badge: для статусов и DEMO тега
- Dialog/Modal: для модерации
- Tooltip: подсказки с описаниями

---

## 13. SEO и метатеги

### Open Graph для VK шаринга

```tsx
// app/fallen/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const fallen = await getFallen(params.id);

  return {
    title: `${fallen.last_name} ${fallen.first_name} ${fallen.middle_name}`,
    description: fallen.memorial_text,
    openGraph: {
      type: 'profile',
      title: `Память о ${fallen.first_name} ${fallen.last_name}`,
      description: fallen.memorial_text,
      images: [fallen.hero_photo_url],
      siteName: 'Книга Памяти Кавалерово',
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}
```

---

## 14. Безопасность

### 14.1 Защита от атак

- ✅ **CSRF**: Next.js автоматическая защита
- ✅ **XSS**: Sanitize пользовательского ввода (DOMPurify)
- ✅ **SQL Injection**: Supabase использует параметризованные запросы
- ✅ **Rate Limiting**: На уровне Nginx (limit_req)
- ✅ **File Upload**: Валидация MIME типов, размеров

### 14.2 Хранение секретов

Все секреты хранятся в `.env` файлах (не коммитятся в Git).

```bash
# .env.production (НЕ коммитить!)
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE
JWT_SECRET=your-production-super-secret-jwt-token
VK_CLIENT_SECRET=...
TELEGRAM_BOT_TOKEN=...
MINIO_ROOT_PASSWORD=...
```

### 14.3 SSL сертификаты

```bash
# Let's Encrypt через Certbot
certbot certonly --nginx -d yourdomain.ru -d www.yourdomain.ru
```

---

## 15. Мониторинг и бэкапы

### 15.1 Sentry для ошибок

```tsx
// frontend/sentry.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 15.2 Бэкапы

```bash
# scripts/backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)

# PostgreSQL dump
docker-compose --env-file .env.production exec -T postgres \
  pg_dump -U postgres war_memory > backups/db_$DATE.sql

# MinIO sync (используя mc - MinIO Client)
docker run --rm -v $(pwd)/backups:/backups \
  --network war_memory_default \
  minio/mc:latest \
  mirror minio/war-memory /backups/minio_$DATE/

# Retention: 30 дней
find backups/ -type f -mtime +30 -delete
```

**Cron job**: ежедневно в 3:00 AM

```bash
0 3 * * * /opt/war_memory/scripts/backup.sh
```

---

## 16. Критерии приёмки MVP

### Функциональные требования

✅ **Регистрация и авторизация**
- Email + пароль работает
- VK OAuth работает
- Роли корректно назначаются

✅ **Карточки погибших**
- Только родственники могут создавать
- Обязательна справка о родстве
- Премодерация администраторами
- Публикация только после одобрения
- Демо-карточки помечены красным тегом DEMO

✅ **Поиск и фильтры**
- Поиск по ФИО (с учетом опечаток)
- Фильтры: год, посёлок
- Результаты только approved карточек

✅ **Таймлайн**
- Любой пользователь может предложить событие
- Постмодерация владельцем
- Сортировка по годам

✅ **Модуль "Память"**
- Добавление фото/текстов
- Постмодерация владельцем
- Отображение на карточке

✅ **Комментарии**
- Древовидные ответы
- Скрытие владельцем
- Soft delete

✅ **Галерея**
- Загрузка фото/видео в MinIO
- WebP оптимизация
- Лимиты: фото ≤ 1 МБ, видео ≤ 150 МБ

✅ **Карта**
- 2GIS интеграция
- Метки мест захоронений
- Попапы с информацией

✅ **Уведомления**
- Email отправка
- Telegram бот
- Напоминания (3-й и 6-й день)

✅ **VK интеграция**
- OAuth вход
- Шаринг карточек с превью

✅ **Админ-панель**
- Премодерация карточек
- Статистика
- Управление ролями

✅ **PDF экспорт**
- Генерация карточки в PDF
- Лаконичный дизайн

✅ **Soft delete**
- Все удаления логические
- Фильтрация is_deleted = true
- Аудит в audit_log

### Нефункциональные требования

✅ **Производительность**
- Время загрузки главной ≤ 2 сек
- Время загрузки карточки ≤ 1 сек
- Поиск ≤ 500 мс

✅ **Безопасность**
- SSL сертификаты
- RLS политики работают
- Валидация загрузок

✅ **Юрисдикция**
- Все данные на VPS в РФ
- MinIO в РФ

✅ **Доступность**
- Alt-тексты для изображений
- Клавиатурная навигация
- Контраст AA+

✅ **CI/CD**
- GitHub Actions деплоит на push в main
- Миграции применяются автоматически

---

## 17. Что дальше (Post-MVP)

### Фаза 2 (1-2 месяца)

- **Многопользовательские города**: выбор города при создании карточки
- **Расширенный поиск**: по подразделению, школе, дате рождения
- **QR-коды**: на памятниках со ссылкой на карточку
- **Мобильное приложение**: React Native
- **Публичная статистика**: города, годы, подразделения
- **Экспорт всей базы**: CSV для исследователей
- **Интеграция с "Бессмертным полком"**

### Фаза 3 (масштабирование)

- **Федерация**: объединение с другими городами
- **Графика памяти**: визуализация данных
- **API для партнёров**: школы, музеи
- **Краудсорсинг**: волонтеры-модераторы
- **Оцифровка архивов**: сканирование документов

---

## 18. Контакты и команда

**Разработчик**: Solo developer + AI agents
**Проект**: Некоммерческий, open source (MIT License)
**Репозиторий**: GitHub (приватный на старте, публичный после MVP)

---

## Заключение

Этот документ является **живым** — он будет обновляться по мере развития проекта. Все изменения фиксируются в Git.

**Версия**: 1.0.0
**Дата**: 2025-01-19
**Автор**: Claude AI Agent + Solo Developer

---

*Документ создан в рамках реализации проекта "Книга Памяти Кавалерово" согласно спецификации из [CLAUDE.MD](CLAUDE.MD).*
