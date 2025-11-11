import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import axios from '../../config/axios';
import FormInput from '../common/FormInput';
import ImageUpload from '../common/ImageUpload';
// import GalleryConfirmation from './GalleryConfirmation'; // Removed to simplify
import AuthContext from '../../context/AuthContext';
import ModalPortal from '../common/ModalPortal';

const GalleryManagerModal = ({ isOpen, onClose, galleryImage, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const [showConfirmation, setShowConfirmation] = useState(false); // Removed
  const [isEditMode, setIsEditMode] = useState(false);

  const [imageData, setImageData] = useState({
    title: '',
    eventTag: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    displayOrder: 0,
    isActive: true,
    imageUrl: null,
    imageMetadata: null,
    file: null
  });
  const [totalImages, setTotalImages] = useState(0);

  // Function to fetch total image count
  const fetchTotalImageCount = async () => {
    try {
      // Get first page with a large limit to get total count
      const response = await axios.get('/api/gallery?page=1&limit=1000');
      if (response.data && response.data.data) {
        const totalCount = response.data.data.length;
        setTotalImages(totalCount);
        return totalCount;
      }
      return 0;
    } catch (err) {
      console.error('Error fetching total image count:', err);
      return 0;
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      if (!galleryImage) {
        // Fetch total image count for new images
        fetchTotalImageCount().then((count) => {
          setImageData({
            title: '',
            eventTag: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            displayOrder: count + 1, // Set next available display order
            isActive: true,
            imageUrl: null,
            imageMetadata: null,
            file: null
          });
        });
        setIsEditMode(false);
      } else {
        // Set form data for editing
        setImageData({
          title: galleryImage.title || '',
          eventTag: galleryImage.eventTag || '',
          date: galleryImage.date ? new Date(galleryImage.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          description: galleryImage.description || '',
          displayOrder: galleryImage.displayOrder || 0,
          isActive: galleryImage.isActive !== false,
          imageUrl: galleryImage.imageUrl || null,
          imageMetadata: galleryImage.imageMetadata || null,
          file: null
        });
        setIsEditMode(true);
      }
    }
  }, [isOpen, galleryImage]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setImageData({
      ...imageData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageSelect = (url, metadata, file) => {
    setImageData(prev => ({
      ...prev,
      file: file,
      imageUrl: url,
      imageMetadata: metadata
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate form
    if (!imageData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!isEditMode && !imageData.file && !imageData.imageUrl) {
      setError('Please select an image');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Prepare form data for submission
      const formData = new FormData();

      // Append file if it exists
      if (imageData.file) {
        formData.append('image', imageData.file);
      }

      // Append other data
      formData.append('title', imageData.title);
      if (imageData.eventTag) formData.append('eventTag', imageData.eventTag);
      if (imageData.date) formData.append('date', imageData.date);
      if (imageData.description) formData.append('description', imageData.description);
      formData.append('displayOrder', imageData.displayOrder);
      formData.append('isActive', imageData.isActive);

      let response;

      if (isEditMode) {
        // Update existing gallery image
        response = await axios.put(`/api/gallery/${galleryImage._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Create new gallery image
        response = await axios.post('/api/gallery', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      if (response.data.success) {
        // Call onSuccess to trigger data refresh
        onSuccess(isEditMode ? 'Gallery image updated successfully' : 'Gallery image added successfully');
        // Close the modal
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} gallery image`);
    } finally {
      setLoading(false);
    }
  };

  // Removed handleConfirmSubmit and handleCancelConfirmation functions

  // Handle closing the modal
  const handleClose = () => {
    // Call the onClose prop to update parent component state
    onClose();

    // Add a class to the body to prevent scrolling
    document.body.classList.remove('modal-open');
  };

  if (!isOpen) return null;

  return (
    <ModalPortal isOpen={isOpen} onClose={handleClose}>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 border w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl rounded-md bg-white z-[100000]">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {isEditMode ? 'Edit Gallery Image' : 'Add Gallery Image'}
            </h3>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mt-2">
              <FormInput
                id="title"
                name="title"
                type="text"
                label="Title"
                required
                value={imageData.title}
                onChange={handleChange}
              />
            </div>

            <div className="mt-2">
              <FormInput
                id="eventTag"
                name="eventTag"
                type="text"
                label="Event Tag"
                value={imageData.eventTag}
                onChange={handleChange}
              />
            </div>

            <div className="mt-2">
              <FormInput
                id="date"
                name="date"
                type="date"
                label="Date"
                value={imageData.date}
                onChange={handleChange}
              />
            </div>

            <div className="mt-2">
              <FormInput
                id="description"
                name="description"
                type="text"
                label="Description"
                value={imageData.description}
                onChange={handleChange}
              />
            </div>

            <div className="mt-2">
              <FormInput
                id="displayOrder"
                name="displayOrder"
                type="number"
                label={`Display Order ${!isEditMode && totalImages > 0 ? `(Next: ${totalImages + 1})` : ''}`}
                min="1"
                value={imageData.displayOrder}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first. {!isEditMode ? `Current total: ${totalImages} images` : ''}
              </p>
            </div>

            <div className="mt-4 flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={imageData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>

            <ImageUpload
              onImageSelect={handleImageSelect}
              initialImage={imageData.imageUrl}
              label="Gallery Image"
              required={!isEditMode}
              imageType="gallery"
              autoUpload={false}
            />

            <div className="items-center gap-2 mt-6 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-white text-gray-800 text-base font-medium rounded-md border border-gray-300 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
{loading ? 'Processing...' : isEditMode ? 'Update' : 'Add Image'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default GalleryManagerModal;
