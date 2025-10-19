# =====================================================
# Книга Памяти Кавалерово - Telegram Bot Dockerfile
# =====================================================

FROM node:18-alpine

# Установить зависимости для pg (native)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Копировать package files
COPY package*.json ./
COPY tsconfig.json ./

# Установить зависимости
RUN npm ci --only=production

# Копировать исходный код
COPY src ./src

# Собрать TypeScript
RUN npm run build

# Очистить dev зависимости
RUN npm prune --production

# Запустить бот
CMD ["node", "dist/bot.js"]
