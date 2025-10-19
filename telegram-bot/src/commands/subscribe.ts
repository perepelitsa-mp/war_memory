/**
 * =====================================================
 * Команда /subscribe
 * =====================================================
 */

import { Context } from 'telegraf';
import { supabase } from '../bot';

export async function subscribeCommand(ctx: Context) {
  // Проверить формат команды
  const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
  const parts = text.split(' ');

  if (parts.length < 2) {
    await ctx.reply(
      '❌ Неверный формат команды.\n\n' +
        'Используйте: /subscribe <ваш email>\n\n' +
        'Например:\n' +
        '`/subscribe ivan@example.com`',
      { parse_mode: 'Markdown' }
    );
    return;
  }

  const email = parts[1].trim().toLowerCase();
  const chatId = ctx.chat?.id;

  if (!chatId) {
    await ctx.reply('❌ Не удалось получить ID чата.');
    return;
  }

  // Валидация email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    await ctx.reply('❌ Неверный формат email. Попробуйте снова.');
    return;
  }

  try {
    // Найти пользователя по email
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, full_name, telegram_chat_id')
      .eq('email', email)
      .eq('is_deleted', false)
      .single();

    if (fetchError || !user) {
      await ctx.reply(
        '❌ Пользователь с таким email не найден.\n\n' +
          'Убедитесь, что вы зарегистрированы на сайте и используете правильный email.'
      );
      return;
    }

    // Проверить, не привязан ли уже к другому Telegram аккаунту
    if (user.telegram_chat_id && user.telegram_chat_id !== chatId) {
      await ctx.reply(
        '⚠️ Этот email уже привязан к другому Telegram аккаунту.\n\n' +
          'Если это ваш аккаунт, сначала отвяжите его, используя /unsubscribe в предыдущем боте.'
      );
      return;
    }

    // Обновить telegram_chat_id и включить уведомления
    const { error: updateError } = await supabase
      .from('users')
      .update({
        telegram_chat_id: chatId,
        telegram_username: ctx.from?.username || null,
        notification_preferences: {
          email: true,
          telegram: true,
        },
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user:', updateError);
      await ctx.reply('❌ Ошибка при обновлении данных. Попробуйте позже.');
      return;
    }

    // Успех
    await ctx.reply(
      `✅ *Подписка успешно оформлена!*\n\n` +
        `Привет, ${user.full_name}! Вы подписаны на уведомления в Telegram.\n\n` +
        `Теперь все важные уведомления будут приходить в этот чат.\n\n` +
        `Чтобы отписаться, используйте /unsubscribe`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Subscribe command error:', error);
    await ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
  }
}
