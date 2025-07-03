import axios from 'axios';

// Set the base URL for all API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get auth token
const getAuthToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
};

// Helper function to create auth headers
const getAuthHeaders = (additionalHeaders = {}) => {
  const token = getAuthToken();
  return {
    ...additionalHeaders,
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const uploadService = {
  // Upload single image file to Cloudinary
  uploadImage: async (formData) => {
    const response = await axios.post(`${API_BASE_URL}/api/upload/image`, formData, {
      headers: getAuthHeaders({
        'Content-Type': 'multipart/form-data'
      }),
    });
    return response.data;
  },

  // Upload multiple image files to Cloudinary
  uploadMultipleImages: async (formData) => {
    const response = await axios.post(`${API_BASE_URL}/api/upload/images`, formData, {
      headers: getAuthHeaders({
        'Content-Type': 'multipart/form-data'
      }),
    });
    return response.data;
  },

  // Upload image from URL to Cloudinary
  uploadFromUrl: async (imageUrl, folder = 'news-site/articles') => {
    const response = await axios.post(`${API_BASE_URL}/api/upload/from-url`, {
      imageUrl,
      folder
    }, {
      headers: getAuthHeaders({
        'Content-Type': 'application/json'
      })
    });
    return response.data;
  },

  // Delete image from Cloudinary
  deleteImage: async (publicId) => {
    const response = await axios.delete(`${API_BASE_URL}/api/upload/image/${encodeURIComponent(publicId)}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Validate image URL
  isValidImageUrl: (url) => {
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
    return urlPattern.test(url);
  },

  // Get Cloudinary public ID from URL
  getPublicIdFromUrl: (cloudinaryUrl) => {
    if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) {
      return null;
    }
    
    try {
      // Extract public ID from Cloudinary URL
      // Example: https://res.cloudinary.com/cloudname/image/upload/v1234567890/folder/image.jpg
      const urlParts = cloudinaryUrl.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      if (uploadIndex === -1) return null;
      
      // Get everything after upload/ excluding the version (v1234567890)
      let publicIdParts = urlParts.slice(uploadIndex + 1);
      if (publicIdParts[0] && publicIdParts[0].startsWith('v')) {
        publicIdParts = publicIdParts.slice(1); // Remove version
      }
      
      let publicId = publicIdParts.join('/');
      // Remove file extension
      const lastDotIndex = publicId.lastIndexOf('.');
      if (lastDotIndex > 0) {
        publicId = publicId.substring(0, lastDotIndex);
      }
      
      return publicId;
    } catch (error) {
      console.error('Error extracting public ID from Cloudinary URL:', error);
      return null;
    }
  }
};
