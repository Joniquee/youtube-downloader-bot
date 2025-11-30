import { VideoInfo } from '../../types';
import { formatDuration } from './format';
import { youtubeDownloader } from '../../lib/youtube-dl';

export function createVideoInfoMessage(info: VideoInfo): string {
  return `📹 <b>${info.title}</b>\n\n` +
    `⏱ Длительность: ${formatDuration(info.duration)}\n` +
    `🎬 Доступно форматов:\n` +
    `• Видео: ${info.videoFormats.length}\n` +
    `• Аудио: ${info.audioFormats.length}\n\n` +
    `Выберите тип загрузки:`;
}

export function createFormatSelectionMessage(info: VideoInfo, type: 'video' | 'audio'): string {
  const formats = type === 'video' ? info.videoFormats : info.audioFormats;
  
  let message = `📹 <b>${info.title}</b>\n\n`;
  message += type === 'video' ? '🎬 Доступные видео форматы:\n\n' : '🎵 Доступные аудио форматы:\n\n';
  
  formats.slice(0, 8).forEach((format, index) => {
    const size = youtubeDownloader.formatFileSize(format.filesize);
    const quality = format.quality;
    const ext = format.ext;
    
    message += `${index + 1}. ${quality} (${ext}) - ${size}\n`;
  });
  
  message += '\nВыберите желаемое качество:';
  
  return message;
}