/**
 * =====================================================
 * Обработчик отправки уведомлений
 * =====================================================
 */

import { Telegraf } from 'telegraf';
import { pool } from '../bot';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  channel: string;
  status: string;
  created_at: string;
  telegram_chat_id: number | null;
}

/**
 * Обработать очередь уведомлений
 */
export async function processNotifications(bot: Telegraf) {
  const client = await pool.connect();

  try {
    // Получить pending Telegram уведомления
    const query = `
      SELECT
        n.id,
        n.user_id,
        n.type,
        n.title,
        n.message,
        n.entity_type,
        n.entity_id,
        n.channel,
        n.status,
        n.created_at,
        u.telegram_chat_id
      FROM notifications n
      JOIN users u ON n.user_id = u.id
      WHERE n.status = 'pending'
        AND n.channel = 'telegram'
        AND u.telegram_chat_id IS NOT NULL
        AND NOT u.is_deleted
      ORDER BY n.created_at ASC
      LIMIT 10
    `;

    const result = await client.query<Notification>(query);
    const notifications = result.rows;

    if (notifications.length === 0) {
      return; // Нет уведомлений
    }

    console.log(`Processing ${notifications.length} Telegram notifications...`);

    for (const notification of notifications) {
      try {
        await sendNotification(bot, notification);

        // Обновить статус на 'sent'
        await client.query(
          `UPDATE notifications
           SET status = 'sent', sent_at = NOW()
           WHERE id = $1`,
          [notification.id]
        );

        console.log(`✓ Notification ${notification.id} sent to chat ${notification.telegram_chat_id}`);
      } catch (error) {
        console.error(`✗ Error sending notification ${notification.id}:`, error);

        // Обновить статус на 'failed' с ошибкой
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        await client.query(
          `UPDATE notifications
           SET status = 'failed', error_message = $1
           WHERE id = $2`,
          [errorMessage, notification.id]
        );
      }
    }
  } finally {
    client.release();
  }
}

/**
 * Отправить уведомление в Telegram
 */
async function sendNotification(bot: Telegraf, notification: Notification) {
  if (!notification.telegram_chat_id) {
    throw new Error('No telegram_chat_id');
  }

  // Сформировать сообщение с эмодзи
  const emoji = getEmojiForType(notification.type);
  const message = `${emoji} *${notification.title}*\n\n${notification.message}`;

  // Отправить сообщение
  await bot.telegram.sendMessage(notification.telegram_chat_id, message, {
    parse_mode: 'Markdown',
  });
}

/**
 * Получить эмодзи для типа уведомления
 */
function getEmojiForType(type: string): string {
  const emojiMap: Record<string, string> = {
    moderation_pending: '⏳',
    moderation_approved: '✅',
    moderation_rejected: '❌',
    new_memory: '📝',
    new_timeline: '📅',
    new_comment: '💬',
    editor_invited: '👥',
    reminder_moderation: '⏰',
  };

  return emojiMap[type] || '📢';
}
