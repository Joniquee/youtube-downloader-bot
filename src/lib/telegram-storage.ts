import { Telegraf , Context} from 'telegraf';
import * as fs from 'fs';

export class TelegramStorage {
  private channelId: string;

  constructor() {
    this.channelId = process.env.STORAGE_ID || '';
    
    if (!this.channelId) {
      throw new Error('STORAGE_CHANNEL_ID не установлен в .env файле');
    }
  }

  /**
   * Загружает видео файл в канал и возвращает file_id
   */
  async uploadVideo(
    ctx: Context,
    filePath: string,
    title: string,
    quality: string
  ): Promise<{ fileId: string; fileSize: number }> {
    try {
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;
      const fileSizeInMB = fileSize / (1024 * 1024);

      console.log(`📤 Загрузка видео в канал: ${title} (${fileSizeInMB.toFixed(2)} МБ)`);

      // Проверяем размер файла
      if (fileSize > 2 * 1024 * 1024 * 1024) {
        throw new Error('Файл слишком большой (максимум 2 ГБ для Telegram)');
      }

      const caption = 
        `🎬 ${title}\n` +
        `📦 Качество: ${quality}\n` +
        `💾 Размер: ${fileSizeInMB.toFixed(2)} МБ\n` +
        `⏰ Загружено: ${new Date().toLocaleString('ru-RU')}`;

      // Загружаем видео в канал
      const message = await ctx.telegram.sendVideo(
        this.channelId,
        { source: filePath },
        { 
          caption,
          supports_streaming: true,
        }
      );

      if (!message.video) {
        throw new Error('Не удалось получить информацию о видео');
      }

      console.log(`✅ Видео загружено в канал, file_id: ${message.video.file_id}`);

      return {
        fileId: message.video.file_id,
        fileSize: fileSize,
      };
    } catch (error) {
      console.error('❌ Ошибка при загрузке видео в канал:', error);
      throw new Error(`Не удалось загрузить видео в канал: ${error}`);
    }
  }

  /**
   * Загружает аудио файл в канал и возвращает file_id
   */
  async uploadAudio(
    ctx: Context,
    filePath: string,
    title: string,
    quality: string
  ): Promise<{ fileId: string; fileSize: number }> {
    try {
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;
      const fileSizeInMB = fileSize / (1024 * 1024);

      console.log(`📤 Загрузка аудио в канал: ${title} (${fileSizeInMB.toFixed(2)} МБ)`);

      if (fileSize > 2 * 1024 * 1024 * 1024) {
        throw new Error('Файл слишком большой (максимум 2 ГБ для Telegram)');
      }

      const caption = 
        `🎵 ${title}\n` +
        `📦 Качество: ${quality}\n` +
        `💾 Размер: ${fileSizeInMB.toFixed(2)} МБ\n` +
        `⏰ Загружено: ${new Date().toLocaleString('ru-RU')}`;

      // Загружаем аудио в канал
      const message = await ctx.telegram.sendAudio(
        this.channelId,
        { source: filePath },
        { 
          caption,
          title: title,
        }
      );

      if (!message.audio) {
        throw new Error('Не удалось получить информацию об аудио');
      }

      console.log(`✅ Аудио загружено в канал, file_id: ${message.audio.file_id}`);

      return {
        fileId: message.audio.file_id,
        fileSize: fileSize,
      };
    } catch (error) {
      console.error('❌ Ошибка при загрузке аудио в канал:', error);
      throw new Error(`Не удалось загрузить аудио в канал: ${error}`);
    }
  }

  /**
   * Отправляет видео пользователю по file_id
   */
  async sendVideoToUser(
    ctx: Context,
    userId: number,
    fileId: string,
    caption: string
  ): Promise<void> {
    try {
      console.log(`📨 Отправка видео пользователю ${userId}`);

      await ctx.telegram.sendVideo(
        userId,
        fileId,
        { 
          caption,
          supports_streaming: true,
        }
      );

      console.log(`✅ Видео отправлено пользователю ${userId}`);
    } catch (error) {
      console.error('❌ Ошибка при отправке видео пользователю:', error);
      throw new Error(`Не удалось отправить видео: ${error}`);
    }
  }

  /**
   * Отправляет аудио пользователю по file_id
   */
  async sendAudioToUser(
    ctx: Context,
    userId: number,
    fileId: string,
    caption: string,
    title: string
  ): Promise<void> {
    try {
      console.log(`📨 Отправка аудио пользователю ${userId}`);

      await ctx.telegram.sendAudio(
        userId,
        fileId,
        { 
          caption,
          title,
        }
      );

      console.log(`✅ Аудио отправлено пользователю ${userId}`);
    } catch (error) {
      console.error('❌ Ошибка при отправке аудио пользователю:', error);
      throw new Error(`Не удалось отправить аудио: ${error}`);
    }
  }

  /**
   * Проверяет доступность канала
   */
  async checkChannelAccess(bot: Telegraf): Promise<boolean> {
    try {
      const chat = await bot.telegram.getChat(this.channelId);
      console.log(`✅ Доступ к каналу подтвержден: ${chat.type}`);
      return true;
    } catch (error) {
      console.error('❌ Нет доступа к каналу:', error);
      return false;
    }
  }

  /**
   * Форматирует размер файла
   */
  formatFileSize(bytes: number): string {
    const sizes = ['Байт', 'КБ', 'МБ', 'ГБ'];
    if (bytes === 0) return '0 Байт';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export const telegramStorage = new TelegramStorage();