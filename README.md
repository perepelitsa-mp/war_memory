# Книга Памяти Кавалерово

> Социальный проект для сохранения памяти о погибших в СВО 

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

## Описание

**"Книга Памяти Кавалерово"** — открытая база данных памяти о погибших в Специальной военной операции, где страницы создаются только родственниками, а остальные пользователи могут добавлять материалы памяти и события жизни через постмодерацию владельца карточки.

### Ключевые принципы

- ✅ **Soft delete** — все данные сохраняются навсегда
- ✅ **Премодерация** создания карточек администраторами
- ✅ **Постмодерация** материалов владельцами карточек
- ✅ **Полный аудит** всех действий
- ✅ **Юрисдикция РФ** — все данные хранятся на территории России
- ✅ **Этичный дизайн** в стиле георгиевской ленты
- ✅ **Родственники создают карточки** — только проверенные пользователи

---

## Технический стек

### Frontend
- **Next.js 14** (App Router, React Server Components)
- **Tailwind CSS** + **shadcn/ui**
- **Supabase Client** для работы с API

### Backend
- **Supabase** (self-hosted): PostgreSQL + PostgREST + GoTrue + Storage
- **MinIO** — S3-совместимое хранилище для медиа
- **Telegram Bot** (Telegraf.js) для уведомлений

### Infrastructure
- **Docker Compose** — единая конфигурация для dev и prod
- **GitHub Actions** — CI/CD
- **Nginx** — reverse proxy (production)

---

## Быстрый старт

### Требования

- **Docker** и **Docker Compose**
- **Node.js** 18+ и **npm/yarn**
- **Git**

### 1. Клонирование репозитория

```bash
git clone https://github.com/yourusername/war_memory.git
cd war_memory
```

### 2. Настройка окружения

```bash
# Скопировать пример env файла
cp .env.example .env.development

# Отредактировать .env.development и заполнить обязательные переменные
```

### 3. Запуск через Docker Compose

**Минимальный запуск (рекомендуется для начала):**

```bash
# Запуск PostgreSQL, PostgREST и MinIO
docker-compose --env-file .env.development up postgres supabase-rest minio
```

**Полный запуск (все сервисы):**

```bash
docker-compose --env-file .env.development --profile full up
```

📖 **[Подробные инструкции и решение проблем →](QUICKSTART.md)**

### 4. Установка и запуск frontend (будет в следующей итерации)

```bash
cd frontend
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

---

## Сервисы и порты (development)

| Сервис | URL | Описание |
|--------|-----|----------|
| **Frontend** | http://localhost:3000 | Next.js приложение |
| **PostgREST API** | http://localhost:3001 | REST API для БД |
| **Supabase Studio** | http://localhost:3010 | UI для управления БД |
| **GoTrue Auth** | http://localhost:9999 | Сервис аутентификации |
| **MinIO Console** | http://localhost:9001 | Консоль MinIO |
| **PostgreSQL** | localhost:5432 | База данных |

**Credentials по умолчанию:**
- PostgreSQL: `postgres` / `postgres`
- MinIO: `minioadmin` / `minioadmin`

---

## Структура проекта

```
war_memory/
├── docs/                   # Документация
│   ├── ARCHITECTURE.md     # Архитектура проекта
│   ├── DATABASE.md         # Схема БД
│   ├── API.md              # API спецификация
│   └── DEPLOYMENT.md       # Инструкции по деплою
├── frontend/               # Next.js приложение
├── supabase/               # Supabase конфигурация
│   ├── migrations/         # SQL миграции
│   └── seed.sql            # Начальные данные
├── telegram-bot/           # Telegram бот
├── docker/                 # Docker конфигурации
│   ├── nginx/              # Nginx config
│   └── minio/              # MinIO config
├── scripts/                # Утилиты (бэкапы и т.д.)
├── docker-compose.yml      # Docker Compose конфигурация
├── .env.development        # Dev переменные окружения
└── .env.production         # Prod переменные окружения
```

---

## Разработка

### Миграции БД

Все миграции находятся в `supabase/migrations/` и автоматически применяются при первом запуске PostgreSQL.

### Создание бэкапа

```bash
./scripts/backup.sh
```

### Восстановление из бэкапа

```bash
./scripts/restore.sh backups/db_20250119_120000.sql
```

---

## Деплой на production

Подробные инструкции см. в [DEPLOYMENT.md](docs/DEPLOYMENT.md).

```bash
# На VPS сервере
cd /opt/war_memory
git pull origin main

# Запуск с production окружением
docker-compose --env-file .env.production --profile prod up -d
```

---

## Документация

- **[Быстрый старт и решение проблем](QUICKSTART.md)** ⭐
- [Архитектура проекта](ARCHITECTURE.md)
- [Схема базы данных](docs/DATABASE.md)
- [API документация](docs/API.md)
- [Инструкции по деплою](docs/DEPLOYMENT.md)
- [Roadmap разработки](docs/ROADMAP.md)

---

## Безопасность

Если вы обнаружили уязвимость безопасности, пожалуйста, **НЕ создавайте публичный issue**. Отправьте email на: [security@yourdomain.ru](mailto:security@yourdomain.ru)

---

## Лицензия

Этот проект распространяется под лицензией [MIT License](LICENSE).

---

## Контакты

- **Email**: [admin@yourdomain.ru](mailto:admin@yourdomain.ru)
- **Telegram**: [@yourtelegramusername](https://t.me/yourtelegramusername)

---

## Благодарности

Проект создан в память о героях, отдавших жизнь за Родину.

**Вечная память павшим.**

---

*Разработано с помощью AI агентов и открытых технологий.*
