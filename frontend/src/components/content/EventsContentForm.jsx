import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
// You will need to implement these API functions in a new file, e.g., services/cmsEventsApi.js
// import { getCmsEvents, createCmsEvent, updateCmsEvent, deleteCmsEvent } from '../../services/cmsEventsApi';

const mockApi = {
  getCmsEvents: async () => JSON.parse(localStorage.getItem('cmsEvents') || '[]'),
  createCmsEvent: async (data) => {
    const events = JSON.parse(localStorage.getItem('cmsEvents') || '[]');
    const newEvent = { ...data, _id: Date.now().toString() };
    events.push(newEvent);
    localStorage.setItem('cmsEvents', JSON.stringify(events));
    return newEvent;
  },
  updateCmsEvent: async (id, data) => {
    let events = JSON.parse(localStorage.getItem('cmsEvents') || '[]');
    events = events.map(e => e._id === id ? { ...e, ...data } : e);
    localStorage.setItem('cmsEvents', JSON.stringify(events));
    return events.find(e => e._id === id);
  },
  deleteCmsEvent: async (id) => {
    let events = JSON.parse(localStorage.getItem('cmsEvents') || '[]');
    events = events.filter(e => e._id !== id);
    localStorage.setItem('cmsEvents', JSON.stringify(events));
    return true;
  }
};

const EventsContentForm = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    // Replace mockApi with real API
    const data = await mockApi.getCmsEvents();
    setEvents(data);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (formMode === 'add') {
        await mockApi.createCmsEvent(formData);
        toast.success('Event added successfully');
      } else {
        await mockApi.updateCmsEvent(currentEvent._id, formData);
        toast.success('Event updated successfully');
      }
      resetForm();
      setShowForm(false);
      fetchEvents();
    } catch {
      toast.error('Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setCurrentEvent(event);
    setFormData({
      title: event.title,
      date: format(new Date(event.date), 'yyyy-MM-dd'),
      description: event.description,
      image: null
    });
    setImagePreview(event.image || null);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await mockApi.deleteCmsEvent(id);
      toast.success('Event deleted');
      fetchEvents();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      image: null
    });
    setCurrentEvent(null);
    setImagePreview(null);
    setFormErrors({});
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">CMS Events (Not shown on landing page)</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => { setShowForm(!showForm); setFormMode('add'); resetForm(); }}
        >
          {showForm && formMode === 'add' ? 'Cancel' : 'Add Event'}
        </button>
      </div>
      {showForm && (
        <form className="bg-gray-50 p-4 rounded mb-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full border rounded p-2" />
              {formErrors.title && <div className="text-red-500 text-xs mt-1">{formErrors.title}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium">Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full border rounded p-2" />
              {formErrors.date && <div className="text-red-500 text-xs mt-1">{formErrors.date}</div>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full border rounded p-2" rows={3} />
              {formErrors.description && <div className="text-red-500 text-xs mt-1">{formErrors.description}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium">Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {formErrors.image && <div className="text-red-500 text-xs mt-1">{formErrors.image}</div>}
              {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-20 rounded shadow" />}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              {formMode === 'add' ? 'Add Event' : 'Update Event'}
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <div className="py-8 text-center">Loading...</div>
      ) : events.length === 0 ? (
        <div className="py-8 text-center text-gray-500">No CMS events found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map(event => (
                <tr key={event._id}>
                  <td className="px-4 py-2">{event.title}</td>
                  <td className="px-4 py-2">{event.date}</td>
                  <td className="px-4 py-2">{event.description}</td>
                  <td className="px-4 py-2">{event.image && <img src={typeof event.image === 'string' ? event.image : ''} alt="Event" className="h-10 w-10 object-cover rounded" />}</td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-blue-600 hover:underline mr-2" onClick={() => handleEdit(event)}>Edit</button>
                    <button className="text-red-600 hover:underline" onClick={() => handleDelete(event._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EventsContentForm; 