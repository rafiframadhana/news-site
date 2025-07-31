import { useState, useRef } from 'react';
import { FiCamera, FiTrash2, FiSave, FiX, FiUpload, FiCrop } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { uploadService } from '../../services/uploadService';
import { SimpleLoader, Modal, Button } from './';

const AvatarEditModal = ({ isOpen, onClose, currentAvatar, onAvatarUpdate, userInitials = "U" }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentAvatar);
  const [selectedFile, setSelectedFile] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ aspect: 1, x: 0, y: 0, width: 100, height: 100 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  // Helper function to create cropped canvas
  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!crop || !ctx || !image) {
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return canvas;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview and show cropper
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImageUrl(e.target.result);
      setShowCropper(true);
      setSelectedFile(file);
      setHasChanges(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = () => {
    if (!completedCrop || !imgRef.current) {
      return;
    }

    const canvas = getCroppedImg(imgRef.current, completedCrop);
    if (canvas) {
      const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreviewUrl(croppedImageUrl);
      setShowCropper(false);
      
      // Convert canvas to blob for upload
      canvas.toBlob((blob) => {
        const croppedFile = new File([blob], selectedFile.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        setSelectedFile(croppedFile);
      }, 'image/jpeg', 0.9);
    }
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setOriginalImageUrl('');
    setSelectedFile(null);
    setHasChanges(false);
  };

  const handleRemoveAvatar = () => {
    setPreviewUrl('');
    setSelectedFile(null);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsUploading(true);
    try {
      let avatarUrl = '';
      let shouldDeleteOldImage = false;

      if (selectedFile) {
        // Upload new image
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        const result = await uploadService.uploadAvatar(formData);
        avatarUrl = result.imageUrl;
        shouldDeleteOldImage = true; // Delete old image when replacing
      } else if (!previewUrl) {
        // Remove avatar (null to explicitly remove)
        avatarUrl = null;
        shouldDeleteOldImage = true; // Delete old image when removing
      } else {
        // Keep existing avatar
        avatarUrl = currentAvatar;
      }

      // Delete old image from Cloudinary if we're replacing or removing it
      if (shouldDeleteOldImage && currentAvatar) {
        try {
          const publicId = uploadService.getPublicIdFromUrl(currentAvatar);
          if (publicId) {
            await uploadService.deleteImage(publicId);
          }
        } catch (deleteError) {
          // Don't fail the whole operation if old image deletion fails
          console.warn('Failed to delete old avatar image:', deleteError);
        }
      }

      onAvatarUpdate(avatarUrl);
      toast.success(selectedFile ? 'Avatar uploaded successfully!' : 'Avatar updated successfully!');
      onClose();
      setHasChanges(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(currentAvatar);
    setSelectedFile(null);
    setHasChanges(false);
    setShowCropper(false);
    setOriginalImageUrl('');
    setCrop({ aspect: 1, x: 0, y: 0, width: 100, height: 100 });
    setCompletedCrop(null);
    onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Edit Profile Photo" size="lg">
      <div className="p-6">
        {showCropper ? (
          /* Cropping Interface */
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-4">Crop Your Photo</h4>
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    src={originalImageUrl}
                    alt="Crop preview"
                    style={{ maxHeight: '400px', maxWidth: '100%' }}
                  />
                </ReactCrop>
              </div>
            </div>
            
            <div className="flex justify-center gap-3">
              <Button
                onClick={handleCancelCrop}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FiX className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={handleCropComplete}
                className="flex items-center gap-2"
              >
                <FiCrop className="w-4 h-4" />
                Apply Crop
              </Button>
            </div>
          </div>
        ) : (
          /* Normal Interface */
          <>
            {/* Avatar Preview */}
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center border-4 border-gray-200">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-semibold text-4xl">
                    {userInitials}
                  </span>
                )}
                
                {/* Loading Overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <SimpleLoader size="md" />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-6">
              <Button
                onClick={triggerFileInput}
                disabled={isUploading}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <FiUpload className="w-4 h-4" />
                Upload New Photo
              </Button>

              {previewUrl && (
                <Button
                  onClick={handleRemoveAvatar}
                  disabled={isUploading}
                  variant="outline"
                  className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Remove Photo
                </Button>
              )}
            </div>

            {/* File format info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Photo Guidelines</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Supported formats: JPEG, PNG, GIF, WebP</li>
                <li>• Maximum file size: 5MB</li>
                <li>• You can crop the image after selecting</li>
                <li>• Best results with face-centered photos</li>
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3">
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                <FiX className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isUploading || !hasChanges}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <SimpleLoader size="xs" />
                ) : (
                  <FiSave className="w-4 h-4" />
                )}
                Save Changes
              </Button>
            </div>
          </>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </Modal>
  );
};

export default AvatarEditModal;
