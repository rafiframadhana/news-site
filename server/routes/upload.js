import express from 'express';
import {
  upload,
  uploadImage,
  uploadMultipleImages,
  deleteCloudinaryImage,
  uploadFromUrl
} from '../controllers/uploadController.js';
import { authenticateToken, requireAuthor } from '../middleware/auth.js';

const router = express.Router();

// Upload routes (all use Cloudinary)
router.post('/image', authenticateToken, requireAuthor, upload.single('image'), uploadImage);
router.post('/images', authenticateToken, requireAuthor, upload.array('images', 10), uploadMultipleImages);
router.post('/from-url', authenticateToken, requireAuthor, uploadFromUrl);

// Delete routes (only Cloudinary)
router.delete('/image/:publicId', authenticateToken, requireAuthor, deleteCloudinaryImage);

export default router;
