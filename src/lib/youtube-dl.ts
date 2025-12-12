import YTDlpWrap from 'yt-dlp-wrap';
import { VideoInfo, VideoFormat } from '../types';
import * as path from 'path';
import * as fs from 'fs';

const ytDlpWrap = new YTDlpWrap();

export class YouTubeDownloader {
  private downloadsDir: string;

  constructor() {
    this.downloadsDir = path.join(process.cwd(), 'web', 'public', 'downloads');
    if (!fs.existsSync(this.downloadsDir)) {
      fs.mkdirSync(this.downloadsDir, { recursive: true });
    }
  }

  async getVideoInfo(url: string): Promise<VideoInfo> {
    try {
      const info = await ytDlpWrap.getVideoInfo(url);
      
      const formats = info.formats || [];
      
      // Отфильтруем видео форматы (с видео кодеком)
      const videoFormats: VideoFormat[] = formats
        .filter((f: any) => f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none')
        .map((f: any) => ({
          formatId: f.format_id,
          quality: f.format_note || f.height ? `${f.height}p` : 'unknown',
          ext: f.ext,
          filesize: f.filesize || f.filesize_approx,
          vcodec: f.vcodec,
          acodec: f.acodec,
          resolution: f.resolution,
          fps: f.fps,
          tbr: f.tbr,
        }))
        .sort((a: VideoFormat, b: VideoFormat) => {
          const aHeight = parseInt(a.quality) || 0;
          const bHeight = parseInt(b.quality) || 0;
          return bHeight - aHeight;
        });

      // Отфильтруем аудио форматы
      const audioFormats: VideoFormat[] = formats
        .filter((f: any) => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none'))
        .map((f: any) => ({
          formatId: f.format_id,
          quality: f.abr ? `${Math.round(f.abr)}kbps` : 'audio',
          ext: f.ext,
          filesize: f.filesize || f.filesize_approx,
          acodec: f.acodec,
          tbr: f.tbr,
        }))
        .sort((a: VideoFormat, b: VideoFormat) => {
          const aTbr = a.tbr || 0;
          const bTbr = b.tbr || 0;
          return bTbr - aTbr;
        });

      return {
        id: info.id,
        title: info.title,
        duration: info.duration,
        thumbnail: info.thumbnail,
        formats: formats,
        audioFormats: audioFormats.slice(0, 5), // Топ 5 аудио форматов
        videoFormats: videoFormats.slice(0, 10), // Топ 10 видео форматов
      };
    } catch (error) {
      throw new Error(`Не удалось получить информацию о видео: ${error}`);
    }
  }

  async downloadVideo(url: string, formatId: string, outputName: string): Promise<string> {
    const outputPath = path.join(this.downloadsDir, outputName);
    
    try {
      await ytDlpWrap.execPromise([
        url,
        '-f', formatId,
        '-o', outputPath,
        '--no-playlist',
      ]);
      
      return outputPath;
    } catch (error) {
      throw new Error(`Ошибка загрузки: ${error}`);
    }
  }

  async downloadBestQuality(url: string, type: 'video' | 'audio', outputName: string): Promise<string> {
    const outputPath = path.join(this.downloadsDir, outputName);
    
    try {
      const formatString = type === 'video' 
        ? 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
        : 'bestaudio[ext=m4a]/bestaudio';

      await ytDlpWrap.execPromise([
        url,
        '-f', formatString,
        '-o', outputPath,
        '--no-playlist',
        '--merge-output-format', 'mp4',
      ]);
      
      return outputPath;
    } catch (error) {
      throw new Error(`Ошибка загрузки: ${error}`);
    }
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return 'Неизвестно';
    const sizes = ['Байт', 'КБ', 'МБ', 'ГБ'];
    if (bytes === 0) return '0 Байт';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  cleanupFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Ошибка при удалении файла:', error);
    }
  }
}

export const youtubeDownloader = new YouTubeDownloader();