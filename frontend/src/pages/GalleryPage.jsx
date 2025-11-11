import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { getGalleryImages } from '../services/publicApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CloudinaryImage from '../components/common/CloudinaryImage';

const GalleryPage = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // State for gallery data and UI
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch gallery images
  useEffect(() => {
    fetchImages(currentPage);
  }, [currentPage]);

  const fetchImages = async (page) => {
    try {
      setLoading(true);
      const response = await getGalleryImages(page);
      setImages(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching gallery images:', err);
      toast.error('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from images
  const categories = ['All', ...new Set(images.map(item => item.eventTag).filter(Boolean))];

  // Filter gallery items based on selected category
  const filteredGallery = selectedCategory === 'All'
    ? images
    : images.filter(item => item.eventTag === selectedCategory);

  // Open image modal
  const openModal = (image) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  // Close image modal
  const closeModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="gallery-page">
      <Navbar />

      {/* Page Header */}
      <div className="relative pt-24 pb-12 bg-school-navy">
        <div className="absolute inset-0 bg-gradient-to-r from-school-navy/90 to-school-navy-dark/90 z-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">Gallery</h1>
            <div className="w-20 h-1 bg-school-yellow mx-auto mb-6"></div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Explore our school through photos and videos showcasing our campus, facilities, and events.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Photo Gallery Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-school-navy-dark mb-8 text-center">Photo Gallery</h2>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center mb-8 gap-2">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    selectedCategory === category
                      ? 'bg-school-yellow text-school-navy-dark'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : filteredGallery.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No images found in this category.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredGallery.map((item) => (
                    <motion.div
                      key={item._id}
                      className="relative overflow-hidden rounded-lg shadow-md cursor-pointer group"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => openModal(item)}
                    >
                      <div className="relative w-full h-64 overflow-hidden">
                        <CloudinaryImage
                          src={item.imageUrl}
                          alt={item.title}
                          fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1QzE4My4yODQgMTI1IDE5MCAxMTguMjg0IDE5MCAxMTBDMTkwIDEwMS43MTYgMTgzLjI4NCA5NSAxNzUgOTVDMTY2LjcxNiA5NSAxNjAgMTAxLjcxNiAxNjAgMTEwQzE2MCAxMTguMjg0IDE2Ni43MTYgMTI1IDE3NSAxMjVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMzAgMjA1TDE3MCAyMDBMMjEwIDIwNUwyNzAgMTY1VjIzNUgxMzBWMjA1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          placeholderClassName="absolute inset-0 w-full h-full"
                          errorClassName="absolute inset-0 w-full h-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end z-10 pointer-events-none">
                          <div className="p-4 w-full">
                            <h3 className="text-white font-bold">{item.title}</h3>
                            {item.eventTag && (
                              <p className="text-gray-300 text-sm">{item.eventTag}</p>
                            )}
                            {item.description && (
                              <p className="text-gray-300 text-xs mt-1 line-clamp-2">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && (
                  <div className="flex justify-center mt-8 space-x-2">
                    {pagination.prev && (
                      <button
                        onClick={() => handlePageChange(pagination.prev.page)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Previous
                      </button>
                    )}
                    {pagination.next && (
                      <button
                        onClick={() => handlePageChange(pagination.next.page)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Next
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <CloudinaryImage
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                fallbackSrc="https://via.placeholder.com/800x600?text=Image"
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                placeholderClassName="w-full h-auto max-h-[70vh] rounded-lg"
                errorClassName="w-full h-auto max-h-[70vh] rounded-lg"
              />
              <button
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full p-2 transition-colors duration-200"
                onClick={closeModal}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="mt-4 text-white">
              <h3 className="text-xl font-bold">{selectedImage.title}</h3>
              {selectedImage.eventTag && (
                <p className="text-gray-300">{selectedImage.eventTag}</p>
              )}
              {selectedImage.description && (
                <p className="mt-2 text-gray-300">{selectedImage.description}</p>
              )}
              {selectedImage.date && (
                <p className="mt-2 text-sm text-gray-400">
                  {new Date(selectedImage.date).toLocaleDateString()}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* CTA Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-school-navy-dark mb-4">Visit Our School</h2>
            <p className="text-gray-600 mb-8">
              Want to see our campus and facilities in person? Schedule a visit to our school and experience the learning environment firsthand.
            </p>
            <motion.a
              href="/contact"
              className="inline-block px-6 py-3 bg-school-yellow text-school-navy-dark font-medium rounded-md hover:bg-school-yellow-dark transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Schedule a Visit
            </motion.a>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GalleryPage;
