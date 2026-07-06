import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface MediaResult {
  id: string;
  url: string;
  thumbnail?: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
  duration?: number;
  originalName: string;
  size: number;
}

export class MediaService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.resolve(config.localStoragePath);
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async processFile(file: Express.Multer.File): Promise<MediaResult> {
    const id = uuidv4();
    const ext = path.extname(file.originalname);
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');

    if (isImage) {
      return this.processImage(file, id, ext);
    } else if (isVideo) {
      return this.processVideo(file, id, ext);
    }

    throw new Error('Unsupported file type');
  }

  private async processImage(
    file: Express.Multer.File,
    id: string,
    ext: string
  ): Promise<MediaResult> {
    const filename = `${id}${ext}`;
    const filepath = path.join(this.uploadsDir, filename);

    // Process with sharp - resize to max 1200px
    const metadata = await sharp(file.path)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toFile(filepath);

    // Create thumbnail
    const thumbFilename = `${id}_thumb${ext}`;
    const thumbPath = path.join(this.uploadsDir, thumbFilename);
    await sharp(file.path)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 70, progressive: true })
      .toFile(thumbPath);

    // Clean up original temp file
    fs.unlinkSync(file.path);

    logger.info('Image processed', { id, filename, size: metadata.size });

    return {
      id,
      url: `/uploads/${filename}`,
      thumbnail: `/uploads/${thumbFilename}`,
      type: 'image',
      width: metadata.width,
      height: metadata.height,
      originalName: file.originalname,
      size: metadata.size,
    };
  }

  private async processVideo(
    file: Express.Multer.File,
    id: string,
    ext: string
  ): Promise<MediaResult> {
    const filename = `${id}${ext}`;
    const filepath = path.join(this.uploadsDir, filename);

    // For videos, just move the file (in production, use ffmpeg for transcoding)
    fs.renameSync(file.path, filepath);

    const stats = fs.statSync(filepath);

    logger.info('Video uploaded', { id, filename, size: stats.size });

    return {
      id,
      url: `/uploads/${filename}`,
      type: 'video',
      originalName: file.originalname,
      size: stats.size,
    };
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(this.uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info('File deleted', { filename });
    }

    // Also delete thumbnail if exists
    const thumbPath = path.join(this.uploadsDir, filename.replace(/\.[^.]+$/, '_thumb$&'));
    if (fs.existsSync(thumbPath)) {
      fs.unlinkSync(thumbPath);
    }
  }

  async getFileInfo(filename: string) {
    const filePath = path.join(this.uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    const stats = fs.statSync(filePath);
    return {
      filename,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
    };
  }
}

export const mediaService = new MediaService();
