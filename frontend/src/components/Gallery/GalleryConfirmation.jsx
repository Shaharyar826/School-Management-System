import React from 'react';
import ModalPortal from '../common/ModalPortal';
import CloudinaryImage from '../common/CloudinaryImage'; // Adjust the import based on your file structure

const GalleryConfirmation = ({ imageData, onConfirm, onCancel, loading, isEditMode }) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ModalPortal isOpen={true} onClose={onCancel}>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 border w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl rounded-md bg-white z-[100000]">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {isEditMode ? 'Confirm Gallery Image Update' : 'Confirm Gallery Image Upload'}
            </h3>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4 bg-gray-50 p-4 rounded-md">
            <div className="mb-4 flex justify-center">
              {imageData.imageUrl && (
                <CloudinaryImage
                  src={imageData.imageUrl.replace('/upload/', '/upload/w_400,q_auto:good/')} // Cloudinary thumbnail
                  alt={imageData.title || 'Gallery preview'}
                  className="h-48 object-contain rounded-md border border-gray-300"
                  loadingComponent={<div className="h-48 flex items-center justify-center"><span>Loading...</span></div>}
                  errorClassName="h-48 object-contain rounded-md border border-red-300"
                  loading="lazy"
                />
              )}
            </div>

            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700">Title:</span>
                <span className="ml-2 text-gray-900">{imageData.title}</span>
              </div>

              {imageData.eventTag && (
                <div>
                  <span className="font-medium text-gray-700">Event Tag:</span>
                  <span className="ml-2 text-gray-900">{imageData.eventTag}</span>
                </div>
              )}

              <div>
                <span className="font-medium text-gray-700">Date:</span>
                <span className="ml-2 text-gray-900">{formatDate(imageData.date)}</span>
              </div>

              {imageData.description && (
                <div>
                  <span className="font-medium text-gray-700">Description:</span>
                  <span className="ml-2 text-gray-900">{imageData.description}</span>
                </div>
              )}

              <div>
                <span className="font-medium text-gray-700">Display Order:</span>
                <span className="ml-2 text-gray-900">{imageData.displayOrder}</span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 ${imageData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {imageData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-5">
            <button
              type="button"
              className="px-4 py-2 bg-white text-gray-800 text-base font-medium rounded-md border border-gray-300 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
              onClick={onCancel}
              disabled={loading}
            >
              Back
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Processing...' : isEditMode ? 'Confirm & Update' : 'Confirm & Upload'}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default GalleryConfirmation;
