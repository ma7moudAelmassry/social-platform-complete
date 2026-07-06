import { Request, Response, NextFunction } from 'express';
import { mediaService } from '../services/media.service';
import { logger } from '../utils/logger';

export class MediaController {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided',
        });
      }

      const result = await mediaService.processFile(req.file);

      res.status(201).json({
        success: true,
        data: result,
        message: 'File uploaded successfully',
      });
    } catch (error) {
      // Clean up temp file on error
      if (req.file && req.file.path) {
        const fs = await import('fs');
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }
      next(error);
    }
  }

  async uploadMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files provided',
        });
      }

      const results = await Promise.all(
        req.files.map((file) => mediaService.processFile(file))
      );

      res.status(201).json({
        success: true,
        data: results,
        message: 'Files uploaded successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename } = req.params;
      await mediaService.deleteFile(filename);

      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getFileInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename } = req.params;
      const info = await mediaService.getFileInfo(filename);

      res.json({
        success: true,
        data: info,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const mediaController = new MediaController();
