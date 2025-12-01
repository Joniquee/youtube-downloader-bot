import { Context } from 'telegraf';
import { isValidYouTubeUrl } from '../utils/format';
import { youtubeDownloader } from '../../lib/youtube-dl';
import { createVideoInfoMessage, createFormatSelectionMessage } from '../utils/youtube';
import { prisma } from '../../lib/prisma';
import { DownloadSession } from '../../types';
import { telegramStorage } from '../../lib/telegram-storage';
import * as fs from 'fs';

// Храним сессии пользователей в памяти
const userSessions = new Map<number, DownloadSession>();

export async function handleMessage(ctx: Context) {
  if (!ctx.message || !('text' in ctx.message)) return;
  
  const text = ctx.message.text;
  const userId = ctx.from?.id;

  if (!userId) return;

  // Проверяем, является ли сообщение YouTube ссылкой
  if (isValidYouTubeUrl(text)) {
    await handleYouTubeUrl(ctx, text, userId);
  }
}

async function handleYouTubeUrl(ctx: Context, url: string, userId: number) {
  const processingMsg = await ctx.reply('⏳ Получаю информацию о видео...');

  try {
    const videoInfo = await youtubeDownloader.getVideoInfo(url);

    // Сохраняем сессию пользователя
    userSessions.set(userId, {
      videoUrl: url,
      videoInfo,
    });

    // Создаем записи базе данных
    const user = await prisma.user.findUnique({
      where: { telegramId: userId.toString() },
    });

    if (user) {
      await prisma.download.create({
        data: {
          userId: user.id,
          videoUrl: url,
          videoTitle: videoInfo.title,
          format: 'pending',
          quality: 'pending',
          status: 'pending',
        },
      });
    }

    // Удаляем сообщение о загрузке
    await ctx.telegram.deleteMessage(ctx.chat!.id, processingMsg.message_id);

    // Отправляем информацию о видео с кнопками выбора
    await ctx.replyWithHTML(createVideoInfoMessage(videoInfo), {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🎬 Видео', callback_data: 'type_video' },
            { text: '🎵 Аудио', callback_data: 'type_audio' },
          ],
          [
            { text: '❌ Отмена', callback_data: 'cancel' },
          ],
        ],
      },
    });
  } catch (error) {
    await ctx.telegram.deleteMessage(ctx.chat!.id, processingMsg.message_id);
    await ctx.reply('❌ Ошибка при получении информации о видео. Проверьте ссылку и попробуйте снова.');
    console.error('Error fetching video info:', error);
  }
}

export async function handleTypeSelection(ctx: Context) {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
  
  const userId = ctx.from?.id;
  if (!userId) return;

  const data = ctx.callbackQuery.data;
  const session = userSessions.get(userId);

  if (!session || !session.videoInfo) {
    await ctx.answerCbQuery('❌ Сессия истекла. Отправьте ссылку снова.');
    return;
  }

  if (data === 'cancel') {
    userSessions.delete(userId);
    await ctx.answerCbQuery('Отменено');
    await ctx.editMessageText('❌ Загрузка отменена.');
    return;
  }

  const type = data.replace('type_', '') as 'video' | 'audio';
  session.selectedType = type;

  const formats = type === 'video' ? session.videoInfo.videoFormats : session.videoInfo.audioFormats;

  if (formats.length === 0) {
    await ctx.answerCbQuery('❌ Нет доступных форматов');
    return;
  }

  // Создаем кнопки для выбора качества
  const buttons = formats.slice(0, 8).map((format, index) => {
    const size = youtubeDownloader.formatFileSize(format.filesize);
    return [{
      text: `${format.quality} (${format.ext}) - ${size}`,
      callback_data: `quality_${index}`,
    }];
  });

  buttons.push([{ text: '⬅️ Назад', callback_data: 'back_to_type' }]);
  buttons.push([{ text: '❌ Отмена', callback_data: 'cancel' }]);

  await ctx.editMessageText(
    createFormatSelectionMessage(session.videoInfo, type),
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: buttons,
      },
    }
  );

  await ctx.answerCbQuery();
}

