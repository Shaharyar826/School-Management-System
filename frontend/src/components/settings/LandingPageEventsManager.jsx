import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  getLandingPageEvents,
  createLandingPageEvent,
  updateLandingPageEvent,
  deleteLandingPageEvent
} from '../../services/landingPageApi';
import FormInput from '../common/FormInput';
import FormTextarea from '../common/FormTextarea';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaPlus, FaEdit, FaTrash, FaChevronUp, FaChevronDown, FaImage, FaCalendarAlt } from 'react-icons/fa';
import { format } from 'date-fns';

const LandingPageEventsManager = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    displayOrder: 0,
    isActive: true,
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Fetch landing page events
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getLandingPageEvents();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching landing page events:', err);
      toast.error('Failed to load landing page events');
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
      // Validate image type and size (max 2MB)
      if (!file.type.startsWith('image/')) {
        setFormErrors(errors => ({ ...errors, image: 'Only image files are allowed.' }));
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setFormErrors(errors => ({ ...errors, image: 'Image size must be less than 2MB.' }));
        return;
      }
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
      setFormErrors(errors => ({ ...errors, image: undefined }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required.';
    if (!formData.date) errors.date = 'Date is required.';
    if (!formData.description.trim()) errors.description = 'Description is required.';
    if (formData.image && formData.image.size > 2 * 1024 * 1024) errors.image = 'Image size must be less than 2MB.';
    if (formData.image && !formData.image.type.startsWith('image/')) errors.image = 'Only image files are allowed.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e = null) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!validateForm()) return;
    try {
      if (formMode === 'add') {
        await createLandingPageEvent(formData);
        toast.success('Event added successfully');
      } else {
        await updateLandingPageEvent(currentEvent._id, formData);
        toast.success('Event updated successfully');
      }
      resetForm();
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      toast.error('Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setCurrentEvent(event);
    setFormData({
      title: event.title,
      date: format(new Date(event.date), 'yyyy-MM-dd'),
      description: event.description,
      displayOrder: event.displayOrder || 0,
      isActive: event.isActive !== false,
      image: event.image ? new File([event.image], event.title) : null
    });

    setFormMode('edit');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteLandingPageEvent(id);
        toast.success('Event deleted successfully');
        fetchEvents();
      } catch (err) {
        console.error('Error deleting event:', err);
        toast.error('Failed to delete event');
      }
    }
  };

  const resetForm = () => {
    console.log('Resetting event form');
    setFormData({
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      displayOrder: 0,
      isActive: true,
      image: null
    });
    setCurrentEvent(null);
    setImagePreview(null);
    setFormErrors({});
    // Note: We don't set showForm here anymore, it's handled by the button click
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;

    try {
      const event = events[index];
      const prevEvent = events[index - 1];

      // Swap display orders
      await updateLandingPageEvent(event._id, {
        ...event,
        displayOrder: prevEvent.displayOrder
      });

      await updateLandingPageEvent(prevEvent._id, {
        ...prevEvent,
        displayOrder: event.displayOrder
      });

      fetchEvents();
    } catch (err) {
      console.error('Error reordering events:', err);
      toast.error('Failed to reorder events');
    }
  };

  const handleMoveDown = async (index) => {
    if (index === events.length - 1) return;

    try {
      const event = events[index];
      const nextEvent = events[index + 1];

      // Swap display orders
      await updateLandingPageEvent(event._id, {
        ...event,
        displayOrder: nextEvent.displayOrder
      });

      await updateLandingPageEvent(nextEvent._id, {
        ...nextEvent,
        displayOrder: event.displayOrder
      });

      fetchEvents();
    } catch (err) {
      console.error('Error reordering events:', err);
      toast.error('Failed to reorder events');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  if (loading && events.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Landing Page Events</h3>
          <button
            type="button"
            onClick={(e) => {
              console.log('Add Event button clicked');
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
            {showForm && formMode === 'add' ? 'Cancel' : 'Add Event'}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
            <h4 className="text-lg font-medium text-gray-700 mb-4">
              {formMode === 'add' ? 'Add New Event' : 'Edit Event'}
            </h4>
            <div className="form-container" onClick={(e) => e.stopPropagation()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="bg-white"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendarAlt className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="bg-white border border-gray-300 rounded-md pl-10 py-2 pr-3 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <FormTextarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="bg-white"
                    rows={4}
                    placeholder="Event description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Image</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="bg-white border border-gray-300 rounded-md py-2 pr-3 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
                  {formErrors.image && <div className="text-red-500 text-xs mt-1">{formErrors.image}</div>}
                  {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-24 rounded shadow" />}
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
                  {formMode === 'add' ? 'Add Event' : 'Update Event'}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                {events.map((event, index) => (
                  <tr key={event._id} className={event.isActive ? '' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {event.image && event.image.startsWith('http') && <img src={event.image} alt={event.title} className="h-10 w-10 object-cover rounded mr-2" />}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{event.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(event.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        event.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {event.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="mr-2">{event.displayOrder || 0}</span>
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
                            disabled={index === events.length - 1}
                            className={`text-gray-400 hover:text-gray-600 ${index === events.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <FaChevronDown size={14} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
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
            <p>No events found. Add your first event to display on the landing page.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPageEventsManager;
