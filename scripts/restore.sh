#!/bin/bash
# =====================================================
# Книга Памяти Кавалерово - Скрипт восстановления
# =====================================================
# Описание: Восстановление из бэкапа PostgreSQL и MinIO
# Использование: ./scripts/restore.sh backup_20250119_120000.tar.gz

set -e # Exit on error

# Переменные
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
ENV_FILE="$PROJECT_DIR/.env.production"

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# =====================================================
# Проверка аргументов
# =====================================================

if [ $# -eq 0 ]; then
  echo -e "${RED}Ошибка: Укажите файл бэкапа${NC}"
  echo "Использование: $0 backup_YYYYMMDD_HHMMSS.tar.gz"
  echo ""
  echo "Доступные бэкапы:"
  ls -lh "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null || echo "  Нет доступных бэкапов"
  exit 1
fi

BACKUP_FILE="$1"

# Проверить существование файла
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
  echo -e "${RED}Ошибка: Файл $BACKUP_FILE не найден в $BACKUP_DIR${NC}"
  exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Книга Памяти Кавалерово - Восстановление${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Внимание! Это действие перезапишет текущие данные!${NC}"
read -p "Продолжить? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Отменено."
  exit 0
fi

# =====================================================
# 1. Распаковка архива
# =====================================================

echo -e "${YELLOW}[1/3] Распаковка архива...${NC}"

TEMP_DIR="$BACKUP_DIR/temp_restore_$$"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

tar -xzf "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Архив распакован${NC}"
else
  echo -e "${RED}✗ Ошибка при распаковке архива${NC}"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# Найти файл дампа
DB_DUMP=$(find . -name "db_*.dump" -type f | head -n 1)
MINIO_DIR=$(find . -name "minio_*" -type d | head -n 1)

if [ -z "$DB_DUMP" ]; then
  echo -e "${RED}✗ Файл дампа PostgreSQL не найден в архиве${NC}"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# =====================================================
# 2. Восстановление PostgreSQL
# =====================================================

echo -e "${YELLOW}[2/3] Восстановление PostgreSQL...${NC}"

# Остановить подключения к БД
docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec postgres \
  psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'war_memory' AND pid <> pg_backend_pid();"

# Удалить существующую БД и создать заново
docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec postgres \
  psql -U postgres -c "DROP DATABASE IF EXISTS war_memory;"

docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec postgres \
  psql -U postgres -c "CREATE DATABASE war_memory;"

# Восстановить из дампа
cat "$DB_DUMP" | docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  pg_restore -U postgres -d war_memory --no-owner --no-acl

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ PostgreSQL восстановлена${NC}"
else
  echo -e "${RED}✗ Ошибка при восстановлении PostgreSQL${NC}"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# =====================================================
# 3. Восстановление MinIO
# =====================================================

if [ -n "$MINIO_DIR" ]; then
  echo -e "${YELLOW}[3/3] Восстановление MinIO...${NC}"

  # Использовать MinIO Client (mc) для восстановления
  docker run --rm \
    --network war_memory_network \
    -v "$TEMP_DIR/$MINIO_DIR:/backup" \
    -e MC_HOST_minio=http://minioadmin:minioadmin@minio:9000 \
    minio/mc:latest \
    mirror /backup minio/war-memory --overwrite

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ MinIO восстановлен${NC}"
  else
    echo -e "${RED}✗ Ошибка при восстановлении MinIO${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
  fi
else
  echo -e "${YELLOW}[3/3] Пропуск восстановления MinIO (не найдено в архиве)${NC}"
fi

# =====================================================
# Очистка
# =====================================================

rm -rf "$TEMP_DIR"

# =====================================================
# Завершение
# =====================================================

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Восстановление успешно завершено!${NC}"
echo -e "${GREEN}========================================${NC}"

exit 0
