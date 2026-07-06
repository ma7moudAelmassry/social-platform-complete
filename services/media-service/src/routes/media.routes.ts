import { Router } from 'express';
import { upload } from '../middleware/upload';
import { mediaController } from '../controllers/media.controller';

const router = Router();

// Single file upload
router.post('/upload', upload.single('file'), mediaController.upload);

// Multiple files upload (max 4)
router.post('/upload-multiple', upload.array('files', 4), mediaController.uploadMultiple);

// File info
router.get('/:filename', mediaController.getFileInfo);

// Delete file
router.delete('/:filename', mediaController.deleteFile);

export default router;
