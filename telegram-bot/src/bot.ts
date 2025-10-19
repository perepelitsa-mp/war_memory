/**
 * =====================================================
 * Книга Памяти Кавалерово - Telegram Bot
 * =====================================================
 * Описание: Бот для отправки уведомлений пользователям
 */

import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import { startCommand } from './commands/start';
import { subscribeCommand } from './commands/subscribe';
import { processNotifications } from './handlers/notifications';

// Загрузить переменные окружения
dotenv.config();

// Проверка обязательных переменных
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN не указан');
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Supabase настройки не указаны');
}

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL не указан');
}

// Инициализация Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Инициализация PostgreSQL Pool
export const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Инициализация бота
const bot = new Telegraf(BOT_TOKEN);

// =====================================================
// Middleware для логирования
// =====================================================

bot.use(async (ctx, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] Incoming update:`, {
    updateId: ctx.update.update_id,
    from: ctx.from?.id,
    chat: ctx.chat?.id,
  });

  await next();

  const ms = Date.now() - start;
  console.log(`[${new Date().toISOString()}] Response time: ${ms}ms`);
});

// =====================================================
// Команды
// =====================================================

bot.command('start', startCommand);
bot.command('subscribe', subscribeCommand);

bot.command('help', (ctx) => {
  ctx.reply(
    '📖 *Книга Памяти Кавалерово* - Бот уведомлений\n\n' +
      'Доступные команды:\n' +
      '/start - Начать работу с ботом\n' +
      '/subscribe - Подписаться на уведомления\n' +
      '/unsubscribe - Отписаться от уведомлений\n' +
      '/help - Показать эту справку\n\n' +
      'Бот отправляет уведомления о:\n' +
      '• Модерации ваших карточек\n' +
      '• Новых воспоминаниях к вашим карточкам\n' +
      '• Новых событиях в таймлайне\n' +
      '• Новых комментариях',
    { parse_mode: 'Markdown' }
  );
});

bot.command('unsubscribe', async (ctx) => {
  try {
    const chatId = ctx.chat.id;

    // Удалить telegram_chat_id из пользователя
    const { error } = await supabase
      .from('users')
      .update({
        telegram_chat_id: null,
        notification_preferences: {
          email: true,
          telegram: false,
        },
      })
      .eq('telegram_chat_id', chatId);

    if (error) {
      console.error('Error unsubscribing:', error);
      ctx.reply('❌ Ошибка при отписке. Попробуйте позже.');
      return;
    }

    ctx.reply('✅ Вы успешно отписались от уведомлений в Telegram.');
  } catch (error) {
    console.error('Unsubscribe error:', error);
    ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
  }
});

// =====================================================
// Обработка текстовых сообщений
// =====================================================

bot.on(message('text'), (ctx) => {
  ctx.reply('Используйте /help для получения списка доступных команд.');
});

// =====================================================
// Обработка ошибок
// =====================================================

bot.catch((err, ctx) => {
  console.error('[Bot Error]', err);
  ctx.reply('❌ Произошла ошибка. Пожалуйста, попробуйте позже.');
});

// =====================================================
// Запуск бота
// =====================================================

async function main() {
  console.log('===========================================');
  console.log('Книга Памяти Кавалерово - Telegram Bot');
  console.log('===========================================');
  console.log('Starting bot...');

  // Проверить подключение к БД
  try {
    await pool.query('SELECT NOW()');
    console.log('✓ PostgreSQL connected');
  } catch (error) {
    console.error('✗ PostgreSQL connection error:', error);
    process.exit(1);
  }

  // Запустить бота
  await bot.launch();
  console.log('✓ Bot started successfully');

  // Запустить обработчик уведомлений (каждые 10 секунд)
  setInterval(async () => {
    try {
      await processNotifications(bot);
    } catch (error) {
      console.error('Error processing notifications:', error);
    }
  }, 10000);

  console.log('✓ Notification processor started');
  console.log('===========================================');
}

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('\nStopping bot...');
  bot.stop('SIGINT');
  pool.end();
  process.exit(0);
});

process.once('SIGTERM', () => {
  console.log('\nStopping bot...');
  bot.stop('SIGTERM');
  pool.end();
  process.exit(0);
});

// Запуск
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
