export interface VideoFormat {
  formatId: string;
  quality: string;
  ext: string;
  filesize?: number;
  vcodec?: string;
  acodec?: string;
  resolution?: string;
  fps?: number;
  tbr?: number;
}

export interface VideoInfo {
  id: string;
  title: string;
  duration: number;
  thumbnail?: string;
  formats: VideoFormat[];
  audioFormats: VideoFormat[];
  videoFormats: VideoFormat[];
}

export interface DownloadSession {
  videoUrl: string;
  videoInfo?: VideoInfo;
  selectedType?: 'video' | 'audio';
  selectedFormat?: VideoFormat;
}