import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import { getGalleryImages, deleteGalleryImage } from '../../services/galleryApi';
import LoadingSpinner from '../common/LoadingSpinner';
import GalleryManagerModal from '../gallery/GalleryManagerModal';
import CloudinaryImage from '../common/CloudinaryImage';

// Helper function to toggle modal class on body
const toggleBodyClass = (isOpen) => {
  if (isOpen) {
    document.body.classList.add('modal-open');
  } else {
    document.body.classList.remove('modal-open');
  }
};

const GalleryManager = () => {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track first load
  // Add a ref to cache images and pagination
  const imagesCache = useRef({});
  const paginationCache = useRef({});

  // Function to fetch images - now uses cache
  const fetchImages = useCallback(async (page) => {
    // Check cache first
    if (imagesCache.current[page]) {
      setImages(imagesCache.current[page]);
      setPagination(prev => paginationCache.current[page] || prev);
      setLoading(false);
      setIsInitialLoad(false);
      return;
    }
    try {
      if (isInitialLoad) setLoading(true); // Only show spinner on first load
      const response = await getGalleryImages(page);
      setImages(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
      // Cache the result
      imagesCache.current[page] = response.data;
      paginationCache.current[page] = response.pagination;
    } catch (err) {
      console.error('Error fetching gallery images:', err);
      toast.error('Failed to load gallery images');
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]); // No dependency on pagination

  // Fetch gallery images only once on initial mount and when pagination changes
  useEffect(() => {
    fetchImages(pagination.currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage]);

  // Toggle body class when modal is open/closed
  useEffect(() => {
    toggleBodyClass(showGalleryModal);

    // Cleanup function
    return () => {
      toggleBodyClass(false);
    };
  }, [showGalleryModal]);

  // Handle page change - memoized with useCallback
  const handlePageChange = useCallback((newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }));
    }
  }, [pagination.totalPages]);

  // Open add modal - memoized with useCallback
  const openAddModal = useCallback(() => {
    setSelectedImage(null);
    setShowGalleryModal(true);
    // Force body to have modal-open class
    toggleBodyClass(true);
  }, []);

  // Open edit modal - memoized with useCallback
  const openEditModal = useCallback((image) => {
    setSelectedImage(image);
    setShowGalleryModal(true);
    // Force body to have modal-open class
    toggleBodyClass(true);
  }, []);

  // Handle modal success - simplified without useCallback
  const handleModalSuccess = (message) => {
    toast.success(message);
    setShowGalleryModal(false);
    toggleBodyClass(false);
    imagesCache.current = {}; // Clear cache
    paginationCache.current = {};
    // Refresh the gallery data after a short delay
    setTimeout(() => {
      fetchImages(1); // Always refresh to first page after add/edit
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 100);
  };

  // Handle delete image - memoized with useCallback
  const handleDeleteImage = useCallback(async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await deleteGalleryImage(imageId);
      toast.success('Image deleted successfully');
      imagesCache.current = {}; // Clear cache
      paginationCache.current = {};
      // Refresh the gallery data
      fetchImages(pagination.currentPage);
    } catch (err) {
      console.error('Error deleting gallery image:', err);
      toast.error('Failed to delete image');
    }
  }, [fetchImages, pagination.currentPage]);

  // In the render, only show <LoadingSpinner /> if isInitialLoad and loading
  if (isInitialLoad && loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gallery Manager</h2>
          <button
            onClick={openAddModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FaPlus className="mr-2" />
            Add Image
          </button>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No gallery images found. Click "Add Image" to add some.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image) => (
              <div key={image._id} className="relative group overflow-hidden rounded-lg shadow-md">
                <div className="aspect-w-4 aspect-h-3">
                  <CloudinaryImage
                    src={image.imageUrl ? image.imageUrl.replace('/upload/', '/upload/w_400,q_auto:good/') : ''}
                    alt={image.title}
                    fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1QzE4My4yODQgMTI1IDE5MCAxMTguMjg0IDE5MCAxMTBDMTkwIDEwMS43MTYgMTgzLjI4NCA5NSAxNzUgOTVDMTY2LjcxNiA5NSAxNjAgMTAxLjcxNiAxNjAgMTEwQzE2MCAxMTguMjg0IDE2Ni43MTYgMTI1IDE3NSAxMjVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMzAgMjA1TDE3MCAyMDBMMjEwIDIwNUwyNzAgMTY1VjIzNUgxMzBWMjA1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K"
                    className="w-full h-full object-cover"
                    placeholderClassName="w-full h-full"
                    errorClassName="w-full h-full"
                    loadingComponent={<div className="flex items-center justify-center h-full"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                  <button
                    onClick={() => openEditModal(image)}
                    className="p-2 bg-white rounded-full text-blue-600 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteImage(image._id)}
                    className="p-2 bg-white rounded-full text-red-600 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
                <div className="p-4 bg-white">
                  <h3 className="font-semibold text-gray-800">{image.title}</h3>
                  {image.eventTag && (
                    <span className="inline-block px-2 py-1 mt-2 text-xs bg-blue-100 text-blue-800 rounded">
                      {image.eventTag}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 rounded-md mr-2 bg-gray-200 text-gray-700 disabled:opacity-50"
              >
                Previous
              </button>

              <div className="flex space-x-1">
                {[...Array(pagination.totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 rounded-md ${
                      pagination.currentPage === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 rounded-md ml-2 bg-gray-200 text-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Gallery Manager Modal */}
      <GalleryManagerModal
        isOpen={showGalleryModal}
        onClose={() => {
          setShowGalleryModal(false);
          toggleBodyClass(false);
        }}
        galleryImage={selectedImage}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

// Export component without memo to avoid potential issues
export default GalleryManager;

