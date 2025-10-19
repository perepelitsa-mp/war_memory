# Быстрый старт - Книга Памяти Кавалерово

## 🚀 Самый быстрый способ (рекомендуется)

### Шаг 1: Запустить бэкенд (PostgreSQL + API + MinIO)

```bash
docker-compose --env-file .env.development up postgres supabase-rest minio
```

Подождите 10-15 секунд пока PostgreSQL запустится.

### Шаг 2: Добавить демо-данные

В **новом терминале**:
```bash
docker-compose exec postgres psql -U postgres -d war_memory -f /docker-entrypoint-initdb.d/99999_demo_data.sql
```

Вы увидите сообщение об успешной загрузке демо-данных (3 карточки, события, комментарии).

### Шаг 3: Запустить фронтенд

В **новом терминале**:
```bash
cd frontend
npm install
npm run dev
```

### Шаг 4: Открыть в браузере

Откройте **http://localhost:3000**

🎉 **Готово!** Вы увидите главную страницу с демо-карточками погибших.

### Что уже работает:

- ✅ Главная страница с каталогом карточек
- ✅ Детальная страница карточки погибшего
- ✅ Биография с Markdown
- ✅ Таймлайн событий жизни
- ✅ Материалы памяти (воспоминания)
- ✅ Комментарии с вложенными ответами
- ✅ Фильтрация по статусу (только approved)
- ✅ Soft delete (скрытие удалённых записей)

---

## Детальные варианты запуска

## Исправление ошибок Docker образов

Мы используем образы из GitHub Container Registry (ghcr.io), а не из Docker Hub. Все настроено корректно.

## Варианты запуска

### 1. Минимальный запуск (рекомендуется для начала)

Запускает только PostgreSQL, PostgREST и MinIO:

```bash
docker-compose --env-file .env.development up postgres supabase-rest minio
```

После запуска доступны:
- **PostgreSQL**: `localhost:5432`
- **PostgREST API**: `http://localhost:3001`
- **MinIO Console**: `http://localhost:9001` (логин: minioadmin / minioadmin)

### 2. Запуск с аутентификацией

Добавляет Supabase Auth (GoTrue):

```bash
docker-compose --env-file .env.development up postgres supabase-rest supabase-auth minio
```

После запуска доступны:
- **Supabase Auth**: `http://localhost:9999`
- Все из варианта 1

### 3. Полный запуск (все сервисы)

```bash
docker-compose --env-file .env.development --profile full up
```

Запускает все сервисы, включая:
- PostgreSQL
- PostgREST
- GoTrue (Auth)
- Realtime
- Storage
- MinIO
- Telegram Bot (если настроен)

### 4. Запуск с Supabase Studio (UI для БД)

```bash
docker-compose --env-file .env.development --profile dev up
```

После запуска доступно:
- **Supabase Studio**: `http://localhost:3010`

---

## Проверка запуска

### 1. Проверить статус контейнеров

```bash
docker-compose ps
```

### 2. Проверить логи

```bash
# Все сервисы
docker-compose logs

# Конкретный сервис
docker-compose logs postgres
docker-compose logs supabase-rest
```

### 3. Проверить PostgreSQL

```bash
# Подключиться к PostgreSQL
docker-compose exec postgres psql -U postgres -d war_memory

# Проверить таблицы
\dt

# Выйти
\q
```

### 4. Проверить PostgREST API

```bash
curl http://localhost:3001/
```

Должен вернуть информацию об API.

---

## Остановка сервисов

```bash
# Остановить все контейнеры
docker-compose down

# Остановить и удалить volumes (ВНИМАНИЕ: удалит данные БД!)
docker-compose down -v
```

---

## Решение проблем

### Ошибка "image not found"

Если вы видите ошибку `manifest for supabase/gotrue:latest not found`:
- ✅ Это уже исправлено в новой версии `docker-compose.yml`
- ✅ Мы используем образы из `ghcr.io` (GitHub Container Registry)

### Порты уже заняты

Если порт 5432, 3001 или другой уже занят:

1. Изменить порты в `.env.development`:
```bash
POSTGRES_PORT=5433
POSTGREST_PORT=3002
```

2. Перезапустить:
```bash
docker-compose down
docker-compose --env-file .env.development up
```

### MinIO не запускается

Если MinIO показывает ошибку:

```bash
# Удалить volume и пересоздать
docker-compose down -v
docker-compose --env-file .env.development up minio
```

### PostgreSQL миграции не применились

Миграции автоматически применяются при первом запуске. Если нужно применить вручную:

```bash
docker-compose exec postgres psql -U postgres -d war_memory -f /docker-entrypoint-initdb.d/00000_init_extensions.sql
```

---

## Работа с фронтендом

### Команды разработки

```bash
cd frontend

# Установить зависимости (первый раз)
npm install

# Запустить dev сервер
npm run dev

# Проверить типы TypeScript
npm run type-check

# Линтинг
npm run lint

# Собрать для production
npm run build

# Запустить production сборку
npm run start
```

### Структура фронтенда

- `src/app/` - страницы (App Router)
- `src/components/` - React компоненты
  - `src/components/ui/` - UI компоненты (shadcn)
  - `src/components/layout/` - Header, Footer
  - `src/components/fallen/` - компоненты карточек
- `src/lib/` - утилиты и клиенты (Supabase)
- `src/types/` - TypeScript типы

### Добавление новых UI компонентов (shadcn)

```bash
# Примеры команд для добавления компонентов
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
```

---

## Полезные команды

### Docker

```bash
# Просмотр логов в реальном времени
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f postgres
docker-compose logs -f supabase-rest

# Пересобрать образы
docker-compose build

# Запустить конкретный сервис
docker-compose up postgres

# Выполнить команду в контейнере
docker-compose exec postgres sh

# Подключиться к PostgreSQL
docker-compose exec postgres psql -U postgres -d war_memory

# Очистить всё (volumes, images, containers)
docker-compose down -v --rmi all
```

### База данных

```bash
# Просмотреть таблицы
docker-compose exec postgres psql -U postgres -d war_memory -c "\dt"

# Посмотреть количество записей в таблицах
docker-compose exec postgres psql -U postgres -d war_memory -c "SELECT 'fallen' as table_name, COUNT(*) FROM fallen UNION ALL SELECT 'timeline_items', COUNT(*) FROM timeline_items;"

# Пересоздать БД с нуля (ВНИМАНИЕ: удалит все данные!)
docker-compose down -v
docker-compose --env-file .env.development up postgres supabase-rest minio
# Подождать запуска, затем добавить демо-данные снова
```

---

## Контакты

Если возникли проблемы, создайте issue в GitHub репозитории проекта.
