import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (required)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for temporary file storage (files will be uploaded to Cloudinary then deleted)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// @desc    Upload image to Cloudinary
// @route   POST /api/upload/image
// @access  Private (Author/Admin)
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'news-site/articles',
      transformation: [
        { width: 1200, height: 630, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
      resource_type: 'auto'
    });

    // Delete temporary file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Image uploaded successfully to Cloudinary',
      imageUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Clean up temporary file if there's an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: 'Error uploading image to Cloudinary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Upload failed'
    });
  }
};

// @desc    Upload multiple images to Cloudinary
// @route   POST /api/upload/images
// @access  Private (Author/Admin)
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedImages = [];
    const uploadPromises = [];

    for (const file of req.files) {
      const uploadPromise = cloudinary.uploader.upload(file.path, {
        folder: 'news-site/articles',
        transformation: [
          { width: 1200, height: 630, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ],
        resource_type: 'auto'
      }).then(result => {
        // Delete temporary file after successful upload
        fs.unlinkSync(file.path);
        
        return {
          imageUrl: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
          width: result.width,
          height: result.height,
          format: result.format
        };
      }).catch(uploadError => {
        console.error('Error uploading file:', file.originalname, uploadError);
        
        // Clean up temporary file if upload fails
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
        return null; // Return null for failed uploads
      });

      uploadPromises.push(uploadPromise);
    }

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
    
    // Filter out failed uploads (null values)
    const successfulUploads = results.filter(result => result !== null);

    if (successfulUploads.length === 0) {
      return res.status(500).json({ message: 'Failed to upload any images to Cloudinary' });
    }

    res.json({
      message: `Successfully uploaded ${successfulUploads.length} out of ${req.files.length} images to Cloudinary`,
      images: successfulUploads
    });
  } catch (error) {
    console.error('Multiple image upload error:', error);
    
    // Clean up temporary files if there's an error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      message: 'Error uploading images to Cloudinary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Upload failed'
    });
  }
};

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/image/:publicId
// @access  Private (Author/Admin)
const deleteCloudinaryImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ message: 'Public ID is required' });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({ 
        message: 'Image deleted successfully from Cloudinary',
        publicId: publicId
      });
    } else if (result.result === 'not found') {
      res.status(404).json({ message: 'Image not found in Cloudinary' });
    } else {
      res.status(400).json({ 
        message: 'Failed to delete image from Cloudinary',
        result: result
      });
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({
      message: 'Error deleting image from Cloudinary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Delete failed'
    });
  }
};

// @desc    Upload image from URL to Cloudinary
// @route   POST /api/upload/from-url
// @access  Private (Author/Admin)
const uploadFromUrl = async (req, res) => {
  try {
    const { imageUrl, folder = 'news-site/articles' } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    // Validate URL format
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
    if (!urlPattern.test(imageUrl)) {
      return res.status(400).json({ message: 'Invalid image URL. Must be a direct link to an image file.' });
    }

    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: folder,
      transformation: [
        { width: 1200, height: 630, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
      resource_type: 'auto'
    });

    res.json({
      message: 'Image uploaded successfully from URL to Cloudinary',
      imageUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      originalUrl: imageUrl
    });
  } catch (error) {
    console.error('Cloudinary URL upload error:', error);
    res.status(500).json({
      message: 'Error uploading image from URL to Cloudinary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Upload failed'
    });
  }
};

export {
  upload,
  uploadImage,
  uploadMultipleImages,
  deleteCloudinaryImage,
  uploadFromUrl
};
