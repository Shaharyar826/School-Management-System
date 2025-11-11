import { useState, useRef, useEffect, useContext } from 'react';
import { FiUpload, FiImage, FiCheckCircle, FiAlertTriangle, FiX } from 'react-icons/fi';
import axios from '../../config/axios';
import AuthContext from '../../context/AuthContext';

const ImageUpload = ({
  onImageSelect,
  initialImage = null,
  acceptedFileTypes = 'image/jpeg, image/png, image/gif',
  maxSize = 5 * 1024 * 1024, // 5MB
  label = 'Upload Profile Picture',
  required = false,
  validateForm = false,
  imageType = 'profile',
  onDelete = null,
  id = 'image-upload', // Added for accessibility
  autoUpload = true, // New prop to control auto-upload
  targetUserId = null // New prop for admin uploading for other users
}) => {
  const { updateUserData } = useContext(AuthContext);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [publicId, setPublicId] = useState(null);
  const fileInputRef = useRef(null);

  // Set initial image if provided
  useEffect(() => {
    if (initialImage) {
      setPreviewUrl(initialImage);
    }
  }, [initialImage]);

  // Show validation error if form is being validated and image is required but not selected
  useEffect(() => {
    if (validateForm && required && !previewUrl && !image) {
      setError('Profile picture is required');
    }
  }, [validateForm, required, previewUrl, image]);

  // Reset upload state when component unmounts or when new upload starts
  useEffect(() => {
    return () => {
      setUploadProgress(0);
      setUploadComplete(false);
    };
  }, []);

  const optimizeImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate new dimensions (max 800px)
          let width = img.width;
          let height = img.height;
          const maxSize = 800;

          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw image with white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with quality 0.8
          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              }));
            },
            'image/jpeg',
            0.8
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = async (selectedFile) => {
    setError('');
    setUploadComplete(false);
    setUploadProgress(0);

    if (!selectedFile) {
      if (required) {
        setError('Profile picture is required');
      }
      return;
    }

    // Check file type
    const isValidType = acceptedFileTypes.split(', ').includes(selectedFile.type);

    if (!isValidType) {
      setError(`Invalid file type. Please upload an image file (${acceptedFileTypes}).`);
      return;
    }

    // Check file size
    if (selectedFile.size > maxSize) {
      setError(`File size exceeds the limit of ${maxSize / (1024 * 1024)}MB.`);
      return;
    }

    try {
      // Only optimize if file is larger than 1MB
      let fileToUpload = selectedFile;
      if (selectedFile.size > 1024 * 1024) {
        fileToUpload = await optimizeImage(selectedFile);
      }
      setImage(fileToUpload);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);

        // Call onImageSelect after the preview URL is ready
        if (!autoUpload && onImageSelect) {
          setUploadComplete(true);
          onImageSelect(reader.result, null, fileToUpload);
        }
      };
      reader.readAsDataURL(fileToUpload);

      // Automatically upload the image when selected (if autoUpload is enabled)
      if (autoUpload) {
        await uploadImage(fileToUpload);
      }
    } catch (err) {
      console.error('Error optimizing image:', err);
      setError('Failed to process image. Please try again.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = async (e) => {
    e.stopPropagation();

    try {
      if (publicId) {
        // Delete from Cloudinary
        await axios.delete(`/api/upload/image/${publicId}`);
      }

      setImage(null);
      setPreviewUrl(null);
      setPublicId(null);
      setUploadProgress(0);
      setUploadComplete(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onImageSelect) {
        onImageSelect(null);
      }

      if (onDelete) {
        onDelete();
      }

      // Update user data if it's a profile image
      if (imageType === 'profile') {
        await updateUserData();
      }
    } catch (err) {
      console.error('Error removing image:', err);
      setError('Failed to remove image. Please try again.');
    }
  };

  const uploadImage = async (fileToUpload) => {
    const fileToUse = fileToUpload || image;
    if (!fileToUse) {
      if (required) {
        setError('Profile picture is required');
      }
      return false;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);
    setUploadComplete(false);

    try {
      const formData = new FormData();
      // IMPORTANT: For profile images, always use /api/profile-image/upload/:userId if uploading for another user (admin, principal, etc.)
      // If targetUserId is provided, use the admin endpoint. Otherwise, use the current user endpoint.
      let endpoint = `/api/upload/image/${imageType}`;
      let fieldName = 'image';
      if (imageType === 'profile') {
        // Use admin endpoint if targetUserId is provided
        if (targetUserId) {
          endpoint = `/api/profile-image/upload/${targetUserId}`;
        } else {
          endpoint = '/api/profile-image/upload';
        }
        fieldName = 'profileImage';
      }
      formData.append(fieldName, fileToUse);

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (response.data.success) {
        // Support both response shapes
        const data = response.data.data || response.data;
        const url = data.url || data.profileImage?.url;
        const public_id = data.public_id || data.profileImage?.metadata?.publicId;
        const metadata = data.metadata || data.profileImage?.metadata;

        setPublicId(public_id);
        if (onImageSelect) {
          onImageSelect(url, { public_id, ...metadata }, fileToUse);
        }
        setPreviewUrl(url);
        setUploadComplete(true);
        setError('');
      } else {
        throw new Error(response.data.message || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload image. Please try again.');
      setUploadComplete(false);
    }
    setIsUploading(false);
  };

  return (
    <div className="mt-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      <div
        id={id}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : previewUrl
              ? 'border-green-500 bg-green-50'
              : error
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{ minHeight: '200px' }}
        role="button"
        tabIndex={0}
        aria-label={`${label} upload area`}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedFileTypes}
          className="hidden"
          aria-hidden="true"
        />

        {previewUrl ? (
          <div className="relative flex flex-col items-center">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-full border-2 border-green-500"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                aria-label="Remove image"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            {isUploading ? (
              <div className="mt-2 w-full max-w-xs">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        Uploading...
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {uploadProgress}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div
                      style={{ width: `${uploadProgress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                    ></div>
                  </div>
                </div>
              </div>
            ) : uploadComplete ? (
              <div className="mt-2 flex items-center text-green-600">
                <FiCheckCircle className="w-4 h-4 mr-1" />
                <p className="text-sm font-medium">
                  {autoUpload ? 'Image uploaded successfully' : 'Image ready to upload'}
                </p>
              </div>
            ) : null}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center">
            <FiAlertTriangle className="w-12 h-12 text-red-500 mb-2" />
            <p id={`${id}-error`} className="text-sm font-medium text-red-600">{error}</p>
            <p className="text-xs text-gray-500 mt-2">
              Click to select a different file
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FiUpload className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-600">
              Drag and drop your image here, or click to select
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: {acceptedFileTypes.split(', ').join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
