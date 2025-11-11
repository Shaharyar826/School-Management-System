import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} from '../../services/landingPageApi';
import FormInput from '../common/FormInput';
import FormTextarea from '../common/FormTextarea';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaPlus, FaEdit, FaTrash, FaChevronUp, FaChevronDown, FaImage, FaQuoteLeft } from 'react-icons/fa';

const TestimonialsManager = () => {
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [currentTestimonial, setCurrentTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    quote: '',
    image: null,
    displayOrder: 0,
    isActive: true
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch testimonials
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const data = await getTestimonials();
      setTestimonials(data);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e = null) => {
    console.log('Testimonial submit handler called');
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling to parent form
    }

    try {
      // Create a copy of the form data to modify
      const dataToSubmit = { ...formData };

      // If we have an originalImage but no new image selected, use the original
      if (!dataToSubmit.image && dataToSubmit.originalImage) {
        console.log('Using original image:', dataToSubmit.originalImage);
        // Set the image field to the original image path
        dataToSubmit.image = dataToSubmit.originalImage;
      }

      console.log('Form data being submitted:', dataToSubmit);

      if (formMode === 'add') {
        await createTestimonial(dataToSubmit);
        toast.success('Testimonial added successfully');
      } else {
        await updateTestimonial(currentTestimonial._id, dataToSubmit);
        toast.success('Testimonial updated successfully');
      }

      // Reset form and hide it
      resetForm();
      setShowForm(false);

      // Fetch updated testimonials list
      fetchTestimonials();
    } catch (err) {
      console.error('Error saving testimonial:', err);
      toast.error('Failed to save testimonial');
    }
  };

  const handleEdit = (testimonial) => {
    setCurrentTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      quote: testimonial.quote,
      image: null, // Don't set the image here, it will be uploaded only if a new one is selected
      displayOrder: testimonial.displayOrder || 0,
      isActive: testimonial.isActive !== false,
      // Store the original image path for later use
      originalImage: testimonial.image
    });

    if (testimonial.image && testimonial.image !== 'default-avatar.jpg' && testimonial.image.startsWith('http')) {
      setImagePreview(testimonial.image);
    } else {
      setImagePreview(null);
    }

    setFormMode('edit');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await deleteTestimonial(id);
        toast.success('Testimonial deleted successfully');
        fetchTestimonials();
      } catch (err) {
        console.error('Error deleting testimonial:', err);
        toast.error('Failed to delete testimonial');
      }
    }
  };

  const resetForm = () => {
    console.log('Resetting testimonial form');
    setFormData({
      name: '',
      role: '',
      quote: '',
      image: null,
      displayOrder: 0,
      isActive: true,
      originalImage: null
    });
    setImagePreview(null);
    setCurrentTestimonial(null);
    // Note: We don't set showForm here anymore, it's handled by the button click
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;

    try {
      const testimonial = testimonials[index];
      const prevTestimonial = testimonials[index - 1];

      // Swap display orders
      await updateTestimonial(testimonial._id, {
        ...testimonial,
        displayOrder: prevTestimonial.displayOrder
      });

      await updateTestimonial(prevTestimonial._id, {
        ...prevTestimonial,
        displayOrder: testimonial.displayOrder
      });

      fetchTestimonials();
    } catch (err) {
      console.error('Error reordering testimonials:', err);
      toast.error('Failed to reorder testimonials');
    }
  };

  const handleMoveDown = async (index) => {
    if (index === testimonials.length - 1) return;

    try {
      const testimonial = testimonials[index];
      const nextTestimonial = testimonials[index + 1];

      // Swap display orders
      await updateTestimonial(testimonial._id, {
        ...testimonial,
        displayOrder: nextTestimonial.displayOrder
      });

      await updateTestimonial(nextTestimonial._id, {
        ...nextTestimonial,
        displayOrder: testimonial.displayOrder
      });

      fetchTestimonials();
    } catch (err) {
      console.error('Error reordering testimonials:', err);
      toast.error('Failed to reorder testimonials');
    }
  };

  if (loading && testimonials.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Testimonials</h3>
          <button
            type="button"
            onClick={(e) => {
              console.log('Add Testimonial button clicked');
              e.preventDefault();
              e.stopPropagation();

              // Toggle form visibility directly
              const newShowFormState = !showForm;
              console.log('Setting showForm to:', newShowFormState);

              if (newShowFormState) {
                // If opening the form, set mode to add
                setFormMode('add');
              } else {
                // If closing the form, reset it
                resetForm();
              }

              // Set the state after we've done our logic
              setShowForm(newShowFormState);
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors flex items-center"
          >
            <FaPlus className="mr-2" />
            {showForm && formMode === 'add' ? 'Cancel' : 'Add Testimonial'}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
            <h4 className="text-lg font-medium text-gray-700 mb-4">
              {formMode === 'add' ? 'Add New Testimonial' : 'Edit Testimonial'}
            </h4>
            <div className="form-container" onClick={(e) => e.stopPropagation()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="bg-white"
                />
                <FormInput
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="bg-white"
                  placeholder="e.g., Parent, Student, Alumni"
                />
                <div className="md:col-span-2">
                  <div className="relative">
                    <FormTextarea
                      label="Testimonial Quote"
                      name="quote"
                      value={formData.quote}
                      onChange={handleInputChange}
                      required
                      className="bg-white pl-8"
                      rows={4}
                      placeholder="What they said about the school"
                    />
                    <FaQuoteLeft className="absolute top-9 left-2 text-gray-300" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Person Image
                  </label>
                  <div className="mt-1 flex items-center">
                    {imagePreview && (
                      <div className="mr-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-full"
                        />
                      </div>
                    )}
                    <label className="cursor-pointer bg-white border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50 transition-colors flex items-center">
                      <FaImage className="mr-2 text-gray-400" />
                      <span className="text-gray-600">Choose Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {formMode === 'edit' && !formData.image
                      ? 'Leave empty to keep the current image'
                      : 'Recommended size: 200x200 pixels (square)'}
                  </p>
                </div>
                <FormInput
                  label="Display Order"
                  name="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  className="bg-white"
                  min="0"
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active (visible on the landing page)
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={(e) => {
                    console.log('Cancel button clicked');
                    e.preventDefault();
                    e.stopPropagation();
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit(e);
                  }}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                >
                  {formMode === 'add' ? 'Add Testimonial' : 'Update Testimonial'}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : testimonials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Person
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testimonials.map((testimonial, index) => (
                  <tr key={testimonial._id} className={testimonial.isActive ? '' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={testimonial.image && testimonial.image !== 'default-avatar.jpg' && testimonial.image.startsWith('http')
                              ? testimonial.image
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=0D8ABC&color=fff&size=128`}
                            alt={testimonial.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{testimonial.name}</div>
                          <div className="text-sm text-gray-500">{testimonial.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">{testimonial.quote}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        testimonial.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {testimonial.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="mr-2">{testimonial.displayOrder || 0}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className={`text-gray-400 hover:text-gray-600 ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <FaChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => handleMoveDown(index)}
                            disabled={index === testimonials.length - 1}
                            className={`text-gray-400 hover:text-gray-600 ${index === testimonials.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <FaChevronDown size={14} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(testimonial)}
                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No testimonials found. Add your first testimonial to display on the landing page.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialsManager;
