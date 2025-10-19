#!/bin/bash
# =====================================================
# Книга Памяти Кавалерово - Скрипт бэкапа
# =====================================================
# Описание: Создание бэкапа PostgreSQL и MinIO
# Использование: ./scripts/backup.sh

set -e # Exit on error

# Переменные
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups"
DATE=$(date +%Y%m%d_%H%M%S)
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
ENV_FILE="$PROJECT_DIR/.env.production"

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Книга Памяти - Бэкап${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Создать директорию для бэкапов
mkdir -p "$BACKUP_DIR"

# =====================================================
# 1. Бэкап PostgreSQL
# =====================================================

echo -e "${YELLOW}[1/3] Создание бэкапа PostgreSQL...${NC}"

docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump -U postgres -Fc war_memory > "$BACKUP_DIR/db_$DATE.dump"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ PostgreSQL бэкап создан: db_$DATE.dump${NC}"
else
  echo -e "${RED}✗ Ошибка при создании бэкапа PostgreSQL${NC}"
  exit 1
fi

# =====================================================
# 2. Бэкап MinIO
# =====================================================

echo -e "${YELLOW}[2/3] Создание бэкапа MinIO...${NC}"

# Создать директорию для MinIO бэкапа
MINIO_BACKUP_DIR="$BACKUP_DIR/minio_$DATE"
mkdir -p "$MINIO_BACKUP_DIR"

# Использовать MinIO Client (mc) для зеркалирования бакета
docker run --rm \
  --network war_memory_network \
  -v "$MINIO_BACKUP_DIR:/backup" \
  -e MC_HOST_minio=http://minioadmin:minioadmin@minio:9000 \
  minio/mc:latest \
  mirror minio/war-memory /backup

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ MinIO бэкап создан: minio_$DATE/${NC}"
else
  echo -e "${RED}✗ Ошибка при создании бэкапа MinIO${NC}"
  exit 1
fi

# =====================================================
# 3. Архивирование и сжатие
# =====================================================

echo -e "${YELLOW}[3/3] Архивирование бэкапов...${NC}"

cd "$BACKUP_DIR"
tar -czf "backup_$DATE.tar.gz" "db_$DATE.dump" "minio_$DATE"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Архив создан: backup_$DATE.tar.gz${NC}"

  # Удалить несжатые файлы
  rm -f "db_$DATE.dump"
  rm -rf "minio_$DATE"

  BACKUP_SIZE=$(du -h "backup_$DATE.tar.gz" | cut -f1)
  echo -e "${GREEN}  Размер архива: $BACKUP_SIZE${NC}"
else
  echo -e "${RED}✗ Ошибка при архивировании${NC}"
  exit 1
fi

# =====================================================
# 4. Очистка старых бэкапов (старше 30 дней)
# =====================================================

echo -e "${YELLOW}Очистка старых бэкапов (>30 дней)...${NC}"

find "$BACKUP_DIR" -name "backup_*.tar.gz" -type f -mtime +30 -delete

OLD_BACKUPS_COUNT=$(find "$BACKUP_DIR" -name "backup_*.tar.gz" -type f | wc -l)
echo -e "${GREEN}✓ Осталось бэкапов: $OLD_BACKUPS_COUNT${NC}"

# =====================================================
# Завершение
# =====================================================

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Бэкап успешно завершен!${NC}"
echo -e "${GREEN}Файл: backup_$DATE.tar.gz${NC}"
echo -e "${GREEN}========================================${NC}"

exit 0
