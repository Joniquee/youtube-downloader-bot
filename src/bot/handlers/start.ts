import { Context } from 'telegraf';
import { prisma } from '../../lib/prisma';

export async function handleStart(ctx: Context) {
  const telegramId = ctx.from?.id.toString();
  const username = ctx.from?.username;
  const firstName = ctx.from?.first_name;
  const lastName = ctx.from?.last_name;

  if (!telegramId) return;

  // Создаем или обновляем пользователя в базе данных
  await prisma.user.upsert({
    where: { telegramId },
    update: {
      username,
      firstName,
      lastName,
    },
    create: {
      telegramId,
      username,
      firstName,
      lastName,
    },
  });

  const welcomeMessage = 
    `👋 Привет, ${firstName || 'друг'}!\n\n` +
    `Я бот для скачивания видео с YouTube.\n\n` +
    `📝 <b>Как использовать:</b>\n` +
    `1. Отправьте мне ссылку на YouTube видео\n` +
    `2. Выберите тип загрузки (видео или аудио)\n` +
    `3. Выберите желаемое качество\n` +
    `4. Получите файл!\n\n` +
    `🔗 Поддерживаемые форматы ссылок:\n` +
    `• youtube.com/watch?v=...\n` +
    `• youtu.be/...\n` +
    `• youtube.com/embed/...\n\n` +
    `💡 Просто отправьте ссылку, чтобы начать!`;

  await ctx.replyWithHTML(welcomeMessage);
}

export async function handleHelp(ctx: Context) {
  const helpMessage =
    `❓ <b>Помощь</b>\n\n` +
    `<b>Команды:</b>\n` +
    `/start - Начать работу с ботом\n` +
    `/help - Показать это сообщение\n` +
    `/stats - Ваша статистика загрузок\n\n` +
    `<b>Как скачать видео:</b>\n` +
    `1. Отправьте ссылку на YouTube видео\n` +
    `2. Выберите видео или аудио\n` +
    `3. Выберите качество\n` +
    `4. Дождитесь загрузки\n\n` +
    `<b>Ограничения:</b>\n` +
    `• Максимальный размер файла: 50 МБ (ограничение Telegram)\n` +
    `• Для больших файлов используйте аудио формат\n\n` +
    `По вопросам обращайтесь к администратору.`;

  await ctx.replyWithHTML(helpMessage);
}