export async function handleQualitySelection(ctx: Context) {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
  
  const userId = ctx.from?.id;
  if (!userId) return;

  const data = ctx.callbackQuery.data;
  
  if (data === 'back_to_type') {
    const session = userSessions.get(userId);
    if (!session || !session.videoInfo) {
      await ctx.answerCbQuery('❌ Сессия истекла');
      return;
    }

    await ctx.editMessageText(createVideoInfoMessage(session.videoInfo), {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🎬 Видео', callback_data: 'type_video' },
            { text: '🎵 Аудио', callback_data: 'type_audio' },
          ],
          [
            { text: '❌ Отмена', callback_data: 'cancel' },
          ],
        ],
      },
    });
    await ctx.answerCbQuery();
    return;
  }

  const qualityIndex = parseInt(data.replace('quality_', ''));
  const session = userSessions.get(userId);

  if (!session || !session.videoInfo || !session.selectedType) {
    await ctx.answerCbQuery('❌ Сессия истекла. Отправьте ссылку снова.');
    return;
  }

  const formats = session.selectedType === 'video' 
    ? session.videoInfo.videoFormats 
    : session.videoInfo.audioFormats;

  const selectedFormat = formats[qualityIndex];

  if (!selectedFormat) {
    await ctx.answerCbQuery('❌ Неверный выбор');
    return;
  }

  session.selectedFormat = selectedFormat;

  await ctx.answerCbQuery('⏳ Загрузка запущена...');
  await ctx.editMessageText('⏳ Файл загружается. Это может занять некоторое время...');
  // Начинаем загрузку
  downloadAndSend(ctx, session, userId).catch(err => {
    console.error('Ошибка при загрузке:', err);
  });
}

async function downloadAndSend(ctx: Context, session: DownloadSession, userId: number) {
  if (!session.videoInfo || !session.selectedFormat || !session.selectedType) return;

  const outputName = `${session.videoInfo.id}_${Date.now()}.${session.selectedFormat.ext}`;

  try {
    const user = await prisma.user.findUnique({ where: { telegramId: userId.toString() } });
    if (!user) return;

    const download = await prisma.download.findFirst({
      where: { userId: user.id, videoUrl: session.videoUrl, status: 'pending' },
      orderBy: { createdAt: 'desc' },
    });

    if (download) {
      await prisma.download.update({
        where: { id: download.id },
        data: {
          status: 'processing',
          format: session.selectedType,
          quality: session.selectedFormat.quality,
          fileSize: session.selectedFormat.filesize,
        },
      });
    }

    const filePath = await youtubeDownloader.downloadVideo(session.videoUrl, session.selectedFormat.formatId, outputName);

    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);

    let fileId: {
      fileId: string;
      fileSize: number;
    }
    if (session.selectedType === 'video') {
      fileId = await telegramStorage.uploadVideo(ctx, filePath, `${session.videoInfo.title}`, `${session.selectedFormat.quality}`);
      await telegramStorage.sendVideoToUser(ctx, userId, fileId.fileId, `${session.videoInfo.title}\n${session.selectedFormat.quality}`);
    } else {
      fileId = await telegramStorage.uploadAudio(ctx, filePath, `${session.videoInfo.title}`, `${session.selectedFormat.quality}`);
      await telegramStorage.sendAudioToUser(ctx, userId, fileId.fileId, `${session.videoInfo.title}\n${session.selectedFormat.quality}`, `${session.videoInfo.title}`);
    }

    if (download) {
      await prisma.download.update({ where: { id: download.id }, data: { status: 'completed', completedAt: new Date() } });
    }

    try { await ctx.deleteMessage(); } catch {}

    youtubeDownloader.cleanupFile(filePath);
    userSessions.delete(userId);
  } catch (error) {
    await ctx.editMessageText('❌ Ошибка при загрузке файла.');
    console.error('Download error:', error);
  }
}

export async function handleStats(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const user = await prisma.user.findUnique({
    where: { telegramId: userId.toString() },
    include: {
      downloads: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!user) {
    await ctx.reply('❌ Пользователь не найден');
    return;
  }

  const totalDownloads = user.downloads.length;
  const completedDownloads = user.downloads.filter(d => d.status === 'completed').length;
  const failedDownloads = user.downloads.filter(d => d.status === 'failed').length;

  let message = `📊 <b>Ваша статистика</b>\n\n`;
  message += `✅ Успешных загрузок: ${completedDownloads}\n`;
  message += `❌ Неудачных: ${failedDownloads}\n`;
  message += `📦 Всего попыток: ${totalDownloads}\n\n`;

  if (user.downloads.length > 0) {
    message += `<b>Последние загрузки:</b>\n\n`;
    user.downloads.slice(0, 5).forEach((download, index) => {
      const status = download.status === 'completed' ? '✅' : 
                    download.status === 'failed' ? '❌' : '⏳';
      message += `${index + 1}. ${status} ${download.videoTitle || 'Без названия'}\n`;
      message += `   ${download.format} (${download.quality})\n\n`;
    });
  }

  await ctx.replyWithHTML(message);
}